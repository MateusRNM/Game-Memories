import { writable } from 'svelte/store';
import { browser } from '$app/environment';
import { listen, type Event } from '@tauri-apps/api/event';
import { isTauri } from '$lib/utils/platform';

export const isOnline = writable(browser ? navigator.onLine : true);

export async function initializeNetworkListener() {
    if (!browser) return;

    if (await isTauri()) {
        const unlisten = await listen('network-status-changed', (event: Event<{ online: boolean }>) => {
            const status = event.payload.online;
            isOnline.set(status);
        });
        return unlisten;
    } else {
        const goOnline = () => isOnline.set(true);
        const goOffline = () => isOnline.set(false);

        window.addEventListener('online', goOnline);
        window.addEventListener('offline', goOffline);

        return () => {
            window.removeEventListener('online', goOnline);
            window.removeEventListener('offline', goOffline);
        };
    }
}