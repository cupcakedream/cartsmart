import { DAYS_OF_WEEK, type DayOfWeek } from '../constants/daysOfWeek';

interface DayOfWeekCheckboxesProps {
  selectedDays: DayOfWeek[];
  onChange: (days: DayOfWeek[]) => void;
}

export function DayOfWeekCheckboxes({ selectedDays, onChange }: DayOfWeekCheckboxesProps) {
  function toggleDay(day: DayOfWeek) {
    onChange(
      selectedDays.includes(day)
        ? selectedDays.filter((item) => item !== day)
        : [...selectedDays, day],
    );
  }

  return (
    <fieldset className="checkbox-group day-checkbox-group">
      <legend>Days of week</legend>
      {DAYS_OF_WEEK.map((day) => (
        <label key={day} className="checkbox-label">
          <input
            type="checkbox"
            checked={selectedDays.includes(day)}
            onChange={() => toggleDay(day)}
          />
          {day}
        </label>
      ))}
    </fieldset>
  );
}

export function sortDaysOfWeek(days: DayOfWeek[]): DayOfWeek[] {
  return DAYS_OF_WEEK.filter((day) => days.includes(day));
}
