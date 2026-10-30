import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { EmailForm } from "../EmailForm";

describe("EmailForm", () => {
	it("renders email input and submit button", () => {
		render(<EmailForm onSendOTP={vi.fn()} />);
		expect(screen.getByLabelText(/email address/i)).toBeDefined();
		expect(screen.getByRole("button", { name: /send verification code/i })).toBeDefined();
	});

	it("shows validation error for empty submit", async () => {
		render(<EmailForm onSendOTP={vi.fn()} />);
		await userEvent.click(screen.getByRole("button", { name: /send verification code/i }));
		await waitFor(() => {
			expect(screen.getByText(/email is required/i)).toBeDefined();
		});
	});

	it("shows validation error for invalid email", async () => {
		render(<EmailForm onSendOTP={vi.fn()} />);
		await userEvent.type(screen.getByLabelText(/email address/i), "notanemail");
		fireEvent.submit(screen.getByRole("button", { name: /send verification code/i }).closest("form")!);
		await waitFor(() => {
			expect(screen.getByText(/valid email/i)).toBeDefined();
		});
	});

	it("calls onSendOTP with trimmed email on valid submit", async () => {
		const onSendOTP = vi.fn().mockResolvedValue(true);
		render(<EmailForm onSendOTP={onSendOTP} />);
		await userEvent.type(screen.getByLabelText(/email address/i), "test@example.com");
		await userEvent.click(screen.getByRole("button", { name: /send verification code/i }));
		await waitFor(() => {
			expect(onSendOTP).toHaveBeenCalledWith("test@example.com");
		});
	});

	it("shows error message when onSendOTP throws", async () => {
		const onSendOTP = vi.fn().mockRejectedValue(new Error("Server error"));
		render(<EmailForm onSendOTP={onSendOTP} />);
		await userEvent.type(screen.getByLabelText(/email address/i), "test@example.com");
		await userEvent.click(screen.getByRole("button", { name: /send verification code/i }));
		await waitFor(() => {
			expect(screen.getByText("Server error")).toBeDefined();
		});
	});

	it("shows loading state while submitting", async () => {
		const onSendOTP = vi.fn((): Promise<boolean> => new Promise(() => {}));
		render(<EmailForm onSendOTP={onSendOTP} />);
		await userEvent.type(screen.getByLabelText(/email address/i), "test@example.com");
		await userEvent.click(screen.getByRole("button", { name: /send verification code/i }));
		await waitFor(() => {
			expect(screen.getByText(/sending code/i)).toBeDefined();
		});
	});
});
