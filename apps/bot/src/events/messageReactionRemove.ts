import { MessageReaction, User, PartialMessageReaction, PartialUser } from 'discord.js';
import { handleReactionRemove } from '../features/reactionRoles';

export const name = 'messageReactionRemove';

export async function execute(reaction: MessageReaction | PartialMessageReaction, user: User | PartialUser) {
  try {
    await handleReactionRemove(reaction, user);
  } catch (error) {
    console.error('Error in messageReactionRemove:', error);
  }
}
