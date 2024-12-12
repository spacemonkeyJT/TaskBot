import { Client } from 'pg';

export const client = new Client({
  user: 'postgres',
  host: 'localhost',
  database: 'postgres',
  password: 'sqlpw',
  port: 5432
});

export type Task = {
  id: number,
  name: string,
  completed: boolean,
  active: boolean,
  username: string,
};

/**
 * Gets all tasks for a given server.
 * @param server - The identifier of the server.
 * @returns An array of tasks for the given server.
 */
export async function getTasks(server: string): Promise<Task[]> {
  return (await client.query<Task>(
    `SELECT * FROM tasks
    WHERE server = $1`,
    [server]
  )).rows;
}

/**
 * Gets all tasks for a given server and user.
 * @param server The identifier of the server.
 * @param username The username of the user.
 * @returns An array of tasks for the given server and user.
 * @throws If there is an error fetching tasks.
 */
export async function getUserTasks(server: string, username: string) {
  return (await client.query<Task>(
    `SELECT * FROM tasks
    WHERE server = $1
    AND username = $2`,
    [server, username]
  )).rows;
}

/**
 * Gets the active task for a given server and user.
 * @param server The identifier of the server.
 * @param username The username of the user.
 * @returns The active task for the given server and user, or null if no active task exists.
 */
export async function getActiveTask(server: string, username: string) {
  return ((await client.query(
    `SELECT * FROM tasks
    WHERE server = $1
    AND username = $2
    AND active = true`,
    [server, username]
  )).rows as Task[])[0];
}

/**
 * Gets all incomplete tasks for a given server and user.
 * @param server The identifier of the server.
 * @param username The username of the user.
 * @returns An array of incomplete tasks for the given server and user.
 */
export async function getIncompleteTasks(server: string, username: string) {
  return (await client.query<Task>(
    `SELECT * FROM tasks
    WHERE server = $1
    AND username = $2
    AND completed = false`,
    [server, username]
  )).rows;
}

/**
 * Gets all completed tasks for a given server and user.
 * @param server The identifier of the server.
 * @param username The username of the user.
 * @returns An array of completed tasks for the given server.
 * @throws If there is an error fetching the completed tasks.
 */
export async function getCompletedTasks(server: string, username: string) {
  return (await client.query<Task>(
    `SELECT * FROM tasks
    WHERE server = $1
    AND username = $2
    AND completed = true`,
    [server, username]
  )).rows;
}

/**
 * Adds a new task for the given server and user.
 * @param server The identifier of the server.
 * @param username The username of the user.
 * @param taskName The name of the task.
 */
export async function addTask(server: string, username: string, taskName: string) {
  await client.query(
    `INSERT INTO tasks (server, username, name, completed, active)
    VALUES ($1, $2, $3, false, false)`,
    [server, username, taskName]
  );
}

/**
 * Marks a task as completed for the given server and user.
 * @param server The identifier of the server.
 * @param username The username of the user.
 * @param taskName The name of the task.
 */
export async function completeTask(server: string, username: string, taskName: string) {
  await client.query(
    `UPDATE tasks
    SET completed = true
    WHERE server = $1
    AND username = $2
    AND name = $3`,
    [server, username, taskName]
  );
}

/**
 * Activates a task for the given server and user.
 * @param server The identifier of the server.
 * @param username The username of the user.
 * @param taskName The name of the task.
 * @throws If there is an error activating the task.
 */
export async function activateTask(server: string , username: string, taskName: string) {
  await client.query(
    `UPDATE tasks
    SET active = true
    WHERE server = $1
    AND username = $2
    AND name = $3`,
    [server, username, taskName]
  );

  await client.query(
    `UPDATE tasks
    SET active = false
    WHERE server = $1
    AND username = $2
    AND name != $3`,
    [server, username, taskName]
  );
}

/**
 * Deletes all tasks for the given server.
 * @param server The identifier of the server.
 */
export async function clearTasks(server: string) {
  await client.query(
    `DELETE FROM tasks
    WHERE server = $1`,
    [server]
  );
}

export async function getUsers(server: string) {
  const res = await client.query<{ username: string }>(
    `SELECT DISTINCT username FROM tasks
    WHERE server = $1`,
    [server]
  );

  return res.rows
    .map(r => r.username)
    .sort();
}
