export const GAME10_STYLES = `
/* 상단바에서 점수를 오른쪽 끝으로 밀어내는 여백 (타이머 바 대신) */
.g10-spacer { flex:1; }

.g10-scene { background:
  linear-gradient(180deg, color-mix(in srgb, var(--game-white) 45%, transparent), color-mix(in srgb, var(--game-white) 15%, transparent)),
  linear-gradient(180deg,var(--game10-scene-top) 0%,var(--game10-scene-mid) 55%,var(--game10-scene-bottom) 100%);
  background-size: cover; }

/* 좌측 피고인석: 부릉이 */
.g10-dock { position:absolute; left:14px; top:78px; width:292px; text-align:center; z-index:14; }
.g10-say { background:var(--game-white); border-radius:20px; padding:14px 16px; font-size:22px; font-weight:700;
  line-height:1.45; color:var(--ink); box-shadow:var(--shadow); position:relative; min-height:112px;
  display:flex; align-items:center; justify-content:center; }
.g10-say::after { content:''; position:absolute; left:50%; bottom:-15px; margin-left:-11px;
  border:11px solid transparent; border-top-color:var(--game-white); }
.g10-body { margin-top:26px; }
.g10-body img { width:180px; filter:drop-shadow(0 8px 0 var(--game-shadow-tint)); }
.g10-body.shake { animation:g10-shake .5s ease; }
@keyframes g10-shake { 0%,100%{transform:translateX(0)} 20%{transform:translateX(-10px) rotate(-4deg)}
  50%{transform:translateX(10px) rotate(4deg)} 80%{transform:translateX(-6px)} }
.g10-dock-name { margin-top:2px; font-size:22px; font-weight:800; color:var(--ink-soft); }
.g10-dock-tag { display:inline-block; margin-top:6px; font-size:19px; font-weight:800; color:var(--game-white);
  background:var(--purple); border-radius:999px; padding:4px 14px; }

/* 무대 */
.g10-stage { position:absolute; left:318px; top:78px; right:14px; bottom:14px; }
.g10-title { font-size:30px; font-weight:800; text-align:center; margin-bottom:10px; }
.g10-title small { display:block; font-size:21px; color:var(--ink-soft); }
.g10-panel { background:var(--paper); border-radius:22px; box-shadow:var(--shadow); padding:14px 16px; }

/* A: 사건 재생 */
.g10-play { position:relative; height:236px; overflow:hidden; border-radius:18px;
  background:linear-gradient(180deg,var(--game10-road-sky) 0%,var(--game10-road-horizon) 62%,var(--game10-road-ground) 62%,var(--game10-road-shadow) 100%); }
.g10-actor { position:absolute; line-height:1; transition:opacity .25s ease; }
.g10-actor.g10-in { animation:g10-pop .35s ease; }
@keyframes g10-pop { from{transform:scale(.4)} 60%{transform:scale(1.2)} to{transform:scale(1)} }
.g10-road { position:absolute; left:0; right:0; top:172px; height:8px; background:var(--game-white);
  opacity:.85; background-image:repeating-linear-gradient(90deg,var(--game-white) 0 46px, transparent 46px 92px); }
.g10-desc { margin-top:14px; font-size:24px; line-height:1.55; font-weight:700; color:var(--ink);
  background:var(--game-white); border-radius:16px; padding:14px 16px; min-height:96px; }
.g10-center { text-align:center; margin-top:16px; }
.g10-center .btn { min-height:max(76px,var(--minimum-target-size)); font-size:28px; }

/* B: 증거 조사 */
.g10-evrow { display:flex; gap:18px; justify-content:center; }
.g10-ev { width:290px; height:380px; perspective:900px; cursor:pointer;
  border:0; padding:0; background:none; color:inherit; font:inherit; }
.g10-ev:focus-visible, .g10-def:focus-visible {
  outline:8px solid var(--purple-dark); outline-offset:4px;
  box-shadow:0 0 0 5px var(--game-white), 0 0 0 13px var(--purple-dark);
}
.g10-ev-inner { position:relative; width:100%; height:100%; transform-style:preserve-3d;
  transition:transform .5s ease; }
.g10-ev.flip .g10-ev-inner { transform:rotateY(180deg); }
.g10-face { position:absolute; inset:0; backface-visibility:hidden; -webkit-backface-visibility:hidden;
  border-radius:22px; box-shadow:var(--shadow); display:flex; flex-direction:column;
  align-items:center; justify-content:center; padding:16px; text-align:center; }
.g10-face.front { background:linear-gradient(160deg,var(--game10-evidence-start),var(--game10-evidence-end)); color:var(--game-white); }
.g10-face.front .g10-q { font-size:74px; }
.g10-face.front .g10-n { font-size:26px; font-weight:800; margin-top:10px; }
.g10-face.back { background:var(--game-white); transform:rotateY(180deg); border:5px solid var(--yellow); }
.g10-face.back .g10-ico { font-size:64px; }
.g10-face.back .g10-t { font-size:25px; font-weight:800; margin:8px 0 8px; }
.g10-face.back .g10-d { font-size:21px; line-height:1.5; color:var(--ink-soft); font-weight:700; }
.g10-face.back .g10-more { margin-top:10px; font-size:18px; font-weight:800; color:var(--purple-dark); }
.g10-ev:active .g10-ev-inner { filter:brightness(.96); }
.g10-gate { margin-top:18px; text-align:center; }
.g10-gate .btn { min-height:max(76px,var(--minimum-target-size)); font-size:28px; }
.g10-off { background:var(--game-disabled); color:var(--ink); box-shadow:0 6px 0 var(--game-disabled-shadow); }
.g10-hint { margin-top:10px; font-size:21px; font-weight:800; color:var(--ink-soft); }

/* 확대 모달 */
.g10-modal { position:absolute; inset:0; background:var(--game-overlay); z-index:60;
  display:flex; align-items:center; justify-content:center; }
.g10-modal-card { width:660px; background:var(--game-white); border-radius:26px; padding:26px; text-align:center;
  box-shadow:var(--shadow); animation:g10-zoom .25s ease; }
@keyframes g10-zoom { from{transform:scale(.85);opacity:0} to{transform:scale(1);opacity:1} }
.g10-modal-card .g10-ico { font-size:82px; }
.g10-modal-card .g10-t { font-size:32px; font-weight:800; margin:8px 0 10px; }
.g10-modal-card .g10-d { font-size:25px; line-height:1.6; color:var(--ink-soft); font-weight:700;
  margin-bottom:18px; }

/* C: 책임 나누기 */
.g10-defrow { display:flex; gap:14px; justify-content:center; }
.g10-def { flex:1; background:var(--game-white); border-radius:20px; box-shadow:var(--shadow); padding:12px 8px 10px;
  text-align:center; cursor:pointer; border:5px solid transparent;
  transition:transform .1s ease, border-color .2s ease; color:inherit; font:inherit; }
.g10-def:active { transform:translateY(4px); }
.g10-def.hot { border-color:var(--yellow); }
.g10-def.ai { background:var(--game-ai-surface); border-color:var(--game-ai-border); cursor:pointer; }
.g10-def-ico { font-size:60px; line-height:1.1; height:76px; display:flex; align-items:center;
  justify-content:center; }
.g10-def-ico img { width:76px; }
.g10-def-name { font-size:24px; font-weight:800; }
.g10-def-sub { font-size:18px; font-weight:800; color:var(--ink-soft); margin-bottom:6px; }
.g10-slots { min-height:92px; border-radius:14px; background:var(--game-muted-surface); padding:6px 4px;
  display:flex; flex-wrap:wrap; gap:4px; align-items:center; justify-content:center; }
.g10-slots.on { background:color-mix(in srgb, var(--yellow) 26%, var(--game-white)); }
.g10-chip { font-size:32px; line-height:1; animation:g10-pop .3s ease; }
.g10-slots-hint { font-size:17px; font-weight:800; color:var(--ink-soft); }
.g10-tray { margin-top:14px; background:var(--paper); border-radius:20px; box-shadow:var(--shadow);
  padding:10px 14px; display:flex; align-items:center; gap:12px; justify-content:center;
  min-height:96px; }
.g10-tray-label { font-size:21px; font-weight:800; color:var(--ink-soft); }
.g10-token { width:64px; height:64px; border-radius:16px; background:var(--yellow);
  border:4px solid var(--game-token-border); display:flex; align-items:center; justify-content:center; font-size:32px; }
.g10-token.empty { background:var(--game-empty); border-color:var(--game-empty-border); opacity:.5; }
.g10-fly { position:absolute; z-index:80; font-size:40px; width:64px; height:64px; border-radius:16px;
  background:var(--yellow); border:4px solid var(--game-token-border); display:flex; align-items:center;
  justify-content:center; transform:translate(-50%,-50%);
  transition:left .34s cubic-bezier(.3,.8,.4,1), top .34s cubic-bezier(.3,.8,.4,1); }
/* AI 피고 위에서 미끄러지는 흔들림 (끝나면 원래 transform으로 복귀 → 트레이로 되돌아감) */
.g10-fly.slip { animation:g10-slip .44s ease; }
@keyframes g10-slip {
  0%   { transform:translate(-50%,-50%) rotate(0deg); }
  18%  { transform:translate(-60%,-44%) rotate(-18deg); }
  40%  { transform:translate(-40%,-58%) rotate(18deg); }
  62%  { transform:translate(-60%,-42%) rotate(-14deg); }
  82%  { transform:translate(-44%,-54%) rotate(10deg); }
  100% { transform:translate(-50%,-50%) rotate(0deg); }
}

/* D: 판결 결과 */
.g10-gavel { position:absolute; left:50%; top:40px; margin-left:-60px; font-size:110px; z-index:70;
  animation:g10-bang .7s ease forwards; pointer-events:none; }
@keyframes g10-bang { 0%{transform:translateY(-260px) rotate(-40deg); opacity:0}
  55%{transform:translateY(0) rotate(10deg); opacity:1}
  70%{transform:translateY(-30px) rotate(-6deg)}
  100%{transform:translateY(0) rotate(0); opacity:0} }
.g10-vrow { display:flex; align-items:center; gap:12px; background:var(--game-white); border-radius:16px;
  padding:9px 14px; margin-bottom:9px; box-shadow:var(--shadow); }
.g10-vico { font-size:38px; width:46px; text-align:center; }
.g10-vico img { width:46px; vertical-align:middle; }
.g10-vname { flex:1; text-align:left; }
.g10-vname b { font-size:23px; }
.g10-vreason { font-size:18px; font-weight:700; color:var(--ink-soft); line-height:1.35; }
.g10-vnum { font-size:21px; font-weight:800; text-align:center; min-width:104px;
  background:var(--game-muted-surface); border-radius:12px; padding:6px 8px; }
.g10-vnum span { display:block; font-size:16px; color:var(--ink-soft); }
.g10-vmark { font-size:26px; width:70px; text-align:center; white-space:nowrap; }
.g10-casescore { text-align:center; font-size:34px; font-weight:800; color:var(--purple);
  margin:6px 0 2px; }
.g10-over-lines { font-size:23px; line-height:1.65; color:var(--ink-soft); margin-bottom:12px; }
.g10-over-score { font-size:62px; font-weight:800; color:var(--purple); }
.g10-over-say { font-size:22px; font-weight:800; margin:10px 0 18px; line-height:1.5; }

/* 안내 팝업 */
.g10-tip { position:absolute; inset:0; background:var(--game-overlay); z-index:65;
  display:flex; align-items:center; justify-content:center; }
.g10-tip-card { width:720px; background:var(--game-white); border-radius:26px; padding:26px 28px; text-align:center;
  box-shadow:var(--shadow); animation:g10-zoom .25s ease; }
.g10-tip-card img { width:120px; }
.g10-tip-card .g10-tip-text { font-size:25px; line-height:1.6; font-weight:700; color:var(--ink);
  margin:10px 0 18px; }
`;

// ============================================================
// 게임
// ============================================================
