import { Message, Guild, PermissionFlagsBits } from 'discord.js';
import { prisma } from '../lib/prisma';
import { spamTracker } from '../lib/spamTracker';

const INVITE_PATTERNS = [
  /discord\.gg\//,
  /discord\.com\/invite\//,
  /discordapp\.com\/invite\//,
];

export async function checkMessage(message: Message) {
  if (message.author.bot) return;
  if (!message.guildId || !message.guild) return;

  const config = await prisma.autoModConfig.findUnique({
    where: { guildId: message.guildId },
  });

  if (!config) return;

  let violated = false;

  if (config.antiInvite) {
    const hasInvite = INVITE_PATTERNS.some((pattern) => pattern.test(message.content));
    if (hasInvite) {
      await message.delete();
      await warnUser(message, 'Mengirim link invite Discord');
      violated = true;
    }
  }

  if (!violated && config.bannedWords.length > 0) {
    const lowerContent = message.content.toLowerCase();
    const hasBannedWord = config.bannedWords.some((word) =>
      lowerContent.includes(word.toLowerCase())
    );
    if (hasBannedWord) {
      await message.delete();
      await warnUser(message, 'Mengirim kata terlarang');
      violated = true;
    }
  }

  if (!violated && config.antiSpam) {
    const isSpam = await spamTracker.track(message.guildId, message.author.id);
    if (isSpam) {
      await message.delete();
      await warnUser(message, 'Spam');
    }
  }
}

async function warnUser(message: Message, reason: string) {
  await prisma.modLog.create({
    data: {
      guildId: message.guildId!,
      userId: message.author.id,
      moderatorId: message.client.user?.id || '',
      action: 'WARN',
      reason,
    },
  });

  const warnCount = await prisma.modLog.count({
    where: {
      guildId: message.guildId!,
      userId: message.author.id,
      action: 'WARN',
    },
  });

  const config = await prisma.autoModConfig.findUnique({
    where: { guildId: message.guildId! },
  });

  if (config && warnCount >= config.warnThreshold) {
    await muteMember(message.guild!, message.author.id, config.muteDurationMin);
  }
}

async function muteMember(guild: Guild, userId: string, durationMin: number) {
  try {
    let muteRole = guild.roles.cache.find((r) => r.name === 'Muted');

    if (!muteRole) {
      muteRole = await guild.roles.create({
        name: 'Muted',
        permissions: [],
        reason: 'Auto-mod: Muted role for muted members',
      });

      guild.channels.cache.forEach(async (channel) => {
        if (channel.isTextBased() && 'permissionOverwrites' in channel) {
          await channel.permissionOverwrites.create(muteRole!, {
            SendMessages: false,
            AddReactions: false,
            Speak: false,
          });
        }
      });
    }

    const member = await guild.members.fetch(userId);
    await member.roles.add(muteRole);

    await prisma.modLog.create({
      data: {
        guildId: guild.id,
        userId,
        moderatorId: guild.client.user?.id || '',
        action: 'MUTE',
        reason: 'Auto-mute: melewati batas warn',
        expiresAt: new Date(Date.now() + durationMin * 60 * 1000),
      },
    });

    setTimeout(async () => {
      try {
        await member.roles.remove(muteRole!);
        await prisma.modLog.create({
          data: {
            guildId: guild.id,
            userId,
            moderatorId: guild.client.user?.id || '',
            action: 'UNMUTE',
            reason: 'Auto-unmute: durasi selesai',
          },
        });
      } catch (error) {
        console.error('Failed to auto-unmute:', error);
      }
    }, durationMin * 60 * 1000);
  } catch (error) {
    console.error('Failed to mute member:', error);
  }
}
