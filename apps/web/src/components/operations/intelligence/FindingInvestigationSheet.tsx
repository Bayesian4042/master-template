"use client";

import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@repo/ui/components/accordion";
import { Badge } from "@repo/ui/components/badge";
import { Button } from "@repo/ui/components/button";
import {
	Collapsible,
	CollapsibleContent,
	CollapsibleTrigger,
} from "@repo/ui/components/collapsible";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@repo/ui/components/select";
import {
	Sheet,
	SheetContent,
	SheetDescription,
	SheetFooter,
	SheetHeader,
	SheetTitle,
} from "@repo/ui/components/sheet";
import { ChevronRight } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import type {
	CaseEvent,
	Finding,
	IntelligenceResult,
	ProcessDefinition,
} from "@/types/operations.types";
import { CaseTimeline } from "./CaseTimeline.view";
import { EvidencePanel } from "./EvidencePanel.view";

const kindLabel = {
	knowledge_gap: "Knowledge gap",
	process_deviation: "Process deviation",
	data_quality: "Data quality",
} as const;

export function FindingInvestigationSheet({
	open,
	onOpenChange,
	finding,
	focus,
	result,
	definition,
	events,
	onResolve,
}: {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	finding: Finding | null;
	focus: "evidence" | "sites";
	result: IntelligenceResult;
	definition: ProcessDefinition;
	events: CaseEvent[];
	onResolve: (
		choice:
			| "confirm_deviation"
			| "update_understanding"
			| "request_clarification",
	) => void;
}) {
	const [caseId, setCaseId] = useState<string>("");

	const evidenceEvents = useMemo(() => {
		if (!finding) return [];
		const ids = new Set(finding.evidenceEventIds);
		return events.filter((event) => ids.has(event.id));
	}, [events, finding]);

	const selectedCaseId = caseId || finding?.affectedCaseIds[0] || "";
	const observed =
		result.cases.find((c) => c.caseId === selectedCaseId) ?? null;
	const sites = useMemo(() => {
		if (!finding) return [];
		const grouped = new Map<string, string[]>();
		for (const id of finding.affectedCaseIds) {
			const site =
				result.cases.find((item) => item.caseId === id)?.siteName ??
				"Unknown site";
			const list = grouped.get(site) ?? [];
			list.push(id);
			grouped.set(site, list);
		}
		return [...grouped.entries()];
	}, [finding, result.cases]);
	const canResolve =
		finding?.deviationType === "wrong_role" && finding.stepId === "ki";

	useEffect(() => {
		if (!open || !finding) return;
		document
			.getElementById(
				focus === "sites" ? "investigation-sites" : "investigation-evidence",
			)
			?.scrollIntoView({ block: "start" });
	}, [open, focus, finding]);

	return (
		<Sheet open={open} onOpenChange={onOpenChange}>
			<SheetContent
				side="right"
				className="ops-theme w-full gap-0 overflow-hidden sm:max-w-xl md:max-w-2xl"
			>
				{finding ? (
					<>
						<SheetHeader>
							<div className="flex flex-wrap gap-1.5">
								<Badge variant="outline">{kindLabel[finding.kind]}</Badge>
								{finding.evidenceState === "potential" && (
									<Badge variant="secondary">Needs a check</Badge>
								)}
							</div>
							<SheetTitle>{finding.title}</SheetTitle>
							<SheetDescription>
								{finding.affectedCaseIds.length} of {finding.denominator} cases
								({finding.percentageOfCases}%) · demo data
							</SheetDescription>
						</SheetHeader>

						<div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-4 pb-4">
							<section className="grid gap-3 sm:grid-cols-2">
								<div className="border-border rounded-lg border p-3">
									<p className="text-ops-stated text-xs font-medium tracking-wide uppercase">
										How you said it works
									</p>
									<p className="mt-1 text-sm leading-relaxed">
										{finding.stated}
									</p>
								</div>
								<div className="border-border rounded-lg border p-3">
									<p className="text-ops-observed text-xs font-medium tracking-wide uppercase">
										What the records show
									</p>
									<p className="mt-1 text-sm leading-relaxed">
										{finding.observed}
									</p>
								</div>
							</section>

							<p className="text-muted-foreground text-sm leading-relaxed">
								{finding.whyItMatters}
							</p>

							<section id="investigation-evidence" className="space-y-2">
								<h3 className="text-sm font-medium">Supporting records</h3>
								<EvidencePanel events={evidenceEvents} />
							</section>

							<section id="investigation-sites" className="space-y-2">
								<h3 className="text-sm font-medium">Affected cases by site</h3>
								{sites.map(([site, caseIds]) => (
									<Collapsible key={site}>
										<CollapsibleTrigger className="group flex w-full items-center gap-2 py-1.5 text-left text-sm">
											<ChevronRight className="text-muted-foreground size-3.5 shrink-0 transition-transform group-aria-expanded:rotate-90" />
											<span className="min-w-0 flex-1 truncate">{site}</span>
											<span className="text-muted-foreground text-xs tabular-nums">
												{caseIds.length}
											</span>
										</CollapsibleTrigger>
										<CollapsibleContent>
											<p className="text-muted-foreground pb-2 pl-5 text-xs leading-relaxed">
												{caseIds.join(", ")}
											</p>
										</CollapsibleContent>
									</Collapsible>
								))}
							</section>

							<Accordion defaultValue={[]}>
								<AccordionItem value="timeline">
									<AccordionTrigger>Case timeline</AccordionTrigger>
									<AccordionContent>
										<div className="space-y-3">
											<Select
												value={selectedCaseId}
												onValueChange={(value) => setCaseId(value ?? "")}
											>
												<SelectTrigger className="w-[200px]">
													<SelectValue placeholder="Select case" />
												</SelectTrigger>
												<SelectContent className="ops-theme">
													{finding.affectedCaseIds.map((id) => (
														<SelectItem key={id} value={id}>
															{id}
														</SelectItem>
													))}
												</SelectContent>
											</Select>
											{observed ? (
												<CaseTimeline
													observed={observed}
													definition={definition}
												/>
											) : (
												<p className="text-muted-foreground text-sm">
													Select an affected case.
												</p>
											)}
										</div>
									</AccordionContent>
								</AccordionItem>
								<AccordionItem value="explanations">
									<AccordionTrigger>Possible explanations</AccordionTrigger>
									<AccordionContent>
										<ul className="text-muted-foreground list-disc space-y-1 pl-4">
											{finding.explanations.map((item) => (
												<li key={item}>{item}</li>
											))}
										</ul>
									</AccordionContent>
								</AccordionItem>
								<AccordionItem value="actions">
									<AccordionTrigger>Recommended actions</AccordionTrigger>
									<AccordionContent>
										<ul className="list-disc space-y-1 pl-4">
											{finding.actions.map((item) => (
												<li key={item}>{item}</li>
											))}
										</ul>
									</AccordionContent>
								</AccordionItem>
							</Accordion>
						</div>

						{canResolve && (
							<SheetFooter className="border-border border-t">
								<div className="flex flex-wrap gap-2">
									<Button
										type="button"
										size="sm"
										variant="outline"
										onClick={() => onResolve("confirm_deviation")}
									>
										Confirm deviation
									</Button>
									<Button
										type="button"
										size="sm"
										onClick={() => onResolve("update_understanding")}
									>
										Unit Managers own it
									</Button>
									<Button
										type="button"
										size="sm"
										variant="ghost"
										onClick={() => onResolve("request_clarification")}
									>
										Need clarification
									</Button>
								</div>
							</SheetFooter>
						)}
					</>
				) : null}
			</SheetContent>
		</Sheet>
	);
}
