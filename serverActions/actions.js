"use server";
import { redirect } from "next/navigation";
import { hashUserPassword, verifyPassword } from "@/lib/hash";
import { createUser, getUserByEmail } from "@/lib/user";
import { createAuthSession, destroySession } from "@/lib/auth";

export const signup = async (prevState, formData) => {
	const email = formData.get("email");
	const password = formData.get("password");

	// validate email and password
	const errors = {};
	if (!email.includes("@")) {
		errors.email = "Email must contain @";
	}

	if (password.length < 8) {
		errors.password = "Password must be at least 8 characters";
	}

	if (Object.keys(errors).length > 0) {
		return errors;
	}

	try {
		// store user data in db
		const hashedPassword = hashUserPassword(password);
		// user is created
		const id = createUser(email, hashedPassword);
		// we pass user id to function, that will create session for user
		// cookie and set it in headers
		await createAuthSession(id);
	} catch (error) {
		if (error.code === "SQLITE_CONSTRAINT_UNIQUE") {
			return { email: "Email already exists" };
		}

		throw error;
	}

	redirect("/training");
};
export const login = async (prevState, formData) => {
	const email = formData.get("email");
	const password = formData.get("password");

	const user = await getUserByEmail(email);

	if (!user || !verifyPassword(user.password, password)) {
		return {
			errors: {
				email: "Invalid email or password",
				password: "Invalid email or password",
			},
		};
	}

	await createAuthSession(user.id);

	redirect("/training");
};

export const auth = async (mode, prevState, formData) => {
	return mode === "login"
		? login(prevState, formData)
		: signup(prevState, formData);
};

export const logout = async () => {
	await destroySession();
	redirect("/");
};
