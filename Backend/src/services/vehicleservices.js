import {
  findVehicleByRegistration,
  createVehicle, getAllVehicles,  getVehicleById,updateVehicle,retireVehicle,
} from "../repositories/vehiclerepo.js";

export const addVehicle = async (vehicleData) => {
 
  const existingVehicle = await findVehicleByRegistration(
    vehicleData.registration_number
  );

  if (existingVehicle) {
    throw new Error("Vehicle with this registration number already exists.");
  }

  // Create vehicle
  const newVehicle = await createVehicle(vehicleData);

  return newVehicle;
};
export const fetchAllVehicles = async (
  search,
  status,
  page,
  limit
) => {

  return await getAllVehicles(
    search,
    status,
    page,
    limit
  );

};
export const fetchVehicleById = async (id) => {
  const vehicle = await getVehicleById(id);

  if (!vehicle) {
    throw new Error("Vehicle not found");
  }

  return vehicle;
};
export const editVehicle = async (id, vehicleData) => {

  // Check if vehicle exists
  const existingVehicle = await getVehicleById(id);

  if (!existingVehicle) {
    throw new Error("Vehicle not found");
  }

  // Check if registration number is already used by another vehicle
  const vehicleWithSameRegistration =
    await findVehicleByRegistration(vehicleData.registration_number);

  if (
    vehicleWithSameRegistration &&
    vehicleWithSameRegistration.id !== id
  ) {
    throw new Error("Registration number already exists");
  }

  // Update vehicle
  const updatedVehicle = await updateVehicle(id, vehicleData);

  return updatedVehicle;
};
export const removeVehicle = async (id) => {
  // Check if vehicle exists
  const vehicle = await getVehicleById(id);

  if (!vehicle) {
    throw new Error("Vehicle not found");
  }

  // Check if already retired
  if (vehicle.status === "Retired") {
    throw new Error("Vehicle is already retired");
  }

  // Soft delete (retire)
  const retiredVehicle = await retireVehicle(id);

  return retiredVehicle;
};