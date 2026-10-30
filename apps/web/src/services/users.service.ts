import { ApiClient } from "@/lib/api-client";
import type { UserOverview } from "@/types";

export class UserService {
	static async uploadLogo(logo: File) {
		const formData = new FormData();
		formData.append("logo", logo);
		return ApiClient.post<{ url: string }>("/api/users/upload-logo", formData);
	}

	static async removeAvatar() {
		return ApiClient.delete<void>("/api/users/avatar");
	}

	static async getOverview() {
		return ApiClient.get<UserOverview>("/api/users/me/overview");
	}
}
