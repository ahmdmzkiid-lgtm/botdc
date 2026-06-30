import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../../lib/prisma';
import { syncGuildCommands } from '../../lib/commandSync';

const router = Router();

router.get('/:guildId/commands', async (req: Request, res: Response) => {
  const guildId = req.params.guildId as string;

  const commands = await prisma.customCommand.findMany({
    where: { guildId },
    orderBy: { id: 'asc' },
  });

  res.json(commands);
});

const createCommandSchema = z.object({
  name: z.string().regex(/^[a-z0-9-]{1,32}$/),
  description: z.string().max(100),
  response: z.string().max(2000),
});

router.post('/:guildId/commands', async (req: Request, res: Response) => {
  const guildId = req.params.guildId as string;
  const body = createCommandSchema.parse(req.body);

  const existing = await prisma.customCommand.findUnique({
    where: { guildId_name: { guildId, name: body.name } },
  });

  if (existing) {
    res.status(400).json({ error: 'Command dengan nama yang sama sudah ada' });
    return;
  }

  const command = await prisma.customCommand.create({
    data: { guildId, ...body },
  });

  await syncGuildCommands(guildId);

  res.json(command);
});

const updateCommandSchema = z.object({
  name: z.string().regex(/^[a-z0-9-]{1,32}$/).optional(),
  description: z.string().max(100).optional(),
  response: z.string().max(2000).optional(),
});

router.patch('/:guildId/commands/:id', async (req: Request, res: Response) => {
  const guildId = req.params.guildId as string;
  const id = parseInt(req.params.id as string, 10);
  const body = updateCommandSchema.parse(req.body);

  const command = await prisma.customCommand.findFirst({
    where: { id, guildId },
  });

  if (!command) {
    res.status(404).json({ error: 'Command tidak ditemukan' });
    return;
  }

  const updated = await prisma.customCommand.update({
    where: { id },
    data: body,
  });

  await syncGuildCommands(guildId);

  res.json(updated);
});

router.delete('/:guildId/commands/:id', async (req: Request, res: Response) => {
  const guildId = req.params.guildId as string;
  const id = parseInt(req.params.id as string, 10);

  const command = await prisma.customCommand.findFirst({
    where: { id, guildId },
  });

  if (!command) {
    res.status(404).json({ error: 'Command tidak ditemukan' });
    return;
  }

  await prisma.customCommand.delete({ where: { id } });
  await syncGuildCommands(guildId);

  res.json({ message: 'Command berhasil dihapus' });
});

export default router;
