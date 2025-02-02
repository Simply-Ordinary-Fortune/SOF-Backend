import express from 'express';
import { createBackupFile, uploadToDrive, getFiles, downloadFile } from '../controllers/backupController.js';

const backupRoutes = express.Router();

backupRoutes.post('/file', createBackupFile);
backupRoutes.post('/upload', uploadToDrive);
backupRoutes.get('/files', getFiles);
backupRoutes.post('/download', downloadFile);

export default backupRoutes;
