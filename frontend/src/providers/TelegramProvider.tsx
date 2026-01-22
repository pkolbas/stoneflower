import { useEffect, useState, createContext, useContext, ReactNode } from 'react';

interface TelegramContextValue {
  isReady: boolean;
  colorScheme: 'light' | 'dark';
  isTelegramWebApp: boolean;
}

const TelegramContext = createContext<TelegramContextValue>({
  isReady: false,
  colorScheme: 'light',
  isTelegramWebApp: false,
});

export function useTelegram() {
  return useContext(TelegramContext);
}

interface TelegramProviderProps {
  children: ReactNode;
}

export function TelegramProvider({ children }: TelegramProviderProps) {
  const [isReady, setIsReady] = useState(false);
  const [colorScheme, setColorScheme] = useState<'light' | 'dark'>('light');
  const [isTelegramWebApp, setIsTelegramWebApp] = useState(false);

  useEffect(() => {
    const webApp = window.Telegram?.WebApp;

    if (!webApp) {
      // Not running in Telegram - still mark as ready for browser testing
      setIsReady(true);
      return;
    }

    try {
      // Mark app as ready
      webApp.ready();

      // Expand to full height
      webApp.expand();

      // Apply theme params to CSS variables
      applyThemeParams(webApp);

      // Set header color based on theme
      const bgColor = webApp.themeParams.button_color || '#22c55e';
      webApp.setHeaderColor(bgColor);

      // Set background color based on theme
      const themeBgColor = webApp.themeParams.bg_color ||
        (webApp.colorScheme === 'dark' ? '#1a1a1a' : '#ffffff');
      webApp.setBackgroundColor(themeBgColor);

      setIsTelegramWebApp(true);
      setColorScheme(webApp.colorScheme || 'light');
      setIsReady(true);

      // Listen for theme changes
      const handleThemeChanged = () => {
        if (window.Telegram?.WebApp) {
          setColorScheme(window.Telegram.WebApp.colorScheme);
          applyThemeParams(window.Telegram.WebApp);
        }
      };

      webApp.onEvent?.('themeChanged', handleThemeChanged);

      return () => {
        webApp.offEvent?.('themeChanged', handleThemeChanged);
      };
    } catch (error) {
      console.warn('Telegram WebApp initialization failed:', error);
      setIsReady(true);
    }
  }, []);

  // Apply dark mode class to document
  useEffect(() => {
    document.documentElement.classList.toggle('dark', colorScheme === 'dark');
  }, [colorScheme]);

  return (
    <TelegramContext.Provider value={{ isReady, colorScheme, isTelegramWebApp }}>
      {children}
    </TelegramContext.Provider>
  );
}

function applyThemeParams(webApp: NonNullable<Window['Telegram']>['WebApp']) {
  const { themeParams } = webApp;
  const root = document.documentElement;

  if (themeParams.bg_color) {
    root.style.setProperty('--tg-theme-bg-color', themeParams.bg_color);
  }
  if (themeParams.text_color) {
    root.style.setProperty('--tg-theme-text-color', themeParams.text_color);
  }
  if (themeParams.hint_color) {
    root.style.setProperty('--tg-theme-hint-color', themeParams.hint_color);
  }
  if (themeParams.link_color) {
    root.style.setProperty('--tg-theme-link-color', themeParams.link_color);
  }
  if (themeParams.button_color) {
    root.style.setProperty('--tg-theme-button-color', themeParams.button_color);
  }
  if (themeParams.button_text_color) {
    root.style.setProperty('--tg-theme-button-text-color', themeParams.button_text_color);
  }
  if (themeParams.secondary_bg_color) {
    root.style.setProperty('--tg-theme-secondary-bg-color', themeParams.secondary_bg_color);
  }
}

// Re-export type for global Window augmentation
declare global {
  interface Window {
    Telegram?: {
      WebApp: {
        initData: string;
        initDataUnsafe: {
          user?: {
            id: number;
            first_name: string;
            last_name?: string;
            username?: string;
            language_code?: string;
            is_premium?: boolean;
          };
          auth_date: number;
          hash: string;
        };
        version: string;
        platform: string;
        colorScheme: 'light' | 'dark';
        themeParams: {
          bg_color?: string;
          text_color?: string;
          hint_color?: string;
          link_color?: string;
          button_color?: string;
          button_text_color?: string;
          secondary_bg_color?: string;
        };
        isExpanded: boolean;
        viewportHeight: number;
        viewportStableHeight: number;
        headerColor: string;
        backgroundColor: string;
        isClosingConfirmationEnabled: boolean;
        BackButton: {
          isVisible: boolean;
          onClick: (callback: () => void) => void;
          offClick: (callback: () => void) => void;
          show: () => void;
          hide: () => void;
        };
        MainButton: {
          text: string;
          color: string;
          textColor: string;
          isVisible: boolean;
          isActive: boolean;
          isProgressVisible: boolean;
          setText: (text: string) => void;
          onClick: (callback: () => void) => void;
          offClick: (callback: () => void) => void;
          show: () => void;
          hide: () => void;
          enable: () => void;
          disable: () => void;
          showProgress: (leaveActive?: boolean) => void;
          hideProgress: () => void;
          setParams: (params: {
            text?: string;
            color?: string;
            text_color?: string;
            is_active?: boolean;
            is_visible?: boolean;
          }) => void;
        };
        HapticFeedback: {
          impactOccurred: (style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft') => void;
          notificationOccurred: (type: 'error' | 'success' | 'warning') => void;
          selectionChanged: () => void;
        };
        close: () => void;
        expand: () => void;
        ready: () => void;
        setHeaderColor: (color: string) => void;
        setBackgroundColor: (color: string) => void;
        enableClosingConfirmation: () => void;
        disableClosingConfirmation: () => void;
        showPopup: (params: {
          title?: string;
          message: string;
          buttons?: Array<{
            id?: string;
            type?: 'default' | 'ok' | 'close' | 'cancel' | 'destructive';
            text?: string;
          }>;
        }, callback?: (buttonId: string) => void) => void;
        showAlert: (message: string, callback?: () => void) => void;
        showConfirm: (message: string, callback?: (confirmed: boolean) => void) => void;
        openLink: (url: string, options?: { try_instant_view?: boolean }) => void;
        openTelegramLink: (url: string) => void;
        sendData: (data: string) => void;
        onEvent?: (event: string, callback: () => void) => void;
        offEvent?: (event: string, callback: () => void) => void;
      };
    };
  }
}
