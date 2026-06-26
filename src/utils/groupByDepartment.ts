import { DEPARTMENTS, DEFAULT_DEPARTMENT, type Department } from '../constants/departments';
import type { Ingredient } from '../types';

export interface DepartmentGroup {
  department: Department;
  ingredients: Ingredient[];
}

export function groupIngredientsByDepartment(ingredients: Ingredient[]): DepartmentGroup[] {
  const byDepartment = new Map<Department, Ingredient[]>();

  for (const department of DEPARTMENTS) {
    byDepartment.set(department, []);
  }

  for (const ingredient of ingredients) {
    const department = ingredient.department ?? DEFAULT_DEPARTMENT;
    const bucket = byDepartment.get(department) ?? byDepartment.get(DEFAULT_DEPARTMENT)!;
    bucket.push(ingredient);
  }

  return DEPARTMENTS.map((department) => ({
    department,
    ingredients: (byDepartment.get(department) ?? []).sort((a, b) =>
      a.name.localeCompare(b.name),
    ),
  })).filter((group) => group.ingredients.length > 0);
}
