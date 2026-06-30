import { GuildMember } from 'discord.js';
import { prisma } from '../lib/prisma';

const cooldowns = new Map<string, number>();

export function calculateXpForLevel(level: number): number {
  return Math.floor(100 * Math.pow(level, 1.5));
}

export async function addXP(
  guildId: string,
  userId: string,
  xpAmount: number
): Promise<{ leveledUp: boolean; newLevel: number }> {
  const config = await prisma.guild.findUnique({ where: { id: guildId } });
  if (!config) return { leveledUp: false, newLevel: 0 };

  const cooldownKey = `${guildId}-${userId}`;
  const lastTimestamp = cooldowns.get(cooldownKey);
  const now = Date.now();

  if (lastTimestamp && now - lastTimestamp < config.xpCooldownSec * 1000) {
    return { leveledUp: false, newLevel: 0 };
  }

  cooldowns.set(cooldownKey, now);

  const memberXP = await prisma.memberXP.upsert({
    where: { guildId_userId: { guildId, userId } },
    update: {
      xp: { increment: xpAmount },
      totalMessages: { increment: 1 },
    },
    create: {
      guildId,
      userId,
      xp: xpAmount,
      totalMessages: 1,
    },
  });

  const xpNeeded = calculateXpForLevel(memberXP.level + 1);

  if (memberXP.xp >= xpNeeded) {
    const updated = await prisma.memberXP.update({
      where: { guildId_userId: { guildId, userId } },
      data: {
        level: { increment: 1 },
        xp: 0,
      },
    });
    return { leveledUp: true, newLevel: updated.level };
  }

  return { leveledUp: false, newLevel: memberXP.level };
}

export async function checkLevelRoles(
  guildId: string,
  userId: string,
  newLevel: number,
  guildMember: GuildMember
) {
  const levelRoles = await prisma.levelRole.findMany({
    where: {
      guildId,
      level: { lte: newLevel },
    },
  });

  for (const lr of levelRoles) {
    if (!guildMember.roles.cache.has(lr.roleId)) {
      try {
        const role = guildMember.guild.roles.cache.get(lr.roleId);
        if (role) {
          await guildMember.roles.add(role);
        }
      } catch (error) {
        console.error(`Failed to assign level role ${lr.roleId}:`, error);
      }
    }
  }
}

export async function getLeaderboard(guildId: string, limit = 10) {
  return prisma.memberXP.findMany({
    where: { guildId },
    orderBy: [{ level: 'desc' }, { xp: 'desc' }],
    take: limit,
  });
}
