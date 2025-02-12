import express from "express";
import { createRecord, deleteRecord, getRecordByDate, getCalendarRecords, getPhotoRecords, upload } from "../controllers/recordsController.js";

const router = express.Router();

router.post("/", upload.single("image"), createRecord);
router.delete("/:recordId", deleteRecord);
router.get("/date", getRecordByDate);
router.get("/calendar", getCalendarRecords);
router.get("/photos", getPhotoRecords);

export default router;