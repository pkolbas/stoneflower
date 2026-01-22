import { useEffect, useRef } from 'react';

export function useTelegramBackButton(onBack: () => void) {
  const callbackRef = useRef(onBack);

  // Keep callback ref updated
  useEffect(() => {
    callbackRef.current = onBack;
  }, [onBack]);

  useEffect(() => {
    const webApp = window.Telegram?.WebApp;
    if (!webApp) return;

    const handleBack = () => {
      callbackRef.current();
    };

    // Remove any previous callback and add new one
    webApp.BackButton.onClick(handleBack);
    webApp.BackButton.show();

    return () => {
      webApp.BackButton.offClick(handleBack);
      webApp.BackButton.hide();
    };
  }, []); // Empty deps - callback ref handles updates
}
