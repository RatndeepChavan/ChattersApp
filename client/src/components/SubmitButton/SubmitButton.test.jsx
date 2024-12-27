import { render, screen } from "@testing-library/react";
import SubmitButton from "@/components/SubmitButton";

describe("Unit tests for SubmitButton component", () => {
	test("default render", () => {
		render(<SubmitButton />);
		const buttonElement = screen.getByRole("button");
		expect(buttonElement).toBeInTheDocument();
	});

	test("isPending is false", () => {
		render(<SubmitButton isPending={false} />);
		const buttonElement = screen.getByRole("button");
		expect(buttonElement).not.toBeDisabled();
		expect(buttonElement).toHaveTextContent("Submit");
	});

	test("isPending is true", () => {
		render(<SubmitButton isPending={true} />);
		const buttonElement = screen.getByRole("button");
		expect(buttonElement).toBeDisabled();
		expect(buttonElement).toHaveTextContent("Submitting...");
	});

	test("Displaying element", () => {
		render(<SubmitButton isPending={true} />);
		const buttonElement = screen.getByRole("button");
		const spinnerElement = screen.getByRole("status");
		expect(buttonElement).toContainElement(spinnerElement);
	});
});
