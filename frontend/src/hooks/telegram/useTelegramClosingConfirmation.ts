import { useEffect } from 'react';

export function useTelegramClosingConfirmation(enabled: boolean) {
  useEffect(() => {
    const webApp = window.Telegram?.WebApp;
    if (!webApp) return;

    if (enabled) {
      webApp.enableClosingConfirmation();
    } else {
      webApp.disableClosingConfirmation();
    }

    return () => {
      webApp.disableClosingConfirmation();
    };
  }, [enabled]);
}
