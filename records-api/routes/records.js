const express = require('express');
const multer = require('multer');
const { authenticateToken } = require('../middleware/authMiddleware');
const {
    addRecord,
    getRecordsByDate,
    getRecordBySpecificDate,
    getPhotosByDateOrMonth,
    deleteRecord,
} = require('../controllers/recordsController');

const router = express.Router();

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/'); 
    },
    filename: (req, file, cb) => {
        const uniqueName = `${Date.now()}-${file.originalname}`;
        cb(null, uniqueName); 
    }
});

const upload = multer({ storage });

router.post('/', authenticateToken, upload.single('image'), addRecord);
router.get('/', authenticateToken, getRecordsByDate);
router.get('/date', authenticateToken, getRecordBySpecificDate);
router.get('/photos', authenticateToken, getPhotosByDateOrMonth);
router.delete('/:id', authenticateToken, deleteRecord);

module.exports = router;
