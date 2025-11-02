<script lang="ts">
	import 'bootstrap/dist/css/bootstrap.css';
	import 'bootstrap-icons/font/bootstrap-icons.css';
	import * as bootstrap from "bootstrap";
	import { user } from '$lib/database/authStore';
	import SideMenu from '$lib/components/SideMenu.svelte';
	import { navigating, page } from '$app/state';
	import { onMount } from 'svelte';
	import { goto, invalidateAll } from '$app/navigation';
	import { initializeNetworkListener } from '$lib/database/networkStores.js';
	import { isTauri } from '$lib/utils/platform.js';
	import { App } from '@capacitor/app';
	import { onOpenUrl, getCurrent } from '@tauri-apps/plugin-deep-link';
	import { listen } from '@tauri-apps/api/event';

	let { data, children } = $props();

	const publicRoutes = ['/', '/esqueci-senha', '/update-password'];

	let offCanvas = $state(null);

	$effect((): void => {
		$user = data.session?.user ?? null;

		if(navigating.to !== null && offCanvas){
			offCanvas.hide();
		}

		if(!offCanvas && !publicRoutes.includes(page.url.pathname)){
			offCanvas = new bootstrap.Offcanvas('#sidebarOffcanvas');
		}
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
	<meta name="viewport" content="width=device-width, initial-scale=1" />
</svelte:head>

<div class="safeArea">
{#if !publicRoutes.includes(page.url.pathname)}
	<nav class="navbar navbar-dark bg-custom-dark d-lg-none fixed-top">
		<div class="container-fluid">
			<a class="navbar-brand" href="/">Game <span style="color:#0B428B;">Memories</span></a>
			<button
				class="navbar-toggler"
				type="button"
				data-bs-toggle="offcanvas"
				data-bs-target="#sidebarOffcanvas"
				aria-controls="sidebarOffcanvas"
			>
				<span class="navbar-toggler-icon"></span>
			</button>
		</div>
	</nav>

	<div
		class="offcanvas offcanvas-start bg-custom-dark"
		tabindex="-1"
		id="sidebarOffcanvas"
		aria-labelledby="sidebarOffcanvasLabel"
	>
		<div class="offcanvas-header">
			<h5 class="offcanvas-title text-white" id="sidebarOffcanvasLabel">Menu</h5>
			<button
				type="button"
				class="btn-close btn-close-white"
				data-bs-dismiss="offcanvas"
				aria-label="Close"
			></button>
		</div>
		<div class="offcanvas-body p-0">
			<SideMenu supabase={data.supabase} />
		</div>
	</div>
{/if}

<div class="app-layout" class:no-sidebar={publicRoutes.includes(page.url.pathname)}>
	{#if !publicRoutes.includes(page.url.pathname)}
		<div class="sidebar-container d-none d-lg-flex">
			<SideMenu supabase={data.supabase} />
		</div>
	{/if}

	<main class="main-content">
		{@render children?.()}
	</main>
</div>
</div>

<style>
	:global(body) {
		margin: 0px;
		padding: 0px;
		color: white;
		font-family: 'mainFont', sans-serif;
		background-color: black;
	}

	.btn-close:focus {
		box-shadow: none;
	}

	button.navbar-toggler {
		box-shadow: none;
	}

	:global(*::-webkit-scrollbar) {
		display: none;
	}

	:global(*:-webkit-autofill) {
		box-shadow: 0 0 0px 1000px white inset !important;
		-webkit-text-fill-color: black !important;
	}

	* {
		scrollbar-width: none;
		-ms-overflow-style: none;
		overflow-y: scroll;
	}

	.app-layout.no-sidebar {
		grid-template-columns: 1fr;
	}

	.bg-custom-dark {
		background-color: #2b2b2b !important;
	}

	.app-layout {
		display: grid;
		grid-template-columns: auto 1fr;
		height: 100vh;
	}

	.sidebar-container {
		width: 280px;
		height: 100vh;
		position: sticky;
		top: 0;
	}

	:global(.sidebar) {
		width: 100%;
		height: 100%;
		background-color: #2b2b2b;
	}
	:global(.sidebar .nav-link) {
		font-size: 1.1rem;
		border-radius: 0.375rem;
	}
	:global(.sidebar .nav-link.active) {
		background-color: #0b428b !important;
		font-weight: bold;
	}
	:global(.sidebar .nav-link:hover:not(.active)) {
		background-color: rgba(255, 255, 255, 0.1);
	}
	:global(.dropdown-menu) {
		background-color: #343a40;
	}
	:global(.dropdown-item:hover) {
		background-color: #0b428b;
	}

	.main-content {
		height: 100vh;
		background: #5c5c5c;
		background: radial-gradient(circle at top, #1c1c1c, #000000);
		background-size: cover;	
  		background-position: center;
		transition: all 0.3s ease;
	}

	.safeArea {
		width: 100dvw;
		height: 100dvh;
		padding: 0px;
		margin: 0px;
	}

	@media (max-width: 991.98px) {
		.app-layout {
			display: block;
		}
		.main-content {
			height: auto;
			min-height: 100vh;
		}
		.sidebar-container {
			height: 100dvh;
		}
		.safeArea {
			padding-top:  calc(env(safe-area-inset-top));
			padding-bottom: calc(env(safe-area-inset-bottom));
		}
		.navbar {
			position: relative !important;
		}
		.offcanvas {
			padding-top:  calc(env(safe-area-inset-top));
			padding-bottom: calc(env(safe-area-inset-bottom));
		}
	}
</style>
