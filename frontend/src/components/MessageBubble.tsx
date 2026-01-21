import type { PlantMessage, CareAction, PlantPersonality } from '@/types';
import { formatDistanceToNow } from '@/utils/date';

interface MessageBubbleProps {
  message?: PlantMessage;
  action?: CareAction;
  plantName: string;
  personality: PlantPersonality;
}

const personalityEmojis: Record<PlantPersonality, string> = {
  FRIENDLY: '😊',
  SHY: '😳',
  DRAMATIC: '🎭',
  WISE: '🧘',
  PLAYFUL: '🎉',
};

const actionEmojis: Record<string, string> = {
  WATERING: '💧',
  FERTILIZING: '🌱',
  REPOTTING: '🪴',
  PRUNING: '✂️',
  MISTING: '💦',
  ROTATING: '🔄',
  CLEANING: '🧹',
  OTHER: '📝',
};

const actionNames: Record<string, string> = {
  WATERING: 'Полив',
  FERTILIZING: 'Подкормка',
  REPOTTING: 'Пересадка',
  PRUNING: 'Обрезка',
  MISTING: 'Опрыскивание',
  ROTATING: 'Поворот',
  CLEANING: 'Чистка листьев',
  OTHER: 'Другое',
};

export default function MessageBubble({ message, action, plantName, personality }: MessageBubbleProps) {
  // User action message
  if (action) {
    return (
      <div className="flex justify-end mb-3">
        <div className="message-bubble message-bubble-user">
          <div className="flex items-center gap-2 text-sm">
            <span>{actionEmojis[action.actionType]}</span>
            <span className="font-medium">{actionNames[action.actionType]}</span>
          </div>
          {action.notes && (
            <p className="mt-1 text-sm opacity-80">{action.notes}</p>
          )}
          <p className="text-xs opacity-60 mt-2 text-right">
            {formatDistanceToNow(new Date(action.createdAt))}
          </p>
        </div>
      </div>
    );
  }

  // Plant message
  if (message) {
    return (
      <div className="flex justify-start mb-3">
        <div className="message-bubble message-bubble-plant">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-lg">{personalityEmojis[personality]}</span>
            <span className="font-medium text-sm">{plantName}</span>
          </div>
          <p className="text-sm whitespace-pre-wrap">{message.content}</p>
          <p className="text-xs opacity-60 mt-2">
            {formatDistanceToNow(new Date(message.createdAt))}
          </p>
        </div>
      </div>
    );
  }

  return null;
}
