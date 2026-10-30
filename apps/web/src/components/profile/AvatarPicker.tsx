"use client";

import { getInitials } from "@repo/shared";
import {
	Avatar,
	AvatarFallback,
	AvatarImage,
} from "@repo/ui/components/avatar";
import LoadingButton from "@repo/ui/general/LoadingButton";
import { Camera, Loader2 } from "lucide-react";
import { useRef } from "react";
import { toast } from "sonner";
import { AVATAR_ACCEPT } from "@/constants";
import { authClient } from "@/lib/auth-client";
import {
	useRemoveUserAvatar,
	useUpdateUser,
	useUploadUserLogo,
} from "@/queries";
import { getAvatarFileError } from "@/utils";

export const AvatarPicker = () => {
	const { data: session, refetch } = authClient.useSession();
	const user = session?.user;
	const { mutate: uploadLogo, isPending: isUploading } = useUploadUserLogo();
	const { mutate: updateUser } = useUpdateUser();
	const { mutate: removeAvatar, isPending: isRemoving } = useRemoveUserAvatar();
	const fileInputRef = useRef<HTMLInputElement>(null);

	const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0];
		event.target.value = "";
		if (!file) return;

		const fileError = getAvatarFileError(file);
		if (fileError) {
			toast.error(fileError);
			return;
		}

		uploadLogo(file, {
			onSuccess: (url) => {
				updateUser(
					{ image: url },
					{
						onSuccess: () => toast.success("Profile picture updated"),
						onError: (error) => toast.error(error.message),
					},
				);
			},
			onError: (error) => toast.error(error.message),
		});
	};

	const handleRemove = () => {
		removeAvatar(undefined, {
			onSuccess: () => {
				refetch();
				toast.success("Profile picture removed");
			},
			onError: (error) => toast.error(error.message),
		});
	};

	return (
		<div className="flex items-center gap-4">
			<div className="relative">
				<Avatar className="h-20 w-20">
					<AvatarImage src={user?.image || undefined} alt={user?.name} />
					<AvatarFallback className="text-lg">
						{user?.name
							? getInitials(user.name)
							: user?.email?.substring(0, 2).toUpperCase()}
					</AvatarFallback>
				</Avatar>
				<button
					type="button"
					onClick={() => fileInputRef.current?.click()}
					disabled={isUploading}
					className="bg-background border-border absolute inset-0 flex cursor-pointer items-center justify-center rounded-full border-2 opacity-0 transition-opacity hover:opacity-100 disabled:cursor-not-allowed"
					aria-label="Upload profile picture"
				>
					{isUploading ? (
						<Loader2 className="text-foreground h-5 w-5 animate-spin" />
					) : (
						<Camera className="text-foreground h-5 w-5" />
					)}
				</button>
				<input
					ref={fileInputRef}
					type="file"
					accept={AVATAR_ACCEPT}
					className="hidden"
					data-testid="avatar-file-input"
					onChange={handleFileChange}
				/>
			</div>
			<div className="space-y-1">
				<p className="text-sm font-medium">{user?.name}</p>
				<p className="text-muted-foreground text-xs">{user?.email}</p>
				{user?.image && (
					<LoadingButton
						type="button"
						variant="link"
						size="xs"
						className="text-muted-foreground h-auto px-0"
						isLoading={isRemoving}
						onClick={handleRemove}
					>
						Remove photo
					</LoadingButton>
				)}
			</div>
		</div>
	);
};
