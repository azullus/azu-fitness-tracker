'use client';

import { useState } from 'react';
import { Minus, Plus, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { PantryItem as PantryItemType } from '@/lib/types';

type Props = {
  item: PantryItemType;
  onUpdateQuantity?: (id: string, quantity: number) => void;
};

const locationColors: Record<string, string> = {
  Pantry: 'bg-amber-100 text-amber-700',
  Fridge: 'bg-blue-100 text-blue-700',
  Freezer: 'bg-cyan-100 text-cyan-700',
  Counter: 'bg-green-100 text-green-700',
};

export default function PantryItemCard({ item, onUpdateQuantity }: Props) {
  const [quantity, setQuantity] = useState(item.quantity);
  // Handle both SQLite (restock_when_low) and Supabase/demo (low_stock_threshold) schemas
  const itemName = item.item || item.name || 'Unknown';
  const isLow = item.restock_when_low
    ? quantity <= 1
    : (item.low_stock_threshold !== undefined && quantity <= item.low_stock_threshold);

  const handleIncrement = () => {
    const newQty = quantity + 1;
    setQuantity(newQty);
    onUpdateQuantity?.(item.id, newQty);
  };

  const handleDecrement = () => {
    const newQty = Math.max(0, quantity - 1);
    setQuantity(newQty);
    onUpdateQuantity?.(item.id, newQty);
  };

  return (
    <div className={cn(
      'card flex items-center gap-3',
      isLow && 'border-amber-300 bg-amber-50'
    )}>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="font-medium text-gray-900 truncate">{itemName}</p>
          {isLow && (
            <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0" />
          )}
        </div>
        <div className="flex items-center gap-2 mt-1">
          {item.location && (
            <span className={cn('badge text-xs', locationColors[item.location])}>
              {item.location}
            </span>
          )}
          <span className="text-xs text-gray-500">{item.category}</span>
        </div>
        {item.notes && (
          <p className="text-xs text-gray-500 mt-1 truncate">{item.notes}</p>
        )}
      </div>

      {/* Quantity controls */}
      <div className="flex items-center gap-2">
        <button
          onClick={handleDecrement}
          disabled={quantity <= 0}
          className="btn-ghost btn-sm p-1.5 rounded-full disabled:opacity-30"
        >
          <Minus className="w-4 h-4" />
        </button>
        <div className="text-center min-w-[3rem]">
          <span className="text-lg font-semibold text-gray-900">{quantity}</span>
          <p className="text-xs text-gray-500">{item.unit}</p>
        </div>
        <button
          onClick={handleIncrement}
          className="btn-ghost btn-sm p-1.5 rounded-full"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
