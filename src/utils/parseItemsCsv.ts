import { DEFAULT_DEPARTMENT, DEPARTMENTS, type Department } from '../constants/departments';

export interface ParsedCsvItem {
  name: string;
  department: Department;
}

function parseCsvLine(line: string): string[] {
  const cells: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      inQuotes = !inQuotes;
      continue;
    }
    if (char === ',' && !inQuotes) {
      cells.push(current.trim());
      current = '';
      continue;
    }
    current += char;
  }

  cells.push(current.trim());
  return cells;
}

function parseDepartment(value: string | undefined): Department {
  if (!value?.trim()) return DEFAULT_DEPARTMENT;

  const match = DEPARTMENTS.find(
    (department) => department.toLowerCase() === value.trim().toLowerCase(),
  );
  return match ?? DEFAULT_DEPARTMENT;
}

function isHeaderRow(cells: string[]): boolean {
  const first = cells[0]?.toLowerCase();
  return first === 'name' || first === 'item' || first === 'item name';
}

export function parseItemsCsv(text: string): ParsedCsvItem[] {
  const lines = text.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  const items: ParsedCsvItem[] = [];
  const seen = new Set<string>();

  for (let index = 0; index < lines.length; index++) {
    const cells = parseCsvLine(lines[index]);
    if (cells.length === 0) continue;
    if (index === 0 && isHeaderRow(cells)) continue;

    const name = cells[0]?.trim();
    if (!name) continue;

    const key = name.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);

    items.push({
      name,
      department: parseDepartment(cells[1]),
    });
  }

  return items;
}
