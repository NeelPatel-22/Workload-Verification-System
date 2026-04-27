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
// Mock queries (kept as in-memory for now)
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
// WORKLOAD ROUTES
// -----------------------------

// Staff: view own workload
app.get(
  "/api/workloads/my",
  mockAuth,
  authorizeRoles("staff"),
  async (req, res) => {
    try {
      const workload = await db.get(
        "SELECT * FROM workloads WHERE staffId = ?",
        [req.user.staffId]
      );

      if (!workload) {
        return res.status(404).json({ message: "Workload not found" });
      }

      res.json(workload);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error" });
    }
  }
);

// HoD / HoS / Operations: view workloads
app.get(
  "/api/workloads",
  mockAuth,
  authorizeRoles("hod", "hos", "operations"),
  async (req, res) => {
    try {
      if (req.user.role === "hod") {
        const deptWorkloads = await db.all(
          "SELECT * FROM workloads WHERE department = ?",
          [req.user.department]
        );
        return res.json(deptWorkloads);
      }

      const allWorkloads = await db.all("SELECT * FROM workloads");
      return res.json(allWorkloads);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error" });
    }
  }
);

// -----------------------------
// VALIDATION ISSUES ROUTES
// (dynamically generated from workloads DB)
// -----------------------------

function generateValidationIssues(workloads) {
  const issues = [];
  let idCounter = 1;

  for (const w of workloads) {
    const total = w.teaching + w.assignedRole + w.service + w.hdSupervision + w.research;

    // Check total does not sum to 100
    if (Math.abs(total - 100) > 0.01) {
      issues.push({
        id: idCounter++,
        staffId: w.staffId,
        staffName: w.name,
        department: w.department,
        type: "FTE Total Mismatch",
        severity: "warning",
        description: `Workload components sum to ${total.toFixed(1)} instead of 100.`,
      });
    }

    // Check T:R band mismatch
    const researchRatio = w.total > 0 ? w.research / w.total : 0;
    const teachingRatio = w.total > 0 ? w.teaching / w.total : 0;

    let calcBand = "Balanced T&R";
    if (researchRatio > 0.6) calcBand = "Research Focused";
    else if (teachingRatio > 0.6) calcBand = "Teaching Focused";

    if (w.targetBand && w.targetBand !== calcBand) {
      issues.push({
        id: idCounter++,
        staffId: w.staffId,
        staffName: w.name,
        department: w.department,
        type: "T:R Band Mismatch",
        severity: "warning",
        description: `Target band is ${w.targetBand} but calculated band is ${calcBand}.`,
      });
    }
  }

  return issues;
}

// Staff: view own validation issues
app.get(
  "/api/validation-issues/my",
  mockAuth,
  authorizeRoles("staff"),
  async (req, res) => {
    try {
      const workloads = await db.all(
        "SELECT * FROM workloads WHERE staffId = ?",
        [req.user.staffId]
      );
      const issues = generateValidationIssues(workloads);
      res.json(issues);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error" });
    }
  }
);

// HoD / HoS / Operations: view validation issues
app.get(
  "/api/validation-issues",
  mockAuth,
  authorizeRoles("hod", "hos", "operations"),
  async (req, res) => {
    try {
      let workloads;

      if (req.user.role === "hod") {
        workloads = await db.all(
          "SELECT * FROM workloads WHERE department = ?",
          [req.user.department]
        );
      } else {
        workloads = await db.all("SELECT * FROM workloads");
      }

      const issues = generateValidationIssues(workloads);
      res.json(issues);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error" });
    }
  }
);

// -----------------------------
// QUERIES ROUTES
// -----------------------------

// HoD / HoS / Operations: view all queries
app.get(
  "/api/queries",
  mockAuth,
  authorizeRoles("hod", "hos", "operations"),
  (req, res) => {
    try {
      if (req.user.role === "hod") {
        const deptQueries = queries.filter(
          (q) => q.department === req.user.department
        );
        return res.json(deptQueries);
      }

      return res.json(queries);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error" });
    }
  }
);

// Staff: get own queries
app.get(
  "/api/queries/my",
  mockAuth,
  authorizeRoles("staff"),
  (req, res) => {
    try {
      const myQueries = queries.filter(
        (q) => q.staffId === req.user.staffId
      );
      res.json(myQueries);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error" });
    }
  }
);

// Staff: submit a query
app.post("/api/queries", mockAuth, authorizeRoles("staff"), (req, res) => {
  try {
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
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// HoD / HoS / Operations: update a query
app.patch(
  "/api/queries/:id",
  mockAuth,
  authorizeRoles("hod", "hos", "operations"),
  (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { status, hodComment } = req.body;

      const query = queries.find((q) => q.id === id);

      if (!query) {
        return res.status(404).json({ message: "Query not found" });
      }

      if (status) query.status = status;
      if (hodComment) query.hodComment = hodComment;

      res.json({
        message: "Query updated successfully",
        query,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error" });
    }
  }
);