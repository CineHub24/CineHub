<script lang="ts">
	import { goto } from '$app/navigation';

	let refundAmount: number = 10; // Example amount, replace with actual refund amount
	let showTitle: string = 'Example Show'; // Replace with actual show title
	let newShowId: number = 123; // Replace with actual new show ID if applicable

	function collectRefund() {
		// Add logic to process refund
		alert('Refund processed. You will receive your money within 5-7 business days.');
	}

	function bookNewTicket() {
		goto(`/booking/${newShowId}?discount=${refundAmount}`);
	}
</script>

<div class="show-edit-page">
	<div class="show-edit-container">
		<div class="header">
			<h2>Refund Options for "{showTitle}"</h2>
		</div>

		<div class="confirmation">
			We're sorry for the inconvenience. Your show has been rescheduled or cancelled. You have two
			options:
		</div>

		<div class="form-columns">
			<div class="form-column">
				<div class="form-group">
					<h3>Option 1: Collect Refund</h3>
					<p>You can receive a full refund of ${refundAmount}.</p>
					<button on:click={collectRefund} class="form-actions">Collect Refund</button>
				</div>
			</div>

			<div class="form-column">
				<div class="form-group">
					<h3>Option 2: Book a New Ticket</h3>
					<p>
						You can book a new ticket for a different show and apply your ${refundAmount} as a discount.
					</p>
					<button on:click={bookNewTicket} class="form-actions">Book New Ticket</button>
				</div>
			</div>
		</div>

		<div class="form-actions">
			<a href="/" class="confirmation-link">Return to Home</a>
		</div>
	</div>
</div>

<style>
	.show-edit-page {
		width: 100%;
		padding: 20px;
		box-sizing: border-box;
	}

	.show-edit-container {
		width: 100%;
		max-width: 1200px;
		min-height: 75vh;
		margin: 0 auto;
		background-color: white;
		padding: 40px;
		box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
		border-radius: 8px;
	}

	.header {
		margin-bottom: 30px;
		padding-bottom: 15px;
		border-bottom: 1px solid #eee;
	}

	.header h2 {
		margin: 0;
		font-size: 1.8em;
		color: #333;
	}

	.form-columns {
		display: flex;
		gap: 30px;
	}

	.form-column {
		flex: 1;
	}

	.form-group {
		margin-bottom: 20px;
	}

	.form-group label {
		display: block;
		margin-bottom: 8px;
		font-weight: 600;
		color: #333;
	}

	.form-group input,
	.form-group select {
		width: 100%;
		padding: 10px;
		border: 1px solid #ddd;
		border-radius: 4px;
		font-size: 1em;
	}

	.form-actions {
		display: flex;
		justify-content: flex-end;
		gap: 10px;
		margin-top: 30px;
	}

	.form-actions button {
		padding: 12px 25px;
		background-color: #007bff;
		color: white;
		border: none;
		border-radius: 4px;
		cursor: pointer;
		font-weight: 600;
		transition: 0.3s ease;
	}

	.form-actions button:hover {
		background-color: #0056b3;
	}
	.not-found {
		text-align: center;
		color: #666;
		font-size: 1.2em;
		padding: 50px;
	}
	.alert {
		padding: 1rem;
		border-radius: 8px;
		background-color: #f8d7da;
		color: #721c24;
		margin-bottom: 1rem;
	}
	.confirmation {
		padding: 1rem;
		border-radius: 8px;
		background-color: #d4edda;
		color: #155724;
		margin-bottom: 1rem;
	}
	.confirmation-link {
		color: #0a3622;
		text-decoration: underline;
		font-weight: bold;
	}

	.confirmation-link:hover {
		color: #051b11;
	}
	.popup-overlay {
		position: fixed;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		background-color: rgba(0, 0, 0, 0.5);
		display: flex;
		justify-content: center;
		align-items: center;
		z-index: 1000;
	}

	.popup-content {
		background-color: white;
		padding: 30px;
		padding-top: 20px;
		border-radius: 8px;
		width: 90%;
		max-width: 500px;
		max-height: 80vh;
		overflow-y: auto;
		position: relative;
	}

	.popup-content h3 {
		margin: 0;
		font-weight: 600;
		color: #333;
	}

	.close-popup {
		position: absolute;
		top: 10px;
		right: 20px;
		font-size: 24px;
		background: none;
		border: none;
		cursor: pointer;
	}
</style>

