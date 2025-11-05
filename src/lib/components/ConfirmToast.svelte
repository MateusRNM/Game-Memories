<script lang="ts">
	import { fly } from 'svelte/transition';
	let { msg, confirmMsg, action, opened = $bindable() } = $props();
</script>

{#if opened}
	<div
		class="toast-container fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 p-4"
		style="z-index: 9999;"
		transition:fly={{ y: -50, duration: 300 }}
	>
		<div
			class="toast-content flex w-full max-w-sm flex-col rounded-xl border border-white/20 bg-black shadow-2xl"
			role="alert"
			aria-live="assertive"
			aria-atomic="true"
		>
			<div class="toast-body p-4 text-center text-lg text-white">
				{msg}
				<div class="mt-4 border-t border-black/50 pt-4">
					<div class="flex gap-3">
						<button
							type="button"
							class="btn-secondary flex-1 rounded-lg bg-gray-600 px-4 py-3 text-sm font-bold uppercase text-white transition-all duration-200 ease-in-out hover:bg-gray-500"
							onclick={() => opened = false}
						>
							CANCELAR
						</button>
						<button
							type="button"
							class="btn-danger flex-1 rounded-lg bg-red-700 px-4 py-3 text-sm font-bold uppercase text-white transition-all duration-200 ease-in-out hover:bg-red-600"
							onclick={() => {
								opened = false;
								action();
							}}
						>
							{confirmMsg}
						</button>
					</div>
				</div>
			</div>
		</div>
	</div>
{/if}

<style>
	.btn-secondary:hover {
		transform: translateY(-2px);
		box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
	}
	.btn-danger:hover {
		transform: translateY(-2px);
		box-shadow: 0 4px 15px rgba(185, 7, 7, 0.3);
	}
</style>