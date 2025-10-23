import { writable } from "svelte/store";
import type { User, SupabaseClient } from "@supabase/supabase-js";
import { invalidateAll } from "$app/navigation";

export const user = writable<User | null>(null);

export const auth = {
    signUp: async (supabase: SupabaseClient, email: string, password: string, username: string) => {
        const { data, error } = await supabase.auth.signUp({ 
            email, 
            password, 
            options: { data: { username } } 
        });
        if (error) throw error;
        return data;
    },

    signIn: async (supabase: SupabaseClient, email: string, password: string) => {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        return data;
    },

    signOut: async (supabase: SupabaseClient): Promise<void> => {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
        await invalidateAll();
    },

    deleteUser: async(supabase: SupabaseClient): Promise<void> => {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) throw sessionError;
        if (!session) throw new Error("Usuário não autenticado.");
        const response = await fetch(
            import.meta.env.VITE_DELETE_USER_FUNCTION_URL, 
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session.access_token}`
                }
            }
        );
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Falha ao deletar usuário.');
        }
        await supabase.auth.signOut();
        user.set(null);
        await invalidateAll();
    }
};