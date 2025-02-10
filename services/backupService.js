import { db } from '../models/database.js';

// 레코드(record) 테이블에 데이터 저장
export const createRecord = async ({ userId, content, sourceFile }) => {
  const query = `
    INSERT INTO record (userId, content, sourceFile, syncStatus, createdAt, updatedAt)
    VALUES (?, ?, ?, 'SUCCESS', NOW(), NOW());
  `;

  const [result] = await db.query(query, [userId, content, sourceFile]);
  return result.insertId;
};

// 메시지(bottlemessage) 테이블에 데이터 저장
export const createMessage = async ({ senderId, receiverId, message, sourceFile, imageUrl }) => {
  const query = `
    INSERT INTO bottlemessage (senderId, receiverId, message, sourceFile, syncStatus, sentAt, updatedAt, imageUrl, isRead)
    VALUES (?, ?, ?, ?, 'SUCCESS', NOW(), NOW(), ?, 0);
  `;

  const [result] = await db.query(query, [senderId, receiverId, message, sourceFile, imageUrl]);
  return result.insertId;
};

// record(기록) 테이블에서 파일 조회
export const getFileById = async (fileId) => {
  const [rows] = await db.query("SELECT * FROM record WHERE id = ?", [fileId]);
  return rows.length > 0 ? rows[0] : null;
};

// bottlemessage(메시지) 테이블에서 파일 조회
export const getMessageById = async (fileId) => {
  const [rows] = await db.query("SELECT * FROM bottlemessage WHERE id = ?", [fileId]);
  return rows.length > 0 ? rows[0] : null;
};

// Google Drive에서 다운로드한 파일을 DB의 record 테이블에 데이터 복원
export const restoreRecord = async (fileData) => {
  const { userId, content, sourceFile } = fileData;

  const query = `
    INSERT INTO record (userId, content, sourceFile, syncStatus, createdAt, updatedAt)
    VALUES (?, ?, ?, 'SUCCESS', NOW(), NOW())
    ON DUPLICATE KEY UPDATE
      content = VALUES(content),
      sourceFile = VALUES(sourceFile),
      syncStatus = 'SUCCESS',
      updatedAt = NOW();
  `;

  const [result] = await db.query(query, [userId, content, sourceFile]);
  return result.insertId;
};

// bottlemessage 테이블에 데이터 복원
export const restoreMessage = async (fileData) => {
  const { senderId, receiverId, message, sourceFile, imageUrl } = fileData;

  const query = `
    INSERT INTO bottlemessage (senderId, receiverId, message, sourceFile, syncStatus, sentAt, updatedAt, imageUrl, isRead)
    VALUES (?, ?, ?, ?, 'SUCCESS', NOW(), NOW(), ?, 0)
    ON DUPLICATE KEY UPDATE
      message = VALUES(message),
      sourceFile = VALUES(sourceFile),
      syncStatus = 'SUCCESS',
      updatedAt = NOW(),
      imageUrl = VALUES(imageUrl),
      isRead = 0;
  `;

  const [result] = await db.query(query, [senderId, receiverId, message, sourceFile, imageUrl]);
  return result.insertId;
};
