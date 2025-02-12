import express from "express";
import { createUser, logInUser, updateNotification, getMypage } from "../controllers/userController.js";

const router = express.Router();

//게스트 계정 생성
router.post("/auth/signup", createUser);

//게스트 계정 확인
router.get("/auth/signin", logInUser);

//푸시 알림 설정
router.patch("/notifications", updateNotification);

//마이페이지 조회
router.get("/mypage", getMypage);

export default router;
