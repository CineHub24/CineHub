<script lang="ts">
    import { enhance } from '$app/forms';
    export let user: { email: string; role: string; id: string };
    export let m: { hello_world: ({ name }: { name: string }) => string };

    function switchToLanguage(language: 'en' | 'de') {
        console.log(`Switched to ${language}`);
        // Add logic for switching language here
    }
</script>

<style>
    .profile {
        max-width: 600px;
        margin: 2rem auto;
        padding: 1rem;
        background-color: #f9f9f9;
        border-radius: 10px;
        box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
    }
    h1, h2 {
        text-align: center;
    }
    form {
        text-align: center;
        margin-top: 1rem;
    }
    .buttons {
        display: flex;
        justify-content: center;
        gap: 1rem;
        margin-top: 1rem;
    }
    button {
        padding: 0.5rem 1rem;
        font-size: 1rem;
        border: none;
        border-radius: 5px;
        cursor: pointer;
    }
    button:hover {
        background-color: #d87c08;
        color: #fff;
    }
</style>

<div class="profile">
    <h1>Hi, {user.email}!</h1>
    <h2>{user.role}</h2>
    <p>Your user ID is {user.id}.</p>
    <form method="post" action="?/logout" use:enhance>
        <button>Sign out</button>
    </form>

    <h1>{m.hello_world({ name: 'SvelteKit User' })}</h1>
    <div class="buttons">
        <button onclick={() => switchToLanguage('en')}>en</button>
        <button onclick={() => switchToLanguage('de')}>de</button>
    </div>
</div>
