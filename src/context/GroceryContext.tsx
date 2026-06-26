import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { Department } from '../constants/departments';
import type { DayOfWeek } from '../constants/daysOfWeek';
import { getStorage } from '../storage';
import type { Ingredient, Meal, MealPlan, ShoppingList } from '../types';
import { DEFAULT_DATA } from '../data/defaultData';

// Module-level lock: prevents React StrictMode's double-mount from seeding twice.
// The WeakMap maps each storage instance to its in-flight seed promise so the
// second effect run simply awaits the first rather than re-inserting.
const _seedingPromises = new WeakMap<object, Promise<void>>();

/**
 * Remaps every ID in DEFAULT_DATA to a fresh UUID so multiple users can all
 * receive the same starter content without primary-key conflicts.
 */
function withFreshIds(data: AppData): AppData {
  const ingMap = new Map(data.ingredients.map((i) => [i.id, crypto.randomUUID()]));
  const mealMap = new Map(data.meals.map((m) => [m.id, crypto.randomUUID()]));
  const planMap = new Map(data.mealPlans.map((p) => [p.id, crypto.randomUUID()]));
  const listMap = new Map(data.shoppingLists.map((l) => [l.id, crypto.randomUUID()]));

  return {
    ingredients: data.ingredients.map((i) => ({ ...i, id: ingMap.get(i.id)! })),
    meals: data.meals.map((m) => ({
      ...m,
      id: mealMap.get(m.id)!,
      ingredientIds: m.ingredientIds.map((id) => ingMap.get(id) ?? id),
    })),
    mealPlans: data.mealPlans.map((p) => ({
      ...p,
      id: planMap.get(p.id)!,
      mealDays: Object.fromEntries(
        Object.entries(p.mealDays).map(([mealId, days]) => [mealMap.get(mealId) ?? mealId, days]),
      ),
    })),
    shoppingLists: data.shoppingLists.map((l) => ({
      ...l,
      id: listMap.get(l.id)!,
      ingredientIds: l.ingredientIds.map((id) => ingMap.get(id) ?? id),
      checkedIngredientIds: l.checkedIngredientIds.map((id) => ingMap.get(id) ?? id),
    })),
    currentMealPlanId: data.currentMealPlanId ? (planMap.get(data.currentMealPlanId) ?? null) : null,
    currentShoppingListId: data.currentShoppingListId
      ? (listMap.get(data.currentShoppingListId) ?? null)
      : null,
  };
}

interface GroceryContextValue {
  loading: boolean;
  ingredients: Ingredient[];
  meals: Meal[];
  shoppingLists: ShoppingList[];
  mealPlans: MealPlan[];
  addIngredient: (name: string, department: Department) => Promise<Ingredient | undefined>;
  importIngredientsFromCsv: (
    items: { name: string; department: Department }[],
  ) => Promise<{ imported: number; skipped: number }>;
  updateIngredient: (ingredient: Ingredient) => Promise<void>;
  deleteIngredient: (id: string) => Promise<void>;
  addMeal: (name: string, ingredientIds: string[], daysOfWeek: DayOfWeek[]) => Promise<void>;
  updateMeal: (meal: Meal) => Promise<void>;
  deleteMeal: (id: string) => Promise<void>;
  addMealPlan: (name: string) => Promise<MealPlan>;
  updateMealPlan: (plan: MealPlan) => Promise<void>;
  deleteMealPlan: (id: string) => Promise<void>;
  addShoppingList: (name: string) => Promise<ShoppingList>;
  deleteShoppingList: (id: string) => Promise<void>;
  addIngredientToShoppingList: (listId: string, ingredientId: string) => Promise<void>;
  addIngredientsToShoppingList: (listId: string, ingredientIds: string[]) => Promise<void>;
  removeIngredientFromShoppingList: (listId: string, ingredientId: string) => Promise<void>;
  addMealToShoppingList: (listId: string, mealId: string) => Promise<void>;
  toggleShoppingListItemChecked: (listId: string, ingredientId: string) => Promise<void>;
  uncheckAllShoppingListItems: (listId: string) => Promise<void>;
  getIngredientById: (id: string) => Ingredient | undefined;
  currentShoppingListId: string | null;
  setCurrentShoppingList: (listId: string) => Promise<void>;
  getMostRecentShoppingList: () => ShoppingList | null;
  currentMealPlanId: string | null;
  setCurrentMealPlan: (planId: string) => Promise<void>;
  getCurrentMealPlan: () => MealPlan | null;
}

const GroceryContext = createContext<GroceryContextValue | null>(null);

function createId(): string {
  return crypto.randomUUID();
}

function sortByMostRecent(lists: ShoppingList[]): ShoppingList[] {
  return [...lists].sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
  );
}

function sortMealPlansByRecent(plans: MealPlan[]): MealPlan[] {
  return [...plans].sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
  );
}

function sortIngredients(items: Ingredient[]): Ingredient[] {
  return [...items].sort((a, b) => a.name.localeCompare(b.name));
}

function sortMeals(items: Meal[]): Meal[] {
  return [...items].sort((a, b) => a.name.localeCompare(b.name));
}

export function GroceryProvider({ children }: { children: ReactNode }) {
  const storage = getStorage();
  const [loading, setLoading] = useState(true);
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [meals, setMeals] = useState<Meal[]>([]);
  const [mealPlans, setMealPlans] = useState<MealPlan[]>([]);
  const [currentMealPlanId, setCurrentMealPlanId] = useState<string | null>(null);
  const [shoppingLists, setShoppingLists] = useState<ShoppingList[]>([]);
  const [currentShoppingListId, setCurrentShoppingListId] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    const data = await storage.load();
    setIngredients(sortIngredients(data.ingredients));
    setMeals(sortMeals(data.meals));
    setMealPlans(data.mealPlans);
    setCurrentMealPlanId(data.currentMealPlanId);
    setShoppingLists(data.shoppingLists);
    setCurrentShoppingListId(data.currentShoppingListId);
  }, [storage]);

  useEffect(() => {
    let active = true;

    async function load() {
      setLoading(true);
      const data = await storage.load();

      // Brand-new user — seed default starter data
      if (data.ingredients.length === 0 && data.meals.length === 0) {
        // Reuse an in-flight seed promise if StrictMode already started one
        let seedPromise = _seedingPromises.get(storage);
        if (!seedPromise) {
          seedPromise = (async () => {
            // Fresh UUIDs per user — avoids PK conflicts when multiple users sign up
            const seed = withFreshIds(DEFAULT_DATA);
            for (const ingredient of seed.ingredients) {
              await storage.addIngredient(ingredient);
            }
            for (const meal of seed.meals) {
              await storage.addMeal(meal);
            }
            for (const plan of seed.mealPlans) {
              await storage.addMealPlan(plan);
            }
            for (const list of seed.shoppingLists) {
              await storage.addShoppingList(list);
            }
            if (seed.currentMealPlanId || seed.currentShoppingListId) {
              const seeded = await storage.load();
              await storage.save({
                ...seeded,
                currentMealPlanId: seed.currentMealPlanId,
                currentShoppingListId: seed.currentShoppingListId,
              });
            }
          })();
          _seedingPromises.set(storage, seedPromise);
          void seedPromise.finally(() => _seedingPromises.delete(storage));
        }
        await seedPromise;
      }

      await refresh();
      if (active) setLoading(false);
    }

    void load();
    return () => {
      active = false;
    };
  }, [refresh]);

  const addIngredient = useCallback(
    async (name: string, department: Department) => {
      const trimmed = name.trim();
      if (!trimmed) return undefined;

      const ingredient = await storage.addIngredient({
        id: createId(),
        name: trimmed,
        department,
      });
      await refresh();
      return ingredient;
    },
    [refresh, storage],
  );

  const importIngredientsFromCsv = useCallback(
    async (items: { name: string; department: Department }[]) => {
      const data = await storage.load();
      const existingNames = new Set(data.ingredients.map((item) => item.name.toLowerCase()));
      let imported = 0;
      let skipped = 0;

      for (const item of items) {
        const trimmed = item.name.trim();
        if (!trimmed) continue;

        const key = trimmed.toLowerCase();
        if (existingNames.has(key)) {
          skipped += 1;
          continue;
        }

        data.ingredients.push({
          id: createId(),
          name: trimmed,
          department: item.department,
        });
        existingNames.add(key);
        imported += 1;
      }

      if (imported > 0) {
        await storage.save(data);
        await refresh();
      }

      return { imported, skipped };
    },
    [refresh, storage],
  );

  const deleteIngredient = useCallback(
    async (id: string) => {
      await storage.deleteIngredient(id);
      await refresh();
    },
    [refresh, storage],
  );

  const updateIngredient = useCallback(
    async (ingredient: Ingredient) => {
      const trimmed = ingredient.name.trim();
      if (!trimmed) return;

      await storage.updateIngredient({
        ...ingredient,
        name: trimmed,
      });
      await refresh();
    },
    [refresh, storage],
  );

  const addMeal = useCallback(
    async (name: string, ingredientIds: string[], daysOfWeek: DayOfWeek[]) => {
      const trimmed = name.trim();
      if (!trimmed) return;

      await storage.addMeal({
        id: createId(),
        name: trimmed,
        ingredientIds: [...new Set(ingredientIds)],
        daysOfWeek: [...new Set(daysOfWeek)],
      });
      await refresh();
    },
    [refresh, storage],
  );

  const updateMeal = useCallback(
    async (meal: Meal) => {
      await storage.updateMeal({
        ...meal,
        ingredientIds: [...new Set(meal.ingredientIds)],
        daysOfWeek: [...new Set(meal.daysOfWeek)],
      });
      await refresh();
    },
    [refresh, storage],
  );

  const deleteMeal = useCallback(
    async (id: string) => {
      await storage.deleteMeal(id);
      await refresh();
    },
    [refresh, storage],
  );

  const addMealPlan = useCallback(
    async (name: string) => {
      const trimmed = name.trim();
      const now = new Date().toISOString();
      const plan: MealPlan = {
        id: createId(),
        name: trimmed || 'Meal plan',
        mealDays: {},
        createdAt: now,
        updatedAt: now,
      };
      await storage.addMealPlan(plan);
      await refresh();
      return plan;
    },
    [refresh, storage],
  );

  const updateMealPlan = useCallback(
    async (plan: MealPlan) => {
      await storage.updateMealPlan(plan);
      await refresh();
    },
    [refresh, storage],
  );

  const deleteMealPlan = useCallback(
    async (id: string) => {
      await storage.deleteMealPlan(id);
      await refresh();
    },
    [refresh, storage],
  );

  const setCurrentMealPlan = useCallback(
    async (planId: string) => {
      if (!mealPlans.some((plan) => plan.id === planId)) return;

      setCurrentMealPlanId(planId); // optimistic — update UI immediately
      const data = await storage.load();
      await storage.save({ ...data, currentMealPlanId: planId });
    },
    [mealPlans, storage],
  );

  const getCurrentMealPlan = useCallback((): MealPlan | null => {
    if (currentMealPlanId) {
      const plan = mealPlans.find((p) => p.id === currentMealPlanId);
      if (plan) return plan;
    }
    const sorted = sortMealPlansByRecent(mealPlans);
    return sorted[0] ?? null;
  }, [currentMealPlanId, mealPlans]);

  const addShoppingList = useCallback(
    async (name: string) => {
      const trimmed = name.trim();
      const now = new Date().toISOString();
      const list: ShoppingList = {
        id: createId(),
        name: trimmed || 'Shopping list',
        ingredientIds: [],
        checkedIngredientIds: [],
        createdAt: now,
        updatedAt: now,
      };
      await storage.addShoppingList(list);
      await refresh();
      return list;
    },
    [refresh, storage],
  );

  const deleteShoppingList = useCallback(
    async (id: string) => {
      await storage.deleteShoppingList(id);
      await refresh();
    },
    [refresh, storage],
  );

  const addIngredientToShoppingList = useCallback(
    async (listId: string, ingredientId: string) => {
      const list = shoppingLists.find((item) => item.id === listId);
      if (!list || list.ingredientIds.includes(ingredientId)) return;

      await storage.updateShoppingList({
        ...list,
        ingredientIds: [...list.ingredientIds, ingredientId],
        updatedAt: new Date().toISOString(),
      });
      await refresh();
    },
    [refresh, shoppingLists, storage],
  );

  const addIngredientsToShoppingList = useCallback(
    async (listId: string, ingredientIds: string[]) => {
      const list = shoppingLists.find((item) => item.id === listId);
      if (!list || ingredientIds.length === 0) return;

      const toAdd = ingredientIds.filter((id) => !list.ingredientIds.includes(id));
      if (toAdd.length === 0) return;

      await storage.updateShoppingList({
        ...list,
        ingredientIds: [...list.ingredientIds, ...toAdd],
        updatedAt: new Date().toISOString(),
      });
      await refresh();
    },
    [refresh, shoppingLists, storage],
  );

  const removeIngredientFromShoppingList = useCallback(
    async (listId: string, ingredientId: string) => {
      const list = shoppingLists.find((item) => item.id === listId);
      if (!list) return;

      await storage.updateShoppingList({
        ...list,
        ingredientIds: list.ingredientIds.filter((id) => id !== ingredientId),
        checkedIngredientIds: list.checkedIngredientIds.filter((id) => id !== ingredientId),
        updatedAt: new Date().toISOString(),
      });
      await refresh();
    },
    [refresh, shoppingLists, storage],
  );

  const addMealToShoppingList = useCallback(
    async (listId: string, mealId: string) => {
      const list = shoppingLists.find((item) => item.id === listId);
      const meal = meals.find((item) => item.id === mealId);
      if (!list || !meal) return;

      const merged = [...new Set([...list.ingredientIds, ...meal.ingredientIds])];
      await storage.updateShoppingList({
        ...list,
        ingredientIds: merged,
        updatedAt: new Date().toISOString(),
      });
      await refresh();
    },
    [meals, refresh, shoppingLists, storage],
  );

  const toggleShoppingListItemChecked = useCallback(
    async (listId: string, ingredientId: string) => {
      const list = shoppingLists.find((item) => item.id === listId);
      if (!list) return;

      const isChecked = list.checkedIngredientIds.includes(ingredientId);
      const checkedIngredientIds = isChecked
        ? list.checkedIngredientIds.filter((id) => id !== ingredientId)
        : [...list.checkedIngredientIds, ingredientId];

      // Optimistic update — flip the checkbox immediately
      setShoppingLists((prev) =>
        prev.map((l) => (l.id === listId ? { ...l, checkedIngredientIds } : l)),
      );

      await storage.updateShoppingList({
        ...list,
        checkedIngredientIds,
      });
      await refresh();
    },
    [refresh, shoppingLists, storage],
  );

  const uncheckAllShoppingListItems = useCallback(
    async (listId: string) => {
      const list = shoppingLists.find((item) => item.id === listId);
      if (!list || list.checkedIngredientIds.length === 0) return;

      // Optimistic update
      setShoppingLists((prev) =>
        prev.map((l) => (l.id === listId ? { ...l, checkedIngredientIds: [] } : l)),
      );

      await storage.updateShoppingList({
        ...list,
        checkedIngredientIds: [],
      });
      await refresh();
    },
    [refresh, shoppingLists, storage],
  );

  const getIngredientById = useCallback(
    (id: string) => ingredients.find((item) => item.id === id),
    [ingredients],
  );

  const setCurrentShoppingList = useCallback(
    async (listId: string) => {
      if (!shoppingLists.some((list) => list.id === listId)) return;

      setCurrentShoppingListId(listId); // optimistic — update UI immediately
      const data = await storage.load();
      await storage.save({ ...data, currentShoppingListId: listId });
    },
    [shoppingLists, storage],
  );

  const getMostRecentShoppingList = useCallback(() => {
    if (currentShoppingListId) {
      const current = shoppingLists.find((list) => list.id === currentShoppingListId);
      if (current) return current;
    }

    const sorted = sortByMostRecent(shoppingLists);
    return sorted[0] ?? null;
  }, [currentShoppingListId, shoppingLists]);

  const value = useMemo(
    () => ({
      loading,
      ingredients,
      meals,
      mealPlans,
      shoppingLists,
      addIngredient,
      importIngredientsFromCsv,
      updateIngredient,
      deleteIngredient,
      addMeal,
      updateMeal,
      deleteMeal,
      addMealPlan,
      updateMealPlan,
      deleteMealPlan,
      addShoppingList,
      deleteShoppingList,
      addIngredientToShoppingList,
      addIngredientsToShoppingList,
      removeIngredientFromShoppingList,
      addMealToShoppingList,
      toggleShoppingListItemChecked,
      uncheckAllShoppingListItems,
      getIngredientById,
      currentShoppingListId,
      setCurrentShoppingList,
      getMostRecentShoppingList,
      currentMealPlanId,
      setCurrentMealPlan,
      getCurrentMealPlan,
    }),
    [
      loading,
      ingredients,
      meals,
      mealPlans,
      shoppingLists,
      currentShoppingListId,
      currentMealPlanId,
      addIngredient,
      importIngredientsFromCsv,
      updateIngredient,
      deleteIngredient,
      addMeal,
      updateMeal,
      deleteMeal,
      addMealPlan,
      updateMealPlan,
      deleteMealPlan,
      addShoppingList,
      deleteShoppingList,
      addIngredientToShoppingList,
      addIngredientsToShoppingList,
      removeIngredientFromShoppingList,
      addMealToShoppingList,
      toggleShoppingListItemChecked,
      uncheckAllShoppingListItems,
      getIngredientById,
      setCurrentShoppingList,
      getMostRecentShoppingList,
      setCurrentMealPlan,
      getCurrentMealPlan,
    ],
  );

  return <GroceryContext.Provider value={value}>{children}</GroceryContext.Provider>;
}

export function useGrocery(): GroceryContextValue {
  const context = useContext(GroceryContext);
  if (!context) {
    throw new Error('useGrocery must be used within a GroceryProvider');
  }
  return context;
}
