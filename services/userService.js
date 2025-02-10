import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

//게스트 계정 생성
export const createUserService = async (guestId) => {
    try {
        const newUser = await prisma.user.create({
            data: {
                guestId: guestId,
            },
        });
        return newUser;
    } catch (error) {
        throw new Error("게스트 계정 생성 실패 - " + error);
    }
};

//게스트 계정 확인
export const findByGuestId = async (guestId) => {
    try {
        const user = await prisma.user.findUnique({
            where: { guestId: guestId },
        });

        return user; // 유저가 없으면 null 반환
    } catch (error) {
        console.error("유저 조회 실패 :", error);
        return null;
    }
};

//푸시 알림
export const updatePush = async (guestId, pushEnabled) => {
    try {
        // 유저의 pushEnabled 설정 업데이트
        const updatedUser = await prisma.user.update({
            where: { guestId: guestId },
            data: { pushEnabled: pushEnabled },
        });

        return updatedUser;
    } catch (error) {
        console.error("푸시 알림 설정 업데이트 중 오류 발생", error);
        throw new Error("푸시 알림 설정 업데이트 중 오류 발생");
    }
};

//유저 id 리스트 조회
export const getUserList = async () => {
    try {
        const users = await prisma.user.findMany({
            select: {
                id: true,
            },
        });

        return users.map((user) => user.id);
    } catch (error) {
        console.error("사용자 목록 조회 중 오류 발생: ", error);
        throw new Error("사용자 목록 조회 중 오류 발생");
    }
};
