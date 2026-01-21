import type { Plant, PlantSpecies, User, CreatePlantDto, UpdatePlantDto, CareActionDto, PlantMessage, CareAction } from '@/types';

const API_BASE = '/api';

function getInitData(): string {
  // Get Telegram WebApp init data
  if (window.Telegram?.WebApp?.initData) {
    return window.Telegram.WebApp.initData;
  }
  return '';
}

async function fetchApi<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const initData = getInitData();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...((options.headers as Record<string, string>) || {}),
  };

  if (initData) {
    headers['X-Telegram-Init-Data'] = initData;
  } else if (import.meta.env.DEV) {
    // Development mode - use dev user
    headers['X-Dev-User-Id'] = '12345678';
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(error.error || `HTTP ${response.status}`);
  }

  if (response.status === 204) {
    return {} as T;
  }

  return response.json();
}

// User API
export async function getCurrentUser(): Promise<User> {
  const { user } = await fetchApi<{ user: User }>('/users/me');
  return user;
}

export async function updateUserSettings(settings: {
  timezone?: string;
  notificationsEnabled?: boolean;
  languageCode?: string;
}): Promise<User> {
  const { user } = await fetchApi<{ user: User }>('/users/me/settings', {
    method: 'PUT',
    body: JSON.stringify(settings),
  });
  return user;
}

// Plants API
export async function getPlants(includeArchived = false): Promise<Plant[]> {
  const { plants } = await fetchApi<{ plants: Plant[] }>(
    `/plants${includeArchived ? '?includeArchived=true' : ''}`
  );
  return plants;
}

export async function getPlant(id: string): Promise<Plant> {
  const { plant } = await fetchApi<{ plant: Plant }>(`/plants/${id}`);
  return plant;
}

export async function createPlant(data: CreatePlantDto): Promise<Plant> {
  const { plant } = await fetchApi<{ plant: Plant }>('/plants', {
    method: 'POST',
    body: JSON.stringify(data),
  });
  return plant;
}

export async function updatePlant(id: string, data: UpdatePlantDto): Promise<Plant> {
  const { plant } = await fetchApi<{ plant: Plant }>(`/plants/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
  return plant;
}

export async function deletePlant(id: string): Promise<void> {
  await fetchApi(`/plants/${id}`, {
    method: 'DELETE',
  });
}

export async function archivePlant(id: string): Promise<Plant> {
  const { plant } = await fetchApi<{ plant: Plant }>(`/plants/${id}/archive`, {
    method: 'POST',
  });
  return plant;
}

export async function getPlantsNeedingWater(): Promise<Plant[]> {
  const { plants } = await fetchApi<{ plants: Plant[] }>('/plants/needing-water');
  return plants;
}

// Care actions API
export async function recordCareAction(plantId: string, data: CareActionDto): Promise<CareAction> {
  const { action } = await fetchApi<{ action: CareAction }>(`/plants/${plantId}/care`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
  return action;
}

export async function getCareHistory(plantId: string, limit = 50): Promise<CareAction[]> {
  const { history } = await fetchApi<{ history: CareAction[] }>(
    `/plants/${plantId}/care?limit=${limit}`
  );
  return history;
}

// Messages API
export async function getPlantMessages(plantId: string, limit = 50): Promise<PlantMessage[]> {
  const { messages } = await fetchApi<{ messages: PlantMessage[] }>(
    `/plants/${plantId}/messages?limit=${limit}`
  );
  return messages;
}

export async function markMessagesAsRead(plantId: string): Promise<void> {
  await fetchApi(`/plants/${plantId}/messages/read`, {
    method: 'POST',
  });
}

// Species API
export async function getSpecies(): Promise<PlantSpecies[]> {
  const { species } = await fetchApi<{ species: PlantSpecies[] }>('/species');
  return species;
}

export async function searchSpecies(query: string): Promise<PlantSpecies[]> {
  const { species } = await fetchApi<{ species: PlantSpecies[] }>(
    `/species/search?q=${encodeURIComponent(query)}`
  );
  return species;
}

export async function getSpeciesById(id: string): Promise<PlantSpecies> {
  const { species } = await fetchApi<{ species: PlantSpecies }>(`/species/${id}`);
  return species;
}
