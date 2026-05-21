# Workload Verification System

A web-based platform for managing and reviewing academic staff workload data at UWA.
The system imports workload data from Excel spreadsheets, applies automated validation
rules, and provides role-based views for staff, heads of department, head of school,
and school operations staff.

---

## Prerequisites

- [Node.js](https://nodejs.org/) v18 or higher
- npm (included with Node.js)

---

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/NeelPatel-22/Workload-Verification-System.git
cd Workload-Verification-System
```

### 2. Start the backend

```bash
cd backend
npm install
node server.js
```

The backend runs at `http://localhost:5000`.  
A SQLite database (`database.sqlite`) is created automatically on first run and
seeded with demo users.

### 3. Start the frontend

Open a new terminal window:

```bash
cd frontend
npm install
npm run dev
```

The frontend runs at `http://localhost:5173`.

---

## Demo Accounts

All demo accounts use the password: `password`

| Username      | Role               | Department  |
|---------------|--------------------|-------------|
| `dummy01`     | Staff              | CSSE        |
| `dummy08`     | Staff              | Mathematics |
| `dummy14`     | Staff              | Physics     |
| `hod.csse`    | Head of Department | CSSE        |
| `hod.maths`   | Head of Department | Mathematics |
| `hod.physics` | Head of Department | Physics     |
| `hos`         | Head of School     | —           |
| `ops`         | School Operations  | —           |

---

## Features by Role

**Staff** — view own workload allocation; submit queries or correction requests (visible
only to the staff member and their HoD).

**Head of Department (HoD)** — view department-level workload data; review and respond
to staff queries.

**Head of School (HoS) / School Operations** — view school-wide workload summary;
import Excel workload files; access all queries; generate workload reports.

---

## Importing Workload Data

Log in as `hos` or `ops`, navigate to **Import Data**, and upload the client-provided
Excel workbook (`.xlsm` / `.xlsx`).  
The system reads the following sheets automatically:

- Source Information – Staff
- Source Information – Units
- Source Information – Roles
- Data Entry – Teaching
- Data Entry – HDR
- Data Entry – Assigned Role

After import, automated validation checks flag issues such as FTE overload/underload
and T:R band mismatches.

---

## Running Tests

```bash
cd frontend
npm test
```

Runs unit tests for `AuthContext` and `ProtectedRoute` using Vitest and
React Testing Library.

---

## Project Structure

```
Workload-Verification-System/
├── backend/
│   ├── server.js                  # Express API server
│   ├── db.js                      # SQLite setup and seed data
│   ├── validation.js              # Workload validation rules
│   └── services/
│       └── excelImportService.js  # Excel parsing logic
├── frontend/
│   ├── src/
│   │   ├── pages/                 # Role-based page components
│   │   ├── context/               # AuthContext (authentication)
│   │   ├── ProtectedRoute.jsx     # Route-level access control
│   │   └── test/                  # Unit tests
└── docs/                          # Project documentation
```
