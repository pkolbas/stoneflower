export function formatDistanceToNow(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 1) {
    return 'только что';
  }

  if (diffMins < 60) {
    return `${diffMins} мин. назад`;
  }

  if (diffHours < 24) {
    return `${diffHours} ч. назад`;
  }

  if (diffDays === 1) {
    return 'вчера';
  }

  if (diffDays < 7) {
    return `${diffDays} дн. назад`;
  }

  // Format as date
  return date.toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'short',
  });
}

export function formatDate(date: Date): string {
  return date.toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export function formatTime(date: Date): string {
  return date.toLocaleTimeString('ru-RU', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function getDaysDifference(date1: Date, date2: Date): number {
  const diffMs = date1.getTime() - date2.getTime();
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
}
