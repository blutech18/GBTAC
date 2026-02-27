# GBTAC — Green Building Technology Access Centre Dashboard

A full-stack web application for monitoring and visualizing sensor data from the SAIT Green Building Technology Access Centre (GBTAC). Built as a capstone project at the Southern Alberta Institute of Technology (SAIT).

---

## Overview

The GBTAC Dashboard provides real-time and historical data visualization for environmental sensors installed throughout the GBTAC building. Staff and administrators can monitor ambient temperature, wall temperature, energy consumption, natural gas usage, water levels, and more — with interactive charts, date filtering, and PDF export capabilities.

---

## System Architecture

```
capstone-gbtac/     → Next.js 15 frontend (React 19, Tailwind CSS 4)
gbtac-backend/      → FastAPI backend (Python, pyodbc)
SQL Server Express  → Local database (gbtac_db)
Firebase            → Authentication & user management
```

---

## Features

- **Role-based access control** — Staff, Admin, and Guest roles via Firebase Authentication
- **Interactive dashboards** — Ambient Temperature, Wall Temperature, Energy, Natural Gas, Water Level
- **Adaptive chart aggregation** — Automatically adjusts data resolution based on selected date range:
  - Same day → per-minute averages
  - 2–60 days → daily averages
  - 61–730 days → monthly averages
  - 2+ years → yearly averages
- **Floor-level filtering** — Filter wall temperature data by Basement, 1st Floor, or 2nd Floor
- **Date range picker** — Query any historical range from October 2018 to December 2025
- **Export to PDF** — Print/export any dashboard chart
- **Save Screen** — Persist dashboard state (dates, filters) across sessions
- **Admin panel** — Manage staff accounts and dashboard access

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 15, React 19, Tailwind CSS 4 |
| Charts | Chart.js 4, react-chartjs-2, chartjs-plugin-zoom |
| Backend | FastAPI, Python 3, pyodbc |
| Database | Microsoft SQL Server Express |
| Auth | Firebase Authentication + Firestore |
| Deployment | Local / SAIT infrastructure |

---

## Project Structure

```
capstone-gbtac/
├── app/
│   ├── (admin)/            Admin-only pages (account manager, dashboard manager)
│   ├── (guest)/            Public pages (login, about, dashboard overview)
│   ├── (staff)/            Staff pages (all dashboards, profile, reports)
│   │   └── dashboards/
│   │       ├── ambient-temperature/
│   │       ├── wall-temperature/
│   │       ├── energy/
│   │       ├── natural-gas/
│   │       ├── water-level/
│   │       └── customizable-graphs/
│   ├── _components/        Shared UI components
│   │   └── graphs/
│   │       └── handlers/   LineHandler — core chart data fetcher
│   └── _utils/             Firebase auth context

gbtac-backend/
├── main.py                 FastAPI app entry point
├── config.py               Database connection config
├── routers/
│   └── graphs.py           Sensor data & name API endpoints
├── requirements.txt
└── setup_db.sql / migrate_real_schema.sql
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- Python 3.10+
- Microsoft SQL Server Express with ODBC Driver 17
- Firebase project (for authentication)

### 1. Backend Setup

```bash
cd gbtac-backend

# Install dependencies
pip install -r requirements.txt

# Create .env from template
copy .env.example .env
# Edit .env with your SQL Server instance details

# Set up the database
sqlcmd -S "localhost\SQLEXPRESS" -E -i migrate_real_schema.sql

# Load sensor data (update CSV path first)
sqlcmd -S "localhost\SQLEXPRESS" -E -d gbtac_db -i ..\gbtac_insert.sql

# Start backend
python -m uvicorn main:app --reload
# Runs at http://127.0.0.1:8000
```

### 2. Frontend Setup

```bash
cd capstone-gbtac

# Install dependencies
npm install

# Start development server
npm run dev
# Runs at http://localhost:3000
```

### 3. Environment Variables

Create `gbtac-backend/.env`:
```
SERVER=localhost\SQLEXPRESS
DATABASE=gbtac_db
DRIVER={ODBC Driver 17 for SQL Server}
```

Firebase credentials are configured in `app/_utils/firebase.js`.

---

## API Endpoints

| Endpoint | Description |
|---|---|
| `GET /graphs/data/{sensor_code}?start=YYYY-MM-DD&end=YYYY-MM-DD` | Returns aggregated sensor readings for a date range |
| `GET /graphs/name/{sensor_code}` | Returns the human-readable display name for a sensor |

**Example:**
```
http://127.0.0.1:8000/graphs/data/20000_TL92?start=2025-01-01&end=2025-12-31
```

---

## Sensor Mapping

### Ambient Temperature
| Sensor Code | Name |
|---|---|
| 20000_TL92 | Ambient Temperature — Zone 1 |
| 20000_TL93 | Ambient Temperature — Zone 2 |

### Wall Temperature
| Floor | Sensor Codes |
|---|---|
| Basement | 20003_TL2, 20004_TL2, 20005_TL2, 20006_TL2 |
| 1st Floor | 20007_TL2 – 20011_TL2 |
| 2nd Floor | 20012_TL2 – 20016_TL2, 20016_TL5 |

All sensor column names in the database are prefixed with `SaitSolarLab_`.

---

## User Roles

| Role | Access |
|---|---|
| **Guest** | View public dashboard overview and about page |
| **Staff** | Access all dashboards, reports, profile, saved charts |
| **Admin** | All staff access + account management + dashboard management |

User accounts are managed through Firebase. Staff/Admin access is controlled via the `allowedUsers` Firestore collection with an `active` flag and `role` field.

---

## Capstone Project

**Institution:** Southern Alberta Institute of Technology (SAIT)  
**Client:** GBTAC — Green Building Technology Access Centre  
**Year:** 2026
