export interface LastSignIn {
	createdAt: string;
	userAgent: string | null;
}

export interface UserOverview {
	memberSince: string;
	activeSessionCount: number;
	lastOtherSignIn: LastSignIn | null;
	signInMethods: string[];
}
