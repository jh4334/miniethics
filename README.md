# AI 윤리 미니게임 월드 🤖⭐

초등학교 5~6학년을 위한 **인공지능 윤리 12차시** 교육용 미니게임 웹앱(PWA)입니다.
주인공 요원이 가이드 로봇 '에티'와 함께 AI 월드의 12개 섬을 여행하며
혼란에 빠진 AI 친구들을 도와 **AI 윤리 수호자**가 되는 스토리 진행형 게임입니다.

- 태블릿 가로모드 기준(안드로이드/iOS 브라우저 모두 지원)
- 설치 없이 링크로 배포, 홈 화면에 추가하면 전체화면 앱처럼 동작
- 진행도·별점은 기기(localStorage)에 자동 저장

## 현재 구현 상태

**12차시 전체 구현 완료!** 🎉

1. AI 요리사 키우기 (AI 학습 원리) 2. 편식하는 AI (데이터 편향) 3. 개인정보 지킴이 (개인정보)
4. 진짜가짜 탐정단 (딥페이크) 5. 추천 소용돌이 탈출 (필터버블) 6. 작품 주인 찾기 (저작권)
7. 챗봇 마음 충전소 (대화 예절) 8. 미루의 숙제 대작전 (AI 의존) 9. AI 심판 고치기 (공정성)
10. 자율주행 법정 (책임) 11. 팩트체크 특공대 (환각) 12. 최종 보스전: 카오스의 성 (종합)

전체 차시 설계는 [docs/curriculum.md](docs/curriculum.md) 참고.

## 실행 방법

```bash
npm install
npm run dev        # 개발 서버 (http://localhost:5173)
npm run dev:lan    # 신뢰할 수 있는 교실 네트워크에만 공개
npm run build      # 배포용 빌드 → dist/
npm run preview    # 빌드 결과 미리보기
npm test           # 단위·계약 테스트
npm run test:unit  # 단위·계약 테스트
npm run test:contracts # 커리큘럼·에셋·모듈 계약
npm run test:e2e   # 실제 Chromium 학습 흐름 테스트
npm run check:ci   # 배포 전 전체 품질 게이트
```

## 수업 운영 팁

- **가로모드 권장**, 세로로 들어도 축소되어 플레이 가능
- 월드맵 **⚙️ 설정**: 진행 요약(차시별 별·점수 표), 진행 초기화(학급 교체용, 2단계 확인)
- 음소거(🔊)는 기기별로 저장됨. 뒤로가기는 앱 종료 대신 상위 화면으로 이동
- 12차시 완주 시 'AI 윤리 수호자 임명장'이 1회 표시됨

같은 와이파이의 태블릿에서 보려면 신뢰할 수 있는 교실 네트워크에서만
`npm run dev:lan`을 실행하고, 터미널의 `Network:` 주소를 태블릿 브라우저에서 엽니다.
기본 `npm run dev`는 이 컴퓨터에서만 접속할 수 있습니다.

## 배포 (GitHub Pages 등)

`npm run build` 후 `dist/` 폴더를 정적 호스팅(GitHub Pages, Netlify 등)에 올리면 끝.
상대 경로로 빌드되므로 어떤 하위 경로에 올려도 동작합니다.

## 그림 교체

캐릭터 14종, 배경 14종, 앱 아이콘은 완성된 PNG가 적용되어 있습니다.
파일 규격과 안전한 교체 절차는 [docs/asset-guide.md](docs/asset-guide.md)를 참고하세요.

## 새 미니게임 추가하기

1. `src/games/gameXX-이름.ts` 생성 — `MiniGame` 인터페이스(`mount`/`finish`) 구현
2. `src/games/registry.ts`에 등록
3. 1~3차시는 `src/data/curriculum.ts`, 4~12차시는 `src/data/lessons/lessonXX.ts`에 스토리·퀴즈 작성
4. `npm run check:ci`로 단위·계약·Chromium·빌드를 모두 검증

Game 04와 Game 10은 공개 진입 파일이 레지스트리 계약만 유지하고, 구현은 각각
`src/games/game04-deepfake/`, `src/games/game10-responsibility/` 아래에 나뉩니다.
controller는 상태·타이머·정리를, view/phase 모듈은 DOM 표현을, model/cases/copy는
부작용 없는 타입·콘텐츠를 소유합니다. 게임 수정 PR에서는 `public/assets/**`를 함께
고치지 말고 에셋 작업을 별도 PR로 분리합니다.

## 기술 스택

Vite + TypeScript (프레임워크 없음) · PWA(서비스워커 오프라인 캐시) · WebAudio 합성 효과음
