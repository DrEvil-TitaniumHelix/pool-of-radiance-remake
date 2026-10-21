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
