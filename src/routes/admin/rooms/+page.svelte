<script lang="ts">
  // Import the `cinemaHalls` from the load function
  let data = $props();

  let cinemaHalls = $state(data.data.cinemaHalls);
</script>

<div class="container">
  <div class="header">
    <a href="/admin/rooms/add/9999" class="add-button">+</a>
  </div>

  <h2>Cinema Halls</h2>

  {#if cinemaHalls.length > 0}
    <ul class="hall-list">
      {#each cinemaHalls as hall}
        <li class="hall-item">
          <div class="hall-details">
            <span><strong>Name:</strong> {hall.name}</span>
            <span><strong>Capacity:</strong> {hall.capacity}</span>
          </div>
          <div class="button-group">
            <a href={`/admin/rooms/add/${hall.id}`} class="edit-button">Edit</a>
            <form action="?/deleteCinemaHall" method="POST">
              <input type="hidden" name="hallId" value={hall.id} />
              <button class="delete-button" type="submit">Delete</button>
            </form>
          </div>
        </li>
      {/each}
    </ul>
  {:else}
    <p>No cinema halls available.</p>
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

  h2 {
    text-align: center;
    color: #333;
  }

  .hall-list {
    list-style: none;
    padding: 0;
  }

  .hall-item {
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

  .hall-item:hover {
    background-color: #f0f0f0;
    border-color: #bbb;
  }

  .hall-details {
    display: flex;
    flex-direction: column;
    gap: 5px;
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
