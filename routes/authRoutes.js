import { getAuthURL, handleOAuthCallback } from "../controllers/authController.js";
import express from "express";

const authRoutes = express.Router();

// Google 로그인 URL 생성
authRoutes.get("/", getAuthURL);

// Google OAuth 로그인 성공 후 콜백
authRoutes.get("/callback", handleOAuthCallback);

export default authRoutes;
