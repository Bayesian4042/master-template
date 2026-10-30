"use client";

import {
	createContext,
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useState,
} from "react";
import { CMP_INTAKE_SEEDS } from "@/constants/templates/cmp";
import { ProcessIntakeService } from "@/services";
import type {
	ClarificationQuestion,
	ConversationEntryPoint,
	ConversationMessage,
	ProcessDefinition,
	ProcessSessionState,
} from "@/types/operations.types";
import type { IntakeTurnResponse } from "@/types/process-intake.types";
import { formatCaptureReceipt } from "@/utils/process-intelligence/discovery-progress.utils";

const STORAGE_KEY = "heizen-ops-process-session-v4";

type ProcessSessionContextValue = {
	state: ProcessSessionState;
	visibleSteps: ProcessDefinition;
	startSession: (
		entryPoint: ConversationEntryPoint,
		openingText?: string,
	) => void;
	confirmAnswer: (answer: string) => void;
	skipQuestion: () => void;
	updateDefinition: (definition: ProcessDefinition) => void;
	recordResolution: (definition: ProcessDefinition, note: string) => void;
	selectStep: (stepId: string | null) => void;
	resetSession: () => void;
};

const ProcessSessionContext = createContext<ProcessSessionContextValue | null>(
	null,
);

function emptyDefinition(): ProcessDefinition {
	return {
		id: "expected-process",
		name: "Expected process",
		industryLabel: "Stated by user",
		steps: [],
		rules: [],
	};
}

function createInitialState(): ProcessSessionState {
	return {
		definition: emptyDefinition(),
		entryPoint: null,
		messages: [],
		turnIndex: -1,
		isComplete: false,
		isThinking: false,
		selectedStepId: null,
		pendingQuestion: null,
		error: null,
		capturedFacts: {},
		lastCapturedStepIds: [],
		captureSeq: 0,
		resolutionNote: null,
	};
}

function loadState(): ProcessSessionState {
	if (typeof window === "undefined") return createInitialState();
	try {
		const raw = window.localStorage.getItem(STORAGE_KEY);
		if (!raw) return createInitialState();
		const parsed = JSON.parse(raw) as ProcessSessionState;
		if (!parsed?.definition) return createInitialState();
		return {
			...createInitialState(),
			...parsed,
			pendingQuestion: parsed.pendingQuestion ?? null,
			error: null,
			isThinking: false,
			capturedFacts: parsed.capturedFacts ?? {},
			lastCapturedStepIds: parsed.lastCapturedStepIds ?? [],
			captureSeq: parsed.captureSeq ?? 0,
		};
	} catch {
		return createInitialState();
	}
}

function appendAssistant(
	messages: ConversationMessage[],
	texts: string[],
	question: ClarificationQuestion | null,
): ConversationMessage[] {
	const next = [...messages];
	for (const content of texts) {
		next.push({
			id: `a-${next.length}-${content.slice(0, 12)}`,
			role: "assistant",
			content,
		});
	}
	if (question) {
		next.push({
			id: `q-${question.id}`,
			role: "assistant",
			content: question.prompt,
			kind: "question",
		});
	}
	return next;
}

function toApiMessages(messages: ConversationMessage[]) {
	return messages
		.filter((message) => message.kind !== "question")
		.map((message) => ({
			role: message.role,
			content: message.content,
		}));
}

function openingUserText(
	entryPoint: ConversationEntryPoint,
	openingText?: string,
) {
	if (openingText?.trim()) return openingText.trim();
	if (entryPoint === "transcript") return CMP_INTAKE_SEEDS.transcript;
	if (entryPoint === "document") return CMP_INTAKE_SEEDS.document;
	return "I'd like to describe how our operational process works across sites.";
}

export function ProcessSessionProvider({
	children,
}: {
	children: React.ReactNode;
}) {
	const [state, setState] = useState<ProcessSessionState>(createInitialState);
	const [hydrated, setHydrated] = useState(false);

	useEffect(() => {
		setState(loadState());
		setHydrated(true);
	}, []);

	useEffect(() => {
		if (!hydrated) return;
		window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
	}, [state, hydrated]);

	const applyTurn = useCallback(
		async (params: {
			entryPoint: ConversationEntryPoint;
			messages: ConversationMessage[];
			definition: ProcessDefinition;
			base: ProcessSessionState;
			questionId?: string;
			answer?: string | null;
		}) => {
			const response: IntakeTurnResponse = await ProcessIntakeService.turn({
				entryPoint: params.entryPoint,
				messages: toApiMessages(params.messages),
				draft: params.definition,
			});

			const capturedFacts = { ...params.base.capturedFacts };
			if (params.questionId) {
				capturedFacts[params.questionId] = params.answer
					? { status: "confirmed", answer: params.answer }
					: { status: "skipped" };
			}

			setState({
				...params.base,
				definition: {
					...response.draft,
					rules: response.draft.rules ?? [],
					steps: (response.draft.steps ?? []).map((step) => ({
						...step,
						dependsOn: step.dependsOn ?? [],
						rules: step.rules ?? [],
						isDemoAssumption: false,
					})),
				},
				messages: appendAssistant(
					params.messages,
					response.assistantMessages,
					response.question,
				),
				pendingQuestion: response.question,
				isComplete: response.isComplete,
				isThinking: false,
				error: null,
				turnIndex: params.base.turnIndex + 1,
				capturedFacts,
				lastCapturedStepIds: response.capturedStepIds,
				captureSeq: params.base.captureSeq + 1,
			});
		},
		[],
	);

	const startSession = useCallback(
		(entryPoint: ConversationEntryPoint, openingText?: string) => {
			const userContent = openingUserText(entryPoint, openingText);
			const base: ProcessSessionState = {
				...createInitialState(),
				entryPoint,
				isThinking: true,
				messages: [{ id: "u-start", role: "user", content: userContent }],
			};
			setState(base);

			void applyTurn({
				entryPoint,
				messages: base.messages,
				definition: base.definition,
				base,
			}).catch((error: Error) => {
				setState((prev) => ({
					...prev,
					isThinking: false,
					error: error.message || "Discovery request failed",
				}));
			});
		},
		[applyTurn],
	);

	const resolveCurrentQuestion = useCallback(
		(answer: string | null) => {
			setState((prev) => {
				if (!prev.entryPoint || prev.isThinking) return prev;
				const question = prev.pendingQuestion;
				const userMessage: ConversationMessage = {
					id: `u-${prev.messages.length}`,
					role: "user",
					content: answer ?? "Skip for now",
					receipt: question
						? formatCaptureReceipt(question.id, answer)
						: undefined,
				};
				const nextMessages = [...prev.messages, userMessage];
				const nextBase: ProcessSessionState = {
					...prev,
					messages: nextMessages,
					isThinking: true,
					error: null,
				};

				void applyTurn({
					entryPoint: prev.entryPoint,
					messages: nextMessages,
					definition: prev.definition,
					base: nextBase,
					questionId: question?.id,
					answer,
				}).catch((error: Error) => {
					setState((current) => ({
						...current,
						isThinking: false,
						error: error.message || "Discovery request failed",
					}));
				});

				return nextBase;
			});
		},
		[applyTurn],
	);

	const confirmAnswer = useCallback(
		(answer: string) => resolveCurrentQuestion(answer),
		[resolveCurrentQuestion],
	);

	const skipQuestion = useCallback(
		() => resolveCurrentQuestion(null),
		[resolveCurrentQuestion],
	);

	const updateDefinition = useCallback((definition: ProcessDefinition) => {
		setState((prev) => ({ ...prev, definition }));
	}, []);

	const recordResolution = useCallback(
		(definition: ProcessDefinition, note: string) => {
			setState((prev) => ({ ...prev, definition, resolutionNote: note }));
		},
		[],
	);

	const selectStep = useCallback((stepId: string | null) => {
		setState((prev) => ({ ...prev, selectedStepId: stepId }));
	}, []);

	const resetSession = useCallback(() => {
		window.localStorage.removeItem(STORAGE_KEY);
		setState(createInitialState());
	}, []);

	const visibleSteps = useMemo(() => {
		const steps = state.definition.steps.filter(
			(step) => step.factStatus !== "missing",
		);
		return { ...state.definition, steps };
	}, [state.definition]);

	const value = useMemo(
		() => ({
			state,
			visibleSteps,
			startSession,
			confirmAnswer,
			skipQuestion,
			updateDefinition,
			recordResolution,
			selectStep,
			resetSession,
		}),
		[
			state,
			visibleSteps,
			startSession,
			confirmAnswer,
			skipQuestion,
			updateDefinition,
			recordResolution,
			selectStep,
			resetSession,
		],
	);

	return (
		<ProcessSessionContext.Provider value={value}>
			{children}
		</ProcessSessionContext.Provider>
	);
}

export function useProcessSession() {
	const ctx = useContext(ProcessSessionContext);
	if (!ctx) {
		throw new Error(
			"useProcessSession must be used within ProcessSessionProvider",
		);
	}
	return ctx;
}
