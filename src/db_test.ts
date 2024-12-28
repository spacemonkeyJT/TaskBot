import { beforeAll, beforeEach, expect, test } from 'bun:test';
import * as db from './db';

beforeAll(async () => {
  await db.client.connect();
})

beforeEach(async () => {
  await db.clearTasks('test');
  await db.clearSettings('test');
  await db.clearSettings('test2');
});

async function addTestTasks() {
  await db.addTask('test', 'user', 'task1');
  await db.addTask('test', 'user', 'task2');
  await db.addTask('test', 'user2', 'task3');
}

test('getTasks/addTasks', async () => {
  const tasks = await db.getTasks('test');
  expect(tasks).toEqual([]);

  await addTestTasks();

  const tasks2 = await db.getTasks('test');
  expect(tasks2.length).toBe(3);
  
  const taskInfo = tasks2.map(r => ({
    user: r.username,
    name: r.name,
    completed: r.completed,
    active: r.active,
  }))

  expect(taskInfo).toEqual([
    { user: 'user', name: 'task1', completed: false, active: false },
    { user: 'user', name: 'task2', completed: false, active: false },
    { user: 'user2', name: 'task3', completed: false, active: false },
  ]);
});

test('addTask should not add duplicates', async () => {
  await db.addTask('test', 'user', 'task1');
  await db.addTask('test', 'user', 'task1');
  const tasks = await db.getTasks('test');
  expect(tasks.length).toBe(1);
});

test('addTask should allow duplicate of completed tasks', async () => {
  await db.addTask('test', 'user', 'task1');
  await db.completeTask('test', 'user', 'task1');
  await db.addTask('test', 'user', 'task1');
  const tasks = await db.getTasks('test');
  expect(tasks.length).toBe(2);
})

test('getUserTasks', async () => {
  await addTestTasks();

  const tasks = await db.getUserTasks('test', 'user');
  expect(tasks.length).toBe(2);

  const taskInfo = tasks.map(r => ({
    name: r.name,
    completed: r.completed,
    active: r.active,
  }));

  expect(taskInfo).toEqual([
    { name: 'task1', completed: false, active: false },
    { name: 'task2', completed: false, active: false },
  ]);
});

test('completeTask', async () => {
  await addTestTasks();

  await db.completeTask('test', 'user', 'task1');

  const tasks = await db.getUserTasks('test', 'user');

  const taskInfo = tasks
    .map(r => ({
      name: r.name,
      completed: r.completed,
      active: r.active,
    }))
    .sort((a, b) => a.name.localeCompare(b.name));

  expect(taskInfo).toEqual([
    { name: 'task1', completed: true, active: false },
    { name: 'task2', completed: false, active: false },
  ]);
});

test('activateTask', async () => {
  await addTestTasks();

  await db.activateTask('test', 'user', 'task1');

  let tasks = await db.getUserTasks('test', 'user');

  expect(tasks.length).toBe(2);
  let activeTasks = tasks.filter(t => t.active).map(r => r.name);
  expect(activeTasks).toEqual(['task1']);

  await db.activateTask('test', 'user', 'task2');

  tasks = await db.getUserTasks('test', 'user');

  expect(tasks.length).toBe(2);
  activeTasks = tasks.filter(t => t.active).map(r => r.name);
  expect(activeTasks).toEqual(['task2']);
});

test('getActiveTask', async () => {
  await addTestTasks();

  await db.activateTask('test', 'user', 'task1');

  const task = await db.getActiveTask('test', 'user');  

  expect(task.name).toBe('task1');
});

test('getUsers', async () => {
  await addTestTasks();

  const users = await db.getUsers('test');

  expect(users).toEqual(['user', 'user2']);
});

test('clearTasks', async () => {
  await addTestTasks();

  await db.clearTasks('test');

  const tasks = await db.getTasks('test');

  expect(tasks.length).toBe(0);
});

test('getTask', async () => {
  await addTestTasks();

  expect((await db.getTask('test', 'task1')).length).toBe(1);
  expect((await db.getTask('test', 'invalid')).length).toBe(0);
});

test('settings', async () => {
  await db.setSetting('test', 'foo', 'bar');
  await db.setSetting('test2', 'foo', 'bar2');
  expect(await db.getSetting('test', 'foo')).toBe('bar');
  expect(await db.getSetting('test2', 'foo')).toBe('bar2');

  await db.setSetting('test', 'foo', 'baz');
  expect(await db.getSetting('test', 'foo')).toBe('baz');
  expect(await db.getSetting('test2', 'foo')).toBe('bar2');

  await db.setSetting('test2', 'foo', 'baz2');
  expect(await db.getSetting('test', 'foo')).toBe('baz');
  expect(await db.getSetting('test2', 'foo')).toBe('baz2');
});

test('deleteTask', async () => {
  await addTestTasks();

  expect((await db.getUserTasks('test', 'user')).length).toBe(2);

  await db.deleteTask('test', 'user', 'task1');

  expect((await db.getUserTasks('test', 'user')).length).toBe(1);
});

test('getIncompleteTasks', async () => {
  await addTestTasks();

  expect((await db.getIncompleteTasks('test', 'user')).length).toBe(2);
  expect((await db.getIncompleteTasks('test', 'user2')).length).toBe(1);

  await db.completeTask('test', 'user', 'task1');

  expect((await db.getIncompleteTasks('test', 'user')).length).toBe(1);
});

test('deleteOldTasks', async () => {
  await addTestTasks();

  await db.client.query(`UPDATE tasks
    SET created_at = NOW() - INTERVAL '500 minutes'
    WHERE server = 'test'
    AND username = 'user'
    AND name = 'task1'`);

  expect((await db.getUserTasks('test', 'user')).map(t => t.name).sort()).toEqual(['task1', 'task2']);

  await db.deleteOldTasks('test');

  expect((await db.getUserTasks('test', 'user')).map(t => t.name).sort()).toEqual(['task2']);
});
