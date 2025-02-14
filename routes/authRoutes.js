import { getAuthURL, handleOAuthCallback, saveAuthCode } from "../controllers/authController.js";
import express from "express";

const authRoutes = express.Router();

// Google 로그인 URL 생성
authRoutes.get("/", getAuthURL);

// 프론트에서 OAuth 인증 후 받은 code를 백엔드에 전달하는 엔드포인트
// authRoutes.post("/code", saveAuthCode);


// Google OAuth 로그인 성공 후 콜백
authRoutes.get("/callback", handleOAuthCallback);

export default authRoutes;
