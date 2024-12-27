import { FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { memo } from "react";

/**
 * @memberof Components
 *
 * @description
 * - FormInputField component wraps input fields with form controls.
 * - It has validation messages, and other form-related functionality.
 * - Compatible with Shadcn `Form` components.
 * - Throws an error if control prop is not provided
 *
 * @param {Object} props - The props object for the component.
 * @param {Object} props.control - The form control object from Shadcn form.
 * @param {string} [props.name="Form input"] - The name of the input field.
 * @param {string} [props.type="text"] - The input type (e.g., text, email, password).
 * @param {string} [props.placeholder="Enter Details"] - The placeholder text for the input field.
 *
 * @returns {JSX.Element} The memoized FormInputField component.
 */
const FormInputField = (props) => {
	const { control, name, type, placeholder } = { ...props };

	// throws an error for control prop
	if (!control) {
		throw new TypeError("The 'control' prop is required.");
	}

	return (
		<FormField
			control={control}
			name={name || "Form input"}
			render={({ field }) => (
				<FormItem>
					<FormControl>
						{/* Shadcn Input field */}
						<Input
							className="rounded-full"
							type={type || "text"}
							placeholder={placeholder || "Enter Details"}
							{...field}
						/>
					</FormControl>

					{/* validation error messages */}
					<FormMessage />
				</FormItem>
			)}
		/>
	);
};

export default memo(FormInputField);
