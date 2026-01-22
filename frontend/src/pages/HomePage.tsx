import { useNavigate } from 'react-router-dom';
import { Plus, Droplets, Leaf } from 'lucide-react';
import { useStore } from '@/hooks/useStore';
import PlantCard from '@/components/PlantCard';
import LoadingSpinner from '@/components/LoadingSpinner';
import { useTelegramHaptic } from '@/hooks/telegram';

export default function HomePage() {
  const navigate = useNavigate();
  const haptic = useTelegramHaptic();
  const { plants, isLoadingPlants, user } = useStore();

  // Calculate stats
  const plantsNeedingWater = plants.filter(
    (p) => p.wateringStatus?.status === 'soon' ||
           p.wateringStatus?.status === 'overdue' ||
           p.wateringStatus?.status === 'critical'
  );

  const handleAddPlant = () => {
    haptic('light');
    navigate('/add');
  };

  if (isLoadingPlants) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="flex-1 px-4 py-6 safe-area-top">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <span className="animate-wave inline-block">🌿</span>
          <span>Stoneflower</span>
        </h1>
        {user && (
          <p className="text-tg-hint mt-1">
            Привет, {user.firstName || user.username || 'друг'}!
          </p>
        )}
      </div>

      {/* Quick stats */}
      {plants.length > 0 && (
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="tg-card flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-plant-green-100 flex items-center justify-center">
              <Leaf className="w-6 h-6 text-plant-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{plants.length}</p>
              <p className="text-xs text-tg-hint">
                {plants.length === 1 ? 'растение' :
                 plants.length < 5 ? 'растения' : 'растений'}
              </p>
            </div>
          </div>

          <div className="tg-card flex items-center gap-3">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
              plantsNeedingWater.length > 0 ? 'bg-water-blue-100' : 'bg-gray-100'
            }`}>
              <Droplets className={`w-6 h-6 ${
                plantsNeedingWater.length > 0 ? 'text-water-blue-500' : 'text-gray-400'
              }`} />
            </div>
            <div>
              <p className="text-2xl font-bold">{plantsNeedingWater.length}</p>
              <p className="text-xs text-tg-hint">ждут полива</p>
            </div>
          </div>
        </div>
      )}

      {/* Plants needing water first */}
      {plantsNeedingWater.length > 0 && (
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <span>💧</span>
            <span>Нужен полив</span>
          </h2>
          <div className="space-y-3">
            {plantsNeedingWater.map((plant) => (
              <PlantCard key={plant.id} plant={plant} />
            ))}
          </div>
        </div>
      )}

      {/* All plants */}
      {plants.length > 0 ? (
        <div>
          <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <span>🪴</span>
            <span>Все растения</span>
          </h2>
          <div className="space-y-3">
            {plants
              .filter((p) => !plantsNeedingWater.includes(p))
              .map((plant) => (
                <PlantCard key={plant.id} plant={plant} />
              ))}
          </div>
        </div>
      ) : (
        // Empty state
        <div className="flex-1 flex flex-col items-center justify-center py-12">
          <div className="w-24 h-24 rounded-full bg-plant-green-100 flex items-center justify-center mb-6 animate-float">
            <span className="text-5xl">🌱</span>
          </div>
          <h2 className="text-xl font-semibold mb-2">Пока пусто</h2>
          <p className="text-tg-hint text-center mb-6 max-w-xs">
            Добавьте своё первое растение и начните получать напоминания о поливе!
          </p>
          <button
            onClick={handleAddPlant}
            className="tg-button flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            <span>Добавить растение</span>
          </button>
        </div>
      )}

      {/* Floating add button when there are plants */}
      {plants.length > 0 && (
        <button
          onClick={handleAddPlant}
          className="fixed bottom-24 right-4 w-14 h-14 rounded-full bg-plant-green-500 text-white shadow-lg flex items-center justify-center active:scale-95 transition-transform"
        >
          <Plus className="w-7 h-7" />
        </button>
      )}
    </div>
  );
}
