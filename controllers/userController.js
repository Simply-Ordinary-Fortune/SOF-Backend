import { v4 as uuidv4 } from "uuid";
import { createUserService, findByGuestId, updatePush } from "../services/userService.js";

//게스트 계정 생성
export const createUser = async (req, res) => {
    try {
        const guestId = uuidv4(); //고유 UUID 생성

        console.log("uuid 생성");
        // User 생성
        const newUser = await createUserService(guestId);

        return res.status(201).json({
            message: "SUCCESS",
            result: {
                userId: newUser.id,
                guestId: newUser.guestId,
            },
        });
    } catch (error) {
        console.log(error+"오류남");
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

        const user = await findByGuestId(guestId);

        return res.status(200).json({
            message: "SUCCESS",
            result: {
                guestId: user.guestId,
            },
        });
    } catch (error) {
        console.log(error);
        if (error.message === "User not found") {
            return res.status(404).json({ message: "해당 guestId를 가진 게스트 계정을 찾을 수 없습니다." });
        }
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
        const user = await findByGuestId(guestId);

        // 유저가 존재하지 않으면 404 에러 반환
        if (!user) {
            return res.status(404).json({ message: "해당 guestId를 가진 유저를 찾을 수 없습니다." });
        }

        //알림 설정 업데이트
        const updatedUser = await updatePush(guestId, pushEnabled);

        return res.status(200).json({
            message: "SUCCESS",
            result: {
                userId: updatedUser.id,
                pushEnabled: updatedUser.pushEnabled,
            },
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "서버 오류로 인한 푸시 알림 설정 변경 실패" });
    }
};

//마이페이지 조회
export const getMypage = async (req, res) => {
    try {
        const guestId = req.headers["guest-id"];
        const { pushEnabled } = req.body;

        if (!guestId) {
            return res.status(400).json({ message: "guest-id 헤더가 필요합니다." });
        }

        //DB에서 유저 확인
        const user = await findByGuestId(guestId);

        // 유저가 존재하지 않으면 404 에러 반환
        if (!user) {
            return res.status(404).json({ message: "해당 guestId를 가진 유저를 찾을 수 없습니다." });
        }

        //user의 값 찾기

        return res.status(200).json({
            message: "SUCCESS",
            result: {
                userId: user.id,
                pushEnabled: user.pushEnabled,
            },
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "서버 오류로 인한 마이페이지 조회 실패" });
    }
};