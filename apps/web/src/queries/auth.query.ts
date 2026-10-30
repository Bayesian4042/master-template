import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { authClient } from "@/lib/auth-client";
import { userKeys } from "./users.query";

export const authKeys = {
	invitation: (invitationId: string) => ["invitation", invitationId],
	sessions: ["sessions"],
	user: ["user"],
};

export const useListSessions = () => {
	const { data: session } = authClient.useSession();

	return useQuery({
		queryKey: authKeys.sessions,
		enabled: !!session,
		queryFn: async () => {
			const { data, error } = await authClient.listSessions();

			if (error) {
				throw new Error(error.message || "Failed to fetch sessions");
			}

			return data;
		},
	});
};

export const useRevokeSession = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (token: string) => {
			const { error } = await authClient.revokeSession({
				token,
			});

			if (error) {
				throw new Error(error.message || "Failed to revoke session");
			}
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: authKeys.sessions });
			queryClient.invalidateQueries({ queryKey: userKeys.overview });
		},
	});
};

export const useRevokeOtherSessions = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async () => {
			const { error } = await authClient.revokeOtherSessions();

			if (error) {
				throw new Error(error.message || "Failed to revoke other sessions");
			}
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: authKeys.sessions });
			queryClient.invalidateQueries({ queryKey: userKeys.overview });
		},
	});
};

export const useUpdateUser = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async ({ name, image }: { name?: string; image?: string }) => {
			const { data, error } = await authClient.updateUser({
				name,
				image,
			});

			if (error) {
				throw new Error(error.message || "Failed to update user");
			}

			return data;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: authKeys.user });
		},
	});
};
