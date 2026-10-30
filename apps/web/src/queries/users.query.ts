import { useMutation, useQuery } from "@tanstack/react-query";
import { authClient } from "@/lib/auth-client";
import { UserService } from "@/services";

export const userKeys = {
	overview: ["users", "me", "overview"],
};

export const useUploadUserLogo = () => {
	return useMutation({
		mutationFn: async (file: File) => {
			const { url } = await UserService.uploadLogo(file);
			return url;
		},
	});
};

export const useRemoveUserAvatar = () => {
	return useMutation({
		mutationFn: () => UserService.removeAvatar(),
	});
};

export const useUserOverview = () => {
	const { data: session } = authClient.useSession();

	return useQuery({
		queryKey: userKeys.overview,
		enabled: !!session,
		queryFn: () => UserService.getOverview(),
	});
};
