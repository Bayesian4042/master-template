import { cn } from "@repo/ui/lib/utils";
import type { Kpi } from "@/types/operations.types";

export function KPIStat({ kpi }: { kpi: Kpi }) {
	return (
		<div className="min-w-0 space-y-1" title={kpi.hint}>
			<p
				className={cn(
					"text-2xl font-semibold tracking-tight tabular-nums",
					kpi.tone === "good" && "text-ops-success",
					kpi.tone === "warn" && "text-ops-warning",
					kpi.tone === "bad" && "text-ops-deviation",
				)}
			>
				{kpi.value}
			</p>
			<p className="text-sm font-medium">{kpi.label}</p>
		</div>
	);
}
