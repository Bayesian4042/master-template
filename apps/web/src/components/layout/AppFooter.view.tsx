import { APP_NAME } from "@/constants";

export const AppFooter = () => (
	<footer>
		<div className="text-muted-foreground mx-auto max-w-360 px-4 py-3 text-sm max-sm:text-center sm:px-6">
			©{new Date().getFullYear()} {APP_NAME}
		</div>
	</footer>
);
