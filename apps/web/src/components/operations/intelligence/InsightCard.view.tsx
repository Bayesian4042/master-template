import { cn } from "@repo/ui/lib/utils";
import { ChevronRight } from "lucide-react";
import type { Finding, FindingKind } from "@/types/operations.types";

const kindDot: Record<FindingKind, string> = {
	knowledge_gap: "bg-primary",
	process_deviation: "bg-ops-warning",
	data_quality: "bg-muted-foreground",
};

export function InsightCard({
	finding,
	selected,
	onSelect,
}: {
	finding: Finding;
	selected: boolean;
	onSelect: () => void;
}) {
	return (
		<button
			type="button"
			onClick={onSelect}
			className={cn(
				"flex w-full items-center gap-3 border-t py-3 text-left",
				selected && "bg-primary/5 -mx-3 rounded-lg border-transparent px-3",
			)}
		>
			<span
				className={cn("size-1.5 shrink-0 rounded-full", kindDot[finding.kind])}
				aria-hidden
			/>
			<p className="min-w-0 flex-1 truncate text-sm font-medium leading-snug">
				{finding.title}
			</p>
			<span className="text-muted-foreground shrink-0 text-xs tabular-nums">
				{finding.affectedCaseIds.length} cases
			</span>
			<ChevronRight className="text-muted-foreground size-3.5 shrink-0" />
		</button>
	);
}
