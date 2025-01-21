<script lang="ts">
	import { onMount } from 'svelte';
	import { loadStripe } from '@stripe/stripe-js';
	import { EmbeddedCheckout } from 'svelte-stripe';
	const PUBLIC_STRIPE_KEY = import.meta.env.VITE_PUBLIC_STRIPE_KEY;

	export let data;

	/**
	 * @type {import("@stripe/stripe-js").Stripe | null}
	 */
	let stripe = null;
	let isLoading = true;

	onMount(async () => {
		try {
			stripe = await loadStripe(PUBLIC_STRIPE_KEY);
		} finally {
			isLoading = false;
		}
	});
</script>

<div class="checkout-container">
	<div class="checkout-header">
		<h1>Sichere Bezahlung</h1>
		<p class="subtitle">Ihre Transaktion wird sicher durch Stripe verarbeitet</p>
	</div>

	<div class="checkout-content">
		{#if isLoading}
			<div class="loading-spinner">
				<div class="spinner"></div>
				<p>Laden...</p>
			</div>
		{:else}
			<div class="checkout-frame">
				<EmbeddedCheckout {stripe} clientSecret={data.clientSecret} />
			</div>
		{/if}
	</div>

	<div class="security-info">
		<div class="security-item">
			<span class="icon">🔒</span>
			<span>256-Bit SSL Verschlüsselung</span>
		</div>
		<div class="security-item">
			<span class="icon">✓</span>
			<span>Sichere Zahlungsabwicklung</span>
		</div>
		<div class="security-item">
			<span class="icon">🛡️</span>
			<span>Käuferschutz</span>
		</div>
	</div>
</div>

<style>
	.checkout-container {
		max-width: 1200px; /* Increased from 800px */
		width: 95%; /* Added to ensure some margin on very wide screens */
		margin: 2rem auto;
		padding: 1rem;
		font-family:
			system-ui,
			-apple-system,
			sans-serif;
	}

	.checkout-header {
		text-align: center;
		margin-bottom: 2rem;
	}

	h1 {
		color: #2d3748;
		font-size: 2rem;
		margin-bottom: 0.5rem;
	}

	.subtitle {
		color: #4a5568;
		font-size: 1rem;
	}

	.checkout-content {
		background-color: white;
		border-radius: 12px;
		box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
		padding: 2rem;
		margin-bottom: 2rem;
		min-width: 800px; /* Added minimum width */
		margin-left: auto;
		margin-right: auto;
	}

	.checkout-frame {
		min-height: 600px; /* Increased from 500px for better layout */
	}

	.loading-spinner {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		min-height: 300px;
	}

	.spinner {
		width: 40px;
		height: 40px;
		border: 4px solid #f3f3f3;
		border-top: 4px solid #3498db;
		border-radius: 50%;
		animation: spin 1s linear infinite;
		margin-bottom: 1rem;
	}

	@keyframes spin {
		0% {
			transform: rotate(0deg);
		}
		100% {
			transform: rotate(360deg);
		}
	}

	.security-info {
		display: flex;
		justify-content: center;
		gap: 2rem;
		flex-wrap: wrap;
		margin-top: 2rem;
		padding: 1rem;
		background-color: #f8fafc;
		border-radius: 8px;
	}

	.security-item {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		color: #4a5568;
		font-size: 0.9rem;
	}

	.icon {
		font-size: 1.2rem;
	}

	@media (max-width: 840px) {
		.checkout-content {
			min-width: unset; /* Remove minimum width on smaller screens */
			width: 100%;
			padding: 1rem;
		}

		.checkout-container {
			margin: 1rem;
			padding: 0.5rem;
		}

		.security-info {
			flex-direction: column;
			align-items: center;
			gap: 1rem;
		}

		h1 {
			font-size: 1.5rem;
		}
	}
</style>
