"use client";

import { CustomTable } from "@repo/ui/general/CustomTable";
import type { ColumnDef } from "@tanstack/react-table";
import type { BottleneckFinding } from "@/types/process-mining.types";

type EvidenceRow = {
	caseId: string;
	fromTimestamp: string;
	toTimestamp: string;
	waitHours: number;
	source: string;
};

const columns: ColumnDef<EvidenceRow>[] = [
	{ accessorKey: "caseId", header: "Case" },
	{ accessorKey: "fromTimestamp", header: "From" },
	{ accessorKey: "toTimestamp", header: "To" },
	{ accessorKey: "waitHours", header: "Wait (h)" },
	{ accessorKey: "source", header: "Source" },
];

function formatTs(value: string) {
	return new Date(value).toISOString().replace("T", " ").slice(0, 16);
}

export function BottleneckFindingView({
	finding,
}: {
	finding: BottleneckFinding;
}) {
	const rows: EvidenceRow[] = finding.evidence.map((item) => ({
		caseId: item.caseId,
		fromTimestamp: formatTs(item.fromEvent.timestamp),
		toTimestamp: formatTs(item.toEvent.timestamp),
		waitHours: item.waitHours,
		source: `${item.fromEvent.fileName}:${item.fromEvent.rowNumbers.join(",")} → ${item.toEvent.fileName}:${item.toEvent.rowNumbers.join(",")}`,
	}));

	return (
		<section className="space-y-3">
			<div className="border-border rounded-lg border p-4">
				<p className="text-sm font-medium">Longest median wait</p>
				<p className="mt-1 text-sm">
					{finding.from} → {finding.to} has the longest median waiting time:{" "}
					{finding.medianWaitHours} hours across {finding.caseCount} cases
					{finding.lowSample ? " (small sample)" : ""}.
				</p>
			</div>
			<CustomTable
				data={rows}
				columns={columns}
				enablePagination
				pageSize={8}
				emptyState={<p className="text-sm">No evidence rows.</p>}
			/>
		</section>
	);
}
