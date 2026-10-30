import { emailOTPClient } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";
import { envConfig } from "@/config";

export const authClient = createAuthClient({
	baseURL: envConfig.betterAuthUrl,
	basePath: "/api/auth",
	plugins: [emailOTPClient()],
});

export const useSession = authClient.useSession;
