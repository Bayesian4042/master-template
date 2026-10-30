"use client";

import LoadingButton from "@repo/ui/general/LoadingButton";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

function MicrosoftIcon() {
	return (
		<svg className="size-4" viewBox="0 0 21 21" aria-hidden="true">
			<title>Microsoft</title>
			<rect x="1" y="1" width="9" height="9" fill="#F25022" />
			<rect x="11" y="1" width="9" height="9" fill="#7FBA00" />
			<rect x="1" y="11" width="9" height="9" fill="#00A4EF" />
			<rect x="11" y="11" width="9" height="9" fill="#FFB900" />
		</svg>
	);
}

export function MicrosoftAuthButton() {
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const router = useRouter();
	const searchParams = useSearchParams();
	const callbackUrl =
		searchParams.get("callbackUrl") || "/operations/discovery";

	const handleMicrosoftSignIn = async () => {
		setIsLoading(true);
		setError(null);

		try {
			await new Promise((resolve) => setTimeout(resolve, 600));
			const response = await fetch("/api/demo-auth", { method: "POST" });
			if (!response.ok) {
				throw new Error("Demo sign-in failed");
			}
			router.push(callbackUrl);
			router.refresh();
		} catch (err) {
			setError(err instanceof Error ? err.message : "Demo sign-in failed");
			setIsLoading(false);
		}
	};

	return (
		<div className="space-y-3">
			<LoadingButton
				type="button"
				variant="outline"
				className="w-full"
				isLoading={isLoading}
				onClick={handleMicrosoftSignIn}
			>
				{!isLoading && <MicrosoftIcon />}
				Continue with Microsoft
			</LoadingButton>
			{error && <p className="text-destructive text-center text-sm">{error}</p>}
		</div>
	);
}
