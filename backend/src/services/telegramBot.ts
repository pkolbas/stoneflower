import TelegramBot from 'node-telegram-bot-api';
import prisma from './database.js';
import { generatePlantMessage } from '../utils/plantMessages.js';
import { getWateringStatus } from '../utils/watering.js';

let bot: TelegramBot | null = null;

export function initBot(token: string, webAppUrl: string): TelegramBot {
  bot = new TelegramBot(token, { polling: true });

  // /start command
  bot.onText(/\/start/, async (msg) => {
    const chatId = msg.chat.id;
    const webAppButton = {
      text: '🌱 Открыть Stoneflower',
      web_app: { url: webAppUrl },
    };

    await bot!.sendMessage(
      chatId,
      `🌿 *Добро пожаловать в Stoneflower!*\n\nЯ помогу вам заботиться о ваших комнатных растениях. Ваши растения будут "писать" вам сообщения и напоминать о поливе!\n\n🪴 *Возможности:*\n• Добавляйте растения с фото\n• Получайте персональные напоминания\n• Отслеживайте историю ухода\n• Ваши растения обретут характер!\n\nНажмите кнопку ниже, чтобы начать 👇`,
      {
        parse_mode: 'Markdown',
        reply_markup: {
          inline_keyboard: [[webAppButton]],
        },
      }
    );
  });

  // /plants command - show plants summary
  bot.onText(/\/plants/, async (msg) => {
    const chatId = msg.chat.id;
    const telegramId = msg.from?.id;

    if (!telegramId) return;

    const user = await prisma.user.findUnique({
      where: { telegramId: BigInt(telegramId) },
      include: {
        plants: {
          where: { isArchived: false },
          include: { species: true },
          orderBy: { nextWateringAt: 'asc' },
        },
      },
    });

    if (!user || user.plants.length === 0) {
      await bot!.sendMessage(
        chatId,
        '🌱 У вас пока нет растений. Откройте приложение и добавьте своё первое растение!',
        {
          reply_markup: {
            inline_keyboard: [[{ text: '🌿 Добавить растение', web_app: { url: webAppUrl } }]],
          },
        }
      );
      return;
    }

    let message = '🌿 *Ваши растения:*\n\n';

    for (const plant of user.plants) {
      const status = getWateringStatus(plant.nextWateringAt);
      const statusEmoji = {
        ok: '✅',
        soon: '💧',
        overdue: '⚠️',
        critical: '🆘',
      }[status.status];

      message += `${statusEmoji} *${plant.nickname}*`;
      if (plant.species) {
        message += ` (${plant.species.commonNameRu})`;
      }
      message += `\n   ${status.message}\n\n`;
    }

    await bot!.sendMessage(chatId, message, {
      parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: [[{ text: '🌱 Открыть приложение', web_app: { url: webAppUrl } }]],
      },
    });
  });

  // /water command - quick water a plant
  bot.onText(/\/water/, async (msg) => {
    const chatId = msg.chat.id;
    const telegramId = msg.from?.id;

    if (!telegramId) return;

    const user = await prisma.user.findUnique({
      where: { telegramId: BigInt(telegramId) },
      include: {
        plants: {
          where: { isArchived: false },
          orderBy: { nextWateringAt: 'asc' },
          take: 10,
        },
      },
    });

    if (!user || user.plants.length === 0) {
      await bot!.sendMessage(chatId, '🌱 У вас пока нет растений.');
      return;
    }

    const buttons = user.plants.map((plant) => [{
      text: `💧 ${plant.nickname}`,
      callback_data: `water_${plant.id}`,
    }]);

    await bot!.sendMessage(chatId, '🌿 Какое растение полить?', {
      reply_markup: {
        inline_keyboard: buttons,
      },
    });
  });

  // Handle water callback
  bot.on('callback_query', async (query) => {
    if (!query.data?.startsWith('water_')) return;

    const plantId = query.data.replace('water_', '');
    const chatId = query.message?.chat.id;
    const telegramId = query.from.id;

    if (!chatId) return;

    const user = await prisma.user.findUnique({
      where: { telegramId: BigInt(telegramId) },
    });

    if (!user) {
      await bot!.answerCallbackQuery(query.id, { text: 'Пользователь не найден' });
      return;
    }

    const plant = await prisma.plant.findFirst({
      where: { id: plantId, userId: user.id },
      include: { species: true },
    });

    if (!plant) {
      await bot!.answerCallbackQuery(query.id, { text: 'Растение не найдено' });
      return;
    }

    // Record watering action
    const { calculateNextWateringDate } = await import('../utils/watering.js');
    const now = new Date();
    const nextWateringAt = calculateNextWateringDate(plant, plant.species, now);

    await prisma.careAction.create({
      data: {
        plantId: plant.id,
        userId: user.id,
        actionType: 'WATERING',
      },
    });

    await prisma.plant.update({
      where: { id: plant.id },
      data: {
        lastWateredAt: now,
        nextWateringAt,
      },
    });

    // Create thank you message
    const thankYouMessage = generatePlantMessage(plant.personality, 'WATERING_THANKS');
    await prisma.plantMessage.create({
      data: {
        plantId: plant.id,
        messageType: 'WATERING_THANKS',
        content: thankYouMessage,
      },
    });

    await bot!.answerCallbackQuery(query.id, { text: '✅ Полив записан!' });
    await bot!.sendMessage(chatId, `🌿 *${plant.nickname}:*\n${thankYouMessage}`, {
      parse_mode: 'Markdown',
    });
  });

  // /help command
  bot.onText(/\/help/, async (msg) => {
    const chatId = msg.chat.id;

    await bot!.sendMessage(
      chatId,
      `🌿 *Stoneflower - Помощь*\n\n*Команды:*\n/start - Открыть приложение\n/plants - Список растений\n/water - Быстрый полив\n/help - Эта справка\n\n*Как это работает:*\nВаши растения будут "писать" вам сообщения с напоминаниями о поливе. Каждое растение имеет свой характер!\n\n🤖 Бот учитывает сезон года для расчёта графика полива — зимой растения поливают реже.`,
      { parse_mode: 'Markdown' }
    );
  });

  console.log('Telegram bot initialized');
  return bot;
}

export function getBot(): TelegramBot | null {
  return bot;
}

export async function sendWateringReminder(
  telegramId: bigint,
  plantNickname: string,
  message: string
): Promise<boolean> {
  if (!bot) {
    console.error('Bot not initialized');
    return false;
  }

  try {
    await bot.sendMessage(
      Number(telegramId),
      `🌿 *${plantNickname}:*\n${message}`,
      { parse_mode: 'Markdown' }
    );
    return true;
  } catch (error) {
    console.error('Failed to send reminder:', error);
    return false;
  }
}

export async function sendBulkReminders(): Promise<void> {
  const plantsNeedingWater = await prisma.plant.findMany({
    where: {
      isArchived: false,
      nextWateringAt: {
        lte: new Date(),
      },
      user: {
        notificationsEnabled: true,
      },
    },
    include: {
      user: true,
    },
  });

  for (const plant of plantsNeedingWater) {
    const status = getWateringStatus(plant.nextWateringAt);
    const message = generatePlantMessage(
      plant.personality,
      'WATERING_REMINDER',
      status.status
    );

    await sendWateringReminder(plant.user.telegramId, plant.nickname, message);

    // Create message in database
    await prisma.plantMessage.create({
      data: {
        plantId: plant.id,
        messageType: 'WATERING_REMINDER',
        content: message,
      },
    });

    // Small delay to avoid rate limiting
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
}

export async function sendTestReminder(telegramId: bigint): Promise<{ sent: number; plants: string[] }> {
  const user = await prisma.user.findUnique({
    where: { telegramId },
    include: {
      plants: {
        where: { isArchived: false },
        take: 5, // Лимит для теста
      },
    },
  });

  if (!user || user.plants.length === 0) {
    return { sent: 0, plants: [] };
  }

  const sentPlants: string[] = [];

  for (const plant of user.plants) {
    const message = generatePlantMessage(plant.personality, 'WATERING_REMINDER', 'soon');
    const success = await sendWateringReminder(telegramId, plant.nickname, message);
    if (success) {
      sentPlants.push(plant.nickname);
    }
  }

  return { sent: sentPlants.length, plants: sentPlants };
}
