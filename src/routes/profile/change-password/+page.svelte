<script lang="ts">
    import { enhance } from '$app/forms';
	import { validatePassword } from '$lib/utils/user';

    // Types for the change password form
    interface ActionData {
        error?: string;
        invalidCurrent?: boolean;
        invalid?: boolean;
        mismatch?: boolean;
    }

    // Update the script tag type definition
    export let form: ActionData | null = null;

    let showPassword = {
        current: false,
        new: false,
        confirm: false
    };

    let formData = {
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    };

    // Validation states
    let validationErrors = {
        newPassword: '',
        confirmPassword: ''
    };

    function handlePasswordInput() {
        const isPasswordValid = validatePassword(formData.newPassword);

        if (!isPasswordValid) {
            validationErrors.newPassword = 'Das neue Passwort muss Groß- & Kleinbuchstaben, Zahlen sowie Sonderzeichen enthalten und zwischen 8 und 255 Zeichen lang sein.';
        } else {
            validationErrors.newPassword = '';
        }

        if (formData.confirmPassword) {
            if (formData.newPassword !== formData.confirmPassword) {
                validationErrors.confirmPassword = 'Die Passwörter stimmen nicht überein';
            } else {
                validationErrors.confirmPassword = '';
            }
        }
    }

    function toggleShowPassword(field: keyof typeof showPassword) {
        showPassword[field] = !showPassword[field];
    }

    const submitForm = () => {
        return async ({ result, update }) => {
            await update();
        };
    };
</script>

<div class="password-change-container">
    <div class="password-change-card">
        <h1>{"Passwort ändern"}</h1>

        {#if form?.error}
            <div class="error-message">
                {form.error}
            </div>
        {/if}

        <form 
            method="post" 
            action="?/changePassword" 
            use:enhance={submitForm}
            class="password-change-form"
        >
            <div class="form-group">
                <label for="currentPassword">{"Derzeitiges Passwort"}</label>
                <div class="password-input-container">
                    <input 
                        type={showPassword.current ? 'text' : 'password'}
                        id="currentPassword"
                        name="currentPassword"
                        bind:value={formData.currentPassword}
                        class="form-input"
                        class:error={form?.invalidCurrent}
                        required
                    />
                    <button 
                        type="button"
                        class="toggle-password"
                        onclick={() => toggleShowPassword('current')}
                    >
                        {showPassword.current ? '👁️' : '👁️‍🗨️'}
                    </button>
                </div>
                {#if form?.invalidCurrent}
                    <span class="error-text">{"Das derzeitige Passwort ist nicht korrekt"}</span>
                {/if}
            </div>

            <div class="form-group">
                <label for="newPassword">{"Neues Passwort"}</label>
                <div class="password-input-container">
                    <input 
                        type={showPassword.new ? 'text' : 'password'}
                        id="newPassword"
                        name="newPassword"
                        bind:value={formData.newPassword}
                        oninput={handlePasswordInput}
                        class="form-input"
                        class:error={validationErrors.newPassword || form?.invalid}
                        required
                    />
                    <button 
                        type="button"
                        class="toggle-password"
                        onclick={() => toggleShowPassword('new')}
                    >
                        {showPassword.new ? '👁️' : '👁️‍🗨️'}
                    </button>
                </div>
                {#if validationErrors.newPassword}
                    <span class="error-text">{validationErrors.newPassword}</span>
                {/if}
            </div>

            <div class="form-group">
                <label for="confirmPassword">{"Password bestätigen"}</label>
                <div class="password-input-container">
                    <input 
                        type={showPassword.confirm ? 'text' : 'password'}
                        id="confirmPassword"
                        name="confirmPassword"
                        bind:value={formData.confirmPassword}
                        oninput={handlePasswordInput}
                        class="form-input"
                        class:error={validationErrors.confirmPassword || form?.mismatch}
                        required
                    />
                    <button 
                        type="button"
                        class="toggle-password"
                        onclick={() => toggleShowPassword('confirm')}
                    >
                        {showPassword.confirm ? '👁️' : '👁️‍🗨️'}
                    </button>
                </div>
                {#if validationErrors.confirmPassword}
                    <span class="error-text">{validationErrors.confirmPassword}</span>
                {/if}
            </div>

            <div class="button-container">
                <a href="/profile" class="cancel-btn">{"Abbrechen"}</a>
                <button type="submit" class="submit-btn" disabled={!!validationErrors.newPassword || !!validationErrors.confirmPassword}>
                    {"Passwort ändern"}
                </button>
            </div>
        </form>
    </div>
</div>

<style>
    .password-change-container {
        display: flex;
        justify-content: center;
        align-items: center;
        background-color: #f0f4f8;
        padding: 2rem;
        min-height: calc(100vh - 4rem);
    }

    .password-change-card {
        background-color: white;
        border-radius: 15px;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        padding: 2rem;
        width: 100%;
        max-width: 400px;
    }

    h1 {
        color: #2c3e50;
        font-size: 1.5rem;
        margin-bottom: 1.5rem;
        text-align: center;
    }

    .error-message {
        background-color: #fee2e2;
        color: #991b1b;
        padding: 1rem;
        border-radius: 5px;
        margin-bottom: 1.5rem;
        text-align: center;
    }

    .error-text {
        color: #dc2626;
        font-size: 0.875rem;
        margin-top: 0.5rem;
        display: block;
    }

    .form-group {
        margin-bottom: 1.5rem;
    }

    .form-group label {
        display: block;
        margin-bottom: 0.5rem;
        color: #2c3e50;
        font-size: 0.9rem;
    }

    .password-input-container {
        position: relative;
        display: flex;
        align-items: center;
    }

    .form-input {
        width: 100%;
        padding: 0.75rem;
        border: 1px solid #dfe6e9;
        border-radius: 5px;
        font-size: 1rem;
        transition: all 0.3s ease;
    }

    .form-input:focus {
        outline: none;
        border-color: #3498db;
        box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.2);
    }

    .form-input.error {
        border-color: #dc2626;
    }

    .toggle-password {
        position: absolute;
        right: 0.75rem;
        background: none;
        border: none;
        cursor: pointer;
        padding: 0.25rem;
    }

    .button-container {
        display: flex;
        gap: 1rem;
        margin-top: 2rem;
    }

    .submit-btn, .cancel-btn {
        flex: 1;
        padding: 0.75rem 1.5rem;
        border: none;
        border-radius: 5px;
        font-size: 1rem;
        cursor: pointer;
        transition: all 0.3s ease;
        text-align: center;
        text-decoration: none;
    }

    .submit-btn {
        background-color: #3498db;
        color: white;
    }

    .submit-btn:disabled {
        background-color: #94a3b8;
        cursor: not-allowed;
    }

    .submit-btn:not(:disabled):hover {
        background-color: #2980b9;
    }

    .cancel-btn {
        background-color: #e5e7eb;
        color: #4b5563;
    }

    .cancel-btn:hover {
        background-color: #d1d5db;
    }
</style>