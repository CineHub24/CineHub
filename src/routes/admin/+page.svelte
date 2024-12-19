<script lang="ts">
    // Define any additional admin-related data here if needed
  </script>
  
  <div class="admin-container">
    <h1>Admin Overview</h1>
    
    <div class="admin-sections">
      <div class="section-card">
        <h2>Seat Categories</h2>
        <p>Manage and update seat categories.</p>
        <a href="/admin/rooms/seat_category" class="link-button">Go to Seat Category Settings</a>
      </div>
  
      <div class="section-card">
        <h2>User Management</h2>
        <p>View and manage users.</p>
        <a href="/admin/users" class="link-button">Go to User Management</a>
      </div>
  
      <div class="section-card">
        <h2>Room Settings</h2>
        <p>Configure room-related settings.</p>
        <a href="/admin/rooms" class="link-button">Go to Room Settings</a>
      </div>
  
      <div class="section-card">
        <h2>System Logs</h2>
        <p>View system activity and logs.</p>
        <a href="/admin/logs" class="link-button">Go to System Logs</a>
      </div>
    </div>
  </div>
  
  <style>
    .admin-container {
      max-width: 800px;
      margin: 40px auto;
      padding: 20px;
      background-color: #f9f9f9;
      border-radius: 10px;
      box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.1);
      text-align: center;
    }
  
    h1 {
      color: #333;
      margin-bottom: 30px;
    }
  
    .admin-sections {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
    }
  
    .section-card {
      background-color: #fff;
      padding: 20px;
      border: 1px solid #ddd;
      border-radius: 10px;
      box-shadow: 0px 2px 5px rgba(0, 0, 0, 0.1);
      text-align: left;
    }
  
    .section-card h2 {
      margin-top: 0;
      color: #444;
    }
  
    .section-card p {
      color: #666;
      margin-bottom: 15px;
    }
  
    .link-button {
      display: inline-block;
      padding: 10px 15px;
      background-color: #4CAF50;
      color: white;
      text-decoration: none;
      border-radius: 5px;
      transition: background-color 0.3s;
    }
  
    .link-button:hover {
      background-color: #45a049;
    }
  </style>
  