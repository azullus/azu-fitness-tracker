'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';
import Link from 'next/link';
import { isToday } from 'date-fns';
import { clsx } from 'clsx';
import {
  Dumbbell,
  Check,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { Button } from '@/components/ui';
import { WorkoutStreak } from '@/components/tracking';
import { createWorkoutFromRoutine, markWorkoutComplete } from '@/lib/workout-log';
import { ALL_ROUTINES, type WorkoutRoutine } from '@/lib/workouts';
import { captureException, captureWarning } from '@/lib/error-monitoring';
import type { Person, Workout } from '@/lib/types';

interface WorkoutLoggerTabProps {
  personId: string | undefined;
  currentPerson: Person | null;
  workouts: Workout[];
  onWorkoutRefresh: () => void;
}

export function WorkoutLoggerTab({
  personId,
  currentPerson,
  workouts,
  onWorkoutRefresh,
}: WorkoutLoggerTabProps) {
  // Today's workout
  const todaysWorkout = workouts.find((w) => isToday(new Date(w.date)));
  const [workoutExpanded, setWorkoutExpanded] = useState(false);
  const [workoutCompleted, setWorkoutCompleted] = useState(false);

  // Sync workoutCompleted state with todaysWorkout
  useEffect(() => {
    setWorkoutCompleted(todaysWorkout?.completed ?? false);
  }, [todaysWorkout?.id, todaysWorkout?.completed]);

  // Weekly workout schedule based on training focus
  const dayOfWeek = new Date().getDay();

  const scheduledWorkoutType = useMemo<{ type: string; category: string } | null>(() => {
    if (!currentPerson) return null;

    const focus = currentPerson.training_focus;

    if (focus === 'powerlifting') {
      const schedule: Record<number, { type: string; category: string } | null> = {
        0: null,
        1: { type: 'Squat', category: 'strength' },
        2: { type: 'Bench', category: 'strength' },
        3: null,
        4: { type: 'Deadlift', category: 'strength' },
        5: { type: 'Full Body', category: 'full_body' },
        6: null,
      };
      return schedule[dayOfWeek];
    } else if (focus === 'cardio') {
      const schedule: Record<number, { type: string; category: string } | null> = {
        0: null,
        1: { type: 'HIIT', category: 'hiit' },
        2: { type: 'Lower Body', category: 'strength' },
        3: { type: 'Cardio', category: 'cardio' },
        4: { type: 'Upper Body', category: 'strength' },
        5: { type: 'Mobility', category: 'mobility' },
        6: null,
      };
      return schedule[dayOfWeek];
    }

    return null;
  }, [currentPerson, dayOfWeek]);

  // Get suggested routines based on today's scheduled workout type
  const suggestedRoutines = useMemo<WorkoutRoutine[]>(() => {
    if (!currentPerson) return ALL_ROUTINES.slice(0, 3);

    if (!scheduledWorkoutType) {
      return ALL_ROUTINES.filter(r => r.category === 'mobility').slice(0, 2);
    }

    const matchingRoutines = ALL_ROUTINES.filter(r => {
      if (r.category === scheduledWorkoutType.category) return true;
      if (r.name.toLowerCase().includes(scheduledWorkoutType.type.toLowerCase())) return true;
      return false;
    });

    return matchingRoutines.slice(0, 3);
  }, [currentPerson, scheduledWorkoutType]);

  // Handlers
  const handleMarkWorkoutComplete = useCallback(() => {
    if (!todaysWorkout) return;

    try {
      markWorkoutComplete(todaysWorkout.id);
      setWorkoutCompleted(true);
      onWorkoutRefresh();
    } catch (error) {
      captureException(error instanceof Error ? error : new Error(String(error)), {
        component: 'WorkoutLoggerTab',
        action: 'markWorkoutComplete',
      });
    }
  }, [todaysWorkout, onWorkoutRefresh]);

  const handleStartWorkout = useCallback((routine: WorkoutRoutine) => {
    if (!personId) {
      captureWarning('No person selected, cannot start workout', {
        component: 'WorkoutLoggerTab',
        action: 'startWorkout',
      });
      return;
    }

    try {
      createWorkoutFromRoutine(personId, routine);
      onWorkoutRefresh();
      setWorkoutCompleted(false);
    } catch (error) {
      captureException(error instanceof Error ? error : new Error(String(error)), {
        component: 'WorkoutLoggerTab',
        action: 'startWorkout',
      });
    }
  }, [personId, onWorkoutRefresh]);

  return (
    <>
      {/* Today's Workout Section */}
      <section className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 border border-gray-100 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/40 rounded-lg">
              <Dumbbell className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <h2 className="font-semibold text-gray-900 dark:text-white">Today&apos;s Workout</h2>
          </div>
          {todaysWorkout && (
            <button
              onClick={() => setWorkoutExpanded(!workoutExpanded)}
              className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
              aria-label={workoutExpanded ? 'Collapse exercises' : 'Expand exercises'}
            >
              {workoutExpanded ? (
                <ChevronUp className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              ) : (
                <ChevronDown className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              )}
            </button>
          )}
        </div>

        {todaysWorkout ? (
          <div>
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-lg font-medium text-gray-900 dark:text-white">{todaysWorkout.type}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {todaysWorkout.exercises.length} exercises
                  {todaysWorkout.duration_minutes && ` | ${todaysWorkout.duration_minutes} min`}
                  {todaysWorkout.intensity && ` | ${todaysWorkout.intensity} intensity`}
                </p>
              </div>
              <span
                className={clsx(
                  'px-2 py-1 rounded-full text-xs font-medium',
                  workoutCompleted
                    ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400'
                    : 'bg-yellow-100 dark:bg-yellow-900/40 text-yellow-700 dark:text-yellow-400'
                )}
              >
                {workoutCompleted ? 'Completed' : 'Pending'}
              </span>
            </div>

            {/* Expanded exercises */}
            {workoutExpanded && (
              <div className="border-t border-gray-100 dark:border-gray-700 pt-3 mb-3">
                <ul className="space-y-2">
                  {todaysWorkout.exercises.map((exercise, idx) => (
                    <li key={idx} className="flex justify-between text-sm">
                      <span className="text-gray-700 dark:text-gray-300">{exercise.name}</span>
                      <span className="text-gray-500 dark:text-gray-400">
                        {exercise.sets && exercise.reps
                          ? `${exercise.sets}x${exercise.reps}`
                          : exercise.sets
                          ? `${exercise.sets} sets`
                          : ''}
                        {exercise.weight_lbs && ` @ ${exercise.weight_lbs} lbs`}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Mark complete button */}
            {!workoutCompleted && (
              <Button
                onClick={handleMarkWorkoutComplete}
                variant="primary"
                className="w-full"
              >
                <Check className="w-4 h-4 mr-2" />
                Mark Complete
              </Button>
            )}
          </div>
        ) : (
          <div className="py-2">
            {scheduledWorkoutType ? (
              <>
                <div className="flex items-center justify-between mb-4">
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    Today&apos;s focus: <span className="font-semibold text-purple-600 dark:text-purple-400">{scheduledWorkoutType.type} Day</span>
                  </p>
                  <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-400">
                    {currentPerson?.training_focus === 'powerlifting' ? 'Powerlifting' : 'Cardio'} Program
                  </span>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                  Recommended routines for today:
                </p>
              </>
            ) : (
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Rest day - Recovery is important!
                </p>
                <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400">
                  Rest Day
                </span>
              </div>
            )}
            {suggestedRoutines.length > 0 ? (
              <div className="space-y-3">
                {suggestedRoutines.map((routine) => (
                  <div
                    key={routine.id}
                    className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">{routine.name}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                          {routine.exercises.length} exercises - {routine.duration_minutes} min - {routine.difficulty}
                        </p>
                      </div>
                      <span className={clsx(
                        'px-2 py-0.5 text-xs font-medium rounded-full capitalize',
                        routine.category === 'strength' && 'bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-400',
                        routine.category === 'cardio' && 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-400',
                        routine.category === 'hiit' && 'bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-400',
                        routine.category === 'mobility' && 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400',
                        routine.category === 'full_body' && 'bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-400'
                      )}>
                        {routine.category.replace('_', ' ')}
                      </span>
                    </div>
                    <div className="flex gap-2 mt-2">
                      <Button
                        onClick={() => handleStartWorkout(routine)}
                        variant="primary"
                        size="sm"
                        className="flex-1"
                      >
                        <Dumbbell className="w-4 h-4 mr-1" />
                        Start Workout
                      </Button>
                      <Link
                        href={`/workouts/routines/${routine.id}`}
                        className="flex-1 inline-flex items-center justify-center px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-gray-600 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
                      >
                        View Details
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-4">
                {scheduledWorkoutType ? 'No matching routines found.' : 'Light stretching or mobility work is always an option!'}
              </p>
            )}
            <Link
              href="/workouts/routines"
              className="block mt-4 text-center text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
            >
              View all {ALL_ROUTINES.length} routines
            </Link>
          </div>
        )}
      </section>

      {/* Workout Streak Section */}
      {personId && (
        <WorkoutStreak
          workouts={workouts}
          personId={personId}
        />
      )}
    </>
  );
}
