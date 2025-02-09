import express from "express";
import cors from "cors";
import userRoutes from "./routes/userRoute.js";
import bottleMessageRoutes from "./routes/bottleMessageRoute.js";
import * as dotenv from "dotenv";
import "./cronJobs.js";
import bodyParser from "body-parser";
import syncRoutes from "./syncRoutes.js";

const app = express();
dotenv.config();

app.use(cors()); //cors 설정
app.use(express.json()); //json 데이터 파싱 미들웨어 추가
app.use(bodyParser.urlencoded({ extended: true }));

// 기본 라우트 설정
app.get("/", (req, res) => {
    res.send("Server is running!");
});

//라우트 설정
app.use("/api", userRoutes); // 사용자 관리 관련 API
app.use("/api/bottle", bottleMessageRoutes); //유리병 편지 관련 API

// ✅ 정적 파일 제공 (예: 업로드된 파일 접근)
app.use("/uploads", express.static("uploads"));

// ✅ 올바르게 API 경로 설정
app.use("/api", syncRoutes); // ⚡️ '/api'를 추가하여 모든 API 요청이 이 경로 아래에 위치

// 서버 실행
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
