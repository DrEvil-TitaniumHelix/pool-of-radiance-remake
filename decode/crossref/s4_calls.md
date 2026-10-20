## 4. Cross-area call graph and the main game loop

Static call edges from `decode/listings/functions.tsv` (callees resolved through stub thunks to the overlay routine). Counts = caller->callee function pairs. Areas per §1.

### 4a. Area x area (rows call columns; RUNTIME = TP System/Crt/Dos/Overlay)

| caller / callee | ENGINE | ECL | VIEW | COMBAT | MAGIC | PARTY | RUNTIME |
|---|---|---|---|---|---|---|---|
| **ENGINE** | · | 3 | 43 | 6 | 4 | 14 | 178 |
| **ECL** | 49 | · | 35 | 10 | 3 | 8 | 93 |
| **VIEW** | 94 |  | · | 10 | 1 | 4 | 98 |
| **COMBAT** | 248 | 1 | 104 | · | 13 | 18 | 128 |
| **MAGIC** | 152 | 1 | 68 | 100 | · | 14 | 136 |
| **PARTY** | 177 | 1 | 66 | 108 | 6 | · | 248 |
| **RUNTIME** |  |  |  |  |  |  | · |

### 4b. Unit -> unit edges across areas

| caller unit (area) | callee units (area: pairs) |
|---|---|
| main_0000 (ENGINE) | crt_0A40 (RUNTIME: 1), ov00 (PARTY: 1), ov01 (PARTY: 2), ov02 (PARTY: 2), ov03 (ECL: 2), ov04 (MAGIC: 1), ov05 (COMBAT: 1), ov06 (PARTY: 1), ov07 (ECL: 1), ov08 (MAGIC: 1), ov09 (COMBAT: 1), ov10 (VIEW: 1), ov11 (PARTY: 2), ov12 (PARTY: 1), ov13 (COMBAT: 1), ov14 (VIEW: 1), ov15 (MAGIC: 1), ov16 (PARTY: 2), ov17 (PARTY: 1), ov18 (COMBAT: 1), ov19 (COMBAT: 1), ov20 (PARTY: 1), ov21 (PARTY: 1), ov22 (MAGIC: 1), ov23 (VIEW: 1), ov24 (COMBAT: 1), ov25 (VIEW: 1), ov26 (VIEW: 1), ov27 (VIEW: 1), ov28 (VIEW: 1), ov29 (VIEW: 2), ov30 (VIEW: 1), ov31 (VIEW: 1), ov32 (VIEW: 1), ov33 (VIEW: 1), ov34 (VIEW: 1), system_0AF8 (RUNTIME: 4) |
| res_00BA (ENGINE) | crt_0A40 (RUNTIME: 2), ov25 (VIEW: 1), ov26 (VIEW: 3), ov27 (VIEW: 1), ov28 (VIEW: 3), ov30 (VIEW: 5), ov31 (VIEW: 15), system_0AF8 (RUNTIME: 39) |
| res_03F1 (ENGINE) | ov34 (VIEW: 1), system_0AF8 (RUNTIME: 2) |
| res_042B (ENGINE) | dos_0A32 (RUNTIME: 1), overlay_0AA2 (RUNTIME: 3), system_0AF8 (RUNTIME: 17) |
| res_0464 (ENGINE) | dos_0A32 (RUNTIME: 2), system_0AF8 (RUNTIME: 24) |
| res_0709 (ENGINE) | crt_0A40 (RUNTIME: 2), dos_0A32 (RUNTIME: 2), system_0AF8 (RUNTIME: 23) |
| res_0802 (ENGINE) | dos_0A32 (RUNTIME: 1), system_0AF8 (RUNTIME: 45) |
| res_0899 (ENGINE) | crt_0A40 (RUNTIME: 3), dos_0A32 (RUNTIME: 1), system_0AF8 (RUNTIME: 4) |
| res_08AE (ENGINE) | dos_0A32 (RUNTIME: 1), system_0AF8 (RUNTIME: 1) |
| ov00 (PARTY) | res_0709 (ENGINE: 1), res_0899 (ENGINE: 1), system_0AF8 (RUNTIME: 1) |
| ov01 (PARTY) | crt_0A40 (RUNTIME: 3), res_03F1 (ENGINE: 1), res_0464 (ENGINE: 4), res_0709 (ENGINE: 3), res_0899 (ENGINE: 2), system_0AF8 (RUNTIME: 4) |
| ov02 (PARTY) | res_03F1 (ENGINE: 1), res_0709 (ENGINE: 4), res_0899 (ENGINE: 2), system_0AF8 (RUNTIME: 5) |
| ov03 (ECL) | crt_0A40 (RUNTIME: 1), ov04 (MAGIC: 1), ov05 (COMBAT: 1), ov06 (PARTY: 1), ov08 (MAGIC: 1), ov14 (VIEW: 2), ov15 (MAGIC: 1), ov16 (PARTY: 2), ov17 (PARTY: 2), ov18 (COMBAT: 2), ov20 (PARTY: 1), ov21 (PARTY: 1), ov24 (COMBAT: 5), ov25 (VIEW: 2), ov26 (VIEW: 6), ov28 (VIEW: 2), ov29 (VIEW: 5), ov32 (VIEW: 4), res_00BA (ENGINE: 15), res_03F1 (ENGINE: 4), res_0709 (ENGINE: 15), res_0802 (ENGINE: 1), res_0899 (ENGINE: 1), res_08AE (ENGINE: 2), system_0AF8 (RUNTIME: 47) |
| ov04 (MAGIC) | ov07 (ECL: 1), ov19 (COMBAT: 3), ov21 (PARTY: 8), ov24 (COMBAT: 6), ov25 (VIEW: 6), res_00BA (ENGINE: 14), res_03F1 (ENGINE: 1), res_0709 (ENGINE: 5), system_0AF8 (RUNTIME: 18) |
| ov05 (COMBAT) | ov06 (PARTY: 1), ov07 (ECL: 1), ov16 (PARTY: 2), ov21 (PARTY: 5), ov22 (MAGIC: 1), ov25 (VIEW: 5), res_00BA (ENGINE: 7), res_03F1 (ENGINE: 4), res_0709 (ENGINE: 6), system_0AF8 (RUNTIME: 21) |
| ov06 (PARTY) | ov07 (ECL: 1), ov19 (COMBAT: 4), ov25 (VIEW: 2), res_00BA (ENGINE: 7), res_03F1 (ENGINE: 1), res_0709 (ENGINE: 2), system_0AF8 (RUNTIME: 10) |
| ov07 (ECL) | ov17 (PARTY: 1), ov19 (COMBAT: 1), ov24 (COMBAT: 1), ov25 (VIEW: 3), ov26 (VIEW: 1), ov28 (VIEW: 5), ov29 (VIEW: 4), ov32 (VIEW: 1), res_00BA (ENGINE: 5), res_0709 (ENGINE: 4), res_0802 (ENGINE: 2), system_0AF8 (RUNTIME: 45) |
| ov08 (MAGIC) | crt_0A40 (RUNTIME: 1), ov09 (COMBAT: 2), ov10 (VIEW: 1), ov13 (COMBAT: 14), ov19 (COMBAT: 2), ov20 (PARTY: 1), ov24 (COMBAT: 6), ov25 (VIEW: 7), ov31 (VIEW: 15), res_00BA (ENGINE: 22), res_03F1 (ENGINE: 1), res_0464 (ENGINE: 1), res_0899 (ENGINE: 1), system_0AF8 (RUNTIME: 19) |
| ov09 (COMBAT) | crt_0A40 (RUNTIME: 1), ov22 (MAGIC: 3), ov25 (VIEW: 1), ov30 (VIEW: 2), ov31 (VIEW: 5), res_00BA (ENGINE: 27), res_0709 (ENGINE: 1), res_0899 (ENGINE: 2), system_0AF8 (RUNTIME: 6) |
| ov10 (VIEW) | ov13 (COMBAT: 1), ov16 (PARTY: 1), ov24 (COMBAT: 5), res_00BA (ENGINE: 3), res_0464 (ENGINE: 2), res_0709 (ENGINE: 2), res_0899 (ENGINE: 2), system_0AF8 (RUNTIME: 8) |
| ov11 (PARTY) | ov22 (MAGIC: 1), ov25 (VIEW: 1), ov32 (VIEW: 1), ov34 (VIEW: 1), res_0464 (ENGINE: 2), res_0709 (ENGINE: 2), res_0802 (ENGINE: 1), res_08AE (ENGINE: 1), system_0AF8 (RUNTIME: 11) |
| ov12 (PARTY) | ov13 (COMBAT: 1), ov23 (VIEW: 1), ov24 (COMBAT: 80), ov30 (VIEW: 1), ov31 (VIEW: 10), ov33 (VIEW: 1), res_00BA (ENGINE: 62), res_0709 (ENGINE: 2), system_0AF8 (RUNTIME: 40) |
| ov13 (COMBAT) | crt_0A40 (RUNTIME: 1), ov22 (MAGIC: 2), ov25 (VIEW: 4), ov30 (VIEW: 6), ov31 (VIEW: 49), res_00BA (ENGINE: 80), res_03F1 (ENGINE: 2), res_0709 (ENGINE: 6), res_0899 (ENGINE: 1), res_08AE (ENGINE: 4), system_0AF8 (RUNTIME: 32) |
| ov14 (VIEW) | ov15 (MAGIC: 1), ov19 (COMBAT: 2), ov20 (PARTY: 3), ov24 (COMBAT: 2), res_00BA (ENGINE: 4), res_03F1 (ENGINE: 1), res_0464 (ENGINE: 1), res_0709 (ENGINE: 2), res_08AE (ENGINE: 3), system_0AF8 (RUNTIME: 7) |
| ov15 (MAGIC) | ov16 (PARTY: 3), ov17 (PARTY: 1), ov19 (COMBAT: 8), ov20 (PARTY: 1), ov25 (VIEW: 12), res_00BA (ENGINE: 27), res_03F1 (ENGINE: 5), res_0709 (ENGINE: 3), res_0899 (ENGINE: 2), system_0AF8 (RUNTIME: 31) |
| ov16 (PARTY) | ov15 (MAGIC: 1), ov19 (COMBAT: 11), ov23 (VIEW: 5), ov24 (COMBAT: 3), ov25 (VIEW: 18), ov28 (VIEW: 1), ov31 (VIEW: 2), ov32 (VIEW: 4), res_00BA (ENGINE: 8), res_03F1 (ENGINE: 4), res_0464 (ENGINE: 3), res_0709 (ENGINE: 6), res_0899 (ENGINE: 1), system_0AF8 (RUNTIME: 40) |
| ov17 (PARTY) | ov18 (COMBAT: 1), ov23 (VIEW: 1), ov24 (COMBAT: 2), ov25 (VIEW: 6), ov29 (VIEW: 2), ov32 (VIEW: 3), res_0464 (ENGINE: 1), res_0709 (ENGINE: 7), res_0802 (ENGINE: 19), res_0899 (ENGINE: 6), system_0AF8 (RUNTIME: 86) |
| ov18 (COMBAT) | ov27 (VIEW: 1), ov28 (VIEW: 3), res_00BA (ENGINE: 1), res_0464 (ENGINE: 6), res_0709 (ENGINE: 5), system_0AF8 (RUNTIME: 6) |
| ov19 (COMBAT) | ov21 (PARTY: 10), ov22 (MAGIC: 7), ov25 (VIEW: 10), ov28 (VIEW: 1), ov31 (VIEW: 2), res_00BA (ENGINE: 48), res_03F1 (ENGINE: 10), res_0709 (ENGINE: 15), system_0AF8 (RUNTIME: 45) |
| ov20 (PARTY) | crt_0A40 (RUNTIME: 1), ov22 (MAGIC: 4), ov24 (COMBAT: 3), ov25 (VIEW: 3), res_00BA (ENGINE: 4), res_0709 (ENGINE: 6), system_0AF8 (RUNTIME: 14) |
| ov21 (PARTY) | ov24 (COMBAT: 3), ov25 (VIEW: 3), res_00BA (ENGINE: 7), res_03F1 (ENGINE: 1), res_0709 (ENGINE: 4), res_0899 (ENGINE: 1), system_0AF8 (RUNTIME: 33) |
| ov22 (MAGIC) | ov23 (VIEW: 1), ov24 (COMBAT: 59), ov25 (VIEW: 3), ov30 (VIEW: 5), ov31 (VIEW: 18), res_00BA (ENGINE: 59), res_03F1 (ENGINE: 3), res_0709 (ENGINE: 4), res_08AE (ENGINE: 4), system_0AF8 (RUNTIME: 67) |
| ov24 (COMBAT) | ov30 (VIEW: 1), ov31 (VIEW: 14), res_00BA (ENGINE: 21), res_0464 (ENGINE: 1), res_0709 (ENGINE: 1), system_0AF8 (RUNTIME: 16) |
| ov25 (VIEW) | crt_0A40 (RUNTIME: 1), res_03F1 (ENGINE: 1), res_0709 (ENGINE: 8), res_0899 (ENGINE: 1), system_0AF8 (RUNTIME: 20) |
| ov26 (VIEW) | res_0464 (ENGINE: 1) |
| ov27 (VIEW) | res_03F1 (ENGINE: 1), system_0AF8 (RUNTIME: 1) |
| ov28 (VIEW) | res_03F1 (ENGINE: 1), res_0464 (ENGINE: 11), res_0802 (ENGINE: 1), res_0899 (ENGINE: 3), system_0AF8 (RUNTIME: 18) |
| ov29 (VIEW) | res_0464 (ENGINE: 4), res_0802 (ENGINE: 2), res_0899 (ENGINE: 4), system_0AF8 (RUNTIME: 15) |
| ov30 (VIEW) | system_0AF8 (RUNTIME: 1) |
| ov31 (VIEW) | res_0464 (ENGINE: 6), res_0709 (ENGINE: 1), res_08AE (ENGINE: 2), system_0AF8 (RUNTIME: 2) |
| ov32 (VIEW) | res_0464 (ENGINE: 11), res_0899 (ENGINE: 3), system_0AF8 (RUNTIME: 12) |
| ov33 (VIEW) | res_0709 (ENGINE: 3), system_0AF8 (RUNTIME: 4) |
| ov34 (VIEW) | res_0464 (ENGINE: 5), res_0899 (ENGINE: 5), system_0AF8 (RUNTIME: 9) |

### 4c. Main game loop path (evidence: ENGINE.pas.md MainProgram, ECL_VM.md "Game loop outline", ECL.pas.md, VIEW.pas.md, MAGIC.pas.md, COMBAT.pas.md, PARTY.pas.md)

```
START.EXE entry 0000:0006 MainProgram (ENGINE)
 ├─ 47 unit initialisers (System, Crt, ... ov00_init)                     0000:0006..00F1
 ├─ ov11_002D InitGameState (PARTY)                                                 0000:00FD  new game / engine init, ECL PC := 9900h
 ├─ if ParamStr(1) <> 'STING':  ov01_0627 ShowTitle, ov02_00FD CodeWheelCheck (PARTY)        0000:0102..0122
 ├─ ov16_0161 PartyCreationMenu (PARTY)  "Choose a function": create/load/... party      0000:0127
 ├─ SetBackdropColours(0Bh,0,7,6) (VIEW ov29)                                              0000:0138
 ├─ ov03_32F8 ecl_GameLoop (ECL)                                                    0000:013D
 │    ├─ LoadEclBlock 4300:0341 + ecl_InitVM 4300:01B6 + ecl_Run(vecE) (ECL)   block init: map/walls/pictures
 │    └─ repeat
 │         ├─ ov14_0989 ExploreCommand (VIEW)  adventure menu: Area / Cast / View / Encamp / Search / Look, 3D view (ov29 Draw3DView)
 │         │     ├─ Cast  -> MAGIC (ov15 spell menus, ov22 spell effects)
 │         │     ├─ View  -> ov19 ViewMenu 7F00:0AB3 (COMBAT unit, party UI: items, trade, spells)
 │         │     └─ Area  -> ov29 DrawAreaMap B100:0000
 │         ├─ "E" -> ecl_CampCheck 2F00:2DD3 (ECL) -> ecl_Run(vecC); camp menu ov15_1E6F Camp (MAGIC); ecl_Run(vecD)
 │         ├─ ecl_Run(vecA) (before the move)  -> ecl_Dispatch 2F00:2F2D -> opcode handlers ov03 (ECL)
 │         │     ├─ COMBAT opcode -> ov08_007A CombatMain (MAGIC.pas.md: combat main loop) -> ov10 StartCombat (VIEW), per combatant: ov09 AiCombatTurn (computer) / ov13 actions (COMBAT), ov24 effects; ov05 AfterCombat after combat
 │         │     ├─ shops / temple / training -> ov06 / ov04 / ov12 (PARTY / MAGIC)
 │         │     └─ NEW_ECL -> next block (ecl_Restart -> ecl_RunAfterNewBlock 2F00:31B4)
 │         ├─ move: ov14_0D6D MoveParty (VIEW), redraw (RedrawCurrentMode 00BA, ov29 3D view), step sound
 │         └─ ecl_Run(vecB) (after the move)
 │       until PartyDead (DS:49FF)
 └─ TerminateGame 0899:0000 (ENGINE) -> Halt
```

The dragon finale (ov18 DragonFinale) is reached from ECL (PROGRAM 8 / after-new-block), not from the main program.
