import { Client } from 'discord.js';
import { registerBaseCommands } from '../lib/commandSync';

export const name = 'ready';
export const once = true;

export async function execute(client: Client) {
  console.log(`Bot ready: ${client.user?.tag}`);

  try {
    await registerBaseCommands(client);
    console.log('All guild commands registered');
  } catch (error) {
    console.error('Failed to register guild commands:', error);
  }
}
