<script>
	import { fly } from 'svelte/transition';
	let { msg, action } = $props();
</script>

<div data-bs-autohide={false} id="confirmToast" class="toast position-fixed top-50 start-50 translate-middle" role="alert" aria-live="assertive" aria-atomic="true" transition:fly={{ y: -50, duration: 300 }} style="z-index: 9999;">
  <div class="toast-body">
    {msg}
    <div class="col m-2 border-top text-center">
        <button type="button" class="btn btn-primary" data-bs-dismiss="toast">CANCELAR</button>
        <button type="button" class="btn btn-danger" data-bs-dismiss="toast" onclick={action}>REMOVER</button>
    </div>
  </div>
</div>

<style>
    .toast {
        background-color: #1a1a1a;
        padding-top: 1rem;
        padding-bottom: 1rem;
        border-radius: 1rem; 
        box-shadow: 0 8px 30px rgba(0, 0, 0, 0.5); 
        border: 1px solid #2c2c2c;
        transition: all 0.3s ease;
        margin-top: 1rem;
        width: 30rem;
    }
    .toast-body {
        font-size: 1rem;
    }
    .btn-primary {
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
    .btn-primary:hover {
        background-color: #0056b3;
        border-color: #0B428B;
        box-shadow: 0.3rem 0.3rem 0.3rem 0.3rem #0b428b6b;
        transform: translateY(-2px);
    }
    .btn-danger {
        width: 50%;
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
        margin-top: 6rem;
    }
    .btn-danger:hover {
        background-color: #910606;
        border-color: #790303;
        box-shadow: 0.3rem 0.3rem 0.3rem 0.3rem #630202;
        transform: translateY(-2px);
    }
</style>