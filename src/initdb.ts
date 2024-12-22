import * as db from './db';

async function main() {
  await db.client.connect();

  await db.client.query(`
    CREATE TABLE IF NOT EXISTS tasks (
      id SERIAL PRIMARY KEY,
      server TEXT NOT NULL,
      username TEXT NOT NULL,
      name TEXT NOT NULL,
      active BOOLEAN NOT NULL DEFAULT FALSE,
      completed BOOLEAN NOT NULL DEFAULT FALSE
    )
  `);

  await db.client.query(`
    CREATE TABLE IF NOT EXISTS settings (
      id SERIAL PRIMARY KEY,
      server TEXT NOT NULL,
      setting TEXT NOT NULL,
      value TEXT
    )
  `);

  process.exit(0);
}

main().catch(console.error);
