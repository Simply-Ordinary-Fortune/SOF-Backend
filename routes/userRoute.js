import express from "express";
import { createUser, logInUser, updateNotification } from "../controllers/userController.js";

const router = express.Router();

//게스트 계정 생성
router.post("/auth/signup", createUser);

//게스트 계정 확인
router.get("/auth/signin", logInUser);

//푸시 알림 설정
router.patch("/notifications", updateNotification);

export default router;
