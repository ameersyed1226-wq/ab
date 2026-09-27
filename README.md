# FoodSave Alliance — Surplus Food Rescue Ecosystem

A comprehensive, real-time surplus food rescue platform connecting Food Donors (Restaurants, Banquet Halls, Caterers), Volunteers / Couriers, and NGOs with an Admin Monitoring Panel.

## 🚀 Architecture Overview

1. **Unified Backend API (`server.js`)**:
   - Express.js REST API with CORS support.
   - Synchronized shared JSON database (`shared_database.json`).
   - Real-time GPS location tracking endpoint (`/api/tracking`).
   - Dynamic donation lifecycle management (`/api/donations`).
   - User authentication and role-based verification (`/api/users`).

2. **FoodSave App (`foodsave-master/foodsave-master`)**:
   - Modern React + TypeScript + Tailwind CSS application.
   - Real-time browser Geolocation GPS tracking.
   - Role switching (Food Donor & Volunteer Courier).
   - Live food posting with photo upload and verification pin.
   - Interactive Google Maps route display and handover checkpoints.

3. **Admin Monitoring Panel (`admin-panel`)**:
   - Executive Dashboard with Google Maps live GPS radar.
   - Real-time donation progress tracker (Posted → Accepted → Picked Up → Delivered).
   - Partner verification (FSSAI licenses & Aadhaar verification).
   - Live analytics & platform statistics.

## 📦 How to Run Locally

### 1. Start the Shared Backend Server
```bash
node server.js
# Runs on http://localhost:5000
```

### 2. Start Admin Panel
```bash
cd admin-panel
npm install
npm run dev
# Runs on http://localhost:3000
```

### 3. Start FoodSave App
```bash
cd foodsave-master/foodsave-master
npm install
npm run dev
# Runs on http://localhost:3001
```
