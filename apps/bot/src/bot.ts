const dotenv = require('dotenv');
const path = require('path');
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

const ffmpegPath = require('ffmpeg-static');
if (ffmpegPath) {
  process.env.FFMPEG_PATH = ffmpegPath;
  console.log('FFMPEG_PATH set to:', ffmpegPath);
}

const { Client, GatewayIntentBits, Partials } = require('discord.js');
const { loadEvents } = require('./events');

const intents = [
  GatewayIntentBits.Guilds,
  GatewayIntentBits.GuildMembers,
  GatewayIntentBits.GuildMessages,
  GatewayIntentBits.GuildMessageReactions,
  GatewayIntentBits.MessageContent,
];
if (process.env.MUSIC_ENABLED === 'true') intents.push(GatewayIntentBits.GuildVoiceStates);

const client = new Client({
  intents,
  partials: [Partials.Message, Partials.Channel, Partials.Reaction],
});

loadEvents(client);

client.login(process.env.DISCORD_TOKEN);
