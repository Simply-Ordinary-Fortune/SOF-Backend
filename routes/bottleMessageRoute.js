import express from "express";
import { getBottleMessageHome, focusLetter, galleryLetter, calendarLetter, matchLetter, detailLetter } from "../controllers/bottleMessageController.js";

const router = express.Router();

//유리병 편지 홈 조회
router.get("", getBottleMessageHome);

//유리병 편지 포커스
router.get("/focus", focusLetter);

//유리병 편지 갤러리
router.get("/gallery", galleryLetter);

//유리병 편지 캘린더
router.get("/calendar", calendarLetter);

//유리병 편지 매칭
router.post("/match", matchLetter);

//유리병 편지 최근 항목 포커스
router.get("/focus/:id", detailLetter);

export default router;
