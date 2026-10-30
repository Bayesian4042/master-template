import { SidebarProvider } from "@repo/ui/components/sidebar";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { AppSidebar } from "@/components/sidebar/AppSidebar";
import SidebarInset from "@/components/sidebar/SidebarInset";
import { DemoAuthProvider } from "@/contexts/demo-auth.context";
import { getOptionalAuthSession } from "@/lib/get-optional-auth-session";
import { hasDemoSession } from "@/utils/demo-auth.utils";

export default async function AppLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	const session = await getOptionalAuthSession();
	const isDemo = hasDemoSession(await cookies());

	if (!session.data && !isDemo) {
		redirect("/sign-in");
	}

	return (
		<DemoAuthProvider isDemo={!session.data && isDemo}>
			<SidebarProvider>
				<AppSidebar />
				<SidebarInset>{children}</SidebarInset>
			</SidebarProvider>
		</DemoAuthProvider>
	);
}
