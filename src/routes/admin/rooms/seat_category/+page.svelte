<script lang="ts">
  let data = $props();
  let categories = $state(data.data.data.categories.sort((a, b) => a.id - b.id));
  console.log(categories);
</script>

<div class="container">
  <div class="header">
    <h2>Seat Categories</h2>
    <a href="/admin/rooms/seat_category/add" class="add-button">Add Category</a>
  </div>

  {#if categories.length > 0}
    <ul class="category-list">
      {#each categories as category}
        <li class="category-item">
          <div class="category-details">
            <div class="category-header">
              <span class="emoji">{category.emoji}</span>
              <span class="name"><strong>{category.name}</strong></span>
            </div>
            <span class="description">{category.description}</span>
            <span class="price"><strong>Price:</strong> ${category.price}</span>
          </div>
          <div class="button-group">
            <a href={`/admin/rooms/seat_category/${category.id}`} class="edit-button">Edit</a>
            <form action="?/deleteCategory" method="POST">
              <input type="hidden" name="categoryId" value={category.id} />
              <button class="delete-button" type="submit">Delete</button>
            </form>
          </div>
        </li>
      {/each}
    </ul>
  {:else}
    <p>No seat categories available.</p>
  {/if}
</div>

<style>
  .container {
    max-width: 600px;
    margin: 20px auto;
    padding: 20px;
    background-color: #f5f5f5;
    border-radius: 10px;
    box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.1);
  }

  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
  }

  h2 {
    color: #333;
    margin: 0;
  }

  .add-button {
    padding: 10px 20px;
    background-color: #007bff;
    color: white;
    text-decoration: none;
    border-radius: 5px;
    transition: background-color 0.3s;
  }

  .add-button:hover {
    background-color: #0056b3;
  }

  .category-list {
    list-style: none;
    padding: 0;
  }

  .category-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    background-color: #fff;
    padding: 15px;
    margin-bottom: 10px;
    border: 1px solid #ddd;
    border-radius: 5px;
    transition: background-color 0.3s, border-color 0.3s;
  }

  .category-item:hover {
    background-color: #f0f0f0;
    border-color: #bbb;
  }

  .category-details {
    display: flex;
    flex-direction: column;
    gap: 8px;
    flex-grow: 1;
  }

  .category-header {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .emoji {
    font-size: 24px;
  }

  .name {
    font-size: 18px;
  }

  .description {
    color: #666;
    font-size: 14px;
  }

  .price {
    color: #2c5282;
  }

  .button-group {
    display: flex;
    gap: 10px;
  }

  .edit-button {
    padding: 10px 20px;
    background-color: #4CAF50;
    color: white;
    text-decoration: none;
    border-radius: 5px;
    transition: background-color 0.3s;
  }

  .edit-button:hover {
    background-color: #45a049;
  }

  .delete-button {
    padding: 10px 20px;
    background-color: #ff5555;
    color: white;
    border: none;
    cursor: pointer;
    border-radius: 5px;
    transition: background-color 0.3s;
  }

  .delete-button:hover {
    background-color: #d94444;
  }

  p {
    text-align: center;
    color: #777;
  }
</style>