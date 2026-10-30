"use client";

import { Button } from "@repo/ui/components/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@repo/ui/components/dropdown-menu";
import UserAvatar from "@repo/ui/general/UserAvatar";
import { LogOutIcon, UserIcon } from "lucide-react";
import Link from "next/link";
import { DEMO_USER } from "@/constants/demo-auth.constants";
import { useIsDemoAuth } from "@/contexts/demo-auth.context";
import { useSignOut } from "@/hooks";
import { authClient } from "@/lib/auth-client";

export const ProfileDropdown = () => {
	const { data: session } = authClient.useSession();
	const handleSignOut = useSignOut();
	const isDemo = useIsDemoAuth();

	const userName =
		session?.user.name ||
		session?.user.email.split("@")[0] ||
		(isDemo ? DEMO_USER.name : "Unknown");
	const userEmail = session?.user.email || (isDemo ? DEMO_USER.email : "");
	const avatarUrl = session?.user.image ?? DEMO_USER.image ?? "";

	return (
		<DropdownMenu>
			<DropdownMenuTrigger
				render={
					<Button
						variant="ghost"
						size="icon"
						className="rounded-full hover:bg-transparent"
					/>
				}
			>
				<UserAvatar avatarUrl={avatarUrl} name={userName} />
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end" className="w-60">
				<DropdownMenuGroup>
					<DropdownMenuLabel className="flex items-center gap-4 px-2 py-2.5 font-normal">
						<UserAvatar
							avatarUrl={avatarUrl}
							name={userName}
							className="size-10"
						/>
						<div className="flex min-w-0 flex-1 flex-col">
							<span className="text-foreground truncate text-base font-semibold">
								{userName}
							</span>
							<span className="text-muted-foreground truncate text-sm">
								{userEmail}
							</span>
						</div>
					</DropdownMenuLabel>
				</DropdownMenuGroup>
				<DropdownMenuSeparator />
				<DropdownMenuGroup>
					<DropdownMenuItem render={<Link href="/profile" />}>
						<UserIcon />
						<span>Profile</span>
					</DropdownMenuItem>
				</DropdownMenuGroup>
				<DropdownMenuSeparator />
				<DropdownMenuGroup>
					<DropdownMenuItem variant="destructive" onClick={handleSignOut}>
						<LogOutIcon />
						<span>Sign out</span>
					</DropdownMenuItem>
				</DropdownMenuGroup>
			</DropdownMenuContent>
		</DropdownMenu>
	);
};
