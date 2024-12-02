<script>
	export let data;
	//   export let form;
	const { movies } = data;
</script>

<form method="POST" action="?/search">
	<input name="query" type="text" placeholder="Enter Film-Name" />
	<button>Log in</button>
</form>
