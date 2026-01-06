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
    const date = searchParams.get('date');

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
      .from('workout_logs')
      .select('*')
      .eq('person_id', personId)
      .order('date', { ascending: false });

    if (date) {
      query = query.eq('date', date);
    }

    const { data, error } = await query;

    if (error) throw error;

    return NextResponse.json(data || []);
  } catch (error) {
    console.error('Error fetching workout logs:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch workout logs' },
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
      workout_type,
      completed,
      main_lifts,
      top_set_weight,
      rpe,
      is_pr,
      duration_min,
      intensity,
      energy,
      notes,
    } = body;

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

    const today = new Date().toISOString().split('T')[0];

    const { data, error } = await supabase
      .from('workout_logs')
      .insert({
        person_id: personId,
        date: today,
        workout_type,
        completed: completed || false,
        main_lifts,
        top_set_weight,
        rpe,
        is_pr: is_pr || false,
        duration_min,
        intensity,
        energy,
        notes,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Error logging workout:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to log workout' },
      { status: 500 }
    );
  }
}
