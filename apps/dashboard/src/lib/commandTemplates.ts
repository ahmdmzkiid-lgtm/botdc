export interface CommandTemplate {
  id: string;
  name: string;
  desc: string;
  response: string;
  category: string;
}

export const commandTemplates: CommandTemplate[] = [
  {
    id: 'serverinfo',
    name: 'serverinfo',
    desc: 'Info server saat ini',
    category: 'Informasi',
    response: '📊 **Info Server**\nNama: {server}\nOwner: <@owner-id>\nMember: {memberCount}\nLevel: {level}\nXP: {xp}',
  },
  {
    id: 'userinfo',
    name: 'userinfo',
    desc: 'Info user yang memanggil',
    category: 'Informasi',
    response: '👤 **Info User**\nUser: {user}\nLevel: {level}\nXP: {xp}',
  },
  {
    id: 'ping',
    name: 'ping',
    desc: 'Cek respon bot',
    category: 'Informasi',
    response: '🏓 **Pong!** Bot aktif dan merespon dengan cepat ✅',
  },
  {
    id: 'avatar',
    name: 'avatar',
    desc: 'Lihat avatar user',
    category: 'Informasi',
    response: '🖼️ **Avatar User**\n{user}\n[Link Avatar](https://discord.com)',
  },
  {
    id: 'say',
    name: 'say',
    desc: 'Bot mengulang pesan kamu',
    category: 'Fun',
    response: '{pesan}',
  },
  {
    id: 'roll',
    name: 'roll',
    desc: 'Dadu acak 1-100',
    category: 'Fun',
    response: '🎲 **{user}** melempar dadu...\nMendapat angka: **{random}**',
  },
  {
    id: 'flip',
    name: 'flip',
    desc: 'Lempar koin',
    category: 'Fun',
    response: '🪙 **{user}** melempar koin...\nHasil: **{random}**',
  },
  {
    id: 'hug',
    name: 'hug',
    desc: 'Peluk sesama member',
    category: 'Fun',
    response: '🤗 **{user}** memelukmu dengan hangat!',
  },
  {
    id: 'clear',
    name: 'clear',
    desc: 'Hapus pesan (admin only)',
    category: 'Moderasi',
    response: '✅ Berhasil menghapus {jumlah} pesan di channel ini.',
  },
  {
    id: 'warn',
    name: 'warn',
    desc: 'Peringatkan member',
    category: 'Moderasi',
    response: '⚠️ **{user}** kamu telah diperingatkan oleh moderator.\nAlasan: {alasan}\nJangan ulangi ya!',
  },
  {
    id: 'rules',
    name: 'rules',
    desc: 'Tampilkan peraturan server',
    category: 'Informasi',
    response: '📜 **Peraturan Server**\n\n1. Hormati sesama member\n2. No spam\n3. No promosi\n4. Patuhi staff\n5. Gunakan channel sesuai fungsi',
  },
  {
    id: 'vote',
    name: 'vote',
    desc: 'Buat polling sederhana',
    category: 'Fun',
    response: '📊 **Polling**\n{pertanyaan}\n\n👍 Setuju\n👎 Tidak Setuju',
  },
  {
    id: 'instagram',
    name: 'instagram',
    desc: 'Link Instagram',
    category: 'Sosial',
    response: '📸 **Instagram**\nIkuti Instagram kami:\nhttps://instagram.com/username',
  },
  {
    id: 'youtube',
    name: 'youtube',
    desc: 'Link YouTube',
    category: 'Sosial',
    response: '▶️ **YouTube**\nSubscribe channel kami:\nhttps://youtube.com/@channel',
  },
  {
    id: 'discord',
    name: 'discord',
    desc: 'Invite link discord',
    category: 'Sosial',
    response: '💬 **Discord**\nBagikan invite link ini:\nhttps://discord.gg/invite',
  },
];
