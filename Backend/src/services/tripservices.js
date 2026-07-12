import pool from "../../config/Db.js";
import { getVehicleById, updateVehicle } from "../repositories/vehiclerepo.js";
import { getDriverById, updateDriver } from "../repositories/driverrepo.js";
import { createTrip, getTripById, updateTrip, getAllTrips } from "../repositories/triprepo.js";
import { addGpsLog } from "../repositories/gpsrepo.js";

// Create Draft Trip
export const createDraftTrip = async (tripData) => {
  console.log("vehicle")
  const vehicle = await getVehicleById(tripData.vehicle_id);
  if (!vehicle) {
    throw new Error("Vehicle not found");
  }

  // Check if driver exists
  const driver = await getDriverById(tripData.driver_id);
  if (!driver) {
    throw new Error("Driver not found");
  }

  const trip = await createTrip({
    ...tripData,
    status: "Draft",
    odometer_start: null,
    odometer_end: null
  });

  return trip;
};

// Dispatch Trip
export const dispatchTrip = async (id) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const trip = await getTripById(id, client);
    if (!trip) {
      throw new Error("Trip not found");
    }

    if (trip.status !== "Draft") {
      throw new Error(`Cannot dispatch a trip that is in '${trip.status}' status`);
    }

    // Fetch latest vehicle and driver state within transaction
    const vehicle = await getVehicleById(trip.vehicle_id, client);
    const driver = await getDriverById(trip.driver_id, client);

    if (!vehicle) {
      throw new Error("Vehicle associated with this trip not found");
    }
    if (!driver) {
      throw new Error("Driver associated with this trip not found");
    }

    // Business validations
    if (vehicle.status !== "Available") {
      throw new Error(`Vehicle ${vehicle.registration_number} is not available (Current status: ${vehicle.status})`);
    }

    if (driver.status !== "Available") {
      throw new Error(`Driver ${driver.name} is not available (Current status: ${driver.status})`);
    }

    const expiryDate = new Date(driver.license_expiry);
    const today = new Date();
    // Normalize today to start of day for simple comparison
    today.setHours(0, 0, 0, 0);
    if (expiryDate < today) {
      throw new Error(`Driver's license is expired (Expired on: ${driver.license_expiry})`);
    }

    if (Number(trip.cargo_weight) > Number(vehicle.max_load_capacity)) {
      throw new Error(`Cargo weight (${trip.cargo_weight} kg) exceeds vehicle maximum capacity (${vehicle.max_load_capacity} kg)`);
    }

    // Update statuses
    trip.status = "Dispatched";
    trip.odometer_start = vehicle.odometer;
    await updateTrip(id, trip, client);

    vehicle.status = "On Trip";
    await updateVehicle(trip.vehicle_id, vehicle, client);

    driver.status = "On Trip";
    await updateDriver(trip.driver_id, driver, client);

    await client.query("COMMIT");

    // Fetch updated trip to return
    const updatedTrip = await getTripById(id);
    return updatedTrip;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

// Complete Trip
export const completeTrip = async (id, odometerEnd) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const trip = await getTripById(id, client);
    if (!trip) {
      throw new Error("Trip not found");
    }

    if (trip.status !== "Dispatched") {
      throw new Error(`Cannot complete a trip that is in '${trip.status}' status`);
    }

    const vehicle = await getVehicleById(trip.vehicle_id, client);
    const driver = await getDriverById(trip.driver_id, client);

    if (Number(odometerEnd) < Number(trip.odometer_start)) {
      throw new Error(`Ending odometer reading (${odometerEnd}) cannot be less than starting odometer (${trip.odometer_start})`);
    }

    // Update statuses
    trip.status = "Completed";
    trip.odometer_end = odometerEnd;
    await updateTrip(id, trip, client);

    vehicle.status = "Available";
    vehicle.odometer = odometerEnd;
    await updateVehicle(trip.vehicle_id, vehicle, client);

    driver.status = "Available";
    await updateDriver(trip.driver_id, driver, client);

    await client.query("COMMIT");

    const updatedTrip = await getTripById(id);
    return updatedTrip;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

// Cancel Trip
export const cancelTrip = async (id) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const trip = await getTripById(id, client);
    if (!trip) {
      throw new Error("Trip not found");
    }

    if (trip.status === "Cancelled" || trip.status === "Completed") {
      throw new Error(`Cannot cancel a trip that is already '${trip.status}'`);
    }

    // If it was dispatched, we must free the vehicle and driver
    if (trip.status === "Dispatched") {
      const vehicle = await getVehicleById(trip.vehicle_id, client);
      const driver = await getDriverById(trip.driver_id, client);

      if (vehicle) {
        vehicle.status = "Available";
        await updateVehicle(trip.vehicle_id, vehicle, client);
      }

      if (driver) {
        driver.status = "Available";
        await updateDriver(trip.driver_id, driver, client);
      }
    }

    trip.status = "Cancelled";
    await updateTrip(id, trip, client);

    await client.query("COMMIT");

    const updatedTrip = await getTripById(id);
    return updatedTrip;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

// Fetch all trips (search, filter, paginate)
export const fetchAllTrips = async (search, status, page, limit) => {
  return await getAllTrips(search, status, page, limit);
};

// Fetch single trip
export const fetchTripById = async (id) => {
  const trip = await getTripById(id);
  if (!trip) {
    throw new Error("Trip not found");
  }
  return trip;
};
