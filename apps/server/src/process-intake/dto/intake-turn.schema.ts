import { z } from "zod";

const factStatusSchema = z.enum(["confirmed", "assumed", "missing"]);

const requestStepSchema = z.object({
	id: z.string().min(1),
	name: z.string().min(1),
	order: z.number().int().positive(),
	role: z.string(),
	dependsOn: z.array(z.string()).default([]),
	deadlineLabel: z.string().nullish(),
	rules: z.array(z.string()).default([]),
	factStatus: factStatusSchema,
	isDemoAssumption: z.boolean().default(false),
});

const llmStepSchema = z.object({
	id: z.string().min(1),
	name: z.string().min(1),
	order: z.number().int().positive(),
	role: z.string(),
	dependsOn: z.array(z.string()),
	deadlineLabel: z.string(),
	rules: z.array(z.string()),
	factStatus: factStatusSchema,
	isDemoAssumption: z.boolean(),
});

export const intakeDefinitionSchema = z.object({
	id: z.string().min(1),
	name: z.string().min(1),
	industryLabel: z.string(),
	steps: z.array(requestStepSchema),
	rules: z.array(z.unknown()).default([]),
});

const llmDefinitionSchema = z.object({
	id: z.string().min(1),
	name: z.string().min(1),
	industryLabel: z.string(),
	steps: z.array(llmStepSchema),
	rules: z.array(z.string()),
});

export const intakeTurnRequestSchema = z.object({
	messages: z
		.array(
			z.object({
				role: z.enum(["user", "assistant"]),
				content: z.string().min(1),
			}),
		)
		.min(1),
	draft: intakeDefinitionSchema,
	entryPoint: z.enum(["describe", "transcript", "document"]),
});

export const intakeLlmResponseSchema = z.object({
	assistantMessages: z.array(z.string()).min(1).max(3),
	hasQuestion: z.boolean(),
	questionId: z.string(),
	questionPrompt: z.string(),
	questionSuggestions: z.array(z.string()).max(4),
	questionField: z.enum(["role", "deadline", "rule", "dependency", "name"]),
	questionStepId: z.string(),
	draft: llmDefinitionSchema,
	isComplete: z.boolean(),
	capturedStepIds: z.array(z.string()),
});
