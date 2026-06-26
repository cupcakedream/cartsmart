import { useMemo, useState, type FormEvent } from 'react';
import { ViewHeader } from './ViewHeader';
import { useConfirm } from '../context/ConfirmContext';
import { useGrocery } from '../context/GroceryContext';
import { EditBtn, DeleteBtn, PinBtn } from './IconBtn';
import type { MealPlan } from '../types';

function sortByRecent(plans: MealPlan[]): MealPlan[] {
  return [...plans].sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
  );
}

function mealCount(plan: MealPlan): number {
  return Object.keys(plan.mealDays).length;
}

interface MealPlansViewProps {
  onEditPlan: (planId: string) => void;
}

export function MealPlansView({ onEditPlan }: MealPlansViewProps) {
  const {
    mealPlans,
    addMealPlan,
    deleteMealPlan,
    currentMealPlanId,
    setCurrentMealPlan,
  } = useGrocery();
  const { confirm } = useConfirm();

  const [newPlanName, setNewPlanName] = useState('');

  const sorted = useMemo(() => sortByRecent(mealPlans), [mealPlans]);

  async function handleCreate(event: FormEvent) {
    event.preventDefault();
    await addMealPlan(newPlanName);
    setNewPlanName('');
  }

  async function handleDelete(plan: MealPlan) {
    const confirmed = await confirm({
      title: 'Delete meal plan?',
      message: `Delete "${plan.name}"? This cannot be undone.`,
      confirmLabel: 'Delete',
    });
    if (!confirmed) return;

    await deleteMealPlan(plan.id);
  }

  return (
    <section className="view">
      <ViewHeader
        title="Meal Plans"
        subtitle="Create and manage your meal plans."
      />

      <form className="field-row" onSubmit={handleCreate}>
        <input
          type="text"
          className="field-control"
          value={newPlanName}
          onChange={(event) => setNewPlanName(event.target.value)}
          placeholder="New plan name (optional)"
          aria-label="Meal plan name"
        />
        <button type="submit" className="field-control">
          Create plan
        </button>
      </form>

      {sorted.length === 0 ? (
        <p className="empty-state">No plans yet. Create one above to get started.</p>
      ) : (
        <ul className="item-list">
          {sorted.map((plan) => {
            const count = mealCount(plan);
            const isCurrent =
              currentMealPlanId === plan.id ||
              (currentMealPlanId === null && sorted[0].id === plan.id);

            return (
              <li key={plan.id} className="item-row plan-row">
                <div className="item-row-main">
                  <span className="plan-name-row">
                    {plan.name}
                  </span>
                  <span className="plan-meta">
                    {count} {count === 1 ? 'meal' : 'meals'} scheduled
                  </span>
                </div>
                <div className="item-row-actions">
                  <PinBtn active={isCurrent} onClick={() => void setCurrentMealPlan(plan.id)} />
                  <EditBtn onClick={() => onEditPlan(plan.id)} />
                  <DeleteBtn onClick={() => void handleDelete(plan)} />
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
