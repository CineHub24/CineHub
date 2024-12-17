<script lang="ts">
    import { page } from '$app/stores';
    import { onMount } from 'svelte';
  
    // State for form inputs
    let name = $state('');
    let description = $state('');
    let price = $state('');
    let emoji = $state('');
  

  
    // Clear feedback messages when the page is loaded
 

    let data = $props();

    let successMessage = $state('');
    let errorMessage = $state('');

    // onMount(() => {
    //   successMessage = '';
    //   errorMessage = '';
    // });

    console.log(data)

    if (data?.form?.success) {
    successMessage = data.form?.message;
    errorMessage = '';
    } else if (data?.form?.error) {
    errorMessage = data.form?.message;
    successMessage = '';
    }
  </script>
  
  <h1>Create New Seat Category</h1>
  
  <form method="POST" action="?/createCategory" >
    <div>
      <label for="name">Category Name:</label>
      <input type="text" id="name" name="name" bind:value={name} required />
    </div>
  
    <div>
      <label for="description">Description:</label>
      <textarea id="description" name="description" bind:value={description} required></textarea>
    </div>
  
    <div>
      <label for="price">Price:</label>
      <input type="number" id="price" name="price" step="0.01" bind:value={price} required />
    </div>

    <div>
        <label for="emoji">Emoji:</label>
        <input type="text" id="emoji" name="emoji" bind:value={emoji} required />
      </div>
  
    <button type="submit">Create Category</button>
  



  </form>
  

    {#if successMessage}
        <p class="success">{successMessage}</p>
    {/if}

    {#if errorMessage}
        <p class="error">{errorMessage}</p>
    {/if}


  <style>
    form {
      display: flex;
      flex-direction: column;
      gap: 15px;
      max-width: 400px;
      margin: auto;
    }
  
    label {
      font-weight: bold;
    }
  
    input, textarea {
      width: 100%;
      padding: 8px;
      box-sizing: border-box;
    }
  
    button {
      padding: 10px;
      background-color: #007bff;
      color: white;
      border: none;
      cursor: pointer;
      font-size: 16px;
      border-radius: 5px;
    }
  
    button:hover {
      background-color: #0056b3;
    }
  
    .success {
    color: greenyellow;
    font-weight: bold;
    }
  
    .error {
      color: red;
      font-weight: bold;
    }
  </style>
  