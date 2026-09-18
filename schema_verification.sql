-- SQL script to create tables for AI Quality Verification

-- Table for Quality Verifications
CREATE TABLE IF NOT EXISTS public.quality_verifications (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    farmer_id UUID NOT NULL,
    product_id UUID, -- Optional at creation, linked once listing is created/updated
    product_name TEXT NOT NULL,
    variety TEXT,
    quantity_kg NUMERIC NOT NULL,
    location TEXT NOT NULL,
    status TEXT DEFAULT 'pending', -- pending, completed, failed
    visual_grade TEXT, -- A, B, C
    visual_score INTEGER, -- 0-100
    issues JSONB, -- Array of detected issues
    confidence_score INTEGER,
    level INTEGER DEFAULT 1, -- 1: Visual, 2: Measurement, 3: Lab
    trust_score INTEGER DEFAULT 0, -- 0-100 overall trust score
    expected_price NUMERIC,
    suggested_price_min NUMERIC,
    suggested_price_max NUMERIC,
    market_price_min NUMERIC,
    market_price_max NUMERIC,
    market_price_source TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table for Verification Evidence
CREATE TABLE IF NOT EXISTS public.verification_evidence (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    verification_id UUID NOT NULL REFERENCES public.quality_verifications(id) ON DELETE CASCADE,
    type TEXT NOT NULL, -- 'image', 'video', 'measurement', 'lab_report'
    url TEXT,
    value NUMERIC, -- e.g., moisture percentage
    unit TEXT, -- e.g., '%'
    metadata JSONB, -- extra info
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Set up Row Level Security (RLS) policies (assuming standard anon/authenticated roles)
ALTER TABLE public.quality_verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.verification_evidence ENABLE ROW LEVEL SECURITY;

-- Allow all authenticated users to read verifications
CREATE POLICY "Allow authenticated read verifications" ON public.quality_verifications
    FOR SELECT TO authenticated USING (true);

-- Allow all to read verifications (since buyers might just be visitors in some implementations)
CREATE POLICY "Allow public read verifications" ON public.quality_verifications
    FOR SELECT USING (true);

CREATE POLICY "Allow farmers to insert verifications" ON public.quality_verifications
    FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Allow farmers to update their own verifications" ON public.quality_verifications
    FOR UPDATE TO authenticated USING (farmer_id::text = auth.uid()::text);

-- Evidence RLS
CREATE POLICY "Allow public read evidence" ON public.verification_evidence
    FOR SELECT USING (true);

CREATE POLICY "Allow authenticated insert evidence" ON public.verification_evidence
    FOR INSERT TO authenticated WITH CHECK (true);

-- Adding verification_id to existing tables if they exist
DO $$
BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'listings') THEN
        ALTER TABLE public.listings ADD COLUMN IF NOT EXISTS verification_id UUID REFERENCES public.quality_verifications(id) ON DELETE SET NULL;
    END IF;
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'farmer_listings') THEN
        ALTER TABLE public.farmer_listings ADD COLUMN IF NOT EXISTS verification_id UUID REFERENCES public.quality_verifications(id) ON DELETE SET NULL;
    END IF;
END $$;
