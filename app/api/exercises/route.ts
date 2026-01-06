import { NextRequest, NextResponse } from 'next/server';
import { createAuthenticatedClient, getAuthenticatedUser } from '@/lib/supabase-server';

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const supabase = createAuthenticatedClient(request);
    const { searchParams } = new URL(request.url);
    const person = searchParams.get('person');
    const day = searchParams.get('day');

    // Get the person ID from the name or use authenticated user
    let personId = user.id;

    if (person) {
      const { data: personData } = await supabase
        .from('persons')
        .select('id')
        .eq('name', person)
        .single();

      if (personData) {
        personId = personData.id;
      }
    }

    let query = supabase
      .from('workout_exercises')
      .select('*')
      .eq('person_id', personId)
      .order('order_index');

    if (day) {
      query = query.eq('day_of_week', day);
    }

    const { data, error } = await query;

    if (error) throw error;

    return NextResponse.json(data || []);
  } catch (error) {
    console.error('Error fetching exercises:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch exercises' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const supabase = createAuthenticatedClient(request);
    const body = await request.json();
    const {
      person,
      day_of_week,
      workout_type,
      exercise_name,
      sets,
      reps,
      weight,
      rest_seconds,
      muscle_group,
      notes,
      order_index,
    } = body;

    if (!day_of_week || !workout_type || !exercise_name) {
      return NextResponse.json(
        { success: false, error: 'day_of_week, workout_type, and exercise_name are required' },
        { status: 400 }
      );
    }

    // Get the person ID from the name or use authenticated user
    let personId = user.id;

    if (person) {
      const { data: personData } = await supabase
        .from('persons')
        .select('id')
        .eq('name', person)
        .single();

      if (personData) {
        personId = personData.id;
      }
    }

    const { data, error } = await supabase
      .from('workout_exercises')
      .insert({
        person_id: personId,
        day_of_week,
        workout_type,
        exercise_name,
        sets: sets || 3,
        reps: reps || '10',
        weight,
        rest_seconds: rest_seconds || 60,
        muscle_group,
        notes,
        order_index: order_index || 0,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, data }, { status: 201 });
  } catch (error) {
    console.error('Error creating exercise:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create exercise' },
      { status: 500 }
    );
  }
}
