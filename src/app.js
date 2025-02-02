import express from 'express';
import backupRoutes from './routes/backupRoutes.js';
import authRoutes from './routes/authRoutes.js';


//const express = require('express');
const app = express();


app.use(express.json());

// 라우트 추가
app.use('/api/backup', backupRoutes);
app.use('/api', authRoutes); 


// 서버 상태 체크 API
app.get('/status', (req, res) => {
    res.status(200).json({
        status: 'OK',
        message: 'Server Started ...',
        timestamp: new Date().toISOString(),
    });
});

// 서버 실행
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
