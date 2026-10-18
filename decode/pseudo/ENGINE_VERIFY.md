# ENGINE — independent verification (lane por-verify2)

Inputs: `decode/pseudo/ENGINE.pas.md` (SHA-256 fe15e2cd6829aa49…), `ENGINE_SCREENS.md` (908797b5769cedd1…), listings `decode/listings/main_0000/res_*.lst`, bytes via `decode/ecl/hdis.py`, captures `acceptance/ref/DECODE_CHECKS.md`. Method: herdr/assignments/por-verify.md; four independent Opus workers of this lane (A lines 1..997, B 998..2315, C 2316..end, S screens), none of which wrote ENGINE.

## Summary

| step | scope | result |
|---|---|---|
| (1) argcheck | fresh ENGINE_ARGCHECK.md | 620 calls: OK 122, MISMATCH 2, UNSURE 496. Both MISMATCH are tool artefacts: 00BA:206D = two calls on one line (bytes push [261Ch] at 2069 / [261Ah] at 2074 as written); 0802:08BF = `var size` dereference ES:[DI] → `GetMem(size)` correct. 34 UNSURE rows re-read by hand (A 12, B 22): all agree. |
| (2) 10 % sample | seeds 101 / 202 / 303 | A 51/503, B 73/733, C 27/258 = **151 statements: 151 AGREE, 0 DISAGREE, 0 UNSURE** |
| (3) sweeps | call order, signed/unsigned, byte/word, folded indexes, ABS, set tests, string length | A 0 defects, B 0, C 2 (08AE sound data layout) |
| (4) screens | 47 rows ENGINE_SCREENS | AGREE 38, DISAGREE 3 (39, 42, 45), UNSURE 6 (24–28, 32: no-output primitives). 11 rows with captures all consistent; #ref-3 reflected in 07/45/46. |

**DISAGREE total: 5** → fix requests #verify-1..5 (STATUS.md, owner por-mod-engine):
1. **#verify-1** 08AE NoteList (L2833, 08ae:16c1..173f): entries are **3 bytes {chanByte, note, length}** — `chan := e[0] shr 5`, `n := e[1] and $7F` (7Fh = rest), `length := e[2]`; list ends after the entry whose e[1] bit 7 is set.
2. **#verify-2** 08AE ResetChannel (L2815, 08ae:164e..167d): clears words +04..+0C, +10, +12, +16..+24 only; **+0Eh tempo and +14h noteOff are kept**.
3. **#verify-3** ENGINE-39 (00BA:1816): name colour = 0Ch when TChar +10Dh = 0, else 0Eh when +10Eh = 1, else 0Bh (flags, not status).
4. **#verify-4** ENGINE-42 (00BA:1FEB/2171): final MessageDelay only when reps = 0 (no pause after a spell message with GameSpeed > 0).
5. **#verify-5** ENGINE-45 (00BA:272A/27D9): mode 0 full frame only; modes 1/2/4/6 all four frames; **mode 3 no inner frame**; roster+status modes 2/3/4; mode 6 roster without status; mode 1 portrait only; mode 5/others nothing.

Notes (no verdict change): part V of ENGINE.pas.md uses draft callee names differing from engine_names.json (ByteToDecimalString→ByteToStr, WordToDecimalString→WordToStr, AllocatePicture→AllocPicture, DrawClippedPicture→DrawPicture, PresentDirtyRows→FlushViewDirtyLines); L~2503 `Halt_0899_0000` = TerminateGame; DrawPictureInto loop head written `Byte(rowBytes)` but tested signed (its quirk note L1393 covers it); rt_names.json 0AF8:1593 still `System.FileSize` (ENGINE's FilePos is right — por-rt).

---

# ENGINE verify — part A: main_0000 + res_00BA (ENGINE.pas.md lines 1..997) — lane por-verify2

Verifier: por-verify2 fork A (independent; did not write ENGINE). Evidence: `decode/listings/main_0000.lst`, `res_00BA.lst`, bytes via `python -I decode/ecl/hdis.py r00BA START END`, image `decode/bin/ghidra/resident.bin`.

## 1. Random sample (step 2)

Population: 503 anchored statements in lines 1..997. Sample: **51 (10.1 %)**, `random.seed(101)`, `random.sample(statements, 51)` over the anchored lines in file order. Each statement was re-read against the asm at its anchor, plus the pushes before call anchors.

| address (line) | statement | verdict | evidence |
|---|---|---|---|
| 00ba:00e0 (L78) | `plus := w^.plus;` | AGREE | 00e0 LES [bp-4]; MOV AL,es:[di+32h] -> [bp-6]; used with CBW at 01b0 (signed) |
| 00ba:01ad (L87) | `c^.thac0 := c^.thac0 + plus;` | AGREE | 01ad AL=[bp-6] CBW + c^[+110h] (XOR AH) -> byte store +110h |
| 00ba:0214 (L98) | `w := item^.weight;` | AGREE | 0214 MOV AX,word es:[item+37h]; then CMP 0/JC, CMP 96h/JA (unsigned <= 150) |
| 00ba:02af (L115) | `slot := ITEMS[item^.type].slot;` | AGREE | 02af ITEMS base 5582h + type*16, byte +0 -> [bp-2] |
| 00ba:03a6 (L134) | `e := LongInt(c^.encumbrance) - StrWeightAllowance(c);` | AGREE | 03a6 StrWeightAllowance; CWD -> CX:BX; AX=[c+102h], XOR DX,DX; SUB/SBB; low word kept at [bp-2] (pseudo notes low word) |
| 00ba:05da (L170) | `if (shown shr (k - 1)) and 1 > 0 then begin` | AGREE | 05da (shown[bp-2] SHR (k[bp-1]-1)) AND 1; OR AX,AX; JG |
| 00ba:07a1 (L197) | `DrawText($21, y, $0F, 'AC  HP');` | AGREE | 07a1 push 21h, y[bp-6], 0Fh, cs:'AC  HP'; CALLF DrawText |
| 00ba:07bf (L198) | `y := y + 2;` | AGREE | 07bf ADD byte [bp-6],2 |
| 00ba:0861 (L210) | `DrawAC(p, $20 + dx, y);` | AGREE | 0861 push p([bp-2]:[bp-4]), dx[bp-7]+20h, y; CALL DrawAC |
| 00ba:08a0 (L216) | `DrawHP(p, $24 + dx, y, False);` | AGREE | 08a0 push p, dx+24h, y, 0; CALL DrawHP |
| 00ba:08ba (L217) | `y := y + 1;` | AGREE | 08ba INC byte [bp-6] |
| 00ba:0922 (L229) | `if c^.ac > 60 then s := '-' + s;` | AGREE | 0922 CMP byte es:[c+111h],3Ch; JBE skip (unsigned > 60) |
| 00ba:0a21 (L249) | `DrawText($17, y + 1, $0A, 'Hitpoints');` | AGREE | 0a1e INC y; 0a21 push 17h, y+1, 0Ah, 'Hitpoints' |
| 00ba:0ab2 (L257) | `BuildItemName(c, c^.readied[0], 0, 0, False, False);` | AGREE | 0ab2 push c, readied[0] (+CCh/+CEh), 0, 0, 0, 0; CALL BuildItemName |
| 00ba:0c19 (L290) | `g_4846 := 0;` | AGREE | 0c19 XOR AX,AX; MOV [4846h],AX (word) |
| 00ba:0c73 (L298) | `s := ITEMS[it^.type].slot;` | AGREE | 0c73 [5582h + type*16] -> [bp-13h] |
| 00ba:0db3 (L312) | `for k := 1 to 2 do begin` | AGREE | 0db3 MOV [bp-1],1 ... 0e16 CMP [bp-1],2; JNE loop |
| 00ba:0dda (L314) | `c^.dmg_sides[k] := c^.base_dmg_sides[k];` | AGREE | 0dda DL=es:[c+k+A4h] -> es:[c+k+116h] |
| 00ba:0ef2 (L331) | `if it^.readied <> 0 then begin` | AGREE | 0ef2 CMP byte es:[it+34h],0; JZ skip |
| 00ba:0f39 (L337) | `if magicArmour then f[3] := 0;` | AGREE | 0f39 CMP [bp-7] (magicArmour),0; MOV [bp-0Ah] (= f[3], f at bp-0Dh+k per 0e2b) := 0 |
| 00ba:11f3 (L404) | `if c^.str <= 17 then r := c^.str` | AGREE | 11f3 AL=es:[c+10h]; CMP 0/JC; CMP 11h/JA; [bp-1] := str |
| 00ba:1491 (L474) | `k := 0;` | AGREE | 1491 MOV byte [bp-1],0; 1495 CMP 14h/JA (k <= 20) |
| 00ba:14bf (L478) | `k := 21;` | AGREE | 14bf MOV byte [bp-1],15h after clearing es:[sel+k+17h] |
| 00ba:152e (L506) | `exit` | AGREE | 152e JMP to epilogue after ShowBottomPromptAndReadKey |
| 00ba:1554 (L510) | `c^.items := item^.next` | AGREE | 1554 es:[item+2Ah..2Ch] -> es:[c+C8h..CAh] |
| 00ba:165c (L533) | `while p^.next <> nil do p := p^.next;` | AGREE | 165c loop on es:[p+2Ah] OR [p+2Ch] <> 0; p := p^.next |
| 00ba:16b8 (L541) | `ClearRectangle(0, $18, $27, $18);` | AGREE | 16ac push 0, 18h, 27h, 18h; CALLF ClearRectangle |
| 00ba:1731 (L554) | `DrawCharacterName(c, $17, combatRow, false);` | AGREE | 1720 push c([bp+10h]:[bp+0Eh]), 17h, [bp+8], 0; CALL DrawCharacterName |
| 00ba:17d4 (L567) | `MessageDelay;` | AGREE | 17ce CMP [bp+6],0; JZ; 17d4 MessageDelay; 17da ClearCharacterMessage |
| 00ba:1995 (L606) | `Move(CombatIcons[icon, part]^.data[$17], g_6E36^.data[$17 + frame*size], size);` | AGREE | 1974 src = [5E5Ah + icon*8 + part*4]^+17h; dest = g_6E36^ + frame[bp+8]*size[bp-8] + 17h; count [bp-8] |
| 00ba:19d3 (L607) | `Move(CombatIcons[icon, part]^.plane2^, g_6E36^.plane2^[frame*size2], size2);` | AGREE | 19c4 dest = (g_6E36^+13h)^ + frame*size2[bp-6]; count [bp-6] |
| 00ba:1c1b (L643) | `FocusSquare(cx, cy, $FF, 8);` | AGREE | 1c0b push [bp-B7h] (cx), [bp-B8h] (cy), FFh, 8; FocusSquare (cx/cy writers 1bd0/1be0/1bf7/1c07) |
| 00ba:1d22 (L656) | `i := i + 1;` | AGREE | 1d22 INC [bp-B1h] (i) |
| 00ba:1e60 (L668) | `if x0 >= cm_Map^.x0 + 6 then cx := x0 + 3` | AGREE | 1e60 CBW(x0[bp+10h]) vs CBW(map+2)+6; JL (signed) |
| 00ba:1f1e (L676) | `if not InWindow(x1 - cm_Map^.x0, y1 - cm_Map^.y0) then FocusSquare(x1, y1, 3, 8);` | AGREE | 1f1e InWindow(x1[bp+0Ch]-map+2, y1[bp+0Ah]-map+3); JNZ; FocusSquare(x1,y1,3,8) |
| 00ba:1fe0 (L685) | `PresentDirtyRows;` | AGREE | 1fe0 CALLF 0464:1B52 (engine_names FlushViewDirtyLines; alias, see nit) |
| 00ba:2037 (L699) | `if not IsVisible(c, true) then` | AGREE | 202e push c, 1; CALLF IsVisible; OR AL,AL; JNZ |
| 00ba:205e (L700) | `FocusSquare(CombatantCol(c), CombatantRow(c), 3, 8);` | AGREE | 2040 push Col(c), Row(c), 3, 8; CALLF FocusSquare |
| 00ba:211d (L708) | `DrawClippedPicture(px, py, f, 5, g_6E36, g_4A20);` | AGREE | 2105 push ..., f[bp-2Dh], 5, g_6E36, g_4A20; CALLF 0464:0D71 (alias of DrawPicture) |
| 00ba:2171 (L715) | `if reps = 0 then MessageDelay;` | AGREE | 2171 CMP [bp-2Fh],0; JNZ; MessageDelay |
| 00ba:24fa (L792) | `Move(tg_List[i], tg_List[kept], 3);` | AGREE | 24e1 src 6718h+3*i[bp-4], dest 6718h+3*kept[bp-3] (kept INC at 24cd), 3 |
| 00ba:25b2 (L805) | `BuildTargetList(CombatantCol(c), CombatantRow(c), $FF, $FF, CombatantSize(c), cm_Map);` | AGREE | 257f push Col(c), Row(c), FFh(word), FFh, Size(c), cm_Map far ([6718h]:[6716h]); CALLF BuildTargetList |
| 00ba:25c0 (L807) | `i := 1;` | AGREE | 25c0 MOV byte [bp-2FFh],1 |
| 00ba:2629 (L810) | `Move(save, g_671B, $D8);` | AGREE | 261a src SS:[bp-2FEh], dest DS:671Bh, D8h; Move |
| 00ba:27df (L857) | `case g_49F3 of` | AGREE | 27df MOV AL,[49F3h]; CMP 0 ... |
| 00ba:28eb (L871) | `DrawPartyRoster(SelectedChar) end;` | AGREE | 28e2 push SelectedChar; CALL DrawPartyRoster |
| 00ba:2c6a (L927) | `if allowExit then exitItem := ' Exit';` | AGREE | 2c6a CMP [bp+0Ah],0; JZ; StrAssign ' Exit' |
| 00ba:2d05 (L931) | `key := HorizontalMenu(p + ' ', 'Select' + exitItem, $0D, $0A, $0F, true, anim, ext);` | AGREE | 2cbc p+' ', 'Select'+exitItem, 0Dh, 0Ah, 0Fh, 1, [bp-2Ch], @[bp-2Bh]; CALLF HorizontalMenu |
| 00ba:2d2d (L935) | `c := c^.next;  if c = nil then c := PartyHead` | AGREE | 2d26 key='O' (4Fh): c := es:[c+104h]; nil -> PartyHead [5D96h] |
| 00ba:2f7b (L980) | `if lvl > 0 then` | AGREE | 2f7b CMP byte [bp-2],0; JG (signed ShortInt lvl) |
| 00ba:2fc0 (L983) | `2` | AGREE | 2fc0 cls=2: lvl=7 -> r; lvl=6 & str=11h -> r; lvl=5 & str<11h (JAE skip) -> r |

Result: **51 AGREE, 0 DISAGREE, 0 UNSURE.**

Extra (outside the random sample): main body 0000:00F6..0147 re-read in full — ov11_002D; `ParamStr(1)` vs cs:'STING' (`@StrCompare`, JZ skips ov01_0627 + ov02_00FD); ov16_0161; `SetBackdropColours($0B, 0, 7, 6)` pushes 0Bh, 0, 7, 6; ecl_GameLoop; TerminateGame — AGREE.

## 2. Sweeps (step 3), whole range lines 1..997 / units main_0000 + res_00BA

| class | what was scanned | hits | result |
|---|---|---|---|
| call-argument order | argcheck (fresh `ENGINE_ARGCHECK.md`, rows with L ≤ 997): 227 calls — OK 69, MISMATCH 1, UNSURE 157. 12 UNSURE rows (seed 101) re-read by hand: DrawTitledFrame 27C9 (3, 3, 0Dh, 0Dh, 0, 0Fh, ''), ShowBottomPromptAndReadKey 1529 (0Eh, 'Nil Item pointer...'), FocusSquare 2C10 (map.x0+3, map.y0+3, FFh, 8), FreeMem 15EC (item, 3Fh), BuildTargetList 25B2 (Col, Row, FFh, FFh, Size, cm_Map), Move 1995, ByteToStr 2A19, Sign 1DA8, plus 4 intrinsics | 0 | all AGREE |
| argcheck MISMATCH 00ba:206d | `if spell then PlayOrStopSound(g_261C) else PlayOrStopSound(g_261A); { 00ba:206d / 2078 }` | — | **Tool artefact (AGREE).** The line has two calls; argcheck paired the second call's text (g_261A) with the first address. Bytes: 2063 `CMP [bp+0Ah],0; JZ 2074`; 2069 `PUSH [261Ch]; CALLF PlayOrStopSound` (spell ≠ 0); 2074 `PUSH [261Ah]; CALLF` (spell = 0). The pseudocode is correct; the owner may split the line to silence the tool. |
| signed vs unsigned | every JL/JG/JLE/JGE (27 sites) mapped to its statement; every JB/JA/JC/JNC/JBE (134 sites) checked for pseudo claims of signedness / negative values | 0 | Signed sites: item^.plus/plus2 (02F2, 038B, 04D6 ShortInt), EncumbranceMoveLimit `e` Integer compares (03C6..0403), DexDefenseAdj f[4] (0F8E CBW), level/race > 0 (1003, signed; only values < 128 occur), Abs(dx/dy) ≤ 6 (1B6C), px/py window test (1D66), map x0/y0 compares (1E60..1EC5), RacialLevelLimitReached lvl > 0 (2F7B). Unsigned: ApplyDamage hp/dmg/over (2236..2297, `over` byte), AC/HP digit cases, DEX/STR tables, Length() tests. All match the pseudocode. |
| byte vs word operands | widths of every `ES:[DI+x]` field access in res_00BA vs SAVES.md TChar sizes; mixed-width offsets listed | 0 | Mixed widths occur only on non-TChar records (picture +2/+7/+13h far ptr; item +CCh/+F8h/+FCh pointers vs their word halves). TChar 115h/117h/119h are 2-byte arrays read per byte (dmg_dice/sides/bonus[k]), as the pseudo writes. ReadiedWeight g_4846 is a word (0C19, 0C6F): AGREE. |
| folded constant array index | every `g_XXXX` written in the pseudo checked for an operand of that address in its statement's instruction range; arrays read through `[DI+base]` checked | 0 | Only call-anchored statements (pushes before the anchor) were flagged; re-read, all AGREE. `g_25A8[party_Dir]` = table of 3-byte string[2] entries (`party_Dir*3 + 25A8h`; image bytes `01 'N' 00 / 02 'NE' / 01 'E' 00 / 02 'SE' / ...`): AGREE. tg_List entries `6718h + 3*i` (i ≥ 1 → 671Bh): AGREE. CombatIcons `5E5Ah + icon*8 + part*4`: AGREE. f[k] at bp-0Dh+k (f[3] = bp-0Ah): AGREE. |
| ABS idiom (CWD/XOR/SUB, NEG) | all `XOR AX,DX` / `SUB AX,DX` / `NEG` sites | 7 Abs sites | 090A `Abs(c^.ac - 60)` (XOR AH, SUB 3Ch, CWD/XOR/SUB), 1B72/1B81 `Abs(dx/dy) <= 6`, 1DAE/1DDF `Abs(fx/fy) = 3`: all written as Abs. The remaining SUB AX,DX are plain subtractions, as written. No NEG in range. |
| Pascal set tests | all System.@SetIn calls (2) | 2 | 22D7: set constant at 00BA:2208, decoded from the image = `[0, 1]` → `c^.status in [0, 1]`: AGREE. 2C8C: set constant at 00BA:2C1F = `[13, 27, 69, 83]` = `[#13, #27, 'E', 'S']`: AGREE. |
| string length byte | `Length()` statements and string[n] temporaries | 2 | 2978/29D4 `CMP byte [bp-5]/[bp-8],2; JAE` = Length(hh/mm) < 2 on the string[2] results of @StrAssign(…, 2): AGREE. |

## 3. DISAGREE list / fix requests

No semantic DISAGREE in this range.

**ENGINE fix request (naming nit; consistency, not semantics):** part V's convention line (ENGINE.pas.md ≈ L494..497) and its bodies use draft aliases that differ from `decode/names/engine_names.json` and from part U of the same file:
- `ByteToDecimalString` / `WordToDecimalString`: json has ByteToStr / WordToStr, which part U uses (L228).
- `AllocatePicture`: json has AllocPicture.
- `DrawClippedPicture`: json has DrawPicture (0464:0D71).
- `PresentDirtyRows`: json has FlushViewDirtyLines (0464:1B52).

Correction: rename these to the json names in part V (lines ≈ 485..997), so the translator sees one name per routine.

## 4. Summary

- Sample 51/503 (seed 101): AGREE 51, DISAGREE 0, UNSURE 0.
- Sweeps: 7 classes, 0 defects. The argcheck MISMATCH at 00ba:206d is a tool artefact (two calls on one line); the pseudocode is correct.
- Fix requests: 0 semantic, 1 naming nit (part V aliases vs engine_names.json).

---

# ENGINE verification — part B (lines 998..2315: res_03F1, res_042B, res_0464, res_0709)

Verifier: por-verify2 fork (did not write ENGINE). Checked: `decode/pseudo/ENGINE.pas.md` (working tree at HEAD 4cf1297), listings `decode/listings/res_03F1/042B/0464/0709.lst`, image bytes (`decode/bin/START.unpacked.exe`, DS 0C7C) for tables.

## (2) Random sample

Population: 733 statements with a `{ seg:off }` anchor in lines 998..2315. Sample: `random.seed(202); random.sample(population, 73)` (10 %), sorted by line. Each statement was re-read against the instructions from its anchor (call statements: the PUSH sequence since the previous call).

| address | line | statement | verdict | evidence |
|---|---|---|---|---|
| 03f1:0124 | L1016 | `Put8x8Symbol(x2, r, base + 1, 0, 0);` | AGREE | pushes x2 [bp+0Ah], r [bp-1], base+1 (INC of [bp-3]), 0, 0 -> Put8x8Symbol |
| 042b:010e | L1079 | `until g_49CD = 0;` | AGREE | CMP [49CDh],0 / JNZ back (repeat loop) |
| 042b:011a | L1080 | `Close(g_494D);` | AGREE | PUSH DS:494Dh -> System.CloseFile |
| 042b:012e | L1082 | `Assign(g_484D, 'POOL.CFG');` | AGREE | PUSH DS:484Dh, CS:'POOL.CFG' -> AssignText |
| 042b:018b | L1090 | `PrevBiosVideoMode := Regs.AL;` | AGREE | MOV [4A1Ch],AL after INT 10h AH=0Fh |
| 042b:01e1 | L1101 | `HeapEnd := g_4848;` | AGREE | [4848h]:[484Ah] -> HeapEnd 4408h:440Ah (32-bit) |
| 042b:01f2 | L1102 | `SetVideoMode(9);` | AGREE | MOV AL,9 / PUSH / CALL SetVideoMode |
| 0464:0118 | L1215 | `s := name;` | AGREE | name [bp+10h] -> local [bp-100h], StrAssign max FFh |
| 0464:0340 | L1252 | `if pic^.mask <> nil then begin` | AGREE | pic^ +13h/+15h OR / JZ |
| 0464:0362 | L1255 | `for half := 1 to 2 do begin` | AGREE | [bp-21h] := 1, INC loop |
| 0464:036b | L1256 | `for k := 4 to 7 do begin` | AGREE | [bp-20h] := 4 loop |
| 0464:095e | L1338 | `xb := xs*2;  rowBytes := src^.width8*2;  xs := xs*2;  gap := gap*2;` | AGREE | [bp-2]*2 -> [bp-15h]; src+2 *2 -> [bp-6]; [bp-2]*2; [bp-4]*2 |
| 0464:0a84 | L1356 | `Inc(s);  Inc(d);` | AGREE | INC [bp-8] (s), INC [bp-0Ah] (d) |
| 0464:0a92 | L1362 | `if d - 1 > g_4D70[row] then g_4D70[row] := d - 1;` | AGREE | d-1 CMP g_4D70[row]; JBE skip (unsigned) |
| 0464:0aae | L1363 | `d := d + gap;` | AGREE | [bp-4] (gap) ADD to [bp-0Ah] |
| 0464:0b74 | L1366 | `end else if VideoMode = 1 then begin` | AGREE | CMP AL,1 / JZ (EGA branch) |
| 0464:0bb2 | L1370 | `ms := s div 4;  cnt := 4;` | AGREE | s [bp-8] SHR 2 -> [bp-10h]; [bp-11h] := 4 |
| 0464:0d2f | L1385 | `s := s + rowBytes;  d := d + rowBytes;` | AGREE | after Move: [bp-6] added to [bp-8] and [bp-0Ah] |
| 0464:0db8 | L1431 | `if g_5370 <> 0 then begin` | AGREE | CMP [5370h] (ClipPictures),0 |
| 0464:0ede | L1453 | `dstRow := 0;` | AGREE | [bp-1Dh] := 0 (dstRow); [bp-12h] := 0 is dstOff (previous statement) |
| 0464:0f32 | L1459 | `dstOff := dstRow * dst^.width8;` | AGREE | [bp-1Dh] * dst^.width8 (+2) -> [bp-12h] |
| 0464:0fca | L1467 | `skipL := 0;  skipR := 0;  srcOff := 0;` | AGREE | [bp-2], [bp-4], [bp-10h] := 0 |
| 0464:1029 | L1475 | `case VideoMode of` | AGREE | MOV AL,[4A1Eh]; CMP 0 / CMP 2 |
| 0464:1068 | L1481 | `dstX := dstX * k;  dstSkip := dstSkip * k;  srcOff := srcOff * k;` | AGREE | [bp-6], [bp-8], [bp-10h] SHL 1 (k = 2 path) |
| 0464:116c | L1493 | `if saveBg then Move(dst^.pix[dstOff], g_4A24^.pix[bgOff], rowBytes);` | AGREE | flag [bp-21h]; Move pushes dst+dstOff+17h first, then g_4A24^+bgOff+17h |
| 0464:12fe | L1520 | `dstOff := dstOff * 4;` | AGREE | [bp-12h] SHL 2 |
| 0464:134e | L1526 | `g_4AD0[dstRow] := dstCol;` | AGREE | [bp-1Fh] -> g_4AD0[[bp-1Dh]] |
| 0464:140c | L1539 | `Move(src^.pix[srcOff], dst^.pix[dstOff], rowBytes);` | AGREE | Move pushes src [bp+0Ah]+[bp-10h]+17h, dst [bp+6]+[bp-12h]+17h, count |
| 0464:15e9 | L1593 | `Move(p^.cga_map, dst^.cga_map, 8);` | AGREE | Move(p+9, dst+9, 8) |
| 0464:1604 | L1594 | `case VideoMode of` | AGREE | CMP [4A1Eh],0 |
| 0464:1692 | L1604 | `Move(w, dst^.pix[di], 2);` | AGREE | Move(SS:[bp-0Fh], dst+[bp-2]+17h, 2) after MirrorCgaWord |
| 0464:1744 | L1618 | `di := 0;` | AGREE | [bp-2] := 0 |
| 0464:176b | L1621 | `for c := 1 to p^.width8 do begin` | AGREE | 1 .. width8 (+2), JA skip (unsigned) |
| 0464:178e | L1623 | `dst^.pix[di + plane] := ReverseBits(p^.pix[srcEnd - di + rowStart + plane]);` | AGREE | index [bp-4]-[bp-2]+[bp-6]+plane, byte +17h -> ReverseBits |
| 0464:1829 | L1632 | `dst^.mask^[m + p^.width8 - c - 1] := ReverseBits(p^.mask^[m + c]);` | AGREE | mask ptr +13h, index [bp-4]+[bp-0Ah] -> ReverseBits |
| 0464:1a2f | L1688 | `for y := row*8 to row*8 + pic^.height - 1 do` | AGREE | [bp-8] .. [bp-0Ch], JLE (signed Integer loop) |
| 0464:1a76 | L1692 | `Mem[$A000 : g_5050[y] + x] := pic^.data[src];` | AGREE | pic^.data[[bp-10h]] -> A000h:g_5050[y]+x (32-bit add, low word) |
| 0464:1aa5 | L1693 | `src := src + 1;` | AGREE | INC [bp-10h] |
| 0464:1b18 | L1700 | `Move(pic^.data[src], Ptr(g_51E0[y], col*4)^, lineBytes);` | AGREE | Move(pic+[bp-10h]+17h, g_51E0[y]:[bp-6], lineBytes) |
| 0464:1bca | L1719 | `end else if VideoMode = 1 then begin` | AGREE | CMP AL,1 / JZ |
| 0464:1bee | L1723 | `dst := g_5050[line+8] + g_4AD0[line] + 1;` | AGREE | g_5050[line+8] + g_4AD0[line] + 1 -> [bp-8] |
| 0464:1d31 | L1734 | `Port[$3C5] := $0F;` | AGREE | OUT 3C5h,0Fh |
| 0464:1e47 | L1753 | `FillChar(g_4D70, $150, 0);` | AGREE | FillChar(DS:4D70h, 150h, 0) |
| 0464:1e9c | L1772 | `if frame < 0 then begin frame := 0; n := pic^.count end` | AGREE | [bp+0Ch] JGE; := 0; n := pic^+8, else n := 1 |
| 0464:1f51 | L1780 | `if frame < 0 then ... else ...;` | AGREE | same JGE/count test repeated (statement elided as '...', bytes identical to the 1E9C form) |
| 0464:2000 | L1788 | `for x := 1 to lineBytes do begin` | AGREE | 1 .. [bp-33h], JBE (unsigned) |
| 0464:2093 | L1793 | `tmp^.data[dst] := (tmp^.data[dst] and not g_25ED[p])` | AGREE | mask = NOT word g_25E5[p+4] (= word table g_25ED[p]); g_25FA[GetCgaMapEntry(to_[i], tmp^.cgaMap)*4+p] |
| 0464:2174 | L1801 | `for gfx_LoopCounter := frame to frame + n - 1 do` | AGREE | [bp+0Ch] .. frame+n-1 byte, JLE (signed), counter g_70C7 |
| 0464:2248 | L1810 | `tmp^.data[dst+p] := tmp^.data[dst+p] or m` | AGREE | tmp+[bp-2Fh]+[bp-24h]+17h OR [bp-2Ah] |
| 0464:22e5 | L1818 | `hiFrom := from[i] shl 4;  hiTo := to_[i] shl 4;` | AGREE | from[i] [bp-10h+i] SHL 4 -> [bp-34h]; to_[i] [bp-20h+i] |
| 0464:2362 | L1822 | `if (pic^.data[src] and $F0) = hiFrom then` | AGREE | pic [bp+6] data[[bp-22h]] AND F0h CMP [bp-34h] |
| 0464:238e | L1824 | `tmp^.data[dst] := (tmp^.data[dst] and $0F) or hiTo;` | AGREE | tmp^.data[[bp-24h]] AND 0Fh OR [bp-35h] |
| 0464:243a | L1833 | `Move(tmp^.data[0], pic^.data[frame * pic^.frameSize], n * pic^.frameSize);` | AGREE | Move(tmp+17h, pic+frame*frameSize+17h, n*frameSize) |
| 0464:259b | L1869 | `if pic = nil then Exit;` | AGREE | var pic^ OR / JNZ |
| 0464:25c9 | L1871 | `if pic^.mask <> nil then` | AGREE | +13h/+15h OR / JZ |
| 0464:2815 | L1915 | `g_4A28[line] := 1;` | AGREE | g_4A28[[bp-1Eh]] := 1 |
| 0464:281d | L1916 | `ofs := ofs + x0;` | AGREE | [bp-0Eh] (x0) ADD to [bp-16h] (ofs) |
| 0464:2823 | L1917 | `if g_4C20[line] > ofs then begin` | AGREE | g_4C20[line] CMP ofs, JBE (unsigned) |
| 0464:28a0 | L1924 | `ofs := ofs + rowBytes;` | AGREE | [bp-12h] ADD to [bp-16h] |
| 0709:00ff | L2026 | `ResetEgaRegisters;` | AGREE | PUSH CS / CALL ResetEgaRegisters |
| 0709:0449 | L2088 | `Mem[DrawPageSeg : ofs]    := 0;` | AGREE | DrawPageSeg:[bp-4] := 0 |
| 0709:046b | L2093 | `Port[$3C5] := $0F;` | AGREE | OUT 3C5h,0Fh |
| 0709:0641 | L2129 | `if (col > 39) or (row > 39) then Exit;` | AGREE | col [bp+0Eh] / row [bp+0Ch] CMP 27h, JA (unsigned) |
| 0709:0694 | L2132 | `Inc(col);` | AGREE | INC [bp+0Eh] after DrawRepeatedGlyph |
| 0709:07f0 | L2170 | `i := 1;` | AGREE | [bp-103h] := 1 |
| 0709:07fd | L2172 | `if len = 0 then Exit;` | AGREE | length byte [bp-101h] CMP 0 |
| 0709:08a1 | L2178 | `if t[j] <> ' ' then` | AGREE | t[[bp-104h]] CMP 20h |
| 0709:094c | L2182 | `Dec(j);  RenderWrappedRun;` | AGREE | DEC j; CALL RenderWrappedRun (nested, PUSH BP) |
| 0709:0964 | L2186 | `if (text_Row > y2) and (i < len) then begin` | AGREE | text_Row CMP y2 [bp+0Eh] JBE; i < len JNC (unsigned) |
| 0709:0a81 | L2219 | `DrawText(x, 24, $0F, k);` | AGREE | pushes x [bp-2Ah], 18h, 0Fh, CharToStr(k) -> DrawText |
| 0709:0be0 | L2240 | `until code = 0;` | AGREE | code [bp-5Ah] CMP 0 / JNZ back |
| 0709:0dd9 | L2295 | `case VideoMode of` | AGREE | CMP [4A1Eh],0 |
| 0709:0f82 | L2311 | `` | AGREE | PUSH BP / MOV / POP / RETF |

**Sample result: 73 AGREE, 0 DISAGREE, 0 UNSURE.** (#44 is an elided statement `if frame < 0 then ... else ...`; accepted because its bytes are identical to 0464:1E9C, which is written out.)

## (3) Targeted sweeps (whole range)

| class | method | result |
|---|---|---|
| call-argument order | fresh `argcheck.audit('ENGINE')`: this range has 263 calls, 30 OK, 0 MISMATCH, 233 UNSURE. Seeded (202) sample of 22 UNSURE rows re-checked by hand: 10 real calls (Intr($10, g_4A02), MirrorCgaWord, FillChar(BA00h/B800h) ClearScreen, FillChar(B800h:line*160+x1*4) ClearRectangle, Val(s,n,code) = @ValLong(s,@code) -> DX:AX, Put8x8Symbol(c,y2,base+2,0,0), FillChar(g_4A28,A8h,0), Close(g_484D), Move(buf^[8],count,1), FillChar(planeByte,4,0)); the rest are inline intrinsics (Inc/Abs/LongInt/Ord/UpCase) | all AGREE. The ClearScreen row (0709:0CB5) is UNSURE only because the tool pairs the 2nd FillChar of the line with the 1st call; pseudo order BA00h then B800h = asm order. The 2 ENGINE MISMATCH rows (00BA:206D, 0802:08BF) are outside this range. |
| signed vs unsigned | every JG/JGE/JL/JLE in the four units (35 sites) listed with its statement | all consistent: DrawFrame loops (ShortInt), MemAvail 32-bit compare (signed, noted), DrawPicture/FillPictureRect `col/row/x/y < 0` (JGE), the 32-bit clip compares (noted), PutPicture loops (Integer), RecolorPicture `frame < 0` and the byte frame loops (noted signed), FillPictureRect cell loop (ShortInt, noted), DrawWrappedText `j+1 < len` / `(j-i)+text_Col > x2`, ReadWordNumber LongInt range test (65536 accepted). Unsigned sites spot-checked: 0464:0A9F/0B4E/28AF (JBE spans), 0709:0641/0783 (JA), 0709:0964 (JBE/JNC), 03F1:0259 (JBE), 0464:2A1A (JNC). **Consistency note (not counted as DISAGREE):** DrawPictureInto 0464:0A35/0C1F write `for gfx_LoopCounter := 1 to Byte(rowBytes)` while the bytes test signed (JG at 0A40/0C2A); the routine's quirk paragraph (L1393) states the signed test and its effect, so the behaviour is documented. For consistency with DrawPicture (L1496/L1532 `ShortInt(rowBytes)`) the owner may rewrite the two loop heads. |
| byte vs word operands | all direct DS writes in the four units (26 addresses): no address is written with mixed widths; Registers fields Regs.AL/AH/BL/BH = 4A02/4A03/4A04/4A05 used as bytes (042B:0176, 0464:00DB/2A10..2A36, 0709:0074) | AGREE |
| folded constant array indexes | direct DS operands inside tables: 25E5..25F3 (MirrorCgaWord masks, written g_25E5..g_25F3 with values; ConvertPicturePixels/RecolorPicture use word g_25E5[k+4] = word table g_25ED[p], documented L1669); 25F7/25F8/25F9 (= g_25F6[1..3], written `g_25F6[p]` at 0464:1C09/1C4F/1C96/1CDE); 5060 (= g_5050[8], written `g_5060 = g_5050[8]` at 0464:1D37); 5E22 (= hi word of g_5E20, FontPtr nil test 0709:01F4) | AGREE (all recognised as table elements) |
| ABS idioms (CWD/XOR/SUB) | 0464:0DC8, 0EB1, 0EE3, 2656, 2707 | all written `Abs(..)` with the right operand; 2707 `last := h - Abs(y)` (32-bit, low word) incl. its missing "-1" quirk; AGREE |
| Pascal set tests | DrawWrappedText `Punct` = DS:0D16 via @SetExpand(0404h) + @SetIn at 0709:0822/085A/08B0; image bytes `02 70 00 8C` (elements 32..63) = `['!', ',', '-', '.', ':', ';', '?']` | AGREE (set contents and the three tests) |
| string length byte | DrawText `t := s` (StrAssign FFh) + `for k := 1 to Length(t)`; DrawTitledFrame `Length(t) <> 0` ([bp-29h] byte) and `(x1+x2-Length(t)) div 2` (IDIV, signed); ReadBottomLine `x := Length(p)`, `Length(s) < maxLen` (JNC), backspace `Length(s) > 0` (JBE), `Copy(s,1,Length(s)-1)`, String[40] copies (StrAssign 28h); DrawWrappedText `len := Length(t)`, `len = 0` exit; `UpCase(ch) mod 64` (IDIV 40h) | AGREE |

## DISAGREE list

None. (One consistency note above: DrawPictureInto loop heads `Byte(rowBytes)` vs the signed test, which its quirk paragraph already documents.)

## Summary

- Sample: 73/73 AGREE (seed 202, 10 % of 733 anchored statements).
- Sweeps: 7 classes, 0 DISAGREE; argcheck in range 0 MISMATCH (263 calls), 22 UNSURE rows hand-checked, all AGREE.
- Fix requests from this part: none.

---

# ENGINE verification part C — res_0802, res_0899, res_08AE (ENGINE.pas.md lines 2316..end)

Verifier: por-verify2 fork C (did not write ENGINE). Evidence: `python -I decode/ecl/hdis.py r0802|r0899|r08AE START END` (image bytes) and `decode/listings/res_0802.lst / res_0899.lst / res_08AE.lst`; 08AE routines 137C..17AE are not in the export and were read from the bytes only.

## 1. Seeded sample (seed 303)

Population: 258 anchored statements in lines 2316..2875 (first `{ 0802|0899|08AE:oooo }` per line). Sample: 27 (10.5 %), `random.seed(303); random.sample(pop, 27)`.

| # | line | address | statement (abridged) | verdict | evidence |
|---|---|---|---|---|---|
| 1 | 2353 | 0802:00a5 | `Intr($10, Regs)` | AGREE | push 10h, DS:4A02, lcall Dos.Intr |
| 2 | 2367 | 0802:0142 | `BiosPutChars(col, row, colour, 1, t[i])` | AGREE | pushes [bp+0Eh], [bp+0Ch], [bp+0Ah], 1, [bp+di-100h]; near call 0040 |
| 3 | 2384 | 0802:01cf | `key := ReadGameKey` | AGREE | lcall 0899:0059, AL → [bp-2Ah], unused |
| 4 | 2385 | 0802:01d7 | `BiosFillChars(0, 24, 0, 40)` | AGREE | push 0, 18h, 0, 28h; call 0175 |
| 5 | 2405 | 0802:0289 | `ok := FileExists(n)` | AGREE | push ss:[bp-2Ah]; call 02EB; AL → [bp-54h] |
| 6 | 2420 | 0802:032f | `g_49CE := IOResult` | AGREE | lcall IOResult; mov [49CE],ax |
| 7 | 2470 | 0802:064f | `g_557C <> 0` (noPrompt arg) | AGREE | raw byte [557C] pushed; callee only tests `cmp [bp+0Ah],0`, so equivalent |
| 8 | 2471 | 0802:065c | `if ok then begin` | AGREE | or al,al / je 06DA |
| 9 | 2530 | 0802:0953 | `DataSet := n` | AGREE | [bp+6] → [5376] |
| 10 | 2543 | 0802:0968 | empty init | AGREE | 55 89 E5 5D CB |
| 11 | 2555 | 0899:0012 | `Regs.AH := 0; Regs.AL := PrevBiosVideoMode` | AGREE | [4A03] := 0; AL := [4A1C] (= PrevBiosVideoMode) → [4A02] |
| 12 | 2581 | 0899:00f7 | `ReadGameKey := ch` | AGREE | [bp-2] → [bp-1] → AL |
| 13 | 2588 | 0899:010a | JMP 011E skips loop | AGREE | `EB 12` → 011E epilogue |
| 14 | 2631 | 08ae:00df | `if SoundDevice = 2 then Exit` | AGREE | cmp byte [5372],2; jne / jmp 0177 |
| 15 | 2635 | 08ae:0118 | `1: SetSoundOutput(1)` | AGREE | cmp ax,1; push 1; call 181A |
| 16 | 2641 | 08ae:0156 | `if g_5374 > 0` | AGREE | cmp word [5374],0; jbe (unsigned, word) |
| 17 | 2652 | 08ae:0184 | `if SoundDevice <> 2` | AGREE | cmp byte [5372],2; jne 018D |
| 18 | 2653 | 08ae:018e | `InstallSoundTimer` | AGREE | push cs; call 137C |
| 19 | 2663 | 08ae:01b1 | `if mode > 0` | AGREE | cmp word [bp+6],0; jbe 01C4 |
| 20 | 2667 | 08ae:01cb | `g_5374 := mode` | AGREE | [bp+6] → word [5374] |
| 21 | 2689 | 08ae:13d2 | `Port[$61] := Port[$61] and $FC` | AGREE | in al,61h; and al,0FCh; out 61h,al |
| 22 | 2724 | 08ae:1477 | `if cs08AE_01FF = 0 then gate := 0; goto Out` | AGREE | bx := [1FF]; je 14E3 with BL = 0 |
| 23 | 2757 | 08ae:153b | `Port[$C0] := latch xor (Lo(f) shr 4)` | AGREE | ax := [si+8] shr 2; 4× shr al,1; xor al,dl; out C0h |
| 24 | 2771 | 08ae:157c | `ch^.volume := ch^.volume + ch^.volDelta` | AGREE | ax := [si+0Ch]; add [si+0Ah],ax |
| 25 | 2781 | 08ae:15b3 | `if ch^.noteOff <> 0` | AGREE | cmp word [si+14h],0; je 15C8 |
| 26 | 2783 | 08ae:15be | `if noteOff = 0 then envIndex := $10; envCount := 1` | AGREE | dec [si+14h]; jne; [si+18h] := 10h; [si+1Ah] := 1 |
| 27 | 2838 | 08ae:16fb | `dst^.duration := ch^.duration; dst^.noteOff := ...` | AGREE | cx := [si]; [di] := cx; [di+14h] := cx |

Sample result: **27 AGREE, 0 DISAGREE, 0 UNSURE**.

## 2. Sweeps over the range (every routine 0802:0000..0968, 0899:0000..013C, 08AE:0000..182D)

| class | sites checked | result |
|---|---|---|
| call-argument order | all calls of BiosPutChars, BiosWriteString, BiosFillChars, BiosPromptLine, OpenWithPrompt (05FA..0659), OpenDax (0743..0775), CloseDax ×2, AllocBlock, FreeBlock, DaxRleDecode (0920..0935), Seek ×2, BlockRead ×6, @StrLong (Str(comp:0)), GetTime (08ae:0006), StartSpeaker/Psg (all PlayOrStopSound/ResetSound sites), WaitHundredths(10) | AGREE. dataF = [bp-0B3h], dirF = [bp-133h] confirmed by OpenDax's frame ([BP+0Ah] dataF, [BP+6] dirF): directory reads use dirF, data Seek/BlockRead use dataF. |
| argcheck MISMATCH 0802:08bf `GetMem(size)` | 08BF `les di,[bp+0Ah]`; 08C2 `push word es:[di]`; lcall 0AF8:023F; DX:AX → p^ | **false positive (AGREE)**: `size` is a `var` parameter, the push is its dereferenced value (size^ = raw size). Pseudo is right; the tool cannot see var dereference. (Pascal form would be `GetMem(p, size)`; meaning identical.) |
| signed vs unsigned | DaxRleDecode 0533..057A (`jl/jg` signed on ShortInt c: 0..7Eh literal, 81h..FFh repeat, 7Fh/80h no progress); loop `si >= compSize` jae (unsigned word); `comp > 36000` cmp 8CA0h / jbe (unsigned); FilePos(dirF) >= dataStart (0874..087F: signed hi word jl/jle, unsigned lo jbe → LongInt compare); WaitHundredths 00A8..00D4 (signed LongInt `target-now > n` and `now >= target`); `g_5374 > 0`, `mode > 0` (jbe, word unsigned); NoteList `tempo > 1` (byte `cmp al,1 / ja`), `chan > 0` (ja) | AGREE |
| byte vs word operands | Regs fields (AH/AL/BH/BL/DH/DL byte stores, CX word via xor ah); SoundDevice/g_5373 byte; g_5374 word; DataSet byte; DeleteAll `n` is a **Byte** (0389..039E, `mov [bp-201h],al`) — so `Length(a)-Length(b)+1` wraps mod 256 when b is longer than a+1 (e.g. len a = 0, len b = 5 → n = 252, loop runs); NoteList duration `tempo*length` is an 8-bit MUL (`mul byte [bx+1]` with AL = tempo low byte) | AGREE with one precision note (DeleteAll n byte wrap — not a DISAGREE: the pseudo does not claim a type; the only callers pass 1-char `sub`, so n wraps only for a = '' → n = 0, loop skipped). |
| folded constant array indexes | g_2614[DataSet] = 2614h + DataSet×1Eh (061A..0626); g_25D5[colour] (0086); g_0D19[i] (0465, i = 1..10); SpeakerSoundTable 055Fh + snd×8 + 2k (1756..1769); cs08AE_0209[4 - 01D9] (1698, 1781) | AGREE |
| ABS / neg idioms | DaxRleDecode 0580 `neg ax` (count = −c; stored back into the byte c, then `di += c'` = di − c) | AGREE (not ABS; as written) |
| Pascal set tests | ReadGameKey 008B..0099 `g_5373 in [0, 1]` via @SetIn with set constant CS:0033 = 03h | AGREE |
| string length-byte handling | FileExists `n <> ''` = `cmp [bp-2Ah],0` (length byte); BiosWriteString / MakeDosName loops `1 to Length(t)` (ja exit if 1 > len); MakeDosName `Copy(a,1,8)`, UpCase per char; DeleteAll lengths from [bp-100h]/[bp-200h] | AGREE |

Further body checks done in the sweep (not sampled): LoadDaxRecord whole body 0716..0947 AGREE; OpenDax 05CD..06E4 AGREE; OpenWithPrompt / FileExists AGREE; TimeInHundredths_08AE (`Word(m*6000)` quirk: `mul word [bp-8]`, `xor dx,dx`) AGREE; InstallSoundTimer / RemoveSoundTimer / SoundTimerInterrupt (timebomb 13F5..143F, 13 tick divider) AGREE; SpeakerChannelTick 1477..14EB AGREE; StartSpeakerChannels 1742..17AB AGREE; SetSoundOutput AGREE; ChannelStep 157A..160A AGREE; ReadSoundCommands jump table at 08AE:0221 = 164E, 16AC, 16B3, 1645, 162E, 167F for FA..FF — matches the pseudo's case labels.

## 3. DISAGREE list (with corrections)

1. **#verify-C1 — 08AE NoteList entry format (lines 2833..2836, 08ae:16c1..173f).** Pseudo: "2-byte entries {note, length} … chan := note shr 5 … n := note and $7F". Bytes: at 16C4 `DI` already points one past the first byte (`mov bl,[di]; inc di` at 1618/16C1); `chan := BL shr 5` (byte 0), `length = [bx+1]` (byte 2), `n := [bx] and 7Fh` (byte 1), and after the entry `al := [di]; di += 2; test al,80h` (bit 7 of byte 1 ends the list). **Correction:** entries are **3 bytes {chanByte, note, length}**: `chan := entry[0] shr 5`, `n := entry[1] and $7F` (7Fh = rest), `length := entry[2]`, list ends after the entry whose `entry[1]` has bit 7 set; the first entry's byte 0 is the command byte read by the dispatcher (< FAh).
2. **#verify-C2 — 08AE ResetChannel field list (line 2815, 08ae:164e..167d; same body used by FD 1645).** Pseudo: "clear fields 4..24h of the current channel". Bytes clear words **+04, +06, +08, +0A, +0C, +10, +12, +16, +18, +1A, +1C, +1E, +20, +22, +24** only; **+0Eh (tempo) and +14h (noteOff) are kept** (and +0/+2). **Correction:** list the cleared fields explicitly; tempo and noteOff survive FA/FD.

## 4. Notes (not DISAGREE)
- `decode/names/rt_names.json` still labels 0AF8:1593 `System.FileSize` (hdis prints that), while ENGINE.pas.md (and this check: the directory scan compares it with the data-area start, which only terminates if it is the current position) says FilePos. Cross-lane for por-rt/por-tooling, not an ENGINE defect.
- LoadDaxRecord writes the exit as `Halt_0899_0000` while the same file names 0899:0000 `TerminateGame` — cosmetic naming inconsistency (line ~2503).
- Unknowns/Self-check sections reviewed: they are consistent with the bodies; the Self-check claims (part T: LoadDaxRecord signature) are confirmed by this pass.

## 5. Summary
- Sample (seed 303): 27 statements — **27 AGREE / 0 DISAGREE / 0 UNSURE**.
- Sweeps: 8 classes, all AGREE; argcheck MISMATCH 0802:08bf adjudicated **false positive** (var-parameter dereference).
- Body-level DISAGREE found by the sweep: **2** (#verify-C1 NoteList 3-byte entries — behaviour-relevant for a sound port; #verify-C2 ResetChannel keeps +0Eh/+14h).

---

# ENGINE_SCREENS.md — independent screen check (por-verify2, step 4)

Input: `decode/pseudo/ENGINE_SCREENS.md` (47 rows, ENGINE-01..47) as of commit 4cf1297 + working tree. Evidence: `decode/listings/res_*.lst` / `main_0000.lst` (asm pushes, CS `[ps]` literals), image bytes of `decode/bin/START.unpacked.exe` (header 2272 B; DS = image 0C7C0h, code seg S = image S*16), `python -I decode/ecl/hdis.py r08AE` for the non-exported ISR. Captures: `acceptance/ref/DECODE_CHECKS.md` batch 1 (ENGINE-05/07/15/16/34/35/38/39/44/45/46).
Verdicts: AGREE = code (and capture, where present) supports the row; DISAGREE = a concrete contradiction (correction below); UNSURE = not re-derived in full.

| id | claim checked | verdict | code evidence | capture |
|---|---|---|---|---|
| ENGINE-01 | `Please insert startup disk.` WriteLn, key, retry when pool.cfg reset fails | AGREE | 042b:00f4 [ps] + @WriteStr/@WriteLn 00fc/0101, ReadGameKey 0106, `JNZ` 0113 back to 042b:00c3 (Assign/Reset pool.cfg) | — |
| ENGINE-02 | `Unable to find POOL.CFG`, Halt(0) | AGREE | 042b:014b [ps], AssignText/ResetText POOL.CFG 012e/0138, IOResult≠0 → WriteLn + `XOR AX,AX; Halt` 015d/015f | — |
| ENGINE-03 | memory text, n = 18800h − OvrGetBuf (not shortfall), Halt(0) | AGREE | 042b:0216 `MOV AX,8800h; MOV DX,1` − OvrGetBuf compared with MemAvail (0222..022a); error path 023b RestorePreviousVideoMode, literals 0245/026f, @WriteLong of the same 18800h−OvrGetBuf (0252..026a), Halt(0) 0283 | — |
| ENGINE-04 | `Overlay error, program abort!`, text mode, Halt(0) | AGREE | 042b:0288 `CMP [43DCh],0` (OvrResult), 028f RestorePreviousVideoMode, 0299 [ps], 02ad Halt | — |
| ENGINE-05 | cfg 'E'→0Dh, 'T'→9, else 4; BIOS mode restored on exit | AGREE | 042b:0197 `CMP AL,45h` → VideoMode 1, SetVideoMode(0Dh) 01a3; 01c6 `CMP AL,54h` → VideoMode 2, SetVideoMode(9) 01f2; else VideoMode 0, mode 4 0201. TerminateGame 0899:0012..0025 INT 10h AH=0 AL=PrevBiosVideoMode | EGA 320×200, palette agrees |
| ENGINE-06 | STING skips credits + wheel; then main menu, game loop | AGREE | 0000:0111 [ps] "STING" vs ParamStr(1); 011d ov01_0627, 0122 ov02_00FD, 0127 ov16_0161 | — |
| ENGINE-07 | border symbols 114h+3·style (+0 corners, +1 vertical, +2 horizontal) one cell outside; title centred on first inner row, ≤40 chars, colour arg = title only (#ref-3) | AGREE | 03f1:0006..000f dec x1,y1 / inc x2,y2; 0012..001d `style*3+114h`; corners +0 (0038..0086), horizontal +2 (00b0 `INC AX; INC AX`, rows y1/y2), vertical +1 (0104/011c, cols x1/x2). DrawTitledFrame 03f1:02fc StrAssign 28h, 0312 ClearRectangle, 032a DrawFrame(x1,y1,x2,y2,style=[BP+0Ch]), 033a..035c DrawText(col=(x1+x2−len) div 2, row=y1, colour=[BP+0Ah]) | ENGINE-07 corner positions agree; #ref-3 wording present in rows 07/45/46 |
| ENGINE-08 | Ctrl-S toggles sound, STING: Ctrl-D DebugFlag, Ctrl-C quit; type-ahead discarded | AGREE | 0899:0068 `CMP 13h`; 006e..0084 save device, stop, device := 2; 008b..00a1 restore + ResetSound; 00ba StrCompare ParamStr(1) 'STING'; 00c1 `CMP 4` toggles DebugFlag 49F7; 00d4 `CMP 3` → TerminateGame; 00de..00f5 `while (key<>#0) and KeyPressed do key := ReadKey` (applies in all modes; an extended key's second byte is kept) | — |
| ENGINE-09 | id 0 stop+mute, 1 enable, FFh stop, n≥2 → n−1; speaker table 055Fh / Tandy 0607h; 0.1 s cut-off; step 0Ah, door 0Bh | AGREE (count "10 sounds" UNSURE) | 08ae:00f4..0153 (0: Start*Channels(0)+SetSoundOutput(0); 1: SetSoundOutput(1); FFh: both channels 0; device 1 → StartSpeakerChannels(n−1) = 08ae:1742 (reads 055Fh), device 0 → StartPsgChannels(n−1) = 08ae:17ae (reads 0607h)); 015d WaitHundredths(10). Image DS:2628 = 0Ah, DS:262A = 0Bh. Table size per device not re-derived | — |
| ENGINE-10 | dormant `Run-time  Error 209 at 0BAD:0038`, row 0 attr 7, exit 255, never armed | AGREE | ISR 08ae:13f5 `CMP word [cs:01DB],0`; 1402..1408 INT10 AH=0Fh/0; 1419 `AND 7Fh` over 21h bytes at cs:01DD (decoded = the text + LF); 1424..1439 INT10 AH=13h AL=1 BL=7 DX=0; 143b INT21 4CFFh. cs:01DB = 0000 in the image; raw byte scan of seg 08AE finds `DB 01` only at 13F7/13FE (the ISR's own CMP/DEC) → never written (H) | — |
| ENGINE-11 | BIOS row 24: 40 × 0DBh colour 0, message col 0 in 0Eh, key, cleared; EGA both pages | AGREE | 0802:01ac BiosFillChars(0,18h,0,28h) → 0802:0188 char 0DBh, BiosPutChars INT10 AH=9 (0067); BiosWriteString(0,18h,[BP+0Ah],msg) 01cc; ReadGameKey 01cf; clear again 01e4. Both callers push 0Eh (02a1, 082b). EGA: second write to CurrentDrawPage when VideoMode = 1 (00aa..00fc); CGA colour via g_25D5 (0086) | — |
| ENGINE-12 | `Insert disk n in drive X:` yellow row 24, retest until exists; suppressed by g_557C | AGREE | OpenDax 0802:061a `DS:2614 + DataSet*1Eh` (image: "Insert disk 1 in drive " … "8"), +CharToStr(g_547D) 063b, + cs:05CB ":" ; OpenWithPrompt(…, NoDiskPrompt g_557C) 064f; loop 0802:0289..02b3 (FileExists, prompt only when flag = 0) | — |
| ENGINE-13 | `tempsize nnnnn` if packed size > 36000, key, exit | AGREE | 0802:080b `CMP [BP−2Ch],8CA0h` (=36000) JBE; @StrLong 0826, literal 0834, BiosPromptLine(0Eh) 084a, TerminateGame 084d | — |
| ENGINE-14 | `Please insert overlay disk.` WriteLn, key, until game.ovr exists | AGREE | 0802:021d "game.ovr" FileExists 0228; 0239 [ps] WriteStr/WriteLn 0241/0246; ReadGameKey 024b; loop 0253/0257 | — |
| ENGINE-15 | font = 8X8D1 rec C9h; opaque; `UpCase(ch) mod 64`; cells outside 0..39/0..24 skipped | AGREE | LoadTextFont 0709:0187 "8X8d1", 01a0 `MOV AL,0C9h`, Move into FontPtr 01c8. DrawRepeatedGlyph 01e5 `col>27h` / 01eb `row>18h` → exit; 0203..0212 UpCase, IDIV 40h (only when flag [BP+6]≠0; DrawText passes 1, 067d). DrawText 0641 also skips the whole string if start col > 39 or row > 39 | ENGINE-15 agrees |
| ENGINE-16 | EGA index direct; CGA map g_25D5; mode 2 nibble | AGREE | image DS:25D5 = `00 00 00 01 02 02 02 03 03 01 01 01 02 02 03 03` = exactly the listed mapping; used at 0709:0249, 0802:0086 | ENGINE-16 RGB agrees |
| ENGINE-17 | word wrap, punctuation `! , - . : ; ?`, full window → `PRESS ANY KEY TO CONTINUE` 0Dh, typewriter delay GameSpeed×10 ms | AGREE | set DS:0D16 (SetExpand 0404h at 0709:0844/087c/08dc) = bytes `02 70 00 8C` = {'!', ',', '-', '.', ':', ';', '?'}; 0982 `MOV AL,0Dh` + 098b [ps] "Press any key to continue" → ShowBottomPromptAndReadKey (row 24) 0996 + key flush 0999; ClearTextRectangle 09af; RenderWrappedRun 06eb `CMP TextOutputActive,0` / 06f2 GameSpeed × 0Ah → Delay | — |
| ENGINE-18 | row 24 cleared, prompt (0,24) in colour, max 40, one key | AGREE | 0709:0c09 StrAssign 28h, 0c1b ClearGlyphRun(0,18h,0,28h), 0c2e DrawText(0,18h,[BP+0Ah]), 0c31 ReadGameKey | — |
| ENGINE-19 | row 24 cleared, message, GameSpeed×225 ms, cleared | AGREE | 0709:0d8e ClearGlyphRun, 0da1 DrawText(0,18h,[BP+6]), 0da5 MessageDelay = 0dc6 `MOV DX,0E1h; MUL` → Delay, 0db5 ClearGlyphRun | — |
| ENGINE-20 | input: keys ' '..'z', white, from col Length(prompt)+1, BS, Enter/Esc end (Esc keeps), upper-cased, ≤ maxLen | AGREE | 0709:0a38/0a3c range 20h..7Ah; 0a44 `len < [BP+6]`; 0a7e inc col (starts = Length(prompt)) then DrawText(col,18h,0Fh) 0a9c; 0aa1 BS → Copy + ClearGlyphRun(col,18h,0,1); 0aec/0af3 0Dh/1Bh end; 0b0a clear row; 0b31 UpCase loop; 0b5b StrAssign 28h | — |
| ENGINE-21 | ReadBottomLine max 6, repeat until 0..65536, no message | AGREE | 0709:0b8f `MOV AL,6`, ReadBottomLine 0b93, @ValLong 0bae; 0bb9..0bd9 code≠0 or value>10000h or <0 → code := 1 → loop 0be4; result word (10000h → 0) | — |
| ENGINE-22 | ClearTextRectangle / ClearScreen black on both EGA pages; ClearGlyphRun spaces | AGREE | 0709:0e8e/0ea8 FillEgaTextRectangle(…,page 0/1); 0cf7/0d0d ClearScreen pages 0/1 (CGA/mode 2 FillChar B800/BA00/BC00/BE00); 0618 ClearGlyphRun = DrawRepeatedGlyph(…, 20h, …) | — |
| ENGINE-23 | INT10 AH=0 mode switch; RestorePrevious before fatal "Unable to load…" texts | AGREE | 0464:00d5..00f6 Prev := Cur; INT10 AH=0 AL=[BP+6]; Cur := mode. 0464:00ff calls SetVideoMode(Prev). Callers (listing header): InitConfiguration, Load24x24Set, Load3DMap, Load8x8Set, LoadWallSet, Put8x8Symbol, Show3DSprite. Note (quirk, not in the row): SetVideoMode overwrites Prev first, so a second RestorePreviousVideoMode would switch back to the graphics mode | — |
| ENGINE-24 | LoadPicture / ConvertPicturePixels draw nothing | UNSURE | not re-derived beyond "no video segment write in 0464:0111" | — |
| ENGINE-25 | DrawPictureInto marks dirty lines, no screen output | UNSURE | not re-derived | — |
| ENGINE-26 | DrawPicture composes into g_4A20, dirty spans, flag bit 2 saves to PicSaveBuffer | UNSURE | consistent with callers (00ba:2140 restores from g_4A24 = PicSaveBuffer); body not re-derived | — |
| ENGINE-27 | MirrorPicture no output | UNSURE | not re-derived | — |
| ENGINE-28 | 1484/1509/1596 no output | UNSURE | not re-derived | — |
| ENGINE-29 | PutPicture opaque frame 0 at (col*8,row*8) direct to video (g_4EC0 CGA / A000h EGA / g_51E0 mode 2) | AGREE (opacity/frame-0 UNSURE) | 0464:19ce `[DI+4EC0h]` (VideoMode 0), 1a83 `MOV AX,0A000h` (1), 1b2b `[DI+51E0h]` (2) | — |
| ENGINE-30 | view picture 168 lines shown at pixel (8,8); EGA via A000:2000, write mode 1 | AGREE | 0464:1bc0 / 1d27 / 1da9 / 1e1e `CMP [BP−2],0A7h` (lines 0..167); 1b8b/1bf1/1de8 `ADD AX,8`; 1c2f.. `MOV AX,0A200h`, 1d40/1d46 GC ports 3CEh/3CFh, 1d73 A000h | VIEW-06 combat map 168×168 at (8,8) agrees |
| ENGINE-31 | FillPictureRect backdrop x=2 cells, y=16 lines, w=11 cells, h=43 | AGREE | argument values from VIEW DrawBackdrop (b100:0198 pushes 2Bh, 0Bh, 10h, 2) | VIEW-01 sky starts (24,24) = (8+2·8, 8+16), width 88 = 11 cells — agrees |
| ENGINE-32 | RecolorPicture no drawing, random partial mix | UNSURE | not re-derived (COMBAT ov18 cites 0464:207A..2091 Random(4)) | — |
| ENGINE-33 | SetEgaPaletteRegister INT10 AX=1000h, one register, instant | AGREE | 0464:2a10 AH=10h, 2a15 AL=0; BH (4A05h) := colour [BP+6] (+8 when ≥ 8), BL (4A04h) := index [BP+8]; Intr($10) 2a41 | — |
| ENGINE-34 | x0 = 1 if mode 0 else 17; "Name" (x0,2) 0Fh, "AC  HP" (33,2) 0Fh; rows from 4; line cleared; selected 0Fh else DrawCharacterName; AC ends col 34, HP ends col 38, HP 0Eh when hp<hp_max; row after last cleared | AGREE | 00ba:076d..077a x0 1/11h; 078a..079c DrawText(x0,2,0Fh,"Name"); 07a1 `MOV AL,21h` "AC  HP" 0Fh; 07bf row += 2; 07ea ClearRectangle(x0,row,26h,row); 07f5..080f selected → DrawText 0Fh, else 0828 DrawCharacterName(c,x0,row,0); AC dx by +111h ranges (0833..085d), DrawAC(col 20h+dx) 0875 (colour 0Ah at 095f, "-" when +111h > 3Ch 0925); HP dx by +11Bh (0880..089c), DrawHP(col 24h+dx, 0) 08b7 → colour 0Eh if +11Bh < +32h (0985..098b) else 0Ah (override 0Dh if flag, unused here); 08e2 clear after the loop | ENGINE-34 agrees |
| ENGINE-35 | combat panel cols 23..38 rows 1..21 cleared; name row 1; "Hitpoints" (23,3) 0Ah + value (33,3); "AC" (23,5) + value (26,5); weapon (23,7)-(38,9); status name if not active, else "(Helpless)" | AGREE | 00ba:09f5 ClearRectangle(17h,1,26h,15h); 0a1b ShowCharacterMessage(c,' ',1,false); 0a3d DrawText(17h,3,0Ah,"Hitpoints"), 0a56 DrawHP(21h,3); 0a79 DrawText(17h,5,0Ah,"AC" cs:09D5), 0a8f DrawAC(1Ah,5); 0aa8 readied +CCh ≠ nil → BuildItemName, 0afb DrawWrappedText(17h,7,26h,9,0Ah,1); 0b0c `+10Dh = 0` → DrawText(17h,row,0Fh, DS:1047+status*13) (Okay…Gone, image); else 0b45 IsHelpless → "(Helpless)" 0Fh | ENGINE-35 agrees |
| ENGINE-36 | item name parts " Yes  "/" No   ", "* " with Detect Magic (effect 5) and magical, count, words, plural "s" | AGREE (plural exceptions UNSURE) | 00ba:0460/0475 literals; 04ad HasEffect(…,5,…) and +32h/+33h/+36h tests 04df..04f3, cs:043B "*" + 043D " "; 0555 ByteToStr count + " "; 06eb cs:043F "s" after type/plural tests 0686..06d4 (exact exception list not re-derived); 0748 DrawText colour 0Ah when [BP+6] ≠ 0 | — |
| ENGINE-37 | ShowTimedBottomMessage row 24 colour 0Ah, pause, clear | AGREE | 00ba:16b8 ClearRectangle(0,18h,27h,18h), 16cb DrawText(0,18h,0Ah), 16d0 MessageDelay, 16e1 clear | — |
| ENGINE-38 | combat: clear (23,row)-(38,21), name (23,row), message (23,row+1)-(38,21) 0Ah; else frame (1,17)-(38,22) unless g_6DDA, name row+1, message row+2; wait → pause + clear (23,10)-(38,21) / (1,18)-(38,22) | AGREE | 00ba:1707 mode 5: 171b ClearRectangle(17h,[BP+8],26h,15h), 1731 DrawCharacterName(c,17h,row,0), 1750 DrawWrappedText(17h,row+1,26h,15h,0Ah,1). Else 1757 `g_6DDA=0` → winrow 11h + DrawFrame(1,11h,26h,16h,0) 177b; g_6DDA≠0 → winrow 12h, no frame; 178e ClearRectangle(1,winrow,26h,16h); 17a8 name (1,winrow+1); 17c9 message (1,winrow+2)-(38,22); 17ce wait → MessageDelay + ClearCharacterMessage (17ed (17h,0Ah,26h,15h) / 1800 (1,12h,26h,16h)). Note: outside combat the row parameter is unused (window row 17/18) | ENGINE-38 name (1,18), message (1,19) agree |
| ENGINE-39 | names: party 0Bh, side-1 0Eh, inactive (dead/unconscious) 0Ch, optional "'s" | DISAGREE (criterion) | 00ba:181f `+10Dh = 0` → 0Ch; 1830 `+10Eh = 1` → 0Eh; else 0Bh; 1858 flag → append cs:1813 "'s" at col+Length(name) | active names cyan agrees (only case tested) |
| ENGINE-40 | "is fully healed"/"is partially healed" character message with pause; roster redrawn outside combat | AGREE | 00ba:235b `+11Bh = +32h`; 2361/2376 literals; 239b ShowCharacterMessage(c,s,0Ah,true); 239e mode ≠ 5 → DrawPartyRoster 23ae | — |
| ENGINE-41 | "Nil Item pointer..." / "Tried to Lose item & couldn't find it!" 0Eh, key | AGREE | 00ba:1517/151f/1529 and 15a6/15ae/15b8 ShowBottomPromptAndReadKey colour 0Eh | — |
| ENGINE-42 | combat sparkle: scroll to the character, sound 261C/261A, side-panel message, 4 frames ×70 ms, repeated g_49E2+1 times for spells, **then pause** | DISAGREE (pause) | 00ba:2037/205e FocusSquare only if not visible; 2069/2074 PlayOrStopSound(spell ? g_261C : g_261A); 208f ShowCharacterMessage(c,t,0Ah,false); 2098 reps := GameSpeed if spell else 0; loop 20e4..2161 four frames, Delay(46h) 2127; **2171 `CMP reps,0; JNZ` → MessageDelay only when reps = 0**; outside combat 2190 ShowCharacterMessage(…,0Ah,true) | — |
| ENGINE-43 | 4-frame animation moves in thirds of a square, scrolling the window | AGREE (M) | 00ba:1aaa LineInit/LineStep (ov30), 1c96/1ca6 `IDIV 3`, 1c1b/1eed/1f35 FocusSquare, frame draw 1cd4 + flush + Delay | — |
| ENGINE-44 | row 15 cols 17..38 0Ah: `X,Y DIR HH:MM` + " camping"/" search"; overland 3/4 add 13/26 to X; coords hidden when [49FB]≠0; DIR from DS:25A8 | AGREE | 00ba:2922 travel_Mode>1 → ECL x/y (+186h/+188h), 2948 +0Dh (=3), 2953 +1Ah (=4); hh/mm with '0' padding 2978/29d4; 2a06 `[4900+1F6h] = 0` (VM 49FB) → "x,y "; 2a6e DS:25A8 + 3·dir (string[2] records: N, NE, E, SE, …, image); 2acd mode 2 → " camping" else search flag → " search"; 2b42 ClearRectangle(11h,0Fh,26h,0Fh), 2b55 DrawText(11h,0Fh,0Ah) | ENGINE-44 "15,4 W 10:50" at (17,15) + CAMPING agrees |
| ENGINE-45 | mode redraw: frames (1,1)-(38,22), (1,17)-(38,22), (1,1)-(15,15), inner (3,3)-(13,13), style 0, colour arg 0Fh; per mode portrait/camp PIC 1Dh/3D/PIC 1, **plus roster and status line** | DISAGREE (per-mode set) | DrawStandardFrames 00ba:2751/2777/279d frames, 27a2 inner (3,3,0Dh,0Dh) **only if [BP+6]**; RedrawCurrentMode: mode 0 (27e6..2807) only the full-screen frame; 1 (2813) frames+inner, LoadPortrait/DrawPortrait(3,3,1), **no roster/status**; 2 (283c) inner, PIC 1Dh, roster, status; 4 (2878) inner, RefreshView, roster, status; **3 (289a) `MOV AL,0` → no inner frame**, RefreshView, roster, status; 6 (28b8..) inner, PIC 1, roster, **no status**; 5 and others nothing | ENGINE-45 camp picture/roster agree; #ref-3 wording present |
| ENGINE-46 | combat: frames (1,1)-(21,21) and (23,1)-(38,21), style 0, colour arg 0, rows 23..24 cleared, map redrawn | AGREE | 00ba:2b8e PaletteFlashOn (ov31, not mentioned in the row), 2bb4 DrawTitledFrame(1,1,15h,15h,0,0,''), 2bda (17h,1,26h,15h,0,0,''), 2beb ClearRectangle(0,17h,27h,18h), 2c10 FocusSquare(…,FFh,8) | ENGINE-46 geometry agrees; #ref-3 wording present |
| ENGINE-47 | party picker: `<prompt> ` + `Select` [+ ` Exit`], colours 0Dh/0Ah/0Fh, animate in mode 2/6; S/Enter select, E exit (nil), Esc leave, ext 47h prev / 4Fh next (wrap) | AGREE | 00ba:2c70 " Exit" if allowExit; set cs:2C1F = [#13,#27,'E','S'] (bytes `00 20 00 08 … 20 00 08`); 2ca4/2cab mode 2/6 → anim; 2ccc " " + 2cdc "Select"; 2cf0..2cf9 0Dh,0Ah,0Fh,1 → HorizontalMenu 2d05; ext 2d29 'O' (4Fh) next/wrap to PartyHead, 2d57 'G' (47h) previous/wrap to last; 2dd6 'E' or 2ddc #0 → nil | colour roles per #ref-2 (hotkeys white, text green) |

## DISAGREE — corrections for the ENGINE owner

1. **ENGINE-39** (00BA:1816): the colour rule tests flags, not the status. Write: "0Ch light red when `TChar.active` (+10Dh) = 0; else 0Eh yellow when +10Eh = 1 (side 1); else 0Bh light cyan." (Whether `active = 0` coincides with dead/unconscious is a SAVES question.)
2. **ENGINE-42** (00BA:1FEB / 2171): the final pause (`MessageDelay`) runs **only when reps = 0**, i.e. for non-spell messages or GameSpeed 0. A spell message with GameSpeed > 0 has no pause after the repeats. Outside combat (mode ≠ 5) only `ShowCharacterMessage(c, s, 0Ah, wait = true)`.
3. **ENGINE-45** (00BA:272A / 27D9): the frame set and extras depend on the mode. Mode 0: only the full-screen frame (1,1)-(38,22). Modes 1, 2, 4, 6: all four frames incl. inner (3,3)-(13,13). **Mode 3: no inner frame** (DrawStandardFrames(false), 00ba:289a). Roster + status line: modes 2, 3, 4. Mode 6: roster but no status line. Mode 1: portrait only (no roster/status). Mode 5 and others: nothing.

Notes (no verdict change): ENGINE-23 — SetVideoMode sets Prev := Cur before switching, so RestorePreviousVideoMode toggles (a second call returns to graphics). ENGINE-46 — `PaletteFlashOn` (ov31) runs first. ENGINE-15 — DrawText also skips the whole string when the start row is > 39 (not > 24); the per-cell check in DrawRepeatedGlyph is row ≤ 24.
Out of scope (argcheck, ENGINE_ARGCHECK.md): both MISMATCH rows (00ba:206d, 0802:08bf) are tool artefacts — two calls written on one line (the bytes push 261Ch at 2069 and 261Ah at 2074, matching the pseudocode), and a var parameter dereference `ES:[DI]` for `GetMem(size)`.

## Counts
47 rows: **AGREE 38** (incl. 4 with a partial UNSURE detail: 09, 29, 36, 43), **DISAGREE 3** (39, 42, 45), **UNSURE 6** (24, 25, 26, 27, 28, 32). Capture cross-checks: 11 rows with captures, all consistent with the code; #ref-3 is reflected in rows 07, 45, 46.

---

