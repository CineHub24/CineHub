import { encodeBase32LowerCase } from '@oslojs/encoding';

export function validateEmail(email: unknown): email is string {
	return (
		typeof email === 'string' &&
		email.length >= 5 &&
		email.length <= 254 && // Maximale Länge einer E-Mail-Adresse laut Standard
		/^[^\s@]+@[^\s@.]+\.[^\s@.]+(?:\.[^\s@.]+)*$/.test(email)
	);
}

export function validatePassword(password: unknown): password is string {
	const pwAsString = <string>password;

	const minLength = 8;
	const maxLength = 255;
	const hasUpperCase = /[A-Z]/.test(pwAsString);
	const hasLowerCase = /[a-z]/.test(pwAsString);
	const hasNumbers = /\d/.test(pwAsString);
	const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(pwAsString);

	// Min 8 chars
	if (pwAsString.length < minLength) {
		return false;
	}

	// Max 255 chars
	if (pwAsString.length > maxLength) {
		return false;
	}

	// Upper- and lower-case
	if (!hasUpperCase || !hasLowerCase) {
		return false;
	}

	// Includes numbers
	if (!hasNumbers) {
		return false;
	}

	// Includes special characters
	if (!hasSpecialChar) {
		return false;
	}

	// Password meets min. requirements
	return true;
}

export function generateUserId() {
	// ID with 120 bits of entropy, or about the same as UUID v4.
	const bytes = crypto.getRandomValues(new Uint8Array(15));
	const id = encodeBase32LowerCase(bytes);
	return id;
}
