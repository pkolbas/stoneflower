import { useCallback } from 'react';

export function useTelegramLinks() {
  const openLink = useCallback((url: string, options?: { tryInstantView?: boolean }) => {
    const webApp = window.Telegram?.WebApp;

    if (webApp) {
      webApp.openLink(url, { try_instant_view: options?.tryInstantView });
    } else {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  }, []);

  const openTelegramLink = useCallback((url: string) => {
    const webApp = window.Telegram?.WebApp;

    if (webApp) {
      webApp.openTelegramLink(url);
    } else {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  }, []);

  return { openLink, openTelegramLink };
}
