<script lang="ts">
	import { enhance } from '$app/forms';
	import type { ActionData } from './$types';

	let { form }: { form: ActionData } = $props();
</script>

<h1>Login</h1>

<a href="/login/google">Sign in with Google</a>
<a href="/login/github">Sign in with GitHub</a>

<form method="post" action="?/login" use:enhance>
	<label>
		Email
		<input name="email" />
	</label>
	<label>
		Password
		<input type="password" name="password" />
	</label>
	<button>Login</button>
</form>
<a href="/register">Register</a>
<p style="color: red">{form?.message ?? ''}</p>
