import { google } from "googleapis";
import dotenv from "dotenv";
import fs from "fs";
import stream from "stream";
import crypto from "crypto";
import path from "path";


dotenv.config();

// 🔹 Google OAuth2 클라이언트 설정
const oAuth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);
oAuth2Client.setCredentials({ refresh_token: process.env.GOOGLE_REFRESH_TOKEN });

const drive = google.drive({ version: "v3", auth: oAuth2Client });


/**
 * 🔹 파일 해시값 생성 (SHA256)
 * @param {string} filePath - 로컬 파일 경로
 * @returns {Promise<string>} - 파일의 SHA256 해시값 반환
 */
export const getFileHash = async (filePath) => {
  return new Promise((resolve, reject) => {
    const hash = crypto.createHash("sha256");
    const stream = fs.createReadStream(filePath);

    stream.on("data", (data) => hash.update(data));
    stream.on("end", () => resolve(hash.digest("hex")));
    stream.on("error", (err) => reject(err));
  });
};

/**
 * 🔹 Google Drive 파일과 로컬 파일 무결성 검사
 * @param {string} driveFileId - Google Drive 파일 ID
 * @param {string} localFilePath - 로컬 파일 경로
 * @returns {Promise<boolean>} - 파일이 동일하면 true, 다르면 false
 */
export const checkFileIntegrity = async (driveFileId, localFilePath) => {
  try {
    const driveFilePath = path.join("/tmp", driveFileId); // 다운로드 경로
    await googleDownloadFile(driveFileId, driveFilePath);

    const localHash = await getFileHash(localFilePath);
    const driveHash = await getFileHash(driveFilePath);

    return localHash === driveHash;
  } catch (error) {
    console.error("🚨 무결성 검사 실패:", error);
    return false;
  }
};


/**
 * 🔹 DB 데이터를 Google Drive에 업로드하는 함수
 * @param {string} fileName - 업로드할 파일명
 * @param {object} fileData - 업로드할 JSON 데이터
 * @param {string} mimeType - MIME 타입 (예: 'application/json')
 */
export const uploadFileFromDB = async (fileName, fileData, mimeType = "application/json") => {
  try {
    // JSON 데이터를 Stream으로 변환
    const bufferStream = new stream.PassThrough();
    bufferStream.end(JSON.stringify(fileData, null, 2));

    // Google Drive API를 통해 파일 업로드
    const response = await drive.files.create({
      requestBody: {
        name: fileName,
        mimeType: mimeType,
        parents: [process.env.GOOGLE_DRIVE_FOLDER_ID], // 업로드할 폴더 ID
      },
      media: {
        mimeType: mimeType,
        body: bufferStream,
      },
    });

    console.log(`✅ Google Drive 업로드 완료: ${fileName}`);
    return response.data;
  } catch (error) {
    console.error("🚨 Google Drive 업로드 실패:", error);
    throw error;
  }
};


/**
 * 🔹 Google Drive 폴더 ID 확인 및 생성
 */
export const getOrCreateFolder = async () => {
  try {
    const folderName = "BackupFolder"; // ✅ 폴더명 설정
    const response = await drive.files.list({
      q: `mimeType='application/vnd.google-apps.folder' and name='${folderName}'`,
      fields: "files(id, name)",
    });

    if (response.data.files.length > 0) {
      console.log(`📂 기존 폴더 찾음: ${folderName}`);
      return response.data.files[0].id; // ✅ 기존 폴더 ID 반환
    }

    // 폴더가 없으면 생성
    const folderMetadata = {
      name: folderName,
      mimeType: "application/vnd.google-apps.folder",
    };

    const folder = await drive.files.create({
      requestBody: folderMetadata,
      fields: "id",
    });

    console.log(`✅ 새 폴더 생성: ${folderName}`);
    return folder.data.id; // ✅ 새 폴더 ID 반환
  } catch (error) {
    console.error(`🚨 폴더 검색/생성 오류:`, error);
    throw error;
  }
};

/**
 * 🔹 Google Drive에서 파일 목록 조회
 */
export const listFiles = async () => {
  try {
    const response = await drive.files.list({
      q: "mimeType='application/json'",
      fields: "files(id, name, createdTime, mimeType)",
      orderBy: "createdTime desc",
    });

    return response.data.files;
  } catch (error) {
    console.error("🚨 파일 목록 조회 실패:", error);
    throw error;
  }
};

/**
 * 🔹 Google Drive에서 파일 이름으로 파일 ID 찾기
 * @param {string} fileName - 찾고자 하는 파일 이름 (예: "1_record_5.json")
 * @returns {string|null} 파일의 Google Drive ID (없으면 null)
 */
export const getFileIdByName = async (fileName) => {
  try {
    console.log(`🔍 Searching for file: ${fileName}`);

    const response = await drive.files.list({
      q: `name='${fileName}' and mimeType='application/json'`,
      fields: "files(id, name, createdTime)",
      orderBy: "createdTime desc",
      supportsAllDrives: true,
      includeItemsFromAllDrives: true,
    });

    if (response.data.files.length > 0) {
      console.log(`✅ Found file: ${fileName}, ID: ${response.data.files[0].id}`);
      return response.data.files[0].id;
    }

    console.warn(`⚠️ File not found on Google Drive: ${fileName}`);
    return null;
  } catch (error) {
    console.error("🚨 Error finding file by name:", error);
    throw error;
  }
};

export const googleDownloadFile = async (fileId) => {
  try {
    const response = await drive.files.get(
      { fileId, alt: "media" },
      { responseType: "stream" }
    );

    return new Promise((resolve, reject) => {
      let data = "";

      response.data.on("data", (chunk) => {
        data += chunk;
      });

      response.data.on("end", () => {
        try {
          resolve(JSON.parse(data)); // JSON 변환 후 반환
        } catch (error) {
          reject("Error parsing JSON data");
        }
      });

      response.data.on("error", (err) => {
        reject(`Error downloading file: ${err.message}`);
      });
    });
  } catch (error) {
    console.error("🚨 Google Drive Download Error:", error);
    throw error;
  }
};


/**
 * 🔹 로컬과 Google Drive 간 파일 동기화
 */
export const syncFiles = async () => {
  console.log("🚀 파일 동기화 시작...");
  const driveFiles = await listFiles();
  console.log(`🔹 Google Drive 파일 개수: ${driveFiles.length}`);
};

console.log("✅ Google Drive API 실행 완료!");

