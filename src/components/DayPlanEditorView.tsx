import { useEffect, useMemo, useState, type FormEvent } from 'react';
import {
  DAYS_OF_WEEK,
  getDaysOfWeekStartingFrom,
  type DayOfWeek,
} from '../constants/daysOfWeek';
import { useGrocery } from '../context/GroceryContext';
import type { Meal, MealPlan } from '../types';
import { ViewHeader } from './ViewHeader';
import { sortDaysOfWeek } from './DayOfWeekCheckboxes';

interface DayPlanEditorViewProps {
  day: DayOfWeek;
  onBack: () => void;
  /** When provided, edits this specific plan instead of the current one. */
  planId?: string;
}

type DaySelections = Record<DayOfWeek, string[]>;

function mealDaysToSelections(mealDays: Record<string, DayOfWeek[]>): DaySelections {
  const selections = DAYS_OF_WEEK.reduce((acc, day) => {
    acc[day] = [];
    return acc;
  }, {} as DaySelections);

  for (const [mealId, days] of Object.entries(mealDays)) {
    for (const day of days) {
      if (selections[day]) {
        selections[day].push(mealId);
      }
    }
  }

  return selections;
}

function selectionsToPlanMealDays(
  selectionsByDay: DaySelections,
  meals: Meal[],
): Record<string, DayOfWeek[]> {
  const mealDays: Record<string, DayOfWeek[]> = {};

  for (const meal of meals) {
    const days = sortDaysOfWeek(
      DAYS_OF_WEEK.filter((day) => selectionsByDay[day].includes(meal.id)),
    );
    if (days.length > 0) {
      mealDays[meal.id] = days;
    }
  }

  return mealDays;
}

interface DayPlanDaySectionProps {
  day: DayOfWeek;
  isPrimary: boolean;
  meals: Meal[];
  selectedMealIds: string[];
  onToggleMeal: (mealId: string) => void;
}

function DayPlanDaySection({
  day,
  isPrimary,
  meals,
  selectedMealIds,
  onToggleMeal,
}: DayPlanDaySectionProps) {
  return (
    <section className={`card day-plan-edit-section${isPrimary ? ' day-plan-edit-section-primary' : ''}`}>
      <h3 className="day-plan-edit-heading">{day}</h3>
      {meals.length === 0 ? (
        <p className="hint">No meals match your search.</p>
      ) : (
        <div className="scrollable-list ingredient-picker day-plan-edit-picker">
          {meals.map((meal) => (
            <label key={meal.id} className="checkbox-label">
              <input
                type="checkbox"
                checked={selectedMealIds.includes(meal.id)}
                onChange={() => onToggleMeal(meal.id)}
              />
              {meal.name}
            </label>
          ))}
        </div>
      )}
    </section>
  );
}

interface NoPlanProps {
  onBack: () => void;
}

function NoPlan({ onBack }: NoPlanProps) {
  return (
    <section className="view">
      <ViewHeader title="No meal plan" subtitle="Create a meal plan first." />
      <p className="empty-state">No meal plan found. Create one from Manage Plans.</p>
      <div className="form-actions">
        <button type="button" className="btn-secondary field-control" onClick={onBack}>
          Back
        </button>
      </div>
    </section>
  );
}

export function DayPlanEditorView({ day, onBack, planId }: DayPlanEditorViewProps) {
  const { meals, getCurrentMealPlan, mealPlans, updateMealPlan } = useGrocery();

  const currentPlan: MealPlan | null = planId
    ? (mealPlans.find((p) => p.id === planId) ?? null)
    : getCurrentMealPlan();

  const [selectionsByDay, setSelectionsByDay] = useState<DaySelections>(() =>
    currentPlan ? mealDaysToSelections(currentPlan.mealDays) : mealDaysToSelections({}),
  );
  const [mealSearch, setMealSearch] = useState('');
  const [saving, setSaving] = useState(false);

  const orderedDays = useMemo(() => getDaysOfWeekStartingFrom(day), [day]);

  useEffect(() => {
    setSelectionsByDay(
      currentPlan ? mealDaysToSelections(currentPlan.mealDays) : mealDaysToSelections({}),
    );
    setMealSearch('');
  }, [day, currentPlan]);

  const filteredMeals = useMemo(() => {
    const query = mealSearch.trim().toLowerCase();
    if (!query) return meals;
    return meals.filter((meal) => meal.name.toLowerCase().includes(query));
  }, [meals, mealSearch]);

  function toggleMealForDay(targetDay: DayOfWeek, mealId: string) {
    setSelectionsByDay((current) => ({
      ...current,
      [targetDay]: current[targetDay].includes(mealId)
        ? current[targetDay].filter((id) => id !== mealId)
        : [...current[targetDay], mealId],
    }));
  }

  async function handleSave(event: FormEvent) {
    event.preventDefault();
    if (!currentPlan) return;

    setSaving(true);
    try {
      await updateMealPlan({
        ...currentPlan,
        mealDays: selectionsToPlanMealDays(selectionsByDay, meals),
        updatedAt: new Date().toISOString(),
      });
      onBack();
    } finally {
      setSaving(false);
    }
  }

  if (!currentPlan) {
    return <NoPlan onBack={onBack} />;
  }

  return (
    <section className="view">
      <ViewHeader title={day} subtitle={`Editing "${currentPlan.name}"`} />

      {meals.length === 0 ? (
        <p className="empty-state">No meals yet. Add meals first, then assign them here.</p>
      ) : (
        <form className="day-plan-edit-form" onSubmit={handleSave}>
          <div className="card form-card day-plan-edit-search">
            <input
              type="search"
              className="field-control search-input"
              value={mealSearch}
              onChange={(event) => setMealSearch(event.target.value)}
              placeholder="Search meals…"
              aria-label="Search meals"
            />
          </div>

          <div className="day-plan-edit-stack">
            {orderedDays.map((targetDay) => (
              <DayPlanDaySection
                key={targetDay}
                day={targetDay}
                isPrimary={targetDay === day}
                meals={filteredMeals}
                selectedMealIds={selectionsByDay[targetDay]}
                onToggleMeal={(mealId) => toggleMealForDay(targetDay, mealId)}
              />
            ))}
          </div>

          <div className="form-actions">
            <button type="submit" className="field-control" disabled={saving}>
              {saving ? 'Saving…' : 'Save'}
            </button>
          </div>
        </form>
      )}
    </section>
  );
}
