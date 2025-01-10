<script lang="ts">
	import { onMount } from 'svelte';
	import { loadScript } from '@paypal/paypal-js';
	import { languageAwareGoto } from '$lib/utils/languageAware';
	import { getOrderByOperators } from 'drizzle-orm';

	const clientId: string = import.meta.env.VITE_CLIENT_ID_PAYPAL as string;
	export let amount: string = '10.00';
	export let currency: string = 'USD';
	export let bookingId: number;

	let paypalContainer: HTMLDivElement | null = null;

	onMount(async () => {
		try {
			const paypal = await loadScript({
				clientId: clientId, // Verwende camelCase
				currency: currency
			});

			if (paypal && paypal.Buttons) {
				paypal
					.Buttons({
						createOrder: (data, actions) => {
							return actions.order.create({
								purchase_units: [
									{
										reference_id: bookingId as unknown as string,
										amount: {
											currency_code: currency, // Währung muss angegeben werden
											value: amount
										}
									}
								],
								intent: 'CAPTURE'
							});
						},
						onApprove: async (data, actions) => {
							if (actions?.order) {
								return actions.order.capture().then(async (details) => {
									const order = await actions?.order?.get();
									const orderId = order?.id;
									const response = await fetch('/booking/complete', {
										method: 'POST',
										headers: {
											'Content-Type': 'application/json'
										},
										body: JSON.stringify({
											orderId: orderId
										})
									});

									if (response.ok) {
										const result = await response.json();
										if (result.success) {
											languageAwareGoto('/booking/' + bookingId);
										} else {
											console.error('Fehler beim Speichern der Bestellung:', result.error);
										}
									} else {
										console.error('Fehler beim Speichern der Bestellung:', response.statusText);
									}
								});
							} else {
								console.error('Fehler: actions.order ist undefined.');
							}
						},
						onError: (err) => {
							console.error('PayPal Fehler:', err);
						}
					})
					.render(paypalContainer!);
			} else {
				console.error('PayPal SDK konnte nicht geladen werden.');
			}
		} catch (error) {
			console.error('Fehler beim Laden des PayPal SDKs:', error);
		}
	});
</script>

<div bind:this={paypalContainer}></div>
