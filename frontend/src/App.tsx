import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useStore } from '@/hooks/useStore';
import { initTelegramApp } from '@/utils/telegram';
import HomePage from '@/pages/HomePage';
import PlantPage from '@/pages/PlantPage';
import AddPlantPage from '@/pages/AddPlantPage';
import SettingsPage from '@/pages/SettingsPage';
import Navigation from '@/components/Navigation';
import LoadingSpinner from '@/components/LoadingSpinner';

function App() {
  const { fetchUser, fetchPlants, fetchSpecies, isLoadingUser, isLoadingPlants, user, plants, error, clearError } = useStore();

  useEffect(() => {
    // Initialize Telegram WebApp
    initTelegramApp();

    // Fetch initial data
    fetchUser();
    fetchPlants();
    fetchSpecies();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Show loading state only on initial load, not on subsequent refreshes
  const isInitialLoading = (isLoadingUser && !user) || (isLoadingPlants && plants.length === 0);
  if (isInitialLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-tg-bg">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <BrowserRouter>
      {/* Error toast */}
      {error && (
        <div className="fixed top-4 left-4 right-4 z-50 bg-red-500 text-white px-4 py-3 rounded-xl shadow-lg">
          <div className="flex items-center justify-between">
            <span>{error}</span>
            <button onClick={clearError} className="ml-4 font-bold">×</button>
          </div>
        </div>
      )}

      <div className="min-h-screen flex flex-col bg-tg-bg pb-20">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/plant/:id" element={<PlantPage />} />
          <Route path="/add" element={<AddPlantPage />} />
          <Route path="/edit/:id" element={<AddPlantPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>

        <Navigation />
      </div>
    </BrowserRouter>
  );
}

export default App;
