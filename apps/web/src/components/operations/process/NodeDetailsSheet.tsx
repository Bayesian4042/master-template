"use client";

import {
	Sheet,
	SheetContent,
	SheetDescription,
	SheetHeader,
	SheetTitle,
} from "@repo/ui/components/sheet";
import { useProcessSession } from "@/contexts";
import { NodeInspector } from "./NodeInspector";

export function NodeDetailsSheet() {
	const { state, selectStep, updateDefinition } = useProcessSession();
	const step =
		state.definition.steps.find((item) => item.id === state.selectedStepId) ??
		null;

	return (
		<Sheet
			open={Boolean(step)}
			onOpenChange={(open) => {
				if (!open) selectStep(null);
			}}
		>
			<SheetContent
				side="right"
				className="ops-theme w-full gap-0 p-0 sm:max-w-md"
			>
				{step && (
					<>
						<SheetHeader className="border-border/60 border-b pr-12">
							<SheetTitle>{step.name}</SheetTitle>
							<SheetDescription>
								{step.factStatus === "confirmed" ? "Stated" : "Assumption"}
								{step.isDemoAssumption ? " · Demo assumption" : ""}
							</SheetDescription>
						</SheetHeader>
						<NodeInspector
							definition={state.definition}
							stepId={step.id}
							onUpdate={updateDefinition}
						/>
					</>
				)}
			</SheetContent>
		</Sheet>
	);
}
