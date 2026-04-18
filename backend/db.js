import sqlite3 from "sqlite3";
import { open } from "sqlite";

// Initialize database connection
export async function initDB() {
  const db = await open({
    filename: "./database.sqlite",
    driver: sqlite3.Database,
  });

  return db;
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
}

// Seed initial data (only runs if table is empty)
export async function seedUsers(db) {
  const existingUsers = await db.all("SELECT * FROM users");

  if (existingUsers.length === 0) {
    console.log("Seeding users into database...");

    await db.run(`
      INSERT INTO users (username, password, name, role, department, staffId)
      VALUES
      ('dummy01', 'password', 'Dummy, 01', 'staff', 'CSSE', 1),
      ('dummy02', 'password', 'Dummy, 02', 'staff', 'CSSE', 2),
      ('dummy03', 'password', 'Dummy, 03', 'staff', 'CSSE', 3),
      ('hod.csse', 'password', 'HoD – CSSE', 'hod', 'CSSE', 19),
      ('hod.maths', 'password', 'HoD – Mathematics', 'hod', 'Mathematics', 20),
      ('hod.physics', 'password', 'HoD – Physics', 'hod', 'Physics', 21),
      ('hos', 'password', 'Head of School', 'hos', NULL, 22),
      ('ops', 'password', 'School Operations', 'operations', NULL, 23)
    `);
  }
}