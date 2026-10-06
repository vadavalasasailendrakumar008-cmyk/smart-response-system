# 🚨 RescuOS — Smart Emergency Response & Dispatch System

> **Next-Generation Real-Time Emergency Management Platform** featuring AI-powered triage analysis, geospatial incident mapping, automated responder dispatch, and live SSE status streaming.

---

## 🌟 Key Features

- **🚨 Real-Time Incident Reporting**: Fast emergency reporting with precise interactive map pin location selection (Leaflet), categories (Fire, Medical, Crime, Hazard, Traffic), severity assessment, and caller tracking.
- **🧠 AI-Powered Priority Triage**: Automated priority scoring and resource recommendations powered by Google Gemini 2.5 Flash (with resilient expert-rule fallback when operating offline).
- **📡 Live Real-Time Dispatch Stream**: Instant live updates using Server-Sent Events (SSE) and optional Supabase Realtime synchronization.
- **🗺️ Interactive Map & Geolocation**: Live incident pins with dynamic severity halos, reverse geocoding coordinates, and proximity calculations.
- **🛡️ Emergency Management Dashboard**: High-density triage console with category and status filters, audit logging, audio alert siren synthesizer, and analytics breakdown.
- **🔐 Role-Based Access Control**: Separate workflows and permissions for Citizens, Responders, and Emergency Administrators.
- **🌐 Zero-Config Public Tunneling**: One-click scripts to generate instant public URLs for mobile testing or multi-device demos with zero passwords.

---

## 🏗️ Architecture

```
smart-response-system/
├── src/                          # Frontend Application (React 18 + TypeScript + Vite + TailwindCSS)
│   ├── components/               # UI components (dashboard, emergency form, audio, maps)
│   ├── pages/                    # Views (AdminDashboard, ReportIncident, IncidentDetails)
│   ├── services/                 # API client, Audio synthesizer, SSE Realtime stream
│   └── shared/                   # Shared TypeScript models and type definitions
├── server/                       # Backend Application (Node.js + Express + TypeScript)
│   ├── config/                   # Supabase client, loadEnv helper, SSE emitter
│   ├── middleware/               # Auth token inspection and validation
│   ├── routes/                   # Auth, incident CRUD, analytics endpoints
│   └── services/                 # Gemini 2.5 Flash AI Triage service
├── supabase/
│   └── schema.sql                # Complete PostgreSQL schema with RLS and realtime publication
├── start-tunnel.bat              # One-click Windows public tunnel runner
├── start-tunnel.ps1              # Auto-reconnecting tunnel launcher
├── .env.example                  # Environment architecture documentation
├── .env.frontend.example         # Frontend environment template
└── .env.backend.example          # Backend environment template
```

---

## 🚀 Quick Start

### 1. Prerequisites
- **Node.js** (v18 or newer)
- **npm**

### 2. Installation
```bash
git clone https://github.com/vadavalasasailendrakumar008-cmyk/smart-response-system.git
cd smart-response-system
npm install
```

### 3. Environment Setup
The project uses separated environment files for frontend and backend:

```bash
# Frontend (.env)
cp .env.frontend.example .env

# Backend (server/.env)
cp .env.backend.example server/.env
```

*(Note: Both the frontend and backend include high-fidelity in-memory engines and expert fallbacks, meaning the entire system runs out-of-the-box even without external API keys).*

### 4. Running the Development Environment
Run both the Express server (`:5000`) and the Vite client (`:5173`) concurrently:
```bash
npm run dev
```

- **Frontend**: [http://localhost:5173](http://localhost:5173)
- **Backend API**: [http://localhost:5000/api/v1](http://localhost:5000/api/v1)
- **Health Check**: [http://localhost:5000/api/v1/health](http://localhost:5000/api/v1/health)

---

## 🌐 Public Tunneling (Demoing on Mobile)

To share the application or test on a mobile device outside your local network:
```bash
npm run tunnel:direct
```
*(Or double-click `start-tunnel.bat` on Windows).*

---

## 🧪 Testing & Verification
```bash
# Run TypeScript compilation checks
npm run lint

# Build production bundle
npm run build
```

---

## 📄 License
MIT License. Built for modern emergency response and rapid disaster dispatch.
