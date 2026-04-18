import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { initDB, setupDB, seedUsers } from "./db.js";

let db;

(async () => {
  db = await initDB();
  await setupDB(db);
  await seedUsers(db);
})();

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
const users = [
  // Academic Staff
  { id: 1, username: "dummy01", password: "password", name: "Dummy, 01", role: "staff", department: "CSSE", staffId: 1 },
  { id: 2, username: "dummy02", password: "password", name: "Dummy, 02", role: "staff", department: "CSSE", staffId: 2 },
  { id: 3, username: "dummy03", password: "password", name: "Dummy, 03", role: "staff", department: "CSSE", staffId: 3 },
  { id: 4, username: "dummy04", password: "password", name: "Dummy, 04", role: "staff", department: "CSSE", staffId: 4 },
  { id: 5, username: "dummy05", password: "password", name: "Dummy, 05", role: "staff", department: "CSSE", staffId: 5 },
  { id: 6, username: "dummy06", password: "password", name: "Dummy, 06", role: "staff", department: "CSSE", staffId: 6 },
  { id: 7, username: "dummy07", password: "password", name: "Dummy, 07", role: "staff", department: "CSSE", staffId: 7 },
  { id: 8, username: "dummy08", password: "password", name: "Dummy, 08", role: "staff", department: "Mathematics", staffId: 8 },
  { id: 9, username: "dummy09", password: "password", name: "Dummy, 09", role: "staff", department: "CSSE", staffId: 9 },
  { id: 10, username: "dummy10", password: "password", name: "Dummy, 10", role: "staff", department: "Mathematics", staffId: 10 },
  { id: 11, username: "dummy11", password: "password", name: "Dummy, 11", role: "staff", department: "Mathematics", staffId: 11 },
  { id: 12, username: "dummy12", password: "password", name: "Dummy, 12", role: "staff", department: "Mathematics", staffId: 12 },
  { id: 13, username: "dummy13", password: "password", name: "Dummy, 13", role: "staff", department: "Mathematics", staffId: 13 },
  { id: 14, username: "dummy14", password: "password", name: "Dummy, 14", role: "staff", department: "Physics", staffId: 14 },
  { id: 15, username: "dummy15", password: "password", name: "Dummy, 15", role: "staff", department: "Physics", staffId: 15 },
  { id: 16, username: "dummy16", password: "password", name: "Dummy, 16", role: "staff", department: "Physics", staffId: 16 },
  { id: 17, username: "dummy17", password: "password", name: "Dummy, 17", role: "staff", department: "Physics", staffId: 17 },
  { id: 18, username: "dummy18", password: "password", name: "Dummy, 18", role: "staff", department: "Physics", staffId: 18 },

  // Heads of Department
  { id: 19, username: "hod.csse", password: "password", name: "HoD – CSSE", role: "hod", department: "CSSE", staffId: 19 },
  { id: 20, username: "hod.maths", password: "password", name: "HoD – Mathematics", role: "hod", department: "Mathematics", staffId: 20 },
  { id: 21, username: "hod.physics", password: "password", name: "HoD – Physics", role: "hod", department: "Physics", staffId: 21 },

  // Head of School & Operations
  { id: 22, username: "hos", password: "password", name: "Head of School", role: "hos", department: null, staffId: 22 },
  { id: 23, username: "ops", password: "password", name: "School Operations", role: "operations", department: null, staffId: 23 },
];

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
// Mock validation issues
// -----------------------------
const validationIssues = [
  { id: 1, staffId: 3, staffName: "Dummy, 03", department: "CSSE", type: "T:R Band Mismatch", severity: "warning", description: "Target band is Balanced T&R (0.50) but calculated ratio is 0.09 — classified as Research Focused." },
  { id: 2, staffId: 4, staffName: "Dummy, 04", department: "CSSE", type: "T:R Band Mismatch", severity: "warning", description: "Target band is Balanced T&R (0.50) but calculated ratio is 0.09 — classified as Research Focused." },
  { id: 3, staffId: 7, staffName: "Dummy, 07", department: "CSSE", type: "T:R Band Mismatch", severity: "warning", description: "Target band is Research Focused (0.00) but calculated ratio is 0.35 — classified as Balanced T&R." },
  { id: 4, staffId: 11, staffName: "Dummy, 11", department: "Mathematics", type: "T:R Band Mismatch", severity: "warning", description: "Target band is Balanced T&R (0.50) but calculated ratio is 0.02 — classified as Research Focused." },
  { id: 5, staffId: 12, staffName: "Dummy, 12", department: "Mathematics", type: "T:R Band Mismatch", severity: "warning", description: "Target band is Balanced T&R (0.50) but calculated ratio is 0.00 — classified as Research Focused." },
  { id: 6, staffId: 14, staffName: "Dummy, 14", department: "Physics", type: "T:R Band Mismatch", severity: "warning", description: "Target band is Teaching Focused (0.90) but calculated ratio is 0.35 — classified as Balanced T&R." },
  { id: 7, staffId: 15, staffName: "Dummy, 15", department: "Physics", type: "T:R Band Mismatch", severity: "warning", description: "Target band is Balanced T&R (0.50) but calculated ratio is 0.02 — classified as Research Focused." },
  { id: 8, staffId: 17, staffName: "Dummy, 17", department: "Physics", type: "T:R Band Mismatch", severity: "warning", description: "Target band is Balanced T&R (0.50) but calculated ratio is 0.12 — classified as Research Focused." },
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
function mockAuth(req, res, next) {
  const username = req.headers["x-user"];

  if (!username) {
    return res.status(401).json({ message: "No user header provided" });
  }

  const user = users.find((u) => u.username === username);

  if (!user) {
    return res.status(401).json({ message: "Invalid user" });
  }

  req.user = user;
  next();
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
  res.json({
    message: "Workload Verification System backend is running",
  });
});

app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Backend is healthy",
  });
});

// Login
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
    res.status(500).json({ message: "Server error" });
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
    const myIssues = validationIssues.filter(
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
    if (req.user.role === "hod") {
      const deptIssues = validationIssues.filter(
        (issue) => issue.department === req.user.department
      );
      return res.json(deptIssues);
    }

    return res.json(validationIssues);
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

// -----------------------------
// Start server
// -----------------------------
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});