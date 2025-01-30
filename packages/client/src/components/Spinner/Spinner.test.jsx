import Spinner from ".";
import { render, screen } from "@testing-library/react";

const testSpinnerElement = ({
	size = "",
	color = "",
	customClass = "w-2 h-2 fill-blue-600",
} = {}) => {
	render(<Spinner size={size} color={color} />);
	const svgElement = screen.getByRole("status").firstChild;
	// screen.debug();
	expect(svgElement).toHaveClass(customClass);
};

describe.only("Spinner Unit Tests", () => {
	// *Test cases with valid props
	test("default render", () => testSpinnerElement());
	test("Spinner with custom color", () =>
		testSpinnerElement({ color: "red-600", customClass: "fill-red-600" }));
	describe("Spinner sizes test", () => {
		test("small size", () => testSpinnerElement("sm", "w-4 h-4"));
		test("medium size", () => testSpinnerElement("md", "w-6 h-6"));
		test("large size", () => testSpinnerElement("lg", "w-8 h-8"));
		test("extra large size", () => testSpinnerElement("xl", "w-10 h-10"));
		test("custom size", () => testSpinnerElement(12, "w-12 h-12"));
	});

	// *Test cases with invalid props
	// ?Here valid output element with default values
	test("Spinner invalid size prop", () => testSpinnerElement({ size: "12" }));
	test("Spinner invalid size prop", () => testSpinnerElement({ size: "xxl" }));

	// *Test cases to showcase drawbacks
	// !It is developers responsibility to provide valid tailwind color
	test("Spinner invalid color prop", () =>
		testSpinnerElement({ color: "abc-600", customClass: "fill-abc-600" }));
});
