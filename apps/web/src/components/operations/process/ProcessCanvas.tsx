"use client";

import {
	Background,
	Controls,
	type Node,
	ReactFlow,
	ReactFlowProvider,
	useReactFlow,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { useEffect, useMemo } from "react";
import type { ProcessDefinition } from "@/types/operations.types";
import {
	definitionToFlow,
	type ProcessNodeData,
} from "@/utils/process-intelligence";
import { ProcessNodeView } from "./ProcessNode.view";

const nodeTypes = { process: ProcessNodeView };

function FitViewOnChange({ nodeCount }: { nodeCount: number }) {
	const { fitView } = useReactFlow();

	useEffect(() => {
		if (nodeCount === 0) return;
		const id = window.setTimeout(() => {
			fitView({ padding: 0.16, duration: 280, maxZoom: 1 });
		}, 60);
		return () => window.clearTimeout(id);
	}, [fitView, nodeCount]);

	useEffect(() => {
		const element = document.querySelector("[data-process-canvas]");
		if (!element || nodeCount === 0) return;
		let frame = 0;
		const observer = new ResizeObserver(() => {
			window.cancelAnimationFrame(frame);
			frame = window.requestAnimationFrame(() => {
				fitView({ padding: 0.16, duration: 0, maxZoom: 1 });
			});
		});
		observer.observe(element);
		return () => {
			window.cancelAnimationFrame(frame);
			observer.disconnect();
		};
	}, [fitView, nodeCount]);

	return null;
}

function ProcessCanvasInner({
	definition,
	selectedStepId,
	focusStepIds,
	capturedStepIds,
	captureSeq,
	onSelectStep,
	className,
}: {
	definition: ProcessDefinition;
	selectedStepId: string | null;
	focusStepIds: string[];
	capturedStepIds: string[];
	captureSeq: number;
	onSelectStep: (stepId: string | null) => void;
	className?: string;
}) {
	const { nodes, edges } = useMemo(
		() => definitionToFlow(definition, "TB"),
		[definition],
	);

	const displayNodes = useMemo(
		() =>
			nodes.map((node) => ({
				...node,
				selected: node.id === selectedStepId,
				data: {
					...node.data,
					isFocused: focusStepIds.includes(node.id),
					justCaptured: capturedStepIds.includes(node.id),
					captureSeq,
				},
			})),
		[nodes, selectedStepId, focusStepIds, capturedStepIds, captureSeq],
	);

	return (
		<div data-process-canvas="" className={className ?? "h-full w-full"}>
			<ReactFlow
				nodes={displayNodes}
				edges={edges}
				nodeTypes={nodeTypes}
				fitView
				fitViewOptions={{ padding: 0.16, maxZoom: 1 }}
				proOptions={{ hideAttribution: true }}
				onNodeClick={(_, node: Node<ProcessNodeData>) => onSelectStep(node.id)}
				onPaneClick={() => onSelectStep(null)}
				nodesDraggable={false}
				nodesConnectable={false}
				elementsSelectable
				minZoom={0.35}
				maxZoom={1.35}
			>
				<Background gap={22} size={1.1} color="var(--border)" />
				<Controls
					showInteractive={false}
					position="bottom-right"
					className="!border-border/60 !bg-background !shadow-none"
				/>
				<FitViewOnChange nodeCount={nodes.length} />
			</ReactFlow>
		</div>
	);
}

export function ProcessCanvas(props: {
	definition: ProcessDefinition;
	selectedStepId: string | null;
	focusStepIds: string[];
	capturedStepIds: string[];
	captureSeq: number;
	onSelectStep: (stepId: string | null) => void;
	className?: string;
}) {
	return (
		<ReactFlowProvider>
			<ProcessCanvasInner {...props} />
		</ReactFlowProvider>
	);
}
