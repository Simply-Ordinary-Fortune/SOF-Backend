import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
//cron scheduler 추가

//유리병 편지 홈 조회 - 안읽은 편지 리스트 조회회
export const getUnreadLetters = async (userId) => {
    try {
        const unreadLetters = await prisma.bottlemessage.findMany({
            where: {
                receiverId: userId,
                isRead: false,
            },
        });

        return unreadLetters;
    } catch (error) {
        console.error("읽지 않은 편지 가져오기 중 오류 발생", error);
        throw new Error("읽지 않은 편지 가져오기 실패");
    }
};

//유리병 편지 홈 조회 - 가장 최근 도착한 편지
export const getrecentLetters = async () => {
    try {
        const recentLetters = await prisma.bottlemessage.findFirst({
            orderBy: {
                sentAt: "desc",
            },
        });

        return recentLetters ? [recentLetters] : [];
    } catch (error) {
        console.error("가장 최근 편지 가져오기 중 오류 발생", error);
        throw new Error("가장 최근 편지 가져오기 실패");
    }
};

//유리병 편지 포커스 - true로 변경
export const updateToRead = async (userId) => {
    return await prisma.bottlemessage.updateMany({
        where: {
            receiverId: userId,
            isRead: false,
        },
        data: {
            isRead: true,
        },
    });
};

//유리병 편지 포커스 - 연도와 월 편지 조회
export const getLettersByYearAndMonth = async (userId, year, month) => {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59, 999);

    // 해당 날짜 범위에 포함되는 편지 조회
    return await prisma.bottlemessage.findMany({
        where: {
            receiverId: userId,
            sentAt: {
                gte: startDate,
                lte: endDate,
            },
        },
        orderBy: {
            sentAt: "asc",
        },
    });
};

//유리병 편지 갤러리, 캘린더
export const getListWithImg = async (userId) => {
    const galleryLetters = await prisma.bottlemessage.findMany({
        where: {
            receiverId: userId,
        },
        orderBy: {
            sentAt: "asc",
        },
        select: {
            imageUrl: true,
            sentAt: true,
        },
    });

    return galleryLetters;
};

//Record에서 어제 작성된 행운 편지 목록 가져오기 [코드 리팩터링 필요]
export const getUnmatchedList = async () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const koreaTime = new Date(today.getTime() + 9 * 60 * 60 * 1000);
    const yesterday = new Date(koreaTime);
    yesterday.setDate(yesterday.getDate() - 1);

    return await prisma.record.findMany({
        where: {
            createdAt: {
                gte: yesterday,
                lte: today,
            },
        },
        select: {
            id: true,
            userId: true,
            content: true,
            createdAt: true,
            sourceFile: true,
        },
    });
};

//매칭된 유리병 편지 저장
export const saveMatchedLetters = async (bottlemessages) => {
    try {
        await prisma.bottlemessage.createMany({
            data: bottlemessages,
        });
    } catch (error) {
        console.error("DB에 매칭된 유리병 편지 저장 실패: ", error);
    }
};

//유리병 편지 최근 항목 포커스
export const getLettersFromDate = async (userId, focusDate) => {
    const year = focusDate.getFullYear();
    const month = focusDate.getMonth() + 1;

    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59, 999);

    // 해당 날짜 범위에 포함되는 편지 조회
    const letterList = await prisma.bottlemessage.findMany({
        where: {
            receiverId: userId,
            sentAt: {
                gte: startDate,
                lte: endDate,
            },
        },
        orderBy: {
            sentAt: "asc",
        },
    });

    const selectedIndex = letterList.findIndex((letter) => letter.sentAt.getTime() === focusDate.getTime());

    return {
        selectedIndex: selectedIndex !== -1 ? selectedIndex : null, //없으면 null
        letterList,
    };
};

//id로 유리병 편지 조회
export const getLetterById = async (id, userId) => {
    return await prisma.bottlemessage.findUnique({
        where: {
            receiverId: userId,
            id: Number(id),
        },
        select: {
            id: true,
            imageUrl: true,
            sentAt: true,
            message: true,
            isRead: true,
        },
    });
};
