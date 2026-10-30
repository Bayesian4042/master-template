import type {
	CapturedFact,
	ClarificationQuestion,
	DiscoveryScriptTurn,
} from "@/types/operations.types";

export type DiscoveryFactStatus = "captured" | "skipped" | "open";

export type DiscoveryFact = {
	id: string;
	label: string;
	status: DiscoveryFactStatus;
	answer?: string;
};

function labelForQuestion(id: string, answer?: string): string {
	if (answer && answer.length <= 28) return answer;
	return id.replace(/^q-/, "").replace(/-/g, " ");
}

export function getDiscoveryFacts(
	capturedFacts: Record<string, CapturedFact>,
	pendingQuestion?: ClarificationQuestion | null,
): DiscoveryFact[] {
	const facts: DiscoveryFact[] = Object.entries(capturedFacts).map(
		([id, captured]) => {
			if (captured.status === "skipped") {
				return {
					id,
					label: labelForQuestion(id),
					status: "skipped" as const,
				};
			}
			return {
				id,
				label: labelForQuestion(id, captured.answer),
				status: "captured" as const,
				answer: captured.answer,
			};
		},
	);

	if (pendingQuestion && !capturedFacts[pendingQuestion.id]) {
		facts.push({
			id: pendingQuestion.id,
			label: pendingQuestion.prompt.slice(0, 40),
			status: "open",
		});
	}

	return facts;
}

export function formatCaptureReceipt(
	questionId: string,
	answer: string | null,
): string | undefined {
	const label = labelForQuestion(questionId, answer ?? undefined);
	if (!answer) return `Skipped · ${label}`;
	return `Captured · ${label}`;
}

export function getActiveQuestionStepIds(
	turn: DiscoveryScriptTurn | undefined,
): string[] {
	if (!turn?.question) return [];
	if (turn.question.stepId) return [turn.question.stepId];
	if (turn.question.revealsStepIds?.length) return turn.question.revealsStepIds;
	return turn.revealStepIds ?? [];
}
