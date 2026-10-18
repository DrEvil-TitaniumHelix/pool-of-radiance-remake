# BYOC — "bring your own copy" (design, not implemented)

Author: lane por-fixer, 2026-10-18. Status: **design only**. Nothing here has been built. Rulings so far: PR-2 = A (scope),
**PR-3 = new public repo: this repo's history is never rewritten or force-pushed** (§9a), PR-4 = A (v1.3 only).
Steps marked **[APPROVAL]** need the owner's decision, relayed by the coordinator, before anyone runs them.

## 1. Goal and scope

**Goal:** the **public release repository**, and every commit in its history, contains no original Pool of Radiance file and
no file built from original bytes. This private repo (GitHub visibility PRIVATE, checked 2026-10-18) stays the RE
workspace, with its history unchanged (PR-3); BYOC removes T1 from its HEAD so the public repo can be cut from it. The player supplies their own copy of the game. The browser checks it, keeps it locally and converts it on
the player's machine. The server or launcher only ever serves our own code (`game/`).

What counts as "original or original-derived". This inventory comes from `git ls-files` and `git log --all` on 2026-10-18;
the repo has 315 commits and the remote is `origin = github.com/DrEvil-TitaniumHelix/PoolRadianceRE`:

| tier | what | where (tracked now / in history) | BYOC action |
|---|---|---|---|
| T1 original files | Code-wheel PDF (4,244,635 B, part of the original package) | `decode/docs/__ Code Wheel __.pdf`: **still tracked** (added in 738b9dc; `.gitignore` lists it, but it is in the index) | remove from HEAD; never in the public repo |
| T1 | Unpacked START.EXE (70,864 B, original code bytes) | `decode/bin/START.unpacked.exe`: history only (added in **1693549**, removed in e20cc32) | stays in this repo's history; never in the public repo |
| T1 extracts | 815 PNG extracts of DAX pictures (897 paths in history) | `decode/data/png/**` | remove from HEAD (not in the public repo); regenerate locally with `decode/tools/daxpic.py` |
| T1 renders | DOSBox reference captures and build screenshots, which show the original art pixel for pixel (≈345 PNGs) | `acceptance/ref/**`, `acceptance/out/**`, `acceptance/integration/**/*.png`, `acceptance/testparty/*.png` | remove from HEAD (not in the public repo); keep only the reports (pixel counts, SHA-256 of each shot) |
| T1 data copies | Test-party save: of its 24 `.ITM` item records, **21 match ITEM3.DAX shop records on ≥55 of 63 bytes** (checked 2026-10-18; README: "byte copies of the shop records"). Item names are built from the DS text tables. `.SAV` fields are computed from START.EXE DS tables. SAVGAMC.DAT is 73 non-zero bytes out of 13,137. | `game/assets/saves/testparty/*` | remove from HEAD (not in the public repo); build the party in the browser (§7) |
| T1 code/text dumps | Disassembly listings with the code bytes (`decode/listings/*.lst`, 52 files, plus Ghidra `.c`), ECL script listings with the game's text (`decode/ecl/listings`), the string inventory (`decode/STRINGS.md`, `decode/strings.tsv`) | tracked | remove from HEAD (not in the public repo); regenerate locally (the export scripts stay) |
| T2 descriptions | Pseudocode (`decode/pseudo`), data-format specs (`decode/data/*.md`), names maps (`decode/names`, `game/state/globals.json` = DS offset → name only), CROSSREF/GLOBALS | tracked | **[APPROVAL] ruling PR-BYOC-1** (§10) |
| T3 engine | `game/**/*.js` is a direct translation of the original code (not clean-room, the owner 2026-10-16). It contains short literal strings (prompts such as `'Put save disk in '`) and table offsets, but no data blobs: no base64 and no numeric array of 40 or more elements (grep, 2026-10-18). | tracked | stays; the residual risk is flagged in PR-BYOC-1 |

So BYOC removes all T1 material. T2 and T3 are not bytes from the original; they are our own text and code, derived from
our study of it. The owner ruled PR-2 = A: T2 and T3 stay (in this repo and in the public one).

## 2. Which files the player must supply

The engine reads only these (grep of `fetchFile`/`LoadDaxRecord` in `game/`, 2026-10-18):

| file(s) | count / size | needed for | required |
|---|---|---|---|
| `START.EXE` (EXEPACK) | 65,231 B | DS image `G.ds` (tables, strings) and the 08AE sound code segment (`audio.js` interprets it); unpacked in JS: `state.js unexepack()`, `res_00ba_core.ensureDsImage()` | **yes** |
| `*.DAX` | all 113 (8X8D1-8, BACPAC, BODY1-8, CBODY, CHEAD, COMSPR, CPIC1-8, DUNGCOM, ECL1-8, FINAL5, GEO1-8, HEAD1-8, ITEM1-8, MON1-8 CHA/ITM/SPC, PIC1-8, RANDCOM, SPRIT1-8, SQRPACI, TITLE, WALLDEF1-8, WILDCOM), 1,284,555 B | pictures, maps, walls, scripts, monsters, items | **yes** (all of them: the data set and the DAX name depend on the area) |
| `ITEMS` | 2,050 B | item-type table (InitGameState 5700:05A1) | **yes** |
| `GAME.OVR` | 206,105 B | nothing: the overlay code is translated into JS | no. If present it is hash-checked so we can report the version, then **not stored** |
| `SAVE/*` | any | the player's own saves (SAVGAM?.DAT, CHRDAT??.SAV/.ITM/.SPC, *.CHA) | optional. Imported into the existing save store (`files.js`, IDB `por-save`), with no hash check, only a size/format check (SAVES.md) |
| `POOL.CFG` | — | written at install time, not an original file | **not imported**: the engine builds `E\r\nP\r\n<data>\r\n<save>\r\nF\r\n` itself (`InitConfiguration` 042B:00A4 reads only line 1 video, line 2 sound, line 5 'F') |
| `CFG.EXE`, `CFG.C`, `POOL.BAT`, PDF | — | not used | ignored. The code wheel is only needed for `?wheel=1`; its table is DS:0002 `CodeWheelTable` inside START.EXE |

Required total: **115 files, 1,351,836 B** (≈1.3 MB).

**Version:** the copy we decoded is **version 1.3**, not the 1988 v1.0 release. ShowCredits 2500:00BE prints `version 1.3`
(decode/STRINGS.md), and the runtime is Turbo Pascal 6 ("Portions Copyright (c) 1983,91 Borland"). Every DS offset, overlay
address and ECL byte position in the decode belongs to this build. The manifest (Appendix A) is therefore **manifest
`por-1.3`**. Other releases (1988 v1.0/1.1, other re-releases, GOG's) are **unknown**: no copy is available here, and the
engine must not run on bytes it was not decoded against (§8 F2).

## 3. Architecture after BYOC

```
browser (game/index.html, our code only)
 ├─ boot: byoc.js checks IDB 'por-data' -> meta.manifest === 'por-1.3' and all 115 keys present?
 │     no  -> Import screen (§5)          yes -> normal boot (MainProgram)
 ├─ dax.fetchFile(name)  -> IDB 'por-data'/files/<NAME>  (memory cache as now; no network)
 ├─ files.js shipped()   -> IDB 'por-data'/files/SAVE/<NAME> (imported saves, read-only layer as /data/SAVE/ today)
 ├─ state.js initState() -> unexepack(START.EXE) in memory each boot (≈65 KB, a few ms); derived bytes are never stored
 └─ save store unchanged: IDB 'por-save'
server / launcher: tools/serve.py serves game/ only. The /data/ route is removed; it stays only as a dev mode (§6).
```

- New module `game/engine/byoc.js` (owner por-fixer/engine): the manifest check, the import pipeline, IDB `por-data` (object
  store `files`, key = upper-case name, value = ArrayBuffer; object store `meta`: `{ manifest, importedAt, gameOvr: 'match'|'absent'|'mismatch' }`).
- `dax.js fetchFile` keeps its signature (all areas call it unchanged) and reads from `byoc.get(name)` instead of `fetch(DATA_URL + name)`.
- `navigator.storage.persist()` is requested after import so Chrome does not evict 1.3 MB under storage pressure.
- The manifest `game/byoc/manifest-por-1.3.json` (file → size + SHA-256; Appendix A) is our own data, so it can be
  committed. Hashing uses `crypto.subtle.digest('SHA-256')`.

## 4. Import pipeline (per file)

1. Collect the candidate files from the source (§5). Names are matched **case-insensitively**; a top-level folder such as
   `POOLRAD/` or `PoolRad/` is stripped, as is a nested `SAVE/` directory.
2. Size pre-check against the manifest (cheap, catches the wrong folder at once). Then SHA-256 of every required file.
3. All 115 match → write them to IDB in **one transaction** (all or nothing), then `meta`. No partial state is ever stored.
4. Saves: every `SAVE/*` file with a known pattern is size-checked (SAV 285, ITM n×63, SPC n×9, SAVGAM?.DAT 13,137; SAVES.md)
   and copied into `por-save` **only where the store does not already have that name** (never overwrite the player's
   in-browser saves). A dialog offers "replace" if there is a conflict.
5. The DS image is not cached: it is derived at every boot, so the stored data is exactly the player's original files.

## 5. UX screens

All screens are drawn in our own HTML/CSS around the 320×200 canvas: the original font and pictures are not available yet.
Keyboard, mouse and gamepad (A = choose, B = back). Text in English.

| id | screen | content / actions |
|---|---|---|
| BY-1 | First start / Import | "Pool of Radiance needs your own copy of the game files (the folder with START.EXE and the .DAX files)." Buttons: **Choose folder** (`showDirectoryPicker()`, Chrome/Edge; recursive read), **Choose files…** (fallback `<input type=file webkitdirectory multiple>`, then `<input multiple>` if that fails), plus a drop zone for a folder or files (`DataTransferItem.webkitGetAsEntry()`, recursive). Link "Where do I get it?" (neutral text: a legally owned copy such as a store or archive release; no download links). |
| BY-2 | Checking | Progress bar `n / 115 files`, current file name; cancel. |
| BY-3 | Result OK | "Version 1.3 recognised — 115 files." Optional line "Saves found: N (imported)". Button **Start**. |
| BY-4 | Result failed | Table of missing files / wrong size / wrong hash, with a hint per cause (§8). If ≥ 80 % match but some differ: "This looks like a different version of Pool of Radiance (…); this reproduction supports version 1.3." Buttons: **Try another folder**, **Copy report** (text for a bug report: names, sizes, hashes of the mismatches only). |
| BY-5 | Settings → Game files | Shows version, import date and storage used. Buttons **Re-import**, **Remove game files** (with confirmation; saves stay), **Export saves** / **Import saves**. Reached from a small gear icon outside the canvas (not inside the game screen, which stays identical to the original). |
| BY-6 | Test party | Instead of a separate shortcut with a committed save: BY-3/BY-5 have **"Add test party (slot C)"**, which runs the in-browser generator (§7). The launcher `?testparty=1` does the same at boot. |

The acceptance flags (`?sting=1`, `?keys=`, `?seed=`) are unchanged. In headless runs the import screen is skipped by the
dev mode (§6).

## 6. Server, launcher, dev mode

- `tools/serve.py`: the `/data/` route goes away for players. Player launcher = static files only. That also means the game
  can be hosted as a plain static site, which needs a **[APPROVAL]**: hosting publicly is a separate decision from BYOC.
- **Dev/acceptance mode** (lanes, headless Chrome): `POR_DEV_DATA=<path>` with `serve.py --dev` serves `/devdata/`. The page
  then auto-imports from it **through the same byoc.js pipeline** (fetch → hash → IDB), so the tests exercise the real code
  path. It is off by default, and the `.cmd` launchers for the owner never set it.
- Node tests (`game/test/**`, `tools/make_test_party.mjs --check`) keep reading the originals from `POR_DATA` outside the
  repo. They need `decode/bin/START.unpacked.exe` regenerated by `decode/tools/unexepack.py` (already gitignored).

## 7. Test party in the browser

- Today: `tools/make_test_party.mjs` (Node) reads `decode/bin/START.unpacked.exe` + `ITEMS` + `ITEM3.DAX` and writes 16
  files, which are committed. As shown in §1, these contain copied original bytes.
- BYOC: move the generator body to `game/areas/testparty.js`. It already imports only `game/engine` modules (ecl.js records,
  dax.js, tp.js Random). Its inputs become `G.ds` (from the imported START.EXE), `fetchFile('ITEMS')` and
  `LoadDaxRecord('ITEM', '3', 53)`. Its output goes through `files.js writeFile` into slot C, the same files and names that
  `?save=testparty&force=1` copies today.
- `make_test_party.mjs` becomes a thin Node wrapper around the same module (keeps `--check`).
- Golden check without committing the bytes: before the files are deleted, record the **SHA-256 of each of the 16 files** in
  `game/test/party/testparty.golden.json`, then add a node test: generator output (from the local originals) = golden
  hashes. The generator is deterministic (fixed TP RandSeed), which the README already states.
- `party.json` (the readable dump) also contains item names from the original tables, so it goes too; the test prints it on
  demand.

## 8. Failure modes

| id | failure | detection | behaviour |
|---|---|---|---|
| F1 | Wrong folder (no START.EXE / no .DAX) | size pre-check | BY-4 "This folder does not contain Pool of Radiance (START.EXE + 113 .DAX files)". |
| F2 | Other version (1.0/1.1/GOG/patched) | many names present, hashes differ | BY-4 "different version"; **refuse** (the decode is byte-position specific: wrong DS tables would give wrong rules, not a clean error). Copy report → a later `manifest-por-<v>.json` once that version is decoded or proven identical. |
| F3 | Some files missing or corrupt (bad copy, truncated archive) | per-file size/hash | list the files; nothing stored. |
| F4 | Lower-case or mixed-case names, extra files, nested folder | name normalisation | accepted. |
| F5 | Player drops a .zip | extension | phase 1: "please unpack the archive first". Phase 2 (optional): ZIP reader via `DecompressionStream('deflate-raw')`, ≈150 lines. |
| F6 | No File System Access API (Firefox/Safari) | feature test | `webkitdirectory` input / drag-drop fallback (all three cover Chrome on the handheld PC). |
| F7 | IndexedDB unavailable (private window, blocked site data) or quota error | open/put throws | BY-4 "the browser does not allow storing the game files here"; offer a **session-only** mode (files kept in memory until the tab closes; import is needed again next time). |
| F8 | Storage evicted later | boot check finds keys missing | back to BY-1 with "game files were removed by the browser; please import again"; saves (other DB) are reported separately. |
| F9 | Saves from another version or corrupt | size check | skip the file, list it on BY-3; never block the game import. |
| F10 | Name conflict with existing in-browser saves | key exists | keep the existing one, offer "replace" (§4.4). |
| F11 | `?wheel=1` without the PDF | — | not a failure: the wheel is drawn from `CodeWheelTable` DS:0002 inside START.EXE. |
| F12 | User expects to play without a copy | — | BY-1 states it plainly; there is no demo data. |

## 9. Migration steps (in order)

Effort is in lane-hours of one Opus lane; "R" = needs a headless run under `acceptance/.runlock`.

| # | step | effort |
|---|---|---|
| 1 | Write the manifest `game/byoc/manifest-por-1.3.json` from Appendix A, plus a node test that the local POOLRAD copy matches it. | 0.5 h |
| 2 | `game/engine/byoc.js`: IDB `por-data`, the hash pipeline, the three input paths, `persist()`; node unit tests with a fake IDB. | 3 h |
| 3 | Switch `dax.fetchFile` and the `files.js` shipped-SAVE layer to byoc.js; remove the `/data/` fetches; add the in-engine `POOL.CFG` lines. | 1.5 h |
| 4 | Screens BY-1..BY-5 (HTML/CSS around the canvas, gamepad focus). | 3 h |
| 5 | Dev mode: `serve.py --dev` `/devdata/` auto-import; update `acceptance/integration/run.mjs`, `shoot*.mjs` and launchers; re-run RUN-1, P1-f and the ACCEPTANCE rows (R). | 2 h + R |
| 6 | In-browser test party (§7), golden hashes, `?testparty=1`, launcher change; re-run P1-f with it (R). | 2.5 h + R |
| 7 | Acceptance artifacts: change the scripts so screenshots and refs go to a gitignored `acceptance/local/`, commit only the reports (pixel counts + shot hashes); fix ACCEPTANCE.md links. | 1.5 h |
| 8 | Remove T1 from HEAD: PDF, `decode/data/png`, `acceptance/**/*.png`, `decode/listings/*.lst/.c`, `decode/ecl/listings`, STRINGS/strings.tsv, test-party files; extend `.gitignore`; make sure every removed product has a regenerate command in `decode/tools/README` (unexepack, daxpic, ghidra export, ecldis, strings_inv). | 1.5 h |
| 9 | Public release repo from a filtered clone (§9a): allow-list filter, verification gate, new GitHub repo; **[APPROVAL]** only for making it public. | 2.5 h |
| 10 | Docs: README "Run" section, game/README `/data/` text, FOREMAN/BUILD_PLAN notes; the owner's desktop shortcuts first start → import his POOLRAD folder once. | 1 h |

Total ≈ 18.5 h of lane work plus about 4 locked runs. Steps 1–7 can be done without anyone's approval and without losing
anything. No step destroys anything in this repo: its history keeps every earlier version (PR-3).

### 9a. Public release repo (ruling PR-3: new repo, this repo is never rewritten)

**This repo is not rewritten and not force-pushed, ever.** No `git filter-repo` is run in it, and nothing touches its `origin`.
It stays the private RE workspace with its full history, including 1693549 and 738b9dc. The public release is a **new
repository** whose history never held original material: the same route as StarCommandRE SC-4 A (its docs/BYOC.md §4).
Do this once BYOC steps 1–8 are done, after the fix requests (those always come first).

1. **Separate clone.** `git clone --no-local <this repo> ../PoolRadianceRE-public-build`. `--no-local` copies objects
   instead of hard-linking them, so the two stores share nothing. Run `git remote remove origin` in the new clone right
   away, so it cannot push back to the workspace remote.
2. **Allow-list filter, not deny-list.** Keep only own-work paths, so any T1 path we forgot is dropped automatically.
   - Pass 1: `git filter-repo --path game/ --path tools/ --path docs/ --path decode/pseudo/ --path decode/names/
     --path decode/tools/ --path decode/ghidra_scripts/ --path decode/ecl/ECL_VM.md --path-glob 'decode/data/*.md'
     --path decode/LAYOUT.md --path decode/CROSSREF.md --path decode/GLOBALS.md --path BUILD_PLAN.md
     --path ACCEPTANCE.md --path README.md`. The final list is the PR-2 A "public" set at the time this is run.
   - Pass 2, removing T1 that sits inside kept directories:
     `git filter-repo --invert-paths --path game/assets/saves/testparty --path-glob '*.png' --path-glob '*.pdf'
     --path-glob '*.exe' --path-glob '*.EXE' --path-glob '*.DAX' --path-glob '*.OVR' --path-glob '*.SAV'
     --path-glob '*.ITM' --path-glob '*.SPC' --path-glob '*.DAT'`.
   - Not carried over: the lane-management files (STATUS.md, FOREMAN.md, RULINGS.md, herdr/), which hold internal
     session ids and machine paths; `decode/listings`, `decode/ecl/listings`, STRINGS/strings.tsv, `decode/bin`,
     `decode/docs`; and `acceptance/` except its `.md` reports.
   - Commits that end up empty are dropped by filter-repo. Commit messages are kept (they are our text).
3. **Verification gate** (blocking; a script in `decode/tools/public_check.py`, run locally because it needs the originals):
   - (a) `git log --all --name-only | sort -u` = the reviewed path list, and no forbidden extension in any commit;
   - (b) no blob of `git rev-list --objects --all` has a manifest SHA-256 (Appendix A) or the SHA-256 of
     START.unpacked.exe or of the code-wheel PDF;
   - (c) **content check:** no blob contains any 64-byte window found in the originals. A rolling hash runs over START.EXE,
     the unpacked image, ITEMS and every decoded DAX record. This catches copied records like the test-party `.ITM`.
   - (d) a scan of the T2 docs for long hex-byte runs (≥ 32 bytes) and quoted DS strings longer than a few words. PR-2 A
     keeps the pseudocode, but byte dumps belong to "listings with code bytes"; any hits get replaced by offsets.
   - (e) on the filtered clone, with the originals imported via BYOC: the node tests and one acceptance run.
   - If the gate fails and the fix is unclear, fall back to a **single squashed initial commit** of the verified tree
     (`git checkout --orphan public && git commit`). That trivially meets "never held original material".
4. **Create the new GitHub repo as private**, push the filtered clone, review it on GitHub. Making it **public** is an
   outward-facing step: **[APPROVAL]** The owner, via the coordinator.
5. **Later releases.** filter-repo produces new commit ids on every run, so the public repo cannot be re-filtered and
   fast-forwarded. Each later release is instead one commit in the public repo: the allow-listed tree of the workspace HEAD
   (`git archive HEAD <paths> | tar -x -C <public checkout>`), committed only after gate 3(a)–(e) passes on it. The
   public repo gets a pre-commit hook and CI that reject forbidden extensions and files over 1 MB. The content check (c)
   stays local, because CI must never hold the originals.
6. **Never** add the workspace as a remote of the public repo, or the reverse. Lanes keep working only in this repo.

## 10. Rulings (the owner, via the coordinator; RULINGS.md is authoritative)

- **PR-2 — scope** (was PR-BYOC-1): **answered A.** Remove only original bytes and direct extracts (renders, dumps,
  listings with code bytes, copied save records). The pseudocode, specs and JS engine stay.
- **PR-3 — history** (was PR-BYOC-2): **answered: new public repo.** No history rewrite or force push of this repo. The
  public release is a new repo built from a filtered clone (§9a).
- **PR-4 — other versions** (was PR-BYOC-3): **answered A.** v1.3 only (manifest por-1.3); other versions are refused
  with a clear message (§8 F2).

## Appendix A — manifest por-1.3 (SHA-256 of the decoded copy)

Computed 2026-10-18 from `<targets>\goldbox\por\POOLRAD` (never modified). POOL.CFG is
omitted (written at install time).

| file | bytes | SHA-256 | role |
|---|---|---|---|
| `START.EXE` | 65,231 | `d825df2b174675c9088ba1489488bdeebe66ad2a22943f17d3a198e60b6a07bd` | required |
| `GAME.OVR` | 206,105 | `14e2b132470cbae275d8d925ddeeb9e370fdc5a7cfd4564ea3212dd4956ca722` | optional (not read by the engine) |
| `ITEMS` | 2,050 | `ece7dc8d8331c9b915b79c5963454bd5a4c3ab3b015844829b67016334eb0cf2` | required |
| `8X8D1.DAX` | 9,711 | `cce9313f23a600200fec60b5d46cd08aa9535a6143eee5d5d768a1d4e0415021` | required |
| `8X8D2.DAX` | 12,190 | `418fc6cfa448646d3f0b590b53d1c926a0b308a521260469c0d06d05a7869cf4` | required |
| `8X8D3.DAX` | 12,967 | `379aea0e70fe2f74512a2845176b3fb65d2d1f883abf661e7c8a9813e319c223` | required |
| `8X8D4.DAX` | 14,343 | `02dbb15f007e8609d365dcbf47b1ae850bff577569e5b844931f9312569fa032` | required |
| `8X8D5.DAX` | 5,847 | `90698c59d65d38b5cd4fb80c7ec8e9ad90f7ecce087d66dc47f5cf5b56ff3a2f` | required |
| `8X8D6.DAX` | 10,285 | `f24577eec17af3bbfe0ee8517391157b4b655a35082429d2618de223c2021083` | required |
| `8X8D7.DAX` | 9,820 | `d8086eb6b52f8a0b04156d67d2cfc16d4aefc571aad440285a55a601236bf0a2` | required |
| `8X8D8.DAX` | 14,510 | `05590e593534715f26790a82f9dbaf1ee73e29e7b71a038ee039a3d64651c4d5` | required |
| `BACPAC.DAX` | 11,328 | `17033abf359e9d2777f97e045433b11e5351c4e3e8787c09851c74ec404893b6` | required |
| `BODY1.DAX` | 4,139 | `a7ead275498703c349a0188585015b4d601582ff733bb738018278a07e8b6eae` | required |
| `BODY2.DAX` | 7,685 | `221a04bf51421c65a8759e5daa4c0d038ba50e7e662f63c38ca4d2746573feef` | required |
| `BODY3.DAX` | 21,505 | `7ea261c09a93293157e6865e1ac0ba82a8cbf149882dfd95e35704efd5a8b804` | required |
| `BODY4.DAX` | 4,185 | `7de15cbbb0ea180989dd02a69076e57a1c1f4d40c196137c1f9e231f693d9a62` | required |
| `BODY5.DAX` | 8,230 | `b27fa5baabfe1ac00455e38661028bbb54725d7f352076c0fc3cc8a61c7b168d` | required |
| `BODY6.DAX` | 6,545 | `4212c957474012b0441cbbd88660206a0298f4f257d50f46d9614fdb4f91a088` | required |
| `BODY7.DAX` | 5,717 | `67c83e25e9c63a19dd45c2fb6eeafa5ea3202bfa31e952a44e56028e4f562e97` | required |
| `BODY8.DAX` | 3,973 | `36d6c30d15706c1a05e139f49747809438f077e26139ef6707b3ff2e29c951af` | required |
| `CBODY.DAX` | 23,978 | `9928778ce936d070675233abeb008b27656838b0b41bc5a398a62f9b42151601` | required |
| `CHEAD.DAX` | 3,442 | `aecd2ebbcd0f6c9d6fe7fb490591ea0357c1ced8917be059cfd4e60e60d701d4` | required |
| `COMSPR.DAX` | 3,612 | `6bff177f6776339a627be3c0199518a41330f01f462e8994f649804e488a86d5` | required |
| `CPIC1.DAX` | 6,182 | `61a13e8daf91b511d316ecdc4e230e776c7d2de49894ccef3c30e2e250c09ff3` | required |
| `CPIC2.DAX` | 11,505 | `d9c24617095cb341a843fdb4921fe54d3d4ee0f909de2b3179301afb7ae567ba` | required |
| `CPIC3.DAX` | 3,150 | `0e063d1b659832639c859f4248e538a2ea69917acfcad394aaecec43228336df` | required |
| `CPIC4.DAX` | 12,154 | `181fe21499fce0504d84bcc3bb01d7911db74584400cdaa857a9fe7a20fdfac9` | required |
| `CPIC5.DAX` | 7,779 | `ace0d371b4e5a7fcb894a3c6b6078751ac52445b9e435897432e0a6ce576f705` | required |
| `CPIC6.DAX` | 8,101 | `f8285ccd2642a3c8c90b74810952796f240ee189412a5e24d7ed167c0ac424c6` | required |
| `CPIC7.DAX` | 6,178 | `6918aa709d53ef608574d734c879216f09c362ac1c8805f680232aad4744544a` | required |
| `CPIC8.DAX` | 10,325 | `dda82c9521fad757cf8dd35756393d76937a471224895ac99da92218c2a92f30` | required |
| `DUNGCOM.DAX` | 5,664 | `96149f6bcaca85771aad2490beaad44d8000f30458c9f1d84a23f319e2937268` | required |
| `ECL1.DAX` | 14,564 | `b1d08075869ef58ae4f08b53d2059b4ea60f0259c35fb6fda44e1c0737c3a4b9` | required |
| `ECL2.DAX` | 19,968 | `6ad6dc5aa53da82f4dba62dbc47d5a02a3f14c14071bec44e81a692615f08a3d` | required |
| `ECL3.DAX` | 24,955 | `fe3f2d46ca7f71caea26f114f229a59d6008eb1d116b09215bf0b06c3bee7135` | required |
| `ECL4.DAX` | 19,950 | `c01eecd57718e3899b06abd7c376bb06289cbb555ae19c0a4162f69957386b64` | required |
| `ECL5.DAX` | 27,914 | `475bcb10a321d78b69c7999516267a5a132b9b9fa7e75d9f673b1c63ba296ecd` | required |
| `ECL6.DAX` | 24,894 | `cd40ea59659fdcc00f99ece7d26d625985bf97edf07835aeb187f858d01a1f9e` | required |
| `ECL7.DAX` | 23,574 | `74b9aa32373d9bbc90ec615653f9cb99b7b2808759bdc36b8406111435e2e2e3` | required |
| `ECL8.DAX` | 24,167 | `81a07cf9ca1ac17288dc6fdd6980241ebb3239d6bb4205789a6a7e419b875457` | required |
| `FINAL5.DAX` | 36,603 | `b8e60dbe397bc8e79088812f0f4988c1bdcd497b109086ab8277d4c48354009c` | required |
| `GEO1.DAX` | 2,619 | `e6bcc8c5ea4b101497353ec75386b96ad6368447a6669f4f82ca7dac3c1e204a` | required |
| `GEO2.DAX` | 2,572 | `2035246014efdb26de3114f4737d52a935ad8834f79b4a8e4880da2922b6d595` | required |
| `GEO3.DAX` | 1,761 | `ce4b4ecb74b03ca18bda5d00e9050ec4e18284ef89edf816480800070ed0c6ee` | required |
| `GEO4.DAX` | 2,861 | `167017243737cfacb996433632d3c70a55ce506d794a44e31c02d34e9e3c55d5` | required |
| `GEO5.DAX` | 3,612 | `24c5b6f1bbf18b6f9a34600d99043e002848b9d2165189e4000c000a01f5c527` | required |
| `GEO6.DAX` | 2,324 | `8bf4bbf5b1845c9d3181a7d47382d75f5337e27e1263690abb8820f9b722ecdb` | required |
| `GEO7.DAX` | 3,118 | `5f30b6e76ca42b563253fc9b4cee5be7db6ccbe0eb38eefe37866197e5be2127` | required |
| `GEO8.DAX` | 4,690 | `050cd0316ebf339f6b36233156eb99129c8eaa689df89e05fbfa13d72e89c045` | required |
| `HEAD1.DAX` | 1,863 | `20f95a9acd7c362648da77b6a7ae85cfd727b554daeccd4b14e937beeea08ddf` | required |
| `HEAD2.DAX` | 2,808 | `98420012ee7e4070624020ee041ce1577ed4e4946c1a3a2d1ed59e59cbb7e613` | required |
| `HEAD3.DAX` | 12,403 | `1413773d5c2841bf62902a0d5bef7fc7439e9644fc518e03ae1b268d34ea1ed4` | required |
| `HEAD4.DAX` | 1,702 | `edb292f32c4213e106f77f2c72b810fbb505b7d065348b82b6c3046ac56861d4` | required |
| `HEAD5.DAX` | 6,708 | `fda77add43df4d8380c905f098d7287d9deb3c26e228eeb32977932434f4a692` | required |
| `HEAD6.DAX` | 4,577 | `f6c7b6b67341b1d469cfaff049c95a2b91777a1d075645626cd53dba0735d8ca` | required |
| `HEAD7.DAX` | 6,192 | `3359dbf1a1726ee3f8162afeab082f47484388c747a2c61a8b9d5a3341f4c51b` | required |
| `HEAD8.DAX` | 1,814 | `0435c5b0d9ac9a990a5daab2bcd69459c92758973884398d22a9ccf450bfbd91` | required |
| `ICON.DAX` | 1,287 | `6ca4bce61eb5c31cf01ca1538dfa60401f24f286ba29d60926e4fd07cd7809eb` | required |
| `ITEM1.DAX` | 2,785 | `54216036d2897201e0d606547378757cce0eaf369793b9230d66b82b17e2e0d8` | required |
| `ITEM2.DAX` | 632 | `48bedd08c0750aa174f4309d4fe742e7b9df9ffef63954d00fc29643e8512ace` | required |
| `ITEM3.DAX` | 4,687 | `84d71e83b5d51b02c407e9969cae51ef5034af111a8885b34a6c4e04e4e03d89` | required |
| `ITEM4.DAX` | 2,364 | `468b427186027fdbd1dfee1d24d1c4118a0c9329d93da279113a08ff31c71d63` | required |
| `ITEM5.DAX` | 2,130 | `4c03380630a978d6565eba2b9050a4bb7d41b6bfea3a49047f2d79b3523384b3` | required |
| `ITEM6.DAX` | 27 | `bb26f127d13ae6f8d0ed9e6420a75b513766fe355ae7636f4cd44ca5707981a0` | required |
| `ITEM7.DAX` | 81 | `f83968c1b177bfa877aa1c1c44df4f0600e8a21378194632aabf16a251b49d82` | required |
| `ITEM8.DAX` | 716 | `c6c1c456f99a8848f22d5d4f9b7349cdd8b59a4b658696c81046c5949b6f0387` | required |
| `MON1CHA.DAX` | 1,766 | `304cf750bac1474a3c5a1a15570795da598157e8e2da9f219cbc2ca0e4097225` | required |
| `MON1ITM.DAX` | 792 | `048e3f8e2a434004e2fff5e519da2a4e9b3b6aad87eb310a9c21b6e814e7deaa` | required |
| `MON2CHA.DAX` | 3,254 | `30ba6c43886dcf9ac661b5c1870862da95c00e38040dbbe58d077d2fead3a2a0` | required |
| `MON2ITM.DAX` | 1,293 | `06a69dd2a63077a464a3a936ed3f14dc4d463175d43de6670e3c30fe41481988` | required |
| `MON2SPC.DAX` | 150 | `8ab7c7a7593466eb269a9ea5fb1a48e08c5707cec0fb24aaaa1c36d3711645f8` | required |
| `MON3CHA.DAX` | 2,521 | `bfcea37ee0ebb7549036e9815c367ccd6ffa4368c63945b0510ecc021ded0600` | required |
| `MON3ITM.DAX` | 1,329 | `8ba4c7f722469c671c5b5cc4021b6d11e750b31a492c73e26917894555ef2ed1` | required |
| `MON4CHA.DAX` | 3,006 | `e6f6de26dcd8880d169667bf1fb2780409686e32a58be54624085a79e2fd715e` | required |
| `MON4ITM.DAX` | 349 | `e9c8ee5a987a498c4b93950d001f45b855f248df779457678f51364bac7517e9` | required |
| `MON4SPC.DAX` | 904 | `4e87bb3aeb9d6a8750dfad5d0fe5a416c5d921dac9a7f36dfce91492dda99343` | required |
| `MON5CHA.DAX` | 2,377 | `dd8bc74ea450a581a1f7cacd4afc5c823bb0990ea6e5aa753d50619e21706d82` | required |
| `MON5ITM.DAX` | 739 | `dd3bf78c479909b87b0ddf32bc32380c02fa8d62953e26d5ae05c1bc21874c94` | required |
| `MON5SPC.DAX` | 238 | `d711f338646c474afce4da37a7b0513f657e199e0b1a98c34d662d0a620f845c` | required |
| `MON6CHA.DAX` | 2,562 | `2ad12c6a1f3b1f8a11fa39fa4752814dae0f9296fb032121913b06341624b53b` | required |
| `MON6ITM.DAX` | 978 | `b56cf3c70e13f31121cfc57464db5420dbf5a1c6cbfdcf3714818038fcb214cb` | required |
| `MON6SPC.DAX` | 124 | `c3304d4a8b5fad3ce02917079453ae567a22e188c1121e92a3c0e33ffa6a37ff` | required |
| `MON7CHA.DAX` | 2,773 | `af406dd08cd0e4b07069c9bfd2eade739628e565b87c981eb857f8d46ff36e36` | required |
| `MON7ITM.DAX` | 1,320 | `86ef5f43c05db3c1aeedaa26875e1325bd01e6d78ba4ef270aa1c8e99b7a594f` | required |
| `MON7SPC.DAX` | 36 | `e068cfe5d81874f8099944930b49d69460a031d70d779f846385a0e4aee2a5e5` | required |
| `MON8CHA.DAX` | 2,042 | `3d47476ed41519a0adc730ff58f7787bc71aadd566c9a7459dee2c4b30c7fe83` | required |
| `MON8ITM.DAX` | 350 | `ffeebbd5822542894ec0c8090025e735b58f9aafe09e97d2781321d42a00902f` | required |
| `MON8SPC.DAX` | 134 | `b5d80a56634e30b764e1d2a032d8d1ce767b20b7f9bb1e5fc7f65cf67737df37` | required |
| `PIC1.DAX` | 36,273 | `ff636705387218dcca9b8f559e12223d2f1ab1ca45c56fcc5e11b6fd67f0891d` | required |
| `PIC2.DAX` | 71,533 | `aa0f7e67e65b362e19056a6d869b9238e2d2815404c508c7e93f72f0abef0f21` | required |
| `PIC3.DAX` | 15,316 | `44fc6edc72bad4a62ac4b5c45ca90ff99d59370044342c0bb2e3e8b4809d028d` | required |
| `PIC4.DAX` | 91,885 | `346d2f48680a7693137c2a2366903fbe59ce1de94f7b02b2654a81b7e2d6cdc8` | required |
| `PIC5.DAX` | 46,750 | `522f71a6de97a59e69e11985c91b5cae279961c30648b26286036a14f1710227` | required |
| `PIC6.DAX` | 66,888 | `2c93668dc322c4823b20d7be7ae51653f0c03f31fd1f94dc8c109541f71d0234` | required |
| `PIC7.DAX` | 67,804 | `4171a7d575b562ccb9bbe28fa1e4d0fa3250625744a418931d0721a07a3b12cd` | required |
| `PIC8.DAX` | 67,227 | `760cf9042110bbf41e60bb4b0cf76635398751ceaf1ce693dc5e39ef92d8200a` | required |
| `RANDCOM.DAX` | 755 | `9e176f9521f0157c86a2f5891766ae19f0b9c29165138d7588f465d75ff48da2` | required |
| `SPRIT1.DAX` | 5,613 | `a7a822a1fb883aa619881e0cfca0b8534b29ee07786b5eab722c3e7163bde3a7` | required |
| `SPRIT2.DAX` | 16,768 | `413c1dd3a1a787122396aab3b9451b4c4058ad1a0612309945cd6064fce8585e` | required |
| `SPRIT3.DAX` | 6,124 | `890f70ff6fb131f03abca845f5468b601fda3c1b5daf9dc163b72dad6bf1f9d0` | required |
| `SPRIT4.DAX` | 11,176 | `3a32d1a894ab35c5a6541d9cd686ee61ef6a18bb7a1a5581132e181c3c10aef1` | required |
| `SPRIT5.DAX` | 13,174 | `edcba16aab8187feb733f2edd50e4b7edec9b18af6a7a48973af231d1e47dd59` | required |
| `SPRIT6.DAX` | 13,727 | `53b777d72abba897d20452fe68ab4242bbc0fcb58101991fc7000860bef61079` | required |
| `SPRIT7.DAX` | 12,985 | `11090b90c51a655ade1aaa0b76e2ab30ce961d1e2d4f17483a91b11d51f30f5d` | required |
| `SPRIT8.DAX` | 14,853 | `046fb1431b1401e7267ad79038c74160cb9d91c77dbc10cb6a7acfd3cccd2c47` | required |
| `SQRPACI.DAX` | 69,788 | `88c7892b2b0fb96929840535a39b0145b13ac8ff0b4fb7188e9f39f30afe11dd` | required |
| `TITLE.DAX` | 33,898 | `7944ab87afbe0002d39479d138c78c7b6b219bd6bbc3fb6844d361f5cd4dba2b` | required |
| `WALLDEF1.DAX` | 2,147 | `7a6102b9a38b2400f38d3c3d66460ab889ab7b35bc684c9ac282b80de028ec5a` | required |
| `WALLDEF2.DAX` | 4,044 | `bfbd4106d6207ea22d0e5862074ddef582ae24772656b9e47251f1b00933995d` | required |
| `WALLDEF3.DAX` | 4,289 | `86a8b136b0254398c03c31fdf13ebe2d23cf571d473a4f38718578f1479f661e` | required |
| `WALLDEF4.DAX` | 4,956 | `e1729459c867048b25553beea4681808c958a5501291b9bf931def3463fe70ed` | required |
| `WALLDEF5.DAX` | 2,121 | `26d2dbab7054fc22fb4ce44019b6e5cb0d981a05d082a4a22b085dbafd0b4802` | required |
| `WALLDEF6.DAX` | 3,492 | `d1b1ebc727dca3e65d86d4ccbf7f461dca59b64cce173d51bd46f024e5121010` | required |
| `WALLDEF7.DAX` | 3,176 | `cbb055cf16e516cdfc58cae66fdff21ceaa2f33adbe17321fb57c47f589238aa` | required |
| `WALLDEF8.DAX` | 4,998 | `1fc950ad158ef1542f13efc1d7ace02e61ba8e49b8042850098386648285bca2` | required |
| `WILDCOM.DAX` | 5,786 | `b56655e896772d11322ef3bc8a69988704cdc27ce67b8ad6f7fcded90f1bfb7c` | required |
