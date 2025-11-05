<script lang="ts">
	import ConfirmToast from '$lib/components/ConfirmToast.svelte';
	import { user } from '$lib/database/authStore';
	import { upsertGameInLibrary, removeGameFromLibrary } from '$lib/database/libraryService';
	import { isOnline } from '$lib/database/networkStores';
	import Icon from '@iconify/svelte';

	let { data } = $props();

	let game = $state(data.game);
	let libraryEntry = $state(data.libraryEntry);

	let status: number = $state(1);
	let platformPlaying: string | null = $state('');
	let startedAt: string = $state('');
	let finishedAt: string = $state('');
	let addedAt: string = $state('');
	let playTimeHours: string = $state('0');
	let rating: number = $state(5);
	let personalNotes: string = $state('');
	let personalNotesElement: HTMLTextAreaElement | null = $state(null);

	let isLoading: boolean = $state(false);

	let confirmToastOpen: boolean = $state(false);

	function formatDateForInput(dateString: string | null | undefined): string {
		if (!dateString) return '';
		try {
			const date = new Date(dateString);
			const utcDate = new Date(date.getTime() + date.getTimezoneOffset() * 60000);
			return utcDate.toISOString().split('T')[0];
		} catch (e) {
			return '';
		}
	}

	$effect(() => {
		if (data.game) game = data.game;

		if (data.libraryEntry) {
			libraryEntry = data.libraryEntry;
			status = data.libraryEntry.status;
			platformPlaying = data.libraryEntry.platform_playing;
			startedAt = formatDateForInput(data.libraryEntry.started_at);
			finishedAt = formatDateForInput(data.libraryEntry.finished_at);
			addedAt = new Date(data.libraryEntry.added_at).toLocaleDateString('pt-BR');
			playTimeHours = String(data.libraryEntry.playtime_hours) || '0';
			rating = data.libraryEntry.rating;
			personalNotes = data.libraryEntry.personal_notes;
		} else {
			libraryEntry = null;
		}
	});

	async function handleUpsert() {
		if (!$user) {
			return;
		}
		if (!game) return;

		isLoading = true;
		try {
			const updatedEntry = await upsertGameInLibrary(data.supabase, {
				user_id: $user.id,
				game_id: game.id,
				status: status,
				platform_playing: platformPlaying,
				started_at: startedAt ? new Date(startedAt).toISOString() : null,
				finished_at: finishedAt ? new Date(finishedAt).toISOString() : null,
				playtime_hours: parseInt(playTimeHours),
				rating: rating,
				personal_notes: personalNotes,
				list_position: libraryEntry == null ? data.lastListPosition + 1 : libraryEntry.list_position
			});
			libraryEntry = updatedEntry;
		} finally {
			isLoading = false;
		}
	}

	function handleAdd() {
		if (!game) return;
		status = 1;
		platformPlaying = '';
		startedAt = formatDateForInput(new Date().toISOString());
		finishedAt = '';
		rating = 5;
		handleUpsert();
	}

	async function handleRemove() {
		confirmToastOpen = true;
	}

	async function remove() {
		if (!libraryEntry?.id) return;
		isLoading = true;

		try {
			await removeGameFromLibrary(data.supabase, libraryEntry.id);
			libraryEntry = null;
		} finally {
			isLoading = false;
		}
	}

	function resizeTextArea(textareaElement) {
		textareaElement.style.height = 'auto';
		textareaElement.style.height = `${textareaElement.scrollHeight + 20}px`;
	}

	$effect(() => {
		if (personalNotesElement) {
			const callFunc = () => resizeTextArea(personalNotesElement);
			personalNotesElement.addEventListener('input', callFunc);
			resizeTextArea(personalNotesElement);
			return () => {
				personalNotesElement.removeEventListener('input', callFunc);
			};
		}
	});
</script>

<ConfirmToast
    msg={'Você tem certeza que deseja remover este jogo do seu catálogo? (Todos os dados do jogo serão perdidos)'}
    confirmMsg={'REMOVER'}
    action={remove}
    bind:opened={confirmToastOpen}
/>

<div class="page-background min-h-screen font-oswald text-white">
	{#if !$isOnline || data.offline}
		<div
			class="mb-4 flex items-center rounded-lg border border-yellow-300 bg-yellow-100 p-4 text-yellow-900"
			role="alert"
		>
			<Icon icon="bi:wifi-off" class="text-2xl mr-3" />
			<div>
				<span class="font-bold">Você está em modo offline.</span>
				Não será possível alterar nenhuma informação (modo leitura).
			</div>
		</div>
	{/if}

	{#if game}
		<div class="details-page">
			<header
				class="hero-section relative flex h-[60vh] min-h-[400px] max-h-[550px] items-end bg-cover bg-center"
				style="background-image: url({game.cover_url?.replace('cover_big', 'screenshot_huge')})"
			>
				<div
					class="hero-overlay absolute inset-0 bg-linear-to-t from-black via-black/70 to-transparent"
				></div>
				<div class="container relative mx-auto h-full">
					<div class="flex h-full items-end pb-4 md:pb-8">
						<div class="shrink-0">
							<img
								class="hero-cover h-40 w-32 rounded-lg border-2 border-white/10 object-cover shadow-2xl transition-transform duration-300 ease-in-out md:h-60 md:w-44"
								src={game.cover_url}
								alt="Capa de {game.name}"
							/>
						</div>
						<div class="ml-6">
							<h1
								class="game-title text-4xl font-bold [text-shadow:_0_3px_8px_rgb(0_0_0_/_0.9)] md:text-5xl lg:text-6xl"
							>
								{game.name}
							</h1>
							<p class="release-year text-lg text-white/70">{game.release_year}</p>
						</div>
					</div>
				</div>
			</header>

			<main class="container mx-auto py-8 md:py-12">
				<div class="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-12">
					<div class="lg:col-span-8">
						<section class="card mb-6 rounded-xl border border-white/10 bg-custom-dark">
							<div class="card-body p-6">
								<h2
									class="card-title mb-6 border-b-2 border-custom-blue pb-3 text-2xl font-bold text-white"
								>
									Meu Catálogo
								</h2>
								{#if $user != null}
									{#if libraryEntry === null}
										<div class="grid">
											<button
												class="btn-primary w-full"
												onclick={handleAdd}
												disabled={isLoading || !$isOnline || data.offline}
											>
												{isLoading ? 'Adicionando...' : 'Adicionar ao Catálogo'}
											</button>
										</div>
									{:else}
										<form
											onsubmit={(e) => {
												e.preventDefault();
												handleUpsert();
											}}
											class="catalog-form space-y-6"
										>
											<div class="grid grid-cols-1 gap-6 md:grid-cols-2">
												<div class="form-group flex flex-col gap-2">
													<label for="status" class="form-label">Status</label>
													<select
														id="status"
														class="form-input"
														bind:value={status}
														disabled={isLoading || !$isOnline || data.offline}
													>
														<option value={0}>Na Fila</option>
														<option value={1}>Jogando</option>
														<option value={2}>Zerado</option>
														<option value={3}>Desistiu</option>
													</select>
												</div>
												<div class="form-group flex flex-col gap-2">
													<label for="platform" class="form-label">Plataforma Jogando</label>
													<input
														autocomplete="off"
														autocorrect="off"
														autocapitalize="off"
														spellcheck="false"
														id="platform"
														type="text"
														class="form-input"
														placeholder="Ex: PC, PS5..."
														bind:value={platformPlaying}
														disabled={isLoading || !$isOnline || data.offline}
													/>
												</div>
												{#if status !== 0}
													<div class="form-group flex flex-col gap-2">
														<label for="started_at" class="form-label">Começou a jogar em</label>
														<input
															autocomplete="off"
															autocorrect="off"
															autocapitalize="off"
															spellcheck="false"
															id="started_at"
															type="date"
															class="form-input"
															bind:value={startedAt}
															disabled={isLoading || !$isOnline || data.offline}
														/>
													</div>
												{/if}
												{#if status === 2}
													<div class="form-group flex flex-col gap-2">
														<label for="finished_at" class="form-label">Zerado em</label>
														<input
															autocomplete="off"
															autocorrect="off"
															autocapitalize="off"
															spellcheck="false"
															id="finished_at"
															type="date"
															class="form-input"
															bind:value={finishedAt}
															disabled={isLoading || !$isOnline || data.offline}
														/>
													</div>
												{/if}
												<div class="form-group flex flex-col gap-2">
													<label for="playtime" class="form-label">Horas de jogo</label>
													<input
														autocomplete="off"
														autocorrect="off"
														autocapitalize="off"
														spellcheck="false"
														id="playtime"
														type="number"
														class="form-input"
														bind:value={playTimeHours}
														disabled={isLoading || !$isOnline || data.offline}
													/>
												</div>
												<div class="form-group flex flex-col gap-2">
													<label for="rating" class="form-label">Nota</label>
													<select
														id="rating"
														class="form-input"
														bind:value={rating}
														disabled={isLoading || !$isOnline || data.offline}
													>
														<option value={0}>0</option>
														<option value={1}>1</option>
														<option value={2}>2</option>
														<option value={3}>3</option>
														<option value={4}>4</option>
														<option value={5}>5</option>
														<option value={6}>6</option>
														<option value={7}>7</option>
														<option value={8}>8</option>
														<option value={9}>9</option>
														<option value={10}>10</option>
													</select>
												</div>
												<div class="md:col-span-2">
													<div class="form-group flex flex-col gap-2">
														<label for="personalNotes" class="form-label">Anotações pessoais</label>
														<textarea
															bind:this={personalNotesElement}
															id="personalNotes"
															class="form-input min-h-[16rem] resize-none p-4 text-justify"
															autocomplete="off"
															autocapitalize="off"
															spellcheck="false"
															bind:value={personalNotes}
															readonly={isLoading || !$isOnline || data.offline}
														></textarea>
													</div>
												</div>
											</div>
											<div class="mt-6 flex flex-col gap-4 md:flex-row">
												<button
													type="submit"
													class="btn-primary w-full flex-1 md:w-auto"
													disabled={isLoading || !$isOnline || data.offline}
												>
													{isLoading ? 'Salvando...' : 'Salvar Alterações'}
												</button>
												<button
													type="button"
													class="btn-danger w-full flex-1 md:w-auto"
													onclick={(e) => {
														e.preventDefault();
														handleRemove();
													}}
													disabled={isLoading || !$isOnline || data.offline}
												>
													Remover
												</button>
											</div>
											<p class="mt-4 text-center text-sm text-white/50">
												Adicionado ao catálogo em: {addedAt}
											</p>
										</form>
									{/if}
								{:else}
									<p
										class="rounded-lg bg-black/20 p-4 text-center text-white/60"
									>
										Faça login para gerenciar seu catálogo.
									</p>
								{/if}
							</div>
						</section>

						<section class="card rounded-xl border border-white/10 bg-custom-dark">
							<div class="card-body p-6">
								<h2
									class="card-title mb-6 border-b-2 border-custom-blue pb-3 text-2xl font-bold text-white"
								>
									Sumário
								</h2>
								<p class="card-text text-justify leading-relaxed text-white/80">{game.summary}</p>
							</div>
						</section>
					</div>

					<div class="lg:col-span-4">
						<section class="card rounded-xl border border-white/10 bg-custom-dark">
							<div class="card-body p-6">
								<h2
									class="card-title mb-6 border-b-2 border-custom-blue pb-3 text-2xl font-bold text-white"
								>
									Detalhes
								</h2>
								<div class="metadata-item mb-4 flex flex-col gap-1">
									<strong
										class="text-sm font-medium uppercase tracking-wider text-white/60"
										>Plataformas:</strong
									>
									<span class="text-lg text-white">{game.platforms}</span>
								</div>
								<div class="metadata-item mb-4 flex flex-col gap-1">
									<strong
										class="text-sm font-medium uppercase tracking-wider text-white/60"
										>Desenvolvedora:</strong
									>
									<span class="text-lg text-white">{game.developer}</span>
								</div>
								<div class="metadata-item flex flex-col gap-1">
									<strong
										class="text-sm font-medium uppercase tracking-wider text-white/60"
										>Publicadora:</strong
									>
									<span class="text-lg text-white">{game.publisher}</span>
								</div>
							</div>
						</section>
					</div>
				</div>
			</main>
		</div>
	{:else if data?.error}
		<div class="feedback-container grid min-h-[80vh] place-content-center text-white">
			<h1>Erro ao carregar</h1>
			<p>{data.error}</p>
		</div>
	{:else}
		<div class="feedback-container grid min-h-[80vh] place-content-center text-white">
			<p>Carregando...</p>
		</div>
	{/if}
</div>

<style>
	.form-input,
	select {
		background-color: #2c2c2c;
		border: 1px solid #4a4a4a;
		border-radius: 8px;
		height: 3rem;
		width: 100%;
		font-size: 1rem;
		padding: 0.5rem;
		transition: all 0.3s ease;
		margin-bottom: 0.7rem;
	}
	.form-input:hover,
	select:hover {
		border-color: #0b428b;
		box-shadow: 0.1rem 0.1rem 0.1rem 0.1rem #0056b3;
		transform: translateY(-4px);
	}
	.form-input:focus,
	select:focus {
		color: white;
		background-color: #2c2c2c;
		border-color: #0b428b;
		box-shadow: 0.3rem 0.3rem 0.3rem 0.3rem #0b428b6b;
		outline: none;
	}

	textarea.form-input {
		text-align: justify !important;
		padding: 0.9rem;
		height: auto;
		resize: none !important;
		min-height: 16rem;
	}

	select {
		text-align: center;
		color-scheme: dark;
	}
	option {
		text-align: center;
	}

	.btn-primary {
		padding: 0.8rem;
		background-color: #0b428b;
		color: #ffffff;
		border: none;
		border-radius: 8px;
		font-size: 1rem;
		font-weight: bold;
		cursor: pointer;
		text-transform: uppercase;
		letter-spacing: 1px;
		transition: all 0.3s ease;
		margin-top: 1rem;
	}
	.btn-primary:hover {
		background-color: #0d52ac;
		border-color: #0b428b;
		box-shadow: 0.3rem 0.3rem 0.3rem 0.3rem #0b428b6b;
		transform: translateY(-2px);
	}

	.btn-danger {
		padding: 0.8rem;
		background-color: #b90707;
		color: #ffffff;
		border: none;
		border-radius: 8px;
		font-size: 1rem;
		font-weight: bold;
		cursor: pointer;
		text-transform: uppercase;
		letter-spacing: 1px;
		transition: all 0.3s ease;
		margin-top: 1rem;
	}
	.btn-danger:hover {
		background-color: #910606;
		border-color: #790303;
		box-shadow: 0.3rem 0.3rem 0.3rem 0.3rem #630202;
		transform: translateY(-2px);
	}

	button:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}
	button:disabled:hover {
		transform: translateY(0);
		box-shadow: none;
	}

    .hero-cover:hover {
        transform: translate(5px, -10px);
        box-shadow: 4px 4px 4px #0b428b;
    }
</style>