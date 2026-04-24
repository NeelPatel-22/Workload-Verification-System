import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import { validateWorkloads } from "./validation.js";

import { initDB, setupDB, seedUsers } from "./db.js";


dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

app.use(express.json());

// -----------------------------
// Mock users aligned with frontend mockData.js
// -----------------------------

// DB setup
let db;

async function startServer() {
  db = await initDB();
  await setupDB(db);
  await seedUsers(db);

  app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });
}

startServer();

// -----------------------------
// Mock workload data
// -----------------------------
const workloads = [
  { staffId: 1, name: "Dummy, 01", department: "CSSE", fte: 1.0, teaching: 24.99, assignedRole: 50.0, service: 10.0, hdSupervision: 4.0, research: 11.01, total: 100, targetBand: "Balanced T&R", calcBand: "Balanced T&R", hasDiscrepancy: false },
  { staffId: 2, name: "Dummy, 02", department: "CSSE", fte: 0.92, teaching: 30.03, assignedRole: 0.0, service: 9.2, hdSupervision: 0.0, research: 52.77, total: 92, targetBand: "Balanced T&R", calcBand: "Balanced T&R", hasDiscrepancy: false },
  { staffId: 3, name: "Dummy, 03", department: "CSSE", fte: 0.92, teaching: 7.54, assignedRole: 0.0, service: 9.2, hdSupervision: 1.0, research: 74.26, total: 92, targetBand: "Balanced T&R", calcBand: "Research Focused", hasDiscrepancy: true },
  { staffId: 4, name: "Dummy, 04", department: "CSSE", fte: 1.0, teaching: 6.42, assignedRole: 15.01, service: 10.0, hdSupervision: 5.0, research: 63.57, total: 100, targetBand: "Balanced T&R", calcBand: "Research Focused", hasDiscrepancy: true },
  { staffId: 5, name: "Dummy, 05", department: "CSSE", fte: 1.0, teaching: 20.0, assignedRole: 0.0, service: 10.0, hdSupervision: 25.75, research: 44.25, total: 100, targetBand: "Balanced T&R", calcBand: "Balanced T&R", hasDiscrepancy: false },
  { staffId: 6, name: "Dummy, 06", department: "CSSE", fte: 1.0, teaching: 54.51, assignedRole: 0.0, service: 10.0, hdSupervision: 1.0, research: 34.49, total: 100, targetBand: "Balanced T&R", calcBand: "Balanced T&R", hasDiscrepancy: false },
  { staffId: 7, name: "Dummy, 07", department: "CSSE", fte: 1.0, teaching: 29.29, assignedRole: 0.0, service: 10.0, hdSupervision: 5.25, research: 55.46, total: 100, targetBand: "Research Focused", calcBand: "Balanced T&R", hasDiscrepancy: true },
  { staffId: 8, name: "Dummy, 08", department: "Mathematics", fte: 1.0, teaching: 21.94, assignedRole: 0.0, service: 10.0, hdSupervision: 8.25, research: 59.81, total: 100, targetBand: "Balanced T&R", calcBand: "Balanced T&R", hasDiscrepancy: false },
  { staffId: 9, name: "Dummy, 09", department: "CSSE", fte: 1.0, teaching: 10.03, assignedRole: 59.07, service: 10.0, hdSupervision: 3.75, research: 17.15, total: 100, targetBand: "Balanced T&R", calcBand: "Balanced T&R", hasDiscrepancy: false },
  { staffId: 10, name: "Dummy, 10", department: "Mathematics", fte: 1.0, teaching: 0.0, assignedRole: 0.0, service: 10.0, hdSupervision: 0.0, research: 90.0, total: 100, targetBand: "Research Focused", calcBand: "Research Focused", hasDiscrepancy: false },
  { staffId: 11, name: "Dummy, 11", department: "Mathematics", fte: 1.0, teaching: 1.6, assignedRole: 8.12, service: 10.0, hdSupervision: 0.0, research: 80.28, total: 100, targetBand: "Balanced T&R", calcBand: "Research Focused", hasDiscrepancy: true },
  { staffId: 12, name: "Dummy, 12", department: "Mathematics", fte: 1.0, teaching: 0.0, assignedRole: 10.03, service: 10.0, hdSupervision: 5.0, research: 74.97, total: 100, targetBand: "Balanced T&R", calcBand: "Research Focused", hasDiscrepancy: true },
  { staffId: 13, name: "Dummy, 13", department: "Mathematics", fte: 1.0, teaching: 16.0, assignedRole: 6.67, service: 10.0, hdSupervision: 7.5, research: 59.83, total: 100, targetBand: "Balanced T&R", calcBand: "Balanced T&R", hasDiscrepancy: false },
  { staffId: 14, name: "Dummy, 14", department: "Physics", fte: 1.0, teaching: 30.4, assignedRole: 0.0, service: 10.0, hdSupervision: 2.5, research: 57.1, total: 100, targetBand: "Teaching Focused", calcBand: "Balanced T&R", hasDiscrepancy: true },
  { staffId: 15, name: "Dummy, 15", department: "Physics", fte: 1.0, teaching: 1.6, assignedRole: 0.0, service: 10.0, hdSupervision: 0.0, research: 88.4, total: 100, targetBand: "Balanced T&R", calcBand: "Research Focused", hasDiscrepancy: true },
  { staffId: 16, name: "Dummy, 16", department: "Physics", fte: 0.96, teaching: 13.26, assignedRole: 12.17, service: 9.6, hdSupervision: 18.5, research: 42.47, total: 96, targetBand: "Balanced T&R", calcBand: "Balanced T&R", hasDiscrepancy: false },
  { staffId: 17, name: "Dummy, 17", department: "Physics", fte: 0.8, teaching: 7.19, assignedRole: 10.03, service: 8.0, hdSupervision: 4.0, research: 50.78, total: 80, targetBand: "Balanced T&R", calcBand: "Research Focused", hasDiscrepancy: true },
  { staffId: 18, name: "Dummy, 18", department: "Physics", fte: 1.0, teaching: 17.6, assignedRole: 0.0, service: 10.0, hdSupervision: 0.0, research: 72.4, total: 100, targetBand: "Research Focused", calcBand: "Research Focused", hasDiscrepancy: false },
];


// -----------------------------
// Mock queries
// -----------------------------
let queries = [
  {
    id: 1,
    staffId: 3,
    staffName: "Dummy, 03",
    department: "CSSE",
    subject: "Teaching allocation appears too low",
    message: "My target is Balanced T&R but my teaching allocation seems much lower than expected. Please review.",
    status: "pending",
    submittedAt: "2026-03-18",
    hodComment: null,
  },
  {
    id: 2,
    staffId: 14,
    staffName: "Dummy, 14",
    department: "Physics",
    subject: "Teaching allocation does not match Teaching Focused contract",
    message: "I am on a Teaching Focused contract (90% teaching target) but my allocation shows only 30.4%. Please correct.",
    status: "approved",
    submittedAt: "2026-03-15",
    hodComment: "Confirmed. The allocation will be reviewed and corrected before the central submission.",
  },
  {
    id: 3,
    staffId: 7,
    staffName: "Dummy, 07",
    department: "CSSE",
    subject: "Research allocation higher than expected",
    message: "I believe my research allocation is incorrect — my contract is Research Focused but the system shows Balanced T&R.",
    status: "declined",
    submittedAt: "2026-03-10",
    hodComment: "After review, the allocation is correct based on your current-year assigned duties. Please contact HR if you believe your contract classification has changed.",
  },
];


// -----------------------------
// Helpers
// -----------------------------
async function mockAuth(req, res, next) {
  try {
    const username = req.headers["x-user"];

    if (!username) {
      return res.status(401).json({ message: "No user header provided" });
    }

    const user = await db.get("SELECT * FROM users WHERE username = ?", [username]);

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
// Routes
// -----------------------------
app.get("/", (req, res) => {
  res.json({ message: "Workload Verification System backend is running" });
});

app.get("/api/health", (req, res) => {
  res.status(200).json({ success: true, message: "Backend is healthy" });
});

// Login
app.post("/api/auth/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: "Username and password are required",
      });
    }

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

    res.json({
      success: true,
      message: "Login successful",
      user: {
        id: user.id,
        username: user.username,
        name: user.name,
        role: user.role,
        department: user.department,
        staffId: user.staffId,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

// Current user
app.get("/api/auth/me", mockAuth, (req, res) => {
  const { password, ...safeUser } = req.user;
  res.json(safeUser);
});

// Staff: view own workload
app.get("/api/workloads/my", mockAuth, authorizeRoles("staff"), (req, res) => {
  const workload = workloads.find((w) => w.staffId === req.user.staffId);

  if (!workload) {
    return res.status(404).json({ message: "Workload not found" });
  }

  res.json(workload);
});

// HoD / HoS / Operations: view workloads
app.get(
  "/api/workloads",
  mockAuth,
  authorizeRoles("hod", "hos", "operations"),
  (req, res) => {
    if (req.user.role === "hod") {
      const deptWorkloads = workloads.filter(
        (w) => w.department === req.user.department
      );
      return res.json(deptWorkloads);
    }

    return res.json(workloads);
  }
);

// Staff: view own validation issues
app.get(
  "/api/validation-issues/my",
  mockAuth,
  authorizeRoles("staff"),
  (req, res) => {
    const generatedIssues = validateWorkloads(workloads);
    const myIssues = generatedIssues.filter(
      (issue) => issue.staffId === req.user.staffId
    );
    res.json(myIssues);
  }
);

// HoD / HoS / Operations: view validation issues
app.get(
  "/api/validation-issues",
  mockAuth,
  authorizeRoles("hod", "hos", "operations"),
  (req, res) => {
    const generatedIssues = validateWorkloads(workloads)

    if (req.user.role === "hod") {
      const deptIssues = generatedIssues.filter(
        (issue) => issue.department === req.user.department
      );
      return res.json(deptIssues);
    }

    return res.json(generatedIssues);
  }
);

// Staff: submit query
app.post("/api/queries", mockAuth, authorizeRoles("staff"), (req, res) => {
  const { subject, message } = req.body;

  if (!subject || !message) {
    return res.status(400).json({
      message: "Subject and message are required",
    });
  }

  const newQuery = {
    id: queries.length + 1,
    staffId: req.user.staffId,
    staffName: req.user.name,
    department: req.user.department,
    subject,
    message,
    status: "pending",
    submittedAt: new Date().toISOString().split("T")[0],
    hodComment: null,
  };

  queries.push(newQuery);

  res.status(201).json({
    message: "Query submitted successfully",
    query: newQuery,
  });
});

// Staff: view own queries
app.get("/api/queries/my", mockAuth, authorizeRoles("staff"), (req, res) => {
  const myQueries = queries.filter((query) => query.staffId === req.user.staffId);
  res.json(myQueries);
});

// HoD / HoS / Operations: view queries
app.get(
  "/api/queries",
  mockAuth,
  authorizeRoles("hod", "hos", "operations"),
  (req, res) => {
    if (req.user.role === "hod") {
      const deptQueries = queries.filter(
        (query) => query.department === req.user.department
      );
      return res.json(deptQueries);
    }

    return res.json(queries);
  }
);

// HoD: update query status
app.patch("/api/queries/:id", mockAuth, authorizeRoles("hod"), (req, res) => {
  const queryId = Number(req.params.id);
  const { status, hodComment } = req.body;

  const validStatuses = ["pending", "approved", "declined"];

  if (!validStatuses.includes(status)) {
    return res.status(400).json({
      message: "Invalid status",
    });
  }

  const query = queries.find((q) => q.id === queryId);

  if (!query) {
    return res.status(404).json({ message: "Query not found" });
  }

  if (query.department !== req.user.department) {
    return res.status(403).json({
      message: "You can only update queries from your own department",
    });
  }

  query.status = status;
  query.hodComment = hodComment || null;

  res.json({
    message: "Query updated successfully",
    query,
  });
});