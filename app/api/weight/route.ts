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
    const days = parseInt(searchParams.get('days') || '14');

    // Get the person ID from the name (Him/Her) or use the authenticated user's ID
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
      .from('weight_logs')
      .select('*')
      .eq('person_id', personId)
      .order('date', { ascending: false })
      .limit(days);

    if (error) throw error;

    return NextResponse.json(data || []);
  } catch (error) {
    console.error('Error fetching weight logs:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch weight logs' },
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
    const { person, weight, notes } = body;

    if (!weight) {
      return NextResponse.json(
        { success: false, error: 'Weight is required' },
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

    const today = new Date().toISOString().split('T')[0];

    const { data, error } = await supabase
      .from('weight_logs')
      .upsert({
        person_id: personId,
        date: today,
        weight_lbs: weight,
        notes: notes || null,
      }, { onConflict: 'person_id,date' })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Error logging weight:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to log weight' },
      { status: 500 }
    );
  }
}
