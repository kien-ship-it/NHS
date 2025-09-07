// src/scripts/seed.mjs
import Database from 'better-sqlite3';
import { hashSync } from 'bcrypt';
import { randomUUID } from 'crypto';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

// 1. Checks for .db file and clears the lot if needed.
// 2. Build the empty tables (`users`, `reports`) according to our blueprints.
// 3. Populates the building with our default user.
// We use `bcrypt` to scramble the user's password into a secure hash before storing it.

console.log('🌱 Starting to seed the database...');

// Debug: Log all environment variables
console.log('Environment variables:', process.env.JWT_SECRET);

// Step 1: Connect to the database
// We read the path from our .env.local file to know where to build our database.
const dbPath = process.env.DATABASE_PATH;
if (!dbPath) {
  throw new Error(
    'DATABASE_PATH environment variable is not set. Please check your .env.local file.'
  );
}
const db = new Database(dbPath);

// Step 2: Define the Table Schemas
// We use `DROP TABLE IF EXISTS` to ensure we start with a clean slate every time we run the script.
const createUsersTable = `
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL
  );
`;

const createReportsTable = `
  CREATE TABLE IF NOT EXISTS reports (
    id TEXT PRIMARY KEY,
    patient_name TEXT NOT NULL,
    diagnosis TEXT NOT NULL,
    created_by TEXT NOT NULL,
    status TEXT NOT NULL CHECK(status IN ('LOCAL', 'PUSHED')),
    national_id TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users (id)
  );
`;

// Step 3: Execute the queries to build the tables
console.log('🔧 Creating tables...');
db.exec('DROP TABLE IF EXISTS reports;'); // Drop reports first due to foreign key constraint
db.exec('DROP TABLE IF EXISTS users;');
db.exec(createUsersTable);
db.exec(createReportsTable);
console.log('✅ Tables created successfully.');

// Step 4: Prepare and insert the default user
try {
  console.log('👤 Creating default user...');
  const defaultUser = {
    id: randomUUID(),
    email: 'user@example.com',
    password: 'password123',
  };

  const passwordHash = hashSync(defaultUser.password, 10); // Hash the password

  const insertUser = db.prepare(
    'INSERT INTO users (id, email, password_hash) VALUES (?, ?, ?)'
  );
  insertUser.run(defaultUser.id, defaultUser.email, passwordHash);

  console.log('✅ Default user created:');
  console.log(`   Email: ${defaultUser.email}`);
  console.log(`   Password: ${defaultUser.password}`);
} catch (error) {
  console.error('❌ Error creating default user:', error);
} finally {
  // Step 5: Close the connection
  db.close();
  console.log('🌱 Database seeding finished.');
}