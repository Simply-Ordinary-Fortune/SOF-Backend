import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import path from "path";
import { fileURLToPath } from "url";
import multer from "multer";
import * as dotenv from "dotenv";

// 📌 라우트 파일 불러오기
import userRoutes from "./routes/userRoute.js";
import bottleMessageRoutes from "./routes/bottleMessageRoute.js";
import syncRoutes from "./routes/syncRoutes.js";
import backupRoutes from "./routes/backupRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import recordsRoutes from "./routes/records.js";
import statisticsRoutes from "./routes/statistics.js";
import "./cronJobs.js"; // 스케줄링 작업 불러오기

dotenv.config();

// 📌 __dirname 대체 (ES 모듈에서는 __dirname 사용 불가)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// ✅ CORS 설정
app.use(cors());

// ✅ JSON 데이터 및 URL-encoded 데이터 파싱
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));

// ✅ 정적 파일 제공 (예: 업로드된 파일 접근)
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ✅ 파일 업로드 설정 (CSV/JSON 파일 허용)
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, "uploads"));
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    },
});
const upload = multer({ storage });

// ✅ 기본 라우트
app.get("/", (req, res) => {
    res.send("🚀 Server is running!");
});

// ✅ API 라우트 설정 (⚡ 충돌 방지: `/api` 경로를 일관되게 유지)
app.use("/api", userRoutes); // 사용자 관리 API
app.use("/api/bottle", bottleMessageRoutes); // 유리병 편지 관련 API
app.use("/api/sync", syncRoutes); // 파일 동기화 관련 API
app.use("/api/backup", backupRoutes); // 백업 관련 API
app.use("/api/auth", authRoutes); // 인증 관련 API
app.use("/api/records", recordsRoutes); // 기록 관련 API
app.use("/api/statistics", statisticsRoutes); // 통계 관련 API

// ✅ 404 에러 핸들러
app.use((req, res, next) => {
    res.status(404).json({ error: "API Not Found" });
});

// ✅ 서버 실행
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server is running on port ${PORT}`);
});