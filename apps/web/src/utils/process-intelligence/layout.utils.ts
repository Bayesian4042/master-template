import dagre from "@dagrejs/dagre";
import type { Edge, Node } from "@xyflow/react";
import type { FactStatus, ProcessDefinition } from "@/types/operations.types";

export type ProcessNodeData = {
	label: string;
	role: string;
	factStatus: FactStatus;
	isDemoAssumption: boolean;
	verifiableIn?: string;
	order: number;
	isFocused?: boolean;
	justCaptured?: boolean;
	captureSeq?: number;
} & Record<string, unknown>;

const NODE_WIDTH = 248;
const NODE_HEIGHT = 92;

export function definitionToFlow(
	definition: ProcessDefinition,
	direction: "LR" | "TB" = "LR",
): {
	nodes: Node<ProcessNodeData>[];
	edges: Edge[];
} {
	const nodes: Node<ProcessNodeData>[] = definition.steps
		.slice()
		.sort((a, b) => a.order - b.order)
		.map((step) => ({
			id: step.id,
			type: "process",
			position: { x: 0, y: 0 },
			data: {
				label: step.name,
				role: step.role,
				factStatus: step.factStatus,
				isDemoAssumption: step.isDemoAssumption,
				verifiableIn: step.verifiableIn,
				order: step.order,
			},
		}));

	const edges: Edge[] = definition.steps.flatMap((step) =>
		step.dependsOn.map((from) => ({
			id: `${from}-${step.id}`,
			source: from,
			target: step.id,
			animated: step.factStatus === "missing",
		})),
	);

	return layoutWithDagre(nodes, edges, direction);
}

export function layoutWithDagre<
	TNode extends Record<string, unknown>,
	TEdge extends Record<string, unknown> = Record<string, unknown>,
>(
	nodes: Node<TNode>[],
	edges: Edge<TEdge>[],
	direction: "LR" | "TB" = "LR",
	size: { width: number; height: number } = {
		width: NODE_WIDTH,
		height: NODE_HEIGHT,
	},
): { nodes: Node<TNode>[]; edges: Edge<TEdge>[] } {
	const graph = new dagre.graphlib.Graph().setDefaultEdgeLabel(() => ({}));
	graph.setGraph({
		rankdir: direction,
		nodesep: direction === "TB" ? 24 : 48,
		ranksep: direction === "TB" ? 36 : 72,
	});

	for (const node of nodes) {
		graph.setNode(node.id, { width: size.width, height: size.height });
	}
	for (const edge of edges) {
		graph.setEdge(edge.source, edge.target);
	}

	dagre.layout(graph);

	const layouted = nodes.map((node) => {
		const pos = graph.node(node.id);
		return {
			...node,
			position: {
				x: pos.x - size.width / 2,
				y: pos.y - size.height / 2,
			},
		};
	});

	return { nodes: layouted, edges };
}
