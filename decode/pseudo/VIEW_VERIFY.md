# VIEW — independent verification (lane por-verify2)

Inputs: `decode/pseudo/VIEW.pas.md` (sampled at SHA-256 f1ab24ed… = working-tree state with owner edits; those edits were since committed as 58dfa3b, current f3b00ed25676c388… — every DISAGREE below was re-checked against the current file and still applies), `VIEW_SCREENS.md` (2400c3307ef5c8ca…), listings ov10/14/23/25..34 + `decode/ecl/hdis.py`, captures `acceptance/ref/DECODE_CHECKS.md`. Method: herdr/assignments/por-verify.md; three independent Opus workers of this lane (A lines 1..698, B 699..end, S screens), none of which wrote VIEW.

## Summary

| step | scope | result |
|---|---|---|
| (1) argcheck | fresh VIEW_ARGCHECK.md (current file) | 252 calls: OK 84, **MISMATCH 0**, UNSURE 168; hand re-reads of 14 UNSURE + all picture calls (A) and 16 call sites (B) found 5 argument-order errors argcheck cannot see (nested/renamed calls) |
| (2) 10 % sample | seeds 606 / 707 | A 25/254 AGREE 25; B 13/126 AGREE 12, DISAGREE 1 → **38 statements: 37 AGREE, 1 DISAGREE, 0 UNSURE** |
| (3) sweeps | call order, signed/unsigned, byte/word, folded indexes, ABS, set tests, string length | call order 7 DISAGREE (incl. both cross-lane claims CONFIRMED: Show3DSprite, ListItem), 1 naming, 1 semantic; all other classes AGREE |
| (4) screens | 15 rows VIEW_SCREENS | AGREE 14, DISAGREE 1 (VIEW-12); captures VIEW-01/02/05/06/09 consistent; #ref-1/#ref-2 reflected |

**DISAGREE → fix requests** (STATUS.md, owner por-mod-view):
- **#verify-15** L235, CA00:0249: `DrawFrame(g_4A20, g_5E3A[blk], masked, sym, row, col)` → `DrawPictureInto(col, row, sym, masked, g_5E3A[blk], g_4A20)` (pushes 0220..0245; ENGINE signature x [BP+14h] … dst [BP+6]; name DrawFrame collides with 03F1:0000; sym passed as a byte).
- **#verify-16** L238, CA00:02A2: `PutPicture(g_5E4E, row, col)` → `PutPicture(col, row, g_5E4E)`.
- **#verify-17** L704, AC00:0047: `PutPicture(pic, row, col)` → `PutPicture(col, row, pic)`.
- **#verify-18** L755, AC00:0708 Show3DSprite: signature → `(k [BP+0Ah]: Byte; anim: TAnim [BP+6])` (record by far pointer, copied 42h bytes, RETF 6) — COMBAT-lane claim confirmed.
- **#verify-19** L881, 9D00:0000 ListItem: signature → `(n [BP+0Ah]: Integer; list: ^TMenuItem [BP+6])`; calls L940 → `ListItem(top, list)`, L971 → `ListItem(index, list)` — PARTY-lane claim confirmed.
- **#verify-20** L940, 9D00:07CA DrawList: `ClearRectangle(left, top, right, bottom)`.
- **#verify-21** L948, 9D00:0D9A VerticalListMenu: colours `headerColour [BP+24h], normalColour [BP+22h], selColour [BP+20h]` (text calls [24h] selColour).
- **#verify-22** L893, 9D00:03E5 HorizontalMenu: `haveOpts := (textColour <> 0) or (hotColour <> 0)` (asm 03EF..0401), not `options <> ''`; Enter accepted iff set (05B2).
- **#verify-23** L767 (C000:005F) and L212/L230 (CA00:012A/01E9): `Halt` → `TerminateGame` (0899:0000).
- **#verify-24** VIEW_SCREENS VIEW-12: only if g_49F7 <> 0: row 0 cleared, `a , b , c` (decimal) at (0,0) colour 0Eh; message on the bottom line colour 0Eh with a key wait; row 0 cleared afterwards.

Recommendations (no verdict): use ENGINE names ShowTimedBottomPrompt (6600:0923), AllocPicture (5200:1F0B); re-anchor L26 at b100:0091; 6600:0EBA HorizontalMenu written with 2 of 7 args (UNSURE for argcheck).

---

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

---

# VIEW verification part B — VIEW.pas.md lines 699..1043 (ov28, ov32, ov30, ov25, ov31, inits, open items, self-check)

Verifier: por-verify2 fork (independent; did not write VIEW). Input: `decode/pseudo/VIEW.pas.md` **as-is in the working tree, including the owner's uncommitted edits**, SHA-256 `f1ab24ed62f72df9824aec041ad2c72768d294cbb79f2b15de38cd17d65e6fc7` (1043 lines).
Evidence: `decode/listings/ov28|ov32|ov30|ov25|ov31.lst` and `python -I decode/ecl/hdis.py ovNN START END` (image bytes). Set constants were dumped from `decode/bin/ghidra/ov25.bin`.

## 1. Seeded random sample (seed 707)

Population: 126 lines at or after line 699 that carry a `{ seg:off }` anchor. Sample: 13 lines (≈10 %), `random.seed(707); random.sample(lines, 13)`.

| line | address | statement (abridged) | verdict | evidence |
|---|---|---|---|---|
| 704 | AC00:0000/0047/002F | DrawPictureScreenOrView: nil → nothing; toView=false → `PutPicture(pic, row, col)`; else DrawPicture at (row−1, col−1) + FlushView | **DISAGREE** (call written with arguments reversed) | ac00:003b..0047 pushes `[BP+0Eh]` (col), `[BP+0Ch]` (row), then pic → `PutPicture(col, row, pic)` (ENGINE 0464:1951 `PutPicture(col [0Ch], row [0Ah], pic [6])`). The branch logic, the nil test and the true branch `DrawPicture(col−1, row−1, 0, 1, pic, g_4A20)` + FlushViewDirtyLines (ac00:0011..0034) agree. |
| 709 | AC00:00C6/00D0 | LoadAnimation signature; skip the load when the same name/id is already loaded | AGREE | StrAssign(name, 8) at 00b7; StrCompare with g_6B0A at 00c6; `id [BP+0Ch]` cmp g_6B1C at 00d0; jump to the end at 00d6. |
| 792 | C000:04F1 | `FUN_0899_0104;` | AGREE | `lcall 0899:0104` at 04f1, after the last RecolorPicture. |
| 865 | B600:0B35 | `tg_Count := tg_Count + 1` | AGREE | `inc byte [671A]`, inside `if found` ([bp-7] ≠ 0, 0b2c). |
| 886 | 9D00:00F4/012B | ParseOptions: an option starts at every character of the set (CS:00AB) `['0'..'9','A'..'Z']`; optCount at `[BP-8Eh]` | AGREE | Set bytes at ov25:00AB = `0123456789A..Z` (dumped). Loop 0118..0193: char in the set → first option fills start[k]; later ones close end[k] := i−2 and open k+1. optCount written to parent ss:[−8Eh] at 01af. |
| 888 | 9D00:0273..0305 | DrawOptions: hotkey-set characters outside `sel` use hotColour `[BP+0Eh]`, other letters textColour `[BP+10h]` | AGREE | Set ov25:01BA = `0..9A..Z`; 0285..0294 SetIn → parent `[+0Eh]` (02b0); else parent `[+10h]` (02eb); DrawRepeatedGlyph(col = prompt length + i − 1, 18h, colour, 1, ch, 1). |
| 895 | 9D00:040F/0418 | `if menu_Sel > optCount then menu_Sel := 1` | AGREE | `cmp al,[bp-8Eh]; jbe` (unsigned byte), `mov [6B2B],1`. |
| 912 | 9D00:0580 | `#0: key := ReadKey; if allowExt then (ext := true; done := true)` | AGREE | 0580 second ReadGameKey; `[BP+0Ch]` allowExt tested; ext^ := 1, done [bp-63h] := 1. Without allowExt the loop continues (done stays 0). |
| 915 | 9D00:05C4..05E2 | ',' : wrap to optCount when 1, else Dec; DrawOptions | AGREE | 05c4..05e2 exactly as written. |
| 920 | 9D00:0628 | `if key = ' ' then done := true` | AGREE | `cmp [bp-60h],20h` after SetIn of CS:037D = `' ',0..9,A..Z` (dumped). |
| 955 | 9D00:0EE4 | `if redraw then DrawList(menu_Top); redraw := false` | AGREE | 0ed5 tests redraw^, 0ede push menu_Top, 0ee4 call DrawList, 0eea redraw^ := 0. |
| 1001 | BB00:04BE | CellAt: outside 50×25 → both 0; else tile := grid[row,col], occupant := cm_Occupant[row*50+col] | AGREE | Signed bounds (jl/jg) `[BP+10h]` 0..31h, `[BP+0Eh]` 0..18h; tile = cm_Map^[7 + row*50 + col] → `[BP+6]`; occupant = [60DB + row*50 + col] → `[BP+0Ah]`; `retf 0Ch`. |
| 1011 | BB00:09D7 | FocusSquare: target := (col,row) + step[dir]; `if ScrollToShow(target, margin)` … | AGREE | 099c..09c7 col + g_2736[dir], row + g_273F[dir] (signed cwde); pushes tx, ty, margin; call 07d4. |

**Sample result: 12 AGREE, 1 DISAGREE, 0 UNSURE.**

## 2. Targeted sweeps (the whole range)

### 2a. Known claims from other lanes
| claim | verdict | evidence |
|---|---|---|
| COMBAT: Show3DSprite has its 2 parameters swapped; correct is `(k, anim)` | **CONFIRMED — DISAGREE with VIEW.pas.md line 755** | ac00:070e copies 42h bytes from the far pointer at `[BP+6]` (anim); `k` is the byte at `[BP+0Ah]` (range test 0721..072b, index 074e/0761/0793); `retf 6`. Pascal order is therefore `Show3DSprite(k [BP+0Ah]: Byte; anim: TAnim [BP+6])`, not `anim [BP+8]; k [BP+6]`. Caller ov07 4300:05cc..05d5 pushes k (`[bp-9]`, or 2 at 05dc) first, then @g_6ABE, which matches ECL.pas.md `Show3DSprite(size, g_6ABE)`. |
| PARTY: ListItem argument order reversed (bytes 9D00:000B/0022) | **CONFIRMED — DISAGREE with VIEW.pas.md line 881** | 9d00:000b..0014 loads the list pointer from `[BP+6]:[BP+8]`; the counter is compared with `[BP+0Ah]` (0022, 0040); `retf 6`. Correct: `function ListItem(n [BP+0Ah]: Integer; list: ^TMenuItem [BP+6]): ^TMenuItem`. The same reversed form is used at lines 940 (`ListItem(list, top)`) and 971 (`ListItem(list, index)`). Not fixed in the current working tree. |

### 2b. Call-argument order (the calls in the range, checked against the pushes)
| site | pseudo | verdict | evidence |
|---|---|---|---|
| AC00:0069 / 008C | DrawHead/DrawBody → `DrawPictureScreenOrView(col, row(+5), false, pic)` | AGREE | pushes [0Ch], [0Ah](+5), 0, pic. |
| AC00:053B | DrawTitledFrame "rows 1..0Bh, cols 1Ch..26h" | AGREE | pushes 1Ch, 1, 26h, 0Bh, 0, 0, '' = (x1, y1, x2, y2, style, colour, title) per ENGINE 03F1:02E8. |
| AC00:05BB | LoadPortrait(head, body) | AGREE | g_286F[+BBh] pushed before g_287D[+BCh]. (The two `Str(…:3)` results at 056c/0593 go into temporaries that are never used; harmless.) |
| AC00:07AC | Show3DSprite draws at text cell (`pic^.y + 2`, `pic^.x + 2`) | AGREE (as (row, col)) | pushes `[pic+4]+2` (= x, see ac00:02c2 `+4` ← x and 02e2 `+6` ← y) as col, then `[pic+6]+2` as row, then 0, 1, pic, g_4A20. |
| C000:0083 | `LoadPicture(tmp, 1, 0, 0, name)` | AGREE (VIEW readability convention) | push order is name, 1, 0, 0, @tmp; VIEW's header documents the reversed writing. The same holds for every LoadPicture of LoadPortrait/LoadCombatIcon (e.g. c000:0297..02b2: id, 1, 0, @g_5E5A[slot*8]). |
| C000:011D / 0145 | DrawTile24 → DrawPictureInto(col, row, frame, 0, set, view) | AGREE | pushes [0Ch], [0Ah] (signed cwde), tile (and 7Fh), 0, set, g_4A20; tile > 7Fh → TileSetHi (unsigned jbe). |
| C000:062B | DrawIconAt → DrawPicture(col*3, row*3, 0, 1, tmp, view) | AGREE | pushes [0Eh]*3, [0Ch]*3, 0, 1, tmp, g_4A20. (Not written: early exit when `g_5E5A[slot*8+pose*4] = nil`, c000:0522.) |
| B600:0AA2 | `InFrontArc(ac[k], ar[k], tc[m], tr[m], dir)` | AGREE | pushes [bp−0Fh+k], [bp−13h+k], [bp−17h+m], [bp−1Bh+m], [BP+0Ch]. |
| B600:0AF5 | `TraceLine(ac[k], ar[k], x, y, d, map)` | AGREE | pushes ac, ar, @x [bp−8], @y [bp−9], @d [bp−1Dh], map. `d < best` is an unsigned word compare (jae 0b06). |
| BB00:0206 / 0239 | `DrawTile24(sc*3, sr*3, CombatTerrain[grid].frame, 0)`, `DrawIconAt(sc, sr, 0, 0, $19)` | AGREE | frame = [2747 + 4*tile] (field +3 of the 4-byte CombatTerrain record); DrawIconAt pushes col, row, 0, 0, 19h. |
| BB00:100E | `PlayOrStopSound(g_261E)` | AGREE | `push word [261E]`. |
| BB00:00F3 / 00FE | PaletteFlashOn "(8,0 / 0,8)" | UNSURE (order of the two calls) | The calls are SetEgaPaletteRegister(index 0, colour 8), then (8, 0). The text lists 8,0 first; the net effect (swap 0↔8) is the same. PaletteFlashOff (0,0),(8,8) agrees. |
| 9D00:070A | ClearMenuLine = `ClearGlyphRun(0, 24, 0, 40)` | AGREE | pushes 0, 18h, 0, 28h. |
| 9D00:07CA | DrawList: `ClearRectangle(bottom, right, top, left)` | **DISAGREE** | pushes parent [+1Eh] left, [+1Ch] top, [+1Ah] right, [+18h] bottom → `ClearRectangle(left, top, right, bottom)` (ENGINE: x1, y1, x2, y2). |
| 9D00:0FDD | VerticalListMenu → `HorizontalMenu(prompt, opts, c?, c?, c?, true, false, ext)` | AGREE (c? can be resolved) | pushes prompt, opts, [BP+24h], [BP+22h], [BP+20h], 1, 0, @ext → promptColour = [24h], textColour = [22h], hotColour = [20h]. |
| 9D00:111B | AskYesNo → `HorizontalMenu(prompt, 'Yes No', c1, c2, c3, false, false, ext)`; until key in ['N','Y'] | AGREE | pushes [0Ah], [8], [6], 0, 0; set CS:10B1 = {N, Y} (dumped). |

### 2c. Parameter naming vs. use
- **DISAGREE — VerticalListMenu signature (line 948):** it calls `[BP+24h]` `selColour`. The body (and VIEW's own DrawList and DrawItemSelected text) uses `[BP+24h]` for **header** items (9d00:0829 isHeader ≠ 0 → 083f `[+24h]`; DrawItemNormal 0a85), `[BP+22h]` for normal items (085f, 0ad7) and `[BP+20h]` for the **selected** item (DrawItemSelected 09dc). Correct naming: `headerColour [BP+24h], normalColour [BP+22h], selColour [BP+20h]`.

### 2d. Signed vs unsigned compares
All checked sites agree: CellAt bounds signed (jl/jg on ShortInt); FootprintCell `dx >= 0` signed (bb00:0059 jl); LineStep/LineInit `adx > ady`, `err < 0` signed (b600:0246 jle, 02f5 jg, 031c jl); Sign uses jge/jle; menu_Sel/optCount unsigned byte (jbe 0416); Load24x24Set `start > $7F` unsigned (c000:0041 jbe); DrawTile24 `tile > 7Fh` unsigned (c000:00f8 jbe); Show3DSprite `k in 1..3` unsigned (ac00:0725 jb, 072b jbe); VerticalListMenu `count − pageSize > menu_Top` and `menu_Top > firstSel` signed word (9d00:0f21, 0f59 jle).

### 2e. Byte vs word operands
Agree: tg_Count is a byte (`inc byte [671A]`); TLine fields are words, sx/sy/dist bytes at +12h/+13h/+18h (b600:01b2, 01ff, 0219); menu_Top is a word (9d00:0f1d); CellAt results are bytes.

### 2f. Folded constant array indexes
Agree: `g_5E5A[slot*8 + pose*4]` (c000:0502..051a); `CombatTerrain[t]` stride 4, frame at +3 = g_2747 (bb00:01fe); FootprintCell `g_2844/g_2845[size*8 + k*2]` (bb00:0028/0048); tg_List stride 3 at g_6718 (b600:0b41..0b49); `cm_Map^.grid` = byte offset 7 + row*50 + col (bb00:04f0).

### 2g. ABS idioms
Agree: LineInit `L.adx := Abs(L.x1 − L.x0)`, `L.ady := Abs(…)` are `cwd; xor ax,dx; sub ax,dx` (b600:01c4, 01de). Sign B600:0000 is an explicit jge/jle function, not an inline idiom.

### 2h. Pascal set tests
All set constants dumped from the image agree with the text: CS:00AB and CS:01BA = `['0'..'9','A'..'Z']`, CS:037D = `[' ','0'..'9','A'..'Z']`, CS:10B1 = `['N','Y']`.

### 2i. String length-byte handling
Agree: LoadAnimation `name: string[8]` (StrAssign 8, ac00:00b7); Load24x24Set name StrAssign 0FFh (string[255]); LoadCombatIcon `UpCase(name[Length(name)])` reads the length byte as the index (c000:0230..0238) and `Copy(name, 1, Length − 1)` (025a..0262). Note (not wrong in the text): VerticalListMenu builds `opts` in a string[40] (StrAssign 28h, 9d00:0f44/0f7c/0fb1), so ' Next'/' Prev'/' Exit' are silently truncated when the options string is long — a port should keep the 40-character limit.

### 2j. Other
- **DISAGREE (minor) — Load24x24Set line 767:** `… WriteLn('Start range error in Load24x24Set'); Halt`. The code calls `TerminateGame` (0899:0000, c000:005f), which restores the sound and video state before it halts. Show3DSprite's error path (ac00:0749) also calls TerminateGame (the text only says "fatal", which is acceptable).
- TraceLine: `maxSteps := range` with the loop test `L.dist <= maxSteps*2 + 1` is equivalent to the code's `maxSteps := range*2 + 1` (b600:042b..0431) — AGREE.

## 3. DISAGREE list with corrections (for por-mod-view)

1. **Line 755, AC00:0708 Show3DSprite**: signature → `procedure Show3DSprite(k [BP+0Ah]: Byte; anim: TAnim [BP+6])` (value record passed by far pointer, copied 42h bytes; `retf 6`).
2. **Line 881, 9D00:0000 ListItem**: signature → `function ListItem(n [BP+0Ah]: Integer; list: ^TMenuItem [BP+6]): ^TMenuItem`; also rewrite the calls at line 940 → `ListItem(top, list)` and line 971 → `ListItem(index, list)`.
3. **Line 940, 9D00:07CA DrawList**: `ClearRectangle(bottom, right, top, left)` → `ClearRectangle(left, top, right, bottom)`.
4. **Line 948, 9D00:0D9A VerticalListMenu**: colour parameters → `headerColour [BP+24h], normalColour [BP+22h], selColour [BP+20h]`; optionally resolve line 961 to `HorizontalMenu(prompt, opts, headerColour, normalColour, selColour, true, false, ext)`.
5. **Line 704, AC00:0047 DrawPictureScreenOrView**: `PutPicture(pic, row, col)` → `PutPicture(col, row, pic)`.
6. **Line 767, C000:005F Load24x24Set**: `Halt` → `TerminateGame` (0899:0000).

## 4. Counts
- Sample (seed 707, 13 of 126 anchored lines): **AGREE 12, DISAGREE 1, UNSURE 0**.
- Sweeps: 2 cross-lane claims (both CONFIRMED as VIEW errors); 16 call sites (13 AGREE, 1 DISAGREE, 1 UNSURE, 1 AGREE with resolvable colours); 1 naming DISAGREE; 1 minor semantic DISAGREE; all signedness, width, index, ABS, set and string-length checks AGREE.
- **Distinct DISAGREE items: 6** (listed in §3).

---

# VIEW_SCREENS verification (lane por-verify2, step 4)

Input: `decode/pseudo/VIEW_SCREENS.md` as found in the working tree, SHA-256 `2400c3307ef5c8cac34069a1b4080331dd6438f5f25759f8a090007ff29597b3` (no uncommitted diff vs HEAD for this file at check time; VIEW.pas.md has uncommitted owner edits).
Method: every row re-read against the asm (`python decode/ecl/hdis.py ov14|ov10|ov25|ov28|ov33|ov34 START END`, listings `ov*.lst` `[ps]` literals): push sequences of HorizontalMenu / DrawText / DrawTitledFrame / ShowTimedBottomPrompt, branch conditions. Captures: `acceptance/ref/DECODE_CHECKS.md` (VIEW-01, -02, -05, -06, -09).
HorizontalMenu 9D00:03BD parameter roles (asm): promptColour [BP+12h], textColour [BP+10h], hotColour [BP+0Eh]; `haveOpts` (Enter accepted) = `(textColour <> 0) or (hotColour <> 0)` (9D00:03EF..0401).

| screen id | claim | verdict | code evidence | capture evidence |
|---|---|---|---|---|
| intro | menu roles prompt/text/hot; ExploreCommand 0Dh/0Ah/0Fh (green letters, white hot keys/selection); keys hot letter, `,`/`.`, Enter, Esc #0, Space #32, ext + keypad 1..9 | AGREE (note) | 6600:09BC..09C2 pushes 0Dh,0Ah,0Fh → prompt 0Dh, text 0Ah, hot 0Fh (#ref-2 text applied); 9D00:059F Esc→#0, 0628 Space, 05C4/05E8 `,`/`.`, 06A0..06BD keypad. Note: Enter returns #13 only when text or hot colour ≠ 0 (always true for the callers seen). VIEW.pas.md 9D00:03E5 writes `haveOpts := options <> ''` — wrong, see below | VIEW-01: white hot keys / green letters |
| VIEW-01 | 88×88 view at pixel (24,24) = cell (3,3); backdrop, walls, frames; menu `Area Cast View Encamp Search Look`; A C V E S L, ↑ step, ↓ turn around, ←/→ turn, other keys select member | AGREE | g_04B6 'Area Cast View Encamp Search Look' (6600:09B7); 09EC A, 0A3D C (only if SelectedChar^.status = 0), 0A4D V, 0A5E S, 0A79 L; 0AB2 Up, 0ADE Down +4, 0B14 Left +6, 0B59 Right +2; 0B89 CycleSelectedChar. #ref-1 origin (24,24) applied | VIEW-01 (ref-1/ref-2 applied in this text) |
| VIEW-02 | 'A' when w[1F6h]=0 toggles area map: 11×11 symbols 104h..113h + arrow 100h..103h; A returns | AGREE | 6600:09EC..0A0D; B100:0000 DrawAreaMap (Put8x8Symbol 104h + wall bits, arrow (dir shr 1)+100h) | VIEW-02 AGREE |
| VIEW-02a | `Not Here`, colour 0Eh | AGREE | 6600:0A14..0A26 ShowTimedBottomPrompt('Not Here', 0Eh) | — |
| VIEW-03 | `Locked. ` + Bash / Pick (thief) / Knock (Knock caster; state 3: magic-user) / Exit; only Exit → closed | AGREE (note) | 6600:0DB9 Bash only if door_CanBash; 0DD3/0DDA Pick if door_CanPick and PartyHasClass(6); 0E0D/0E14 Knock if door_CanKnock and caster of spell 1Fh; 0E77 `opts = ' Exit'` → ClosePassage; 0E9A..0EBA HorizontalMenu('Locked. ', opts, 0Dh,0Ah,0Fh, 0, 0); B/P/K compared 0EC5..0EDF | — |
| VIEW-04 | overland 5×5 squares, ICON 0..2 → slots 9..11; menu `Cast View Encamp Search Look`; arrows set facing and move | AGREE | 6600:0BBA..0C0A LoadCombatIcon('ICON',0..2,9..11) when g_49F9 < 2; 0C40 g_04DF; 0CC8 facings 0/2/4/6, done → MoveParty/StepOverland | — |
| VIEW-04a | `The river's stench drives you back.` colour 0Eh when w[344h]=0 | AGREE | 6600:0909 `cmp w[344h],0`, 0916..0923 ShowTimedBottomPrompt(…, 0Eh) | — |
| VIEW-05 | `A battle begins...` colour 0Ah row 18h | AGREE | 5200:1E69..1E81 DrawText(0, 18h, 0Ah, 'A battle begins...') = (0,24), after ClearMenuLine + MessageDelay (1E5F/1E64) | VIEW-05 AGREE (0,24) |
| VIEW-06 | 7×7 squares, icons, cursor | AGREE (capture) | combat lane; geometry not re-derived here | VIEW-06 AGREE |
| VIEW-07 | frame rows 1..0Bh, cols 1Ch..26h; HEAD at (1,1Ch); BODY 5 rows below | AGREE (note) | AC00:051A..053B DrawTitledFrame(1Ch,1,26h,0Bh,0,0,''); 05BE DrawPortrait(1Ch,1,1); AC00:007E DrawBody row+5. Note: "(1, 1Ch)" is (row, col), while the rest of the file uses (col,row) ("cell (3,3)" symmetric) — state the order | — |
| VIEW-08 | PIC/FINAL at (3,3) animated while a menu waits; 3D sprites distance 1..3 | AGREE | 9D00:04CC DrawPicture(3,3,…) in the HorizontalMenu wait loop; ShowEncounter 4300:056C size = dist+1 (1..3) | — |
| VIEW-09 | list in caller window, headers unselectable, selection colour; bottom menu options + ` Next`/` Prev` + ` Exit`; letters, Home/End, PgUp/PgDn or N/P, Enter, Esc/E | AGREE (note) | 9D00:0FC5..0FDD HorizontalMenu(prompt, opts, [24h],[22h],[20h], allowExt 1, 0); 0FF7 47h Home / 1005 4Fh End MoveSelection; 1013/1028 49h/51h PageList; 1040/104E 'P'/'N'; 105C..1064 #27/'E'/#0 → nil. Note: the cursor-up/down scan codes 48h/50h are not handled (only Home/End move; keypad 7/1 map to Home/End) | VIEW-09 AGREE |
| VIEW-10 | `Yes No`, default No, only Y/N | AGREE | 9D00:10EA menu_Sel := 2; 10F9 'Yes No'; 1125 set CS:10B1 = {'N','Y'} (bytes 10BA=40h, 10BC=02h) | — |
| VIEW-11 | fatal load errors written to Output, key wait, halt | AGREE | literals B100:0DC1, B100:10A6, CA00:0025 (+ set + '-' + id, CA00:00EB..010B), CA00:013A, C000:0000 'Start range error in Load24x24Set', AC00:06E9; CA00:00D8 RestorePreviousVideoMode, 0113 WriteStr/WriteLn, 011D ReadGameKey, 012A TerminateGame | — |
| VIEW-12 | debug line: message line colour 0Eh `a , b , c` then the message | **DISAGREE** | C500:0079..00CE: ClearTextRectangle(0,0,27h,0) then DrawText(**0,0**,0Eh, Str(a)+' , '+Str(b)+' , '+Str(c)) — the numbers go to the **top row 0**, not the message line; C500:00D3..00DB ShowBottomPromptAndReadKey(0Eh, msg) shows the message on row 24 **and waits for a key**; C500:00E6..00EC clears row 0 again | — |

## DISAGREE list (corrections for por-mod-view / VIEW_SCREENS.md)
1. **VIEW-12:** → "only if g_49F7 <> 0: row 0 cleared, `a , b , c` (decimal) at (0,0) colour 0Eh; the message on the bottom line colour 0Eh with a key wait; row 0 cleared afterwards".

Other findings (VIEW.pas.md, not screen rows; for por-mod-view):
- 9D00:03E5 HorizontalMenu: `haveOpts := options <> ''` is wrong — asm 9D00:03EF..0401 sets it to `(textColour [BP+10h] <> 0) or (hotColour [BP+0Eh] <> 0)`; Enter (#13) is accepted iff that flag is set (9D00:05B2).
- Notes for the build (AGREE rows): VIEW-07 coordinate order (row, col); VIEW-09 has no up/down-arrow handling; VIEW-01 'C' works only when the selected member's status = 0; VIEW-03 Bash only when door_CanBash.

## Counts
15 rows (intro + VIEW-01, 02, 02a, 03, 04, 04a, 05, 06, 07, 08, 09, 10, 11, 12): **AGREE 14**, **DISAGREE 1** (VIEW-12), UNSURE 0. Captures consulted: VIEW-01 (#ref-1 origin (24,24) and #ref-2 colour roles are reflected in the current text), VIEW-02, VIEW-05, VIEW-06, VIEW-09 — all consistent.

---

