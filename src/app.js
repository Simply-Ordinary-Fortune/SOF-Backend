const express = require('express');
const cors = require('cors'); 
const path = require('path');
const multer = require('multer');
const { PrismaClient } = require('@prisma/client');

const app = express();
const prisma = new PrismaClient(); 

require('dotenv').config();
app.use(cors()); 

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, 'uploads'));
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});
const upload = multer({ storage });
const recordsRoutes = require('../records-api/routes/records');
const statisticsRoutes = require('../records-api/routes/statistics');

app.use('/records', recordsRoutes);
app.use('/statistics', statisticsRoutes);

app.get('/', (req, res) => {
    res.send('🚀 Server is running!');
});

app.use((req, res, next) => {
    res.status(404).json({ error: 'API Not Found' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Server is running on http://localhost:${PORT}`);
});
