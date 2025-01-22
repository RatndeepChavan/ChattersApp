import { useUserStore } from "@/store";
import { HOST } from "@/utils/constants";
import { createContext, useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";

// Creating a Context for the socket with initial state as null.
export const SocketContext = createContext(null);

/**
 * @memberof Context
 *
 * @function SocketProvider
 *
 * @description
 * - SocketProvider with custom socket logic for real time updates.
 * - It has basic error handling with retry logic.
 * - Depends on userInfo as it uses user's Id for query with authentication credentials.
 *
 * @param {object} props - The properties for ThemeProvider component.
 * @param {React.ReactNode} props.children - The children components wrapped by ThemeProvider.
 *
 * @returns {JSX.Element} SocketProvider - SocketProvider socket context that handle real time events.
 */

// eslint-disable-next-line
export const SocketProvider = ({ children }) => {
	// User data that manage by zustand
	const { userInfo } = useUserStore();

	// Reference to keep track of socket updates without re-render
	const socket = useRef();

	// State to check if socket is valid (basically keep track of is socket is connected)
	const [isSocketValid, setIsSocketValid] = useState(false);

	// Handle socket connection and disconnect events
	useEffect(() => {
		if (userInfo) {
			socket.current = io(HOST, {
				withCredentials: true,
				query: { userId: userInfo["_id"] },
			});

			// connect
			socket.current.on("connect", () => {
				setIsSocketValid(true);
				console.log("Connected to socket server");
			});

			// Handle errors
			socket.current.on("connect_error", (error) => {
				setIsSocketValid(false);
				console.error("Connection Error:", error.message);
			});

			socket.current.on("error", (error) => {
				setIsSocketValid(false);
				console.error("Socket Error:", error.message);
			});

			// retry on disconnect
			socket.current.on("disconnect", (reason) => {
				setIsSocketValid(false);
				if (reason === "io server disconnect") {
					socket.current.connect();
				}
				console.log("Disconnected from socket server:", reason);
			});

			// cleanup
			return () => socket.current.disconnect();
		}
	}, [userInfo]);

	// Providing the socket context value to the child components.
	return (
		<SocketContext.Provider value={{ socket: socket.current, isSocketValid }}>
			{children}
		</SocketContext.Provider>
	);
};
