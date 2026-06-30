import { Interaction, MessageFlags } from 'discord.js';
import { executeCustomCommand } from '../commands/customCommand';
import { handleMusicCommand } from '../commands/music';

const musicCommands = ['play', 'skip', 'stop', 'queue', 'pause', 'resume', 'nowplaying'];

export const name = 'interactionCreate';

export async function execute(interaction: Interaction) {
  if (!interaction.isChatInputCommand()) return;

  try {
    if (musicCommands.includes(interaction.commandName)) {
      await handleMusicCommand(interaction);
    } else if (interaction.commandName === 'ping') {
      await interaction.reply({ content: 'Pong! 🏓' });
    } else {
      await executeCustomCommand(interaction);
    }
  } catch (error) {
    console.error('Error in interactionCreate:', error);
    if (interaction.isRepliable()) {
      await interaction.reply({ content: 'Terjadi kesalahan', flags: MessageFlags.Ephemeral });
    }
  }
}
