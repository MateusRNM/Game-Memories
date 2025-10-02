<script lang="ts">
    import { fade } from 'svelte/transition';
    const { gameData } = $props();
</script>

<a href={`/jogo?gameId=${gameData.id}`} class="game-card" transition:fade={{ duration: 200 }}>
    <div class="card-image-container">
        <img class="card-image" src={gameData.cover_url} alt="Capa de {gameData.name}" loading="lazy">
        <div class="image-overlay">
            <h3 class="game-title">{gameData.name}</h3>
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
        width: 30rem;
        height: 28rem;
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
    
    .game-title {
        font-size: 1.4rem;
        line-height: 1.2;
        min-height: 3.4rem; 
        position: relative;
        top: 9rem;
        text-align: center;
        text-wrap: unset;
    }

    @media(max-height: 730px){
        .game-card {
            width: 9rem;
            height: 9rem;
        }
    }
</style>
