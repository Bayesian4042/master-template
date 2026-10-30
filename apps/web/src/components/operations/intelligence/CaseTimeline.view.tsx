import { Badge } from "@repo/ui/components/badge";
import type {
	ConformanceRule,
	ObservedCase,
	ProcessDefinition,
} from "@/types/operations.types";

function deadlineFor(
	serviceDate: string,
	rule: Extract<ConformanceRule, { kind: "deadline" }>,
) {
	const d = new Date(
		`${serviceDate}T${String(rule.hour).padStart(2, "0")}:${String(rule.minute).padStart(2, "0")}:00`,
	);
	d.setDate(d.getDate() - rule.daysBeforeService);
	return d;
}

export function CaseTimeline({
	observed,
	definition,
}: {
	observed: ObservedCase;
	definition: ProcessDefinition;
}) {
	const deadlineRule = definition.rules.find(
		(rule): rule is Extract<ConformanceRule, { kind: "deadline" }> =>
			rule.kind === "deadline",
	);

	return (
		<div className="space-y-3">
			<div className="flex flex-wrap items-center gap-2">
				<p className="text-sm font-medium">{observed.caseId}</p>
				<Badge variant="outline">{observed.siteName}</Badge>
				<span className="text-muted-foreground text-xs">
					Service {observed.serviceDate}
				</span>
			</div>
			<ol className="border-border relative space-y-3 border-l pl-4">
				{definition.steps
					.slice()
					.sort((a, b) => a.order - b.order)
					.map((step) => {
						const event = observed.events.find((e) => e.activityId === step.id);
						const expectedDeadline =
							deadlineRule?.stepId === step.id
								? deadlineFor(observed.serviceDate, deadlineRule)
								: null;
						return (
							<li key={step.id} className="relative">
								<span className="bg-primary absolute top-1.5 -left-[1.2rem] size-2 rounded-full" />
								<p className="text-sm font-medium">{step.name}</p>
								<p className="text-muted-foreground text-xs">
									Stated owner: {step.role}
									{step.isDemoAssumption ? " (demo assumption)" : ""}
								</p>
								{expectedDeadline && (
									<p className="text-xs text-ops-stated">
										Stated cut-off: {expectedDeadline.toLocaleString()}
									</p>
								)}
								{event ? (
									<p className="text-xs text-ops-observed">
										Observed:{" "}
										{event.timestamp
											? new Date(event.timestamp).toLocaleString()
											: "timestamp missing"}
										{event.role ? ` · ${event.role}` : ""}
									</p>
								) : (
									<p className="text-xs text-ops-insufficient">
										No linked record — insufficient evidence
									</p>
								)}
							</li>
						);
					})}
			</ol>
		</div>
	);
}
