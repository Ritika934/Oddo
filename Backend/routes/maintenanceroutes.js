import express from "express";
import { createMaintenanceValidator, closeMaintenanceValidator } from "../src/validators/maintenancevalidators.js";
import {
  startMaintenance,
  completeMaintenance,
  getMaintenanceList,
  getMaintenance
} from "../controllers/maintenancecontroller.js";

const router = express.Router();

router.post("/", createMaintenanceValidator, startMaintenance);
router.get("/", getMaintenanceList);
router.get("/:id", getMaintenance);
router.patch("/:id/complete", closeMaintenanceValidator, completeMaintenance);

export default router;
