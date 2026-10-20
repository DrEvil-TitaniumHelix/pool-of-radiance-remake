# VIEW verification part A — VIEW.pas.md lines 1..698 (ov29, ov34, ov14, ov10, ov23, ov26, ov27, ov33)

Verifier: por-verify2 fork. I did not write VIEW. Input: `decode/pseudo/VIEW.pas.md` as found in the working tree (it contains the owner's uncommitted edits), SHA-256 `f1ab24ed62f72df9824aec041ad2c72768d294cbb79f2b15de38cd17d65e6fc7`.
Evidence: `decode/listings/<unit>.lst` and `python -I decode/ecl/hdis.py ovNN START END` (bytes).

## 1. Random sample (seed 606)
Method: Python `random.seed(606)`; `random.sample` of the 254 anchored lines (lines with `{ seg:off }`) in lines 1..698, n = 25 (10 %).

| # | line | address | statement | verdict | evidence |
|---|---|---|---|---|---|
| 1 | L26 | b100:0082 | `sym := $104` | AGREE | `mov word [bp-0Ah],104h` at b100:0091. The anchor 0082 is the inner-loop head (x0+c computation), 15 bytes earlier, so the anchor is imprecise |
| 2 | L47 | b100:01be | `FillPictureRect(2, $3B, $0B, $01, g_6A61, @g_260A, g_4A20)` | AGREE | pushes 2, 3Bh, 0Bh, 1, AL=[6A61], ds:260A, [4A22]:[4A20] (01A0..01BA) |
| 3 | L83 | b100:03b4 | `if GetWallType(x, y, dir) <> 0` | AGREE | pushes [bp+0Ah], [bp+8], [bp+6]; `or al,al; ja` |
| 4 | L122 | b100:066b | `cx := x + 2*g_2736[dir]; cy := y + 2*g_273F[dir]` | AGREE | dx/dy are sign-extended table bytes; dist [bp-13h] := 2, then mul and add (0682..0699) |
| 5 | L137 | b100:073f | `DrawWallPiece(g_0CAA + off, g_0CBE, w, 0)` | AGREE | pushes [0CAA]+[bp-12h], AL=[0CBE], [bp-14h], 0 (072C..073F); col/row table elements 0 (see sweep 3d) |
| 6 | L149 | b100:094e | `DrawWallPiece(g_0CAC + off - 1, g_0CC0, w, 1)` | AGREE | [0CAC]+[bp-12h]-1, [0CC0], [bp-15h], 1 |
| 7 | L267 | 6600:02d4 | `if GetPassage(party_MapX, party_MapY, party_Dir) = 3` | AGREE | pushes 6AAD, 6AAE, 6AAF; `cmp al,3; je` |
| 8 | L277 | 6600:03a5 | `else door_CanBash := 0` | AGREE | `mov byte [6DDE],0` (str ≠ 18..25 path) |
| 9 | L281 | 6600:03c2 | `3..7: ok := Roll(1,6) = 1` | AGREE | `cmp al,7; ja`; Roll(1,6); `cmp al,1; jne` |
| 10 | L284 | 6600:0425 | `18: if c^.str_exc < 51 then ok := Roll(1,6) < 4` | AGREE | +16h in 0..32h (jb/ja); Roll(1,6); `cmp al,3; ja` → ok when ≤ 3 |
| 11 | L291 | 6600:0491 | `OpenPassage(party_MapX, party_MapY, party_Dir)` | AGREE | pushes 6AAD, 6AAE, 6AAF; near call 0109 |
| 12 | L329 | 6600:07a1 | `party_Ahead := GetWallType(party_MapX, party_MapY, party_Dir)` | AGREE | stores AL into [6AB0] |
| 13 | L339 | 6600:0864 | `clamp nx to 0..15, ny to 0..35` | AGREE | signed `jge`/`jle` against 0/0Fh and 0/23h (0864..0888) |
| 14 | L343 | 6600:0909 | `if w[$344] = 0 then ShowMessage('The river''s stench drives you back.', $0E)` | AGREE | word compare `es:[di+344h],0`; the callee is 0709:0D68, which ENGINE names ShowTimedBottomPrompt (name only differs, pushes string then 0Eh) |
| 15 | L344 | 6600:094a | `else ... w[$186] := nx; w[$188] := ny; AdvanceClock($0C, 3)` | AGREE | stores with cwde (sign-extended); pushes 0Ch, 3 |
| 16 | L361 | 6600:09fe | `view_AreaMap := not view_AreaMap` | AGREE | al := 0; `jne`; inc → Boolean not |
| 17 | L431 | 6600:1066 | `if w[$592] < $FF then begin StepOverland; DrawLocationTimeStatus end` | AGREE | unsigned `cmp word,0FFh; jae`; else branch `:= 0` at 1070 (L432) |
| 18 | L434 | 6600:1080 | `FreeAnimation(@g_6ABE)` | AGREE | ds:6ABE pushed; stub to ov28 FreeAnimation |
| 19 | L450 | 5200:004b | ScatterFloorDebris: tile 16h test, Roll(1,100), 98 → 1Ah, 99 → 1Bh, 100 and ecl_Block ≠ 10 and Roll(1,100)=1 → Roll(1,10) ≤ 6 1Ch / else 1Dh | AGREE | 003B `cmp [di+2747h],16h`; 0056..00CD; cell = cm_Map^ + row*32h + col + 7 |
| 20 | L505 | 5200:089d | `ScatterFloorDebris` | AGREE | `push cs; call 0000` |
| 21 | L522 | 5200:0bfb | `if OverlandTerrainFlags and $10 <> 0 then chance := $4B` | AGREE | `and al,10h; je`; `mov [bp-1],4Bh` |
| 22 | L583 | 5200:1f0b | `AllocatePicture($18, 3, 4, 1, g_6E36)` | AGREE | pushes 18h, 3, 4, 1, ds:6E36 → AllocPicture (ENGINE name; VIEW spells it AllocatePicture) |
| 23 | L606 | 9300:003b | `if g_3C7C[cls*11 + lvl] > c^.base_thac0 then ...` | AGREE | index [bp-1]*0Bh + [bp-3]; unsigned `jbe` against es:[di+2Dh] |
| 24 | L612 | 9300:00ec | `WisdomBonusSpells(c)` | AGREE | pushes [bp+8]:[bp+6] |
| 25 | L672 | a700:0049 | `t := OverlandMap[(wy+r)*44 + (wx+c)] - 1` | AGREE | [bp-5] = r+[bp+6], [bp-4] = c+[bp+8]; `*2Ch`; byte at 3648h, `dec` |

Result: **25 AGREE, 0 DISAGREE, 0 UNSURE.** Notes: sample 1 has an imprecise anchor; samples 14 and 22 use callee names that differ from the ENGINE names.

## 2. Sweeps (range L1..698)

**a) Call-argument order.** `argcheck.audit('VIEW')` (fresh run, same file hash): in this range there are 169 annotated calls, 79 OK, 0 MISMATCH and 90 UNSURE. Manual review of 14 seeded UNSURE calls with three or more arguments (seed 606), plus all resident-picture calls in the range (FillPictureRect ×4, LoadPicture, DrawPictureInto, PutPicture, LoadCombatIcon ×3, Load24x24Set ×3, PutCombatTile, DrawTile24, ProbeWall, GetWallType, AllocPicture):
- **DISAGREE (2):** both are in Put8x8Symbol (see §3). The arguments are written in reverse (Ghidra) order:
  - CA00:0249 pushes col [bp+0Eh], row [bp+0Ch], sym [bp+0Ah] (AL only), masked [bp+6], `g_5E3A[blk]`, `g_4A20`.
  - CA00:02A2 pushes col, row, `g_5E4E`.
- LoadPicture CA00:00BE `LoadPicture(g_5E3A[block], id, 1, $0D, name)` is not in Pascal order. The real push order is name, id, 1, 0Dh, @g_5E3A[block] = ENGINE `LoadPicture(name, id, maskFlags, transpColour, var pic)`. The convention line L10 states this exception explicitly and the statement's comment gives the true order, so I mark it **UNSURE (notation)**. Recommendation: write it in Pascal order like the rest of the file; argcheck cannot audit the current form.
- `HorizontalMenu('Locked. ', opts)` 6600:0EBA is abbreviated: the asm passes 7 slots (ss:prompt, 5 byte arguments, ss:var). UNSURE (incomplete argument list, not wrong).
- The other reviewed calls agree. That includes the nested-procedure calls PutCombatTile/ProbeWall, where the last push `[BP+6]` is the static link and correctly does not appear as an argument.

**b) Signed vs unsigned compares.** I tabulated every Jcc within 30h bytes of each anchor (104 statements). Signed jumps appear only in: ShortInt coordinate tests (InMap, GetPassage/GetWallType/GetCellAttr wrap, DrawAreaMap clamp, MoveParty/StepOverland wrap and clamp, ProbeSide, OutsideDeployBox), for-loop control, the signed race adjustment (9300:0358) and UpdateLevelStats. The pseudocode declares those operands ShortInt, so this is consistent. One note, no fix needed: 9300:0070 `if lvl > c^.level_main` compares two level bytes with `jge` (signed). This only differs from unsigned for levels ≥ 128, which do not occur. All Byte/Word tests use JB/JA/JBE/JAE (4B/FF/FD checks, Roll results, the `w[$592] < $FF` test). **0 DISAGREE.**

**c) Byte vs word operands.** ecl_Mem `w[...]` accesses are word compares and stores (6600:0909, 105C, a700 landmarks `w[$366] > $FD` word `jbe`). Coordinates are stored with cwde (sign extension) into the ECL words (6600:092D). Put8x8Symbol passes `sym - g_2722[blk]` to DrawPictureInto as a **byte** (AL at CA00:0226), although `sym` is a Word parameter. The pseudocode does not say so. This matters only for blocks holding more than 256 tiles (block 4 has 1Fh), so it is a note only. DrawWallPiece reads `g_0CBE`/`g_0CC0`/`g_0CD0` with byte loads from a word table, which is harmless (values < 256). **0 DISAGREE.**

**d) Folded constant array indexes.** `g_0CAA`/`g_0CAC`/`g_0CBC` = elements 0/1/9 of the word column table `g_0CAA[piece]`; `g_0CBE`/`g_0CC0`/`g_0CD0` = elements 0/1/9 of the row table `g_0CBE[piece]`. The tables are documented at L187 with the image values and the element addresses match (0CAA+2·9 = 0CBC, 0CBE+2·9 = 0CD0). `g_0C30`/`g_0C32`/`g_0C34` in DrawOverlandWindow = the x/y/tile fields of a 6-byte record table. Element index = k·6 (a700:005C..006A `shl,shl,add` = ×6), as written. **0 DISAGREE.**

**e) ABS idioms (and/jge/neg).** No `NEG` instruction occurs in ov29, ov34, ov14, ov10, ov23, ov26, ov27 or ov33. The `|raceAdj|` at L627 (9300:0358) is the only ABS-like term. It is guarded by `raceAdj < 0` (signed `jge`), so it is not a NEG idiom. **0 findings.**

**f) Pascal set tests (`in`).**
- CA00:004B `block in [0..4]`: System.@SetIn with the CS:0000 set constant. AGREE.
- 6600:08BB impassable set {4Eh, 7Eh..80h, 82h..84h, A8h..ACh, AEh..B3h, BCh, DDh..DEh, E1h..E9h, F5h}: every range compared at 08BB..08F3. AGREE.
- 6600:08F9 river `in [66h..6Ch]` or `= 72h`. AGREE.
- 6600:0300 `str_exc in [91..99]` = 5Bh..63h. AGREE.
- 6600:0BAC `travel_Mode in [2..4]`: `cmp 2 jae`, `cmp 4 jbe`. AGREE.
- 5200:018E `dir in [2, 6]`. AGREE.

**0 DISAGREE.**

**g) String length bytes.** Load8x8Set: '8x8d' + Str(DataSet) is built in a 256-byte temporary [bp-108h] via StrCopy/StrAppend (CA00:0089..009E). The error text 'Unable to load 8x8D' + Str(DataSet) + '-' + Str(id) = StrCopy plus 3 StrAppends, then WriteLn(Output = DS:8608). AGREE. The ExploreCommand option string concatenations ' Pick'/' Knock'/' Exit' (6600:0DD3..) are plain appends with no truncation logic visible. The DebugPrint (C500) separator constant is " , " (cs:0000). **0 DISAGREE.**

## 3. DISAGREE list (corrections for the VIEW owner)

1. **VIEW L235, CA00:0249 (Put8x8Symbol):** `DrawFrame(g_4A20, g_5E3A[blk], masked, sym, row, col)` has its arguments reversed. It should be `DrawPictureInto(col, row, sym, masked, g_5E3A[blk], g_4A20)`, matching the push order 0220..0245 and the ENGINE signature `DrawPictureInto(x [BP+14h], y [BP+12h], frame [BP+10h], flags [BP+0Eh], src [BP+0Ah], dst [BP+6])`. The name `DrawFrame` also collides with ENGINE 03F1:0000 DrawFrame. Optionally note that `sym` is passed as a byte (frame index = low byte).
2. **VIEW L238, CA00:02A2 (Put8x8Symbol):** `PutPicture(g_5E4E, row, col)` has its arguments reversed. It should be `PutPicture(col, row, g_5E4E)`, matching pushes 0290..029E and the ENGINE signature `PutPicture(col [BP+0Ch], row [BP+0Ah], pic [BP+6])`.

Recommendations, which are not errors:
- Write LoadPicture CA00:00BE in Pascal order and drop the L10 exception, so argcheck can audit it.
- Use the ENGINE names ShowTimedBottomPrompt (6600:0923) and AllocPicture (5200:1F0B).
- Re-anchor L26 at b100:0091.

## 4. Counts
- Sample: 25/254 statements (10 %), seed 606: **25 AGREE / 0 DISAGREE / 0 UNSURE**.
- Sweeps: **2 DISAGREE** (call-argument order, both in Put8x8Symbol); 2 UNSURE (LoadPicture notation, abbreviated HorizontalMenu); 0 findings in signed/unsigned, byte/word, folded index, ABS, set and string sweeps (2 notes).
- argcheck (range): 169 calls, 79 OK / 0 MISMATCH / 90 UNSURE.
