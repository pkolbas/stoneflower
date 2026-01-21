import { Router } from 'express';
import type { Request, Response } from 'express';
import { updateUserSettings } from '../services/userService.js';

const router = Router();

// Get current user
router.get('/me', async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    // Convert BigInt to string for JSON serialization
    const user = {
      ...req.user,
      telegramId: req.user.telegramId.toString(),
    };

    res.json({ user });
  } catch (error) {
    console.error('Error getting user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update user settings
router.put('/me/settings', async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { timezone, notificationsEnabled, languageCode } = req.body;

    const updatedUser = await updateUserSettings(req.user.id, {
      ...(timezone !== undefined && { timezone }),
      ...(notificationsEnabled !== undefined && { notificationsEnabled }),
      ...(languageCode !== undefined && { languageCode }),
    });

    res.json({
      user: {
        ...updatedUser,
        telegramId: updatedUser.telegramId.toString(),
      },
    });
  } catch (error) {
    console.error('Error updating user settings:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
