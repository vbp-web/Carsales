import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'autoapex_super_secure_jwt_secret_key_2026';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'autoapex_super_secure_refresh_secret_key_2026';

export interface AuthUser {
  id: string;
  email: string;
  role: 'CUSTOMER' | 'ADMIN';
  name: string;
}

export interface RefreshTokenPayload {
  id: string;
  email: string;
  role: 'CUSTOMER' | 'ADMIN';
}

export interface AuthenticatedRequest extends Request {
  user?: AuthUser;
}

export function generateAccessToken(user: { id: string; email: string; role: 'CUSTOMER' | 'ADMIN'; name: string }): string {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role, name: user.name },
    JWT_SECRET,
    { expiresIn: '1h' }
  );
}

export function generateRefreshToken(user: { id: string; email: string; role: 'CUSTOMER' | 'ADMIN'; name?: string }): string {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    JWT_REFRESH_SECRET,
    { expiresIn: '30d' }
  );
}

export function generateAuthTokens(user: { id: string; email: string; role: 'CUSTOMER' | 'ADMIN'; name: string }): { token: string; refreshToken: string } {
  return {
    token: generateAccessToken(user),
    refreshToken: generateRefreshToken(user)
  };
}

// Kept for backward compatibility
export function generateToken(user: { id: string; email: string; role: 'CUSTOMER' | 'ADMIN'; name: string }): string {
  return generateAccessToken(user);
}

export function verifyAccessToken(token: string): AuthUser {
  return jwt.verify(token, JWT_SECRET) as AuthUser;
}

export function verifyRefreshToken(token: string): RefreshTokenPayload {
  return jwt.verify(token, JWT_REFRESH_SECRET) as RefreshTokenPayload;
}

export function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Authentication required. Please sign in.' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = verifyAccessToken(token);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Invalid or expired session. Please sign in again.' });
  }
}

export function requireAdmin(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  requireAuth(req, res, () => {
    if (req.user?.role !== 'ADMIN') {
      return res.status(403).json({ success: false, message: 'Access denied. Administrator privileges required.' });
    }
    next();
  });
}

export function optionalAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    try {
      const decoded = verifyAccessToken(token);
      req.user = decoded;
    } catch {
      // Ignore token failure for optional endpoints
    }
  }
  next();
}
