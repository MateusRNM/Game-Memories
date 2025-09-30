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

<div class="container text-center">
    <div id="topLogo" class="row">
        <div id="logo">
            <img src={logo} alt="">
        </div>
        <h3>Game <span style="color:#0B428B;">Memories</span></h3> 
    </div>

    <div id="buttonsContainer" class="row">
        <button class="tabBtn" style={`color: ${pageState == 0 ? "#0B428B" : "white"}; border-color: ${pageState == 0 ? "#0B428B" : "white"};`} onclick={() => pageState = 0}>Logar</button>
        <button class="tabBtn" style={`color: ${pageState == 1 ? "#0B428B" : "white"}; border-color: ${pageState == 1 ? "#0B428B" : "white"};`} onclick={() => pageState = 1}>Cadastrar</button>
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
                <a href="/esqueci-senha">Esqueceu sua senha?</a>
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
        font-family: 'Oswald';
    }
    @font-face {
		font-family: 'Adumu';
		src: url('../lib/assets/fonts/Adumu.ttf');
	}
    @font-face {
		font-family: 'Oswald';
		src: url('../lib/assets/fonts/Oswald.ttf');
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
        border: 0.25rem solid black;
        border-radius: 6px;
        height: 2rem;
        color: black;
        width: 20rem;
        font-size: 1.1rem;
        padding: 0.2rem;
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
        border-bottom: 0.25rem solid white;
        width:8rem;
        font-size: 1.25rem;
        text-align: center;
    }
    .submitButton {
        border: none;
        width: 6rem;
        height: 3rem;
        border-radius: 10px;
        background-color: #0B428B;
        font-size: 1rem;
        margin-top: 2rem;
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
        object-fit: cover;
        width: 100%;
        height: 100%;
    }
    .userInputs:focus {
        border-color: #0B428B;
        box-shadow: 0.3rem 0.3rem 0.3rem 0.3rem #0b428b6b;
    }   
    .submitButton:hover {
        border-color: #0B428B;
        box-shadow: 0.3rem 0.3rem 0.3rem 0.3rem #0b428b6b;
    }
</style>