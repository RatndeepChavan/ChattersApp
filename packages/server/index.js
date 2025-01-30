import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import mongoose from "mongoose";
import { PORT, DATABASE_URL, ORIGIN } from "./utils/constants.js";
import authRoutes from "./routes/Auth.routes.js";
import userRoutes from "./routes/User.routes.js";
import chatRoutes from "./routes/Chat.routes.js";
import messageRoutes from "./routes/Message.routes.js";
import socketManager from "./socket.js";
import morganMiddleware from "./middlewares/morgan.middleware.js";
import logger from "./utils/logger.js";

const app = express();
app.use(morganMiddleware);

app.use(
	cors({
		origin: ORIGIN,
		methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
		credentials: true,
	}),
);

app.use(cookieParser());
app.use(express.json({ limit: "10mb" }));

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/user", userRoutes);
app.use("/api/v1/chats", chatRoutes);
app.use("/api/v1/message", messageRoutes);

const server = app.listen(PORT, () =>
	logger.info(`server is running at : ${PORT} and request origin must be : ${ORIGIN}`),
);

socketManager.initialize(server);

mongoose
	.connect(DATABASE_URL)
	.then(() => {
		logger.info("Database connected");
	})
	.catch((error) => logger.error(error.message));
