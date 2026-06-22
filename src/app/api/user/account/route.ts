import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireUser } from '@/lib/auth/server';
import { createAdminSupabaseClient } from '@/lib/supabase/admin';
import { decryptSecret } from '@/lib/crypto/secrets';
import { getOAuthClient } from '@/lib/gmail';

const deleteAccountSchema = z.object({ confirmation: z.string().trim().email() });

export async function DELETE(req: NextRequest) {
    const { supabase, user, response } = await requireUser();
    if (!user) return response!;

    const parsed = deleteAccountSchema.safeParse(await req.json());
    if (!parsed.success || parsed.data.confirmation.toLowerCase() !== user.email?.toLowerCase()) {
        return NextResponse.json({ error: 'Email confirmation does not match' }, { status: 400 });
    }

    const { data: profile } = await supabase.from('users')
        .select('gmail_access_token')
        .eq('id', user.id)
        .single();
    if (profile?.gmail_access_token) {
        try {
            await getOAuthClient().revokeToken(decryptSecret(profile.gmail_access_token));
        } catch (error) {
            console.error('Failed to revoke Gmail token during account deletion:', error);
        }
    }

    const admin = createAdminSupabaseClient();
    const { error } = await admin.auth.admin.deleteUser(user.id);
    if (error) return NextResponse.json({ error: 'Failed to delete account' }, { status: 500 });
    await supabase.auth.signOut();

    return NextResponse.json({ success: true });
}
