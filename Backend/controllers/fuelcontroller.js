import { validationResult } from "express-validator";
import { refreshCache } from "../src/jobs/queues.js";
import {
  addFuelLog,
  fetchFuelLogById,
  fetchAllFuelLogs,
  editFuelLog,
  removeFuelLog,
  calculateFuelEfficiency
} from "../src/services/fuelservices.js";

// Create Fuel Log (POST /)
export const createLog = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const log = await addFuelLog(req.body);
    await refreshCache();

    return res.status(201).json({
      message: "Fuel log created successfully",
      log
    });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

// List Fuel Logs (GET /)
export const getLogs = async (req, res) => {
  try {
    const {
      vehicle_id = "",
      page = 1,
      limit = 10
    } = req.query;

    const logs = await fetchAllFuelLogs(
      vehicle_id,
      Number(page),
      Number(limit)
    );

    return res.status(200).json({
      message: "Fuel logs fetched successfully",
      count: logs.length,
      logs
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// Get single Fuel Log (GET /:id)
export const getLog = async (req, res) => {
  try {
    const { id } = req.params;
    const log = await fetchFuelLogById(id);
    return res.status(200).json({
      message: "Fuel log fetched successfully",
      log
    });
  } catch (error) {
    return res.status(404).json({ message: error.message });
  }
};

// Update Fuel Log (PUT /:id)
export const updateLog = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const log = await editFuelLog(id, req.body);
    await refreshCache();

    return res.status(200).json({
      message: "Fuel log updated successfully",
      log
    });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

// Delete Fuel Log (DELETE /:id)
export const deleteLog = async (req, res) => {
  try {
    const { id } = req.params;
    const log = await removeFuelLog(id);
    await refreshCache();

    return res.status(200).json({
      message: "Fuel log deleted successfully",
      log
    });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

// Get Fuel Efficiency (GET /efficiency/:vehicleId)
export const getEfficiency = async (req, res) => {
  try {
    const { vehicleId } = req.params;
    const stats = await calculateFuelEfficiency(vehicleId);
    return res.status(200).json({
      message: "Fuel efficiency statistics calculated successfully",
      stats
    });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};
