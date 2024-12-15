<!-- HOW TO USE
<Header 
  user={{ email: user?.email || 'Guest' }}
  onLanguageSwitch={() => switchToLanguage("en")}
  buttons={[
    { label: 'Action 1', onClick: handleAction1 },
    { label: 'Action 2', onClick: handleAction2 },
  ]}
/>
-->

<script lang="ts">
    import { goto } from '$app/navigation';

    export let onLanguageSwitch: () => void;
    export let user: { email: string };
    export let buttons: Array<{ label: string; onClick: () => void }> | undefined;

    // Navigate to the login page or call the provided handler
    function goToLogin() {
        if (onLoginClick) {
            onLoginClick();
        } else {
            goto('/login');
        }
    }

    // Switch language or log the fallback action
    function switchLanguage() {
        if (onLanguageSwitch) {
            onLanguageSwitch();
        } else {
            console.log('Switch language functionality');
        }
    }

    function onLoginClick() {
        goto('/login');
    }

    function onProfileClick() {
        goto('/profile');
    }

    // Extract the first letter of the user's email
    const userInitial = user?.email?.charAt(0)?.toUpperCase() || '?';
</script>

<style>
    .header {
        background-color: #111;
        color: #fff;
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 10px 20px;
        position: sticky;
        top: 0;
        z-index: 1000;
    }
    .header .title {
        font-size: 1.5rem;
        font-weight: bold;
    }
    .profile-container {
        position: relative;
        display: inline-block;
    }
    .profile-btn {
        border: none;
        padding: 8px 16px;
        color: #fff;
        border-radius: 5px;
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 8px;
    }
    .profile-btn:hover {
        background-color: #d87c08;
    }
    .profile-circle {
        background-color: #fff;
        color: #111;
        width: 30px;
        height: 30px;
        display: flex;
        justify-content: center;
        align-items: center;
        border-radius: 50%;
        font-weight: bold;
        font-size: 1rem;
    }
    .dropdown {
        display: none;
        position: absolute;
        top: 100%;
        right: 0;
        background-color: #fff;
        color: #111;
        border: 1px solid #ddd;
        border-radius: 5px;
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        z-index: 1000;
        width: 150px;
    }
    .profile-container:hover .dropdown {
        display: block;
    }
    .dropdown button {
        background: none;
        border: none;
        padding: 10px;
        width: 100%;
        text-align: left;
        cursor: pointer;
        color: #111;
    }
    .dropdown button:hover {
        background-color: #f3f3f3;
    }
</style>

<div class="header">
    <div class="title">CineHub</div>
    {#if buttons}
                {#each buttons as { label, onClick }}
                    <button onclick={onClick}>{label}</button>
                {/each}
            {/if}
    <div class="profile-container">
        <button class="profile-btn" onclick={onProfileClick}>
            <div class="profile-circle">{userInitial}</div>
            Mein Profil
        </button>
        <div class="dropdown">
            <button onclick={goToLogin}>Login / Register</button>
            <button onclick={switchLanguage}>Switch to Deutsch</button>
        </div>
    </div>
</div>