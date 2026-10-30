import type { Edge, Node } from "@xyflow/react";
import type {
	BottleneckFinding,
	ProcessGraph,
} from "@/types/process-mining.types";
import { layoutWithDagre } from "@/utils/process-intelligence/layout.utils";

export type DfgNodeData = {
	label: string;
	frequency: number;
} & Record<string, unknown>;

export type DfgEdgeData = {
	frequency: number;
	medianWaitHours: number | null;
	isBottleneck: boolean;
} & Record<string, unknown>;

export function graphToFlow(
	graph: ProcessGraph,
	bottleneck?: BottleneckFinding,
	direction: "LR" | "TB" = "LR",
): { nodes: Node<DfgNodeData>[]; edges: Edge<DfgEdgeData>[] } {
	const nodes: Node<DfgNodeData>[] = graph.nodes.map((node) => ({
		id: node.activity,
		type: "dfg",
		position: { x: 0, y: 0 },
		data: {
			label: node.activity,
			frequency: node.frequency,
		},
	}));

	const edges: Edge<DfgEdgeData>[] = graph.edges.map((edge) => {
		const isBottleneck =
			bottleneck?.from === edge.from && bottleneck?.to === edge.to;
		const waitLabel =
			edge.medianWaitHours === null
				? `${edge.frequency}x`
				: `${edge.frequency}x · ${edge.medianWaitHours}h`;
		return {
			id: `${edge.from}-${edge.to}`,
			source: edge.from,
			target: edge.to,
			label: waitLabel,
			animated: isBottleneck,
			style: isBottleneck
				? { stroke: "var(--destructive)", strokeWidth: 2 }
				: undefined,
			data: {
				frequency: edge.frequency,
				medianWaitHours: edge.medianWaitHours,
				isBottleneck,
			},
		};
	});

	return layoutWithDagre(nodes, edges, direction, {
		width: 180,
		height: 64,
	});
}
