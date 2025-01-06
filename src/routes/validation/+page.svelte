<script lang="ts">
	import { enhance } from '$app/forms';
	import { onMount, onDestroy } from 'svelte';
	import type { ActionData } from './$types';
	import { Html5Qrcode } from 'html5-qrcode';
	import { browser } from '$app/environment';

	export let form: ActionData & {
		success?: boolean;
		error?: string;
		message?: string;
		ticket?: {
			id: string;
			type: string;
			status: string;
			film: string;
			datum: string;
			uhrzeit: string;
			saal: string;
			sitz: string;
			category: string;
		};
	};
	let html5QrCode: Html5Qrcode | null = null;
	let scanning = false;
	let scanResult = '';
	let showScanner = true;
	let readerElement: HTMLElement | null = null;

	let containerClass =
		'scanner-container bg-gray-100 min-h-[90vh] flex flex-col justify-center items-center p-6';

	$: if (form?.success) {
		containerClass =
			'scanner-container bg-green-100 min-h-[90vh] flex flex-col justify-center items-center p-6';
	} else if (form?.error) {
		containerClass =
			'scanner-container bg-red-100 min-h-[90vh] flex flex-col justify-center items-center p-6';
	} else {
		containerClass =
			'scanner-container bg-gray-100 min-h-[90vh] flex flex-col justify-center items-center p-6'; // Reset to default
	}

	onMount(async () => {
		// Make onMount async
		if (browser) {
			await initializeScanner(); // Await initializeScanner
		}
	});

	onDestroy(() => {
		if (browser && html5QrCode) {
			stopScanner();
		}
	});

	async function initializeScanner() {
		if (!browser) return;

		// Wait for the next tick to ensure the DOM is updated
		await new Promise((resolve) => setTimeout(resolve, 0));

		if (!html5QrCode) {
			html5QrCode = new Html5Qrcode('reader');
		}

		readerElement = document.getElementById('reader');
		if (!readerElement) {
			console.error('Reader element not found!');
			return;
		}

		startScanner();
	}

	async function startScanner() {
		if (!browser || !html5QrCode || html5QrCode.isScanning || !readerElement) return;

		try {
			scanning = true;
			showScanner = true;

			const qrboxSize = Math.floor(
				Math.min(readerElement.clientWidth, readerElement.clientHeight) * 0.7
			);
			const config = { fps: 10, qrbox: { width: qrboxSize, height: qrboxSize }, aspectRatio: 1.0 };

			await html5QrCode.start({ facingMode: 'environment' }, config, onScanSuccess, onScanFailure);
		} catch (err) {
			console.error('Fehler beim Starten des Scanners:', err);
			scanning = false;
		}
	}

	async function stopScanner() {
		if (html5QrCode && html5QrCode.isScanning) {
			try {
				await html5QrCode.stop();
			} catch (error) {
				console.error('Error stopping scanner:', error);
			}
		}
		scanning = false;
	}

	async function onScanSuccess(decodedText: string) {
		if (!scanning) return;

		scanning = false;
		scanResult = JSON.parse(decodedText).token;
		console.log('QR-Code gescannt:', decodedText);

		await stopScanner();
		showScanner = false;

		const formElement = document.getElementById('scanForm') as HTMLFormElement;
		formElement.requestSubmit();
	}

	function onScanFailure(error: string) {
		// Ignore scan failures
	}

	function restartScanner() {
		form.error = undefined;
		form.message = undefined;
		form.success = undefined;
		form.ticket = undefined;
		scanResult = '';
		showScanner = true;

		stopScanner(); // Stop before clearing and re-initializing
		if (html5QrCode) {
			html5QrCode.clear();
			html5QrCode = null; // Important: Reset the instance
		}
		initializeScanner();
	}
</script>

<div class={containerClass}>
	{#if showScanner}
		<div
			id="reader"
			class="aspect-square w-full max-w-md overflow-hidden rounded-lg shadow-lg"
		></div>
	{:else if form?.success || form?.error}
		<div class="result mt-6 w-full max-w-md rounded-lg bg-white p-6 shadow-lg">
			{#if form?.success}
				<div class="flex flex-col items-center">
					<h2 class="mb-2 text-2xl font-semibold text-gray-800">Ticket gültig</h2>
					<div class="ticket-card w-full rounded-lg bg-gray-50 p-4">
						<div class="mb-2 flex items-center justify-between">
							<h3 class="text-lg font-semibold text-gray-800">{form.ticket?.film}</h3>
							<span class="rounded-md bg-green-500 px-2 py-2 text-sm font-medium text-white"
								>{form.ticket?.category}</span
							>
						</div>
						<div class="grid grid-cols-2 gap-2 text-gray-600">
							<div><i class="fas fa-calendar mr-2"></i>{form.ticket?.datum}</div>
							<div><i class="fas fa-clock mr-2"></i>{form.ticket?.uhrzeit}</div>
							<div><i class="fas fa-door-open mr-2"></i>Saal {form.ticket?.saal}</div>
							<div><i class="fas fa-chair mr-2"></i>{form.ticket?.sitz}</div>
						</div>
						<div class="mt-4 text-center">
							<span class="rounded-md bg-red-500 px-2 py-2 text-lg font-medium text-white"
								>{form.ticket?.type}</span
							>
						</div>
					</div>
				</div>
			{:else if form?.error}
				<div class="flex flex-col items-center">
					<h2 class="mb-2 text-2xl font-semibold text-gray-800">Fehler</h2>
					<p class="mb-4 text-gray-600">{form.error}</p>
				</div>
			{/if}
			<button
				class="mt-4 w-full rounded-md bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700"
				on:click={restartScanner}>Weiter scannen</button
			>
		</div>
	{/if}
	<form id="scanForm" method="POST" action="?/validate" use:enhance>
		<input type="hidden" name="ticketData" value={scanResult} />
	</form>
</div>
