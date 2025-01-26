<script lang="ts">
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { languageTag, type AvailableLanguageTag } from '$lib/paraglide/runtime';
	import SearchBar from './SearchBar.svelte';
	import Cookies from 'js-cookie';
	import { LogOut, LogIn, Globe, ClipboardCheck, Settings } from 'lucide-svelte';

	import { i18n } from '$lib/i18n';
	import * as m from '$lib/paraglide/messages.js';
	import { languageAwareGoto } from '$lib/utils/languageAware';
	import { ShoppingBasket, TicketCheck } from 'lucide-svelte';
	import { showNotification } from '$lib/stores/notification';
import ShoppingCart from '$lib/components/ShoppingCart.svelte';
	

	let lang = languageTag();

	// Prop for website name
	export let siteName = 'CineHub';

	// User Name
	let userName = '';
	if ($page.data.user) {
		userName =
			$page.data.user.firstName ||
			capitalizeFirstLetter(getFirstNameFromEmail($page.data.user.email)) ||
			'';
	}

	// Ensure cinemas is reactive
	let cinemas: { id: string; name: string }[] = $page.data.cinemas;

	function handleCinemaChange(event: Event) {
		const target = event.target as HTMLSelectElement;
		Cookies.set('preferredCinema', target.value.toString());
		location.reload();
	}

	let showMenu = false; // Zustand für das Dropdown-Menü
	let timeout: number | undefined; // Variable für den Timeout

	// Array of greetings in different languages
	const greetings = [
		{ lang: 'German', greeting: 'Hallo' },
		{ lang: 'French', greeting: 'Bonjour' },
		{ lang: 'Spanish', greeting: 'Hola' },
		{ lang: 'Italian', greeting: 'Ciao' },
		{ lang: 'Japanese', greeting: 'こんにちは' },
		{ lang: 'Chinese', greeting: '你好' },
		{ lang: 'Arabic', greeting: 'مرحبا' },
		{ lang: 'Russian', greeting: 'Привет' },
		{ lang: 'Portuguese', greeting: 'Olá' },
		{ lang: 'Korean', greeting: '안녕하세요' },
		{ lang: 'Hindi', greeting: 'नमस्ते' },
		{ lang: 'Dutch', greeting: 'Hallo' },
		{ lang: 'Swedish', greeting: 'Hej' },
		{ lang: 'Turkish', greeting: 'Merhaba' },
		{ lang: 'Polish', greeting: 'Cześć' }
	];

	let randomGreeting = getRandomGreeting();

	function getFirstNameFromEmail(email: string): string {
		if (!email) return 'User';
		// Teil vor dem @ extrahieren
		const localPart = email.split('@')[0];
		// Teil vor einem Punkt (.) als ersten Namen verwenden, wenn vorhanden
		return localPart.includes('.') ? localPart.split('.')[0] : localPart;
	}

	function capitalizeFirstLetter(str: string): string {
		if (!str) return '';
		return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
	}

	// Function to get a random greeting
	function getRandomGreeting() {
		const randomIndex = Math.floor(Math.random() * greetings.length);
		return greetings[randomIndex];
	}

	// Funktionen für Hover mit Verzögerung
	function showDropdown() {
		if (timeout) clearTimeout(timeout); // Timeout zurücksetzen, falls der Benutzer erneut den Hover auslöst
		showMenu = true;
	}

	function hideDropdown() {
		// Verzögertes Ausblenden des Dropdowns
		setTimeout(() => {
			showMenu = false;
		}, 300);
	}

	function switchToLanguage(newLanguage: AvailableLanguageTag) {
		const canonicalPath = i18n.route($page.url.pathname);
		const localisedPath = i18n.resolveRoute(canonicalPath, newLanguage);
		goto(localisedPath);
	}
</script>

<header class="relative flex items-center bg-gray-100 p-4  shadow-md">
	<!-- Left: Logo und Site Name -->
	<div class="flex items-center justify-between">
		<a class="flex items-center space-x-4" href="/">
			<img src="/favicon_white_bg.png" alt="Logo" class="h-10 w-10" />
			<span class="text-xl font-bold text-gray-800">{siteName}</span>
		</a>
		{#if $page.url.pathname.replace(languageTag(), '') === '/' || $page.url.pathname
				.replace(languageTag(), '')
				.includes('/film/')}
			<select
				id="cinema-select"
				on:change={handleCinemaChange}
				class="ml-14 h-8 w-full appearance-none rounded-lg border border-gray-300 bg-gray-100 px-1.5 text-base text-sm leading-none
                 transition duration-150 ease-in-out
                 hover:border-gray-400
                 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
			>
				{#each cinemas as cinema}
					<option value={cinema.id}>{cinema.name}</option>
				{/each}
			</select>
		{/if}
	</div>

	<!-- Center: Multilingual Greeting -->
	{#if userName}
		<div class="absolute left-1/2 -translate-x-1/2 transform text-center">
			<span
				class="text-lg font-medium text-gray-400 hover:cursor-pointer"
				on:mouseenter={() => showNotification(`${randomGreeting.lang}`, 'info')}
			>
				{randomGreeting.greeting}
				{userName}!
			</span>
		</div>
	{/if}

	<!-- Right: Profile Picture -->
	<div class="relative ml-auto flex">
		{#if !$page.url.pathname.includes('/admin') && !$page.url.pathname.includes('/validation')}
			<SearchBar
				onSubmit={(search) => {
					languageAwareGoto('/search/' + search);
				}}
			/>
			<a class="relative mx-4 my-auto focus:outline-none" href="/profile/tickets">
				<TicketCheck size={24} color="#666666" />
			</a>
			<ShoppingCart />
		{/if}

		<div
			class="relative ml-4"
			role="button"
			on:mouseover={showDropdown}
			on:mouseleave={hideDropdown}
			on:focus={showDropdown}
			on:blur={hideDropdown}
			tabindex="0"
		>
			<a class="focus:outline-none" href="/profile" aria-label="Profile">
				<span
					class="flex h-10 w-10 items-center justify-center rounded-full border-2 border-gray-300 bg-gray-200 font-bold text-gray-800 transition-all hover:border-blue-500"
				>
					{#if userName}
						{userName.charAt(0).toUpperCase()}
					{:else}
						?
					{/if}
				</span>
			</a>

			<!-- Dropdown Menu -->
			{#if showMenu}
				<div
					class="absolute right-0 z-50 w-60 rounded-lg border border-gray-200 bg-white shadow-lg"
				>
					<ul class="divide-y divide-gray-100 rounded-lg bg-white shadow-lg">
						<li>
							{#if userName}
								<a
									href="/logout"
									class="flex items-center px-4 py-3 text-gray-700 transition-colors duration-200 hover:bg-gray-50"
								>
									<LogOut class="mr-3 h-5 w-5 text-gray-500" />
									<span>{m.logout({})}</span>
								</a>
							{:else}
								<a
									href="/login"
									class="flex items-center px-4 py-3 text-gray-700 transition-colors duration-200 hover:bg-gray-50"
								>
									<LogIn class="mr-3 h-5 w-5 text-gray-500" />
									<span>{m.login({})}</span>
								</a>
							{/if}
						</li>

						<li>
							<div class="px-4 py-3">
								<div class="flex items-center justify-between">
									<div class="flex items-center">
										<Globe class="mr-3 h-5 w-5 text-gray-500" />
										<span class="text-gray-700">Sprache</span>
									</div>
									<div class="flex space-x-2">
										<button
											class="flex items-center space-x-1 rounded-full px-3 py-1 transition-colors duration-200 {lang ===
											'en'
												? 'bg-blue-100 text-blue-700'
												: 'hover:bg-gray-100'}"
											on:click={() => {
												switchToLanguage('en');
												lang = i18n.getLanguageFromUrl($page.url);
											}}
										>
											<!-- <span>{flags.en}</span> -->
											<span>EN</span>
										</button>
										<button
											class="flex items-center space-x-1 rounded-full px-3 py-1 transition-colors duration-200 {lang ===
											'de'
												? 'bg-blue-100 text-blue-700'
												: 'hover:bg-gray-100'}"
											on:click={() => {
												switchToLanguage('de');
												lang = i18n.getLanguageFromUrl($page.url);
											}}
										>
											<!-- <span>{flags.de}</span> -->
											<span>DE</span>
										</button>
									</div>
								</div>
							</div>
						</li>

						{#if $page.data.user?.role === 'admin' || $page.data.user?.role === 'inspector'}
							<li>
								<a
									href="/validation"
									class="flex items-center bg-green-50 px-4 py-3 text-gray-700 transition-colors duration-200 hover:bg-green-100"
								>
									<ClipboardCheck class="mr-3 h-5 w-5 text-green-600" />
									<span>{m.validate_tickets({})}</span>
								</a>
							</li>
						{/if}

						{#if $page.data.user?.role === 'admin'}
							<li>
								<a
									href="/admin"
									class="flex items-center bg-green-50 px-4 py-3 text-gray-700 transition-colors duration-200 hover:bg-green-100"
								>
									<Settings class="mr-3 h-5 w-5 text-green-600" />
									<span>{m.admin_tools({})}</span>
								</a>
							</li>
						{/if}
					</ul>
				</div>
			{/if}
		</div>
	</div>
</header>

<style>
	header {
		width: 100%;
		height: 8vh;
		margin: 0 auto;
		position: sticky; /* Makes the header sticky */
		top: 0; /* Sticks to the top of the viewport */
		z-index: 1000; /* Ensures it stays above other elements */
	}

	/* Dropdown sichtbar bei Hover */
	.relative:hover .absolute {
		display: block;
	}
</style>
