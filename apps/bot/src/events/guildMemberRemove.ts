import { GuildMember } from 'discord.js';
import { handleGuildMemberRemove } from '../features/welcome';

export const name = 'guildMemberRemove';

export async function execute(member: GuildMember) {
  try {
    await handleGuildMemberRemove(member);
  } catch (error) {
    console.error('Error in guildMemberRemove:', error);
  }
}
