<script lang="ts">
	import { enhance } from '$app/forms';
	import type { ActionData } from './$types';

	let { form }: { form: ActionData } = $props();
</script>

<h1>Register</h1>

<a href="/login/google">Sign in with Google</a>
<a href="/login/github">Sign in with GitHub</a>

<form method="post" action="?/register" use:enhance>
	<label>
		Email
		<input name="email" />
	</label>
	<label>
		Password
		<input type="password" name="password" />
	</label>
	<button>Register</button>
</form>
<a href="/login">Login</a>
<p style="color: red">{form?.message ?? ''}</p>
