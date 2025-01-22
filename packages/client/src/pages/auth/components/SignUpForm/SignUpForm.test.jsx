import { render, screen, waitFor } from "@/test.utils";
import userEvent from "@testing-library/user-event";
import SignUpForm from ".";
import { useMutation } from "@tanstack/react-query";

vi.mock("react-router-dom", () => ({
	useNavigate: vi.fn(),
}));

vi.mock("@/store", () => ({
	useUserStore: vi.fn().mockReturnValue({ setUserInfo: vi.fn() }),
}));

vi.mock("@/utils/helpers", () => ({
	toastNotification: vi.fn(),
}));

vi.mock(import("@tanstack/react-query"), async (importOriginal) => {
	const mod = await importOriginal();
	return {
		...mod,
		useMutation: vi.fn().mockReturnValue({ mutate: vi.fn(), isPending: false }),
	};
});

// vi.mock(import("react-hook-form"), async (importOriginal) => {
// 	const mod = await importOriginal();
// 	return {
// 		...mod,
// 		useForm: vi.fn(),
// 	};
// });
let mockMutate = vi.fn();
describe("Test cases for SignUpForm Component", () => {
	beforeEach(() => {
		// Mock useMutation behavior
		vi.mocked(useMutation).mockImplementation(() => ({
			mutate: mockMutate,
			onValid: vi.fn(),
			isLoading: false,
		}));
	});

	afterEach(() => {
		vi.clearAllMocks();
	});

	// ------------------------------------------------------------------------
	// Unit Tests of SignUpForm Component
	// ------------------------------------------------------------------------

	describe("Unit tests", () => {
		test("default render", () => {
			render(<SignUpForm />);
			// screen.debug()
			// screen.logTestingPlaygroundURL();

			// email or mobile field
			expect(screen.getByRole("textbox")).toBeInTheDocument();

			// password field
			expect(screen.getByPlaceholderText(/enter your password/i)).toBeInTheDocument();

			// confirm password field
			expect(screen.getByPlaceholderText(/enter password again/i)).toBeInTheDocument();

			// Submit button with text "Submit"
			expect(screen.getByRole("button")).toHaveTextContent(/^Submit$/); // to match the whole content

			// Spinner element
			expect(screen.queryByRole("status")).not.toBeInTheDocument();
		});

		test("Rendering when isPending is true", () => {
			useMutation.mockReturnValue({ isPending: true });
			render(<SignUpForm />);
			// screen.debug()

			// Submit button with text "Submitting..."
			expect(screen.getByRole("button")).toHaveTextContent(/^Submitting...$/);

			//Spinner Element
			const spinnerElement = screen.getByRole("status");
			expect(spinnerElement).toBeInTheDocument();
		});
	});

	// ------------------------------------------------------------------------
	// Integration Tests of SignUpForm Component
	// ------------------------------------------------------------------------

	describe("Integration tests", () => {
		test("Testing validation errors if empty form is submitted", async () => {
			const user = userEvent.setup();
			render(<SignUpForm />);

			// Clicking on submit button
			const submitButton = screen.getByRole("button");
			await user.pointer({ target: submitButton, keys: "[MouseLeft]" });
			// screen.debug();

			// Email or Mobile filed validation
			expect(screen.getByText("This field is required")).toBeInTheDocument();

			// Password field validation
			expect(screen.getByText("Password is required")).toBeInTheDocument();

			// Confirm password field validation
			expect(screen.getByText("Please re-enter your password")).toBeInTheDocument();
		});
	});

	// ------------------------------------------------------------------------
	// E2E Tests of SignUpForm Component
	// ------------------------------------------------------------------------

	describe("E2E tests", () => {
		test("Testing field validation error for invalid user input", async () => {
			const user = userEvent.setup();
			render(<SignUpForm />);

			// email or mobile field
			const emailOrMobileInput = screen.getByRole("textbox");
			await user.type(emailOrMobileInput, "email");

			// Invalid password input
			const passwordInput = screen.getByPlaceholderText(/enter your password/i);
			await user.type(passwordInput, "password");

			// Clicking submit
			const submitButton = screen.getByRole("button");
			await user.pointer({ target: submitButton, keys: "[MouseLeft]" });

			// Email or Mobile filed validation
			expect(screen.getByText("Must be a valid email or mobile number")).toBeInTheDocument();

			// Password field validation
			expect(
				screen.getByText(
					"Must Contain 8 Characters, One Uppercase with One Lowercase, One Number and One Special Case Character",
				),
			).toBeInTheDocument();
		});

		test("Password and Confirm password must match", async () => {
			const user = userEvent.setup();
			render(<SignUpForm />);

			// Valid password input
			const passwordInput = screen.getByPlaceholderText(/enter your password/i);
			await user.type(passwordInput, "Pa@123456");

			// Invalid Confirm password input
			const confirmPasswordInput = screen.getByPlaceholderText(/enter password again/i);
			await user.type(confirmPasswordInput, "password");

			// Clicking submit
			const submitButton = screen.getByRole("button");
			await user.pointer({ target: submitButton, keys: "[MouseLeft]" });

			// Confirm password field validation
			expect(screen.getByText("Password must match")).toBeInTheDocument();
		});

		test("Successful form submission", async () => {
			const user = userEvent.setup();
			render(<SignUpForm />);

			// email or mobile field
			const emailOrMobileInput = screen.getByRole("textbox");
			await user.type(emailOrMobileInput, "em@em.em");

			// Password input
			const passwordInput = screen.getByPlaceholderText(/enter your password/i);
			await user.type(passwordInput, "Pa@123456");

			// Confirm password input
			const confirmPasswordInput = screen.getByPlaceholderText(/enter password again/i);
			await user.type(confirmPasswordInput, "Pa@123456");

			// Clicking submit
			const submitButton = screen.getByRole("button");
			await user.pointer({ target: submitButton, keys: "[MouseLeft]" });

			// Expect the mutation to be called
			await waitFor(() => {
				expect(mockMutate).toHaveBeenCalled();
			});
		});
	});
});
