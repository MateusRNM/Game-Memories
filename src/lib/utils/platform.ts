import { platform } from "@tauri-apps/plugin-os";

let isTauriEnvironment: boolean | null = null;

export async function isTauri(): Promise<boolean> {
    if (isTauriEnvironment !== null) {
        return isTauriEnvironment;
    }

    try {
        await platform();
        isTauriEnvironment = true;
        return true;
    } catch (e) {
        isTauriEnvironment = false;
        return false;
    }
}
