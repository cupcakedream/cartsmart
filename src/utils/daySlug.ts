import { DAYS_OF_WEEK, type DayOfWeek } from '../constants/daysOfWeek';

export function dayToSlug(day: DayOfWeek): string {
  return day.toLowerCase();
}

export function slugToDay(slug: string): DayOfWeek | null {
  const match = DAYS_OF_WEEK.find((day) => dayToSlug(day) === slug.toLowerCase());
  return match ?? null;
}
