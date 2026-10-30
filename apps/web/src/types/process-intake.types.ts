import type {
	ClarificationQuestion,
	ConversationEntryPoint,
	ProcessDefinition,
} from "./operations.types";

export type IntakeChatMessage = {
	role: "user" | "assistant";
	content: string;
};

export type IntakeTurnRequest = {
	messages: IntakeChatMessage[];
	draft: ProcessDefinition;
	entryPoint: ConversationEntryPoint;
};

export type IntakeTurnResponse = {
	assistantMessages: string[];
	question: ClarificationQuestion | null;
	draft: ProcessDefinition;
	isComplete: boolean;
	capturedStepIds: string[];
};
