const express = require('express');
const app = express();

// 기본 라우트 설정
app.get('/', (req, res) => {
    res.send('Server is running!');
});

// 서버 실행
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
