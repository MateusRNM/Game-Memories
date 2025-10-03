import type { SupabaseClient } from "@supabase/supabase-js";

export async function searchGames(query: string) {
    const response = await fetch(`${import.meta.env.VITE_SEARCH_GAMES_FUNCTION_URL}?q=${encodeURIComponent(query)}`);
    if(!response.ok){
        throw new Error('Falha ao buscar os dados!');
    }
    const data = await response.json();
    return data;
}

export async function searchFutureGames() {
    const response = await fetch(`${import.meta.env.VITE_SEARCH_FUTURE_GAMES_FUNCTION_URL}`);
    if(!response.ok){
        throw new Error('Falha ao buscar os dados!');
    }
    const data = await response.json();
    return data;
}

export async function getGameDetailsById(gameId: number, supabase: SupabaseClient) {
    let { data: cachedGame, error: cacheError } = await supabase.from('games_cache').select('*').eq('id', gameId).limit(1);
    if (cacheError && cacheError.code !== 'PGRST116') { 
        throw new Error(cacheError.message);
    }

    if(cachedGame && cachedGame.length > 0){
        cachedGame = cachedGame[0];
        return {
            id: cachedGame.id,
            name: cachedGame.name,
            release_year: cachedGame.release_year,
            cover_url: cachedGame.cover_url,
            platforms: cachedGame.platforms,
            summary: cachedGame.summary,
            developer: cachedGame.developer,
            publisher: cachedGame.publisher
        };
    }

    const response = await fetch(`${import.meta.env.VITE_SEARCH_GAMES_FUNCTION_URL}?gameId=${encodeURIComponent(gameId)}`);
    if(!response.ok){
        throw new Error('Falha ao buscar os dados!');
    }
    const apiData = await response.json();
    await supabase.from('games_cache').upsert({
            id: apiData.id,
            name: apiData.name,
            release_year: apiData.release_year,
            cover_url: apiData.cover_url,
            platforms: apiData.platforms,
            summary: apiData.summary,
            developer: apiData.developer,
            publisher: apiData.publisher,
            last_fetched_at: new Date().toISOString()
        });
    return apiData;
}