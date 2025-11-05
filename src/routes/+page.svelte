<script lang="ts">
	import logo from '$lib/assets/images/GameMemoriesLogo.png';
	import { auth } from '$lib/database/authStore';
	import Icon from '@iconify/svelte';

	let { data } = $props();

	let pageState: number = $state(0);
	let username: string = $state('');
	let email: string = $state('');
	let password: string = $state('');
	let errorMsg: string = $state('');

	function handleError(error: any): string {
		switch (error.status) {
			case 400:
				if (error.message.includes('User already registered')) {
					return 'Este e-mail já está cadastrado. Tente fazer login.';
				}
				if (error.message.includes('Password should be at least')) {
					return 'Sua senha precisa ter pelo menos 6 caracteres.';
				}
				if (error.message.includes('Unable to validate email address: invalid format')) {
					return 'Email inválido.';
				}
				return 'Por favor, verifique os dados informados.';
			case 401:
				if (error.message.includes('Email not confirmed')) {
					return 'Seu e-mail ainda não foi confirmado. Verifique sua caixa de entrada.';
				}
				return 'E-mail ou senha inválidos.';
			case 422:
				if (error.message.includes('Password should be at least 6 characters.')) {
					return 'Sua senha deve ter no mínimo 6 caracteres.';
				}
				return 'Revise os dados.';
			case 429:
				return 'Muitas tentativas. Por favor, aguarde um momento.';
			default:
				return 'Ocorreu um erro inesperado. Tente novamente.';
		}
	}

	async function logar(): Promise<void> {
		if (email === '' || password === '') {
			errorMsg = 'Preencha todos os campos.';
			return;
		}
		errorMsg = '';
		try {
			await auth.signIn(data.supabase, email, password);
		} catch (error) {
			errorMsg = handleError(error);
		}
	}

	async function cadastrar(): Promise<void> {
		if (email === '' || password === '' || username === '') {
			errorMsg = 'Preencha todos os campos.';
			return;
		}
		errorMsg = '';
		try {
			await auth.signUp(data.supabase, email, password, username);
		} catch (error) {
			errorMsg = handleError(error);
		}
	}
</script>

<div class="flex min-h-screen w-full items-center justify-center p-4 font-oswald">
	<div
		class="w-full max-w-sm rounded-xl border border-gray-800 bg-[#1a1a1a] shadow-2xl transition-all duration-300 hover:shadow-blue-900"
	>
		<div class="flex flex-col items-center justify-center p-6">
			<img src={logo} alt="Game Memories Logo" class="h-12 w-20 object-contain" />
			<h3 class="mt-2 text-2xl text-white">
				Game <span class="text-blue-900">Memories</span>
			</h3>
		</div>

		<div class="flex w-full">
			<button
				class="w-full border-b-2 py-2.5 font-medium transition-colors duration-300"
				class:border-blue-900={pageState === 0}
				class:text-blue-900={pageState === 0}
				class:border-gray-700={pageState !== 0}
				class:text-gray-500={pageState !== 0}
				class:hover:text-white={pageState !== 0}
				onclick={() => (pageState = 0)}>Logar</button
			>
			<button
				class="w-full border-b-2 py-2.5 font-medium transition-colors duration-300"
				class:border-blue-900={pageState === 1}
				class:text-blue-900={pageState === 1}
				class:border-gray-700={pageState !== 1}
				class:text-gray-500={pageState !== 1}
				class:hover:text-white={pageState !== 1}
				onclick={() => (pageState = 1)}>Cadastrar</button
			>
		</div>

		<div class="p-6">
			{#if pageState === 0}
				<form onsubmit={logar} class="space-y-4">
					<div>
						<label for="email-login" class="mb-2 block text-sm font-medium text-white/70"
							>Email:</label
						>
						<div class="relative">
							<input
								autocomplete="off"
								autocorrect="off"
								autocapitalize="off"
								spellcheck="false"
								type="email"
								id="email-login"
								class="form-input"
								bind:value={email}
							/>
							<div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
								<Icon icon="bi:envelope-fill" class="text-white/40" />
							</div>
						</div>
					</div>
					<div>
						<label for="password-login" class="mb-2 block text-sm font-medium text-white/70"
							>Senha:</label
						>
						<div class="relative">
							<input
								autocomplete="off"
								autocorrect="off"
								autocapitalize="off"
								spellcheck="false"
								type="password"
								id="password-login"
								class="form-input"
								bind:value={password}
							/>
							<div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
								<Icon icon="bi:lock-fill" class="text-white/40" />
							</div>
						</div>
						<div class="mt-2 text-right">
							<a href="/esqueci-senha" class="password-forgot">Esqueceu sua senha?</a>
						</div>
					</div>

					{#if errorMsg !== ''}
						<p class="rounded-lg border border-red-700 bg-red-900/50 p-3 text-center text-red-300">
							{errorMsg}
						</p>
					{/if}

					<button type="submit" class="submit-button">Logar</button>
				</form>
			{:else}
				<form onsubmit={cadastrar} class="space-y-4">
					<div>
						<label for="username-signup" class="mb-2 block text-sm font-medium text-white/70"
							>Nome de usuário:</label
						>
						<div class="relative">
							<input
								autocomplete="off"
								autocorrect="off"
								autocapitalize="off"
								spellcheck="false"
								type="text"
								id="username-signup"
								class="form-input"
								bind:value={username}
							/>
							<div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
								<Icon icon="bi:person-fill" class="text-white/40" />
							</div>
						</div>
					</div>
					<div>
						<label for="email-signup" class="mb-2 block text-sm font-medium text-white/70"
							>Email:</label
						>
						<div class="relative">
							<input
								autocomplete="off"
								autocorrect="off"
								autocapitalize="off"
								spellcheck="false"
								type="email"
								id="email-signup"
								class="form-input"
								bind:value={email}
							/>
							<div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
								<Icon icon="bi:envelope-fill" class="text-white/40" />
							</div>
						</div>
					</div>
					<div>
						<label for="password-signup" class="mb-2 block text-sm font-medium text-white/70"
							>Senha:</label
						>
						<div class="relative">
							<input
								autocomplete="off"
								autocorrect="off"
								autocapitalize="off"
								spellcheck="false"
								type="password"
								id="password-signup"
								class="form-input"
								bind:value={password}
							/>
							<div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
								<Icon icon="bi:lock-fill" class="text-white/40" />
							</div>
						</div>
					</div>

					{#if errorMsg !== ''}
						<p class="rounded-lg border border-red-700 bg-red-900/50 p-3 text-center text-red-300">
							{errorMsg}
						</p>
					{/if}

					<button type="submit" class="submit-button">Cadastrar</button>
				</form>
			{/if}
		</div>
	</div>
</div>

<style>
	.form-input {
		background-color: #2c2c2c;
		border: 1px solid #4a4a4a;
		border-radius: 8px;
		height: 3rem;
		color: white;
		width: 100%;
		font-size: 1rem;
		padding-left: 2.5rem;
		padding-right: 0.75rem;
		transition: all 0.3s ease;
	}
	.form-input:hover {
		border-color: #0b428b;
		box-shadow: 0.1rem 0.1rem 0.1rem 0.1rem #0056b3;
		transform: translateY(-4px);
	}
	.form-input:focus {
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
		opacity: 0.5;
		cursor: not-allowed;
	}
	.submit-button:disabled:hover {
		transform: translateY(0);
		box-shadow: none;
		background-color: #0b428b;
	}

	.password-forgot {
		color: #aaaaaa;
		text-decoration: none;
		font-size: 0.9rem;
		transition: color 0.3s ease;
	}
	.password-forgot:hover {
		color: #0b428b;
		text-decoration: underline;
	}
</style>