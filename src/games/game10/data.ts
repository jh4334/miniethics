import type { CaseData } from './model';
import { CASE_1 } from './case-1';
import { CASE_2 } from './case-2';
import { CASE_3 } from './case-3';

export const PIECES = 6;
export const CASES: CaseData[] = [CASE_1, CASE_2, CASE_3];

export const AI_LINES = [
  "어…? 조각이 자꾸 미끄러져. 나는 책임을 '받을' 수가 없나 봐…",
  '미안한 마음을 갖고 싶은데, 나에겐 마음이 없어…',
  '벌금을 내고 싶어도 내 통장은 없는걸…'
];

export const SAY = {
  a: '그날 일을 보여 줄게… 지금도 아찔해.',
  b: '증거를 꼼꼼히 봐 줘. 나도 진실이 알고 싶어.',
  c: '책임 조각을 공정하게 나눠 줘, 판사님!',
  dOk: '고마워! 이제 누가 뭘 고쳐야 할지 알겠어!',
  dNo: '음… 대법관 의견과 조금 달랐네. 다음 사건도 부탁해!'
};

// ============================================================
// 스타일 (g10- 접두사, cleanup에서 제거)
// ============================================================
