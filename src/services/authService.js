import { db } from '../models/database.js'; // MySQL 연결

// 사용자 ID 조회 또는 생성
export const getOrCreateUser = async (email) => {
  const [user] = await db.query('SELECT id FROM User WHERE email = ?', [email]);
  let userId;

  if (user.length === 0) {
    // 새로운 사용자 추가
    const result = await db.query(
      'INSERT INTO User (email, createdAt, updatedAt) VALUES (?, NOW(), NOW())',
      [email]
    );
    userId = result[0].insertId;
  } else {
    userId = user[0].id;
  }

  return userId;
};

// 사용자 토큰 저장 또는 업데이트
export const saveUserTokens = async (userId, tokens) => {
  const query = `
    INSERT INTO UserTokens (userId, accessToken, refreshToken, tokenExpiry, createdAt, updatedAt)
    VALUES (?, ?, ?, ?, NOW(), NOW())
    ON DUPLICATE KEY UPDATE
      accessToken = VALUES(accessToken),
      refreshToken = IFNULL(VALUES(refreshToken), refreshToken),
      tokenExpiry = VALUES(tokenExpiry),
      updatedAt = NOW();
  `;

  await db.query(query, [
    userId,
    tokens.access_token,
    tokens.refresh_token || null, // refresh_token이 없는 경우 NULL 저장
    new Date(tokens.expiry_date), // access_token 만료 시간
  ]);
};
