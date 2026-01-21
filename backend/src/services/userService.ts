import prisma from './database.js';
import type { TelegramWebAppUser } from '../types/index.js';

export async function findOrCreateUser(telegramUser: TelegramWebAppUser) {
  const existingUser = await prisma.user.findUnique({
    where: { telegramId: BigInt(telegramUser.id) },
  });

  if (existingUser) {
    // Only update if data actually changed
    const newUsername = telegramUser.username || null;
    const newFirstName = telegramUser.first_name || null;
    const newLastName = telegramUser.last_name || null;
    const newLanguageCode = telegramUser.language_code || 'ru';

    if (
      existingUser.username === newUsername &&
      existingUser.firstName === newFirstName &&
      existingUser.lastName === newLastName &&
      existingUser.languageCode === newLanguageCode
    ) {
      return existingUser;
    }

    return prisma.user.update({
      where: { id: existingUser.id },
      data: {
        username: newUsername,
        firstName: newFirstName,
        lastName: newLastName,
        languageCode: newLanguageCode,
      },
    });
  }

  return prisma.user.create({
    data: {
      telegramId: BigInt(telegramUser.id),
      username: telegramUser.username || null,
      firstName: telegramUser.first_name || null,
      lastName: telegramUser.last_name || null,
      languageCode: telegramUser.language_code || 'ru',
    },
  });
}

export async function getUserById(id: string) {
  return prisma.user.findUnique({
    where: { id },
    include: {
      plants: {
        where: { isArchived: false },
        include: {
          species: true,
        },
        orderBy: { createdAt: 'desc' },
      },
    },
  });
}

export async function getUserByTelegramId(telegramId: number) {
  return prisma.user.findUnique({
    where: { telegramId: BigInt(telegramId) },
    include: {
      plants: {
        where: { isArchived: false },
        include: {
          species: true,
        },
        orderBy: { createdAt: 'desc' },
      },
    },
  });
}

export async function updateUserSettings(
  userId: string,
  settings: {
    timezone?: string;
    notificationsEnabled?: boolean;
    languageCode?: string;
  }
) {
  return prisma.user.update({
    where: { id: userId },
    data: settings,
  });
}
