import cron from "node-cron";
import { executeMatchLetter } from "./controllers/bottleMessageController.js";

//매일 12:00에 유리병 편지 매칭 실행
cron.schedule("0 12 * * *", async () => {
    try {
        console.log("매일 12:00에 유리병 편지 매칭 작동");
        const response = await executeMatchLetter();
        console.log("유리병 편지 매칭 결과", response);
    } catch (error) {
        console.error("cron job 스케줄링 중 오류 발생 : ", error);
    }
});
