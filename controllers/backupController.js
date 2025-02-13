import { createRecord, createMessage, getFileById, getMessageById } from '../services/backupService.js';
import { uploadFileFromDB, listFiles, googleDownloadFile, getFileIdByName } from '../utils/googleDrive.js';
import { restoreRecord, restoreMessage } from '../services/backupService.js';
import { checkFileIntegrity } from "../utils/googleDrive.js";
import { updateRecord, updateMessage } from "../services/backupService.js";


// 데이터베이스에 데이터 파일 생성
export const createBackupFile = async (req, res) => {
  try {
    const { userId, fileType, content, sourceFile, imageUrl, tags, senderId, receiverId, message } = req.body;

    let fileId;

    if (fileType === "record") {
      // 레코드 파일 저장
      fileId = await createRecord({ userId, content, sourceFile, imageUrl, tags });
    } else if (fileType === "message") {
      // 메시지 파일 저장
      if (!senderId || !receiverId || !message) {
        return res.status(400).json({ error: "senderId, receiverId, and message are required for message files" });
      }
      fileId = await createMessage({ senderId, receiverId, message, sourceFile });
    } else {
      return res.status(400).json({ error: "Invalid fileType. Must be 'record' or 'message'" });
    }

    res.status(201).json({ message: "File created successfully", fileId });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 데이터베이스 -> 구글드라이브 파일 업로드
export const uploadToDrive = async (req, res) => {
  try {
    const { userId, fileType, fileId } = req.body;
    console.log(`🔹 Uploading file - userId: ${userId}, fileType: ${fileType}, fileId: ${fileId}`);

    let fileData;

    if (fileType === "record") {
      fileData = await getFileById(fileId);
    } else if (fileType === "message") {
      fileData = await getMessageById(fileId);
    } else {
      return res.status(400).json({ error: "Invalid fileType. Must be 'record' or 'message'" });
    }

    if (!fileData) {
      return res.status(404).json({ error: "File not found" });
    }

    console.log("File found:", fileData);

    const fileName = `${userId}_${fileType}_${fileId}.json`;

    // 파일을 Google Drive로 직접 업로드
    const result = await uploadFileFromDB(fileName, fileData, "application/json", fileType);

    console.log("Upload successful:", result);

    res.status(200).json({ message: "File uploaded to Google Drive", result });
  } catch (error) {
    console.error("Upload Error:", error);
    res.status(500).json({ error: error.message });
  }
};



// Google Drive에서 파일 목록 조회
export const getFiles = async (req, res) => {
  try {
    const files = await listFiles();
    res.status(200).json({ files });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const downloadFileAndRestore = async (req, res) => {
  try {
    let { fileId, fileName, fileType } = req.body;

    if (!fileType) {
      return res.status(400).json({ error: "fileType (record/message) is required" });
    }

    // 파일 ID가 없으면 파일 이름으로 검색
    if (!fileId && fileName) {
      console.log(`Searching for file by name: ${fileName}`);
      fileId = await getFileIdByName(fileName);

      if (!fileId) {
        return res.status(404).json({ error: `File not found on Google Drive: ${fileName}` });
      }
    }

    if (!fileId) {
      return res.status(400).json({ error: "Either fileId or fileName is required" });
    }

    console.log(`Downloading file: ${fileId} from Google Drive`);

    // 파일을 다운로드하여 JSON 데이터로 변환
    const fileData = await googleDownloadFile(fileId);

    if (!fileData) {
      return res.status(500).json({ error: "Failed to download or parse file data" });
    }

    console.log("File downloaded:", fileData);

    let restoredId;

    if (fileType === "record") {
      restoredId = await restoreRecord(fileData);
    } else if (fileType === "message") {
      restoredId = await restoreMessage(fileData);
    } else {
      return res.status(400).json({ error: "Invalid fileType. Must be 'record' or 'message'" });
    }

    res.status(200).json({ message: "File restored to database", restoredId });
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
