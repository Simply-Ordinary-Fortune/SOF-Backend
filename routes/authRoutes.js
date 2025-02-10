import express from 'express';
import { getAuthURL, handleOAuthCallback } from '../../controllers/authController.js';

const authRoutes = express.Router();

// Google 로그인 URL 생성
authRoutes.get('/auth', getAuthURL);

// Google OAuth 로그인 성공 후 콜백
authRoutes.get('/auth/callback', handleOAuthCallback);

export default authRoutes;
