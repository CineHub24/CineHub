<!-- src/routes/newsletter/unsubscribed/+page.svelte -->
<div class="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
    <div class="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
      <svg class="w-16 h-16 mx-auto mb-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
      </svg>
      
      <h1 class="text-2xl font-bold text-gray-900 mb-4">
        Erfolgreich abgemeldet
      </h1>
      
      <p class="text-gray-600 mb-6">
        Sie wurden erfolgreich von unserem Newsletter abgemeldet. Sie werden keine weiteren E-Mails von uns erhalten.
      </p>
      
      <a 
        href="/" 
        class="inline-block px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors duration-200"
      >
        Zur Startseite
      </a>
    </div>
  </div>