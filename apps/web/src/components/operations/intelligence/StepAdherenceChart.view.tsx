"use client";

import {
	type ChartConfig,
	ChartContainer,
	ChartTooltip,
	ChartTooltipContent,
} from "@repo/ui/components/chart";
import { Bar, BarChart, XAxis, YAxis } from "recharts";
import type { Bottleneck, StepAdherence } from "@/types/operations.types";

const shortName: Record<string, string> = {
	mp: "Planning",
	mproj: "Projection",
	mr: "Requisition",
	pp: "Production",
	ki: "Indent",
	gi: "Issue",
};

const config = {
	adherencePct: { label: "No signal", color: "var(--primary)" },
} satisfies ChartConfig;

export function StepAdherenceChart({
	data,
}: {
	data: StepAdherence[];
	bottlenecks: Bottleneck[];
}) {
	const rows = data.map((step) => ({
		...step,
		shortName: shortName[step.stepId] ?? step.stepName,
	}));

	return (
		<div className="space-y-3">
			<p className="text-sm font-medium">Process health</p>
			<ChartContainer config={config} className="aspect-[4/3] w-full">
				<BarChart
					data={rows}
					layout="vertical"
					margin={{ left: 4, right: 8, top: 4, bottom: 0 }}
				>
					<XAxis
						type="number"
						domain={[0, 100]}
						tickLine={false}
						axisLine={false}
						tickFormatter={(value: number) => `${value}%`}
					/>
					<YAxis
						dataKey="shortName"
						type="category"
						width={84}
						tickLine={false}
						axisLine={false}
					/>
					<ChartTooltip content={<ChartTooltipContent />} />
					<Bar
						dataKey="adherencePct"
						fill="var(--color-adherencePct)"
						radius={3}
						barSize={14}
					/>
				</BarChart>
			</ChartContainer>
		</div>
	);
}
