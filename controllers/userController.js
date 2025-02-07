import { v4 as uuidv4 } from "uuid";
import {} from "../services/userService.js";

//게스트 계정 생성
export const createUser = async (req, res) => {
    try {
        const guestId = uuidv4(); //고유 UUID 생성

        return res.status(201).json({
            message: "SUCCESS",
            result: {
                guestId: guestId,
            },
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "서버 오류로 인한 게스트 계정 생성 실패" });
    }
};

//게스트 계정 확인
export const logInUser = async (req, res) => {
    try {
        const guestId = req.headers["guest-id"]; // HTTP 헤더에서 guest-id 가져오기

        if (!guestId) {
            return res.status(400).json({ message: "guest-id 헤더가 필요합니다." });
        }

        //DB 연동 후, DB 존재 여부 검증 필요
        return res.status(200).json({
            message: "SUCCESS",
            result: {
                guestId: guestId,
            },
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "서버 오류로 인한 게스트 계정 확인 실패" });
    }
};

//푸시 알림 설정
export const updateNotification = async (req, res) => {
    try {
        const guestId = req.headers["guest-id"];
        const { pushEnabled } = req.body;

        if (!guestId) {
            return res.status(400).json({ message: "guest-id 헤더가 필요합니다." });
        }
        //DB에서 유저 확인

        //알림 설정 업데이트

        return res.status(200).json({
            message: "SUCCESS",
            result: {
                pushEnabled: pushEnabled, //DB 연동 후 DB 값으로 변경 필요요
            },
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "서버 오류로 인한 푸시 알림 설정 변경 실패" });
    }
};
