import { useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { Form } from "@/components/ui/form";
import { apiClient } from "@/lib/api-client";
import { SIGNUP_ROUTE } from "@/utils/constants";
import signUpValidationSchema from "@/validations/SignUp";
import { useMutation } from "@tanstack/react-query";
import FormInputField from "@/components/FormInputField";
import SubmitButton from "@/components/SubmitButton";
import OTPHandler from "@/pages/auth/components/OTPHandler";
import { handleKeyDown } from "@/utils/helpers";

/**
 * @memberof Pages.auth.components
 *
 * @description
 * - SignUpForm component handles the user registration process.
 * - It includes fields for email/mobile, password, and confirm password.
 * - To handle form events `useForm` hook from `react-hook-form` is used.
 * - Form is rendered using `shadcn Form component`
 * - Validation is applied using `Yup resolver` and a `mutation` is triggered upon form submission.
 * - `Reach Query` and `axios` is used for making <b>`POST request`</b>
 * - On successful request user receives OTP for verification email/mobile.
 *
 * @returns {JSX.Element}  JSX element representing the SignUpForm component.
 */

const SignUpForm = () => {
	const [isOTPDialogOpen, setOTPDialogOpen] = useState(false);
	const [userEmailOrMobile, setUserEmailOrMobile] = useState("");

	// Defining sign up form with initial values and validation resolver
	const signUpForm = useForm({
		defaultValues: {
			emailOrMobile: "",
			password: "",
			confirmPassword: "",
		},

		resolver: yupResolver(signUpValidationSchema),
	});

	// Mutation hook for handling form submission via an API call using POST method
	const { mutate, isPending } = useMutation({
		mutationFn: (data) => apiClient.post(SIGNUP_ROUTE, data),

		// On successful response navigate to profile page
		onSuccess: () => {
			setOTPDialogOpen(true);
		},
	});

	// Wrapper function to handle form submission
	const handleSubmit = (data) => {
		setUserEmailOrMobile(data.emailOrMobile);
		mutate(data);
	};

	return (
		<>
			{/* ----------------------------------------------------------
				* OTP component to verify email/mobile
				---------------------------------------------------------- */}
			{isOTPDialogOpen && (
				<OTPHandler
					emailOrMobile={userEmailOrMobile}
					isOpen={isOTPDialogOpen}
					onClose={() => setOTPDialogOpen(false)}
				/>
			)}

			{/* ----------------------------------------------------------
				* Sign Up Form
				---------------------------------------------------------- */}
			<Form {...signUpForm}>
				<form
					onSubmit={signUpForm.handleSubmit(handleSubmit)}
					className="space-y-8"
					onKeyDown={(event) => handleKeyDown(event, isPending)}
				>
					{/* ----------------------------------------------------------
						* emailOrMobile Field
						---------------------------------------------------------- */}

					<FormInputField
						control={signUpForm.control}
						name="emailOrMobile"
						placeholder="Enter email or mobile number"
					/>

					{/* ----------------------------------------------------------
						* Password Field
						---------------------------------------------------------- */}

					<FormInputField
						control={signUpForm.control}
						name="password"
						type="password"
						placeholder="Enter your password"
					/>

					{/* ----------------------------------------------------------
						* ConfirmPassword Field
						---------------------------------------------------------- */}

					<FormInputField
						control={signUpForm.control}
						name="confirmPassword"
						type="password"
						placeholder="Enter password again"
					/>

					{/* ----------------------------------------------------------
						* Submit Button
						---------------------------------------------------------- */}
					<SubmitButton isPending={isPending} />
				</form>
			</Form>
		</>
	);
};

export default SignUpForm;
