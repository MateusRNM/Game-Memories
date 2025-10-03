import { createSupabaseServerClient } from '@supabase/auth-helpers-sveltekit';
import { SUPABASE_URL, SUPABASE_KEY } from '$env/static/private';
import type { Handle } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {
    event.locals.supabase = createSupabaseServerClient({
        supabaseUrl: SUPABASE_URL,
        supabaseKey: SUPABASE_KEY,
        event,
    });

    event.locals.getSession = async () => {
        const {
            data: { session },
        } = await event.locals.supabase.auth.getUser();
        return session;
    };

    return resolve(event, {
        filterSerializedResponseHeaders(name) {
            return name === 'content-range' || name === 'content-profile'; 
        },
    });
};
