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

export const startInMemoryScheduler = () => {
  console.log("Initializing In-Memory Simulation Engine Fallback...");
  global.useBullMQ = false;

  // Run GPS Tracker Simulation step every 10 seconds
  setInterval(async () => {
    console.log("[In-Memory] Simulating vehicle GPS locations...");
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
        console.log(`[In-Memory] Trip ${trip.code} simulated coordinates: ${lat.toFixed(4)}, ${lng.toFixed(4)}`);

        if (pct >= 1.0) {
          console.log(`[In-Memory] Trip ${trip.code} has arrived. Auto-completing...`);
          const endOdo = Number(trip.odometer_start) + 300;
          await completeTrip(trip.id, endOdo);
          await compileAndCacheStats();
        }
      }
    } catch (err) {
      console.error("[In-Memory] GPS simulation step failed:", err);
    }
  }, 10000);

  // Run Maintenance Odometer Check every 5 minutes (300000ms)
  setInterval(async () => {
    console.log("[In-Memory] Checking vehicle odometers for scheduled maintenance alert...");
    try {
      const { rows: vehicles } = await pool.query("SELECT * FROM vehicles WHERE status = 'Available'");
      for (const vehicle of vehicles) {
        if (Number(vehicle.odometer) >= 10000) {
          console.log(`[In-Memory] Preventative Maintenance Alert: Vehicle ${vehicle.registration_number} odometer is ${vehicle.odometer} km.`);
          const client = await pool.connect();
          try {
            await client.query("BEGIN");
            await client.query(`
              INSERT INTO maintenance (vehicle_id, description, status, start_date)
              VALUES ($1, 'Automated preventative service: Odometer exceeded 10,000 km threshold', 'In Shop', CURRENT_TIMESTAMP)
            `, [vehicle.id]);
            await client.query("UPDATE vehicles SET status = 'In Shop' WHERE id = $1", [vehicle.id]);
            await client.query("COMMIT");
            console.log(`[In-Memory] Successfully logged maintenance work order for vehicle ${vehicle.registration_number}`);
          } catch (e) {
            await client.query("ROLLBACK");
            console.error("[In-Memory] Failed to create auto-maintenance ticket:", e);
          } finally {
            client.release();
          }
        }
      }
    } catch (err) {
      console.error("[In-Memory] Maintenance scan failed:", err);
    }
  }, 300000);

  console.log("In-Memory Simulation Engine started successfully.");
};
