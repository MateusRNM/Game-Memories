<script lang="ts">
	import { getRedirectBaseUrl } from '$lib/utils/url.js';

	let { data } = $props();
	const supabase = data.supabase;

	let email = $state('');
	let isLoading = $state(false);
	let message = $state('');
	let error = $state('');

	async function handlePasswordReset() {
		isLoading = true;
		message = '';
		error = '';
		try {
			const baseUrl: string = await getRedirectBaseUrl();
			const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
				redirectTo: `${baseUrl}/update-password/`
			});
			if (resetError) throw resetError;
			message = `Link para redefinição de senha enviado para ${email}. Verifique sua caixa de entrada e spam.`;
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
					<h2 class="card-title mb-4 text-center">Recuperar Senha</h2>
					<p class="text-white-50 mb-4 text-center">
						Digite seu e-mail abaixo. Enviaremos um link para você criar uma nova senha.
					</p>
					<form onsubmit={handlePasswordReset}>
						<div class="mb-3">
							<label for="email" class="form-label">E-mail</label>
							<input type="email" class="form-control" id="email" bind:value={email} required />
						</div>

						<div class="d-grid">
							<button type="submit" class="btn btn-primary btn-lg" disabled={isLoading}>
								{isLoading ? 'Enviando...' : 'Enviar Link de Recuperação'}
							</button>
						</div>
					</form>

					{#if error}
						<div class="alert alert-danger mt-4" style="color:black;">{error}</div>
					{/if}
					{#if message}
						<div class="alert alert-primary mt-4" style="color:black;">{message}</div>
					{/if}

					<div class="text-center mt-4">
						<a href="/" class="text-white-50">Voltar para o Login</a>
					</div>
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
