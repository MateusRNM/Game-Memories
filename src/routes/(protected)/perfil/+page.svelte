<script lang="ts">
	import { user } from "$lib/database/authStore";
	import { isOnline } from "$lib/database/networkStores";
    const { data } = $props();
</script> 

<div class="container py-4">
    {#if ($isOnline || !data.offline) && data.createdAt !== null}
        <div class="col text-center">
            <h2 class="mb-3">{$user?.user_metadata.username}</h2>
            <span>ID: {$user?.id}</span><br>
            <span>Email: {$user?.email}</span><br>
            <span>Data de criação da conta: {new Date(data?.createdAt).toLocaleDateString('pt-BR')}</span>
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
        font-family: 'Oswald';
        src: url('../../../lib/assets/fonts/Oswald.ttf');
    }
    * {
        color: white;
        font-family: 'Oswald';
    }
</style>