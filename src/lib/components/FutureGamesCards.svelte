<script lang="ts">
    import { fade } from 'svelte/transition';
    let { gameData } = $props();
</script>

<a class="game-card" transition:fade={{ duration: isDragging ? 0 : 300 }}>
    <div class="card-image-container">
        <img class="card-image" src={gameData.thumb.replace('cover_big', 'screenshot_huge')} alt="Capa de {gameData.name}" loading="lazy">
        <div class="col">
            <h3 class="game-title">{gameData.name}</h3>
            <span>Data de lançamento: {gameData.release_date}</span>
            <hr>
            <span>Plataformas: {gameData.platforms}</span>
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
        width: 32rem;
        height: 32rem;
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
        height: 60%;
        object-fit: fill; 
    }
    
    .game-title {
        font-size: 1.4rem;
        line-height: 1.2;
        min-height: 3.4rem; 
        position: relative;
        text-align: center;
        text-wrap: unset;
        top: 1rem;
    }

    @media(max-height: 900px){
        .game-card {
            width: 32rem;
            height: 32rem;
        }
    }
</style>
