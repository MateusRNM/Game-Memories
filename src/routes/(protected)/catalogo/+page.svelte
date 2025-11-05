<script lang="ts">
	import GameCard from '$lib/components/GameCard.svelte';
	import { isOnline } from '$lib/database/networkStores';
	import { dndzone } from 'svelte-dnd-action';
	import { flip } from 'svelte/animate';
	import Icon from '@iconify/svelte';

	let { data } = $props();

	let searchText: string = $state('');
	let show: number = $state(-1);
	let library = $state(data?.library || []);

	let jogosZerados = $derived(library.filter((entry) => entry.status === 2).length);
	let jogando = $derived(library.filter((entry) => entry.status === 1).length);
	let jogosNaFila = $derived(library.filter((entry) => entry.status === 0).length);
	let jogosDesistidos = $derived(library.filter((entry) => entry.status === 3).length);

	let isDragging = $state(false);
	let scrollableContainer: HTMLElement | null = null;

	function autoScroll(event: MouseEvent | TouchEvent) {
		if (!isDragging || !scrollableContainer) return;

		const y = 'touches' in event ? event.touches[0].clientY : event.clientY;
		const rect = scrollableContainer.getBoundingClientRect();
		const scrollZone = rect.height * 0.25;

		if (y < rect.top + scrollZone) {
			const speed = (scrollZone - (y - rect.top)) / scrollZone;
			scrollableContainer.scrollTop -= speed * 25;
		} else if (y > rect.bottom - scrollZone) {
			const speed = (scrollZone - (rect.bottom - y)) / scrollZone;
			scrollableContainer.scrollTop += speed * 25;
		}
	}

	function handleMouseMove(event: MouseEvent | TouchEvent) {
		if (isDragging) {
			autoScroll(event);
		}
	}

	$effect.pre(() => {
		if (!scrollableContainer) {
			scrollableContainer = document.querySelector('.main-content');
		}
	});

	const flipDuration = 300;
	let filteredLibrary = $state([]);
	let filterTimeoutId;

	function updateFilteredItems() {
		if (isDragging) return;
		
		const filtered = library.filter((entry) => {
			const matchesStatus = show === -1 || entry.status === show;
			if (!matchesStatus) return false;

			const game = entry.games_cache;
			if (!game) return false;

			const matchesSearch =
				searchText === '' || game.name.toLowerCase().includes(searchText.toLowerCase());
			return matchesSearch;
		});
		filteredLibrary = filtered.filter(item => item && item.id);
	}

	$effect(() => {
		const _ = searchText;
		const __ = show;
		const ___ = library;
		
		clearTimeout(filterTimeoutId);
		filterTimeoutId = setTimeout(() => {
			updateFilteredItems();
		}, 50);
	});

	function handleDndConsider(e) {
		isDragging = true;
		filteredLibrary = e.detail.items.filter(item => item && item.id);
	}

	async function handleDndFinalize(e) {
		const reorderedFilteredItems = e.detail.items.filter(item => item && item.id);
		isDragging = false;

		const reorderedIds = reorderedFilteredItems.map((item) => item.id);
		const reorderedIdsSet = new Set(reorderedIds);
		const itemsNotInFilter = library.filter((item) => !reorderedIdsSet.has(item.id));
		const newFullLibrary = [...reorderedFilteredItems, ...itemsNotInFilter];

		library = newFullLibrary;

		const finalOrderedIds = newFullLibrary.map((entry) => entry.id);

		try {
			const { error } = await data.supabase.rpc('update_library_order', {
				p_library_ids: finalOrderedIds
			});
			if (error) throw error;
		} catch (error) {
			window.location.reload();
		}
	}
</script>

<svelte:window on:mousemove={handleMouseMove} on:touchmove={handleMouseMove} />

<div class="w-full max-w-7xl mx-auto px-4 py-8 font-oswald">
	{#if !$isOnline || data.offline}
		<div
			class="mb-6 flex items-center rounded-lg border border-yellow-300 bg-yellow-100 p-4 text-yellow-900"
			role="alert"
		>
			<Icon icon="bi:wifi-off" class="text-2xl mr-3" />
			<div>
				<span class="font-bold">Você está em modo offline.</span>
				Mostrando a última versão salva do seu catálogo.
			</div>
		</div>
	{/if}

	<div class="mb-10">
		<div class="mx-auto w-full md:w-8/12 lg:w-6/12">
			<div class="relative">
				<input
					autocomplete="off"
					autocorrect="off"
					autocapitalize="off"
					spellcheck="false"
					type="text"
					id="searchInput"
					class="w-full h-12 rounded-lg border-2 border-black bg-custom-dark p-3 pr-10 text-base text-white transition-all duration-300 ease-in-out placeholder:text-white/40 focus:border-custom-blue focus:shadow-[0_0_15px_#0b428b6b] focus:outline-none"
					bind:value={searchText}
					placeholder="Filtrar jogos no catálogo..."
				/>
				<div class="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
					<Icon icon="bi:search" class="text-xl text-white/50" />
				</div>
			</div>

			<hr class="my-4 border-t-2 border-black" />

			<select
				bind:value={show}
				class="w-full rounded-lg border border-gray-900 bg-neutral-800 p-3 font-bold text-base focus:border-blue-700 focus:outline-0 focus:ring-blue/50"
			>
				<option value={-1}>Todos</option>
				<option value={0}>Na fila</option>
				<option value={1}>Jogando</option>
				<option value={2}>Zerados</option>
				<option value={3}>Desistidos</option>
			</select>
		</div>
		<div class="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4 p-4 text-center mt-4">
			<span
				class="flex h-10 w-full items-center justify-center rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white"
				>Jogos zerados: {jogosZerados}</span
			>
			<span
				class="flex h-10 w-full items-center justify-center rounded-lg bg-gray-200 px-3 py-2 text-sm font-medium text-black"
				>Jogando: {jogando}</span
			>
			<span
				class="flex h-10 w-full items-center justify-center rounded-lg bg-gray-600 px-3 py-2 text-sm font-medium text-white"
				>Na fila: {jogosNaFila}</span
			>
			<span
				class="flex h-10 w-full items-center justify-center rounded-lg bg-red-700 px-3 py-2 text-sm font-medium text-white"
				>Desistidos: {jogosDesistidos}</span
			>
		</div>
	</div>

	<div
		class="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6"
		use:dndzone={{ items: filteredLibrary, flipDurationMs: flipDuration, delayTouchStart: true, dropTargetStyle: { outline: 'none' }, transformDraggedElement: (e) => e.style.outline = 'none' }}
		onconsider={handleDndConsider}
		onfinalize={handleDndFinalize}
		class:is-dragging={isDragging}
	>
		{#each filteredLibrary as entry (entry.id)}
			<div class="flex" animate:flip={{ duration: isDragging ? 0 : flipDuration }}>
				<GameCard gameData={entry.games_cache} isDragging={isDragging}/>
			</div>
		{:else}
			<div class="col-span-full text-center text-white/70 mt-20">
				<p class="text-lg">
					Nenhum jogo encontrado. Tente ajustar os filtros ou adicione jogos ao seu catálogo!
				</p>
			</div>
		{/each}
	</div>
</div>

<style>
	.is-dragging :global(a.game-card:hover) {
		transform: none;
		transition: none;
	}

	:global(.is-dragging .dnd-shadow) {
		opacity: 0.8;
		transform: scale(1.05);
	}
</style>