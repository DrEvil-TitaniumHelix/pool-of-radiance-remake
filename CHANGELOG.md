# Changelog

## v0.2.0-alpha — release candidate (not published)

**Gold Box Plus** — optional additions around the unchanged game (README "Gold Box Plus"). Press **F12**, the **⚙ Menu**
button or the gamepad's Menu button; **"Play the original game"** turns every addition off at once.

- **Plus panel** with tabs: Status, Quests, Journal, Pedia, Map, Helpers, Mods, Keys, Games, About/Credits (Cheats and
  Scenario for developers).
- **Quests**: the City Clerk's commissions and the other council rewards, with offered / accepted / in progress / done /
  rewarded, read from the game's own script flags and texts (`decode/ecl/QUESTS.md`).
- **Journal**: automatic diary (texts, places, talks, fights, treasure), personal notes and map pins, notes in the saves
  ZIP; import of your own *Adventurer's Journal* (PDF or pasted), each entry shown only once the game points to it.
- **Gold Box-pedia**: monsters, people, places, items and spells, revealed as you meet them; search; how-to pages.
- **Automap**: the current area from the game's map data with visited-cell fog, party marker and pins; click a visited
  cell to walk there.
- **Helpers**: tooltips, combat log, quick save F5 / quick load F9, autosave on area entry (Plus slots Q, X/Y/Z through the
  game's own save routine; slots A-J untouched), spell presets, screen margins, crisp font.
- **Mouse**: right-click shows the actions under the pointer (menus, lists, roster, 3D view, combat targets) with cursor
  hints; click-to-walk in the area map; aimed combat actions by clicking a cell.
- **Mods**: skin stack (PNG replacements for game pictures) with enable / disable / order; a sample recolour skin is
  generated in the browser; `docs/MODDING.md`.
- **Games selector** (Pool of Radiance today) as the front door for the Gold Box family.
- **Developer tools** (off by default, `?dev=1`): Cheats tab (scenario install, levels/HP/gold, teleport, script flags),
  `?scenario=<name>` (e.g. `sokal-gate`), Scenario tab (map editing, JSON export; `docs/SCENARIOS.md`).
- Docs: `docs/PLUS_HOOKS.md` (events and state for additions), `docs/MODDING.md`, `docs/SCENARIOS.md`,
  `game/plus/CREDITS.md`.

**How it was checked.** `ACCEPTANCE.md` `## GBP`: 31 player-visible feature rows, each a headless route through the normal
boot with the test party — 31 of 31 PASS. The original game with all additions off was replayed against the DOSBox-X
references: 70 of 70 earlier PASS rows still PASS (0 differing pixels, exact RGB), RUN-1 and the generated test-party run
have identical screenshots.

**Credits.** Darklands+ (MIT) for the designs listed in `game/plus/CREDITS.md` (no code copied); Gold Box Companion
(inspiration only); Dungeon Craft / FRUA (design reference only); Mozilla PDF.js (Apache-2.0) for the optional journal
PDF import.

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
