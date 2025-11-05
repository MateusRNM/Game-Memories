<script lang="ts">
	import GameCard from '$lib/components/GameCard.svelte';
	import { searchGames } from '$lib/database/igdbService';
	import { isOnline } from '$lib/database/networkStores';
	import Icon from '@iconify/svelte';

	const { data } = $props();

	let searchText: string = $state('');
	let games = $state([]);
	let isLoading: boolean = $state(false);

	let debounceTimeout: any = null;

	$effect(() => {
		if (debounceTimeout) clearTimeout(debounceTimeout);
		if (searchText === '' || !$isOnline) {
			games = [];
			isLoading = false;
			return;
		}

		debounceTimeout = setTimeout(async () => {
			isLoading = true;
			games = [];
			try {
				games = await searchGames(searchText, data.supabase);
			} finally {
				isLoading = false;
			}
		}, 1000);

		return () => {
			clearTimeout(debounceTimeout);
		};
	});
</script>

<div class="w-full max-w-7xl mx-auto px-4 py-8">
	<div class="flex justify-center mb-10">
		<div class="w-full md:w-8/12 lg:w-6/12">
			<div class="relative">
				<input
					autocomplete="off"
					autocorrect="off"
					autocapitalize="off"
					spellcheck="false"
					type="text"
					id="searchInput"
					class="font-oswald w-full h-12 rounded-lg border-2 border-black bg-custom-dark p-3 pr-10 text-base text-white transition-all duration-300 ease-in-out placeholder:text-white/40 focus:border-custom-blue focus:shadow-[0_0_15px_#0b428b6b] focus:outline-none"
					bind:value={searchText}
					placeholder="Pesquisar por um jogo..."
				/>
				<div class="absolute inset-y-0 right-0 flex items-center pr-3">
					<Icon icon="bi:search" class="text-xl text-white/50" />
				</div>
			</div>
		</div>
	</div>

	<div class="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
		{#if !$isOnline}
			<div
				class="col-span-full mb-4 flex items-center rounded-lg border border-yellow-300 bg-yellow-100 p-4 text-yellow-900"
				role="alert"
			>
				<Icon icon="bi:wifi-off" class="text-2xl mr-3" />
				<div>
					<span class="font-bold">Você está em modo offline.</span>
					Não é possível pesquisar por novos jogos.
				</div>
			</div>
		{:else if isLoading}
			<div class="col-span-full text-center text-white/70 mt-20">
				<div
					class="spinner-border inline-block h-12 w-12 animate-spin rounded-full border-4 border-r-transparent border-custom-blue align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"
					role="status"
				>
					<span class="absolute -m-px h-px w-px overflow-hidden whitespace-nowrap border-0 p-0 clip-[rect(0,0,0,0)]"
						>Carregando...</span
					>
				</div>
				<p class="mt-4 text-lg">Buscando jogos...</p>
			</div>
		{:else if games.length != 0}
			{#each games as game (game.id)}
				<div class="flex">
					<GameCard gameData={game} isDragging={false} />
				</div>
			{/each}
		{:else if searchText != ''}
			<div class="col-span-full text-center text-white/70 mt-20">
				<p class="text-lg">Nenhum jogo encontrado para "{searchText}"</p>
			</div>
		{:else}
			<div class="col-span-full text-center text-white/70 mt-20">
				<p class="mt-4 text-lg">Pesquise por um jogo para começar!</p>
			</div>
		{/if}
	</div>
</div>