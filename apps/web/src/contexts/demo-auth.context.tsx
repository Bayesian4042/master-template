"use client";

import { createContext, useContext } from "react";

const DemoAuthContext = createContext(false);

export function DemoAuthProvider({
	isDemo,
	children,
}: {
	isDemo: boolean;
	children: React.ReactNode;
}) {
	return (
		<DemoAuthContext.Provider value={isDemo}>
			{children}
		</DemoAuthContext.Provider>
	);
}

export function useIsDemoAuth() {
	return useContext(DemoAuthContext);
}
