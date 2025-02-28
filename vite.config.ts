import { paraglide } from '@inlang/paraglide-sveltekit/vite';
import { defineConfig } from 'vitest/config';
import { sveltekit } from '@sveltejs/kit/vite';

export default defineConfig({
	define: {
		'import.meta.env.DATABASE_URL': JSON.stringify(''),
		'import.meta.env.GOOGLE_CLIENT_ID': JSON.stringify(''),
		'import.meta.env.GOOGLE_CLIENT_SECRET': JSON.stringify(''),
		'import.meta.env.GITHUB_CLIENT_ID': JSON.stringify(''),
		'import.meta.env.GITHUB_CLIENT_SECRET': JSON.stringify(''),
		'import.meta.env.VITE_GMAIL_USER': JSON.stringify(''),
		'import.meta.env.VITE_GMAIL_APP_PASSWORD': JSON.stringify(''),
		'import.meta.env.VITE_TMDB_API_KEY': JSON.stringify(''),
		'import.meta.env.VITE_OMDB_API_KEY': JSON.stringify(''),
		'import.meta.env.VITE_SECRET_PAYPAL': JSON.stringify(''),
		'import.meta.env.VITE_CLIENT_ID_PAYPAL': JSON.stringify(''),
		'import.meta.env.VITE_PUBLIC_STRIPE_KEY': JSON.stringify(''),
		'import.meta.env.VITE_SECRET_STRIPE_KEY': JSON.stringify(''),
		'import.meta.env.VITE_DOMAIN': JSON.stringify(''),
		'import.meta.env.VITE_PUBLIC_URL': JSON.stringify('')
	},
	plugins: [
		sveltekit(),
		paraglide({
			project: './project.inlang',
			outdir: './src/lib/paraglide'
		})
	],
	test: {
		// Include all test files with .test.js, .test.ts, .spec.js, or .spec.ts extensions
		include: ['src/**/*.{test,spec}.{js,ts}'],

		// Use the jsdom environment for DOM-related testing
		environment: 'jsdom',

		// Enable global variables like `describe`, `it`, etc.
		globals: true,

		coverage: {
			// Include all files within the src directory
			include: ['src/**'],

			// Exclude:
			// 1. All .svelte files
			// 2. Any files within src/lib
			// 3. Specifically exclude src/lib/utils/jobs
			exclude: [
				'src/*.{ts,js}',
				'src/**/*.svelte',
				'src/lib/**',
				'!src/lib/utils/*.{js,ts}',
				'src/lib/utils/jobs/**'
			],

			// Specify the types of coverage reports to generate
			reporter: ['text', 'html', 'lcov']
		}

		// Optional: Uncomment and specify if you have a setup file for tests
		// setupFiles: ['src/setupTests.js']
	},
	resolve: process.env.VITEST
		? {
				// Ensure the resolver uses browser conditions when running Vitest
				conditions: ['browser']
			}
		: undefined
});
