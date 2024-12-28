import { goto } from '$app/navigation';
import { languageTag } from '$lib/paraglide/runtime';
import { redirect } from '@sveltejs/kit';

export function languageAwareGoto(path: string, options?: Parameters<typeof goto>[1]) {
	const currentLanguage = languageTag();
	if (currentLanguage === 'en') {
		return goto(path, options);
	}

	// Ensure the path starts with the current language
	const languageAwarePath = `/${currentLanguage}${path.startsWith('/') ? path : '/' + path}`;

	return goto(languageAwarePath, options);
}

export function languageAwareRedirect(status: number, path: string) {
	const currentLanguage = languageTag();
	if (currentLanguage === 'en') {
		return redirect(status, path);
	}

	// Ensure the path starts with the current language
	const languageAwarePath = `/${currentLanguage}${path.startsWith('/') ? path : '/' + path}`;

	throw redirect(status, languageAwarePath);
}
