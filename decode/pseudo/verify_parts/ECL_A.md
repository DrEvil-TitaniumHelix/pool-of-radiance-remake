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
