import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { AuthPage } from "@/components/auth/AuthPage";
import { APP_NAME } from "@/constants";
import { getOptionalAuthSession } from "@/lib/get-optional-auth-session";
import { hasDemoSession } from "@/utils/demo-auth.utils";

export const dynamic = "force-dynamic";

export const metadata = {
	title: `Sign In | ${APP_NAME}`,
	description: "Sign in to your account",
};

export default async function AuthDemo() {
	const session = await getOptionalAuthSession();
	if (session.data || hasDemoSession(await cookies())) {
		return redirect("/operations/discovery");
	}
	return <AuthPage />;
}
