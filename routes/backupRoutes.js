import express from 'express';
import { createBackupFile, uploadToDrive, getFiles, downloadFileAndRestore} from '../controllers/backupController.js';

const backupRoutes = express.Router();

// DB에 데이터 파일 생성
backupRoutes.post('/file', createBackupFile);

// Google Drive에 업로드 (DB -> Google Drive): bottlemessage, record 테이블의 기록을 제목으로 구분해서 업로드
backupRoutes.post('/upload', uploadToDrive);

// Google Drive 파일 목록 조회
backupRoutes.get('/restore/files', getFiles);

// Google Drive에서 파일 다운로드 후 DB에 복원
backupRoutes.post('/restore/download', downloadFileAndRestore);

export default backupRoutes;
