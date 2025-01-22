import { Router } from "express";
import { verifyToken } from "#src/middlewares/verifyToken.middleware";
import { getUserInfo } from "#src/controllers/UserControllers/getUserInfo.controller";
import { getProfileInfo } from "#src/controllers/UserControllers/getProfileInfo.controller";
import { updateUser } from "#src/controllers/UserControllers/updateUser.controller";
import { getSearchedUsers } from "#src/controllers/UserControllers/getSearchedUsers.controller";

const userRoutes = Router();

userRoutes.get("/user-info", verifyToken, getUserInfo);
userRoutes.post("/profile-info", verifyToken, getProfileInfo);
userRoutes.post("/update-user-details", verifyToken, updateUser);
userRoutes.post("/get-users", verifyToken, getSearchedUsers);

export default userRoutes;
