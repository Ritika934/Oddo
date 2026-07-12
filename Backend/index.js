import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import "./config/Db.js";
import authRoutes from "./routes/authroutes.js";
import vehicleRoutes from "./routes/vehicleroutes.js";
dotenv.config();

const app=express();

app.use(cors());
app.use(express.json());
app.use("/api/auth",authRoutes);
app.use("/api/vehicles", vehicleRoutes);
const PORT=process.env.PORT;

app.listen(PORT,()=>{
    console.log(`Server running on ${PORT}`);
});