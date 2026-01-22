import { useEffect, useRef } from 'react';

interface MainButtonOptions {
  text: string;
  onClick: () => void;
  isEnabled?: boolean;
  showProgress?: boolean;
  color?: string;
  textColor?: string;
}

export function useTelegramMainButton(options: MainButtonOptions | null) {
  const callbackRef = useRef(options?.onClick);

  // Keep callback ref updated
  useEffect(() => {
    callbackRef.current = options?.onClick;
  }, [options?.onClick]);

  useEffect(() => {
    const webApp = window.Telegram?.WebApp;
    if (!webApp) return;

    if (!options) {
      webApp.MainButton.hide();
      return;
    }

    const { text, isEnabled = true, showProgress = false, color, textColor } = options;

    const handleClick = () => {
      callbackRef.current?.();
    };

    // Set button params
    webApp.MainButton.setParams({
      text,
      is_active: isEnabled,
      is_visible: true,
      ...(color && { color }),
      ...(textColor && { text_color: textColor }),
    });

    // Handle progress indicator
    if (showProgress) {
      webApp.MainButton.showProgress(true);
    } else {
      webApp.MainButton.hideProgress();
    }

    // Enable/disable
    if (isEnabled) {
      webApp.MainButton.enable();
    } else {
      webApp.MainButton.disable();
    }

    webApp.MainButton.onClick(handleClick);
    webApp.MainButton.show();

    return () => {
      webApp.MainButton.offClick(handleClick);
      webApp.MainButton.hide();
      webApp.MainButton.hideProgress();
    };
  }, [options?.text, options?.isEnabled, options?.showProgress, options?.color, options?.textColor]);
}
