<script lang="ts">
	import Icon from '@iconify/svelte';
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

<div class="flex min-h-screen w-full items-center justify-center p-4 font-oswald">
	<div class="w-full max-w-md">
		<div class="rounded-xl border border-white/10 bg-black p-6 shadow-2xl md:p-8">
			<h2 class="mb-4 text-center text-3xl font-bold text-white">Recuperar Senha</h2>
			<p class="mb-6 text-center text-white/70">
				Digite seu e-mail abaixo. Enviaremos um link para você criar uma nova senha.
			</p>
			<form onsubmit={handlePasswordReset} class="space-y-6">
				<div>
					<label for="email" class="mb-2 block text-sm font-medium text-white/80">E-mail</label>
					<div class="relative">
						<input
							autocomplete="off"
							autocorrect="off"
							autocapitalize="off"
							spellcheck="false"
							type="email"
							class="form-input"
							id="email"
							bind:value={email}
							required
						/>
						<div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
							<Icon icon="bi:envelope-fill" class="text-white/40" />
						</div>
					</div>
				</div>

				<div class="grid">
					<button type="submit" class="submit-button" disabled={isLoading}>
						{isLoading ? 'Enviando...' : 'Enviar Link de Recuperação'}
					</button>
				</div>
			</form>

			{#if error}
				<div
					class="mt-4 flex items-center rounded-lg border border-red-300 bg-red-100 p-4 text-sm text-red-900"
					role="alert"
				>
					<Icon icon="bi:exclamation-triangle-fill" class="mr-3 text-lg" />
					{error}
				</div>
			{/if}
			{#if message}
				<div
					class="mt-4 flex items-center rounded-lg border border-blue-300 bg-blue-100 p-4 text-sm text-blue-900"
					role="alert"
				>
					<Icon icon="bi:check-circle-fill" class="mr-3 text-lg" />
					{message}
				</div>
			{/if}

			<div class="mt-6 text-center">
				<a href="/" class="to-login-link text-sm text-white/50 transition-colors duration-300 hover:text-white"
					>Voltar para o Login</a
				>
			</div>
		</div>
	</div>
</div>

<style>
	@font-face {
		font-family: 'mainFont';
		src: url('../../lib/assets/fonts/mainFont.ttf');
	}
	:global(body) {
		font-family: 'mainFont', sans-serif;
	}

	.form-input {
		color: white;
		background-color: #2c2c2c;
		border: 1px solid #4a4a4a;
		border-radius: 8px;
		height: 3rem;
		width: 100%;
		font-size: 1rem;
		padding: 0.5rem 0.5rem 0.5rem 2.5rem;
		transition: all 0.3s ease;
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

	.submit-button {
		width: 100%;
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
	.submit-button:hover {
		background-color: #0056b3;
		border-color: #0b428b;
		box-shadow: 0.3rem 0.3rem 0.3rem 0.3rem #0b428b6b;
		transform: translateY(-2px);
	}
	.submit-button:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}
	.submit-button:disabled:hover {
		transform: translateY(0);
		box-shadow: none;
		background-color: #0b428b;
	}
</style>