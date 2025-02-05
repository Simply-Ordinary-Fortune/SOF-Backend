const express = require('express');
const syncRoutes = require('./routes/syncRoutes');

const app = express();
app.use(express.json());
app.use('/api', syncRoutes); // ✅ "/api" 경로로 라우트 설정

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
