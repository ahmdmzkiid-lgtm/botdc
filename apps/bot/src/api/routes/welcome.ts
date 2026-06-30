import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../../lib/prisma';

const router = Router();

const welcomeSchema = z.object({
  welcomeEnabled: z.boolean().optional(),
  welcomeChannelId: z.string().optional(),
  welcomeMessage: z.string().optional(),
  goodbyeEnabled: z.boolean().optional(),
  goodbyeChannelId: z.string().optional(),
  goodbyeMessage: z.string().optional(),
});

router.patch('/:guildId/welcome', async (req: Request, res: Response) => {
  const guildId = req.params.guildId as string;
  const body = welcomeSchema.parse(req.body);

  const config = await prisma.guild.upsert({
    where: { id: guildId },
    update: body,
    create: { id: guildId, ...body },
  });

  res.json(config);
});

export default router;
