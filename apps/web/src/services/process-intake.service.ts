import { ApiClient } from "@/lib/api-client";
import type {
	IntakeTurnRequest,
	IntakeTurnResponse,
} from "@/types/process-intake.types";

export class ProcessIntakeService {
	static async turn(body: IntakeTurnRequest): Promise<IntakeTurnResponse> {
		return ApiClient.post<IntakeTurnResponse>("/api/process-intake/turn", body);
	}
}
