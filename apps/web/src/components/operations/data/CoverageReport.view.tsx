import AlertMessage from "@repo/ui/general/AlertMessage";
import type { CoverageReport } from "@/types/process-mining.types";

export function CoverageReportView({
	coverage,
	missing,
}: {
	coverage: CoverageReport;
	missing: string[];
}) {
	return (
		<div className="space-y-3">
			{missing.map((reason) => (
				<AlertMessage key={reason} message={reason} variant="destructive" />
			))}
			<div className="border-border rounded-lg border p-4">
				<p className="text-sm font-medium">Data coverage</p>
				<p className="text-muted-foreground mt-1 text-xs">
					{coverage.casesWithEvents} cases with events ·{" "}
					{coverage.casesWithTwoOrMoreActivities} with 2+ activities
				</p>
				<ul className="mt-3 space-y-2 text-sm">
					{coverage.files.map((file) => (
						<li key={file.fileName} className="border-border/60 border-t pt-2">
							<p className="font-medium">{file.fileName}</p>
							<p className="text-muted-foreground text-xs">
								{file.validCaseKeyCount}/{file.rowCount} rows with case keys
							</p>
							{file.activities.map((activity) => (
								<p
									key={`${file.fileName}-${activity.name}`}
									className="text-muted-foreground text-xs"
								>
									{activity.name}: {activity.validTimestampCount} timestamps
									{activity.dateOnly ? " (date-only)" : ""}
								</p>
							))}
						</li>
					))}
				</ul>
			</div>
		</div>
	);
}
