import { useContext, useEffect } from "react";
import { SocketContext } from "@/context/SocketContext";

/**
 * @memberof Hooks
 *
 * @function useSocketEventListener
 *
 * @description
 * - Custom hook to listen the socket events emitted by server.
 * - This hook provides the socket instance along with it's validation state flag.
 *
 * @returns {socket} socket instance along with validation flag..
 */
export const useSocketEventListener = (event, callback) => {
	// Access the SocketContext
	const { socket, isSocketValid } = useContext(SocketContext);

	// Function that accept event as string and callback function
	// ? When server emits event that matches to given string it runs given callback function to perform the side-effects
	useEffect(() => {
		if (socket && isSocketValid) {
			socket.on(event, callback);
		}
		// cleanup
		return () => socket?.off(event, callback);
	}, [socket, isSocketValid, event, callback]);
};
