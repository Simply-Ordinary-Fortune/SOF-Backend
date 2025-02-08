const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const syncRoutes = require('./routes/syncRoutes'); // ✅ 라우트 파일 불러오기

const app = express();
const PORT = 3000;

// ✅ CORS 설정 (필요하면 추가)
app.use(cors());

// ✅ BodyParser 설정 (JSON 파싱)
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));

// ✅ 정적 파일 제공 (예: 업로드된 파일 접근)
app.use('/uploads', express.static('uploads'));

// ✅ 올바르게 API 경로 설정
app.use('/api', syncRoutes); // ⚡️ '/api'를 추가하여 모든 API 요청이 이 경로 아래에 위치

// ✅ 서버 실행
app.listen(PORT, () => {
  console.log(`✅ Server is running on http://localhost:${PORT}`);
});
// DB 브랜치에서 변경 사항 추가
