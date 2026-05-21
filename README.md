# Workload Verification System

A web-based platform for managing and reviewing academic staff workload data at UWA.  
The system helps academic staff, Heads of Department, Head of School, and School Operations staff review workload allocations, identify validation issues, and manage workload-related queries through role-based views.

---

## Prerequisites

- [Node.js](https://nodejs.org/) v18 or higher
- npm, included with Node.js

---

## Getting Started

### Clone the repository

```bash
git clone https://github.com/NeelPatel-22/Workload-Verification-System.git
cd Workload-Verification-System
```
---

### Backend Setup

Open a terminal from the project root:
```
cd backend
npm install
npm run dev
```
The backend runs at:

```http://localhost:5000```

You can test the backend by opening:

```http://localhost:5000/api/health```

Expected response:
```
{
  "success": true,
  "message": "Backend is healthy"
}
```
---

### Frontend Setup

Open a new terminal from the project root:
```
cd frontend
npm install
```
Create a .env file inside the frontend folder:
```
VITE_API_URL=http://localhost:5000
```
Then start the frontend:
```
npm run dev
```
The frontend runs at:

```http://localhost:5173```

---

## Important Setup Note

The frontend requires the `.env` file to connect to the backend API.

If the `.env` file is missing, some pages may show errors such as:

```Unexpected token '<', "<!doctype "... is not valid JSON```

This means the frontend is receiving an HTML page instead of JSON, usually because it is not calling the backend API correctly.

---

## Demo Accounts

All demo accounts use the password: `password`

| Username      | Role               | Department  |
| ------------- | ------------------ | ----------- |
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

#### Staff

Staff users can:

- view their own workload allocation
- view validation issues related to their workload
- submit workload queries or correction requests
- view the status of their own submitted queries

#### Head of Department

Heads of Department can:

- view workload data for their own department
- view validation issues for their department
- review staff workload queries
- approve or decline queries with comments

#### Head of School and School Operations

Head of School and School Operations users can:

- view school-wide workload summaries
- view all validation issues
- view all workload queries
- access reporting pages
- access the import data page

---

## Current MVP Authentication

The current version uses demo authentication with predefined users.

The backend checks demo usernames and passwords and returns a user object to the frontend.
Protected backend routes use the logged-in username through request headers.

This is suitable for the MVP/demo version.
Future development should replace this with production-ready authentication using sessions or tokens, hashed passwords, and database-backed user management.

---

## Current Backend Data

The current MVP backend uses mock workload, validation issue, and query data inside the backend server.

This allows the main workflows to run without requiring a database setup on the tutor’s machine.

Future development can move this data into SQLite or another database.

---

## Importing Workload Data

Only users with the following roles can import workload files:

- `hos` (Head of School)
- `ops` (School Operations)

After logging in:

1. Navigate to the **Import Data** page from the sidebar.
2. The page contains separate upload sections for each workload source file.
3. For each file upload:
   - select the relevant workload year from the dropdown (`2024`, `2025`, or `2026`)
   - choose the corresponding Excel workbook (`.xlsx` or `.xlsm`)
   - upload the file

The import workflow is designed around the client-provided workload spreadsheets.

---

### Supported Import Files

The system currently supports importing the following workload-related files:

| File Type | Purpose |
|---|---|
| Staff Information | Academic staff details and workload classifications |
| Unit Information | Teaching units associated with the school |
| Service Roles | Non-teaching service and assigned roles |
| Teaching Allocation | Teaching workload allocations |
| HDR Supervision | HDR supervision workload data |
| Assigned Role Allocation | Administrative and leadership workload allocation |

---

### Year Selection

Before uploading each file, the user must select the relevant workload year:

- `2024`
- `2025`
- `2026`

The selected year is used to associate uploaded workload data with the correct reporting cycle.

Example workflow:

1. Select `2025` from the dropdown
2. Upload `Dummy_Workload_History_2025`

---

### Expected Workbook Sheets

The uploaded workbooks may contain sheets such as:

- Source Information – Staff
- Source Information – Units
- Source Information – Roles
- Data Entry – Teaching
- Data Entry – HDR
- Data Entry – Assigned Role

The import service reads and processes the relevant sheets automatically.

---

### Validation Checks

After import, the system applies workload validation checks to identify possible inconsistencies such as:

- workload total mismatches
- FTE overload or underload
- teaching and research band mismatches
- missing allocation data
- inconsistent workload distributions
- incomplete assigned role allocations

Detected issues are displayed in the validation and dashboard pages for review.

---

### Notes

- Excel files should remain in their original client-provided format.
- Modified sheet names or column structures may cause import failures.
- Large files may take several seconds to process.
- Importing new data for the same year may overwrite previously imported demo data.

---

## Running Tests

From the frontend folder:
```
cd frontend
npm test
```
This runs frontend unit tests using Vitest and React Testing Library.

---

## Project Structure
## Project Structure

```text
Workload-Verification-System/
│
├── backend/
│   ├── package.json
│   └── server.js
│
├── frontend/
│   ├── package.json
│   ├── .env
│   └── src/
│       ├── pages/
│       ├── context/
│       ├── mock/
│       └── ProtectedRoute.jsx
│
└── docs/
```

---

## API Overview
### Authentication
```POST /api/auth/login```

Logs in a demo user.

```GET /api/auth/me```

Returns the current user based on the request header.

---

### Workloads
```
GET /api/workloads/my
```
Returns the logged-in staff member’s own workload.
```
GET /api/workloads
```
Returns workload data based on role.

- HoD users receive department-level data
- HoS and Operations users receive school-wide data

---

### Validation Issues
```
GET /api/validation-issues/my
```
Returns validation issues for the logged-in staff member.
```
GET /api/validation-issues
```
Returns validation issues based on role.

- HoD users receive department-level issues
- HoS and Operations users receive all issues

---

### Queries
```
GET /api/queries/my
```
Returns queries submitted by the logged-in staff member.
```
POST /api/queries
```
Allows staff to submit a new workload query.
```
GET /api/queries
```
Returns queries based on role.

- HoD users receive department-level queries
- HoS and Operations users receive all queries
```
PATCH /api/queries/:id
```
Allows a HoD to approve or decline a query from their department.

## Troubleshooting

### Backend does not start

Make sure you are inside the backend folder:
```
cd backend
```
Then run:
```
npm install
npm run dev
```
If port `5000` is already in use, close the existing process or change the backend port.

### Frontend does not start

Make sure you are inside the frontend folder:
```
cd frontend
```
Then run:
```
npm install
npm run dev
```
