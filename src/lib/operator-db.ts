/**
 * @fileOverview Local "SQL-like" database for operator validation.
 */

export interface Operator {
  id: string;
  name: string;
  role: 'admin' | 'operator' | 'viewer';
  clearance: string;
}

export const operatorsTable: Operator[] = [
  { id: 'ROOT-01', name: 'System Admin', role: 'admin', clearance: 'Level 5' },
  { id: 'NAV-02', name: 'Fleet Navigator', role: 'operator', clearance: 'Level 3' },
  { id: 'GUEST-99', name: 'Guest Observer', role: 'viewer', clearance: 'Level 1' },
];

export function validateOperator(id: string): Operator | undefined {
  return operatorsTable.find(o => o.id.toUpperCase() === id.toUpperCase());
}
