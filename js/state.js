// ============================================
// 진행 상황 저장 (localStorage)
// ============================================

const KEY = 'ai-ethics-minigame-v1';

const defaultState = () => ({
  name: '',
  sound: true,
  lessons: {}, // { [id]: { cleared, stars, bestScore, quizBest } }
});

let state = load();

function load() {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return { ...defaultState(), ...JSON.parse(raw) };
  } catch (e) { /* 시크릿 모드 등에서 실패해도 기본값으로 진행 */ }
  return defaultState();
}

export function save() {
  try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) { /* 무시 */ }
}

export function getState() { return state; }

export function getLesson(id) {
  return state.lessons[id] || { cleared: false, stars: 0, bestScore: 0, quizBest: 0 };
}

export function setLessonResult(id, { stars, score }) {
  const cur = getLesson(id);
  state.lessons[id] = {
    ...cur,
    stars: Math.max(cur.stars, stars),
    bestScore: Math.max(cur.bestScore, score),
  };
  save();
}

export function setQuizResult(id, correct) {
  const cur = getLesson(id);
  state.lessons[id] = { ...cur, cleared: true, quizBest: Math.max(cur.quizBest, correct) };
  save();
}

// 열려 있는 차시 번호 (클리어한 차시 + 1, 최소 1)
export function unlockedUpTo() {
  let n = 1;
  while (n <= 12 && getLesson(n).cleared) n++;
  return Math.min(n, 12);
}

export function clearedCount() {
  let c = 0;
  for (let i = 1; i <= 12; i++) if (getLesson(i).cleared) c++;
  return c;
}

export function totalStars() {
  let s = 0;
  for (let i = 1; i <= 12; i++) s += getLesson(i).stars;
  return s;
}

export function setName(name) { state.name = name; save(); }
export function toggleSound() { state.sound = !state.sound; save(); return state.sound; }

export function resetAll() {
  state = defaultState();
  save();
}
