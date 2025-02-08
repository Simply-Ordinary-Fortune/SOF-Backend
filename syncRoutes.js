const express = require('express');
const multer = require('multer');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const router = express.Router();

// ✅ 파일 저장 설정 (CSV/JSON 파일만 허용)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

// ✅ 파일 유형 필터링 (CSV, JSON만 허용)
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['text/csv', 'application/json'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`Unsupported file type: ${file.mimetype}`), false);
  }
};

const upload = multer({ storage, fileFilter });

/* ✅ 1️⃣ 파일 업로드 및 동기화 API */
router.post('/sync/upload', upload.single('file'), async (req, res) => {
  console.log("📂 파일 업로드 요청 도착");
  console.log("📄 업로드된 파일 정보:", req.file);

  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  return res.status(200).json({ message: 'File uploaded successfully', filename: req.file.filename });
});

/* ✅ 2️⃣ GET 요청: Record 테이블 데이터 조회 */
router.get('/record', async (req, res) => {
  try {
    const records = await prisma.record.findMany();
    res.status(200).json(records);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch records' });
  }
});

// ✅ GET: 모든 유저 조회 (pushEnabled 포함)
router.get('/user', async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        createdAt: true,
        pushEnabled: true, // 🔹 푸시 알림 설정 조회 추가
      },
    });
    res.status(200).json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// ✅ POST: 새로운 유저 추가 (pushEnabled 포함)
router.post('/user', async (req, res) => {
  try {
    const { email, password, sourceFile, pushEnabled } = req.body;
    const newUser = await prisma.user.create({
      data: {
        email,
        password,
        sourceFile,
        pushEnabled: pushEnabled ?? true, // 기본값을 true로 설정
      },
    });
    res.status(201).json(newUser);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create user' });
  }
});

// ✅ GET: BottleMessage 조회 (isRead 및 imageUrl 포함)
router.get('/bottlemessage', async (req, res) => {
  try {
    const messages = await prisma.bottleMessage.findMany({
      select: {
        id: true,
        senderId: true,
        receiverId: true,
        message: true,
        sentAt: true,
        sourceFile: true,
        isRead: true,   // 🔹 메시지 확인 여부 추가
        imageUrl: true, // 🔹 이미지 URL 추가
      },
    });
    res.status(200).json(messages);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch bottle messages' });
  }
});

// ✅ POST: 새로운 BottleMessage 추가 (isRead 및 imageUrl 포함)
router.post('/bottlemessage', async (req, res) => {
  try {
    const { senderId, receiverId, message, sourceFile, imageUrl } = req.body;
    const newMessage = await prisma.bottleMessage.create({
      data: {
        senderId,
        receiverId,
        message,
        sourceFile,
        isRead: false,  // 기본값 false로 설정 (읽지 않은 상태)
        imageUrl: imageUrl ?? null, // null 허용
      },
    });
    res.status(201).json(newMessage);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create bottle message' });
  }
});

// ✅ PATCH: 메시지 읽음 상태 업데이트
router.patch('/bottlemessage/:id/read', async (req, res) => {
  try {
    const { id } = req.params;
    const updatedMessage = await prisma.bottleMessage.update({
      where: { id: Number(id) },
      data: { isRead: true },  // 메시지 읽음 상태 업데이트
    });
    res.status(200).json(updatedMessage);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update message read status' });
  }
});

module.exports = router;
