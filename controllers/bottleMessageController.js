import {} from "../services/bottleMessageService.js";

//유리병 편지 홈 조회
export const getBottleMessageHome = async (req, res) => {
    try {
        const guestId = req.headers["guest-id"]; // HTTP 헤더에서 guest-id 가져오기

        if (!guestId) {
            return res.status(400).json({ message: "guest-id 헤더가 필요합니다." });
        }

        const today = new Date();
        const formattedDate = formatDate(today);
        const unreadLetters = await getUnreadLetters(); // DB 연동 후, 읽지 않은 편지 리스트 가져오기
        const unreadLetterCount = unreadLetters.length;
        const isAllChecked = unreadLetterCount === 0;

        const recentLetters = await getrecentLetters(); //DB에서 가장 최근 도착한 2개의 편지 불러오기 (최신순으로)

        const response = {
            message: "SUCCESS",
            result: {
                date: formattedDate,
                isAllChecked: isAllChecked,
                unreadLetterCount: unreadLetterCount,
                recentLetters: recentLetters.map((letter) => ({
                    id: letter.id,
                    imageUrl: letter.imageUrl,
                    sentAt: formatDateWithMonth(letter.sentAt),
                })),
            },
        };

        return res.status(200).json(response);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "서버 오류로 인한 유리병 편지 홈 조회 실패" });
    }
};

//유리병 편지 포커스
export const focusLetter = async (req, res) => {
    try {
        const guestId = req.headers["guest-id"]; // HTTP 헤더에서 guest-id 가져오기

        if (!guestId) {
            return res.status(400).json({ message: "guest-id 헤더가 필요합니다." });
        }

        let { year, month } = req.query;

        const currentDate = new Date();
        if (!year) {
            year = currentDate.getFullYear();
        }
        if (!month) {
            month = currentDate.getMonth() + 1;
        }

        //해당 연도와 월에 존재하는 편지 리스트 조회
        const letterList = await getLettersByYearAndMonth(year, month);

        const letterCount = letterList.length;

        const focusList = letterList.map((letter) => ({
            imageUrl: letter.imageUrl,
            date: formatDateWithYear(letter.sentAt),
            message: letter.message,
        }));

        const response = {
            message: "SUCCESS",
            result: {
                letterCount,
                focusList,
            },
        };

        return res.status(200).json(response);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "서버 오류로 인한 유리병 편지 포커스 조회 실패" });
    }
};

//유리병 편지 갤러리
export const galleryLetter = async (req, res) => {
    try {
        const guestId = req.headers["guest-id"]; // HTTP 헤더에서 guest-id 가져오기

        if (!guestId) {
            return res.status(400).json({ message: "guest-id 헤더가 필요합니다." });
        }

        //전체 리스트 조회, 추후 수정 필요
        const galleryList = (await getGalleryList()).map((letter) => ({
            imageUrl: letter.imageUrl,
            date: formatDate(letter.sentAt),
        }));

        const response = {
            message: "SUCCESS",
            result: {
                galleryList,
            },
        };

        return res.status(200).json(response);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "서버 오류로 인한 유리병 편지 갤러리 조회 실패" });
    }
};

//유리병 편지 캘린더
export const calendarLetter = async (req, res) => {
    try {
        const guestId = req.headers["guest-id"]; // HTTP 헤더에서 guest-id 가져오기

        if (!guestId) {
            return res.status(400).json({ message: "guest-id 헤더가 필요합니다." });
        }

        //전체 리스트 조회, 추후 수정 필요
        const calendarList = (await getCalendarList()).map((letter) => ({
            imageUrl: letter.imageUrl,
            date: letter.sentAt,
        }));

        let startDate = null;
        let endDate = null;

        if (calendarList.length > 0) {
            const sortedDates = calendarList.map((item) => new Date(item.date)).sort((a, b) => a - b);

            startDate = sortedDates[0];
            endDate = sortedDates[sortedDates.length - 1];
        }

        const response = {
            message: "SUCCESS",
            result: {
                startDate: startDate,
                endDate: endDate,
                calendarList,
            },
        };

        return res.status(200).json(response);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "서버 오류로 인한 유리병 편지 캘린더 조회 실패" });
    }
};

//유리병 편지 매칭
export const matchLetter = async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        // Record에서 어제 작성된 행운 편지 목록 가져오기
        const unmatchedList = await getUnmatchedList(); //임시 함수

        if (unmatchedList.length === 0) {
            return res.status(404).json({ message: "전날 작성된 행운 편지가 없습니다." });
        }

        if (unmatchedList.length < 2) {
            return res.status(404).json({ message: "매칭할 행운 편지가 충분하지 않습니다." });
        }

        // 2. 사용자 ID 목록 셔플 (랜덤 매칭)
        let users = unmatchedList.map((record) => record.userId);
        let shuffledUsers = [...users].sort(() => Math.random() - 0.5);

        // 3. 매칭 수행 (자기 자신을 제외하고 랜덤 매칭)
        const bottleMessages = [];
        for (let i = 0; i < users.length; i++) {
            let sender = users[i];
            let receiver = shuffledUsers[i];

            // 본인이 본인에게 매칭되지 않도록
            if (sender === receiver) {
                receiver = shuffledUsers[(i + 1) % shuffledUsers.length];
            }

            const content = unmatchedList.find((r) => r.userId === sender).content;

            bottleMessages.push({
                senderId: sender,
                receiverId: receiver,
                message: content,
                sentAt: new Date(), // 편지 전송 시간 기록
                syncStatus: "SUCCESS",
            });
        }

        //DB에 매칭된 유리병 편지 저장

        const response = {
            message: "SUCCESS",
            result: {
                bottleMessageList: bottleMessages,
            },
        };

        return res.status(201).json(response);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "서버 오류로 인한 유리병 편지 매칭 실패" });
    }
};

//DB 연동 후 수정 필요
const getUnreadLetters = async () => {
    return [
        {
            id: 1,
            imageUrl: "https://example.com/images/luckyletter1.jpg",
            sentAt: "2025-02-05T12:00:00Z",
        },
        {
            id: 2,
            imageUrl: "https://example.com/images/luckyletter2.jpg",
            sentAt: "2025-02-06T09:30:00Z",
        },
        {
            id: 3,
            imageUrl: "https://example.com/images/luckyletter3.jpg",
            sentAt: "2025-02-07T09:30:00Z",
        },
    ];
};

//DB 연동 후 수정 필요
const getrecentLetters = async () => {
    return [
        {
            id: 1,
            imageUrl: "https://example.com/images/luckyletter1.jpg",
            sentAt: "2025-02-07T12:00:00Z",
        },
        {
            id: 2,
            imageUrl: "https://example.com/images/luckyletter2.jpg",
            sentAt: "2025-02-06T09:30:00Z",
        },
    ];
};

const formatDate = (dateString) => {
    const date = new Date(dateString);
    return `${date.getMonth() + 1}.${date.getDate()}`;
};

const formatDateWithMonth = (dateString) => {
    const date = new Date(dateString);
    const month = date.getMonth() + 1;
    const day = date.getDate();
    return `${month}월 ${day}일`;
};

const formatDateWithYear = (dateString) => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    return `${year}년 ${month}월 ${day}일`;
};

//DB 연동 후 수정 필요
const getLettersByYearAndMonth = (year, month) => {
    return [
        {
            id: 1,
            imageUrl: "https://example.com/images/luckyletter.jpg",
            sentAt: "2025-02-06T09:30:00Z",
            oneLineMessage: "행운이 가득한 하루가 되세요!",
        },
        {
            id: 2,
            imageUrl: "https://example.com/images/luckyletter.jpg",
            sentAt: "2025-02-06T09:30:00Z",
            oneLineMessage: "오늘도 좋은 일이 생기길!",
        },
        {
            id: 3,
            imageUrl: "https://example.com/images/luckyletter.jpg",
            sentAt: "2025-02-06T09:30:00Z",
            oneLineMessage: "오늘도 좋은 일이 생기길!",
        },
    ];
};

//DB 연동 후 수정 필요
const getGalleryList = async () => {
    return [
        {
            id: 1,
            imageUrl: "https://example.com/images/luckyletter11.jpg",
            sentAt: "2025-02-07T12:00:00Z",
        },
        {
            id: 2,
            imageUrl: "https://example.com/images/luckyletter12.jpg",
            sentAt: "2025-02-06T09:30:00Z",
        },
    ];
};

//DB 연동 후 수정 필요
const getCalendarList = async () => {
    return [
        {
            id: 1,
            imageUrl: "https://example.com/images/luckyletter11.jpg",
            sentAt: "2025-02-07T12:00:00Z",
        },
        {
            id: 2,
            imageUrl: "https://example.com/images/luckyletter12.jpg",
            sentAt: "2025-02-06T09:30:00Z",
        },
        {
            id: 2,
            imageUrl: "https://example.com/images/luckyletter12.jpg",
            sentAt: "2025-02-02T09:30:00Z",
        },
    ];
};

const getUnmatchedList = async () => {
    return [
        {
            userId: 1,
            content: "행운이 가득한 하루 되세요!",
            sentAt: "2025-02-07T12:00:00Z",
            imageUrl: "https://example.com/images/luckyletter1.jpg",
        },
        {
            userId: 2,
            content: "오늘도 행복한 일이 가득하길!",
            sentAt: "2025-02-06T09:30:00Z",
            imageUrl: "https://example.com/images/luckyletter2.jpg",
        },
        {
            userId: 3,
            content: "좋은 일이 생기기를 기원합니다!",
            sentAt: "2025-02-05T14:00:00Z",
            imageUrl: "https://example.com/images/luckyletter3.jpg",
        },
        {
            userId: 4,
            content: "행운을 믿고 오늘도 힘내세요!",
            sentAt: "2025-02-04T08:15:00Z",
            imageUrl: "https://example.com/images/luckyletter4.jpg",
        },
    ];
};
