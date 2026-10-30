"use client";

import { Button } from "@repo/ui/components/button";
import { usePathname } from "next/navigation";
import { CMP_DEMO_META } from "@/constants/templates/cmp";
import { useProcessSession } from "@/contexts";
import { DemoBadge } from "./DemoBadge.view";
import { StageStepper } from "./StageStepper.view";

export function WorkspaceShell({ children }: { children: React.ReactNode }) {
	const { state, resetSession } = useProcessSession();
	const pathname = usePathname();
	const isWelcome =
		!state.entryPoint && pathname.startsWith("/operations/discovery");
	const isLivePath =
		pathname.startsWith("/operations/data") ||
		pathname.startsWith("/operations/discovery");

	return (
		<div className="ops-theme flex h-full min-h-0 flex-1 flex-col overflow-hidden">
			<div className="flex items-center justify-between gap-4 px-5 py-3">
				<div className="flex items-center gap-2">
					<p className="text-sm font-medium tracking-tight">
						{pathname.startsWith("/operations/data")
							? "CMP Process Discovery"
							: pathname.startsWith("/operations/discovery")
								? "Expected process intake"
								: CMP_DEMO_META.label}
					</p>
					{!isLivePath && <DemoBadge />}
				</div>
				{!isWelcome && (
					<div className="flex items-center gap-3">
						<StageStepper />
						<Button
							type="button"
							variant="ghost"
							size="sm"
							onClick={resetSession}
						>
							{isLivePath ? "Reset" : "Reset demo"}
						</Button>
					</div>
				)}
			</div>
			<div className="flex min-h-0 flex-1 flex-col">{children}</div>
		</div>
	);
}
