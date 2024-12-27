import {
	AlertDialog,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import SubmitButton from "@/components/SubmitButton";
import FormInputField from "@/components/FormInputField";
import Timer from "@/components/Timer";
import { useEffect, useReducer } from "react";
import OTPInputField from "@/components/OTPInputField";
import { useMutation } from "@tanstack/react-query";
import apiClient from "@/lib/api-client";
import { useProfileStore, useUserStore } from "@/store";
import { useNavigate } from "react-router-dom";
import { GET_OTP_ROUTE, VALIDATE_OTP_ROUTE } from "@/utils/constants";
import { yupResolver } from "@hookform/resolvers/yup";
import EmailOrMobileFieldValidation from "@/validations/EmailOrMobileFieldValidation";
import { handleKeyDown } from "@/utils/helpers";

/**
 * @memberof Pages.auth.components
 *
 * @description
 * - Handles OTP-based authentication and user verification.
 * - Two step form in which user enters email or mobile to receive otp and then otp to verify it.
 * - If system already have email/mobile then jumps to otp field.
 * - To handle form events `useForm` hook from `react-hook-form` is used.
 * - Form is rendered using `shadcn Form component`,
 * - For EmailOrMobile field `Yup` validation in used and for OTP in build shadcn validation is used.
 * - `Reach Query` and `axios` is used for making <b>`POST request`</b> for send otp and otp validation.
 * - For security purpose user is restricted for only one otp call in 30 seconds span.
 *
 *
 * @param {Object} props - Component properties.
 * @param {boolean} props.isOpen - Controls the open state of the dialog.
 * @param {function} props.onClose - Function to close the dialog.
 * @param {string} props.emailOrMobile - The user's email or mobile number.
 *
 * @returns {JSX.Element}  JSX element representing the SignUpForm component.
 *
 */
const OTPHandler = (props) => {
	const { isOpen, onClose, emailOrMobile } = { ...props };

	// OTP validation time in seconds
	const OTP_VALIDATION_TIME = 30; // in sec

	// Reducer Initial state
	const initialState = {
		userEmailOrMobile: emailOrMobile,
		isDisable: Boolean(emailOrMobile),
		timerKey: 0,
	};

	// Reducer function to handle the state changes for OTP handling.
	const reducer = (state, action) => {
		switch (action.type) {
			case "ENABLE_RESEND":
				return { ...state, isDisable: false };
			case "DISABLE_RESEND":
				return { ...state, isDisable: true };
			case "RESET_TIMER":
				return { ...state, timerKey: state.timerKey + 1 };
			case "SET_EMAIL_OR_MOBILE":
				return { ...state, userEmailOrMobile: action.payload };
			default:
				return state;
		}
	};

	const [state, dispatch] = useReducer(reducer, initialState);
	const { setUserInfo } = useUserStore();
	const { setProfileId } = useProfileStore();
	const navigate = useNavigate();

	// Initializing form with default values and validations
	const OTPForm = useForm({
		defaultValues: {
			emailOrMobile: emailOrMobile || "",
			otp: "",
		},

		resolver: yupResolver(EmailOrMobileFieldValidation),
	});

	// Effect to handle the OTP resend button's enable/disable state
	useEffect(() => {
		const resendTimeout = setTimeout(() => {
			dispatch({ type: "ENABLE_RESEND" });
		}, OTP_VALIDATION_TIME * 1000);

		return () => clearTimeout(resendTimeout);
	}, [state.timerKey]);

	// Request to send and validate OTP
	const sendOTPRequest = async (data) => apiClient.post(GET_OTP_ROUTE, data);
	const validateOTP = async (data) => apiClient.post(VALIDATE_OTP_ROUTE, data);

	// Mutation for sending OTP
	const { mutate: sendOTP, isPending: isSendingOTP } = useMutation({
		mutationFn: sendOTPRequest,
		onMutate: () => {
			dispatch({ type: "DISABLE_RESEND" });
		},
		onSuccess: () => {
			dispatch({ type: "RESET_TIMER" });
		},
		onError: () => {
			dispatch({ type: "ENABLE_RESEND" });
		},
	});

	// Mutation for validating OTP
	const { mutate: verifyOTP, isPending: isVerifyingOTP } = useMutation({
		mutationFn: validateOTP,
		onSuccess: (response) => {
			const userData = response.data.data;
			setUserInfo(userData);
			setProfileId(userData["_id"]);
			navigate("/chat");
		},
	});

	// Handle form submission
	const handleSubmit = (data) => {
		if (state.userEmailOrMobile) {
			verifyOTP(data);
		} else {
			dispatch({
				type: "SET_EMAIL_OR_MOBILE",
				payload: data.emailOrMobile,
			});
			sendOTP(data);
		}
	};

	return (
		<AlertDialog open={isOpen} onOpenChange={onClose}>
			<AlertDialogContent>
				{/* ----------------------------------------------------------
					*Alert Header
					---------------------------------------------------------- */}

				<AlertDialogHeader className="flex-row justify-between items-center">
					<AlertDialogTitle>
						{emailOrMobile ? "Verify Email/Mobile" : "Log in via OTP"}
					</AlertDialogTitle>
					<AlertDialogCancel>X</AlertDialogCancel>
				</AlertDialogHeader>

				<AlertDialogDescription className="text-destructive text-xs italic font-semibold">
					{state.userEmailOrMobile && "*Only numerical input is allowed"}
				</AlertDialogDescription>
				<Form {...OTPForm}>
					<form
						className="w-full space-y-6"
						onSubmit={OTPForm.handleSubmit(handleSubmit)}
						onKeyDown={(event) => handleKeyDown(event, isSendingOTP || isVerifyingOTP)}
					>
						{state.userEmailOrMobile ? (
							/* ----------------------------------------------------------
								*OTP field
								---------------------------------------------------------- */

							<>
								<OTPInputField control={OTPForm.control} otpLength={6} />
								<div className="mt-3 ext-base">
									{/* ----------------------------------------------------------
										* Timer Component
										---------------------------------------------------------- */}

									<span className="text-destructive font-bold">
										{"Valid till "}
										<Timer
											startTime={OTP_VALIDATION_TIME}
											key={state.timerKey}
										/>
									</span>

									{/* ----------------------------------------------------------
										* Resend Button
										---------------------------------------------------------- */}

									<Button
										variant="link"
										className="text-blue-600 ps-3"
										onClick={() => {
											sendOTP({
												emailOrMobile: state.userEmailOrMobile,
												isResend: true,
											});
										}}
										disabled={state.isDisable}
									>
										Resend OTP
									</Button>
								</div>

								{/* ----------------------------------------------------------
									* Button to change email/mobile
									---------------------------------------------------------- */}

								<Button
									variant="link"
									className="text-blue-600 text-italic !mt-0 ps-0"
									onClick={() => {
										dispatch({
											type: "SET_EMAIL_OR_MOBILE",
											payload: undefined,
										});
										OTPForm.reset({ otp: "", emailOrMobile: "" });
									}}
								>
									Change email or mobile number
								</Button>
							</>
						) : (
							/* ----------------------------------------------------------
								*Email Or Mobile field
								---------------------------------------------------------- */

							<>
								<FormInputField
									control={OTPForm.control}
									name="emailOrMobile"
									placeholder="Enter email or mobile number"
								/>
								<span>Please enter your email or mobile to receive the otp</span>
							</>
						)}

						{/* ----------------------------------------------------------
							*Submit Button
							---------------------------------------------------------- */}
						<SubmitButton isPending={isSendingOTP || isVerifyingOTP} />
					</form>
				</Form>
			</AlertDialogContent>
		</AlertDialog>
	);
};

export default OTPHandler;
