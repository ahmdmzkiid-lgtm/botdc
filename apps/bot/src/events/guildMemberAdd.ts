import { GuildMember } from 'discord.js';
import { handleGuildMemberAdd } from '../features/welcome';

export const name = 'guildMemberAdd';

export async function execute(member: GuildMember) {
  try {
    await handleGuildMemberAdd(member);
  } catch (error) {
    console.error('Error in guildMemberAdd:', error);
  }
}
