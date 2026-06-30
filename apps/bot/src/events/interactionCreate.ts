import { Interaction, MessageFlags } from 'discord.js';
import { executeCustomCommand } from '../commands/customCommand';

const musicEnabled = process.env.MUSIC_ENABLED === 'true';
const musicCommands = musicEnabled ? ['play', 'skip', 'stop', 'queue', 'pause', 'resume', 'nowplaying'] : [];
const { handleMusicCommand } = musicEnabled ? require('../commands/music') : {};

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
