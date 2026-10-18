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
