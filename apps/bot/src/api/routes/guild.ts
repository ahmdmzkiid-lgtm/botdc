import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../../lib/prisma';

const router = Router();

const configSchema = z.object({
  autoRoleId: z.string().optional(),
  xpPerMessage: z.number().min(1).max(100).optional(),
  xpCooldownSec: z.number().min(0).max(300).optional(),
});

router.get('/:guildId/config', async (req: Request, res: Response) => {
  const guildId = req.params.guildId as string;

  let config = await prisma.guild.findUnique({ where: { id: guildId } });
  if (!config) {
    config = await prisma.guild.create({ data: { id: guildId } });
  }

  res.json(config);
});

router.patch('/:guildId/config', async (req: Request, res: Response) => {
  const guildId = req.params.guildId as string;
  const body = configSchema.parse(req.body);

  const config = await prisma.guild.upsert({
    where: { id: guildId },
    update: body,
    create: { id: guildId, ...body },
  });

  res.json(config);
});

router.get('/:guildId/channels', async (req: Request, res: Response) => {
  const guildId = req.params.guildId as string;

  const response = await fetch(`https://discord.com/api/guilds/${guildId}/channels`, {
    headers: { Authorization: `Bot ${process.env.DISCORD_TOKEN}` },
  });

  if (!response.ok) {
    res.status(400).json({ error: 'Gagal fetch channels' });
    return;
  }

  const channels = await response.json() as any[];
  const textChannels = channels
    .filter((c: any) => c.type === 0)
    .map((c: any) => ({ id: c.id, name: c.name }));

  res.json(textChannels);
});

router.get('/:guildId/roles', async (req: Request, res: Response) => {
  const guildId = req.params.guildId as string;

  const response = await fetch(`https://discord.com/api/guilds/${guildId}/roles`, {
    headers: { Authorization: `Bot ${process.env.DISCORD_TOKEN}` },
  });

  if (!response.ok) {
    res.status(400).json({ error: 'Gagal fetch roles' });
    return;
  }

  const roles = await response.json() as any[];
  const filteredRoles = roles
    .filter((r: any) => r.name !== '@everyone' && !r.managed)
    .map((r: any) => ({ id: r.id, name: r.name, color: r.color }));

  res.json(filteredRoles);
});

export default router;
