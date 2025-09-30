<script lang="ts">
	import { page } from '$app/state';
	import { auth } from '$lib/database/authStore';
    import { user } from '$lib/database/authStore';
	let { supabase } = $props();

	async function handleSignOut() {
		try {
			await auth.signOut(supabase);
		} catch (error) {
			alert((error as Error).message);
		}
	}
</script>

<nav class="sidebar d-flex flex-column flex-shrink-0 p-3">
	<a href="/" class="d-flex align-items-center mb-3 mb-md-0 me-md-auto text-white text-decoration-none">
		<span class="fs-4 sidebar-text">Gaming <span style="color:#0B428B;">Memories</span></span>
	</a>
	<hr />
	<ul class="nav nav-pills flex-column mb-auto">
		<li class="nav-item">
			<a
				href="/searchGames"
				class="nav-link text-white"
				class:active={page.url.pathname.startsWith('/searchGames')}
			>
				<i class="bi bi-search me-2"></i>
				<span class="sidebar-text">Pesquisar Jogos</span>
			</a>
		</li>
		<li>
			<a
				href="/catalogo"
				class="nav-link text-white"
				class:active={page.url.pathname.startsWith('/catalogo')}
			>
				<i class="bi bi-collection me-2"></i>
				<span class="sidebar-text">Catálogo</span>
			</a>
		</li>
	</ul>
	<hr />
	<div class="dropdown">
		<a
			href="#"
			class="d-flex align-items-center text-white text-decoration-none dropdown-toggle"
			data-bs-toggle="dropdown"
			aria-expanded="false"
		>
			<img
				src="https://placehold.co/100x100/2B2B2B/FFFFFF?text=U"
				alt=""
				width="32"
				height="32"
				class="rounded-circle me-2"
			/>
			<strong class="sidebar-text">{$user?.user_metadata.username}</strong>
		</a>
		<ul class="dropdown-menu dropdown-menu-dark text-small shadow">
			<li><a class="dropdown-item" href="/perfil">Perfil</a></li>
			<li><hr class="dropdown-divider" /></li>
			<li>
				<button class="dropdown-item" onclick={handleSignOut}>Sair (Logout)</button>
			</li>
		</ul>
	</div>
</nav>

