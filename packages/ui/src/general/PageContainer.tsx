import { cn } from "@repo/ui/lib/utils";
import type React from "react";

interface PageContainerProps {
	children: React.ReactNode;
	className?: string;
}

export const PageContainer = ({ children, className }: PageContainerProps) => {
	return (
		<div
			className={cn("mx-auto w-full max-w-360 px-4 py-6 sm:px-6", className)}
		>
			{children}
		</div>
	);
};
