# Pool of Radiance (SSI, 1988) in the browser

A rebuild of **Pool of Radiance** (Strategic Simulations, Inc., 1988, the first Advanced Dungeons & Dragons "Gold
Box" game) that runs in a web browser. It was made from a full decode of the original Turbo Pascal 6 program and its
overlays, including the game's event-script engine (ECL): every routine was turned into pseudocode, verified, and
translated into JavaScript. Status: **alpha (v0.1.0-alpha)**, the rougher of the two first examples; ready for
community testing.

**Bring your own copy.** This repository contains none of the game's files: no program, data, graphics or sound. You
need your own copy of Pool of Radiance, version 1.3; the browser checks it and plays from it on your machine. The
engine was built from an analysis of the original program, not clean-room; all rights to the game stay with its
publisher and rights holders.

- [Play](#play) · [Modify](#modify) · [Decode](#decode) · [Credits and licence](#credits-and-licence)

## Play

**What you need:** your own copy of *Pool of Radiance* (SSI), **version 1.3**: the game folder with `START.EXE`, `ITEMS` and
the 113 `.DAX` files (a `SAVE` folder with your old saves is welcome but optional). No game file is part of this
repository; the browser checks your files against `game/byoc/manifest-por-1.3.json` (sizes + SHA-256) and keeps them in
its own storage. Other versions (1.0, 1.1, other re-releases) are refused with a clear message (v1.3 only). Store
releases are untested; if yours is refused, open an issue with the importer's list of mismatched files (names only).
A current Chrome or Edge is recommended (folder picker); other browsers can pick or drop the files instead.

**Start:**
1. Get the game: `git clone https://github.com/DrEvil-TitaniumHelix/pool-of-radiance-remake`, or download the release
   zip from the repository's *Releases* page and unpack it.
2. Serve the `game/` folder over HTTP: `python -I tools/serve.py 8188 --player` (any static web server works).
3. Open http://localhost:8188/index.html.
4. **First start:** the import screen asks for the game folder: *Choose folder*, *Choose files…*, or drop the folder onto
   the page. The files are checked, stored, and the game starts. From then on it starts directly.
   If the browser cannot store them (private window, blocked site data), the game can still run for this tab only.

**Where things live (in the browser profile, per site):** the game files in IndexedDB `por-data`, your saves (the game's
`SAVE\` directory, save slots A-J and character files) in IndexedDB `por-save`. The gear button (top right, outside the
game screen) shows the imported version, re-imports or removes the game files, and exports / imports saves
(`por-saves-<date>.zip`). Removing the game files never touches the saves. Nothing is uploaded.

**Controls:**
- Keyboard as in the original: cursor keys move / turn, the highlighted letters choose menu entries, Enter, Esc,
  Home / End (keypad 7 / 1) select the previous / next party member and move through lists, Ctrl-S sound on/off.
- Gamepad: d-pad = cursor keys, A = Enter, B = Esc, X / Y = move the menu highlight, Menu = the settings (gear).
- Mouse (an addition; it only types the keys above): click a menu word = its letter; click a list item = move there, click
  it again = Enter; mouse wheel = up/down in lists; click a party member = select that member; in the 3D view click left /
  centre / right = turn left / step forward / turn right; right-click = Esc.
- The code wheel check is skipped (`?wheel=1` shows it).

**Known alpha limitations** (from `ACCEPTANCE.md` and `docs/DEVIATIONS.md`):
- Not reached or not verified yet: the **overland map** (wilderness travel), the **endgame** (dragon finale), number /
  text entry in events, damage reports from script events, and a few rare combat messages (8 acceptance rows pending).
- Not a bug: after Quick combat a character may keep a bow readied and show a worse AC; the original does the same
  (confirmed in DOSBox, `#r2-2` in `docs/DEVIATIONS.md`).
- Game over ends with `PROGRAM TERMINATED.` instead of returning to DOS.
- Where the original reads uninitialised memory, the build uses a fixed value (listed per routine in
  `docs/DEVIATIONS.md`).

**Report a problem:** open an issue in this repository (templates are provided): name the **screen** (what it shows,
or its id from `ACCEPTANCE.md`, such as `CB-05`), attach your saves (gear button, *E - Export saves*), and say which
**browser** and version. If the original game does the same, say so: such reports get the "original did this too"
label.

## Modify

- **Engine** (`game/engine/`): display (EGA 320×200), DAX files and pictures, text, input (keyboard, gamepad, mouse),
  Turbo Pascal semantics (`tp.js`, exact `Random`), files and saves, the ECL script VM (`ecl.js`), the importer
  (`byoc.js`). API and URL test options: [game/README.md](game/README.md).
- **Game logic** (`game/areas/`): one file per area and per original overlay (`view_ov28.js`, `combat_ov13.js`,
  `party_ov17.js` …); every routine carries the `{ seg:off }` address of the original routine it translates, so each
  line traces back to `decode/pseudo/`. Changing a rule or a screen is an edit here.
- **Acceptance** (`ACCEPTANCE.md`): 105 rows covering all 106 screen ids: **69 PASS** (0 differing pixels against the
  original running in DOSBox-X, exact RGB), **25 DIFF** with the cause stated in the row (almost all random state or
  timing), 1 without its own screen, 2 that cannot occur in the browser, 8 pending. Per-shot reports (keys, SHA-256 of
  the build shot and the reference, differing pixels): `acceptance/reports/`. Screenshots are not committed (they show
  the original's art). Integration runs: `acceptance/integration/` (RUN-1 load/save round trip, RUN-2 fight / camp /
  cast / temple / training / save, RUN-3 sweep of all 29 script areas). Unit tests: `game/test/`.

## Decode

- `decode/pseudo/` — Pascal-style pseudocode per area (`ENGINE`, `VIEW`, `ECL`, `PARTY`, `MAGIC`, `COMBAT`.pas.md),
  their screens, argument checks (`_ARGCHECK.md`) and independent verification reports (`_VERIFY.md`).
- `decode/names/`, `decode/GLOBALS.md`, `decode/CROSSREF.md`, `decode/LAYOUT.md` — names of routines and globals,
  cross-references, the program and overlay layout; `decode/ecl/ECL_VM.md` — the event-script VM; `decode/data/` —
  file-format specs (DAX, saves, pictures).
- `DECODE_GATE.md` — the gate met before building (10 items with evidence); `BUILD_PLAN.md`; `docs/BYOC.md` — how the
  public tree stays free of original bytes (`tools/public_gate.py`).
- Evidence rules: every claim cites a `seg:off` address or is marked unknown; quoted game text is short and serves as
  evidence.

Built with **Remaster DOS Games** (https://github.com/DrEvil-TitaniumHelix/remaster-dos-games), method version
v0.1.0: the method, tools and templates this decode followed.

## Credits and licence

- **Pool of Radiance** © 1988 Strategic Simulations, Inc. (SSI), developed and published by SSI under licence from TSR.
  Advanced Dungeons & Dragons and Forgotten Realms are trademarks of their owner (Wizards of the Coast). All rights to
  the game stay with its rights holders. This project is not affiliated with or endorsed by them.
- Rebuild, decode and tools: **DrEvil** (DrEvil and Titanium Helix LLC).
- Code: MIT ([LICENSE-MIT](LICENSE-MIT)); documentation: CC BY 4.0 ([LICENSE-DOCS](LICENSE-DOCS)); see [LICENSE](LICENSE).
- Bring your own copy: this repository contains no original game files; the engine was derived from analysis of the
  original program, not clean-room.

Disclaimer: all or part of this repository may have been written or edited by super intelligence
