create table if not exists users (
  id bigint primary key generated always as identity,
  user_uid UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('customer', 'driver', 'admin')),
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  display_language TEXT NOT NULL CHECK (display_language IN ('Swedish', 'English', 'Arabic'))
);