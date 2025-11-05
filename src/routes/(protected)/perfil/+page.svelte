<script lang="ts">
	import ConfirmToast from '$lib/components/ConfirmToast.svelte';
	import { auth, user } from '$lib/database/authStore';
	import { isOnline } from '$lib/database/networkStores';
	import Icon from '@iconify/svelte';
	const { data } = $props();

	let username = $state($user?.user_metadata.username);
	let saving = $state(false);
	let confirmToastOpened: boolean = $state(false);

	$effect(() => {
        if(username == null && $user?.user_metadata.username != null){
            username = $user?.user_metadata.username;
        }
	});

	async function update() {
		if (saving) return;
		try {
			saving = true;
			const userRes = await data.supabase.auth.updateUser({
				data: {
					username: username
				}
			});
			user.set(userRes.data.user);
		} finally {
			saving = false;
		}
	}

	function confirmDelete() {
		confirmToastOpened = true;
	}

    async function handleSignOut() {
		try {
			await auth.signOut(data.supabase);
		} catch (error) {
			alert((error as Error).message);
		}
	}
</script>

<ConfirmToast
	msg={'Essa ação deletará sua conta completamente, e não será possível recuperá-la. Você confirma que deseja fazer isso?'}
	confirmMsg={'SIM'}
	action={() => auth.deleteUser(data.supabase)}
	bind:opened={confirmToastOpened}
/>

<div class="w-full max-w-7xl mx-auto px-4 py-8 font-oswald">
	{#if $isOnline || !data.offline}
		<div class="grid grid-cols-1 lg:grid-cols-12 gap-8">
			<div class="lg:col-span-8 space-y-8">
				<section class="card rounded-xl border border-white/10 bg-black">
					<div class="card-body p-6">
						<h2 class="card-title mb-6 border-b-2 border-blue-900 pb-3 text-2xl font-bold text-white">
							Atualizar Perfil
						</h2>
						<form onsubmit={update} class="space-y-6">
							<div class="form-group flex flex-col gap-2">
								<label for="username" class="form-label text-center text-sm font-medium uppercase tracking-wider text-white/70"
									>Nome de usuário</label
								>
								<input
									autocomplete="off"
									autocorrect="off"
									autocapitalize="off"
									spellcheck="false"
									type="text"
									class="form-input"
									bind:value={username}
								/>
							</div>
							<button type="submit" class="btn-primary w-full" disabled={saving}>
								{saving ? 'SALVANDO...' : 'ATUALIZAR PERFIL'}
							</button>
						</form>
					</div>
				</section>
			</div>

			<div class="lg:col-span-4 space-y-8">
				<section class="card rounded-xl border border-white/10 bg-black">
					<div class="card-body p-6">
						<h2 class="card-title mb-6 border-b-2 border-blue-900 pb-3 text-2xl font-bold text-white">
							Minha Conta
						</h2>
						<div class="space-y-4">
							<div class="metadata-item">
								<strong>Nome de Usuário:</strong>
								<span>{$user?.user_metadata.username}</span>
							</div>
							<div class="metadata-item">
								<strong>Email:</strong>
								<span>{$user?.email}</span>
							</div>
							{#if data.createdAt}
								<div class="metadata-item">
									<strong>Conta Criada Em:</strong>
									<span>{new Date(data?.createdAt).toLocaleDateString('pt-BR')}</span>
								</div>
							{/if}
                            <div class="mb-6 border-b-2 border-blue-900 pb-3"></div>
                            	<button
                                    onclick={handleSignOut}
                                    class="mt-3 flex w-full items-center gap-3 rounded-lg px-3 py-3 text-red-500/70 transition-colors hover:bg-red-500/10 hover:text-red-500 hover:cursor-pointer"
                                >
                                <Icon icon="bi:box-arrow-right" class="text-2xl" />
                                <span class="text-lg">Sair (Logout)</span>
                            </button>
						</div>
					</div>
				</section>

				<section class="card rounded-xl border border-red-700/50 bg-red-900/20">
					<div class="card-body p-6">
						<h2
							class="card-title mb-6 border-b-2 border-red-700/50 pb-3 text-2xl font-bold text-red-400"
						>
							Zona de Perigo
						</h2>
						<p class="text-white/70">
							Esta ação é irreversível e deletará todos os seus dados do catálogo permanentemente.
						</p>
						<button class="btn-danger mt-4 w-full" onclick={confirmDelete}>
							DELETAR PERFIL
						</button>
					</div>
				</section>
			</div>
		</div>
	{:else}
		<div
			class="col-span-full mb-4 flex items-center rounded-lg border border-yellow-300 bg-yellow-100 p-4 text-yellow-900"
			role="alert"
		>
			<Icon icon="bi:wifi-off" class="text-2xl mr-3" />
			<div>
				<span class="font-bold">Você está em modo offline.</span>
				Não é possível ver as informações do seu perfil.
			</div>
		</div>
	{/if}
</div>

<style>
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
		word-break: break-all;
	}

	.form-input {
		color: white;
		background-color: #2c2c2c;
		border: 1px solid #4a4a4a;
		border-radius: 8px;
		height: 3rem;
		width: 100%;
		font-size: 1rem;
		padding: 0.5rem;
		transition: all 0.3s ease;
		margin-bottom: 0.7rem;
		text-align: center;
	}
	.form-input:hover {
		border-color: #0b428b;
		box-shadow: 0.1rem 0.1rem 0.1rem 0.1rem #0056b3;
		transform: translateY(-4px);
	}
	.form-input:focus {
		color: white;
		background-color: #2c2c2c;
		border-color: #0b428b;
		box-shadow: 0.3rem 0.3rem 0.3rem 0.3rem #0b428b6b;
		outline: none;
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
</style>