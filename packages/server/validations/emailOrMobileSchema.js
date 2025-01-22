import * as Yup from "yup";

const mobileRegex = /^[789]\d{9}$/; //! Validate only for Indian Mobile number

export const emailOrMobileSchema = Yup.string()
	.required("This field is required")
	.test("email-or-phone", "Must be a valid email or mobile number", function (value) {
		if (!value) return false;

		// Email validation
		const isEmail = Yup.string().email().isValidSync(value);

		// Mobile number validation
		const isMobile = Yup.string().matches(mobileRegex).isValidSync(value);

		return isEmail || isMobile;
	});

export default emailOrMobileSchema;
