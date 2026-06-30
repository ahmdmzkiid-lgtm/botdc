import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder, MessageFlags } from 'discord.js';
import { playerManager } from '../features/music/PlayerManager';

export const musicCommands = [
  new SlashCommandBuilder()
    .setName('play')
    .setDescription('Putar lagu dari YouTube atau Spotify')
    .addStringOption((opt) =>
      opt.setName('query').setDescription('Nama lagu atau link YouTube/Spotify').setRequired(true)
    ),

  new SlashCommandBuilder()
    .setName('skip')
    .setDescription('Lewati lagu yang sedang diputar'),

  new SlashCommandBuilder()
    .setName('stop')
    .setDescription('Hentikan musik dan kosongkan antrian'),

  new SlashCommandBuilder()
    .setName('queue')
    .setDescription('Lihat antrian lagu'),

  new SlashCommandBuilder()
    .setName('pause')
    .setDescription('Jeda musik'),

  new SlashCommandBuilder()
    .setName('resume')
    .setDescription('Lanjutkan musik'),

  new SlashCommandBuilder()
    .setName('nowplaying')
    .setDescription('Lihat lagu yang sedang diputar'),
];

export async function handleMusicCommand(interaction: ChatInputCommandInteraction) {
  const { commandName, guildId } = interaction;

  if (!guildId) {
    await interaction.reply({ content: 'Command hanya bisa digunakan di server', flags: MessageFlags.Ephemeral });
    return;
  }

  switch (commandName) {
    case 'play': {
      const query = interaction.options.getString('query', true);

      const voiceChannel = interaction.guild?.members.cache.get(interaction.user.id)?.voice.channel;
      if (!voiceChannel) {
        await interaction.reply({ content: 'Kamu harus berada di voice channel!', flags: MessageFlags.Ephemeral });
        return;
      }

      await interaction.deferReply();

      try {
        const result = await playerManager.play(guildId, query, voiceChannel, interaction.user.tag);

        if (result.error) {
          await interaction.editReply({ content: result.error });
          return;
        }

        if (result.type === 'playlist') {
          const embed = new EmbedBuilder()
            .setColor(0x5865F2)
            .setTitle('Playlist Ditambahkan')
            .setDescription(`${result.added} lagu dari playlist Spotify ditambahkan ke antrian`)
            .setFooter({ text: `Diminta oleh ${interaction.user.tag}` });
          await interaction.editReply({ embeds: [embed] });
        } else if (result.type === 'queue') {
          const embed = new EmbedBuilder()
            .setColor(0x5865F2)
            .setTitle('Ditambahkan ke Antrian')
            .setDescription(`[${result.song.title}](${result.song.url})`)
            .addFields({ name: 'Posisi', value: `#${result.position}`, inline: true })
            .setFooter({ text: `Diminta oleh ${interaction.user.tag}` });
          if (result.song.thumbnail) embed.setThumbnail(result.song.thumbnail);
          await interaction.editReply({ embeds: [embed] });
        } else {
          const embed = new EmbedBuilder()
            .setColor(0x5865F2)
            .setTitle('Memutar')
            .setDescription(`[${result.song.title}](${result.song.url})`)
            .addFields(
              { name: 'Durasi', value: playerManager.formatDuration(result.song.duration), inline: true }
            )
            .setFooter({ text: `Diminta oleh ${interaction.user.tag}` });
          if (result.song.thumbnail) embed.setThumbnail(result.song.thumbnail);
          await interaction.editReply({ embeds: [embed] });
        }
      } catch (error) {
        console.error('Play error:', error);
        await interaction.editReply({ content: 'Terjadi kesalahan saat memutar lagu' });
      }
      break;
    }

    case 'skip': {
      if (!playerManager.isPlaying(guildId)) {
        await interaction.reply({ content: 'Tidak ada lagu yang diputar', flags: MessageFlags.Ephemeral });
        return;
      }
      playerManager.skip(guildId);
      await interaction.reply({ content: '⏭ Lagu dilewati' });
      break;
    }

    case 'stop': {
      playerManager.stop(guildId);
      await interaction.reply({ content: '⏹ Musik dihentikan dan antrian dikosongkan' });
      break;
    }

    case 'queue': {
      const queueData = playerManager.getQueueList(guildId);
      if (!queueData.current && queueData.upcoming.length === 0) {
        await interaction.reply({ content: 'Antrian kosong', flags: MessageFlags.Ephemeral });
        return;
      }

      const embed = new EmbedBuilder()
        .setColor(0x5865F2)
        .setTitle('Antrian Musik');

      if (queueData.current) {
        embed.setDescription(`**Sedang Diputar:**\n[${queueData.current.title}](${queueData.current.url}) - ${queueData.current.requestedBy}\n\n**Selanjutnya:**`);
      }

      const upcoming = queueData.upcoming.slice(0, 10);
      const fields = upcoming.map((song, i) =>
        `${i + 1}. [${song.title}](${song.url}) - ${song.requestedBy}`
      ).join('\n');

      if (fields) embed.addFields({ name: '\u200B', value: fields });
      if (queueData.upcoming.length > 10) {
        embed.setFooter({ text: `Dan ${queueData.upcoming.length - 10} lagu lainnya` });
      }

      await interaction.reply({ embeds: [embed] });
      break;
    }

    case 'pause': {
      if (!playerManager.isPlaying(guildId)) {
        await interaction.reply({ content: 'Tidak ada lagu yang diputar', flags: MessageFlags.Ephemeral });
        return;
      }
      playerManager.pause(guildId);
      await interaction.reply({ content: '⏸ Musik dijeda' });
      break;
    }

    case 'resume': {
      playerManager.resume(guildId);
      await interaction.reply({ content: '▶ Musik dilanjutkan' });
      break;
    }

    case 'nowplaying': {
      const queueData = playerManager.getQueueList(guildId);
      if (!queueData.current) {
        await interaction.reply({ content: 'Tidak ada lagu yang diputar', flags: MessageFlags.Ephemeral });
        return;
      }

      const embed = new EmbedBuilder()
        .setColor(0x5865F2)
        .setTitle('Sedang Diputar')
        .setDescription(`[${queueData.current.title}](${queueData.current.url})`)
        .addFields(
          { name: 'Durasi', value: playerManager.formatDuration(queueData.current.duration), inline: true },
          { name: 'Diminta oleh', value: queueData.current.requestedBy, inline: true }
        );
      if (queueData.current.thumbnail) embed.setThumbnail(queueData.current.thumbnail);

      await interaction.reply({ embeds: [embed] });
      break;
    }
  }
}
