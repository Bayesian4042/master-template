import { Button } from "@repo/ui/components/button";
import type { ClarificationQuestion } from "@/types/operations.types";

export function AIQuestionCard({
	question,
	showPrompt,
	onPick,
	onSkip,
	onFocusComposer,
}: {
	question: ClarificationQuestion;
	showPrompt: boolean;
	onPick: (suggestion: string) => void;
	onSkip: () => void;
	onFocusComposer: () => void;
}) {
	return (
		<div className="max-w-[68ch] space-y-2.5 pt-1">
			{showPrompt && (
				<p className="text-sm leading-relaxed">{question.prompt}</p>
			)}
			<div className="flex flex-wrap gap-1.5">
				{question.suggestions.map((suggestion) => (
					<button
						key={suggestion}
						type="button"
						onClick={() => onPick(suggestion)}
						className="border-border/70 text-foreground hover:border-primary/50 hover:bg-primary/10 rounded-full border px-3 py-1 text-left text-[13px] leading-snug transition-colors"
					>
						{suggestion}
					</button>
				))}
			</div>
			<div className="flex items-center gap-1">
				<Button
					type="button"
					variant="ghost"
					size="sm"
					className="text-muted-foreground"
					onClick={onFocusComposer}
				>
					Or type your own answer below
				</Button>
				<Button type="button" variant="ghost" size="sm" onClick={onSkip}>
					Skip
				</Button>
			</div>
		</div>
	);
}
