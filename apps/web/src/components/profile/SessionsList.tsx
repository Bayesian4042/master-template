"use client";

import { Badge } from "@repo/ui/components/badge";
import { Button } from "@repo/ui/components/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@repo/ui/components/card";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@repo/ui/components/dropdown-menu";
import {
	Empty,
	EmptyContent,
	EmptyHeader,
	EmptyMedia,
	EmptyTitle,
} from "@repo/ui/components/empty";
import { CustomAlertDialog } from "@repo/ui/general/CustomAlertDialog";
import { CustomTable } from "@repo/ui/general/CustomTable";
import type { ColumnDef } from "@tanstack/react-table";
import { formatDistanceToNow } from "date-fns";
import {
	AlertCircle,
	LogOut,
	Monitor,
	MoreHorizontal,
	Smartphone,
	Tablet,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";
import {
	useListSessions,
	useRevokeOtherSessions,
	useRevokeSession,
} from "@/queries";
import { getBrowserName, getDeviceKind, getDeviceName } from "@/utils";

const DEVICE_ICONS = {
	mobile: Smartphone,
	tablet: Tablet,
	desktop: Monitor,
};

const getDeviceIcon = (userAgent: string) => {
	const DeviceIcon = DEVICE_ICONS[getDeviceKind(userAgent)];
	return <DeviceIcon className="h-5 w-5" />;
};

type SessionToRevoke = {
	token: string;
	device: string;
} | null;

export const SessionsList = () => {
	const { data: sessions, isPending } = useListSessions();
	const { mutate: revokeSession, isPending: isRevokingSession } =
		useRevokeSession();
	const { mutate: revokeOtherSessions, isPending: isRevokingOthers } =
		useRevokeOtherSessions();
	const { data: sessionData } = authClient.useSession();
	const [sessionToRevoke, setSessionToRevoke] = useState<SessionToRevoke>(null);
	const [showRevokeAllDialog, setShowRevokeAllDialog] = useState(false);

	const handleRevokeSession = (token: string, device: string) => {
		setSessionToRevoke({ token, device });
	};

	const confirmRevokeSession = () => {
		if (!sessionToRevoke) return;

		revokeSession(sessionToRevoke.token, {
			onSuccess: () => {
				toast.success("Session revoked successfully");
				setSessionToRevoke(null);
			},
			onError: (error) => {
				toast.error(error.message);
			},
		});
	};

	const handleRevokeOtherSessions = () => {
		revokeOtherSessions(undefined, {
			onSuccess: () => {
				toast.success("All other sessions revoked successfully");
				setShowRevokeAllDialog(false);
			},
			onError: (error) => {
				toast.error(error.message);
			},
		});
	};

	const otherSessions = sessions?.slice(1) || [];

	type Session = NonNullable<typeof sessions>[number];

	const columns: ColumnDef<Session>[] = [
		{
			accessorKey: "userAgent",
			header: "Device",
			cell: ({ row }) => (
				<div className="flex items-center gap-2">
					{getDeviceIcon(row.original.userAgent || "")}
					<span className="font-medium">
						{getDeviceName(row.original.userAgent || "")}
					</span>
				</div>
			),
		},
		{
			id: "browser",
			header: "Browser",
			cell: ({ row }) => (
				<span className="hidden md:table-cell">
					{getBrowserName(row.original.userAgent || "")}
				</span>
			),
		},
		{
			accessorKey: "ipAddress",
			header: "IP Address",
			cell: ({ row }) => (
				<code className="hidden text-xs lg:table-cell">
					{row.original.ipAddress || "Unknown"}
				</code>
			),
		},
		{
			accessorKey: "createdAt",
			header: "Created",
			cell: ({ row }) => (
				<span className="hidden text-sm xl:table-cell">
					{row.original.createdAt
						? formatDistanceToNow(new Date(row.original.createdAt), {
								addSuffix: true,
							})
						: "Unknown"}
				</span>
			),
		},
		{
			accessorKey: "expiresAt",
			header: "Expires",
			cell: ({ row }) => {
				const isExpired = row.original.expiresAt
					? new Date(row.original.expiresAt) < new Date()
					: false;

				return (
					<span className="hidden text-sm 2xl:table-cell">
						{isExpired ? (
							<span className="text-destructive">Expired</span>
						) : row.original.expiresAt ? (
							formatDistanceToNow(new Date(row.original.expiresAt), {
								addSuffix: true,
							})
						) : (
							"Never"
						)}
					</span>
				);
			},
		},
		{
			id: "status",
			header: "Status",
			cell: ({ row }) => {
				const isCurrentSession = sessionData?.session?.id === row.original.id;
				return isCurrentSession ? (
					<Badge variant="default" className="text-xs">
						Current
					</Badge>
				) : (
					<span className="text-muted-foreground text-sm">Active</span>
				);
			},
		},
		{
			id: "actions",
			header: "",
			cell: ({ row }) => {
				const isCurrentSession = sessionData?.session?.id === row.original.id;
				if (isCurrentSession) return null;

				return (
					<DropdownMenu>
						<DropdownMenuTrigger
							render={
								<Button variant="ghost" size="icon">
									<MoreHorizontal className="h-4 w-4" />
								</Button>
							}
						></DropdownMenuTrigger>
						<DropdownMenuContent align="end">
							<DropdownMenuItem
								className="text-destructive"
								onClick={() =>
									handleRevokeSession(
										row.original.token,
										getDeviceName(row.original.userAgent || ""),
									)
								}
							>
								<LogOut className="mr-2 h-4 w-4" />
								Sign Out
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				);
			},
		},
	];

	if (isPending) {
		return (
			<Card className="gap-3 pb-0">
				<CardHeader>
					<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
						<div className="space-y-1">
							<CardTitle className="font-medium">Active Sessions</CardTitle>
							<CardDescription>
								Manage your active sessions across all devices
							</CardDescription>
						</div>
					</div>
				</CardHeader>
				<CardContent className="p-0">
					<div className="border-t">
						<CustomTable
							data={[]}
							columns={columns}
							state="loading"
							loadingRowCount={3}
						/>
					</div>
				</CardContent>
			</Card>
		);
	}

	const emptyState = (
		<Empty>
			<EmptyHeader>
				<EmptyMedia variant="icon">
					<Monitor className="h-4 w-4" />
				</EmptyMedia>
				<EmptyTitle>No active sessions</EmptyTitle>
				<EmptyContent>
					<p className="text-muted-foreground text-sm">
						You don&apos;t have any active sessions.
					</p>
				</EmptyContent>
			</EmptyHeader>
		</Empty>
	);

	return (
		<>
			<Card className="gap-3 pb-0">
				<CardHeader>
					<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
						<div className="space-y-1">
							<CardTitle className="font-medium">Active Sessions</CardTitle>
							<CardDescription>
								Manage your active sessions across all devices
							</CardDescription>
						</div>
						{otherSessions.length > 0 && (
							<Button
								variant="outline"
								size="sm"
								onClick={() => setShowRevokeAllDialog(true)}
								disabled={isRevokingOthers}
							>
								<LogOut className="mr-2 h-4 w-4" />
								Sign Out Other Sessions
							</Button>
						)}
					</div>
				</CardHeader>
				<CardContent className="p-0">
					<div className="border-t">
						<CustomTable
							data={sessions || []}
							columns={columns}
							emptyState={emptyState}
						/>
					</div>
				</CardContent>
			</Card>

			<CustomAlertDialog
				isOpen={!!sessionToRevoke}
				onClose={() => setSessionToRevoke(null)}
				onConfirm={confirmRevokeSession}
				isLoading={isRevokingSession}
				title="Sign out of this session?"
				description={`This will sign you out of ${sessionToRevoke?.device}. You'll need to sign in again on that device to continue using your account.`}
				cancelText="Cancel"
				confirmText="Sign Out Session"
				icon={<LogOut className="text-destructive size-8" />}
			/>

			<CustomAlertDialog
				isOpen={showRevokeAllDialog}
				onClose={() => setShowRevokeAllDialog(false)}
				onConfirm={handleRevokeOtherSessions}
				isLoading={isRevokingOthers}
				title="Sign out all other sessions?"
				description={`This will sign you out of all devices except this one (${otherSessions.length} ${otherSessions.length === 1 ? "session" : "sessions"}). You'll need to sign in again on those devices to continue using your account.`}
				cancelText="Cancel"
				confirmText="Sign Out All Other Sessions"
				icon={<AlertCircle className="text-destructive size-8" />}
			/>
		</>
	);
};
