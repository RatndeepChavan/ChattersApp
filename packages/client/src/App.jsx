import CustomClientProvider from "@/providers/CustomClientProvider";
import CustomRouterProvider from "@/providers/CustomRouterProvider";

/**
 * @namespace App
 */

/**
 * @description
 * Main application component that handles routing and query client provider.
 *
 * @returns {JSX.Element} App component.
 */
function App() {
	return (
		<CustomClientProvider>
			<CustomRouterProvider />
		</CustomClientProvider>
	);
}

export default App;
