import { GuildMember, TextChannel, EmbedBuilder } from 'discord.js';
import { prisma } from '../lib/prisma';
import { formatMessage } from '../lib/formatter';

export async function handleGuildMemberAdd(member: GuildMember) {
  const config = await prisma.guild.findUnique({
    where: { id: member.guild.id },
  });

  if (!config) return;

  if (config.welcomeEnabled && config.welcomeChannelId) {
    const channel = member.guild.channels.cache.get(config.welcomeChannelId) as TextChannel | undefined;
    if (channel) {
      const description = formatMessage(config.welcomeMessage || 'Selamat datang {user}!', {
        user: `<@${member.user.id}>`,
        memberCount: member.guild.memberCount.toString(),
      });

      const embed = new EmbedBuilder()
        .setThumbnail(member.user.displayAvatarURL())
        .setTitle('Selamat Datang!')
        .setDescription(description)
        .setColor(0x57F287)
        .setFooter({ text: member.guild.name, iconURL: member.guild.iconURL() ?? undefined })
        .setTimestamp();

      await channel.send({ embeds: [embed] });
    }
  }

  if (config.autoRoleId) {
    try {
      const role = member.guild.roles.cache.get(config.autoRoleId);
      if (role) {
        await member.roles.add(role);
      }
    } catch (error) {
      console.error(`Failed to assign auto-role for ${member.user.tag}:`, error);
    }
  }
}

export async function handleGuildMemberRemove(member: GuildMember) {
  const config = await prisma.guild.findUnique({
    where: { id: member.guild.id },
  });

  if (!config) return;

  if (config.goodbyeEnabled && config.goodbyeChannelId) {
    const channel = member.guild.channels.cache.get(config.goodbyeChannelId) as TextChannel | undefined;
    if (channel) {
      const description = formatMessage(config.goodbyeMessage || '{user} telah meninggalkan server.', {
        user: member.user.username,
        memberCount: member.guild.memberCount.toString(),
      });

      const embed = new EmbedBuilder()
        .setDescription(description)
        .setColor(0xED4245)
        .setFooter({ text: `Jumlah member: ${member.guild.memberCount}` })
        .setTimestamp();

      await channel.send({ embeds: [embed] });
    }
  }
}
