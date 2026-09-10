-- 1. Add location fields to public.profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS village text,
ADD COLUMN IF NOT EXISTS district text,
ADD COLUMN IF NOT EXISTS state text,
ADD COLUMN IF NOT EXISTS pincode text,
ADD COLUMN IF NOT EXISTS latitude numeric,
ADD COLUMN IF NOT EXISTS longitude numeric;

-- 2. Add location fields to public.farmer_listings
ALTER TABLE public.farmer_listings 
ADD COLUMN IF NOT EXISTS location text,
ADD COLUMN IF NOT EXISTS latitude numeric,
ADD COLUMN IF NOT EXISTS longitude numeric;

-- 3. (Optional) Refresh schema cache in Supabase by running:
NOTIFY pgrst, 'reload schema';
