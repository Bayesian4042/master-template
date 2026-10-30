"use client";
import {
	Sidebar,
	SidebarContent,
	SidebarGroup,
	SidebarGroupContent,
	SidebarGroupLabel,
	SidebarHeader,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
} from "@repo/ui/components/sidebar";
import {
	GalleryVerticalEnd,
	Home,
	MessagesSquare,
	ScanSearch,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { APP_NAME } from "@/constants";

const NAV_ITEMS = [{ label: "Dashboard", link: "/", icon: Home }];

const OPERATIONS_ITEMS = [
	{ label: "Discovery", link: "/operations/discovery", icon: MessagesSquare },
	{ label: "Intelligence", link: "/operations/intelligence", icon: ScanSearch },
];

const isLinkActive = (link: string, pathname: string) =>
	link === "/"
		? pathname === link
		: pathname === link || pathname.startsWith(`${link}/`);

export function AppSidebar() {
	const pathname = usePathname();

	return (
		<Sidebar collapsible="icon">
			<SidebarHeader>
				<SidebarMenu>
					<SidebarMenuItem>
						<SidebarMenuButton
							size="lg"
							className="gap-2.5 bg-transparent!"
							render={<Link href="/" />}
						>
							<div className="bg-primary text-primary-foreground flex size-8 shrink-0 items-center justify-center rounded-full">
								<GalleryVerticalEnd className="size-4" />
							</div>
							<div className="flex flex-col items-start">
								<span className="text-lg font-semibold text-nowrap">
									{APP_NAME}
								</span>
								<span className="text-xs font-light text-nowrap">
									heizen.work
								</span>
							</div>
						</SidebarMenuButton>
					</SidebarMenuItem>
				</SidebarMenu>
			</SidebarHeader>
			<SidebarContent>
				<SidebarGroup>
					<SidebarGroupLabel className="text-sidebar-foreground/50 tracking-wider uppercase">
						General
					</SidebarGroupLabel>
					<SidebarGroupContent>
						<SidebarMenu>
							{NAV_ITEMS.map((item) => (
								<SidebarMenuItem key={item.label}>
									<SidebarMenuButton
										tooltip={item.label}
										render={<Link href={item.link} />}
										isActive={isLinkActive(item.link, pathname)}
										className="data-active:bg-primary/10!"
									>
										<item.icon />
										<span>{item.label}</span>
									</SidebarMenuButton>
								</SidebarMenuItem>
							))}
						</SidebarMenu>
					</SidebarGroupContent>
				</SidebarGroup>
				<SidebarGroup>
					<SidebarGroupLabel className="text-sidebar-foreground/50 tracking-wider uppercase">
						Operations
					</SidebarGroupLabel>
					<SidebarGroupContent>
						<SidebarMenu>
							{OPERATIONS_ITEMS.map((item) => (
								<SidebarMenuItem key={item.label}>
									<SidebarMenuButton
										tooltip={item.label}
										render={<Link href={item.link} />}
										isActive={isLinkActive(item.link, pathname)}
										className="data-active:bg-primary/10!"
									>
										<item.icon />
										<span>{item.label}</span>
									</SidebarMenuButton>
								</SidebarMenuItem>
							))}
						</SidebarMenu>
					</SidebarGroupContent>
				</SidebarGroup>
			</SidebarContent>
		</Sidebar>
	);
}
