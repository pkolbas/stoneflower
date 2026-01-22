import { useCallback } from 'react';

export function useTelegramPopup() {
  const showAlert = useCallback(async (message: string): Promise<void> => {
    const webApp = window.Telegram?.WebApp;

    if (!webApp) {
      alert(message);
      return;
    }

    return new Promise((resolve) => {
      webApp.showAlert(message, resolve);
    });
  }, []);

  const showConfirm = useCallback(async (message: string): Promise<boolean> => {
    const webApp = window.Telegram?.WebApp;

    if (!webApp) {
      return confirm(message);
    }

    return new Promise((resolve) => {
      webApp.showConfirm(message, resolve);
    });
  }, []);

  return { showAlert, showConfirm };
}
