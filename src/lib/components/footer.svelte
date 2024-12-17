<script>
	import * as m from '$lib/paraglide/messages.js';
  const currentYear = new Date().getFullYear();
</script>

<footer class="bg-gray-100 text-gray-800">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <div class="grid grid-cols-1 md:grid-cols-4 gap-8">
      <!-- About Section -->
      <div>
        <h3 class="text-lg font-semibold mb-4">{m.about({})}</h3>
        <p class="text-sm">
          {m.about_us_text({})}
        </p>
      </div>
      <!-- Links Section -->
      <div>
        <h3 class="text-lg font-semibold mb-4">{m.quick_links({})}</h3>
        <ul class="space-y-2">
          <li><a href="/" class="hover:text-gray-600 transition">{m.home({})}</a></li>
          <li><a href="/program" class="hover:text-gray-600 transition">{m.program({})}</a></li>
          <li><a href="/tickets" class="hover:text-gray-600 transition">{m.tickets({})}</a></li>
          <li><a href="/about" class="hover:text-gray-600 transition">{m.about({})}</a></li>
        </ul>
      </div>
      <!-- Resources Section -->
      <div>
        <h3 class="text-lg font-semibold mb-4">{m.legal({})}</h3>
        <ul class="space-y-2">
          <li><a href="#" class="hover:text-gray-600 transition">{m.privacy_policy({})}</a></li>
          <li><a href="#" class="hover:text-gray-600 transition">{m.terms_of_service({})}</a></li>
          <li><a href="#" class="hover:text-gray-600 transition">{m.imprint({})}</a></li>
        </ul>
      </div>
      <!-- Newsletter Section -->
      <div>
        <h3 class="text-lg font-semibold mb-4">{m.stay_in_touch({})}</h3>
        <p class="text-sm mb-4">
          {m.newsletter_text({})}
        </p>
        <form class="flex space-x-2">
          <input
            type="email"
            placeholder={m.your_email({})}
            class="w-full px-3 py-2 rounded-md bg-gray-200 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            class="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition"
          >
            {m.subscribe({})}
          </button>
        </form>
      </div>
    </div>
    <div class="border-t border-gray-300 mt-8 pt-4 text-center text-sm">
      <p>&copy; {currentYear} CineHub. {m.copy_right({})}</p>
    </div>
  </div>
</footer>
