export async function fetchWeightLogs(person: string, days: number = 14) {
  const res = await fetch(`/api/weight?person=${person}&days=${days}`);
  if (!res.ok) return [];
  return res.json();
}

export async function logWeight(person: string, weight: number, notes?: string) {
  const res = await fetch('/api/weight', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ person, weight, notes }),
  });
  if (!res.ok) throw new Error('Failed to log weight');
  return res.json();
}

export async function seedDatabase() {
  const res = await fetch('/api/seed', { method: 'POST' });
  if (!res.ok) throw new Error('Failed to seed database');
  return res.json();
}

interface LogWorkoutParams {
  person: string;
  workout_type?: string;
  completed: boolean;
  main_lifts?: string;
  top_set_weight?: number;
  rpe?: string;
  is_pr?: boolean;
  duration_min?: number;
  intensity?: string;
  energy: number;
  notes?: string;
}

export async function logWorkout(params: LogWorkoutParams) {
  const res = await fetch('/api/workout', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });
  if (!res.ok) throw new Error('Failed to log workout');
  return res.json();
}

export async function fetchPantryItems() {
  const res = await fetch('/api/pantry');
  if (!res.ok) return [];
  return res.json();
}

export async function updatePantryQuantity(id: string, quantity: number) {
  const res = await fetch(`/api/pantry/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ quantity }),
  });
  if (!res.ok) throw new Error('Failed to update pantry item');
  return res.json();
}

interface AddPantryItemParams {
  item: string;
  quantity: number;
  category?: string;
  unit?: string;
}

export async function addPantryItem(params: AddPantryItemParams) {
  const res = await fetch('/api/pantry', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });
  if (!res.ok) throw new Error('Failed to add pantry item');
  return res.json();
}
