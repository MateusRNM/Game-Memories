import type { PageLoad } from "./$types";

export const load: PageLoad = async ({ parent }) => {
    try {
        const { session, supabase } = await parent();
        let createdAt = null;
        if(session){
            const { data } = await supabase.rpc('get_user_created_at', {
                p_user_id: session.user.id
            });
            createdAt = data;
        }

        return {
            createdAt,
            offline: false
        }
    } catch(error) {
        return {
            createdAt: null,
            offline: true
        };
    }
};