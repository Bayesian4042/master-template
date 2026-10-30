import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useIsDemoAuth } from "@/contexts/demo-auth.context";
import { authClient } from "@/lib/auth-client";

export const useSignOut = () => {
	const queryClient = useQueryClient();
	const router = useRouter();
	const isDemo = useIsDemoAuth();

	return async () => {
		if (isDemo) {
			await fetch("/api/demo-auth", { method: "DELETE" });
			queryClient.clear();
			router.replace("/sign-in");
			router.refresh();
			return;
		}

		const response = await authClient.signOut();
		if (!response.data?.success) {
			toast.error(response.error?.message ?? "Failed to logout");
			return;
		}

		queryClient.clear();
		router.replace("/sign-in");
		router.refresh();
	};
};
