import { createOpenAI } from "@ai-sdk/openai";
import {
	BadRequestException,
	Injectable,
	ServiceUnavailableException,
} from "@nestjs/common";
import { generateObject } from "ai";
import { ZodError } from "zod";
import { config } from "../common/config";
import {
	intakeLlmResponseSchema,
	intakeTurnRequestSchema,
} from "./dto/intake-turn.schema";
import type {
	IntakeDefinition,
	IntakeQuestion,
	IntakeTurnRequest,
	IntakeTurnResponse,
} from "./process-intake.types";

function emptyDraft(): IntakeDefinition {
	return {
		id: "expected-process",
		name: "Expected process",
		industryLabel: "Stated by user",
		steps: [],
		rules: [],
	};
}

function toQuestion(object: {
	hasQuestion: boolean;
	questionId: string;
	questionPrompt: string;
	questionSuggestions: string[];
	questionField: IntakeQuestion["field"];
	questionStepId: string;
}): IntakeQuestion | null {
	if (!object.hasQuestion || !object.questionPrompt.trim()) return null;
	return {
		id: object.questionId || `q-${Date.now()}`,
		prompt: object.questionPrompt,
		suggestions: object.questionSuggestions ?? [],
		field: object.questionField,
		stepId: object.questionStepId.trim() || undefined,
	};
}

@Injectable()
export class ProcessIntakeService {
	async turn(raw: unknown): Promise<IntakeTurnResponse> {
		if (!config.openai.apiKey) {
			throw new ServiceUnavailableException(
				"OPENAI_API_KEY is not configured",
			);
		}

		let request: IntakeTurnRequest;
		try {
			const parsed = intakeTurnRequestSchema.parse({
				...(typeof raw === "object" && raw !== null ? raw : {}),
				draft:
					typeof raw === "object" &&
					raw !== null &&
					"draft" in raw &&
					raw.draft
						? raw.draft
						: emptyDraft(),
			});
			request = {
				...parsed,
				draft: {
					...parsed.draft,
					steps: parsed.draft.steps.map((step) => ({
						...step,
						deadlineLabel: step.deadlineLabel ?? undefined,
					})),
				},
			};
		} catch (error) {
			if (error instanceof ZodError) {
				throw new BadRequestException(
					error.issues.map((issue) => issue.message).join("; "),
				);
			}
			throw error;
		}

		const openai = createOpenAI({ apiKey: config.openai.apiKey });
		const { object } = await generateObject({
			model: openai(config.openai.model),
			schema: intakeLlmResponseSchema,
			schemaName: "processIntakeTurnV2",
			prompt: `You are an operations analyst helping extract a stated (expected) business process.
Entry point: ${request.entryPoint}

Goals:
- Build / refine an expected process draft from the conversation.
- Ask one focused clarification at a time when something important is ambiguous.
- Prefer concrete steps, roles, sequence (dependsOn), deadlines, and rules.
- Mark factStatus: "confirmed" when the user clearly stated it, "assumed" when you inferred it, "missing" only for placeholders you still need.
- isDemoAssumption must always be false (this is live intake, not demo data).
- Use short stable step ids (slug-like: mp, mr, pp).
- When enough of the core sequence is confirmed (at least 3 steps with roles, or user says they are done), set isComplete=true and hasQuestion=false.
- Otherwise set isComplete=false and hasQuestion=true with questionPrompt plus 2-4 short questionSuggestions.
- Use empty string "" for questionStepId or deadlineLabel when unknown.
- capturedStepIds: step ids newly confirmed or assumed in this turn.
- Do not invent ERP integrations or claim observations from records — this is stated process only.
- Keep assistantMessages concise (1-2 short paragraphs).
- draft.rules must be an array of short rule strings (can be empty).

Current draft JSON:
${JSON.stringify(request.draft, null, 2)}

Conversation (oldest first):
${request.messages.map((m) => `${m.role.toUpperCase()}: ${m.content}`).join("\n\n")}
`,
		});

		const question = toQuestion(object);

		return {
			assistantMessages: object.assistantMessages,
			question,
			draft: {
				...object.draft,
				rules: object.draft.rules ?? [],
				steps: object.draft.steps.map((step) => ({
					...step,
					deadlineLabel: step.deadlineLabel.trim()
						? step.deadlineLabel
						: undefined,
					isDemoAssumption: false,
					dependsOn: step.dependsOn ?? [],
					rules: step.rules ?? [],
				})),
			},
			isComplete: object.isComplete && !question,
			capturedStepIds: object.capturedStepIds ?? [],
		};
	}
}
