import { DEPARTMENTS, DEFAULT_DEPARTMENT, type Department } from '../constants/departments';

interface DepartmentSelectProps {
  id?: string;
  value: Department;
  onChange: (department: Department) => void;
  className?: string;
  'aria-label'?: string;
}

export function DepartmentSelect({
  id,
  value,
  onChange,
  className,
  'aria-label': ariaLabel = 'Department',
}: DepartmentSelectProps) {
  return (
    <select
      id={id}
      className={className}
      value={value}
      onChange={(event) => onChange(event.target.value as Department)}
      aria-label={ariaLabel}
    >
      {DEPARTMENTS.map((department) => (
        <option key={department} value={department}>
          {department}
        </option>
      ))}
    </select>
  );
}

export { DEFAULT_DEPARTMENT };
