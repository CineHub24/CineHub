<script lang="ts">
	import * as m from '$lib/paraglide/messages.js';
	const { data } = $props();
	const { logs } = data;
</script>

<div class="container">
	<h1 class="py-4">{m.system_logs({})}</h1>
	<table class="logs-table">
		<thead>
			<tr>
				<th>{m.id({})}</th>
				<th>{m.level({})}</th>
				<th>{m.message({})}</th>
				<th>{m.metadata({})}</th>
				<th>{m.timestamp({})}</th>
			</tr>
		</thead>
		<tbody>
			{#each logs as log}
				<tr>
					<td>{log.id}</td>
					<td class={log.level}>{log.level}</td>
					<td>{log.message}</td>
					<td><pre>{JSON.stringify(log.metadata, null, 2)}</pre></td>
					<td>{log.createdAt ? new Date(log.createdAt).toLocaleString() : m.not_available({})}</td>
				</tr>
			{/each}
		</tbody>
	</table>
</div>

<style>
	.container {
		max-width: 900px;
		margin: 40px auto;
		padding: 20px;
		background-color: #f9f9f9;
		border-radius: 10px;
		box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.1);
	}

	.logs-table {
		width: 100%;
		border-collapse: collapse;
	}

	.logs-table th,
	.logs-table td {
		border: 1px solid #ddd;
		padding: 10px;
		text-align: left;
	}

	.logs-table th {
		background-color: #f2f2f2;
	}

	.info {
		color: blue;
	}
	.warn {
		color: orange;
	}
	.error {
		color: red;
	}

	pre {
		white-space: pre-wrap;
		word-wrap: break-word;
		max-width: 300px;
	}
</style>
