import { paraglide } from '@inlang/paraglide-sveltekit/vite';
import { defineConfig } from 'vitest/config';
import { sveltekit } from '@sveltejs/kit/vite';

export default defineConfig({
	plugins: [
		sveltekit(),
		paraglide({
			project: './project.inlang',
			outdir: './src/lib/paraglide'
		})
	],
	test: {
		include: ['src/**/*.{test,spec}.{js,ts,svelte}'],
		environment: 'jsdom',
		globals: true,
		//setupFiles: ['src/setupTests.js'] // Optional: Fügen Sie diese Zeile hinzu, wenn Sie eine Setup-Datei für Tests haben
	},
	resolve: process.env.VITEST
		? {
				conditions: ['browser']
			}
		: undefined
});
