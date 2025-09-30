<script lang="ts">
	import { goto } from '$app/navigation';

	let { data } = $props();
	const supabase = data.supabase;

	let newPassword = $state('');
	let confirmPassword = $state('');
	let isLoading = $state(false);
	let message = $state('');
	let error = $state('');

	async function handleUpdatePassword() {
		if (newPassword !== confirmPassword) {
			error = 'As senhas não coincidem.';
			return;
		}
		if (newPassword.length < 6) {
			error = 'A nova senha deve ter pelo menos 6 caracteres.';
			return;
		}

		isLoading = true;
		error = '';
		message = '';
		try {
			const { error: updateError } = await supabase.auth.updateUser({
				password: newPassword
			});
			if (updateError) throw updateError;
			message = 'Senha atualizada com sucesso! Redirecionando para o login...';
			setTimeout(() => goto('/'), 3000);
		} catch (err) {
			error = (err as Error).message;
		} finally {
			isLoading = false;
		}
	}
</script>

<div class="container py-5">
	<div class="row justify-content-center">
		<div class="col-md-6 col-lg-5">
			<div class="card bg-dark-custom text-white border-secondary">
				<div class="card-body p-4 p-md-5">
					<h2 class="card-title mb-4 text-center">Crie sua Nova Senha</h2>
					<form onsubmit={handleUpdatePassword}>
						<div class="mb-3">
							<label for="newPassword" class="form-label">Nova Senha</label>
							<input
								autocomplete="off"
								autocorrect="off"
								autocapitalize="off"
								spellcheck="false"
								type="password"
								class="form-control"
								id="newPassword"
								bind:value={newPassword}
								required
							/>
						</div>
						<div class="mb-4">
							<label for="confirmPassword" class="form-label">Confirmar Nova Senha</label>
							<input
								autocomplete="off"
								autocorrect="off"
								autocapitalize="off"
								spellcheck="false"
								type="password"
								class="form-control"
								id="confirmPassword"
								bind:value={confirmPassword}
								required
							/>
						</div>

						<div class="d-grid">
							<button type="submit" class="btn btn-primary btn-lg" disabled={isLoading}>
								{isLoading ? 'Salvando...' : 'Salvar Nova Senha'}
							</button>
						</div>
					</form>

					{#if error}
						<div class="alert alert-danger mt-4">{error}</div>
					{/if}
					{#if message}
						<div class="alert alert-success mt-4">{message}</div>
					{/if}
				</div>
			</div>
		</div>
	</div>
</div>

<style>
	@font-face {
		font-family: 'Oswald';
		src: url('../../lib/assets/fonts/Oswald.ttf');
	}
	* {
		color: white;
		font-family: 'Oswald';
	}
	.bg-dark-custom {
		background-color: #2b2b2b;
	}
	.form-control {
		background-color: #3f3f3f;
		color: white;
		border-color: rgba(255, 255, 255, 0.2);
	}
	.form-control:focus {
		background-color: #3f3f3f;
		color: white;
		border-color: #0b428b;
		box-shadow: 0 0 0 0.25rem #0b428b6b;
	}
	.btn-primary {
		background-color: #0b428b;
		border-color: #0b428b;
	}
</style>
