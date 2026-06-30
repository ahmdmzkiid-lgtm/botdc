import { spawn, ChildProcess } from 'child_process';
import {
  joinVoiceChannel,
  createAudioPlayer,
  createAudioResource,
  AudioPlayerStatus,
  VoiceConnectionStatus,
  entersState,
  StreamType,
} from '@discordjs/voice';
import * as play from 'play-dl';

const YTDLP_PATH = process.env.YTDLP_PATH || '';

interface Song {
  title: string;
  url: string;
  duration: number;
  thumbnail: string | null;
  requestedBy: string;
}

interface GuildQueue {
  songs: Song[];
  currentSong: Song | null;
  connection: any;
  player: any;
  streamProcess: ChildProcess | null;
}

function getYtdlPath(): string {
  if (YTDLP_PATH) return YTDLP_PATH;
  const fs = require('fs');
  const path = require('path');
  const candidates = [
    path.resolve(__dirname, '../../../../../node_modules/.pnpm'),
    path.resolve(__dirname, '../../../../node_modules/.pnpm'),
    path.resolve(process.cwd(), '../../node_modules/.pnpm'),
  ];
  for (const pnpmDir of candidates) {
    try {
      const entries = fs.readdirSync(pnpmDir);
      const dir = entries.find((d: string) => d.startsWith('ytdlp-nodejs@'));
      if (dir) return path.join(pnpmDir, dir, 'node_modules/ytdlp-nodejs/bin/yt-dlp.exe');
    } catch {}
  }
  throw new Error('yt-dlp binary not found');
}

function spawnYtdlp(url: string): ChildProcess {
  const ytdlpPath = getYtdlPath();
  console.log(`Spawning yt-dlp: ${ytdlpPath}`);
  return spawn(ytdlpPath, [
    url,
    '-f', '251/bestaudio[ext=m4a]',
    '-o', '-',
    '--no-playlist',
    '--quiet',
  ], { stdio: ['ignore', 'pipe', 'pipe'] });
}

class PlayerManager {
  private queues: Map<string, GuildQueue>;

  constructor() {
    this.queues = new Map();
  }

  getQueue(guildId: string): GuildQueue {
    if (!this.queues.has(guildId)) {
      this.queues.set(guildId, {
        songs: [],
        currentSong: null,
        connection: null,
        player: createAudioPlayer(),
        streamProcess: null,
      });
    }
    return this.queues.get(guildId)!;
  }

  private async playSong(guildId: string) {
    const queue = this.getQueue(guildId);
    if (queue.songs.length === 0 && !queue.currentSong) return;

    if (!queue.currentSong && queue.songs.length > 0) {
      queue.currentSong = queue.songs.shift()!;
    }
    if (!queue.currentSong) return;

    try {
      console.log(`Starting stream for: ${queue.currentSong.title}`);
      const proc = spawnYtdlp(queue.currentSong.url);
      queue.streamProcess = proc;

      proc.stderr.on('data', (d: Buffer) => {
        const msg = d.toString();
        if (msg.includes('ERROR')) console.error('yt-dlp error:', msg);
      });

      const resource = createAudioResource(proc.stdout, {
        inputType: StreamType.WebmOpus,
      });

      queue.player.removeAllListeners();
      queue.player.on(AudioPlayerStatus.Idle, () => {
        console.log(`Song finished: ${queue.currentSong?.title}`);
        queue.currentSong = null;
        queue.streamProcess = null;
        this.playSong(guildId);
      });
      queue.player.on(AudioPlayerStatus.Playing, () => {
        console.log(`Now playing: ${queue.currentSong?.title}`);
      });
      queue.player.on('error', (error: Error) => {
        console.error('Player error:', error);
        if (queue.streamProcess) {
          queue.streamProcess.kill();
          queue.streamProcess = null;
        }
        queue.currentSong = null;
        this.playSong(guildId);
      });

      queue.connection.subscribe(queue.player);
      queue.player.play(resource);
    } catch (error) {
      console.error('Failed to play song:', error);
      if (queue.streamProcess) {
        queue.streamProcess.kill();
        queue.streamProcess = null;
      }
      queue.currentSong = null;
      this.playSong(guildId);
    }
  }

  async play(guildId: string, query: string, voiceChannel: any, requesterTag: string) {
    const queue = this.getQueue(guildId);
    let song: Song | null = null;

    if (query.match(/^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be|open\.spotify\.com)/)) {
      if (query.includes('spotify.com')) {
        try {
          const spotifyData = await play.spotify(query) as any;
          if (spotifyData.type === 'track') {
            const searchQuery = `${spotifyData.name} ${spotifyData.artists ? spotifyData.artists[0]?.name : ''}`;
            const searchResults = await play.search(searchQuery, { limit: 1 });
            if (searchResults.length === 0) {
              return { error: 'Tidak dapat menemukan lagu dari link Spotify' };
            }
            song = {
              title: spotifyData.name,
              url: searchResults[0].url,
              duration: spotifyData.durationInSec || 0,
              thumbnail: searchResults[0].thumbnails?.[0]?.url || null,
              requestedBy: requesterTag,
            };
          } else if (spotifyData.type === 'playlist') {
            const tracks = spotifyData.tracks || [];
            for (const track of tracks.slice(0, 20)) {
              const searchQuery = `${track.name} ${track.artists ? track.artists[0]?.name : ''}`;
              const results = await play.search(searchQuery, { limit: 1 });
              if (results.length > 0) {
                queue.songs.push({
                  title: track.name,
                  url: results[0].url,
                  duration: track.durationInSec || 0,
                  thumbnail: results[0].thumbnails?.[0]?.url || null,
                  requestedBy: requesterTag,
                });
              }
            }
            return { success: true, added: tracks.length, type: 'playlist' };
          }
        } catch (e) {
          return { error: 'Gagal memproses link Spotify' };
        }
      } else {
        try {
          const ytInfo = await play.video_info(query);
          song = {
            title: ytInfo.video_details.title,
            url: ytInfo.video_details.url,
            duration: ytInfo.video_details.durationInSec,
            thumbnail: ytInfo.video_details.thumbnails?.[0]?.url || null,
            requestedBy: requesterTag,
          };
        } catch (e) {
          return { error: 'Gagal memproses link YouTube' };
        }
      }
    } else {
      const results = await play.search(query, { limit: 1 });
      if (results.length === 0) {
        return { error: 'Tidak menemukan lagu untuk: ' + query };
      }
      song = {
        title: results[0].title!,
        url: results[0].url!,
        duration: results[0].duration!,
        thumbnail: results[0].thumbnails?.[0]?.url || null,
        requestedBy: requesterTag,
      };
    }

    if (!song) return { error: 'Tidak dapat memproses lagu' };

    if (queue.currentSong || queue.songs.length > 0) {
      queue.songs.push(song);
      return { success: true, song, position: queue.songs.length, type: 'queue' };
    }

    queue.currentSong = song;

    queue.connection = joinVoiceChannel({
      channelId: voiceChannel.id,
      guildId,
      adapterCreator: voiceChannel.guild.voiceAdapterCreator,
    });

    queue.connection.on(VoiceConnectionStatus.Disconnected, async () => {
      try {
        await Promise.race([
          entersState(queue.connection, VoiceConnectionStatus.Signalling, 5000),
          entersState(queue.connection, VoiceConnectionStatus.Connecting, 5000),
        ]);
      } catch {
        if (queue.streamProcess) {
          queue.streamProcess.kill();
          queue.streamProcess = null;
        }
        queue.connection.destroy();
        this.queues.delete(guildId);
      }
    });

    queue.connection.on('error', (error: Error) => {
      console.error('Voice connection error:', error);
    });

    try {
      await entersState(queue.connection, VoiceConnectionStatus.Ready, 20000);
      this.playSong(guildId);
    } catch {
      queue.connection.destroy();
      this.queues.delete(guildId);
      return { error: 'Gagal terhubung ke voice channel (timeout 20 detik)' };
    }

    return { success: true, song, type: 'now' };
  }

  skip(guildId: string): boolean {
    const queue = this.queues.get(guildId);
    if (queue?.streamProcess) {
      queue.streamProcess.kill();
      queue.streamProcess = null;
    }
    if (queue?.player) {
      queue.player.stop();
      return true;
    }
    return false;
  }

  stop(guildId: string) {
    const queue = this.queues.get(guildId);
    if (queue) {
      if (queue.streamProcess) {
        queue.streamProcess.kill();
        queue.streamProcess = null;
      }
      queue.songs = [];
      queue.currentSong = null;
      queue.player.stop();
      if (queue.connection) {
        queue.connection.destroy();
      }
      this.queues.delete(guildId);
    }
  }

  pause(guildId: string) {
    const queue = this.queues.get(guildId);
    queue?.player?.pause();
  }

  resume(guildId: string) {
    const queue = this.queues.get(guildId);
    queue?.player?.unpause();
  }

  getQueueList(guildId: string) {
    const queue = this.queues.get(guildId);
    return {
      current: queue?.currentSong || null,
      upcoming: queue?.songs || [],
    };
  }

  isPlaying(guildId: string): boolean {
    const queue = this.queues.get(guildId);
    return !!(queue && (queue.currentSong || queue.songs.length > 0));
  }

  formatDuration(seconds: number): string {
    if (!seconds || isNaN(seconds)) return 'Live';
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    if (h > 0) return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    return `${m}:${s.toString().padStart(2, '0')}`;
  }
}

export const playerManager = new PlayerManager();
