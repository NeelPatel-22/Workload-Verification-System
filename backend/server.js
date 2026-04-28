import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { initDB, setupDB, seedUsers, seedWorkloads, seedQueries } from "./db.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// basic middleware
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

app.use(express.json());

// database instance
let db;

// start server + initialise DB
async function startServer() {
  db = await initDB();
  await setupDB(db);
  await seedUsers(db);
  await seedWorkloads(db);
  await seedQueries(db); // now queries also come from DB

  app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
  });
}

startServer();

// -----------------------------
// AUTH HELPERS
// -----------------------------

// simple header-based auth (used across routes)
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
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Auth error" });
  }
}

// role-based access control
function authorizeRoles(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: "Access denied" });
    }
    next();
  };
}

// -----------------------------
// BASIC ROUTES
// -----------------------------

app.get("/", (req, res) => {
  res.json({ message: "Backend is running" });
});

app.get("/api/health", (req, res) => {
  res.json({ success: true });
});

// -----------------------------
// AUTH ROUTES
// -----------------------------

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
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

app.get("/api/auth/me", mockAuth, (req, res) => {
  const { password, ...safeUser } = req.user;
  res.json(safeUser);
});

// -----------------------------
// WORKLOAD ROUTES (DB)
// -----------------------------

// staff → own workload
app.get("/api/workloads/my", mockAuth, authorizeRoles("staff"), async (req, res) => {
  try {
    const workload = await db.get(
      "SELECT * FROM workloads WHERE staffId = ?",
      [req.user.staffId]
    );

    if (!workload) {
      return res.status(404).json({ message: "Workload not found" });
    }

    res.json(workload);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// HoD / Admin → workloads
app.get("/api/workloads", mockAuth, authorizeRoles("hod", "hos", "operations"), async (req, res) => {
  try {
    if (req.user.role === "hod") {
      const data = await db.all(
        "SELECT * FROM workloads WHERE department = ?",
        [req.user.department]
      );
      return res.json(data);
    }

    const all = await db.all("SELECT * FROM workloads");
    res.json(all);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// -----------------------------
// VALIDATION (based on DB)
// -----------------------------

function generateValidationIssues(workloads) {
  const issues = [];

  for (const w of workloads) {
    const total =
      (w.teaching || 0) +
      (w.assignedRole || 0) +
      (w.service || 0) +
      (w.hdSupervision || 0) +
      (w.research || 0);

    if (Math.abs(total - 100) > 0.01) {
      issues.push({
        staffId: w.staffId,
        name: w.name,
        issue: `Total is ${total}, expected 100`,
      });
    }
  }

  return issues;
}

// staff → own issues
app.get("/api/validation-issues/my", mockAuth, authorizeRoles("staff"), async (req, res) => {
  try {
    const data = await db.all(
      "SELECT * FROM workloads WHERE staffId = ?",
      [req.user.staffId]
    );
    res.json(generateValidationIssues(data));
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// HoD/Admin → issues
app.get("/api/validation-issues", mockAuth, authorizeRoles("hod", "hos", "operations"), async (req, res) => {
  try {
    let data;

    if (req.user.role === "hod") {
      data = await db.all(
        "SELECT * FROM workloads WHERE department = ?",
        [req.user.department]
      );
    } else {
      data = await db.all("SELECT * FROM workloads");
    }

    res.json(generateValidationIssues(data));
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// -----------------------------
// QUERIES ROUTES (NOW DB)
// -----------------------------

// HoD/Admin → all queries
app.get("/api/queries", mockAuth, authorizeRoles("hod", "hos", "operations"), async (req, res) => {
  try {
    if (req.user.role === "hod") {
      const data = await db.all(
        "SELECT * FROM queries WHERE department = ?",
        [req.user.department]
      );
      return res.json(data);
    }

    const all = await db.all("SELECT * FROM queries");
    res.json(all);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// staff → own queries
app.get("/api/queries/my", mockAuth, authorizeRoles("staff"), async (req, res) => {
  try {
    const data = await db.all(
      "SELECT * FROM queries WHERE staffId = ?",
      [req.user.staffId]
    );
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// submit query
app.post("/api/queries", mockAuth, authorizeRoles("staff"), async (req, res) => {
  try {
    const { subject, message } = req.body;

    await db.run(
      `INSERT INTO queries 
      (staffId, staffName, department, subject, message, status, submittedAt, hodComment)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        req.user.staffId,
        req.user.name,
        req.user.department,
        subject,
        message,
        "pending",
        new Date().toISOString().split("T")[0],
        null,
      ]
    );

    res.json({ message: "Query submitted" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// update query
app.patch("/api/queries/:id", mockAuth, authorizeRoles("hod", "hos", "operations"), async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { status, hodComment } = req.body;

    const existing = await db.get("SELECT * FROM queries WHERE id = ?", [id]);

    if (!existing) {
      return res.status(404).json({ message: "Query not found" });
    }

    await db.run(
      "UPDATE queries SET status = ?, hodComment = ? WHERE id = ?",
      [status, hodComment, id]
    );

    res.json({ message: "Query updated" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});