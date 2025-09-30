import type { GameCatalog } from '$lib/interfaces';
import type { SupabaseClient } from '@supabase/supabase-js';

interface LibraryUpsertData {
    user_id: string;
    game_id: number;
    status?: number;
    platform_playing?: string | null;
    started_at?: string | null;
    finished_at?: string | null;
}

export async function upsertGameInLibrary(supabase: SupabaseClient, data: LibraryUpsertData): Promise<GameCatalog> {
    const { data: savedEntry, error } = await supabase
        .from('user_library')
        .upsert(data, { onConflict: 'user_id, game_id' })
        .select()
        .single();

    if (error) {
        console.error("Erro no upsert:", error);
        throw new Error(error.message);
    }
    return savedEntry as GameCatalog;
}

export async function removeGameFromLibrary(supabase: SupabaseClient, libraryEntryId: string): Promise<void> {
    const { error } = await supabase
        .from('user_library')
        .delete()
        .match({ id: libraryEntryId });
    
    if (error) {
        console.error("Erro ao remover:", error);
        throw new Error(error.message);
    }
}

