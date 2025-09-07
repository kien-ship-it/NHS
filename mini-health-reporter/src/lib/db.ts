// src/lib/db.ts

import Database from 'better-sqlite3';

// First, we check if the DATABASE_PATH is even set. If not, we can't run,
// so we throw an error to stop the application immediately. This is much
// better than letting it crash later in a confusing way.
if (!process.env.DATABASE_PATH) {
  throw new Error('DATABASE_PATH environment variable is not set.');
}

// We declare a space on the "global" object of our application for the database.
// This is a special trick for Next.js development. In development, Next.js
// can reload files many times. Without this, we might create a new database
// connection on every single code change, quickly exhausting resources.
// By storing it on `globalThis`, the connection persists between reloads.
declare global {
  var db: Database.Database | undefined;
}

// Now we create the database connection instance.
const db =
  globalThis.db ??
  new Database(process.env.DATABASE_PATH, {
    verbose: console.log,
  });

// In a non-production environment, we attach the new connection to the global object.
if (process.env.NODE_ENV !== 'production') {
  globalThis.db = db;
}

export default db;