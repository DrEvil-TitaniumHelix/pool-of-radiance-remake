# ACCEPTANCE — build screens vs the original (owner: por-accept since 2026-10-18)

One row per SCREENS_INDEX id (decode/pseudo/SCREENS_INDEX.md), grouped by the area of its source row. Verdicts:
**PASS** = 0 differing pixels vs the DOSBox reference (exact RGB, 320×200) · **DIFF** = differs, what differs is named ·
**NO-REF** = the build reaches the screen, no DOSBox reference yet (ref request to por-dosbox-ref in STATUS.md) ·
**BLOCKED** = the build cannot reach it (fix request to por-fixer) · **ERR-PATH** = only shown when original files are missing,
corrupt or the machine lacks memory; not reachable in a normal run of either program (not counted as a failure).

## Summary

| area | rows | PASS | DIFF | NO-REF | BLOCKED | ERR-PATH | pending |
|---|---|---|---|---|---|---|---|
| ENGINE | 6 | 5 | 0 | 0 | 0 | 1 | 0 |
| VIEW | 9 | 3 | 3 | 0 | 0 | 0 | 3 |
| ECL | 16 | 11 | 2 | 1 | 0 | 0 | 2 |
| PARTY | 27 | 23 | 3 | 0 | 0 | 1 | 0 |
| MAGIC | 27 | 20 | 7 | 0 | 0 | 0 | 0 |
| COMBAT | 20 | 7 | 10 | 0 | 0 | 0 | 3 |
| **all** | **105** | **69** | **25** | **1** | **0** | **2** | **8** |
DIFF split: 25 explained (cause stated in the row), 0 real (fix request open), 0 unresolved (reference requested).

105 rows cover all 106 SCREENS_INDEX ids (CH-01 and CH-02 share a row). Besides the rows, 70+ extra DOSBox references on the same
routes were compared (inn, city hall, harbor, Sokal Keep, corpse, rest, save, quit …), most at 0 px.

## How the shots are made

- **Artefacts and reports (BYOC step 7).** Screenshots, DOSBox reference PNGs and diff images show the original art, so they
  are kept out of git: every script writes them to the gitignored `acceptance/local/` (`local/acc/<run>/`, `local/shoot/`,
  `local/integration/<run>/`, `local/ref/`). What is committed are the reports in [acceptance/reports/](acceptance/reports/):
  per run and step the keys, the SHA-256 of the build shot, the reference id and its SHA-256, the differing pixels and their
  bounding box ([reports/acc/<run>.json](acceptance/reports/acc/) for the runs named in the rows below,
  [reports/integration/](acceptance/reports/integration/), [reports/shoot/](acceptance/reports/shoot/)). DOSBox captures keep
  their committed sidecar `acceptance/ref/<id>.capture.json` (route, time, PNG SHA-256). References are looked up in
  `acceptance/local/ref/` first and then in the older tracked `acceptance/ref/` (path helpers `acceptance/paths.mjs` /
  `paths.py`). Runs before step 7 were back-filled into reports from their tracked folders (`acceptance/acc/backfill_reports.py`).
- **Route replay (main method).** Every DOSBox reference was captured on a scripted key route (the `session_commands` in
  `acceptance/ref/<id>.capture.json`). `python acceptance/acc/gen.py <session> <query>` turns such a route into a run file
  (one script key per logged key, one step per capture; only the last capture of an id in that session is the committed
  reference). `node acceptance/acc/run_at.mjs acceptance/acc/runs/<run>.json` replays it in one headless Chrome (copy of
  por-build-qa's `acceptance/integration/run.mjs`, plus step options `"at": ms` for transient frames and `"pick"` for
  per-repetition keys; it takes the shared run lock itself). `python3 acceptance/acc/cmp.py <run>` (WSL) runs
  `acceptance/ref/compare.py` for every step with a `ref` and merges the result into the run's report.
- **Random state.** The original seeds TP `Random` from the DOS clock (Randomize 0AF8:1247), so the DOSBox runs' seeds are
  unknown. Where a screen depends on a few draws, the draws are traced in the build (setter hook on `tp.randSeed` with call
  sites, run LG3) and a build seed is chosen offline that yields the same outcomes (`acceptance/acc/seedsim.py`, the
  exact TP LCG of engine/tp.js); the seed is set with `setRandSeed` right before the key that rolls. Screens after many
  draws (combat deployment ≈ 711 draws) cannot be matched this way and are recorded as DIFF (random state).
- Typed-ahead keys: the original drains type-ahead (ReadGameKey 0899:00E4), so where the DOSBox harness sent keys 0.27 s
  apart some were lost there; the build gets one key per idle. Those segments were re-derived from the reference's position
  and clock (SH2: one step south from 1,0 E; SH6c: rest 5 minutes to match the clock, Home for the selected member).
- Runs: `LG1` (save A: view, area map, camp, camp magic, spell list, look), `LG3` (save A, seed 19 before Look: encounter,
  advance, parlay, combat), `SH1`..`SH6c` (DOSBox session shQq7C: search, turn, city, portrait, items, temple, rest, save,
  quit prompt, inn, city hall, harbor, Sokal Keep, corpse, parchment), `ZG3`/`ZG5`/`ZG6` (session Zg9gzG: walk with seeded
  encounters, locked door, goblin fight), `SEEDLOOK` / `RNGTRACE` / `ZGT` (seed and draw diagnostics).
- DOSBox batches 7-9 (2026-10-18): sessions pqGeL4 (por-accept's PT/TP4/MG3/CB1/CB2 keys) and qfxv7y (test-party tour, camp, temple,
  shop, hall, duel) replayed 1:1 as runs `pqGeL4` / `qfxv7y` (gen.py also maps `type`, `press` and keypad keys). Error paths: runs
  `ERR-SY02` / `ERR-SV04` / `ERR-SY01` against damaged scratch copies of the data folder served on ports 8191-8193
  (`POR_DATA=<copy> python -I tools/serve.py <port>`, `GAME_URL=…` for run_at.mjs).
- Test party: `?testparty=1` generates it in the browser from the player's files (game/areas/testparty.js, BYOC step 6);
  `?save=testparty&force=1` (the older committed copy) gives pixel-identical runs (P1-f, 11 steps).
- Contact sheets of a run: `python acceptance/acc/sheet.py <run> [step prefixes]` (written into the local run folder).

## ENGINE

| id | screen | build path | reference | px | verdict | notes |
|---|---|---|---|---|---|---|
| SU-01 | Startup disk / config errors | — | SU-01, SU-01-RETRY, SU-01-OVR (DOSBox, damaged scratch copies) | — | ERR-PATH | the browser build reads no POOL.CFG and has no overlay file, so neither prompt can occur; references kept for completeness |
| SU-07 | `START STING` developer mode | `PM-01?sting=1` | REF-STING | **0** | PASS | STING skips titles/credits/wheel and lands on the party menu, as REF-STING (same image as REF-MENU). Debug keys: SY-03 |
| AD-09 | Status line / roster refresh (ENGINE-34/39/44) | run LG1 step VIEW-01 (`LA`), step ECL-14 (`LA A AE`, "CAMPING" suffix) | ENGINE-34, ENGINE-44 (= VIEW-01), ECL-14 | **0** / **0** | PASS | roster colours (selected white, others cyan), AC/HP columns, `15,4 W 10:50` and `… CAMPING`; ENGINE-05/07/15/16/39/45 are aliases of VIEW-01 too (EGA mode, frames, font, names, camp) — all 0 |
| SY-01 | Fatal data errors | ERR-SY01: scratch copy with GEO2.DAX := GEO1.DAX (port 8193), `LA` | SY-01 (text mode 640×350) | **0** | PASS | #a-10 applied (1120e7a): 80×25 text screen with the mixed-case message, compared on the full 640×350 window |
| SY-02 | Disk prompt `Insert disk n in drive X:` | ERR-SY02: scratch copy without 8X8D1.DAX (port 8191) | SY-02 | **0** | PASS | #a-5 applied (06795f0) |
| SY-04 | Sound toggle (Ctrl-S) | SY1: save A 3D view, Ctrl-S twice | VIEW-01 | **0** | PASS | #a-1 applied (0f35fe2): `G.SoundDevice` 1 → 2 (muted) → 1, screen unchanged (no screen by design, ENGINE-08) |

## VIEW

| id | screen | build path | reference | px | verdict | notes |
|---|---|---|---|---|---|---|
| AD-03 | 3D exploration | LG1 `LA`; SH1 `LAS` (search), `S{Down}` (turn); Z4b new game | VIEW-01 / ECL-03 / REF-PARTY, VIEW-01-SEARCH, REF-CHECK-SEARCH, VIEW-01-TURN; AD-03-NEWGAME, AD-03-NEWGAME-VIEW | **0** x5; 34; strips **0** | PASS | new game (#fx-1 refs): AD-03-NEWGAME differs only by NEWBIE's rolled HP (34 px); the first view at 15,1 W has 0 px on both wall strips (only Rolf's sprite in the centre, drawn earlier by the build than the burst frame). AD-03-NEWGAME-STEP1 (14,1 W) not compared: the tour step is faster than the shot interval. Temple exit = CM-20-EXIT 0 px |
| AD-04 | Area map | LG1 `LA A` | VIEW-02 | **0** | PASS | 11×11 overhead map + party arrow. The "NOT HERE" variant (VIEW-02a, rope-guild area) was not reproduced: that route needs DOSBox's random guild fight (see AD-05 notes) |
| AD-05 | Locked door | ZG3: save A, walk with the DOSBox keys to 10,2 N (encounters seeded, see ECL EV-07) | VIEW-03, VIEW-03-OPEN | 175 / 6556 | DIFF | explained: build door menu `LOCKED. BASH PICK EXIT` reached at 10,2 N 11:03; the committed VIEW-03 is DOSBox's **second** visit after a random battle (11:05, Bakshi HP 3, other menu highlight): differing cells are only Bakshi's HP digit, one minute digit and the highlighted option. VIEW-03-OPEN reference is mid-print ("…GOBLIN IS IN") + the same HP/time cells. Note: `REF-CHECK-LOCKED` is misnamed — it shows the temple greeting (ECL EV-14) |
| AD-06 | Overland map | — | — | — | pending | needs a route out of Phlan (wilderness); not attempted yet |
| AD-07 | River stench | — | — | — | pending | overland only (VIEW-04a) |
| AD-08 | Portrait (selected member) | SH1 `… V` | VIEW-07 | **0** | PASS | |
| CB-01 | Battle begins | CB3: LG3 route to ECL-05 (seed 19), `{Enter}`, shot 1.2 s later (GameSpeed 9) | VIEW-05 (burst frame) | 371 | DIFF | explained: timing only: StartCombat 5200:1E5F clears row 24, waits MessageDelay, then draws `A BATTLE BEGINS...` and builds the battlefield. The text stays up for the setup time — about 1 s on the emulated 286, milliseconds in JS — so the build shot shows the frame before the text (identical except that line). Not a code difference |
| CB-02 | Combat map | LG3 (orc fight after parlay, seed 19 before Look) | VIEW-06 (= ECL-12, ENGINE-46) | 5834 | DIFF | explained: random state: deployment uses ≈711 draws after the parlay (LoadMonster HP, StartCombat placement), DOSBox seed unknown. Layout (frames, side panel, menu) matches; monster/party positions differ |
| SY-03 | Debug line (STING + Ctrl-D) | SY1: Ctrl-D twice | VIEW-01 | **0** | pending | #a-1 applied: DebugFlag 0 → 1 → 0, screen unchanged. The line itself is printed only by DrainLevels 5C00:222F (`max,cur,lost`) — waits on a level-draining monster in a fight |

## ECL

| id | screen | build path | reference | px | verdict | notes |
|---|---|---|---|---|---|---|
| AD-01 | Loading block | Z4b: new party (NEWBIE), `B`, shots from ~20 ms on; AD01 (city gate) | AD-01 (burst frame 12 ms after `B`: party menu + `LOADING...PLEASE WAIT`) | — | DIFF | explained: timing — the build draws the line (4300:037C) but the block loads within one frame, so no build frame shows it (first shot already has the 3D view); DOSBox at 3000 cycles keeps it for a few ms |
| AD-02 | Area entry (block init) | SH1 `LAS S{Down} {Up}`; SH4 walk into city hall; SH5/6 harbor, boat, Sokal Keep | ECL-02 (= REF-CHECK-CITY), ECL-02-CITYHALL, REF-CHECK-HALL-MAP, REF-CHECK-HARBOR, REF-CHECK-BOAT, REF-CHECK-SOKAL | **0** ×6 | PASS | earlier row `ECL-02=idle?sting=1&keys=LASS{Down}{Up}` also 0 |
| EV-01 | Script text (PRINT / PRINTCLEAR) | LG3 `L` (seed 19); SH5 council guard, clerk, commission; SH6 corpse | ECL-04, ENGINE-17-CLERK (= REF-CHECK-CLERK), REF-CHECK-COMMISSION, REF-CHECK-CORPSE | **0** ×4 | PASS | ENGINE-17 (council guard YES NO) = 798 px only because the reference was taken before the YES/NO line was drawn (row 24 still shows the explore menu) |
| EV-02 | Continue prompt / horizontal menu | LG3 `N` after parlay | ECL-05 | **0** | PASS | |
| EV-03 | Script vertical menu | SH6c `{Enter}` at the Sokal corpse, `{End}`, `{Esc}` | ECL-06, ECL-06-SELECT, ECL-06-ESC | **0** ×3 | PASS | includes the Esc-keeps-selection quirk |
| EV-04 | Number / text entry | — | — | — | pending | no route found yet |
| EV-05 | Picture / portrait | LG3 close-up | ECL-08 (= VIEW-08) | **0** | PASS | |
| EV-06 | Encounter approach | LG3 `L` (far), `A`, `A` | ECL-09 (= ECL-04), ECL-09-NEAR, ECL-08 | **0** / 761 / **0** | PASS | ECL-09-NEAR reference was caught mid-print ("YOU SPY A G", old menu); the settled frame is the next step = 0 px |
| EV-07 | Encounter menu | LG3 `L`, `S`; ZG3 walk-1 encounter + `F` (seed 19 before the last step) | ECL-10, ECL-10-FLEE | **0** / **0** | PASS | "THE MONSTERS FLEE." with no further draws |
| EV-08 | Parlay | LG3 `P` | ECL-11 | **0** | PASS | |
| EV-09 | Who? (party picker) | SH3 inn `Y`; SH4 `{End}` | ECL-15, ENGINE-47, ENGINE-47-NEXT | **0** ×3 | PASS | WHO WILL PAY? SELECT |
| EV-10 | Damage report / party killed | — | — | — | pending | needs a damaging script event |
| EV-11 | Picture-box text | SH6c parchment `{Enter}` | ECL-16 | **0** | PASS | rune glyphs from VM bytes |
| EV-12 | Silent effects | — | — | — | NO-REF | no screen of its own (sprite off/redraw/sound/step inside other rows) — nothing separate to compare |
| EV-14 | Temple (COMBAT opcode, temple flag) | SH2 walk to 1,1 S, `Y` | REF-CHECK-LOCKED (temple greeting), ECL-12-TEMPLE | **0** / **0** | PASS | temple menu rows themselves: MAGIC CM-20.. |
| EV-15 | Duel | qfxv7y (arena master); SELTEST3 | EV-15, EV-15-WHO | 179 / 179 | DIFF | explained: random state — only the highlighted member differs (build ALYS, original PIP). On the qfxv7y route the build steps onto the shop square 9,10 with the ECL3/0 per-step roll `RANDOM 13h` = 19 (the "mad man" check), whose LOAD_CHARACTER loop leaves ELARIEL selected until the event's EXIT; the DOSBox run did not roll 19 there. Same code in both programs (por-build-ecl, 17c9163: #a-13 is not a defect) |
| — | (extra) inn / camp / rest refs on the same route | SH3/SH4 | REF-CHECK-INN, REF-CHECK-SAVE, VIEW-10, VIEW-10-IGNORED, ECL-14-REST, ECL-14-AFTER-REST | **0** ×6 | PASS | counted in MAGIC CM-11 / PARTY SV-01 rows |

## PARTY

Test-party runs use `?save=testparty&force=1&sting=1&seed=7` (game/assets/saves/testparty, slot C). For a DOSBox reference the
same files go into the copied `SAVE\` folder (see its README). Timed shots: `PT2`/`PT3` raise `text.GameSpeed` to 9 after
loading (message duration only) and shoot 0.9 s after the key.

| id | screen | build path | reference | px | verdict | notes |
|---|---|---|---|---|---|---|
| SU-02 | Start-up loading line | `SU-02` | REF-BOOT | **0** | PASS | 'Loading...Please Wait' (InitGameState 5700:04a3) |
| SU-03 | Title picture 1 | `SU-03` | REF-TITLE-1 (= ENGINE-29) | **0** | PASS | |
| SU-04 | Title picture 2 | `SU-04` | REF-TITLE-2 | **0** | PASS | default palette phase; lightning timing not compared |
| SU-05 | Credits | `SU-05` | REF-CREDITS | **0** | PASS | |
| SU-06 | Code wheel | `SU-06?wheel=1&wheelentry=6` | REF-WHEEL | **0** | PASS | entry = Random(13); matched with the test hook |
| PM-01 | Party creation menu | `PM-01?sting=1`, LG1 step 1; with party: PT `LC` | REF-MENU | **0** | PASS | with a party loaded the full menu shows (PT step 21); TRAIN appears after STING `J` (StingMode, 7000:04CC) |
| PM-02 | Quit to DOS | pqGeL4 `E`, `N` | PM-02-A2, PM-02-no | **0** / **0** | PASS | |
| PM-03 | Pick Race / Gender / Class / Alignment | pqGeL4 / qfxv7y `C`, Enter x3 | PM-03-race, -gender-A2, -class-A2, -align-A2; PM-03-GENDER/-CLASS/-ALIGN | **0** x8 | PASS | the header-less first page (menu_Top = 1) is original (answers #p1) |
| PM-04 | Ability roll / Keep this character? | pqGeL4 / qfxv7y | PM-04-A2, PM-04-reroll, PM-04 | 235–259 | DIFF | explained: only the rolled cells differ (age, six abilities, gold and the AC/HP/damage derived from them; 119 dice draws from DOSBox's unknown seed). Portrait now identical (#a-7 applied, 7d45c18) |
| PM-05 | Character name | pqGeL4 `Y` | PM-05-A2, PM-05 | 235 / 259 | DIFF | explained: rolled values only (see PM-04) |
| PM-06 | Portrait picker | pqGeL4 `TESTER{Enter}`, `H` | PM-06-A2, PM-06-head-A2, PM-06, PM-06-HEAD | 235 / 235 / 259 | DIFF | explained: rolled values only; head 1 before `H` and head 2 after now identical (#a-7) |
| PM-07 | Icon editor | pqGeL4 `K P E E Y` | PM-07-A2, -parts-A2, -exit, -done, -ok-A2 | **0** x5 | PASS | #a-8 applied (19396a7: VideoMode := 1 for EGA, bevelled pose cells) |
| PM-09 | Drop character | pqGeL4 `D`, `N` | PM-09-A2, PM-09-no | **0** / **0** | PASS | |
| PM-10 | Modify character | pqGeL4 `M` | PM-10-A2 | **0** | PASS | `CORWIN CAN'T BE MODIFIED.` (timed; PM-10-REFUSED) |
| PM-11 | Train character | pqGeL4 `T`, `N`; qfxv7y hall; HJCXFL STING `J`, `{End}x3 T` | PM-11-no, PM-01-TRAIN, PM-11-WILL-BECOME, PM-01-STING-TRAIN | **0** x4 | PASS | incl. `MORGANA WILL BECOME: A LEVEL 5 MAGIC-USER` and the white hot keys in StingMode |
| PM-12 | Add character to party | pqGeL4 `A`, `E`; qfxv7y | PM-12-A2, PM-12-exit, PM-12, PM-12-MARKED | **0** x4 | PASS | |
| PM-13 | Load game | `PM-13?sting=1&keys=L`; PT `L` | REF-LOAD | **0** | PASS | |
| EV-13 | Shop main menu | pqGeL4 (TP4 route) / qfxv7y / qyRZNd | EV-13-ENTRY-A2, EV-13-shop-y, EV-13-pool-A2, EV-13-pool2, EV-13, EV-13-ENTRY, EV-13-POOL, EV-13-A12-GREETING/-MENU/-POOL/-END2 | **0** x11 | PASS | the selected member (ALYS) is kept through the shop entry on this route (#a-12) |
| EV-13a | Shop item list | qfxv7y `B` | EV-13a | **0** | PASS | `ITEMS: BUY PREV EXIT` on the one-page list is original |
| EV-13c | Leaving shop with pool money | pqGeL4 `P E`, `Y`; qfxv7y | EV-13c-A2, EV-13c-leave-2, EV-13c | **0** x3 | PASS | |
| EV-16 | Training hall | qfxv7y (route to the hall, `Y S E L`) | EV-16, PM-01-TRAIN | **0** / **0** | PASS | |
| CH-09 | Take money | pqGeL4 `T{Enter}10{Enter}`; qfxv7y | CH-09-take-amt, -take-done, -take-exit, CH-09, CH-09-AMOUNT | **0** x5 | PASS | |
| CH-10 | Appraise gems / jewelry | pqGeL4 `A` | CH-10-appraise, CH-10-appraise-idle | **0** / **0** | PASS | no gems: nothing stays on screen, as the original |
| CH-11 | Pool / Share | pqGeL4 `S`; qfxv7y | CH-11-share, CH-11 | **0** / **0** | PASS | |
| SV-01 | Save game | SH3 camp `S` | REF-CHECK-SAVE | **0** | PASS | also PT `S` from the party menu (`SAVE WHICH GAME: A B C D E F G H I J`) |
| SV-02 | Low memory / exit | — | — | — | ERR-PATH | heap check only |
| SV-04 | Save/load data errors | ERR-SV04: scratch copy without ECL3.DAX (port 8192), `LA {Down}{Up}` | SV-04 | **0** | PASS | #a-6 applied (d97f4f2): `Save and exit  Insert disk #3` as menu options |

## MAGIC

"Camp-fire frame" = the animated camp picture (PIC 1Dh) in the picture box (25,27)-(111,111): 676 px, a different animation
frame at capture time; everything outside it is identical. Test-party shots: MG2/MG3 (reports/acc/MG2.json, MG3.json), and
por-build-qa's RUN-2 (2-camp, 3-temple; screenshots in acceptance/integration/out/, from before step 7).

| id | screen | build path | reference | px | verdict | notes |
|---|---|---|---|---|---|---|
| CM-01 | Camp | LG1 `LA A AE` | ECL-14 (= ENGINE-45) | **0** | PASS | |
| CM-02 | Magic menu | qfxv7y `M`; LG1 | CM-02, MAGIC-CAMP | **0** / 676 | PASS | 676 = camp-fire frame |
| CM-03 | Cannot use magic | MG1b / FIRE2: camp, `M`, `C`, timed series | REF-CHECK-CAST (= ENGINE-38) | 676 | DIFF | explained: camp-fire phase only. The fire has two frames (run FIRE: 16 of 30 shots = the reference frame, 0 px) and does not advance while a message pauses, so the phase depends on when the message started; `THRENDER GRONE / HAS NO SPELLS MEMORIZED` identical |
| CM-04 | Spell list header | LG1 `… {End} C` | VIEW-09 | **0** | PASS | |
| CM-05 | Cast: spell list | LG1; MG2 (Alys) | VIEW-09 (= VIEW-01-CAST, REF-CHECK-SPELLS) | **0** | PASS | |
| CM-06 | Casting (camp) | qfxv7y; SH4; MG1 | CM-06-COMBATONLY, CM-06-TARGET, REF-CHECK-HEAL, ENGINE-40 | **0** / 676 / 676 / 676 | PASS | 676 = camp-fire frame; `IS A COMBAT-ONLY SPELL...` 0 px |
| CM-07 | Memorize | qfxv7y `{End}{End} M`, `M N`; pqGeL4 Morgana | CM-07, CM-07-NEXT, CM-07-MORGANA, CM-07-mem-sel | **0** x4 | PASS | |
| CM-08 | Learn (new MU spell after training) | HJCXFL: test party, `L C J`, `{End}x3 T`, `Y`, `N` | CM-08, CM-08-NEXT | **0** / **0** | PASS | `MORGANA'S SPELLS TO CHOOSE FROM`, `CHOOSE SPELL: LEARN NEXT` |
| CM-09 | Scribe | FIRE3: camp, `{End}{End} M S` (Alys), shots every 100 ms | CM-09 | **0** | PASS | `ALYS / HAS NO COPYABLE SCROLLS` with the same camp-fire frame |
| CM-10 | Display effects | qfxv7y `D`, after Bless | CM-10, CM-10-BLESS | **0** / **0** | PASS | |
| CM-11 | Rest time editor | SH2 camp `R` | ECL-14-REST | **0** | PASS | |
| CM-11a | Resting | SH3 (rest 1 day, interrupted) | ECL-14-AFTER-REST | **0** | PASS | interruption by the city watch (GO / STAY) at 11:01 identical; a full rest is in RUN-2/2-camp 26..27 (00:12 → 04:27) |
| CM-12 | Game speed | pqGeL4 / qfxv7y | CM-12-faster, CM-12-A3, CM-12 | **0** / 676 / 676 | PASS | FASTER hidden at speed 0, as the original |
| CM-13 | Party order / drop | pqGeL4 / qfxv7y | CM-13, CM-13-order-exit, CM-13-order*, CM-13-SELECTED, CM-13-DROP, CM-13-drop* | **0** / **0** / 676 … | PASS | non-zero ones = camp-fire frame only |
| CM-14 | Alter menu | pqGeL4 / qfxv7y | CM-14-A3, CM-14, CM-14-pics-A3, CM-14-pics-exit, CM-14-PICS | **0** x4 / 676 | PASS | |
| CM-20 | Temple main menu | SH2 `Y` | ECL-12-TEMPLE | **0** | PASS | |
| CM-21 | Temple healing list | qfxv7y `H` | CM-21 | **0** | PASS | |
| CM-22 | "Needless" confirmation | qfxv7y | CM-22 | **0** | PASS | |
| CM-23 | Price and payment | qfxv7y `{End}{End} H` | CM-23 | **0** | PASS | |
| CM-24 | Leaving temple with pool money | qfxv7y | CM-24 | **0** | PASS | |
| CM-25 | Spell result messages | MG1 / FIRE2 `S` (heal), timed series | ENGINE-40 | 676 | DIFF | explained: camp-fire phase frozen during the message pause (see CM-03); `BAKSHI / IS FULLY HEALED` identical. The target picker before it (REF-CHECK-HEAL) = 0 px in FIRE2 |
| CB-03 | Player turn menu (combat) | DUEL: qfxv7y route to the arena, WHO → PIP (`{End}{End}`), `S` | CB-03 | **0** | PASS | the duel start (Phlan, DataSet 3) matches exactly; LG3/MG2 random fights differ only in deployment |
| CB-04 | Move / attack | CB4 `M` | CB-04 (duel, qfxv7y) | — | DIFF | explained: random fight state (different fight); row 23 `MOVE/ATTACK, MOVE LEFT = n` and panel layout identical |
| CB-08 | Combat cast | CB4 `C C`; CB9: Morgana, `C`, `{End}x3` (Sleep), `C` | CB-08, CB-08-AIM, REF-CHECK-COMBAT-CAST | rows 23-24 + side panel **0** | DIFF | explained: only the random map differs: `SPELL:SLEEP` / `AIM: NEXT PREV MANUAL TARGET CENTER EXIT` and Morgana's panel identical to CB-08-AIM |
| CB-09 | Area spell effects | CB7: Quick until Morgana, `C`, `C` (Stinking Cloud), `T` | CB-09, CB-09-FOE (Sleep) | — | DIFF | explained: different spell and fight: the build's Stinking Cloud draws its cloud squares over the targets; the reference shows Sleep (`THORGRIM FALLS ASLEEP`). A Sleep shot is still to do |
| CB-11 | Quick / Done / Guard / Delay | CB11: LG3 orc fight, Quick until Darkstar, `D`; MG2 | CB-11-DONE, CB-11-GUARD, CB-11-BANDAGE, CB-11-DELAY1..4 | row 24 + side panel **0** | DIFF | explained: random deployment on the map only. Repeated DELAY by the last member keeps the turn in the original too (dosbox-ref #a-11 answer, 28f10c2) |
| CB-13 | End of round | AF5/AF5b (`CONTINUE BATTLE: YES NO`) | CB-13 | — | DIFF | explained: random fight state; prompt line identical in form |

## COMBAT

Fight shots: CB1 (test party, P1-f's seeded walk to the first encounter, `?seed=7`), CB2 (coins), CB3 (save-A orc fight), LG3.
The DOSBox fight references (REF-CHECK-COMBAT*, REF-CHECK-AIM, ECL-12-WON, REF-CHECK-LOOT, ENGINE-37) come from a random
encounter at the guild door that could not be reproduced (DOSBox seed unknown); they are used for layout checks only.

| id | screen | build path | reference | px | verdict | notes |
|---|---|---|---|---|---|---|
| CH-01 / CH-02 | Character sheet + View menu | `CH-02=idle?sting=1&keys=LAV` | REF-CHARACTER | **0** | PASS | earlier row (por-build-res00ba / por-build-combat) |
| CH-03 | Items screen | SH1 `… V I` | ENGINE-36 | **0** | PASS | `THRENDER GRONE'S ITEMS`, READY ITEM list |
| CH-04 | Item messages and dialogs | pqGeL4 | CH-04-drop, -drop-no, -sell, -sell-no, CH-04-SELL-OFFER, CH-04-DROP-IT | **0** x6 | PASS | incl. `I'LL GIVE YOU 30 GOLD PIECES FOR YOUR LONG BOW`, `DROP IT?` |
| CH-05 | Use item | CB6: test-party fight, Quick until Pip (`pick` option of run_at.mjs), `U` | CH-05 | **0** | PASS | `PIP'S ITEMS`, `READY USE DROP HALVE JOIN EXIT` in combat |
| CH-07 | Trade coins | pqGeL4 / qfxv7y | CH-07-trade-to, -sel, -coin-A4, -esc1, -esc2, CH-07, CH-07-COIN, CH-07-AMOUNT | **0** x8 | PASS | Esc at TRADE TO? ignored, as the original |
| CH-08 | Drop coins | pqGeL4 / qfxv7y | CH-08-drop, -amt, -esc, CH-08, CH-08-AMOUNT | **0** x5 | PASS | |
| CB-05 | Attack result | CB4 | CB-05, CB-05-HIT | — | DIFF | explained: random fight state; message form identical (`<NAME> / ATTACKS / <NAME> / HITTING FOR n / POINTS OF DAMAGE`, `AND MISSES`) |
| CB-06 | Aim / target selection | CB1 `A`, `N` | CB-06, CB-06-TARGET, REF-CHECK-AIM | — | DIFF | explained: random fight state; `RANGE = n` / `AIM: NEXT PREV MANUAL [TARGET] CENTER EXIT` identical in form |
| CB-07 | View character in combat | DUEL: … Pip's turn, `V` | CB-07 | 76 | DIFF | explained: only Pip's platinum (6 vs 306) and encumbrance differ — the 300 platinum taken in the second shop went to the member selected there, which differs because of the random "mad man" roll (see EV-15). Portrait frame + portrait identical (#a-9 was a route mismatch: portraits only in DataSet 3, 7F00:04F6, as the original) |
| CB-10 | Turn undead | CB8: Quick until Alys, `T` (timed, GameSpeed 9) | CB-10 | side panel + row 24 **0** | DIFF | explained: only the random map differs: `ALYS / TURNS UNDEAD...`, `NOTHING HAPPENS...` identical |
| CB-12 | Computer-controlled turn | CB4 | CB-12 | — | DIFF | explained: random fight state; `ROLF / ATTACKS / PIP / AND MISSES` form identical to the build's `KOBOLD ATTACKS ALYS AND MISSES` |
| CB-14 | Effects with messages in combat | — | — | — | pending | |
| AF-01 | Combat result | CB1 Quick until the fight ends | ECL-12-WON | 36 | DIFF | explained: only the XP number differs (61 here, 15 in the DOSBox fight: cells (25..26,5)); text layout identical |
| AF-02 | Treasure menu | CB1 `{Enter}` | REF-CHECK-LOOT | 1714 | DIFF | explained: only the roster differs (test party vs save A); treasure picture and `VIEW TAKE POOL SHARE EXIT` identical |
| AF-03 | Take money / items | CB1 `T` | AF-03, AF-03-MONEY, AF-03-ITEMS | — | DIFF | explained: different treasure (random fight); `TAKE: MONEY ITEMS EXIT` form identical |
| AF-04 | Treasure left | CB1 `E` | AF-04 | — | DIFF | explained: different roster/HP (random fight); text identical |
| AF-05 | Party destroyed | AF5i: LG3 orc fight, party marked dead by a state hook right after the fight starts (only to reach the screen), `Q`, timed shots | AF-05 | **0** | PASS | `THE END!` / `THE MONSTERS REJOICE FOR THE PARTY HAS BEEN DESTROYED` / `PRESS ANY KEY TO CONTINUE` |
| EV-17 | Dragon finale | — | — | — | pending | endgame |
| EV-18 | Overland tile recolour | — | — | — | pending | overland |
| SV-03 | Game over | AF5g: one key after AF-05 | SV-03 (text mode `C:\GAME>`) | — | DIFF | explained: by design: the browser build ends with `PROGRAM TERMINATED.` instead of the DOS prompt (same as Exit to DOS) |
