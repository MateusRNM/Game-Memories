<script lang="ts">
	import FutureGamesCards from '$lib/components/FutureGamesCards.svelte';
	let { data } = $props();
</script>

<div class="container py-4">
	<div class="row gy-4 text-center pt-3">
		<h3 class="pb-3">PRÓXIMOS LANÇAMENTOS:</h3>
		{#await data.games}
			<div class="text-center text-white-50 mt-5">
				<div class="spinner-border text-primary" role="status">
					<span class="visually-hidden">Carregando...</span>
				</div>
				<p class="mt-3">Buscando os próximos lançamentos...</p>
			</div>
		{:then games}
			{#each games as entry (entry.id)}
				<div class="col-12 col-sm-6 col-md-4 col-lg-3 d-flex align-items-stretch">
					<FutureGamesCards gameData={entry} />
				</div>
			{/each}
		{:catch}
			<div class="alert alert-warning d-flex align-items-center mb-4" role="alert">
				<i class="bi bi-wifi-off me-2" style="color:black;"></i>
				<div>
					<span style="color:black;">Você está em modo offline.</span>
				</div>
			</div>
		{/await}
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
</style>
