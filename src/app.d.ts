// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
import type { AvailableLanguageTag } from '$lib/paraglide/runtime';
import type { ParaglideLocals } from '@inlang/paraglide-sveltekit';

declare global {
	namespace App {
		interface Locals {
			user: import('$lib/server/auth').SessionValidationResult['user'];
			session: import('$lib/server/auth').SessionValidationResult['session'];
			paraglide: ParaglideLocals<AvailableLanguageTag>;
		}
	}
}

export {};
