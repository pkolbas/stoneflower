import { Router, Request, Response } from 'express';
import { sendBulkReminders, sendTestReminder } from '../services/telegramBot.js';
import prisma from '../services/database.js';

const router = Router();

// POST /api/test/send-reminders
// Query params:
//   force=true - отправить всем растениям первого пользователя
router.post('/send-reminders', async (req: Request, res: Response) => {
  try {
    const force = req.query.force === 'true';

    if (force) {
      // Найти первого пользователя с растениями
      const user = await prisma.user.findFirst({
        where: {
          plants: { some: { isArchived: false } }
        }
      });

      if (!user) {
        return res.json({ success: false, message: 'No users with plants found' });
      }

      const result = await sendTestReminder(user.telegramId);
      return res.json({
        success: true,
        message: `Sent ${result.sent} test reminders`,
        plants: result.plants
      });
    }

    await sendBulkReminders();
    res.json({ success: true, message: 'Bulk reminders processed' });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ success: false, error: message });
  }
});

export default router;
