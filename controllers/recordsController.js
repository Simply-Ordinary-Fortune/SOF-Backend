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
    const { userId, content, tags } = req.body;
    const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;

    if (!userId || !content) {
        return res.status(400).json({ error: "userId와 content는 필수입니다." });
    }

    try {
        const newRecord = await prisma.record.create({
            data: {
                userId: parseInt(userId),
                content,
                tags: tags ? JSON.parse(tags) : [],
                imageUrl,
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
    const { recordId } = req.params;
    if (!recordId) {
        return res.status(400).json({ error: "recordId가 없습니다" });
    }
    try {
        const existingRecord = await prisma.record.findUnique({ where: { id: parseInt(recordId) } });
        if (!existingRecord) {
            return res.status(404).json({ error: "해당 기록이 존재하지 않습니다." });
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
    const { userId, date } = req.query;
    if (!userId || !date) {
        return res.status(400).json({ error: "userId와 date가 없습니다" });
    }
    try {
        const records = await prisma.record.findMany({
            where: {
                userId: parseInt(userId),
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

// 달력 기록 조회
export const getCalendarRecords = async (req, res) => {
    const { userId, year, month } = req.query;
    if (!userId || !year || !month) {
        return res.status(400).json({ error: "userId, year, and month are required." });
    }
    try {
        const startOfMonth = new Date(`${year}-${month}-01`);
        const endOfMonth = new Date(startOfMonth);
        endOfMonth.setMonth(endOfMonth.getMonth() + 1);
        const records = await prisma.record.findMany({
            where: {
                userId: parseInt(userId),
                createdAt: { gte: startOfMonth, lt: endOfMonth },
            },
        });
        res.status(200).json(records);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to fetch calendar records" });
    }
};

// 사진 기록 조회
export const getPhotoRecords = async (req, res) => {
    const { userId, year, month } = req.query;
    if (!userId) {
        return res.status(400).json({ error: "userId is required." });
    }
    try {
        let records;
        if (year && month) {
            const startOfMonth = new Date(`${year}-${month}-01`);
            const endOfMonth = new Date(startOfMonth);
            endOfMonth.setMonth(endOfMonth.getMonth() + 1);
            records = await prisma.record.findMany({
                where: {
                    userId: parseInt(userId),
                    createdAt: { gte: startOfMonth, lt: endOfMonth },
                    imageUrl: { not: null },
                },
            });
        } else {
            const today = new Date().toISOString().split("T")[0];
            records = await prisma.record.findMany({
                where: {
                    userId: parseInt(userId),
                    createdAt: { gte: new Date(today), lt: new Date(today + "T23:59:59.999Z") },
                    imageUrl: { not: null },
                },
            });
        }
        res.status(200).json(records);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "사진 조회에 실패했습니다." });
    }
};
