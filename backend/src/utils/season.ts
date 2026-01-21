import type { Season } from '../types/index.js';

export function getCurrentSeason(date: Date = new Date()): Season {
  const month = date.getMonth(); // 0-11

  // Northern hemisphere seasons
  if (month >= 11 || month <= 1) {
    return { name: 'winter', wateringMultiplier: 0.75 };
  } else if (month >= 2 && month <= 4) {
    return { name: 'spring', wateringMultiplier: 1.0 };
  } else if (month >= 5 && month <= 7) {
    return { name: 'summer', wateringMultiplier: 1.25 };
  } else {
    return { name: 'autumn', wateringMultiplier: 1.0 };
  }
}

export function getSeasonEmoji(season: Season['name']): string {
  switch (season) {
    case 'winter': return '❄️';
    case 'spring': return '🌸';
    case 'summer': return '☀️';
    case 'autumn': return '🍂';
  }
}

export function getSeasonName(season: Season['name'], lang: string = 'ru'): string {
  const names: Record<Season['name'], Record<string, string>> = {
    winter: { ru: 'Зима', en: 'Winter' },
    spring: { ru: 'Весна', en: 'Spring' },
    summer: { ru: 'Лето', en: 'Summer' },
    autumn: { ru: 'Осень', en: 'Autumn' },
  };

  return names[season][lang] || names[season]['en'];
}
