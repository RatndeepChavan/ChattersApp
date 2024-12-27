import * as Yup from "yup";

const otpRegex = /\d{6}$/;

export const otpSchema = Yup.string()
	.required("This field is required")
	.matches(otpRegex, "Otp must be exact 6 digit long");

export default otpSchema;
