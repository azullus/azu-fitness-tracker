'use client';

import { Dumbbell, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Exercise {
  id: string;
  exercise_name: string;
  sets: number;
  reps: string;
  rest_seconds: number;
  muscle_group?: string;
  intensity?: string;
}

interface WorkoutCardProps {
  person: 'Him' | 'Her';
  workoutType: string;
  exercises: Exercise[];
  onComplete?: () => void;
}

export default function WorkoutCard({
  person,
  workoutType,
  exercises,
  onComplete,
}: WorkoutCardProps) {
  const isHim = person === 'Him';
  const accentColor = isHim ? 'text-red-600' : 'text-purple-600';
  const bgColor = isHim ? 'bg-red-50' : 'bg-purple-50';

  return (
    <div className="card">
      <div className={cn('flex items-center justify-between mb-4 pb-3 border-b', bgColor, '-mx-4 -mt-4 px-4 pt-4 rounded-t-xl')}>
        <div className="flex items-center gap-2">
          <Dumbbell className={cn('w-5 h-5', accentColor)} />
          <h3 className={cn('font-semibold', accentColor)}>{workoutType}</h3>
        </div>
        <span className="text-sm text-gray-500">{exercises.length} exercises</span>
      </div>

      <ul className="space-y-3">
        {exercises.map((exercise) => (
          <li key={exercise.id} className="flex items-start gap-3">
            <div className="flex-shrink-0 w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center">
              <Dumbbell className="w-3 h-3 text-gray-500" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-gray-900">{exercise.exercise_name}</p>
              <p className="text-sm text-gray-500">
                {exercise.sets} sets x {exercise.reps}
                {exercise.rest_seconds > 0 && ` | ${exercise.rest_seconds}s rest`}
              </p>
              {exercise.muscle_group && (
                <span className="inline-block mt-1 px-2 py-0.5 text-xs bg-gray-100 text-gray-600 rounded">
                  {exercise.muscle_group}
                </span>
              )}
            </div>
          </li>
        ))}
      </ul>

      {onComplete && (
        <button
          onClick={onComplete}
          className="mt-4 w-full btn-primary flex items-center justify-center gap-2"
        >
          <Check className="w-4 h-4" />
          Mark Complete
        </button>
      )}
    </div>
  );
}
