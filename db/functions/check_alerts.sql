create or replace function check_alerts()
returns trigger as $$
declare
  setting record;
  current_value numeric;
begin
  -- Loop through all active alerts
  for setting in
    select *
    from alert_settings
    where active
  loop
    -- Determine which column to check based on alert_type
    if setting.alert_type in ('temperature_high', 'temperature_low', 'temperature_out_of_range') then
      current_value := NEW.temperature_c;
    else
      current_value := null;
    end if;

    --debugging
    RAISE NOTICE 'Checking alert %, value: %', setting.alert_type, current_value;

    -- Skip if no value to compare
    if current_value is null then
      continue;
    end if;

    -- Check thresholds
    if (setting.threshold_max is not null and current_value > setting.threshold_max) or
       (setting.threshold_min is not null and current_value < setting.threshold_min) then

       -- Only insert if there is no unsent alert of this type for this measurement
       if not exists (
         select 1
         from alert_logs
         where readings_id = NEW.id
           and alert_type = setting.alert_type
           and sent = false
       ) then
         insert into alert_logs(
           alert_type,
           readings_id,
           message,
           sent_to,
           sent,
           device_id
         ) values (
           setting.alert_type,
           NEW.id,
           coalesce(setting.alert_text, 'Alert triggered for ' || setting.alert_type),
           setting.email,
           false,
           NEW.device_id
         );
       end if;
    end if;

  end loop;

  return NEW;
end;
$$ language plpgsql;

-- Trigger on weather_readings insert
create trigger alerts_trigger
after insert on weather_readings
for each row
execute function check_alerts(); 