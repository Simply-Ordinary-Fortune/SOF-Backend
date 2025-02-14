// import dotenv from 'dotenv';
// import { google } from 'googleapis';
// import fs from 'fs';

// dotenv.config();

// // Google OAuth 2.0 클라이언트 생성
// const oAuth2Client = new google.auth.OAuth2(
//   process.env.GOOGLE_CLIENT_ID,
//   process.env.GOOGLE_CLIENT_SECRET,
//   process.env.GOOGLE_REDIRECT_URI
// );

// // Google 로그인 URL 생성 (프론트엔드에서 요청 시 로그인 url을 반환하는 방식으로 수정 가능)
// export const getAuthURL = (req, res) => {
//   try {
//     const authUrl = oAuth2Client.generateAuthUrl({
//       access_type: 'offline', // refresh_token을 받기 위해 'offline' 설정
//       scope: ['https://www.googleapis.com/auth/drive.file'],
//       prompt: 'consent', // 항상 refresh_token을 받을 수 있도록 설정
//     });

//     console.log("Generated Auth URL:", authUrl);
//     // res.json({ authUrl }); // 프론트엔드에 로그인 URL 반환 방식
//     res.redirect(authUrl); // Google 로그인 화면으로 자동 이동 방식
//   } catch (error) {
//     console.error("Error generating auth URL:", error);
//     res.status(500).json({ error: 'Failed to generate authentication URL' });
//   }
// };

// // Google OAuth 콜백 처리 (토큰 저장)
// export const handleOAuthCallback = async (req, res) => {
//   try {
//     const { code } = req.query;
//     if (!code) return res.status(400).json({ error: 'Authorization code is missing' });

//     // 인증 코드로 Access Token & Refresh Token 요청
//     const { tokens } = await oAuth2Client.getToken(code);
//     oAuth2Client.setCredentials(tokens);

//     console.log("Received Tokens:", tokens);

//     // refresh_token 저장 (자동으로 .env의 GOOGLE_REFRESH_TOKEN 필드 업데이트)
//     if (tokens.refresh_token) {
//       const envFilePath = '.env';
//       let envData = fs.readFileSync(envFilePath, 'utf8');

//       // 기존 GOOGLE_REFRESH_TOKEN이 있으면 업데이트, 없으면 추가
//       if (envData.includes('GOOGLE_REFRESH_TOKEN=')) {
//         envData = envData.replace(/^GOOGLE_REFRESH_TOKEN=.*$/m, `GOOGLE_REFRESH_TOKEN=${tokens.refresh_token}`);
//       } else {
//         envData += `\nGOOGLE_REFRESH_TOKEN=${tokens.refresh_token}\n`;
//       }

//       fs.writeFileSync(envFilePath, envData, 'utf8');
//       console.log("Refresh Token saved to .env");
//     }

//     // Access Token을 프론트엔드에 반환 
//     res.json({
//       message: "Authorization successful",
//       accessToken: tokens.access_token,
//       refreshToken: tokens.refresh_token || "No new refresh token received",
//       expiresIn: tokens.expiry_date,
//     });

//   } catch (error) {
//     console.error("OAuth Callback Error:", error);
//     res.status(500).json({ error: "Authorization failed", details: error.message });
//   }
// };

import dotenv from 'dotenv';
import { google } from 'googleapis';
import fs from 'fs';

dotenv.config();

let accessToken = null; // Access Token 저장 변수

// Google OAuth 2.0 클라이언트 생성
const oAuth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

// Google 로그인 URL 생성
export const getAuthURL = (req, res) => {
  try {
    const authUrl = oAuth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: ['https://www.googleapis.com/auth/drive.file'],
      prompt: 'consent',
    });

    console.log("Generated Auth URL:", authUrl);
    res.redirect(authUrl);
  } catch (error) {
    console.error("Error generating auth URL:", error);
    res.status(500).json({ error: 'Failed to generate authentication URL' });
  }
};

// Google OAuth 콜백 처리 (토큰 저장)
export const handleOAuthCallback = async (req, res) => {
  try {
    const { code } = req.query;
    if (!code) return res.status(400).json({ error: 'Authorization code is missing' });

    const { tokens } = await oAuth2Client.getToken(code);
    oAuth2Client.setCredentials(tokens);

    accessToken = tokens.access_token; // Access Token 저장

    console.log("Received Tokens:", tokens);

    if (tokens.refresh_token) {
      const envFilePath = '.env';
      let envData = fs.readFileSync(envFilePath, 'utf8');

      if (envData.includes('GOOGLE_REFRESH_TOKEN=')) {
        envData = envData.replace(/^GOOGLE_REFRESH_TOKEN=.*$/m, `GOOGLE_REFRESH_TOKEN=${tokens.refresh_token}`);
      } else {
        envData += `\nGOOGLE_REFRESH_TOKEN=${tokens.refresh_token}\n`;
      }

      fs.writeFileSync(envFilePath, envData, 'utf8');
      console.log("Refresh Token saved to .env");
    }

    res.json({
      message: "Authorization successful",
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token || "No new refresh token received",
      expiresIn: tokens.expiry_date,
    });

  } catch (error) {
    console.error("OAuth Callback Error:", error);
    res.status(500).json({ error: "Authorization failed", details: error.message });
  }
};

// 저장된 Access Token 반환
export const getAccessToken = (req, res) => {
  if (!accessToken) {
    return res.status(400).json({ error: "No access token available. Please authenticate first." });
  }
  res.json({ accessToken });
};
