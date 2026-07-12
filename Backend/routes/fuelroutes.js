import express from "express";
import { fuelLogValidator } from "../src/validators/fuelvalidators.js";
import {
  createLog,
  getLogs,
  getLog,
  updateLog,
  deleteLog,
  getEfficiency
} from "../controllers/fuelcontroller.js";

const router = express.Router();

router.post("/", fuelLogValidator, createLog);
router.get("/", getLogs);
router.get("/efficiency/:vehicleId", getEfficiency);
router.get("/:id", getLog);
router.put("/:id", fuelLogValidator, updateLog);
router.delete("/:id", deleteLog);

export default router;
