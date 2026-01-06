import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getDayOfWeek(date: Date): string {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return days[date.getDay()];
}

interface WeightLog {
  weight: number;
  date: string;
}

interface WeightTrend {
  current: number;
  sevenDayAvg: number;
  trend: 'up' | 'down' | 'stable';
}

export function calculateWeightTrend(logs: WeightLog[]): WeightTrend {
  if (logs.length === 0) {
    return { current: 0, sevenDayAvg: 0, trend: 'stable' };
  }

  const sortedLogs = [...logs].sort((a, b) =>
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const current = sortedLogs[0]?.weight || 0;

  const recentLogs = sortedLogs.slice(0, 7);
  const sevenDayAvg = recentLogs.length > 0
    ? recentLogs.reduce((sum, log) => sum + log.weight, 0) / recentLogs.length
    : 0;

  let trend: 'up' | 'down' | 'stable' = 'stable';
  if (recentLogs.length >= 2) {
    const oldAvg = sortedLogs.slice(7, 14).reduce((sum, log) => sum + log.weight, 0) /
                   Math.max(sortedLogs.slice(7, 14).length, 1);
    if (oldAvg > 0) {
      const diff = sevenDayAvg - oldAvg;
      if (diff > 0.5) trend = 'up';
      else if (diff < -0.5) trend = 'down';
    }
  }

  return {
    current: Math.round(current * 10) / 10,
    sevenDayAvg: Math.round(sevenDayAvg * 10) / 10,
    trend,
  };
}
