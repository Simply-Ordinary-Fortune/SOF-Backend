const express = require('express');
const { authenticateToken } = require('../middleware/authMiddleware');
const { createRecord, deleteRecord, getRecordByDate, getCalendarRecords, getPhotoRecords } = require('../controllers/recordsController');
const { upload } = require('../controllers/recordsController'); 

const router = express.Router();

router.post('/', authenticateToken, upload.single('image'), createRecord);
router.delete('/:recordId', authenticateToken, deleteRecord);
router.get('/date', authenticateToken, getRecordByDate);
router.get('/calendar', authenticateToken, getCalendarRecords);
router.get('/photos', authenticateToken, getPhotoRecords);

module.exports = router;

