export interface Actor {
  emoji: string;
  x: number;
  y: number;
  size?: number;
  /** 이동 목표 x (있으면 transition으로 이동) */
  tx?: number;
  /** 이동 시간(ms) */
  dur?: number;
  /** 등장 시각(ms). 없으면 처음부터 보임 */
  at?: number;
  sound?: 'bad' | 'pop';
}

export interface Evidence {
  icon: string;
  title: string;
  desc: string;
}

export interface Defendant {
  key: string;
  icon: string;
  name: string;
  sub: string;
  /** 대법관 의견(적정 범위) */
  min: number;
  max: number;
  reason: string;
  /** AI 피고(조각 배치 불가) */
  ai?: boolean;
}

export interface CaseData {
  title: string;
  desc: string;
  actors: Actor[];
  evidence: Evidence[];
  defendants: Defendant[];
}
