"use client";

import { Button } from "@repo/ui/components/button";
import {
	Field,
	FieldDescription,
	FieldError,
	FieldLabel,
} from "@repo/ui/components/field";
import { Input } from "@repo/ui/components/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@repo/ui/components/select";
import RequiredStar from "@repo/ui/general/RequiredStar";
import { Plus, Trash2 } from "lucide-react";
import {
	type Control,
	Controller,
	type UseFormSetValue,
	useFieldArray,
	useWatch,
} from "react-hook-form";
import type { DatasetProfile } from "@/types/process-mining.types";
import type { MappingFormValues } from "@/validations/process-mining.validation";

const NONE = "__none__";

export function DatasetMappingCard({
	index,
	profile,
	control,
	setValue,
}: {
	index: number;
	profile: DatasetProfile;
	control: Control<MappingFormValues>;
	setValue: UseFormSetValue<MappingFormValues>;
}) {
	const activities = useFieldArray({
		control,
		name: `mappings.${index}.activities`,
	});
	const caseKeyColumns =
		useWatch({ control, name: `mappings.${index}.caseKeyColumns` }) ?? [];
	const sample = profile.sampleRows[0];

	return (
		<section className="border-border space-y-4 rounded-lg border p-4">
			<div>
				<p className="text-sm font-medium">{profile.fileName}</p>
				<p className="text-muted-foreground text-xs">
					{profile.sheetName} · {profile.rowCount} rows
				</p>
			</div>

			<Field>
				<FieldLabel>
					Case key columns <RequiredStar />
				</FieldLabel>
				<div className="flex flex-wrap gap-2">
					{profile.headers.map((header) => {
						const selected = caseKeyColumns.includes(header);
						return (
							<Button
								key={header}
								type="button"
								size="sm"
								variant={selected ? "default" : "outline"}
								onClick={() => {
									const next = selected
										? caseKeyColumns.filter((column) => column !== header)
										: [...caseKeyColumns, header];
									setValue(`mappings.${index}.caseKeyColumns`, next, {
										shouldValidate: true,
										shouldDirty: true,
									});
								}}
							>
								{header}
							</Button>
						);
					})}
				</div>
				{caseKeyColumns.length > 0 && sample && (
					<FieldDescription>
						Key preview:{" "}
						{caseKeyColumns
							.map((column) => String(sample[column] ?? "").toLowerCase())
							.join(" | ")}
					</FieldDescription>
				)}
			</Field>

			<div className="space-y-3">
				<div className="flex items-center justify-between">
					<p className="text-sm font-medium">Activities</p>
					<Button
						type="button"
						size="sm"
						variant="outline"
						onClick={() =>
							activities.append({
								name: "",
								timestampColumn: profile.headers[0] ?? "",
							})
						}
					>
						<Plus className="size-3.5" />
						Add
					</Button>
				</div>
				{activities.fields.map((field, activityIndex) => (
					<div
						key={field.id}
						className="grid gap-3 sm:grid-cols-[1fr_1fr_auto]"
					>
						<Controller
							name={`mappings.${index}.activities.${activityIndex}.name`}
							control={control}
							render={({ field: activityField, fieldState }) => (
								<Field data-invalid={fieldState.invalid}>
									<FieldLabel htmlFor={activityField.name}>
										Activity <RequiredStar />
									</FieldLabel>
									<Input
										{...activityField}
										id={activityField.name}
										aria-invalid={fieldState.invalid}
										placeholder="Menu Requisition"
									/>
									{fieldState.invalid && (
										<FieldError errors={[fieldState.error]} />
									)}
								</Field>
							)}
						/>
						<Controller
							name={`mappings.${index}.activities.${activityIndex}.timestampColumn`}
							control={control}
							render={({ field: tsField, fieldState }) => (
								<Field data-invalid={fieldState.invalid}>
									<FieldLabel>
										Timestamp <RequiredStar />
									</FieldLabel>
									<Select
										value={tsField.value}
										onValueChange={tsField.onChange}
									>
										<SelectTrigger aria-invalid={fieldState.invalid}>
											<SelectValue placeholder="Column" />
										</SelectTrigger>
										<SelectContent className="ops-theme">
											{profile.headers.map((header) => (
												<SelectItem key={header} value={header}>
													{header}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
									{fieldState.invalid && (
										<FieldError errors={[fieldState.error]} />
									)}
								</Field>
							)}
						/>
						<Button
							type="button"
							variant="ghost"
							size="icon"
							className="mt-6"
							disabled={activities.fields.length <= 1}
							onClick={() => activities.remove(activityIndex)}
						>
							<Trash2 className="size-4" />
						</Button>
					</div>
				))}
			</div>

			<Controller
				name={`mappings.${index}.actorColumn`}
				control={control}
				render={({ field }) => (
					<Field>
						<FieldLabel>Actor column</FieldLabel>
						<Select
							value={field.value || NONE}
							onValueChange={(value) =>
								field.onChange(value === NONE ? undefined : value)
							}
						>
							<SelectTrigger>
								<SelectValue placeholder="Optional" />
							</SelectTrigger>
							<SelectContent className="ops-theme">
								<SelectItem value={NONE}>None</SelectItem>
								{profile.headers.map((header) => (
									<SelectItem key={header} value={header}>
										{header}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</Field>
				)}
			/>

			{sample && (
				<div className="bg-muted/40 rounded-md p-3">
					<p className="text-muted-foreground mb-2 text-xs font-medium">
						Sample row
					</p>
					<pre className="text-xs whitespace-pre-wrap">
						{JSON.stringify(sample, null, 2)}
					</pre>
				</div>
			)}
		</section>
	);
}
