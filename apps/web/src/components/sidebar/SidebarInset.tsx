import { SidebarInset as CnSidebarInset } from "@repo/ui/components/sidebar";
import { AppFooter } from "@/components/layout/AppFooter.view";
import { AppHeader } from "@/components/layout/AppHeader";

const SidebarInset = ({ children }: { children: React.ReactNode }) => (
	<CnSidebarInset className="flex h-svh flex-col [&:has(.ops-theme)>footer]:hidden">
		<AppHeader />
		<main className="flex min-h-0 flex-1 flex-col">{children}</main>
		<AppFooter />
	</CnSidebarInset>
);

export default SidebarInset;
