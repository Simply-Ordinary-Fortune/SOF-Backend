import { createFile } from '../services/backupService.js';
import { uploadFile, listFiles, downloadFile as googleDownloadFile } from '../utils/googleDrive.js';

export const createBackupFile = async (req, res) => { // DB의 Record 테이블에 파일 저장
  try {
    const filePath = await createFile(req.body);
    res.status(201).json({ message: 'File created successfully', filePath });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const uploadToDrive = async (req, res) => { // DB의 파일을 구글 드라이브에 업로드
  try {
    const { fileName, filePath } = req.body;
    const result = await uploadFile(fileName, filePath, 'application/json');
    res.status(200).json({ message: 'File uploaded to Google Drive', result });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getFiles = async (req, res) => { // 구글 드라이브에서 파일 목록 조회: 클라우드 API에서 사용자 데이터 목록 가져오기
  try {
    const files = await listFiles();
    res.status(200).json({ files });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const downloadFile = async (req, res) => { // 파일을 다시 DB로 다운로드 및 데이터 무결성 체크
  try {
    const { fileId, destPath } = req.body;
    await googleDownloadFile(fileId, destPath); // 이름 변경된 함수 사용
    res.status(200).json({ message: 'File downloaded successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
