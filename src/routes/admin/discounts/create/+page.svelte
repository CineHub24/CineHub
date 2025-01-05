<script lang="ts">



</script>



    <h1>Create Discount</h1>
    <form action="?/create" method="post">
        <label for="name">Name</label>
        <input type="text" id="name" name="name" required>
        <label for="code">Code</label>
        <input type="text" id="code" name="code" required>
        <label for="discount">Discount</label>
        <input type="number" id="discount" name="discount" required>
        <label for="expires">Expires</label>        
        <input type="date" id="expires" name="expires" required>
        <select id="type" name="type" required>
            <option value="percentage">Percentage</option>
            <option value="fixed">Fixed</option>
        </select>
        <button type="submit">Create</button>
    </form>