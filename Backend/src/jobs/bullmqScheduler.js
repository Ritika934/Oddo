import { Queue, Worker } from "bullmq";
import redisConnection from "../../config/redis.js";
import pool from "../../config/Db.js";
import { compileAndCacheStats } from "./analyticsHelper.js";
import { addGpsLog } from "../repositories/gpsrepo.js";
import { completeTrip } from "../services/tripservices.js";

const CITY_COORDS = {
  delhi: [28.6139, 77.2090],
  jaipur: [26.9124, 75.7873],
  mumbai: [19.0760, 72.8777],
  pune: [18.5204, 73.8567],
  bangalore: [12.9716, 77.5946],
  chennai: [13.0827, 80.2707],
  kolkata: [22.5726, 88.3639],
  hyderabad: [17.3850, 78.4867]
};

export let analyticsQueue = null;
export let maintenanceQueue = null;
export let gpsQueue = null;

export const startBullMQ = async () => {
  console.log("Initializing BullMQ Queues and Workers...");
  global.useBullMQ = true;

  // Initialize Queues
  analyticsQueue = new Queue("analytics-queue", { connection: redisConnection });
  maintenanceQueue = new Queue("maintenance-queue", { connection: redisConnection });
  gpsQueue = new Queue("gps-queue", { connection: redisConnection });

  // Initialize Workers
  const analyticsWorker = new Worker(
    "analytics-queue",
    async (job) => {
      console.log(`[BullMQ] Processing analytics job ${job.id}...`);
      await compileAndCacheStats();
    },
    { connection: redisConnection }
  );

  const maintenanceWorker = new Worker(
    "maintenance-queue",
    async (job) => {
      console.log(`[BullMQ] Running scheduled preventative maintenance scan...`);
      try {
        const { rows: vehicles } = await pool.query("SELECT * FROM vehicles WHERE status = 'Available'");
        for (const vehicle of vehicles) {
          const odometerDiff = Number(vehicle.odometer);
          if (odometerDiff >= 10000) {
            console.log(`Preventative Alert (BullMQ): Vehicle ${vehicle.registration_number} odometer ${vehicle.odometer} km. Auto logging maintenance.`);
            const client = await pool.connect();
            try {
              await client.query("BEGIN");
              await client.query(`
                INSERT INTO maintenance (vehicle_id, description, status, start_date)
                VALUES ($1, 'Automated preventative service: Odometer exceeded 10,000 km threshold', 'In Shop', CURRENT_TIMESTAMP)
              `, [vehicle.id]);
              await client.query("UPDATE vehicles SET status = 'In Shop' WHERE id = $1", [vehicle.id]);
              await client.query("COMMIT");
            } catch (e) {
              await client.query("ROLLBACK");
              console.error("Auto maintenance failed:", e);
            } finally {
              client.release();
            }
          }
        }
      } catch (err) {
        console.error("Maintenance scan failed:", err);
      }
    },
    { connection: redisConnection }
  );

  const gpsWorker = new Worker(
    "gps-queue",
    async (job) => {
      console.log("[BullMQ] Running background GPS simulation step...");
      try {
        const { rows: trips } = await pool.query("SELECT * FROM trips WHERE status = 'Dispatched'");
        for (const trip of trips) {
          const parts = trip.route.split(/➔|→/);
          const startCity = parts[0]?.trim().toLowerCase();
          const endCity = parts[1]?.trim().toLowerCase();
          
          const startCoords = CITY_COORDS[startCity] || [28.6139, 77.2090];
          const endCoords = CITY_COORDS[endCity] || [26.9124, 75.7873];
          
          const elapsed = (Date.now() - new Date(trip.updated_at).getTime()) / 1000;
          const pct = Math.min(1.0, elapsed / 120);
          
          const lat = startCoords[0] + (endCoords[0] - startCoords[0]) * pct;
          const lng = startCoords[1] + (endCoords[1] - startCoords[1]) * pct;
          
          await addGpsLog(trip.id, lat, lng);
          
          if (pct >= 1.0) {
            console.log(`Trip ${trip.code} completed (BullMQ). Arrived at destination.`);
            const endOdo = Number(trip.odometer_start) + 300;
            await completeTrip(trip.id, endOdo);
            await compileAndCacheStats();
          }
        }
      } catch (err) {
        console.error("GPS simulation failed:", err);
      }
    },
    { connection: redisConnection }
  );

  // Register repeatable cron jobs
  await maintenanceQueue.add("odometer-scan", {}, {
    repeat: { pattern: "*/5 * * * *" }
  });

  await gpsQueue.add("gps-simulation", {}, {
    repeat: { every: 10000 }
  });

  console.log("BullMQ started and repeatable background jobs registered successfully.");
};
