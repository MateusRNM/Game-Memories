
import { createSupabaseLoadClient } from '@supabase/auth-helpers-sveltekit';
import type { LayoutLoad } from './$types';
import { getPlatformStorageAdapter } from '$lib/database/storageAdapter';

export const ssr = false;
export const prerender = true;

export const load: LayoutLoad = async ({ fetch, data, depends }) => {
    depends('supabase:auth');
    const platformStorageAdapter = await getPlatformStorageAdapter();
    const supabase = createSupabaseLoadClient({
        supabaseUrl: import.meta.env.VITE_SUPABASE_URL,
        supabaseKey: import.meta.env.VITE_SUPABASE_KEY,
        event: { fetch },
        serverSession: data?.session,
        options: {
            auth: {
                storage: platformStorageAdapter
            }
        }
    });
    const { data: { session } } = await supabase.auth.getSession();
    return { supabase, session };
};
