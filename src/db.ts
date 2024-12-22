import { config } from './config';
import { Client } from 'pg';

export const client = new Client(config.db);

export type Task = {
  id: number,
  name: string,
  completed: boolean,
  active: boolean,
  username: string,
};

function escape(str: string) { return str.replace(/'/g, "''"); }

/**
 * Gets all tasks for a given server.
 * @param server - The identifier of the server.
 * @returns An array of tasks for the given server.
 */
export async function getTasks(server: string): Promise<Task[]> {
  return (await client.query<Task>(
    `SELECT * FROM tasks
    WHERE server = '${escape(server)}'`
  )).rows;
}

/**
 * Retrieves a list of tasks with the specified name for a given server.
 * @param server - The identifier of the server.
 * @param taskName - The name of the task to retrieve.
 * @returns An array of tasks that match the specified name for the given server.
 */
export async function getTask(server: string, taskName: string): Promise<Task[]> {
  return (await client.query<Task>(
    `SELECT * FROM tasks
    WHERE server = '${escape(server)}'
    AND name = '${escape(taskName)}'`
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
    WHERE server = '${escape(server)}'
    AND username = '${escape(username)}'`
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
    WHERE server = '${escape(server)}'
    AND username = '${escape(username)}'
    AND active = true
    AND completed = false`
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
    WHERE server = '${escape(server)}'
    AND username = '${escape(username)}'
    AND completed = false`
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
    WHERE server = '${escape(server)}'
    AND username = '${escape(username)}'
    AND completed = true`
  )).rows;
}

/**
 * Adds a new task for the given server and user.
 * @param server The identifier of the server.
 * @param username The username of the user.
 * @param taskName The name of the task.
 */
export async function addTask(server: string, username: string, taskName: string) {
  if ((await getTask(server, taskName)).filter(r => !r.completed).length === 0) {
    await client.query(
      `INSERT INTO tasks (server, username, name, completed, active)
      VALUES ('${escape(server)}', '${escape(username)}', '${escape(taskName)}', false, false)`
    );
  }
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
    SET completed = true, active = false
    WHERE server = '${escape(server)}'
    AND username = '${escape(username)}'
    AND name = '${escape(taskName)}'`
  );
}

/**
 * Deletes a task for the given server and user.
 * @param server The identifier of the server.
 * @param username The username of the user.
 * @param taskName The name of the task.
 * @throws If there is an error deleting the task.
 */
export async function deleteTask(server: string, username: string, taskName: string) {
  await client.query(
    `DELETE FROM tasks
    WHERE server = '${escape(server)}'
    AND username = '${escape(username)}'
    AND name = '${escape(taskName)}'`
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
    WHERE server = '${escape(server)}'
    AND username = '${escape(username)}'
    AND name = '${escape(taskName)}'`
  );
  
  await client.query(
    `UPDATE tasks
    SET active = false
    WHERE server = '${escape(server)}'
    AND username = '${escape(username)}'
    AND name != '${escape(taskName)}'`
  );
}

/**
 * Deletes all tasks for the given server.
 * @param server The identifier of the server.
 */
export async function clearTasks(server: string) {
  await client.query(
    `DELETE FROM tasks
    WHERE server = '${escape(server)}'`
  );
}

export async function getUsers(server: string) {
  const res = await client.query<{ username: string }>(
    `SELECT DISTINCT username FROM tasks
    WHERE server = '${escape(server)}'`
  );

  return res.rows
    .map(r => r.username).sort();
}
