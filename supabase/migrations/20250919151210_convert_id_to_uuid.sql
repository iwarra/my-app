-- 1. Add new UUID column
ALTER TABLE public.users
ADD COLUMN new_id UUID DEFAULT gen_random_uuid();

-- 2. Make the new UUID column NOT NULL
ALTER TABLE public.users
ALTER COLUMN new_id SET NOT NULL;

-- 3. Drop the existing primary key constraint
ALTER TABLE public.users
DROP CONSTRAINT users_pkey;

-- 4. Set the new UUID column as primary key
ALTER TABLE public.users
ADD CONSTRAINT users_pkey PRIMARY KEY (new_id);

-- 5. Optionally, drop the old bigint column
ALTER TABLE public.users
DROP COLUMN id;

-- 6. Rename new_id to id
ALTER TABLE public.users
RENAME COLUMN new_id TO id;