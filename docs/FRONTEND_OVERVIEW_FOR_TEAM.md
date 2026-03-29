# Frontend Prototype – Notes for the Team

**From:** Qiurong Chen  
**Purpose:** Short explanation of what is in the current frontend submission.

---

## What this is

The frontend is a **working UI prototype** for the Workload Verification System. It shows how **different roles** (Staff, Head of Department, Head of School, School Operations) would use the app.

- **Data is fake (mock data)** in `frontend/src/mock/mockData.js`. Nothing calls a real API yet.  
- **Login is for demo only.** It checks usernames and passwords from the mock user list and saves the current user in the browser’s **localStorage** so a **page refresh** does not log you out. This is **not** real security; the backend will handle real authentication later.

---

## Tech stack

| Part | Choice |
|------|--------|
| Build tool | Vite |
| UI | React |
| Components | Ant Design (antd) |
| Routing | React Router v6 |

Entry point: `frontend/src/main.jsx` → `App.jsx`.

---

## Project layout (main folders)

Inside `frontend/src/`:

- **`App.jsx`** – Route definitions (which URL shows which page).  
- **`context/AuthContext.jsx`** – Login state: `login`, `logout`, `currentUser`.  
- **`layouts/AppLayout.jsx`** – After login: left menu, top bar, main content area.  
- **`mock/mockData.js`** – Demo users, workload rows, validation messages, sample queries.  
- **`pages/`** – One folder per role group: `staff/`, `hod/`, `admin/` (HoS and Operations share `admin` routes).

---

## Roles and URLs

| Role | Route prefix | Default page after login |
|------|----------------|---------------------------|
| Academic Staff | `/staff/...` | My Workload |
| Head of Department | `/hod/...` | Department dashboard |
| Head of School & School Operations | `/admin/...` | School dashboard |

HoS and Operations use the **same menu and pages**; only the demo account’s `role` field differs.

---

## What each area does (high level)

**Login (`/login`)**  
Demo accounts in a dropdown; password for all demos is `password`. Submits to `AuthContext`, then redirects by role.

**Staff – My Workload**  
Shows **one** staff member’s workload breakdown and FTE/total. If mock validation issues exist for that user, a warning appears and they can jump to queries.

**Staff – My Queries**  
List of correction requests; button to open a form and add a new query. New items are kept in **React state on that page only** until refresh (no server).

**HoD – Dashboard**  
Department-level counts (staff, validation issues, pending/resolved queries) and a recent queries table (filtered by the HoD’s department).

**HoD – Department Workload**  
Table of **all staff in that department** with workload columns and a simple “Valid / T:R discrepancy” style flag from mock data.

**HoD – Review Queries**  
List of queries for that department; **Review** opens a modal to set status (pending / approved / declined) and add a HoD comment. Updates are **local to this page** in the prototype (not synced with Staff’s screen until we have a backend).

**HoS / Operations – Dashboard**  
School-wide statistics and a table of **all** mock queries.

**HoS / Operations – School Workload**  
All staff in the mock dataset, with a **department filter** (All / CSSE / Mathematics / Physics).

**HoS / Operations – All Queries**  
Read-only view of every query plus HoD response text.

**HoS / Operations – Reports**  
Summary table and a button labelled **Export PDF** that uses the browser’s **print** dialog (not a generated PDF file from the server).

---

## Mock data sources

- Mock data is **based on materials provided by the client** (dummy workload spreadsheet: Regan template, “Report - Staff” style).  
- **Parts that are not from the client**—for example the sample **queries** in `MOCK_QUERIES`—were **created by the team** for demonstration only.

---

## How to run it locally

```bash
cd Workload-Verification-System/frontend
npm install
npm run dev
```

Then open the URL shown in the terminal (usually `http://localhost:5173`).
