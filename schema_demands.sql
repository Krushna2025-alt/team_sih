-- 1. Create demands table in public schema
CREATE TABLE IF NOT EXISTS public.demands (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    buyer_id uuid REFERENCES auth.users(id) NOT NULL,
    buyer_name text NOT NULL,
    product text NOT NULL,
    quantity_kg numeric NOT NULL,
    min_price_per_kg numeric DEFAULT 0,
    max_price_per_kg numeric NOT NULL,
    required_date date NOT NULL,
    address text NOT NULL,
    notes text,
    status text DEFAULT 'open' NOT NULL,
    distance_km numeric DEFAULT 0,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Enable Row Level Security (RLS)
ALTER TABLE public.demands ENABLE ROW LEVEL SECURITY;

-- 3. RLS Policies
DROP POLICY IF EXISTS "Buyers can insert their own demands" ON public.demands;
CREATE POLICY "Buyers can insert their own demands" 
ON public.demands FOR INSERT TO authenticated 
WITH CHECK (auth.uid() = buyer_id);

DROP POLICY IF EXISTS "Buyers can update their own demands" ON public.demands;
CREATE POLICY "Buyers can update their own demands" 
ON public.demands FOR UPDATE TO authenticated 
USING (auth.uid() = buyer_id) WITH CHECK (auth.uid() = buyer_id);

DROP POLICY IF EXISTS "Buyers can delete their own demands" ON public.demands;
CREATE POLICY "Buyers can delete their own demands" 
ON public.demands FOR DELETE TO authenticated 
USING (auth.uid() = buyer_id);

DROP POLICY IF EXISTS "Anyone can view open demands" ON public.demands;
CREATE POLICY "Anyone can view open demands" 
ON public.demands FOR SELECT TO authenticated 
USING (true);

-- 4. Enable Realtime
alter publication supabase_realtime add table public.demands;
