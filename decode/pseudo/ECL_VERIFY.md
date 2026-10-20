# ECL — independent verification (lane por-verify2)

Inputs: `decode/pseudo/ECL.pas.md` (SHA-256 fc1f913c4e42066c…), `ECL_SCREENS.md` (eb5ec29a148c59c1…), `decode/ecl/ECL_VM.md`, listings ov03/ov07 + `decode/ecl/hdis.py`, script FINALs `decode/ecl/scripts/*.md` vs `decode/ecl/listings/*.ecl.txt`, captures `acceptance/ref/DECODE_CHECKS.md`. Method: herdr/assignments/por-verify.md; three independent Opus workers of this lane (A ov03 lines 20..1253, B ov07 lines 1254..end + script sample, S screens), none of which wrote ECL.

## Summary

| step | scope | result |
|---|---|---|
| (1) argcheck | fresh ECL_ARGCHECK.md | 552 calls: OK 202, **MISMATCH 0**, UNSURE 350. Hand re-reads: ov03 22 multi-argument UNSURE calls + all 40 `v(n)` operand indexes, ov07 all 111 UNSURE calls — 3 call-order errors argcheck could not see (D1, D4, D8) plus 1 header error (D5). |
| (2) 10 % sample | seeds 404 (ov03) / 505 (ov07) | ov03 76/752 AGREE 76; ov07 40: AGREE 38, DISAGREE 2 → **116 statements: 114 AGREE, 2 DISAGREE, 0 UNSURE** |
| (3) sweeps | call order, signed/unsigned, byte/word, folded indexes, ABS, set tests, string length | signed jumps (3, all in Surprise) correctly signed; 13 byte reads, 21 folded indexes, 12 set ranges, 15 string capacities all agree; no NEG/ABS idioms in ov03/ov07 |
| scripts | 3 FINAL scripts, seed 505: ECL2_20, ECL3_14, ECL8_27 | all 2,014 listing lines byte-identical to the raw .bin records; 280 sampled statements (≥10 % each) AGREE; 15 prose claims: 14 AGREE, 1 UNSURE (signedness of 6E70) |
| (4) screens | 18 rows ECL_SCREENS | AGREE 10, **DISAGREE 8** (02, 05, 07, 08, 12, 13, 15, 16), UNSURE 0; 9 rows with captures all consistent (DISAGREEs are unexercised branches / #ref-3 wording) |

**DISAGREE → fix requests** (STATUS.md; owner por-mod-ecl, D3 por-ecl/ECL_VM.md):
- **#verify-6 (D1)** ECL.pas.md L732, 2F00:1CCD: `MakeTreasureItem(typ, item)` (type pushed first).
- **#verify-7 (D2)** ECL.pas.md L1963, 4300:20E6: `Str(dmg, num)` width 0 into `num: string[3]` (3 = capacity; no padding, ≥ 1000 keeps first 3 digits) — also ECL-13.
- **#verify-8 (D3)** ECL_VM.md L109: AND/OR does compare(0, result) (bytes + the spec's own corrected 2F row), not compare(result, 0).
- **#verify-9 (D4)** ECL.pas.md 4300:0C0F/0C32/0C55: `LoadWallSet(v and $7F, 1/2/3)` (id pushed first; signature (id, slot)); drop the "LoadWallSet(slot, id)" comment.
- **#verify-10 (D5)** ECL.pas.md L1792 ecl_CompareWords header: the AND/OR call (2F00:0E47) is (0, r) (body at L434 already right).
- **#verify-11 (D6, minor)** ECL.pas.md 4300:0396: `Str(DataSet, ds)` (width 0, ds: string[1]); same output.
- **#verify-12 (D7, comment)** ECL.pas.md 4300:15B0 MenuHotkeys: +20h also maps digits '0'..'9' to 'P'..'Y', not only lower case.
- **#verify-13 (D8)** ECL.pas.md 2F00:1215: pushes are prompt, menu, 0Dh, colB, colA, single, hilite → `MenuSelect(prompt, menu, $0D, colB, colA, single, hilite)`.
- **#verify-14 (screens)** ECL_SCREENS: ECL-02/08 frame colour = empty-title colour only, call clears (3,3)-(13,13), border one cell outside (#ref-3 class); ECL-05 non-hotkey letters/Space/Esc ignored, digits 1..9 = keypad cursor → CycleSelectedChar, 0FFh only for a displayed non-`~` capital; ECL-07 typed text white 0Fh (0Ah = empty prompt), Esc returns text, upper-cased; ECL-12 add "no monsters, no duel, no shop/temple flag → AfterCombat directly"; ECL-13 no padding, party-dead text at (1,1), clear erases the "The END!" title; ECL-15 "Select" only (allowExit 0), S/Enter select, Esc does nothing; ECL-16 EXIT's frame redraw clears (1,1)-(15,15), erasing PRINT_MEM text.

Notes (no verdict): ECL.pas.md L1013 `RebuildEquipmentDerivedState` = published `RecalcCharacter` (00BA:0BB8); L698 treasure roll 48/49 matches no branch and keeps the previous type (worth a quirk note).

---

# ECL verify — part A: ECL.pas.md ov03 (2F00) parts A/B/C, lines 20..1253 (lane por-verify2)

Verifier: por-verify2 (independent; did not write ECL). Evidence: `decode/listings/ov03.lst` and `python -I -X utf8 decode/ecl/hdis.py ov03 START END` (image bytes); spec `decode/ecl/ECL_VM.md`.
Population: 752 anchored statements in lines 20..1253. Sample: `python -I -X utf8 decode/tools/pseudo_check.py <lines 20..1253> ov03 76 404` = **76 statements (10.1 %), seed 404**. Each was read against the asm at its anchor plus the surrounding instructions (locals mapped to BP offsets from the routine headers and preceding stores).

## 1. Sample (seed 404)

| address | statement | verdict | evidence |
|---|---|---|---|
| 2f00:04f8 | `pic := Byte(ecl_OperandValue(3));` | AGREE | asm at anchor matches (operands/offsets/branch sense) |
| 2f00:1b1b | `until ofs >= size;` | AGREE | CMP [BP-67h],[BP-69h]; JNC exit = unsigned ≥ |
| 2f00:0040 | `DrawTitledFrame(3, 3, $0D, $0D, 0, $0F, '');` | AGREE | pushes 3,3,0D,0D,0,0F + StrCopy(cs:0 = '') → DrawTitledFrame (0040..0061) |
| 2f00:25da | `title := ' ';` | AGREE | MOV [BP-0Bh],20h = Char; converted by @CharToStr at 260F (title is a Char local turned into a string later) — semantics equal |
| 2f00:056e | `p := p^.next;` | AGREE | asm at anchor matches (operands/offsets/branch sense) |
| 2f00:3266 | `DrawTitledFrame(3, 3, $0D, $0D, 0, $0A, '');` | AGREE | pushes 3,3,0D,0D,0,0A,'' (3266..3287) |
| 2f00:2be5 | `RebuildEquipmentDerivedState(SelectedChar);` | AGREE | call is 00BA:0BB8 = RecalcCharacter (engine_names.json); pseudo uses another name (naming only, see sweep note N1) |
| 2f00:058c | `p^.next := nil;` | AGREE | asm at anchor matches (operands/offsets/branch sense) |
| 2f00:1595 | `avgV := sum div n;` | AGREE | [BP-0Fh] := word [BP-4] DIV byte [BP-1Ah] (unsigned DIV) |
| 2f00:0826 | `Dec(Mem[$6DC1]);` | AGREE | DEC word ecl_Mem6B00^+582h = VM word 6B00+2C1h = 6DC1 |
| 2f00:1a7b | `TerminateGame;` | AGREE | asm at anchor matches (operands/offsets/branch sense) |
| 2f00:05c6 | `p^.next := newRec;` | AGREE | asm at anchor matches (operands/offsets/branch sense) |
| 2f00:0114 | `ecl_ReadOperands(1);` | AGREE | asm at anchor matches (operands/offsets/branch sense) |
| 2f00:2ef8 | `DrawRepeatedGlyph(text_Col, text_Row, $0F, 1, g, 0);` | AGREE | pushes text_Col, text_Row, 0Fh, 1, [BP-6], 0 → DrawRepeatedGlyph |
| 2f00:31aa | `ecl_Stop := false;` | AGREE | asm at anchor matches (operands/offsets/branch sense) |
| 2f00:2212 | `0: if choice = 2 then begin` | AGREE | r=[BP-43Ah]=0 → CMP [BP-1],2: ≠2 → SetMem(dest,1) at 2220; =2 → minMove [BP-40Bh] vs fleeLimit [BP-407h] JB (unsigned) |
| 2f00:0524 | `LoadCombatIcon(name, pic, enc_NextIconSlot);` | AGREE | asm at anchor matches (operands/offsets/branch sense) |
| 2f00:26e5 | `ecl_FlagEQ := 1; ecl_FlagNE := 0; found := true` | AGREE | asm at anchor matches (operands/offsets/branch sense) |
| 2f00:0080 | `FillChar(g_84C8, 2, 0);` | AGREE | asm at anchor matches (operands/offsets/branch sense) |
| 2f00:0aa6 | `if ecl_GosubSP <> nil then begin` | AGREE | asm at anchor matches (operands/offsets/branch sense) |
| 2f00:2f30 | `case ecl_CurOp of` | AGREE | asm at anchor matches (operands/offsets/branch sense) |
| 2f00:2b2c | `g_84DE := 1;` | AGREE | asm at anchor matches (operands/offsets/branch sense) |
| 2f00:317a | `ecl_Stop := false;` | AGREE | asm at anchor matches (operands/offsets/branch sense) |
| 2f00:0af3 | `FillChar(ecl_FlagEQ, 6, 0);` | AGREE | asm at anchor matches (operands/offsets/branch sense) |
| 2f00:0b60 | `$16: if ecl_FlagEQ = 0 then ecl_SkipInstruction;` | AGREE | asm at anchor matches (operands/offsets/branch sense) |
| 2f00:08a7 | `if p <> $FF then begin` | AGREE | asm at anchor matches (operands/offsets/branch sense) |
| 2f00:24ba | `4: if Mem[6DC1] = 0 then ecl_SetMem(dest, 3)` | AGREE | asm at anchor matches (operands/offsets/branch sense) |
| 2f00:34ea | `if ecl_Restart then ecl_RunAfterNewBlock` | AGREE | asm at anchor matches (operands/offsets/branch sense) |
| 2f00:0806 | `SelectedChar := savedSel;` | AGREE | asm at anchor matches (operands/offsets/branch sense) |
| 2f00:12f0 | `hp := c^[$11B];  ac := c^[$111];  th := c^[$110];` | AGREE | +11Bh→[BP-1], +111h→[BP-5], +110h→[BP-2] (1306) |
| 2f00:1b40 | `n := t - $80;` | AGREE | asm at anchor matches (operands/offsets/branch sense) |
| 2f00:100b | `sel := 0;` | AGREE | asm at anchor matches (operands/offsets/branch sense) |
| 2f00:28de | `for k := 2 to victim do c := c^.next;` | AGREE | asm at anchor matches (operands/offsets/branch sense) |
| 2f00:0298 | `ecl_ReadOperands(2);` | AGREE | asm at anchor matches (operands/offsets/branch sense) |
| 2f00:1110 | `menu := '';` | AGREE | asm at anchor matches (operands/offsets/branch sense) |
| 2f00:1637 | `c := PartyHead;  r := 0;  r0 := 0;  r2 := 0;` | AGREE | asm at anchor matches (operands/offsets/branch sense) |
| 2f00:282f | `st := save and 7;` | AGREE | [BP-9] := [BP-6] and 7 (kind := [BP-1] and 1Fh at 2827) |
| 2f00:2b8c | `id := v(1);` | AGREE | asm at anchor matches (operands/offsets/branch sense) |
| 2f00:0c82 | `g_4431 := 1;` | AGREE | asm at anchor matches (operands/offsets/branch sense) |
| 2f00:0457 | `savedSel := SelectedChar;` | AGREE | asm at anchor matches (operands/offsets/branch sense) |
| 2f00:02f3 | `i := 0;` | AGREE | asm at anchor matches (operands/offsets/branch sense) |
| 2f00:10e0 | `ecl_ReadOperands(2);` | AGREE | asm at anchor matches (operands/offsets/branch sense) |
| 2f00:0581 | `p^.iconSlot := enc_NextIconSlot;` | AGREE | asm at anchor matches (operands/offsets/branch sense) |
| 2f00:1c68 | `13..14: typ := $4F; 15: typ := $5C; 16: typ := $43 end;` | AGREE | case table 1..7=47h, 8..9=46h, 10=54h, 11..12=4Eh, 13..14=4Fh, 15=5Ch, 16=43h (1C68..1CBB) exact |
| 2f00:1e37 | `c := PartyHead;` | AGREE | asm at anchor matches (operands/offsets/branch sense) |
| 2f00:1d66 | `p := TreasureItems;` | AGREE | asm at anchor matches (operands/offsets/branch sense) |
| 2f00:2c2c | `dWho := Lo(a(3));` | AGREE | asm at anchor matches (operands/offsets/branch sense) |
| 2f00:09a3 | `esc := 0;` | AGREE | asm at anchor matches (operands/offsets/branch sense) |
| 2f00:2837 | `if allMembers then begin` | AGREE | asm at anchor matches (operands/offsets/branch sense) |
| 2f00:1984 | `end else Inc(i);` | AGREE | asm at anchor matches (operands/offsets/branch sense) |
| 2f00:064b | `if p^.items = nil then begin` | AGREE | asm at anchor matches (operands/offsets/branch sense) |
| 2f00:24d5 | `else begin Mem[6DC1] := Mem[6DC1] - 1; ShowEncounter(enc_SpriteId, enc_PicId, Mem[6DC1], g` | AGREE | DEC word +582h; pushes 6F81, 6F82, byte +582h, @DS:84C8 → ShowEncounter |
| 2f00:0cdd | `Load3DMap(b[1]);` | AGREE | asm at anchor matches (operands/offsets/branch sense) |
| 2f00:3382 | `RefreshView` | AGREE | asm at anchor matches (operands/offsets/branch sense) |
| 2f00:12a2 | `FreeMem(TreasureItems, $3F);` | AGREE | asm at anchor matches (operands/offsets/branch sense) |
| 2f00:0194 | `ecl_CompareWords(x1, x2);` | AGREE | x1=[BP-2] (0186), x2=[BP-4] (0191); pushes [BP-2],[BP-4] |
| 2f00:2678 | `found := false;` | AGREE | asm at anchor matches (operands/offsets/branch sense) |
| 2f00:14dc | `while (c <> nil) and (found = 0) do begin` | AGREE | asm at anchor matches (operands/offsets/branch sense) |
| 2f00:16ff | `p := b[4] + 2 - b[1];` | AGREE | asm at anchor matches (operands/offsets/branch sense) |
| 2f00:0f22 | `ecl_ReadOperands(3);` | AGREE | asm at anchor matches (operands/offsets/branch sense) |
| 2f00:32b9 | `ecl_Run(ecl_VecA);` | AGREE | asm at anchor matches (operands/offsets/branch sense) |
| 2f00:0bd8 | `ecl_ReadOperands(1);` | AGREE | asm at anchor matches (operands/offsets/branch sense) |
| 2f00:1c0a | `end else if r2 in [91..94] then typ := $49` | AGREE | asm at anchor matches (operands/offsets/branch sense) |
| 2f00:0cb2 | `g_4434 := 1;` | AGREE | asm at anchor matches (operands/offsets/branch sense) |
| 2f00:2047 | `highlight := (g_84E0 <> 0) and (g_84E1 <> 0);` | AGREE | asm at anchor matches (operands/offsets/branch sense) |
| 2f00:0e4c | `ecl_SetMem(dest, r);` | AGREE | pushes dest [BP-2], r byte [BP-7] |
| 2f00:1dfd | `loss := Lo(v(2));` | AGREE | asm at anchor matches (operands/offsets/branch sense) |
| 2f00:0f78 | `node := list;` | AGREE | asm at anchor matches (operands/offsets/branch sense) |
| 2f00:0f3b | `prompt := Str[1];` | AGREE | asm at anchor matches (operands/offsets/branch sense) |
| 2f00:139f | `c := c^.next;` | AGREE | asm at anchor matches (operands/offsets/branch sense) |
| 2f00:0256 | `dest := MakeWord(OpLo[2], OpHi[2]);` | AGREE | asm at anchor matches (operands/offsets/branch sense) |
| 2f00:08b2 | `g_84E0 := 1;` | AGREE | asm at anchor matches (operands/offsets/branch sense) |
| 2f00:1769 | `if r2 <= m then res := 2;` | AGREE | [BP-2]=r2 (173E) vs CBW [BP-0Ah]=m: CMP/JG = signed, matches |
| 2f00:042b | `ShowEncounter(enc_SpriteId, enc_PicId, Byte(Mem[$6DC1]), g_84C8);` | AGREE | asm at anchor matches (operands/offsets/branch sense) |
| 2f00:1f92 | `for k := 1 to 3 do txt[k] := Str[k];` | AGREE | asm at anchor matches (operands/offsets/branch sense) |
| 2f00:00a0 | `Inc(ecl_PC);` | AGREE | asm at anchor matches (operands/offsets/branch sense) |

Sample result: **76 AGREE, 0 DISAGREE, 0 UNSURE.** (N1 naming note on 2F00:2BE5 below.)

## 2. Sweeps (whole range 2F00:0001..3508 / lines 20..1253)

| class | method | result |
|---|---|---|
| call-argument order | fresh `ECL_ARGCHECK.md` (552 calls, 0 MISMATCH; 238 UNSURE rows in ov03); 22 multi-argument UNSURE rows of ov03 sampled with seed 404 and read against the push sequences (LoadCombatIcon ×2, DrawTitledFrame ×4, MenuSelect, SavingThrow, ShowEncounter ×2, FillChar ×2, LoadAnimation, DrawRepeatedGlyph, BuildItemName, DrawWrappedText ×4, SelectPartyCharacter, ecl_LoadMonsterRec, Move), plus every `v(n)`/`ecl_OperandValue(n)` index argument (40 lines, scripted: n pushed before each ecl_OperandValue call vs the n written) | 1 DISAGREE (D1, MakeTreasureItem at 2F00:1CCD); all others AGREE; operand indexes 40/40 agree |
| signed vs unsigned | all signed jumps in ov03 (JL/JG/JLE/JGE): only 3 (2F00:174E, 175D, 1776, in ecl_op23_Surprise, CBW-extended shortints p/m) | pseudo marks them signed/shortint (L604, L608); every other compare in the range is the JA/JB/JZ family = unsigned, and the pseudo makes no signed claims elsewhere. AGREE. Note: 2F00:1396 (PartyStrength) uses CWD before an unsigned DIV; harmless because the sum is < 8000h by construction |
| byte vs word operands | every `byte ptr ES:[DI+x]` read through ecl_Mem4900/6B00/CodeBuf (13 sites: +582h ×9, +5C2h, +67Ch ×2, +1E4h, +6700h) vs the pseudo | all are low-byte reads passed as Byte arguments or assigned to bytes; pseudo writes `Byte(Mem[...])`/`Lo(Mem[...])` or passes `Mem[6DC1]` to a Byte parameter (implicit truncation). AGREE (cosmetic: L800/L838/L860/L865 omit the `Byte()` used at L165/L248) |
| folded constant array indexes | all 19 `OpLo/OpHi/OpType[n]` uses checked against the DS operand (base 7085/7045/7005 + n); `Str[k]` base 6FC8 + k·100h (2F00:0FC4); x[1..2] at [BP-6]/[BP-4] (2F00:01C8) | 19/19 + 2 AGREE |
| ABS idioms (and/jge/neg) | `NEG` count in ov03.lst = 0 | none present |
| Pascal set tests (`in`) | all 12 `in [...]` in range vs CMP bounds: treasure rolls 2F00:1B71..1CC1, parlay 23D4, block test 332D | 12/12 AGREE (incl. the overlapping r1 [91..98] = effectively 93..98, noted by the owner). Observation: r2 = 48/49 leaves `typ` unchanged (stale from the previous item) — see N2 |
| string length bytes | all 15 @StrAssign/@StrLong max-length pushes in ov03 (0FFh, 0Ch, 28h, 32h, 1) vs declared string sizes; empty tests (`= ''` at 2150 is `CMP byte [BP-406h],0`) | AGREE: name string[12] (051B), node text 40 (0FD0), menu string[50] (11C6/120C), num string[1] (0C10, 1A17) |

## 3. Specific claims checked

- **2F00:1CCD MakeTreasureItem** — bytes `8A 46 9B 50` (push typ [BP-65h]), `8D 7E A7 16 57` (push @item [BP-59h]), `9A 61 00 8F 00` (stub_ov21 → 8900:1010). First pushed = first parameter → `MakeTreasureItem(typ, item)`. **Confirmed; ECL.pas.md L732 writes `MakeTreasureItem(item, typ)` = DISAGREE D1** (argcheck had it UNSURE).
- **Damage number width** (COMBAT-lane claim) — not in ov03; it is ov07 `4300:20E6` (ECL.pas.md L1963 `num := Str(dmg:3)`). Bytes 4300:20E6..20F9: push dx:ax = dmg (Longint), **push 0 (width)**, push @num [BP-105h], **push 3 (max length, num: string[3])**, call @StrLong. Width is 0; 3 is the string capacity. **Confirmed; DISAGREE D2** (outside this part's range; reported here as directed).
- ECL_VM.md consistency of handler semantics stated in the pseudo: SUBTRACT op2−op1 (01FC), DIVIDE unsigned DIV (0210), MULTIPLY low word (021F), AND/OR `CompareWords(0, r)` (0E3E pushes 0 then r) agree with ECL_VM.md rows 05/06/07/2F/30. **But ECL_VM.md line 109** still says "AND/OR (2Fh/30h: compare(result, 0))", contradicting its own corrected row 2F (line 232) and the bytes → **DISAGREE D3** (spec text).

## 4. DISAGREE list (corrections)

| # | where | wrong | correct | evidence |
|---|---|---|---|---|
| D1 | ECL.pas.md L732, 2F00:1CCD | `MakeTreasureItem(item, typ);` | `MakeTreasureItem(typ, item);` | 2F00:1CCD push byte [BP-65h] (typ), 1CD1 push ss:[BP-59h] (@item), 1CD6 call 8900:1010 |
| D2 | ECL.pas.md L1963, 4300:20E6 (ov07, part E) | `num := Str(dmg:3);  { @StrLong width 3 }` | `Str(dmg, num);  { num: string[3]; width 0 }` | 4300:20ED push 0 (width), 20F6 push 3 (maxlen) before @StrLong |
| D3 | ECL_VM.md line 109 (condition flags) | "AND/OR (2Fh/30h: compare(result, 0))" | "AND/OR (2Fh/30h: compare(0, result))", as in its row 2F | 2F00:0E3E push 0, 0E41 push r, 0E47 ecl_CompareWords |

Notes (no fix required, owner's choice):
- N1: 2F00:2BE5 calls 00BA:0BB8, published as `RecalcCharacter` (engine_names.json); ECL.pas.md L1013 calls it `RebuildEquipmentDerivedState`. Use the published name.
- N2: L698 treasure roll (2F00:1B90..1C32): r2 ∈ {48, 49} matches no branch and keeps the previous `typ` — add a `{ quirk: }` note.

## 5. Counts

- Sample: 76 / 752 (10.1 %), seed 404: AGREE 76, DISAGREE 0, UNSURE 0.
- Sweeps: call order 22 rows + 40 operand-index lines + 1 targeted; signed 3; byte/word 13; folded indexes 21; ABS 0; sets 12; strings 15 → DISAGREE 1 (D1).
- Specific claims: D1 confirmed, D2 confirmed (ov07), D3 spec text.
- **Total DISAGREE: 3** (D1, D2 for ECL.pas.md; D3 for ECL_VM.md); notes 2.

---

# ECL verification — part B: ov07 (ECL.pas.md lines 1254..end) + 3-script sample (lane por-verify2)

Verifier did not write ECL. Evidence: `decode/listings/ov07.lst`, `python -I decode/ecl/hdis.py ov07|ov03|… START END`, raw ECL records `decode/bin/dax/ECL<n>/<rec>.bin`, listings `decode/ecl/listings/*.ecl.txt`.

## I. ECL.pas.md ov07 parts D + E (4300:0000..2215), Unknowns, Self-check

Sample: 398 anchored statements in lines 1254..end; `python -I decode/tools/pseudo_check.py <extract> ov07 40 505` (**seed 505**, 40 = 10 %).

| # | address | statement | verdict | evidence |
|---|---|---|---|---|
| 1 | 4300:0588 | `if view_AreaMap <> 0 then begin` | AGREE | CMP [6AAC],0 / JZ |
| 2 | 4300:0A56 | `$33E: Result := Mem6B00^[$6E3E]` | AGREE | word ES:[DI+67Ch] of ecl_Mem6B00 = word index 33Eh = VM 6E3E |
| 3 | 4300:0C55 | `$326: if v > $80 then LoadWallSet(3, v and $7F)` | **DISAGREE** | pushes `v and 7Fh` (0C68) then 3 (0C6B); LoadWallSet(id [BP+8], slot [BP+6]) (VIEW B100:0E08) → `LoadWallSet(v and $7F, 3)`. `v > $80` = CMP word / JBE (unsigned) OK |
| 4 | 4300:0B49 | `$0F7: Word at c+$B8 := v` | AGREE | MOV word ES:[DI+0B8h],AX |
| 5 | 4300:0E1C | `found := false` | AGREE | MOV byte [BP-4],0 |
| 6 | 4300:1E91 | `it := nxt` | AGREE | [BP-5]:[BP-3] := [BP-9]:[BP-7] |
| 7 | 4300:139B | `Inc(i)` | AGREE | INC byte [BP-2] |
| 8 | 4300:0C03 | `$312: SetDataSet(Lo(v))` | AGREE | push AL=[BP+6]; CALLF 0802:094A |
| 9 | 4300:173E | `k := 1` | AGREE | MOV byte [BP-154h],1 |
| 10 | 4300:1B8C | `r^.npc_flags := $B2` | AGREE | MOV byte ES:[DI+84h],0B2h (SAVES calls +84h `npc_morale`; name only) |
| 11 | 4300:0E8A | `3: Result := Code[a]` | AGREE | byte ES:[DI+a+6700h] = CodeBuf[a-9900h] (notation line 12) |
| 12 | 4300:021C | `FillChar(ecl_FlagEQ, 6, 0)` | AGREE | push DS:6F78, 6, 0 |
| 13 | 4300:1084 | `for i := 0 to Byte(len - 1) do` | AGREE | DEC AX → byte; CMP 0,limit / JA: len = 0 loops 256× (captured by `Byte()`) |
| 14 | 4300:1A75 | `g_84D4 := 1` | AGREE | MOV byte [84D4],1 |
| 15 | 4300:1080 | `else if region = 2 then begin` | AGREE | CMP AL,2 / JNZ |
| 16 | 4300:19AE | `ecl_GosubSP^.ret := ecl_PC` | AGREE | MOV ES:[DI],[49ED] |
| 17 | 4300:1743 | `while (k <= Length(keys)) and (keys[k] <> Chr(key)) do Inc(k)` | AGREE | CMP k,[BP-153h] JA; keys[k] vs [BP-155h] JE; INC |
| 18 | 4300:1BA0 | `r^.effects := nil` | AGREE | +7Fh/+81h := 0 (SAVES +7Fh effects) |
| 19 | 4300:1FA2 | `$29: ecl_ReadOperands(14)` | AGREE | push 0Eh |
| 20 | 4300:03D8 | `until size >= 2` | AGREE | CMP word [BP-8],2 / JC (unsigned) |
| 21 | 4300:20E1 | `clear := 0` | AGREE | MOV byte [BP-106h],0 |
| 22 | 4300:0DE2 | `$0F1: begin g_6F68 := Lo(v); g_84E5 := 1 end` | AGREE | |
| 23 | 4300:181C | `sa := a;  sb := b` | AGREE | two @StrAssign(255) into [BP-100h], [BP-200h] |
| 24 | 4300:129A | `if c <> 0 then Str[slot] := Str[slot] + ecl_SixBitChar(c)` | AGREE | CMP [BP-5],0 / JZ; call 36D3 |
| 25 | 4300:0962 | `$11B: Result := c.move` | AGREE | byte ES:[DI+11Ch] |
| 26 | 4300:04A4 | `Mem6B00^[$6DC1] := 2` | AGREE | word +582h = VM 6DC1 |
| 27 | 4300:00B3 | `ecl_UnpackString(OpLo[i], k)` | AGREE | push [BP-6] (= OpLo[i], 00A4) then [BP-2] (k); sig (len [BP+8], slot [BP+6]) |
| 28 | 4300:0C0F | `$322: if v > $80 then LoadWallSet(1, v and $7F)` + comment `LoadWallSet(slot, id)` | **DISAGREE** | pushes `v and 7Fh` (0C22) then 1 (0C25) → `LoadWallSet(v and $7F, 1)`; comment wrong (signature is (id, slot); part A at 2f00:0d2b uses (id, slot) correctly) |
| 29 | 4300:056C | `size := dist + 1` | AGREE | |
| 30 | 4300:07DA | `$018: Result := c.con` | AGREE | byte +14h |
| 31 | 4300:219F | `ShowBottomPromptAndReadKey($0F, 'press <enter>/<return> to continue')` | AGREE | push 0Fh, then string (StrCopy temp); sig (colour, s) |
| 32 | 4300:1183 | `Inc(ecl_PC)` | AGREE | |
| 33 | 4300:21E2 | `ApplyDamage(c, Lo(dmg))` | AGREE | push [BP+8]:[BP+6] (c), then AL=[BP+0Ah] |
| 34 | 4300:1700 | `DrawPartyRoster(SelectedChar)` | AGREE | |
| 35 | 4300:2215 | ov07_init empty | AGREE | 55 89 E5 5D CB |
| 36 | 4300:0AE5 | `$0BB: c.money[0] := v` | AGREE | word +88h |
| 37 | 4300:1FAB | `Inc(ecl_PC)` (default) | AGREE | |
| 38 | 4300:204E | `if m < minMove then minMove := m` | AGREE | CMP AL,ES:[DI] / JNC (unsigned byte) |
| 39 | 4300:01F5 | `ecl_PC := $9900` | AGREE | |
| 40 | 4300:0F79 | `len := Length(t)` | AGREE | byte [BP-100h] (length byte) |

Result part I sample: **38 AGREE, 2 DISAGREE (one defect class: LoadWallSet argument order), 0 UNSURE.**

### Sweeps (ov07 range)

| class | method | result |
|---|---|---|
| call-argument order | fresh ECL_ARGCHECK.md (552 calls, 0 MISMATCH); all 111 ov07 UNSURE rows re-read by hand against the pushes | **1 defect**: the three LoadWallSet calls 4300:0C0F/0C32/0C55 (`$322/$324/$326`) are written `(slot, id)`; bytes push id first → `LoadWallSet(v and $7F, 1/2/3)`. Every other ov07 call agreed (e.g. LoadDaxRecord 03D3 name/ext/id/size/p; LoadAnimation 05B4/0663 (name, id, mode, anim); Show3DSprite 05C5 (size, anim); DrawPictureScreenOrView 0683 (3,3,1,pic); ShowHeadBodyPicture 0699; ecl_GetMemString 011E (slot, addr); ecl_GetCharField 0E41; LoadMonster 0444 (id, rec); HorizontalMenu 16C2; Delete 15E1; CycleSelectedChar 16F6) |
| minor: Str width | 4300:0396 pushes value DX:AX, **width 0**, @ds, maxlen **1** | `Str(DataSet:1, ds)` should read `Str(DataSet, ds)` with `ds: string[1]`; identical output for data sets 1..8 (cosmetic) |
| signed vs unsigned | all JL/JG/JLE/JGE in ov07 (4: StepForward 19EA/1A02/1A1A/1A32) and all 8 CBW sites | AGREE: StepForward is written as a signed compare; CBW sites written `ShortInt(...)`/"sign-extended" (0804, 08BC, 0EFF, 0F0D, 1A7A) or as the documented index quirk (ecl_OperandValue 013C/0149/0156); every other compare is unsigned and written as such (JBE/JA/JC/JNC) |
| byte vs word operands | every getter/setter case of ecl_GetCharField/ecl_SetCharField/ecl_SetMem (L1459..1560) compared with the MOV size | AGREE (money +88h..+90h, +B8h, VM regions = word; con, saves, thief skills, +84h, +BAh, +11Ch, +10Dh/+10Ch, Code[] = byte) |
| folded constant indexes | VM-address writes `Mem6B00^[$6Dxx]` checked against ES offsets (+582h→6DC1, +67Ch→6E3E, +5C2h→6DE1, +5CCh→6DE6); thief skill `$A5..$AC` (SUB 0A4h, base +76h → +77h..+7Eh); spell bytes `$20..$70` (SUB 1Fh, base +17h → +18h..) | AGREE |
| ABS idioms | no NEG/CWD-XOR/SAR pattern in ov07 | n/a |
| set tests | both @SetIn sites (15A9, 171C); set constants decoded from `ov07.bin` 154Dh/1664h = `['0'..'9','A'..'Z']` | AGREE. Note (UNSURE, documentation): MenuHotkeys 4300:15B0 adds 20h to **every** member of the set, so digits become 'P'..'Y' too, not only letters → lower case; the statement is correct, the comment "to lower case" is incomplete |
| string length bytes | Length(t)/Length(s)/Length(keys) reads; `Str[slot] := ''` = length byte 0 (1317); GetMemString byte index wrap quirk documented | AGREE |

### Header / notes in the range
- **DISAGREE (doc)** ECL.pas.md line 1792, ecl_CompareWords header: "callers … ecl_op2F_AndOr (2F00:0E47, `(r, 0)`)". Bytes 2F00:0E3E..0E46 push 0 first, then r → **`(0, r)`**, as the body at line 434 and every script rendering (`CompareUnsigned16(0, BitResult)`) say. Fix the header text only.
- Unknowns and Self-check sections (lines 2001..): consistent with the code checked here; no change.

## II. ECL script sample (FINAL `.md`, seed 505)

`random.seed(505); random.sample(29 FINAL scripts, 3)` → **ECL2_20, ECL3_14, ECL8_27**.

1. **Listing vs raw record (independent of ecldis):** every hex byte column of the three listings compared with `decode/bin/dax/ECL<n>/<rec>.bin` at offset `addr − 9900h + 2` (2-byte header skipped): ECL2_20 762/762, ECL3_14 635/635, ECL8_27 617/617 lines identical.
2. **Statements vs disassembly:** ≥ 10 % of the Structured-script statements (`{ addr }` lines, labels excluded), seed 505: ECL2_20 105 of 1043, ECL3_14 88 of 876, ECL8_27 87 of 861. Each checked for opcode class, every numeric/memory operand, text, GOTO/GOSUB target, both IF successors (next instruction vs engine skip length), ON_GOTO/ON_GOSUB 0-based index → target and return label (e.g. ECL8_27 A880 ON_GOSUB 20 targets, return A8C2 = A880 + 42h). **280/280 AGREE.**
   Engine semantics behind the renderings re-read in the asm: COMPARE = CompareWords(op1, op2), a<b → LT, unsigned (2F00:0194, 4300:18FF..1946); AND/OR = CompareWords(0, r) (2F00:0E3E); RANDOM = byte n, +1 if < 255, Random(bound) (2F00:024A..026C); LOAD_MONSTER count: byte, 0 → 1 (2F00:04EB..04F4) — `Max(x,1)` is right for byte values; the Byte truncation of a word operand is implicit (UNSURE notation, no defect); ON_GOTO/ON_GOSUB 0-based, x ≥ count falls through (2F00:1931..1984); TREASURE money order = TChar money order copper..jewelry (SAVES +88h, CoinName DS:0FFA).
3. **Prose claims (5 per script):**

| script | claim | verdict | evidence |
|---|---|---|---|
| ECL2_20 | vectors A..E = 9914/9975/9A0E/9A49/9A5E | AGREE | header bytes 9900..9913 |
| ECL2_20 | 4A00..4A1F block-local, zeroed by ecl_InitVM 4300:02CD..02F0 when DS:49F8 = 0 | AGREE | loop i = 1..20h on w[49FF+i], guarded by CMP [49F8],0 (02C6) |
| ECL2_20 | 49FB = area-map disabled flag (VIEW 6600:09EC) | AGREE | `key = 'A'` then CMP w[1F6h] (= VM 49FB),0 |
| ECL2_20 | 49C9 = game clock counter 3 (AdvanceClock reads 49C6..49CC) | AGREE | 8400:03E8 `ADD AX,49C6h` loop i = 0..6 |
| ECL2_20 | 4A1F written $0000 at 997E and $00C8 at 9A49 | AGREE | listing lines 997E, 9A49 |
| ECL3_14 | 49F0/49F1 := party X/Y before the move (2F00:3473/3480) | AGREE | w[1E0h]/w[1E2h] := party_MapX/Y |
| ECL3_14 | 6DD2 rest check interval, 6DD3 interruption chance % (ov20 0DD3..0E24) | AGREE | w[5A4h] vs counter, Roll vs w[5A6h] / JA |
| ECL3_14 | 6BA5 = thief skill 0 (+77h) | AGREE | 4300:0820 SUB 0A4h, ES:[DI+76h] |
| ECL3_14 | 6B20 = spell byte +18h | AGREE | 4300:0AA6 SUB 1Fh, ES:[DI+17h] |
| ECL3_14 | TREASURE money fields copper..jewelry | AGREE (M) | op27 fills DS:67F4+4i from operands 1..7; same order as TChar money / CoinName |
| ECL8_27 | 49C3 overland X: w[$186] += dx[dir] (VIEW 6600) | AGREE | 6600:0825..083E, stored 0932/0959 |
| ECL8_27 | 6DC9 = block next move (FFh) (6600:0D86) | AGREE | CMP w[592h],0FFh |
| ECL8_27 | 6DC7 = combat result (3900:152D) | AGREE (0 path only) | 3900:1531 w[58Eh] := 0; other values not re-read |
| ECL8_27 | 6DC6 = morale/flee threshold (4D00:11C4) | AGREE | 4D00:11CB SUB AX,w[58Ch] |
| ECL8_27 | 6E70 = to-hit modifier, monster side (signed) | UNSURE | 9800:0D22 reads byte w[6E0h]; signedness not shown in the read |

Area titles ("Phlan slums", "Trapped mansion / Kovel candidate", "Eastern travel / caves") are L story guesses, not checked.

## DISAGREE list (for the ECL owner)

1. **ECL.pas.md 4300:0C0F / 0C32 / 0C55** (ecl_SetMem region-4 cases `$322/$324/$326`): write `LoadWallSet(v and $7F, 1)`, `LoadWallSet(v and $7F, 2)`, `LoadWallSet(v and $7F, 3)` and drop the comment "LoadWallSet(slot, id)" (signature `(id [BP+8], slot [BP+6])`; pushes id first at 0C22/0C45/0C68).
2. **ECL.pas.md line 1792** (ecl_CompareWords header): `ecl_op2F_AndOr (2F00:0E47, (r, 0))` → `(0, r)`.
3. Minor: **4300:0396** `Str(DataSet:1, ds)` → `Str(DataSet, ds)` (width 0, `ds: string[1]`).
4. Minor (comment): **4300:15B0** MenuHotkeys adds 20h to digits as well ('0'..'9' → 'P'..'Y'); say so instead of "to lower case".

## Counts
- Part I: 40 sampled (38 AGREE / 2 DISAGREE / 0 UNSURE); sweeps: 1 call-order defect (3 sites), 1 header error, 2 minor.
- Part II: 3 scripts, 2,014 listing lines byte-identical to the records; 280 statements sampled, 280 AGREE; 15 prose claims: 14 AGREE, 1 UNSURE; 0 DISAGREE.

## Sampled script statements (address + opcode)

**ECL2_20** (105 statements, all AGREE): 9F21 IF_EQ; A99C EXIT; ABA2 IF_EQ; AADC IF_EQ; ADDC IF_GE; B3CA IF_GE; AB75 SAVE; AE1D EXIT; 9A99 COMPARE; B134 GOSUB; B129 IF_LT; 9C42 IF_GT; AD67 IF_GE; B2BE PARLAY; A814 GOTO; 9DA2 SAVE; 9975 SAVE; AB90 COMBAT; B6BB RETURN; 9F00 LOAD_MONSTER; 9C85 IF_EQ; 9A9F IF_NE; AFB5 IF_NE; A51F COMPARE; AFE4 IF_NE; B24C GOTO; B4CC PRINTCLEAR; B064 SAVE; B199 COMPARE; AA06 SAVE; AFEB PRINTCLEAR; 9E6C COMBAT; AEB8 PRINT; AF4F DELAY; 99B4 COMPARE; A3C1 EXIT; B6E2 RETURN; B0FB TREASURE; 9F12 EXIT; B144 IF_GT; B19F IF_GT; 9F41 IF_EQ; B38D ON_GOTO; 9DA8 ON_GOTO; A2C5 ON_GOTO; 9C01 PARTY_SURPRISE; AA9B EXIT; 99C9 ON_GOTO; A3B2 GOSUB; AEF7 SAVE; B29C IF_GT; B11E IF_GT; B11E IF_GT; AE24 IF_GE; AB4F IF_EQ; B1BB GOTO; B2B3 COMPARE; A514 GOSUB; A469 PRINTCLEAR; A3A1 COMBAT; 9E7F EXIT; 9920 IF_GE; 9B56 IF_EQ; 9B8A RANDOM; ABF7 COMBAT; ADDC IF_GE; 9FED ON_GOTO; A4D4 DELAY; B26F COMPARE; AC94 IF_LT; 9921 SAVE; A9F3 LOAD_MONSTER; B1CF CLEAR_MONSTERS; AFDE SAVE; B133 IF_LT; B38D ON_GOTO; AC3B CLEAR_MONSTERS; A096 CLEAR_MONSTERS; AC12 APPROACH; 9EE8 GOSUB; AC86 COMPARE; 99C9 ON_GOTO; A03F ON_GOTO; A459 COMPARE; B144 IF_GT; AA94 COMPARE; A953 PRINTCLEAR; AB0B IF_EQ; 9A77 IF_GE; A9A5 PRINTCLEAR; A59B ON_GOTO; 9A14 IF_EQ; AC85 DELAY; B6B5 SAVE; A3FD GOTO; A09E LOAD_MONSTER; 9DDE ENCOUNTER_MENU; A79D PRINTCLEAR; 9CEF ON_GOTO; AABB CLEAR_MONSTERS; AA18 SETUP_MONSTER; 9B30 IF_NE; AC96 PRINTCLEAR; B6A2 IF_GE; A989 ON_GOTO

**ECL3_14** (88 statements, all AGREE): B359 COMPARE; AD16 ADD; 9B53 IF_GE; B051 PRINTCLEAR; 9F72 IF_EQ; A9AD IF_EQ; A3F6 GOTO; 9914 SAVE; B3E9 PRINTCLEAR; 9CC8 ON_GOTO; A26F DELAY; A059 SAVE_TABLE; B41D PRINTCLEAR; B4EC EXIT; 993C ON_GOTO; A011 DELAY; 9A5C PRINTCLEAR; B1B9 PRINTCLEAR; A82A IF_NE; 9A05 IF_EQ; A713 GOTO; A802 IF_NE; 9DD3 IF_EQ; 9B5E SETUP_MONSTER; AA12 IF_GE; A4E2 ON_GOTO; 9CBD COMPARE; B002 IF_EQ; 9B48 IF_EQ; 9991 ON_GOTO; B239 DELAY; AF4C SAVE; A908 PRINTCLEAR; 9F72 IF_EQ; 9991 ON_GOTO; B34E SPRITE_OFF; A7EA DAMAGE; A1D0 PRINTCLEAR; 9900 GOTO; B30D DELAY; A82A IF_NE; AA12 IF_GE; 9BAF IF_GE; 9A2C IF_NE; A65B COMPARE; 9927 SAVE; A779 CLEAR_MONSTERS; A862 OR; 9CEA GOTO; AD8F HORIZONTAL_MENU; AA08 GOTO; A398 PRINTCLEAR; 99F4 COMPARE; B2D5 GOTO; AAC8 IF_GE; A642 ON_GOTO; B401 GOTO; 9B53 IF_GE; ACFC GOTO; 9CE0 AND; 9BAF IF_GE; AF89 IF_NE; A45F PRINTCLEAR; AA12 IF_GE; B47C IF_GE; 9C57 COMPARE; ACD7 SAVE; AB69 GOTO; 9ED9 IF_NE; AEF6 COMPARE; 99DF GET_TABLE; 9CC8 ON_GOTO; AA02 SAVE; A519 ON_GOTO; A738 SAVE; B368 HORIZONTAL_MENU; 9960 NEW_ECL; 9991 ON_GOTO; A729 ON_GOTO; 9921 SAVE; 9C89 IF_LT; A903 IF_NE; A9AD IF_EQ; A4E2 ON_GOTO; A14F IF_EQ; A0A8 DELAY; A359 ON_GOTO; A534 IF_NE

**ECL8_27** (87 statements, all AGREE): A5D0 IF_NE; 99DD SAVE; AA12 SAVE; 9A41 IF_EQ; 9B6A CALL; A965 SAVE; A0E1 IF_LT; 9E71 PICTURE; AA28 SAVE; A4C0 IF_NE; AADD GOTO; A09A GOTO; 9B1C IF_EQ; A028 PRINT; A2F9 NEW_ECL; 9A42 RETURN; A04C ON_GOTO; A2D9 LOAD_FILES; 9932 ON_GOTO; A880 ON_GOSUB; 9AB9 IF_GE; 9950 ON_GOTO; A8FE GET_TABLE; AC81 GOSUB; 9A27 IF_EQ; AAB8 IF_NE; A5EB CLEAR_MONSTERS; 9C60 COMBAT; A880 ON_GOSUB; 9DE0 CALL; A40F AND; 9CF5 SAVE; 9E81 SAVE; 9E4B ON_GOTO; A08D IF_GT; A5C6 EXIT; A964 IF_LE; 9F2E PRINT; 9A7F ADD; A6AF RANDOM; 9A41 IF_EQ; A076 IF_EQ; A536 EXIT; 9EC2 COMPARE_AND; 9EB9 IF_NE; A6DA PRINTCLEAR; A76B IF_GT; 99D8 IF_NE; 99D8 IF_NE; 9922 IF_LE; 9C08 NEW_ECL; AAA6 SPRITE_OFF; A293 SAVE; A615 EXIT; A37C IF_NE; A4B0 SAVE; 9B15 COMPARE; A673 OR; A4F2 SAVE; A5D0 IF_NE; A9B6 IF_GE; A791 SAVE; A087 COMPARE; A853 EXIT; 9EA6 RETURN; A0E1 IF_LT; A926 ON_GOTO; 9A43 ADD; 99A3 ON_GOTO; A44C IF_NE; 9EBE GOSUB; AC2E COMPARE; A08E GOTO; 9F54 ON_GOTO; 9A20 COMPARE; 9DE7 PRINTCLEAR; A442 EXIT; A4C1 EXIT; AA64 SAVE; A37E PRINTCLEAR; 9DDB NEW_ECL; AAAE EXIT; 9EB9 IF_NE; A132 GOTO; A04C ON_GOTO; AAED SAVE; 99C2 SAVE

---

# ECL_SCREENS verification (lane por-verify2, step 4)

Input: `decode/pseudo/ECL_SCREENS.md` as found in the working tree (with uncommitted owner edits), SHA-256 `d386361fd09e5ca76fcc0ab00e5386a9e61e6a20083b4f8b6c25e1092156e58e`.
Method: every row re-read against the asm (`python decode/ecl/hdis.py ov03|ov07|ov25|r0709|r03F1 START END`): push sequences of DrawText / DrawWrappedText / DrawTitledFrame / MenuSelect / HorizontalMenu, CS string literals, branch conditions. Captures: `acceptance/ref/DECODE_CHECKS.md` (batch 1; ECL-03/04/05/08/09/10/11/12/14 captured).
Callee signatures used (verified at their entry): `DrawText(col,row,colour,s)` 0709:0626; `DrawWrappedText(x1,y1,x2,y2,colour,clear,s)` 0709:0768 (clear ⇒ ClearTextRectangle + cursor := (x1,y1), asm 0709:07CA..07ED); `DrawTitledFrame(x1,y1,x2,y2,style,colour,title)` 03F1:02E8 (ClearRectangle(x1..y2) first; `colour` only colours the title, #ref-3); `MenuSelect(title,items,promptCol,textCol,hotCol,acceptEnter,animate)` 4300:1684 → `HorizontalMenu(prompt,options,promptColour,textColour,hotColour,allowExt,animate,var ext)` 9D00:03BD.

| screen id | claim | verdict | code evidence | capture evidence |
|---|---|---|---|---|
| intro / regions | 40×25 cells; picture box (1,1)-(15,15); roster (17,1)-(38,15); text window (1,17)-(38,22); menu row 24; 0Ah script text, 0Fh highlights, 0Dh "menu colour (role M)" | AGREE (note) | text window pushes 1,11h,26h,16h at 2F00:0A52/0F92/2176; box clear 2F00:2B1B (1,1,0Fh,0Fh); roster clear 4300:21F1. Role of 0Dh is now resolved: it is HorizontalMenu's **prompt colour** [BP+12h] (MenuSelect passes it first, 2F00:121F) | ENGINE-16 capture: 0Dh = magenta prompt |
| ECL-01 | `Loading...Please Wait` at (0,24) colour 0Fh, repeated until read; line cleared; NEW_ECL disk check | AGREE | 4300:0364..037C DrawText(0,18h,0Fh,'Loading...Please Wait'); loop `cmp [bp-8],2 / jb 035F`; ClearMenuLine 4300:035F/0406; NEW_ECL 2F00:0C47 CheckEclDisk(g_547C+'ECL'+n+'.dax') | — |
| ECL-02 | entering 3D from overland: "frame (3,3)-(13,13) colour 0Ah"; RefreshView; BACPAC | **DISAGREE** (wording) | 2F00:3266..3287 DrawTitledFrame(3,3,0Dh,0Dh,style 0,0Ah,''): the 0Ah is the *title* colour of an empty title — the border glyphs are drawn by symbol set 114h+3·style with their own colours (#ref-3); the call also clears cells (3,3)-(13,13); the visible border lies one cell outside (cells 2 and 14) | ENGINE-07 (inner border at px 16/112 = cells 2/14) |
| ECL-03 | ExploreCommand line; vector A before move, B after; step sound g_2628 if moved; E → camp | AGREE | 2F00:3395 ExploreCommand; 344C vecA; 348D MoveParty; 34CF `push [2628h]` PlayOrStopSound only if position changed (3497..34CD); 33D9 'E' → ecl_CampCheck | ECL-03 AGREE |
| ECL-04 | PRINT/PRINTCLEAR text window colour 0Ah word-wrapped; PRINTCLEAR clears + (1,17); numbers decimal | AGREE | 2F00:0A4B `cmp ecl_CurOp,11h`: op 11h → DrawWrappedText(1,11h,26h,16h,0Ah,**0**,s), op 12h → same with clear **1** (0A7A..0A91); number via WordToStr 0A38 | ECL-04 AGREE |
| ECL-05 | row-24 menu; colours 0Fh/0Ah (single item 0Fh/0Fh); continue-text substitution; keys: hotkeys, `,`/`.`, Enter only single item, "any other letter/digit returns 0FFh", extended keys → CycleSelectedChar | **DISAGREE** (keys) | Colours/substitution/Enter AGREE: 2F00:111A/114C colA/colB, 1126/1137 string swap, pushes 1215..1231 = MenuSelect(prompt, menu, 0Dh, colB=text, colA=hot, single=acceptEnter, hilite=animate). But HorizontalMenu 9D00:0610..068F only ends on a key equal to a **capital character of the displayed option string** (option starts), Space, Esc (#0), Enter, ext keys; other letters are ignored, so "any other letter returns 0FFh" is wrong. With allowExt=1 (4300:16D9) the digits 1..9 are converted to cursor scan codes (9D00:06A0..06BD) → `special` → CycleSelectedChar, not 0FFh. 0FFh only occurs for a displayed capital that is not a `~` hotkey (MenuHotkeys turns an un-marked digit into a capital P..Y, 4300:15B0) or a timeout key. Space and Esc are returned by HorizontalMenu but MenuSelect keeps looping (4300:1712) | ECL-05 AGREE (single-item path, white text) |
| ECL-06 | prompt (1,17) 0Ah wrapped; list rows row+1..22 cols 1..38; highlight 0Fh, normal 0Ah; index stored after Esc | AGREE | 2F00:0F92 DrawWrappedText(1,11h,26h,16h,0Ah,1,prompt); 101D..1035 EclVerticalListMenu('', '', 0Dh,0Ah,0Fh, 1, text_Row+1, 26h, 16h, …): VerticalListMenu draws normal items in [BP+22h]=0Ah, headers [BP+24h]=0Dh, selection [BP+20h]=0Fh (9D00:0849/09FD); 1058 ecl_SetMem(dest, sel) unconditional | — |
| ECL-07 | entry on bottom line, colour 0Ah; empty text → " " | **DISAGREE** (colour) | 2F00:0978 ReadWordNumber(prompt=empty local, 0Ah); 09C2 ReadBottomLine(empty, 0Ah, 28h). 0Ah is only the **prompt** colour (prompt is empty); typed characters are drawn white 0Fh from col 1 of row 24 (0709:0A81 DrawText(x,24,0Fh,k)); text is upper-cased on return; Esc also returns the typed text (0709:0AEC). " " substitution AGREE (2F00:09E6) | — |
| ECL-08 | p≠FFh not 3D: "frame (3,3)-(13,13) colour 0Fh first"; PIC record at (3,3) or head/body; FFh removes + redraw | **DISAGREE** (wording, as ECL-02) | 2F00:0881..08A2 DrawTitledFrame(3,3,0Dh,0Dh,0,0Fh,''): 0Fh = title colour of an empty title (#ref-3), frame call clears (3,3)-(13,13). Rest AGREE: 08BB `Mem[6DE1]=FFh` → LoadAnimation('PIC',p,0,…) + DrawPictureScreenOrView(3,3,1,…); else ShowHeadBodyPicture 090C. FFh branch redraws only if (g_49F9>1 or travel_Mode=1) and (g_84E0 or g_84E3) (0913..092F) | ECL-08 AGREE (placement at px 24,24) |
| ECL-09 | sprite at size dist+1 (2 outside 3D); close-up at distance 0 in 3D: PIC or portrait; area map switched off | AGREE (note) | 4300:056C size := dist+1; 05C5/05DC Show3DSprite(size|2); 0588 view_AreaMap off; 0606/060F dist=0 and travel_Mode=1. Missing condition: inside ENCOUNTER_MENU the close-up is skipped when `opt_MonsterPics` (g_49F6) = 0 (4300:0619..0620) | ECL-09 AGREE |
| ECL-10 | text window 0Ah; menu `Combat Wait Flee Parlay` (dist 0 or not 3D) / `… Advance`; `Both sides wait.`, `The monsters flee.`; C W F P/A | AGREE | 2F00:2176 DrawWrappedText(1,11h,26h,16h,0Ah,…); 217B..21B8 PARLAY if Mem6B00+582h=0 or 4900+1CCh=0; 21DA MenuSelect(title, menu, 0Dh, 0Ah, 0Fh, acceptEnter 0, animate) — Enter is not accepted; strings at 229A/23B7 with colour 0Ah | ECL-10 AGREE |
| ECL-11 | `Haughty Sly Nice Meek Abusive`, title " " | AGREE | 2F00:25DA title := ' ' (CharToStr 20h); 261D literal; 2624..2633 MenuSelect(' ', menu, 0Dh,0Ah,0Fh, 0, 0) — no Enter, picture not animated | ECL-11 AGREE |
| ECL-12 | monsters → CombatMain + AfterCombat; no monsters and 6E6C=1 → Shop; 6DE2=1 → Temple; duel; 2D panels reloaded outside 3D | **DISAGREE** (missing branch) | 2F00:17A5..17EF: with no monsters and no duel, 6E6C≠1 and 6DE2≠1 → **AfterCombat** directly (treasure/after-combat screen without a fight). Duel: DuelActive takes the combat branch (17AC). Rest AGREE (183D Load24x24Set('BACPAC',0,28h), 1857.. LoadCombatIcon('ICON',0..2, 9..0Bh), 18EF RedrawCurrentMode) | ECL-12 AGREE (combat entry) |
| ECL-13 | `<name> is hit FOR nnn points of Damage.` with nnn right-aligned 3 wide, colour 0Fh; full window → prompt; party dead: titled frame (1,1)-(38,22) 0Fh with title `The END!`, `The entire party is killed!` at (2,2) 0Ah, 3 s | **DISAGREE** (3 points) | (1) 4300:20E6..20FA pushes value, **width 0**, dest, capacity 3 = `Str(dmg:0, s)` into a string[3]: no padding ("is hit FOR 5 points"), values ≥ 1000 keep their first 3 digits (same finding as por-mod-combat; ECL.pas.md 4300:20E6 also says width 3). (2) 2F00:2A41 sets cursor (2,2) but the following DrawWrappedText(1,1,26h,16h,0Ah,**clear=1**,…) (2A4B..2A6C) resets it to (1,1): the text starts at **(1,1)**. (3) that clear wipes cells (1,1)-(38,22) incl. row 1, so the centred title `The END!` drawn by DrawTitledFrame (row y1 = 1, 03F1:035C) is erased immediately — only the border and the message stay visible (H from code; needs a capture). Colour 0Fh of the frame call = title colour only. Rest AGREE (2A71 Delay(3000); 21B2/2A99 ShowBottomPromptAndReadKey(0Fh,'press <enter>/<return> to continue'); 21C3 colour 0Fh) | — |
| ECL-14 | E / PROGRAM 9 → vecC, camp menu, after a rest redraw + vecD, view redrawn | AGREE | 2F00:2DDD vecC; 2DE5 Camp(rested); 2DEF..2DFA only if rested; 2E02 RefreshView | ECL-14 AGREE (camp entry/exit, menu text) |
| ECL-15 | WHO: text window cleared; picker `SelectPartyCharacter` ("Select" / "Exit") with the script string | **DISAGREE** | 2F00:2B6D pushes allowExit = **0** → menu shows `<prompt> Select` only (00BA:2C6A adds ' Exit' only if allowExit). The loop ends on [#13,#27,'E','S'] but HorizontalMenu returns #0 for Esc and never 'E' without an Exit option, so only S / Enter leave (Esc does nothing) | — |
| ECL-16 | PRINT_MEM glyphs (value+1) colour 0Fh at cursor, next row; after CLEAR_BOX and row > 13 restart at (2,5); EXIT redraws box frames | **DISAGREE** (EXIT effect) | PRINT_MEM AGREE: 2F00:2EC0 `row > 0Dh` → col 2,row 5 (2EC7/2ECC), 2EF8 DrawRepeatedGlyph(col,row,0Fh,1,g,0), stop at value 0/FFh (2EF2). EXIT (2F00:0007..0040): DrawTitledFrame(1,1,0Fh,0Fh,…) first **clears (1,1)-(15,15)** (03F1:0312 ClearRectangle) — the text printed into the box is erased at EXIT, then (3D) the inner frame (3,3)-(13,13) is drawn | — |
| ECL-17 | SPRITE_OFF, DELAY, CALL 2C90h/BA03h/C01Eh, PROGRAM 0/8, LOAD_MONSTER | AGREE (M as stated) | 2F00:2AA9 SPRITE_OFF RefreshView if g_84E3; 2726 MessageDelay; 2CF9 `cmp ax,0AC91h` (t−7FFFh) RefreshView + DrawLocationTimeStatus; 2D7B/2D83/2D93 sound g_2628/g_262A; 2DA8 StepForward; PROGRAM 0 PartyCreationMenu, 8 DragonFinale (2E4A/2E5A) | — |

## DISAGREE list (corrections for por-mod-ecl / ECL_SCREENS.md)
1. **ECL-02, ECL-08:** "frame … colour 0Ah/0Fh" → "DrawTitledFrame(3,3,13,13, style 0, title colour 0Ah/0Fh, ''): clears cells (3,3)-(13,13); border glyphs (symbols 114h+3·style, multicolour) one cell outside; the colour argument only colours the (empty) title" (#ref-3 class).
2. **ECL-05:** keys → "hot keys = the capitals of the displayed items; other letters, Space and Esc are ignored; digits 1..9 act as keypad cursor keys (extended → CycleSelectedChar); 0FFh only when a displayed capital that is not a `~` hot key is pressed (un-marked digits are shown as P..Y by MenuHotkeys)". Colour roles: prompt 0Dh, text 0Ah, hot key/selection 0Fh (single item: text and hot key 0Fh).
3. **ECL-07:** colour → "prompt colour 0Ah (prompt is empty); typed characters white 0Fh from column 1 of row 24; Esc also returns the typed text; result upper-cased".
4. **ECL-12:** add "no monsters, no duel and neither shop nor temple flag → AfterCombat (treasure screen) directly".
5. **ECL-13:** "nnn right-aligned, 3 wide" → "number without padding (Str(dmg:0) into string[3]; ≥ 1000 truncated to 3 digits)"; party-dead text at **(1,1)**, and the title `The END!` is erased by the text window clear (frame border + message remain). Same fix needed in ECL.pas.md 4300:20E6 (`Str(dmg:3)` → `Str(dmg:0)` into string[3]).
6. **ECL-15:** "Select" only (allowExit = false); S or Enter selects, Esc does nothing.
7. **ECL-16:** "EXIT then redraws the picture-box frames" → "EXIT redraws the box frame, which first clears (1,1)-(15,15): the PRINT_MEM text disappears at EXIT".

Other finding (ECL.pas.md, not a screen row): 2F00:1215 writes `MenuSelect(hilite, single, colA, colB, $0D, menu, prompt)` "push order", but the pushes (1215..1231) are prompt, menu, 0Dh, colB, colA, single, hilite → Pascal order `MenuSelect(prompt, menu, $0D, colB, colA, single, hilite)` (matches the MenuSelect signature title [BP+14h] first).

## Counts
18 rows (intro + ECL-01..17): **AGREE 10** (intro, 01, 03, 04, 06, 09, 10, 11, 14, 17), **DISAGREE 8** (02, 05, 07, 08, 12, 13, 15, 16), UNSURE 0. Captures consulted: 9 rows, all consistent with the code readings above (the DISAGREEs concern parts the captures did not exercise, or #ref-3 wording).

---

