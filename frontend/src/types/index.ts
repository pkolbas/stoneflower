export type LightLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'DIRECT';
export type HumidityLevel = 'LOW' | 'MEDIUM' | 'HIGH';
export type PotSize = 'TINY' | 'SMALL' | 'MEDIUM' | 'LARGE' | 'XLARGE';
export type PlantPersonality = 'FRIENDLY' | 'SHY' | 'DRAMATIC' | 'WISE' | 'PLAYFUL';
export type CareActionType = 'WATERING' | 'FERTILIZING' | 'REPOTTING' | 'PRUNING' | 'MISTING' | 'ROTATING' | 'CLEANING' | 'OTHER';
export type MessageType = 'WATERING_REMINDER' | 'WATERING_THANKS' | 'GREETING' | 'MILESTONE' | 'WEATHER_WARNING' | 'TIP' | 'SOS';

export interface PlantSpecies {
  id: string;
  scientificName: string;
  commonNameRu: string;
  commonNameEn: string | null;
  description: string | null;
  imageUrl: string | null;
  wateringFrequencyDays: number;
  wateringWinterMultiplier: number;
  wateringSummerMultiplier: number;
  lightLevel: LightLevel;
  humidityLevel: HumidityLevel;
  temperatureMin: number;
  temperatureMax: number;
  lightingTips: string | null;
  wateringTips: string | null;
  humidityTips: string | null;
  feedingTips: string | null;
  repottingTips: string | null;
  pruningTips: string | null;
}

export interface Plant {
  id: string;
  userId: string;
  speciesId: string | null;
  nickname: string;
  customSpecies: string | null;
  photoUrl: string | null;
  location: string | null;
  potSize: PotSize;
  acquiredAt: string;
  lastWateredAt: string | null;
  nextWateringAt: string | null;
  customWateringDays: number | null;
  personality: PlantPersonality;
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
  species: PlantSpecies | null;
  wateringStatus?: WateringStatus;
}

export interface WateringStatus {
  status: 'ok' | 'soon' | 'overdue' | 'critical';
  daysUntil: number;
  message: string;
}

export interface PlantMessage {
  id: string;
  plantId: string;
  messageType: MessageType;
  content: string;
  isRead: boolean;
  createdAt: string;
}

export interface CareAction {
  id: string;
  plantId: string;
  userId: string;
  actionType: CareActionType;
  notes: string | null;
  photoUrl: string | null;
  createdAt: string;
}

export interface User {
  id: string;
  telegramId: string;
  username: string | null;
  firstName: string | null;
  lastName: string | null;
  languageCode: string;
  timezone: string;
  notificationsEnabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePlantDto {
  nickname: string;
  speciesId?: string;
  customSpecies?: string;
  photoUrl?: string;
  location?: string;
  potSize?: PotSize;
  acquiredAt?: string;
  customWateringDays?: number;
  personality?: PlantPersonality;
}

export interface UpdatePlantDto extends Partial<CreatePlantDto> {
  isArchived?: boolean;
}

export interface CareActionDto {
  actionType: CareActionType;
  notes?: string;
  photoUrl?: string;
}
