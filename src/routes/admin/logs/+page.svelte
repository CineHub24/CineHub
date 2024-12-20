<script lang="ts">
    import { onMount } from 'svelte';

    let logs = $state([]);
    let error = null;
  
    onMount(async () => {
      try {
        const response = await fetch('/api/logs');
        if (response.ok) {
          logs = await response.json();
        } else {
          error = 'Failed to load logs';
        }
      } catch (err) {
        error = 'Error fetching logs';
      }
    });
  </script>
  
  <div class="container">
    <h1>System Logs</h1>
    {#if error}
      <p class="error-message">{error}</p>
    {:else}
      <table class="logs-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Level</th>
            <th>Message</th>
            <th>Metadata</th>
            <th>Timestamp</th>
          </tr>
        </thead>
        <tbody>
          {#each logs as log}
            <tr>
              <td>{log.id}</td>
              <td class={log.level}>{log.level}</td>
              <td>{log.message}</td>
              <td><pre>{JSON.stringify(log.metadata, null, 2)}</pre></td>
              <td>{new Date(log.createdAt).toLocaleString()}</td>
            </tr>
          {/each}
        </tbody>
      </table>
    {/if}
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
  
    .logs-table th, .logs-table td {
      border: 1px solid #ddd;
      padding: 10px;
      text-align: left;
    }
  
    .logs-table th {
      background-color: #f2f2f2;
    }
  
    .info { color: blue; }
    .warn { color: orange; }
    .error { color: red; }
  
    pre {
      white-space: pre-wrap;
      word-wrap: break-word;
      max-width: 300px;
    }
  </style>
  