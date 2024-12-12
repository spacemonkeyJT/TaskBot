import * as db from './db';
import fs from 'fs';

type tasksJson = {
  [username: string]: {
    name: string;
    completed: boolean;
    active: boolean;
  }
}

async function main() {
  await db.client.connect();

  const jsonData = JSON.parse(fs.readFileSync('./tasks.json', 'utf8'));

  const server = 'kmrk\'s mercs';

  for (const username in jsonData) {
    for (const task of jsonData[username]) {
      await db.addTask(server, username, task.name);
    }
  }

  process.exit(0);
}

main().catch(console.error);
