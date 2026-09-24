// 선생님 메뉴: PIN 확인 → 차시 열기 · 하루 한 차시 규칙 · 진행 초기화
// 학생이 설정 화면에서 스스로 진도를 올리거나 기록을 지우지 못하게 PIN을 거친다.

import { el, button } from './components';
import { classroom } from '../core/classroom';
import { save } from '../core/save';
import { LESSONS } from '../data/curriculum';

export interface TeacherPanelOptions {
  /** 오버레이를 붙일 부모 */
  host: HTMLElement;
  /** 설정이 바뀌어 월드맵을 다시 그려야 할 때 */
  onChanged(): void;
  /** 진행 초기화 후 */
  onReset(): void;
}

export function openTeacherPanel(opts: TeacherPanelOptions) {
  const overlay = el('div', 'quit-confirm');
  overlay.setAttribute('role', 'dialog');
  overlay.setAttribute('aria-modal', 'true');
  overlay.setAttribute('aria-label', '선생님 메뉴');
  const card = el('div', 'card quit-card teacher-card');
  overlay.appendChild(card);
  opts.host.appendChild(overlay);
  let changed = false;

  const close = () => {
    overlay.remove();
    if (changed) opts.onChanged();
  };

  if (classroom.hasPin()) showPinGate();
  else showPinCreate();

  function pinInput(id: string, label: string): HTMLInputElement {
    const input = el('input', 'pin-input');
    input.id = id;
    input.type = 'password';
    input.inputMode = 'numeric';
    input.autocomplete = 'off';
    input.maxLength = 4;
    input.pattern = '\\d{4}';
    input.setAttribute('aria-label', label);
    return input;
  }

  function showPinGate() {
    card.innerHTML = `
      <div style="font-size:48px">👩‍🏫</div>
      <h2>선생님 메뉴</h2>
      <p>선생님 PIN 4자리를 입력해 주세요.</p>`;
    const input = pinInput('teacher-pin', '선생님 PIN');
    const msg = el('p', 'pin-msg');
    msg.setAttribute('role', 'status');
    const submit = () => {
      if (classroom.checkPin(input.value)) showMenu();
      else {
        msg.textContent = 'PIN이 맞지 않아요.';
        input.value = '';
        input.focus();
      }
    };
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') submit();
    });
    const btns = el('div', 'quit-btns');
    btns.append(button('확인', submit, 'btn mint'), button('닫기', close, 'btn ghost'));
    card.append(input, msg, btns);
    card.appendChild(
      el(
        'p',
        'pin-help',
        'PIN을 잊었다면 브라우저 설정에서 이 사이트의 데이터를 지우면 처음 상태로 돌아가요. (기록도 함께 지워져요)'
      )
    );
    input.focus();
  }

  function showPinCreate() {
    card.innerHTML = `
      <div style="font-size:48px">👩‍🏫</div>
      <h2>선생님 PIN 만들기</h2>
      <p>이 기기에서 쓸 숫자 4자리를 정해 주세요.<br>차시 열기와 기록 초기화에 필요해요.</p>`;
    const input = pinInput('teacher-pin-new', '새 PIN 4자리');
    const msg = el('p', 'pin-msg');
    msg.setAttribute('role', 'status');
    const submit = () => {
      if (classroom.setPin(input.value)) showMenu();
      else {
        msg.textContent = '숫자 4자리로 입력해 주세요.';
        input.focus();
      }
    };
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') submit();
    });
    const btns = el('div', 'quit-btns');
    btns.append(button('PIN 저장', submit, 'btn mint'), button('닫기', close, 'btn ghost'));
    card.append(input, msg, btns);
    input.focus();
  }

  function showMenu() {
    card.innerHTML = `<h2>👩‍🏫 선생님 메뉴</h2>`;

    // ---- 차시 열기 ----
    const unlockRow = el('div', 'teacher-row');
    const unlockLabel = el('div', 'teacher-label');
    const renderUnlock = () => {
      const n = classroom.get().unlockThrough;
      unlockLabel.innerHTML =
        n === 0
          ? '<b>차시 열기</b><br>꺼짐 · 앞 차시를 끝내야 다음 차시가 열려요'
          : `<b>차시 열기</b><br>1~${n}차시를 진도와 상관없이 열어 둬요`;
      value.textContent = n === 0 ? '끔' : `${n}차시`;
    };
    const value = el('span', 'teacher-value');
    value.setAttribute('aria-live', 'polite');
    const step = (d: number) => {
      classroom.setUnlockThrough(classroom.get().unlockThrough + d);
      changed = true;
      renderUnlock();
    };
    const stepper = el('div', 'teacher-stepper');
    stepper.append(
      button('－', () => step(-1), 'btn small', '열어 둘 차시 줄이기'),
      value,
      button('＋', () => step(1), 'btn small', '열어 둘 차시 늘리기')
    );
    unlockRow.append(unlockLabel, stepper);
    renderUnlock();

    // ---- 하루 한 차시 ----
    const dailyRow = el('div', 'teacher-row');
    const dailyLabel = el('div', 'teacher-label');
    const dailyBtn = button('', () => {
      classroom.setDailyLimit(!classroom.get().dailyLimit);
      changed = true;
      renderDaily();
    }, 'btn small');
    const renderDaily = () => {
      const on = classroom.get().dailyLimit;
      dailyLabel.innerHTML = `<b>하루 한 차시</b><br>${
        on ? '오늘 처음 끝낸 차시의 다음 차시는 내일 열려요' : '끝내면 바로 다음 차시가 열려요'
      }`;
      dailyBtn.textContent = on ? '켜짐' : '꺼짐';
      dailyBtn.setAttribute('aria-pressed', String(on));
    };
    dailyRow.append(dailyLabel, dailyBtn);
    renderDaily();

    const lastLesson = LESSONS[LESSONS.length - 1].id;
    const note = el(
      'p',
      'pin-help',
      `차시 열기는 별과 완료 기록을 바꾸지 않아요. (최대 ${lastLesson}차시)`
    );

    // ---- 초기화 (2단계 확인) ----
    const btns = el('div', 'quit-btns');
    const reset = button('🗑️ 기록 처음부터', () => {
      reset.remove();
      const really = button(`정말 초기화 (⭐ ${save.totalStars()}개 삭제)`, () => {
        save.reset();
        overlay.remove();
        opts.onReset();
      }, 'btn pink');
      btns.prepend(really);
    }, 'btn ghost');
    btns.append(reset, button('닫기', close, 'btn mint'));

    card.append(unlockRow, dailyRow, note, btns);
  }
}
