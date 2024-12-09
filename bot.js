// @ts-check

import fs from 'fs';
import 'dotenv/config';
import { createInterface } from 'readline';

import { Client, GatewayIntentBits, PermissionFlagsBits } from 'discord.js';

const taskFile = 'tasks.json';

const messages = {
  completion: [
    'Good job!',
    'You did it!',
    'Woohoo!',
    'Way to go!',
  ]
}

/**
 * @type { { [username: string]: { name: string; completed: boolean, active: boolean }[] } }
 */
let tasks = {}

function loadTasks() {
  if (fs.existsSync(taskFile)) {
    tasks = JSON.parse(fs.readFileSync('tasks.json', 'utf-8'));
  }
}

function saveTasks() {
  fs.writeFileSync(taskFile, JSON.stringify(tasks, null, 2));
}

function getTasks(username) {
  if (!tasks[username]) {
    tasks[username] = [];
  }
  return tasks[username];
}

function getActiveTask(username) {
  return getTasks(username).find(task => task.active);
}

function getIncompleteTasks(username) {
  return getTasks(username).filter(task => !task.completed);
}

function randomMessage(messages) {
  return messages[Math.floor(Math.random() * messages.length)];
}

/**
 * Processes user commands to manage tasks.
 * @param {string} username - The username of the user issuing the command.
 * @param {string} content - The content of the message containing the command.
 * @param {{ isModerator: boolean; send: (r: string) => void; reply: (r: string) => void }} options - An object containing methods for sending replies.
 */
function processCommand(username, content, options) {
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
      const userTasks = getTasks(username);
      const task = { name: args, completed: false, active: false };
      userTasks.push(task);
      if (!getActiveTask(username)) {
        task.active = true;
      }
      reply(`Added your new task: ${args}`);
    } else {
      reply('Please provide a task name!');
    }
  }

  else if (command === '!starttask') {
    if (args) {
      const activeTask = getActiveTask(username);
      if (activeTask) {
        activeTask.active = false;
      }
      const userTasks = getTasks(username);
      const task = { name: args, completed: false, active: false };
      userTasks.push(task);
      task.active = true;
      reply(`Started your new task: ${args}`);
    } else {
      reply('Please provide a task name!');
    }
  }

  else if (command === '!task') {
    const task = getActiveTask(username);
    if (task) {
      reply(`Your active task is: ${task.name}`);
    } else {
      reply(`You have no active task!`);
    }
  }

  else if (command === '!done') {
    const task = getActiveTask(username);
    if (task) {
      task.completed = true;
      task.active = false;
      let msg = `Completed task: ${task.name}! ${randomMessage(messages.completion)}`;
      if (!getActiveTask(username)) {
        const userTasks = getIncompleteTasks(username);
        if (userTasks.length > 0) {
          userTasks[0].active = true;
          msg += `\n\nNext up: ${userTasks[0].name}!`;
        }
      }
      reply(msg.trim());
    } else {
      reply(`You have no active task!`);
    }
  }

  else if (command === '!next') {
    const userTasks = getIncompleteTasks(username);
    const activeTaskIndex = userTasks.findIndex(task => task.active);
    if (activeTaskIndex !== -1) {
      let activeTask = userTasks[activeTaskIndex];
      if (userTasks.length > 1) {
        activeTask.active = false;
        if (activeTaskIndex === userTasks.length - 1) {
          activeTask = userTasks[0];
        } else {
          activeTask = userTasks[activeTaskIndex + 1];
        }
        activeTask.active = true;
      }
      reply(`Your active task is: ${activeTask.name}`);
    } else {
      reply(`You have no active task!`);
    }
  }

  else if (command === '!tasks') {
    const userTasks = getIncompleteTasks(username);
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
    for (const username in tasks) {
      const userTasks = tasks[username].filter(task => !task.completed);
      if (userTasks.length > 0) {
        summary += `**${username}**\n\n`;
        for (const task of userTasks) {
          summary += `* ${task.name}`
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
    for (const username in tasks) {
      const userTasks = tasks[username].filter(task => task.completed);
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
      tasks = {};
      reply('All tasks have been cleared!');
    } else {
      reply('You do not have permission to clear tasks!');
    }
  }
}

function log(msg) {
  console.log(msg);
  const date = new Date().toLocaleString();
  fs.appendFileSync('log.txt', `${date} - ${msg}\n`);
}

function onProcessed(label, input, output) {
  if (output) {
    log(`${label}: ${input}`);
    log(`Bot: ${output}`);
    saveTasks();
  }
}

function runDiscordBot() {
  const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });

  client.once('ready', () => {
    log(`Logged in as ${client.user?.tag}!`);
  });

  client.on('messageCreate', message => {
    if (!message.author.bot) {
      const isModerator = !!(message.member?.permissions.has(PermissionFlagsBits.ManageMessages) || message.member?.permissions.has(PermissionFlagsBits.Administrator));
      const username = message.author.globalName ?? message.author.username;
      const label = message.guild ? `${message.guild.name}::${username}` : username;
      processCommand(username, message.content, {
        isModerator,
        send: r => { message.channel.send(r); onProcessed(label, message.content, r); },
        reply: r => { message.reply(r); onProcessed(label, message.content, r); },
      });
    }
  });

  client.login(process.env.DISCORD_TOKEN);
}

function runCLI() {
  const readline = createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const processInput = () => {
    readline.question('> ', input => {
      processCommand('user', input, {
        isModerator: true,
        send: r => console.log(r),
        reply: r => console.log(r),
      });
      saveTasks();
      processInput();
    });
  };

  processInput();
}

function main() {
  loadTasks();

  if (process.env.NODE_ENV === 'development') {
    runCLI();
  } else {
    log('Starting bot...');
    let tries = 0;
    while (tries < 10) {
      try {
        runDiscordBot();
        break;
      } catch (e) {
        log(e);
        tries++;
      }
    }
  }
}

main();
