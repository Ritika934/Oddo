import express from "express";
import { createVehicleValidator } from "../src/validators/vehiclevalidators.js";
import {
  createVehicle,
  getVehicles,getVehicle,
   deleteVehicle,updateVehicle
} from "../controllers/vehiclecontroller.js";
const router = express.Router();

router.post("/", createVehicleValidator, createVehicle);
router.get("/", getVehicles);
router.get("/:id", getVehicle);
router.delete("/:id", deleteVehicle);
router.put("/:id", createVehicleValidator, updateVehicle);
export default router;

