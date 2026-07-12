import { validationResult } from "express-validator";
import { refreshCache } from "../src/jobs/queues.js";
import { addVehicle, fetchAllVehicles,  fetchVehicleById, editVehicle,  removeVehicle,} from "../src/services/vehicleservices.js";

export const createVehicle = async (req, res) => {
  try {
    // Check validation errors
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({
        errors: errors.array(),
      });
    }

    // Call service
    const vehicle = await addVehicle(req.body);
    await refreshCache();

    return res.status(201).json({
      message: "Vehicle created successfully",
      vehicle,
    });

  } catch (error) {
    return res.status(400).json({
      message: error.message,
    });
  }
};
export const updateVehicle = async (req, res) => {
  try {
    const { id } = req.params;

    const updatedVehicle = await editVehicle(id, req.body);
    await refreshCache();

    return res.status(200).json({
      message: "Vehicle updated successfully",
      vehicle: updatedVehicle,
    });
  } catch (error) {
    return res.status(400).json({
      message: error.message,
    });
  }
};
export const deleteVehicle = async (req, res) => {
  try {
    const { id } = req.params;

    const vehicle = await removeVehicle(id);
    await refreshCache();

    return res.status(200).json({
      message: "Vehicle retired successfully",
      vehicle,
    });
  } catch (error) {
    return res.status(400).json({
      message: error.message,
    });
  }
};
export const getVehicles = async (req, res) => {
  try {
    const {
      search = "",
      status = "",
      type = "",
      page = 1,
      limit = 10
    } = req.query;

    const vehicles = await fetchAllVehicles(
      search,
      status,
      type,
      page,
      limit
    );

    return res.status(200).json({
      message: "Vehicles fetched successfully",
      count: vehicles.length,
      vehicles,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};
export const getVehicle = async (req, res) => {
  try {
    const { id } = req.params;

    const vehicle = await fetchVehicleById(id);

    return res.status(200).json({
      message: "Vehicle fetched successfully",
      vehicle,
    });
  } catch (error) {
    return res.status(404).json({
      message: error.message,
    });
  }
};
