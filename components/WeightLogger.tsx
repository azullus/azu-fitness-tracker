'use client';

import { useState } from 'react';
import { TrendingUp, TrendingDown, Minus, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface WeightLoggerProps {
  person: 'Him' | 'Her';
  currentWeight: number;
  sevenDayAvg: number;
  trend: 'up' | 'down' | 'stable';
  onLog: (weight: number, notes?: string) => void;
}

export default function WeightLogger({
  person,
  currentWeight,
  sevenDayAvg,
  trend,
  onLog,
}: WeightLoggerProps) {
  const [weight, setWeight] = useState(currentWeight || 150);
  const [notes, setNotes] = useState('');
  const [showNotes, setShowNotes] = useState(false);

  const isHim = person === 'Him';
  const accentColor = isHim ? 'text-red-600' : 'text-purple-600';
  const bgColor = isHim ? 'bg-red-50' : 'bg-purple-50';

  const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus;

  function handleSubmit() {
    onLog(weight, notes || undefined);
    setNotes('');
    setShowNotes(false);
  }

  return (
    <div className={cn('card', bgColor)}>
      <div className="flex items-center justify-between mb-3">
        <h3 className={cn('font-semibold', accentColor)}>{person}</h3>
        <div className="flex items-center gap-1 text-sm text-gray-500">
          <TrendIcon className="w-4 h-4" />
          <span>7d avg: {sevenDayAvg} lbs</span>
        </div>
      </div>

      <div className="flex items-center justify-center gap-4 mb-3">
        <button
          onClick={() => setWeight((w) => Math.max(0, w - 0.5))}
          className="p-2 rounded-full bg-white shadow-sm hover:bg-gray-50"
        >
          <Minus className="w-5 h-5" />
        </button>

        <div className="text-center">
          <input
            type="number"
            value={weight}
            onChange={(e) => setWeight(parseFloat(e.target.value) || 0)}
            className="w-24 text-3xl font-bold text-center bg-transparent border-b-2 border-gray-300 focus:border-blue-500 outline-none"
            step="0.1"
          />
          <p className="text-sm text-gray-500">lbs</p>
        </div>

        <button
          onClick={() => setWeight((w) => w + 0.5)}
          className="p-2 rounded-full bg-white shadow-sm hover:bg-gray-50"
        >
          <Plus className="w-5 h-5" />
        </button>
      </div>

      {showNotes && (
        <input
          type="text"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Add a note (optional)"
          className="w-full px-3 py-2 mb-3 text-sm border rounded-lg"
        />
      )}

      <div className="flex gap-2">
        <button
          onClick={() => setShowNotes(!showNotes)}
          className="flex-1 btn-secondary btn-sm"
        >
          {showNotes ? 'Hide Notes' : 'Add Note'}
        </button>
        <button onClick={handleSubmit} className="flex-1 btn-primary btn-sm">
          Log Weight
        </button>
      </div>
    </div>
  );
}
