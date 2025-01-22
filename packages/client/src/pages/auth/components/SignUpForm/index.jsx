import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { Form } from "@/components/ui/form";
import { apiClient } from "@/lib/api-client";
import { SIGNUP_ROUTE } from "@/utils/constants";
import signUpValidationSchema from "@/validations/SignUp";
import { useMutation } from "@tanstack/react-query";
import FormInputField from "@/components/FormInputField";
import SubmitButton from "@/components/SubmitButton";
import { handleKeyDown } from "@/utils/helpers";
import { useNavigate } from "react-router-dom";

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
	const navigate = useNavigate();

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
			localStorage.setItem("isOTPDialogOpen", true);
			navigate("/otp");
		},
		onError: () => {
			localStorage.setItem("emailOrMobile", "");
		},
	});

	// Wrapper function to handle form submission
	const handleSubmit = (data) => {
		localStorage.setItem("emailOrMobile", data.emailOrMobile);
		mutate(data);
	};

	return (
		<>
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
