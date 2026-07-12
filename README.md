# 🚚 TransitOps – AI-Powered Smart Transport Operations Platform
TransitOps is a full-stack, enterprise-ready fleet and transport logistics platform built to replace fragmented spreadsheet-based tracking. Designed for modern logistics operations, the platform manages the entire lifecycle of vehicles, drivers, dispatch assignments, maintenance, and expenses under strict compliance guardrails, real-time GPS simulations, and high-performance caching.
---
## 🏗 System Architecture & Optimization
TransitOps is engineered with a scalable, high-concurrency micro-architecture:
```
                  ┌──────────────────────────────┐
                  │    React.js Frontend (Vite)  │
                  └──────────────┬───────────────┘
                                 │ REST API / JWT
                                 ▼
                  ┌──────────────────────────────┐
                  │    Express.js Backend API    │
                  └──────┬───────────────┬───────┘
                         │               │
       ┌─────────────────▼───┐       ┌───▼─────────────────┐
       │   Redis Cache Layer │       │  PostgreSQL (Neon)  │
       │   (Dashboard KPIs)  │       │  (Transaction Safe) │
       └─────────────────────┘       └───────────▲─────────┘
                                                 │
                                     ┌───────────┴─────────┐
                                     │   Dynamic Job &     │
                                     │  Telemetry Engine   │
                                     └─────────────────────┘
```
### 🏎 High-Speed Caching (Redis)
All dashboard KPI cards, trip counts, utilization metrics, and cost aggregations are stored in a centralized Redis cache.
- **Cache Hit Performance**: Retrieve complex analytics queries in **under 5 milliseconds**.
- **Cache Invalidation**: Write/update operations (trips dispatched, completed, maintenance logs, etc.) instantly delete the cached key, triggers background pre-heating, and keeps the manager’s views synchronized.
### 🛡 ACID Transaction Safeguards
Database queries use PostgreSQL transactional boundaries (`BEGIN/COMMIT/ROLLBACK`). Dispatches are atomic: assigning a vehicle and driver updates their statuses synchronously inside a single SQL transaction. If either check fails, the database rollback prevents partial bookings and data corruption.
### ⚙ Telemetry & Background Job Engine
TransitOps features a dynamically adjusting worker engine:
* **Production Mode (BullMQ)**: If local/cloud Redis versions support streams (v5.0+), background jobs (preventative maintenance scanner, telemetry simulations) are offloaded to BullMQ queues.
* **Compatibility Fallback Mode (In-Memory)**: If a legacy Redis version is detected, the server automatically mounts interval-based simulation threads, ensuring **100% plug-and-play portability** without configuration changes.
---
## ✨ Features & Functionality
### 🔐 Authentication & RBAC
- JSON Web Token (JWT) session security.
- Email Verification via Nodemailer (integrated with Ethereal SMTP test platform).
- **Role-Based Access Control (RBAC)** restricting dispatch access, financial cost views, and safety audit tools to authorised roles:
  * **Fleet Manager**: Master registry operations, maintenance lifecycle.
  * **Dispatcher**: Trip dispatch, weight validations, live tracking dashboard.
  * **Safety Officer**: License validity oversight, safety scores.
  * **Financial Analyst**: Expense audit, ROI calculations, CSV exports.
### 🚛 Vehicle Registry
- Complete tracking of plate registration, cargo load capabilities, and odometers.
- Dynamic status states: `Available`, `On Trip`, `In Shop`, `Retired`.
- Automatic preventative service logs triggered if vehicle travel odometer exceeds 10,000 km.
### 👨‍✈️ Driver Compliance
- Track driver profiles, contact details, safety metrics, and license categories.
- Automatic verification blocking assignment of suspended drivers or expired licenses.
### 📦 Trip Dispatch & Live GPS Tracking
- Validates that the cargo weight does not exceed the vehicle's capacity.
- **Live SVG Telemetry**: Watch dispatched vehicles crawl across custom SVG map paths mapped between cities, simulating real-time GPS telemetry.
- Telemetry simulation auto-completes trips upon destination arrival, updating the odometer and releasing the vehicle and driver back to `Available`.
### 🔧 Maintenance Management
- Register maintenance tickets to automatically put vehicles `In Shop`.
- Locks the vehicle out of the dispatch board registry until the ticket is marked complete with logged repair costs.
### ⛽ Fuel & Expense Tracking
- Compute trip fuel efficiency (km/liter) based on successive odometer readings.
- Aggregate costs (fuel logs, tolls, maintenance bills) per vehicle.
### 📊 Reports, Analytics, & Exports
- Dynamic calculation of Vehicle Return on Investment (ROI):
  $$\text{ROI} = \frac{\text{Revenue} - (\text{Maintenance} + \text{Fuel})}{\text{Acquisition Cost}}$$
- Fully-interactive charts rendering utilization trends.
- **Export CSV** download trigger and print-friendly styling.
---
## 🛠 Tech Stack
* **Frontend**: React (Vite), Tailwind CSS (Solid Charcoal Theme), DaisyUI, Recharts, React Icons, Axios.
* **Backend**: Node.js, Express.js, Express Validator, pg.
* **Database**: PostgreSQL (Neon Database).
* **Caching & Queues**: Redis, BullMQ (with dynamic fallback).
* **Mailing**: Nodemailer.
* **AI Integration**: Gemini API (Intelligent Dispatch Chat Assistant).
---
## 🚀 Getting Started
### 1. Environment Configuration
Create a `.env` file in the root directory:
```env
PORT=5000
DATABASE_URL=postgresql://neondb_owner:YOUR_CREDENTIALS@YOUR_HOST/neondb?sslmode=require
REDIS_URL=redis://127.0.0.1:4000
JWT_SECRET=your_jwt_secret_key_here
GEMINI_API_KEY=your_gemini_api_key_here
```
### 2. Seeding Tables
Execute the query definitions in `database_setup.sql` on your Neon Console to configure schemas for `users`, `vehicles`, `drivers`, `trips`, `maintenance`, `fuel_logs`, `expenses`, and `gps_logs`.
### 3. Installation
```bash
# Install backend dependencies
cd Backend
npm install
# Install frontend dependencies
cd ../Frontend
npm install
```
### 4. Running Dev Servers
```bash
# Start Backend
cd Backend
npm start
# Start Frontend
cd ../Frontend
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.
