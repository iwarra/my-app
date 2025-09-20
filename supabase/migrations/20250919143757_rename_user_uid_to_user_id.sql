-- Rename column user_uid to user_id
ALTER TABLE public.users
RENAME COLUMN user_uid TO user_id;

-- Update foreign key constraint name (optional)
ALTER TABLE public.users
DROP CONSTRAINT IF EXISTS users_user_uid_fkey;

ALTER TABLE public.users
ADD CONSTRAINT users_user_id_fkey
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
