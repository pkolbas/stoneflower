import type { User, Plant, PlantSpecies, CareAction, PlantMessage } from '@prisma/client';

export type { User, Plant, PlantSpecies, CareAction, PlantMessage };

export interface TelegramWebAppUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  is_premium?: boolean;
}

export interface TelegramWebAppInitData {
  query_id?: string;
  user?: TelegramWebAppUser;
  auth_date: number;
  hash: string;
}

export interface CreatePlantDto {
  nickname: string;
  speciesId?: string;
  customSpecies?: string;
  photoUrl?: string;
  location?: string;
  potSize?: 'TINY' | 'SMALL' | 'MEDIUM' | 'LARGE' | 'XLARGE';
  acquiredAt?: Date;
  customWateringDays?: number;
  personality?: 'FRIENDLY' | 'SHY' | 'DRAMATIC' | 'WISE' | 'PLAYFUL';
}

export interface UpdatePlantDto extends Partial<CreatePlantDto> {
  isArchived?: boolean;
}

export interface CareActionDto {
  actionType: 'WATERING' | 'FERTILIZING' | 'REPOTTING' | 'PRUNING' | 'MISTING' | 'ROTATING' | 'CLEANING' | 'OTHER';
  notes?: string;
  photoUrl?: string;
}

export interface PlantWithDetails extends Plant {
  species: PlantSpecies | null;
  careActions: CareAction[];
  messages: PlantMessage[];
}

export interface Season {
  name: 'winter' | 'spring' | 'summer' | 'autumn';
  wateringMultiplier: number;
}

export interface PlantMessageContent {
  happy: string[];
  neutral: string[];
  thirsty: string[];
  critical: string[];
  thanks: string[];
  milestone: string[];
}
