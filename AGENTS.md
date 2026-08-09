# AGENTS.md — 에이전트 작업 안내

이 저장소는 초등 5~6학년용 **AI 윤리 미니게임 웹앱(PWA)** 입니다. (Vite + TypeScript, 프레임워크 없음)

## 프로젝트 구조

- `src/scenes/` — 타이틀/월드맵/스토리/게임/결과 씬
- `src/games/` — 미니게임 모듈 (`registry.ts`에 등록)
- `src/data/curriculum.ts` — 12차시 주제·스토리 대사·퀴즈 데이터
- `src/assets-manifest.ts` — 캐릭터 이미지 로더 (PNG 우선, 없으면 SVG 폴백)
- `public/assets/` — 캐릭터 그림 (교체 대상)
- `docs/` — 커리큘럼 설계, 에셋 가이드

## 자주 하는 작업

- **캐릭터 에셋 교체**: `docs/ASSET_TASK.md`의 지시를 그대로 따를 것
- **새 미니게임 추가**: `src/games/gameXX-이름.ts` 생성 → `registry.ts` 등록 → `curriculum.ts`에서 해당 차시 `playable: true` + 스토리/퀴즈 채우기

## 규칙

- 확인 명령: `npm install && npm run build` (타입체크 포함). 빌드가 깨지면 작업 완료가 아님
- UI 텍스트는 초등학생 눈높이의 한국어, 존댓말 해요체
- 이미지는 `public/assets/` 아래 **정해진 파일명**으로만 추가 (코드가 파일명으로 찾음)
- `dist/`, `node_modules/`는 커밋하지 않음
