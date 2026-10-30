import { Card, CardContent, CardHeader } from "@repo/ui/components/card";
import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

interface StatCardProps {
	icon: LucideIcon;
	label: string;
	value: ReactNode;
	hint?: ReactNode;
}

export const StatCard = ({ icon: Icon, label, value, hint }: StatCardProps) => (
	<Card>
		<CardHeader className="flex items-center gap-2">
			<div className="bg-primary/10 text-primary flex size-8 shrink-0 items-center justify-center rounded-sm">
				<Icon className="size-4" />
			</div>
			<div className="text-2xl">{value}</div>
		</CardHeader>
		<CardContent className="flex flex-col gap-2">
			<span className="text-base font-semibold">{label}</span>
			{hint && <div className="text-muted-foreground">{hint}</div>}
		</CardContent>
	</Card>
);
