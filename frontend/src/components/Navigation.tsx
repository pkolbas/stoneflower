import { useLocation, useNavigate } from 'react-router-dom';
import { Home, Plus, Settings } from 'lucide-react';
import { useTelegramHaptic } from '@/hooks/telegram';

export default function Navigation() {
  const location = useLocation();
  const navigate = useNavigate();
  const haptic = useTelegramHaptic();

  const navItems = [
    { path: '/', icon: Home, label: 'Главная' },
    { path: '/add', icon: Plus, label: 'Добавить' },
    { path: '/settings', icon: Settings, label: 'Настройки' },
  ];

  const handleNavClick = (path: string) => {
    haptic('light');
    navigate(path);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-tg-bg border-t border-gray-200 safe-area-bottom">
      <div className="flex items-center justify-around py-2">
        {navItems.map(({ path, icon: Icon, label }) => {
          const isActive = location.pathname === path;

          return (
            <button
              key={path}
              onClick={() => handleNavClick(path)}
              className={`flex flex-col items-center py-2 px-6 rounded-xl transition-colors duration-200 ${
                isActive
                  ? 'text-plant-green-600'
                  : 'text-gray-500 active:bg-gray-100'
              }`}
            >
              <Icon
                className={`w-6 h-6 ${isActive ? 'stroke-[2.5]' : ''}`}
              />
              <span className="text-xs mt-1 font-medium">{label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
