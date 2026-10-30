import "./operations.css";
import { WorkspaceShell } from "@/components/operations";
import { ProcessSessionProvider } from "@/contexts";

export default function OperationsLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<ProcessSessionProvider>
			<WorkspaceShell>{children}</WorkspaceShell>
		</ProcessSessionProvider>
	);
}
