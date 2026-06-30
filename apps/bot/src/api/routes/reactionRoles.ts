import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../../lib/prisma';

const router = Router();

router.get('/:guildId/reaction-roles', async (req: Request, res: Response) => {
  const guildId = req.params.guildId as string;

  const roles = await prisma.reactionRole.findMany({
    where: { guildId },
  });

  res.json(roles);
});

const reactionRoleSchema = z.object({
  messageId: z.string(),
  channelId: z.string(),
  emoji: z.string(),
  roleId: z.string(),
});

router.post('/:guildId/reaction-roles', async (req: Request, res: Response) => {
  const guildId = req.params.guildId as string;
  const body = reactionRoleSchema.parse(req.body);

  const existing = await prisma.reactionRole.findFirst({
    where: {
      guildId,
      messageId: body.messageId,
      emoji: body.emoji,
    },
  });

  if (existing) {
    res.status(400).json({ error: 'Reaction role dengan messageId dan emoji yang sama sudah ada' });
    return;
  }

  const reactionRole = await prisma.reactionRole.create({
    data: { guildId, ...body },
  });

  res.json(reactionRole);
});

router.delete('/:guildId/reaction-roles/:id', async (req: Request, res: Response) => {
  const guildId = req.params.guildId as string;
  const id = parseInt(req.params.id as string, 10);

  const reactionRole = await prisma.reactionRole.findFirst({
    where: { id, guildId },
  });

  if (!reactionRole) {
    res.status(404).json({ error: 'Reaction role tidak ditemukan' });
    return;
  }

  await prisma.reactionRole.delete({ where: { id } });
  res.json({ message: 'Reaction role berhasil dihapus' });
});

export default router;
