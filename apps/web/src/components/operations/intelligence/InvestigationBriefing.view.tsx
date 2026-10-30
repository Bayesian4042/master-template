import { Button } from "@repo/ui/components/button";
import type { FindingKind, IntelligenceResult } from "@/types/operations.types";

const kindLabel: Record<FindingKind, string> = {
	knowledge_gap: "Knowledge gap",
	process_deviation: "Process deviation",
	data_quality: "Data quality",
};

export function InvestigationBriefing({
	headline,
	note,
	onInvestigate,
	onCompareSites,
}: {
	headline: IntelligenceResult["headline"];
	note: string | null;
	onInvestigate: () => void;
	onCompareSites: () => void;
}) {
	return (
		<section className="max-w-3xl space-y-3">
			<p className="text-primary text-xs font-medium tracking-wide">
				{kindLabel[headline.kind]}
			</p>
			<h2 className="text-2xl font-semibold tracking-tight text-balance sm:text-3xl">
				{headline.title}
			</h2>
			{headline.findingId && (
				<div className="flex flex-wrap gap-2">
					<Button type="button" size="sm" onClick={onInvestigate}>
						Investigate evidence
					</Button>
					<Button
						type="button"
						size="sm"
						variant="outline"
						onClick={onCompareSites}
					>
						Compare sites
					</Button>
				</div>
			)}
			{note && (
				<p className="text-primary truncate text-sm leading-relaxed">{note}</p>
			)}
			{(headline.statedShort || headline.observedShort) && (
				<p className="text-muted-foreground text-sm leading-relaxed">
					<span className="text-foreground">Stated:</span>{" "}
					{headline.statedShort}
					<span className="mx-2 text-border">·</span>
					<span className="text-foreground">Observed:</span>{" "}
					{headline.observedShort}
					<span className="mx-2 text-border">·</span>
					<span
						title="A case can carry more than one signal."
						className="cursor-help tabular-nums"
					>
						{headline.affectedCases} of {headline.casesAnalysed} cases
					</span>
				</p>
			)}
		</section>
	);
}
