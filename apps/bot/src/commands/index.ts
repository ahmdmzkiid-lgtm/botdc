import { REST, Routes, SlashCommandBuilder } from 'discord.js';

const staticCommands = [
  new SlashCommandBuilder()
    .setName('ping')
    .setDescription('Balas dengan Pong!'),
];

const musicEnabled = process.env.MUSIC_ENABLED === 'true';

let allCommands = [...staticCommands];

if (musicEnabled) {
  const { musicCommands } = require('./music');
  allCommands = [...allCommands, ...musicCommands];
}

export function getAllCommandData() {
  return allCommands.map((cmd) => cmd.toJSON());
}

export async function registerCommands(clientId: string, guildId: string, token: string) {
  const rest = new REST({ version: '10' }).setToken(token);

  try {
    await rest.put(Routes.applicationGuildCommands(clientId, guildId), {
      body: getAllCommandData(),
    });
    console.log(`Registered ${getAllCommandData().length} commands for guild ${guildId}`);
  } catch (error) {
    console.error('Failed to register commands:', error);
  }
}
