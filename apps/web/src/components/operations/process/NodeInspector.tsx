"use client";

import { Button } from "@repo/ui/components/button";
import { Input } from "@repo/ui/components/input";
import { Label } from "@repo/ui/components/label";
import { useEffect, useState } from "react";
import type { ProcessDefinition, ProcessStep } from "@/types/operations.types";

export function NodeInspector({
	definition,
	stepId,
	onUpdate,
}: {
	definition: ProcessDefinition;
	stepId: string;
	onUpdate: (definition: ProcessDefinition) => void;
}) {
	const step = definition.steps.find((item) => item.id === stepId) ?? null;
	const [draft, setDraft] = useState<ProcessStep | null>(step);

	useEffect(() => {
		setDraft(step);
	}, [step]);

	if (!step || !draft) return null;

	const save = () => {
		onUpdate({
			...definition,
			steps: definition.steps.map((item) =>
				item.id === draft.id
					? { ...draft, factStatus: "confirmed", isDemoAssumption: true }
					: item,
			),
			rules: definition.rules.map((rule) => {
				if (rule.stepId !== draft.id) return rule;
				if (rule.kind === "role") {
					return {
						...rule,
						expectedRole: draft.role,
						label: `${draft.name} owned by ${draft.role}`,
					};
				}
				if (rule.kind === "deadline" && draft.deadlineLabel) {
					const match = draft.deadlineLabel.match(
						/D-(\d+).*?(\d{1,2}):(\d{2})/i,
					);
					if (match) {
						const hour = Number(match[2]);
						const minute = Number(match[3]);
						const days = Number(match[1]);
						return {
							...rule,
							daysBeforeService: days,
							hour,
							minute,
							label: `Menu Requisition submitted by D-${days} ${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`,
						};
					}
				}
				return rule;
			}),
		});
	};

	return (
		<div className="flex min-h-0 flex-1 flex-col">
			<div className="flex-1 space-y-5 overflow-y-auto px-4 py-5">
				<div className="space-y-2">
					<Label htmlFor="role">Owner role</Label>
					<Input
						id="role"
						value={draft.role}
						onChange={(event) =>
							setDraft({ ...draft, role: event.target.value })
						}
					/>
					<p className="text-muted-foreground text-xs">
						Stated ownership — labelled demo until verified.
					</p>
				</div>
				{draft.id === "mr" && (
					<div className="space-y-2">
						<Label htmlFor="deadline">Deadline</Label>
						<Input
							id="deadline"
							value={draft.deadlineLabel ?? ""}
							placeholder="D-3 by 16:00"
							onChange={(event) =>
								setDraft({ ...draft, deadlineLabel: event.target.value })
							}
						/>
					</div>
				)}
				<div className="space-y-1.5">
					<Label>Dependencies</Label>
					<p className="text-sm">
						{draft.dependsOn.length === 0
							? "None"
							: draft.dependsOn
									.map(
										(id) =>
											definition.steps.find((item) => item.id === id)?.name ??
											id,
									)
									.join(", ")}
					</p>
				</div>
				<div className="space-y-1.5">
					<Label>Rules</Label>
					<ul className="text-muted-foreground list-disc space-y-1 pl-4 text-sm">
						{draft.rules.map((rule) => (
							<li key={rule}>{rule}</li>
						))}
					</ul>
				</div>
			</div>
			<div className="px-4 py-4">
				<Button type="button" className="w-full" onClick={save}>
					Save stated details
				</Button>
			</div>
		</div>
	);
}
