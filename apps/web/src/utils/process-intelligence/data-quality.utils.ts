import type { CaseEvent, DataQualityIssue } from "@/types/operations.types";

export function deriveDataQualityIssues(
	events: CaseEvent[],
): DataQualityIssue[] {
	const missingTs = events.filter((e) => !e.timestamp);
	const missingActor = events.filter((e) => !e.actor);
	const missingRole = events.filter((e) => !e.role);
	const issues: DataQualityIssue[] = [];

	if (missingTs.length > 0) {
		issues.push({
			id: "dq-missing-timestamp",
			severity: "warning",
			message: `${missingTs.length} records are missing a timestamp — timing checks cannot run on those rows.`,
			eventIds: missingTs.map((e) => e.id),
			count: missingTs.length,
		});
	}

	if (missingActor.length > 0) {
		issues.push({
			id: "dq-missing-actor",
			severity: "info",
			message: `${missingActor.length} records have no actor name.`,
			eventIds: missingActor.map((e) => e.id),
			count: missingActor.length,
		});
	}

	if (missingRole.length > 0) {
		issues.push({
			id: "dq-missing-role",
			severity: "warning",
			message: `${missingRole.length} records have no role — ownership checks are incomplete.`,
			eventIds: missingRole.map((e) => e.id),
			count: missingRole.length,
		});
	}

	return issues;
}
