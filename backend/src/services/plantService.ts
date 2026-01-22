import prisma from './database.js';
import type { CreatePlantDto, UpdatePlantDto, CareActionDto } from '../types/index.js';
import { calculateNextWateringDate, getWateringStatus } from '../utils/watering.js';
import { generatePlantMessage } from '../utils/plantMessages.js';

export async function createPlant(userId: string, data: CreatePlantDto) {
  const plant = await prisma.plant.create({
    data: {
      userId,
      nickname: data.nickname,
      speciesId: data.speciesId || null,
      customSpecies: data.customSpecies || null,
      photoUrl: data.photoUrl || null,
      location: data.location || null,
      potSize: data.potSize || 'MEDIUM',
      acquiredAt: data.acquiredAt || new Date(),
      customWateringDays: data.customWateringDays || null,
      personality: data.personality || 'FRIENDLY',
    },
    include: {
      species: true,
    },
  });

  // Calculate initial next watering date
  const nextWateringAt = calculateNextWateringDate(plant, plant.species, new Date());

  // Update with calculated watering date
  const updatedPlant = await prisma.plant.update({
    where: { id: plant.id },
    data: { nextWateringAt },
    include: {
      species: true,
      messages: {
        orderBy: { createdAt: 'desc' },
        take: 10,
      },
    },
  });

  // Create welcome message
  const welcomeMessage = generatePlantMessage(plant.personality, 'GREETING');
  await prisma.plantMessage.create({
    data: {
      plantId: plant.id,
      messageType: 'GREETING',
      content: `Привет! Я ${plant.nickname}! ${welcomeMessage}`,
    },
  });

  return {
    ...updatedPlant,
    wateringStatus: getWateringStatus(updatedPlant.nextWateringAt),
  };
}

export async function getPlantById(plantId: string) {
  const plant = await prisma.plant.findUnique({
    where: { id: plantId },
    include: {
      species: true,
      careActions: {
        orderBy: { createdAt: 'desc' },
        take: 20,
      },
      messages: {
        orderBy: { createdAt: 'desc' },
        take: 20,
      },
    },
  });

  if (!plant) return null;

  return {
    ...plant,
    wateringStatus: getWateringStatus(plant.nextWateringAt),
  };
}

export async function getUserPlants(userId: string, includeArchived = false) {
  const plants = await prisma.plant.findMany({
    where: {
      userId,
      ...(includeArchived ? {} : { isArchived: false }),
    },
    include: {
      species: true,
      messages: {
        orderBy: { createdAt: 'desc' },
        take: 1,
      },
    },
    orderBy: [
      { nextWateringAt: 'asc' },
      { createdAt: 'desc' },
    ],
  });

  // Add watering status to each plant
  return plants.map((plant) => ({
    ...plant,
    wateringStatus: getWateringStatus(plant.nextWateringAt),
  }));
}

export async function updatePlant(plantId: string, data: UpdatePlantDto) {
  const plant = await prisma.plant.update({
    where: { id: plantId },
    data: {
      ...(data.nickname !== undefined && { nickname: data.nickname }),
      ...(data.speciesId !== undefined && { speciesId: data.speciesId }),
      ...(data.customSpecies !== undefined && { customSpecies: data.customSpecies }),
      ...(data.photoUrl !== undefined && { photoUrl: data.photoUrl }),
      ...(data.location !== undefined && { location: data.location }),
      ...(data.potSize !== undefined && { potSize: data.potSize }),
      ...(data.acquiredAt !== undefined && { acquiredAt: data.acquiredAt }),
      ...(data.customWateringDays !== undefined && { customWateringDays: data.customWateringDays }),
      ...(data.personality !== undefined && { personality: data.personality }),
      ...(data.isArchived !== undefined && { isArchived: data.isArchived }),
    },
    include: {
      species: true,
    },
  });

  // Recalculate next watering if relevant fields changed
  if (data.customWateringDays !== undefined || data.speciesId !== undefined || data.potSize !== undefined) {
    const nextWateringAt = calculateNextWateringDate(
      plant,
      plant.species,
      plant.lastWateredAt || new Date()
    );

    const updatedPlant = await prisma.plant.update({
      where: { id: plantId },
      data: { nextWateringAt },
      include: {
        species: true,
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
    });

    return {
      ...updatedPlant,
      wateringStatus: getWateringStatus(updatedPlant.nextWateringAt),
    };
  }

  return {
    ...plant,
    wateringStatus: getWateringStatus(plant.nextWateringAt),
  };
}

export async function deletePlant(plantId: string) {
  return prisma.plant.delete({
    where: { id: plantId },
  });
}

export async function archivePlant(plantId: string) {
  return prisma.plant.update({
    where: { id: plantId },
    data: { isArchived: true },
  });
}

export async function recordCareAction(
  plantId: string,
  userId: string,
  data: CareActionDto
) {
  const action = await prisma.careAction.create({
    data: {
      plantId,
      userId,
      actionType: data.actionType,
      notes: data.notes || null,
      photoUrl: data.photoUrl || null,
    },
  });

  // If watering, update plant and create thank you message
  if (data.actionType === 'WATERING') {
    const plant = await prisma.plant.findUnique({
      where: { id: plantId },
      include: { species: true },
    });

    if (plant) {
      const now = new Date();
      const nextWateringAt = calculateNextWateringDate(plant, plant.species, now);

      await prisma.plant.update({
        where: { id: plantId },
        data: {
          lastWateredAt: now,
          nextWateringAt,
        },
      });

      // Create thank you message
      const thankYouMessage = generatePlantMessage(plant.personality, 'WATERING_THANKS');
      await prisma.plantMessage.create({
        data: {
          plantId,
          messageType: 'WATERING_THANKS',
          content: thankYouMessage,
        },
      });
    }
  }

  return action;
}

export async function getPlantCareHistory(plantId: string, limit = 50) {
  return prisma.careAction.findMany({
    where: { plantId },
    orderBy: { createdAt: 'desc' },
    take: limit,
  });
}

export async function getPlantMessages(plantId: string, limit = 50) {
  return prisma.plantMessage.findMany({
    where: { plantId },
    orderBy: { createdAt: 'desc' },
    take: limit,
  });
}

export async function markMessagesAsRead(plantId: string) {
  return prisma.plantMessage.updateMany({
    where: {
      plantId,
      isRead: false,
    },
    data: {
      isRead: true,
    },
  });
}

export async function getPlantsNeedingWater(userId: string) {
  const now = new Date();

  return prisma.plant.findMany({
    where: {
      userId,
      isArchived: false,
      nextWateringAt: {
        lte: now,
      },
    },
    include: {
      species: true,
    },
    orderBy: {
      nextWateringAt: 'asc',
    },
  });
}
