import { useGrocery } from '../context/GroceryContext';
import { UNSCHEDULED_LABEL } from '../constants/daysOfWeek';
import type { DayOfWeek } from '../constants/daysOfWeek';
import { ViewHeader } from './ViewHeader';
import { groupMealsByDayFromPlan } from '../utils/groupMealsByDay';
import { EditBtn } from './IconBtn';

interface WeeklyPlanViewProps {
  /** When provided, shows this specific plan instead of the current one. */
  planId?: string;
  /** Called when the user taps Edit on a day card. */
  onEditDay: (day: DayOfWeek) => void;
}

export function WeeklyPlanView({ planId, onEditDay }: WeeklyPlanViewProps) {
  const { meals, getIngredientById, getCurrentMealPlan, mealPlans } = useGrocery();

  const plan = planId
    ? (mealPlans.find((p) => p.id === planId) ?? null)
    : getCurrentMealPlan();

  if (!plan) {
    return (
      <section className="view">
        <ViewHeader title="Meal plan" subtitle="No meal plan yet." />
        <p className="empty-state">No meal plan yet. Create one from Manage Plans.</p>
      </section>
    );
  }

  if (meals.length === 0) {
    return (
      <section className="view">
        <ViewHeader title={plan.name} subtitle="Weekly meal plan." />
        <p className="empty-state">No meals yet. Add meals first, then assign them to days.</p>
      </section>
    );
  }

  const groups = groupMealsByDayFromPlan(meals, plan.mealDays);
  const scheduledGroups = groups.filter((group) => group.day !== UNSCHEDULED_LABEL);
  const unscheduledGroup = groups.find((group) => group.day === UNSCHEDULED_LABEL);

  return (
    <section className="view">
      <ViewHeader title={plan.name} subtitle="Weekly meal plan." />

      <div className="weekly-plan">
        {scheduledGroups.map((group) => (
          <section key={group.day} className="card day-plan-card">
            <div className="day-plan-header">
              <h3 className="day-plan-heading">{group.day}</h3>
              <EditBtn onClick={() => onEditDay(group.day as DayOfWeek)} />
            </div>
            {group.meals.length === 0 ? (
              <p className="hint">No meals scheduled.</p>
            ) : (
              <ul className="day-meal-list">
                {group.meals.map((meal) => (
                  <li key={meal.id} className="day-meal-item">
                    <span className="day-meal-name">{meal.name}</span>
                    {meal.ingredientIds.length > 0 && (
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
        ))}
      </div>

      {unscheduledGroup && unscheduledGroup.meals.length > 0 && (
        <section className="card day-plan-card unscheduled-section">
          <h3 className="day-plan-heading">{UNSCHEDULED_LABEL}</h3>
          <p className="hint">These meals have no day assigned in this plan yet.</p>
          <ul className="day-meal-list">
            {unscheduledGroup.meals.map((meal) => (
              <li key={meal.id} className="day-meal-item">
                <span className="day-meal-name">{meal.name}</span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </section>
  );
}
