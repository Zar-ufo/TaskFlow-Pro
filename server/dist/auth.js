import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { env } from './env.js';
import { HttpError } from './httpErrors.js';
export function hashPassword(password) {
    return bcrypt.hash(password, 12);
}
export function verifyPassword(password, passwordHash) {
    return bcrypt.compare(password, passwordHash);
}
export function signAccessToken(payload) {
    return jwt.sign(payload, env.jwtSecret, { expiresIn: '7d' });
}
export function verifyAccessToken(token) {
    try {
        return jwt.verify(token, env.jwtSecret);
    }
    catch {
        throw new HttpError(401, 'Invalid or expired token');
    }
}
export function generateEmailVerificationToken() {
    return crypto.randomBytes(32).toString('hex');
}
export function hashEmailVerificationToken(token) {
    return crypto.createHash('sha256').update(token).digest('hex');
}
export function requireAuth(req, _res, next) {
    const header = req.headers.authorization;
    if (!header || !header.toLowerCase().startsWith('bearer ')) {
        next(new HttpError(401, 'Missing Authorization header'));
        return;
    }
    const token = header.slice('bearer '.length).trim();
    const payload = verifyAccessToken(token);
    req.auth = payload;
    next();
}
export function requireAdmin(req, _res, next) {
    const auth = req.auth;
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
