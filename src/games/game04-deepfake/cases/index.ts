import { CASE_1 } from './case-1';
import { CASE_2 } from './case-2';
import { CASE_3 } from './case-3';
import { CASE_4 } from './case-4';
import { CASE_5 } from './case-5';
import { CASE_6 } from './case-6';

export const CASES = [CASE_1, CASE_2, CASE_3, CASE_4, CASE_5, CASE_6];
export const TOTAL_CLUES = CASES.reduce(
  (sum, item) => sum + item.spots.filter((spot) => spot.isClue).length,
  0
);
