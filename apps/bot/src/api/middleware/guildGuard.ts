import { Request, Response, NextFunction } from 'express';

export function guildGuard(req: Request, res: Response, next: NextFunction) {
  const guildId = req.params.guildId || req.path.split('/')[1];

  if (!guildId) {
    res.status(400).json({ error: 'Guild ID diperlukan' });
    return;
  }

  const guild = req.user?.guilds.find((g) => g.id === guildId);
  if (!guild) {
    res.status(403).json({ error: 'Akses ditolak' });
    return;
  }

  (req as any).guild = guild;
  next();
}
