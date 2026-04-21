import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { initDB, setupDB, seedUsers } from "./db.js";
 
dotenv.config();
 
const app = express();
const PORT = process.env.PORT || 5000;
 
let db;
 
// Middleware
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json());
 
// -----------------------------
// Mock workload data (unchanged)
// -----------------------------
const workloads = [
  { staffId: 1, name: "Dummy, 01", department: "CSSE", fte: 1.0, teaching: 24.99, assignedRole: 50.0, service: 10.0, hdSupervision: 4.0, research: 11.01, total: 100, targetBand: "Balanced T&R", calcBand: "Balanced T&R", hasDiscrepancy: false },
  // ... KEEP ALL YOUR EXISTING DATA HERE (no change)
];
 
// -----------------------------
// Mock validation issues (unchanged)
// -----------------------------
const validationIssues = [
  // ... KEEP AS IS
];
 
// -----------------------------
// Mock queries (unchanged)
// -----------------------------
let queries = [
  // ... KEEP AS IS
];
 
// -----------------------------
// AUTH MIDDLEWARE (FIXED)
// -----------------------------
async function mockAuth(req, res, next) {
  try {
    const username = req.headers["x-user"];
 
    if (!username) {
      return res.status(401).json({ message: "No user header provided" });
    }
 
    const user = await db.get(
      "SELECT * FROM users WHERE username = ?",
      [username]
    );
 
    if (!user) {
      return res.status(401).json({ message: "Invalid user" });
    }
 
    req.user = user;
    next();
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Auth error" });
  }
}
 
function authorizeRoles(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: "Access denied" });
    }
    next();
  };
}
 
// -----------------------------
// ROUTES
// -----------------------------
 
app.get("/", (req, res) => {
  res.json({ message: "Backend running" });
});
 
app.get("/api/health", (req, res) => {
  res.json({ success: true });
});
 
// 🔐 LOGIN (DB-based)
app.post("/api/auth/login", async (req, res) => {
  try {
    const { username, password } = req.body;
 
    const user = await db.get(
      "SELECT * FROM users WHERE username = ? AND password = ?",
      [username, password]
    );
 
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid username or password",
      });
    }
 
    const { password: _, ...safeUser } = user;
 
    res.json({
      success: true,
      user: safeUser,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});
 
// Current user
app.get("/api/auth/me", mockAuth, (req, res) => {
  const { password, ...safeUser } = req.user;
  res.json(safeUser);
});
 
// Staff workload
app.get("/api/workloads/my", mockAuth, authorizeRoles("staff"), (req, res) => {
  const workload = workloads.find((w) => w.staffId === req.user.staffId);
  res.json(workload);
});
 
// HoD/Admin workloads
app.get("/api/workloads", mockAuth, authorizeRoles("hod", "hos", "operations"), (req, res) => {
  if (req.user.role === "hod") {
    return res.json(workloads.filter(w => w.department === req.user.department));
  }
  res.json(workloads);
});
 
// Queries
app.get("/api/queries/my", mockAuth, authorizeRoles("staff"), (req, res) => {
  res.json(queries.filter(q => q.staffId === req.user.staffId));
});
 
app.get("/api/queries", mockAuth, authorizeRoles("hod", "hos", "operations"), (req, res) => {
  if (req.user.role === "hod") {
    return res.json(queries.filter(q => q.department === req.user.department));
  }
  res.json(queries);
});
 
// -----------------------------
// START SERVER (SAFE INIT)
// -----------------------------
async function startServer() {
  db = await initDB();
  await setupDB(db);
  await seedUsers(db);
 
  app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
  });
}
 
startServer();