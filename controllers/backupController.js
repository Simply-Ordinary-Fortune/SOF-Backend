import { getFilesByUserId, getMessagesByUserId } from '../services/backupService.js'; // createRecord, createMessage, 
import { uploadFileFromDB, listFiles, googleDownloadFile } from '../utils/googleDrive.js';
import { restoreRecord, restoreMessage } from '../services/backupService.js';
import { findByGuestId } from '../services/userService.js';

// // 데이터베이스에 데이터 파일 생성
// export const createBackupFile = async (req, res) => {
//   try {
//     const guestId = req.headers["guest-id"];

//     if (!guestId) {
//       return res.status(400).json({ error: "guest-id 헤더가 필요합니다." });
//     }

//     const user = await findByGuestId(guestId);
//     if (!user) {
//       return res.status(404).json({ error: "해당 guestId를 가진 유저를 찾을 수 없습니다." });
//     }

//     const { fileType, content, sourceFile, senderId, receiverId, message } = req.body;

//     let fileId;

//     if (fileType === "record") {
//       // 레코드 파일 저장
//       fileId = await createRecord({ userId: user.id, content, sourceFile });
//     } else if (fileType === "message") {
//       // 메시지 파일 저장
//       if (!receiverId || !message) {
//         return res.status(400).json({ error: "senderId, receiverId, and message are required for message files" });
//       }
//       fileId = await createMessage({ senderId: user.id, receiverId, message, sourceFile });
//     } else {
//       return res.status(400).json({ error: "Invalid fileType. Must be 'record' or 'message'" });
//     }

//     res.status(201).json({ message: "File created successfully", fileId });
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };

// 데이터베이스 -> 구글드라이브 파일 업로드 (guest-id 기반으로 자동 지정)
export const uploadToDrive = async (req, res) => {
  try {
    const guestId = req.headers["guest-id"];

    if (!guestId) {
      return res.status(400).json({ error: "guest-id 헤더가 필요합니다." });
    }

    const user = await findByGuestId(guestId);
    if (!user) {
      return res.status(404).json({ error: "해당 guestId를 가진 유저를 찾을 수 없습니다." });
    }

    // user.id와 관련된 모든 파일 가져오기
    const records = await getFilesByUserId(user.id);
    const messages = await getMessagesByUserId(user.id);

    const uploadedFiles = [];

    for (const record of records) {
      const fileName = `${user.id}_record_${record.id}.json`;
      const fileData = { ...record };
      delete fileData.id; // Google Drive에는 id 저장하지 않음

      const result = await uploadFileFromDB(fileName, fileData, "application/json", "record");
      uploadedFiles.push(result);
    }

    for (const message of messages) {
      const fileName = `${user.id}_message_${message.id}.json`;
      const fileData = { ...message };
      delete fileData.id; // Google Drive에는 id 저장하지 않음

      const result = await uploadFileFromDB(fileName, fileData, "application/json", "message");
      uploadedFiles.push(result);
    }

    res.status(200).json({ message: "모든 파일이 Google Drive에 업로드되었습니다.", uploadedFiles });
  } catch (error) {
    console.error("Upload Error:", error);
    res.status(500).json({ error: error.message });
  }
};

// Google Drive에서 모든 파일 목록 조회
export const getFiles = async (req, res) => {
  try {
    const files = await listFiles();
    res.status(200).json({ files });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Google Drive에서 모든 파일 다운로드 후 DB에 복원
export const downloadFileAndRestore = async (req, res) => {
  try {
    const files = await listFiles(); // Google Drive의 모든 파일 조회
    const restoredFiles = [];

    for (const file of files) {
      const { id: fileId, name: fileName } = file;

      console.log(`Downloading file: ${fileId} from Google Drive`);

      // 파일 다운로드 및 JSON 데이터 변환
      const fileData = await googleDownloadFile(fileId);
      if (!fileData) {
        console.error(`파일 다운로드 실패: ${fileName}`);
        continue;
      }

      console.log("File downloaded:", fileData);

      let restoredId;
      if (fileName.includes("record")) {
        if (!fileData.userId || !fileData.content || !fileData.sourceFile) {
          console.warn(`레코드 파일 데이터가 올바르지 않음: ${fileName}`);
          continue;
        }
        restoredId = await restoreRecord(fileData);
      } else if (fileName.includes("message")) {
        if (!fileData.senderId || !fileData.receiverId || !fileData.message) {
          console.warn(`메시지 파일 데이터가 올바르지 않음: ${fileName}`);
          continue;
        }
        restoredId = await restoreMessage(fileData);
      } else {
        console.warn(`알 수 없는 파일 유형: ${fileName}`);
        continue;
      }

      restoredFiles.push({ fileName, restoredId });
    }

    res.status(200).json({ message: "모든 파일이 데이터베이스에 복원되었습니다.", restoredFiles });
  } catch (error) {
    console.error("Restore Error:", error);
    res.status(500).json({ error: error.message });
  }
};


/**
 * 🔹 기존 데이터와 백업 데이터 비교 후 업데이트
 */
export const compareAndUpdateBackup = async (req, res) => {
  try {
    let { fileId, fileName, fileType } = req.body;

    if (!fileType) {
      return res.status(400).json({ error: "fileType (record/message) is required" });
    }
    if (!fileName) {
      return res.status(400).json({ error: "fileName is required" });
    }

    const localFilePath = `./local_files/${fileName}`;
    console.log(`🔍 무결성 검사: ${fileId} vs ${localFilePath}`);

    const isValid = await checkFileIntegrity(fileId, localFilePath);

    if (isValid) {
      return res.status(200).json({ message: "✅ 기존 데이터와 동일, 업데이트 불필요" });
    }

    console.log(`🔄 데이터 불일치! 백업 데이터를 DB에 업데이트 중...`);

    let fileData;
    if (fileType === "record") {
      fileData = await getFileById(fileId);
      await updateRecord(fileData);
    } else if (fileType === "message") {
      fileData = await getMessageById(fileId);
      await updateMessage(fileData);
    } else {
      return res.status(400).json({ error: "Invalid fileType. Must be 'record' or 'message'" });
    }

    res.status(200).json({ message: "✅ 백업 데이터 업데이트 완료!" });
  } catch (error) {
    console.error("🚨 백업 데이터 업데이트 실패:", error);
    res.status(500).json({ error: "백업 데이터 업데이트 실패" });
  }
};
