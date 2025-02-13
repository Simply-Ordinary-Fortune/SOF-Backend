// import { PrismaClient } from "@prisma/client";

// const prisma = new PrismaClient();

// // 레코드(record) 테이블에 데이터 저장
// export const createRecord = async ({ userId, content, sourceFile }) => {
//     try {
//         const record = await prisma.record.create({
//             data: {
//                 userId,
//                 content,
//                 sourceFile,
//             },
//         });
//         return record.id;
//     } catch (error) {
//         console.error("레코드 생성 중 오류 발생", error);
//         throw new Error("레코드 생성 실패");
//     }
// };

// // 메시지(bottlemessage) 테이블에 데이터 저장
// export const createMessage = async ({ senderId, receiverId, message, sourceFile, imageUrl }) => {
//     try {
//         const newMessage = await prisma.bottlemessage.create({
//             data: {
//                 id,
//                 senderId,
//                 receiverId,
//                 message,
//                 sourceFile,
//                 imageUrl,
//             },
//         });
//         return newMessage.id;
//     } catch (error) {
//         console.error("메시지 생성 중 오류 발생", error);
//         throw new Error("메시지 생성 실패");
//     }
// };

// // record(기록) 테이블에서 파일 조회
// export const getFileById = async (fileId) => {
//     try {
//         return await prisma.record.findUnique({
//             where: { id: fileId },
//         });
//     } catch (error) {
//         console.error("파일 조회 중 오류 발생", error);
//         throw new Error("파일 조회 실패");
//     }
// };

// // bottlemessage(메시지) 테이블에서 파일 조회
// export const getMessageById = async (fileId) => {
//     try {
//         return await prisma.bottlemessage.findUnique({
//             where: { id: fileId },
//         });
//     } catch (error) {
//         console.error("메시지 조회 중 오류 발생", error);
//         throw new Error("메시지 조회 실패");
//     }
// };

// // Google Drive에서 다운로드한 파일을 DB의 record 테이블에 데이터 복원
// export const restoreRecord = async (fileData) => {
//     const { userId, content, sourceFile } = fileData;
//     try {
//         const restoredRecord = await prisma.record.upsert({
//             where: { userId }, // 유저별로 기존 데이터 있는지 확인
//             update: {
//                 content,
//                 sourceFile,
//                 syncStatus: "SUCCESS",
//                 updatedAt: new Date(),
//             },
//             create: {
//                 userId,
//                 content,
//                 sourceFile,
//             },
//         });
//         return restoredRecord.id;
//     } catch (error) {
//         console.error("레코드 복원 중 오류 발생", error);
//         throw new Error("레코드 복원 실패");
//     }
// };

// export const restoreMessage = async (fileData) => {
//   const { senderId, receiverId, message, sourceFile, imageUrl } = fileData;
//   try {
//       // 기존 메시지 찾기
//       const existingMessage = await prisma.bottlemessage.findFirst({
//           where: { senderId, receiverId }
//       });

//       let restoredMessage;
//       if (existingMessage) {
//           // 기존 메시지가 존재하면 업데이트
//           restoredMessage = await prisma.bottlemessage.update({
//               where: { id: existingMessage.id },
//               data: {
//                   message,
//                   sourceFile,
//                   syncStatus: "SUCCESS",
//                   updatedAt: new Date(),
//                   imageUrl,
//                   isRead: false,
//               },
//           });
//       } else {
//           // 메시지가 없으면 새로 생성
//           restoredMessage = await prisma.bottlemessage.create({
//               data: {
//                   senderId,
//                   receiverId,
//                   message,
//                   sourceFile,
//                   syncStatus: "SUCCESS",
//                   imageUrl,
//                   isRead: false,
//               },
//           });
//       }

//       return restoredMessage.id;
//   } catch (error) {
//       console.error("메시지 복원 중 오류 발생", error);
//       throw new Error("메시지 복원 실패");
//   }
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

// record(기록) 테이블에서 특정 파일 조회
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

// bottlemessage(메시지) 테이블에서 특정 파일 조회
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

// 특정 userId의 모든 record 조회 (업로드용)
export const getFilesByUserId = async (userId) => {
    try {
        return await prisma.record.findMany({
            where: { userId },
        });
    } catch (error) {
        console.error("유저 ID로 레코드 조회 중 오류 발생", error);
        throw new Error("유저 레코드 조회 실패");
    }
};

// 특정 userId의 모든 message 조회 (업로드용)
export const getMessagesByUserId = async (userId) => {
    try {
        return await prisma.bottlemessage.findMany({
            where: { senderId: userId },
        });
    } catch (error) {
        console.error("유저 ID로 메시지 조회 중 오류 발생", error);
        throw new Error("유저 메시지 조회 실패");
    }
};

// Google Drive에서 다운로드한 파일을 DB의 record 테이블에 데이터 복원
export const restoreRecord = async (fileData) => {
    const { userId, content, sourceFile } = fileData;
    try {
        const restoredRecord = await prisma.record.create({
            data: {
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

// Google Drive에서 다운로드한 파일을 DB의 bottlemessage 테이블에 데이터 복원
export const restoreMessage = async (fileData) => {
    const { senderId, receiverId, message, sourceFile, imageUrl } = fileData;
    try {
        const restoredMessage = await prisma.bottlemessage.create({
            data: {
                senderId,
                receiverId,
                message,
                sourceFile,
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
