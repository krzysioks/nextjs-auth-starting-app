import { Lucia } from "lucia";
import { BetterSqlite3Adapter } from "@lucia-auth/adapter-sqlite";
import { cookies } from "next/headers";

import db from "./db";

const adapter = new BetterSqlite3Adapter(db, {
	user: "users",
	session: "sessions",
});

const lucia = new Lucia(adapter, {
	sessionCookie: {
		expires: false,
		attributes: {
			secure: process.env.NODE_ENV === "production",
		},
	},
});

export const createAuthSession = async (userId) => {
	// create session for user
	const session = await lucia.createSession(userId, {});
	// create session cookie
	const sessionCookie = lucia.createSessionCookie(session.id);
	// set session cookie in headers
	cookies().set(
		sessionCookie.name,
		sessionCookie.value,
		sessionCookie.attributes
	);
};

export const verifyAuthSession = async () => {
	// fetch from cookies, the cookie with the name of the session
	const sessionCookie = cookies().get(lucia.sessionCookieName);

	// if there is no session cookie, return object with null values
	// session not authenticated
	if (!sessionCookie) {
		return {
			user: null,
			session: null,
		};
	}

	const sessionId = sessionCookie.value;

	// if we cannot retrieve the session id, return object with null values
	// session not authenticated
	if (!sessionId) {
		return {
			user: null,
			session: null,
		};
	}

	// lucia will check in db if given sessionId is valid (sessionId exists in db)
	const result = await lucia.validateSession(sessionId);

	try {
		// if session found and is fresh -> refresh it to stay active
		if (result.session?.fresh) {
			const sessionCookie = await lucia.refreshSession(result.session.id);
			cookies().set(
				sessionCookie.name,
				sessionCookie.value,
				sessionCookie.attributes
			);
		}

		// if given sessionId haven't been found in db, create new blank session
		if (!result.session) {
			const sessionCookie = lucia.createBlankSessionCookie();
			cookies().set(
				sessionCookie.name,
				sessionCookie.value,
				sessionCookie.attributes
			);
		}
	} catch (error) {}

	return result;
};

export const destroySession = async () => {
	const { session } = await verifyAuthSession();

	if (!session) {
		return {
			error: "Unauthorised",
		};
	}

	await lucia.invalidateSession(session.id);
	const sessionCookie = lucia.createBlankSessionCookie();
	cookies().set(
		sessionCookie.name,
		sessionCookie.value,
		sessionCookie.attributes
	);
};
