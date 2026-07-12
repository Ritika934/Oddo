import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import "./config/Db.js";
import authRoutes from "./routes/authroutes.js";

dotenv.config();

const app=express();

app.use(cors());
app.use(express.json());
app.use("/api/auth",authRoutes);

const PORT=process.env.PORT;

app.listen(PORT,()=>{
    console.log(`Server running on ${PORT}`);
});