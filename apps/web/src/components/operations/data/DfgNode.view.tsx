import { Handle, type Node, type NodeProps, Position } from "@xyflow/react";
import type { DfgNodeData } from "@/utils/process-mining/dfg-flow.utils";

type DfgFlowNode = Node<DfgNodeData, "dfg">;

export function DfgNodeView({ data }: NodeProps<DfgFlowNode>) {
	return (
		<div className="border-border bg-background min-w-[140px] rounded-lg border px-3 py-2 shadow-none">
			<Handle type="target" position={Position.Top} className="!bg-border" />
			<p className="text-sm font-medium">{data.label}</p>
			<p className="text-muted-foreground text-xs">{data.frequency} cases</p>
			<Handle type="source" position={Position.Bottom} className="!bg-border" />
		</div>
	);
}
