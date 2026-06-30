import { MessageReaction, User, PartialMessageReaction, PartialUser } from 'discord.js';
import { handleReactionAdd } from '../features/reactionRoles';

export const name = 'messageReactionAdd';

export async function execute(reaction: MessageReaction | PartialMessageReaction, user: User | PartialUser) {
  try {
    await handleReactionAdd(reaction, user);
  } catch (error) {
    console.error('Error in messageReactionAdd:', error);
  }
}
