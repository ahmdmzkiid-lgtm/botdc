import { Router, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { auth } from '../middleware/auth';

const router = Router();

router.get('/discord/url', (_req: Request, res: Response) => {
  const clientId = process.env.DISCORD_CLIENT_ID!;
  const redirectUri = `${process.env.BOT_API_URL}/api/auth/discord/callback`;

  const url = `https://discord.com/oauth2/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=identify%20guilds`;

  res.json({ url });
});

router.get('/discord/callback', async (req: Request, res: Response) => {
  try {
    const { code } = req.query;
    if (!code || typeof code !== 'string') {
      res.status(400).json({ error: 'Kode tidak ditemukan' });
      return;
    }

    const tokenResponse = await fetch('https://discord.com/api/oauth2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: process.env.DISCORD_CLIENT_ID!,
        client_secret: process.env.DISCORD_CLIENT_SECRET!,
        grant_type: 'authorization_code',
        code,
        redirect_uri: `${process.env.BOT_API_URL}/api/auth/discord/callback`,
      }),
    });

    if (!tokenResponse.ok) {
      res.status(400).json({ error: 'Gagal menukar kode OAuth2' });
      return;
    }

    const tokenData: any = await tokenResponse.json();
    const accessToken = tokenData.access_token;

    const userResponse = await fetch('https://discord.com/api/users/@me', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!userResponse.ok) {
      res.status(400).json({ error: 'Gagal fetch user Discord' });
      return;
    }

    const userData: any = await userResponse.json();

    const guildsResponse = await fetch('https://discord.com/api/users/@me/guilds', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!guildsResponse.ok) {
      res.status(400).json({ error: 'Gagal fetch guilds' });
      return;
    }

    const guildsData = await guildsResponse.json() as any[];

    const adminGuilds = guildsData
      .filter((g: any) => (BigInt(g.permissions) & 0x8n) === 0x8n)
      .map((g: any) => ({
        id: g.id,
        name: g.name,
        icon: g.icon,
      }));

    const jwtPayload = {
      userId: userData.id,
      username: userData.username,
      avatar: userData.avatar,
      guilds: adminGuilds,
    };

    const token = jwt.sign(jwtPayload, process.env.JWT_SECRET!, { expiresIn: '7d' });

    res.redirect(`${process.env.DASHBOARD_URL}/auth/callback?token=${token}`);
  } catch (error) {
    console.error('OAuth2 callback error:', error);
    res.status(500).json({ error: 'Terjadi kesalahan saat OAuth2 callback' });
  }
});

router.get('/me', auth, (req: Request, res: Response) => {
  res.json(req.user);
});

export default router;
