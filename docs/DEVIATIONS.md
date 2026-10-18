# DEVIATIONS — where the JS build differs from the original

Owner: lane por-fixer (started 2026-10-18). Every place where `game/` **deliberately** differs from START.EXE/GAME.OVR v1.3,
or only approximates it, gets one row here. Every future fix that introduces or removes one updates this file in the same
commit. Bugs that are fixed to match the original are not deviations, so they are not listed.

Columns: **where** (file:line at the time of writing; search for the address if lines have moved) · **orig** (address) ·
**original does** · **we do** · **why** · **exact how** (what it would take to match byte for byte).
Status tags: `ADDED` (an input/comfort layer the original did not have, no game logic changed), `OPEN` (behaviour difference that a player could notice), `GARBAGE` (the original reads an undefined value; we
pick a fixed one), `PLATFORM` (hardware/DOS replaced by a browser equivalent), `CLAIMED-ORIGINAL` (reported as a bug,
analysed as original behaviour, external confirmation pending), `CONFIRMED-ORIGINAL` (the same, confirmed in DOSBox).

Recurring methods for "exact how":
- **M-IVT**: the value comes from real-mode memory at segment 0 (the interrupt vector table). It is knowable only at run
  time: dump `0000:0000..03FF` in the DOSBox-X debugger (`MEMDUMPBIN 0000:0000 400`) in the same state (after START.EXE
  has installed its Turbo Pascal handlers), then feed those bytes to the JS stand-in.
- **M-STACK**: the value is an uninitialised local, i.e. whatever the previous call left in that stack slot. Making it
  exact needs a model of the SS stack (every routine's frame written to a shared byte array), or a per-case DOSBox-X trace
  of the path that reaches it. Never needed so far: every such case is either unreachable in normal play or its value is
  unused.
- **M-HEAP**: the read goes past a heap block or table into whatever follows it in memory. Making it exact needs the TP
  heap layout (GetMem order and sizes) reproduced in one byte array.

## 1. Status rows (from fix requests)

| tag | where | orig | original does | we do | why | exact how | status |
|---|---|---|---|---|---|---|---|
| #r3-1 | game/areas/party_ov12.js:36-37 (`cr`, `tgt`) | 5C00:11FF (EffDwarfGiantDefence) and every other ov12 reader of `c^.combatant` (+108h): ≈20 `tgt(c)`, 11 `cr(c)` | Outside combat +108h is **nil**: it is set to nil after every fight (3900:1271) and on load (ReadCharacter 7500:0C80 / 0F96). `LES DI,ES:[DI+108h]` then gives 0000:0000, so the handler reads segment 0, the **interrupt vector table**, without faulting. `cr(c)^.target` = far pointer from the words at **0000:000A (offset = INT 02h's segment)** and **0000:000C (segment = INT 03h's offset)**, and `HookOpponent^.name` is then read from that arbitrary address. `cr(c)^.b[k]` reads IVT bytes 0000:0000+k (INT 00h–04h vectors). Writes through `cr(c)` (e.g. 5C00:049A `target := nil`, 0744 `mayUse := 0`) **overwrite IVT entries** (INT 00h–04h: divide error, single step, NMI, breakpoint, overflow). | All-zero stand-ins: a fresh zeroed combat record and a zeroed TChar. Name compares fail (no −4), field tests read 0, writes are dropped. | The IVT contents are not known statically. A string match against them is practically impossible, so the visible result (no modifier) is the same. | M-IVT. What is known: in DOSBox the INT 02h segment is DOSBox's BIOS callback segment (F000h) unless TP's System unit replaced it (TP saves INT 02h in its SaveInt list; whether it installs a handler depends on the 8087 setup, unverified). The INT 03h offset is a DOSBox callback offset. So `HookOpponent` ≈ `<INT3.off>:F000`: a BIOS/ROM-area address, not a name. Writes to INT 00h–04h are harmless unless a divide error, NMI or INT 3 follows (TP's runtime error 200 handler at INT 00h would be lost). | GARBAGE (visible effect identical) |
| #r2-2 | game/areas/combat_ov09.js:435 (AiReadyBestWeapon) | 4D00:13CA, decision at 4D00:16DA..1712 | Quick-combat AI readies the best missile weapon when `missileScore > meleeScore shr 1`, ammunition is readied and no foe is adjacent. A two-handed bow takes the shield off (4D00:185A). Nothing re-readies weapons after combat: ReadyItem is called only from ov09 and ov19 7F00:12B0. | Same, statement by statement (JS = pseudocode = bytes). After the RUN-2 kobold fight CORWIN keeps the Long Bow readied, AC −1 → 0. | Not a deviation. | **Confirmed by DOSBox (por-dosbox-ref e2c4d18, batch 7):** same route, CORWIN has the bow readied and AC 0 after the fight. | CONFIRMED-ORIGINAL |

## 2. Nil / stale pointer reads (besides #r3-1)

| where | orig | original does | we do | why | exact how | status |
|---|---|---|---|---|---|---|
| game/areas/party_ov12.js:687 | 5C00:19D9 EffReviveCheck (called by ov24 HealCharacter with e = nil) | reads `e^.p3` from **0000:0003** = high byte of the INT 00h vector's offset word (TP installs its divide-error handler there, so it is a byte of an offset inside START.EXE's runtime code segment) | p3 = 0 | value unknown statically | M-IVT (one byte) | GARBAGE |
| game/areas/combat_ov24.js:31 | 9800:0000 CallEffectHandler | effect type 58h (and 0) has no handler entry (InstallEffectHandlers leaves it nil unless InitSpellTable set 58h): `CALLF 0000:0000` jumps into the IVT, which would crash | throws a JS error | never reached by the hook lists in the shipped data | none needed; if ever reached, the original crashes too | GARBAGE (unreachable) |
| game/areas/combat_ov13.js:539 | 6100:195A Attack | `readied[0]^.type` without a nil test: with no weapon it reads **0000:002E** = low byte of the INT 0Bh (IRQ 3) vector's segment | type 0 | value unknown statically | M-IVT. If INT 0Bh still points into DOSBox's BIOS (segment F000h), the byte is **00h**, so our 0 would be exact. Unverified. Only 2Fh (sling) changes behaviour, so any value ≠ 2Fh is equivalent | GARBAGE (likely exact) |
| game/engine/ecl.js:262 | 4300:07BC GetCharField | with SelectedChar = nil, reads the field through a nil pointer (IVT) | returns 0 | never happens in play | M-IVT | GARBAGE (unreachable) |

## 3. Uninitialised locals (fixed value instead of stack garbage)

All are M-STACK. "used?" says whether the value can reach the screen or the game state in normal play.

| where | orig | original does | we do | used? |
|---|---|---|---|---|
| game/areas/combat_ov05.js:290 | 3900:0ECD TreasureMenu | `spell` read before set when Detect was not offered | 0 | no (read only after Detect was offered) |
| game/areas/combat_ov13.js:325 | 6100:0E82 FighterSweep | `pos` undefined if the target is not in foe_List | 0 | rare |
| game/areas/combat_ov13.js:1071 | 6100:3389 NextTarget | `move` undefined before the first N/P/M/T/C key | 0 | no |
| game/areas/combat_ov19.js:562 | 7F00:2156 TradeCoins | `noMoney` [BP-131h] undefined when the coin list is cancelled on the first pass | true (= leave) | yes: cancel leaves Trade; the original may loop back to "Trade to?" |
| game/areas/magic_spells.js:186 | 8E00:1658 Hold | bonus [BP-7] undefined for count 0 or ≥ 5 | 0 | rare |
| game/areas/magic_spells.js:319 | 8E00:1F41 Spell_Strength | roll [BP-6] undefined when no class level > 0 | 0 | no (monsters only) |
| game/areas/magic_spells.js:586 | 8E00:2C43 Spell_Restoration | pick [BP-0Ch] undefined when no class qualifies | 0 | rare |
| game/areas/party_ov12.js:766 | 5C00:1E77 EffCharmGaze | range [BP-2] never initialised | 0FFh (no limit) | yes (gaze range) |
| game/areas/party_ov12.js:869 | 5C00:2490 EffDisplacement (CON save table of 24D9/268A) | [BP-1] undefined for CON < 4 or > 20 | 0 | rare |
| game/areas/party_ov16b.js:293 | 7000:306D AddCharacterMenu | showExit [BP-14h] never initialised | false ("Exit" is already in the options) | possibly an extra " Exit" in the menu if the garbage is non-zero |
| game/areas/party_ov17.js:476 | 7500:1D58 SaveGame | unused name slots of SAVGAM?.DAT = stack bytes | zeros | file bytes only (not read back) |
| game/areas/party_ov21.js:271 | 8900:0B93 CoinFromText | result [BP-1] undefined for other first letters | 0 | no (only coin names reach it) |
| game/areas/res_00ba_v.js:387 | 00BA:26C2 SpellCasterLevel | result undefined for classes other than cleric/MU paths | 0 | rare (casting monsters / multi-class) |
| game/areas/view.js:71 | B100:047B GetWallType | result undefined for an odd direction | 0 | no |
| game/areas/view_ov10.js:157 | 5200:08A4 OverlandTerrainFlags | no final else: unclassified tile returns garbage | 0 | rare (overland) |
| game/areas/view_ov30.js:135 | B600:057B InFrontArc | dir 9..FEh leaves the result undefined | false | no |
| game/engine/ecl.js:141 | 4300 operandValue | unknown operand type → [BP-2] garbage | 0 | no (not in the 29 scripts) |
| game/engine/ecl.js:280 | 4300:07BC GetCharField case 10Dh | "found" with an undefined value | 0 | if a script reads field 10Dh |
| game/engine/ecl.js:288 | 4300:09AD reaction adj. | CHA < 3 or > 25 → garbage | 0 | no |
| game/engine/ecl.js:377, :386 | 4300 GetMemory (035Fh, C059h and other unmapped addresses) | garbage | 0 | if a script reads them (none found in the 29 scripts) |
| game/engine/ecl.js:1169 | 2F00:1DB1 (talk/parlay choice 0FFh) | react[choice] for choice 0FFh = garbage | 0FFh (nothing) | Esc on that menu |
| game/engine/ecl.js:1211 | 2F00:25CB op2C_Parlay | resp[k] for k = 0FFh = garbage | 0 | Esc on that menu |
| game/engine/ecl.js:1282 | 2F00:2AC1 op34_EclClock | operand index [BP-1] uninitialised | 1 (assumed) | yes (which operand gives the clock amount) |
| game/engine/ecl.js:1326 | 2F00:2C03 op3B_Spell | found [BP-8] garbage | 0 | rare |

## 4. Reads past a buffer / table (heap or neighbour data)

| where | orig | original does | we do | why | exact how | status |
|---|---|---|---|---|---|---|
| game/engine/ecl.js:96 | ECL code buffer (1E00h B) | ECL address past the buffer reads the heap that follows | 0 | no script reads there | M-HEAP | GARBAGE |
| game/engine/ecl.js:185 | 4300:03D3 load block | a record > 1E00h would overrun the heap block | copies at most 1E00h | no shipped record is that large | — | GARBAGE (unreachable) |
| game/engine/ecl.js:393 | 4300:0F53 | an empty string writes 256 entries of a local buffer; the tail is garbage | tail 0 | — | M-STACK | GARBAGE |
| game/areas/view.js:120 | B100:0E08 LoadWallSet | a short last WALLDEF block makes `Move($30C)` copy heap bytes after the record | pads with 0 | — | M-HEAP | GARBAGE (only in an unused wall-slot tail) |
| game/areas/view.js:274 | A200:016D RefreshView | backdrop index > 15 reads the landmark table g_0C30 that follows C0C26 | 0 (JS constant of 16 entries) | — | read `G.ds[0x0C26 + k]` (static DS data, so this one is fixable now) | OPEN (small, fixable) |
| game/areas/party_ov16b.js:607 | 7000:42ED PayGold | coin loop past jewelry runs into unrelated data | stops after kind 6 | callers check MoneyInGold first, so it is never reached | M-HEAP | GARBAGE (unreachable) |
| game/areas/magic_ov22.js:15-19 | 8E00 AddSpellLine | sl_Ids[0..14h] is followed by sl_Items: more than 21 spell lines overwrite sl_Items | two separate JS arrays (no overlap) | lists with > 21 lines (spell book, Learn) never use sl_Items at the same time | one DS-backed byte array for both | OPEN (only if both are used together) |

## 5. Arithmetic approximations

| where | orig | original does | we do | why | exact how | status |
|---|---|---|---|---|---|---|
| game/engine/ecl.js:551 | 4300:1CC3 | Turbo Pascal 6-byte `Real` arithmetic (software float, 39-bit mantissa) | JS doubles | the results are rounded to integers right away; no difference is known | port the TP Real routines (System unit) used there | OPEN (theoretical) |

## 6. Platform: hardware, DOS and timing

| where | orig | original does | we do | why | exact how | status |
|---|---|---|---|---|---|---|
| game/engine/display.js:1-6 | 042B:0197 InitConfiguration | EGA, CGA or Tandy by POOL.CFG | EGA only (320×200×16, palette registers) | BUILD_PLAN §2: the EGA look is the target | build the CGA/Tandy paths | PLATFORM |
| game/engine/audio.js:1-7 | 08AE sound driver | PC speaker (PIT ch. 2) or Tandy PSG | PC speaker interpreter → Web Audio **square wave**; Tandy path (PsgChannelTick) not built | browser audio; POOL.CFG here says 'P' | the speaker is reproduced at its PIT divisor; the speaker cone/filter response is not modelled | PLATFORM |
| game/engine/timer.js:8-28 | Crt.Delay, 0709:0C3F TimeInHundredths | delays are CPU/BIOS-tick based | real-time milliseconds; `?fast=n` divides delays (acceptance only) | timing in the browser | calibrate against DOSBox cycles=3000 | PLATFORM |
| game/areas/startup.js:85 | 2500:071C ShowTitle | lightning trigger counts busy-loop passes, so the speed depends on the CPU | fixed 20,000 passes/s | no CPU to count | measure the passes per second in DOSBox (cycles=3000) | PLATFORM (TODO calibrate) |
| game/engine/input.js | Crt.ReadKey / BIOS keyboard | BIOS key buffer (15 keys), scan codes | same model (15-key buffer, #0 + scan code); browser keydown events translated; gamepad mapped to keys; `{Ctrl-X}` in key scripts | browser input | — | PLATFORM |
| game/engine/files.js | SAVE\ directory (DOS files) | DOS file I/O on the save path from POOL.CFG | IndexedDB store `por-save` (one entry per DOS file name); the shipped SAVE\ is a read-only layer | browser storage | — | PLATFORM |
| game/areas/party_ov17.js:214 | 7500:0BFB OpenWithPrompt | a missing file prompts "insert disk" until it is found | no prompt; the record stays as it was | there are no floppies | — | PLATFORM |
| game/engine/dax.js (OpenDax, BiosPromptLine) | 0802:025D / 05CD / 0193 | missing DAX file: yellow `Insert disk n in drive X:` written by the BIOS on row 24, waits for a key, retries until the file exists | same (#a-5); "inserting the disk" = the file becomes fetchable; drive letter = POOL.CFG line 3 | — | — | exact (BIOS font from DOSBox-X, see next row) |
| game/engine/biosfont.js | BIOS ROM fonts (INT 10h) | text written through the BIOS uses the video BIOS's 8×8 (graphics modes) and 8×14 (text mode) fonts | the DOSBox-X 2026.01.02 int10 tables (font_08, font_14) the references were shot with | the BIOS is not part of the game | on real EGA hardware the IBM EGA ROM font would be used (the same glyphs on DOSBox's EGA machine) | PLATFORM |
| game/engine/main.js (MainProgram catch), errors.js `fatal` | B100:1132..115B, B100:0E93..0EBC, CA00:00D8..012A, CA00:01C5.., AC00:072D..0749, C000:0043..005F | fatal data error: RestorePreviousVideoMode, WriteLn(message), [ReadGameKey, RestorePreviousVideoMode], TerminateGame → DOS | same sequence on an emulated 80×25 text screen (#a-10); after TerminateGame the text screen stays blank (there is no DOS prompt) | no DOS | — | PLATFORM |
| game/engine/main.js (CodeWheelCheck) | 0000:0122 | code-wheel copy protection at start | skipped by default; `?wheel=1` shows it | The owner 2026-10-16 (as Star Command v1.1) | `?wheel=1` | PLATFORM (ruling) |
| game/engine/main.js:17-26 | 042B:00A4 InitConfiguration | reads POOL.CFG written by the installer | reads POOL.CFG from the data folder today; BYOC will build the lines in the engine (docs/BYOC.md §2) | — | — | PLATFORM |

## 7. Missing or simplified features (OPEN)

| where | orig | original does | we do | why | exact how | status |
|---|---|---|---|---|---|---|
| game/engine/input.js (pointer layer) + regions in menus.js, res_00ba_u.js, party_ov16a.js, view_ov14.js | — (no original code) | keyboard only (and joystick-free); the original has no mouse support | an added input layer: clicks, wheel and right-click are translated into the keys a player would type (hotkeys, Home/End, Enter, Esc, cursor keys); no game logic changed | product form: keyboard + gamepad + mouse (FOREMAN.md, BUILD_PLAN §2) | not applicable (an addition); disable by not calling `attachPointer` | ADDED |
| game/areas/startup.js:198 | 7000:0305 PartyCreationMenu (M1 fallback menu only) | Home/End on the party menu = CycleSelectedChar (ov19) | ignored in the M1 fallback `PartyCreationMenuM1` | the fallback is only used when party.js is missing; party.js's PartyCreationMenu is the real one | remove the fallback or wire CycleSelectedChar | OPEN (fallback only) |
| game/areas/view_ov28.js:101 | 9D00:0525 / AC00:0708 Show3DSprite | the animation timer shares [BP-57h] with the menu start time | own variable `tAnim`, set at each frame step | the hook has no access to HorizontalMenu's local; the first frame's delay can count from a different start than in the original | pass the menu's [BP-57h] (start time) into the hook | OPEN (timing, cosmetic) |

| game/areas/view.js:17-18 (wallSlotId / wallSlotNo) | 5700:0355..0385 InitGameState | wall-set slot table: slot 1 = id 0, number 1 (g_6AB2 := 0, g_6AB4 := 1); slots 2, 3 = FFFFh | slot 1 starts as FFFFh/FFFFh (all slots "empty") | a new-game start may then load wall set 0 into slot 1 where the original treats it as already loaded; needs a DOSBox new-game reference before changing (loaded games overwrite the table) | set `[0, 0, FFFF, FFFF]` / `[0, 1, FFFF, FFFF]` and compare a Create-party → Begin start against DOSBox | OPEN |

## 8. Not deviations (for reference)

- `TODO(decode): meaning` markers (combat_ov09.js:136/204/429, combat_ov13.js:70/71/96/802/853/931/965/1118/1159,
  combat_ov19.js:33/429/442): the code does exactly what the bytes do; only the **name** of a field or flag is unknown.
- combat_ov24.js:14 / ecl_host.js:8: binding notes, not behaviour.
- Original quirks kept on purpose (`quirk:` comments, e.g. ReadGameKey's type-ahead flush 0899:00E4,
  RemoveCombatant's corpse test on gfx_LoopCounter, menu_Sel carried between menus) are faithful, not deviations.

## Change log

- 2026-10-18 por-fixer: file started. Rows from #r3-1 (7f24d41), #r2-2 (b6cd3dd, claimed original) and every
  `TODO(decode)` workaround in game/ at commit 9bd3818.
- 2026-10-18 por-fixer: #r2-2 CONFIRMED-ORIGINAL (e2c4d18); rows for #a-5 disk prompt, BIOS fonts, #a-10 fatal text screen; InitGameState defaults row (OPEN).
- 2026-10-18 por-fixer: InitGameState defaults added (commit after 8e47dfd); only the wall-slot table remains OPEN.
- 2026-10-18 por-fixer: §7 row for the added mouse/pointer layer.
