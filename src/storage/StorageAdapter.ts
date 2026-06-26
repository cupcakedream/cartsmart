import type { AppData, Ingredient, Meal, MealPlan, ShoppingList } from '../types';

export interface StorageAdapter {
  load(): Promise<AppData>;
  save(data: AppData): Promise<void>;

  getIngredients(): Promise<Ingredient[]>;
  addIngredient(ingredient: Ingredient): Promise<Ingredient>;
  updateIngredient(ingredient: Ingredient): Promise<Ingredient>;
  deleteIngredient(id: string): Promise<void>;

  getMeals(): Promise<Meal[]>;
  addMeal(meal: Meal): Promise<Meal>;
  updateMeal(meal: Meal): Promise<Meal>;
  deleteMeal(id: string): Promise<void>;

  getMealPlans(): Promise<MealPlan[]>;
  addMealPlan(plan: MealPlan): Promise<MealPlan>;
  updateMealPlan(plan: MealPlan): Promise<MealPlan>;
  deleteMealPlan(id: string): Promise<void>;

  getShoppingLists(): Promise<ShoppingList[]>;
  addShoppingList(list: ShoppingList): Promise<ShoppingList>;
  updateShoppingList(list: ShoppingList): Promise<ShoppingList>;
  deleteShoppingList(id: string): Promise<void>;
}
