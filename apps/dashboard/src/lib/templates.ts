export interface WelcomeTemplate {
  id: string;
  name: string;
  desc: string;
  embedMode: boolean;
  welcomeMessage: string;
  embedTitle?: string;
  embedContent?: string;
  embedColor?: string;
  authorName?: string;
  footerText?: string;
  showThumbnail?: boolean;
}

export interface GoodbyeTemplate {
  id: string;
  name: string;
  desc: string;
  goodbyeMessage: string;
}

export const welcomeTemplates: WelcomeTemplate[] = [
  {
    id: 'simple',
    name: 'Sambutan Sederhana',
    desc: 'Pesan teks simple dengan mention',
    embedMode: false,
    welcomeMessage: 'Selamat datang {user} di {server}! Jangan lupa baca peraturan ya 😊',
  },
  {
    id: 'friendly',
    name: 'Ramah',
    desc: 'Sambutan hangat dengan emoji',
    embedMode: false,
    welcomeMessage: 'Halo {user}! Selamat bergabung di {server} 🎉\nKami senang kamu ada di sini!\nJangan sungkan untuk menyapa member lain.',
  },
  {
    id: 'rules',
    name: '+ Peraturan',
    desc: 'Sambutan + pengingat peraturan',
    embedMode: false,
    welcomeMessage: 'Selamat datang {user}!\n\nSebelum memulai, harap baca 📜 peraturan di <#rules-channel>.\nNikmati waktumu di {server}!',
  },
  {
    id: 'embed-simple',
    name: 'Embed Sederhana',
    desc: 'Embed clean dengan warna',
    embedMode: true,
    welcomeMessage: 'Selamat datang di **{server}**, {user}! 🎉\nKami sekarang memiliki **{memberCount}** anggota!\nJangan lupa memperkenalkan diri di <#intro-channel>.',
    embedTitle: '🎉 Member Baru!',
    embedColor: 'indigo',
    authorName: '{server}',
    footerText: 'Member #{memberCount}',
    showThumbnail: true,
  },
  {
    id: 'embed-elegant',
    name: 'Embed Elegan',
    desc: 'Tampilan profesional dengan gradient',
    embedMode: true,
    welcomeMessage: 'Hai {user}, selamat bergabung di **{server}**! ✨\n\nKami adalah komunitas yang ramah dan aktif. \nJangan ragu untuk bertanya atau berkenalan dengan member lain.\n\n📌 Baca peraturan di <#rules-channel>\n📢 Lihat pengumuman di <#announcements>',
    embedTitle: 'Selamat Datang!',
    embedColor: 'purple',
    authorName: '{server}',
    footerText: 'Bergabung',
    showThumbnail: true,
  },
  {
    id: 'embed-minimal',
    name: 'Embed Minimal',
    desc: 'Embed simpel tanpa title',
    embedMode: true,
    welcomeMessage: '{user} bergabung ke **{server}** 🎉\nSapa mereka dengan hangat!',
    embedColor: 'green',
    authorName: '',
    footerText: '',
    showThumbnail: true,
  },
  {
    id: 'embed-announce',
    name: 'Pengumuman',
    desc: 'Embed formal untuk server besar',
    embedMode: true,
    welcomeMessage: 'Kami dengan senang hati menyambut **{user}** sebagai anggota baru **{server}**! 🎊\n\nKamu adalah anggota ke-**{memberCount}**.\n\nSilakan:\n• Perkenalkan diri di <#intro-channel>\n• Baca peraturan di <#rules-channel>\n• Dapatkan role di <#roles-channel>',
    embedTitle: '🌟 Anggota Baru',
    embedColor: 'blue',
    authorName: '{server}',
    footerText: 'Selamat bergabung!',
    showThumbnail: true,
  },
  {
    id: 'embed-fun',
    name: 'Fun & Colorful',
    desc: 'Embed ceria dengan warna pink',
    embedMode: true,
    welcomeMessage: 'Yay! {user} akhirnya datang! 🥳\n\nKita punya anggota baru nih!\nSapa mereka dengan hangat ya 🔥\n\n**{server}** sekarang punya **{memberCount}** anggota!',
    embedTitle: '🎊 Ada Member Baru!',
    embedColor: 'pink',
    authorName: '{server}',
    footerText: 'Member ke-{memberCount}',
    showThumbnail: true,
  },
];

export const goodbyeTemplates: GoodbyeTemplate[] = [
  {
    id: 'simple',
    name: 'Perpisahan Sederhana',
    desc: 'Pesan teks simple',
    goodbyeMessage: '{user} telah meninggalkan server. Sampai jumpa! 👋',
  },
  {
    id: 'sad',
    name: 'Sedih',
    desc: 'Ucapan perpisahan yang emosional',
    goodbyeMessage: 'Sayang sekali {user} memilih untuk pergi 😢\nKami akan merindukanmu! Semoga sukses di mana pun kamu berada. 👋',
  },
  {
    id: 'neutral',
    name: 'Netral',
    desc: 'Pesan singkat tanpa emosi berlebih',
    goodbyeMessage: '{user} meninggalkan {server}. Total anggota sekarang: {memberCount}',
  },
];
