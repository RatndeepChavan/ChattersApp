import { Server as SocketIOServer } from "socket.io";
import { ORIGIN } from "#src/utils/constants";
import logger from "#src/utils/logger";

/**
 * @class SocketManager
 * @description Singleton class to manage WebSocket connections and operations using Socket.IO.
 */
class SocketManager {
	/** Singleton instance of SocketManager */
	static #instance = null;

	/** Socket.IO server instance */
	#io = null;

	/** Maintains O(1) lookup for user to socket ID mapping. */
	#userSocketMap = new Map();

	/** Maintains O(1) lookup for socket to user ID mapping. */
	#socketUserMap = new Map();

	//? As socket responsible for real time updates time is crucial so keep two map to avoid loop and perform the operation with O(1)

	/**
	 * @constructor
	 * @throws {Error} Throws an error if attempting to instantiate directly when already initiated.
	 */
	constructor() {
		// Prevent multiple instances of the SocketManager singleton.
		if (SocketManager.#instance) {
			throw new Error("Already initiated, use getInstance method to access it.");
		}
		SocketManager.#instance = this;
	}

	/**
	 * @static
	 * @method getInstance
	 * @returns {SocketManager} Returns the singleton instance of SocketManager.
	 */
	static getInstance() {
		// Instantiate the singleton instance if it doesn't already exist.
		if (!SocketManager.#instance) {
			SocketManager.#instance = new SocketManager();
		}
		return SocketManager.#instance;
	}

	/**
	 * Initializes the Socket.IO server.
	 * @param {Server} server The HTTP server instance to attach the Socket.IO server to.
	 */
	initialize(server) {
		this.#io = new SocketIOServer(server, {
			cors: {
				origin: ORIGIN,
				methods: ["GET", "POST"],
				credentials: true,
			},
		});

		// Listen for incoming connections and handle them.
		this.#io.on("connection", (socket) => this.handleConnection(socket));
	}

	/**
	 * Handles a new WebSocket connection.
	 * @param {Socket} socket The connected socket instance.
	 */
	handleConnection(socket) {
		// Extract the userId from the handshake query.
		const userId = socket.handshake.query.userId;

		if (userId) {
			// Map the userId to the socketId for quick lookups.
			this.#userSocketMap.set(userId, socket.id);

			// Map the socketId to the userId for quick lookups.
			this.#socketUserMap.set(socket.id, userId);
		} else {
			// Log an error if userId is not provided.
			logger.error("User ID not found");
		}

		// Handle socket disconnection event.
		socket.on("disconnect", () => this.handleDisconnect(socket.id, userId));
	}

	/**
	 * Handles a WebSocket disconnection.
	 * @param {string} socketId The ID of the disconnected socket.
	 * @param {string} userId The ID of the user associated with the socket.
	 */
	handleDisconnect(socketId, userId) {
		if (userId) {
			// Remove mappings for the disconnected user and socket.
			this.#userSocketMap.delete(userId);
			this.#socketUserMap.delete(socketId);
		}
	}

	/**
	 * Emits an event to a specific user.
	 * @param {string} userId The user ID to whom the event is to be emitted.
	 * @param {string} eventName The name of the event to emit.
	 * @param {event} eventData The data to send with the event.
	 */
	emitEvent(userId, eventName, eventData) {
		// Retrieve the socket ID for the user.
		const socketId = this.#userSocketMap.get(userId);

		// Emit the event to the specified socket ID.
		if (socketId) this.#io.to(socketId).emit(eventName, eventData);
	}
}

// Create and export the singleton instance of SocketManager.
const socketManager = SocketManager.getInstance();
export default socketManager;
