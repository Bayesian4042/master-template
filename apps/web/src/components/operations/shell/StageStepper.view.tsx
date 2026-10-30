"use client";

import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@repo/ui/components/tooltip";
import { cn } from "@repo/ui/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";

const STAGES = [
	{
		id: "discovery",
		label: "Describe",
		href: "/operations/discovery",
		enabled: true,
	},
	{
		id: "process",
		label: "Model",
		href: "/operations/process",
		enabled: false,
	},
	{
		id: "data",
		label: "Connect data",
		href: "/operations/data",
		enabled: true,
	},
	{
		id: "intelligence",
		label: "Reconcile",
		href: "/operations/intelligence",
		enabled: true,
	},
] as const;

export function StageStepper() {
	const pathname = usePathname();

	return (
		<nav
			aria-label="Operations stages"
			className="flex flex-wrap items-center gap-1"
		>
			{STAGES.map((stage, index) => {
				const active = pathname.startsWith(stage.href);
				const content = (
					<span
						className={cn(
							"inline-flex items-center gap-2 rounded-md px-2.5 py-1.5 text-sm transition-colors",
							active && "bg-primary/15 font-medium text-foreground",
							!active &&
								stage.enabled &&
								"text-muted-foreground hover:bg-muted hover:text-foreground",
							!stage.enabled && "cursor-not-allowed text-muted-foreground/50",
						)}
					>
						<span className="text-muted-foreground/70 text-xs tabular-nums">
							{index + 1}
						</span>
						{stage.label}
					</span>
				);

				if (!stage.enabled) {
					return (
						<Tooltip key={stage.id}>
							<TooltipTrigger className="inline-flex cursor-not-allowed">
								{content}
							</TooltipTrigger>
							<TooltipContent className="ops-theme">Coming next</TooltipContent>
						</Tooltip>
					);
				}

				return (
					<Link key={stage.id} href={stage.href} className="rounded-md">
						{content}
					</Link>
				);
			})}
		</nav>
	);
}
