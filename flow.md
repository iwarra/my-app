# Notes about the Supabase - repo connection

## Setup

- Cron job triggers data fetching every minute ('Name: Get data every minute') and inserts into the weather_readings table
- A webhook is activated after insert is made, calling the 'check-data' edge function
  - The function checks for alerts, and adds to alert_logs table if no active alert for this type/vehicle exists
- A webhook is activated after insert is made, calling the 'send-alert-email' edge function

## In use

- **Cron jobs:** `Get data every minute`
- **Edge functions:** `fetch-weather`, `check-data`, `send-alert-email`
- **Webhooks:**
  `check_data_for_alerts` activates `AFTER INSERT` on `weather_readings`
  `send_alert_email` activates `AFTER INSERT` on `alert_logs`
