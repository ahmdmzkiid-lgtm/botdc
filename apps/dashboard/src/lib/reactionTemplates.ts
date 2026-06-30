export interface ReactionTemplate {
  id: string;
  name: string;
  desc: string;
  emoji: string;
  roleId: string;
  channelId?: string;
}

export const reactionTemplates: ReactionTemplate[] = [
  {
    id: 'red',
    name: '🔴 Warna Merah',
    desc: 'Role warna merah',
    emoji: '🔴',
    roleId: 'Red',
  },
  {
    id: 'blue',
    name: '🔵 Warna Biru',
    desc: 'Role warna biru',
    emoji: '🔵',
    roleId: 'Blue',
  },
  {
    id: 'green',
    name: '🟢 Warna Hijau',
    desc: 'Role warna hijau',
    emoji: '🟢',
    roleId: 'Green',
  },
  {
    id: 'yellow',
    name: '🟡 Warna Kuning',
    desc: 'Role warna kuning',
    emoji: '🟡',
    roleId: 'Yellow',
  },
  {
    id: 'valorant',
    name: '🎮 Valorant',
    desc: 'Role game Valorant',
    emoji: '🔫',
    roleId: 'Valorant',
  },
  {
    id: 'genshin',
    name: '✨ Genshin Impact',
    desc: 'Role game Genshin',
    emoji: '⭐',
    roleId: 'Genshin Impact',
  },
  {
    id: 'mlbb',
    name: '📱 Mobile Legends',
    desc: 'Role game MLBB',
    emoji: '🏰',
    roleId: 'Mobile Legends',
  },
  {
    id: 'pubg',
    name: '🪖 PUBG',
    desc: 'Role game PUBG',
    emoji: '🪖',
    roleId: 'PUBG',
  },
  {
    id: 'announce',
    name: '📢 Pengumuman',
    desc: 'Dapat notifikasi pengumuman',
    emoji: '📢',
    roleId: 'Ping Pengumuman',
  },
  {
    id: 'giveaway',
    name: '🎁 Giveaway',
    desc: 'Dapat notifikasi giveaway',
    emoji: '🎁',
    roleId: 'Ping Giveaway',
  },
  {
    id: 'event',
    name: '🎪 Event',
    desc: 'Dapat notifikasi event',
    emoji: '🎪',
    roleId: 'Ping Event',
  },
  {
    id: 'update',
    name: '🆕 Update Server',
    desc: 'Dapat notifikasi update',
    emoji: '🆕',
    roleId: 'Ping Update',
  },
  {
    id: 'asia',
    name: '🌏 Asia',
    desc: 'Region Asia',
    emoji: '🌏',
    roleId: 'Asia',
  },
  {
    id: 'europe',
    name: '🌍 Europe',
    desc: 'Region Europe',
    emoji: '🌍',
    roleId: 'Europe',
  },
  {
    id: 'america',
    name: '🌎 America',
    desc: 'Region America',
    emoji: '🌎',
    roleId: 'America',
  },
];
