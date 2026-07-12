import express from "express";
import { createDriverValidator } from "../src/validators/drivervalidators.js";
import {
  createDriver,
  getDrivers,
  getDriver,
  updateDriver,
  suspendDriver,
} from "../controllers/drivercontroller.js";


const router = express.Router();
// Create Driver
router.post( "/", createDriverValidator, createDriver);
// Get All Drivers
router.get( "/", getDrivers);
// Get Driver By ID
router.get("/:id",  getDriver);
// Update Driver
router.put( "/:id", createDriverValidator, updateDriver);
// Suspend Driver
router.patch( "/:id/suspend", suspendDriver);


export default router;