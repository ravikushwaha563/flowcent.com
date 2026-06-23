import type { SupabaseClient } from '@supabase/supabase-js';

export async function consumeAiAnalysis(supabase: SupabaseClient): Promise<boolean> {
    const { data, error } = await supabase.rpc('consume_ai_analysis');
    if (error) throw error;
    return data === true;
}
