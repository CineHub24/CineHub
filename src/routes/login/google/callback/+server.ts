import {
	google,
	createSession,
	generateSessionToken,
	setSessionTokenCookie
} from '$lib/server/auth';
import { ObjectParser } from '@pilcrowjs/object-parser';
import { decodeIdToken } from 'arctic';
import { db } from '$lib/server/db';
import * as table from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import { generateUserId } from '$lib/utils/user';
import { fail } from '@sveltejs/kit';
import type { RequestEvent } from './$types';
import type { OAuth2Tokens } from 'arctic';
import { EmailService } from '$lib/utils/emailService';

export async function GET(event: RequestEvent): Promise<Response> {
	const storedState = event.cookies.get('google_oauth_state') ?? null;
	const codeVerifier = event.cookies.get('google_code_verifier') ?? null;
	const code = event.url.searchParams.get('code');
	const state = event.url.searchParams.get('state');

	if (storedState === null || codeVerifier === null || code === null || state === null) {
		return new Response('Please restart the process.', {
			status: 400
		});
	}
	if (storedState !== state) {
		return new Response('Please restart the process.', {
			status: 400
		});
	}

	let tokens: OAuth2Tokens;
	try {
		tokens = await google.validateAuthorizationCode(code, codeVerifier);
	} catch (e) {
		return new Response('Please restart the process.', {
			status: 400
		});
	}

	const claims = decodeIdToken(tokens.idToken());
	const claimsParser = new ObjectParser(claims);

	const googleId = claimsParser.getString('sub');
	//const name = claimsParser.getString('name');
	//const picture = claimsParser.getString('picture');
	const email = claimsParser.getString('email');
	const firstName = claimsParser.getString('given_name');
	const lastName = claimsParser.getString('family_name');

	const existingUser = (
		await db.select().from(table.user).where(eq(table.user.googleId, googleId))
	).at(0);

	if (existingUser) {
		const sessionToken = generateSessionToken();
		const session = createSession(sessionToken, existingUser.id);
		setSessionTokenCookie(event, sessionToken, (await session).expiresAt);
		return new Response(null, {
			status: 302,
			headers: {
				Location: '/'
			}
		});
	}

	const userId = generateUserId();
	try {
		await db.insert(table.user).values({ id: userId, googleId: googleId, firstName: firstName, lastName: lastName, email: email });
	}catch(e){
		console.log(e);
		return new Response('Use a different account', {
			status: 500
		});
	}

	const sessionToken = generateSessionToken();
	const session = createSession(sessionToken, userId);
	setSessionTokenCookie(event, sessionToken, (await session).expiresAt);
	try {
		const gmailUser = import.meta.env.VITE_GMAIL_USER;
		const gmailAppPassword = import.meta.env.VITE_GMAIL_APP_PASSWORD;
		const emailClient = new EmailService(gmailUser, gmailAppPassword);
		await emailClient.sendWelcomeEmail(email as string);
	} catch (error) {
		return new Response(JSON.stringify({ message: 'Failed to send welcome email' }), {
			status: 500,
			headers: {
				'Content-Type': 'application/json'
			}
		});
	}
	return new Response(null, {
		status: 302,
		headers: {
			Location: '/'
		}
	});
}
