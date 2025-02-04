import express from 'express';
import {
  createBackupFile,
  uploadToDrive,
  getFiles,
  downloadFileAndRestore
} from '../controllers/backupController.js';

const backupRoutes = express.Router();

// DB에 데이터 파일 생성
backupRoutes.post('/file', createBackupFile);

// Google Drive 업로드
backupRoutes.post('/upload', uploadToDrive);

// Google Drive 파일 목록 조회
backupRoutes.get('/restore/files', getFiles);

// Google Drive에서 파일 다운로드 후 변환
backupRoutes.post('/restore/download', downloadFileAndRestore);

export default backupRoutes;
