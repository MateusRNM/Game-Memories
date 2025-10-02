import type { SupabaseClient } from '@supabase/supabase-js';

interface LibraryUpsertData {
    user_id: string;
    game_id: number;
    status?: number;
    platform_playing?: string | null;
    started_at?: string | null;
    finished_at?: string | null;
    playtime_hours?: number | null;
    personal_notes?: string | null;
    rating?: number | null;
    list_position: number;
}

export async function upsertGameInLibrary(supabase: SupabaseClient, data: LibraryUpsertData) {
    const { data: savedEntry, error } = await supabase
        .from('user_library')
        .upsert(data, { onConflict: 'user_id, game_id' })
        .select()
        .single();

    if (error) {
        throw new Error(error.message);
    }
    return savedEntry;
}

export async function removeGameFromLibrary(supabase: SupabaseClient, libraryEntryId: string): Promise<void> {
    const { error } = await supabase
        .from('user_library')
        .delete()
        .match({ id: libraryEntryId });
    
    if (error) {
        throw new Error(error.message);
    }
}

