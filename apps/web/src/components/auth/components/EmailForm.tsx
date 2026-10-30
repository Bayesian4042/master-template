"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@repo/ui/components/button";
import { Field, FieldError, FieldLabel } from "@repo/ui/components/field";
import {
	InputGroup,
	InputGroupAddon,
	InputGroupInput,
} from "@repo/ui/components/input-group";
import { Loader2, Mail } from "lucide-react";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";

const emailSchema = z.object({
	email: z
		.string()
		.trim()
		.min(1, "Email is required")
		.email("Please enter a valid email address"),
});

type EmailFormValues = z.infer<typeof emailSchema>;

interface EmailFormProps {
	onSendOTP: (email: string) => Promise<boolean>;
}

export function EmailForm({ onSendOTP }: EmailFormProps) {
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const form = useForm<EmailFormValues>({
		resolver: zodResolver(emailSchema),
		defaultValues: {
			email: "",
		},
	});

	const onSubmit = async (data: EmailFormValues) => {
		setIsLoading(true);
		setError(null);

		try {
			await onSendOTP(data.email);
		} catch (err) {
			setError(err instanceof Error ? err.message : "Failed to send OTP");
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className="space-y-4">
			<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
				<Controller
					name="email"
					control={form.control}
					render={({ field, fieldState }) => (
						<Field data-invalid={fieldState.invalid}>
							<FieldLabel htmlFor={field.name} className="text-sm font-medium">
								Email address
							</FieldLabel>
							<InputGroup>
								<InputGroupAddon>
									<Mail />
								</InputGroupAddon>
								<InputGroupInput
									{...field}
									id={field.name}
									type="email"
									placeholder="name@example.com"
									disabled={isLoading}
									aria-invalid={fieldState.invalid}
								/>
							</InputGroup>
							{fieldState.invalid && <FieldError errors={[fieldState.error]} />}
						</Field>
					)}
				/>

				{error && <p className="text-destructive text-sm">{error}</p>}

				<Button type="submit" className="w-full" disabled={isLoading}>
					{isLoading ? (
						<>
							<Loader2 className="h-4 w-4 animate-spin" />
							Sending code...
						</>
					) : (
						<>
							<Mail className="h-4 w-4" />
							Send verification code
						</>
					)}
				</Button>
			</form>
		</div>
	);
}
