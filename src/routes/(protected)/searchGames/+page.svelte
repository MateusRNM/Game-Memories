<script lang="ts">
	import GameCard from "$lib/components/GameCard.svelte";
	import { searchGames } from "$lib/database/igdbService";
	import { isOnline } from "$lib/database/networkStores";

    let searchText: string = $state("");
    let games = $state([]); 
    let isLoading: boolean = $state(false);

    let debounceTimeout = null;

    $effect(() => {
        if(debounceTimeout) clearTimeout(debounceTimeout);
        if(searchText === "" || !$isOnline){
            games = [];
            isLoading = false;
            return;
        }

        debounceTimeout = setTimeout(async () => {
            isLoading = true;
            games = [];
            try {
                games = await searchGames(searchText);
            } finally {
                isLoading = false;
            }
        }, 1000);

        return () => {
            clearTimeout(debounceTimeout);
        };
    });
</script>

<div class="container py-4">
    <div class="row justify-content-center mb-5">
        <div class="col-12 col-md-8 col-lg-6">
            <div class="position-relative">
                <input autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" type="text" id="searchInput" bind:value={searchText}>
                <i class="bi bi-search" id="searchIcon"></i>
            </div>
        </div>
    </div>

    <div class="row gy-4">
        {#if !$isOnline}
            <div class="alert alert-warning d-flex align-items-center mb-4" role="alert">
                <i class="bi bi-wifi-off me-2" style="color:black;"></i>
                <div>
                    <span style="color:black;">Você está em modo offline. Não será possível pesquisar por nenhum jogo.</span>
                </div>
            </div>
        {:else if isLoading}
            <div class="col-12">
                <p class="feedback-text">Buscando jogos...</p>
            </div>
        {:else if games.length != 0}
            {#each games as game}
                <div class="col-12 col-sm-6 col-md-4 col-lg-3 d-flex align-items-stretch">
                    <GameCard gameData={game}/>
                </div>
            {/each}
        {:else if searchText != ""}
            <div class="col-12">
                 <p class="feedback-text">Nenhum jogo encontrado para "{searchText}"</p>
            </div>
        {:else}
            <div class="col-12">
                <p class="feedback-text">Pesquise algum jogo!</p>
            </div>
        {/if}
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
    .feedback-text {
        text-align: center;
        margin-top: 2rem;
        font-size: 1.2rem;
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
</style>