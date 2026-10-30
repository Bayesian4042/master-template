import { z } from "zod";

export const activityMappingSchema = z.object({
	name: z.string().min(1),
	timestampColumn: z.string().min(1),
});

export const datasetMappingSchema = z.object({
	fileName: z.string().min(1),
	caseKeyColumns: z.array(z.string().min(1)).min(1),
	activities: z.array(activityMappingSchema).min(1),
	actorColumn: z.string().min(1).optional(),
});

export const analyzeMappingsSchema = z.object({
	mappings: z.array(datasetMappingSchema).min(1).max(3),
});

export type DatasetMappingInput = z.infer<typeof datasetMappingSchema>;
