"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@repo/ui/components/card";
import {
	Field,
	FieldDescription,
	FieldError,
	FieldLabel,
} from "@repo/ui/components/field";
import { Input } from "@repo/ui/components/input";
import LoadingButton from "@repo/ui/general/LoadingButton";
import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";
import { useUpdateUser } from "@/queries";
import { type UpdateUserFormData, updateUserSchema } from "@/validations";
import { AvatarPicker } from "./AvatarPicker";

export const UserInfoForm = () => {
	const { data: session } = authClient.useSession();
	const user = session?.user;
	const { mutate: updateUser, isPending } = useUpdateUser();

	const form = useForm<UpdateUserFormData>({
		resolver: zodResolver(updateUserSchema),
		defaultValues: {
			name: "",
		},
	});

	useEffect(() => {
		if (user) {
			form.reset({
				name: user.name || "",
			});
		}
	}, [user, form]);

	const onSubmit = async (data: UpdateUserFormData) => {
		updateUser(
			{ name: data.name },
			{
				onSuccess: () => {
					toast.success("Profile updated successfully");
				},
				onError: (error) => {
					toast.error(error.message);
				},
			},
		);
	};

	return (
		<Card>
			<CardHeader>
				<CardTitle className="font-medium">Personal Information</CardTitle>
				<CardDescription>Update your personal details</CardDescription>
			</CardHeader>
			<CardContent>
				<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
					<AvatarPicker />

					<Controller
						name="name"
						control={form.control}
						render={({ field, fieldState }) => (
							<Field data-invalid={fieldState.invalid}>
								<FieldLabel htmlFor={field.name}>Full Name</FieldLabel>
								<Input
									{...field}
									id={field.name}
									placeholder="John Doe"
									aria-invalid={fieldState.invalid}
								/>
								<FieldDescription>
									Your name will be visible to other team members
								</FieldDescription>
								{fieldState.invalid && (
									<FieldError errors={[fieldState.error]} />
								)}
							</Field>
						)}
					/>

					<div>
						<FieldLabel htmlFor="email-disabled">Email Address</FieldLabel>
						<Input
							id="email-disabled"
							value={user?.email || ""}
							disabled
							className="mt-2"
						/>
						<p className="text-muted-foreground mt-2 text-sm">
							Your email address cannot be changed
						</p>
					</div>

					<div className="flex justify-end">
						<LoadingButton type="submit" isLoading={isPending}>
							Save Changes
						</LoadingButton>
					</div>
				</form>
			</CardContent>
		</Card>
	);
};
