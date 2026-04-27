import sqlite3 from "sqlite3";
import { open } from "sqlite";

// Initialize DB
export async function initDB() {
  return open({
    filename: "./database.sqlite",
    driver: sqlite3.Database,
  });
}

// Create tables
export async function setupDB(db) {
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
}

// Seed users (unchanged) :contentReference[oaicite:0]{index=0}
export async function seedUsers(db) {
  const existingUsers = await db.all("SELECT * FROM users");

  if (existingUsers.length === 0) {
    console.log("Seeding users into database...");

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

// Seed workloads (FIXED)
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