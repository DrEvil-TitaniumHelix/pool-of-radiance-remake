# COMBAT_VERIFY — independent verification of COMBAT.pas.md / COMBAT_SCREENS.md (lane por-verify)

Input: `decode/pseudo/COMBAT.pas.md` (owner por-mod-combat / por-tooling), `COMBAT_SCREENS.md`, `acceptance/ref/DECODE_CHECKS.md` and captures.
Method (herdr/assignments/por-verify.md): (1) argcheck + pseudo_check sampling; (2) independent 10% random sample of anchored statements re-read against the asm (`decode/listings/ovNN.lst`, `decode/ecl/hdis.py`); (3) sweeps of the known error classes over all sections; (4) every COMBAT_SCREENS row against code and captures. Four verifier workers of this lane split the units (W3 ov05+ov18, W4 ov09+ov24, W1 ov13, W2 ov19); ov07 routines are ECL.pas.md's (no ov07 anchors in COMBAT.pas.md).

## Summary

| item | result |
|---|---|
| argcheck (`decode/tools/argcheck.py` logic, run from a scratch copy because the repo tool accepts only ECL/VIEW) | 965 calls: OK 123, MISMATCH 1, UNSURE 841; the one MISMATCH (4d00:0744 HasEffect $1E vs push 20h) is a **tool false positive** — four HasEffect calls share one anchor, pushes 20h/1Eh/6Fh/7Dh match the written order (W4) |
| sample | **seed 20261016**, 214 of 2,134 anchored statements (10%): **213 AGREE, 1 DISAGREE, 0 UNSURE** (ov05 27, ov09 33, ov13 68, ov18 9, ov19 51, ov24 25, resident 1) |
| sweeps (arg order, signed/unsigned, byte/word, folded array indexes, ABS idiom, set tests, string length bytes) | all units: 0 further findings |
| screens COMBAT-01..72 | 69 AGREE, 1 DISAGREE (COMBAT-42), 1 UNSURE (COMBAT-60, capture recheck), 1 note (COMBAT-02); captures checked: REF-CHARACTER (COMBAT-46/47 cell by cell), REF-CHECK-SPELLS (COMBAT-60) |

## Fix requests (posted in STATUS.md)

- **combat fix request #verify-1** — `7f00:1d1a` (COMBAT.pas.md L2812, SellItem): written `if (item^.type <> $49) or (item^.type = $1C)`; bytes 1D1D `CMP type,49h / JNZ 1D2E`, 1D27 `CMP type,1Ch / JZ 1D46` → the else-branch is taken only for type 1Ch inside the type-49h path, i.e. never: condition = `(type <> $49) or (type <> $1C)` = always true; every stacked item sells at `count*price div 20`.
- **combat fix request #verify-2** — COMBAT-42: "RedrawCurrentMode draws the frame of mode 7" is wrong: 00BA:27DF has no case for mode 7, nothing is drawn, the page-1 text stays; the FINAL record-1 picture appears at the first flush inside PlayFinaleAnimation (7a00:006f).
- **recheck for por-dosbox-ref** — COMBAT-60: code (matching the pseudocode) draws a frame with its top border on row 0; capture REF-CHECK-SPELLS shows the header text but no row-0 border (probably overdrawn later). Capture/sequence recheck, no pseudocode change.
- Note (no fix needed, wording): COMBAT-02 — the NPC share line is shown when share byte +85h ≠ 0, not when (+85h and 7) ≠ 0.

## Details per unit

# COMBAT verify — part W3 (ov05 3900, ov18 7A00)

Sample: seed 20261016 (parent draw, 10 % of anchored COMBAT statements): ov05 27, ov18 9. Evidence = `decode/ecl/hdis.py ov05|ov18` / `decode/listings/ov05.lst`, `ov18.lst`.

## ov05

### Sample

| line | address | statement (short) | verdict | evidence |
|---|---|---|---|---|
| L54 | 3900:004a | `taken := 0` | AGREE | `C6 46 EE 00` byte [bp-12h] := 0 |
| L60 | 3900:0096 | `TreasureMoney[k] += c^.money[k]` (word zero-ext.) | AGREE | `[di+88h]` word (di=2k), `XOR DX,DX`, ADD/ADC to `[di+67F4h]` (di=4k) |
| L80 | 3900:0261 | `total += TreasureMoney[2] div 2` | AGREE | `[67FCh]`=index 2, `MOV CX,2` @LongDivMod, ADD/ADC [bp-9] |
| L130 | 3900:0527 | `if DuelActive<>0 then PartyDead := 0` | AGREE | `CMP [84D4],0; JE; MOV [49FF],0` |
| L153 | 3900:0667 | `3: status:=0; active:=1` | AGREE | 0663 `CMP AL,3`, 066A +10Ch:=0, 0673 +10Dh:=1 |
| L173 | 3900:0735 | `SelectedChar := c` | AGREE | [bp-4]/[bp-2] → [5D92]/[5D94] |
| L174 | 3900:0742 | `RemoveFromParty(0, 1)` | AGREE | push 0, push 1 (first pushed = first arg), CALLF stub ov16 e2 |
| L188 | 3900:07c6 | `c := c^.next` | AGREE | +104h/+106h → [bp-4] |
| L191 | 3900:07e8 | `while c <> nil do` | AGREE | OR AX,[bp-2]; JE 0838 |
| L192 | 3900:07f0 | `if status in [0,1] then active := 1` | AGREE | CMP +10Ch,0 / ,1 → +10Dh := 1 |
| L213 | 3900:09b7 | `DrawText(1, 3, 10, 'The party has won.')` | AGREE | push 1,3,0Ah, cs:086C "The party has won.", CALLF 0709:0626 |
| L218 | 3900:0a06 | `DrawText(1, 3, 10, 'The party has found Treasure!')` | AGREE | push 1,3,0Ah, cs:0893 |
| L261 | 3900:0c9f | `while p^.next <> sel do p := p^.next` | AGREE | 0C9F..0CC5: +2Ah/+2Ch vs [bp-4]/[bp-2], loop |
| L277 | 3900:0d3e | `done := false` | AGREE | byte [bp-2] := 0 |
| L299 | 3900:0ed4 | `title := ''` | AGREE | length byte [bp-108h] := 0 |
| L301 | 3900:0ede | `RedrawCurrentMode` | AGREE | CALLF 00BA:27D9 |
| L349 | 3900:11bd | `c := PartyHead` | AGREE | [5D96] → [bp-4] |
| L356 | 3900:123e | `c := n` | AGREE | [bp-8] → [bp-4] |
| L364 | 3900:1296 | `SelectedChar := PartyHead` | AGREE | [5D96] → [5D92] |
| L375 | 3900:1310 | `if (npc_morale > $7F) and (status = 0)` | AGREE | `CMP +84h,7Fh; JBE` (unsigned), `CMP +10Ch,0; JNE` (field +84h is SAVES.md `npc_flags`; name only) |
| L379 | 3900:1342 | `totalShares := totalShares + 1` | AGREE | `INC byte [bp-6]` on the JBE/JNE path |
| L417 | 3900:156c | `it := TreasureItems` | AGREE | [6810]/[6812] → [bp-4] |
| L423 | 3900:15af | `TreasureItems := nil` | AGREE | AX=0 → [6810], [6812] |
| L426 | 3900:15c4 | `DrawTitledFrame(1, 1, 38, 22, 0, 15, 'The END!')` | AGREE | push 1,1,26h,16h,0,0Fh, cs:14CE "The END!" |
| L431 | 3900:1631 | `TextOutputActive := 1` | AGREE | `MOV byte [4A00],1` |
| L432 | 3900:1636 | `ecl_Mem6B00^.w[$6E0] := 0` | AGREE | ES:[DI+6E0h] := 0 |
| L435 | 3900:1657 | `ecl_Mem6B00^.w[$5C6] := 0` | AGREE | ES:[DI+5C6h] := 0 |

### Sweeps (all ov05 routines)

| class | sites checked | result |
|---|---|---|
| call-argument order | RemoveFromParty 06e4/0742/1223, Roll 012e, VerticalListMenu 0b96 (14 args), HorizontalMenu 0ac8/0d5a/0ffe/1490, MenuSelect 111a, DrawWrappedText 10cc/10f3/1440/15f4, ShowBottomPromptAndReadKey 161a, CastSpell 1076, TreasurePoolStatus 0de8/0ee7, AddItemToChar 0c55, DrawText 09b7/0a06/0ab0, DrawTitledFrame 15c4 | all AGREE (push order = Pascal order in the pseudo) |
| signed vs unsigned | 0115 value>0 (JA), 011f taken<8 (JB), 0133 Roll<=3 (JBE), 02f9 plus>0 (JLE, signed), 1373 TreasureMoney[k]>0 (JG/JL + JBE = signed 32-bit), 0599/05a7 npc<80h (JAE), 1313 (JBE), 03a9 wis>15 (JBE) | all AGREE with the pseudo's stated signedness |
| byte vs word | 0019 level×100 (CBW, 16-bit MUL, CWD → SmallInt sign-extended), 02fe plus×400 (CBW/MUL/CWD), 13a5 `per` stored as byte (quotient truncated), 13b4 per×npcShares (byte×byte MUL, CWD) | AGREE (quirks documented in the pseudo) |
| folded constant array index | TreasureMoney[0..6] at 67F4/67F8/67FC/6800/6804/6808/680C in 0233..02b3 | AGREE |
| and/jge/neg ABS idiom | none in ov05 | — |
| Pascal set tests | 056c `status in [3,1,0]`, 05b4 `in [1,0]`, 07f0 `in [0,1]`, AwardXP class case 0454 `8, 10..14, 16` (JL/JLE chain), 047c `9, 15` | AGREE |
| string length byte | 0ed4 `title := ''`, 1440 `c^.name + ' takes…'` (StrCopy from +0, StrAppend), 0a24 Str(xp:0) | AGREE |

### Screens (COMBAT-01..07)

| row | verdict | evidence |
|---|---|---|
| COMBAT-01 Combat result | AGREE | 0916..0af3: texts, rows 3/5/7, colour 10, menu colours 15/15/15, enterOk 1; NpcTakesShare runs before (1558 → 155c) |
| COMBAT-02 NPC takes a share | AGREE (note) | 13e0..1490: col 5, rows 5,7,9…, wrap to (34,22), colour 10. Note: each line is shown for NPCs with `b85 > 0` (141f), not `b85 and 7 > 0`; each DrawWrappedText call has clear = 1 (clears its own window below the line) |
| COMBAT-03 Treasure menu | AGREE | 0ef6..0fce menu strings; keys 1028..1187 |
| COMBAT-04 Take | AGREE | 0d5a 'Take: ' / 'Money Items Exit', 13/10/15, keys 0d94..0dd2 |
| COMBAT-05 Treasure left | AGREE | 10cc (colour 10, clear 1), 10f3 (colour 15, clear 0), MenuSelect 13/10/15, acceptEnter 0, ans = 1 → No |
| COMBAT-06 Loot list | AGREE | 0b1e 'Loot', VerticalListMenu window (1,4)-(38,22), 'Items: '/'Take' |
| COMBAT-07 The END | AGREE | 15c4 'The END!', cursor (2,6) then DrawWrappedText clear=1 resets the cursor to (2,5) (ENGINE 0709:07E4), 161a ShowBottomPromptAndReadKey(13, 'Press any key to continue') |
| captures | — | acceptance/ref/DECODE_CHECKS.md has no ov05 capture (ECL-12 stops at combat entry) |

DISAGREE: none for ov05.

## ov18

### Sample

| line | address | statement (short) | verdict | evidence |
|---|---|---|---|---|
| L2176 | 7a00:001b | `FillChar(anim, $42, 0)` | AGREE | push ss:[bp-42h], 42h, 0; CALLF FillChar |
| L2216 | 7a00:0440 | `DrawPicture(0, 11, 0, 0, FinalePic, g_4A20)` | AGREE | push 0 (word), 0Bh (word), 0, 0, [4710]:[470E], [4A22]:[4A20] |
| L2219 | 7a00:046e | `LoadPicture('FINAL'+DataSetStr, 5, 0, 0, FinalePic)` | AGREE | cs:0175 'FINAL' + DS:4713, push 5,0,0, @DS:470E |
| L2236 | 7a00:062c | `DrawText(1, 18, 10, 'I have not failed…')` | AGREE | push 1, 12h, 0Ah, cs:0260 |
| L2237 | 7a00:0649 | `DrawText(1, 19, 10, 'through the pool!"')` | AGREE | push 1, 13h, 0Ah, cs:0288 |
| L2243 | 7a00:06a4 | `game_Mode := SavedMode` | AGREE | [4712] → [49F3] |
| L2254 | 7a00:06cf | `FlushViewDirtyLines` | AGREE | CALLF 0464:1B52 |
| L2258 | 7a00:06f4 | `RecolorPicture(g_091D, g_092D, TileListA[i] and $7F, 1, TileSetHi)` | AGREE | push @091D, @092D, [di+900h] AND 7Fh, 1, [5E58]:[5E56] |
| L2265 | 7a00:0791 | `RecolorPicture(g_091D, g_093D, TileListB[i], 1, TileSetLo)` | AGREE | push @091D, @093D, [di+90Bh], 1, [5E54]:[5E52] |

### Sweeps (all ov18 routines)

| class | sites checked | result |
|---|---|---|
| call-argument order | DrawPicture 004c (col-1, row-1), 0372/03e6/049b/04f7; PlayFinaleAnimation 0393/05d8/0683 (col, row words; animId, cycles bytes); DrawOverlandWindow 06c2 (11h, 0Fh), 07bf (g_094D[step], g_095F[step]); LoadPicture 0345..04ca; ClearTextRectangle 02d8; RecolorPicture 06f4..08a0 | all AGREE |
| signed vs unsigned | 00d1..00d9 time compare (JG/JL on high word, JBE low = signed 32-bit), 00e1 cur > count (JBE unsigned), 040b/0466/04c2 member count >1/>2/>3 (JBE unsigned), 06ed/0757 tile > 7Fh (JBE unsigned) | AGREE |
| byte vs word | 0393 cycles `(5*(10-GameSpeed)) shr 1` 16-bit SUB/SHL/SHL/ADD/SHR, pushed as byte | AGREE |
| folded constant array index | anim.frame[cur].delay `[bp+di-48h]`, di = cur*8 (frame[1] at bp-40h); frame[1].pic `[bp-3Ch]` 005c | AGREE (TAnim layout) |
| ABS idiom / set tests | none | — |
| string length byte | 02ab Str(DataSet:0) into string[1] DS:4713 | AGREE |

### Screens (COMBAT-42..45)

| row | verdict | evidence |
|---|---|---|
| COMBAT-42 Dragon dies | **DISAGREE** (detail) | 7a00:02cb sets game_Mode := 7 before 7a00:0340 RedrawCurrentMode; RedrawCurrentMode (00BA:27DF) has no case 7 → draws nothing. The row says "RedrawCurrentMode (frame of mode 7)": no frame is drawn, the text of page 1 stays; the FINAL record 1 picture only becomes visible with the first FlushViewDirtyLines in PlayFinaleAnimation (7a00:006f). Rest AGREE (texts, rows 17..19, colour 10, record 1 at (0,0), animation 2 at (3,5), loop count) |
| COMBAT-43 Tyranthraxus speaks | AGREE | records 3..6 positions (0,0),(0,11),(13,9),(0,9); counts >1/>2/>3 (0411/0466/04c8); texts 052a..05bb; animation 7 at (3,1) |
| COMBAT-44 Bane recalls him | AGREE | 060f..0666 texts, PlayFinaleAnimation(3,1,8,1) 0683, 3× MessageDelay, mode restored + RedrawCurrentMode |
| COMBAT-45 Overland tiles recolour | AGREE | g_094D/g_095F positions (17,15)×3,(19,20)×3,(23,25)×3; Random(4) dither = 25 %; final view (17h,19h) |
| captures | — | no ov18 capture in DECODE_CHECKS.md |

DISAGREE:
- COMBAT_SCREENS.md COMBAT-42: "Then RedrawCurrentMode (frame of mode 7)" → "Then RedrawCurrentMode, which draws nothing in mode 7 (00BA:27DF case list has no 7), so the page-1 text stays; the FINAL record 1 picture appears with the first FlushViewDirtyLines inside PlayFinaleAnimation (7a00:006f)" (evidence 7a00:02cb, 7a00:0340, ENGINE.pas.md 00BA:27D9).

## Counts (W3)

- Sample: 36 statements — AGREE 36, DISAGREE 0, UNSURE 0.
- Sweeps: ov05 7 classes / ov18 6 classes, ~60 sites — 0 findings.
- Screens: 11 rows — AGREE 10 (1 with note), DISAGREE 1 (COMBAT-42 detail); no captures for these units.

# COMBAT verify — part W4: ov09 (4D00), ov24 (9800), + 1 resident anchor

Seed 20261016 (parent's 10% sample). Evidence = decode/listings/ov09.lst, ov24.lst (and hdis.py r0709 for the resident line).

## ov09

### Sample (34 statements incl. the resident one)

| line | address | statement (short) | verdict | evidence |
|---|---|---|---|---|
| L490 | 4d00:0027 | ClearCharacterMessage | AGREE | CALLF 00ba:17e3 |
| L491 | 4d00:002c | if c.active = 0 then done := ClearCombatantActionFlags(c) | AGREE | CMP +10Dh,0 / JNZ skip / call, AL→[bp-2] |
| L492 | 4d00:0045 | pat := cb.movePattern | AGREE | LES +108h; MOV AL,[+15h] → [bp-1] |
| L494 | 4d00:006f | pat := Roll(1, 8) | AGREE | push 1, push 8, Roll |
| L551 | 4d00:030c | if (spell <> 3) and (spell_NeedsTarget[spell*16] = 0) then Result := True | AGREE | CMP [bp+8],3 JZ; [DI+3208h], DI=spell shl 4; JZ 033E (Result:=1) |
| L579 | 4d00:0441 | for pass := 1 to passes | AGREE | [bp-3] limit, counter [bp-4] from 1, unsigned JBE |
| L606 | 4d00:0599 | chosen := 0; minValue := 7 | AGREE | [bp-23h]:=0, [bp-1Bh]:=7 |
| L616 | 4d00:063c | k := k + 1 | AGREE | INC [bp-1Fh] |
| L663 | 4d00:0937 | if AiCanStep(c, i, dir, blocked) then break | AGREE | push c, [bp-3], [bp-1], @[bp-4]; JNZ → loop exit 097C |
| L665 | 4d00:0977 | else i := i + 1 | AGREE | INC [bp-3] |
| L674 | 4d00:0a0a | ai_StuckCount := ai_StuckCount + 1 | AGREE | INC [443Dh] |
| L691 | 4d00:0ab8 | AttacksOfOpportunity(c, cb.facing) | AGREE | push c, combatant+9 |
| L708 | 4d00:0b51 | steps := 0; going := True; done := False | AGREE | [bp-14h]:=0,[bp-4]:=1,[bp-2]:=0 |
| L716 | 4d00:0bfc | else done := False | AGREE | [bp-2]:=0 |
| L718 | 4d00:0c12 | steps := steps + 1 | AGREE | INC [bp-14h]; CMP 14h / JBE |
| L720 | 4d00:0c1b | done := True | AGREE | [bp-2]:=1 then AiEndTurn |
| L731 | 4d00:0ccc | tx := CombatantCol(tgt); ty := CombatantRow(tgt) | AGREE | both pushed tgt [bp-11h], results [bp-12h]/[bp-13h] |
| L733 | 4d00:0cf0 | TraceLine(CombatantCol(c), CombatantRow(c), tx, ty, dist, cm_Map) | AGREE | pushes col, row, @tx, @ty, @dist, cm_Map far (VIEW signature) |
| L757 | 4d00:0e70 | if FighterSweep(c, tgt) then done := ClearCombatantActionFlags(c) | AGREE | push c, tgt; JZ else |
| L759 | 4d00:0e96 | FaceAttacker(c, tgt) | AGREE | push c, tgt |
| L767 | 4d00:0f28 | else if tgt.active = 0 then done := True | AGREE | CMP tgt+10Dh,0 JNZ; [bp-2]:=1 |
| L805 | 4d00:1099 | Result := True | AGREE | [bp-1]:=1 after initiative:=14h |
| L828 | 4d00:1157 | if g_6825 > $66 then g_6825 := 0 | AGREE | CMP 66h / JBE (unsigned byte) |
| L835 | 4d00:11f0 | if MaxEnemyMove(c) <= CalcMove(c) shr 1 | AGREE | CMP AX(max),DX(calc shr 1) JG skip; both zero-extended bytes |
| L842 | 4d00:1276 | Result := ClearCombatantActionFlags(c) | AGREE | AL→[bp-1] |
| L860 | 4d00:13ad | if it.magic_flag <> 0 then s := 0 | AGREE | CMP item+36h,0 JZ |
| L869 | 4d00:140f | if c.readied[1] <> nil then hands_used -= ITEMS[type].hands | AGREE | +D0h ptr, item+2Eh, [DI+5583h] |
| L879 | 4d00:1506 | s := AiWeaponScore(c, it) | AGREE | push c, it |
| L886 | 4d00:15d5 | if s > shieldScore then … | AGREE | CMP [bp-18h],[bp-17h] JBE (unsigned) |
| L909 | 4d00:1776 | if c.readied[0] <> nil then ReadyItem(c.readied[0]) | AGREE | +CCh ptr pushed |
| L926 | 4d00:18bd | if c.readied[1] <> nil then ReadyItem(c.readied[1]) | AGREE | +D0h |
| L929 | 4d00:18fc | changed := True | AGREE | [bp-1Dh]:=1 |
| L936 | 4d00:1922 | ov09_init empty | AGREE | PUSH BP/MOV/POP/RETF |
| L2147 | 0709:0dbe | MessageDelay = Delay(GameSpeed * 225) | AGREE | MOV AL,[49E2]; MUL 0E1h; Crt.Delay |

### argcheck MISMATCH 4d00:0744 — REFUTED (tool false positive)
The statement holds four HasEffect calls under one anchor; the asm pushes 20h (0750), 1Eh (0767), 6Fh (077E), 7Dh (0795) in exactly the pseudo's order `HasEffect(c,$20,e) … $1E … $6F … $7D`. argcheck compared the `$1E` call text with the first push window. No fix needed.

### Sweeps (all ov09 sections)

| class | sites | result |
|---|---|---|
| call-argument order | argcheck: ov09+ov24 231 calls (25 OK, 1 MISMATCH = false positive, 205 UNSURE); all 19 calls in the ov09 sample re-checked by hand | no error found |
| signed vs unsigned | 15 signed jumps (01DD, 0221, 0865, 0877, 0BBB, 0BCA, 119E, 1216, 12CF, 12ED, 132E, 1378, 148E, 15C1, 16F2) | every one is rendered as signed (initiative, plus, dmg_bonus, levels marked "signed") or operates on zero-extended bytes where sign does not matter — AGREE |
| byte vs word | DS direct operands (6825, 443C..443E, 6E30, 6E2F, 6714..671A) | byte accesses written as Byte; no word misuse found |
| folded constant indexes | [DI+3208h]/[DI+3207h]/[DI+3209h] spell table, [DI+2744h] terrain cost, [DI+5583h]/[DI+5590h] ITEMS, [DI+2AEh] dir offsets, [DI+6814h] side counts | all rendered as arrays with the right base (spell*16, terrain*4, type*16, pattern*5+i) — AGREE |
| ABS idiom (and/jge/neg) | no NEG in ov09 | n/a |
| set tests | none in ov09 | n/a |
| string length bytes | ByteToStr + Move/Attack text (07F9): suffix string at 4D00:07F0 = len 1 " " — matches "plus one blank" | AGREE |

### Screens (COMBAT-17..24)

| row | check | verdict |
|---|---|---|
| COMBAT-17 flees in panic | string 4D00:0000, ShowCharacterMessage(c, s, 10, 1) at 00F1..0101 | AGREE |
| COMBAT-18 Move/Attack | DrawText(0, 18h, 0Ah, 'Move/Attack, Move Left = ' + ByteToStr(moveLeft shr 1) + ' ') 07F9..083D, then CheckCombatHotkeys | AGREE |
| COMBAT-19 Magic On/Off | KeyPressed / ReadGameKey (0 prefix → 2nd key), CMP 32h, toggle 6E30, ShowTimedBottomMessage 'Magic On'/'Magic Off' | AGREE |
| COMBAT-20 space | CMP 20h; +84h < 80h, +10Ch <> 1 tests at 1050/105B | AGREE |
| COMBAT-21 2Dh → GodsIntervene | CMP 2Dh 109F → GodsIntervene | AGREE |
| COMBAT-22 is forced to flee | string 10BA at 1120 | AGREE |
| COMBAT-23 Surrenders | string 10CC at 1267, CMP INT +11h,5 at 1252 | AGREE |
| COMBAT-24 Guarding | text owned by 00BA:2686 (ENGINE) | AGREE (not re-derived here) |

No capture in acceptance/ref covers ov09 messages.

DISAGREE: none.

## ov24

### Sample (25 statements)

| line | address | statement (short) | verdict | evidence |
|---|---|---|---|---|
| L3118 | 9800:0003 | EffectHandler[type](c, e, mode) | AGREE | push c,e,mode; CALLF [type*4+6828h] |
| L3131 | 9800:0083 | if p^.callOnRemove <> 0 then CallEffectHandler(type, c, p, 1) | AGREE | CMP p+4,0; push [bp+0Ah], c, p, 1 |
| L3137 | 9800:00e5 | while (q <> nil) and (q^.next <> p) do q := q^.next | AGREE | next at +5/+7, compare with p |
| L3156 | 9800:01f8 | if game_Mode = 5 then | AGREE | CMP [49F3],5 |
| L3165 | 9800:02c0 | Move(saved, g_671B, $D8) | AGREE | src [bp-0D8h], dst DS:671B, 0D8h |
| L3178 | 9800:03d5 | $03: types := [40..46, 4F, 55, 56, 57] | AGREE | all 11 MOV AL constants 03D5..046B |
| L3181 | 9800:055c | $06: types := [71, 3D, 7A, …, 1C] | AGREE | all 16 constants 055C..0633 |
| L3184 | 9800:06bf | $09: types := [69..70, 7C, 7D] | AGREE | all 10 constants |
| L3205 | 9800:0afb | ProbeMove(c, 8, occupant, ground) | AGREE | push c, 8, @[bp-2], @[bp-1]; [bp-1] tested vs 1Eh |
| L3209 | 9800:0b50 | if HasEffect(c, $20, e) then exit | AGREE | MOV AL,20h |
| L3240 | 9800:0cbd | result := false | AGREE | [bp-1]:=0 |
| L3286 | 9800:0e34 | LastDiceCount := count | AGREE | [bp+8] → [681Ch]; Roll(count, sides) |
| L3301 | 9800:0ed9 | e^.type := type | AGREE | [bp+0Ch] → ES:[DI] |
| L3319 | 9800:0f8a | RestoreTerrain(0, 0, i) | AGREE | push 0, 0, [bp-2Ah] |
| L3346 | 9800:1050 | RemoveEffect(c, g_0C23[k], nil) | AGREE | [DI+0C23h], nil |
| L3393 | 9800:11aa | old := nil | AGREE | [bp-9]/[bp-7] := 0 |
| L3428 | 9800:13ed | $01: s := s + 'from Fire' | AGREE | string 12BA |
| L3430 | 9800:144e | $04: s := s + 'from Electricity' | AGREE | string 12CE |
| L3441 | 9800:1554 | c^.combatant^[0] := 0 | AGREE | LES +108h; MOV byte ES:[DI],0 |
| L3450 | 9800:1602 | MessageDelay (game_Mode <> 5) | AGREE | JZ 1609 else MessageDelay |
| L3454 | 9800:1620 | if c^.active = 0 then RemoveCombatant(c) else MessageDelay | AGREE | CMP +10Dh,0 JNZ 1638 |
| L3477 | 9800:1719 | if s <> '' then ShowCombatMessageAnimation(c, 1, s) | AGREE | CMP [bp-29h],0 (length byte); push c, 1, @s |
| L3487 | 9800:1763 | if not (c^.status in [0, 1, 4, 5]) then exit | AGREE | @SetIn with set CS:173D = {0,1,4,5} (bytes decoded) |
| L3508 | 9800:186f | PlaceCombatant(c, CombatantCol(c), CombatantRow(c), 1) | AGREE | push c, col, row, 1 |
| L3516 | 9800:191a | CountActiveSides | AGREE | CALLF 00ba:2f7b |

### Sweeps (all ov24 sections)

| class | sites | result |
|---|---|---|
| call-argument order | see ov09 row; sample calls re-checked (CallEffectHandler, ProbeMove, RestoreTerrain, RemoveEffect, ShowCombatMessageAnimation, PlaceCombatant, Roll) | no error found |
| signed vs unsigned | 6 signed jumps: 0C6B, 0C8B, 0CA8, 0CDD, 0D2F, 0D54 (AttackRollValue / to-hit sums with CBW) | pseudo marks each as signed / 16-bit signed — AGREE |
| byte vs word | DamageAmount 6818, SaveRoll 6816, EffectToApply 6817, AttackRollValue 6822, SaveType 682A, LastDiceCount 681C: all byte accesses, no `word ptr` use in ov24/ov09 | AGREE |
| folded constant indexes | [DI+6828h] handler table (×4), [DI+0C23h], ITEMS, 5F2Ah (×4) | rendered as arrays — AGREE |
| ABS idiom | no NEG in ov24 | n/a |
| set tests | 3 @SetIn: 019C set CS:0140 = {15h,2Dh,2Eh,31h}; 15B7 set CS:131A = {6,7,8}; 1767 set CS:173D = {0,1,4,5} | all three sets match the pseudo exactly (bytes decoded) — AGREE |
| string length bytes | 1719 `s <> ''` tests the length byte [bp-29h] | AGREE |

### Screens (COMBAT-61..72)

| row | check | verdict |
|---|---|---|
| COMBAT-61/62 | 0BB7 (SavingThrow ≠ 0 → effect 1Eh, 1, 'starts to cough'); 0BFC (failed → 1Fh, Roll(1,4)+1, 'chokes and gags from nausea') | AGREE |
| COMBAT-63 is Cured | 10AE, ShowCharacterMessage(…, 0Ah, 1) | AGREE |
| COMBAT-64/65 | 138A: amount = 0 → no message, = 1 → 'takes 1 point of damage ', else 'takes '+n+' points of damage ' | AGREE |
| COMBAT-64a suffixes | strings 12BA/12C4/12CE/12DF/12E9 | AGREE |
| COMBAT-66 lost a spell | 152E, row 0Ch, wait 1 | AGREE |
| COMBAT-67 Goes Down | 156E/159E/15CC; ShowCharacterMessage(c, s, text_Row+1, 0) at 15E0..15F6 | AGREE |
| COMBAT-68 is Unaffected | 16A0, row 0Ah, wait 1 | AGREE |
| COMBAT-69 | 171F ShowCombatMessageAnimation(c, 1, s) | AGREE |
| COMBAT-70 RemoveFromCombat | 0F4C FocusCombatant then ShowCharacterMessage(…, 0Ah, 1) | AGREE |
| COMBAT-71/72 | strings 1848/185C; ShowCharacterMessage(c, s, 10, 1) at 1904 | AGREE |

No capture in acceptance/ref covers ov24 messages (DECODE_CHECKS has no COMBAT rows).

DISAGREE: none.

## Counts
Sample: 59 statements (ov09 33 + resident 1, ov24 25): 59 AGREE, 0 DISAGREE, 0 UNSURE. argcheck MISMATCH 4d00:0744 refuted. Sweeps: 21 signed jumps, 3 set tests, all folded-index/byte sites — no defects. Screens: 18 rows (COMBAT-17..24, 61..72) AGREE.

## ov13

Sample: 68 statements (seed 20261016, `COMBAT_sample_ov13.txt`), each re-read against `decode/listings/ov13.lst` / `hdis.py ov13`.

| line | address | statement (short) | verdict | evidence |
|---|---|---|---|---|
| L989 | 6100:0023 | `r^[2] := 1;` | AGREE | MOV byte ES:[DI+2],1 via LES [bp-5] |
| L1018 | 6100:016f | `CallEffectHooks($12, c);` | AGREE | push 12h, push c([bp+8]:[bp+6]); CALLF CallEffectHooks |
| L1029 | 6100:01de | `if CanBackstab(att, tgt) then` | AGREE | push att [bp+0E:0C], tgt [bp+0A:08]; CALL CanBackstab; OR AL,AL/JZ |
| L1042 | 6100:0320 | `3: s := 'slays helpless';` | AGREE | MOV DI,023E "slays helpless"; StrAssign 50h |
| L1050 | 6100:0399 | `if hit <> 0 then begin` | AGREE | CMP byte [bp+6] (hit),0; JNZ |
| L1069 | 6100:0536 | `cr(tgt)^.castSpell := 0;` | AGREE | LES tgt [bp+0E]; LES +108h; MOV byte [DI],0 |
| L1108 | 6100:0729 | `if cost > cr(c)^.moveLeft then begin` | AGREE | CMP AL([bp-1]),ES:[DI+6]; JBE skip (unsigned >) |
| L1109 | 6100:073a | `cr(c)^.moveLeft := 0;` | AGREE | MOV byte ES:[combatant+6],0 |
| L1117 | 6100:07b9 | `mode := 1;` | AGREE | MOV byte [bp-1],1 |
| L1125 | 6100:082d | `g_5F28[idx*4] := ny;` | AGREE | DI=[bp-2]*4; MOV [DI+5F28],DL([bp-4]) |
| L1147 | 6100:0957 | `m := CollectOppositeSideTargets(c, 1);` | AGREE | push c, push 1; CALLF CollectOppositeSideTargets; store [bp-16h] |
| L1175 | 6100:0be5 | `Attack(e, c, 1, nil, g_6E31);` | AGREE | push e[bp-1F], c, 1, nil(DX:AX=0), @g_6E31; CALL Attack |
| L1187 | 6100:0c70 | `escaped := false;` | AGREE | MOV byte [bp-2],0 |
| L1188 | 6100:0c74 | `if CollectOppositeSideTargets(c, $FF) = 0 then escaped := true` | AGREE | push c, FFh; CALLF Collect..; OR AL,AL; JNZ skip; [bp-2]:=1 |
| L1191 | 6100:0c9d | `theirs := MaxEnemyMove(c);` | AGREE | push c; CALL MaxEnemyMove; MOV [bp-3],AL |
| L1206 | 6100:0d38 | `c^.attacks_left[1] := c^.attacks;` | AGREE | MOV AL,ES:[DI+A1h]; MOV ES:[DI+113h],AL |
| L1247 | 6100:0ee5 | `for i := 1 to n do begin` | AGREE | MOV AL,1; CMP AL,[bp-0Ah]; JA exit; loop var [bp-4] |
| L1248 | 6100:0ef4 | `e := g_65B9[foe_List` | AGREE | byte [i+6DE4]; *4; word [DI+65B9] (far ptr table) |
| L1250 | 6100:0f2b | `if e^.level_main = 0 then cnt := cnt + 1;` | AGREE | CMP byte ES:[DI+73h],0; JNZ; INC [bp-3] (field name level_main is the lane name; offset +73h correct) |
| L1254 | 6100:0f70 | `ShowCharacterMessage(att, 'sweeps', $0A, 1);` | AGREE | push att [bp+0C:0A], "sweeps", 0Ah, 1; CALLF ShowCharacterMessage |
| L1275 | 6100:108f | `if tgt = nil then exit;` | AGREE | MOV AX,[bp+6]; OR AX,[bp+8]; JNZ / JMP exit |
| L1308 | 6100:125f | `FocusCombatant(u, 3, 0);` | AGREE | push u, 3, 0; CALLF FocusCombatant |
| L1316 | 6100:12d8 | `u^.status := 8;` | AGREE | MOV byte ES:[DI+10Ch],8 |
| L1317 | 6100:12e1 | `u^.active := 0;` | AGREE | MOV byte ES:[DI+10Dh],0 |
| L1355 | 6100:1391 | `e := g_65B9[foe_List` | AGREE | byte [i+6DE4]; *4; word [DI+65B9] |
| L1359 | 6100:13e1 | `u := e;` | AGREE | store e into var param [bp+6]^ |
| L1386 | 6100:14f4 | `done := 1;` | AGREE | LES [bp+6]; MOV byte ES:[DI],1 |
| L1401 | 6100:15c5 | `if cr(tgt)^.timesAttacked > 1 then` | AGREE | CMP byte ES:[combatant+0Fh],1; JBE skip (unsigned >1) |
| L1418 | 6100:16f6 | `PlayOrStopSound(g_2622);` | AGREE | PUSH word [2622]; CALLF PlayOrStopSound |
| L1423 | 6100:1753 | `if tgt^.active = 0 then stop := true;` | AGREE | CMP byte ES:[DI+10Dh],0; JNZ; [bp-12h]:=1 |
| L1483 | 6100:1a87 | `LoseItem(att, missile);` | AGREE | push att [bp+16:14], missile [bp+0C:0A]; CALLF LoseItem |
| L1521 | 6100:1c17 | `x := CombatantCol(c) + g_2736[d];` | AGREE | CombatantCol(c) CBW + byte [d+2736] CBW |
| L1531 | 6100:1d24 | `end else if ground = $1F then` | AGREE | CMP byte [bp-0Dh],1Fh; JZ |
| L1532 | 6100:1d2d | `for k := 1 to BodyCount` | AGREE | AL=[6715]; MOV AL,1; CMP AL,count; JA skip; k=[bp-0Bh] |
| L1535 | 6100:1d7a | `and (BodyList` | AGREE | k*7 + 66DA = record DS:66D6+7k field +4 (x); CMP [bp-6] |
| L1583 | 6100:206f | `if found then begin` | AGREE | CMP byte [bp-2],0; JZ |
| L1609 | 6100:2147 | `if cr(SelectedChar)^.target <> nil then begin` | AGREE | LES [5D92]; LES +108h; word +0Ah or +0Ch; JZ |
| L1617 | 6100:2205 | `SpellArea` | AGREE | MOV byte [6820],1 |
| L1621 | 6100:2224 | `if ChooseSpellTarget(spell, auto, 1, t) then begin` | AGREE | push spell [bp+0C], auto [bp+0A], 1, @t[bp-0Ah]; call ChooseSpellTarget |
| L1631 | 6100:22f1 | `while left > 0 do begin` | AGREE | CMP byte [bp-1],0; JA body |
| L1644 | 6100:23d6 | `end else left := left - 1;` | AGREE | DEC byte [bp-1] |
| L1647 | 6100:23e2 | `if n = 0 then ok := 0;` | AGREE | CMP byte [bp-2],0; JNZ; LES [bp+6]; MOV byte ES:[DI],0 |
| L1662 | 6100:2487 | `sp := 0;` | AGREE | MOV byte [bp-1],0 |
| L1680 | 6100:2561 | `else cr(caster)^.initiative := 1;` | AGREE | LES caster; LES +108h; MOV byte ES:[DI+3],1 |
| L1709 | 6100:26a1 | `DirectionTo := d;` | AGREE | MOV AL,[bp-2]; MOV [bp-1],AL (function result) |
| L1722 | 6100:270f | `if Odd(d) then begin` | AGREE | SHR AL,1; JNC (= Odd test) |
| L1727 | 6100:278c | `end else if t in [2, 7, $14] then begin` | AGREE | CMP AL,2/7/14h chain = set test |
| L1735 | 6100:27dd | `CopyCombatAnimationFrame(frame + 7, 0, 0, 0);` | AGREE | AX=[bp-1]+7 pushed, then 0,0,0 |
| L1756 | 6100:28c4 | `sumMax := sumMax + p^.hp_max;` | AGREE | byte ES:[DI+32h] zero-extended + word [bp-2] |
| L1789 | 6100:29e6 | `ConfirmAttackAlly := false` | AGREE | MOV byte [bp-1],0; JMP exit |
| L1812 | 6100:2abf | `dir := DirectionTo(att, t);` | AGREE | push att [bp+12:10], t [bp+0E:0C]; CALL DirectionTo; [bp-31h] |
| L1820 | 6100:2b82 | `if (CollectOppositeSideTargets(att, 1) = 0) or FUN_00ba_2e46(att) then` | AGREE | push att, 1; CALLF Collect..; OR AL,AL; JZ (then) |
| L1864 | 6100:2e46 | `g_6716^[5] := 1;` | AGREE | LES [6716]; MOV byte ES:[DI+5],1 |
| L1872 | 6100:2eb0 | `if cy > $18 then cy := $18;` | AGREE | CMP byte [bp-34h],18h; JLE (signed; cy ShortInt) |
| L1913 | 6100:31d2 | `if mode = 1 then ConfirmTarget(att, tgt.char, mode, ok, tgt)` | AGREE | CMP byte [bp+10h],1; JNZ; push att [bp+1A:18], tgt.char, mode, ... |
| L1929 | 6100:3283 | `'G': dir := 7;` | AGREE | CMP AL,47h; JNZ; [bp-2Fh]:=7 |
| L1948 | 6100:32ec | `BuildTargetList(CombatantCol(c), CombatantRow(c), $7F, $FF, CombatantS` | AGREE | push CombatantCol(c), CombatantRow(c), 7Fh, ... |
| L1969 | 6100:34d7 | `if draw <> 0 then begin` | AGREE | CMP byte [bp+8],0; JZ |
| L1994 | 6100:360d | `key := ' ';` | AGREE | MOV byte [bp-0E6h],20h |
| L1997 | 6100:3648 | `t := NextTarget(skip, 0)` | AGREE | push skip [bp-0DCh], 0, BP (nested); CALL NextTarget |
| L1999 | 6100:3660 | `key := TargetMenu(att, t, maxR, mode, allowEmpty);` | AGREE | push att [bp+16:14], t, maxR [bp-0D9h], mode [bp+10h], allowEmpty [bp+0Eh] |
| L2009 | 6100:36f9 | `'T': begin` | AGREE | CMP AL,54h; JNZ |
| L2013 | 6100:3739 | `move := 0;` | AGREE | MOV byte [bp-0DDh],0 |
| L2038 | 6100:3873 | `while not found and (last = 0) do begin` | AGREE | CMP [bp-6],0 / CMP [bp-5],0 loop tests |
| L2050 | 6100:393e | `cr(c)^.target := e;` | AGREE | store e into combatant +0Ah/+0Ch |
| L2075 | 6100:3a18 | `c^.dmg_sides[2] := 4;` | AGREE | MOV byte ES:[DI+118h],4 |
| L2078 | 6100:3a4a | `Attack(c, cr(c)^.target, 0, nil, d);` | AGREE | push c, c^.combatant^.target (far +0Ah), 0, nil, @d |
| L2110 | 6100:3bbc | `GodsIntervene := true;` | AGREE | MOV byte [bp-1],1 (result) |

Sample result: **68 AGREE, 0 DISAGREE, 0 UNSURE.**

### Sweeps (all ov13 sections)

| class | checked sites | findings |
|---|---|---|
| call-argument order | argcheck (scratch run on COMBAT.pas.md): 398 ov13 calls, 33 OK, 0 MISMATCH, 365 UNSURE; plus 22 sample calls re-read by hand (push order vs written order) | none |
| signed vs unsigned compares | every JL/JG/JLE/JGE/IDIV/CBW/NEG site in ov13 (60 sites: 008C..00F3 initiative, 0B0A, 0E39, 11CF..11F2, 1226..127F turn undead, 1306, 13C9/13D5, 1B73..1BBB, 1D01, 2538..25BF, 2E92..2EB4, 1C17..1C4F, 2CBC/3C41) vs the pseudo statement | all signed sites are written with ShortInt()/signed types or as signed comparisons; JB/JA sites spot-checked (0729, 15C5, 1CBE, 22F1) are unsigned; none wrong |
| byte vs word operands | sample + 1CBE (hp byte vs hp_max shr 1 word), 28C4 (byte added to word), 0E29 (bytes zero-extended, word compare) | none |
| folded constant array indexes | 1226 TurnUndeadTable (DS:0447 + 10*type + col), 0EF4/1391 (DS:6DE4+i, DS:65B9+4k), 082D (DS:5F28+4i), 1D7A (DS:66D6+7k+4), ITEMS reads 0D6F/1524/1B47/3596 (DS:5582+16*type+field) | none (all written as indexed tables with the right base) |
| and/jge/neg = ABS idioms | 1244 `CBW; CWD; XOR AX,DX; SUB AX,DX` = Abs(v) | written as `Abs(v)`; correct |
| Pascal set tests (`in`) | 05AC (CS:02CF = {6,7,8}), 1D58 (CS:1BD8 = {6,7,8}), 26F8 (chain 9,15h,1Ch,1Fh,49h), 278C (2,7,14h), 27B0 (55h,56h), 2E4F (CS:2DA7 = {0,13,69,84} = #0,#13,E,T), 3612 (CS:3538 = {0,69} = #0,E) | all set constants decoded from the image bytes match |
| string length-byte handling | no `Length()`/`[0]` use in the ov13 sections; string temporaries sized as StrAssign limits (e.g. 0320 limit 50h) | none |

### Screens (COMBAT_SCREENS ov13 rows COMBAT-25..41)

| id | verdict | evidence |
|---|---|---|
| COMBAT-25 | AGREE | all literals present in ov13 (" point "/" points " 0410/043A, "slays helpless" 0320 ...); rows/cols via ShowCharacterMessage |
| COMBAT-26 | AGREE | "lost a spell" 0513 -> ShowCharacterMessage |
| COMBAT-27 | AGREE | "goes down" 056C -> ShowCharacterMessage, "and is Dying" 05A0 -> DrawText, "is killed" 05CF -> ShowCharacterMessage |
| COMBAT-28 | AGREE | "sweeps" 0F7E -> ShowCharacterMessage(att, s, 0Ah, 1) |
| COMBAT-29 | AGREE | "Got Away" 0CEA -> RemoveFromCombat |
| COMBAT-30 | AGREE | "Escape is blocked" 0D00 -> ShowTimedBottomMessage (row 24) |
| COMBAT-31 | AGREE | "turns undead..." 117E -> ShowCharacterMessage |
| COMBAT-32 | AGREE | "Nothing Happens..." 1327 -> ShowTimedBottomMessage |
| COMBAT-33 | AGREE | "Already been targeted" 238C -> ShowTimedBottomMessage |
| COMBAT-34 | AGREE | "Camp Only Spell" 247B -> ShowTimedBottomMessage |
| COMBAT-35 | AGREE | "Begins Casting" 2518 -> ShowCharacterMessage |
| COMBAT-36 | AGREE | prompt literal present; Yes/No items come from ov25 (not re-read) |
| COMBAT-37 | AGREE | "Range = " + ByteToStr + "  " -> DrawText(0, 17h, 0Ah, s) at 2AD8..2B0F; "Target " conditional at 2B25 |
| COMBAT-38 | AGREE | literals present; key codes match the 3283 case chain (sample) |
| COMBAT-39 | AGREE | "Rakes..." 3A38 -> ShowCharacterMessage |
| COMBAT-40 | AGREE | "The Gods intervene!" 3BC8 -> ShowTimedBottomMessage |
| COMBAT-41 | AGREE | no text; sounds via PlayOrStopSound (16F6 sample, g_2622) |

No capture in acceptance/ref covers an ov13 row (DECODE_CHECKS has only combat entry/geometry rows VIEW-05/06, ENGINE-35/46, ECL-12).

DISAGREE: none.

Counts: sample 68 AGREE / 0 DISAGREE / 0 UNSURE; sweeps 0 findings; screens 17 AGREE / 0 DISAGREE.

## ov19

Sample (seed 20261016, 51 statements of ov19 in COMBAT.pas.md), each re-read against `decode/listings/ov19.lst` / `hdis.py ov19`:

| line | address | statement (short) | verdict | evidence |
|---|---|---|---|---|
| L2392 | 7f00:0198 | `DrawText(1, 4, $0F, AlignmentName` | AGREE | LES ViewChar; AL=+A0h CBW; MUL 11h; +0F53h; StrAssign; then push 1,4,0Fh, DrawText (01BE..01CD) |
| L2394 | 7f00:020b | `for i := 0 to 5 do begin` | AGREE | MOV [bp-5],0 ... CMP [bp-5],5 at 02D6 |
| L2405 | 7f00:0306 | `s := '';` | AGREE | MOV byte [bp-106h],0 (length byte) |
| L2410 | 7f00:0397 | `any := True;` | AGREE | MOV byte [bp-107h],1 |
| L2438 | 7f00:0525 | `row := 7;` | AGREE | MOV [bp-1],7 (then i := 6 downto 0 at 0529/052F) |
| L2441 | 7f00:0546 | `s := CoinName` | AGREE | AL=i CBW; MUL 0Bh; +0FFAh; StrAssign max 28h |
| L2444 | 7f00:05ae | `row := row + 1;` | AGREE | INC byte [bp-1] |
| L2462 | 7f00:06ec | `s := ByteToStr(c^.dmg_dice[1]) + 'd' + ByteToStr(c^.dmg_sides[1]);` | AGREE | ByteToStr(c^[115h]) + cs:"d" (05D5) ... |
| L2476 | 7f00:08cd | `DrawText(col + 12, row + 1, $0A, ByteToStr(mv));` | AGREE | push col([bp-6])+0Ch, row([bp-5])+1, 0Ah, ByteToStr([bp-7]) |
| L2488 | 7f00:094c | `DrawText(col, stat + 7, colour, ByteToStr(SelectedChar^.abil[stat]));` | AGREE | push [bp-2Ah] col, stat([bp+8] CBW)+7, [bp-2Bh] colour, string |
| L2513 | 7f00:0b3c | `if ViewChar^.money[i] > 0 then hasMoney := True;` | AGREE | word +88h+2i CMP 0 / JBE (unsigned >0) |
| L2549 | 7f00:0df3 | `text_Row` | AGREE | MOV byte [5E25],15h |
| L2554 | 7f00:0e45 | `result := True;` | AGREE | MOV byte [bp-1],1 |
| L2565 | 7f00:0f10 | `sel := c^.items;` | AGREE | [bp-35h..] := c^[C8h] (items) |
| L2576 | 7f00:0ff7 | `if ((c^.npc_morale < $80) or (c^.active = 0) or (c^.status = 1)) and (game_Mode ` | AGREE | +84h CMP 80h JC; +10Dh=0 JZ; +10Ch=1; then game_Mode CMP 5 JZ skip |
| L2584 | 7f00:1149 | `p := c^.items;` | AGREE | [bp-31h] := c^[C8h] |
| L2596 | 7f00:123a | `redraw := True;` | AGREE | MOV [bp-2Dh],1 |
| L2597 | 7f00:123e | `fullRedraw := False;` | AGREE | MOV [bp-2Ch],0 |
| L2604 | 7f00:12a9 | `'R': ReadyItem(sel);` | AGREE | CMP AL,'R'; push sel ([bp-33h:35h]); CALL ReadyItem |
| L2605 | 7f00:12ba | `'U': if sel^.readied = 0 then begin` | AGREE | CMP AL,'U'; sel^[34h] CMP 0 JNZ; else 'Must be Readied' |
| L2622 | 7f00:138c | `'Your ' + sel^.name + 'will be gone forever');` | AGREE | cs:"Your " + name + cs:"will be gone forever" (no blank); DrawWrappedText(1,15h,26h,16h,0Eh,1,s) pushes 138C..13A2 |
| L2632 | 7f00:143c | `'S': if MayLoseItem(sel) then SellItem(sel)` | AGREE | CMP AL,'S'; MayLoseItem(sel) OR AL / JZ; SellItem(sel) |
| L2649 | 7f00:14f4 | `if item^.readied <> 0 then begin` | AGREE | item^[34h] CMP 0 JZ |
| L2653 | 7f00:151e | `item^.readied := 0;` | AGREE | item^[34h] := 0 |
| L2657 | 7f00:154b | `err := 0;` | AGREE | MOV [bp-2],0 |
| L2660 | 7f00:1591 | `if slot in [0..8] then begin` | AGREE | slot CMP 0 JC / CMP 8 JA (unsigned range 0..8) |
| L2678 | 7f00:168a | `BuildItemName(c, c^.readied[slot], 0, 0, False, False);` | AGREE | push c, c^.readied[slot] (+CCh+4*slot), 0, 0, 0, 0 -> BuildItemName |
| L2681 | 7f00:16ec | `3: if (game_Mode <> 5) or (c^.controlled = 0) then` | AGREE | game_Mode CMP 5 JNZ -> message; c^[10Fh] CMP 0 JNZ -> skip |
| L2696 | 7f00:1770 | `TradePartner := whom;` | AGREE | [471A] := whom ([bp-4..-2]) |
| L2698 | 7f00:1791 | `ShowTimedBottomMessage('Overloaded')` | AGREE | ItemOverloads -> OR AL / JZ; cs:'Overloaded' -> ShowTimedBottomMessage |
| L2743 | 7f00:1a05 | `LoseItem(SelectedChar, p);` | AGREE | push SelectedChar, then p ([bp-4]) -> LoseItem (ENGINE LoseItem(c, item)) |
| L2746 | 7f00:1a22 | `p^.count := p^.count - (255 - total);` | AGREE | target^[39h]:=FFh; p^.count := p^.count - (FFh - total) (1A22..1A3E) |
| L2764 | 7f00:1a9e | `if IsScroll(item) then begin` | AGREE | push item -> ov22_323D (IsScroll), OR AL / JZ |
| L2766 | 7f00:1aba | `spell := SpellList(2, 1, spellIdx, n);` | AGREE | push 2, 1, @[bp-3], @[bp-4] -> SpellList(mode, flag, var index, var count) |
| L2776 | 7f00:1b1e | `if ItemCast <> 0 then begin` | AGREE | CMP [6DBF],0 JNZ |
| L2784 | 7f00:1bb8 | `MessageDelay;` | AGREE | CALLF MessageDelay |
| L2791 | 7f00:1c00 | `done := ClearCombatantActionFlags(SelectedChar);` | AGREE | push SelectedChar -> ClearCombatantActionFlags; result -> [bp+6]^ |
| L2800 | 7f00:1c68 | `if item^.power[1] = 0 then LoseItem(SelectedChar, item);` | AGREE | item^[3Ch] (power[1]) CMP 0 JNZ; LoseItem(SelectedChar, item) |
| L2812 | 7f00:1d1a | `if (item^.type <> $49) or (item^.type = $1C) then` | DISAGREE | type CMP 49h JNZ -> 1D2E (div 20); type CMP 1Ch JZ -> 1D46; type 49h also reaches 1D2E |
| L2832 | 7f00:1e8b | `SelectedChar^.money[3] := SelectedChar^.money[3] + gold;` | AGREE | ADD c^[8Eh] (money[3] gold), [bp-6] |
| L2835 | 7f00:1ea5 | `SelectedChar^.money[3] := SelectedChar^.money[3] + gold;` | AGREE | ADD c^[90h],[bp-4]; ADD c^[8Eh],[bp-6] |
| L2851 | 7f00:1fd1 | `m := MoneyInGold(SelectedChar);` | AGREE | push SelectedChar; CALL MoneyInGold; DX:AX -> [bp-4..-2]; signed 32-bit compare with C8h |
| L2860 | 7f00:202c | `m := m - 200;` | AGREE | SUB [bp-8],C8h / SBB [bp-6],0 |
| L2901 | 7f00:21ee | `kinds := kinds + 1;` | AGREE | INC word [bp-16h] |
| L2903 | 7f00:21f9 | `GetMem(head, $2E);` | AGREE | GetMem(2Eh) -> [bp-0Ch..]; next := nil |
| L2912 | 7f00:2284 | `blanks := '';  blanks[0] := Chr(pad);` | AGREE | [bp-2Dh] := 0; := pad |
| L2914 | 7f00:22b9 | `head^.text := blanks + CoinName[i] + ' ' + num;` | AGREE | StrCopy blanks; + CoinName (11 bytes/entry, +0FFAh) ... |
| L2919 | 7f00:2323 | `redraw := True;` | AGREE | MOV byte [bp-133h],1 |
| L2932 | 7f00:241f | `for i := 0 to 6 do` | AGREE | MOV [bp-5],0 ... CMP [bp-5],6 at 2446 |
| L2966 | 7f00:2544 | `Str(LongInt(SelectedChar^.money[i]):0, num);` | AGREE | money[i] word -> DX:AX (XOR DX), width 0 -> Str |
| L3024 | 7f00:28ab | `SelectedChar := p;` | AGREE | SelectedChar := [bp-4..-2] |

Sample result: 50 AGREE, 1 DISAGREE, 0 UNSURE.

### Sweeps (all ov19 sections, 448 anchored statements)

| class | checked sites | findings |
|---|---|---|
| call-argument order | 204 calls by argcheck (33 OK, 0 MISMATCH, 171 UNSURE); 55 multi-constant calls by push-sequence constant order (48 consistent, 7 flagged = string built before the constants, all re-read by hand: consistent); hand-checked SpellList (1ABA), BuildItemName (168A), LoseItem (1A05, 1C72), DrawText (01BE, 08CD, 094C), DrawWrappedText (138C), ShowCharacterMessage (1B32), AskYesNo (0E1E) | none |
| signed vs unsigned compares | all 12 signed conditional jumps in ov19 (0324, 073A, 0786, 1575, 19F9, 1FE7/1FE9, 201D/201F, 27C4/27C6, 2A7D) mapped to their statements; 60 statements with relational operators / casts checked for JB/JA vs JL/JG | none: every signed jump is written as ShortInt/Integer/LongInt, every other byte/word compare is unsigned |
| byte vs word operands | sample + the 60 compare statements (byte CMP vs word CMP: money word +88h, levels byte +96h, encumbrance word +102h) | none |
| folded constant array indexes | 42 `field[k]` statements (money, readied, dmg_*, level, power, abil, save): displacement base + k*size present at the anchor | none (4 apparent misses at 18E9 are the documented self-comparisons power[1..3] = itself, confirmed 19A1..19E2) |
| and/jge/neg = ABS idioms | `CBW/CWD/XOR AX,DX/SUB AX,DX` at 07B0 = Abs(ShortInt(dmg_bonus[1])) as written (L2466) | none |
| Pascal set tests | `key in [#0,'E']` cs:0A4C and cs:0E63 = {00h,'E'}; `key in ['I','S','T']` cs:0A93 = {I,S,T} (set bytes decoded); `game_Mode in [2,3,4]` = CMP chain 0FA4..0FB7; `slot in [0..8]` = JC/JA 1594..159A | none |
| string length-byte handling | `s := ''` (0306 length byte := 0), `blanks[0] := Chr(pad)` (2284..228B), `pad := 8 - Length(CoinName[i])` (2269..2281: length byte of DS:0FFA+11i), `Length(name)+3/+4` positions | none |

### Screens (ov19 rows of COMBAT_SCREENS.md)

| id | verdict | evidence |
|---|---|---|
| COMBAT-46 Character sheet | AGREE | capture acceptance/ref/REF-CHARACTER.png: every row/column of the table matches (name cyan row 1; Male Dwarf Age row 3; alignment 4; class 5; STR..CHA rows 7..12 col 1/5 green; money right-aligned to col 19, value col 21; Level/Exp row 15 col 1/17; AC/THAC0/Encumbrance row 17 cols 1/4, 9/15, 22/34; HP/Damage/Movement row 18 cols 1/4, 8/15, 25/34; Weapon/Armor/Status rows 20/21/22; border cols 0/39 rows 0/23) |
| COMBAT-47 View menu | AGREE | capture REF-CHARACTER.png bottom line `View:Items Trade Drop Exit` (no Spells for a fighter); strings cs:"View:", "Items ", "Trade ", "Drop ", "Exit"; key handling 0AE3..0CE9 |
| COMBAT-48 Items screen | AGREE | strings "Ready Item", " Use", " Trade", " Drop", " Halve", " Join", " Sell", " Id"; conditions 0F8D..10CA as written (no capture) |
| COMBAT-49 Ready messages | AGREE | strings It's Cursed / Wrong Class / already using / Your hands are full!; 14F4..1717 (no capture) |
| COMBAT-50 Must be Readied | AGREE | 12C4..12D3 |
| COMBAT-51 Drop confirmation | AGREE | 138C: "Your " + name + "will be gone forever" (no blank), DrawWrappedText(1,21,38,22,0Eh,1); AskYesNo "Drop It? " |
| COMBAT-52 May-lose checks | AGREE | 0D70..0E5F: "Must be unreadied", " was going to scribe from that scroll" (colour 0Eh at 0E04), "is it Okay to lose it? " |
| COMBAT-53 Trade item | AGREE | "Trade with Whom?", ItemOverloads -> "Overloaded" (1791) |
| COMBAT-54 Halve | AGREE | "Can't halve that", test count > 0 at 1801 (JBE) |
| COMBAT-55 Use item | AGREE | "uses an item": ShowCharacterMessage(SelectedChar, s, 0Ah, 0) 1B32..1B4F; "Item:" string |
| COMBAT-56 Sell | AGREE | "I'll give you " ... " gold pieces for your "; "Is It a Deal? "; "Sold!"; "Overloaded.  Money will be put in pool." |
| COMBAT-57 Identify | AGREE | "For 200 gold pieces I'll identify your "; 200 = C8h at 1FEB/202C; "Not Enough Money"; "I can't tell anything new about your " / "It looks like some sort of " |
| COMBAT-58 Trade coins | AGREE | "Trade to?", "Select type of coin", "How much " ... "will you trade? "; pad = 8 - Length(kind) (2269) |
| COMBAT-59 Drop coins | AGREE | "will you drop? " (2585 same layout) |
| COMBAT-60 Spell list header | UNSURE | code 2A7F..2AA0 draws DrawTitledFrame(1,1,38,1,0,0,'') then name at (1,1) and "Spells in Memory"; capture REF-CHECK-SPELLS.png shows the header text exactly (name cyan, SPELLS IN MEMORY green, row 1) but **no border at row 0** (top-left yellow corner only at row 2). The pseudocode matches the bytes; the missing row-0 border must come from a later redraw (MAGIC ChooseSpell) or the capture path - needs a por-dosbox-ref recheck, not a pseudo fix. |

DISAGREE:

- 7f00:1d1a (COMBAT.pas.md L2812, SellItem): `if (item^.type <> $49) or (item^.type = $1C) then price := count*price div 20 else price := count*price` -> correct: the second test jumps to the else-branch only when type = 1Ch, so the condition is `(item^.type <> $49) or (item^.type <> $1C)` = always true: **every stacked item (count > 1) sells at count*price div 20; the else-branch 1D46 is unreachable** (evidence: 1D1D `CMP type,49h / JNZ 1D2E`; 1D27 `CMP type,1Ch / JZ 1D46`; type 49h falls through to 1D2E). The comment on L2814 already says the else is unreachable; only the written condition is wrong.

Counts: sample 51 (50 AGREE / 1 DISAGREE / 0 UNSURE); sweeps 7 classes, 0 further findings; screens 15 rows (14 AGREE, 0 DISAGREE, 1 UNSURE).
