import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@repo/ui/components/card";
import { GalleryVerticalEnd } from "lucide-react";
import Link from "next/link";
import { APP_NAME } from "@/constants";
import { AuthBackgroundShape } from "./AuthBackgroundShape.view";

interface AuthLayoutProps {
	children: React.ReactNode;
}

export function AuthLayout({ children }: AuthLayoutProps) {
	return (
		<div className="relative flex min-h-screen items-center justify-center overflow-x-hidden px-4 py-10 sm:px-6 lg:px-8">
			<div className="absolute">
				<AuthBackgroundShape />
			</div>

			<Card className="z-1 w-full gap-6 py-6 sm:max-w-lg">
				<CardHeader className="gap-6 px-6">
					<div className="flex items-center gap-3">
						<div className="bg-primary text-primary-foreground flex size-8 items-center justify-center rounded-full">
							<GalleryVerticalEnd className="size-4" />
						</div>
						<span className="text-xl font-semibold">{APP_NAME}</span>
					</div>
					<div>
						<CardTitle className="mb-2 text-2xl font-semibold">
							Sign in to {APP_NAME}
						</CardTitle>
						<CardDescription className="text-base">
							Continue with your Microsoft work account.
						</CardDescription>
					</div>
				</CardHeader>

				<CardContent className="space-y-4 px-6">{children}</CardContent>

				<CardFooter className="text-muted-foreground justify-center px-6 text-xs">
					<p>
						By continuing, you agree to our{" "}
						<Link
							href="/terms-of-service"
							className="hover:text-foreground underline underline-offset-4"
						>
							Terms
						</Link>{" "}
						and{" "}
						<Link
							href="/privacy-policy"
							className="hover:text-foreground underline underline-offset-4"
						>
							Privacy Policy
						</Link>
					</p>
				</CardFooter>
			</Card>
		</div>
	);
}
