"use client";

import { useProcessSession } from "@/contexts";
import { ActiveDiscovery } from "./ActiveDiscovery";
import { DiscoveryWelcome } from "./DiscoveryWelcome";

export function DiscoveryWorkspace() {
	const { state } = useProcessSession();

	if (!state.entryPoint) {
		return <DiscoveryWelcome />;
	}

	return <ActiveDiscovery />;
}
