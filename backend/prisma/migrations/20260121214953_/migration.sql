-- CreateEnum
CREATE TYPE "LightLevel" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'DIRECT');

-- CreateEnum
CREATE TYPE "HumidityLevel" AS ENUM ('LOW', 'MEDIUM', 'HIGH');

-- CreateEnum
CREATE TYPE "PotSize" AS ENUM ('TINY', 'SMALL', 'MEDIUM', 'LARGE', 'XLARGE');

-- CreateEnum
CREATE TYPE "PlantPersonality" AS ENUM ('FRIENDLY', 'SHY', 'DRAMATIC', 'WISE', 'PLAYFUL');

-- CreateEnum
CREATE TYPE "CareActionType" AS ENUM ('WATERING', 'FERTILIZING', 'REPOTTING', 'PRUNING', 'MISTING', 'ROTATING', 'CLEANING', 'OTHER');

-- CreateEnum
CREATE TYPE "MessageType" AS ENUM ('WATERING_REMINDER', 'WATERING_THANKS', 'GREETING', 'MILESTONE', 'WEATHER_WARNING', 'TIP', 'SOS');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('WATERING', 'FERTILIZING', 'GENERAL');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "telegramId" BIGINT NOT NULL,
    "username" TEXT,
    "firstName" TEXT,
    "lastName" TEXT,
    "languageCode" TEXT NOT NULL DEFAULT 'ru',
    "timezone" TEXT NOT NULL DEFAULT 'Europe/Moscow',
    "notificationsEnabled" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlantSpecies" (
    "id" TEXT NOT NULL,
    "scientificName" TEXT NOT NULL,
    "commonNameRu" TEXT NOT NULL,
    "commonNameEn" TEXT,
    "description" TEXT,
    "imageUrl" TEXT,
    "wateringFrequencyDays" INTEGER NOT NULL DEFAULT 7,
    "wateringWinterMultiplier" DOUBLE PRECISION NOT NULL DEFAULT 0.75,
    "wateringSummerMultiplier" DOUBLE PRECISION NOT NULL DEFAULT 1.25,
    "lightLevel" "LightLevel" NOT NULL DEFAULT 'MEDIUM',
    "humidityLevel" "HumidityLevel" NOT NULL DEFAULT 'MEDIUM',
    "temperatureMin" INTEGER NOT NULL DEFAULT 18,
    "temperatureMax" INTEGER NOT NULL DEFAULT 25,
    "lightingTips" TEXT,
    "wateringTips" TEXT,
    "humidityTips" TEXT,
    "feedingTips" TEXT,
    "repottingTips" TEXT,
    "pruningTips" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PlantSpecies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Plant" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "speciesId" TEXT,
    "nickname" TEXT NOT NULL,
    "customSpecies" TEXT,
    "photoUrl" TEXT,
    "location" TEXT,
    "potSize" "PotSize" NOT NULL DEFAULT 'MEDIUM',
    "acquiredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastWateredAt" TIMESTAMP(3),
    "nextWateringAt" TIMESTAMP(3),
    "customWateringDays" INTEGER,
    "personality" "PlantPersonality" NOT NULL DEFAULT 'FRIENDLY',
    "isArchived" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Plant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CareAction" (
    "id" TEXT NOT NULL,
    "plantId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "actionType" "CareActionType" NOT NULL,
    "notes" TEXT,
    "photoUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CareAction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlantMessage" (
    "id" TEXT NOT NULL,
    "plantId" TEXT NOT NULL,
    "messageType" "MessageType" NOT NULL,
    "content" TEXT NOT NULL,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PlantMessage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ScheduledNotification" (
    "id" TEXT NOT NULL,
    "telegramChatId" BIGINT NOT NULL,
    "plantId" TEXT NOT NULL,
    "plantNickname" TEXT NOT NULL,
    "notificationType" "NotificationType" NOT NULL,
    "scheduledFor" TIMESTAMP(3) NOT NULL,
    "sentAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ScheduledNotification_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_telegramId_key" ON "User"("telegramId");

-- CreateIndex
CREATE INDEX "User_telegramId_idx" ON "User"("telegramId");

-- CreateIndex
CREATE INDEX "PlantSpecies_scientificName_idx" ON "PlantSpecies"("scientificName");

-- CreateIndex
CREATE INDEX "PlantSpecies_commonNameRu_idx" ON "PlantSpecies"("commonNameRu");

-- CreateIndex
CREATE INDEX "Plant_userId_idx" ON "Plant"("userId");

-- CreateIndex
CREATE INDEX "Plant_nextWateringAt_idx" ON "Plant"("nextWateringAt");

-- CreateIndex
CREATE INDEX "CareAction_plantId_idx" ON "CareAction"("plantId");

-- CreateIndex
CREATE INDEX "CareAction_userId_idx" ON "CareAction"("userId");

-- CreateIndex
CREATE INDEX "CareAction_createdAt_idx" ON "CareAction"("createdAt");

-- CreateIndex
CREATE INDEX "PlantMessage_plantId_idx" ON "PlantMessage"("plantId");

-- CreateIndex
CREATE INDEX "PlantMessage_createdAt_idx" ON "PlantMessage"("createdAt");

-- CreateIndex
CREATE INDEX "ScheduledNotification_scheduledFor_idx" ON "ScheduledNotification"("scheduledFor");

-- CreateIndex
CREATE INDEX "ScheduledNotification_telegramChatId_idx" ON "ScheduledNotification"("telegramChatId");

-- AddForeignKey
ALTER TABLE "Plant" ADD CONSTRAINT "Plant_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Plant" ADD CONSTRAINT "Plant_speciesId_fkey" FOREIGN KEY ("speciesId") REFERENCES "PlantSpecies"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CareAction" ADD CONSTRAINT "CareAction_plantId_fkey" FOREIGN KEY ("plantId") REFERENCES "Plant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CareAction" ADD CONSTRAINT "CareAction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlantMessage" ADD CONSTRAINT "PlantMessage_plantId_fkey" FOREIGN KEY ("plantId") REFERENCES "Plant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
