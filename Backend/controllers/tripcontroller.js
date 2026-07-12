import { validationResult } from "express-validator";
import { refreshCache } from "../src/jobs/queues.js";
import { getGpsLogsForTrip } from "../src/repositories/gpsrepo.js";
import {
  createDraftTrip,
  dispatchTrip,
  completeTrip,
  cancelTrip,
  fetchAllTrips,
  fetchTripById
} from "../src/services/tripservices.js";

// Create Trip
export const createTrip = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const trip = await createDraftTrip(req.body);
    await refreshCache();

    return res.status(201).json({
      message: "Trip created successfully",
      trip
    });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

// Get All Trips
export const getTrips = async (req, res) => {
  try {
    const {
      search = "",
      status = "",
      page = 1,
      limit = 10
    } = req.query;

    const trips = await fetchAllTrips(
      search,
      status,
      Number(page),
      Number(limit)
    );

    return res.status(200).json({
      message: "Trips fetched successfully",
      count: trips.length,
      trips
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// Get Trip by ID
export const getTrip = async (req, res) => {
  try {
    const { id } = req.params;
    const trip = await fetchTripById(id);
    return res.status(200).json({
      message: "Trip fetched successfully",
      trip
    });
  } catch (error) {
    return res.status(404).json({ message: error.message });
  }
};

// Dispatch Trip
export const dispatchTripApi = async (req, res) => {
  try {
    const { id } = req.params;
    const trip = await dispatchTrip(id);
    return res.status(200).json({
      message: "Trip dispatched successfully",
      trip
    });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

// Complete Trip
export const completeTripApi = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const { odometer_end } = req.body;

    const trip = await completeTrip(id, odometer_end);
    await refreshCache();

    return res.status(200).json({
      message: "Trip completed successfully",
      trip
    });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

// Cancel Trip
export const cancelTripApi = async (req, res) => {
  try {
    const { id } = req.params;
    const trip = await cancelTrip(id);
    await refreshCache();

    return res.status(200).json({
      message: "Trip cancelled successfully",
      trip
    });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

// Fetch GPS Logs
export const getGpsLogsApi = async (req, res) => {
  try {
    const { id } = req.params;
    const logs = await getGpsLogsForTrip(id);
    return res.status(200).json({
      message: "GPS logs fetched successfully",
      logs
    });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};
