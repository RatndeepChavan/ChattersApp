import { render, screen, waitFor } from "@/test.utils";
import userEvent from "@testing-library/user-event";
import LogInForm from ".";
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
		useMutation: vi.fn().mockResolvedValue({ mutate: vi.fn() }),
	};
});

let mockMutate = vi.fn();

describe("Test cases for LogInForm", () => {
	beforeEach(() => {
		vi.mocked(useMutation).mockImplementation(() => ({
			mutate: mockMutate,
			onValid: vi.fn(),
		}));
	});

	afterEach(() => {
		vi.clearAllMocks();
	});

	//----------------------------------------------------------
	//* Unit Tests
	//----------------------------------------------------------

	describe("Unit tests", () => {
		test("Default render", () => {
			render(<LogInForm />);

			// email or mobile field
			expect(screen.getByRole("textbox")).toBeInTheDocument();

			// password field
			expect(screen.getByPlaceholderText(/enter your password/i)).toBeInTheDocument();

			// Submit button with text "Submit"
			expect(screen.getByText("Submit")).toHaveTextContent(/^Submit$/);

			// Login via OTP
			expect(screen.getByText("Login via OTP")).toHaveTextContent(/^Login via OTP$/);

			// Spinner element
			expect(screen.queryByRole("status")).not.toBeInTheDocument();
		});

		test("Rendering when isPending is true", () => {
			useMutation.mockReturnValue({ mutate: vi.fn(), isPending: true });
			render(<LogInForm />);

			// Submit button with text "Submitting..."
			expect(screen.getByText("Submitting...")).toHaveTextContent(/^Submitting...$/);

			//Spinner Element
			const spinnerElement = screen.getByRole("status");
			expect(spinnerElement).toBeInTheDocument();
		});
	});

	//----------------------------------------------------------
	//* Integration Tests
	//----------------------------------------------------------

	describe("Integration tests", () => {
		test("Testing validation errors if empty form is submitted", async () => {
			const user = userEvent.setup();
			render(<LogInForm />);

			// Clicking on submit button
			const submitButton = screen.getByText("Submit");
			await user.pointer({ target: submitButton, keys: "[MouseLeft]" });
			// screen.debug();

			// Email or Mobile filed validation
			expect(screen.getByText("This field is required")).toBeInTheDocument();

			// Password field validation
			expect(screen.getByText("Password is required")).toBeInTheDocument();
		});
	});
	//! modal opens when click on login via otp

	//----------------------------------------------------------
	//* E2E Tests
	//----------------------------------------------------------

	describe("E2E tests", () => {
		test("Testing field validation error for invalid user input", async () => {
			const user = userEvent.setup();
			render(<LogInForm />);

			// email or mobile field
			const emailOrMobileInput = screen.getByRole("textbox");
			await user.type(emailOrMobileInput, "email");

			// Invalid password input
			const passwordInput = screen.getByPlaceholderText(/enter your password/i);
			await user.type(passwordInput, "password");

			// Clicking submit
			const submitButton = screen.getByText("Submit");
			await user.pointer({ target: submitButton, keys: "[MouseLeft]" });
			// screen.debug();

			// Email or Mobile filed validation
			expect(screen.getByText("Must be a valid email or mobile number")).toBeInTheDocument();

			// Password field validation
			expect(
				screen.getByText(
					"Must Contain 8 Characters, One Uppercase with One Lowercase, One Number and One Special Case Character",
				),
			).toBeInTheDocument();
		});

		test("Successful form submission", async () => {
			const user = userEvent.setup();
			render(<LogInForm />);

			// Email or mobile field
			const emailOrMobileInput = screen.getByRole("textbox");
			await user.type(emailOrMobileInput, "em@em.em");

			// Password input
			const passwordInput = screen.getByPlaceholderText(/enter your password/i);
			await user.type(passwordInput, "Pa@123456");

			// Clicking submit
			const submitButton = screen.getByText("Submit");
			await user.pointer({ target: submitButton, keys: "[MouseLeft]" });

			// Expect the mutation to be called
			await waitFor(() => {
				expect(mockMutate).toHaveBeenCalled();
			});
		});
	});
});
