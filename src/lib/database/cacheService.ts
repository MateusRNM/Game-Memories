import { isTauri } from '$lib/utils/platform';
import { Preferences } from '@capacitor/preferences';
import { load, Store } from '@tauri-apps/plugin-store';

const TAURI_STORE_FILE = '.user-library.dat';
const CACHE_KEY = 'user_library_cache';

let tauriStore: Store | null = null;

async function getTauriStore(): Promise<Store> {
    if (!tauriStore) {
        tauriStore = await load(TAURI_STORE_FILE);
    }
    return tauriStore;
}

export async function cacheUserLibrary(library): Promise<void> {
    try {
        if (await isTauri()) {
            const store: Store = await getTauriStore();
            await store.set(CACHE_KEY, library);
            await store.save(); 
        } else { 
            await Preferences.set({
                key: CACHE_KEY,
                value: JSON.stringify(library),
            });
        }
    } catch (error) {
        console.error('Erro ao salvar biblioteca no cache:', error);
    }
}

export async function getCachedUserLibrary() {
    try {
        if (await isTauri()) {
            const store: Store = await getTauriStore();
            const library = await store.get(CACHE_KEY);
            if (library) {
                return library;
            }
        } else { 
            const { value } = await Preferences.get({ key: CACHE_KEY });
            if (value) {
                return JSON.parse(value);
            }
        }
    } catch (error) {
        console.error('Erro ao carregar biblioteca do cache:', error);
    }
    return [];
}

