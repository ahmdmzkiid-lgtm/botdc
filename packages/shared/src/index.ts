export interface GuildConfig {
  id: string;
  welcomeEnabled: boolean;
  welcomeChannelId: string | null;
  welcomeMessage: string | null;
  goodbyeEnabled: boolean;
  goodbyeChannelId: string | null;
  goodbyeMessage: string | null;
  autoRoleId: string | null;
  xpPerMessage: number;
  xpCooldownSec: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Member {
  id: string;
  guildId: string;
  userId: string;
  xp: number;
  level: number;
  totalMessages: number;
  updatedAt: Date;
}

export interface Command {
  id: number;
  guildId: string;
  name: string;
  description: string;
  response: string;
}

export interface ReactionRole {
  id: number;
  guildId: string;
  messageId: string;
  channelId: string;
  emoji: string;
  roleId: string;
}

export interface ModLog {
  id: number;
  guildId: string;
  userId: string;
  moderatorId: string;
  action: string;
  reason: string | null;
  expiresAt: Date | null;
  createdAt: Date;
}
