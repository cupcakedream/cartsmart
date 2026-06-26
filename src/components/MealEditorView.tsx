import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { useGrocery } from '../context/GroceryContext';
import { DEFAULT_DEPARTMENT } from '../constants/departments';
import { ViewHeader } from './ViewHeader';
import { DepartmentSelect } from './DepartmentSelect';

interface MealEditorViewProps {
  mealId: string | null;
  onBack: () => void;
}

export function MealEditorView({ mealId, onBack }: MealEditorViewProps) {
  const { ingredients, meals, addMeal, addIngredient, updateMeal } = useGrocery();

  const existingMeal = mealId ? meals.find((meal) => meal.id === mealId) : null;

  const [name, setName] = useState('');
  const [selectedIngredientIds, setSelectedIngredientIds] = useState<string[]>([]);
  const [newIngredientName, setNewIngredientName] = useState('');
  const [newIngredientDepartment, setNewIngredientDepartment] = useState(DEFAULT_DEPARTMENT);
  const [ingredientSearch, setIngredientSearch] = useState('');

  useEffect(() => {
    if (existingMeal) {
      setName(existingMeal.name);
      setSelectedIngredientIds(existingMeal.ingredientIds);
    } else {
      setName('');
      setSelectedIngredientIds([]);
    }
    setNewIngredientName('');
    setNewIngredientDepartment(DEFAULT_DEPARTMENT);
    setIngredientSearch('');
  }, [existingMeal, mealId]);

  const filteredIngredients = useMemo(() => {
    const query = ingredientSearch.trim().toLowerCase();
    if (!query) return ingredients;

    return ingredients.filter((ingredient) => ingredient.name.toLowerCase().includes(query));
  }, [ingredients, ingredientSearch]);

  function toggleIngredient(id: string) {
    setSelectedIngredientIds((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
    );
  }

  async function handleAddIngredient(event: FormEvent) {
    event.preventDefault();
    if (!newIngredientName.trim()) return;

    const ingredient = await addIngredient(newIngredientName, newIngredientDepartment);
    if (ingredient) {
      setSelectedIngredientIds((current) =>
        current.includes(ingredient.id) ? current : [...current, ingredient.id],
      );
    }
    setNewIngredientName('');
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!name.trim()) return;

    if (existingMeal) {
      await updateMeal({
        ...existingMeal,
        name: name.trim(),
        ingredientIds: selectedIngredientIds,
        daysOfWeek: existingMeal.daysOfWeek,
      });
    } else {
      await addMeal(name, selectedIngredientIds, []);
    }

    onBack();
  }

  if (mealId && !existingMeal) {
    return (
      <section className="view">
        <ViewHeader title="Meal not found" />
        <p className="empty-state">This meal may have been deleted.</p>
      </section>
    );
  }

  return (
    <section className="view">
      <ViewHeader
        title={existingMeal ? 'Edit meal' : 'New meal'}
        subtitle="Set the name, schedule, and items for this meal."
      />

      <form className="card form-card" onSubmit={handleSubmit}>
        <input
          type="text"
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Meal name (e.g. Pasta night)"
          aria-label="Meal name"
        />

        <fieldset className="checkbox-group">
          <legend>Foods</legend>
          {ingredients.length === 0 ? (
            <p className="hint">No existing items yet. Add one below.</p>
          ) : (
            <>
              <input
                type="search"
                className="field-control search-input search-input-inline"
                value={ingredientSearch}
                onChange={(event) => setIngredientSearch(event.target.value)}
                placeholder="Search items…"
                aria-label="Search items"
              />
              {filteredIngredients.length === 0 ? (
                <p className="hint">No items match your search.</p>
              ) : (
                <div className="scrollable-list ingredient-picker">
                  {filteredIngredients.map((ingredient) => (
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
        </fieldset>

        <div className="add-ingredient-inline">
          <div className="field-row add-ingredient-form">
            <input
              type="text"
              className="field-control"
              value={newIngredientName}
              onChange={(event) => setNewIngredientName(event.target.value)}
              placeholder="Add food"
              aria-label="New food name"
            />
            <DepartmentSelect
              className="field-control"
              value={newIngredientDepartment}
              onChange={setNewIngredientDepartment}
            />
            <button
              type="button"
              className="field-control"
              onClick={(event) => void handleAddIngredient(event)}
            >
              Add
            </button>
          </div>
        </div>

        <div className="form-actions">
          <button type="submit" className="field-control">
            {existingMeal ? 'Save changes' : 'Add meal'}
          </button>
          <button type="button" className="btn-secondary field-control" onClick={onBack}>
            Cancel
          </button>
        </div>
      </form>
    </section>
  );
}
