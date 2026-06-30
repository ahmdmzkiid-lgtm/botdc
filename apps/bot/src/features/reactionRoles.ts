import { MessageReaction, User, PartialMessageReaction, PartialUser } from 'discord.js';
import { prisma } from '../lib/prisma';

export function parseEmoji(emojiString: string): { name: string; id?: string } {
  const customMatch = emojiString.match(/^<a?:(\w+):(\d+)>$/);
  if (customMatch) {
    return { name: customMatch[1], id: customMatch[2] };
  }
  return { name: emojiString };
}

export async function handleReactionAdd(
  reaction: MessageReaction | PartialMessageReaction,
  user: User | PartialUser
) {
  if (reaction.partial) {
    try {
      await reaction.fetch();
    } catch {
      return;
    }
  }

  if (user.bot) return;
  if (!reaction.message.guildId) return;

  console.log(`[RR] Add: msg=${reaction.message.id}, emoji="${reaction.emoji.name}", userId=${user.id}`);

  const reactionRoles = await prisma.reactionRole.findMany({
    where: {
      guildId: reaction.message.guildId,
      messageId: reaction.message.id,
    },
  });

  console.log(`[RR] DB found ${reactionRoles.length} records for msg=${reaction.message.id}`);

  if (reactionRoles.length === 0) return;

  const matched = reactionRoles.find((rr) =>
    matchEmoji(reaction.emoji.name ?? '', reaction.emoji.id, rr.emoji)
  );
  console.log(`[RR] Emoji match: ${matched ? 'YES role=' + matched.roleId : 'NO'}`);
  if (!matched) return;

  try {
    const guild = reaction.message.guild;
    if (!guild) return;

    const member = await guild.members.fetch(user.id);
    const role = guild.roles.cache.get(matched.roleId);
    if (role && member) {
      await member.roles.add(role);
    }
  } catch (error) {
    console.error('Failed to assign reaction role:', error);
  }
}

export async function handleReactionRemove(
  reaction: MessageReaction | PartialMessageReaction,
  user: User | PartialUser
) {
  if (reaction.partial) {
    try {
      await reaction.fetch();
    } catch {
      return;
    }
  }

  if (user.bot) return;
  if (!reaction.message.guildId) return;

  const reactionRoles = await prisma.reactionRole.findMany({
    where: {
      guildId: reaction.message.guildId,
      messageId: reaction.message.id,
    },
  });

  if (reactionRoles.length === 0) return;

  const matched = reactionRoles.find((rr) =>
    matchEmoji(reaction.emoji.name ?? '', reaction.emoji.id, rr.emoji)
  );
  if (!matched) return;

  try {
    const guild = reaction.message.guild;
    if (!guild) return;

    const member = await guild.members.fetch(user.id);
    const role = guild.roles.cache.get(matched.roleId);
    if (role && member) {
      await member.roles.remove(role);
    }
  } catch (error) {
    console.error('Failed to remove reaction role:', error);
  }
}

function matchEmoji(emojiName: string, emojiId: string | null | undefined, storedEmoji: string): boolean {
  if (emojiId) {
    const parsed = parseEmoji(storedEmoji);
    return parsed.id === emojiId;
  }
  return emojiName === storedEmoji;
}
