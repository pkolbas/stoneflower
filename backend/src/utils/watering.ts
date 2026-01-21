import type { Plant, PlantSpecies, PotSize } from '@prisma/client';
import { getCurrentSeason } from './season.js';

const POT_SIZE_MULTIPLIERS: Record<PotSize, number> = {
  TINY: 0.7,
  SMALL: 0.85,
  MEDIUM: 1.0,
  LARGE: 1.15,
  XLARGE: 1.3,
};

export function calculateNextWateringDate(
  plant: Plant,
  species: PlantSpecies | null,
  lastWateredAt: Date = new Date()
): Date {
  // Get base watering frequency
  let baseDays = plant.customWateringDays || species?.wateringFrequencyDays || 7;

  // Apply season multiplier
  const season = getCurrentSeason();
  let seasonMultiplier = 1.0;

  if (species) {
    if (season.name === 'winter') {
      seasonMultiplier = species.wateringWinterMultiplier;
    } else if (season.name === 'summer') {
      seasonMultiplier = species.wateringSummerMultiplier;
    }
  } else {
    seasonMultiplier = season.wateringMultiplier;
  }

  // Apply pot size multiplier
  const potMultiplier = POT_SIZE_MULTIPLIERS[plant.potSize];

  // Calculate final days
  const adjustedDays = Math.round(baseDays * seasonMultiplier * potMultiplier);

  // Calculate next watering date
  const nextDate = new Date(lastWateredAt);
  nextDate.setDate(nextDate.getDate() + adjustedDays);

  return nextDate;
}

export function getWateringStatus(nextWateringAt: Date | null): {
  status: 'ok' | 'soon' | 'overdue' | 'critical';
  daysUntil: number;
  message: string;
} {
  if (!nextWateringAt) {
    return {
      status: 'ok',
      daysUntil: 0,
      message: 'Дата полива не установлена',
    };
  }

  const now = new Date();
  const diffMs = nextWateringAt.getTime() - now.getTime();
  const daysUntil = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  if (daysUntil > 2) {
    return {
      status: 'ok',
      daysUntil,
      message: `Полив через ${daysUntil} дн.`,
    };
  } else if (daysUntil >= 0) {
    return {
      status: 'soon',
      daysUntil,
      message: daysUntil === 0 ? 'Полив сегодня!' : `Полив завтра`,
    };
  } else if (daysUntil >= -3) {
    return {
      status: 'overdue',
      daysUntil,
      message: `Полив просрочен на ${Math.abs(daysUntil)} дн.`,
    };
  } else {
    return {
      status: 'critical',
      daysUntil,
      message: `Срочно полить! Просрочено на ${Math.abs(daysUntil)} дн.`,
    };
  }
}

export function formatWateringSchedule(
  baseDays: number,
  seasonMultiplier: number,
  potMultiplier: number
): string {
  const adjustedDays = Math.round(baseDays * seasonMultiplier * potMultiplier);
  return `каждые ${adjustedDays} дн.`;
}
