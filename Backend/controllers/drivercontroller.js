import { validationResult } from "express-validator";
import {
  addDriver,
  fetchAllDrivers,
  fetchDriverById,
  editDriver,
  removeDriver,
} from "../src/services/driverservices.js";
// Create Driver
export const createDriver = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        errors: errors.array(),
      });
    }

    const driver = await addDriver(req.body);

    return res.status(201).json({
      message: "Driver created successfully",
      driver,
    });
  } catch(error){
    return res.status(400).json({
      message:error.message,
    });
  }
};



// Get All Drivers
export const getDrivers = async (req,res)=>{
  try{
    const {
      search = "",
      status = "",
      page = 1,
      limit = 10
    } = req.query;

    const drivers = await fetchAllDrivers(
      search,
      status,
      Number(page),
      Number(limit)
    );

    return res.status(200).json({
      message:"Drivers fetched successfully",
      count:drivers.length,
      drivers,
    });
  }catch(error){
    return res.status(500).json({
      message:error.message,
    });
  }
};



// Get Driver By ID
export const getDriver = async(req,res)=>{

  try{

    const {id}=req.params;


    const driver = await fetchDriverById(id);


    return res.status(200).json({
      message:"Driver fetched successfully",
      driver,
    });


  }catch(error){

    return res.status(404).json({
      message:error.message,
    });

  }

};



// Update Driver
export const updateDriver = async(req,res)=>{
  try{
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        errors: errors.array(),
      });
    }

    const {id}=req.params;

    const updatedDriver = await editDriver(
      id,
      req.body
    );

    return res.status(200).json({
      message:"Driver updated successfully",
      driver:updatedDriver,
    });
  }catch(error){
    return res.status(400).json({
      message:error.message,
    });
  }
};



// Suspend Driver
export const suspendDriver = async(req,res)=>{

  try{

    const {id}=req.params;
    const driver = await removeDriver(id);
    return res.status(200).json({
      message:"Driver suspended successfully",
      driver,
    });

  }catch(error){
    return res.status(400).json({
      message:error.message,
    });
  }

};