// @ts-check

import 'dotenv/config';

import { Client, GatewayIntentBits } from 'discord.js';

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });

/**
 * @type { { [username: string]: { name: string; completed: boolean, active: boolean }[] } }
 */
const tasks = {}

client.once('ready', () => {
  console.log(`Logged in as ${client.user?.tag}!`);
});

function getTasks(username) {
  if (!tasks[username]) {
    tasks[username] = [];
  }
  return tasks[username];
}

function activeTask(username) {
  return getTasks(username).find(task => task.active);
}

function getIncompleteTasks(username) {
  return getTasks(username).filter(task => !task.completed);
}

client.on('messageCreate', message => {
  if (!message.author.bot) {
    const username = message.author.globalName ?? message.author.username;
    const command = message.content.split(' ')[0];
    const args = message.content.substring(command.length).trim();
    
    if (command === '!addtask') {
      const userTasks = getTasks(username);
      userTasks.push({ name: args, completed: false, active: false });
      if (userTasks.length === 1) {
        userTasks[0].active = true;
      }
      message.reply(`Added your new task: ${args}`);
    }

    if (command === '!task') {
      const task = activeTask(username);
      if (task) {
        message.reply(`Your active task is: ${task.name}`);
      } else {
        message.reply(`You have no active task!`);
      }
    }

    if (command === '!done') {
      const task = activeTask(username);
      if (task) {
        task.completed = true;
        task.active = false;
        let reply = `Completed task: ${task.name}! Good job!`;
        if (!activeTask(username)) {
          const userTasks = getIncompleteTasks(username);
          if (userTasks.length > 0) {
            userTasks[0].active = true;
            reply += `\n\nNext up: ${userTasks[0].name}!`;
          }
        }
        message.reply(reply);
      } else {
        message.reply(`You have no active task!`);
      }
    }

    if (command === '!next') {
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
        message.reply(`Your active task is: ${activeTask.name}`);
      } else {
        message.reply(`You have no active task!`);
      }
    }

    if (command === '!tasks') {
      let summary = '';
      for (const username in tasks) {
        const userTasks = tasks[username].filter(task => !task.completed);
        for (const task of userTasks) {
          summary += `* ${username}: ${task.name}\n`;
        }
      }
      if (summary) {
        message.reply(`Current tasks:\n\n${summary}`);
      } else {
        message.reply('No tasks found!');
      }
    }

    if (command === '!completed') {
      let summary = '';
      for (const username in tasks) {
        const userTasks = tasks[username].filter(task => task.completed);
        for (const task of userTasks) {
          summary += `* ${username}: ${task.name}\n`;
        }
      }
      if (summary) {
        message.reply(`Completed tasks:\n\n${summary}`);
      } else {
        message.reply('No tasks found!');
      }
    }
  }
});

client.login(process.env.DISCORD_TOKEN);
