<script lang="ts">
	import { goto } from '$app/navigation';
	import Button from '$lib/components/button.svelte';
	import { loadStripe, type Stripe } from '@stripe/stripe-js';
	import { onMount } from 'svelte';
	import PayPalButton from '$lib/components/PayPalButton.svelte';
	import type { ActionData } from './$types';
	import GoogleAutocomplete from '$lib/components/GoogleAutocomplete.svelte';
	import * as m from '$lib/paraglide/messages.js';
	import { CreditCard, Ticket } from 'lucide-svelte';
	import { Building, ShoppingBag, Tag, Trash2 } from 'lucide-svelte';
	import {
		type Seat,
		type PriceSet,
		type SeatCategory,
		type TicketType,
		type Booking,
		type PriceDiscount,
		type GiftCode
	} from '$lib/server/db/schema';
	import { refreshTimer } from '$lib/stores/cartTimeStore';

	let adress = '';
	const PUBLIC_STRIPE_KEY = import.meta.env.PUBLIC_STRIPE_KEY;
	const API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

	// function handlePlaceSelected(event) {
	// 	const adresse = event.detail;
	// 	adress = adresse.formatted_address;
	// 	console.log(m.selected_address({}), adresse);
	// }

	interface Prices {
		basePrice: number;
		discount: {
			value: number;
			discountType: 'percentage' | 'absolute';
		} | null;
		discountedAmount: number;
		giftCodeAmount: number;
		vatRate: number;
		vatAmount: number;
		total: number;
	}

	interface TicketGroup {
		showingId: number;
		showTitle: string;
		showDate: string;
		showTime: string;
		showTickets: typeof tickets;
	}

	export let data;
	export let form: ActionData;
	let booking = data.booking as Booking;
	let tickets = data.tickets;
	let prices = data.prices as Prices;
	let giftCodes = data.giftCodes as GiftCode[];
	let stripe: Stripe | null = null;
	let discountCode = '';

	$: groupedTickets = Object.entries(
		tickets.reduce(
			(acc, ticket) => {
				const key = ticket.showing.id;
				if (!acc[key]) {
					acc[key] = {
						showingId: key,
						showTitle: ticket.film.title || '',
						showDate: ticket.showing.date,
						showTime: ticket.showing.time,
						showTickets: []
					};
				}
				acc[key].showTickets.push(ticket);
				return acc;
			},
			{} as Record<number, TicketGroup>
		)
	).map(([_, value]) => value);

	function formatTime(timeString: string) {
		const date = new Date(`1970-01-01T${timeString}Z`);
		return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
	}

	$: currentPrices = form?.prices || prices;

	function formatDiscount(discount: { value: number; discountType: string }): string {
		if (!discount) return '';

		if (discount.discountType === 'percentage') {
			return `${discount.value * 100}%`;
		} else {
			return `${discount.value} €`;
		}
	}

	onMount(async () => {
		stripe = await loadStripe(PUBLIC_STRIPE_KEY);
		refreshTimer();
	});

	function handleDeleteTicket(ticketId: number) {
		console.log(`Deleting ticket with ID: ${ticketId}`);
	}
</script>

{#if tickets!.length !== 0 || giftCodes!.length !== 0}
	<div class="flex min-h-screen items-center justify-center bg-gray-50 p-4">
		<div class="w-full max-w-7xl rounded-xl bg-white shadow-lg">
			<div class="checkout-container">
				<div class="checkout-left">
					<div class="tickets-list">
						{#each groupedTickets as group}
							<div class="showing-group">
								<h3 class="showing-title">
									{m.cart_film({})}
									{group.showTitle}<br />
									{m.cart_show({})}
									{formatTime(group.showTime)}
								</h3>

								{#each group.showTickets as ticket}
									<div
										class="ticket-container"
										style="background-image: url({ticket.film.backdrop})"
									>
										<div class="ticket-info">
											<p>{m.cart_seat({})} {ticket.seat.row}{ticket.seat.seatNumber}</p>
											<p>{m.cart_typ({})} {ticket.ticketType.name}</p>
											<p>{m.cart_seattype({})} {ticket.seatCategory.name}</p>
											<p>{m.cart_price({})} {ticket.ticket.price} €</p>
										</div>
										<div>
											<form action="?/delete" method="post">
												<input type="hidden" name="ticketId" value={ticket.ticket.id} />
												<button type="submit" class="delete-icon">
													<Trash2 size={20} />
												</button>
											</form>
										</div>
									</div>
								{/each}
							</div>
						{/each}
						{#if giftCodes.length > 0}
							<div class="discount-group">
								<h3 class="showing-title">Gift Cards</h3>
								{#each giftCodes as giftCode}
									<div class="discount-container">
										<div class="discount-icon">
											<Tag size={20} />
										</div>
										<div class="discount-info">
											<p>
												{giftCode.description}:
												{`${giftCode.amount} €`}
											</p>
										</div>
										<div>
											<form action="?/delete" method="post">
												<input type="hidden" name="giftCodeId" value={giftCode.id} />
												<button type="submit" class="delete-icon">
													<Trash2 size={20} />
												</button>
											</form>
										</div>
									</div>
								{/each}
							</div>
						{/if}
					</div>
				</div>

				<div class="checkout-right">
					<div class="order-summary">
						<div class="discount">
							<form action="?/discount" method="post">
								<input
									type="text"
									id="discount-code"
									name="discount-code"
									placeholder={m.cart_enter_discount({})}
									class="rounded-input"
									bind:value={discountCode}
								/>
								<Button type="submit">{m.submit({})}</Button>
							</form>

							{#if form?.error}
								<p style="color: red;">{form.error}</p>
							{:else if form?.success}
								<p style="color: green;">{form.success}</p>
							{/if}
						</div>

						<div class="totals">
							<div class="totals-row">
								<span>{m.cart_subtotal({})}</span>
								<span>{currentPrices.basePrice.toFixed(2)} €</span>
							</div>

							{#if currentPrices.discount}
								<div class="totals-row">
									<span>{m.cart_discount({})} ({formatDiscount(currentPrices.discount)}):</span>
									<span>-{currentPrices.discountedAmount.toFixed(2)} €</span>
								</div>
							{/if}

							{#if currentPrices.giftCodeAmount > 0}
								<div class="totals-row">
									<span>{m.gift_cards({})}</span>
									<span>{currentPrices.giftCodeAmount.toFixed(2)} €</span>
								</div>
							{/if}

							<div class="totals-row">
								<span>{m.cart_VAT({})}({(currentPrices.vatRate * 100).toFixed(0)}%):</span>
								<span>{currentPrices.vatAmount.toFixed(2)} €</span>
							</div>

							<div class="totals-row total">
								<span>{m.cart_total({})}</span>
								<span>{currentPrices.total.toFixed(2)} €</span>
							</div>
						</div>
					</div>

					<h2 class="mb-6 text-xl font-semibold">{m.cart_payment_type({})}</h2>
					<div class="flex max-w-md flex-col space-y-4">
						<!-- Stripe Payment Button -->
						<a
							href="/cart/checkout"
							class="group flex w-full items-center justify-center rounded-lg bg-blue-600 px-6 py-4 text-white shadow-md transition-all duration-200 hover:bg-blue-700 hover:shadow-lg"
						>
							<CreditCard class="mr-3 h-5 w-5 transition-transform group-hover:scale-110" />
							<span class="font-medium">Pay with Stripe</span>
						</a>

						<!-- Cinema Payment Button (Disabled) -->
						<button
							disabled
							class="relative flex w-full cursor-not-allowed items-center justify-center overflow-hidden rounded-lg bg-gray-100 px-6 py-4 text-gray-400 opacity-75 transition-all duration-200"
						>
							<Ticket class="mr-3 h-5 w-5" />
							<span class="font-medium">Pay at Cinema</span>
							<div
								class="absolute -right-1 top-0 translate-y-2 rotate-45 transform bg-gray-200 px-2 py-1 text-xs"
							>
								Coming Soon
							</div>
						</button>
					</div>
				</div>
			</div>
		</div>
	</div>
{:else}
	<div class="flex min-h-screen flex-col items-center justify-center bg-gray-50">
		<div class="text-center">
			<ShoppingBag size={64} class="mx-auto mb-4 text-gray-400" />
			<h2 class="mb-2 text-2xl font-semibold text-gray-800">
				{m.cart_empty_h2({})}
			</h2>
			<p class="mb-6 text-gray-600">
				{m.cart_empty_p({})}
			</p>
			<a
				href="/"
				class="inline-block rounded-md bg-gray-200 px-6 py-3 font-medium text-gray-700 transition duration-300 hover:bg-gray-300"
			>
				{m.cart_goto_program({})}
			</a>
		</div>
	</div>
{/if}

<style>
	.showing-title {
		font-size: 1.2em;
		font-weight: bold;
		margin-bottom: 10px;
	}

	.checkout-container {
		display: flex;
		gap: 40px;
		padding: 40px;
		width: 100%;
		height: 80vh;
	}

	.checkout-left {
		flex: 1.2;
		padding: 30px;
		background-color: #f9f9f9;
		border-radius: 8px;
		overflow: hidden;
		display: flex;
		flex-direction: column;
	}

	.tickets-list {
		overflow-y: auto;
		flex-grow: 1;
		padding-right: 15px;
	}

	.checkout-right {
		flex: 0.8;
		background-color: #f9f9f9;
		padding: 30px;
		border-radius: 8px;
		min-width: 320px;
		overflow-y: auto;
	}

	.order-summary .item {
		border-bottom: 1px solid #eee;
		padding: 15px 0;
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.ticket-info {
		flex: 1;
		font-size: 1.1em;
	}

	.delete-icon {
		background: none;
		border: none;
		cursor: pointer;
		color: #ff4136;
		padding: 8px;
	}

	.delete-icon:hover {
		color: #d90000;
	}

	.totals-row {
		display: flex;
		justify-content: space-between;
		padding: 8px 0;
		font-size: 1.1em;
	}

	.totals-row.total {
		font-weight: bold;
		font-size: 1.3em;
		border-top: 2px solid #eee;
		margin-top: 15px;
		padding-top: 15px;
	}

	.discount {
		margin-bottom: 30px;
	}

	.discount form {
		display: flex;
		gap: 15px;
	}

	.rounded-input {
		border: 1px solid #ccc;
		border-radius: 8px;
		padding: 12px;
		flex: 1;
		font-size: 1.1em;
	}

	.showing-group {
		margin-bottom: 30px;
		padding-bottom: 15px;
		border-bottom: 2px solid #eee;
	}

	.showing-group:last-child {
		margin-bottom: 0;
		border-bottom: none;
	}

	.payment-methods {
		margin-top: 30px;
	}

	.payment-buttons {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.payment-button {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.75rem;
		padding: 1rem;
		border-radius: 8px;
		font-weight: 600;
		transition: all 0.2s ease;
		border: none;
		cursor: pointer;
		width: 100%;
	}

	.stripe-button {
		background-color: #635bff;
		color: white;
	}

	.stripe-button:hover {
		background-color: #4b44d1;
	}

	.cinema-button {
		background-color: #f3f4f6;
		color: #1f2937;
		border: 2px solid #e5e7eb;
	}

	.cinema-button:hover {
		background-color: #e5e7eb;
	}

	/* Focus styles for accessibility */
	.payment-button:focus {
		outline: 2px solid #4b44d1;
		outline-offset: 2px;
	}

	.section-title {
		font-size: 1.5em;
		font-weight: bold;
		margin: 25px 0 15px 0;
	}

	.ticket-container {
		background-size: cover;
		background-position: center;
		border-radius: 8px;
		padding: 15px;
		margin-bottom: 10px;
		position: relative;
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.ticket-container::before {
		content: '';
		position: absolute;
		top: 0;
		right: 0;
		bottom: 0;
		left: 0;
		background-color: rgba(255, 255, 255, 0.8);
		border-radius: 8px;
	}

	.ticket-info {
		position: relative;
		z-index: 1;
		flex-grow: 1;
	}

	.delete-icon {
		position: relative;
		z-index: 1;
	}

	@media (max-width: 768px) {
		.checkout-container {
			flex-direction: column;
			padding: 20px;
			height: auto;
		}

		.checkout-left,
		.checkout-right {
			width: 100%;
			max-height: 60vh;
			overflow-y: auto;
		}
	}
	.discount-container {
		background-color: rgba(255, 255, 255, 0.8);
		border-radius: 8px;
		padding: 15px;
		margin-bottom: 10px;
		position: relative;
		display: flex;
		justify-content: space-between;
		align-items: center;
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
		transition:
			transform 0.2s ease,
			box-shadow 0.2s ease;
	}
	.discount-container:hover {
		transform: translateY(-2px);
		box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
	}

	.discount-info {
		position: relative;
		z-index: 1;
		flex-grow: 1;
		font-size: 1.1em;
	}

	.discount-container .delete-icon {
		background: none;
		border: none;
		cursor: pointer;
		color: #ff4136;
		padding: 8px;
	}

	.discount-container .delete-icon:hover {
		color: #d90000;
	}
	.discount-icon {
		margin-right: 10px;
		color: #4caf50;
	}
</style>
