const mockData = [
    {
        id: 101,
        userId: 1,
        date: "2025-01-05",
        content: "한줄 기록 내용",
        tags: ["자연의 선물"],
        imageUrl: "https://example.com/photos/record1.jpg",
        createdAt: "2025-01-05T10:00:00.000Z",
    },
    {
        id: 102,
        userId: 1,
        date: "2025-01-21",
        content: "두번째 기록",
        tags: ["뜻밖의 친절"],
        imageUrl: "https://example.com/photos/record2.jpg",
        createdAt: "2025-01-21T15:30:00.000Z",
    },
];

// 이미지 업로드 및 기록 생성
const addRecord = (req, res) => {
    const { userId, content, tags } = req.body;
    const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;

    if (!userId || !content || !imageUrl) {
        return res.status(400).json({ error: "userId, content, or image is required." });
    }

    const newRecord = {
        id: Math.floor(Math.random() * 1000), 
        userId,
        content,
        tags: tags ? JSON.parse(tags) : [],
        imageUrl,
        createdAt: new Date().toISOString(),
    };

    mockData.push(newRecord);
    res.status(201).json(newRecord);
};

//기록 조회
const getRecordsByDate = (req, res) => {
    const { userId, year, month } = req.query;

    if (!userId || !year || !month) {
        return res.status(400).json({ error: "userId, year, and month are required." });
    }

    const filteredData = mockData.filter(record => {
        const recordDate = new Date(record.date);
        return (
            record.userId === parseInt(userId) &&
            recordDate.getFullYear() === parseInt(year) &&
            recordDate.getMonth() + 1 === parseInt(month)
        );
    });

    if (filteredData.length > 0) {
        res.status(201).json({
            userId: parseInt(userId),
            year: parseInt(year),
            month: parseInt(month),
            days: filteredData.map(record => ({
                date: record.date,
                tags: record.tags,
                hasRecord: true,
            })),
        });
    } else {
        res.status(404).json({ error: "No records" });
    }
};

// 특정 날짜 기록 조회
const getRecordBySpecificDate = (req, res) => {
    const { userId, date } = req.query;

    if (!userId || !date) {
        return res.status(400).json({ error: "userId and date are required." });
    }

    const record = mockData.find(
        record => record.userId === parseInt(userId) && record.date === date
    );

    if (record) {
        res.status(201).json({
            userId: parseInt(userId),
            date,
            record,
        });
    } else {
        res.status(404).json({ error: "No record found for the specified date." });
    }
};

// 사용자 사진 조회
const getPhotosByDateOrMonth = (req, res) => {
    const { userId, year, month } = req.query;

    if (!userId) {
        return res.status(400).json({ error: "userId is required." });
    }

    let filteredData;

    if (year && month) {
        filteredData = mockData.filter(record => {
            const recordDate = new Date(record.date);
            return (
                record.userId === parseInt(userId) &&
                recordDate.getFullYear() === parseInt(year) &&
                recordDate.getMonth() + 1 === parseInt(month)
            );
        });
    } else {
        const today = new Date().toISOString().split("T")[0];
        filteredData = mockData.filter(
            record => record.userId === parseInt(userId) && record.date === today
        );
    }

    if (filteredData.length > 0) {
        res.status(201).json({
            userId: parseInt(userId),
            year: year ? parseInt(year) : undefined,
            month: month ? parseInt(month) : undefined,
            photos: filteredData.map(record => ({
                imageUrl: record.imageUrl,
                createdAt: record.createdAt,
            })),
        });
    } else {
        res.status(404).json({ error: "No photos found for the specified month." });
    }
};

// 기록 삭제
const deleteRecord = (req, res) => {
    const { id } = req.params;

    const recordIndex = mockData.findIndex(record => record.id === parseInt(id));

    if (recordIndex !== -1) {
        mockData.splice(recordIndex, 1);
        res.status(204).send();
    } else {
        res.status(404).json({ error: "Record not found." });
    }
};

module.exports = {
    addRecord,
    getRecordsByDate,
    getRecordBySpecificDate,
    getPhotosByDateOrMonth,
    deleteRecord,
};
