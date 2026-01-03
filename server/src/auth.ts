import type { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { env } from './env.js';
import { HttpError } from './httpErrors.js';

export type AuthPayload = {
  userId: string;
  role: 'admin' | 'member' | 'viewer';
};

export function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export function verifyPassword(password: string, passwordHash: string): Promise<boolean> {
  return bcrypt.compare(password, passwordHash);
}

export function signAccessToken(payload: AuthPayload): string {
  return jwt.sign(payload, env.jwtSecret, { expiresIn: '7d' });
}

export function verifyAccessToken(token: string): AuthPayload {
  try {
    return jwt.verify(token, env.jwtSecret) as AuthPayload;
  } catch {
    throw new HttpError(401, 'Invalid or expired token');
  }
}

export function generateEmailVerificationToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

export function hashEmailVerificationToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

export function requireAuth(req: Request, _res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header || !header.toLowerCase().startsWith('bearer ')) {
    next(new HttpError(401, 'Missing Authorization header'));
    return;
  }
  const token = header.slice('bearer '.length).trim();
  const payload = verifyAccessToken(token);
  (req as any).auth = payload;
  next();
}

export function requireAdmin(req: Request, _res: Response, next: NextFunction) {
  const auth = (req as any).auth as AuthPayload | undefined;
  if (!auth) {
    next(new HttpError(401, 'Unauthorized'));
    return;
  }
  if (auth.role !== 'admin') {
    next(new HttpError(403, 'Admin only'));
    return;
  }
  next();
}
