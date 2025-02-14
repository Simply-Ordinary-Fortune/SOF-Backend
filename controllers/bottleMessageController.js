import { getUnreadLetters, getrecentLetters, updateToRead, getLettersByYearAndMonth, getListWithImg, getLetterById, getLettersFromDate, saveMatchedLetters, getUnmatchedList } from "../services/bottleMessageService.js";
import { findByGuestId, getUserList } from "../services/userService.js";

//유리병 편지 홈 조회
export const getBottleMessageHome = async (req, res) => {
    try {
        const guestId = req.headers["guest-id"]; // HTTP 헤더에서 guest-id 가져오기

        if (!guestId) {
            return res.status(400).json({ message: "guest-id 헤더가 필요합니다." });
        }

        const user = await findByGuestId(guestId);

        if (!user) {
            return res.status(404).json({ message: "해당 guestId를 가진 유저를 찾을 수 없습니다." });
        }

        const today = new Date();
        const formattedDate = formatDate(today);
        const unreadLetters = await getUnreadLetters(user.id);
        const unreadLetterCount = unreadLetters.length;
        console.log("아직 읽지 않는 행운 편지 수 : " + unreadLetterCount);
        const isAllChecked = unreadLetterCount === 0;

        const recentLetters = await getrecentLetters(user.id);

        const response = {
            message: "SUCCESS",
            result: {
                date: formattedDate,
                isAllChecked: isAllChecked,
                recentLetters: recentLetters.map((letter) => {
                    const sentDate = new Date(letter.sentAt);
                    return {
                        letterId: letter.id,
                        imageUrl: letter.imageUrl,
                        sentAt: formatDateWithMonth(letter.sentAt),
                        year: sentDate.getFullYear().toString(),
                        month: (sentDate.getMonth() + 1).toString(),
                    };
                }),
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

        const user = await findByGuestId(guestId);

        if (!user) {
            return res.status(404).json({ message: "해당 guestId를 가진 유저를 찾을 수 없습니다." });
        }

        //user의 isRead를 false -> true로 변경
        await updateToRead(user.id);

        let { year, month } = req.query;

        const currentDate = new Date();
        if (!year) {
            year = currentDate.getFullYear();
        }
        if (!month) {
            month = currentDate.getMonth() + 1;
        }

        //해당 연도와 월에 존재하는 편지 리스트 조회
        const letterList = await getLettersByYearAndMonth(user.id, year, month);

        const letterCount = letterList.length;

        const focusList = letterList.map((letter) => ({
            letterId: letter.id,
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

        const user = await findByGuestId(guestId);

        if (!user) {
            return res.status(404).json({ message: "해당 guestId를 가진 유저를 찾을 수 없습니다." });
        }

        //전체 리스트 조회
        const galleryList = (await getListWithImg(user.id)).map((letter) => ({
            letterId: letter.id,
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

        const user = await findByGuestId(guestId);

        if (!user) {
            return res.status(404).json({ message: "해당 guestId를 가진 유저를 찾을 수 없습니다." });
        }

        //전체 리스트 조회
        const calendarList = (await getListWithImg(user.id)).map((letter) => ({
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
export const executeMatchLetter = async (req, res) => {
    try {
        // Record에서 어제 작성된 행운 편지 목록 가져오기
        const unmatchedList = await getUnmatchedList();
        console.log("unmatchedList: ", unmatchedList);

        if (!Array.isArray(unmatchedList) || unmatchedList.length === 0) {
            console.error("No unmatched letters found");
            return { message: "전날 작성된 행운 편지가 없습니다." };
        }

        if (unmatchedList.length < 2) {
            return { message: "매칭할 행운 편지가 충분하지 않습니다." };
        }

        // 2. 사용자 ID 목록
        let users = unmatchedList.map((record) => record.userId);
        const allUserList = await getUserList();

        // 3. 매칭 수행 (자기 자신을 제외하고 랜덤 매칭)
        const bottleMessages = [];
        const usedReceivers = new Set();

        for (let i = 0; i < unmatchedList.length; i++) {
            let sender = unmatchedList[i].userId;
            const content = unmatchedList[i].content;
            const imageUrl = unmatchedList[i].imageUrl;

            let receiver;
            do {
                receiver = allUserList[Math.floor(Math.random() * allUserList.length)];
            } while (receiver === sender || usedReceivers.has(receiver));

            usedReceivers.add(receiver);

            const now = new Date();
            const koreaNow = new Date(now.getTime() + 9 * 60 * 60 * 1000);

            bottleMessages.push({
                senderId: sender,
                receiverId: receiver,
                message: content,
                sentAt: koreaNow, // 편지 전송 시간 기록
                imageUrl: imageUrl,
            });
        }

        //DB에 매칭된 유리병 편지 저장
        await saveMatchedLetters(bottleMessages);

        const response = {
            message: "SUCCESS",
            result: {
                bottleMessageList: bottleMessages,
            },
        };

        console.log(JSON.stringify(response, null, 2));

        return response;
    } catch (error) {
        console.error(error);
        return { message: "매칭 작업 실패", error };
    }
};

export const matchLetter = async (req, res) => {
    try {
        const result = await executeMatchLetter();
        if (result.message !== "SUCCESS") {
            return res.status(404).json({ message: result.message });
        }
        return res.status(200).json(result);
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "서버 오류로 인한 유리병 편지 매칭 실패" });
    }
};

//유리병 편지 최근 항목 포커스
export const detailLetter = async (req, res) => {
    try {
        const guestId = req.headers["guest-id"]; // HTTP 헤더에서 guest-id 가져오기

        if (!guestId) {
            return res.status(400).json({ message: "guest-id 헤더가 필요합니다." });
        }

        const user = await findByGuestId(guestId);

        if (!user) {
            return res.status(404).json({ message: "해당 guestId를 가진 유저를 찾을 수 없습니다." });
        }

        //user의 isRead를 false -> true로 변경
        await updateToRead(user.id);

        const { id } = req.params;

        if (!id) {
            return res.status(400).json({ message: "편지 ID가 필요합니다." });
        }

        const letter = await getLetterById(id, user.id);

        if (!letter) {
            return res.status(404).json({ message: "해당 ID의 편지를 찾을 수 없습니다." });
        }

        const focusDate = new Date(letter.sentAt);

        //id와 같은 달에 작성된 편지 리스트 조회
        const { selectedIndex, letterList } = await getLettersFromDate(user.id, focusDate);

        console.log(selectedIndex);
        const letterCount = letterList.length;

        const focusDetailList = letterList.map((letter) => ({
            letterId: letter.id,
            imageUrl: letter.imageUrl,
            date: formatDateWithYear(letter.sentAt),
            message: letter.message,
        }));

        const response = {
            message: "SUCCESS",
            result: {
                letterCount,
                selectedIndex,
                focusDetailList,
            },
        };
        return res.status(200).json(response);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "서버 오류로 인한 유리병 편지 최근 항목 포커스 조회 실패" });
    }
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
