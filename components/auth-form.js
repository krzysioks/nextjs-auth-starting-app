"use client";

import Link from "next/link";
import { useFormState } from "react-dom";

import { auth } from "@/serverActions/actions";

export default function AuthForm(props) {
	const { mode } = props;
	const [state, formAction] = useFormState(auth.bind(null, mode), {});
	console.log("state: ", state);

	return (
		<form action={formAction} id="auth-form">
			<div>
				<img src="/images/auth-icon.jpg" alt="A lock icon" />
			</div>
			<p>
				<label htmlFor="email">Email</label>
				<input type="email" name="email" id="email" />
			</p>
			{state.email && (
				<ul className="form-errors">
					<li>{state.email}</li>
				</ul>
			)}
			<p>
				<label htmlFor="password">Password</label>
				<input type="password" name="password" id="password" />
			</p>
			{state.password && (
				<ul className="form-errors">
					<li>{state.password}</li>
				</ul>
			)}
			<p>
				<button type="submit">
					{mode === "login" ? "Login" : "Create Account"}
				</button>
			</p>
			<p>
				{mode === "login" ? (
					<Link href="/?mode=signup">Create account.</Link>
				) : (
					<Link href="/?mode=login">Login with existing account.</Link>
				)}
			</p>
		</form>
	);
}
