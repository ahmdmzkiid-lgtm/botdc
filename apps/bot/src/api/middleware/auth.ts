import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface JwtPayload {
  userId: string;
  username: string;
  avatar: string;
  guilds: { id: string; name: string; icon: string | null }[];
}

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

export function auth(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Token tidak ditemukan' });
    return;
  }

  const token = header.slice(7);
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
    req.user = decoded;
    next();
  } catch {
    res.status(401).json({ error: 'Token tidak valid' });
  }
}
