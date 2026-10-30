"use client";

import { Skeleton } from "@repo/ui/components/skeleton";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { CMP_CASE_SERVICE_DATES, CMP_EVENTS } from "@/constants/templates/cmp";
import { useProcessSession } from "@/contexts";
import { useProcessIntelligence } from "@/hooks";
import { applyKitchenIndentResolution } from "@/utils/process-intelligence/briefing.utils";
import { reconcileProcess } from "@/utils/process-intelligence/reconcile.utils";
import { FindingInvestigationSheet } from "./FindingInvestigationSheet";
import { InsightCard } from "./InsightCard.view";
import { InvestigationBriefing } from "./InvestigationBriefing.view";
import { KPIStat } from "./KPIStat.view";
import { StepAdherenceChart } from "./StepAdherenceChart.view";

export function IntelligenceWorkspace() {
	const { state, recordResolution } = useProcessSession();
	const result = useProcessIntelligence(state.definition);
	const searchParams = useSearchParams();
	const pathname = usePathname();
	const router = useRouter();
	const [ready, setReady] = useState(false);
	const [focus, setFocus] = useState<"evidence" | "sites">("evidence");

	useEffect(() => {
		const id = window.setTimeout(() => setReady(true), 350);
		return () => window.clearTimeout(id);
	}, []);

	const findingId = searchParams.get("finding");
	const selected = useMemo(
		() => result.findings.find((finding) => finding.id === findingId) ?? null,
		[findingId, result.findings],
	);

	const openFinding = (id: string | null) => {
		const params = new URLSearchParams(searchParams.toString());
		if (id) params.set("finding", id);
		else params.delete("finding");
		const query = params.toString();
		router.replace(query ? `${pathname}?${query}` : pathname, {
			scroll: false,
		});
	};

	const openLead = (nextFocus: "evidence" | "sites") => {
		if (!result.headline.findingId) return;
		setFocus(nextFocus);
		openFinding(result.headline.findingId);
	};

	const ownershipMismatches = (definition: typeof state.definition) =>
		reconcileProcess(
			definition,
			CMP_EVENTS,
			CMP_CASE_SERVICE_DATES,
		).deviations.filter(
			(deviation) =>
				deviation.type === "wrong_role" &&
				deviation.stepId === "ki" &&
				deviation.evidenceState === "confirmed",
		).length;

	const resolveIndent = (
		choice:
			| "confirm_deviation"
			| "update_understanding"
			| "request_clarification",
	) => {
		const before = ownershipMismatches(state.definition);
		if (choice === "request_clarification") {
			recordResolution(
				state.definition,
				"Clarification requested from operations. Findings are unchanged until they respond.",
			);
			return;
		}

		const next = applyKitchenIndentResolution(state.definition, choice);
		const after = ownershipMismatches(next);
		const note =
			choice === "update_understanding"
				? `Stated owner is now Unit Manager. Ownership mismatches went from ${before} to ${after} of ${result.cases.length} cases.`
				: `Chef Manager stays the intended owner. ${before} cases are now a process deviation, not an open question about the documentation.`;
		recordResolution(next, note);
		openFinding(null);
	};

	const otherFindings = result.findings.filter(
		(finding) => finding.id !== result.headline.findingId,
	);

	if (!ready) {
		return (
			<div className="min-h-0 flex-1 overflow-y-auto">
				<div className="space-y-6 px-6 py-6">
					<Skeleton className="h-40 max-w-3xl" />
					<div className="grid grid-cols-2 gap-6 lg:grid-cols-4">
						{Array.from({ length: 4 }).map((_, index) => (
							<Skeleton key={index} className="h-16" />
						))}
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-0 flex-1 overflow-y-auto">
			<div className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-6 py-6">
				<InvestigationBriefing
					headline={result.headline}
					note={state.resolutionNote}
					onInvestigate={() => openLead("evidence")}
					onCompareSites={() => openLead("sites")}
				/>

				<div className="grid grid-cols-2 gap-x-8 gap-y-6 lg:grid-cols-4">
					{result.kpis.map((kpi) => (
						<KPIStat key={kpi.id} kpi={kpi} />
					))}
				</div>

				<div className="grid items-start gap-10 lg:grid-cols-[minmax(0,1.4fr)_minmax(18rem,1fr)]">
					<section>
						<h3 className="text-sm font-medium">What to look at next</h3>
						<div>
							{otherFindings.map((finding) => (
								<InsightCard
									key={finding.id}
									finding={finding}
									selected={finding.id === findingId}
									onSelect={() => {
										setFocus("evidence");
										openFinding(finding.id);
									}}
								/>
							))}
						</div>
					</section>
					<StepAdherenceChart
						data={result.stepAdherence}
						bottlenecks={result.bottlenecks}
					/>
				</div>

				<FindingInvestigationSheet
					open={Boolean(selected)}
					onOpenChange={(open) => {
						if (!open) openFinding(null);
					}}
					finding={selected}
					focus={focus}
					result={result}
					definition={state.definition}
					events={CMP_EVENTS}
					onResolve={resolveIndent}
				/>
			</div>
		</div>
	);
}
