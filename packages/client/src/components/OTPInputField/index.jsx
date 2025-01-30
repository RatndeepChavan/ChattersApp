import { memo } from "react";
import {
	FormControl,
	FormDescription,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { REGEXP_ONLY_CHARS, REGEXP_ONLY_DIGITS, REGEXP_ONLY_DIGITS_AND_CHARS } from "input-otp";

/**
 * @memberof Components
 *
 * @description
 * - A controlled component to render an OTP (One-Time Password) input field.
 * - This component supports different OTP types (digits only, chars only, or both).
 *
 * @param {Object} props - The props object for the component.
 * @param {Object} props.control - Control object provided by form libraries (e.g., React Hook Form).
 * @param {number} [props.otpLength=6] - Length of the OTP input.
 * @param {string} [props.otpType="digit"] - Type of OTP allowed ("char", "digit", or "char and digit").
 *
 * @throws {TypeError} Throws an error if the control prop is not provided.
 *
 * @returns {JSX.Element} The memoized OTPInputField component.
 */
const OTPInputField = (props) => {
	const { control, otpLength, otpType } = { ...props };

	// throws an error for control prop
	if (!control) {
		throw new TypeError("The 'control' prop is required.");
	}

	// Map to determine the regular expression
	const regexMap = {
		"char and digit": REGEXP_ONLY_DIGITS_AND_CHARS,
		char: REGEXP_ONLY_CHARS,
		default: REGEXP_ONLY_DIGITS,
	};
	const validationRegex = regexMap[otpType] || regexMap.default;

	return (
		<FormField
			control={control}
			name="otp"
			render={({ field }) => (
				<FormItem>
					<FormLabel>One-Time Password</FormLabel>
					<FormControl>
						{/* OTP input */}
						<InputOTP maxLength={otpLength} pattern={validationRegex} {...field}>
							<InputOTPGroup className="w-full gap-3 justify-around">
								{Array.from({ length: otpLength || 6 }).map((_, i) => (
									<InputOTPSlot key={i} className="w-12 rounded-md" index={i} />
								))}
							</InputOTPGroup>
						</InputOTP>
					</FormControl>
					<FormDescription>
						<span className="mt-3">{`Please enter your one-time password`}</span>
					</FormDescription>
					<FormMessage />
				</FormItem>
			)}
		/>
	);
};

export default memo(OTPInputField);
