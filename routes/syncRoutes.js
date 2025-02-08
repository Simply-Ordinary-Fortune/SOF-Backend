const express = require('express');
const multer = require('multer');
const fs = require('fs');
const csvParser = require('csv-parser');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const router = express.Router();

// 🔹 파일 저장 설정 (CSV/JSON 파일만 허용)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

// 🔹 파일 유형 필터링 (CSV, JSON만 허용)
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['text/csv', 'application/json'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`Unsupported file type: ${file.mimetype}`), false);
  }
};

const upload = multer({ storage, fileFilter });

// 🔹 파일 업로드 및 동기화 API
router.post('/sync/upload', upload.single('file'), async (req, res) => {
  console.log("📂 파일 업로드 요청 도착");
  console.log("📄 업로드된 파일 정보:", req.file);

  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  return res.status(200).json({ message: 'File uploaded successfully', filename: req.file.filename });
});

// 🔹 GET 요청: Record, BottleMessage, User 테이블 데이터 조회
router.get('/record', async (req, res) => {
  try {
    const records = await prisma.Record.findMany({
      select: {
        id: true,
        userId: true,
        content: true,
        createdAt: true,
        sourceFile: true,
      },
    });

    const bottleMessages = await prisma.BottleMessage.findMany({
      select: {
        id: true,
        senderId: true,
        receiverId: true,
        message: true,
        sentAt: true,
        sourceFile: true,
      },
    });

    const users = await prisma.User.findMany({
      select: {
        id: true,
        email: true,
        createdAt: true,
      },
    });

    res.status(200).json({ records, bottleMessages, users });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch data' });
  }
});

// ✅ GET: 모든 User 조회
router.get('/user', async (req, res) => {
  try {
    const users = await prisma.User.findMany();
    res.status(200).json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// ✅ GET: 모든 BottleMessage 조회
router.get('/bottlemessage', async (req, res) => {
  try {
    const messages = await prisma.BottleMessage.findMany();
    res.status(200).json(messages);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch bottle messages' });
  }
});

module.exports = router;