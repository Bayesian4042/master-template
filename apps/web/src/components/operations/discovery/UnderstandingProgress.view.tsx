import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@repo/ui/components/popover";
import { cn } from "@repo/ui/lib/utils";
import type { DiscoveryFact } from "@/utils/process-intelligence/discovery-progress.utils";

const statusLabel = {
	captured: "Captured",
	skipped: "Assumed",
	open: "Open",
} as const;

export function UnderstandingProgress({ facts }: { facts: DiscoveryFact[] }) {
	const captured = facts.filter((fact) => fact.status === "captured").length;

	return (
		<Popover>
			<div className="flex w-44 flex-col items-end gap-1.5">
				<div className="flex w-full gap-1" aria-hidden="true">
					{facts.map((fact) => (
						<span
							key={fact.id}
							className={cn(
								"h-1 flex-1 rounded-full",
								fact.status === "captured" && "bg-primary",
								fact.status === "skipped" && "ops-fact-assumed",
								fact.status === "open" && "bg-muted",
							)}
						/>
					))}
				</div>
				<PopoverTrigger className="text-muted-foreground hover:text-foreground text-xs">
					{captured} of {facts.length} facts
				</PopoverTrigger>
			</div>
			<PopoverContent align="end" className="ops-theme w-64 gap-1.5 p-3">
				{facts.map((fact) => (
					<div
						key={fact.id}
						className="flex items-start justify-between gap-3 text-xs"
					>
						<span className="min-w-0">
							<span className="block">{fact.label}</span>
							{fact.answer && (
								<span className="text-muted-foreground block truncate">
									{fact.answer}
								</span>
							)}
						</span>
						<span
							className={cn(
								"shrink-0",
								fact.status === "captured" && "text-primary",
								fact.status === "skipped" && "text-ops-warning",
								fact.status === "open" && "text-muted-foreground",
							)}
						>
							{statusLabel[fact.status]}
						</span>
					</div>
				))}
			</PopoverContent>
		</Popover>
	);
}
