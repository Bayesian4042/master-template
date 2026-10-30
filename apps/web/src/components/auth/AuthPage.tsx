"use client";

import { AuthLayout } from "./components/AuthLayout";
import { MicrosoftAuthButton } from "./components/MicrosoftAuthButton";

export function AuthPage() {
	return (
		<AuthLayout>
			<MicrosoftAuthButton />
		</AuthLayout>
	);
}
