"use client";

import {
	ResizableHandle,
	ResizablePanel,
	ResizablePanelGroup,
} from "@repo/ui/components/resizable";
import { useMemo } from "react";
import { useProcessSession } from "@/contexts";
import { NodeDetailsSheet } from "../process/NodeDetailsSheet";
import { ProcessCanvas } from "../process/ProcessCanvas";
import { AIConversation } from "./AIConversation";

export function ActiveDiscovery() {
	const { state, visibleSteps, selectStep } = useProcessSession();
	const hasSteps = visibleSteps.steps.length > 0;
	const focusStepIds = useMemo(() => {
		const fromQuestion = state.pendingQuestion?.stepId
			? [state.pendingQuestion.stepId]
			: [];
		return fromQuestion.length > 0 ? fromQuestion : state.lastCapturedStepIds;
	}, [state.pendingQuestion, state.lastCapturedStepIds]);

	return (
		<div className="flex h-full min-h-0 flex-1">
			<ResizablePanelGroup orientation="horizontal" className="min-h-0 flex-1">
				<ResizablePanel
					defaultSize={40}
					minSize={32}
					className="min-h-0 min-w-0"
				>
					<AIConversation />
				</ResizablePanel>
				<ResizableHandle className="bg-border/60 hover:bg-primary w-px transition-colors" />
				<ResizablePanel
					defaultSize={60}
					minSize={45}
					className="min-h-0 min-w-0"
				>
					<div className="flex h-full min-h-0 flex-col">
						<div className="flex h-12 shrink-0 items-center justify-between px-5">
							<p className="text-sm font-medium">Process model</p>
							<div className="text-muted-foreground flex items-center gap-3 text-[11px]">
								<span className="inline-flex items-center gap-1.5">
									<span className="bg-primary size-1.5 rounded-full" />
									Confirmed
								</span>
								<span className="inline-flex items-center gap-1.5">
									<span className="bg-ops-warning size-1.5 rounded-full" />
									Assumed
								</span>
							</div>
						</div>
						<div className="relative min-h-0 flex-1">
							{hasSteps ? (
								<ProcessCanvas
									definition={visibleSteps}
									selectedStepId={state.selectedStepId}
									focusStepIds={focusStepIds}
									capturedStepIds={state.lastCapturedStepIds}
									captureSeq={state.captureSeq}
									onSelectStep={selectStep}
									className="absolute inset-0"
								/>
							) : (
								<div className="text-muted-foreground flex h-full items-center justify-center px-8 text-sm">
									Steps appear here as you confirm them.
								</div>
							)}
						</div>
					</div>
				</ResizablePanel>
			</ResizablePanelGroup>
			<NodeDetailsSheet />
		</div>
	);
}
