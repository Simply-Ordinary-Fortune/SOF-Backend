// import { db } from '../models/database.js';

// // 레코드(record) 테이블에 데이터 저장
// export const createRecord = async ({ userId, content, sourceFile }) => {
//   const query = `
//     INSERT INTO record (userId, content, sourceFile, syncStatus, createdAt, updatedAt)
//     VALUES (?, ?, ?, 'SUCCESS', NOW(), NOW());
//   `;

//   const [result] = await db.query(query, [userId, content, sourceFile]);
//   return result.insertId;
// };

// // 메시지(bottlemessage) 테이블에 데이터 저장
// export const createMessage = async ({ senderId, receiverId, message, sourceFile, imageUrl }) => {
//   const query = `
//     INSERT INTO bottlemessage (senderId, receiverId, message, sourceFile, syncStatus, sentAt, updatedAt, imageUrl, isRead)
//     VALUES (?, ?, ?, ?, 'SUCCESS', NOW(), NOW(), ?, 0);
//   `;

//   const [result] = await db.query(query, [senderId, receiverId, message, sourceFile, imageUrl]);
//   return result.insertId;
// };

// // record(기록) 테이블에서 파일 조회
// export const getFileById = async (fileId) => {
//   const [rows] = await db.query("SELECT * FROM record WHERE id = ?", [fileId]);
//   return rows.length > 0 ? rows[0] : null;
// };

// // bottlemessage(메시지) 테이블에서 파일 조회
// export const getMessageById = async (fileId) => {
//   const [rows] = await db.query("SELECT * FROM bottlemessage WHERE id = ?", [fileId]);
//   return rows.length > 0 ? rows[0] : null;
// };

// // Google Drive에서 다운로드한 파일을 DB의 record 테이블에 데이터 복원
// export const restoreRecord = async (fileData) => {
//   const { userId, content, sourceFile } = fileData;

//   const query = `
//     INSERT INTO record (userId, content, sourceFile, syncStatus, createdAt, updatedAt)
//     VALUES (?, ?, ?, 'SUCCESS', NOW(), NOW())
//     ON DUPLICATE KEY UPDATE
//       content = VALUES(content),
//       sourceFile = VALUES(sourceFile),
//       syncStatus = 'SUCCESS',
//       updatedAt = NOW();
//   `;

//   const [result] = await db.query(query, [userId, content, sourceFile]);
//   return result.insertId;
// };

// // bottlemessage 테이블에 데이터 복원
// export const restoreMessage = async (fileData) => {
//   const { senderId, receiverId, message, sourceFile, imageUrl } = fileData;

//   const query = `
//     INSERT INTO bottlemessage (senderId, receiverId, message, sourceFile, syncStatus, sentAt, updatedAt, imageUrl, isRead)
//     VALUES (?, ?, ?, ?, 'SUCCESS', NOW(), NOW(), ?, 0)
//     ON DUPLICATE KEY UPDATE
//       message = VALUES(message),
//       sourceFile = VALUES(sourceFile),
//       syncStatus = 'SUCCESS',
//       updatedAt = NOW(),
//       imageUrl = VALUES(imageUrl),
//       isRead = 0;
//   `;

//   const [result] = await db.query(query, [senderId, receiverId, message, sourceFile, imageUrl]);
//   return result.insertId;
// };


import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// 레코드(record) 테이블에 데이터 저장
export const createRecord = async ({ userId, content, sourceFile }) => {
    try {
        const record = await prisma.record.create({
            data: {
                userId,
                content,
                sourceFile,
            },
        });
        return record.id;
    } catch (error) {
        console.error("레코드 생성 중 오류 발생", error);
        throw new Error("레코드 생성 실패");
    }
};

// 메시지(bottlemessage) 테이블에 데이터 저장
export const createMessage = async ({ senderId, receiverId, message, sourceFile, imageUrl }) => {
    try {
        const newMessage = await prisma.bottlemessage.create({
            data: {
                senderId,
                receiverId,
                message,
                sourceFile,
                imageUrl,
            },
        });
        return newMessage.id;
    } catch (error) {
        console.error("메시지 생성 중 오류 발생", error);
        throw new Error("메시지 생성 실패");
    }
};

// record(기록) 테이블에서 파일 조회
export const getFileById = async (fileId) => {
    try {
        return await prisma.record.findUnique({
            where: { id: fileId },
        });
    } catch (error) {
        console.error("파일 조회 중 오류 발생", error);
        throw new Error("파일 조회 실패");
    }
};

// bottlemessage(메시지) 테이블에서 파일 조회
export const getMessageById = async (fileId) => {
    try {
        return await prisma.bottlemessage.findUnique({
            where: { id: fileId },
        });
    } catch (error) {
        console.error("메시지 조회 중 오류 발생", error);
        throw new Error("메시지 조회 실패");
    }
};

// Google Drive에서 다운로드한 파일을 DB의 record 테이블에 데이터 복원
export const restoreRecord = async (fileData) => {
    const { userId, content, sourceFile } = fileData;
    try {
        const restoredRecord = await prisma.record.upsert({
            where: { userId }, // 유저별로 기존 데이터 있는지 확인
            update: {
                content,
                sourceFile,
                syncStatus: "SUCCESS",
                updatedAt: new Date(),
            },
            create: {
                userId,
                content,
                sourceFile,
            },
        });
        return restoredRecord.id;
    } catch (error) {
        console.error("레코드 복원 중 오류 발생", error);
        throw new Error("레코드 복원 실패");
    }
};

// bottlemessage 테이블에 데이터 복원
export const restoreMessage = async (fileData) => {
    const { senderId, receiverId, message, sourceFile, imageUrl } = fileData;
    try {
        const restoredMessage = await prisma.bottlemessage.upsert({
            where: {
                senderId_receiverId: {
                    senderId,
                    receiverId,
                },
            },
            update: {
                message,
                sourceFile,
                syncStatus: "SUCCESS",
                updatedAt: new Date(),
                imageUrl,
                isRead: false,
            },
            create: {
                senderId,
                receiverId,
                message,
                sourceFile,
                syncStatus: "SUCCESS",
                imageUrl,
                isRead: false,
            },
        });
        return restoredMessage.id;
    } catch (error) {
        console.error("메시지 복원 중 오류 발생", error);
        throw new Error("메시지 복원 실패");
    }
};
