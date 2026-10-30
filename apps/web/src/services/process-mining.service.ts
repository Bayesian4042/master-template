import { ApiClient } from "@/lib/api-client";
import type {
	AnalyzeResponse,
	DatasetMapping,
	ProfileResponse,
} from "@/types/process-mining.types";

export class ProcessMiningService {
	static async profile(files: File[]): Promise<ProfileResponse> {
		const formData = new FormData();
		for (const file of files) {
			formData.append("files", file);
		}
		return ApiClient.post<ProfileResponse>(
			"/api/process-mining/profile",
			formData,
		);
	}

	static async analyze(
		files: File[],
		mappings: DatasetMapping[],
	): Promise<AnalyzeResponse> {
		const formData = new FormData();
		for (const file of files) {
			formData.append("files", file);
		}
		formData.append("mappings", JSON.stringify({ mappings }));
		return ApiClient.post<AnalyzeResponse>(
			"/api/process-mining/analyze",
			formData,
		);
	}
}
