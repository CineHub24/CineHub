import { describe, it, expect, vi, beforeEach } from 'vitest';
import { languageAwareGoto, languageAwareRedirect } from '$lib/utils/languageAware';
import { goto } from '$app/navigation';
import { languageTag } from '$lib/paraglide/runtime';
import { redirect } from '@sveltejs/kit';

// Mock the modules
vi.mock('$app/navigation', () => ({
	goto: vi.fn()
}));

vi.mock('$lib/paraglide/runtime', () => ({
	languageTag: vi.fn()
}));

vi.mock('@sveltejs/kit', () => ({
	redirect: vi.fn()
}));

describe('Language Aware Navigation', () => {
	beforeEach(() => {
		vi.resetAllMocks();
	});

	describe('languageAwareGoto', () => {
		it('should call goto with original path for English', async () => {
			vi.mocked(languageTag).mockReturnValue('en');
			await languageAwareGoto('/test');
			expect(goto).toHaveBeenCalledWith('/test', undefined);
		});

		it('should prepend language code for German', async () => {
			vi.mocked(languageTag).mockReturnValue('de');
			await languageAwareGoto('/test');
			expect(goto).toHaveBeenCalledWith('/de/test', undefined);
		});

		it('should handle paths without leading slash', async () => {
			vi.mocked(languageTag).mockReturnValue('de');
			await languageAwareGoto('test');
			expect(goto).toHaveBeenCalledWith('/de/test', undefined);
		});

		it('should pass options to goto', async () => {
			vi.mocked(languageTag).mockReturnValue('de');
			const options = { replaceState: true };
			await languageAwareGoto('/test', options);
			expect(goto).toHaveBeenCalledWith('/de/test', options);
		});
	});

	describe('languageAwareRedirect', () => {
		it('should call redirect with original path for English', () => {
			vi.mocked(languageTag).mockReturnValue('en');
			expect(() => languageAwareRedirect(302, '/test')).toThrow();
			expect(redirect).toHaveBeenCalledWith(302, '/test');
		});

		it('should prepend language code for German', () => {
			vi.mocked(languageTag).mockReturnValue('de');
			expect(() => languageAwareRedirect(301, '/test')).toThrow();
			expect(redirect).toHaveBeenCalledWith(301, '/de/test');
		});

		it('should handle paths without leading slash', () => {
			vi.mocked(languageTag).mockReturnValue('de');
			expect(() => languageAwareRedirect(307, 'test')).toThrow();
			expect(redirect).toHaveBeenCalledWith(307, '/de/test');
		});
	});
});
