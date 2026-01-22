import { useEffect, useState, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Droplets,
  MoreVertical,
  Leaf,
  Trash2,
  Edit,
  Info,
  History
} from 'lucide-react';
import MessageBubble from '@/components/MessageBubble';
import CareTipCard from '@/components/CareTipCard';
import LoadingSpinner from '@/components/LoadingSpinner';
import {
  useTelegramHaptic,
  useTelegramBackButton,
  useTelegramMainButton,
  useTelegramPopup,
  useTelegram,
} from '@/hooks/telegram';
import { useStore } from '@/hooks/useStore';
import * as api from '@/utils/api';
import type { Plant, PlantMessage, CareAction } from '@/types';

type Tab = 'chat' | 'care' | 'history';

export default function PlantPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isTelegramWebApp } = useTelegram();
  const haptic = useTelegramHaptic();
  const { showConfirm } = useTelegramPopup();
  const deletePlantFromStore = useStore((state) => state.deletePlant);
  const [activeTab, setActiveTab] = useState<Tab>('chat');
  const [showMenu, setShowMenu] = useState(false);
  const [isWatering, setIsWatering] = useState(false);

  // Local state instead of global store
  const [plant, setPlant] = useState<Plant | null>(null);
  const [messages, setMessages] = useState<PlantMessage[]>([]);
  const [careHistory, setCareHistory] = useState<CareAction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadData() {
      if (!id) return;

      setIsLoading(true);
      setError(null);

      try {
        const [plantData, messagesData, historyData] = await Promise.all([
          api.getPlant(id),
          api.getPlantMessages(id),
          api.getCareHistory(id),
        ]);

        if (!cancelled) {
          setPlant(plantData);
          setMessages(messagesData);
          setCareHistory(historyData);
          setIsLoading(false);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load plant');
          setIsLoading(false);
        }
      }
    }

    loadData();

    return () => {
      cancelled = true;
    };
  }, [id]);

  const handleBack = useCallback(() => {
    navigate('/');
  }, [navigate]);

  // Use Telegram BackButton
  useTelegramBackButton(handleBack);

  const handleWater = useCallback(async () => {
    if (!plant || isWatering) return;

    haptic('medium');
    setIsWatering(true);

    try {
      await api.recordCareAction(plant.id, { actionType: 'WATERING' });
      // Refresh data
      const [plantData, messagesData, historyData] = await Promise.all([
        api.getPlant(plant.id),
        api.getPlantMessages(plant.id),
        api.getCareHistory(plant.id),
      ]);
      setPlant(plantData);
      setMessages(messagesData);
      setCareHistory(historyData);
      haptic('success');
    } catch {
      haptic('error');
    } finally {
      setIsWatering(false);
    }
  }, [plant, isWatering, haptic]);

  const handleDelete = async () => {
    if (!plant) return;

    const confirmed = await showConfirm(
      `Вы уверены, что хотите удалить "${plant.nickname}"?`
    );

    if (confirmed) {
      haptic('medium');
      try {
        await deletePlantFromStore(plant.id);
        navigate('/');
      } catch {
        haptic('error');
      }
    }
  };

  const handleTabChange = (tab: Tab) => {
    haptic('selection');
    setActiveTab(tab);
  };

  // MainButton configuration for watering
  const status = plant?.wateringStatus?.status || 'ok';

  const mainButtonConfig = useMemo(() => {
    if (!plant || isLoading) return null;

    const buttonText = status === 'critical'
      ? 'Срочно полить!'
      : status === 'overdue'
      ? 'Пора полить'
      : status === 'soon'
      ? 'Полить сейчас'
      : 'Полить';

    const buttonColor = status === 'critical'
      ? '#ef4444'
      : status === 'overdue'
      ? '#f97316'
      : status === 'soon'
      ? '#3b82f6'
      : '#22c55e';

    return {
      text: buttonText,
      onClick: handleWater,
      isEnabled: !isWatering,
      showProgress: isWatering,
      color: buttonColor,
      textColor: '#ffffff',
    };
  }, [plant, status, isWatering, handleWater, isLoading]);

  // Use Telegram MainButton
  useTelegramMainButton(mainButtonConfig);

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error || !plant) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-4">
        <p className="text-red-500 mb-4">{error || 'Plant not found'}</p>
        <button onClick={() => navigate('/')} className="tg-button">
          Back to home
        </button>
      </div>
    );
  }

  // Combine messages and care actions for chat view
  const chatItems: Array<{ type: 'message' | 'action'; item: PlantMessage | CareAction; date: Date }> = [
    ...messages.map((m) => ({ type: 'message' as const, item: m, date: new Date(m.createdAt) })),
    ...careHistory.map((a) => ({ type: 'action' as const, item: a, date: new Date(a.createdAt) })),
  ].sort((a, b) => b.date.getTime() - a.date.getTime());

  return (
    <div className="flex-1 flex flex-col safe-area-top">
      {/* Header */}
      <div className="px-4 py-4 border-b border-gray-100 dark:border-gray-700">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/')}
            className="w-10 h-10 rounded-full bg-tg-secondary-bg flex items-center justify-center"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          {/* Plant avatar */}
          <div className="w-12 h-12 rounded-full bg-plant-green-100 flex items-center justify-center overflow-hidden">
            {plant.photoUrl ? (
              <img
                src={plant.photoUrl}
                alt={plant.nickname}
                className="w-full h-full object-cover"
              />
            ) : (
              <Leaf className="w-6 h-6 text-plant-green-500" />
            )}
          </div>

          {/* Plant info */}
          <div className="flex-1 min-w-0">
            <h1 className="font-semibold text-lg truncate">{plant.nickname}</h1>
            <p className="text-sm text-tg-hint truncate">
              {plant.species?.commonNameRu || plant.customSpecies || 'Неизвестный вид'}
            </p>
          </div>

          {/* Menu button */}
          <div className="relative">
            <button
              onClick={() => {
                haptic('light');
                setShowMenu(!showMenu);
              }}
              className="w-10 h-10 rounded-full bg-tg-secondary-bg flex items-center justify-center"
            >
              <MoreVertical className="w-5 h-5" />
            </button>

            {showMenu && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setShowMenu(false)}
                />
                <div className="absolute right-0 top-12 bg-white dark:bg-tg-secondary-bg rounded-xl shadow-lg z-20 py-2 min-w-[160px]">
                  <button
                    onClick={() => {
                      setShowMenu(false);
                      navigate(`/edit/${plant.id}`);
                    }}
                    className="w-full px-4 py-3 text-left flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    <Edit className="w-5 h-5 text-tg-hint" />
                    <span>Редактировать</span>
                  </button>
                  <button
                    onClick={() => {
                      setShowMenu(false);
                      handleDelete();
                    }}
                    className="w-full px-4 py-3 text-left flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-gray-700 text-red-500"
                  >
                    <Trash2 className="w-5 h-5" />
                    <span>Удалить</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mt-4">
          {[
            { id: 'chat', label: 'Чат', icon: '💬' },
            { id: 'care', label: 'Уход', icon: '🌱' },
            { id: 'history', label: 'История', icon: '📋' },
          ].map(({ id, label, icon }) => (
            <button
              key={id}
              onClick={() => handleTabChange(id as Tab)}
              className={`flex-1 py-2 px-3 rounded-xl text-sm font-medium transition-colors ${
                activeTab === id
                  ? 'bg-plant-green-100 text-plant-green-700 dark:bg-plant-green-900/30 dark:text-plant-green-400'
                  : 'bg-tg-secondary-bg text-tg-hint'
              }`}
            >
              <span className="mr-1">{icon}</span>
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        {activeTab === 'chat' && (
          <div className="space-y-2">
            {chatItems.length > 0 ? (
              chatItems.map(({ type, item }) => (
                <MessageBubble
                  key={item.id}
                  message={type === 'message' ? (item as PlantMessage) : undefined}
                  action={type === 'action' ? (item as CareAction) : undefined}
                  plantName={plant.nickname}
                  personality={plant.personality}
                />
              ))
            ) : (
              <div className="text-center py-12 text-tg-hint">
                <p>Пока нет сообщений</p>
                <p className="text-sm mt-2">Полейте растение, и оно напишет вам!</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'care' && (
          <div>
            {plant.species ? (
              <CareTipCard species={plant.species} />
            ) : (
              <div className="text-center py-12 text-tg-hint">
                <Info className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Советы по уходу недоступны</p>
                <p className="text-sm mt-2">
                  Выберите вид растения для получения рекомендаций
                </p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'history' && (
          <div className="space-y-3">
            {careHistory.length > 0 ? (
              careHistory.map((action) => (
                <MessageBubble
                  key={action.id}
                  action={action}
                  plantName={plant.nickname}
                  personality={plant.personality}
                />
              ))
            ) : (
              <div className="text-center py-12 text-tg-hint">
                <History className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>История ухода пуста</p>
                <p className="text-sm mt-2">Начните заботиться о растении!</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Fallback water button for non-Telegram browsers */}
      {!isTelegramWebApp && (
        <div className="px-4 py-4 border-t border-gray-100 safe-area-bottom">
          <button
            onClick={handleWater}
            disabled={isWatering}
            className={`w-full py-4 rounded-2xl font-medium flex items-center justify-center gap-3 transition-all ${
              status === 'ok'
                ? 'bg-tg-secondary-bg text-tg-text'
                : status === 'critical'
                ? 'bg-red-500 text-white animate-pulse'
                : 'bg-water-blue-500 text-white'
            } ${isWatering ? 'opacity-70' : 'active:scale-[0.98]'}`}
          >
            {isWatering ? (
              <LoadingSpinner size="sm" />
            ) : (
              <>
                <Droplets className="w-6 h-6" />
                <span>
                  {status === 'critical'
                    ? 'Срочно полить!'
                    : status === 'overdue'
                    ? 'Пора полить'
                    : status === 'soon'
                    ? 'Полить сейчас'
                    : 'Полить'}
                </span>
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
