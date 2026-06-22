import { createBrowserClient } from '@supabase/ssr';
import { publicEnv } from '@/lib/env/public';

// Browser code only receives the public anon key. Database access is protected
// by RLS and the authenticated Supabase session stored in cookies.
export const supabase = createBrowserClient(
    publicEnv.supabaseUrl,
    publicEnv.supabaseAnonKey,
);
