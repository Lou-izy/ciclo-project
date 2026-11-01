import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { ENV } from '../config/env.js';
import { db } from '../database/db.js';
import { User } from '../models/types.js';

export interface AuthenticatedRequest extends Request {
  user?: User;
}

export async function authMiddleware(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  const authHeader = req.headers.authorization;
  const tokenMatch = authHeader?.match(/^Bearer\s+(.+)$/i);
  if (!tokenMatch) {
    res.status(401).json({
      success: false,
      error: 'Token Bearer de autenticação não fornecido',
      code: 'UNAUTHORIZED',
    });
    return;
  }

  let userId: string;
  let googleId: string;
  try {
    const decoded = jwt.verify(tokenMatch[1], ENV.JWT_SECRET);
    if (
      typeof decoded !== 'object' ||
      typeof decoded.userId !== 'string' ||
      typeof decoded.googleId !== 'string'
    ) throw new Error('Invalid JWT payload');
    userId = decoded.userId;
    googleId = decoded.googleId;
  } catch {
    res.status(401).json({
      success: false,
      error: 'Token inválido ou expirado',
      code: 'INVALID_TOKEN',
    });
    return;
  }

  try {
    const user = await db.getUserById(userId);
    if (!user || user.googleId !== googleId) {
      res.status(401).json({ success: false, error: 'Usuário não encontrado para este token', code: 'USER_NOT_FOUND' });
      return;
    }
    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
}
