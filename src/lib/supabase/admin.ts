import 'server-only';
import { createClient } from '@supabase/supabase-js';
import { publicEnv } from '@/lib/env/public';
import { requireServerEnv } from '@/lib/env/server';

export function createAdminSupabaseClient() {
    return createClient(
        publicEnv.supabaseUrl,
        requireServerEnv('SUPABASE_SERVICE_ROLE_KEY'),
        {
            auth: { autoRefreshToken: false, persistSession: false },
        },
    );
}
