import { createSupabaseServerClient } from "@supabase/auth-helpers-sveltekit";
import { SUPABASE_KEY, SUPABASE_URL } from "$env/static/private";
import type { Handle } from "@sveltejs/kit";

export const handle: Handle = async ({ event, resolve }) => {
    event.locals.supabase = createSupabaseServerClient({
        supabaseUrl: SUPABASE_URL,
        supabaseKey: SUPABASE_KEY,
        event
    });

    const {
        data: { session },
    } = await event.locals.supabase.auth.getUser();

    event.locals.session = session;

    return resolve(event, {
        filterSerializedResponseHeaders(name) {
            return name === "content-range" || name === "content-profile";
        },
    });
};
