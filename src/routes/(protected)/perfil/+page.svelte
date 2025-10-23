<script lang="ts">
	import ConfirmToast from "$lib/components/ConfirmToast.svelte";
    import { auth, user } from "$lib/database/authStore";
	import { isOnline } from "$lib/database/networkStores";
	import { onMount } from "svelte";
    import * as bootstrap from "bootstrap";
    const { data } = $props();
    let username = $state($user?.user_metadata.username);
    let saving = $state(false);
    let confirmToast = $state(null);

    user.subscribe((user) => {
        username = user?.user_metadata.username;
    });

    async function update(){
        if(saving) return;
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

    function confirmDelete(){
        confirmToast.show();
    }

    onMount(() => {
        confirmToast = new bootstrap.Toast('#confirmToast');
    });
</script> 

<ConfirmToast msg={"Essa ação deletará sua conta completamente, e não será possível recuperá-la. Você confirma que deseja fazer isso?"} confirmMsg={"SIM"} action={() => auth.deleteUser(data.supabase)}/>

<div class="container py-4">
    {#if ($isOnline || !data.offline) && data.createdAt !== null}
        <div class="col text-center">
            <h2 class="mb-3">{$user?.user_metadata.username}</h2>
            <span>Email: {$user?.email}</span><br>
            <span>Data de criação da conta: {new Date(data?.createdAt).toLocaleDateString('pt-BR')}</span>
        </div>
        <div class="col text-center" style="margin-top:8rem;">
            <h3>Atualizar seu perfil:</h3>
            <div class="col text-center mt-4">
                <p>Nome de usuário:</p>
                <input autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" type="text" class="userInputs" bind:value={username}><br>
                <button class="submitButton" onclick={update} disabled={saving}>{saving ? "SALVANDO..." : "ATUALIZAR PERFIL"}</button>
            </div>
            <button class="deleteButton translate-middle-x" onclick={confirmDelete}>DELETAR PERFIL</button>
        </div>
    {:else}
        <div class="alert alert-warning d-flex align-items-center mb-4" role="alert">
            <i class="bi bi-wifi-off me-2" style="color:black;"></i>
            <div>
                <span style="color:black;">Você está em modo offline. Não é possível ver as informações do seu perfil.</span>
            </div>
        </div>
    {/if}
</div>

<style>
    @font-face {
        font-family: 'mainFont';
        src: url('../../../lib/assets/fonts/mainFont.ttf');
    }
    * {
        color: white;
        font-family: 'mainFont';
    }
    input {
        outline: none;
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
    .userInputs:hover {
        border-color: #0B428B;
        box-shadow: 0.1rem 0.1rem 0.1rem 0.1rem #0056b3;
        transform: translateY(-4px);
    }
    .userInputs:focus {
        border-color: #0B428B;
        box-shadow: 0.3rem 0.3rem 0.3rem 0.3rem #0b428b6b;
    }   
    .submitButton {
        width: 15rem;
        height: 3rem;
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
    .deleteButton {
        width: 15rem;
        height: 3rem;
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
        position: fixed;
        top: 90dvh;
    }
    .deleteButton:hover {
        background-color: #910606;
        border-color: #790303;
        box-shadow: 0.3rem 0.3rem 0.3rem 0.3rem #630202;
        transform: translate(-50%, -2px) !important;
    }
</style>