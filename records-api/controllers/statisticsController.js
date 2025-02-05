const mockData = [
    {
        id: 101,
        userId: 1,
        date: "2025-01-05",
        content: "한줄 기록 내용",
        tags: ["자연의 선물", "일상 속 기쁨"],
        imageUrl: "https://example.com/photos/record1.jpg",
        createdAt: "2025-01-05T10:00:00.000Z",
        lastUpdated: "2025-01-21T10:00:00.000Z",
    },
    {
        id: 102,
        userId: 1,
        date: "2025-01-15",
        content: "두번째 기록",
        tags: ["뜻밖의 친절", "우연한 행운"],
        imageUrl: "https://example.com/photos/record2.jpg",
        createdAt: "2025-01-15T15:30:00.000Z",
    },
    {
        id: 103,
        userId: 1,
        date: "2025-01-20",
        content: "세번째 기록",
        tags: ["자연의 선물", "예상 못한 선물"],
        imageUrl: "https://example.com/photos/record3.jpg",
        createdAt: "2025-01-20T08:00:00.000Z",
    },
];

// 태그 분포 통계 조회
const getTagStatistics = (req, res) => {
    const { userId } = req.params;
    const { period = "monthly" } = req.query;

    if (!["monthly", "yearly"].includes(period)) {
        return res.status(400).json({ error: "Invalid period. Available values are 'monthly' or 'yearly'." });
    }

    const userRecords = mockData.filter(record => record.userId === parseInt(userId));

    if (userRecords.length === 0) {
        return res.status(404).json({ error: "User not found." });
    }

    const now = new Date();
    const filteredRecords = userRecords.filter(record => {
        const recordDate = new Date(record.date);
        if (period === "monthly") {
            return (
                recordDate.getFullYear() === now.getFullYear() &&
                recordDate.getMonth() === now.getMonth()
            );
        } else if (period === "yearly") {
            return recordDate.getFullYear() === now.getFullYear();
        }
    });

    const tagCounts = {};
    let totalTags = 0;

    filteredRecords.forEach(record => {
        record.tags.forEach(tag => {
            tagCounts[tag] = (tagCounts[tag] || 0) + 1;
            totalTags += 1;
        });
    });

    const tagsUsage = {};
    for (const tag in tagCounts) {
        tagsUsage[tag] = `${((tagCounts[tag] / totalTags) * 100).toFixed(2)}%`;
    }

    const highlightedTag = Object.keys(tagCounts).reduce((a, b) =>
        tagCounts[a] > tagCounts[b] ? a : b
    );

    res.status(200).json({
        userId: parseInt(userId),
        totalRecords: filteredRecords.length,
        tagsUsage,
        period,
        selectedDate:
            period === "monthly"
                ? `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`
                : `${now.getFullYear()}`,
        lastUpdated: new Date().toISOString(),
        highlightedTag,
    });
};

module.exports = { getTagStatistics };
