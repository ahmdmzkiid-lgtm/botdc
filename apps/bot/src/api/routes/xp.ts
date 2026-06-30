import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../../lib/prisma';

const router = Router();

router.get('/:guildId/leaderboard', async (req: Request, res: Response) => {
  const guildId = req.params.guildId as string;
  const limit = Math.min(parseInt(req.query.limit as string) || 10, 100);

  const members = await prisma.memberXP.findMany({
    where: { guildId },
    orderBy: [{ level: 'desc' }, { xp: 'desc' }],
    take: limit,
  });

  const leaderboard = members.map((m, index) => ({
    rank: index + 1,
    userId: m.userId,
    username: m.userId,
    avatar: null,
    level: m.level,
    xp: m.xp,
    totalMessages: m.totalMessages,
  }));

  res.json(leaderboard);
});

const xpConfigSchema = z.object({
  xpPerMessage: z.number().min(1).max(100),
  xpCooldownSec: z.number().min(0).max(300),
});

router.patch('/:guildId/xp-config', async (req: Request, res: Response) => {
  const guildId = req.params.guildId as string;
  const body = xpConfigSchema.parse(req.body);

  const config = await prisma.guild.upsert({
    where: { id: guildId },
    update: body,
    create: { id: guildId, ...body },
  });

  res.json(config);
});

const levelUpConfigSchema = z.object({
  levelUpEnabled: z.boolean().optional(),
  levelUpChannelId: z.string().optional(),
  levelUpMessage: z.string().optional(),
});

router.patch('/:guildId/levelup-config', async (req: Request, res: Response) => {
  const guildId = req.params.guildId as string;
  const body = levelUpConfigSchema.parse(req.body);

  const config = await prisma.guild.upsert({
    where: { id: guildId },
    update: body,
    create: { id: guildId, ...body },
  });

  res.json(config);
});

router.get('/:guildId/level-roles', async (req: Request, res: Response) => {
  const guildId = req.params.guildId as string;

  const levelRoles = await prisma.levelRole.findMany({
    where: { guildId },
    orderBy: { level: 'asc' },
  });

  res.json(levelRoles);
});

const levelRoleSchema = z.object({
  level: z.number().min(1),
  roleId: z.string(),
});

router.post('/:guildId/level-roles', async (req: Request, res: Response) => {
  const guildId = req.params.guildId as string;
  const body = levelRoleSchema.parse(req.body);

  const levelRole = await prisma.levelRole.create({
    data: { guildId, ...body },
  });

  res.json(levelRole);
});

router.delete('/:guildId/level-roles/:id', async (req: Request, res: Response) => {
  const guildId = req.params.guildId as string;
  const id = parseInt(req.params.id as string, 10);

  const levelRole = await prisma.levelRole.findFirst({
    where: { id, guildId },
  });

  if (!levelRole) {
    res.status(404).json({ error: 'Level role tidak ditemukan' });
    return;
  }

  await prisma.levelRole.delete({ where: { id } });
  res.json({ message: 'Level role berhasil dihapus' });
});

export default router;
