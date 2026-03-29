import express from "express";
import { alertsController } from "../controllers/alerts.controller.js";

const router = express.Router();

// POST /alerts - יצירת התראה
router.post("/", alertsController.addAlert);

router.get("/nearby", alertsController.getNearbyAlerts);

export default router;