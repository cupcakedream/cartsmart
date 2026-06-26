export const DAYS_OF_WEEK = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
] as const;

export type DayOfWeek = (typeof DAYS_OF_WEEK)[number];

export const UNSCHEDULED_LABEL = 'Unscheduled';

const JS_DAY_TO_WEEKDAY: DayOfWeek[] = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
];

export function getTodayDayOfWeek(): DayOfWeek {
  return JS_DAY_TO_WEEKDAY[new Date().getDay()];
}

export function getDaysOfWeekStartingFrom(start: DayOfWeek): DayOfWeek[] {
  const index = DAYS_OF_WEEK.indexOf(start);
  if (index === -1) return [...DAYS_OF_WEEK];

  return [...DAYS_OF_WEEK.slice(index), ...DAYS_OF_WEEK.slice(0, index)];
}
