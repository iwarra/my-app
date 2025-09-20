create table if not exists customers (
  id UUID primary key default gen_random_uuid(),
  customer_id UUID NULL references users(id) on delete set null
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  org_number TEXT NOT NULL
);

