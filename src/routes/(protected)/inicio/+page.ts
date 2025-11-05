import { searchFutureGames } from "$lib/database/igdbService";
import type { PageLoad } from "./$types";

export const load: PageLoad = async ({ parent }) => {
    const { supabase } = await parent();
    const promise = searchFutureGames(supabase);
    return {
        games: promise
    }
};