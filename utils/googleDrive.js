import { google } from 'googleapis';
import dotenv from 'dotenv';
import fs from 'fs';
import stream from 'stream';

dotenv.config();

const oAuth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);
oAuth2Client.setCredentials({ refresh_token: process.env.GOOGLE_REFRESH_TOKEN });

const drive = google.drive({ version: 'v3', auth: oAuth2Client });


// 폴더 추가 함수
const getOrCreateFolder = async (folderName) => {
  try {
    // Google Drive에서 폴더 검색
    const response = await drive.files.list({
      q: `mimeType='application/vnd.google-apps.folder' and name='${folderName}'`,
      fields: 'files(id, name)',
    });

    if (response.data.files.length > 0) {
      console.log(`📂 Existing folder found: ${folderName}`);
      return response.data.files[0].id; // 기존 폴더 ID 반환
    }

    // 폴더가 없으면 생성
    const folderMetadata = {
      name: folderName,
      mimeType: 'application/vnd.google-apps.folder',
    };

    const folder = await drive.files.create({
      requestBody: folderMetadata,
      fields: 'id',
    });

    console.log(`Created new folder: ${folderName}`);
    return folder.data.id; // 새로 생성한 폴더 ID 반환
  } catch (error) {
    console.error(`Error creating/getting folder ${folderName}:`, error);
    throw error;
  }
};



// DB 데이터를 Google Drive에 직접 업로드하는 함수
export const uploadFileFromDB = async (fileName, fileData, mimeType, fileType) => {
  try {
    // JSON 데이터를 Stream으로 변환 (파일 없이 업로드 가능)
    const bufferStream = new stream.PassThrough();
    bufferStream.end(JSON.stringify(fileData, null, 2)); // JSON 형식 변환

    // Google Drive API를 통해 파일 업로드
    const response = await drive.files.create({
      requestBody: {
        name: fileName,
        mimeType: mimeType,
      },
      media: {
        mimeType: mimeType,
        body: bufferStream, // Stream을 통해 업로드
      },
    });

    return response.data;
  } catch (error) {
    console.error("Error uploading file from DB:", error);
    throw error;
  }
};


/**
 * Google Drive 파일 목록 조회 (필터링 가능)
 * @param {string} fileType - "record" 또는 "message" (선택적)
 */
export const listFiles = async (fileType = null) => {
  try {
    let query = "mimeType='application/json'"; // JSON 파일만 검색
    if (fileType === "record") {
      query += " and name contains 'record'"; // Record 파일 필터링
    } else if (fileType === "message") {
      query += " and name contains 'message'"; // BottleMessage 파일 필터링
    }

    const response = await drive.files.list({
      q: query,
      fields: 'files(id, name, createdTime, mimeType)', // 필요한 정보만 가져오기
      orderBy: 'createdTime desc', // 최신 파일부터 정렬
    });

    return response.data.files;
  } catch (error) {
    console.error("Error listing files:", error);
    throw error;
  }
};


// Google Drive에서 파일 다운로드
export const googleDownloadFile = async (fileId) => {
  try {
    const response = await drive.files.get(
      { fileId, alt: 'media' },
      { responseType: 'stream' }
    );

    return new Promise((resolve, reject) => {
      let data = '';

      response.data.on('data', (chunk) => {
        data += chunk;
      });

      response.data.on('end', () => {
        try {
          resolve(JSON.parse(data)); // JSON 변환 후 반환
        } catch (error) {
          reject("Error parsing JSON data");
        }
      });

      response.data.on('error', (err) => {
        reject(`Error downloading file: ${err.message}`);
      });
    });
  } catch (error) {
    console.error("Google Drive Download Error:", error);
    throw error;
  }
};

/**
 * Google Drive에서 파일 이름으로 파일 ID 찾기 (더 정확한 검색 방식 적용)
 * @param {string} fileName - 찾고자 하는 파일 이름 (예: "1_record_5.json")
 * @returns {string|null} 파일의 Google Drive ID (없으면 null)
 */
export const getFileIdByName = async (fileName) => {
  try {
    console.log(`Searching for file: ${fileName}`);

    const response = await drive.files.list({
      q: `name='${fileName}' and mimeType='application/json'`, // JSON 파일만 검색
      fields: 'files(id, name, createdTime)',
      orderBy: 'createdTime desc', // 최신 파일 우선 반환
      supportsAllDrives: true, // 공유 드라이브 파일도 검색 가능하게 설정
      includeItemsFromAllDrives: true // 모든 드라이브 항목 포함
    });

    if (response.data.files.length > 0) {
      console.log(`Found file: ${fileName}, ID: ${response.data.files[0].id}`);
      return response.data.files[0].id; // 최신 파일 ID 반환
    }

    console.warn(`⚠️ File not found on Google Drive: ${fileName}`);
    return null;
  } catch (error) {
    console.error("Error finding file by name:", error);
    throw error;
  }
};

