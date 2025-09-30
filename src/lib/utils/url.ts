import { Capacitor } from '@capacitor/core';
import { isTauri } from './platform'; 

export async function getRedirectBaseUrl(): Promise<string> {
    if (await isTauri()) {
        return 'gmemories://';
    }

    const platform = Capacitor.getPlatform();
    if (platform !== 'web') {
        return 'capacitor://localhost';
    }

    return window.location.origin;
}
