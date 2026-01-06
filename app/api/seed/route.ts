import { NextResponse } from 'next/server';
import { getSupabase, isSupabaseConfigured } from '@/lib/supabase';
import { format, addDays, startOfWeek } from 'date-fns';

export async function POST() {
  try {
    if (!isSupabaseConfigured()) {
      return NextResponse.json(
        { success: false, message: 'Supabase is not configured' },
        { status: 500 }
      );
    }

    const supabase = getSupabase();

    // Get or create persons
    const { data: persons, error: personsError } = await supabase
      .from('persons')
      .select('*');

    if (personsError) throw personsError;

    let him = persons?.find(p => p.name === 'Him');
    let her = persons?.find(p => p.name === 'Her');

    // Create default persons if they don't exist
    if (!him) {
      const { data, error } = await supabase
        .from('persons')
        .insert({ name: 'Him', training_focus: 'powerlifting', allergies: 'bananas (raw only)', supplements: 'One-A-Day Mens' })
        .select()
        .single();
      if (error) throw error;
      him = data;
    }

    if (!her) {
      const { data, error } = await supabase
        .from('persons')
        .insert({ name: 'Her', training_focus: 'cardio_mobility', allergies: '', supplements: 'One-A-Day Womens, Metamucil' })
        .select()
        .single();
      if (error) throw error;
      her = data;
    }

    // Get current week start (Sunday)
    const today = new Date();
    const weekStart = startOfWeek(today, { weekStartsOn: 0 });

    // ============ SEED RECIPES ============
    const recipes = [
      // Breakfast
      { name: 'Greek Yogurt Parfait', category: 'Breakfast', prep_time_min: 5, cook_time_min: 0, calories: 320, protein_g: 20, carbs_g: 42, fat_g: 8, fiber_g: 4, ingredients: [{ item: 'Greek yogurt', amount: '1', unit: 'cup' }, { item: 'Granola', amount: '0.5', unit: 'cup' }, { item: 'Mixed berries', amount: '0.5', unit: 'cup' }, { item: 'Honey', amount: '1', unit: 'tbsp' }], tags: ['quick', 'high-protein', 'no-cook'] },
      { name: 'Overnight Oats', category: 'Breakfast', prep_time_min: 5, cook_time_min: 0, calories: 385, protein_g: 14, carbs_g: 68, fat_g: 8, fiber_g: 8, ingredients: [{ item: 'Rolled oats', amount: '0.5', unit: 'cup' }, { item: 'Milk', amount: '0.5', unit: 'cup' }, { item: 'Yellow kiwi', amount: '1', unit: 'whole' }, { item: 'Chia seeds', amount: '1', unit: 'tbsp' }], tags: ['meal-prep', 'high-fiber'], notes: 'Yellow kiwi for him (banana allergy)' },
      { name: 'Scrambled Eggs with Toast', category: 'Breakfast', prep_time_min: 5, cook_time_min: 8, calories: 395, protein_g: 24, carbs_g: 32, fat_g: 20, fiber_g: 3, ingredients: [{ item: 'Eggs', amount: '3', unit: 'whole' }, { item: 'Whole grain bread', amount: '2', unit: 'slices' }, { item: 'Butter', amount: '1', unit: 'tbsp' }], tags: ['quick', 'classic'] },
      { name: 'Protein Smoothie', category: 'Breakfast', prep_time_min: 5, cook_time_min: 0, calories: 350, protein_g: 30, carbs_g: 45, fat_g: 6, fiber_g: 4, ingredients: [{ item: 'Protein powder', amount: '1', unit: 'scoop' }, { item: 'Milk', amount: '1', unit: 'cup' }, { item: 'PB Fit', amount: '2', unit: 'tbsp' }, { item: 'Mixed berries', amount: '0.5', unit: 'cup' }], tags: ['quick', 'high-protein'], notes: 'Use PB Fit instead of peanut butter' },

      // Lunch
      { name: 'Chicken & Rice Bowl', category: 'Lunch', prep_time_min: 10, cook_time_min: 15, calories: 520, protein_g: 42, carbs_g: 55, fat_g: 12, fiber_g: 3, ingredients: [{ item: 'Chicken breast', amount: '6', unit: 'oz' }, { item: 'White rice', amount: '1', unit: 'cup' }, { item: 'Broccoli', amount: '1', unit: 'cup' }, { item: 'Soy sauce', amount: '2', unit: 'tbsp' }], tags: ['meal-prep', 'high-protein'], notes: 'WHITE RICE ONLY' },
      { name: 'Turkey Wrap', category: 'Lunch', prep_time_min: 10, cook_time_min: 0, calories: 420, protein_g: 32, carbs_g: 38, fat_g: 16, fiber_g: 4, ingredients: [{ item: 'Turkey breast', amount: '4', unit: 'oz' }, { item: 'Whole grain tortilla', amount: '1', unit: 'large' }, { item: 'Lettuce', amount: '1', unit: 'cup' }, { item: 'Cheese', amount: '1', unit: 'slice' }], tags: ['quick', 'no-cook'] },
      { name: 'Tuna Salad', category: 'Lunch', prep_time_min: 10, cook_time_min: 0, calories: 380, protein_g: 35, carbs_g: 18, fat_g: 18, fiber_g: 4, ingredients: [{ item: 'Canned tuna', amount: '1', unit: 'can' }, { item: 'Mixed greens', amount: '2', unit: 'cups' }, { item: 'Olive oil', amount: '1', unit: 'tbsp' }, { item: 'Cherry tomatoes', amount: '0.5', unit: 'cup' }], tags: ['quick', 'high-protein'] },
      { name: 'Rotisserie Chicken Salad', category: 'Lunch', prep_time_min: 10, cook_time_min: 0, calories: 450, protein_g: 40, carbs_g: 20, fat_g: 24, fiber_g: 4, ingredients: [{ item: 'Rotisserie chicken', amount: '5', unit: 'oz' }, { item: 'Mixed greens', amount: '2', unit: 'cups' }, { item: 'Avocado', amount: '0.5', unit: 'whole' }, { item: 'Ranch dressing', amount: '2', unit: 'tbsp' }], tags: ['quick', 'high-protein'] },

      // Dinner
      { name: 'Beef Stir-Fry with Rice', category: 'Dinner', prep_time_min: 15, cook_time_min: 20, calories: 485, protein_g: 38, carbs_g: 45, fat_g: 18, fiber_g: 5, ingredients: [{ item: 'Beef strips', amount: '6', unit: 'oz' }, { item: 'White rice', amount: '1', unit: 'cup' }, { item: 'Mixed vegetables', amount: '1.5', unit: 'cups' }, { item: 'Soy sauce', amount: '2', unit: 'tbsp' }], tags: ['high-protein'], notes: 'WHITE RICE ONLY' },
      { name: 'Grilled Salmon with Vegetables', category: 'Dinner', prep_time_min: 15, cook_time_min: 20, calories: 485, protein_g: 42, carbs_g: 25, fat_g: 24, fiber_g: 6, ingredients: [{ item: 'Salmon fillet', amount: '6', unit: 'oz' }, { item: 'Asparagus', amount: '1', unit: 'bunch' }, { item: 'Lemon', amount: '0.5', unit: 'whole' }, { item: 'Olive oil', amount: '1', unit: 'tbsp' }], tags: ['healthy-fats', 'high-protein'] },
      { name: 'Chicken Thighs with Sweet Potato', category: 'Dinner', prep_time_min: 10, cook_time_min: 35, calories: 510, protein_g: 40, carbs_g: 48, fat_g: 16, fiber_g: 6, ingredients: [{ item: 'Chicken thighs', amount: '6', unit: 'oz' }, { item: 'Sweet potato', amount: '1', unit: 'large' }, { item: 'Green beans', amount: '1', unit: 'cup' }], tags: ['meal-prep', 'high-protein'] },
      { name: 'Pork Chops with Vegetables', category: 'Dinner', prep_time_min: 10, cook_time_min: 20, calories: 480, protein_g: 42, carbs_g: 28, fat_g: 22, fiber_g: 5, ingredients: [{ item: 'Pork chops', amount: '6', unit: 'oz' }, { item: 'Brussels sprouts', amount: '1', unit: 'cup' }, { item: 'White rice', amount: '0.75', unit: 'cup' }], tags: ['high-protein'] },

      // Snacks
      { name: 'BUILT Marshmallow Bar', category: 'Snack', prep_time_min: 0, cook_time_min: 0, calories: 130, protein_g: 17, carbs_g: 18, fat_g: 3, fiber_g: 1, ingredients: [{ item: 'BUILT Bar', amount: '1', unit: 'bar' }], tags: ['grab-and-go', 'high-protein'], notes: 'Costco preferred' },
      { name: 'Pepperoni Sticks with Cheese', category: 'Snack', prep_time_min: 2, cook_time_min: 0, calories: 180, protein_g: 12, carbs_g: 2, fat_g: 14, fiber_g: 0, ingredients: [{ item: 'Pepperoni sticks', amount: '2', unit: 'sticks' }, { item: 'Cheese', amount: '1', unit: 'oz' }], tags: ['savory', 'keto-friendly'] },
      { name: 'Greek Yogurt with Berries', category: 'Snack', prep_time_min: 2, cook_time_min: 0, calories: 150, protein_g: 15, carbs_g: 18, fat_g: 2, fiber_g: 2, ingredients: [{ item: 'Greek yogurt', amount: '0.75', unit: 'cup' }, { item: 'Mixed berries', amount: '0.25', unit: 'cup' }], tags: ['quick', 'high-protein'] },
    ];

    // Insert recipes (upsert based on name)
    const recipeIds: Record<string, string> = {};
    for (const recipe of recipes) {
      const { data: existing } = await supabase
        .from('recipes')
        .select('id')
        .eq('name', recipe.name)
        .single();

      if (existing) {
        recipeIds[recipe.name] = existing.id;
      } else {
        const { data, error } = await supabase
          .from('recipes')
          .insert({
            ...recipe,
            servings: 2,
            instructions: [],
          })
          .select()
          .single();
        if (error) throw error;
        recipeIds[recipe.name] = data.id;
      }
    }

    // ============ SEED MEAL PLANS ============
    const weekMeals = [
      { day: 0, breakfast: 'Overnight Oats', lunch: 'Rotisserie Chicken Salad', dinner: 'Grilled Salmon with Vegetables', snack: 'BUILT Marshmallow Bar' },
      { day: 1, breakfast: 'Greek Yogurt Parfait', lunch: 'Chicken & Rice Bowl', dinner: 'Beef Stir-Fry with Rice', snack: 'Greek Yogurt with Berries' },
      { day: 2, breakfast: 'Protein Smoothie', lunch: 'Tuna Salad', dinner: 'Chicken Thighs with Sweet Potato', snack: 'Pepperoni Sticks with Cheese' },
      { day: 3, breakfast: 'Scrambled Eggs with Toast', lunch: 'Turkey Wrap', dinner: 'Pork Chops with Vegetables', snack: 'BUILT Marshmallow Bar' },
      { day: 4, breakfast: 'Overnight Oats', lunch: 'Chicken & Rice Bowl', dinner: 'Beef Stir-Fry with Rice', snack: 'Greek Yogurt with Berries' },
      { day: 5, breakfast: 'Greek Yogurt Parfait', lunch: 'Rotisserie Chicken Salad', dinner: 'Grilled Salmon with Vegetables', snack: 'BUILT Marshmallow Bar' },
      { day: 6, breakfast: 'Scrambled Eggs with Toast', lunch: 'Tuna Salad', dinner: 'Chicken Thighs with Sweet Potato', snack: 'Pepperoni Sticks with Cheese' },
    ];

    for (const dayMeal of weekMeals) {
      const date = format(addDays(weekStart, dayMeal.day), 'yyyy-MM-dd');
      const meals = [
        { meal_type: 'Breakfast', recipe_id: recipeIds[dayMeal.breakfast] },
        { meal_type: 'Lunch', recipe_id: recipeIds[dayMeal.lunch] },
        { meal_type: 'Dinner', recipe_id: recipeIds[dayMeal.dinner] },
        { meal_type: 'Snack', recipe_id: recipeIds[dayMeal.snack] },
      ];

      for (const meal of meals) {
        if (meal.recipe_id) {
          await supabase
            .from('meal_plans')
            .upsert({ date, ...meal }, { onConflict: 'date,meal_type' });
        }
      }
    }

    // ============ SEED PANTRY ITEMS ============
    const pantryItems = [
      { category: 'Proteins', item: 'Chicken Breast (frozen)', quantity: 3, unit: 'lbs', location: 'Freezer' },
      { category: 'Proteins', item: 'Ground Beef', quantity: 2, unit: 'lbs', location: 'Freezer' },
      { category: 'Proteins', item: 'Salmon Fillets', quantity: 1, unit: 'lbs', location: 'Freezer' },
      { category: 'Proteins', item: 'Eggs', quantity: 12, unit: 'count', location: 'Fridge' },
      { category: 'Proteins', item: 'Greek Yogurt', quantity: 2, unit: 'containers', location: 'Fridge' },
      { category: 'Grains', item: 'White Rice', quantity: 5, unit: 'lbs', location: 'Pantry', notes: 'WHITE RICE ONLY' },
      { category: 'Grains', item: 'Rolled Oats', quantity: 2, unit: 'lbs', location: 'Pantry' },
      { category: 'Grains', item: 'Whole Grain Bread', quantity: 1, unit: 'loaves', location: 'Counter' },
      { category: 'Produce', item: 'Yellow Kiwi', quantity: 6, unit: 'count', location: 'Fridge', notes: 'Banana substitute' },
      { category: 'Produce', item: 'Mixed Berries', quantity: 2, unit: 'cups', location: 'Freezer' },
      { category: 'Produce', item: 'Broccoli', quantity: 2, unit: 'heads', location: 'Fridge' },
      { category: 'Produce', item: 'Sweet Potatoes', quantity: 4, unit: 'count', location: 'Pantry' },
      { category: 'Dairy', item: 'Milk', quantity: 1, unit: 'gallon', location: 'Fridge' },
      { category: 'Dairy', item: 'Cheese (Shredded)', quantity: 1, unit: 'bags', location: 'Fridge' },
      { category: 'Snacks', item: 'BUILT Marshmallow Bars', quantity: 12, unit: 'count', location: 'Pantry', notes: 'Costco preferred' },
      { category: 'Snacks', item: 'Granola', quantity: 1, unit: 'bag', location: 'Pantry' },
      { category: 'Condiments', item: 'PB Fit', quantity: 1, unit: 'container', location: 'Pantry' },
      { category: 'Condiments', item: 'Olive Oil', quantity: 1, unit: 'bottle', location: 'Pantry' },
      { category: 'Condiments', item: 'Soy Sauce', quantity: 1, unit: 'bottle', location: 'Pantry' },
      { category: 'Supplements', item: 'Protein Powder', quantity: 1, unit: 'container', location: 'Pantry' },
    ];

    for (const item of pantryItems) {
      const { data: existing } = await supabase
        .from('pantry_items')
        .select('id')
        .eq('item', item.item)
        .single();

      if (!existing) {
        await supabase.from('pantry_items').insert({
          ...item,
          restock_when_low: true,
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: `Seeded database with ${recipes.length} recipes, ${weekMeals.length} days of meals, and ${pantryItems.length} pantry items`,
    });

  } catch (error: any) {
    console.error('Seed error:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
