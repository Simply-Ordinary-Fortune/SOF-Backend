import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export const getTagStatistics = async (req, res) => {
    const guestId = req.headers["guest-id"];
    const { period = "monthly", year, month } = req.query;

    if (!guestId) {
        return res.status(400).json({ error: "guest-id가 필요합니다." });
    }

    if (!["monthly", "yearly"].includes(period)) {
        return res.status(400).json({ error: "기간을 설정해주세요." });
    }

    try {
        const user = await prisma.user.findUnique({
            where: { guestId: guestId },
        });

        if (!user) {
            return res.status(404).json({ error: "User not found with the provided guestId" });
        }
        const now = new Date();
        const selectedYear = year ? parseInt(year, 10) : now.getFullYear();
        const selectedMonth = month ? parseInt(month, 10) - 1 : now.getMonth(); 

        const startDate = new Date(selectedYear, selectedMonth, 1);
        const endDate = period === "yearly"
            ? new Date(selectedYear + 1, 0, 1)  
            : new Date(selectedYear, selectedMonth + 1, 1); 

        const userRecords = await prisma.record.findMany({
            where: {
                userId: user.id,
                createdAt: { gte: startDate, lt: endDate },
            },
        });
        
        const predefinedTags = [
            "자연의 선물",
            "일상 속 기쁨",
            "뜻밖의 친절",
            "예상 못한 선물",
            "우연한 행운"
        ];

        const tagCounts = {};
        let totalTags = 0;

        predefinedTags.forEach(tag => {
            tagCounts[tag] = 0;
        });

        userRecords.forEach((record) => {
            record.tags.forEach((tag) => {
                if (predefinedTags.includes(tag)) {
                    tagCounts[tag] = (tagCounts[tag] || 0) + 1;
                    totalTags += 1;
                }
            });
        });

        const tagsUsage = {};
        for (const tag of predefinedTags) {
            const percentage = totalTags === 0 ? 0 : (tagCounts[tag] / totalTags) * 100;
            tagsUsage[tag] = `${percentage.toFixed(2)}%`;
        }

        const highlightedTag = totalTags === 0 ? null : Object.keys(tagCounts).reduce((a, b) => (tagCounts[a] > tagCounts[b] ? a : b), null);

        res.status(200).json({
            guestId,
            totalRecords: userRecords.length,
            tagsUsage,
            period,
            selectedDate: `${selectedYear}-${String(selectedMonth + 1).padStart(2, "0")}`,
            lastUpdated: new Date().toISOString(),
            highlightedTag,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "태그 통계를 불러오는데 실패했습니다." });
    }
};
