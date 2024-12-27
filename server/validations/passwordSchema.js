import * as Yup from "yup";

const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,})/;

const passwordSchema = Yup.string()
	.required("Password is required")
	.matches(
		passwordRegex,
		"Must Contain 8 Characters, One Uppercase with One Lowercase, One Number and One Special Case Character",
	);

export default passwordSchema;
