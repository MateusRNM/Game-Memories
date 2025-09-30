<script lang="ts">
    import GameCard from "$lib/components/GameCard.svelte";
	import { isOnline } from "$lib/database/networkStores.js";

    let { data } = $props();

    let searchText: string = $state("");
    let show: number = $state(-1);
    let library = $state(data?.library || []);

    let jogosZerados = $derived(library.filter(entry => entry.status === 2).length);
    let jogando = $derived(library.filter(entry => entry.status === 1).length);
    let jogosNaFila = $derived(library.filter(entry => entry.status === 0).length);

    let filteredLibrary = $derived(library.filter(entry => {
        const matchesStatus = show === -1 || entry.status === show;
        if (!matchesStatus) return false;

        const game = entry.games_cache;
        if (!game) return false;

        const matchesSearch = searchText === "" || game.name.toLowerCase().includes(searchText.toLowerCase());
        return matchesSearch;
    }));
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
                </select>
            </div>
        </div>
        <div class="d-flex justify-content-center align-items-center gap-2 p-4 text-center">
            <span class="badge text-bg-primary">Jogos zerados: {jogosZerados}</span>
            <span class="badge text-bg-light">Jogando: {jogando}</span>
            <span class="badge text-bg-secondary">Na fila: {jogosNaFila}</span>
        </div>
    </div>

    <div class="row gy-4">
        {#each filteredLibrary as entry (entry.id)}
            <div class="col-12 col-sm-6 col-md-4 col-lg-3 d-flex align-items-stretch">
                <GameCard gameData={entry.games_cache} />
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
        font-family: 'Oswald';
        src: url('../../../lib/assets/fonts/Oswald.ttf');
    }
    * {
        color: white;
        font-family: 'Oswald';
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
        border: 0.25rem solid black;
        border-radius: 6px;
        height: 2rem;
        color: black;
        width: 90%;
        margin-top: 1rem;
        font-size: 1.1rem;
        padding: 0.2rem;
    }
    #searchIcon {
        font-size: 1.5rem;
        pointer-events: none;
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
</style>

