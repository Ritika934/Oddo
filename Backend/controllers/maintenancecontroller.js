import { validationResult } from "express-validator";
import { refreshCache } from "../src/jobs/queues.js";
import {
  logMaintenance,
  closeMaintenanceTicket,
  fetchAllMaintenance,
  fetchMaintenanceById
} from "../src/services/maintenanceservices.js";

// Log/Start Maintenance (POST /)
export const startMaintenance = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const record = await logMaintenance(req.body);
    await refreshCache();

    return res.status(201).json({
      message: "Maintenance logged successfully, vehicle put in shop",
      record
    });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};
// Complete/Close Maintenance (PATCH /:id/complete)
export const completeMaintenance = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const record = await closeMaintenanceTicket(id, req.body);
    await refreshCache();

    return res.status(200).json({
      message: "Maintenance ticket closed, vehicle is now available",
      record
    });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

// List Maintenance records (GET /)
export const getMaintenanceList = async (req, res) => {
  try {
    const {
      search = "",
      status = "",
      page = 1,
      limit = 10
    } = req.query;

    const records = await fetchAllMaintenance(
      search,
      status,
      Number(page),
      Number(limit)
    );

    return res.status(200).json({
      message: "Maintenance records fetched successfully",
      count: records.length,
      records
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// Get single Maintenance record (GET /:id)
export const getMaintenance = async (req, res) => {
  try {
    const { id } = req.params;
    const record = await fetchMaintenanceById(id);
    return res.status(200).json({
      message: "Maintenance record fetched successfully",
      record
    });
  } catch (error) {
    return res.status(404).json({ message: error.message });
  }
};
