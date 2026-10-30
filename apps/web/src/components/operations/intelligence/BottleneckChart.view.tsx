"use client";

import {
	type ChartConfig,
	ChartContainer,
	ChartTooltip,
	ChartTooltipContent,
} from "@repo/ui/components/chart";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import type { Bottleneck } from "@/types/operations.types";

const config = {
	medianHours: { label: "Median wait (h)", color: "var(--chart-2)" },
} satisfies ChartConfig;

export function BottleneckChart({ data }: { data: Bottleneck[] }) {
	return (
		<div className="border-border space-y-2 rounded-lg border p-3">
			<div>
				<p className="text-sm font-medium">Where time accumulates</p>
				<p className="text-muted-foreground text-xs">
					Median hours between consecutive steps (demo data)
				</p>
			</div>
			<ChartContainer config={config} className="aspect-[16/9] w-full">
				<BarChart
					data={data}
					layout="vertical"
					margin={{ left: 8, right: 8, top: 8, bottom: 0 }}
				>
					<CartesianGrid horizontal={false} />
					<YAxis
						dataKey="label"
						type="category"
						width={110}
						tickLine={false}
						axisLine={false}
						tickFormatter={(value: string) =>
							value.length > 18 ? `${value.slice(0, 16)}…` : value
						}
					/>
					<XAxis type="number" tickLine={false} axisLine={false} />
					<ChartTooltip content={<ChartTooltipContent />} />
					<Bar
						dataKey="medianHours"
						fill="var(--color-medianHours)"
						radius={4}
					/>
				</BarChart>
			</ChartContainer>
		</div>
	);
}
