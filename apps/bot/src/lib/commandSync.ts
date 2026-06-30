import { REST, Routes, ApplicationCommandData, Client } from 'discord.js';
import { prisma } from './prisma';
import { getAllCommandData } from '../commands/index';

const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN!);

export async function registerBaseCommands(client: Client) {
  const baseCommands = getAllCommandData();

  for (const guild of client.guilds.cache.values()) {
    try {
      const customCommands = await prisma.customCommand.findMany({
        where: { guildId: guild.id },
      });

      const customData: ApplicationCommandData[] = customCommands.map((cmd) => ({
        name: cmd.name,
        description: cmd.description,
        type: 1,
      }));

      const allCommands = [...baseCommands, ...customData];

      await rest.put(
        Routes.applicationGuildCommands(process.env.DISCORD_CLIENT_ID!, guild.id),
        { body: allCommands }
      );
      console.log(`Registered ${allCommands.length} commands for guild ${guild.id} (${guild.name})`);
    } catch (error) {
      console.error(`Failed to register commands for guild ${guild.id}:`, error);
    }
  }
}

export async function syncAllGuilds() {
  const guildIds = await prisma.customCommand.findMany({
    select: { guildId: true },
    distinct: ['guildId'],
  });

  for (const { guildId } of guildIds) {
    const commands = await prisma.customCommand.findMany({
      where: { guildId },
    });

    const customData: ApplicationCommandData[] = commands.map((cmd) => ({
      name: cmd.name,
      description: cmd.description,
      type: 1,
    }));

    try {
      await rest.put(
        Routes.applicationGuildCommands(process.env.DISCORD_CLIENT_ID!, guildId),
        { body: [...getAllCommandData(), ...customData] }
      );
      console.log(`Synced ${commands.length + getAllCommandData().length} commands for guild ${guildId}`);
    } catch (error) {
      console.error(`Failed to sync commands for guild ${guildId}:`, error);
    }
  }
}
