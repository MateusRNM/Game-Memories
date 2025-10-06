import { Capacitor } from '@capacitor/core';
import { Preferences } from '@capacitor/preferences';
import { Store as TauriStore } from 'tauri-plugin-store-api';
import { isTauri } from '$lib/utils/platform';
import type { StorageAdapter } from '@supabase/supabase-js';

const capacitorStorageAdapter: StorageAdapter = {
	async getItem(key: string): Promise<string | null> {
		const { value } = await Preferences.get({ key });
		return value;
	},
	async setItem(key: string, value: string): Promise<void> {
		await Preferences.set({ key, value });
	},
	async removeItem(key: string): Promise<void> {
		await Preferences.remove({ key });
	}
};

const tauriStore = new TauriStore('.settings.dat');
const tauriStorageAdapter: StorageAdapter = {
	async getItem(key: string): Promise<string | null> {
		return await tauriStore.get(key);
	},
	async setItem(key: string, value: string): Promise<void> {
		await tauriStore.set(key, value);
		await tauriStore.save();
	},
	async removeItem(key: string): Promise<void> {
		await tauriStore.delete(key);
		await tauriStore.save();
	}
};

export async function getPlatformStorageAdapter(): Promise<StorageAdapter | undefined> {
	if (await isTauri()) {
		return tauriStorageAdapter;
	}

	if (Capacitor.isNativePlatform()) {
		return capacitorStorageAdapter;
	}
    
	return undefined;
}