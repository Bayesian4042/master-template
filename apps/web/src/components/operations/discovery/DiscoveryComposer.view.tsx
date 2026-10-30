"use client";

import {
	InputGroup,
	InputGroupAddon,
	InputGroupButton,
	InputGroupTextarea,
} from "@repo/ui/components/input-group";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@repo/ui/components/tooltip";
import { cn } from "@repo/ui/lib/utils";
import { ArrowUpIcon, MicIcon, PaperclipIcon } from "lucide-react";
import type React from "react";

export function DiscoveryComposer({
	value,
	onChange,
	onSubmit,
	onAttach,
	placeholder,
	disabled = false,
	size = "compact",
	inputRef,
}: {
	value: string;
	onChange: (value: string) => void;
	onSubmit: () => void;
	onAttach?: () => void;
	placeholder: string;
	disabled?: boolean;
	size?: "welcome" | "compact";
	inputRef?: React.Ref<HTMLTextAreaElement>;
}) {
	const canSend = !disabled && value.trim().length > 0;

	return (
		<InputGroup
			className={cn(
				"bg-background border-border/70 shadow-sm",
				size === "welcome" ? "rounded-2xl" : "rounded-xl",
			)}
		>
			<InputGroupTextarea
				ref={inputRef}
				value={value}
				onChange={(event) => onChange(event.target.value)}
				placeholder={placeholder}
				disabled={disabled}
				rows={size === "welcome" ? 3 : 1}
				aria-label={placeholder}
				className={cn(
					"px-4 text-[15px] leading-relaxed",
					size === "welcome" ? "min-h-24 pt-4" : "min-h-11 py-3",
				)}
				onKeyDown={(event) => {
					if (event.key === "Enter" && !event.shiftKey && canSend) {
						event.preventDefault();
						onSubmit();
					}
				}}
			/>
			<InputGroupAddon align="block-end" className="justify-between px-2 pb-2">
				<InputGroupButton
					type="button"
					size="icon-sm"
					variant="ghost"
					aria-label="Attach file"
					disabled={disabled || !onAttach}
					onClick={onAttach}
				>
					<PaperclipIcon />
				</InputGroupButton>
				<div className="ml-auto flex items-center gap-1">
					<Tooltip>
						<TooltipTrigger
							render={
								<span className="inline-flex">
									<InputGroupButton
										type="button"
										size="icon-sm"
										variant="ghost"
										disabled
										aria-label="Voice input unavailable"
									>
										<MicIcon />
									</InputGroupButton>
								</span>
							}
						/>
						<TooltipContent className="ops-theme">
							Voice capture isn’t connected in this prototype
						</TooltipContent>
					</Tooltip>
					<InputGroupButton
						type="button"
						size="icon-sm"
						variant="default"
						className="rounded-full"
						disabled={!canSend}
						aria-label="Send"
						onClick={onSubmit}
					>
						<ArrowUpIcon />
					</InputGroupButton>
				</div>
			</InputGroupAddon>
		</InputGroup>
	);
}
