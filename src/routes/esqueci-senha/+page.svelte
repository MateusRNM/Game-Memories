<script lang="ts">
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
			const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
				redirectTo: `https://dazzling-melba-f05859.netlify.app/`
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
							<input
								autocomplete="off"
								autocorrect="off"
								autocapitalize="off"
								spellcheck="false"
								type="email"
								class="form-control"
								id="email"
								bind:value={email}
								required
							/>
						</div>

						<div class="d-grid">
							<button type="submit" class="submitButton" disabled={isLoading}>
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
						<a href="/" class="toLogin">Voltar para o Login</a>
					</div>
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
	.toLogin {
        color: #aaaaaa;
        text-decoration: none;
        font-size: 0.9rem;
        transition: color 0.3s ease;
    }
    .toLogin:hover {
        color: #007bff; 
        text-decoration: underline;
    }
</style>
