<script lang="ts">
	import { enhance } from '$app/forms';
	import { page } from '$app/stores';
	import type { PageServerData } from './$types';
	import * as m from '$lib/paraglide/messages.js';

	export let data: PageServerData;
	const { user } = data;

	$: userName =
		user.firstname ||
		(user.email ? capitalizeFirstLetter(getFirstNameFromEmail(user.email)) : '') ||
		'';

	let formData = {
		firstname: user.firstname || '',
		lastname: user.lastname || ''
	};

	let showSuccess = false;
	let showPasswordChanged = $page.url.searchParams.has('passwordChanged');
	let isFormModified = false;

	function handleInputChange(event: Event) {
		const input = event.target as HTMLInputElement;
		formData = { ...formData, [input.name]: input.value };

		isFormModified =
			formData.firstname !== (user.firstname || '') || formData.lastname !== (user.lastname || '');
	}

	function getFirstNameFromEmail(email: string): string {
		if (!email) return m.default_user({});
		const localPart = email.split('@')[0];
		return localPart.includes('.') ? localPart.split('.')[0] : localPart;
	}

	function capitalizeFirstLetter(str: string): string {
		if (!str) return '';
		return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
	}

	const submitForm = () => {
		return async ({ result, update }) => {
			if (result.type === 'success') {
				showSuccess = true;
				isFormModified = false;

				// Update the user data
				user.firstname = formData.firstname;
				user.lastname = formData.lastname;

				setTimeout(() => {
					showSuccess = false;
					showPasswordChanged = false;
				}, 10000);
			}
		};
	};
</script>

<div class="profile-container">
	<div class="profile-card">
		{#if user}
			<div class="avatar">{userName[0].toUpperCase()}</div>
			<h1>{m.welcome({})}, {userName}!</h1>

			{#if showSuccess}
				<div class="success-message">
					<span class="success-icon">✓</span>
					{m.changes_saved_successfully({})}
				</div>
			{/if}

			{#if showPasswordChanged}
				<div class="success-message">
					<span class="success-icon">✓</span>
					{m.password_changed_successfully({})}
				</div>
			{/if}

			<form
				id="updateProfile"
				method="post"
				action="?/updateProfile"
				use:enhance={submitForm}
				class="edit-profile-form"
			>
				<div class="form-group">
					<label for="firstname">{m.first_name({})}</label>
					<input
						type="text"
						id="firstname"
						name="firstname"
						bind:value={formData.firstname}
						on:input={handleInputChange}
						class="form-input"
					/>
				</div>

				<div class="form-group">
					<label for="lastname">{m.last_name({})}</label>
					<input
						type="text"
						id="lastname"
						name="lastname"
						bind:value={formData.lastname}
						on:input={handleInputChange}
						class="form-input"
					/>
				</div>

				<div class="form-group">
					<label for="email">{m.email({})}</label>
					<p id="email" class="form-text">{user.email}</p>
				</div>
			</form>

			<div class="user-info">
				{#if user.role !== 'user'}
					<p class="role">{capitalizeFirstLetter(user.role)}</p>
				{/if}
				<p class="user-id">{m.user_id({})}: {user.id}</p>
			</div>

			<div class="button-container">
				<button type="submit" form="updateProfile" class="save-btn" disabled={!isFormModified}>
					{m.save({})}
				</button>
				<a href="/profile/change-password" class="change-password-btn"> {m.change_password({})} </a>
				<form method="post" action="?/logout" use:enhance class="logout-form">
					<button class="logout-btn">{m.logout({})}</button>
				</form>
			</div>
		{/if}
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
		max-width: 550px;
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
	.success-message {
		background-color: #d4edda;
		color: #155724;
		padding: 1rem;
		border-radius: 5px;
		margin-bottom: 1.5rem;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.5rem;
		animation: slideDown 0.3s ease-out;
	}
	.success-icon {
		font-size: 1.2rem;
		font-weight: bold;
	}
	@keyframes slideDown {
		from {
			transform: translateY(-20px);
			opacity: 0;
		}
		to {
			transform: translateY(0);
			opacity: 1;
		}
	}
	h1 {
		color: #2c3e50;
		font-size: 1.5rem;
		margin-bottom: 1.5rem;
	}
	.edit-profile-form {
		margin-bottom: 2rem;
	}
	.form-group {
		margin-bottom: 1rem;
		text-align: left;
	}
	.form-group label {
		display: block;
		margin-bottom: 0.5rem;
		color: #2c3e50;
		font-size: 0.9rem;
	}
	.form-input {
		width: 100%;
		padding: 0.75rem;
		border: 1px solid #dfe6e9;
		border-radius: 5px;
		font-size: 1rem;
		transition: border-color 0.3s ease;
	}
	.form-input:focus {
		outline: none;
		border-color: #3498db;
	}
	.button-container {
		display: flex;
		justify-content: center;
		gap: 1rem;
		margin-top: 1rem;
		flex-wrap: wrap;
	}
	.save-btn,
	.change-password-btn,
	.logout-btn {
		border: none;
		border-radius: 5px;
		padding: 0.75rem 1.5rem;
		font-size: 1rem;
		cursor: pointer;
		transition: all 0.3s ease;
		text-decoration: none;
	}
	.save-btn {
		background-color: #2ecc71;
		color: white;
	}
	.save-btn:disabled {
		background-color: #bdc3c7;
		cursor: not-allowed;
		opacity: 0.7;
	}
	.save-btn:not(:disabled):hover {
		background-color: #27ae60;
	}
	.change-password-btn {
		background-color: #f39c12;
		color: white;
	}
	.change-password-btn:hover {
		background-color: #d68910;
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
	.logout-btn {
		background-color: #3498db;
		color: white;
	}
	.logout-btn:hover {
		background-color: #2980b9;
	}
	.logout-form {
		margin: 0;
	}
	.form-text {
		background-color: #f9f9f9;
		padding: 0.75rem;
		border: 1px solid #dfe6e9;
		border-radius: 5px;
		color: #2c3e50;
		font-size: 1rem;
		margin-top: 0.25rem;
	}
</style>
