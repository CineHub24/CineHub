
<script lang="ts">
	import { enhance } from '$app/forms';
	import type { PageServerData } from '../$types';

	let { data }: { data: PageServerData } = $props();
</script>
<h1>Admin Tool {data} </h1>