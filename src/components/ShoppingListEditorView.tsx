import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { ViewHeader } from './ViewHeader';
import { useConfirm } from '../context/ConfirmContext';
import { useGrocery } from '../context/GroceryContext';
import { DeleteBtn } from './IconBtn';

interface ShoppingListEditorViewProps {
  listId: string;
}

export function ShoppingListEditorView({ listId }: ShoppingListEditorViewProps) {
  const {
    ingredients,
    meals,
    shoppingLists,
    addIngredientToShoppingList,
    addIngredientsToShoppingList,
    removeIngredientFromShoppingList,
    addMealToShoppingList,
    getIngredientById,
  } = useGrocery();
  const { confirm } = useConfirm();

  const list = shoppingLists.find((plan) => plan.id === listId) ?? null;

  const [addTab, setAddTab] = useState<'item' | 'meal'>('item');
  const [itemSearch, setItemSearch] = useState('');
  const [mealSearch, setMealSearch] = useState('');
  const [selectedIngredientIds, setSelectedIngredientIds] = useState<string[]>([]);
  const [selectedMealIds, setSelectedMealIds] = useState<string[]>([]);

  useEffect(() => {
    setAddTab('item');
    setItemSearch('');
    setMealSearch('');
    setSelectedIngredientIds([]);
    setSelectedMealIds([]);
  }, [listId]);

  const availableIngredients = useMemo(() => {
    if (!list) return [];
    return ingredients.filter((item) => !list.ingredientIds.includes(item.id));
  }, [list, ingredients]);

  const filteredAvailableIngredients = useMemo(() => {
    const query = itemSearch.trim().toLowerCase();
    if (!query) return availableIngredients;
    return availableIngredients.filter((item) => item.name.toLowerCase().includes(query));
  }, [availableIngredients, itemSearch]);

  const filteredMeals = useMemo(() => {
    const query = mealSearch.trim().toLowerCase();
    if (!query) return meals;
    return meals.filter((meal) => meal.name.toLowerCase().includes(query));
  }, [meals, mealSearch]);

  const planIngredients =
    list?.ingredientIds
      .map((id) => getIngredientById(id))
      .filter((item): item is NonNullable<typeof item> => item !== undefined)
      .sort((a, b) => a.name.localeCompare(b.name)) ?? [];

  function toggleIngredient(id: string) {
    setSelectedIngredientIds((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
    );
  }

  function toggleMeal(id: string) {
    setSelectedMealIds((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
    );
  }

  async function handleRemovePlanItem(ingredientId: string, ingredientName: string) {
    if (!list) return;

    const confirmed = await confirm({
      title: 'Remove from list?',
      message: `Remove "${ingredientName}" from this list?`,
      confirmLabel: 'Remove',
    });
    if (confirmed) await removeIngredientFromShoppingList(list.id, ingredientId);
  }

  async function handleAddSelectedItems(event: FormEvent) {
    event.preventDefault();
    if (!list || selectedIngredientIds.length === 0) return;

    await addIngredientsToShoppingList(list.id, selectedIngredientIds);
    setSelectedIngredientIds([]);
    setItemSearch('');
  }

  async function handleAddSelectedMeals(event: FormEvent) {
    event.preventDefault();
    if (!list || selectedMealIds.length === 0) return;

    for (const mealId of selectedMealIds) {
      await addMealToShoppingList(list.id, mealId);
    }
    setSelectedMealIds([]);
    setMealSearch('');
  }

  if (!list) {
    return (
      <section className="view">
        <ViewHeader title="List not found" />
        <p className="empty-state">This list may have been deleted.</p>
      </section>
    );
  }

  return (
    <section className="view">
      <ViewHeader
        title={list.name}
        subtitle="Add items or meals to this shopping list."
      />

      <div className="shopping-panel">
        <div className="card">
          <div className="sub-nav" role="tablist" aria-label="Add to list">
            <button
              type="button"
              role="tab"
              aria-selected={addTab === 'item'}
              className={addTab === 'item' ? 'nav-btn active' : 'nav-btn'}
              onClick={() => setAddTab('item')}
            >
              Add item
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={addTab === 'meal'}
              className={addTab === 'meal' ? 'nav-btn active' : 'nav-btn'}
              onClick={() => setAddTab('meal')}
            >
              Add meal
            </button>
          </div>

          {addTab === 'item' ? (
            <form onSubmit={handleAddSelectedItems}>
              {availableIngredients.length === 0 ? (
                <p className="hint">All items are already on this list.</p>
              ) : (
                <>
                  <input
                    type="search"
                    className="field-control search-input search-input-inline"
                    value={itemSearch}
                    onChange={(event) => setItemSearch(event.target.value)}
                    placeholder="Search items…"
                    aria-label="Search items"
                  />
                  {filteredAvailableIngredients.length === 0 ? (
                    <p className="hint">No items match your search.</p>
                  ) : (
                    <div className="scrollable-list ingredient-picker">
                      {filteredAvailableIngredients.map((ingredient) => (
                        <label key={ingredient.id} className="checkbox-label">
                          <input
                            type="checkbox"
                            checked={selectedIngredientIds.includes(ingredient.id)}
                            onChange={() => toggleIngredient(ingredient.id)}
                          />
                          {ingredient.name}
                        </label>
                      ))}
                    </div>
                  )}
                </>
              )}
              <div className="form-actions add-tab-actions">
                <button
                  type="submit"
                  className="field-control"
                  disabled={selectedIngredientIds.length === 0}
                >
                  Add
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleAddSelectedMeals}>
              {meals.length === 0 ? (
                <p className="hint">No meals yet. Create meals first.</p>
              ) : (
                <>
                  <input
                    type="search"
                    className="field-control search-input search-input-inline"
                    value={mealSearch}
                    onChange={(event) => setMealSearch(event.target.value)}
                    placeholder="Search meals…"
                    aria-label="Search meals"
                  />
                  {filteredMeals.length === 0 ? (
                    <p className="hint">No meals match your search.</p>
                  ) : (
                    <div className="scrollable-list ingredient-picker">
                      {filteredMeals.map((meal) => (
                        <label key={meal.id} className="checkbox-label">
                          <input
                            type="checkbox"
                            checked={selectedMealIds.includes(meal.id)}
                            onChange={() => toggleMeal(meal.id)}
                          />
                          {meal.name}
                        </label>
                      ))}
                    </div>
                  )}
                </>
              )}
              <div className="form-actions add-tab-actions">
                <button
                  type="submit"
                  className="field-control"
                  disabled={selectedMealIds.length === 0}
                >
                  Add items
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

      <div className="card">
        <h3>List items</h3>
        {planIngredients.length === 0 ? (
          <p className="empty-state">No items on this list yet.</p>
        ) : (
          <ul className="item-list">
            {planIngredients.map((ingredient) => (
              <li key={ingredient.id} className="item-row">
                <span>{ingredient.name}</span>
                <DeleteBtn onClick={() => void handleRemovePlanItem(ingredient.id, ingredient.name)} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
