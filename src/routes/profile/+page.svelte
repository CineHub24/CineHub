<script lang="ts">
	import { enhance } from '$app/forms';
	import type { PageServerData } from './$types';
	export let data: PageServerData;
	const { user } = data;

	const userName =
			user.firstname ||
			(user.email ? capitalizeFirstLetter(getFirstNameFromEmail(user.email)) : '') ||
			'';


	function getFirstNameFromEmail(email: string): string {
		if (!email) return 'User';
		// Teil vor dem @ extrahieren
		const localPart = email.split('@')[0];
		// Teil vor einem Punkt (.) als ersten Namen verwenden, wenn vorhanden
		return localPart.includes('.') ? localPart.split('.')[0] : localPart;
	}

	function capitalizeFirstLetter(str: string): string {
		if (!str) return '';
		return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
	}
</script>

<div class="profile-container">
	<div class="profile-card">
		{#if user}
			<div class="avatar">{userName[0].toUpperCase()}</div>
			<h1>Willkommen, {userName}!</h1>
			<div class="user-info">
				<p class="role">{capitalizeFirstLetter(user.role)}</p>
				<p class="user-id">Benutzer-ID: {user.id}</p>
			</div>
			<!-- <div class="stats">
				<div class="stat-item">
					<span class="stat-value">0</span> <span class="stat-label">Reservierungen</span>
				</div>
				<div class="stat-item">
					<span class="stat-value">0</span> <span class="stat-label">Besuche</span>
				</div>
			</div> -->
		{/if}
		<form method="post" action="?/logout" use:enhance>
			<button class="logout-btn">Abmelden</button>
		</form>
	</div>
</div>

<style>
	.profile-container {
		display: flex;
		justify-content: center;
		align-items: center;
		background-color: #f0f4f8;
		padding: 2rem;
	}
	.profile-card {
		background-color: white;
		border-radius: 15px;
		box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
		padding: 2rem;
		width: 100%;
		max-width: 400px;
		text-align: center;
	}
	.avatar {
		width: 80px;
		height: 80px;
		border-radius: 50%;
		background-color: #3498db;
		color: white;
		font-size: 2rem;
		display: flex;
		justify-content: center;
		align-items: center;
		margin: 0 auto 1rem;
	}
	h1 {
		color: #2c3e50;
		font-size: 1.5rem;
		margin-bottom: 0.5rem;
	}
	.user-info {
		margin-bottom: 1.5rem;
	}
	.role {
		color: #3498db;
		font-weight: bold;
		margin-bottom: 0.25rem;
	}
	.user-id {
		color: #7f8c8d;
		font-size: 0.9rem;
	}
	.stats {
		display: flex;
		justify-content: space-around;
		margin-bottom: 1.5rem;
	}
	.stat-item {
		display: flex;
		flex-direction: column;
	}
	.stat-value {
		font-size: 1.5rem;
		font-weight: bold;
		color: #2c3e50;
	}
	.stat-label {
		font-size: 0.9rem;
		color: #7f8c8d;
	}
	.logout-btn {
		background-color: #3498db;
		color: white;
		border: none;
		border-radius: 5px;
		padding: 0.75rem 1.5rem;
		font-size: 1rem;
		cursor: pointer;
		transition: background-color 0.3s ease;
	}
	.logout-btn:hover {
		background-color: #2980b9;
	}
</style>
