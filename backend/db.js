export async function seedUsers(db) {
  const existingUsers = await db.all("SELECT * FROM users");
 
  if (existingUsers.length === 0) {
    console.log("Seeding users into database...");
 
    await db.run(`
      INSERT INTO users (username, password, name, role, department, staffId)
      VALUES
      -- CSSE Staff
      ('dummy01', 'password', 'Dummy, 01', 'staff', 'CSSE', 1),
      ('dummy02', 'password', 'Dummy, 02', 'staff', 'CSSE', 2),
      ('dummy03', 'password', 'Dummy, 03', 'staff', 'CSSE', 3),
      ('dummy04', 'password', 'Dummy, 04', 'staff', 'CSSE', 4),
      ('dummy05', 'password', 'Dummy, 05', 'staff', 'CSSE', 5),
      ('dummy06', 'password', 'Dummy, 06', 'staff', 'CSSE', 6),
      ('dummy07', 'password', 'Dummy, 07', 'staff', 'CSSE', 7),
 
      -- Mathematics Staff
      ('dummy08', 'password', 'Dummy, 08', 'staff', 'Mathematics', 8),
      ('dummy09', 'password', 'Dummy, 09', 'staff', 'CSSE', 9),
      ('dummy10', 'password', 'Dummy, 10', 'staff', 'Mathematics', 10),
      ('dummy11', 'password', 'Dummy, 11', 'staff', 'Mathematics', 11),
      ('dummy12', 'password', 'Dummy, 12', 'staff', 'Mathematics', 12),
      ('dummy13', 'password', 'Dummy, 13', 'staff', 'Mathematics', 13),
 
      -- Physics Staff
      ('dummy14', 'password', 'Dummy, 14', 'staff', 'Physics', 14),
      ('dummy15', 'password', 'Dummy, 15', 'staff', 'Physics', 15),
      ('dummy16', 'password', 'Dummy, 16', 'staff', 'Physics', 16),
      ('dummy17', 'password', 'Dummy, 17', 'staff', 'Physics', 17),
      ('dummy18', 'password', 'Dummy, 18', 'staff', 'Physics', 18),
 
      -- HoDs
      ('hod.csse', 'password', 'HoD – CSSE', 'hod', 'CSSE', 19),
      ('hod.maths', 'password', 'HoD – Mathematics', 'hod', 'Mathematics', 20),
      ('hod.physics', 'password', 'HoD – Physics', 'hod', 'Physics', 21),
 
      -- Admin
      ('hos', 'password', 'Head of School', 'hos', NULL, 22),
      ('ops', 'password', 'School Operations', 'operations', NULL, 23)
    `);
  }
}