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
