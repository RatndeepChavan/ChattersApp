import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { Form } from "@/components/ui/form";
import { apiClient } from "@/lib/api-client";
import { LOGIN_ROUTE } from "@/utils/constants.js";
import logInValidationSchema from "@/validations/LogIn";
import { toastNotification } from "@/utils/helpers.js";
import { useNavigate } from "react-router-dom";
import { useProfileStore, useUserStore } from "@/store";
import { useMutation } from "@tanstack/react-query";
import FormInputField from "@/components/FormInputField";
import SubmitButton from "@/components/SubmitButton";
import { handleKeyDown } from "@/utils/helpers";

/**
 * @memberof Pages.auth.components
 *
 * @description
 * - LogInForm component to handle the user login process.
 * - It includes fields for email/mobile and password.
 * - To handle form events `useForm` hook from `react-hook-form` is used.
 * - Form is rendered using `shadcn Form component`
 * - Validation is applied using Yup resolver and a mutation is triggered upon form submission.
 * - `Reach Query` and `axios` is used for making <b>`POST request`</b>
 * - On successful request user will redirects  to chat or profile page (if profile setup in not completed).
 *
 * @returns {JSX.Element} JSX element representing the LogInForm component.
 */

const LogInForm = () => {
	const navigate = useNavigate();
	const { setUserInfo } = useUserStore();
	const { setProfileId } = useProfileStore();

	// Defining log in form with initial values and validation resolver
	const logInForm = useForm({
		defaultValues: {
			emailOrMobile: "",
			password: "",
		},

		resolver: yupResolver(logInValidationSchema),
	});

	// Mutation hook for handling form submission via an API call using POST method
	const { mutate, isPending } = useMutation({
		mutationFn: (data) => apiClient.post(LOGIN_ROUTE, data),

		// handling successful response
		onSuccess: (response) => {
			const userData = response.data.data;
			if (!userData) {
				toastNotification("info", "Email / Mobile verification is pending");
				localStorage.setItem("isOTPDialogOpen", true);
				navigate("/otp");
			} else {
				setUserInfo(userData);
				setProfileId(userData["_id"]);
				toastNotification("success", response.data.message);
				navigate("/chat");
			}
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

	// OTP login handler
	const handleOTPLogin = () => {
		localStorage.setItem("isOTPDialogOpen", true);
		navigate("/otp");
	};

	return (
		<>
			<Form {...logInForm}>
				<form
					onSubmit={logInForm.handleSubmit(handleSubmit)}
					className="space-y-8"
					onKeyDown={(event) => handleKeyDown(event, isPending)}
				>
					{/* ----------------------------------------------------------
                        *emailOrMobile Field
                        ---------------------------------------------------------- */}

					<FormInputField
						control={logInForm.control}
						name="emailOrMobile"
						placeholder="Enter email or mobile number"
					/>

					{/* ----------------------------------------------------------
                        *Password Field
                        ---------------------------------------------------------- */}

					<FormInputField
						control={logInForm.control}
						name="password"
						type="password"
						placeholder="Enter your password"
					/>

					{/* ----------------------------------------------------------
                        *Submit Button
                        ---------------------------------------------------------- */}
					<SubmitButton isPending={isPending} />
				</form>
			</Form>

			{/* ----------------------------------------------------------
				*OTP Handler
				---------------------------------------------------------- */}

			<div className="mt-3 cursor-pointer" onClick={handleOTPLogin}>
				Log In via OTP
			</div>
		</>
	);
};

export default LogInForm;
