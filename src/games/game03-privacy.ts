// 3차시: 개인정보 지킴이 (반사신경 캐치)
// 정보 카드가 정보도둑 쪽으로 흘러간다.
// 개인정보 카드는 탭해서 방패로 지키고, 공개해도 되는 정보는 그냥 보낸다.

import type { MiniGame, GameCtx } from './registry';
import { el, button, floater } from '../ui/components';
import { charImg } from '../assets-manifest';

interface InfoCard {
  emoji: string;
  text: string;
  personal: boolean;
}

const PERSONAL: InfoCard[] = [
  { emoji: '🏠', text: '우리 집 주소', personal: true },
  { emoji: '📱', text: '내 전화번호', personal: true },
  { emoji: '🔑', text: '비밀번호', personal: true },
  { emoji: '🏫', text: '학교와 반', personal: true },
  { emoji: '📷', text: '얼굴 사진', personal: true },
  { emoji: '🆔', text: '주민등록번호', personal: true },
  { emoji: '👨‍👩‍👧', text: '가족 이름', personal: true },
  { emoji: '📍', text: '지금 있는 위치', personal: true }
];

const SAFE: InfoCard[] = [
  { emoji: '🎨', text: '좋아하는 색깔', personal: false },
  { emoji: '⚽', text: '좋아하는 운동', personal: false },
  { emoji: '🍕', text: '좋아하는 음식', personal: false },
  { emoji: '🎵', text: '좋아하는 노래', personal: false },
  { emoji: '📚', text: '재미있는 책', personal: false },
  { emoji: '🐶', text: '좋아하는 동물', personal: false }
];

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// 웨이브 구성: [카드 수, 이동 시간(ms), 생성 간격(ms)]
const WAVES = [
  { count: 8, travel: 9000, gap: 2100 },
  { count: 12, travel: 6500, gap: 1400 }
];

const LANES_Y = [30, 180, 330]; // g3-lane 내부 상대 y
const REACH_X = 980; // 이 지점을 넘으면 도둑에게 도착

export const game03: MiniGame = {
  lessonId: 3,
  mount(container: HTMLElement, ctx: GameCtx) {
    const wrap = el('div', 'game-wrap g3-scene');
    container.appendChild(wrap);

    const totalCards = WAVES.reduce((s, w) => s + w.count, 0);
    let hearts = 3;
    let correctCount = 0;
    let processed = 0;
    let ended = false;
    const timers: number[] = [];
    let raf = 0;

    // ---------- 상단 바 ----------
    const topbar = el('div', 'game-topbar');
    const quit = button('🗺️', () => ctx.quit(), 'icon-btn');
    const name = el('div', 'game-name', '🛡️ 개인정보 지킴이');
    const spacer = el('div', 'spacer');
    const heartsEl = el('div', 'hearts', '❤️❤️❤️');
    const scoreEl = el('div', 'game-score', '지킴 0');
    topbar.append(quit, name, spacer, heartsEl, scoreEl);
    wrap.appendChild(topbar);

    // ---------- 캐릭터 ----------
    const hero = el('div', 'g3-hero');
    hero.appendChild(charImg('hero', '', '주인공'));
    const monster = el('div', 'g3-monster', '👾');
    wrap.append(hero, monster);

    // ---------- 안내 ----------
    const guide = el('div', 'g3-guide');
    guide.innerHTML = `
      <div class="g3-rule">🔒 개인정보 → <b>탭해서 방패!</b></div>
      <div class="g3-rule">✅ 공개 OK 정보 → <b>그냥 보내기</b></div>`;
    wrap.appendChild(guide);

    const lane = el('div', 'g3-lane');
    wrap.appendChild(lane);

    // ---------- 카드 이동 ----------
    interface Live {
      card: InfoCard;
      elem: HTMLElement;
      x: number;
      speed: number; // px per ms
      done: boolean;
    }
    const live: Live[] = [];

    function updateHud() {
      heartsEl.textContent = '❤️'.repeat(hearts) + '🖤'.repeat(3 - hearts);
      scoreEl.textContent = `지킴 ${correctCount}`;
    }

    function resolve(item: Live, ok: boolean) {
      if (item.done) return;
      item.done = true;
      processed++;
      if (ok) correctCount++;
      updateHud();
      if (processed >= totalCards) {
        timers.push(window.setTimeout(finish, 700));
      }
    }

    function spawn(card: InfoCard, travel: number) {
      if (ended) return;
      const elem = el(
        'div',
        'g3-card',
        `<div class="g3-emoji">${card.emoji}</div><div class="g3-text">${card.text}</div>`
      );
      const y = LANES_Y[Math.floor(Math.random() * LANES_Y.length)] + Math.random() * 40;
      elem.style.top = `${y}px`;
      elem.style.left = '-260px';
      lane.appendChild(elem);

      const item: Live = { card, elem, x: -260, speed: (REACH_X + 280) / travel, done: false };
      live.push(item);

      elem.addEventListener('pointerdown', () => {
        if (item.done || ended) return;
        if (card.personal) {
          // 개인정보를 지켰다!
          elem.classList.add('shielded');
          ctx.audio.good();
          floater(wrap, item.x + 130, y + 130, '지켰다! 🛡️', true);
          resolve(item, true);
          timers.push(
            window.setTimeout(() => {
              elem.remove();
            }, 550)
          );
        } else {
          // 공개해도 되는 정보를 막음 (실수)
          ctx.audio.bad();
          floater(wrap, item.x + 130, y + 130, '이건 공개해도 OK! 😅', false);
          elem.classList.add('leaked');
          timers.push(window.setTimeout(() => elem.classList.remove('leaked'), 450));
          resolve(item, false);
          // 카드는 계속 흘러가게 둔다
          item.done = true;
        }
      });
    }

    function loop(prev: number) {
      raf = requestAnimationFrame((now) => {
        const dt = Math.min(50, now - prev);
        for (const item of live) {
          if (!item.elem.isConnected) continue;
          if (item.elem.classList.contains('shielded')) continue;
          item.x += item.speed * dt;
          item.elem.style.left = `${item.x}px`;
          if (item.x >= REACH_X) {
            if (!item.done) {
              if (item.card.personal) {
                // 개인정보가 도둑에게 넘어감!
                hearts--;
                ctx.audio.bad();
                floater(wrap, 1050, 320, '개인정보 도난! 💥', false);
                monster.animate(
                  [{ transform: 'translateY(-50%) scale(1)' }, { transform: 'translateY(-50%) scale(1.35)' }, { transform: 'translateY(-50%) scale(1)' }],
                  { duration: 350 }
                );
                resolve(item, false);
                if (hearts <= 0) {
                  finish();
                }
              } else {
                // 공개 가능한 정보는 지나가도 괜찮다
                floater(wrap, 1020, 320, '괜찮은 정보! ✅', true);
                ctx.audio.pop();
                resolve(item, true);
              }
            }
            item.elem.remove();
          }
        }
        if (!ended) loop(now);
      });
    }

    // ---------- 웨이브 진행 ----------
    function runWave(waveIdx: number) {
      if (ended) return;
      const wave = WAVES[waveIdx];
      if (!wave) return;

      const banner = el('div', 'g3-wave-banner', `WAVE ${waveIdx + 1}!`);
      wrap.appendChild(banner);
      ctx.audio.fanfare();
      timers.push(window.setTimeout(() => banner.remove(), 1100));

      // 개인정보:안전정보 ≈ 6:4 비율로 섞기
      const personalN = Math.round(wave.count * 0.6);
      const cards = shuffle([
        ...shuffle([...PERSONAL, ...PERSONAL]).slice(0, personalN),
        ...shuffle([...SAFE, ...SAFE]).slice(0, wave.count - personalN)
      ]);

      cards.forEach((c, i) => {
        timers.push(window.setTimeout(() => spawn(c, wave.travel), 1200 + i * wave.gap));
      });

      // 다음 웨이브 예약
      if (waveIdx + 1 < WAVES.length) {
        timers.push(
          window.setTimeout(
            () => runWave(waveIdx + 1),
            1200 + cards.length * wave.gap + wave.travel + 600
          )
        );
      }
    }

    function finish() {
      if (ended) return;
      ended = true;
      cancelAnimationFrame(raf);
      const score = Math.round((correctCount / totalCards) * 100);
      const survived = hearts > 0;

      const overlay = el('div', 'game-over-overlay');
      const cardEl = el('div', 'card howto-card');
      cardEl.innerHTML = `
        <h2>${survived ? '개인정보를 지켰다! 🛡️' : '도둑에게 당했다… 💦'}</h2>
        <div class="howto-icons">${survived ? '🦸✨' : '👾💨'}</div>
        <div class="howto-desc">
          바르게 처리한 정보: <b>${correctCount} / ${totalCards}</b><br>
          남은 하트: <b>${'❤️'.repeat(Math.max(0, hearts)) || '없음'}</b><br><br>
          개인정보는 <b>방패로!</b> 취미 같은 정보는 <b>공개해도 OK!</b>
        </div>`;
      const done = button('결과 보기 🏆', () => ctx.finish(score), 'btn big yellow');
      cardEl.appendChild(done);
      overlay.appendChild(cardEl);
      wrap.appendChild(overlay);
      if (survived) ctx.audio.fanfare();
    }

    updateHud();
    runWave(0);
    loop(performance.now());

    return () => {
      ended = true;
      cancelAnimationFrame(raf);
      timers.forEach((t) => clearTimeout(t));
      wrap.remove();
    };
  }
};
