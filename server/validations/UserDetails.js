import * as Yup from "yup";

export const detailsValidationSchema = Yup.object().shape({
	username: Yup.string().required("Username is required"),
	status: Yup.string(),
});

export default detailsValidationSchema;
