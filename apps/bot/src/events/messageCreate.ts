import { Message, ChannelType, TextChannel } from 'discord.js';
import { checkMessage } from '../features/automod';
import { addXP, checkLevelRoles } from '../features/xp';
import { prisma } from '../lib/prisma';
import { formatMessage } from '../lib/formatter';

export const name = 'messageCreate';

export async function execute(message: Message) {
  if (message.author.bot) return;
  if (message.channel.type !== ChannelType.GuildText) return;

  await checkMessage(message);

  const config = await prisma.guild.findUnique({
    where: { id: message.guildId! },
  });

  if (!config) return;

  const { leveledUp, newLevel } = await addXP(
    message.guildId!,
    message.author.id,
    config.xpPerMessage
  );

  if (leveledUp && message.member) {
    try {
      const targetChannel = (config.levelUpEnabled && config.levelUpChannelId
        ? message.guild?.channels.cache.get(config.levelUpChannelId)
        : message.channel) as TextChannel | undefined;

      if (targetChannel) {
        const text = config.levelUpMessage
          ? formatMessage(config.levelUpMessage, {
              user: `<@${message.author.id}>`,
              level: newLevel.toString(),
              server: message.guild?.name || '',
              memberCount: message.guild?.memberCount.toString() || '0',
            })
          : `🎉 Selamat <@${message.author.id}>, kamu naik ke **Level ${newLevel}**!`;

        await targetChannel.send(text);
      }
      await checkLevelRoles(message.guildId!, message.author.id, newLevel, message.member);
    } catch (error) {
      console.error('Error in level up notification:', error);
    }
  }
}
