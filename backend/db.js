import sqlite3 from "sqlite3";
import { open } from "sqlite";

// Create DB connection
export async function initDB() {
  return open({
    filename: "./database.sqlite",
    driver: sqlite3.Database,
  });
}

// Create tables if they don’t exist
export async function setupDB(db) {
  // Users table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE,
      password TEXT,
      name TEXT,
      role TEXT,
      department TEXT,
      staffId INTEGER
    );
  `);

  // Workloads summary table used by existing dashboards
  await db.exec(`
    CREATE TABLE IF NOT EXISTS workloads (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      staffId INTEGER,
      name TEXT,
      department TEXT,
      fte REAL,
      teaching REAL,
      assignedRole REAL,
      service REAL,
      hdSupervision REAL,
      research REAL,
      total REAL,
      targetBand TEXT,
      calcBand TEXT,
      hasDiscrepancy INTEGER
    );
  `);

  // Queries table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS queries (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      staffId INTEGER,
      staffName TEXT,
      department TEXT,
      subject TEXT,
      message TEXT,
      status TEXT,
      submittedAt TEXT,
      hodComment TEXT
    );
  `);

  // Tracks each uploaded Excel workbook import
  await db.exec(`
    CREATE TABLE IF NOT EXISTS import_batches (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      filename TEXT,
      uploadedBy TEXT,
      importedAt TEXT,
      status TEXT,
      staffCount INTEGER DEFAULT 0,
      unitCount INTEGER DEFAULT 0,
      roleCount INTEGER DEFAULT 0,
      teachingRowCount INTEGER DEFAULT 0,
      hdrRowCount INTEGER DEFAULT 0,
      assignedRoleRowCount INTEGER DEFAULT 0,
      workloadCount INTEGER DEFAULT 0,
      issueCount INTEGER DEFAULT 0,
      notes TEXT
    );
  `);

  // Raw/cleaned source data from workbook sheets
  await db.exec(`
    CREATE TABLE IF NOT EXISTS staff_sources (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      importBatchId INTEGER,
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
      department TEXT
    );
  `);

  await db.exec(`
    CREATE TABLE IF NOT EXISTS units (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      importBatchId INTEGER,
      unitCode TEXT,
      unitName TEXT,
      groupedUnit TEXT,
      enrolment REAL,
      expectedUCTariff REAL,
      cwsHoursPerStudent REAL
    );
  `);

  await db.exec(`
    CREATE TABLE IF NOT EXISTS roles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      importBatchId INTEGER,
      category TEXT,
      roleName TEXT,
      hours REAL,
      points REAL,
      notes TEXT,
      name TEXT,
      rolePillars TEXT
    );
  `);

  await db.exec(`
    CREATE TABLE IF NOT EXISTS teaching_workloads (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      importBatchId INTEGER,
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
      isUnitCoordinator TEXT
    );
  `);

  await db.exec(`
    CREATE TABLE IF NOT EXISTS hdr_workloads (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      importBatchId INTEGER,
      sourceRow INTEGER,
      staffMember TEXT,
      staffId INTEGER,
      fullTimeStudents REAL,
      fullTimeProportion REAL,
      partTimeStudents REAL,
      partTimeProportion REAL,
      totalSupervisionHours REAL,
      workloadPoints REAL
    );
  `);

  await db.exec(`
    CREATE TABLE IF NOT EXISTS assigned_role_workloads (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      importBatchId INTEGER,
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
      points6 REAL
    );
  `);

  await db.exec(`
    CREATE TABLE IF NOT EXISTS validation_issues (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      importBatchId INTEGER,
      staffId INTEGER,
      staffName TEXT,
      department TEXT,
      type TEXT,
      severity TEXT,
      description TEXT,
      sourceSheet TEXT,
      sourceRow INTEGER,
      createdAt TEXT
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

      ('hod.csse','password','HoD – CSSE','hod','CSSE',19),
      ('hod.maths','password','HoD – Mathematics','hod','Mathematics',20),
      ('hod.physics','password','HoD – Physics','hod','Physics',21),

      ('hos','password','Head of School','hos',NULL,22),
      ('ops','password','School Operations','operations',NULL,23)
    `);
  }
}

// Seed Workloads
export async function seedWorkloads(db) {
  const existing = await db.all("SELECT * FROM workloads");

  if (existing.length === 0) {
    console.log("Seeding workloads...");

    let values = [];

    for (let i = 1; i <= 18; i++) {
      const dept =
        i <= 7 ? "CSSE" : i <= 13 ? "Mathematics" : "Physics";

      values.push(`(${i}, 'Dummy, ${String(i).padStart(2, "0")}', '${dept}', 1.0, 25, 50, 10, 5, 10, 100, 'Balanced T&R', 'Balanced T&R', 0)`);
    }

    await db.run(`
      INSERT INTO workloads
      (staffId, name, department, fte, teaching, assignedRole, service, hdSupervision, research, total, targetBand, calcBand, hasDiscrepancy)
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
