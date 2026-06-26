import { DEFAULT_DEPARTMENT } from '../constants/departments';
import type { DayOfWeek } from '../constants/daysOfWeek';
import type { AppData, Ingredient, Meal, MealPlan, ShoppingList } from '../types';
import type { StorageAdapter } from './StorageAdapter';

const STORAGE_KEY = 'groceries-app-data';

const emptyData = (): AppData => ({
  ingredients: [],
  meals: [],
  mealPlans: [],
  currentMealPlanId: null,
  shoppingLists: [],
  currentShoppingListId: null,
});

function normalizeIngredient(ingredient: Ingredient): Ingredient {
  return {
    ...ingredient,
    department: ingredient.department ?? DEFAULT_DEPARTMENT,
  };
}

function normalizeMeal(meal: Meal & { dayOfWeek?: DayOfWeek | null }): Meal {
  const daysOfWeek =
    meal.daysOfWeek ?? (meal.dayOfWeek ? [meal.dayOfWeek] : []);

  return {
    id: meal.id,
    name: meal.name,
    ingredientIds: meal.ingredientIds ?? [],
    daysOfWeek: [...new Set(daysOfWeek)],
  };
}

function normalizeMealPlan(plan: Partial<MealPlan>): MealPlan {
  const timestamp = plan.updatedAt ?? plan.createdAt ?? new Date().toISOString();
  return {
    id: plan.id ?? crypto.randomUUID(),
    name: plan.name ?? 'Meal plan',
    mealDays: plan.mealDays ?? {},
    createdAt: plan.createdAt ?? timestamp,
    updatedAt: plan.updatedAt ?? timestamp,
  };
}

function normalizeShoppingList(list: ShoppingList): ShoppingList {
  const timestamp = list.updatedAt ?? list.createdAt ?? new Date().toISOString();
  const ingredientIds = list.ingredientIds ?? [];
  const checkedIngredientIds = (list.checkedIngredientIds ?? []).filter((id) =>
    ingredientIds.includes(id),
  );
  return {
    ...list,
    ingredientIds,
    checkedIngredientIds,
    createdAt: list.createdAt ?? timestamp,
    updatedAt: list.updatedAt ?? timestamp,
  };
}

function normalizeData(parsed: Partial<AppData>): AppData {
  const meals = (parsed.meals ?? []).map(normalizeMeal);
  const shoppingLists = (parsed.shoppingLists ?? []).map(normalizeShoppingList);

  let currentShoppingListId = parsed.currentShoppingListId ?? null;
  if (currentShoppingListId && !shoppingLists.some((list) => list.id === currentShoppingListId)) {
    currentShoppingListId = null;
  }

  let mealPlans = (parsed.mealPlans ?? []).map(normalizeMealPlan);
  let currentMealPlanId = parsed.currentMealPlanId ?? null;

  // Migration: if no meal plans exist, create a default one from meal.daysOfWeek data
  if (mealPlans.length === 0) {
    const now = new Date().toISOString();
    const mealDays: Record<string, DayOfWeek[]> = {};
    for (const meal of meals) {
      if (meal.daysOfWeek.length > 0) {
        mealDays[meal.id] = meal.daysOfWeek;
      }
    }
    const defaultPlan: MealPlan = {
      id: crypto.randomUUID(),
      name: 'My meal plan',
      mealDays,
      createdAt: now,
      updatedAt: now,
    };
    mealPlans = [defaultPlan];
    currentMealPlanId = defaultPlan.id;
  }

  if (currentMealPlanId && !mealPlans.some((plan) => plan.id === currentMealPlanId)) {
    currentMealPlanId = null;
  }

  return {
    ingredients: (parsed.ingredients ?? []).map(normalizeIngredient),
    meals,
    mealPlans,
    currentMealPlanId,
    shoppingLists,
    currentShoppingListId,
  };
}

export class LocalStorageAdapter implements StorageAdapter {
  private read(): AppData {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return emptyData();

    try {
      const parsed = JSON.parse(raw) as Partial<AppData>;
      return normalizeData(parsed);
    } catch {
      return emptyData();
    }
  }

  private write(data: AppData): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }

  async load(): Promise<AppData> {
    return this.read();
  }

  async save(data: AppData): Promise<void> {
    this.write(data);
  }

  async getIngredients(): Promise<Ingredient[]> {
    return this.read().ingredients;
  }

  async addIngredient(ingredient: Ingredient): Promise<Ingredient> {
    const data = this.read();
    data.ingredients.push(ingredient);
    this.write(data);
    return ingredient;
  }

  async updateIngredient(ingredient: Ingredient): Promise<Ingredient> {
    const data = this.read();
    data.ingredients = data.ingredients.map((item) =>
      item.id === ingredient.id ? ingredient : item,
    );
    this.write(data);
    return ingredient;
  }

  async deleteIngredient(id: string): Promise<void> {
    const data = this.read();
    data.ingredients = data.ingredients.filter((item) => item.id !== id);
    data.meals = data.meals.map((meal) => ({
      ...meal,
      ingredientIds: meal.ingredientIds.filter((ingredientId) => ingredientId !== id),
    }));
    data.shoppingLists = data.shoppingLists.map((list) => ({
      ...list,
      ingredientIds: list.ingredientIds.filter((ingredientId) => ingredientId !== id),
    }));
    this.write(data);
  }

  async getMeals(): Promise<Meal[]> {
    return this.read().meals;
  }

  async addMeal(meal: Meal): Promise<Meal> {
    const data = this.read();
    data.meals.push(meal);
    this.write(data);
    return meal;
  }

  async updateMeal(meal: Meal): Promise<Meal> {
    const data = this.read();
    data.meals = data.meals.map((item) => (item.id === meal.id ? meal : item));
    this.write(data);
    return meal;
  }

  async deleteMeal(id: string): Promise<void> {
    const data = this.read();
    data.meals = data.meals.filter((item) => item.id !== id);
    // Remove meal from all plans
    data.mealPlans = data.mealPlans.map((plan) => {
      const { [id]: _removed, ...rest } = plan.mealDays;
      return { ...plan, mealDays: rest };
    });
    this.write(data);
  }

  async getMealPlans(): Promise<MealPlan[]> {
    return this.read().mealPlans;
  }

  async addMealPlan(plan: MealPlan): Promise<MealPlan> {
    const data = this.read();
    data.mealPlans.push(plan);
    this.write(data);
    return plan;
  }

  async updateMealPlan(plan: MealPlan): Promise<MealPlan> {
    const data = this.read();
    data.mealPlans = data.mealPlans.map((item) => (item.id === plan.id ? plan : item));
    this.write(data);
    return plan;
  }

  async deleteMealPlan(id: string): Promise<void> {
    const data = this.read();
    data.mealPlans = data.mealPlans.filter((item) => item.id !== id);
    if (data.currentMealPlanId === id) {
      data.currentMealPlanId = null;
    }
    this.write(data);
  }

  async getShoppingLists(): Promise<ShoppingList[]> {
    return this.read().shoppingLists;
  }

  async addShoppingList(list: ShoppingList): Promise<ShoppingList> {
    const data = this.read();
    data.shoppingLists.push(list);
    this.write(data);
    return list;
  }

  async updateShoppingList(list: ShoppingList): Promise<ShoppingList> {
    const data = this.read();
    data.shoppingLists = data.shoppingLists.map((item) =>
      item.id === list.id ? list : item,
    );
    this.write(data);
    return list;
  }

  async deleteShoppingList(id: string): Promise<void> {
    const data = this.read();
    data.shoppingLists = data.shoppingLists.filter((item) => item.id !== id);
    if (data.currentShoppingListId === id) {
      data.currentShoppingListId = null;
    }
    this.write(data);
  }
}
