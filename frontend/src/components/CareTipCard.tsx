import { Sun, Droplets, Wind, Leaf, Scissors, Flower2 } from 'lucide-react';
import type { PlantSpecies, LightLevel, HumidityLevel } from '@/types';

interface CareTipCardProps {
  species: PlantSpecies;
}

const lightLevelText: Record<LightLevel, string> = {
  LOW: 'Тень / Полутень',
  MEDIUM: 'Рассеянный свет',
  HIGH: 'Яркий свет',
  DIRECT: 'Прямой солнечный свет',
};

const humidityLevelText: Record<HumidityLevel, string> = {
  LOW: 'Низкая',
  MEDIUM: 'Средняя',
  HIGH: 'Высокая',
};

const tipIcons = {
  lighting: Sun,
  watering: Droplets,
  humidity: Wind,
  feeding: Leaf,
  pruning: Scissors,
  repotting: Flower2,
};

interface TipSectionProps {
  icon: React.ElementType;
  title: string;
  content: string | null;
  highlight?: string;
}

function TipSection({ icon: Icon, title, content, highlight }: TipSectionProps) {
  if (!content && !highlight) return null;

  return (
    <div className="flex gap-3 p-3 bg-tg-secondary-bg rounded-xl">
      <div className="w-10 h-10 rounded-full bg-plant-green-100 flex items-center justify-center flex-shrink-0">
        <Icon className="w-5 h-5 text-plant-green-600" />
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="font-medium text-sm">{title}</h4>
        {highlight && (
          <p className="text-plant-green-600 font-medium text-sm mt-1">{highlight}</p>
        )}
        {content && (
          <p className="text-tg-hint text-sm mt-1">{content}</p>
        )}
      </div>
    </div>
  );
}

export default function CareTipCard({ species }: CareTipCardProps) {
  return (
    <div className="space-y-3">
      <TipSection
        icon={tipIcons.lighting}
        title="Освещение"
        highlight={lightLevelText[species.lightLevel]}
        content={species.lightingTips}
      />

      <TipSection
        icon={tipIcons.watering}
        title="Полив"
        highlight={`Каждые ${species.wateringFrequencyDays} дней`}
        content={species.wateringTips}
      />

      <TipSection
        icon={tipIcons.humidity}
        title="Влажность"
        highlight={humidityLevelText[species.humidityLevel]}
        content={species.humidityTips}
      />

      <div className="flex gap-3 p-3 bg-tg-secondary-bg rounded-xl">
        <div className="w-10 h-10 rounded-full bg-plant-green-100 flex items-center justify-center flex-shrink-0">
          <span className="text-lg">🌡️</span>
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-sm">Температура</h4>
          <p className="text-plant-green-600 font-medium text-sm mt-1">
            {species.temperatureMin}°C — {species.temperatureMax}°C
          </p>
        </div>
      </div>

      <TipSection
        icon={tipIcons.feeding}
        title="Подкормка"
        content={species.feedingTips}
      />

      <TipSection
        icon={tipIcons.pruning}
        title="Обрезка"
        content={species.pruningTips}
      />

      <TipSection
        icon={tipIcons.repotting}
        title="Пересадка"
        content={species.repottingTips}
      />
    </div>
  );
}
