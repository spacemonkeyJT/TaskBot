import fs from 'fs';
import 'dotenv/config';
import { createInterface } from 'readline';
import minimist from 'minimist';

import { Client, GatewayIntentBits, PermissionFlagsBits } from 'discord.js';
import * as db from './db.js';

const messages = {
  completion: [
    'Good job!',
    'You did it!',
    'Woohoo!',
    'Way to go!',
    'You\'re crushing it!',
  ],
  addtask: [
    'You got this!',
    'I believe in you!',
    'You can do anything.',
    'Let\'s go!',
  ]
}

function randomMessage(messages: string[]) {
  return messages[Math.floor(Math.random() * messages.length)];
}

/**
 * Processes user commands to manage tasks.
 * @param server The name of the server.
 * @param username The username of the user issuing the command.
 * @param content The content of the message containing the command.
 * @param options An object containing methods for sending replies.
 */
async function processCommand(server: string, username: string, content: string, options: { isModerator: boolean; send: (r: string) => void; reply: (r: string) => void; }) {
  try {
    const { isModerator, reply, send } = options;

    const command = content.split(' ')[0];
    const args = content.substring(command.length).trim();

    if (command === '!taskhelp' || command === '!taskshelp') {
      let msg = 'Commands:\n\n';
      msg += '* `!addtask <task_name>` - Adds a new task for the user.\n';
      msg += '* `!starttask <task_name>` - Adds a new task for the user and activates it.\n';
      msg += '* `!task` - Displays the user\'s active task.\n';
      msg += '* `!done` - Marks the user\'s active task as completed and activates the next task, if available.\n';
      msg += '* `!next` - Activates the next task in the user\'s list of incomplete tasks.\n';
      msg += '* `!tasks` - Lists current incomplete tasks for the user.\n';
      msg += '* `!alltasks` - Lists all current incomplete tasks for all users.\n';
      msg += '* `!completed` - Lists all completed tasks for all users.\n';
      msg += '* `!cleartasks` - Clears all tasks for all users (moderator only).\n';
      send(msg);
    }

    else if (command === '!addtask') {
      if (args) {
        const taskName = args;
        await db.addTask(server, username, taskName);
        if (!await db.getActiveTask(server, username)) {
          await db.activateTask(server, username, taskName);
        }
        reply(`Added your new task: ${taskName}\n${randomMessage(messages.addtask)}`);
      } else {
        reply('Please provide a task name!');
      }
    }

    else if (command === '!starttask') {
      if (args) {
        const taskName = args;
        await db.addTask(server, username, taskName);
        await db.activateTask(server, username, taskName);
        reply(`Started your new task: ${args}\n${randomMessage(messages.addtask)}`);
      } else {
        reply('Please provide a task name!');
      }
    }

    else if (command === '!task') {
      const task = await db.getActiveTask(server, username);
      if (task) {
        reply(`Your active task is: ${task.name}`);
      } else {
        reply(`You have no active task!`);
      }
    }

    else if (command === '!done') {
      const task = await db.getActiveTask(server, username);
      if (task) {
        await db.completeTask(server, username, task.name);
        let msg = `Completed task: ${task.name}!`;
        const userTasks = await db.getIncompleteTasks(server, username);
        if (userTasks.length > 0) {
          await db.activateTask(server, username, userTasks[0].name);
          msg += `\nNext up: ${userTasks[0].name}!`;
        }
        msg += `\n${randomMessage(messages.completion)}`;
        reply(msg.trim());
      } else {
        reply(`You have no active task!`);
      }
    }

    else if (command === '!next') {
      const userTasks = await db.getIncompleteTasks(server, username);
      const activeTaskIndex = userTasks.findIndex(task => task.active);
      if (activeTaskIndex !== -1) {
        let activeTask = userTasks[activeTaskIndex];
        if (userTasks.length > 1) {
          if (activeTaskIndex === userTasks.length - 1) {
            activeTask = userTasks[0];
          } else {
            activeTask = userTasks[activeTaskIndex + 1];
          }
          await db.activateTask(server, username, activeTask.name);
        }
        reply(`Your active task is: ${activeTask.name}`);
      } else {
        reply(`You have no active task!`);
      }
    }

    else if (command === '!tasks') {
      const userTasks = await db.getIncompleteTasks(server, username);
      if (userTasks.length > 0) {
        let summary = '';
        for (const task of userTasks) {
          summary += `* ${task.name}`;
          if (task.active) {
            summary += ' (active)';
          }
          summary += '\n';
        }
        reply(`Your tasks:\n\n${summary.trim()}`);
      } else {
        reply('No tasks found!');
      }
    }

    else if (command === '!alltasks') {
      let summary = '';

      const users = await db.getUsers(server);
      for (const user of await db.getUsers(server)) {
        const userTasks = await db.getIncompleteTasks(server, user);
        if (userTasks.length > 0) {
          summary += `\n**${user}**\n\n`;
          for (const task of userTasks) {
            summary += `* ${task.name}\n`
          }
        }
      }
      if (summary) {
        reply(`Current tasks:\n\n${summary.trim()}`);
      } else {
        reply('No tasks found!');
      }
    }

    else if (command === '!completed') {
      let summary = '';
      for (const username of await db.getUsers(server)) {
        const userTasks = await db.getCompletedTasks(server, username);
        if (userTasks.length > 0) {
          summary += `\n**${username}**\n\n`;
          for (const task of userTasks) {
            summary += `* ${task.name}\n`;
          }
        }
      }
      if (summary) {
        reply(`Completed tasks:\n\n${summary.trim()}`);
      } else {
        reply('No tasks found!');
      }
    }

    else if (command === '!cleartasks') {
      if (isModerator) {
        await db.clearTasks(server);
        reply('All tasks have been cleared!');
      } else {
        reply('You do not have permission to clear tasks!');
      }
    }
  } catch (error) {
    log(error);
  }
}

function log(msg: unknown) {
  console.log(msg);
  const date = new Date().toLocaleString();
  fs.appendFileSync('log.txt', `${date} - ${msg}\n`);
}

function onProcessed(label: string, input: string, output: string) {
  if (output) {
    log(`${label}: ${input}`);
    log(`Bot: ${output}`);
  }
}

async function runDiscordBot() {
  const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });

  client.once('ready', () => {
    log(`Logged in as ${client.user?.tag}!`);
  });

  client.on('messageCreate', async message => {
    if (!message.author.bot) {
      const isModerator = !!(message.member?.permissions.has(PermissionFlagsBits.ManageMessages) || message.member?.permissions.has(PermissionFlagsBits.Administrator));
      const username = message.author.globalName ?? message.author.username;
      const server = message.guild?.name;
      if (server) {
        const label = `${server}::${username}`;
        await processCommand(server, username, message.content, {
          isModerator,
          send: r => { message.channel.send(r); onProcessed(label, message.content, r); },
          reply: r => { message.reply(r); onProcessed(label, message.content, r); },
        });
      }
    }
  });

  await client.login(process.env.DISCORD_TOKEN);
}

async function runCLI() {
  const readline = createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const question = (question: string) => new Promise<string>(resolve => readline.question(question, resolve));

  while (true) {
    const input = await question('> ');
    await processCommand('kmrk\'s mercs', 'SpaceMonkey', input, {
      isModerator: true,
      send: r => console.log(r),
      reply: r => console.log(r),
    });
  }
}

async function runBot(options: { autoRestart: boolean; dev: boolean; }) {
  const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  try {
    if (options.dev) {
      log('Running CLI mode');
      await runCLI();
    } else {
      log('Running Discord bot mode');
      await runDiscordBot();
    }
  } catch (err) {
    log(err);
    if (options.autoRestart) {
      log('Restarting bot in 5 seconds...');
      await sleep(5000);
      await runBot(options);
    }
  }
}

async function main() {
  const args = minimist(process.argv.slice(2));
  log('Starting bot');

  const options = {
    autoRestart: args.r,
    dev: args.d,
  };

  if (options.dev) {
    log('Dev mode enabled');
  }

  if (options.autoRestart) {
    log('Auto-restart enabled');
  }

  await db.client.connect();

  await runBot(options);
}

main().catch(console.error);
