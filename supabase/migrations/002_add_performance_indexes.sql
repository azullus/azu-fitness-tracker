-- Migration: Add performance indexes
-- Run this in Supabase SQL Editor to improve query performance

-- Person name lookups
CREATE INDEX IF NOT EXISTS idx_persons_name ON persons(name);

-- Meal plans - composite index for date+type queries and recipe joins
CREATE INDEX IF NOT EXISTS idx_meal_plans_date_type ON meal_plans(date, meal_type);
CREATE INDEX IF NOT EXISTS idx_meal_plans_recipe ON meal_plans(recipe_id);
CREATE INDEX IF NOT EXISTS idx_meal_plans_created_by ON meal_plans(created_by);

-- Recipes - created_by for ownership filtering
CREATE INDEX IF NOT EXISTS idx_recipes_created_by ON recipes(created_by);

-- Pantry items - for sorting by category and item
CREATE INDEX IF NOT EXISTS idx_pantry_category_item ON pantry_items(category, item);
CREATE INDEX IF NOT EXISTS idx_pantry_created_by ON pantry_items(created_by);

-- Grocery items - for category filtering
CREATE INDEX IF NOT EXISTS idx_grocery_category ON grocery_items(category);
CREATE INDEX IF NOT EXISTS idx_grocery_created_by ON grocery_items(created_by);
