// 12차시 전체 회귀 스모크 테스트
// 사용법: npm run build && npm run preview (다른 터미널) 후 npm run test:smoke
//   - 크롬 실행 파일 경로가 다르면 CHROME_PATH 환경변수로 지정
import { chromium } from 'playwright-core';

const BASE = process.env.SMOKE_URL || 'http://localhost:4173/';
const CHROME =
  process.env.CHROME_PATH || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';

const browser = await chromium.launch({ executablePath: CHROME, args: ['--no-sandbox'] });
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
const errors = [];
page.on('pageerror', (e) => errors.push(`PAGEERROR: ${e.message}`));
page.on('console', (m) => {
  if (m.type() === 'error') errors.push(`CONSOLE: ${m.text().slice(0, 200)}`);
});

// 전 차시 해금 시드
await page.addInitScript(() => {
  const records = {};
  for (let i = 1; i <= 12; i++) records[i] = { stars: 1, bestScore: 80, quizBest: 2, cleared: true };
  localStorage.setItem('miniethics-save-v1', JSON.stringify({ records }));
});

const report = [];
for (let id = 1; id <= 12; id++) {
  errors.length = 0;
  try {
    await page.goto(BASE);
    await page.waitForTimeout(500);
    await page.getByText('이어서 모험하기').click();
    await page.waitForTimeout(500);
    await page.locator('.island').nth(id - 1).click();
    await page.waitForTimeout(600);
    await page.getByText('건너뛰기').click({ timeout: 5000 });
    await page.waitForTimeout(500);
    await page.getByText('게임 시작!').click({ timeout: 5000 });
    await page.waitForTimeout(500);
    await page.getByText('시작! 🚀').click({ timeout: 5000 });
    await page.waitForTimeout(2500);
    const els = await page.locator('.game-wrap *').count();
    report.push({ id, ok: errors.length === 0 && els > 3, els, errors: [...errors] });
  } catch (e) {
    report.push({ id, ok: false, els: 0, errors: [...errors, `FLOW: ${String(e).slice(0, 200)}`] });
  }
}
await browser.close();

const fail = report.filter((r) => !r.ok);
console.log(`PASS ${report.length - fail.length}/12`);
if (fail.length) {
  console.error(JSON.stringify(fail, null, 1));
  process.exit(1);
}
