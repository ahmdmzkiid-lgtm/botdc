import { prisma } from './prisma';

class SpamTracker {
  private messages = new Map<string, number[]>();

  async track(guildId: string, userId: string): Promise<boolean> {
    const config = await prisma.autoModConfig.findUnique({ where: { guildId } });
    if (!config) return false;

    const key = `${guildId}-${userId}`;
    const now = Date.now();
    const timestamps = this.messages.get(key) || [];

    const recent = timestamps.filter((t) => now - t < 5000);
    recent.push(now);

    this.messages.set(key, recent);

    return recent.length >= config.spamThreshold;
  }

  reset(guildId: string, userId: string) {
    const key = `${guildId}-${userId}`;
    this.messages.delete(key);
  }
}

export const spamTracker = new SpamTracker();
