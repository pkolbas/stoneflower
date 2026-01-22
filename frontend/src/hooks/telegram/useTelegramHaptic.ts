import { useCallback } from 'react';

export type HapticType = 'light' | 'medium' | 'heavy' | 'success' | 'error' | 'warning' | 'selection';

export function useTelegramHaptic() {
  const trigger = useCallback((type: HapticType) => {
    const webApp = window.Telegram?.WebApp;
    if (!webApp) return;

    try {
      switch (type) {
        case 'light':
        case 'medium':
        case 'heavy':
          webApp.HapticFeedback.impactOccurred(type);
          break;
        case 'success':
        case 'error':
        case 'warning':
          webApp.HapticFeedback.notificationOccurred(type);
          break;
        case 'selection':
          webApp.HapticFeedback.selectionChanged();
          break;
      }
    } catch {
      // Haptic feedback not available
    }
  }, []);

  return trigger;
}
