"use client";

import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbPage,
	BreadcrumbSeparator,
} from "@repo/ui/components/breadcrumb";
import { Separator } from "@repo/ui/components/separator";
import { SidebarTrigger } from "@repo/ui/components/sidebar";
import { Skeleton } from "@repo/ui/components/skeleton";
import { ThemeToggle } from "@repo/ui/components/theme-toggle";
import Link from "next/link";
import { Fragment } from "react";
import { APP_NAME } from "@/constants";
import { useBreadcrumbs } from "@/hooks/use-breadcrumbs";
import { ProfileDropdown } from "./ProfileDropdown";

export const AppHeader = () => {
	const crumbs = useBreadcrumbs(APP_NAME);

	return (
		<header className="bg-card sticky top-0 z-50 border-b">
			<div className="mx-auto flex max-w-360 items-center justify-between gap-6 px-4 py-2 sm:px-6">
				<div className="flex items-center gap-4">
					<SidebarTrigger className="[&_svg]:size-5!" />
					<Separator
						orientation="vertical"
						className="hidden h-4! data-vertical:self-center sm:block"
					/>
					<Breadcrumb className="hidden sm:block">
						<BreadcrumbList>
							{crumbs.map((crumb, index) => (
								<Fragment key={crumb.href}>
									{index > 0 && <BreadcrumbSeparator />}
									<BreadcrumbItem>
										{crumb.isLoading ? (
											<Skeleton className="h-4 w-24" />
										) : crumb.isLast ? (
											<BreadcrumbPage>{crumb.label}</BreadcrumbPage>
										) : (
											<BreadcrumbLink render={<Link href={crumb.href} />}>
												{crumb.label}
											</BreadcrumbLink>
										)}
									</BreadcrumbItem>
								</Fragment>
							))}
						</BreadcrumbList>
					</Breadcrumb>
				</div>
				<div className="flex items-center gap-1.5">
					<ThemeToggle />
					<ProfileDropdown />
				</div>
			</div>
		</header>
	);
};
