import { encodeBase32LowerCase } from '@oslojs/encoding';
import { getRandomValues } from 'crypto';

export function validateEmail(email: unknown): email is string {
	return (
		typeof email === 'string' &&
		email.length >= 5 &&
		email.length <= 254 && // Maximale Länge einer E-Mail-Adresse laut Standard
		/^[^\s@]+@[^\s@.]+\.[^\s@.]+(?:\.[^\s@.]+)*$/.test(email)
	);
}

export function validatePassword(password: unknown): password is string {
	return typeof password === 'string' && password.length >= 6 && password.length <= 255;
}

export function generateUserId() {
	// ID with 120 bits of entropy, or about the same as UUID v4.
	const bytes = getRandomValues(new Uint8Array(15));
	const id = encodeBase32LowerCase(bytes);
	return id;
}
