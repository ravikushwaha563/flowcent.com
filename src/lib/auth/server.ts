import 'server-only';
import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export async function getAuthenticatedUser() {
    const supabase = await createServerSupabaseClient();
    const { data: { user }, error } = await supabase.auth.getUser();
    return { supabase, user, error };
}

export async function requireUser() {
    const auth = await getAuthenticatedUser();
    if (!auth.user) {
        return {
            ...auth,
            response: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }),
        };
    }
    return { ...auth, response: null };
}
