import { Router } from "express";
import { signUp } from "#src/controllers/AuthControllers/signUp.controller";
import { logIn } from "#src/controllers/AuthControllers/logIn.controller";
import { getOTP } from "#src/controllers/AuthControllers/getOTP.controller";
import { validateOTP } from "#src/controllers/AuthControllers/validateOTP.controller";
import { logOut } from "#src/controllers/AuthControllers/logOut.controller";
import { verifyToken } from "#src/middlewares/verifyToken.middleware";
import { getRefreshToken } from "#src/controllers/AuthControllers/getRefreshToken.controller";
import otpRateLimiter from "#src/middlewares/otpRateLimiter.middleware";
import refreshTokenRateLimiter from "#src/middlewares/refreshTokenRateLimiter.middleware";

const authRoutes = Router();

authRoutes.post("/signup", signUp);
authRoutes.post("/login", logIn);
authRoutes.post("/get-otp", otpRateLimiter, getOTP);
authRoutes.post("/otp-validation", otpRateLimiter, validateOTP);
authRoutes.get("/logout", verifyToken, logOut);
authRoutes.get("/refresh-token", refreshTokenRateLimiter, getRefreshToken);

export default authRoutes;
