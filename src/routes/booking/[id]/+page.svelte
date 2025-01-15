<script lang="ts">
	import { writable } from 'svelte/store';
	import type { PageServerData } from './$types';

	type Ticket = {
		showingDate: string | null;
		showingTime: string | null;
		movieTitle: string | null;
		moviePoster: string | null;
		showingLanguage: string | null;
		showingDimension: string | null;
		cinemaName: string | null;
		cinemaAddress: string | null;
		hallName: string | null;
		seatRow: string | null;
		seatNumber: string | null;
		seatType: string | null;
		ticketTypeName: string | null;
		ticketStatus: 'reserved' | 'booked' | 'validated' | 'cancelled';
		bookingId: number | null;
		bookingDate: string | null;
		bookingTime: string | null;
		bookingTotalPrice: string | null;
		discountCode: string | null;
		discountValue: string | null;
	};

	const { data }: { data: PageServerData } = $props();
	const tickets: Ticket[] = data.tickets as Ticket[];
	const user = data.user;
	const usedGiftCodes = data.usedGiftCodes;

	const ticketsByShowing = tickets.reduce(
		(acc: Record<string, Ticket[]>, ticket) => {
			const key = `${ticket.showingDate}_${ticket.showingTime}_${ticket.movieTitle}`;
			if (!acc[key]) acc[key] = [];
			acc[key].push(ticket);
			return acc;
		},
		{} as Record<string, Ticket[]>
	);

	const bookingDate = tickets[0]?.bookingDate
		? new Date(tickets[0].bookingDate).toLocaleDateString('de-DE')
		: 'Unbekannt';
	const bookingTime = tickets[0]?.bookingTime || 'Unbekannt';
	const totalPrice = tickets[0]?.bookingTotalPrice
		? parseFloat(tickets[0].bookingTotalPrice).toFixed(2)
		: '0.00';

	// Track expanded showing, default to the first one
	const expandedShowing = writable(Object.keys(ticketsByShowing)[0] || null);
</script>

<div class="container mx-auto max-w-4xl p-4">
	<h1 class="mb-6 mt-12 text-center text-3xl font-bold">
		Danke für deine Bestellung{user && user.firstname ? ', ' + user.firstname : ''}!
	</h1>

	{#if (tickets && tickets.length > 0) || (usedGiftCodes && usedGiftCodes.length > 0)}
		<div class="rounded-lg bg-white p-6 shadow-lg">
			<!-- General Booking Info -->
			<div class="mb-4">
				<p class="text-gray-700">
					<strong>Buchungs-ID:</strong>
					{'#' + tickets[0]?.bookingId || 'Unbekannt'}
				</p>
				<p class="text-gray-700">
					<strong>Buchungsdatum:</strong>
					{bookingDate} um {bookingTime}
				</p>
				<p class="text-gray-700">
					<strong>Gesamtpreis:</strong>
					{totalPrice} €
				</p>
				{#if tickets[0]?.discountCode}
					<p class="text-green-600">
						<strong>Rabatt:</strong>
						{tickets[0]?.discountCode} ({tickets[0]?.discountValue || '0'}%)
					</p>
				{/if}
			</div>
			<!-- Gift Codes Section -->
			{#if usedGiftCodes && usedGiftCodes.length > 0}
				<div class="mb-6 border-t pt-6">
					<h3 class="mb-4 text-xl font-bold">Gekaufte Geschenkgutscheine</h3>
					<div class="grid gap-4">
						{#each usedGiftCodes as giftCode}
							<div class="rounded-lg border bg-gray-50 p-4">
								<p>
									<strong>Code:</strong> Sie können den Code in Ihrer Bestätigungs-E-Mail einsehen
								</p>
								<p><strong>Wert:</strong> {giftCode.amount}€</p>
							</div>
						{/each}
					</div>
				</div>
			{/if}

			<!-- Collapsible Showings -->
			{#each Object.entries(ticketsByShowing) as [key, showingTickets]}
				{@const firstTicket = showingTickets[0]}
				<div class="mt-6 border-t pt-6 first:mt-0 first:border-t-0 first:pt-0">
					<button
						class="w-full text-left focus:outline-none"
						onclick={() => expandedShowing.update((current) => (current === key ? null : key))}
					>
						<div class="flex items-center justify-between">
							<h2 class="text-2xl font-bold">{firstTicket.movieTitle || 'Unbekannter Film'}</h2>
							<span
								>{#if $expandedShowing === key}▼{:else}▶{/if}</span
							>
						</div>
					</button>
					{#if $expandedShowing === key}
						<div class="mt-4 flex gap-6">
							<img
								src={firstTicket.moviePoster || '/placeholder.jpg'}
								alt={firstTicket.movieTitle || 'Filmposter'}
								class="h-72 w-48 rounded-lg object-cover"
							/>
							<div class="flex-1">
								<div class="mb-4">
									<p class="text-gray-700">
										<strong>Vorstellung:</strong>
										{new Date(firstTicket.showingDate || '').toLocaleDateString('de-DE')} um {firstTicket.showingTime ||
											'Unbekannt'}
									</p>
									<p class="text-gray-700">
										<strong>Sprache:</strong>
										{firstTicket.showingLanguage || 'Unbekannt'}
									</p>
									<p class="text-gray-700">
										<strong>Darstellungsdimension:</strong>
										{firstTicket.showingDimension || 'Unbekannt'}
									</p>
								</div>

								<div class="mb-4">
									<p class="text-gray-700">
										<strong>Kino:</strong>
										{firstTicket.cinemaName || 'Unbekannt'}
									</p>
									<p class="text-gray-700">
										<strong>Saal:</strong>
										{firstTicket.hallName || 'Unbekannt'}
									</p>
									<p class="text-gray-700">
										<strong>Adresse:</strong>
										{firstTicket.cinemaAddress || 'Unbekannt'}
									</p>
								</div>

								<div class="mt-4">
									<h3 class="mb-2 font-bold">Tickets</h3>
									<div class="grid gap-2">
										{#each showingTickets as ticket}
											<div class="rounded-lg border bg-gray-50 p-3">
												<div class="flex items-center justify-between">
													<div>
														<p>
															<strong>Sitzplatz:</strong> Reihe {ticket.seatRow || 'N/A'}, Platz {ticket.seatNumber ||
																'N/A'}
														</p>
														<p>
															<strong>Kategorie:</strong>
															{ticket.seatType || 'N/A'}
														</p>
														<p>
															<strong>Ticket-Typ:</strong>
															{ticket.ticketTypeName || 'N/A'}
														</p>
													</div>
													<div class="text-right">
														<span
															class="rounded-full px-3 py-1 {ticket.ticketStatus === 'booked'
																? 'bg-green-100 text-green-800'
																: 'bg-gray-100 text-gray-800'}"
														>
															{ticket.ticketStatus}
														</span>
													</div>
												</div>
											</div>
										{/each}
									</div>
								</div>
							</div>
						</div>
					{/if}
				</div>
			{/each}
		</div>
	{:else}
		<div class="py-8 text-center">
			<p class="text-xl text-gray-600">Keine Buchungsdaten gefunden.</p>
		</div>
	{/if}
</div>
