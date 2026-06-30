import { ChatInputCommandInteraction, MessageFlags } from 'discord.js';
import { prisma } from '../lib/prisma';

export async function executeCustomCommand(interaction: ChatInputCommandInteraction) {
  const commandName = interaction.commandName;

  const customCommand = await prisma.customCommand.findUnique({
    where: {
      guildId_name: {
        guildId: interaction.guildId!,
        name: commandName,
      },
    },
  });

  if (customCommand) {
    await interaction.reply({ content: customCommand.response });
  } else {
    await interaction.reply({ content: 'Command tidak ditemukan', flags: MessageFlags.Ephemeral });
  }
}
