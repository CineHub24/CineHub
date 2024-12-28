<script lang="ts">
	import { enhance } from '$app/forms';
	import type { PageServerData } from './$types';

	const { data }: { data: PageServerData } = $props();
	const { user } = data;
</script>

<div class="profile">
	{#if user}
		<h1>Hi, {user.email}!</h1>
		<h2>{user.role}</h2>
		<p>Your user ID is {user.id}.</p>
	{/if}
	<form method="post" action="?/logout" use:enhance>
		<button>Sign out</button>
	</form>
</div>


<style>
	.profile {
		max-width: 600px;
		margin: 2rem auto;
		padding: 1rem;
		background-color: #f9f9f9;
		border-radius: 10px;
		box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
	}
	h1,
	h2,
	p {
		text-align: center;
	}
	form {
		text-align: center;
		margin-top: 1rem;
	}
	.buttons {
		display: flex;
		justify-content: center;
		gap: 1rem;
		margin-top: 1rem;
	}
	button {
		padding: 0.5rem 1rem;
		font-size: 1rem;
		border: none;
		border-radius: 5px;
		cursor: pointer;
	}
	button:hover {
		background-color: #d87c08;
		color: #fff;
	}
</style>
