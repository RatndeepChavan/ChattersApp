import { useForm } from "react-hook-form";
import FormInputFiled from ".";
import { Form } from "../ui/form";
import { render, screen } from "@testing-library/react";

const CustomComponent = (props) => {
	const { name, type, placeholder } = { ...props };
	const testForm = useForm();
	return (
		<Form {...testForm}>
			<form data-testid="testForm">
				<FormInputFiled
					control={testForm.control}
					name={name}
					type={type}
					placeholder={placeholder}
				/>
			</form>
		</Form>
	);
};

const testComponent = ({
	name = "Form input",
	type = "text",
	placeholder = "Enter Details",
} = {}) => {
	render(<CustomComponent name={name} type={type} placeholder={placeholder} />);
	// screen.debug();
	const inputElement = screen.getByTestId("testForm").firstChild.firstChild;
	expect(inputElement).toBeInTheDocument();
	expect(inputElement).toHaveAttribute("name", name);
	expect(inputElement).toHaveAttribute("type", type);
	expect(inputElement).toHaveAttribute("placeholder", placeholder);
};

describe("Unit tests of FormInputField component", () => {
	// *Test cases for valid props
	test("Default render", () => testComponent());
	test("Custom name", () => testComponent({ name: "firstName" }));
	test("Custom type", () => testComponent({ name: "number" }));
	test("Custom placeholder", () => testComponent({ name: "custom placeholder" }));

	// !Test for control prop (require else throw error)
	test.skip("TypeError when 'control' prop is not provided", () => {
		const renderForm = () => render(<FormInputFiled />);
		expect(renderForm).toThrowError("The 'control' prop is required.");
	});
});
