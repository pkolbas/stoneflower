import type { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import { findOrCreateUser, getUserByTelegramId } from '../services/userService.js';
import type { TelegramWebAppUser } from '../types/index.js';

declare global {
  namespace Express {
    interface Request {
      user?: Awaited<ReturnType<typeof findOrCreateUser>>;
      telegramUser?: TelegramWebAppUser;
    }
  }
}

function verifyTelegramWebAppData(initData: string, botToken: string): TelegramWebAppUser | null {
  try {
    const urlParams = new URLSearchParams(initData);
    const hash = urlParams.get('hash');
    urlParams.delete('hash');

    // Sort params alphabetically
    const dataCheckString = Array.from(urlParams.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, value]) => `${key}=${value}`)
      .join('\n');

    // Create secret key
    const secretKey = crypto
      .createHmac('sha256', 'WebAppData')
      .update(botToken)
      .digest();

    // Calculate hash
    const calculatedHash = crypto
      .createHmac('sha256', secretKey)
      .update(dataCheckString)
      .digest('hex');

    if (calculatedHash !== hash) {
      console.error('Hash mismatch');
      return null;
    }

    // Check auth_date (not older than 24 hours)
    const authDate = parseInt(urlParams.get('auth_date') || '0', 10);
    const now = Math.floor(Date.now() / 1000);
    if (now - authDate > 86400) {
      console.error('Auth data expired');
      return null;
    }

    // Parse user data
    const userStr = urlParams.get('user');
    if (!userStr) {
      console.error('No user data');
      return null;
    }

    return JSON.parse(userStr) as TelegramWebAppUser;
  } catch (error) {
    console.error('Error verifying Telegram data:', error);
    return null;
  }
}

export function authMiddleware(botToken: string) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const initData = req.headers['x-telegram-init-data'] as string;

    // For development, allow bypass with x-dev-user-id header
    if (process.env.NODE_ENV === 'development' && req.headers['x-dev-user-id']) {
      const devUserId = parseInt(req.headers['x-dev-user-id'] as string, 10);
      const devUser: TelegramWebAppUser = {
        id: devUserId,
        first_name: 'Dev',
        username: 'devuser',
        language_code: 'ru',
      };

      req.telegramUser = devUser;
      req.user = await findOrCreateUser(devUser);
      next();
      return;
    }

    if (!initData) {
      res.status(401).json({ error: 'Missing Telegram init data' });
      return;
    }

    const telegramUser = verifyTelegramWebAppData(initData, botToken);

    if (!telegramUser) {
      res.status(401).json({ error: 'Invalid Telegram init data' });
      return;
    }

    req.telegramUser = telegramUser;
    req.user = await findOrCreateUser(telegramUser);

    next();
  };
}

// Optional auth - doesn't fail if no auth data
export function optionalAuthMiddleware(botToken: string) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const initData = req.headers['x-telegram-init-data'] as string;

    if (!initData) {
      next();
      return;
    }

    const telegramUser = verifyTelegramWebAppData(initData, botToken);

    if (telegramUser) {
      req.telegramUser = telegramUser;
      req.user = await findOrCreateUser(telegramUser);
    }

    next();
  };
}
