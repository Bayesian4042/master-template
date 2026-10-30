"use client";

import { Button } from "@repo/ui/components/button";
import {
	MessageScroller,
	MessageScrollerButton,
	MessageScrollerContent,
	MessageScrollerProvider,
	MessageScrollerViewport,
} from "@repo/ui/components/message-scroller";
import AlertMessage from "@repo/ui/general/AlertMessage";
import { CircleCheckIcon } from "lucide-react";
import Link from "next/link";
import { useMemo, useRef, useState } from "react";
import { useProcessSession } from "@/contexts";
import type { ConversationMessage } from "@/types/operations.types";
import { getDiscoveryFacts } from "@/utils/process-intelligence/discovery-progress.utils";
import { AIQuestionCard } from "./AIQuestionCard.view";
import { DiscoveryComposer } from "./DiscoveryComposer.view";
import { UnderstandingProgress } from "./UnderstandingProgress.view";

type ConversationBlock =
	| { type: "user"; id: string; content: string; receipt?: string }
	| {
			type: "assistant";
			id: string;
			paragraphs: string[];
			questionMessageId?: string;
	  };

function groupMessages(messages: ConversationMessage[]): ConversationBlock[] {
	const blocks: ConversationBlock[] = [];

	for (const message of messages) {
		if (message.role === "user") {
			blocks.push({
				type: "user",
				id: message.id,
				content: message.content,
				receipt: message.receipt,
			});
			continue;
		}

		const last = blocks[blocks.length - 1];
		if (last?.type === "assistant") {
			if (message.kind === "question") {
				last.questionMessageId = message.id;
			} else {
				last.paragraphs.push(message.content);
			}
			continue;
		}

		blocks.push({
			type: "assistant",
			id: message.id,
			paragraphs: message.kind === "question" ? [] : [message.content],
			questionMessageId: message.kind === "question" ? message.id : undefined,
		});
	}

	return blocks;
}

function composerPlaceholder(field?: string) {
	if (field === "role") return "Or type who owns this step";
	if (field === "deadline") return "Or type the cut-off you expect";
	if (field === "rule") return "Or type the variance to investigate";
	if (field === "name") return "Or describe the sequence in your own words";
	return "Answer here, or pick a suggestion above";
}

export function AIConversation() {
	const { state, confirmAnswer, skipQuestion } = useProcessSession();
	const [draft, setDraft] = useState("");
	const inputRef = useRef<HTMLTextAreaElement>(null);
	const facts = useMemo(
		() => getDiscoveryFacts(state.capturedFacts, state.pendingQuestion),
		[state.capturedFacts, state.pendingQuestion],
	);
	const blocks = useMemo(() => groupMessages(state.messages), [state.messages]);
	const currentQuestion = state.pendingQuestion;
	const activeQuestionId = currentQuestion ? `q-${currentQuestion.id}` : null;
	const canSubmit =
		!state.isThinking && !state.isComplete && Boolean(currentQuestion);

	const submit = (answer: string) => {
		if (!canSubmit || !answer.trim()) return;
		confirmAnswer(answer.trim());
		setDraft("");
	};

	return (
		<div className="flex h-full min-h-0 flex-col">
			<div className="flex h-12 shrink-0 items-center justify-between gap-4 px-5">
				<p className="text-sm font-medium">Operations analyst</p>
				<UnderstandingProgress facts={facts} />
			</div>

			{state.error && (
				<div className="px-5 pb-2">
					<AlertMessage message={state.error} variant="destructive" />
				</div>
			)}

			<MessageScrollerProvider>
				<MessageScroller className="min-h-0 flex-1">
					<MessageScrollerViewport>
						<MessageScrollerContent className="space-y-4 px-5 py-3">
							{blocks.map((block) => {
								if (block.type === "user") {
									return (
										<div key={block.id} className="ml-auto max-w-[68ch]">
											<p className="bg-muted rounded-2xl px-3.5 py-2 text-sm leading-relaxed whitespace-pre-wrap">
												{block.content}
											</p>
											{block.receipt && (
												<p className="text-primary mt-1.5 flex items-center justify-end gap-1.5 text-xs animate-in fade-in">
													<CircleCheckIcon className="size-3.5" />
													{block.receipt}
												</p>
											)}
										</div>
									);
								}

								const showQuestion =
									currentQuestion &&
									block.questionMessageId === activeQuestionId;

								return (
									<div key={block.id} className="max-w-[68ch] space-y-2">
										{block.paragraphs.map((paragraph) => (
											<p
												key={paragraph}
												className="text-sm leading-relaxed whitespace-pre-wrap"
											>
												{paragraph}
											</p>
										))}
										{showQuestion && currentQuestion && (
											<AIQuestionCard
												question={currentQuestion}
												showPrompt={block.paragraphs.length === 0}
												onPick={submit}
												onSkip={() => {
													skipQuestion();
													setDraft("");
												}}
												onFocusComposer={() => inputRef.current?.focus()}
											/>
										)}
									</div>
								);
							})}

							{state.isThinking && (
								<p className="text-muted-foreground text-sm">Thinking…</p>
							)}

							{state.isComplete && (
								<div className="flex flex-wrap items-center gap-3">
									<p className="text-sm font-medium">Expected process ready</p>
									<Button
										size="sm"
										render={<Link href="/operations/data" />}
									>
										Connect CMP data
									</Button>
								</div>
							)}
						</MessageScrollerContent>
						<MessageScrollerButton />
					</MessageScrollerViewport>
				</MessageScroller>
			</MessageScrollerProvider>

			<div className="shrink-0 px-4 pt-1 pb-4">
				<DiscoveryComposer
					inputRef={inputRef}
					value={draft}
					onChange={setDraft}
					onSubmit={() => submit(draft)}
					disabled={!canSubmit}
					placeholder={composerPlaceholder(currentQuestion?.field)}
				/>
			</div>
		</div>
	);
}
