import type { CaseData } from './model';
import { CASES_1 } from './cases-1';
import { CASES_2 } from './cases-2';
import { CASES_3 } from './cases-3';

export const CASES: CaseData[] = [...CASES_1, ...CASES_2, ...CASES_3];

export const TOTAL_CLUES = CASES.reduce(
  (sum, currentCase) => sum + currentCase.spots.filter((spot) => spot.isClue).length,
  0
);
