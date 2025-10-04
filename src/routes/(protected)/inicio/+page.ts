import { searchFutureGames } from "$lib/database/igdbService";
import type { PageLoad } from "./$types";

export const load: PageLoad = () => {
    const promise = searchFutureGames();
    return {
        games: promise
    }
};