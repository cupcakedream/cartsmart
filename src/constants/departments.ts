export const DEPARTMENTS = [
  'Produce',
  'Meat & Seafood',
  'Dairy & Eggs',
  'Bakery',
  'Frozen',
  'Pantry',
  'Beverages',
  'Snacks',
  'Household',
  'Other',
] as const;

export type Department = (typeof DEPARTMENTS)[number];

export const DEFAULT_DEPARTMENT: Department = 'Other';
