import { NextRequest, NextResponse } from 'next/server';
import { getPersons, createPerson } from '@/lib/db';

export async function GET() {
  try {
    const persons = await getPersons();
    return NextResponse.json({ success: true, data: persons, source: 'supabase' });
  } catch (error) {
    console.error('Error fetching persons:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch persons' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.name) {
      return NextResponse.json(
        { success: false, error: 'Name is required' },
        { status: 400 }
      );
    }

    const person = await createPerson({
      name: body.name,
      training_focus: body.training_focus || '',
      allergies: body.allergies || '',
      supplements: body.supplements || '',
    });

    return NextResponse.json({ success: true, data: person }, { status: 201 });
  } catch (error) {
    console.error('Error creating person:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create person' },
      { status: 500 }
    );
  }
}
