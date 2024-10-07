import { logout } from "@/serverActions/actions";
import "../globals.css";

export const metadata = {
	title: "Next Auth",
	description: "Next.js Authentication",
};

const AuthLayout = ({ children }) => {
	return (
		<>
			<header id="auth-header">
				<p>Hello again</p>
				<form action={logout}>
					<button>Logout</button>
				</form>
			</header>
			{children}
		</>
	);
};

export default AuthLayout;
