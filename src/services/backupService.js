import { db } from '../models/database.js';

// 레코드(Record) 테이블에 데이터 저장
export const createRecord = async ({ userId, content, sourceFile, imageUrl, tags }) => {
  const query = `
    INSERT INTO Record (userId, content, sourceFile, imageUrl, tags, syncStatus)
    VALUES (?, ?, ?, ?, ?, 'PENDING');
  `;

  const [result] = await db.query(query, [userId, content, sourceFile, imageUrl, JSON.stringify(tags)]);
  return result.insertId;
};

// 메시지(BottleMessage) 테이블에 데이터 저장
export const createMessage = async ({ senderId, receiverId, message, sourceFile }) => {
  const query = `
    INSERT INTO BottleMessage (senderId, receiverId, message, sourceFile, syncStatus)
    VALUES (?, ?, ?, ?, 'PENDING');
  `;

  const [result] = await db.query(query, [senderId, receiverId, message, sourceFile]);
  return result.insertId;
};


// Record(기록) 테이블에서 파일 조회
export const getFileById = async (fileId) => {
  const [rows] = await db.query("SELECT * FROM Record WHERE id = ?", [fileId]);
  return rows.length > 0 ? rows[0] : null;
};

// BottleMessage(메시지) 테이블에서 파일 조회
export const getMessageById = async (fileId) => {
  const [rows] = await db.query("SELECT * FROM BottleMessage WHERE id = ?", [fileId]);
  return rows.length > 0 ? rows[0] : null;
};


// Google Drive에서 다운로드한 파일을 DB의 Record 테이블에 데이터 복원

export const restoreRecord = async (fileData) => {
  const { userId, content, sourceFile, imageUrl, tags } = fileData;

  const query = `
    INSERT INTO Record (userId, content, sourceFile, imageUrl, tags, syncStatus, createdAt, updatedAt)
    VALUES (?, ?, ?, ?, ?, 'SUCCESS', NOW(), NOW())
    ON DUPLICATE KEY UPDATE
      content = VALUES(content),
      sourceFile = VALUES(sourceFile),
      imageUrl = VALUES(imageUrl),
      tags = VALUES(tags),
      syncStatus = 'SUCCESS',
      updatedAt = NOW();
  `;

  const [result] = await db.query(query, [userId, content, sourceFile, imageUrl, JSON.stringify(tags)]);
  return result.insertId;
};

// BottleMessage 테이블에 데이터 복원
export const restoreMessage = async (fileData) => {
  const { senderId, receiverId, message, sourceFile } = fileData;

  const query = `
    INSERT INTO BottleMessage (senderId, receiverId, message, sourceFile, syncStatus, sentAt, updatedAt)
    VALUES (?, ?, ?, ?, 'SUCCESS', NOW(), NOW())
    ON DUPLICATE KEY UPDATE
      message = VALUES(message),
      sourceFile = VALUES(sourceFile),
      syncStatus = 'SUCCESS',
      updatedAt = NOW();
  `;

  const [result] = await db.query(query, [senderId, receiverId, message, sourceFile]);
  return result.insertId;
};