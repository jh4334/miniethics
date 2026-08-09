import type { SceneManager } from '../core/scene';
import { el, button } from '../ui/components';
import { charImg } from '../assets-manifest';
import { audio } from '../core/audio';
import { save } from '../core/save';

export function titleScene(mgr: SceneManager) {
  return (root: HTMLElement) => {
    const scene = el('div', 'scene title-scene');

    const clouds = el('div', 'title-clouds');
    [
      { top: 60, dur: 55, delay: -10 },
      { top: 150, dur: 70, delay: -40 },
      { top: 260, dur: 62, delay: -25 },
      { top: 90, dur: 80, delay: -60 }
    ].forEach((c) => {
      const cl = el('div', 'cloud', '☁️');
      cl.style.top = `${c.top}px`;
      cl.style.animationDuration = `${c.dur}s`;
      cl.style.animationDelay = `${c.delay}s`;
      clouds.appendChild(cl);
    });
    scene.appendChild(clouds);

    const logo = el(
      'div',
      'title-logo',
      `<div class="small">두근두근!</div>
       <h1><span class="hl">AI 윤리</span> 미니게임 월드</h1>
       <div class="sub">미니게임을 깨면서 인공지능 윤리 수호자가 되어 보자!</div>`
    );
    scene.appendChild(logo);

    const chars = el('div', 'title-chars');
    chars.append(charImg('hero', '', '주인공'), charImg('eti', '', '에티'));
    scene.appendChild(chars);

    const startLabel = save.clearedCount() > 0 ? '이어서 모험하기 ▶' : '모험 시작! ▶';
    const startBtn = button(startLabel, () => mgr.go('worldmap'), 'btn big yellow');
    startBtn.addEventListener('pointerdown', () => audio.unlock(), { once: true });
    scene.appendChild(startBtn);

    scene.appendChild(
      el('div', 'title-footer', '초등 5~6학년 인공지능 윤리 교육 · 태블릿 가로모드 권장')
    );

    root.appendChild(scene);
  };
}
