import { useState } from 'react';
import { Bell, BellOff, Clock, Globe, Info, ExternalLink } from 'lucide-react';
import { useStore } from '@/hooks/useStore';
import { useTelegramHaptic, useTelegramLinks } from '@/hooks/telegram';
import * as api from '@/utils/api';

const timezones = [
  { id: 'Europe/Moscow', name: 'Москва (UTC+3)' },
  { id: 'Europe/Kaliningrad', name: 'Калининград (UTC+2)' },
  { id: 'Europe/Samara', name: 'Самара (UTC+4)' },
  { id: 'Asia/Yekaterinburg', name: 'Екатеринбург (UTC+5)' },
  { id: 'Asia/Omsk', name: 'Омск (UTC+6)' },
  { id: 'Asia/Krasnoyarsk', name: 'Красноярск (UTC+7)' },
  { id: 'Asia/Irkutsk', name: 'Иркутск (UTC+8)' },
  { id: 'Asia/Yakutsk', name: 'Якутск (UTC+9)' },
  { id: 'Asia/Vladivostok', name: 'Владивосток (UTC+10)' },
  { id: 'Asia/Kamchatka', name: 'Камчатка (UTC+12)' },
];

export default function SettingsPage() {
  const { user, fetchUser } = useStore();
  const haptic = useTelegramHaptic();
  const { openLink, openTelegramLink } = useTelegramLinks();
  const [isSaving, setIsSaving] = useState(false);
  const [showTimezoneModal, setShowTimezoneModal] = useState(false);

  const handleToggleNotifications = async () => {
    if (!user) return;

    haptic('medium');
    setIsSaving(true);

    try {
      await api.updateUserSettings({
        notificationsEnabled: !user.notificationsEnabled,
      });
      await fetchUser();
      haptic('success');
    } catch {
      haptic('error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleTimezoneChange = async (timezone: string) => {
    if (!user) return;

    haptic('selection');
    setShowTimezoneModal(false);
    setIsSaving(true);

    try {
      await api.updateUserSettings({ timezone });
      await fetchUser();
      haptic('success');
    } catch {
      haptic('error');
    } finally {
      setIsSaving(false);
    }
  };

  const currentTimezone = timezones.find((tz) => tz.id === user?.timezone) || timezones[0];

  return (
    <div className="flex-1 px-4 py-6 safe-area-top">
      <h1 className="text-2xl font-bold mb-6">Настройки</h1>

      {/* Notifications */}
      <div className="space-y-4">
        <h2 className="text-sm font-medium text-tg-hint uppercase tracking-wide">
          Уведомления
        </h2>

        <button
          onClick={handleToggleNotifications}
          disabled={isSaving}
          className="w-full tg-card flex items-center gap-4"
        >
          <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
            user?.notificationsEnabled ? 'bg-plant-green-100' : 'bg-gray-100'
          }`}>
            {user?.notificationsEnabled ? (
              <Bell className="w-6 h-6 text-plant-green-600" />
            ) : (
              <BellOff className="w-6 h-6 text-gray-400" />
            )}
          </div>
          <div className="flex-1 text-left">
            <p className="font-medium">Напоминания о поливе</p>
            <p className="text-sm text-tg-hint">
              {user?.notificationsEnabled ? 'Включены' : 'Отключены'}
            </p>
          </div>
          <div
            className={`w-12 h-7 rounded-full transition-colors ${
              user?.notificationsEnabled ? 'bg-plant-green-500' : 'bg-gray-300'
            }`}
          >
            <div
              className={`w-6 h-6 rounded-full bg-white shadow-sm transform transition-transform mt-0.5 ml-0.5 ${
                user?.notificationsEnabled ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </div>
        </button>

        <p className="text-sm text-tg-hint px-1">
          Бот будет отправлять напоминания в 9:00 и 18:00 по вашему времени
        </p>
      </div>

      {/* Timezone */}
      <div className="space-y-4 mt-8">
        <h2 className="text-sm font-medium text-tg-hint uppercase tracking-wide">
          Часовой пояс
        </h2>

        <button
          onClick={() => {
            haptic('light');
            setShowTimezoneModal(true);
          }}
          className="w-full tg-card flex items-center gap-4"
        >
          <div className="w-12 h-12 rounded-full bg-water-blue-100 flex items-center justify-center">
            <Clock className="w-6 h-6 text-water-blue-500" />
          </div>
          <div className="flex-1 text-left">
            <p className="font-medium">Часовой пояс</p>
            <p className="text-sm text-tg-hint">{currentTimezone.name}</p>
          </div>
          <Globe className="w-5 h-5 text-tg-hint" />
        </button>
      </div>

      {/* About */}
      <div className="space-y-4 mt-8">
        <h2 className="text-sm font-medium text-tg-hint uppercase tracking-wide">
          О приложении
        </h2>

        <div className="tg-card">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-full bg-plant-green-100 flex items-center justify-center">
              <span className="text-2xl">🌿</span>
            </div>
            <div>
              <p className="font-semibold">Stoneflower</p>
              <p className="text-sm text-tg-hint">Версия 1.0.0</p>
            </div>
          </div>

          <p className="text-sm text-tg-hint mb-4">
            Ваш персональный помощник по уходу за комнатными растениями.
            Растения "общаются" с вами и напоминают о поливе!
          </p>

          <div className="flex gap-2">
            <button
              onClick={() => openTelegramLink('https://t.me/stoneflower_support')}
              className="flex-1 py-2 px-4 rounded-xl bg-tg-secondary-bg text-center text-sm font-medium flex items-center justify-center gap-2"
            >
              <Info className="w-4 h-4" />
              Поддержка
            </button>
            <button
              onClick={() => openLink('https://github.com/stoneflower')}
              className="flex-1 py-2 px-4 rounded-xl bg-tg-secondary-bg text-center text-sm font-medium flex items-center justify-center gap-2"
            >
              <ExternalLink className="w-4 h-4" />
              GitHub
            </button>
          </div>
        </div>
      </div>

      {/* Timezone modal */}
      {showTimezoneModal && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50">
          <div className="bg-white dark:bg-tg-secondary-bg w-full max-h-[70vh] rounded-t-3xl overflow-hidden animate-slide-up">
            <div className="px-4 py-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
              <h3 className="font-semibold text-lg">Часовой пояс</h3>
              <button
                onClick={() => setShowTimezoneModal(false)}
                className="text-tg-link font-medium"
              >
                Готово
              </button>
            </div>
            <div className="overflow-y-auto max-h-[60vh]">
              {timezones.map((tz) => (
                <button
                  key={tz.id}
                  onClick={() => handleTimezoneChange(tz.id)}
                  className={`w-full px-4 py-4 text-left border-b border-gray-50 dark:border-gray-700 flex items-center justify-between ${
                    user?.timezone === tz.id ? 'bg-plant-green-50 dark:bg-plant-green-900/20' : ''
                  }`}
                >
                  <span>{tz.name}</span>
                  {user?.timezone === tz.id && (
                    <span className="text-plant-green-600">✓</span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
