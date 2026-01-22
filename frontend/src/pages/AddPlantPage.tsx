import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Search, Check, ChevronRight } from 'lucide-react';
import { useStore } from '@/hooks/useStore';
import LoadingSpinner from '@/components/LoadingSpinner';
import {
  useTelegramHaptic,
  useTelegramBackButton,
  useTelegramMainButton,
  useTelegramClosingConfirmation,
  useTelegram,
} from '@/hooks/telegram';
import * as api from '@/utils/api';
import type { PlantSpecies, PlantPersonality, PotSize } from '@/types';

type Step = 'species' | 'details' | 'personality';

const personalities: { id: PlantPersonality; emoji: string; name: string; desc: string }[] = [
  { id: 'FRIENDLY', emoji: '😊', name: 'Дружелюбный', desc: 'Общительный и позитивный' },
  { id: 'SHY', emoji: '😳', name: 'Застенчивый', desc: 'Тихий и скромный' },
  { id: 'DRAMATIC', emoji: '🎭', name: 'Драматичный', desc: 'Эмоциональный и яркий' },
  { id: 'WISE', emoji: '🧘', name: 'Мудрый', desc: 'Философский и спокойный' },
  { id: 'PLAYFUL', emoji: '🎉', name: 'Игривый', desc: 'Весёлый и энергичный' },
];

const potSizes: { id: PotSize; name: string; desc: string }[] = [
  { id: 'TINY', name: 'Крошечный', desc: 'до 8 см' },
  { id: 'SMALL', name: 'Маленький', desc: '8-12 см' },
  { id: 'MEDIUM', name: 'Средний', desc: '12-20 см' },
  { id: 'LARGE', name: 'Большой', desc: '20-30 см' },
  { id: 'XLARGE', name: 'Очень большой', desc: 'более 30 см' },
];

export default function AddPlantPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditMode = Boolean(id);
  const { isTelegramWebApp } = useTelegram();
  const haptic = useTelegramHaptic();
  const { species, isLoadingSpecies, fetchSpecies, createPlant, updatePlant } = useStore();

  const [step, setStep] = useState<Step>('species');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSpecies, setSelectedSpecies] = useState<PlantSpecies | null>(null);
  const [customSpecies, setCustomSpecies] = useState('');
  const [nickname, setNickname] = useState('');
  const [location, setLocation] = useState('');
  const [potSize, setPotSize] = useState<PotSize>('MEDIUM');
  const [personality, setPersonality] = useState<PlantPersonality>('FRIENDLY');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingPlant, setIsLoadingPlant] = useState(false);

  // Track if user has made changes (for closing confirmation)
  const hasUnsavedChanges = !isEditMode && (
    nickname.trim() !== '' ||
    selectedSpecies !== null ||
    customSpecies !== ''
  );

  // Enable closing confirmation when there are unsaved changes
  useTelegramClosingConfirmation(hasUnsavedChanges);

  useEffect(() => {
    fetchSpecies();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Load plant data when editing
  useEffect(() => {
    if (!id) return;

    async function loadPlant() {
      setIsLoadingPlant(true);
      try {
        const plant = await api.getPlant(id!);
        setNickname(plant.nickname);
        setLocation(plant.location || '');
        setPotSize(plant.potSize);
        setPersonality(plant.personality);
        setCustomSpecies(plant.customSpecies || '');
        if (plant.species) {
          setSelectedSpecies(plant.species);
        }
        // Skip to details step in edit mode
        setStep('details');
      } catch {
        haptic('error');
        navigate('/');
      } finally {
        setIsLoadingPlant(false);
      }
    }

    loadPlant();
  }, [id, navigate, haptic]);

  // BackButton handler
  const handleBack = useCallback(() => {
    if (step === 'details') {
      if (isEditMode) {
        navigate(`/plant/${id}`);
      } else {
        setStep('species');
      }
    } else if (step === 'personality') {
      setStep('details');
    } else {
      navigate('/');
    }
  }, [step, isEditMode, id, navigate]);

  // Use Telegram BackButton
  useTelegramBackButton(handleBack);

  const filteredSpecies = species.filter(
    (s) =>
      s.commonNameRu.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.scientificName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.commonNameEn?.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleSpeciesSelect = (sp: PlantSpecies) => {
    haptic('selection');
    setSelectedSpecies(sp);
    setNickname(sp.commonNameRu);
    setStep('details');
  };

  const handleCustomSpecies = () => {
    haptic('selection');
    setSelectedSpecies(null);
    setCustomSpecies(searchQuery);
    setNickname(searchQuery || 'Моё растение');
    setStep('details');
  };

  const handleDetailsNext = useCallback(() => {
    if (!nickname.trim()) {
      haptic('error');
      return;
    }
    haptic('selection');
    setStep('personality');
  }, [nickname, haptic]);

  const handleSubmit = useCallback(async () => {
    if (!nickname.trim()) {
      haptic('error');
      return;
    }

    haptic('medium');
    setIsSubmitting(true);

    try {
      if (isEditMode && id) {
        await updatePlant(id, {
          nickname: nickname.trim(),
          speciesId: selectedSpecies?.id,
          customSpecies: !selectedSpecies ? customSpecies : undefined,
          location: location.trim() || undefined,
          potSize,
          personality,
        });
        haptic('success');
        navigate(`/plant/${id}`);
      } else {
        const plant = await createPlant({
          nickname: nickname.trim(),
          speciesId: selectedSpecies?.id,
          customSpecies: !selectedSpecies ? customSpecies : undefined,
          location: location.trim() || undefined,
          potSize,
          personality,
        });
        haptic('success');
        navigate(`/plant/${plant.id}`);
      }
    } catch {
      haptic('error');
    } finally {
      setIsSubmitting(false);
    }
  }, [nickname, isEditMode, id, selectedSpecies, customSpecies, location, potSize, personality, haptic, updatePlant, createPlant, navigate]);

  // MainButton configuration
  const mainButtonConfig = useMemo(() => {
    if (step === 'species' || isLoadingPlant) return null;

    if (step === 'details') {
      return {
        text: 'Далее',
        onClick: handleDetailsNext,
        isEnabled: nickname.trim() !== '',
      };
    }

    // step === 'personality'
    return {
      text: isEditMode ? 'Сохранить' : 'Добавить растение',
      onClick: handleSubmit,
      isEnabled: !isSubmitting,
      showProgress: isSubmitting,
    };
  }, [step, isLoadingPlant, nickname, isEditMode, isSubmitting, handleDetailsNext, handleSubmit]);

  // Use Telegram MainButton
  useTelegramMainButton(mainButtonConfig);

  if (isLoadingPlant) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col safe-area-top">
      {/* Header */}
      <div className="px-4 py-4 border-b border-gray-100 dark:border-gray-700">
        <div className="flex items-center gap-4">
          <button
            onClick={handleBack}
            className="w-10 h-10 rounded-full bg-tg-secondary-bg flex items-center justify-center"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="font-semibold text-lg">
              {isEditMode ? 'Редактировать растение' : 'Добавить растение'}
            </h1>
            <p className="text-sm text-tg-hint">
              {step === 'species' && 'Шаг 1: Выберите вид'}
              {step === 'details' && (isEditMode ? 'Детали' : 'Шаг 2: Детали')}
              {step === 'personality' && (isEditMode ? 'Характер' : 'Шаг 3: Характер')}
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        {/* Step 1: Species selection */}
        {step === 'species' && (
          <div>
            {/* Search */}
            <div className="relative mb-4">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-tg-hint" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Поиск растения..."
                className="tg-input !pl-12"
              />
            </div>

            {/* Species list */}
            {isLoadingSpecies ? (
              <div className="flex justify-center py-8">
                <LoadingSpinner />
              </div>
            ) : (
              <div className="space-y-2">
                {filteredSpecies.map((sp) => (
                  <button
                    key={sp.id}
                    onClick={() => handleSpeciesSelect(sp)}
                    className="w-full tg-card flex items-center gap-3 text-left active:scale-[0.98] transition-transform"
                  >
                    <div className="w-12 h-12 rounded-xl bg-plant-green-100 flex items-center justify-center">
                      <span className="text-2xl">🌿</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{sp.commonNameRu}</p>
                      <p className="text-sm text-tg-hint truncate">{sp.scientificName}</p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-tg-hint" />
                  </button>
                ))}

                {/* Custom species option */}
                <button
                  onClick={handleCustomSpecies}
                  className="w-full tg-card flex items-center gap-3 text-left active:scale-[0.98] transition-transform border-2 border-dashed border-gray-200 dark:border-gray-600"
                >
                  <div className="w-12 h-12 rounded-xl bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                    <span className="text-2xl">🪴</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium">
                      {searchQuery ? `"${searchQuery}"` : 'Другое растение'}
                    </p>
                    <p className="text-sm text-tg-hint">Указать свой вид</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-tg-hint" />
                </button>
              </div>
            )}
          </div>
        )}

        {/* Step 2: Details */}
        {step === 'details' && (
          <div className="space-y-4">
            {/* Species info */}
            <div className="tg-card flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-plant-green-100 flex items-center justify-center">
                <span className="text-2xl">🌿</span>
              </div>
              <div className="flex-1">
                <p className="font-medium">
                  {selectedSpecies?.commonNameRu || customSpecies || 'Неизвестный вид'}
                </p>
                {selectedSpecies && (
                  <p className="text-sm text-tg-hint">{selectedSpecies.scientificName}</p>
                )}
              </div>
              <button
                onClick={() => setStep('species')}
                className="text-sm text-plant-green-600 font-medium"
              >
                Изменить
              </button>
            </div>

            {/* Nickname */}
            <div>
              <label className="block text-sm font-medium mb-2">Имя растения</label>
              <input
                type="text"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                placeholder="Как назовём?"
                className="tg-input"
              />
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-medium mb-2">Расположение</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Например: гостиная, у окна"
                className="tg-input"
              />
            </div>

            {/* Pot size */}
            <div>
              <label className="block text-sm font-medium mb-2">Размер горшка</label>
              <div className="grid grid-cols-2 gap-2">
                {potSizes.map((size) => (
                  <button
                    key={size.id}
                    onClick={() => {
                      haptic('selection');
                      setPotSize(size.id);
                    }}
                    className={`p-3 rounded-xl text-left transition-colors ${
                      potSize === size.id
                        ? 'bg-plant-green-100 border-2 border-plant-green-500 dark:bg-plant-green-900/30'
                        : 'bg-tg-secondary-bg border-2 border-transparent'
                    }`}
                  >
                    <p className="font-medium text-sm">{size.name}</p>
                    <p className="text-xs text-tg-hint">{size.desc}</p>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Personality */}
        {step === 'personality' && (
          <div>
            <p className="text-tg-hint mb-4">
              Выберите характер для вашего растения. Это повлияет на то, как оно будет "общаться" с вами!
            </p>

            <div className="space-y-3">
              {personalities.map((p) => (
                <button
                  key={p.id}
                  onClick={() => {
                    haptic('selection');
                    setPersonality(p.id);
                  }}
                  className={`w-full p-4 rounded-xl flex items-center gap-4 transition-colors ${
                    personality === p.id
                      ? 'bg-plant-green-100 border-2 border-plant-green-500 dark:bg-plant-green-900/30'
                      : 'bg-tg-secondary-bg border-2 border-transparent'
                  }`}
                >
                  <span className="text-3xl">{p.emoji}</span>
                  <div className="flex-1 text-left">
                    <p className="font-medium">{p.name}</p>
                    <p className="text-sm text-tg-hint">{p.desc}</p>
                  </div>
                  {personality === p.id && (
                    <Check className="w-6 h-6 text-plant-green-600" />
                  )}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Fallback bottom button for non-Telegram browsers */}
      {!isTelegramWebApp && (step === 'details' || step === 'personality') && (
        <div className="px-4 py-4 border-t border-gray-100 safe-area-bottom">
          <button
            onClick={step === 'details' ? handleDetailsNext : handleSubmit}
            disabled={!nickname.trim() || isSubmitting}
            className="tg-button w-full flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <LoadingSpinner size="sm" />
            ) : step === 'details' ? (
              <>
                <span>Далее</span>
                <ChevronRight className="w-5 h-5" />
              </>
            ) : (
              <>
                <Check className="w-5 h-5" />
                <span>{isEditMode ? 'Сохранить' : 'Добавить растение'}</span>
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
