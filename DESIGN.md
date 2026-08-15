# Miniethics Design System

## 1. Atmosphere and identity

Miniethics is a bright, cel-shaded AI ethics adventure for Korean grade 5–6 learners. The interface should feel playful and encouraging while keeping instructional copy, choices, and progress unmistakably clear. Accessibility takes priority over decorative motion or visual novelty.

## 2. Palette tokens

- Primary purple: `#7c5cff`; dark state: `#5a3fd6`.
- Feedback: green `#51cf66`, red `#ff6b6b`, yellow `#ffd93d`.
- Supporting accents: pink `#ff8fb1`, mint `#6ee7c8`, sky `#7cc7ff`, orange `#ffab5e`.
- Text: ink `#3a3352`, soft ink `#6b6488`; surfaces: paper `#fffdf5`, cream `#fff7e0`.
- Focus must remain visible independently of fill color. Correct, wrong, current, locked, and selected states must not rely on color alone.

## 3. Typography

The self-hosted SUIT Variable font is primary, followed by Korean-capable system sans-serif fonts. Main headings use 36–52 logical px, learning copy 22–30 px, and auxiliary labels at least 17 px. Korean text uses semantic phrase wrapping; instructional copy is selectable and zoomable.

## 4. Spacing, shape, and depth

The logical canvas is 1280×800. A 4 px spacing rhythm underlies 8/12/16/20/24/32 px gaps. Cards use the shared 22 px radius and restrained `0 6px` shadow. Primary actions need generous separation and a minimum 44 physical px target after scaling.

## 5. Reusable primitives and states

- `.btn`: default, yellow primary, mint success/navigation, ghost secondary, disabled, focus-visible, active.
- `.icon-btn`: icon with a stable Korean accessible name; the name updates when the action changes.
- `.card`: paper surface for mission, summary, quiz, settings, recovery, and results.
- `.island`: locked/disabled, current, cleared/stars, playable, focus-visible.
- `.dialog-box`: speaker, live dialogue text, keyboard/pointer advance, mission transition.
- Quiz choices: default, disabled, correct, wrong, and explained states with a live explanation.
- Status surfaces: map toast and orientation hint are polite announcements; recovery failures are alerts.

## 6. Motion

Scene entrance, bobbing characters, clouds, waves, focus pulses, typing, feedback, and star reveals support hierarchy but never carry meaning alone. Under `prefers-reduced-motion: reduce`, continuous CSS motion stops, typing and decorative Web Animations resolve immediately, and feedback remains visible as a stable end state.

## 7. Responsive and input contract

The single 1280×800 coordinate system is preserved and fitted to the available viewport. Keyboard, touch, pointer, and switch-style activation share the same actions. Browser zoom must remain available. Safe-area, contrast, coarse-pointer, portrait, CJK wrapping, and 375/768/1280 viewport rules are extended in Stage 8.

## 8. Accessibility personas and acceptance

1. A typical grade 5–6 tablet learner needs large, forgiving actions and short Korean instructions.
2. A keyboard-only learner must complete title → map → story → game start with visible focus.
3. A motion-sensitive learner receives stable states without infinite or Web Animation motion.
4. A low-vision/high-contrast learner can zoom and distinguish every state without color alone.
5. A Korean/CJK learner sees intact glyphs, natural phrase wrapping, and no orphaned particles.

The target is WCAG 2.2 AA for the core journey. New scenes focus their heading, icon-only actions have Korean names, live changes are announced with the correct politeness, locked lessons expose why they are unavailable, and educational text remains selectable.

## Accessibility debt register

| Item | Severity | Resolution |
| --- | --- | --- |
| Browser zoom is blocked by the current viewport meta | Major | Stage 8 removes the restriction and verifies 200% zoom |
| Fixed-canvas safe-area and forced-colors behavior are not yet specified | Major | Stage 8 adds tokens, rules, and browser coverage |
| Individual mini-games beyond the core journey have uneven focus semantics | Moderate | Stage 9 all-game smoke records failures; incremental game fixes follow contract evidence |
| Canvas scaling can make logical targets physically small on narrow portrait screens | Moderate | Stage 8 establishes coarse-pointer target sizing and viewport acceptance |

No Critical accessibility debt is accepted. Major debt must have an active stage and executable acceptance test.
