import express from "express";
import cors from "cors";
import "./config/env.js";
import "./config/Db.js";
import authRoutes from "./routes/authroutes.js";
import vehicleRoutes from "./routes/vehicleroutes.js";
import driverRoutes from "./routes/driverroutes.js";
import tripRoutes from "./routes/triproutes.js";
import dashboardRoutes from "./routes/dashboardroutes.js";
import maintenanceRoutes from "./routes/maintenanceroutes.js";
import fuelRoutes from "./routes/fuelroutes.js";
import expenseRoutes from "./routes/expenseroutes.js";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/vehicles", vehicleRoutes);
app.use("/api/drivers", driverRoutes);
app.use("/api/trips", tripRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/maintenance", maintenanceRoutes);
app.use("/api/fuel", fuelRoutes);
app.use("/api/expenses", expenseRoutes);

import redisConnection from "./config/redis.js";

const PORT = process.env.PORT;

app.listen(PORT, async () => {
    console.log(`Server running on ${PORT}`);
    
    // Check local running Redis server version dynamically
    let useBullMQ = false;
    try {
      const redisInfo = await redisConnection.info();
      const match = redisInfo.match(/redis_version:([0-9.]+)/);
      if (match) {
        const version = match[1];
        const major = parseInt(version.split(".")[0]);
        console.log(`Detected Redis version: ${version}`);
        if (major >= 5) {
          useBullMQ = true;
        } else {
          console.warn(`Redis version ${version} is lower than 5.0.0. BullMQ streams unsupported.`);
        }
      }
    } catch (err) {
      console.warn("Could not retrieve Redis server telemetry info:", err.message);
    }

    try {
      if (useBullMQ) {
        const { startBullMQ } = await import("./src/jobs/bullmqScheduler.js");
        await startBullMQ();
      } else {
        const { startInMemoryScheduler } = await import("./src/jobs/inMemoryScheduler.js");
        startInMemoryScheduler();
      }
    } catch (schedErr) {
      console.error("Failed to initialize background simulation schedulers:", schedErr);
    }
});