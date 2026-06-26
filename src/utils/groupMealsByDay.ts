import {
  DAYS_OF_WEEK,
  UNSCHEDULED_LABEL,
  getDaysOfWeekStartingFrom,
  getTodayDayOfWeek,
  type DayOfWeek,
} from '../constants/daysOfWeek';
import type { Meal } from '../types';

export interface DayMealGroup {
  day: DayOfWeek | typeof UNSCHEDULED_LABEL;
  meals: Meal[];
}

export function groupMealsByDay(meals: Meal[]): DayMealGroup[] {
  const mealDays: Record<string, DayOfWeek[]> = {};
  for (const meal of meals) {
    if (meal.daysOfWeek.length > 0) {
      mealDays[meal.id] = meal.daysOfWeek;
    }
  }
  return groupMealsByDayFromPlan(meals, mealDays);
}

/** Groups meals by day using the mealDays map from a MealPlan object. */
export function groupMealsByDayFromPlan(
  meals: Meal[],
  mealDays: Record<string, DayOfWeek[]>,
): DayMealGroup[] {
  const byDay = new Map<DayOfWeek, Meal[]>();

  for (const day of DAYS_OF_WEEK) {
    byDay.set(day, []);
  }

  const unscheduled: Meal[] = [];

  for (const meal of meals) {
    const days = mealDays[meal.id] ?? [];
    if (days.length === 0) {
      unscheduled.push(meal);
      continue;
    }

    for (const day of days) {
      if (byDay.has(day)) {
        byDay.get(day)!.push(meal);
      }
    }
  }

  const orderedDays = getDaysOfWeekStartingFrom(getTodayDayOfWeek());

  const groups: DayMealGroup[] = orderedDays.map((day) => ({
    day,
    meals: (byDay.get(day) ?? []).sort((a, b) => a.name.localeCompare(b.name)),
  }));

  if (unscheduled.length > 0) {
    groups.push({
      day: UNSCHEDULED_LABEL,
      meals: unscheduled.sort((a, b) => a.name.localeCompare(b.name)),
    });
  }

  return groups;
}
