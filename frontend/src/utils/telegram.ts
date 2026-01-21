// Telegram WebApp types
interface TelegramWebApp {
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
}

declare global {
  interface Window {
    Telegram?: {
      WebApp: TelegramWebApp;
    };
  }
}

export function getTelegramWebApp(): TelegramWebApp | null {
  return window.Telegram?.WebApp || null;
}

export function isTelegramWebApp(): boolean {
  return !!window.Telegram?.WebApp?.initData;
}

export function hapticFeedback(type: 'light' | 'medium' | 'heavy' | 'success' | 'error' | 'warning' | 'selection'): void {
  const webApp = getTelegramWebApp();
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
}

export function showMainButton(
  text: string,
  onClick: () => void,
  options?: { color?: string; textColor?: string }
): void {
  const webApp = getTelegramWebApp();
  if (!webApp) return;

  webApp.MainButton.setText(text);
  if (options?.color) {
    webApp.MainButton.setParams({ color: options.color });
  }
  if (options?.textColor) {
    webApp.MainButton.setParams({ text_color: options.textColor });
  }
  webApp.MainButton.onClick(onClick);
  webApp.MainButton.show();
}

export function hideMainButton(): void {
  const webApp = getTelegramWebApp();
  if (!webApp) return;
  webApp.MainButton.hide();
}

export function showBackButton(onClick: () => void): void {
  const webApp = getTelegramWebApp();
  if (!webApp) return;
  webApp.BackButton.onClick(onClick);
  webApp.BackButton.show();
}

export function hideBackButton(): void {
  const webApp = getTelegramWebApp();
  if (!webApp) return;
  webApp.BackButton.hide();
}

export function expandApp(): void {
  const webApp = getTelegramWebApp();
  if (!webApp) return;
  webApp.expand();
}

export function closeApp(): void {
  const webApp = getTelegramWebApp();
  if (!webApp) return;
  webApp.close();
}

export function showAlert(message: string): Promise<void> {
  return new Promise((resolve) => {
    const webApp = getTelegramWebApp();
    if (!webApp) {
      alert(message);
      resolve();
      return;
    }
    webApp.showAlert(message, resolve);
  });
}

export function showConfirm(message: string): Promise<boolean> {
  return new Promise((resolve) => {
    const webApp = getTelegramWebApp();
    if (!webApp) {
      resolve(confirm(message));
      return;
    }
    webApp.showConfirm(message, resolve);
  });
}

export function getColorScheme(): 'light' | 'dark' {
  const webApp = getTelegramWebApp();
  return webApp?.colorScheme || 'light';
}

export function initTelegramApp(): void {
  const webApp = getTelegramWebApp();
  if (!webApp) return;

  // Mark app as ready
  webApp.ready();

  // Expand to full height
  webApp.expand();

  // Set app colors
  webApp.setHeaderColor('#22c55e');
  webApp.setBackgroundColor('#ffffff');
}
