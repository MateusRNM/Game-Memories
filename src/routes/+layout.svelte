<script lang="ts">
	import "../app.css";
	import { user } from '$lib/database/authStore';
	import SideMenu from '$lib/components/SideMenu.svelte';
	import { page } from '$app/state';
	import { onMount } from 'svelte';
	import { goto, invalidateAll } from '$app/navigation';
	import { initializeNetworkListener } from '$lib/database/networkStores.js';
	import { isTauri } from '$lib/utils/platform.js';
	import { App } from '@capacitor/app';
	import { onOpenUrl, getCurrent } from '@tauri-apps/plugin-deep-link';
	import { listen } from '@tauri-apps/api/event';

	let { data, children } = $props();

	const publicRoutes = ['/', '/esqueci-senha', '/update-password'];

	$effect((): void => {
		$user = data.session?.user ?? null;
	});

	onMount(async (): Promise<never> => {
		const {
			data: { subscription }
		} = data.supabase.auth.onAuthStateChange((event, session) => {
			if (session?.user?.id !== $user?.id || data.session?.user?.id !== session?.user?.id) {
				invalidateAll();
			}
		});

		const cleanupBrowserListeners = await initializeNetworkListener();

        window.addEventListener("contextmenu", (e) => {
            e.preventDefault();
        });

		window.addEventListener('keydown', (e) => {
			if (
				(e.ctrlKey && e.key === 'r') ||
				e.key === 'F5' ||
				(e.ctrlKey && e.shiftKey && e.key === 'I')
			) {
				e.preventDefault();
			}
		});

		let unlisten: (() => void) | undefined;

		const handleDeepLinkUrls = async (urlString: string | null | undefined) => {
			if (!urlString) return;

			const url = new URL(urlString);
			const authCode = url.searchParams.get('code');

			if (authCode) {
				const { error } = await data.supabase.auth.exchangeCodeForSession(authCode);

				if (error) {
					return;
				}

				goto('/update-password', { replaceState: true });
			}
		};

		const initializeListeners = async () => {
			if (await isTauri()) {
				const initialUrl = await getCurrent();
				if (initialUrl) handleDeepLinkUrls(Array.isArray(initialUrl) ? initialUrl[0] : initialUrl);

				const unlistenOpenUrl = await onOpenUrl((urls) =>
					handleDeepLinkUrls(Array.isArray(urls) ? urls[0] : urls)
				);
				const unlistenSingleInstance = await listen('single-instance', (event) => {
					const args = event.payload as string[];
					const urlArg = args.find((arg) => arg.startsWith('gmemories://'));
					if (urlArg) handleDeepLinkUrls(urlArg);
				});

				unlisten = () => {
					unlistenOpenUrl();
					unlistenSingleInstance();
				};
			} else {
				const launchUrl = await App.getLaunchUrl();
				if (launchUrl) handleDeepLinkUrls(launchUrl.url);

				const listener = await App.addListener('appUrlOpen', (event) =>
					handleDeepLinkUrls(event.url)
				);
				unlisten = () => listener.remove();
			}
		};

		initializeListeners();

		return () => {
			subscription.unsubscribe();
			if (cleanupBrowserListeners) {
				cleanupBrowserListeners();
			}
			if (unlisten) {
				unlisten();
			}
		};
	});
</script>

<svelte:head>
	<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
</svelte:head>

<div class="safeArea">
	{#if !publicRoutes.includes(page.url.pathname)}
		<SideMenu />
	{/if}
	<main class="main-content">
		{@render children?.()}
	</main>
</div>

<style>
	:global(body) {
		margin: 0px;
		padding: 0px;
		color: white;
		font-family: 'mainFont', sans-serif;
		background-color: black;
	}

	:global(*::-webkit-scrollbar) {
		display: none;
	}

	:global(*:-webkit-autofill) {
		box-shadow: 0 0 0px 1000px white inset !important;
		-webkit-text-fill-color: black !important;
	}

	:global(select){
		appearance: none;
		-webkit-appearance: none;
		-moz-appearance: none;
	}

	:global(input[type=number]::-webkit-inner-spin-button, input[type=number]::-webkit-outer-spin-button) {
		-webkit-appearance: none;
		margin: 0;
	}

	:global(input[type=number]) {
		appearance: textfield;
	}

	* {
		scrollbar-width: none;
		-ms-overflow-style: none;
	}

	.main-content {
		height: 100vh;
		background: #5c5c5c;
		background: radial-gradient(circle at top, #1c1c1c, #000000);
		background-size: cover;	
  		background-position: center;
		transition: all 0.3s ease;
		overflow-y: auto;
	}

	.safeArea {
		width: 100vw;
		height: 100vh;
		padding-top: env(safe-area-inset-top);
	}

	@media (max-width: 1023.98px) {
		.main-content {
			height: calc(98vh - calc(calc(var(--spacing) * 16) + env(safe-area-inset-bottom)));
		}
	}

	@media (min-width: 1024px) {
		.main-content {
			padding-left: 16rem;
		}
	}
</style>