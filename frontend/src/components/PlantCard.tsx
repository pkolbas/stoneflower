import { useNavigate } from 'react-router-dom';
import { Droplets, MessageCircle, Leaf } from 'lucide-react';
import type { Plant } from '@/types';
import { hapticFeedback } from '@/utils/telegram';

interface PlantCardProps {
  plant: Plant;
}

const statusColors = {
  ok: 'bg-plant-green-100 text-plant-green-700',
  soon: 'bg-yellow-100 text-yellow-700',
  overdue: 'bg-orange-100 text-orange-700',
  critical: 'bg-red-100 text-red-700',
};

const statusEmojis = {
  ok: '✅',
  soon: '💧',
  overdue: '⚠️',
  critical: '🆘',
};

const personalityEmojis = {
  FRIENDLY: '😊',
  SHY: '😳',
  DRAMATIC: '🎭',
  WISE: '🧘',
  PLAYFUL: '🎉',
};

export default function PlantCard({ plant }: PlantCardProps) {
  const navigate = useNavigate();
  const status = plant.wateringStatus?.status || 'ok';

  const handleClick = () => {
    hapticFeedback('selection');
    navigate(`/plant/${plant.id}`);
  };

  return (
    <div
      onClick={handleClick}
      className="plant-card tg-card cursor-pointer active:scale-[0.98] transition-transform"
    >
      <div className="flex items-start gap-4">
        {/* Plant avatar */}
        <div className="w-16 h-16 rounded-2xl bg-plant-green-100 flex items-center justify-center overflow-hidden flex-shrink-0">
          {plant.photoUrl ? (
            <img
              src={plant.photoUrl}
              alt={plant.nickname}
              className="w-full h-full object-cover"
            />
          ) : (
            <Leaf className="w-8 h-8 text-plant-green-500" />
          )}
        </div>

        {/* Plant info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-lg truncate">{plant.nickname}</h3>
            <span className="text-lg">{personalityEmojis[plant.personality]}</span>
          </div>

          <p className="text-sm text-tg-hint truncate">
            {plant.species?.commonNameRu || plant.customSpecies || 'Неизвестный вид'}
          </p>

          {/* Status badge */}
          <div className="flex items-center gap-2 mt-2">
            <span
              className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${statusColors[status]}`}
            >
              <span>{statusEmojis[status]}</span>
              <span>{plant.wateringStatus?.message || 'Статус неизвестен'}</span>
            </span>
          </div>
        </div>

        {/* Quick action indicators */}
        <div className="flex flex-col gap-2">
          {status !== 'ok' && (
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center ${statusColors[status]}`}
            >
              <Droplets className="w-5 h-5" />
            </div>
          )}
        </div>
      </div>

      {/* Last message preview */}
      {plant.messages && plant.messages[0] && (
        <div className="mt-3 pt-3 border-t border-gray-100">
          <div className="flex items-start gap-2 text-sm text-tg-hint">
            <MessageCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <p className="line-clamp-2">{plant.messages[0].content}</p>
          </div>
        </div>
      )}
    </div>
  );
}
