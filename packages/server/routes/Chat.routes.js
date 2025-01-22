import { Router } from "express";
import { verifyToken } from "#src/middlewares/verifyToken.middleware";
import { initiateChat } from "#src/controllers/ChatControllers/initiateChat.controller";
import { chatNotifications } from "#src/controllers/ChatControllers/notification.controller";
import { feedbackHandler } from "#src/controllers/ChatControllers/feedbackHandler.controller";
import { deleteNotification } from "#src/controllers/ChatControllers/deleteNotification.controller";
import { getChats } from "#src/controllers/ChatControllers/getChats.controller";

const chatRoutes = Router();

chatRoutes.get("/get-notifications", verifyToken, chatNotifications);
chatRoutes.get("/get-chats", verifyToken, getChats);
chatRoutes.post("/send-request", verifyToken, initiateChat);
chatRoutes.post("/request-feedback", verifyToken, feedbackHandler);
chatRoutes.delete("/delete-notification", verifyToken, deleteNotification);

export default chatRoutes;
