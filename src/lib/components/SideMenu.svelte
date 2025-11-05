<script lang="ts">
	import { page } from '$app/state';
	import { user } from '$lib/database/authStore';
	import Icon from '@iconify/svelte';	
	let username = $derived($user?.user_metadata.username || 'Usuário');
</script>

<nav
	class="hidden lg:flex w-64 flex-col fixed inset-y-0 z-50 bg-black border-r border-white/10 font-oswald p-4"
>
	<a href="/" class="flex items-center gap-2 px-2 mb-6">
		<span class="text-2xl font-bold text-white">Game <span class="text-blue-900">Memories</span></span>
	</a>

	<ul class="flex flex-col gap-2 flex-1">
		<li>
			<a
				href="/inicio"
				class="flex items-center gap-3 rounded-lg px-3 py-3 text-white/70 transition-colors hover:bg-white/10 hover:text-white"
				class:active-link={page.url.pathname.startsWith('/inicio')}
			>
				<Icon icon="bi:house" class="text-2xl" />
				<span class="text-lg">Início</span>
			</a>
		</li>
		<li>
			<a
				href="/searchGames"
				class="flex items-center gap-3 rounded-lg px-3 py-3 text-white/70 transition-colors hover:bg-white/10 hover:text-white"
				class:active-link={page.url.pathname.startsWith('/searchGames')}
			>
				<Icon icon="bi:search" class="text-2xl" />
				<span class="text-lg">Pesquisar</span>
			</a>
		</li>
		<li>
			<a
				href="/catalogo"
				class="flex items-center gap-3 rounded-lg px-3 py-3 text-white/70 transition-colors hover:bg-white/10 hover:text-white"
				class:active-link={page.url.pathname.startsWith('/catalogo')}
			>
				<Icon icon="bi:collection" class="text-2xl" />
				<span class="text-lg">Catálogo</span>
			</a>
		</li>
	</ul>

	<hr class="border-t border-white/10" />

	<div class="mt-4">
		<a
			href="/perfil"
			class="flex items-center gap-3 rounded-lg p-2 transition-colors hover:bg-white/10"
			class:active-link={page.url.pathname.startsWith('/perfil')}
		>
			<img
				src="https://placehold.co/100x100/2B2B2B/FFFFFF?text={username.charAt(0)}"
				alt="Avatar"
				class="h-10 w-10 rounded-full border-2 border-blue-900"
			/>
			<strong class="text-white">{username}</strong>
		</a>

	</div>
</nav>

<nav
	class="lg:hidden fixed bottom-0 left-0 z-50 w-full h-16 bg-black border-t border-white/10 font-oswald"
>
	<ul class="grid h-full grid-cols-4">
		<li>
			<a
				href="/inicio"
				class="flex h-full flex-col items-center justify-center text-white/70"
				class:active-link-mobile={page.url.pathname.startsWith('/inicio')}
			>
				<Icon icon="bi:house" class="text-2xl" />
				<span class="text-xs">Início</span>
			</a>
		</li>
		<li>
			<a
				href="/searchGames"
				class="flex h-full flex-col items-center justify-center text-white/70"
				class:active-link-mobile={page.url.pathname.startsWith('/searchGames')}
			>
				<Icon icon="bi:search" class="text-2xl" />
				<span class="text-xs">Pesquisar</span>
			</a>
		</li>
		<li>
			<a
				href="/catalogo"
				class="flex h-full flex-col items-center justify-center text-white/70"
				class:active-link-mobile={page.url.pathname.startsWith('/catalogo')}
			>
				<Icon icon="bi:collection" class="text-2xl" />
				<span class="text-xs">Catálogo</span>
			</a>
		</li>
		<li>
			<a
				href="/perfil"
				class="flex h-full flex-col items-center justify-center text-white/70"
				class:active-link-mobile={page.url.pathname.startsWith('/perfil')}
			>
				<Icon icon="bi:person-circle" class="text-2xl" />
				<span class="text-xs">Perfil</span>
			</a>
		</li>
	</ul>
</nav>

<style>
	.active-link {
		background-color: #0b428b;
		color: white !important;
	}

	.active-link-mobile {
		color: #0b428b !important;
	}
</style>