import sqlite3 from "sqlite3";
import { open } from "sqlite";

// Create DB connection
export async function initDB() {
  const db = await open({
    filename: "./database.sqlite",
    driver: sqlite3.Database,
  });

  await db.exec("PRAGMA foreign_keys = ON;");
  return db;
}

// Create tables if they do not exist
export async function setupDB(db) {
  await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL,
      name TEXT NOT NULL,
      role TEXT NOT NULL CHECK (role IN ('staff', 'hod', 'hos', 'operations')),
      department TEXT,
      staffId INTEGER UNIQUE
    );
  `);

  await db.exec(`
    CREATE TABLE IF NOT EXISTS import_batches (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      filename TEXT NOT NULL,
      uploadedBy TEXT NOT NULL,
      importedAt TEXT NOT NULL,
      status TEXT NOT NULL CHECK (status IN ('processing', 'completed', 'failed')),
      staffCount INTEGER NOT NULL DEFAULT 0,
      unitCount INTEGER NOT NULL DEFAULT 0,
      roleCount INTEGER NOT NULL DEFAULT 0,
      teachingRowCount INTEGER NOT NULL DEFAULT 0,
      hdrRowCount INTEGER NOT NULL DEFAULT 0,
      assignedRoleRowCount INTEGER NOT NULL DEFAULT 0,
      workloadCount INTEGER NOT NULL DEFAULT 0,
      issueCount INTEGER NOT NULL DEFAULT 0,
      notes TEXT
    );
  `);

  // Workload summary table used by dashboards.
  // importBatchId lets us keep history safely and still show only the latest import.
  await db.exec(`
    CREATE TABLE IF NOT EXISTS workloads (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      importBatchId INTEGER,
      staffId INTEGER NOT NULL,
      name TEXT NOT NULL,
      department TEXT,
      fte REAL NOT NULL DEFAULT 0,
      teaching REAL NOT NULL DEFAULT 0,
      assignedRole REAL NOT NULL DEFAULT 0,
      service REAL NOT NULL DEFAULT 0,
      hdSupervision REAL NOT NULL DEFAULT 0,
      research REAL NOT NULL DEFAULT 0,
      total REAL NOT NULL DEFAULT 0,
      targetBand TEXT,
      calcBand TEXT,
      hasDiscrepancy INTEGER NOT NULL DEFAULT 0 CHECK (hasDiscrepancy IN (0, 1)),
      FOREIGN KEY (importBatchId) REFERENCES import_batches(id) ON DELETE CASCADE,
      FOREIGN KEY (staffId) REFERENCES users(staffId),
      UNIQUE (importBatchId, staffId)
    );
  `);

  await db.exec(`
    CREATE TABLE IF NOT EXISTS queries (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      staffId INTEGER NOT NULL,
      staffName TEXT NOT NULL,
      department TEXT,
      subject TEXT NOT NULL,
      message TEXT NOT NULL,
      status TEXT NOT NULL CHECK (status IN ('pending', 'resolved', 'rejected')),
      submittedAt TEXT NOT NULL,
      hodComment TEXT,
      FOREIGN KEY (staffId) REFERENCES users(staffId)
    );
  `);

  // Workbook source tables. These are intentionally more flexible because
  // they store imported Excel data, including invalid rows that need to be reported.
  await db.exec(`
    CREATE TABLE IF NOT EXISTS staff_sources (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      importBatchId INTEGER NOT NULL,
      staffId INTEGER,
      staffMember TEXT,
      staffName TEXT,
      staffNumber TEXT,
      staffType TEXT,
      fte REAL,
      function TEXT,
      targetTeachingPercent REAL,
      targetResearchPercent REAL,
      targetTRBalance REAL,
      targetBand TEXT,
      department TEXT,
      FOREIGN KEY (importBatchId) REFERENCES import_batches(id) ON DELETE CASCADE
    );
  `);

  await db.exec(`
    CREATE TABLE IF NOT EXISTS units (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      importBatchId INTEGER NOT NULL,
      unitCode TEXT NOT NULL,
      unitName TEXT,
      groupedUnit TEXT,
      enrolment REAL,
      expectedUCTariff REAL,
      cwsHoursPerStudent REAL,
      FOREIGN KEY (importBatchId) REFERENCES import_batches(id) ON DELETE CASCADE
    );
  `);

  await db.exec(`
    CREATE TABLE IF NOT EXISTS roles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      importBatchId INTEGER NOT NULL,
      category TEXT,
      roleName TEXT NOT NULL,
      hours REAL,
      points REAL,
      notes TEXT,
      name TEXT,
      rolePillars TEXT,
      FOREIGN KEY (importBatchId) REFERENCES import_batches(id) ON DELETE CASCADE
    );
  `);

  await db.exec(`
    CREATE TABLE IF NOT EXISTS teaching_workloads (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      importBatchId INTEGER NOT NULL,
      sourceRow INTEGER,
      unitCode TEXT,
      staffType TEXT,
      staffMember TEXT,
      staffId INTEGER,
      enrolment REAL,
      duplicateCount REAL,
      totalTeachingHours REAL,
      totalTeachingPoints REAL,
      unitCoordinationPoints REAL,
      teachingActivityPoints REAL,
      unitSupervisionPoints REAL,
      newUnitDevelopmentPoints REAL,
      totalDepartmentHours REAL,
      isUnitCoordinator TEXT,
      FOREIGN KEY (importBatchId) REFERENCES import_batches(id) ON DELETE CASCADE
    );
  `);

  await db.exec(`
    CREATE TABLE IF NOT EXISTS hdr_workloads (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      importBatchId INTEGER NOT NULL,
      sourceRow INTEGER,
      staffMember TEXT,
      staffId INTEGER,
      fullTimeStudents REAL,
      fullTimeProportion REAL,
      partTimeStudents REAL,
      partTimeProportion REAL,
      totalSupervisionHours REAL,
      workloadPoints REAL,
      FOREIGN KEY (importBatchId) REFERENCES import_batches(id) ON DELETE CASCADE
    );
  `);

  await db.exec(`
    CREATE TABLE IF NOT EXISTS assigned_role_workloads (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      importBatchId INTEGER NOT NULL,
      sourceRow INTEGER,
      staffMember TEXT,
      staffId INTEGER,
      fte REAL,
      selfDirectedServicePoints REAL,
      assignedRoleTotalPoints REAL,
      role1 TEXT,
      points1 REAL,
      role2 TEXT,
      points2 REAL,
      role3 TEXT,
      points3 REAL,
      role4 TEXT,
      points4 REAL,
      role5 TEXT,
      points5 REAL,
      role6 TEXT,
      points6 REAL,
      FOREIGN KEY (importBatchId) REFERENCES import_batches(id) ON DELETE CASCADE
    );
  `);

  await db.exec(`
    CREATE TABLE IF NOT EXISTS validation_issues (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      importBatchId INTEGER NOT NULL,
      staffId INTEGER,
      staffName TEXT,
      department TEXT,
      type TEXT NOT NULL,
      severity TEXT NOT NULL CHECK (severity IN ('error', 'warning', 'info')),
      description TEXT NOT NULL,
      sourceSheet TEXT,
      sourceRow INTEGER,
      createdAt TEXT NOT NULL,
      FOREIGN KEY (importBatchId) REFERENCES import_batches(id) ON DELETE CASCADE
    );
  `);
}

// Seed Users
export async function seedUsers(db) {
  const existing = await db.all("SELECT * FROM users");

  if (existing.length === 0) {
    console.log("Seeding users...");

    await db.run(`
      INSERT INTO users (username, password, name, role, department, staffId)
      VALUES
      ('dummy01','password','Dummy, 01','staff','CSSE',1),
      ('dummy02','password','Dummy, 02','staff','CSSE',2),
      ('dummy03','password','Dummy, 03','staff','CSSE',3),
      ('dummy04','password','Dummy, 04','staff','CSSE',4),
      ('dummy05','password','Dummy, 05','staff','CSSE',5),
      ('dummy06','password','Dummy, 06','staff','CSSE',6),
      ('dummy07','password','Dummy, 07','staff','CSSE',7),

      ('dummy08','password','Dummy, 08','staff','Mathematics',8),
      ('dummy09','password','Dummy, 09','staff','CSSE',9),
      ('dummy10','password','Dummy, 10','staff','Mathematics',10),
      ('dummy11','password','Dummy, 11','staff','Mathematics',11),
      ('dummy12','password','Dummy, 12','staff','Mathematics',12),
      ('dummy13','password','Dummy, 13','staff','Mathematics',13),

      ('dummy14','password','Dummy, 14','staff','Physics',14),
      ('dummy15','password','Dummy, 15','staff','Physics',15),
      ('dummy16','password','Dummy, 16','staff','Physics',16),
      ('dummy17','password','Dummy, 17','staff','Physics',17),
      ('dummy18','password','Dummy, 18','staff','Physics',18),

      ('hod.csse','password','HoD - CSSE','hod','CSSE',19),
      ('hod.maths','password','HoD - Mathematics','hod','Mathematics',20),
      ('hod.physics','password','HoD - Physics','hod','Physics',21),

      ('hos','password','Head of School','hos',NULL,22),
      ('ops','password','School Operations','operations',NULL,23)
    `);
  }
}

// Seed initial demo workloads only when there are no workloads.
// These have importBatchId NULL because they are not from an Excel import.
export async function seedWorkloads(db) {
  const existing = await db.all("SELECT * FROM workloads");

  if (existing.length === 0) {
    console.log("Seeding workloads...");

    const values = [];

    for (let i = 1; i <= 18; i++) {
      const dept = i <= 7 || i === 9 ? "CSSE" : i <= 13 ? "Mathematics" : "Physics";

      values.push(
        `(NULL, ${i}, 'Dummy, ${String(i).padStart(
          2,
          "0"
        )}', '${dept}', 1.0, 25, 50, 10, 5, 10, 100, 'Balanced Teaching & Research', 'Balanced Teaching & Research', 0)`
      );
    }

    await db.run(`
      INSERT INTO workloads
      (importBatchId, staffId, name, department, fte, teaching, assignedRole, service, hdSupervision, research, total, targetBand, calcBand, hasDiscrepancy)
      VALUES ${values.join(",")}
    `);
  }
}

// Seed Queries
export async function seedQueries(db) {
  const existing = await db.all("SELECT * FROM queries");

  if (existing.length === 0) {
    console.log("Seeding queries...");

    await db.run(`
      INSERT INTO queries
      (staffId, staffName, department, subject, message, status, submittedAt, hodComment)
      VALUES
      (3, 'Dummy, 03', 'CSSE', 'Teaching allocation issue', 'My teaching allocation seems low.', 'pending', '2026-03-18', NULL),
      (10, 'Dummy, 10', 'Mathematics', 'Workload clarification', 'Need clarification on workload.', 'pending', '2026-03-18', NULL)
    `);
  }
}