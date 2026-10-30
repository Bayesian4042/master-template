import { Skeleton } from "@repo/ui/components/skeleton";
import { Suspense } from "react";
import { IntelligenceWorkspace } from "@/components/operations";

export default function IntelligencePage() {
	return (
		<Suspense
			fallback={
				<div className="space-y-4 p-6">
					<Skeleton className="h-28 w-full" />
					<Skeleton className="h-96 w-full" />
				</div>
			}
		>
			<IntelligenceWorkspace />
		</Suspense>
	);
}
