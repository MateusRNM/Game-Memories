<script lang="ts">
	import { fade } from 'svelte/transition';
	const { gameData } = $props();
</script>

<a
	href={`/jogo?gameId=${gameData.id}`}
	class="game-card group relative flex h-full w-full flex-col overflow-hidden rounded-xl border-2 border-white/10 bg-black text-white shadow-lg transition-all duration-200 ease-in-out no-underline hover:border-blue-700"
	transition:fade={{ duration: 300 }}
>
	<div class="card-image-container relative w-full aspect-3/4 overflow-hidden">
		<img
			class="card-image h-full w-full object-cover transition-transform duration-300 ease-in-out group-hover:scale-105"
			src={gameData.thumb || 'https://placehold.co/600x800/2B2B2B/FFFFFF?text=Capa'}
			alt="Capa de {gameData.name}"
			loading="lazy"
		/>
	</div>

	<div class="card-content flex grow flex-col p-4">
		<h3
			class="game-title text-center text-lg font-bold text-white/90 transition-colors duration-200 group-hover:text-white"
		>
			{gameData.name}
		</h3>
        <p class="text-center">Data de lançamento: {gameData.release_date}</p>
        <p class="text-center">Plataformas:</p>
        <ul class="list-inside">
            {#each gameData.platforms.split(',') as platform}
                <li>{platform}</li>
            {/each}
        </ul>
	</div>
</a>

<style>
	.game-card::after {
		content: '';
		position: absolute;
		top: 0;
		left: -150%;
		width: 75%;
		height: 100%;
		background: linear-gradient(
			to right,
			rgba(255, 255, 255, 0) 0%,
			rgba(255, 255, 255, 0.15) 50%,
			rgba(255, 255, 255, 0) 100%
		);
		transform: skewX(-25deg);
		transition: left 0.6s cubic-bezier(0.23, 1, 0.32, 1);
	}

	.game-card:hover::after {
		left: 150%;
	}
</style>