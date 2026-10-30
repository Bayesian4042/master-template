"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import LoadingButton from "@repo/ui/general/LoadingButton";
import { useForm } from "react-hook-form";
import type { DatasetProfile } from "@/types/process-mining.types";
import {
	type MappingFormValues,
	mappingFormSchema,
} from "@/validations/process-mining.validation";
import { DatasetMappingCard } from "./DatasetMappingCard";

export function MappingForm({
	profiles,
	isLoading,
	onBack,
	onSubmit,
}: {
	profiles: DatasetProfile[];
	isLoading: boolean;
	onBack: () => void;
	onSubmit: (values: MappingFormValues) => void;
}) {
	const form = useForm<MappingFormValues>({
		resolver: zodResolver(mappingFormSchema),
		defaultValues: {
			mappings: profiles.map((profile) => {
				const timestampGuess =
					profile.headers.find((header) =>
						/(submitted|created|approved|timestamp)/i.test(header),
					) ?? "";
				return {
					fileName: profile.fileName,
					caseKeyColumns: profile.suggestedMapping.caseKeyColumns,
					activities:
						profile.suggestedMapping.activities.length > 0
							? profile.suggestedMapping.activities
							: [{ name: "", timestampColumn: timestampGuess }],
					actorColumn: profile.suggestedMapping.actorColumn,
				};
			}),
		},
	});

	return (
		<form
			className="mx-auto flex w-full max-w-3xl flex-col gap-5 px-5 py-6"
			onSubmit={form.handleSubmit(onSubmit)}
		>
			<div>
				<h1 className="text-lg font-medium tracking-tight">Confirm mappings</h1>
				<p className="text-muted-foreground mt-1 text-sm">
					Review the proposed case keys, activities, and timestamps before
					analysis.
				</p>
			</div>

			{profiles.map((profile, index) => (
				<DatasetMappingCard
					key={profile.fileName}
					index={index}
					profile={profile}
					control={form.control}
					setValue={form.setValue}
				/>
			))}

			<div className="flex items-center justify-between gap-3">
				<button
					type="button"
					className="text-muted-foreground text-sm hover:text-foreground"
					onClick={onBack}
				>
					Back
				</button>
				<LoadingButton type="submit" isLoading={isLoading}>
					Discover process
				</LoadingButton>
			</div>
		</form>
	);
}
