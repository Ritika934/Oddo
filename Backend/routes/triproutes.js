import express from "express";
import { createTripValidator, completeTripValidator } from "../src/validators/tripvalidators.js";
import {
  createTrip,
  getTrips,
  getTrip,
  dispatchTripApi,
  completeTripApi,
  cancelTripApi
} from "../controllers/tripcontroller.js";

const router = express.Router();

router.post("/", createTripValidator, createTrip);
router.get("/", getTrips);
router.get("/:id", getTrip);
router.patch("/:id/dispatch", dispatchTripApi);
router.patch("/:id/complete", completeTripValidator, completeTripApi);
router.patch("/:id/cancel", cancelTripApi);

export default router;
