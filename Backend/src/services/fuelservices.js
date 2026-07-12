import { getVehicleById } from "../repositories/vehiclerepo.js";
import {
  createFuelLog,
  getFuelLogById,
  getAllFuelLogs,
  updateFuelLog,
  deleteFuelLog,
  getFuelLogsForVehicle
} from "../repositories/fuelrepo.js";

// Create Fuel Log
export const addFuelLog = async (data) => {
  const vehicle = await getVehicleById(data.vehicle_id);
  if (!vehicle) {
    throw new Error("Vehicle not found");
  }
  return await createFuelLog(data);
};

// Fetch all Fuel Logs
export const fetchAllFuelLogs = async (vehicle_id, page, limit) => {
  return await getAllFuelLogs(vehicle_id, page, limit);
};

// Fetch single Fuel Log
export const fetchFuelLogById = async (id) => {
  const log = await getFuelLogById(id);
  if (!log) {
    throw new Error("Fuel log not found");
  }
  return log;
};

// Update Fuel Log
export const editFuelLog = async (id, data) => {
  const existingLog = await getFuelLogById(id);
  if (!existingLog) {
    throw new Error("Fuel log not found");
  }

  const vehicle = await getVehicleById(data.vehicle_id);
  if (!vehicle) {
    throw new Error("Vehicle not found");
  }

  return await updateFuelLog(id, data);
};

// Delete Fuel Log
export const removeFuelLog = async (id) => {
  const existingLog = await getFuelLogById(id);
  if (!existingLog) {
    throw new Error("Fuel log not found");
  }
  return await deleteFuelLog(id);
};

// Calculate Fuel Efficiency
export const calculateFuelEfficiency = async (vehicle_id) => {
  const vehicle = await getVehicleById(vehicle_id);
  if (!vehicle) {
    throw new Error("Vehicle not found");
  }

  const logs = await getFuelLogsForVehicle(vehicle_id);
  if (logs.length < 2) {
    return {
      vehicle_id,
      registration_number: vehicle.registration_number,
      vehicle_name: vehicle.vehicle_name,
      average_efficiency: 0,
      unit: "km/L",
      history: []
    };
  }

  const history = [];
  let totalDistance = 0;
  let totalLiters = 0;

  for (let i = 1; i < logs.length; i++) {
    const prevLog = logs[i - 1];
    const currLog = logs[i];

    const distance = Number(currLog.odometer) - Number(prevLog.odometer);
    const liters = Number(currLog.liters);
    
    // Safety check in case odometer reading is lower or liters is zero (which shouldn't happen due to validators)
    const efficiency = liters > 0 ? (distance / liters) : 0;

    totalDistance += distance;
    totalLiters += liters;

    history.push({
      log_id: currLog.id,
      fill_date: currLog.fill_date,
      odometer_start: prevLog.odometer,
      odometer_end: currLog.odometer,
      distance: Number(distance.toFixed(2)),
      liters: Number(liters.toFixed(2)),
      efficiency: Number(efficiency.toFixed(2))
    });
  }

  const averageEfficiency = totalLiters > 0 ? (totalDistance / totalLiters) : 0;

  return {
    vehicle_id,
    registration_number: vehicle.registration_number,
    vehicle_name: vehicle.vehicle_name,
    average_efficiency: Number(averageEfficiency.toFixed(2)),
    unit: "km/L",
    history
  };
};
