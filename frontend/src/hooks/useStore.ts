import { create } from 'zustand';
import type { Plant, PlantSpecies, User, PlantMessage, CareAction } from '@/types';
import * as api from '@/utils/api';

interface AppState {
  // User
  user: User | null;
  isLoadingUser: boolean;

  // Plants
  plants: Plant[];
  selectedPlant: Plant | null;
  isLoadingPlants: boolean;

  // Species
  species: PlantSpecies[];
  isLoadingSpecies: boolean;

  // Messages
  messages: PlantMessage[];
  isLoadingMessages: boolean;

  // Care history
  careHistory: CareAction[];
  isLoadingCareHistory: boolean;

  // Error handling
  error: string | null;

  // Actions
  fetchUser: () => Promise<void>;
  fetchPlants: () => Promise<void>;
  fetchPlant: (id: string) => Promise<void>;
  createPlant: (data: api.CreatePlantDto) => Promise<Plant>;
  updatePlant: (id: string, data: api.UpdatePlantDto) => Promise<void>;
  deletePlant: (id: string) => Promise<void>;
  waterPlant: (id: string) => Promise<void>;
  fetchSpecies: () => Promise<void>;
  fetchMessages: (plantId: string) => Promise<void>;
  fetchCareHistory: (plantId: string) => Promise<void>;
  setSelectedPlant: (plant: Plant | null) => void;
  clearError: () => void;
}

export const useStore = create<AppState>((set, get) => ({
  // Initial state
  user: null,
  isLoadingUser: false,
  plants: [],
  selectedPlant: null,
  isLoadingPlants: false,
  species: [],
  isLoadingSpecies: false,
  messages: [],
  isLoadingMessages: false,
  careHistory: [],
  isLoadingCareHistory: false,
  error: null,

  // Actions
  fetchUser: async () => {
    set({ isLoadingUser: true, error: null });
    try {
      const user = await api.getCurrentUser();
      set({ user, isLoadingUser: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to fetch user',
        isLoadingUser: false
      });
    }
  },

  fetchPlants: async () => {
    set({ isLoadingPlants: true, error: null });
    try {
      const plants = await api.getPlants();
      set({ plants, isLoadingPlants: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to fetch plants',
        isLoadingPlants: false
      });
    }
  },

  fetchPlant: async (id: string) => {
    set({ isLoadingPlants: true, error: null });
    try {
      const plant = await api.getPlant(id);
      set({ selectedPlant: plant, isLoadingPlants: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to fetch plant',
        isLoadingPlants: false
      });
    }
  },

  createPlant: async (data) => {
    set({ error: null });
    try {
      const plant = await api.createPlant(data);
      set((state) => ({ plants: [plant, ...state.plants] }));
      return plant;
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to create plant',
      });
      throw error;
    }
  },

  updatePlant: async (id, data) => {
    set({ error: null });
    try {
      const plant = await api.updatePlant(id, data);
      set((state) => ({
        plants: state.plants.map((p) => (p.id === id ? plant : p)),
        selectedPlant: state.selectedPlant?.id === id ? plant : state.selectedPlant,
      }));
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to update plant',
      });
      throw error;
    }
  },

  deletePlant: async (id) => {
    set({ error: null });
    try {
      await api.deletePlant(id);
      set((state) => ({
        plants: state.plants.filter((p) => p.id !== id),
        selectedPlant: state.selectedPlant?.id === id ? null : state.selectedPlant,
      }));
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to delete plant',
      });
      throw error;
    }
  },

  waterPlant: async (id) => {
    set({ error: null });
    try {
      await api.recordCareAction(id, { actionType: 'WATERING' });
      // Refetch plant to get updated data
      const plant = await api.getPlant(id);
      set((state) => ({
        plants: state.plants.map((p) => (p.id === id ? plant : p)),
        selectedPlant: state.selectedPlant?.id === id ? plant : state.selectedPlant,
      }));
      // Also fetch new messages
      const messages = await api.getPlantMessages(id);
      if (get().selectedPlant?.id === id) {
        set({ messages });
      }
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to water plant',
      });
      throw error;
    }
  },

  fetchSpecies: async () => {
    set({ isLoadingSpecies: true, error: null });
    try {
      const species = await api.getSpecies();
      set({ species, isLoadingSpecies: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to fetch species',
        isLoadingSpecies: false
      });
    }
  },

  fetchMessages: async (plantId: string) => {
    set({ isLoadingMessages: true, error: null });
    try {
      const messages = await api.getPlantMessages(plantId);
      set({ messages, isLoadingMessages: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to fetch messages',
        isLoadingMessages: false
      });
    }
  },

  fetchCareHistory: async (plantId: string) => {
    set({ isLoadingCareHistory: true, error: null });
    try {
      const careHistory = await api.getCareHistory(plantId);
      set({ careHistory, isLoadingCareHistory: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to fetch care history',
        isLoadingCareHistory: false
      });
    }
  },

  setSelectedPlant: (plant) => {
    set({ selectedPlant: plant, messages: [], careHistory: [] });
  },

  clearError: () => {
    set({ error: null });
  },
}));

export type { CreatePlantDto, UpdatePlantDto } from '@/utils/api';
