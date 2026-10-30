"use client";

import { Skeleton } from "@repo/ui/components/skeleton";
import AlertMessage from "@repo/ui/general/AlertMessage";
import LoadingButton from "@repo/ui/general/LoadingButton";
import { authClient } from "@/lib/auth-client";
import { useUserOverview } from "@/queries";
import { getDashboardGreeting } from "@/utils";
import { OverviewStats, OverviewStatsSkeleton } from "./OverviewStats.view";

export const DashboardOverview = () => {
	const { data: session, isPending: isSessionPending } =
		authClient.useSession();
	const {
		data: overview,
		isPending,
		isError,
		error,
		isFetching,
		refetch,
	} = useUserOverview();

	return (
		<div className="space-y-6">
			<div className="space-y-1">
				{isSessionPending ? (
					<Skeleton className="h-8 w-64" data-testid="greeting-skeleton" />
				) : (
					<h1 className="text-2xl font-semibold">
						{getDashboardGreeting(session?.user)}
					</h1>
				)}
				<p className="text-muted-foreground text-sm">
					Here's an overview of your account.
				</p>
			</div>

			{isPending && <OverviewStatsSkeleton />}

			{isError && (
				<div className="space-y-3">
					<AlertMessage variant="destructive" message={error.message} />
					<LoadingButton
						variant="outline"
						size="sm"
						isLoading={isFetching}
						onClick={() => refetch()}
					>
						Retry
					</LoadingButton>
				</div>
			)}

			{overview && <OverviewStats overview={overview} />}
		</div>
	);
};
