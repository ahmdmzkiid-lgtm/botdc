import path from 'path';
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
dotenv.config({ path: path.resolve(__dirname, '../../../../.env') });

import { auth } from './middleware/auth';
import { guildGuard } from './middleware/guildGuard';
import authRoutes from './routes/auth';
import guildRoutes from './routes/guild';
import welcomeRoutes from './routes/welcome';
import xpRoutes from './routes/xp';
import reactionRoleRoutes from './routes/reactionRoles';
import automodRoutes from './routes/automod';
import commandRoutes from './routes/commands';

const app = express();
const PORT = parseInt(process.env.PORT || '3001', 10);

app.use(cors({ origin: process.env.DASHBOARD_URL || 'http://localhost:5173' }));
app.use(express.json());

app.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString(), uptime: process.uptime() });
});

app.use('/api/auth', authRoutes);

const guildRouter = express.Router();
guildRouter.use(auth, guildGuard);
guildRouter.use(guildRoutes);
guildRouter.use(welcomeRoutes);
guildRouter.use(xpRoutes);
guildRouter.use(reactionRoleRoutes);
guildRouter.use(automodRoutes);
guildRouter.use(commandRoutes);
app.use('/api/guilds', guildRouter);

app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err);
  res.status(500).json({ error: err.message || 'Terjadi kesalahan internal' });
});

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`API server running on port ${PORT}`);
  });
}

export default app;
