// /routes/admin/rooms/seat_category/[id]/+page.svelte
<script lang="ts">
  let data = $props();
  let form = data.form;
  let category = data.data.data.category;
</script>

<div class="container">
  <h2>Edit Seat Category</h2>

  <form method="POST" action="?/updateCategory">
    <div class="form-group">
      <label for="name">Category Name:</label>
      <input 
        type="text" 
        id="name" 
        name="name" 
        value={form?.values?.name || category.name} 
        required
      />
    </div>

    <div class="form-group">
      <label for="description">Description:</label>
      <textarea 
        id="description" 
        name="description" 
        required
      >{form?.values?.description || category.description}</textarea>
    </div>

    <div class="form-group">
      <label for="price">Price:</label>
      <input 
        type="number" 
        id="price" 
        name="price" 
        step="0.01" 
        value={form?.values?.price || category.price} 
        required
      />
    </div>

    <div class="form-group">
      <label for="emoji">Emoji:</label>
      <input 
        type="text" 
        id="emoji" 
        name="emoji" 
        value={form?.values?.emoji || category.emoji} 
        required
      />
    </div>

    {#if form?.error}
      <div class="error-message">{form.message}</div>
    {/if}

    <div class="button-group">
      <a href="/admin/rooms/seat_category" class="cancel-button">Cancel</a>
      <button type="submit" class="submit-button">Update Category</button>
    </div>
  </form>
</div>

<style>
  /* Same styles as add page */
  .container {
    max-width: 600px;
    margin: 20px auto;
    padding: 20px;
    background-color: #f5f5f5;
    border-radius: 10px;
    box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.1);
  }

  h2 {
    color: #333;
    margin-bottom: 20px;
    text-align: center;
  }

  .form-group {
    margin-bottom: 15px;
  }

  label {
    display: block;
    margin-bottom: 5px;
    color: #333;
    font-weight: bold;
  }

  input, textarea {
    width: 100%;
    padding: 8px;
    border: 1px solid #ddd;
    border-radius: 5px;
    font-size: 16px;
  }

  textarea {
    height: 100px;
    resize: vertical;
  }

  .button-group {
    display: flex;
    gap: 10px;
    justify-content: flex-end;
    margin-top: 20px;
  }

  .submit-button {
    padding: 10px 20px;
    background-color: #4CAF50;
    color: white;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    transition: background-color 0.3s;
  }

  .submit-button:hover {
    background-color: #45a049;
  }

  .cancel-button {
    padding: 10px 20px;
    background-color: #777;
    color: white;
    text-decoration: none;
    border-radius: 5px;
    transition: background-color 0.3s;
  }

  .cancel-button:hover {
    background-color: #666;
  }

  .error-message {
    color: #ff5555;
    margin-bottom: 15px;
    padding: 10px;
    background-color: #fff;
    border: 1px solid #ff5555;
    border-radius: 5px;
  }
</style>