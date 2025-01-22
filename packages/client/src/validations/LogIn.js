import * as Yup from "yup";
import EmailOrMobileFieldValidation from "./EmailOrMobileFieldValidation";

// eslint-disable-next-line
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,})/;

export const logInValidationSchema = EmailOrMobileFieldValidation.shape({
	password: Yup.string()
		.required("Password is required")
		.matches(
			passwordRegex,
			"Must Contain 8 Characters, One Uppercase with One Lowercase, One Number and One Special Case Character",
		),
});

export default logInValidationSchema;
