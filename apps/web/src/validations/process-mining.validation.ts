import { z } from "zod";

export const activityMappingSchema = z.object({
	name: z.string().min(1, "Activity name is required"),
	timestampColumn: z.string().min(1, "Timestamp column is required"),
});

export const datasetMappingSchema = z.object({
	fileName: z.string().min(1),
	caseKeyColumns: z
		.array(z.string().min(1))
		.min(1, "Select at least one case key column"),
	activities: z
		.array(activityMappingSchema)
		.min(1, "Add at least one activity"),
	actorColumn: z.string().optional(),
});

export const mappingFormSchema = z.object({
	mappings: z.array(datasetMappingSchema).min(1),
});

export type MappingFormValues = z.infer<typeof mappingFormSchema>;
