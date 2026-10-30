"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@repo/ui/components/button";
import { Field, FieldError } from "@repo/ui/components/field";
import {
	InputOTP,
	InputOTPGroup,
	InputOTPSlot,
} from "@repo/ui/components/input-otp";
import { ArrowLeft, Loader2, Shield } from "lucide-react";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";

const otpSchema = z.object({
	otp: z.string().length(6, "OTP must be 6 digits"),
});

type OTPFormValues = z.infer<typeof otpSchema>;

interface OTPFormProps {
	email: string;
	onVerifyOTP: (email: string, otp: string) => Promise<boolean>;
	onBackToEmail: () => void;
	onResendOTP: (email: string) => Promise<boolean>;
}

export function OTPForm({
	email,
	onVerifyOTP,
	onBackToEmail,
	onResendOTP,
}: OTPFormProps) {
	const [isLoading, setIsLoading] = useState(false);
	const [isResending, setIsResending] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [resendCooldown, setResendCooldown] = useState(0);

	const form = useForm<OTPFormValues>({
		resolver: zodResolver(otpSchema),
		defaultValues: {
			otp: "",
		},
	});

	useEffect(() => {
		if (resendCooldown > 0) {
			const timer = setTimeout(() => {
				setResendCooldown(resendCooldown - 1);
			}, 1000);
			return () => clearTimeout(timer);
		}
	}, [resendCooldown]);

	const onSubmit = async (data: OTPFormValues) => {
		setIsLoading(true);
		setError(null);

		try {
			await onVerifyOTP(email, data.otp);
		} catch (err) {
			setError(
				err instanceof Error ? err.message : "Invalid verification code",
			);
		} finally {
			setIsLoading(false);
		}
	};

	const handleResendClick = async () => {
		setIsResending(true);
		setError(null);

		try {
			await onResendOTP(email);
			setResendCooldown(60);
			form.reset();
		} catch (err) {
			setError(err instanceof Error ? err.message : "Failed to resend OTP");
		} finally {
			setIsResending(false);
		}
	};

	const handleBackClick = () => {
		form.reset();
		setError(null);
		setResendCooldown(0);
		onBackToEmail();
	};

	return (
		<div className="space-y-6">
			<div className="space-y-3 text-center">
				<div className="bg-primary/10 inline-flex h-12 w-12 items-center justify-center rounded-full">
					<Shield className="text-primary h-6 w-6" />
				</div>
				<div className="space-y-1">
					<h2 className="text-lg font-semibold">Enter verification code</h2>
					<p className="text-muted-foreground text-sm">
						We&apos;ve sent a 6-digit code to{" "}
						<span className="font-medium">{email}</span>
					</p>
				</div>
			</div>

			<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
				<div className="space-y-4">
					<Controller
						name="otp"
						control={form.control}
						render={({ field, fieldState }) => (
							<Field data-invalid={fieldState.invalid}>
								<div className="flex justify-center">
									<InputOTP
										{...field}
										maxLength={6}
										disabled={isLoading}
										aria-invalid={fieldState.invalid}
									>
										<InputOTPGroup>
											<InputOTPSlot index={0} />
											<InputOTPSlot index={1} />
											<InputOTPSlot index={2} />
											<InputOTPSlot index={3} />
											<InputOTPSlot index={4} />
											<InputOTPSlot index={5} />
										</InputOTPGroup>
									</InputOTP>
								</div>
								{fieldState.invalid && (
									<FieldError
										errors={[fieldState.error]}
										className="text-center"
									/>
								)}
							</Field>
						)}
					/>

					{error && (
						<p className="text-destructive text-center text-sm">{error}</p>
					)}

					<div className="text-center">
						<p className="text-muted-foreground text-xs">
							Didn&apos;t receive the code?{" "}
							{resendCooldown > 0 ? (
								<span className="text-foreground/70">
									Try again in {resendCooldown}s
								</span>
							) : (
								<button
									type="button"
									className="text-primary hover:underline disabled:opacity-50"
									onClick={handleResendClick}
									disabled={isResending || isLoading}
								>
									{isResending ? "Sending..." : "Resend"}
								</button>
							)}
						</p>
					</div>
				</div>

				<div className="space-y-3">
					<Button
						type="submit"
						className="w-full"
						disabled={isLoading || form.watch("otp").length !== 6}
					>
						{isLoading ? (
							<>
								<Loader2 className="h-4 w-4 animate-spin" />
								Verifying...
							</>
						) : (
							<>
								<Shield className="h-4 w-4" />
								Verify code
							</>
						)}
					</Button>

					<Button
						type="button"
						variant="ghost"
						className="w-full"
						onClick={handleBackClick}
						disabled={isLoading}
					>
						<ArrowLeft className="h-4 w-4" />
						Back to email
					</Button>
				</div>
			</form>
		</div>
	);
}
