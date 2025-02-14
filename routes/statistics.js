import express from "express";
import { getTagStatistics } from "../controllers/statisticsController.js";

const router = express.Router();

router.get("/user", getTagStatistics);

export default router;
