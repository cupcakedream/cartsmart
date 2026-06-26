import type { Department } from '../constants/departments';
import type { DayOfWeek } from '../constants/daysOfWeek';

export interface Ingredient {
  id: string;
  name: string;
  department: Department;
}

export interface Meal {
  id: string;
  name: string;
  ingredientIds: string[];
  daysOfWeek: DayOfWeek[];
}

export interface MealPlan {
  id: string;
  name: string;
  /** Maps mealId → days it is scheduled in this plan. */
  mealDays: Record<string, DayOfWeek[]>;
  createdAt: string;
  updatedAt: string;
}

export interface ShoppingList {
  id: string;
  name: string;
  ingredientIds: string[];
  checkedIngredientIds: string[];
  createdAt: string;
  updatedAt: string;
}

export interface AppData {
  ingredients: Ingredient[];
  meals: Meal[];
  mealPlans: MealPlan[];
  currentMealPlanId: string | null;
  shoppingLists: ShoppingList[];
  currentShoppingListId: string | null;
}

export type View =
  | 'meals'
  | 'meal-edit'
  | 'items'
  | 'plan'
  | 'shopping'
  | 'plan-shopping'
  | 'list-edit';
