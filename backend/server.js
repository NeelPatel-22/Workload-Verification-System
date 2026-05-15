import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import multer from "multer";
import fs from "fs";
import path from "path";
import { initDB, setupDB, seedUsers, seedWorkloads, seedQueries } from "./db.js";
import {
  importExcelWorkbook,
  getLatestImportReport,
} from "./services/excelImportService.js";
import { handleServerError } from "./utils/errorResponse.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// -----------------------------
// FILE UPLOAD SETUP
// -----------------------------

const uploadDir = path.join(process.cwd(), "uploads");

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    const safeName = file.originalname.replace(/[^a-zA-Z0-9._-]/g, "_");
    cb(null, `${timestamp}-${safeName}`);
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 15 * 1024 * 1024,
  },
  fileFilter: (req, file, cb) => {
    const allowedExtensions = [".xlsm", ".xlsx", ".xls"];
    const ext = path.extname(file.originalname).toLowerCase();

    if (!allowedExtensions.includes(ext)) {
      return cb(new Error("Only Excel files are allowed."));
    }

    cb(null, true);
  },
});

// -----------------------------
// MIDDLEWARE
// -----------------------------

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

app.use(express.json());

let db;

// -----------------------------
// START SERVER
// -----------------------------

async function startServer() {
  db = await initDB();
  await setupDB(db);
  await seedUsers(db);
  await seedWorkloads(db);
  await seedQueries(db);

  app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
  });
}

startServer();

// -----------------------------
// AUTH HELPERS
// -----------------------------

async function mockAuth(req, res, next) {
  try {
    const username = req.headers["x-user"];

    if (!username) {
      return res.status(401).json({ message: "No user header provided" });
    }

    const user = await db.get("SELECT * FROM users WHERE username = ?", [
      username,
    ]);

    if (!user) {
      return res.status(401).json({ message: "Invalid user" });
    }

    req.user = user;
    next();
  } catch (err) {
    console.error(err);
    handleServerError(res, err, "Auth error");
  }
}

function authorizeRoles(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: "Access denied" });
    }

    next();
  };
}

function normalizeQueryStatus(value) {
  const text = String(value || "").toLowerCase().trim();

  if (["approve", "approved", "resolve", "resolved"].includes(text)) {
    return "resolved";
  }

  if (["reject", "rejected", "decline", "declined"].includes(text)) {
    return "rejected";
  }

  if (text === "pending") {
    return "pending";
  }

  return null;
}

async function getLatestImportBatch() {
  return db.get(
    "SELECT * FROM import_batches WHERE status = 'completed' ORDER BY id DESC LIMIT 1"
  );
}

async function getVisibleWorkloads(user) {
  const latestImport = await getLatestImportBatch();

  const whereParts = [];
  const params = [];

  if (latestImport) {
    whereParts.push("importBatchId = ?");
    params.push(latestImport.id);
  } else {
    whereParts.push("importBatchId IS NULL");
  }

  if (user.role === "staff") {
    whereParts.push("staffId = ?");
    params.push(user.staffId);
  }

  if (user.role === "hod") {
    whereParts.push("department = ?");
    params.push(user.department);
  }

  const whereSql = `WHERE ${whereParts.join(" AND ")}`;

  return db.all(
    `SELECT * FROM workloads ${whereSql} ORDER BY department ASC, name ASC`,
    params
  );
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
    handleServerError(res, err);
  }
});

app.get("/api/auth/me", mockAuth, (req, res) => {
  const { password, ...safeUser } = req.user;
  res.json(safeUser);
});

// -----------------------------
// WORKLOAD ROUTES
// -----------------------------

app.get(
  "/api/workloads/my",
  mockAuth,
  authorizeRoles("staff"),
  async (req, res) => {
    try {
      const workloads = await getVisibleWorkloads(req.user);
      const workload = workloads[0];

      if (!workload) {
        return res.status(404).json({ message: "Workload not found" });
      }

      res.json(workload);
    } catch (err) {
      handleServerError(res, err);
    }
  }
);

app.get(
  "/api/workloads",
  mockAuth,
  authorizeRoles("hod", "hos", "operations"),
  async (req, res) => {
    try {
      const workloads = await getVisibleWorkloads(req.user);
      res.json(workloads);
    } catch (err) {
      handleServerError(res, err);
    }
  }
);

// -----------------------------
// EXCEL IMPORT ROUTES
// -----------------------------

app.post(
  "/api/import/excel",
  mockAuth,
  authorizeRoles("hos", "operations"),
  upload.single("file"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const result = await importExcelWorkbook({
        db,
        filePath: req.file.path,
        originalName: req.file.originalname,
        uploadedBy: req.user,
      });

      if (req.file?.path && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }

      res.status(201).json({
        message: "Excel import completed",
        ...result,
      });
    } catch (err) {
      handleServerError(res, err, "Excel import failed");

      if (req.file?.path && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }

      res.status(500).json({
        message: err.message || "Excel import failed",
      });
    }
  }
);

app.get(
  "/api/import/report",
  mockAuth,
  authorizeRoles("hod", "hos", "operations"),
  async (req, res) => {
    try {
      const report = await getLatestImportReport(db, req.user);
      res.json(report);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Failed to load import report" });
    }
  }
);

app.get(
  "/api/import/batches",
  mockAuth,
  authorizeRoles("hos", "operations"),
  async (req, res) => {
    try {
      const batches = await db.all(
        "SELECT * FROM import_batches ORDER BY importedAt DESC"
      );

      res.json(batches);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Failed to load import batches" });
    }
  }
);

// -----------------------------
// VALIDATION ROUTES
// -----------------------------

function generateValidationIssues(workloads) {
  const issues = [];

  for (const w of workloads) {
    const expectedTotal = (Number(w.fte) || 0) * 100;

    const total =
      (Number(w.teaching) || 0) +
      (Number(w.assignedRole) || 0) +
      (Number(w.service) || 0) +
      (Number(w.hdSupervision) || 0) +
      (Number(w.research) || 0);

    if (Math.abs(total - expectedTotal) > 0.05) {
      issues.push({
        staffId: w.staffId,
        staffName: w.name,
        department: w.department,
        type: "FTE Total Mismatch",
        severity: "warning",
        description: `Total is ${total.toFixed(1)}, expected ${expectedTotal.toFixed(
          1
        )} based on FTE ${w.fte}.`,
        sourceSheet: "Calculated Workload Summary",
        sourceRow: null,
      });
    }

    if (Number(w.research) < 0) {
      issues.push({
        staffId: w.staffId,
        staffName: w.name,
        department: w.department,
        type: "Negative Research Workload",
        severity: "error",
        description: `Research workload is ${Number(w.research).toFixed(
          1
        )}, which means allocated workload exceeds expected total.`,
        sourceSheet: "Calculated Workload Summary",
        sourceRow: null,
      });
    }

    if (w.hasDiscrepancy) {
      issues.push({
        staffId: w.staffId,
        staffName: w.name,
        department: w.department,
        type: "T:R Band Mismatch",
        severity: "warning",
        description: `Target band is ${w.targetBand}, but calculated band is ${w.calcBand}.`,
        sourceSheet: "Calculated Workload Summary",
        sourceRow: null,
      });
    }
  }

  return issues;
}

async function getLatestStoredIssues(user) {
  const latestImport = await getLatestImportBatch();

  if (!latestImport) {
    return null;
  }

  if (user.role === "staff") {
    return db.all(
      `SELECT * FROM validation_issues
       WHERE importBatchId = ? AND staffId = ?
       ORDER BY severity ASC, type ASC`,
      [latestImport.id, user.staffId]
    );
  }

  if (user.role === "hod") {
    return db.all(
      `SELECT * FROM validation_issues
       WHERE importBatchId = ? AND department = ?
       ORDER BY severity ASC, type ASC, staffName ASC`,
      [latestImport.id, user.department]
    );
  }

  return db.all(
    `SELECT * FROM validation_issues
     WHERE importBatchId = ?
     ORDER BY severity ASC, type ASC, staffName ASC`,
    [latestImport.id]
  );
}

app.get(
  "/api/validation-issues/my",
  mockAuth,
  authorizeRoles("staff"),
  async (req, res) => {
    try {
      const storedIssues = await getLatestStoredIssues(req.user);

      if (storedIssues) {
        return res.json(storedIssues);
      }

      const workloads = await getVisibleWorkloads(req.user);
      res.json(generateValidationIssues(workloads));
    } catch (err) {
      handleServerError(res, err);
    }
  }
);

app.get(
  "/api/validation-issues",
  mockAuth,
  authorizeRoles("hod", "hos", "operations"),
  async (req, res) => {
    try {
      const storedIssues = await getLatestStoredIssues(req.user);

      if (storedIssues) {
        return res.json(storedIssues);
      }

      const workloads = await getVisibleWorkloads(req.user);
      res.json(generateValidationIssues(workloads));
    } catch (err) {
      handleServerError(res, err);
    }
  }
);

// -----------------------------
// QUERY ROUTES
// -----------------------------

app.get(
  "/api/queries",
  mockAuth,
  authorizeRoles("hod", "hos", "operations"),
  async (req, res) => {
    try {
      if (req.user.role === "hod") {
        const data = await db.all(
          "SELECT * FROM queries WHERE department = ? ORDER BY submittedAt DESC",
          [req.user.department]
        );

        return res.json(data);
      }

      const all = await db.all("SELECT * FROM queries ORDER BY submittedAt DESC");
      res.json(all);
    } catch (err) {
      handleServerError(res, err);
    }
  }
);

app.get(
  "/api/queries/my",
  mockAuth,
  authorizeRoles("staff"),
  async (req, res) => {
    try {
      const data = await db.all(
        "SELECT * FROM queries WHERE staffId = ? ORDER BY submittedAt DESC",
        [req.user.staffId]
      );

      res.json(data);
    } catch (err) {
      handleServerError(res, err);
    }
  }
);

app.post(
  "/api/queries",
  mockAuth,
  authorizeRoles("staff"),
  async (req, res) => {
    try {
      const { subject, message } = req.body;

      if (!subject || !message) {
        return res.status(400).json({
          message: "Subject and message are required",
        });
      }

      const result = await db.run(
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

      const createdQuery = await db.get("SELECT * FROM queries WHERE id = ?", [
        result.lastID,
      ]);

      res.status(201).json({
        message: "Query submitted",
        query: createdQuery,
      });
    } catch (err) {
      handleServerError(res, err);
    }
  }
);

app.patch(
  "/api/queries/:id",
  mockAuth,
  authorizeRoles("hod", "hos", "operations"),
  async (req, res) => {
    try {
      const id = parseInt(req.params.id, 10);
      const { status, hodComment } = req.body;

      const normalizedStatus = normalizeQueryStatus(status);

      if (!normalizedStatus) {
        return res.status(400).json({
          message: "Invalid status value",
        });
      }

      const existing = await db.get("SELECT * FROM queries WHERE id = ?", [id]);

      if (!existing) {
        return res.status(404).json({ message: "Query not found" });
      }

      if (req.user.role === "hod" && existing.department !== req.user.department) {
        return res.status(403).json({
          message: "HoD can only update queries from their own department",
        });
      }

      await db.run("UPDATE queries SET status = ?, hodComment = ? WHERE id = ?", [
        normalizedStatus,
        hodComment ?? existing.hodComment,
        id,
      ]);

      const updatedQuery = await db.get("SELECT * FROM queries WHERE id = ?", [
        id,
      ]);

      res.json({
        message: "Query updated",
        query: updatedQuery,
      });
    } catch (err) {
      handleServerError(res, err);
    }
  }
);