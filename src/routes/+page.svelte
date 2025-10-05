<script lang="ts">
    import logo from "$lib/assets/images/GameMemoriesLogo.png";
	import { auth } from "$lib/database/authStore";

    let { data } = $props();

    let pageState: number = $state(0);
    let username: string = $state("");
    let email: string = $state("");
    let password: string = $state("");
    let errorMsg: string = $state("");

    function handleError(error: any): string {
        switch (error.status) {
            case 400:
                if (error.message.includes('User already registered')) {
                    return 'Este e-mail já está cadastrado. Tente fazer login.';
                }
                if (error.message.includes('Password should be at least')) {
                    return 'Sua senha precisa ter pelo menos 6 caracteres.';
                }
                if(error.message.includes('Unable to validate email address: invalid format')){
                    return "Email inválido.";                    
                }
                return 'Por favor, verifique os dados informados.';
            case 401:
                if (error.message.includes('Email not confirmed')) {
                    return 'Seu e-mail ainda não foi confirmado. Verifique sua caixa de entrada.';
                }
                return 'E-mail ou senha inválidos.';
            case 422:
                if(error.message.includes("Password should be at least 6 characters.")){
                    return "Sua senha deve ter no mínimo 6 caracteres.";
                }
                return "Revise os dados.";
            case 429:
                return 'Muitas tentativas. Por favor, aguarde um momento.';
            default:
                return 'Ocorreu um erro inesperado. Tente novamente.';
        }
    }

    async function logar(): Promise<void> {
        if(email === "" || password === "") {
            errorMsg = "Preencha todos os campos.";
            return;
        }
        errorMsg = "";
        try {
            await auth.signIn(data.supabase, email, password);
        } catch(error) {
            errorMsg = handleError(error);
        }
    }

    async function cadastrar(): Promise<void> {
        if(email === "" || password === "" || username === "") {
            errorMsg = "Preencha todos os campos.";
            return;
        }
        errorMsg = "";
        try {
            await auth.signUp(data.supabase, email, password, username);
        } catch(error) {
            errorMsg = handleError(error);
        }
    }
</script>

<div class="container text-center page-container">
    <div id="topLogo" class="row">
        <div id="logo">
            <img src={logo} alt="">
        </div>
        <h3>Game <span style="color:#0B428B;">Memories</span></h3> 
    </div>

    <div id="buttonsContainer" class="row">
        <button class="tabBtn" style={`color: ${pageState == 0 ? "#0B428B" : "#888888"}; border-color: ${pageState == 0 ? "#0B428B" : "#888888"};`} onclick={() => pageState = 0}>Logar</button>
        <button class="tabBtn" style={`color: ${pageState == 1 ? "#0B428B" : "#888888"}; border-color: ${pageState == 1 ? "#0B428B" : "#888888"};`} onclick={() => pageState = 1}>Cadastrar</button>
    </div>

    <div class="col" id="content">
        {#if pageState == 0}
            <div class="col">
                <p>Email:</p>
                <input autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" type="email" class="userInputs" bind:value={email}>
            </div>

            <div class="col">
                <p>Senha:</p>
                <input autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" type="password" class="userInputs" bind:value={password}><br>
                <a href="/esqueci-senha" class="password-forgot">Esqueceu sua senha?</a>
            </div>

            {#if errorMsg !== ""}<p style="color:red; font-size: 1.25rem;">{errorMsg}</p>{/if}

            <button class="submitButton" onclick={logar}>Logar</button>
        {:else}
            <div class="col">
                <p>Nome de usuário:</p>
                <input autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" type="text" class="userInputs" bind:value={username}>
            </div>

            <div class="col">
                <p>Email:</p>
                <input autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" type="email" class="userInputs" bind:value={email}>
            </div>

            <div class="col">
                <p>Senha:</p>
                <input autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" type="password" class="userInputs" bind:value={password}>
            </div>

            {#if errorMsg !== ""}<p style="color:red; font-size: 1.25rem;">{errorMsg}</p>{/if}

            <button class="submitButton" onclick={cadastrar}>Cadastrar</button>
        {/if}
    </div>
</div>

<style>
    * {
        color: white;
        font-family: 'mainFont';
    }
    @font-face {
		font-family: 'Adumu';
		src: url('../lib/assets/fonts/Adumu.ttf');
	}
    @font-face {
		font-family: 'mainFont';
		src: url('../lib/assets/fonts/mainFont.ttf');
	}

    h3 {
        font-family: 'Adumu';
        font-size: 1.5rem;
        margin-left: 0.5rem;
    }
    button {
        outline: none;
    }
    input {
        outline: none;
    }
    a {
        color: #0B428B;
    }
    .userInputs {
        background-color: #2c2c2c; 
        border: 1px solid #4a4a4a;
        border-radius: 8px;
        height: 2rem;
        color: white;
        width: 20rem;
        font-size: 1rem;
        padding: 0.5rem;
        transition: all 0.3s ease;
        margin-bottom: 0.7rem;
    }
    #content {
        flex-grow: 4;
        align-items: center;
        justify-content: center;
        padding-top: 2rem;
    }
    #buttonsContainer {
        flex-grow: 2;
        align-items: center;
        justify-content: center;
    }
    .tabBtn {
        background: none;
        border: none;
        border-bottom: 0.25rem solid #888888;
        width:8rem;
        font-size: 1.25rem;
        text-align: center;
        transition: all 0.3s ease;
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
    #topLogo {
        position: relative;
        padding: 0.5rem;
        flex-grow: 1;
        align-items: center;
        justify-content: center;
    }
    #logo {
        width: 5rem;
        height: 3rem;
    }
    img {
        object-fit: contain;
        width: 100%;
        height: 100%;
    }
    .userInputs:hover {
        border-color: #0B428B;
        box-shadow: 0.1rem 0.1rem 0.1rem 0.1rem #0056b3;
        transform: translateY(-4px);
    }
    .userInputs:focus {
        border-color: #0B428B;
        box-shadow: 0.3rem 0.3rem 0.3rem 0.3rem #0b428b6b;
    }   
    .submitButton:hover {
        background-color: #0056b3;
        border-color: #0B428B;
        box-shadow: 0.3rem 0.3rem 0.3rem 0.3rem #0b428b6b;
        transform: translateY(-2px);
    }
    .page-container {
        background-color: #1a1a1a;
        padding-top: 1rem;
        padding-bottom: 1rem;
        border-radius: 1rem; 
        box-shadow: 0 8px 30px rgba(0, 0, 0, 0.5); 
        width: 96%;
        max-width: 25rem;
        border: 1px solid #2c2c2c;
        transition: all 0.3s ease;
        margin-top: 1rem;
        position: absolute;
        left: 50%;
        top: 50%;
        transform: translate(-50%, -50%);
    }
    .page-container:hover {
        box-shadow: 0.3rem 0.3rem 0.3rem 0.3rem #0b428b6b;
        transform: translate(-50%, -52%);
    }
    .password-forgot {
        color: #aaaaaa;
        text-decoration: none;
        font-size: 0.9rem;
        transition: color 0.3s ease;
    }
    .password-forgot:hover {
        color: #007bff; 
        text-decoration: underline;
    }
</style>