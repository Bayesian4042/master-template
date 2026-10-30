import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@repo/ui/components/table";
import type { CaseEvent } from "@/types/operations.types";

export function EvidencePanel({ events }: { events: CaseEvent[] }) {
	if (events.length === 0) {
		return (
			<p className="text-muted-foreground text-sm">
				No source rows linked to this finding.
			</p>
		);
	}

	return (
		<div className="border-border overflow-hidden rounded-lg border">
			<Table>
				<TableHeader>
					<TableRow>
						<TableHead>Case</TableHead>
						<TableHead>Activity</TableHead>
						<TableHead>When</TableHead>
						<TableHead>Actor</TableHead>
						<TableHead>Source</TableHead>
						<TableHead className="text-right">Qty</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{events.map((event) => (
						<TableRow key={event.id}>
							<TableCell className="font-mono text-xs">
								{event.caseId}
							</TableCell>
							<TableCell className="text-xs uppercase">
								{event.activityId}
							</TableCell>
							<TableCell className="text-xs tabular-nums">
								{event.timestamp
									? new Date(event.timestamp).toLocaleString()
									: "—"}
							</TableCell>
							<TableCell className="text-xs">
								{event.actor ?? "—"}
								{event.role ? (
									<span className="text-muted-foreground"> · {event.role}</span>
								) : null}
							</TableCell>
							<TableCell className="font-mono text-xs">
								{event.sourceRecord.dataset}/{event.sourceRecord.rowId}
							</TableCell>
							<TableCell className="text-right font-mono text-xs tabular-nums">
								{event.values.quantity !== undefined
									? `${event.values.quantity}${event.values.unit ? ` ${event.values.unit}` : ""}`
									: "—"}
							</TableCell>
						</TableRow>
					))}
				</TableBody>
			</Table>
		</div>
	);
}
