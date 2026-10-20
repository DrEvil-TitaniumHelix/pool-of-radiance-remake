# RUN-1 — menu → load shipped save A → Phlan → walk → Encamp → Save (slot B) → reload B (por-build-qa)

Driver: `node acceptance/integration/run.mjs acceptance/integration/RUN-1.json` (one headless Chrome, run lock), query
`sting=1&seed=1&fast=4` (STING = START.EXE STING: no title/credits/wheel). Shots: `acceptance/integration/out/RUN-1/`.
Comparison: `wsl bash acceptance/integration/cmp_run1.sh` (acceptance/ref/compare.py, exact RGB 320×200).
Result (14:00): **all 13 steps run without error; save/reload round trip works.**

| step | keys | result | reference | differing px | notes |
|---|---|---|---|---|---|
| 1 party-menu | — | idle | REF-MENU | **0** | |
| 2 load-which | L | idle | REF-LOAD | **0** | |
| 3 phlan-view | A | idle | ECL-03 | **0** | READY TO PLAY condition (load save + Phlan) |
| 4 walk-1 | ↑ | idle | — | — | warning: ECL host `playOrStopSound` not bound (no step sound) → #qa-5 |
| 5 walk-3 | ↑↑ | idle | — | — | |
| 6 turn | ← | idle | — | — | 14,4 S |
| 7 encamp | E | idle | ECL-14 | 751 (first run 75) | camp picture PIC 1Dh, frames, roster, "THE PARTY MAKES CAMP...", CAMP menu; differences = status line (reference taken at another position/time) + animated camp fire frame (timing) |
| 8 save-which | S | idle | — | — | "SAVE WHICH GAME: A B C D E F G H I J" |
| 9 save-B-quit-prompt | B | idle | VIEW-10 | 420 | "QUIT TO DOS YES NO"; differences only in the status line row 15 (bbox 146..295 × 120..127) |
| 10 quit-no | N | idle | — | — | back to the camp menu |
| 11 camp-exit | E | idle | — | — | explore screen |
| 12 reload-menu | page reload, same browser store | idle | REF-MENU | **0** | |
| 13 reload-load-B | L B | idle | — | — | the saved game: 14,4 S 10:51, door ahead — position and time restored from slot B |

History: first runs stopped at Encamp — MAGIC `g.RestClock` (fixed by por-build-magic, this lane) and RedrawCurrentMode passing the
plain DS word as the animation record (#qa-4; works now). Open: #qa-5 (step sound / clock binding).
