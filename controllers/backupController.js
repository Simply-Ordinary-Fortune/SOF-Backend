// import { createRecord, createMessage, getFileById, getMessageById } from '../services/backupService.js';
// import { uploadFileFromDB, listFiles, googleDownloadFile, getFileIdByName } from '../utils/googleDrive.js';
// import { restoreRecord, restoreMessage } from '../services/backupService.js';


// // 데이터베이스에 데이터 파일 생성
// export const createBackupFile = async (req, res) => {
//   try {
//     const { userId, fileType, content, sourceFile, imageUrl, tags, senderId, receiverId, message } = req.body;

//     let fileId;

//     if (fileType === "record") {
//       // 레코드 파일 저장
//       fileId = await createRecord({ userId, content, sourceFile, imageUrl, tags });
//     } else if (fileType === "message") {
//       // 메시지 파일 저장
//       if (!senderId || !receiverId || !message) {
//         return res.status(400).json({ error: "senderId, receiverId, and message are required for message files" });
//       }
//       fileId = await createMessage({ senderId, receiverId, message, sourceFile });
//     } else {
//       return res.status(400).json({ error: "Invalid fileType. Must be 'record' or 'message'" });
//     }

//     res.status(201).json({ message: "File created successfully", fileId });
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };

// // 데이터베이스 -> 구글드라이브 파일 업로드
// export const uploadToDrive = async (req, res) => {
//   try {
//     const { userId, fileType, fileId } = req.body;
//     console.log(`🔹 Uploading file - userId: ${userId}, fileType: ${fileType}, fileId: ${fileId}`);

//     let fileData;

//     if (fileType === "record") {
//       fileData = await getFileById(fileId);
//     } else if (fileType === "message") {
//       fileData = await getMessageById(fileId);
//     } else {
//       return res.status(400).json({ error: "Invalid fileType. Must be 'record' or 'message'" });
//     }

//     if (!fileData) {
//       return res.status(404).json({ error: "File not found" });
//     }

//     console.log("File found:", fileData);

//     const fileName = `${userId}_${fileType}_${fileId}.json`;

//     // 파일을 Google Drive로 직접 업로드
//     const result = await uploadFileFromDB(fileName, fileData, "application/json", fileType);

//     console.log("Upload successful:", result);

//     res.status(200).json({ message: "File uploaded to Google Drive", result });
//   } catch (error) {
//     console.error("Upload Error:", error);
//     res.status(500).json({ error: error.message });
//   }
// };



// // Google Drive에서 파일 목록 조회
// export const getFiles = async (req, res) => {
//   try {
//     const files = await listFiles();
//     res.status(200).json({ files });
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };

// export const downloadFileAndRestore = async (req, res) => {
//   try {
//     let { fileId, fileName, fileType } = req.body;

//     if (!fileType) {
//       return res.status(400).json({ error: "fileType (record/message) is required" });
//     }

//     // 파일 ID가 없으면 파일 이름으로 검색
//     if (!fileId && fileName) {
//       console.log(`Searching for file by name: ${fileName}`);
//       fileId = await getFileIdByName(fileName);

//       if (!fileId) {
//         return res.status(404).json({ error: `File not found on Google Drive: ${fileName}` });
//       }
//     }

//     if (!fileId) {
//       return res.status(400).json({ error: "Either fileId or fileName is required" });
//     }

//     console.log(`Downloading file: ${fileId} from Google Drive`);

//     // 파일을 다운로드하여 JSON 데이터로 변환
//     const fileData = await googleDownloadFile(fileId);

//     if (!fileData) {
//       return res.status(500).json({ error: "Failed to download or parse file data" });
//     }

//     console.log("File downloaded:", fileData);

//     let restoredId;

//     if (fileType === "record") {
//       restoredId = await restoreRecord(fileData);
//     } else if (fileType === "message") {
//       restoredId = await restoreMessage(fileData);
//     } else {
//       return res.status(400).json({ error: "Invalid fileType. Must be 'record' or 'message'" });
//     }

//     res.status(200).json({ message: "File restored to database", restoredId });
//   } catch (error) {
//     console.error("Restore Error:", error);
//     res.status(500).json({ error: error.message });
//   }
// };

///////////////////////

// import { createRecord, createMessage, getFileById, getMessageById } from '../services/backupService.js';
// import { uploadFileFromDB, listFiles, googleDownloadFile, getFileIdByName } from '../utils/googleDrive.js';
// import { restoreRecord, restoreMessage } from '../services/backupService.js';
// import { findByGuestId } from '../services/userService.js'; // guestId로 유저를 찾는 함수 추가

// // 데이터베이스에 데이터 파일 생성
// export const createBackupFile = async (req, res) => {
//   try {
//     const guestId = req.headers["guest-id"]; // HTTP 헤더에서 guest-id 가져오기

//     if (!guestId) {
//       return res.status(400).json({ error: "guest-id 헤더가 필요합니다." });
//     }

//     const user = await findByGuestId(guestId);
//     if (!user) {
//       return res.status(404).json({ error: "해당 guestId를 가진 유저를 찾을 수 없습니다." });
//     }

//     const { fileType, content, sourceFile, imageUrl, tags, senderId, receiverId, message } = req.body;

//     let fileId;

//     if (fileType === "record") {
//       // 레코드 파일 저장
//       fileId = await createRecord({ userId: user.id, content, sourceFile, imageUrl, tags });
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

// // 데이터베이스 -> 구글드라이브 파일 업로드
// export const uploadToDrive = async (req, res) => {
//   try {
//     const guestId = req.headers["guest-id"];

//     if (!guestId) {
//       return res.status(400).json({ error: "guest-id 헤더가 필요합니다." });
//     }

//     const user = await findByGuestId(guestId);
//     if (!user) {
//       return res.status(404).json({ error: "해당 guestId를 가진 유저를 찾을 수 없습니다." });
//     }

//     const { fileType, fileId } = req.body;
//     console.log(`Uploading file - userId: ${user.id}, fileType: ${fileType}, fileId: ${fileId}`);

//     let fileData;

//     if (fileType === "record") {
//       fileData = await getFileById(fileId);
//     } else if (fileType === "message") {
//       fileData = await getMessageById(fileId);
//     } else {
//       return res.status(400).json({ error: "Invalid fileType. Must be 'record' or 'message'" });
//     }

//     if (!fileData) {
//       return res.status(404).json({ error: "File not found" });
//     }

//     console.log("File found:", fileData);

//     const fileName = `${user.id}_${fileType}_${fileId}.json`;

//     // 파일을 Google Drive로 직접 업로드
//     const result = await uploadFileFromDB(fileName, fileData, "application/json", fileType);

//     console.log("Upload successful:", result);

//     res.status(200).json({ message: "File uploaded to Google Drive", result });
//   } catch (error) {
//     console.error("Upload Error:", error);
//     res.status(500).json({ error: error.message });
//   }
// };

// // Google Drive에서 파일 목록 조회
// export const getFiles = async (req, res) => {
//   try {
//     const files = await listFiles();
//     res.status(200).json({ files });
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };

// export const downloadFileAndRestore = async (req, res) => {
//   try {
//     let { fileId, fileName, fileType } = req.body;

//     if (!fileType) {
//       return res.status(400).json({ error: "fileType (record/message) is required" });
//     }

//     // 파일 ID가 없으면 파일 이름으로 검색
//     if (!fileId && fileName) {
//       console.log(`Searching for file by name: ${fileName}`);
//       fileId = await getFileIdByName(fileName);

//       if (!fileId) {
//         return res.status(404).json({ error: `File not found on Google Drive: ${fileName}` });
//       }
//     }

//     if (!fileId) {
//       return res.status(400).json({ error: "Either fileId or fileName is required" });
//     }

//     console.log(`Downloading file: ${fileId} from Google Drive`);

//     // 파일을 다운로드하여 JSON 데이터로 변환
//     const fileData = await googleDownloadFile(fileId);

//     if (!fileData) {
//       return res.status(500).json({ error: "Failed to download or parse file data" });
//     }

//     console.log("File downloaded:", fileData);

//     let restoredId;

//     if (fileType === "record") {
//       restoredId = await restoreRecord(fileData);
//     } else if (fileType === "message") {
//       restoredId = await restoreMessage(fileData);
//     } else {
//       return res.status(400).json({ error: "Invalid fileType. Must be 'record' or 'message'" });
//     }

//     res.status(200).json({ message: "File restored to database", restoredId });
//   } catch (error) {
//     console.error("Restore Error:", error);
//     res.status(500).json({ error: error.message });
//   }
// };


export const createBackupFile = async (req, res) => {
  try {
    const guestId = req.headers["guest-id"]; // HTTP 헤더에서 guest-id 가져오기

    if (!guestId) {
      return res.status(400).json({ error: "guest-id 헤더가 필요합니다." });
    }

    const user = await findByGuestId(guestId);
    if (!user) {
      return res.status(404).json({ error: "해당 guestId를 가진 유저를 찾을 수 없습니다." });
    }

    const { fileType, content, sourceFile, imageUrl, tags, receiverId, message } = req.body;

    let fileId;

    if (fileType === "record") {
      // 레코드 파일 저장
      fileId = await createRecord({ userId: user.id, content, sourceFile, imageUrl, tags });
    } else if (fileType === "message") {
      // 메시지 파일 저장
      if (!receiverId || !message) {
        return res.status(400).json({ error: "receiverId와 message가 필요합니다." });
      }

      // receiverId가 유효한지 확인 (예: 존재하는 유저인지 검증)
      const receiver = await findByGuestId(receiverId); 
      if (!receiver) {
        return res.status(404).json({ error: "해당 receiverId를 가진 유저를 찾을 수 없습니다." });
      }

      fileId = await createMessage({ senderId: user.id, receiverId, message, sourceFile });
    } else {
      return res.status(400).json({ error: "Invalid fileType. Must be 'record' or 'message'" });
    }

    res.status(201).json({ message: "File created successfully", fileId });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 데이터베이스 -> 구글드라이브 모든 파일 업로드 (사용자 ID 기반)
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

    console.log(`Uploading all files for userId: ${user.id}`);

    // 해당 유저의 모든 파일 가져오기
    const userRecords = await getAllRecordsByUserId(user.id);
    const userMessages = await getAllMessagesByUserId(user.id);

    const allFiles = [...userRecords, ...userMessages];

    if (allFiles.length === 0) {
      return res.status(404).json({ error: "해당 userId에 대한 파일이 없습니다." });
    }

    // 모든 파일을 업로드
    const uploadResults = await Promise.all(
      allFiles.map(async (file) => {
        const fileName = `${user.id}_${file.fileType}_${file.id}.json`;
        return await uploadFileFromDB(fileName, file, "application/json", file.fileType);
      })
    );

    console.log("Upload successful:", uploadResults);

    res.status(200).json({ message: "All files uploaded to Google Drive", results: uploadResults });
  } catch (error) {
    console.error("Upload Error:", error);
    res.status(500).json({ error: error.message });
  }
};

// Google Drive에서 특정 userId의 파일 목록 조회
export const getFiles = async (req, res) => {
  try {
    const guestId = req.headers["guest-id"];

    if (!guestId) {
      return res.status(400).json({ error: "guest-id 헤더가 필요합니다." });
    }

    const user = await findByGuestId(guestId);
    if (!user) {
      return res.status(404).json({ error: "해당 guestId를 가진 유저를 찾을 수 없습니다." });
    }

    console.log(`Fetching files for userId: ${user.id}`);

    // userId 기반 파일 조회 추가
    const files = await listFiles(user.id);

    res.status(200).json({ files });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Google Drive에서 특정 userId의 파일 다운로드 및 복원
export const downloadFileAndRestore = async (req, res) => {
  try {
    const guestId = req.headers["guest-id"];

    if (!guestId) {
      return res.status(400).json({ error: "guest-id 헤더가 필요합니다." });
    }

    const user = await findByGuestId(guestId);
    if (!user) {
      return res.status(404).json({ error: "해당 guestId를 가진 유저를 찾을 수 없습니다." });
    }

    let { fileId, fileName, fileType } = req.body;

    if (!fileType) {
      return res.status(400).json({ error: "fileType (record/message) is required" });
    }

    if (!fileId && fileName) {
      console.log(`Searching for file by name: ${fileName}`);
      fileId = await getFileIdByName(user.id, fileName);

      if (!fileId) {
        return res.status(404).json({ error: `해당 userId의 파일이 아닙니다: ${fileName}` });
      }
    }

    if (!fileId) {
      return res.status(400).json({ error: "Either fileId or fileName is required" });
    }

    console.log(`Downloading file: ${fileId} for userId: ${user.id}`);

    // 파일이 해당 userId의 것인지 확인
    const isUserFile = await checkFileOwnership(user.id, fileId);
    if (!isUserFile) {
      return res.status(403).json({ error: "해당 파일을 다운로드할 권한이 없습니다." });
    }

    // 파일 다운로드
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
