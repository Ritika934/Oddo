import express from "express";
import cors from "cors";
import "./config/env.js";
import "./config/Db.js";
import authRoutes from "./routes/authroutes.js";
import vehicleRoutes from "./routes/vehicleroutes.js";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/vehicles", vehicleRoutes);

const PORT = process.env.PORT;

app.listen(PORT, () => {
    console.log(`Server running on ${PORT}`);
});