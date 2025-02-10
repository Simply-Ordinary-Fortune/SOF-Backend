import express from "express";
import { authenticateToken } from "../middleware/authMiddleware.js";
import { createRecord, deleteRecord, getRecordByDate, getCalendarRecords, getPhotoRecords, upload } from "../controllers/recordsController.js";

const router = express.Router();

router.post("/", authenticateToken, upload.single("image"), createRecord);
router.delete("/:recordId", authenticateToken, deleteRecord);
router.get("/date", authenticateToken, getRecordByDate);
router.get("/calendar", authenticateToken, getCalendarRecords);
router.get("/photos", authenticateToken, getPhotoRecords);

export default router;
