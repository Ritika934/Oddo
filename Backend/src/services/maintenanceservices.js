import pool from "../../config/Db.js";
import { getVehicleById, updateVehicle } from "../repositories/vehiclerepo.js";
import {
  createMaintenance,
  getMaintenanceById,
  getAllMaintenance,
  updateMaintenance
} from "../repositories/maintenancerepo.js";

// Log/Start Maintenance (Puts vehicle In Shop)
export const logMaintenance = async (maintenanceData) => {
  const { vehicle_id } = maintenanceData;

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // Fetch latest vehicle status within transaction
    const vehicle = await getVehicleById(vehicle_id, client);
    if (!vehicle) {
      throw new Error("Vehicle not found");
    }

    if (vehicle.status !== "Available") {
      throw new Error(`Vehicle ${vehicle.registration_number} is not available for maintenance (Current status: ${vehicle.status})`);
    }

    // Create maintenance record
    const record = await createMaintenance({
      ...maintenanceData,
      status: "In Shop",
      cost: 0
    }, client);

    // Update vehicle status
    vehicle.status = "In Shop";
    await updateVehicle(vehicle_id, vehicle, client);

    await client.query("COMMIT");
    return record;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

// Close Maintenance Ticket (Puts vehicle back to Available)
export const closeMaintenanceTicket = async (id, closeData) => {
  const { cost } = closeData;

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const record = await getMaintenanceById(id, client);
    if (!record) {
      throw new Error("Maintenance record not found");
    }

    if (record.status !== "In Shop") {
      throw new Error(`Cannot close a maintenance ticket that is already '${record.status}'`);
    }

    const vehicle = await getVehicleById(record.vehicle_id, client);
    if (!vehicle) {
      throw new Error("Vehicle associated with this maintenance record not found");
    }

    // Update maintenance record
    record.status = "Completed";
    record.cost = cost;
    record.end_date = new Date();
    const updatedRecord = await updateMaintenance(id, record, client);

    // Update vehicle status back to Available
    vehicle.status = "Available";
    await updateVehicle(record.vehicle_id, vehicle, client);

    await client.query("COMMIT");
    return updatedRecord;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

// List all maintenance records
export const fetchAllMaintenance = async (search, status, page, limit) => {
  return await getAllMaintenance(search, status, page, limit);
};

// Get single maintenance record
export const fetchMaintenanceById = async (id) => {
  const record = await getMaintenanceById(id);
  if (!record) {
    throw new Error("Maintenance record not found");
  }
  return record;
};
