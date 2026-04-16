import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { validateWorkloads } from "./validation.js";
import { users, workloads, validationIssues, queries } from "./data/mock-data.js";

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
app.post("/api/auth/login", (req, res) => {
  const { username, password } = req.body;

  console.log("Login route hit");
  console.log("Received login request body:", req.body);

  const user = users.find(
    (u) => u.username === username && u.password === password
  );

  console.log("Matched user:", user);

  if (!user) {
    return res.status(401).json({
      success: false,
      message: "Invalid username or password",
    });
  }

  console.log("Login successful for user:", user.username);

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
    const generatedIssues = validateWorkloads(workloads)
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