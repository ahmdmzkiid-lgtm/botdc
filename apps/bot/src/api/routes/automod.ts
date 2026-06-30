import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../../lib/prisma';

const router = Router();

router.get('/:guildId/automod', async (req: Request, res: Response) => {
  const guildId = req.params.guildId as string;

  let config = await prisma.autoModConfig.findUnique({ where: { guildId } });

  if (!config) {
    config = {
      id: 0,
      guildId,
      antiInvite: false,
      antiSpam: false,
      spamThreshold: 5,
      bannedWords: [],
      warnThreshold: 3,
      muteDurationMin: 60,
    };
  }

  res.json(config);
});

const updateAutoModSchema = z.object({
  antiInvite: z.boolean().optional(),
  antiSpam: z.boolean().optional(),
  spamThreshold: z.number().min(3).max(20).optional(),
  bannedWords: z.array(z.string()).max(100).optional(),
  warnThreshold: z.number().min(1).max(10).optional(),
  muteDurationMin: z.number().min(1).max(10080).optional(),
});

router.patch('/:guildId/automod', async (req: Request, res: Response) => {
  const guildId = req.params.guildId as string;
  const body = updateAutoModSchema.parse(req.body);

  const config = await prisma.autoModConfig.upsert({
    where: { guildId },
    update: body,
    create: { guildId, ...body },
  });

  res.json(config);
});

router.get('/:guildId/mod-logs', async (req: Request, res: Response) => {
  const guildId = req.params.guildId as string;
  const userId = req.query.userId as string | undefined;
  const action = req.query.action as string | undefined;
  const page = Math.max(parseInt(req.query.page as string) || 1, 1);
  const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);
  const skip = (page - 1) * limit;

  const where: any = { guildId };
  if (userId) where.userId = userId;
  if (action) where.action = action;

  const [data, total] = await Promise.all([
    prisma.modLog.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.modLog.count({ where }),
  ]);

  res.json({
    data,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  });
});

const warnSchema = z.object({
  userId: z.string(),
  reason: z.string().optional(),
});

router.post('/:guildId/mod-logs/warn', async (req: Request, res: Response) => {
  const guildId = req.params.guildId as string;
  const body = warnSchema.parse(req.body);

  const log = await prisma.modLog.create({
    data: {
      guildId,
      userId: body.userId,
      moderatorId: req.user!.userId,
      action: 'WARN',
      reason: body.reason || null,
    },
  });

  res.json(log);
});

router.delete('/:guildId/mod-logs/:id/pardon', async (req: Request, res: Response) => {
  const guildId = req.params.guildId as string;
  const id = parseInt(req.params.id as string, 10);

  const log = await prisma.modLog.findFirst({
    where: { id, guildId },
  });

  if (!log) {
    res.status(404).json({ error: 'Log tidak ditemukan' });
    return;
  }

  await prisma.modLog.update({
    where: { id },
    data: { action: 'PARDONED' },
  });

  res.json({ message: 'Warn berhasil dihapus' });
});

export default router;
