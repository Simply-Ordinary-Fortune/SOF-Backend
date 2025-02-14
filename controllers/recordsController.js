import express from "express";
import multer from "multer";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const router = express.Router();
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "uploads/");
    },
    filename: (req, file, cb) => {
        const originalExt = file.originalname.split(".").pop();
        const newFilename = `${Date.now()}-${Math.round(Math.random() * 1e9)}.${originalExt}`;
        cb(null, newFilename);
    },
});

export const upload = multer({ storage });

// 기록 생성
export const createRecord = async (req, res) => {
    const guestId = req.headers["guest-id"];
    const { content, tags } = req.body;
    const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;

    if (!guestId || !content) {
        return res.status(400).json({ error: "guest-id와 content는 필수입니다." });
    }
    try {
        const user = await prisma.user.findUnique({
            where: { guestId: guestId },
        });

        if (!user) {
            return res.status(404).json({ error: "해당 guestId를 가진 사용자가 존재하지 않습니다." });
        }

        const newRecord = await prisma.record.create({
            data: {
                content,
                tags: Array.isArray(tags) ? tags : JSON.parse(tags),
                imageUrl,
                user: { connect: { id: user.id } }, 
            },
        });

        res.status(201).json(newRecord);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "기록을 저장하는데 실패했습니다." });
    }
};

// 기록 삭제
export const deleteRecord = async (req, res) => {
    const guestId = req.headers["guest-id"];
    const { recordId } = req.params;

    if (!guestId || !recordId) {
        return res.status(400).json({ error: "guest-id와 recordId가 필요합니다." });
    }

    try {
        const user = await prisma.user.findUnique({
            where: { guestId: guestId },
        });

        if (!user) {
            return res.status(404).json({ error: "해당 guestId를 가진 사용자가 존재하지 않습니다." });
        }

        const existingRecord = await prisma.record.findUnique({
            where: { id: parseInt(recordId) },
        });

        if (!existingRecord || existingRecord.userId !== user.id) {
            return res.status(404).json({ error: "해당 기록이 존재하지 않거나 권한이 없습니다." });
        }

        await prisma.record.delete({ where: { id: parseInt(recordId) } });
        res.status(204).send();
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "기록을 삭제하는데 실패했습니다." });
    }
};

// 특정 날짜의 기록 조회
export const getRecordByDate = async (req, res) => {
    const guestId = req.headers["guest-id"];
    const { date } = req.query;

    if (!guestId || !date) {
        return res.status(400).json({ error: "guest-id와 date가 필요합니다." });
    }

    try {
        const user = await prisma.user.findUnique({
            where: { guestId: guestId },
        });

        if (!user) {
            return res.status(404).json({ error: "User not found with the provided guestId" });
        }

        const records = await prisma.record.findMany({
            where: {
                userId: user.id,  
                createdAt: {
                    gte: new Date(`${date}T00:00:00.000Z`),
                    lt: new Date(`${date}T23:59:59.999Z`),
                },
            },
            orderBy: { createdAt: "asc" },
        });

        res.status(200).json(records);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "기록을 가져오는 데 실패했습니다." });
    }
};

// 캘린더 태그 조회
export const getCalendarRecords = async (req, res) => {
    const guestId = req.headers["guest-id"];
    const { year, month } = req.query;

    if (!guestId || !year || !month) {
        return res.status(400).json({ error: "guest-id, year, and month are required." });
    }

    try {
        const startOfMonth = new Date(`${year}-${month}-01`);
        const endOfMonth = new Date(startOfMonth);
        endOfMonth.setMonth(endOfMonth.getMonth() + 1);

        const user = await prisma.user.findUnique({
            where: { guestId: guestId },
        });

        if (!user) {
            return res.status(404).json({ error: "User not found with the provided guestId" });
        }
        const records = await prisma.record.findMany({
            where: {
                userId: user.id,  
                createdAt: { gte: startOfMonth, lt: endOfMonth },
            },
        });

        const groupedRecords = {};

        records.forEach(record => {
            const date = record.createdAt.toISOString().split('T')[0];  
            if (!groupedRecords[date]) {
                groupedRecords[date] = [];
            }
            groupedRecords[date].push(record);
        });

        const result = Object.keys(groupedRecords).map(date => {
            const recordsForDate = groupedRecords[date];

            const tagFrequency = {};

            recordsForDate.forEach(record => {
                record.tags.forEach(tag => {
                    tagFrequency[tag] = (tagFrequency[tag] || 0) + 1;
                });
            });

            let mostFrequentTag = '';
            let maxFrequency = 0;

            for (const [tag, count] of Object.entries(tagFrequency)) {
                if (count > maxFrequency) {
                    maxFrequency = count;
                    mostFrequentTag = tag;
                }
            }

            return {
                date,
                tags: mostFrequentTag ? [mostFrequentTag] : [],
                hasRecord: mostFrequentTag !== '',
            };
        });

        res.status(200).json(result);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to fetch calendar records" });
    }
};

// 사진 기록 조회
export const getPhotoRecords = async (req, res) => {
    const guestId = req.headers["guest-id"];
    const { year, month } = req.query;

    if (!guestId) {
        return res.status(400).json({ error: "guest-id가 필요합니다." });
    }

    try {
        const user = await prisma.user.findUnique({
            where: { guestId: guestId },
        });

        if (!user) {
            return res.status(404).json({ error: "guest-id를 찾을 수 없습니다" });
        }

        const now = new Date();
        const selectedYear = year ? parseInt(year, 10) : now.getFullYear();
        let startDate, endDate;

        if (month) {
            const selectedMonth = parseInt(month, 10) - 1;
            startDate = new Date(Date.UTC(selectedYear, selectedMonth, 1, 0, 0, 0));
            endDate = new Date(Date.UTC(selectedYear, selectedMonth + 1, 1, 0, 0, 0));
        } else {
            startDate = new Date(Date.UTC(selectedYear, 0, 1, 0, 0, 0));
            endDate = new Date(Date.UTC(selectedYear + 1, 0, 1, 0, 0, 0));
        }

        console.log(`📌 검색 범위: ${startDate.toISOString()} ~ ${endDate.toISOString()}`);

        const records = await prisma.record.findMany({
            where: {
                userId: user.id,
                createdAt: { gte: startDate, lt: endDate },
                imageUrl: { not: null },
            },
        });

        const result = {
            userId: user.id,
            year: year || now.getFullYear(),
            month: month || null,
            photos: records.map(record => ({
                imageUrl: record.imageUrl,
                createdAt: record.createdAt.toISOString(),
            })),
        };

        res.status(200).json(result);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "사진 조회에 실패했습니다." });
    }
};
