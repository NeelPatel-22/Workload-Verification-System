import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { initDB, setupDB, seedUsers, seedWorkloads } from "./db.js";

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

// DB setup
let db;

async function startServer() {
  db = await initDB();
  await setupDB(db);
  await seedUsers(db);
  await seedWorkloads(db);

  app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });
}

startServer();

// -----------------------------
// Mock workload data (kept but no longer used)
// -----------------------------
const workloads = [
  // (you can keep or remove later)
];

// -----------------------------
// Mock validation issues
// -----------------------------
const validationIssues = [
  { id: 1, staffId: 3, staffName: "Dummy, 03", department: "CSSE", type: "T:R Band Mismatch", severity: "warning", description: "Target band is Balanced T&R (0.50) but calculated ratio is 0.09 — classified as Research Focused." },
  { id: 2, staffId: 4, staffName: "Dummy, 04", department: "CSSE", type: "T:R Band Mismatch", severity: "warning", description: "Target band is Balanced T&R (0.50) but calculated ratio is 0.09 — classified as Research Focused." },
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

// -----------------------------
// WORKLOAD ROUTES (UPDATED TO DB)
// -----------------------------

// Staff: view own workload
app.get(
  "/api/workloads/my",
  mockAuth,
  authorizeRoles("staff"),
  async (req, res) => {
    const workload = await db.get(
      "SELECT * FROM workloads WHERE staffId = ?",
      [req.user.staffId]
    );

    if (!workload) {
      return res.status(404).json({ message: "Workload not found" });
    }

    res.json(workload);
  }
);

// HoD / HoS / Operations: view workloads
app.get(
  "/api/workloads",
  mockAuth,
  authorizeRoles("hod", "hos", "operations"),
  async (req, res) => {
    if (req.user.role === "hod") {
      const deptWorkloads = await db.all(
        "SELECT * FROM workloads WHERE department = ?",
        [req.user.department]
      );
      return res.json(deptWorkloads);
    }

    const allWorkloads = await db.all("SELECT * FROM workloads");
    return res.json(allWorkloads);
  }
);

// -----------------------------
// REMAINING ROUTES (UNCHANGED)
// -----------------------------

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

app.get(
  "/api/queries",
  mockAuth,
  authorizeRoles("hod", "hos", "operations"),
  (req, res) => {
    if (req.user.role === "hod") {
      const deptQueries = queries.filter(
        (q) => q.department === req.user.department
      );
      return res.json(deptQueries);
    }

    return res.json(queries);
  }
);

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