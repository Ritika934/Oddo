import express from "express";
import cors from "cors";
import "./config/env.js";
import "./config/Db.js";
import authRoutes from "./routes/authroutes.js";
import vehicleRoutes from "./routes/vehicleroutes.js";
import driverRoutes from "./routes/driverroutes.js";
import tripRoutes from "./routes/triproutes.js";
import dashboardRoutes from "./routes/dashboardroutes.js";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/vehicles", vehicleRoutes);
app.use("/api/drivers", driverRoutes);
app.use("/api/trips", tripRoutes);
app.use("/api/dashboard", dashboardRoutes);

const PORT = process.env.PORT;

app.listen(PORT, () => {
    console.log(`Server running on ${PORT}`);
});