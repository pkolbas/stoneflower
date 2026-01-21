import cron from 'node-cron';
import { sendBulkReminders } from './telegramBot.js';

let scheduledTask: cron.ScheduledTask | null = null;

export function startScheduler(): void {
  // Run every day at 9:00 AM and 6:00 PM Moscow time
  // Cron format: minute hour day month weekday

  // Morning reminder at 9:00 AM
  scheduledTask = cron.schedule('0 9 * * *', async () => {
    console.log('Running morning watering reminders...');
    try {
      await sendBulkReminders();
      console.log('Morning reminders sent successfully');
    } catch (error) {
      console.error('Error sending morning reminders:', error);
    }
  }, {
    timezone: 'Europe/Moscow',
  });

  // Evening reminder at 6:00 PM
  cron.schedule('0 18 * * *', async () => {
    console.log('Running evening watering reminders...');
    try {
      await sendBulkReminders();
      console.log('Evening reminders sent successfully');
    } catch (error) {
      console.error('Error sending evening reminders:', error);
    }
  }, {
    timezone: 'Europe/Moscow',
  });

  console.log('Scheduler started - reminders at 9:00 and 18:00 Moscow time');
}

export function stopScheduler(): void {
  if (scheduledTask) {
    scheduledTask.stop();
    scheduledTask = null;
    console.log('Scheduler stopped');
  }
}
