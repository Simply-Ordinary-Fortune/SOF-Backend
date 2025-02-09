
import express from "express";
import cors from "cors";
import userRoutes from "./routes/userRoute.js";
import bottleMessageRoutes from "./routes/bottleMessageRoute.js";
import * as dotenv from "dotenv";
import "./cronJobs.js";

const app = express();
dotenv.config();

app.use(cors()); //cors 설정
app.use(express.json()); //json 데이터 파싱 미들웨어 추가

// 기본 라우트 설정
app.get("/", (req, res) => {
    res.send("Server is running!");
});

//라우트 설정
app.use("/api", userRoutes); // 사용자 관리 관련 API
app.use("/api/bottle", bottleMessageRoutes); //유리병 편지 관련 API

//main에서 추가
const syncRoutes = require("./routes/syncRoutes");
app.use("/api", syncRoutes); // ✅ "/api" 경로로 라우트 설정

// 서버 실행
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

