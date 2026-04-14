import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: "http://localhost:5173", // Vite frontend
  credentials: true
}));
app.use(express.json());

// -----------------------------
// Mock data for development
// -----------------------------
const users = [
  {
    id: 1,
    username: "academic1",
    password: "123456",
    name: "Dr Alice Brown",
    role: "academic",
    department: "Computer Science",
    staffId: "STAFF001"
  },
  {
    id: 2,
    username: "hod1",
    password: "123456",
    name: "Prof John Smith",
    role: "hod",
    department: "Computer Science",
    staffId: "STAFF002"
  },
  {
    id: 3,
    username: "operations1",
    password: "123456",
    name: "Mary Johnson",
    role: "operations",
    department: "School Office",
    staffId: "STAFF003"
  }
];

const workloads = [
  {
    staffId: "STAFF001",
    name: "Dr Alice Brown",
    department: "Computer Science",
    teachingHours: 120,
    researchHours: 80,
    adminHours: 40,
    leaveHours: 0,
    totalHours: 240,
    fte: 1.0,
    status: "Pending Verification"
  },
  {
    staffId: "STAFF002",
    name: "Prof John Smith",
    department: "Computer Science",
    teachingHours: 60,
    researchHours: 60,
    adminHours: 100,
    leaveHours: 20,
    totalHours: 240,
    fte: 1.0,
    status: "Verified"
  }
];

let issues = [
  {
    id: 1,
    staffId: "STAFF001",
    submittedBy: "Dr Alice Brown",
    title: "Teaching hours seem incorrect",
    description: "My teaching allocation appears higher than agreed.",
    status: "Open",
    createdAt: new Date().toISOString()
  }
];

// -----------------------------
// Helper middleware
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

// Base route
app.get("/", (req, res) => {
  res.json({
    message: "Workload Verification System backend is running"
  });
});

// Health route
app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Backend is healthy"
  });
});

// Login route
app.post("/api/auth/login", (req, res) => {
  const { username, password } = req.body;

  const user = users.find(
    (u) => u.username === username && u.password === password
  );

  if (!user) {
    return res.status(401).json({
      success: false,
      message: "Invalid username or password"
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
      staffId: user.staffId
    }
  });
});

// Current user route
app.get("/api/auth/me", mockAuth, (req, res) => {
  const { password, ...safeUser } = req.user;
  res.json(safeUser);
});

// Academic: view own workload
app.get("/api/workloads/my", mockAuth, authorizeRoles("academic"), (req, res) => {
  const workload = workloads.find((w) => w.staffId === req.user.staffId);

  if (!workload) {
    return res.status(404).json({ message: "Workload not found" });
  }

  res.json(workload);
});

// HOD / Operations: view all workloads
app.get("/api/workloads", mockAuth, authorizeRoles("hod", "operations"), (req, res) => {
  res.json(workloads);
});

// Academic submits an issue/query
app.post("/api/issues", mockAuth, authorizeRoles("academic"), (req, res) => {
  const { title, description } = req.body;

  if (!title || !description) {
    return res.status(400).json({
      message: "Title and description are required"
    });
  }

  const newIssue = {
    id: issues.length + 1,
    staffId: req.user.staffId,
    submittedBy: req.user.name,
    title,
    description,
    status: "Open",
    createdAt: new Date().toISOString()
  };

  issues.push(newIssue);

  res.status(201).json({
    message: "Issue submitted successfully",
    issue: newIssue
  });
});

// Academic: view own issues
app.get("/api/issues/my", mockAuth, authorizeRoles("academic"), (req, res) => {
  const myIssues = issues.filter((issue) => issue.staffId === req.user.staffId);
  res.json(myIssues);
});

// HOD / Operations: view all issues
app.get("/api/issues", mockAuth, authorizeRoles("hod", "operations"), (req, res) => {
  res.json(issues);
});

// HOD updates issue status
app.patch("/api/issues/:id", mockAuth, authorizeRoles("hod"), (req, res) => {
  const issueId = Number(req.params.id);
  const { status } = req.body;

  const validStatuses = ["Open", "Approved", "Rejected", "In Review"];

  if (!validStatuses.includes(status)) {
    return res.status(400).json({
      message: "Invalid status"
    });
  }

  const issue = issues.find((i) => i.id === issueId);

  if (!issue) {
    return res.status(404).json({ message: "Issue not found" });
  }

  issue.status = status;

  res.json({
    message: "Issue status updated successfully",
    issue
  });
});

// -----------------------------
// Start server
// -----------------------------
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});