import express from "express";
import { getDashboardStats } from "../controllers/dashboardcontroller.js";

const router = express.Router();

router.get("/stats", getDashboardStats);

export default router;
