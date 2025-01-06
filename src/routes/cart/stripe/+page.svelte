<script lang="ts">
    import { onMount } from 'svelte'
    import { loadStripe, type Stripe } from '@stripe/stripe-js'
    import type { PageServerData } from '../[id]/stripe/$types';
	import { EmbeddedCheckout } from 'svelte-stripe';
    const PUBLIC_STRIPE_KEY = import.meta.env.VITE_PUBLIC_STRIPE_KEY

    const data: PageServerData = $props();

    let stripe: Stripe | null = $state(null);

    onMount(async () => {
        stripe = await loadStripe(PUBLIC_STRIPE_KEY)
    })
</script>

<h1>Embedded Checkout Example</h1>

<EmbeddedCheckout {stripe} clientSecret={data.clientSecret}/>