<script lang="ts">
    import { user } from '$lib/database/authStore';
    import { upsertGameInLibrary, removeGameFromLibrary } from '$lib/database/libraryService';
	import { isOnline } from '$lib/database/networkStores.js';
    import type { SupabaseClient } from '@supabase/supabase-js';

    let { data } = $props();
    
    let game = $state(data.game);
    let libraryEntry = $state(data.libraryEntry);
    const supabase: SupabaseClient = data.supabase;

    let status: number = $state(1);
    let platformPlaying: string | null = $state('');
    let startedAt: string = $state('');
    let finishedAt: string = $state('');
    let addedAt: string = $state('');
    let playTimeHours: string = $state('0');
    let rating: number = $state(5);
    let personalNotes: string = $state('');

    let isLoading: boolean = $state(false);

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
            playTimeHours = String(data.libraryEntry.playtime_hours) || '0',
            rating = data.libraryEntry.rating,
            personalNotes = data.libraryEntry.personal_notes
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
            const updatedEntry = await upsertGameInLibrary(supabase, {
                user_id: $user.id,
                game_id: game.id,
                status: status,
                platform_playing: platformPlaying,
                started_at: startedAt ? new Date(startedAt).toISOString() : null,
                finished_at: finishedAt ? new Date(finishedAt).toISOString() : null,
                playtime_hours: parseInt(playTimeHours),
                rating: rating,
                personal_notes: personalNotes,
                list_position: data.lastListPosition+1
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
        if (!libraryEntry?.id) return;
        if (!confirm('Tem certeza que deseja remover este jogo do seu catálogo?')) return;
        isLoading = true;

        try {
            await removeGameFromLibrary(supabase, libraryEntry.id);
            libraryEntry = null;
        } finally {
            isLoading = false;
        }
    }
</script>

<div class="page-background">
    {#if !$isOnline || data.offline}
        <div class="alert alert-warning d-flex align-items-center mb-4" role="alert">
            <i class="bi bi-wifi-off me-2" style="color:black;"></i>
            <div>
                <span style="color:black;">Você está em modo offline. Não será possível alterar nenhuma informação (modo leitura).</span>
            </div>
        </div>
    {/if}

    {#if game}
        <div class="details-page">
            <header class="hero-section text-white position-relative" style="background-image: url({game.cover_url?.replace('cover_big', 'screenshot_huge')})">
                <div class="hero-overlay position-absolute top-0 start-0 w-100 h-100"></div>
                <div class="container position-relative h-100">
                    <div class="row align-items-end h-100 pb-4 pb-md-5">
                        <div class="col-auto">
                            <img class="hero-cover img-fluid" src={game.cover_url} alt="Capa de {game.name}" />
                        </div>
                        <div class="col">
                            <h1 class="game-title display-4 fw-bold">{game.name}</h1>
                            <p class="release-year lead mb-0">{game.release_year}</p>
                        </div>
                    </div>
                </div>
            </header>

            <main class="container py-4 py-md-5">
                <div class="row g-4 g-lg-5">
                    <div class="col-lg-8">
                        <section class="card bg-dark-custom mb-4">
                            <div class="card-body">
                                <h2 class="card-title">Meu Catálogo</h2>
                                {#if $user}
                                    {#if libraryEntry === null}
                                        <div class="d-grid">
                                            <button class="btn btn-primary btn-lg" onclick={handleAdd} disabled={isLoading || !$isOnline || data.offline}>
                                                {isLoading ? 'Adicionando...' : 'Adicionar ao Catálogo'}
                                            </button>
                                        </div>
                                    {:else}
                                        <form onsubmit={(event) => {
                                                event.preventDefault();                                                
                                                handleUpsert();
                                            }} class="catalog-form">
                                            <div class="row g-3">
                                                <div class="col-md-6">
                                                    <label for="status" class="form-label">Status</label>
                                                    <select id="status" class="form-select" bind:value={status} disabled={isLoading || !$isOnline || data.offline}>
                                                        <option value={0}>Na Fila</option>
                                                        <option value={1}>Jogando</option>
                                                        <option value={2}>Zerado</option>
                                                        <option value={3}>Desistiu</option>
                                                    </select>
                                                </div>
                                                <div class="col-md-6">
                                                    <label for="platform" class="form-label">Plataforma Jogando</label>
                                                    <input autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" id="platform" type="text" class="form-control" placeholder="Ex: PC, PS5..." bind:value={platformPlaying} disabled={isLoading || !$isOnline || data.offline}>
                                                </div>
                                                {#if status !== 0}
                                                    <div class="col-md-6">
                                                        <label for="started_at" class="form-label">Começou a jogar em</label>
                                                        <input autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" id="started_at" type="date" class="form-control" bind:value={startedAt} disabled={isLoading || !$isOnline || data.offline}>
                                                    </div>
                                                {/if}
                                                {#if status === 2}
                                                    <div class="col-md-6">
                                                        <label for="finished_at" class="form-label">Zerado em</label>
                                                        <input autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" id="finished_at" type="date" class="form-control" bind:value={finishedAt} disabled={isLoading || !$isOnline || data.offline}>
                                                    </div>
                                                {/if}
                                                <div class="col-md-6">
                                                    <label for="started_at" class="form-label">Horas de jogo</label>
                                                    <input autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" id="started_at" type="numeric" class="form-control" bind:value={playTimeHours} disabled={isLoading || !$isOnline || data.offline}>
                                                </div>
                                                <div class="col-md-6">
                                                    <label for="status" class="form-label">Nota</label>
                                                    <select id="status" class="form-select" bind:value={rating} disabled={isLoading || !$isOnline || data.offline}>
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
                                                <div class="col-md-6">
                                                    <label for="status" class="form-label">Anotações pessoais</label>
                                                    <textarea class="form-control" bind:value={personalNotes}></textarea>
                                                </div>
                                            </div>
                                            <div class="d-flex gap-2 mt-4">
                                                <button type="submit" class="btn btn-primary flex-grow-1" disabled={isLoading || !$isOnline || data.offline}>
                                                    {isLoading ? 'Salvando...' : 'Salvar Alterações'}
                                                </button>
                                                <button type="button" class="btn btn-danger" onclick={handleRemove} disabled={isLoading || !$isOnline || data.offline}>
                                                    Remover
                                                </button>
                                            </div>
                                            <p class="text-white-50 text-center small mt-3 mb-0">Adicionado ao catálogo em: {addedAt}</p>
                                        </form>
                                    {/if}
                                {:else}
                                    <p class="login-prompt">Faça login para gerenciar seu catálogo.</p>
                                {/if}
                            </div>
                        </section>

                        <section class="card bg-dark-custom">
                            <div class="card-body">
                                <h2 class="card-title">Sumário</h2>
                                <p class="card-text">{game.summary}</p>
                            </div>
                        </section>
                    </div>

                    <div class="col-lg-4">
                        <section class="card bg-dark-custom">
                             <div class="card-body">
                                <h2 class="card-title">Detalhes</h2>
                                <div class="metadata-item">
                                    <strong>Plataformas:</strong>
                                    <span>{game.platforms}</span>
                                </div>
                                <div class="metadata-item">
                                    <strong>Desenvolvedora:</strong>
                                    <span>{game.developer}</span>
                                </div>
                                <div class="metadata-item">
                                    <strong>Publicadora:</strong>
                                    <span>{game.publisher}</span>
                                </div>
                            </div>
                        </section>
                    </div>
                </div>
            </main>
        </div>
    {:else if data?.error}
        <div class="feedback-container">
            <h1>Erro ao carregar</h1>
            <p>{data.error}</p>
        </div>
    {:else}
        <div class="feedback-container">
            <p>Carregando...</p>
        </div>
    {/if}
</div>

<style>
    @font-face {
        font-family: 'Oswald';
        src: url('../../../lib/assets/fonts/Oswald.ttf');
    }
    textarea {
        text-align: justify;
        padding: 0.2rem;
    }
    .page-background {
        font-family: 'Oswald', sans-serif;
        background: black;
        min-height: 100vh;
    }
    .hero-section {
        height: 60vh;
        min-height: 400px;
        max-height: 550px;
        background-size: cover;
        background-position: center 25%;
    }
    .hero-overlay {
        background: linear-gradient(to top, rgb(0, 0, 0) 10%, rgba(0, 0, 0, 0.7) 50%, rgba(0, 0, 0, 0) 100%);
    }
    .hero-cover {
        width: 180px;
        object-fit: cover;
        border-radius: 8px;
        border: 2px solid rgba(255, 255, 255, 0.1);
        box-shadow: 0 8px 30px rgba(0, 0, 0, 0.7);
        transition: transform 0.3s ease;
        position: relative;
    }
    .hero-cover::after {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        border-radius: 8px;
        background: radial-gradient(circle at 50% 50%, rgba(255,255,255,0.2), transparent 70%);
        opacity: 0;
        transition: opacity 0.3s ease;
    }
    .hero-cover:hover {
        transform: scale(1.05) translateY(-5px);
    }
    .hero-cover:hover::after {
        opacity: 1;
    }
    .game-title {
        text-shadow: 0 3px 8px rgba(0, 0, 0, 0.9);
        font-size: clamp(2rem, 6vw, 3.5rem);
    }
    .release-year {
        color: rgba(255, 255, 255, 0.7);
    }
    .card.bg-dark-custom {
        background-color: #2B2B2B;
        border: 1px solid rgba(255, 255, 255, 0.08);
        border-radius: 12px;
    }
    .card-title {
        color: white;
        border-bottom: 2px solid #0B428B;
        padding-bottom: 0.75rem;
        margin-bottom: 1.5rem;
    }
    .card-text {
        color: rgba(255, 255, 255, 0.8);
        line-height: 1.7;
    }
    .metadata-item {
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
    }
    .metadata-item strong {
        color: rgba(255, 255, 255, 0.6);
        font-size: 0.9rem;
        text-transform: uppercase;
        letter-spacing: 0.5px;
    }
    .metadata-item span {
        color: white;
        font-size: 1.1rem;
    }
    .form-label {
        color: rgba(255, 255, 255, 0.7);
        font-size: 0.9rem;
    }
    .form-control, .form-select {
        background-color: #3f3f3f;
        color: white;
        border: 1px solid rgba(255, 255, 255, 0.2);
        font-family: 'Oswald', sans-serif;
    }
    .form-control:focus, .form-select:focus {
        background-color: #3f3f3f;
        color: white;
        border-color: #0B428B;
        box-shadow: 0 0 0 0.25rem #0b428b6b;
    }
    .form-control::placeholder {
        color: rgba(255, 255, 255, 0.4);
    }
    .btn-primary {
        background-color: #0B428B;
        border-color: #0B428B;
        font-weight: bold;
        transition: all 0.2s ease;
    }
    .btn-primary:hover {
        background-color: #0d52ac;
        border-color: #0d52ac;
        transform: translateY(-2px);
        box-shadow: 0 4px 15px #0b428b80;
    }
    .btn-danger {
        background-color: #8b2323;
        border-color: #8b2323;
        transition: all 0.2s ease;
    }
    .btn-danger:hover {
        background-color: #a32a2a;
        border-color: #a32a2a;
    }
    button:disabled {
        opacity: 0.6;
        cursor: not-allowed;
        transform: translateY(0);
    }
    .login-prompt {
        text-align: center;
        color: rgba(255, 255, 255, 0.6);
        background-color: rgba(0,0,0,0.2);
        padding: 1rem;
        border-radius: 6px;
    }
    .feedback-container {
        display: grid;
        place-content: center;
        min-height: 80vh;
        color: white;
    }
    @media (max-width: 991.98px) {
        .card.bg-dark-custom {
            height: auto !important;
        }
    }
</style>