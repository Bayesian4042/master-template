import { useMutation } from "@tanstack/react-query";
import { ProcessMiningService } from "@/services";
import type { DatasetMapping } from "@/types/process-mining.types";

export function useProfileDatasets() {
	return useMutation({
		mutationFn: (files: File[]) => ProcessMiningService.profile(files),
	});
}

export function useAnalyzeProcess() {
	return useMutation({
		mutationFn: ({
			files,
			mappings,
		}: {
			files: File[];
			mappings: DatasetMapping[];
		}) => ProcessMiningService.analyze(files, mappings),
	});
}
