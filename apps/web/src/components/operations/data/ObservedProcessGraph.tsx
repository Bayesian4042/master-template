"use client";

import {
	Background,
	Controls,
	MarkerType,
	ReactFlow,
	ReactFlowProvider,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { useMemo } from "react";
import type {
	BottleneckFinding,
	ProcessGraph,
} from "@/types/process-mining.types";
import { graphToFlow } from "@/utils/process-mining/dfg-flow.utils";
import { DfgNodeView } from "./DfgNode.view";

const nodeTypes = { dfg: DfgNodeView };

export function ObservedProcessGraph({
	graph,
	bottleneck,
}: {
	graph: ProcessGraph;
	bottleneck?: BottleneckFinding;
}) {
	const { nodes, edges } = useMemo(
		() => graphToFlow(graph, bottleneck, "TB"),
		[graph, bottleneck],
	);

	const displayEdges = useMemo(
		() =>
			edges.map((edge) => ({
				...edge,
				markerEnd: {
					type: MarkerType.ArrowClosed,
					width: 16,
					height: 16,
				},
			})),
		[edges],
	);

	return (
		<div className="border-border h-[360px] w-full overflow-hidden rounded-lg border">
			<ReactFlowProvider>
				<ReactFlow
					nodes={nodes}
					edges={displayEdges}
					nodeTypes={nodeTypes}
					fitView
					fitViewOptions={{ padding: 0.2, maxZoom: 1 }}
					proOptions={{ hideAttribution: true }}
					nodesDraggable={false}
					nodesConnectable={false}
					minZoom={0.4}
					maxZoom={1.2}
				>
					<Background gap={22} size={1.1} color="var(--border)" />
					<Controls
						showInteractive={false}
						position="bottom-right"
						className="!border-border/60 !bg-background !shadow-none"
					/>
				</ReactFlow>
			</ReactFlowProvider>
		</div>
	);
}
