import { render } from "@testing-library/react";
import CustomClientProvider from "@/providers/CustomClientProvider";
import CustomRouterProvider from "@/providers/CustomRouterProvider";

const customRender = (ui, options) =>
	render(ui, {
		wrapper: CustomClientProvider,
		CustomRouterProvider,
		...options,
	});

// re-export everything
export * from "@testing-library/react";

// override render method
export { customRender as render };
