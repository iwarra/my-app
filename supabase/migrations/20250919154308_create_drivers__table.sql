create table if not exists drivers (
  id UUID primary key default gen_random_uuid(),
  customer_id UUID NULL references users(id) on delete set null
  address TEXT NOT NULL,
  personal_number TEXT NOT NULL
);