import { NextRequest, NextResponse } from 'next/server';
import { getWorkoutExercises, getPersonByName } from '@/lib/db';
import { getCacheHeaders } from '@/lib/cache-headers';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const person = searchParams.get('person'); // 'Him' or 'Her'
    const day = searchParams.get('day'); // 'Monday', 'Tuesday', etc.

    if (!person) {
      return NextResponse.json({ error: 'Person required' }, { status: 400 });
    }

    const p = getPersonByName(person);
    if (!p) {
      return NextResponse.json({ error: 'Person not found' }, { status: 400 });
    }

    const exercises = getWorkoutExercises(p.id, day || undefined);

    // Group by day if no specific day requested
    if (!day) {
      const byDay: Record<string, any[]> = {};
      for (const ex of exercises) {
        if (!byDay[ex.day_of_week]) {
          byDay[ex.day_of_week] = [];
        }
        byDay[ex.day_of_week].push(ex);
      }
      return NextResponse.json(byDay, {
        headers: getCacheHeaders('PUBLIC_LONG'),
      });
    }

    return NextResponse.json(exercises, {
      headers: getCacheHeaders('PUBLIC_LONG'),
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
