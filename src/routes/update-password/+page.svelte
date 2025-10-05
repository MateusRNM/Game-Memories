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
							<button type="submit" class="submitButton" disabled={isLoading}>
								{isLoading ? 'Salvando...' : 'Salvar Nova Senha'}
							</button>
						</div>
					</form>

					{#if error}
						<div class="alert alert-danger mt-4" style="color:black;">{error}</div>
					{/if}
					{#if message}
						<div class="alert alert-primary mt-4" style="color:black;">{message}</div>
					{/if}
				</div>
			</div>
		</div>
	</div>
</div>

<style>
	@font-face {
		font-family: 'mainFont';
		src: url('../../lib/assets/fonts/mainFont.ttf');
	}
	* {
		color: white;
		font-family: 'mainFont';
	}
	.bg-dark-custom {
		background-color: #2b2b2b;
	}
	.form-control {
		color: white;
		background-color: #2c2c2c; 
        border: 1px solid #4a4a4a;
        border-radius: 8px;
        height: 2rem;
        width: 100%;
        font-size: 1rem;
        padding: 0.5rem;
        transition: all 0.3s ease;
        margin-bottom: 0.7rem;
	}
	.form-control:hover {
		color: white;
		background-color: #2c2c2c;
		border-color: #0B428B;
        box-shadow: 0.1rem 0.1rem 0.1rem 0.1rem #0056b3;
        transform: translateY(-4px);
	}
	.form-control:focus {
		color: white;
		background-color: #2c2c2c;
		border-color: #0B428B;
        box-shadow: 0.3rem 0.3rem 0.3rem 0.3rem #0b428b6b;
	}
	.submitButton {
        width: 100%;
        padding: 0.8rem;
        background-color: #007bff;
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
	.submitButton:hover {
        background-color: #0056b3;
        border-color: #0B428B;
        box-shadow: 0.3rem 0.3rem 0.3rem 0.3rem #0b428b6b;
        transform: translateY(-2px);
    }
</style>
