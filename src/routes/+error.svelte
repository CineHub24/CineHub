<script>
    import { page } from '$app/stores';
  </script>
  
  <div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8 text-center">
      <!-- Error Illustration -->
      <div class="mx-auto w-48 h-48 relative">
        <div class="absolute inset-0">
          <svg class="w-full h-full" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
            <!-- Background Circle -->
            <circle cx="100" cy="100" r="96" fill="#EFF6FF" />
            <!-- Sad Face -->
            <circle cx="100" cy="100" r="70" stroke="#2563EB" stroke-width="6" stroke-linecap="round" />
            <!-- Eyes -->
            <circle cx="70" cy="85" r="8" fill="#2563EB" />
            <circle cx="130" cy="85" r="8" fill="#2563EB" />
            <!-- Sad Mouth -->
            <path d="M70 130C70 130 85 115 100 115C115 115 130 130 130 130" stroke="#2563EB" stroke-width="6" stroke-linecap="round" />
          </svg>
        </div>
      </div>
  
      <!-- Error Message -->
      <div class="space-y-6">
        <h1 class="text-4xl font-bold text-gray-900">
          {#if $page.error?.message}
            {$page.error.message}
          {:else if $page.status === 404}
            Seite nicht gefunden
          {:else}
            Ein Fehler ist aufgetreten
          {/if}
        </h1>
  
        <p class="text-lg text-gray-600">
          {#if $page.status === 404}
            Die von dir gesuchte Seite konnte leider nicht gefunden werden.
          {:else}
            Es tut uns leid, aber etwas ist schief gelaufen. Bitte versuche es später erneut.
          {/if}
        </p>
  
        <!-- Error Details (only in dev) -->
        {#if import.meta.env.DEV && $page.error?.stack}
          <div class="mt-4 p-4 bg-gray-100 rounded-lg">
            <pre class="text-left text-sm text-gray-700 overflow-auto">
              {$page.error.stack}
            </pre>
          </div>
        {/if}
  
        <!-- Action Buttons -->
        <div class="flex flex-col sm:flex-row gap-4 justify-center mt-8">
          <button
            class="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            on:click={() => history.back()}
          >
            Zurück
          </button>
          
          <a
            href="/"
            class="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-blue-600 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 shadow-sm transition-colors"
          >
            Zur Startseite
          </a>
        </div>
      </div>
  
      <!-- Additional Help -->
      <div class="mt-8 text-sm text-gray-500">
        <p>
          Sollte das Problem weiterhin bestehen, 
          <a href="/about-us" class="text-blue-600 hover:text-blue-500">
            kontaktiere uns
          </a>
          bitte.
        </p>
      </div>
    </div>
  </div>