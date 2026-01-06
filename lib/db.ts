import { getSupabase, isSupabaseConfigured } from './supabase';
import type {
  Person,
  WeightLog,
  WorkoutLog,
  PantryItem,
  Recipe,
  MealPlan,
  GroceryItem,
  WorkoutExercise
} from './types';

// Helper to ensure Supabase is configured
function requireSupabase() {
  if (!isSupabaseConfigured()) {
    throw new Error('Supabase is not configured. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.');
  }
  return getSupabase();
}

// ============ PERSONS ============

export async function getPersons(): Promise<Person[]> {
  const supabase = requireSupabase();
  const { data, error } = await supabase
    .from('persons')
    .select('*')
    .order('name');

  if (error) throw error;
  return data || [];
}

export async function getPersonById(id: string): Promise<Person | null> {
  const supabase = requireSupabase();
  const { data, error } = await supabase
    .from('persons')
    .select('*')
    .eq('id', id)
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  return data;
}

export async function getPersonByName(name: string): Promise<Person | null> {
  const supabase = requireSupabase();
  const { data, error } = await supabase
    .from('persons')
    .select('*')
    .eq('name', name)
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  return data;
}

export async function createPerson(person: Omit<Person, 'id'>): Promise<Person> {
  const supabase = requireSupabase();
  const { data, error } = await supabase
    .from('persons')
    .insert(person)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updatePerson(id: string, updates: Partial<Person>): Promise<Person> {
  const supabase = requireSupabase();
  const { data, error } = await supabase
    .from('persons')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deletePerson(id: string): Promise<void> {
  const supabase = requireSupabase();
  const { error } = await supabase
    .from('persons')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

// ============ WEIGHT LOGS ============

export async function getWeightLogs(personId?: string, limit = 30): Promise<WeightLog[]> {
  const supabase = requireSupabase();
  let query = supabase
    .from('weight_logs')
    .select('*')
    .order('date', { ascending: false })
    .limit(limit);

  if (personId) {
    query = query.eq('person_id', personId);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}

export async function logWeight(log: Omit<WeightLog, 'id'>): Promise<WeightLog> {
  const supabase = requireSupabase();
  const { data, error } = await supabase
    .from('weight_logs')
    .upsert(log, { onConflict: 'person_id,date' })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteWeightLog(id: string): Promise<void> {
  const supabase = requireSupabase();
  const { error } = await supabase
    .from('weight_logs')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

// ============ WORKOUT LOGS ============

export async function getWorkoutLogs(personId?: string, date?: string): Promise<WorkoutLog[]> {
  const supabase = requireSupabase();
  let query = supabase
    .from('workout_logs')
    .select('*')
    .order('date', { ascending: false });

  if (personId) {
    query = query.eq('person_id', personId);
  }
  if (date) {
    query = query.eq('date', date);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}

export async function logWorkout(log: Omit<WorkoutLog, 'id'>): Promise<WorkoutLog> {
  const supabase = requireSupabase();
  const { data, error } = await supabase
    .from('workout_logs')
    .upsert(log, { onConflict: 'person_id,date' })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteWorkoutLog(id: string): Promise<void> {
  const supabase = requireSupabase();
  const { error } = await supabase
    .from('workout_logs')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

// ============ PANTRY ============

export async function getPantryItems(): Promise<PantryItem[]> {
  const supabase = requireSupabase();
  const { data, error } = await supabase
    .from('pantry_items')
    .select('*')
    .order('category')
    .order('item');

  if (error) throw error;
  return data || [];
}

export async function addPantryItem(item: Omit<PantryItem, 'id'>): Promise<PantryItem> {
  const supabase = requireSupabase();
  const { data, error } = await supabase
    .from('pantry_items')
    .insert(item)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updatePantryItem(id: string, updates: Partial<PantryItem>): Promise<PantryItem> {
  const supabase = requireSupabase();
  const { data, error } = await supabase
    .from('pantry_items')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deletePantryItem(id: string): Promise<void> {
  const supabase = requireSupabase();
  const { error } = await supabase
    .from('pantry_items')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

// ============ RECIPES ============

export async function getRecipes(category?: string): Promise<Recipe[]> {
  const supabase = requireSupabase();
  let query = supabase
    .from('recipes')
    .select('*')
    .order('name');

  if (category) {
    query = query.eq('category', category);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}

export async function getRecipeById(id: string): Promise<Recipe | null> {
  const supabase = requireSupabase();
  const { data, error } = await supabase
    .from('recipes')
    .select('*')
    .eq('id', id)
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  return data;
}

export async function addRecipe(recipe: Omit<Recipe, 'id'>): Promise<Recipe> {
  const supabase = requireSupabase();
  const { data, error } = await supabase
    .from('recipes')
    .insert(recipe)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateRecipe(id: string, updates: Partial<Recipe>): Promise<Recipe> {
  const supabase = requireSupabase();
  const { data, error } = await supabase
    .from('recipes')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteRecipe(id: string): Promise<void> {
  const supabase = requireSupabase();
  const { error } = await supabase
    .from('recipes')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

// ============ MEAL PLANS ============

export async function getMealPlans(startDate: string, endDate: string): Promise<MealPlan[]> {
  const supabase = requireSupabase();
  const { data, error } = await supabase
    .from('meal_plans')
    .select(`
      *,
      recipe:recipes(*)
    `)
    .gte('date', startDate)
    .lte('date', endDate)
    .order('date')
    .order('meal_type');

  if (error) throw error;
  return data || [];
}

export async function addMealPlan(plan: Omit<MealPlan, 'id' | 'recipe'>): Promise<MealPlan> {
  const supabase = requireSupabase();
  const { data, error } = await supabase
    .from('meal_plans')
    .upsert(plan, { onConflict: 'date,meal_type' })
    .select(`
      *,
      recipe:recipes(*)
    `)
    .single();

  if (error) throw error;
  return data;
}

export async function deleteMealPlan(id: string): Promise<void> {
  const supabase = requireSupabase();
  const { error } = await supabase
    .from('meal_plans')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

// ============ GROCERY ============

export async function getGroceryItems(weekStart?: string): Promise<GroceryItem[]> {
  const supabase = requireSupabase();
  let query = supabase
    .from('grocery_items')
    .select('*')
    .order('store')
    .order('category')
    .order('name');

  if (weekStart) {
    query = query.eq('week_start', weekStart);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}

export async function addGroceryItem(item: Omit<GroceryItem, 'id'>): Promise<GroceryItem> {
  const supabase = requireSupabase();
  const { data, error } = await supabase
    .from('grocery_items')
    .insert(item)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function toggleGroceryPurchased(id: string, purchased: boolean): Promise<GroceryItem> {
  const supabase = requireSupabase();
  const { data, error } = await supabase
    .from('grocery_items')
    .update({ checked: purchased })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteGroceryItem(id: string): Promise<void> {
  const supabase = requireSupabase();
  const { error } = await supabase
    .from('grocery_items')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

// ============ WORKOUT EXERCISES ============

export async function getWorkoutExercises(personId: string, dayOfWeek?: string): Promise<WorkoutExercise[]> {
  const supabase = requireSupabase();
  let query = supabase
    .from('workout_exercises')
    .select('*')
    .eq('person_id', personId)
    .order('order_index');

  if (dayOfWeek) {
    query = query.eq('day_of_week', dayOfWeek);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}

export async function addWorkoutExercise(exercise: Omit<WorkoutExercise, 'id'>): Promise<WorkoutExercise> {
  const supabase = requireSupabase();
  const { data, error } = await supabase
    .from('workout_exercises')
    .insert(exercise)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateWorkoutExercise(id: string, updates: Partial<WorkoutExercise>): Promise<WorkoutExercise> {
  const supabase = requireSupabase();
  const { data, error } = await supabase
    .from('workout_exercises')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteWorkoutExercise(id: string): Promise<void> {
  const supabase = requireSupabase();
  const { error } = await supabase
    .from('workout_exercises')
    .delete()
    .eq('id', id);

  if (error) throw error;
}
