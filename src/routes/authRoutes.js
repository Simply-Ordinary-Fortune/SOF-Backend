import dotenv from 'dotenv'; // 환경 변수(.env) 로드를 위한 dotenv 패키지
dotenv.config(); 

import express from 'express';
import { google } from 'googleapis';
import { getOrCreateUser, saveUserTokens } from '../services/authService.js'; // 사용자 데이터베이스 처리 모듈

const authRoutes = express.Router(); // Express 라우터 생성

// ✅ OAuth 2.0 클라이언트 생성 (Google API 사용)
const oAuth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,  // Google API 클라이언트 ID
  process.env.GOOGLE_CLIENT_SECRET,  // 클라이언트 비밀키
  process.env.GOOGLE_REDIRECT_URI // OAuth 인증 후 리디렉트될 URI
);

// ✅ Google 로그인 URL 생성 함수 (가독성 개선)
const generateGoogleAuthUrl = () => {
  const scopes = [
    'https://www.googleapis.com/auth/drive.file', // Google Drive 파일 권한 (파일 업로드 및 관리)
  ];

  return oAuth2Client.generateAuthUrl({
    access_type: 'offline', // refresh_token을 발급받기 위해 offline 접근 필요
    scope: scopes,
    prompt: 'consent', // 항상 사용자 동의를 받도록 설정 (동일한 계정으로 재로그인 가능)
  });
};

// 1️⃣ Google 로그인 URL 생성 및 리다이렉트
authRoutes.get('/auth', (req, res) => {
  try {
    const authUrl = generateGoogleAuthUrl();
    console.log("🔗 Generated Auth URL:", authUrl); // ✅ 디버깅용 로그
    res.redirect(authUrl); // Google 로그인 페이지로 이동
  } catch (error) {
    console.error("❌ Error during Google OAuth callback:", error.stack);
    res.status(500).json({ 
        error: 'Authorization failed', 
        details: error.message // 👈 상세 오류 메시지 포함
    });
}

});

// // 2️⃣ OAuth 인증 후, 사용자 정보 조회 및 토큰 저장
authRoutes.get('/auth/callback', async (req, res) => {
  try {
    const code = req.query.code;
    if (!code) throw new Error("Authorization code is missing");

    // 🔹 인증 코드로 액세스 토큰 교환
    const { tokens } = await oAuth2Client.getToken(code);

    console.log("🔑 Received Tokens:", tokens);  // ✅ Access Token 확인

    if (!tokens.access_token) {
      throw new Error("Access token is missing from Google's response");
    }

    // 🔹 OAuth2Client 객체에 인증 정보 설정
    oAuth2Client.setCredentials(tokens);

    console.log("✅ Updated Credentials:", oAuth2Client.credentials); // ✅ 확인

    // 🔹 Google Drive API 테스트 요청
    const drive = google.drive({ version: "v3", auth: oAuth2Client });

    const driveFiles = await drive.files.list();
    console.log("📂 Drive Files:", driveFiles.data);

    res.status(200).json({ message: 'Authorization successful', driveFiles: driveFiles.data });
  } catch (error) {
    console.error("❌ Error during Google OAuth callback:", error.stack);
    res.status(500).json({ error: 'Authorization failed', details: error.message });
  }
});



export default authRoutes;
