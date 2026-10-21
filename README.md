# Pool of Radiance (SSI, 1988) in the browser

A rebuild of **Pool of Radiance** (Strategic Simulations, Inc., 1988, the first Advanced Dungeons & Dragons "Gold
Box" game) that runs in a web browser. It was made from a full decode of the original Turbo Pascal 6 program and its
overlays, including the game's event-script engine (ECL): every routine was turned into pseudocode, verified, and
translated into JavaScript. Status: **alpha (v0.2.1-alpha)**: the game plus **Gold Box Plus**, optional modern additions (F12) around the
unchanged original; ready for community testing.

**Bring your own copy.** This repository contains none of the game's files: no program, data, graphics or sound. You
need your own copy of Pool of Radiance, version 1.3; the browser checks it and plays from it on your machine. The
engine was built from an analysis of the original program, not clean-room; all rights to the game stay with its
publisher and rights holders.

- [Play](#play) · [Gold Box Plus](#gold-box-plus-optional-additions-v020-alpha) · [Modify](#modify) · [Decode](#decode) · [Credits and licence](#credits-and-licence)

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

## Gold Box Plus (optional additions, v0.2.0-alpha)

Gold Box Plus adds modern conveniences around the original game **without changing it**: the engine stays
pixel-exact and only reports what happens; the additions listen, show their own panels and type the original keys.

**Open it:** press **F12**, click the **F12: Plus** hint or the **⚙ Menu** button (always shown in a margin outside the
game screen; the hint stays there in original mode too) or press the gamepad's **Menu** button. While the panel is open the game waits; **Esc** closes it.

**"Play the original game"** (Helpers tab) switches every addition off at once: no panels, no mouse extras, no
tooltips, no mods; the screen and the controls are exactly the original's. Your helper choices are kept for later.

**Tabs:**
- **Status**: party, place, facing, game time, save slot, active helpers.
- **Quests**: the City Clerk's commissions and the other deeds the council rewards, with their state (offered,
  accepted, in progress, done, rewarded), named with the game's own text from your files.
- **Journal**: an automatic diary of what the game showed (texts, places, talks, fights, treasure), your own notes and
  map pins. **Adventurer's Journal import:** import your own journal PDF or paste its entries; an entry is shown only
  after the game has pointed you to it. The text stays in your browser; notes travel with the saves ZIP.
- **Pedia** (Gold Box-pedia): monsters, people, places, items and spells, each revealed only after you have met, visited
  or seen it; search and how-to pages.
- **Map**: automap of the current area from the game's map data, visited cells only (fog), party marker, your pins;
  click a visited cell to walk there.
- **Helpers**: the switches below. **Mods**: skins (PNG replacements for game pictures) on/off in a stack; a sample
  recolour skin is built in the browser. **Keys**: the keys of the current screen. **Games**: the game selector (Pool of
  Radiance today). **About/Credits**.

**Helpers** (default in brackets; each one off leaves the game screen untouched):
tooltips on names in menus and lists (pedia entries you have revealed) [on] · combat log panel with copy [on] · quick
save **F5** / quick load **F9** [on] and autosave after each area entry into three rotating slots [on] (Plus slots Q and
X/Y/Z through the game's own save routine; your slots A-J are never touched; never during combat or a prompt) · spell
presets per character, applied in camp by typing the Memorize keys [off] · screen margins [off] · crisp font [off].

**Mouse:** click menu words, list items, party members and the 3D view as before; right-click shows the actions
available under the pointer (menus, lists, roster, combat targets) with cursor hints; in the area map click a cell to
walk there. In original mode right-click is Esc, as listed under Controls.

**Developer tools** (off by default; `?dev=1` or Helpers > Developer tools): the **Cheats** tab (install a scenario as a
saved game, edit levels/HP/gold, teleport inside the map, read/set script flags) and `?scenario=<name>` (e.g.
`?scenario=sokal-gate`: a level-5 party of six at the Sokal Keep landing; files in `game/scenarios/`). The **Scenario**
tab is the editor skeleton (map editing, JSON export).

**Documentation:** [docs/PLUS_HOOKS.md](docs/PLUS_HOOKS.md) (events and state for additions),
[docs/MODDING.md](docs/MODDING.md) (skins and the mod format), [docs/SCENARIOS.md](docs/SCENARIOS.md) (scenario JSON,
DAX/ECL/GEO writers), [game/plus/CREDITS.md](game/plus/CREDITS.md) (credits and licences), [CHANGELOG.md](CHANGELOG.md).

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
v0.2.0: the method, tools and templates this decode followed.

## Credits and licence

- **Pool of Radiance** © 1988 Strategic Simulations, Inc. (SSI), developed and published by SSI under licence from TSR.
  Advanced Dungeons & Dragons and Forgotten Realms are trademarks of their owner (Wizards of the Coast). All rights to
  the game stay with its rights holders. This project is not affiliated with or endorsed by them.
- Rebuild, decode and tools: **DrEvil** (DrEvil and Titanium Helix LLC).
- Code: MIT ([LICENSE-MIT](LICENSE-MIT)); documentation: CC BY 4.0 ([LICENSE-DOCS](LICENSE-DOCS)); see [LICENSE](LICENSE).
- Bring your own copy: this repository contains no original game files; the engine was derived from analysis of the
  original program, not clean-room.

Disclaimer: all or part of this repository may have been written or edited by super intelligence
