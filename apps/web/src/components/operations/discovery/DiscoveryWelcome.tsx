"use client";

import { FileTextIcon, MessagesSquareIcon, ScrollTextIcon } from "lucide-react";
import { useState } from "react";
import { useProcessSession } from "@/contexts";
import type { ConversationEntryPoint } from "@/types/operations.types";
import { DiscoveryComposer } from "./DiscoveryComposer.view";

const START_ACTIONS: {
	id: ConversationEntryPoint;
	label: string;
	icon: typeof MessagesSquareIcon;
}[] = [
	{ id: "describe", label: "Guided Interview", icon: MessagesSquareIcon },
	{ id: "transcript", label: "Meeting Transcript", icon: FileTextIcon },
	{ id: "document", label: "SOP Document", icon: ScrollTextIcon },
];

export function DiscoveryWelcome() {
	const { startSession } = useProcessSession();
	const [draft, setDraft] = useState("");

	const beginFromText = () => {
		const text = draft.trim();
		if (!text) return;
		startSession("describe", text);
		setDraft("");
	};

	return (
		<div className="flex flex-1 items-center justify-center px-6 py-16">
			<div className="w-full max-w-2xl -translate-y-6 space-y-8">
				<div className="space-y-3 text-center">
					<h1 className="text-4xl font-semibold tracking-tight text-balance">
						Let's understand how your business works.
					</h1>
					<p className="text-muted-foreground mx-auto max-w-lg text-base leading-relaxed">
						Describe the work, or start from a transcript or SOP. We'll build
						the expected process as you confirm it — then compare with uploaded
						records.
					</p>
				</div>
				<DiscoveryComposer
					size="welcome"
					value={draft}
					onChange={setDraft}
					onSubmit={beginFromText}
					onAttach={() => startSession("document")}
					placeholder="How does this process actually run?"
				/>
				<div className="flex flex-wrap items-center justify-center gap-2">
					{START_ACTIONS.map((action) => (
						<button
							key={action.id}
							type="button"
							onClick={() => startSession(action.id)}
							className="text-muted-foreground hover:text-foreground hover:border-primary/40 hover:bg-primary/5 inline-flex items-center gap-2 rounded-full border border-border/70 px-3.5 py-1.5 text-sm transition-colors"
						>
							<action.icon className="size-3.5" />
							{action.label}
						</button>
					))}
				</div>
			</div>
		</div>
	);
}
