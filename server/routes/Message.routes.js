import { getConversation } from "#src/controllers/MessageControllers/GetConversation.controller";
import { updateConversation } from "#src/controllers/MessageControllers/updateConversation.controller";
import { updateReadState } from "#src/controllers/MessageControllers/updateReadState.controller";
import { verifyToken } from "#src/middlewares/verifyToken.middleware";
import { Router } from "express";

const messageRoutes = Router();

messageRoutes.post("/get-conversation", verifyToken, getConversation);
messageRoutes.post("/update-conversation", verifyToken, updateConversation);
messageRoutes.post("/update-read-state", verifyToken, updateReadState);

export default messageRoutes;
