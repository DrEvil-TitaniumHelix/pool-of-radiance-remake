# Gold Box Plus hooks (W1) — `game/plus/hooks.js`

The engine (`game/engine`, `game/areas`) stays pixel-exact and only **reports** what it does. Gold Box Plus
(`game/plus/*`) listens, reads state and registers mouse regions; it never writes game state through this layer.
Owner: gbp-hooks. Architecture: GOLD_BOX_PLUS.md "Architecture".

```js
import { hooks } from '../plus/hooks.js';       // from game/plus/*: './hooks.js'
const off = hooks.on('textPrinted', (p) => notes.add(p.text));   // returns an unsubscribe function
hooks.on('*', (p, name) => console.log(name, p));                // every event
hooks.state.position();                                          // { block, dataset, x, y, facing, ... }
hooks.registerRegion({ id: 'pedia-roster-0', rect: { x1, y1, x2, y2 }, left: [[0x0D, 0x1C]], right: [{ label: 'Info', action }], kind: 'party' });
```

## 1. Event bus

- `hooks.on(name, fn)` / `hooks.off(name, fn)`; `fn(payload, name)`. `name = '*'` gets every event.
- `hooks.emit(name, payload)` is called by the engine only. **Synchronous**: listeners run inside the engine's call, before
  the engine's next statement. A listener must not await game code, change game state or draw on the game canvas.
- **Never throws into the engine**: a listener (or a payload builder) that throws is caught and logged with `console.error`
  (`[hooks] <event> listener failed: ...`); the other listeners still run. Unknown event names are warned once.
- Payloads are **fresh plain objects** (summaries and copies, never the engine's records), built by a thunk at the call site
  that runs only if somebody listens (or the log is on). A payload builder may return `undefined` = nothing to report.
- **Master switch** `hooks.enabled` (default `true`; `false` = "Play the original game", ruling GBP-4): emit is a no-op,
  every Plus region is removed and `registerRegion` refuses new ones, so the mouse is exactly the engine's own layer
  (engine/input.js). Set it from the Plus settings; `?plus=0` starts with it off.
- Test log: `?hooklog=1` (or `hooks.startLog()`) records `{ ...payload, seq, event }` for every event in `hooks.log`
  (`window.__hookLog`); `hooks.stopLog()` returns it.

## 2. Events

Address = the decoded statement the call site sits at (seg:off of the pseudo routine, `decode/pseudo/*.pas.md`). All
coordinates are 320×200 game pixels; text cells are 8×8 (col × 8, row × 8). `facing` 0..3 = N E S W (`party_Dir >> 1`).

| event | payload | source (file, address) | fires |
|---|---|---|---|
| `textPrinted` | `{ text, window: 'text', clear, source }` — source `PRINT` / `PRINTCLEAR` / `VERTICAL_MENU` (the menu's prompt) / `ENCOUNTER` (the approach text) | ecl.js op11_Print 2F00:0A09 (at 2f00:0a29), op15_VerticalMenu 2f00:0f92, op29_EncounterMenu 2f00:215c | when an ECL script text is about to be drawn into the text window (cols 1..38, rows 17..22); `clear` = the window is cleared first (PRINTCLEAR). A number PRINT gives its decimal text. Not reported: PRINT_MEM (3C, glyph runs from VM bytes), the fixed engine texts ("Both sides wait.", combat messages) |
| `journalRef` | `{ n, kind: 'entry' \| 'proclamation', id?, text, source }` | derived in hooks.js from `textPrinted` (the original has no journal opcode) | for every journal entry the printed text points at: `... JOURNAL UNDER ENTRY 25`, `... ENTRY 7 IN YOUR JOURNAL`, `ENTRIES 23 AND 14`, the number in a following PRINT (`UNDER ENTRY ` + number, ECL8 B512); proclamations (roman numerals, `n` = value, `id` = numeral) printed after `IN YOUR JOURNAL YOU NOTE ` (ECL3 AC25) until the next PRINTCLEAR |
| `areaEntered` | `{ block, dataset, x, y, facing, dir, travelMode, gameMode, map3d, is3D, source }` — source `GAMELOOP` (game started / loaded) or `NEWECL` (block change) | ecl.js gameLoop 2f00:3362, runAfterNewBlock 2f00:31ed (both right before `ecl_Run(VecE)`) | once per block entry (game start / load, every NEWECL, also a re-entry of the same block), before the block's init script runs, so the area's first texts come after it. Block and dataset are final; the position is the one the game had on entry (load: the saved square; NEWECL: the square the old script set) — the init script may still move the party (then `viewDrawn` / `moved` carry the new square), and `map3d` is the previous 3D map until the script's LOAD_FILES |
| `moved` | position fields as `areaEntered` + `{ from: { x, y }, stepped, turned? }` | ecl.js gameLoop after MoveParty 2f00:348d; view_ov14.js ExploreCommand turn 6600:0b14 (`turned` = 2 right, 6 left, 4 about) | after every move command of the explore loop (a blocked step has `stepped: false`) and after every turn in the 3D view |
| `combatStart` | `{ monsters: [char summary], duel, partyCount }` | ecl.js op24_Combat 2f00:1827 | right before CombatMain (ov08_007A). `monsters` = the last MonsterCount records of the party list (LoadMonster appends there); a duel lists ROLF |
| `combatEnd` | `{ result: 'won' \| 'fled' \| 'partyDead', code, xp, party: [char summary] }` | ecl.js op24_Combat after AfterCombat (ov05_1527) | after the result, XP, treasure and "THE END" screens. `code` = VM 6DC7 (block 2 +58Eh: 0, 81h fled, 80h destroyed); `xp` = CombatXP (per character, as on COMBAT-01) |
| `monsterShown` | `{ id, dataset, name, pic, count, slot, ref: { dax: 'MON<ds>CHA', record: id }, icon: { dax: 'CPIC<ds>', record: pic } }` | ecl.js op0B_LoadMonster 2f00:07fd | for each LOAD_MONSTER (`count` copies). The loaded records are remembered (WeakMap in hooks.js, nothing written into them), so every later char summary of them carries `monsterId` + `dataset` (combatStart, combatEnd, partyDrawn) |
| `pictureShown` | `{ pic, dataset, head, ref }` (`ref` = `{ dax: 'PIC<ds>', record: pic }` for a plain picture, `null` for a HEAD/BODY portrait pair) | ecl.js op0E_Picture 2f00:08b7 | when a script shows a picture (PIC record `pic`; `head` set = HEAD/BODY portrait pair) |
| `npcTalk` | encounter: `{ kind: 'encounter', text, choice: 'COMBAT' \| 'WAIT' \| 'FLEE' \| 'ADVANCE' \| 'PARLAY' \| null, distance, sprite, pic, dataset }`; parlay: `{ kind: 'parlay', choice: 'HAUGHTY' \| 'SLY' \| 'NICE' \| 'MEEK' \| 'ABUSIVE' \| null, result }` | ecl.js op29_EncounterMenu 2f00:21bd, op2C_Parlay 2F00:25CB | after the player chose in the encounter menu (once per choice, also "WAIT"/"ADVANCE" repeats) / the parlay attitude menu |
| `treasure` | `{ items: [{ name, type }], money: [cp, sp, ep, gp, pp, gems, jewelry], afterCombat }` | combat_ov05.js TreasureMenu 3900:0ECD | when the treasure screen opens with something in the pool (ECL TREASURE + COMBAT, and after fights). `name` is the item's built name if the engine built one, `type` the ITEMS index |
| `flagSet` | `{ addr, value, old, region }` — region 0 = VM 4900.., 1 = 6B00.. (character fields mapped), 2 = 9700.., 3 = code 9900.., 4 = engine globals (C04B position etc.) | ecl.js setMem 4300:0C77 (ecl_SetMem) | after **every** ECL memory write of a script (SAVE, arithmetic, RANDOM, menu results, ...). Writes of strings (SAVE of a string) are not reported |
| `menuDrawn` | hmenu: `{ region: 'hmenu', kind: 'hmenu', prompt, items: [{ label, key }], selected, ext, enter, rect }`; party menu: `{ region: 'pmenu', kind: 'partyMenu', items: [{ key }], rect }` | menus.js HorizontalMenu 9D00:03BD (after DrawOptions 9d00:048b); party_ov16a.js party menu 7000:02c0 | each time a bottom-line menu starts waiting (also the one under every list), each time the party menu lines are drawn |
| `listDrawn` | `{ region: 'vlist', prompt, options, items: [{ text, header }], index, top, page, exit, rect }` | menus.js VerticalListMenu 9D00:0D9A (9d00:0ee4) | when a list starts waiting (item index 0-based into `items`; `top` = first visible) |
| `partyDrawn` | `{ region: 'roster', col, firstRow: 4, members: [char summary], rect }` | res_00ba_u.js DrawPartyRoster 00BA:0767 (00ba:08d3) | every roster draw (row of member i = firstRow + i) |
| `viewDrawn` | `{ region: 'view', mode: '3d' \| 'areamap' \| 'overland', x, y, facing?, travelMode?, origin?, rect? }` | view.js Draw3DView B100:05FD (b100:0dab), DrawAreaMap B100:0000 (b100:0146), RefreshView A200:016D (a200:0299) | after the 3D view / 11×11 area map (rect 24..111 × 24..111, `origin` = map cell of its top-left) / overland window (`origin` = window cell) is drawn |
| `combatTurn` | char summary of the actor + `{ index, col, row, size, enemy, menu }` (`menu` = the combat menu words, e.g. `Move View Aim Use Cast Quick Done`) | magic_ov08.js CombatMenu 4800:0666 (4800:07ec) | each time a player-controlled combatant's combat menu is about to wait |
| `combatCursor` | `move`: actor summary + `{ col, row, moveLeft }`; `aim`: the shown target's summary + `{ col, row, menu }`; `manual`: `{ col, row, valid, under }` (cursor cell, whether Target is offered, who is under it) | magic_ov08.js MoveAttack 4800:0ac3; combat_ov13.js TargetMenu 6100:2c04, ManualAim 6100:314b | before each wait of the Move/Attack prompt, the Aim menu and the manual aiming cursor |
| `inputStarted` | `{ kind: 'line' \| 'number', prompt, maxLen, max?, col, row: 24, text: '' }` | text.js ReadBottomLine 0709:09E3 (0709:0a2b; names, the code word, ECL INPUT STRING, ReadWordNumber 0709:0B66 = ECL INPUT NUMBER); party_ov21.js InputNumber 8900:0294 (8900:02fb; coin and item amounts) | when a line-input prompt starts reading keys (ReadWordNumber repeats it after an invalid number) |
| `inputChanged` | `{ text }` (what the reader has taken so far) | same, after each key (0709:0aec, 8900:03f3) | after every key the prompt reads |
| `inputEnded` | `{ text, key: 'Enter' \| 'Esc' }` | same (0709:0afd, 8900:0402) | when the prompt returns |
| `anyKeyWait` / `anyKeyWaitEnded` | `{ screen: 'SU-03' \| 'SU-04' \| 'SU-05', seconds? }` | startup.js WaitSecondsOrKey 2500:0000 (title 1 SU-03, credits SU-05), ShowTitle lightning loop 2500:06fd (title 2 SU-04) | when a title / credits screen starts / stops waiting for any key (or its seconds) |
| `saveLoaded` | `{ slot, members }` | party_ov17.js LoadGame 7500:1602 (7500:1cbc) | after a saved game A..J was read (sets `hooks.state.slot`) |
| `gameSaved` | `{ slot }` | party_ov17.js SaveGame 7500:1D58 (7500:22ae) | after a game was saved (sets `hooks.state.slot`) |

**Char summary** (`charSummary`, decode/data/SAVES.md §3): `{ index, name, monster, selected, race, cls, levels[8], hp, hpMax,
ac, thac0, status, side, npc, xp, money[7], monsterId?, dataset? }` (AC / THAC0 already converted from the stored 60 − x; `monsterId`/`dataset` on records loaded by LOAD_MONSTER).
The name of the speaker of an encounter is not known to the VM (the encounter shows sprite/picture ids only); pedia can join `npcTalk.pic`/`sprite` with the following `monsterShown`.

## 3. State access (read-only)

Bound by `areas/ecl_host.js bindEclHost` (`hooks.bind({ G: eclG, vm })`); before that every getter returns `null` / `[]`.

| call | returns | from |
|---|---|---|
| `hooks.state.party({ monsters, withRecord })` | char summaries of the party (`monsters: true` also the monster records still linked; `withRecord: true` adds a copy of the 285 bytes) | `G.PartyHead` list, party size VM 6E3E |
| `hooks.state.position()` | `{ block, dataset, x, y, facing, dir, travelMode, gameMode, map3d, is3D }` | G (ecl_Block, DataSet, party_MapX/Y/Dir, travel_Mode, game_Mode), VM 49C5 (3D map id), 49E6 |
| `hooks.state.mem(addr)` / `.flag(addr)` | the word an ECL script reads at `addr` (any region, char fields mapped) | `vm.getMem` 4300:07BC (no side effects) |
| `hooks.state.clock()` | `{ raw[7], round, minute, hour, day, month, year, text: 'hh:mm' }` | VM 49C6..49CC (AdvanceClock 8400:03D5; limits DS:363A 10,10,6,24,30,12,256; status line 00BA:290B) |
| `hooks.state.slot` | last loaded / saved slot letter, or `null` | saveLoaded / gameSaved |
| `hooks.state.partyCount()` | party size | VM 6E3E |
| `hooks.state.combat()` | `{ origin: { col, row }, list: [combatant] }` in combat (game_Mode 5), else `null`; combatant = char summary + `{ index, col, row, size, enemy }`; the window is 7×7 cells of 24×24 px from screen (8, 8), cell = origin + screen cell | cb_Char/cb_Col/cb_Row/cb_Size, cm_Map.b[2..3] (VIEW ov31) |
| `hooks.state.combatant(char)` | that combatant, or `null` | same |

## 4. Region registry

The engine's own mouse regions live in `engine/input.js pointer.regions` (README "Mouse"): `hmenu` (bottom menu line),
`vlist` (list), `roster` (party rows), `pmenu` (party menu lines), `view` (3D view thirds). The registry **reuses that
map**, so the existing pointer code does all hit tests and priorities.

- `hooks.registerRegion({ id, rect: { x1, y1, x2, y2 }, left, right, kind, prio = 6, scope = 'plus' })` → `true` / `false`.
  `left` = key list `[[ascii, scan], ...]` (typed through the engine's key script, one per idle wait), a function
  `(x, y) => keys | null`, or `{ action: (x, y) => ... }` (a Plus action: runs, no key is typed). `right` = the right-click
  options (data for the context menu of W3; the engine's right-click is still Esc until W3 changes input.js). Engine names
  are refused; higher `prio` wins (engine: view 1, roster 2, pmenu 3, hmenu 4, vlist 5).
- `hooks.clearRegions(scope)` removes the Plus regions of `scope` (all Plus regions without an argument). The engine's
  `ClearScreen` (text.js) drops every region except `hmenu`, Plus ones included, as it does for stale engine regions:
  re-register from the draw events.
- `hooks.regions()` → every live region, highest priority first: `{ id, rect, kind, prio, source: 'engine' | 'plus', ... }`;
  engine regions carry `kind` (menu, list, party, view), their `keysAt(x, y)` and `draw` = the payload of the draw event
  that registered them (menu items with hot keys, list rows, roster members, view position).

## 5. Behaviour guarantees and proof

- Call sites are one statement (`hooks.emit(...)`), carry their address, and only read state. `ecl_SetMem` was split into
  `setMem` (wrapper: reads the old word, writes, reports) and `setMemRaw` (the translated routine), same order of writes.
- `textPrinted.text` may be `''`: the scripts clear the window with an empty PRINTCLEAR.
- Original mode = hooks off: acceptance/plus/W1-regress.md (RUN-1 and sampled ACCEPTANCE PASS runs re-run hooks off and
  on: identical pixels to the DOSBox references). Event log of the RUN-2 route: acceptance/plus/W1-events.md.
- Tests: `node --test game/test/plus/hooks.test.mjs` (bus, switch, journal parsing, regions, state).

## 6. Cheat entry (hooks request #14, for gbp-cheat)

- `hooks.requestWarp({ dataset?, block?, x, y, facing })` (facing 0..3 = N E S W) and `hooks.requestRedraw()` → `true`, or
  `false` in original mode. The request is applied at the **top of the explore loop** (ecl.js `plusSafePoint`, called by
  gameLoop 2F00:32F8 right after ExploreCommand 2f00:3395 returns): while a request is pending, the explore menu's wait
  (view_ov14.js 6600:09d0 / 6600:0c40) ends early (`menu.abortWhen`, armed only for that wait; HorizontalMenu returns
  `aborted`), ExploreCommand returns without a command, and the game loop applies it and explores again — the square's
  script (vecA) and MoveParty do not run for it. A request made while the game is elsewhere (a script prompt, a submenu,
  combat, camp) waits until the explore menu is back.
- Warp to another block or data set = the NEW_ECL way (2F00:0BD1: Mem[49F2] := old block, ecl_Block, LoadEclBlock, InitVM,
  ecl_Restart) then RunAfterNewBlock (2F00:31B4), so the block's own init script loads map and walls and prints its arrival
  text (`areaEntered` source NEWECL). Same block: the party is placed (cell attribute, wall ahead) and the view refreshed.
  Then the roster and the status line are redrawn; `requestRedraw` alone refreshes view, roster and status line.
- Test: `node acceptance/integration/run.mjs game/test/plus/hooks-warp-run.json` (GBP-HOOKS-WARP): test party → Sokal Keep
  (ds 4, block 21, 8,14 N, "THE BOAT DISEMBARKS YOU AT SOKAL KEEP.") → in-block 8,13 S → {Up} walks to 8,14 → HP edit +
  redraw shows 7 → original mode refuses.

## 7. DAX record resolver (hooks request #6, for gbp-mods)

- `hooks.setDaxResolver(fn)`; `fn(daxName, recordId, originalBytesCopy) -> Promise<Uint8Array | null>`. engine/dax.js
  LoadDaxRecord (0802:0716) asks it after the RLE decode (0802:0920), before any picture/animation decoder sees the record;
  `null`, a throw or no resolver = the original bytes. `daxName` = the name the engine asked for + extension (it may carry
  the data path, e.g. `PIC3.dax`). With no resolver registered or hooks off (`hooks.daxResolver` is `null` then) the
  function has no extra await: original mode is byte- and timing-identical.
- Registration belongs to the Plus boot (gbp-integrate, with the Mods tab): `hooks.setDaxResolver(plusMods.resolve)`.
- `por-mods-changed` makes view_ov28.js forget its loaded picture (g_6B0A/g_6B1C), so the next LoadAnimation of the same
  PIC reads it through the resolver again. Pictures already on screen, loaded wall/symbol sets and combat icons change at
  their next load (next picture, next block entry, next fight); there is no forced redraw from original bytes.
- Test: `node acceptance/integration/run.mjs game/test/plus/hooks-dax-run.json` (GBP-HOOKS-DAX, probe
  game/test/plus/hooks-dax-probe.js): no mod enabled = original, sample skin = different bytes of the same size, other
  archives untouched, master switch off = original, skin disabled = original; explore screen before = after.

## 8. Clickability (W3, game/plus/click/*)

`mountClickLayer({ canvas })` from `game/plus/click/index.js` (to be called by the Plus boot). Right-click lists, cursor
hints, area-map travel and combat mouse are built on the regions and events above; acceptance/plus/W3.md has the
per-screen checklist. Event additions for it: `combatTurn`, `combatCursor`; the party-menu `menuDrawn` items carry `label`.
