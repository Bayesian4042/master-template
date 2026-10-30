import AlertMessage from "@repo/ui/general/AlertMessage";
import type { DataQualityIssue } from "@/types/operations.types";

export function DataQualityPanel({ issues }: { issues: DataQualityIssue[] }) {
	return (
		<div className="border-border space-y-2 rounded-lg border p-3">
			<div>
				<p className="text-sm font-medium">Record quality</p>
				<p className="text-muted-foreground text-xs">
					Gaps that limit what we can confirm
				</p>
			</div>
			{issues.length === 0 ? (
				<p className="text-muted-foreground text-sm">
					No quality issues in the demo set.
				</p>
			) : (
				<div className="space-y-2">
					{issues.map((issue) => (
						<AlertMessage
							key={issue.id}
							variant={issue.severity === "warning" ? "default" : "info"}
							message={issue.message}
						/>
					))}
				</div>
			)}
		</div>
	);
}
