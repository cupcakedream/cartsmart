import type { DayOfWeek } from '../constants/daysOfWeek';
import type { Department } from '../constants/departments';
import type { AppData, Ingredient, Meal, MealPlan, ShoppingList } from '../types';
import type { StorageAdapter } from './StorageAdapter';
import type { neon as neonClient } from '../neon';

type NeonClient = typeof neonClient;

interface IngredientRow {
  id: string;
  name: string;
  department: string;
}

interface MealRow {
  id: string;
  name: string;
  days_of_week: string[];
}

interface MealIngredientRow {
  meal_id: string;
  ingredient_id: string;
}

interface MealPlanRow {
  id: string;
  name: string;
  meal_days: Record<string, string[]>;
  created_at: string;
  updated_at: string;
}

interface ShoppingListRow {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
}

interface ShoppingListIngredientRow {
  list_id: string;
  ingredient_id: string;
  checked: boolean;
}

interface UserPrefsRow {
  current_shopping_list_id: string | null;
  current_meal_plan_id: string | null;
}

function assertOk<T>(result: { data: T | null; error: unknown }, context: string): T {
  if (result.error) {
    throw new Error(`Neon ${context}: ${JSON.stringify(result.error)}`);
  }
  return (result.data ?? []) as T;
}

export class NeonStorageAdapter implements StorageAdapter {
  constructor(private readonly db: NeonClient) {}

  async load(): Promise<AppData> {
    const [
      ingredientsResult,
      mealsResult,
      mealIngredientsResult,
      mealPlansResult,
      shoppingListsResult,
      shoppingListIngredientsResult,
      prefsResult,
    ] = await Promise.all([
      this.db.from('ingredients').select('id,name,department'),
      this.db.from('meals').select('id,name,days_of_week'),
      this.db.from('meal_ingredients').select('meal_id,ingredient_id'),
      this.db.from('meal_plans').select('id,name,meal_days,created_at,updated_at'),
      this.db.from('shopping_lists').select('id,name,created_at,updated_at'),
      this.db.from('shopping_list_ingredients').select('list_id,ingredient_id,checked'),
      this.db.from('user_preferences').select('current_shopping_list_id,current_meal_plan_id'),
    ]);

    const ingredientRows = assertOk<IngredientRow[]>(ingredientsResult, 'load ingredients');
    const mealRows = assertOk<MealRow[]>(mealsResult, 'load meals');
    const mealIngredientRows = assertOk<MealIngredientRow[]>(mealIngredientsResult, 'load meal_ingredients');
    const mealPlanRows = assertOk<MealPlanRow[]>(mealPlansResult, 'load meal_plans');
    const shoppingListRows = assertOk<ShoppingListRow[]>(shoppingListsResult, 'load shopping_lists');
    const shoppingListIngredientRows = assertOk<ShoppingListIngredientRow[]>(shoppingListIngredientsResult, 'load shopping_list_ingredients');
    const prefsRows = assertOk<UserPrefsRow[]>(prefsResult, 'load user_preferences');

    const ingredients: Ingredient[] = ingredientRows.map((row) => ({
      id: row.id,
      name: row.name,
      department: row.department as Department,
    }));

    const meals: Meal[] = mealRows.map((row) => ({
      id: row.id,
      name: row.name,
      daysOfWeek: (row.days_of_week ?? []) as DayOfWeek[],
      ingredientIds: mealIngredientRows
        .filter((mi) => mi.meal_id === row.id)
        .map((mi) => mi.ingredient_id),
    }));

    const mealPlans: MealPlan[] = mealPlanRows.map((row) => ({
      id: row.id,
      name: row.name,
      mealDays: (row.meal_days ?? {}) as Record<string, DayOfWeek[]>,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }));

    const shoppingLists: ShoppingList[] = shoppingListRows.map((row) => {
      const forThisList = shoppingListIngredientRows.filter((li) => li.list_id === row.id);
      return {
        id: row.id,
        name: row.name,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
        ingredientIds: forThisList.map((li) => li.ingredient_id),
        checkedIngredientIds: forThisList
          .filter((li) => li.checked)
          .map((li) => li.ingredient_id),
      };
    });

    const prefs = prefsRows[0];

    return {
      ingredients,
      meals,
      mealPlans,
      currentMealPlanId: prefs?.current_meal_plan_id ?? null,
      shoppingLists,
      currentShoppingListId: prefs?.current_shopping_list_id ?? null,
    };
  }

  async save(data: AppData): Promise<void> {
    // Called by importIngredientsFromCsv (upserts new ingredients)
    // and setCurrentShoppingList / setCurrentMealPlan (updates preferences)
    const ops: Promise<unknown>[] = [];

    if (data.ingredients.length > 0) {
      ops.push(
        this.db.from('ingredients').upsert(
          data.ingredients.map((i) => ({
            id: i.id,
            name: i.name,
            department: i.department,
          })),
          { onConflict: 'id' },
        ),
      );
    }

    ops.push(
      this.db.from('user_preferences').upsert(
        {
          current_shopping_list_id: data.currentShoppingListId,
          current_meal_plan_id: data.currentMealPlanId,
        },
        { onConflict: 'user_id' },
      ),
    );

    await Promise.all(ops);
  }

  // ── Ingredients ────────────────────────────────────────────

  async getIngredients(): Promise<Ingredient[]> {
    const result = await this.db.from('ingredients').select('id,name,department');
    return assertOk<IngredientRow[]>(result, 'getIngredients').map((row) => ({
      id: row.id,
      name: row.name,
      department: row.department as Department,
    }));
  }

  async addIngredient(ingredient: Ingredient): Promise<Ingredient> {
    const result = await this.db.from('ingredients').insert({
      id: ingredient.id,
      name: ingredient.name,
      department: ingredient.department,
    });
    assertOk(result, 'addIngredient');
    return ingredient;
  }

  async updateIngredient(ingredient: Ingredient): Promise<Ingredient> {
    const result = await this.db
      .from('ingredients')
      .update({ name: ingredient.name, department: ingredient.department })
      .eq('id', ingredient.id);
    assertOk(result, 'updateIngredient');
    return ingredient;
  }

  async deleteIngredient(id: string): Promise<void> {
    // FK ON DELETE CASCADE handles meal_ingredients + shopping_list_ingredients
    const result = await this.db.from('ingredients').delete().eq('id', id);
    assertOk(result, 'deleteIngredient');
  }

  // ── Meals ──────────────────────────────────────────────────

  async getMeals(): Promise<Meal[]> {
    const [mealsResult, miResult] = await Promise.all([
      this.db.from('meals').select('id,name,days_of_week'),
      this.db.from('meal_ingredients').select('meal_id,ingredient_id'),
    ]);
    const mealRows = assertOk<MealRow[]>(mealsResult, 'getMeals');
    const miRows = assertOk<MealIngredientRow[]>(miResult, 'getMeals meal_ingredients');
    return mealRows.map((row) => ({
      id: row.id,
      name: row.name,
      daysOfWeek: (row.days_of_week ?? []) as DayOfWeek[],
      ingredientIds: miRows
        .filter((mi) => mi.meal_id === row.id)
        .map((mi) => mi.ingredient_id),
    }));
  }

  async addMeal(meal: Meal): Promise<Meal> {
    const result = await this.db.from('meals').insert({
      id: meal.id,
      name: meal.name,
      days_of_week: meal.daysOfWeek,
    });
    assertOk(result, 'addMeal');
    if (meal.ingredientIds.length > 0) {
      const miResult = await this.db.from('meal_ingredients').insert(
        meal.ingredientIds.map((iid) => ({ meal_id: meal.id, ingredient_id: iid })),
      );
      assertOk(miResult, 'addMeal meal_ingredients');
    }
    return meal;
  }

  async updateMeal(meal: Meal): Promise<Meal> {
    await this.db
      .from('meals')
      .update({ name: meal.name, days_of_week: meal.daysOfWeek })
      .eq('id', meal.id);
    // Replace ingredient associations
    await this.db.from('meal_ingredients').delete().eq('meal_id', meal.id);
    if (meal.ingredientIds.length > 0) {
      const result = await this.db.from('meal_ingredients').insert(
        meal.ingredientIds.map((iid) => ({ meal_id: meal.id, ingredient_id: iid })),
      );
      assertOk(result, 'updateMeal meal_ingredients');
    }
    return meal;
  }

  async deleteMeal(id: string): Promise<void> {
    // FK ON DELETE CASCADE handles meal_ingredients
    const result = await this.db.from('meals').delete().eq('id', id);
    assertOk(result, 'deleteMeal');
  }

  // ── Meal Plans ─────────────────────────────────────────────

  async getMealPlans(): Promise<MealPlan[]> {
    const result = await this.db
      .from('meal_plans')
      .select('id,name,meal_days,created_at,updated_at');
    return assertOk<MealPlanRow[]>(result, 'getMealPlans').map((row) => ({
      id: row.id,
      name: row.name,
      mealDays: (row.meal_days ?? {}) as Record<string, DayOfWeek[]>,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }));
  }

  async addMealPlan(plan: MealPlan): Promise<MealPlan> {
    const result = await this.db.from('meal_plans').insert({
      id: plan.id,
      name: plan.name,
      meal_days: plan.mealDays,
      created_at: plan.createdAt,
      updated_at: plan.updatedAt,
    });
    assertOk(result, 'addMealPlan');
    return plan;
  }

  async updateMealPlan(plan: MealPlan): Promise<MealPlan> {
    const result = await this.db
      .from('meal_plans')
      .update({
        name: plan.name,
        meal_days: plan.mealDays,
        updated_at: plan.updatedAt,
      })
      .eq('id', plan.id);
    assertOk(result, 'updateMealPlan');
    return plan;
  }

  async deleteMealPlan(id: string): Promise<void> {
    const result = await this.db.from('meal_plans').delete().eq('id', id);
    assertOk(result, 'deleteMealPlan');
  }

  // ── Shopping Lists ─────────────────────────────────────────

  async getShoppingLists(): Promise<ShoppingList[]> {
    const [listsResult, liResult] = await Promise.all([
      this.db.from('shopping_lists').select('id,name,created_at,updated_at'),
      this.db.from('shopping_list_ingredients').select('list_id,ingredient_id,checked'),
    ]);
    const listRows = assertOk<ShoppingListRow[]>(listsResult, 'getShoppingLists');
    const liRows = assertOk<ShoppingListIngredientRow[]>(liResult, 'getShoppingLists ingredients');
    return listRows.map((row) => {
      const forThisList = liRows.filter((li) => li.list_id === row.id);
      return {
        id: row.id,
        name: row.name,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
        ingredientIds: forThisList.map((li) => li.ingredient_id),
        checkedIngredientIds: forThisList
          .filter((li) => li.checked)
          .map((li) => li.ingredient_id),
      };
    });
  }

  async addShoppingList(list: ShoppingList): Promise<ShoppingList> {
    const result = await this.db.from('shopping_lists').insert({
      id: list.id,
      name: list.name,
      created_at: list.createdAt,
      updated_at: list.updatedAt,
    });
    assertOk(result, 'addShoppingList');
    if (list.ingredientIds.length > 0) {
      const liResult = await this.db.from('shopping_list_ingredients').insert(
        list.ingredientIds.map((iid) => ({
          list_id: list.id,
          ingredient_id: iid,
          checked: list.checkedIngredientIds.includes(iid),
        })),
      );
      assertOk(liResult, 'addShoppingList ingredients');
    }
    return list;
  }

  async updateShoppingList(list: ShoppingList): Promise<ShoppingList> {
    await this.db
      .from('shopping_lists')
      .update({ name: list.name, updated_at: list.updatedAt })
      .eq('id', list.id);
    // Replace ingredient associations
    await this.db.from('shopping_list_ingredients').delete().eq('list_id', list.id);
    if (list.ingredientIds.length > 0) {
      const result = await this.db.from('shopping_list_ingredients').insert(
        list.ingredientIds.map((iid) => ({
          list_id: list.id,
          ingredient_id: iid,
          checked: list.checkedIngredientIds.includes(iid),
        })),
      );
      assertOk(result, 'updateShoppingList ingredients');
    }
    return list;
  }

  async deleteShoppingList(id: string): Promise<void> {
    // FK ON DELETE CASCADE handles shopping_list_ingredients
    const result = await this.db.from('shopping_lists').delete().eq('id', id);
    assertOk(result, 'deleteShoppingList');
  }
}
