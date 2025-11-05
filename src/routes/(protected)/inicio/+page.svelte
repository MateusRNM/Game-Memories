<script lang="ts">
	import FutureGamesCards from '$lib/components/FutureGamesCards.svelte';
	import { isOnline } from '$lib/database/networkStores';
	import Icon from '@iconify/svelte';
	let { data } = $props();
</script>

<div class="w-full max-w-7xl mx-auto px-4 py-8">
	<div class="text-center pt-3">
		<h3 class="text-3xl font-bold text-white pb-3 font-oswald uppercase tracking-wide">
			PRÓXIMOS LANÇAMENTOS:
		</h3>

		{#await data.games}
			<div class="text-center text-white/70 mt-20">
				<div
					class="spinner-border inline-block h-12 w-12 animate-spin rounded-full border-4 border-r-transparent border-custom-blue align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"
					role="status"
				>
					<span class="absolute -m-px h-px w-px overflow-hidden whitespace-nowrap border-0 p-0 clip-[rect(0,0,0,0)]"
						>Carregando...</span
					>
				</div>
				<p class="mt-4 text-lg">Buscando os próximos lançamentos...</p>
			</div>
		{:then games}
			<div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
				{#each games as entry (entry.id)}
					<div class="flex">
						<FutureGamesCards gameData={entry} />
					</div>
				{:else}
					<div class="col-span-full text-center text-white/70 mt-10">
						<p>Nenhum jogo encontrado.</p>
					</div>
				{/each}
			</div>
		{:catch}
			<div
				class="mb-6 flex items-center rounded-lg border border-yellow-300 bg-yellow-100 p-4 text-yellow-900"
				role="alert"
			>
				<Icon icon="bi:wifi-off" class="text-2xl mr-3" />
				<div>Você está em modo offline.</div>
			</div>
		{/await}
	</div>
</div>