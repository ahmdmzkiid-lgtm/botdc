import { readdirSync } from 'fs';
import { join } from 'path';
import { Client } from 'discord.js';

export interface EventModule {
  name: string;
  once?: boolean;
  execute: (...args: any[]) => void;
}

export function loadEvents(client: Client) {
  const eventsPath = __dirname;
  const eventFiles = readdirSync(eventsPath).filter(
    (file) => file.endsWith('.ts') && file !== 'index.ts'
  );

  for (const file of eventFiles) {
    const eventModule: EventModule = require(join(eventsPath, file));
    if (eventModule.once) {
      client.once(eventModule.name, eventModule.execute);
    } else {
      client.on(eventModule.name, eventModule.execute);
    }
    console.log(`Loaded event: ${eventModule.name}`);
  }
}
