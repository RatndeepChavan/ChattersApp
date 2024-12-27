import * as Yup from "yup";
import logInValidationSchema from "./LogIn";

const signUpValidationSchema = logInValidationSchema.shape({
	confirmPassword: Yup.string()
		.required("Please re-enter your password")
		.oneOf([Yup.ref("password"), null], "Password must match"),
});

export default signUpValidationSchema;
