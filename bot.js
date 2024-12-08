import 'dotenv/config';

import { Client, GatewayIntentBits } from 'discord.js';

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });

client.once('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

client.on('messageCreate', message => {
  if (message.content === '!hello') {
    message.channel.send('Hello! I am your chatbot!');
  }
});

client.login(process.env.DISCORD_TOKEN);
