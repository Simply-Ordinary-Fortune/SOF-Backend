import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export const getTagStatistics = async (req, res) => {
    const { userId } = req.params;
    const { period = "monthly" } = req.query;

    if (!["monthly", "yearly"].includes(period)) {
        return res.status(400).json({ error: "기간을 설정해주세요" });
    }

    try {
        const userRecords = await prisma.record.findMany({
            where: { userId: parseInt(userId) },
        });

        if (userRecords.length === 0) {
            return res.status(404).json({ error: "유저를 찾을 수 없습니다" });
        }

        const now = new Date();
        const filteredRecords = userRecords.filter((record) => {
            const recordDate = new Date(record.createdAt);
            if (period === "monthly") {
                return recordDate.getFullYear() === now.getFullYear() && recordDate.getMonth() === now.getMonth();
            } else if (period === "yearly") {
                return recordDate.getFullYear() === now.getFullYear();
            }
        });

        const tagCounts = {};
        let totalTags = 0;

        filteredRecords.forEach((record) => {
            record.tags.forEach((tag) => {
                tagCounts[tag] = (tagCounts[tag] || 0) + 1;
                totalTags += 1;
            });
        });

        const tagsUsage = {};
        for (const tag in tagCounts) {
            tagsUsage[tag] = `${((tagCounts[tag] / totalTags) * 100).toFixed(2)}%`;
        }

        const highlightedTag = Object.keys(tagCounts).reduce((a, b) => (tagCounts[a] > tagCounts[b] ? a : b));

        res.status(200).json({
            userId: parseInt(userId),
            totalRecords: filteredRecords.length,
            tagsUsage,
            period,
            selectedDate: period === "monthly" ? `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}` : `${now.getFullYear()}`,
            lastUpdated: new Date().toISOString(),
            highlightedTag,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "태그 통계를 불러오는데 실패했습니다" });
    }
};
