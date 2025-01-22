import { render, screen, act } from "@testing-library/react";
import Timer from "@/components/Timer";
import { sleep } from "@/utils/helpers";

// ------------------------------------------------------------------------
// Unit Tests of Timer Component
// ------------------------------------------------------------------------

describe("Unit tests for Timer component", () => {
	test("Default rendering", () => {
		render(<Timer startTime={0} />);
		expect(screen.getByText(/00:00/i)).toBeInTheDocument();
		// screen.debug();
		// screen.logTestingPlaygroundURL();
	});
	test("Time format in mm:ss", () => {
		// Setting up fake timer
		vi.useFakeTimers();

		// initial time 2 min
		render(<Timer startTime={120} />);
		expect(screen.getByText(/02:00/i)).toBeInTheDocument();

		// 5 seconds forward
		act(() => vi.advanceTimersByTime(5000));
		expect(screen.getByText(/01:55/i)).toBeInTheDocument();

		// 5 seconds forward
		act(() => vi.advanceTimersByTime(5000));
		expect(screen.getByText(/01:50/i)).toBeInTheDocument();

		// 42 seconds forward
		act(() => vi.advanceTimersByTime(42000));
		expect(screen.getByText(/01:08/i)).toBeInTheDocument();

		// 8 seconds forward
		act(() => vi.advanceTimersByTime(8000));
		expect(screen.getByText(/01:00/i)).toBeInTheDocument();

		// 5 seconds forward
		act(() => vi.advanceTimersByTime(5000));
		expect(screen.getByText(/00:55/i)).toBeInTheDocument();

		// 5 seconds forward
		act(() => vi.advanceTimersByTime(5000));
		expect(screen.getByText(/00:50/i)).toBeInTheDocument();

		// 42 seconds forward
		act(() => vi.advanceTimersByTime(42000));

		// 8 seconds forward
		expect(screen.getByText(/00:08/i)).toBeInTheDocument();

		// 10 seconds forward
		// ?After 00:00 no further decrement
		act(() => vi.advanceTimersByTime(10000));
		expect(screen.getByText(/00:00/i)).toBeInTheDocument();

		// Resetting real timer
		vi.useRealTimers();

		// screen.debug();
	});
});
