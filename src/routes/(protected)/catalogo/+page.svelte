<script lang="ts">
    import GameCard from "$lib/components/GameCard.svelte";
	import { isOnline } from "$lib/database/networkStores.js";
    import { dndzone, overrideItemIdKeyNameBeforeInitialisingDndZones } from "svelte-dnd-action";
    import { flip } from "svelte/animate";
    overrideItemIdKeyNameBeforeInitialisingDndZones("id");

    let { data } = $props();

    let searchText: string = $state("");
    let show: number = $state(-1);
    let library = $state(data?.library || []);

    let jogosZerados = $derived(library.filter(entry => entry.status === 2).length);
    let jogando = $derived(library.filter(entry => entry.status === 1).length);
    let jogosNaFila = $derived(library.filter(entry => entry.status === 0).length);
    let jogosDesistidos = $derived(library.filter(entry => entry.status === 3).length);

    let isDragging = $state(false);

    const flipDuration = 300;

    let filteredLibrary = $derived(
		library.filter((entry) => {
			const matchesStatus = show === -1 || entry.status === show;
			if (!matchesStatus) return false;

			const game = entry.games_cache;
			if (!game) return false;

			const matchesSearch =
				searchText === '' || game.name.toLowerCase().includes(searchText.toLowerCase());
			return matchesSearch;
		})
	);

    function handleDndConsider(e) {
        isDragging = true;
        filteredLibrary = e.detail.items;
    }

    async function handleDndFinalize(e) {
		const reorderedFilteredItems = e.detail.items;
		const reorderedIds = reorderedFilteredItems.map((item) => item?.id);
		const reorderedIdsSet = new Set(reorderedIds);
		const itemsNotInFilter = library.filter((item) => !reorderedIdsSet.has(item?.id));
		const newFullLibrary = [...reorderedFilteredItems, ...itemsNotInFilter];
		library = newFullLibrary;
		const finalOrderedIds = newFullLibrary.map((entry) => entry?.id);
        isDragging = false;
		await data.supabase.rpc('update_library_order', {
			p_library_ids: finalOrderedIds
		});
    }
</script>

<div class="container py-4">
    {#if !$isOnline || data.offline}
        <div class="alert alert-warning d-flex align-items-center mb-4" role="alert">
            <i class="bi bi-wifi-off me-2" style="color:black;"></i>
            <div>
                <span style="color:black;">Você está em modo offline. Mostrando a última versão salva do seu catálogo.</span>
            </div>
        </div>
    {/if}

    <div class="row justify-content-center mb-5">
        <div class="col-12 col-md-8 col-lg-6">
            <div class="position-relative">
                <input autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" type="text" id="searchInput" bind:value={searchText}>
                <i class="bi bi-search" id="searchIcon"></i>
                <hr color="#0B428B"/>
                <select bind:value={show} class="form-select">
                    <option value={-1}>Todos</option>
                    <option value={0}>Na fila</option>
                    <option value={1}>Jogando</option>
                    <option value={2}>Zerados</option>
                    <option value={3}>Desistidos</option>
                </select>
            </div>
        </div>
        <div class="row justify-content-center align-items-center gap-2 p-4 text-center">
            <span class="badge text-bg-primary">Jogos zerados: {jogosZerados}</span>
            <span class="badge text-bg-light">Jogando: {jogando}</span>
            <span class="badge text-bg-secondary">Na fila: {jogosNaFila}</span>
            <span class="badge text-bg-danger">Desistidos: {jogosDesistidos}</span>
        </div>
    </div>

    <div class="row gy-4" 
        use:dndzone={{ items: filteredLibrary, flipDurationMs: flipDuration, delayTouchStart: true, dropTargetStyle: { outline: 'none' }, transformDraggedElement: (e) => e.style.outline = 'none' }} 
        onconsider={handleDndConsider} 
        onfinalize={handleDndFinalize}
        class:is-dragging={isDragging}>
        {#each filteredLibrary as entry (entry.id)}
            <div class="col-6 col-sm-6 col-md-4 col-lg-3 d-flex align-items-center" animate:flip={{ duration: isDragging ? 0 : flipDuration }}>
                <GameCard isDragging={isDragging} gameData={entry.games_cache}/>
            </div>
        {:else}
            <div class="col-12">
                <p class="text-center text-white-50 mt-5">
                    Nenhum jogo encontrado. Tente ajustar os filtros ou adicione jogos ao seu catálogo!
                </p>
            </div>
        {/each}
    </div>
</div>

<style>
    @font-face {
        font-family: 'mainFont';
        src: url('../../../lib/assets/fonts/mainFont.ttf');
    }
    * {
        color: white;
        font-family: 'mainFont';
    }
    input {
        outline: none;
    }
    select {
        background-color: #3f3f3f;
        color: white;
        border: 1px solid rgba(255, 255, 255, 0.2);
        outline: none;
    }
    select:focus {
        background-color: #3f3f3f;
        color: white;
        border-color: #0B428B;
        box-shadow: 0 0 0 0.25rem #0b428b6b;
    }
    #searchInput {
        background-color: #2c2c2c; 
        border: 1px solid #4a4a4a;
        border-radius: 8px;
        height: 2rem;
        color: white;
        width: 95%;
        font-size: 1rem;
        padding: 0.5rem;
        transition: all 0.3s ease;
        margin-bottom: 0.7rem;
    }
    #searchIcon {
        font-size: 1.5rem;
        pointer-events: none;
    }
    #searchInput:hover {
        border-color: #0B428B;
        box-shadow: 0.1rem 0.1rem 0.1rem 0.1rem #0056b3;
        transform: translateY(-4px);
    }
    #searchInput:focus {
        border-color: #0B428B;
        box-shadow: 0.3rem 0.3rem 0.3rem 0.3rem #0b428b6b;
    }
    span.badge {
        width: 10rem;
        height: 2rem;
        padding: 0.5rem;
        font-size: 0.9rem;
    }
    .is-dragging :global(a.game-card:hover) {
        transform: none;
        transition: none;
    }
    :global(.is-dragging .dnd-shadow) {
        opacity: 0.8;
        transform: scale(1.05);
    }
</style>

