-- Function to send email via pg_net
create or replace function send_alert_email()
returns trigger as $$
declare
  api_key text;
  response jsonb;
  cooldown_minutes int;
begin
 -- Get cooldown_minutes from settings
  select cooldown_minutes
  into cooldown_minutes
  from alert_settings
  where alert_type = NEW.alert_type
    and active = true
  limit 1;

if exists (
    select 1
    from alert_logs
    -- the id should check against vehicle in the future
    where device_id = NEW.device_id
      and id <> NEW.id --exclude the row being added
      and alert_type = NEW.alert_type
      and sent = true
      and sent_at > now() - (cooldown_minutes * interval '1 minute') -- Not working?
  ) then
    return NEW; -- do nothing, leave sent=false
  end if;

 -- Load API key from Vault 
  SELECT decrypted_secret
  into api_key
  FROM vault.decrypted_secrets
  WHERE name = 'resend_key'
  LIMIT 1;

  begin
  -- Make HTTP POST request to Resend
  select net.http_post(
    url := 'https://api.resend.com/emails',
    headers := jsonb_build_object(
      'Authorization', 'Bearer ' || api_key,
      'Content-Type', 'application/json'
    ),
    body := jsonb_build_object(
      'from', 'mervin@kwik.se',
      'to', NEW.sent_to,
      'subject', 'High Temperature Alert',
      'html', '<p>' || NEW.message || '</p>'
    )
  ) into response;

  -- Mark as sent
  update alert_logs
  set sent = true,
      sent_at = now()
  where id = NEW.id;

  end;

  return NEW;
end;
$$ language plpgsql;

-- Trigger: fire after insert into alert_logs
create trigger trigger_send_alert_email
after insert on alert_logs
for each row
execute function send_alert_email();

