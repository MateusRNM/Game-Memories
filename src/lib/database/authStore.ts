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
    }
};
