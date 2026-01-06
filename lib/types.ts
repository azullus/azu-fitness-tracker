export interface Recipe {
  id: string;
  name: string;
  category: 'Breakfast' | 'Lunch' | 'Dinner' | 'Snack';
  prep_time_min: number;
  cook_time_min: number;
  servings: number;
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  fiber_g: number;
  ingredients: Ingredient[];
  instructions: string[];
  notes?: string;
  tags?: string[];
}

export interface Ingredient {
  amount: string;
  unit: string;
  item: string;
}

export interface WeightLog {
  id: string;
  person_id: string;
  date: string;
  weight_lbs: number;
  notes?: string;
}

export interface WorkoutLog {
  id: string;
  person_id: string;
  date: string;
  workout_type?: string;
  completed: boolean;
  main_lifts?: string;
  top_set_weight?: number;
  rpe?: string;
  is_pr?: boolean;
  activities?: string;
  duration_min?: number;
  intensity?: string;
  energy?: number;
  notes?: string;
}

export interface Exercise {
  id: string;
  exercise_name: string;
  sets: number;
  reps: string;
  rest_seconds: number;
  muscle_group?: string;
  workout_type?: string;
  intensity?: string;
}

export interface PantryItem {
  id: string;
  item: string;
  quantity: number;
  unit?: string;
  category?: string;
  location?: string;
  restock_when_low?: boolean;
  notes?: string;
}

export interface MealPlan {
  id: string;
  date: string;
  meal_type: 'Breakfast' | 'Lunch' | 'Dinner' | 'Snack';
  recipe_id: string;
  recipe?: Recipe;
  notes?: string;
}

export interface Person {
  id: string;
  name: string;
  training_focus?: string;
  allergies?: string;
  supplements?: string;
}

export interface GroceryItem {
  id: string;
  name: string;
  quantity: number;
  unit?: string;
  category?: string;
  store?: string;
  checked?: boolean;
}

export interface WorkoutExercise {
  id: string;
  person_id: string;
  day_of_week: string;
  workout_type: string;
  exercise_name: string;
  sets: number;
  reps: string;
  weight?: string;
  rest_seconds: number;
  muscle_group?: string;
  notes?: string;
  order_index: number;
}
