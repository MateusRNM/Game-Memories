import type { PageLoad } from './$types';
import { cacheUserLibrary, getCachedUserLibrary } from '$lib/database/cacheService';
import type { GameCatalog } from '$lib/interfaces';

interface CatalogPageData {
    library: GameCatalog[];
    offline?: boolean;
}

export const load: PageLoad = async ({ parent }): Promise<CatalogPageData> => {
    const { session, supabase } = await parent();

    if (!session?.user) {
        return { library: [] };
    }

    try {
        const { data: onlineLibrary, error } = await supabase
            .from('user_library')
            .select(`
                *,
                games_cache (*)
            `)
            .eq('user_id', session.user.id)
            .order('added_at', { ascending: false });

        if (error) {
            throw error;
        }

        cacheUserLibrary(onlineLibrary || []);

        return { 
            library: onlineLibrary || [],
            offline: false
        };

    } catch (error) {        
        const cachedLibrary = await getCachedUserLibrary();
        
        return { 
            library: cachedLibrary,
            offline: true
        };
    }
};

