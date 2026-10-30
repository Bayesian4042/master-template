export type FactStatus = "confirmed" | "assumed" | "missing";

export type IntakeStep = {
	id: string;
	name: string;
	order: number;
	role: string;
	dependsOn: string[];
	deadlineLabel?: string;
	rules: string[];
	factStatus: FactStatus;
	isDemoAssumption: boolean;
};

export type IntakeDefinition = {
	id: string;
	name: string;
	industryLabel: string;
	steps: IntakeStep[];
	rules: unknown[];
};

export type IntakeChatMessage = {
	role: "user" | "assistant";
	content: string;
};

export type IntakeQuestion = {
	id: string;
	prompt: string;
	suggestions: string[];
	field: "role" | "deadline" | "rule" | "dependency" | "name";
	stepId?: string;
};

export type IntakeTurnRequest = {
	messages: IntakeChatMessage[];
	draft: IntakeDefinition;
	entryPoint: "describe" | "transcript" | "document";
};

export type IntakeTurnResponse = {
	assistantMessages: string[];
	question: IntakeQuestion | null;
	draft: IntakeDefinition;
	isComplete: boolean;
	capturedStepIds: string[];
};
