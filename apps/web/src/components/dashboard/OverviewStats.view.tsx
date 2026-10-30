import { Badge } from "@repo/ui/components/badge";
import { Skeleton } from "@repo/ui/components/skeleton";
import { format, formatDistanceToNow } from "date-fns";
import {
	CalendarDays,
	KeyRound,
	Laptop,
	MonitorSmartphone,
} from "lucide-react";
import Link from "next/link";
import type { UserOverview } from "@/types";
import { getBrowserName, getDeviceName } from "@/utils";
import { StatCard } from "./StatCard.view";

const SIGN_IN_METHOD_LABELS: Record<string, string> = {
	email: "Email code",
	google: "Google",
};

const SKELETON_KEYS = ["member-since", "sessions", "last-sign-in", "methods"];

const describeDevice = (userAgent: string | null) =>
	userAgent
		? `${getBrowserName(userAgent)} on ${getDeviceName(userAgent)}`
		: "Unknown device";

export const OverviewStats = ({ overview }: { overview: UserOverview }) => {
	const { memberSince, activeSessionCount, lastOtherSignIn, signInMethods } =
		overview;

	return (
		<div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
			<StatCard
				icon={CalendarDays}
				label="Member since"
				value={format(new Date(memberSince), "MMM yyyy")}
				hint={format(new Date(memberSince), "d MMMM yyyy")}
			/>
			<StatCard
				icon={MonitorSmartphone}
				label="Active sessions"
				value={`${activeSessionCount} ${activeSessionCount === 1 ? "session" : "sessions"}`}
				hint={
					<Link href="/profile" className="underline-offset-4 hover:underline">
						Manage sessions
					</Link>
				}
			/>
			<StatCard
				icon={Laptop}
				label="Last sign-in elsewhere"
				value={
					lastOtherSignIn
						? describeDevice(lastOtherSignIn.userAgent)
						: "Only this session"
				}
				hint={
					lastOtherSignIn
						? formatDistanceToNow(new Date(lastOtherSignIn.createdAt), {
								addSuffix: true,
							})
						: "No other active sessions"
				}
			/>
			<StatCard
				icon={KeyRound}
				label="Sign-in methods"
				value={
					<div className="flex flex-wrap gap-2">
						{signInMethods.map((method) => (
							<Badge key={method} variant="secondary">
								{SIGN_IN_METHOD_LABELS[method] ?? method}
							</Badge>
						))}
					</div>
				}
			/>
		</div>
	);
};

export const OverviewStatsSkeleton = () => (
	<div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4" aria-busy="true">
		{SKELETON_KEYS.map((key) => (
			<Skeleton
				key={key}
				className="h-32 rounded-xl"
				data-testid="stat-skeleton"
			/>
		))}
	</div>
);
