create table if not exists customers_locations (
  id UUID primary key default gen_random_uuid(),
  customer_id UUID references customer(id) on delete set null,
  location_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  address TEXT NOT NULL,
  email TEXT NOT NULL,
  contact_person TEXT NOT NULL,
  pickup boolean NOT NULL DEFAULT false,
  drop_off boolean NOT NULL DEFAULT false
);