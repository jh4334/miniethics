export const GAME04_STYLES = `
.g04-scene { background: linear-gradient(180deg,#ffe6f0 0%,#fff6fa 55%,#f2ecff 100%); }
.g04-lens {
  font-size: 24px; font-weight: 800; background: rgba(255,255,255,0.92);
  padding: 8px 18px; border-radius: 999px; box-shadow: var(--shadow); white-space: nowrap;
}
.g04-post {
  position: absolute; left: 40px; top: 86px; width: 620px; height: 694px;
  background: #fff; border-radius: 22px; box-shadow: var(--shadow);
  padding: 16px; box-sizing: border-box;
}
.g04-post-head { height: 66px; display: flex; align-items: center; gap: 12px; }
.g04-avatar {
  width: 54px; height: 54px; border-radius: 50%; background: #f1edff;
  display: flex; align-items: center; justify-content: center; font-size: 32px; flex: none;
}
.g04-account { flex: 1; font-size: 23px; font-weight: 800; color: var(--ink); line-height: 1.25; }
.g04-badge {
  font-size: 20px; font-weight: 800; color: #fff; background: var(--purple);
  padding: 7px 15px; border-radius: 999px; flex: none;
}
.g04-photo {
  position: relative; width: 588px; height: 420px; border-radius: 14px; overflow: hidden;
}
.g04-obj {
  position: absolute; transform: translate(-50%,-50%);
  display: flex; align-items: center; justify-content: center; line-height: 1;
  text-align: center;
}
.g04-marker {
  position: absolute; width: max(72px,var(--minimum-target-size)); height: max(72px,var(--minimum-target-size)); transform: translate(-50%,-50%);
  border-radius: 50%; border: 4px solid rgba(255,255,255,0.92);
  background: rgba(255,255,255,0.26); color: #fff; font-size: 32px; padding: 0;
  display: flex; align-items: center; justify-content: center; cursor: pointer;
  font-family: var(--font); z-index: 6; animation: g04-twinkle 1.5s ease-in-out infinite;
}
.g04-marker:focus-visible {
  animation:none; outline:8px solid var(--purple-dark); outline-offset:4px;
  box-shadow:0 0 0 5px #fff;
}
@keyframes g04-twinkle {
  0%,100% { box-shadow: 0 0 0 0 rgba(255,255,255,0.75); }
  50% { box-shadow: 0 0 0 12px rgba(255,255,255,0); }
}
.g04-marker.found {
  border-color: var(--red); background: rgba(255,107,107,0.4); animation: none;
}
.g04-marker.checked {
  border-color: rgba(110,110,120,0.9); background: rgba(110,110,120,0.4); animation: none;
}
.g04-marker.off { opacity: 0.32; animation: none; cursor: default; }
.g04-caption {
  margin-top: 14px; font-size: 22px; font-weight: 700; line-height: 1.4; color: var(--ink);
}
.g04-meta { margin-top: 10px; font-size: 20px; color: var(--ink-soft); }
.g04-zoom-back { position: absolute; inset: 0; background: rgba(30,25,50,0.55); z-index: 15; }
.g04-zoom {
  position: absolute; left: 50%; top: 50%; transform: translate(-50%,-50%);
  width: 470px; background: var(--paper); border-radius: 20px; padding: 16px 20px 18px;
  z-index: 16; text-align: center; box-shadow: 0 10px 0 rgba(0,0,0,0.2);
  animation: pop-in 0.25s ease;
}
.g04-zoom-emoji { font-size: 76px; line-height: 1.1; }
.g04-zoom-title { font-size: 22px; font-weight: 800; color: var(--purple); }
.g04-zoom-text { font-size: 22px; line-height: 1.5; margin: 8px 0 14px; color: var(--ink); }
.g04-stamp {
  position: absolute; left: 50%; top: 50%;
  transform: translate(-50%,-50%) rotate(-14deg);
  font-size: 46px; font-weight: 800; padding: 14px 28px; border-radius: 18px;
  border: 8px solid; background: rgba(255,255,255,0.92); z-index: 18; white-space: nowrap;
  animation: g04-stamp-in 0.4s ease;
}
.g04-stamp.ok { color: var(--green); border-color: var(--green); }
.g04-stamp.no { color: var(--red); border-color: var(--red); }
@keyframes g04-stamp-in {
  from { transform: translate(-50%,-50%) rotate(-14deg) scale(2.6); opacity: 0; }
  to { transform: translate(-50%,-50%) rotate(-14deg) scale(1); opacity: 1; }
}
.g04-note {
  position: absolute; left: 690px; top: 86px; width: 550px; height: 694px;
  padding: 16px 18px; box-sizing: border-box; display: flex; flex-direction: column;
}
.g04-detective { display: flex; align-items: center; gap: 12px; }
.g04-detective img { height: 104px; flex: none; }
.g04-bubble {
  flex: 1; background: #fff; border: 4px solid var(--ink); border-radius: 16px;
  padding: 10px 14px; font-size: 22px; font-weight: 700; line-height: 1.35; color: var(--ink);
}
.g04-notes-title { margin-top: 12px; font-size: 23px; font-weight: 800; color: var(--ink); }
.g04-notes {
  flex: 1; margin-top: 8px; overflow-y: auto; background: #fff;
  border-radius: 14px; padding: 12px 14px; min-height: 0;
}
.g04-line { font-size: 22px; line-height: 1.4; margin-bottom: 10px; }
.g04-line.clue { color: var(--red); font-weight: 800; }
.g04-line.ok { color: var(--ink-soft); }
.g04-line.miss { color: var(--red); font-weight: 700; opacity: 0.85; }
.g04-empty { font-size: 22px; color: var(--ink-soft); line-height: 1.4; }
.g04-verdict { display: flex; gap: 14px; margin-top: 14px; }
.g04-verdict .btn { flex: 1; min-height: max(76px,var(--minimum-target-size)); font-size: 26px; }
/* 사건 전환 직후 오탭 방지: 잠깐 입력을 막는다 (모양은 그대로) */
.g04-verdict.g04-lock { pointer-events: none; }
.g04-answer { font-size: 30px; font-weight: 800; text-align: center; margin: 6px 0 10px; }
.g04-answer.ok { color: var(--green); }
.g04-answer.no { color: var(--red); }
.g04-explain-text {
  flex: 1; background: #fff; border-radius: 14px; padding: 14px 16px;
  font-size: 23px; line-height: 1.55; color: var(--ink); overflow-y: auto; min-height: 0;
}
.g04-next { margin-top: 14px; min-height: max(76px,var(--minimum-target-size)); font-size: 26px; width: 100%; }
`;
