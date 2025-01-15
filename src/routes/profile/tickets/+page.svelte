<script lang="ts">
	import QRCode from 'qrcode';
	import { onMount } from 'svelte';
	import type { PageData } from './$types';
	import { TicketCheck } from 'lucide-svelte'; 


	export let data: PageData;

	const tickets = data.tickets;
	let qrCodes = {};
	let selectedQRCode = null;
	let showModal = false;
	let modalSize = { width: 0, height: 0 };

	$: groupedTickets = tickets.reduce((groups, ticket) => {
		const key = ticket.showingId;
		if (!groups[key]) groups[key] = [];
		groups[key].push(ticket);
		return groups;
	}, {});

	onMount(async () => {
		updateModalSize();
		window.addEventListener('resize', updateModalSize);
		for (let ticket of tickets) {
			const qrData = JSON.stringify({ id: ticket.id, token: ticket.token });
			try {
				qrCodes[ticket.id] = {
					small: await QRCode.toDataURL(qrData, { width: 80, margin: 1 }),
					large: await QRCode.toDataURL(qrData, { width: 1000, margin: 1 })
				};
			} catch (err) {
				console.error('QR Code Generierung fehlgeschlagen:', err);
			}
		}
		return () => window.removeEventListener('resize', updateModalSize);
	});
	function updateModalSize() {
		const padding = 40;
		modalSize = { width: window.innerWidth - padding, height: window.innerHeight - padding };
	}
	function openQRModal(ticketId) {
		selectedQRCode = qrCodes[ticketId].large;
		showModal = true;
	}
	function getStatusColor(status) {
		return status === 'paid' ? '#10b981' : '#f59e0b';
	}
</script>

{#if Object.keys(groupedTickets).length === 0}
	<div class="flex min-h-screen flex-col items-center justify-center bg-gray-50">
		<div class="text-center">
			<TicketCheck size={64} class="mx-auto mb-4 text-gray-400" />
			<h2 class="mb-2 text-2xl font-semibold text-gray-800">
				Sie haben zur Zeit keine Tickets
			</h2>
			<p class="mb-6 text-gray-600">Entdecken Sie unsere Programm</p>
			<a
				href="/"
				class="inline-block rounded-md bg-gray-200 px-6 py-3 font-medium text-gray-700 transition duration-300 hover:bg-gray-300"
			>
				Zum Programm
			</a>
		</div>
	</div>
{/if}

<div class="tickets-container">
	{#each Object.entries(groupedTickets) as [showingId, showingTickets]}
		<div class="vorstellung">
			<div class="vorstellung-header">
				<div class="film-info">
					<h2>{showingTickets[0].film}</h2>
					<div class="details">
						<span>{new Date(showingTickets[0].datum).toLocaleDateString('de-DE')}</span>
						<span>•</span>
						<span>{showingTickets[0].uhrzeit}</span>
						<span>•</span>
						<span>Saal {showingTickets[0].saal}</span>
					</div>
				</div>
				<div class="ticket-count">
					{showingTickets.length}
					{showingTickets.length === 1 ? 'Ticket' : 'Tickets'}
				</div>
			</div>

			<div class="tickets-list">
				{#each showingTickets as ticket}
					<div class="ticket" on:click={() => openQRModal(ticket.id)}>
						<div class="ticket-content">
							<div class="ticket-header">
								<div class="seat-number">{ticket.sitzreihe + ticket.sitzplatz}</div>
								<div class="ticket-type" style="background-color: blue">
									{ticket.type}
								</div>
							</div>
							<div class="ticket-details">
								<span class="ticket-id">#{ticket.id}</span>
								<span class="price">{ticket.price} €</span>
							</div>
							<div class="status-badge" style="background-color: green">
								{ticket.seatCategory}
							</div>
						</div>
						<div class="qr-container">
							{#if qrCodes[ticket.id]}
								<img src={qrCodes[ticket.id].small} alt="QR Code" class="qr-code" />
							{:else}
								<div class="loading">Lädt...</div>
							{/if}
						</div>
					</div>
				{/each}
			</div>
		</div>
	{/each}
</div>

{#if showModal}
	<div class="modal-backdrop" on:click={() => (showModal = false)}>
		<div class="modal" on:click|stopPropagation>
			<!-- <button class="close-button" on:click={() => showModal = false}>×</button> -->
			<img
				src={selectedQRCode}
				alt="Vergrößerter QR Code"
				style="max-width: {modalSize.width}px; max-height: {modalSize.height}px;"
			/>
		</div>
	</div>
{/if}

<style>
	.tickets-container {
		max-width: 900px;
		margin: 0 auto;
		padding: 1.5rem;
		display: flex;
		flex-direction: column;
		gap: 2rem;
	}

	.vorstellung {
		background: white;
		border-radius: 12px;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
		overflow: hidden;
	}

	.vorstellung-header {
		padding: 1.5rem;
		background: #f8f9fa;
		border-bottom: 1px solid #eee;
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.ticket {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 1rem;
		border: 1px solid #eee;
		border-radius: 8px;
		background: white;
		cursor: pointer;
		transition:
			transform 0.2s,
			box-shadow 0.2s;
	}

	.ticket:hover {
		transform: translateY(-2px);
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
	}

	.ticket-content {
		flex: 1;
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	.ticket-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.ticket-type {
		padding: 0.25rem 0.75rem;
		border-radius: 1rem;
		font-size: 0.75rem;
		font-weight: 500;
		color: white;
		margin-right: 1rem;
	}

	.status-badge {
		display: inline-block;
		padding: 0.25rem 0.75rem;
		border-radius: 1rem;
		font-size: 0.75rem;
		font-weight: 500;
		color: white;
		align-self: flex-start;
	}

	.seat-number {
		font-size: 1.25rem;
		font-weight: 600;
		color: #1a1a1a;
	}

	.ticket-details {
		display: flex;
		gap: 1rem;
		color: #666;
		font-size: 0.9rem;
	}

	.price {
		font-weight: 500;
	}

	h2 {
		margin: 0;
		font-size: 1.5rem;
		color: #1a1a1a;
	}

	.details {
		margin-top: 0.5rem;
		color: #666;
		display: flex;
		gap: 0.5rem;
		align-items: center;
		font-size: 0.9rem;
	}

	.ticket-count {
		background: #e9ecef;
		padding: 0.5rem 1rem;
		border-radius: 20px;
		font-size: 0.9rem;
		color: #495057;
	}

	.tickets-list {
		padding: 1.5rem;
		display: grid;
		gap: 1rem;
		grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
	}

	.ticket {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 1rem;
		border: 1px solid #eee;
		border-radius: 8px;
		background: white;
		cursor: pointer;
		transition:
			transform 0.2s,
			box-shadow 0.2s;
	}

	.ticket:hover {
		transform: translateY(-2px);
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
	}

	.seat-info {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
	}

	.seat-number {
		font-size: 1.25rem;
		font-weight: 600;
		color: #1a1a1a;
	}

	.ticket-id {
		font-size: 0.8rem;
		color: #868e96;
	}

	.qr-container {
		position: relative;
	}

	.qr-code {
		width: 80px;
		height: 80px;
		object-fit: contain;
	}

	.zoom-hint {
		position: absolute;
		bottom: -20px;
		left: 50%;
		transform: translateX(-50%);
		font-size: 0.7rem;
		color: #868e96;
		white-space: nowrap;
	}

	.modal-backdrop {
		position: fixed;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		background: rgba(0, 0, 0, 0.9);
		display: flex;
		justify-content: center;
		align-items: center;
		z-index: 1000;
	}

	.modal {
		position: relative;
		display: flex;
		justify-content: center;
		align-items: center;
		max-width: 100vw;
		max-height: 100vh;
	}

	.modal img {
		display: block;
		object-fit: contain;
	}

	.close-button {
		position: absolute;
		top: -3rem;
		right: 0;
		background: none;
		border: none;
		font-size: 2rem;
		cursor: pointer;
		color: white;
		padding: 0.5rem;
	}

	.loading {
		width: 80px;
		height: 80px;
		display: flex;
		align-items: center;
		justify-content: center;
		background: #f8f9fa;
		border-radius: 4px;
		color: #868e96;
		font-size: 0.8rem;
	}
</style>
