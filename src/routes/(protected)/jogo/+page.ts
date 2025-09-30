import type { PageLoad } from './$types';
import { getGameDetailsById } from '$lib/database/igdbService';
import { getCachedUserLibrary } from '$lib/database/cacheService';

export const load: PageLoad = async ({ parent, url }) => {
    const { session, supabase } = await parent();
    const gameId = parseInt(url.searchParams.get('gameId'));
    try {
        const game = await getGameDetailsById(gameId, supabase);
        let libraryEntry = null;
        if (session?.user) {
            const { data } = await supabase
                .from('user_library')
                .select('*')
                .eq('user_id', session.user.id)
                .eq('game_id', gameId)
                .limit(1);
            libraryEntry = data[0] || null;
        }
        return {
            game,
            libraryEntry,
            offline: false
        };

    } catch (error: any) {
        const cachedLibrary = await getCachedUserLibrary();
        
        const cachedEntry = cachedLibrary.find(entry => entry.game_id === gameId) || null;
        
        const cachedGame = cachedEntry ? {
            id: cachedEntry.games_cache.id,
            name: cachedEntry.games_cache.name,
            release_year: cachedEntry.games_cache.release_year,
            cover_url: cachedEntry.games_cache.cover_url,
            platforms: cachedEntry.games_cache.platforms,
            summary: cachedEntry.games_cache.summary
        } : null;

        return {
            game: cachedGame,
            libraryEntry: cachedEntry,
            offline: true
        };
    }
};