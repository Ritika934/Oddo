import {
  findDriverByLicense,
  createDriver,
  getAllDrivers,
  getDriverById,
  updateDriver,
  suspendDriver,
} from "../repositories/driverrepo.js";

// Create Driver
export const addDriver = async (driverData) => {

  const existingDriver = await findDriverByLicense(
    driverData.license_number
  );


  if (existingDriver) {
    throw new Error("Driver with this license number already exists.");
  }


  const driver = await createDriver(driverData);

  return driver;
};



// Get All Drivers
export const fetchAllDrivers = async () => {

  return await getAllDrivers();

};

// Get Driver By ID
export const fetchDriverById = async (id) => {

  const driver = await getDriverById(id);


  if (!driver) {
    throw new Error("Driver not found");
  }
  return driver;
};



// Update Driver
export const editDriver = async (id, driverData) => {
  const existingDriver = await getDriverById(id);
  if (!existingDriver) {
    throw new Error("Driver not found");
  }
  const driverWithSameLicense =
    await findDriverByLicense(driverData.license_number);
  if (
    driverWithSameLicense &&
    Number(driverWithSameLicense.id) !== Number(id)
  ) {
    throw new Error("License number already exists");
  }



  const updatedDriver = await updateDriver(
    id,
    driverData
  );

  return updatedDriver;

};



// Suspend Driver
export const removeDriver = async (id) => {
  const driver = await getDriverById(id);
  if (!driver) {
    throw new Error("Driver not found");
  }
  if (driver.status === "Suspended") {
    throw new Error("Driver is already suspended");
  }
const suspendedDriver = await suspendDriver(id);
  return suspendedDriver;

};