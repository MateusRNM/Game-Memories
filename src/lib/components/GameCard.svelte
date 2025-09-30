<script lang="ts">
    import type { Game } from "$lib/interfaces";
    import { fade } from 'svelte/transition';
    const { gameData } = $props<{ gameData: Game }>();
</script>

<a href={`/jogo?gameId=${gameData.id}`} class="game-card" transition:fade={{ duration: 200 }}>
    <div class="card-image-container">
        <img class="card-image" src={gameData.cover_url} alt="Capa de {gameData.name}" loading="lazy">
        <div class="image-overlay"></div>
    </div>
    
    <div class="card-content">
        <h3 class="game-title">{gameData.name}</h3>
        
        <div class="game-info">
            <div class="info-item">
                <span class="info-label">Lançamento</span>
                <span class="info-value">{gameData.release_year}</span>
            </div>
            <div class="info-item">
                <span class="info-label">Plataformas</span>
                <span class="info-value platforms">{gameData.platforms}</span>
            </div>
        </div>
    </div>
</a>

<style>
    .game-card {
        font-family: 'Oswald', sans-serif;
        background-color: #2B2B2B; 
        border-radius: 12px; 
        overflow: hidden;
        text-decoration: none;
        color: white;
        display: flex;
        flex-direction: column;
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.5);
        border: 1px solid rgba(255, 255, 255, 0.1);
        transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
        width: 100%;
    }

    .game-card:hover {
        transform: translateY(-8px);
        box-shadow: 0 10px 30px #0b428b4d; 
    }

    .card-image-container {
        position: relative;
        aspect-ratio: 3 / 4;
    }

    .card-image {
        width: 100%;
        height: 100%;
        object-fit: cover; 
    }
    
    .image-overlay {
        position: absolute;
        bottom: 0;
        left: 0;
        width: 100%;
        height: 50%;
        background: linear-gradient(to top, #2B2B2B 10%, transparent);
    }

    .card-content {
        padding: 1.25rem;
        display: flex;
        flex-direction: column;
        flex-grow: 1;
        margin-top: -2rem; 
        position: relative;
        z-index: 2;
    }
    
    .game-title {
        font-size: 1.4rem;
        margin: 0 0 1.5rem 0; 
        line-height: 1.2;
        min-height: 3.4rem; 
    }

    .game-info {
        margin-top: auto;
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
    }

    .info-item {
        display: flex;
        flex-direction: column;
    }

    .info-label {
        font-size: 0.8rem;
        color: rgba(255, 255, 255, 0.5);
        text-transform: uppercase;
    }

    .info-value {
        font-size: 1rem;
        color: rgba(255, 255, 255, 0.9);
    }

    .platforms {
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }
</style>
