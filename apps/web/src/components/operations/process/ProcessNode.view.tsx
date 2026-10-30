"use client";

import { cn } from "@repo/ui/lib/utils";
import { Handle, type NodeProps, Position } from "@xyflow/react";
import { CircleCheckIcon } from "lucide-react";
import type { ProcessNodeData } from "@/utils/process-intelligence";

export function ProcessNodeView({
	data,
	selected,
}: NodeProps & { data: ProcessNodeData }) {
	return (
		<div
			key={data.justCaptured ? `cap-${data.captureSeq}` : "node"}
			className={cn(
				"bg-background relative w-[248px] rounded-xl border px-3 py-2.5 shadow-sm",
				data.factStatus === "confirmed" && "border-primary/50 bg-primary/8",
				data.factStatus === "assumed" &&
					"border-ops-warning/70 bg-ops-warning/8 border-dashed",
				data.factStatus === "missing" && "border-border/70 border-dashed",
				(selected || data.isFocused) && "ring-primary ring-2",
				data.justCaptured && "ops-capture",
			)}
		>
			<Handle
				type="target"
				position={Position.Top}
				className="bg-primary! size-2!"
			/>
			<div className="flex items-start gap-2.5">
				<span className="bg-primary/15 text-primary mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full text-[11px] font-medium tabular-nums">
					{data.order}
				</span>
				<div className="min-w-0 flex-1">
					<p className="text-sm leading-tight font-medium">{data.label}</p>
					<p className="text-muted-foreground mt-0.5 text-[13px] leading-tight">
						{data.role || "Owner not stated"}
					</p>
				</div>
			</div>
			<div className="mt-2 flex items-center gap-2 pl-7">
				{data.factStatus === "confirmed" ? (
					<span className="text-primary inline-flex items-center gap-1 text-[11px] font-medium">
						<CircleCheckIcon className="size-3" />
						Confirmed
					</span>
				) : (
					<span className="text-ops-warning text-[11px] font-medium">
						Assumed
					</span>
				)}
				{data.isFocused && (
					<span className="bg-primary/15 text-primary rounded-full px-1.5 py-px text-[10px] font-medium">
						Asking
					</span>
				)}
			</div>
			<Handle
				type="source"
				position={Position.Bottom}
				className="bg-primary! size-2!"
			/>
		</div>
	);
}
