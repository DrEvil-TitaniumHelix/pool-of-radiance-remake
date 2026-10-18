# Changelog

## v0.1.0-alpha — 2026-10-18 (first public release)

**What plays.** Title, credits and the start menu; party creation, loading and saving (slots A-J,
character files); exploring Phlan and every script area of the game (29 of 29 reached and played in an automated
sweep with a level-4 test party, `acceptance/integration/RUN-3.md`); combat (manual and Quick), treasure, camp,
memorize and cast, rest, temple and training (`RUN-2.md`); save and reload (`RUN-1.md`). Keyboard as in the original,
plus gamepad and mouse (the mouse only types the original keys). The code wheel check is skipped (`?wheel=1` shows it).

**How it was checked.** `ACCEPTANCE.md`: 105 rows covering all 106 screen ids: 69 PASS (0 differing pixels against
the original in DOSBox-X, exact RGB), 25 DIFF with the cause stated (almost all random state or timing), 1 without a
screen of its own, 2 that cannot occur in the browser, 8 pending. Per-shot reports: `acceptance/reports/`.

**Known open points.**
- Not reached or not verified yet: the overland map (AD-06, AD-07, EV-18), the dragon finale (EV-17), number / text
  entry in events (EV-04), damage reports from script events (EV-10), effects with messages in combat (CB-14) and the
  debug line (SY-03).
- Game over ends with `PROGRAM TERMINATED.` instead of returning to DOS (SV-03).
- Where the original reads uninitialised memory, the build uses a fixed value (`docs/DEVIATIONS.md`).

**Bring your own copy.** Needs Pool of Radiance **version 1.3**: `START.EXE`, `ITEMS` and the 113 `.DAX` files (115
required files, checked by size and SHA-256 against `game/byoc/manifest-por-1.3.json`); `GAME.OVR` is checked when
present but not stored; your `SAVE` folder is optional. Other versions are refused. Nothing is uploaded. Chrome or Edge
recommended; serve with `python -I tools/serve.py 8188 --player`.
