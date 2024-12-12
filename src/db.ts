import { createClient } from '@supabase/supabase-js'

const supabase = createClient((process.env as any).SUPABASE_URL, (process.env as any).SUPABASE_KEY)

/**
 * Gets all tasks for a given server.
 * @param server - The identifier of the server.
 * @returns An array of tasks for the given server.
 */
export async function getTasks(server: string): Promise<Array<{ id: number, name: string, created_at: string, completed: boolean, active: boolean, user: string }>> {
  const { data, error } = await supabase
    .from('tasks')
    .select()
    .eq('server', server);

  if (error) {
    throw error;
  }

  return data;
}

/**
 * Gets all tasks for a given server and user.
 * @param server The identifier of the server.
 * @param username The username of the user.
 * @returns An array of tasks for the given server and user.
 * @throws If there is an error fetching tasks.
 */
export async function getUserTasks(server: string, username: string) {
  const { data, error } = await supabase
    .from('tasks')
    .select()
    .eq('server', server)
    .eq('user', username);

  if (error) {
    throw error;
  }

  return data;
}

/**
 * Gets the active task for a given server and user.
 * @param server The identifier of the server.
 * @param username The username of the user.
 * @returns The active task for the given server and user, or null if no active task exists.
 */
export async function getActiveTask(server: string, username: string) {
  const { data, error } = await supabase
    .from('tasks')
    .select()
    .eq('server', server)
    .eq('user', username)
    .eq('active', true);

  if (error) {
    throw error;
  } else if (data.length === 0) {
    return null;
  }

  return data[0];
}

/**
 * Gets all incomplete tasks for a given server and user.
 * @param server The identifier of the server.
 * @param username The username of the user.
 * @returns An array of incomplete tasks for the given server and user.
 */
export async function getIncompleteTasks(server: string, username: string) {
  const { data, error } = await supabase
    .from('tasks')
    .select()
    .eq('server', server)
    .eq('user', username)
    .eq('completed', false);

  if (error) {
    throw error;
  }

  return data;
}

/**
 * Gets all completed tasks for a given server and user.
 * @param server The identifier of the server.
 * @param username The username of the user.
 * @returns An array of completed tasks for the given server.
 * @throws If there is an error fetching the completed tasks.
 */
export async function getCompletedTasks(server: string, username: string) {
  const { data, error } = await supabase
    .from('tasks')
    .select()
    .eq('server', server)
    .eq('user', username)
    .eq('completed', true);
    
  if (error) {
    throw error;
  }

  return data;
}

/**
 * Adds a new task for the given server and user.
 * @param server The identifier of the server.
 * @param username The username of the user.
 * @param taskName The name of the task.
 * @returns The newly created task.
 */
export async function addTask(server: string, username: string, taskName: string) {
  const task = {
    server,
    user: username,
    name: taskName,
    created_at: new Date().toISOString(),
    completed: false,
    active: false
  };

  const { error } = await supabase
    .from('tasks')
    .insert(task);

  if (error) {
    throw error;
  }

  return task;
}

/**
 * Marks a task as completed for the given server and user.
 * @param server The identifier of the server.
 * @param username The username of the user.
 * @param taskName The name of the task.
 */
export async function completeTask(server: string, username: string, taskName: string) {
  const { error } = await supabase
    .from('tasks')
    .update({ completed: true, active: false })
    .eq('server', server)
    .eq('user', username)
    .eq('name', taskName);

  if (error) {
    throw error;
  }
}

/**
 * Activates a task for the given server and user.
 * @param server The identifier of the server.
 * @param username The username of the user.
 * @param taskName The name of the task.
 * @throws If there is an error activating the task.
 */
export async function activateTask(server: string , username: string, taskName: string) {
  await supabase
    .from('tasks')
    .update({ active: true })
    .eq('server', server)
    .eq('user', username)
    .eq('name', taskName);

  await supabase
    .from('tasks')
    .update({ active: false })
    .eq('server', server)
    .eq('user', username)
    .neq('name', taskName);
}

/**
 * Deletes all tasks for the given server.
 * @param server The identifier of the server.
 */
export async function clearTasks(server: string) {
  const { error } = await supabase
    .from('tasks')
    .delete()
    .eq('server', server);

  if (error) {
    throw error;
  }
}

export async function getUsers(server: string) {
  const { data, error } = await supabase
    .from('tasks')
    .select('user')
    .eq('server', server);

  if (error) {
    throw error;
  }

  let users = data.map(r => r.user);

  // Make users unique
  users.sort();
  users = users.filter((user, index) => users.indexOf(user) === index);

  return users;
}
