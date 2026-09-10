import { createClient } from '@supabase/supabase-js';
// Demo mode keeps mock data fully isolated from real API services.
export const isDemo = import.meta.env.VITE_DEMO_MODE === 'true';
export const supabase =
    import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY
        ? createClient(import.meta.env.VITE_SUPABASE_URL,
            import.meta.env.VITE_SUPABASE_ANON_KEY)
        : null;
