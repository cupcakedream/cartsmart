import { ViewHeader } from './ViewHeader';
import { useConfirm } from '../context/ConfirmContext';
import { useGrocery } from '../context/GroceryContext';
import { EditBtn, DeleteBtn } from './IconBtn';
import type { Meal } from '../types';

interface MealsViewProps {
  onEditMeal: (mealId: string) => void;
}

export function MealsView({ onEditMeal }: MealsViewProps) {
  const { meals, deleteMeal, getIngredientById } = useGrocery();
  const { confirm } = useConfirm();

  async function handleDelete(meal: Meal) {
    const confirmed = await confirm({
      title: 'Delete meal?',
      message: `Delete "${meal.name}"? This cannot be undone.`,
      confirmLabel: 'Delete',
    });
    if (confirmed) await deleteMeal(meal.id);
  }

  return (
    <section className="view">
      <ViewHeader
        title="Meals"
        subtitle="Add your meals so you can quickly build shopping lists and meal plans."
      />

      {meals.length === 0 ? (
        <p className="empty-state">No meals yet. Tap Add meal to create one.</p>
      ) : (
        <ul className="item-list">
          {meals.map((meal) => (
            <li key={meal.id} className="card meal-card">
              <div className="meal-card-header">
                <h3>{meal.name}</h3>
                <div className="meal-card-actions">
                  <EditBtn onClick={() => onEditMeal(meal.id)} />
                  <DeleteBtn onClick={() => void handleDelete(meal)} />
                </div>
              </div>
              {meal.ingredientIds.length === 0 ? (
                <p className="hint">No items assigned.</p>
              ) : (
                <ul className="tag-list">
                  {meal.ingredientIds.map((id) => (
                    <li key={id} className="tag">
                      {getIngredientById(id)?.name ?? 'Unknown item'}
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
