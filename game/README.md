# game/ — Pool of Radiance in the browser (HTML5, vanilla ES modules)

Run: double-click `Play Pool of Radiance.cmd` (repo root) or the Desktop shortcut, or `python -I tools/serve.py 8188 [--dev |
--player]` and open http://localhost:8188/index.html. Players: see README.md "Run". Keyboard as in the original; gamepad:
d-pad = cursor keys, A = Enter, B = Esc, X / Y = move the menu highlight, Menu = Gold Box Plus.

Without a selected profile, the front door asks you to choose a game and press Start. `?profile=por` starts Pool directly.
The selected profile supplies its engine entry and BYOC manifest before game initialization. Named acceptance screens
retain the Pool route for compatibility. F12 or the Plus Menu gear opens the modern panel; Esc closes it. The game
preserves buffered BIOS/script input while the panel is open. The separate game-files gear still opens BYOC settings.
Helpers → Play the original game disables additions; `?plus=0` starts in that mode.

Games, Pedia, Map, Journal, Quests, Mods and Scenario are mounted at boot. Cheats is available with `?dev=1`, STING or
Helpers → Developer tools, and hidden in original mode. `?profile=por&scenario=sokal-gate` installs the scenario as a
saved game and loads it through the normal party menu. Export saves includes `plus/notes-<slot>.json` sidecars
(including any journal text imported by the player); restoring those sidecars is separate work.

Game files (BYOC, docs/BYOC.md): no original file is in the repo. `engine/byoc.js` imports the player's v1.3 copy into
IndexedDB `por-data` after checking it against `game/byoc/manifest-por-1.3.json`; `dax.js fetchFile` then reads from there
(`dataSource = 'byoc'`). Boot order (main.js `openGameFiles`): 1. an imported copy (or an F7 memory-only session);
2. **dev mode** — `serve.py --dev` serves `/devdata/` (+ `/devdata/?list`) from the local folder (env `POR_DEV_DATA` /
`POR_DATA`, default `../re-targets/goldbox/por/POOLRAD` next to the repo, i.e. `<your POOLRAD folder>`) and `byoc.devImport()` imports it through the
same pipeline, saves included, without a screen (lanes, headless runs, the owner's launchers; a fresh headless profile imports
at every run); 3. the import screens (`game/byoc/ui/byoc-ui.js ensureGameFiles`, BY-1..BY-4; BY-5 settings via
`mountSettings`); 4. the legacy `/data/` route (served unless `--player`; kept as the last fallback). POOL.CFG is not read:
the engine supplies its lines (`main.js POOL_CFG` = `cfg.exe EGA PCsound F`). Node tests keep reading the originals from
`POR_DATA` outside the repo.

Mouse (engine/input.js pointer layer; the original has no mouse, so a click only types the key a player would type):
- click a word of the bottom menu line = its hotkey; on the party menu, click a line ("Load Saved Game" …) = its letter;
- click a list item = the highlight moves there (Home/End steps); click the highlighted item again = Enter; wheel = up/down;
- click a party member's row in the roster = End until that member is selected (party menu and explore menu only);
- in the 3D view: click the left third = turn left, the centre = step forward (Up), the right third = turn right;
- right-click = Esc. Works at any window size (coordinates are mapped from the scaled canvas to 320x200).
Screen routines register their hit regions with `setPointerRegion(name, { x1, y1, x2, y2, prio, keysAt })` while they wait
(menus.js HorizontalMenu `hmenu`, VerticalListMenu `vlist`, 00BA DrawPartyRoster `roster`, PARTY menu `pmenu`, VIEW
ExploreCommand `view`); ClearScreen drops stale regions. Acceptance runs can click with a step field
`"pointer": [{ "x": 40, "y": 114 }, { "x": 60, "y": 58, "wheel": 120 }, { "x": 10, "y": 10, "button": 2 }]` (320x200 points).

URL options (acceptance/test hooks, not game behaviour): `?sting=1` (= `START.EXE STING`: no title/credits, debug keys),
`?wheel=1` (show the code wheel; bypassed by default), `?seed=n` (RandSeed after Randomize), `?fast=n` (delays / n),
`?screen=<SCREENS_INDEX id>` (stop when that screen is complete, sets `window.__screenReady`; `idle` = when the key script is done and the game waits), `?keys=LA{Enter}{Up}` (key script, one key per idle wait), `?save=<name>&force=1` (copy game/assets/saves/<name>/ into the save store), `?testparty=1` (generate the level-4 test party into save slot C from the game files: areas/testparty.js, BYOC step 6), `?wheelentry=n`.

## Engine API for the area lanes (owner: por-build-engine)

Every function carries the `seg:off` of the routine it translates. All Pascal parameter orders are kept (first parameter = first
pushed). Async functions return Promises (`await` them); everything that waits for keys or time is async.

| module | exports (Pascal routine) |
|---|---|
| `engine/tp.js` | `Random(n)` (0AF8:11C0, exact TP 6 LCG), `Randomize()`, `setRandSeed(v)`, `UpCase`, `byte/word/shortint/integer`, `pstr` |
| `engine/timer.js` | `TimeInHundredths()` (0709:0C3F), `Delay(ms)` (Crt), `sleep`, `yieldShort` |
| `engine/display.js` | `Display` (320×200 index framebuffer, EGA palette registers; `setPaletteRegister(i, c)` = 0464:2A0D) |
| `engine/dax.js` | `LoadDaxRecord(name, ext, id)` → Uint8Array or null (0802:0716; a missing file = the disk prompt 0802:025D), `DaxRleDecode`, `FileExists`, `fetchFile` (byoc copy, else `/data/`), `useByoc(get)`, `dataSource` |
| `engine/pictures.js` | `state` (DataPath, DataSet, ClipPictures, display, viewPic g_4A20, saveBuf g_4A24, SymbolSets g_5E3A), `AllocPicture(h, w8, count, flags)` (0464:248E), `LoadPicture(name, id, maskFlags, transpColour)` (0464:0111), `PutPicture(col, row, pic)` (0464:1951), `DrawPictureInto(x, y, frame, flags, src, dst)` (0464:08D4), `DrawPicture(col, row, frame, flags, src, dst)` (0464:0D71), `FlushViewDirtyLines()` (0464:1B52), `FillPictureRect(x, y, w, h, colour, cgaMap, pic)` (0464:2632), `MirrorPicture(src, dst)` (0464:15C7), `RecolorPicture(from, to, frame, randomMix, pic)` (0464:1E5C), `Load8x8Set(id, block)` (CA00:003B), `Put8x8Symbol(col, row, sym, toView, masked)` (CA00:015D), `LoadAnimationRecord(name, id, xorDeltas)` |
| `engine/text.js` | `text` (font, col/row = text_Col/text_Row, TextOutputActive, GameSpeed), `LoadTextFont`, `DrawRepeatedGlyph(col, row, colour, count, ch, textMap)`, `ClearGlyphRun`, `DrawText(col, row, colour, s)`, `ClearTextRectangle(x1, y1, x2, y2)` / `ClearRectangle`, `ClearScreen`, `ClearMenuLine`, `MessageDelay`, `ShowBottomPromptAndReadKey(colour, s)`, `ShowTimedBottomPrompt(s, colour)`, `ShowTimedBottomMessage(s)`, `DrawWrappedText(x1, y1, x2, y2, colour, clear, s)`, `ReadBottomLine(prompt, colour, maxLen)`, `ReadWordNumber(prompt, colour)`, `DrawFrame(x1, y1, x2, y2, style)`, `DrawTitledFrame(x1, y1, x2, y2, style, colour, title)` |
| `engine/input.js` | `KeyPressed()`, `ReadKey()` (Crt: #0 then scan code), `ReadGameKey()` (0899:0059), `PollOneKey()`, `pushKey/pushChar/pushExt` (inject), `keyState` |
| `engine/menus.js` | `menu` (sel, ext, timeout, timeoutKey, top, animHook, forceAnim), `HorizontalMenu(prompt, options, promptColour, textColour, hotColour, allowExt, animate)` → `{key, ext}` (9D00:03BD; Enter only if textColour or hotColour ≠ 0), `AskYesNo(prompt, c1, c2, c3)` (9D00:10D1; Y/N only), `ClearMenuLine()`, `NewMenuList(n, list{v})`, `FreeMenuList(list{v})`, `ListItem(n, list)`, `ListCount(list)`, `VerticalListMenu(prompt, options, cHeader, cItem, cSel, left, top, right, bottom, list, showExit, redraw{v}, index{v}, item{v})` → Char (9D00:0D9A). Items `{text, isHeader, next}` |
| `engine/audio.js` | `PlayOrStopSound(snd)` (08AE:00DC, async: transient mode waits 0.1 s), `SetSoundTimerMode(mode)` (08AE:01A5), `ResetSound()` (08AE:017B), `toggleSound()` (^S) — the 08AE interpreter run on the original sequences (PC speaker → Web Audio square wave) |
| `engine/state.js` | `G` — the shared globals object (merged names from game/state/globals.json, `G.g_XXXX` aliases the named property), `G.ds` DS 0C7C image (unexepack of START.EXE), `initState()`, records `newChar/newItem/newEffect` (ecl.js shape `{b, next, items, effects, combat}`), `rdW/wrW/pstr/setPstr/charName`, `unexepack` |
| `engine/files.js` | save directory (IndexedDB `por-save`): `readFile(path)` (store, else in the `/data/` fallback the shipped SAVE/ read-only), `fileExists`, `writeFile`, `eraseFile` (tombstone), `readLines/writeLines` (charlist.txt), `reader(bytes)` for BlockRead-style code, `importSaveSet(name, force)` (?save=), `storeHas(path)`, `listStore()` → `[{ name, bytes }]` |
| `engine/byoc.js` | BYOC import (docs/BYOC.md §3/§4; full contract in its header): `loadManifest()`, `collectFromDirectoryHandle / collectFromFileList / collectFromDataTransfer / collectFromUrl` → candidates, `validate(cands, { onProgress, signal })` → report (`ok`, `files[]` status ok/missing/size/hash, `saves[]`, `likelyOtherVersion`, `gameOvr`), `importFiles(report)` (one IDB transaction + `persist()`), `importSaves(report, { replace })`, `checkSaves(cands)`, `useSession(report)` / `sessionActive()`, `devImport()`, `isImported()`, `info()`, `get(name)`, `preload()`, `removeGameFiles()` |
| `engine/dax.js` (+) | `SetDataSet(n)` 0802:094A, `RestoreDataSet()` 0802:095D |
| `engine/tp.js` (+) | `ParamStr(1)` = 'STING' in STING mode |
| `engine/dev.js` | `dev.screen(id)` / `dev.screenSoon(id)` — acceptance hooks; call at the point where screen `id` is complete |

Area code goes in `game/areas/<area>.js` (owners: BUILD_PLAN §6). `areas/startup.js` (InitGameState / ShowTitle / ShowCredits /
CodeWheelCheck / M1 party menu) was written by build-engine for M1; `main.js` uses `areas/party.js` `PartyCreationMenu` as soon
as build-party provides it. `areas/party_ov17.js` (LoadGame / ReadCharacter / AddToParty, PARTY ov17) was written by build-engine for M2 and
passes to build-party.
