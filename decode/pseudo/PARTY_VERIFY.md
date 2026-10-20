# PARTY_VERIFY — independent verification of PARTY.pas.md / PARTY_SCREENS.md (lane por-verify)

Input: `decode/pseudo/PARTY.pas.md` (now owned by por-verify2), `PARTY_SCREENS.md`, `decode/data/SAVES.md`, `acceptance/ref/DECODE_CHECKS.md` and captures. Method as COMBAT_VERIFY.md (herdr/assignments/por-verify.md); four verifier workers of this lane (Q3 ov17+ov11+ov01+ov00+ov02+resident anchors, Q4 ov21+ov20+ov06, Q2 ov12, Q1 ov16); the one defect re-checked by the lane on the bytes.

## Summary

| item | result |
|---|---|
| argcheck (scratch copy of `decode/tools/argcheck.py`) | 1,015 calls: OK 221, MISMATCH 0, UNSURE 794; extra hand checks of UNSURE calls with constant/string arguments: 61 (Q1 14, Q2 10 + 88 compared mechanically, Q3 11, Q4 26) — all agree with the push order |
| sample | **seed 20261018**, 238 of 2,371 anchored statements (10%): **238 AGREE, 0 DISAGREE, 0 UNSURE** (ov16 75, ov12 58, ov17 32, ov21 28, ov11 16, ov20 15, ov01 7, ov06 3, resident 4) |
| sweeps (arg order, signed/unsigned, byte/word, folded array indexes, ABS idiom, set tests, string length bytes, file record sizes) | 1 finding (signed compare, below); all 26 BlockRead/BlockWrite counts match SAVES.md; 13 set constants match; ABS idioms written as Abs |
| screens PARTY rows | 89 checked (ov16 26, ov12 30, ov17/11/01/00/02 15, ov20/21/06 18): all AGREE; captures ENGINE-29 (ov01-01) and ECL-14-REST (ov20-01) match |
| MAGIC-14 open item (rest-time arithmetic, ov20) | agrees: 5 game minutes per rest step on both clocks, daily healing every 288 steps, study 15 min per spell level, interruption every [6DD2] steps when Roll(1,100) <= [6DD3]; the preset formula itself is in ov15 (MAGIC) |

## Fix requests (posted in STATUS.md)

- **party fix request #verify-1** (owner por-verify2) — `5c00:035A` (PARTY.pas.md L3237, CON-increase HP bonus): written `c^.level[2] <= 0`; bytes `CMP byte ES:[DI+98h],0 / JLE 0371` = signed: `ShortInt(c^.level[2]) <= 0` (differs only for fighter level >= 128).

## Details per unit

## ov17 (7500) — save/load, roster, character files, monster load

### Sample (seed 20261018) — 32 statements

| line | address | statement (short) | verdict | evidence |
|---|---|---|---|---|
| L1552 | 7500:0024 | EnsureSaveDir | AGREE | `E8 87 02` near call 02AE EnsureSaveDir |
| L1562 | 7500:0118 | p := PartyHead | AGREE | MOV AX/DX,[5D96/5D98] → [bp-0Ch] |
| L1580 | 7500:0240 | node := list | AGREE | [bp+6]/[bp+8] → [bp-4] |
| L1582 | 7500:0254 | if node^.text[1] <> '*' then WriteLn(t, text) | AGREE | `CMP byte es:[di+1],2Ah / JE 0276`; @WriteStr width 0 (XOR AX,AX push) + @WriteLn |
| L1610 | 7500:03c1 | else if VideoMode = 1 | AGREE | AL = [4A1E] VideoMode (0335), `CMP AL,1` |
| L1632 | 7500:05a8 | toCol[IconColourSlot[i]] := icon_colours[i] and $0F | AGREE | `es:[c+i+0C0h]` (icon_colours 1-based at +C1), `AND AL,0Fh`, index `[di+3CF5]`, store `[bp+di-23h]` |
| L1640 | 7500:0669 | FUN_0899_0104 | AGREE | CALLF 0899:0104 |
| L1649 | 7500:06a5 | nm := name (string[8]) | AGREE | StrAssign max 8 into [bp-9] |
| L1656 | 7500:071a | FillChar(node^, $2E, 0) | AGREE | push node, 2Eh, 0 → FillChar |
| L1678 | 7500:08fa | Assign(f, base + '.itm'); Erase(f) | AGREE | StrCopy base + `cs:".itm"` |
| L1692 | 7500:0a20 | if c.effects <> nil | AGREE | `es:[c+7Fh] or [c+81h]`, JNE |
| L1695 | 7500:0a7a | while e <> nil | AGREE | [bp-0C1h] or [bp-0BFh], JE exit |
| L1696 | 7500:0a84 | BlockWrite(f, e^, 9) | AGREE | push f, e^, 9, nil result → BlockWrite |
| L1709 | 7500:0b0d | nm := SavePath + MakeDosName(nm) | AGREE | StrCopy DS:537A + … |
| L1710 | 7500:0b42 | prompt := 'Put save disk in ' + SavePath[1] + ':' | AGREE | `cs:"Put save disk in "`, `MOV AL,[537B]` (SavePath[1]) CharToStr |
| L1714 | 7500:0bfb | ok := OpenWithPrompt(nm + ext, prompt, False, f) | AGREE | push name, prompt [bp-1B8h], AL=0, f [bp-180h]; signature (name, prompt, noPrompt, var f) |
| L1726 | 7500:0d14 | BlockRead(f, it^, $3F, got) | AGREE | push f, it^, 3Fh, @got |
| L1741 | 7500:0e2d | e^.next := nil | AGREE | words es:[e+5], [e+7] := 0 |
| L1799 | 7500:120f | if ofs < size then GetMem(it^.next, $3F) … | AGREE | `CMP [bp-8],[bp-2]; JAE` (unsigned), GetMem 3Fh → es:[it+2Ah/2Ch] |
| L1811 | 7500:1268 | if Mem6B00.w[$67C] > 7 then Exit | AGREE | `CMP word es:[+67Ch],7; JBE` (unsigned) |
| L1836 | 7500:144c | c^.party_slot := $FF | AGREE | `MOV byte es:[c+0BFh],0FFh` |
| L1838 | 7500:145e | PartyHead := c | AGREE | (also SelectedChar := c next, written in the pseudo) |
| L1841 | 7500:147a | p := PartyHead | AGREE | |
| L1843 | 7500:14ab | p^.next := c | AGREE | es:[p+104h/106h] := c |
| L1846 | 7500:14cf | p := PartyHead | AGREE | |
| L1900 | 7500:19f7 | p := PartyHead | AGREE | → [bp-1CDh] |
| L1911 | 7500:1b8c | while SelectedChar <> nil | AGREE | [5D92] or [5D94], JE |
| L1916 | 7500:1bc1 | DataSet := Mem6B00.b[$624] | AGREE | byte es:[+624h] → [5376] |
| L1922 | 7500:1c13 | g_6AAE[i*4] := Mem4900.w[$3F2+2i] | AGREE | index i+4AF9h → byte offset 2*(1F9h+i) = 3F2h+2i; store `[di*4+6AAE]` |
| L1923 | 7500:1c39 | g_6AB0[i*4] := Mem4900.w[$3F8+2i] | AGREE | i+4AFCh → 3F8h+2i |
| L1953 | 7500:1e95 | Mem4900.w[$3F2+2i] := g_6AAE[i*4] | AGREE | reverse of 1C13 |
| L1966 | 7500:1fc9 | BlockWrite(f, game_Mode, 1) | AGREE | push f, DS:49F3, 1, nil |

### Extra argument-order checks (argcheck UNSURE)

| address | call | verdict | push sequence |
|---|---|---|---|
| 7500:0549 (L1628) | OverlayIconPicture(CombatIcons[11].pose1, CombatIcons[slot].pose1) | AGREE | `PUSH [5EB8]; PUSH [5EB6]` (src first) then the slot-indexed dst; callee (src [BP+0Ah], dst [BP+6]) |
| 7500:1c94 (L1925) | LoadWallSet(Lo(g_6AAE[i*4]), Lo(g_6AB0[i*4])) | AGREE | push [6AAE+i*4] then [6AB0+i*4]; LoadWallSet(id, slot) |

### Sweeps

| class | checked sites | findings |
|---|---|---|
| call-argument order | sample (12 calls) + 2 extra + all 26 BlockRead/BlockWrite | none |
| signed vs unsigned | all 6 signed jumps (12CA JLE = `ShortInt(level[i]) > 0`; 1C70 JL = `Integer(g_6AAE) >= 0`; 2392/239E/23B9/23C5 wrap tests `< 0` / `> 15`) and the 6 CBW sites (gender index, 132B..13FA) | none — all written signed where the code is signed |
| byte vs word | 1BC1 byte read of a word slot (`.b[$624]`), 1C7E/1C8F `Lo()` byte pushes, 1268 word compare | none |
| folded constant array indexes | 1C13/1C39/1E95 (`+4AF9h`/`+4AFCh` folded bases), NPC picture tables 08C7/08D7/08E1/08EB/08F5 (`[gender*5 + Roll]`, 1-based), 05C2 `[di+3CF5]` | none |
| ABS idiom | no NEG in ov17 | — |
| Pascal set tests | CS:1426 = [0..7] (14F2), CS:159F = ['A'..'J'] (16F0), CS:1CEB = [#0,'A'..'J'] (1DAF) — decoded from the image bytes | none |
| string length bytes | SavePath[1] = DS:537B (0B58), nm string[8] (06AF), DataPath length byte | none |
| file record sizes vs SAVES.md | character 11Dh, item 3Fh, effect 9 (write 08C6/09A5/0A98, read 0C44/0D2A/0E28); SAVGAM 1, 800h, 800h, 400h, 1E00h, 5, 1, 1, 1 (count), 148h (read 17EA..18DA, write 1F30..20B4) | all agree with SAVES.md §1/§2 |

### Screens (PARTY-ov17-01..08)

| id | verdict | evidence |
|---|---|---|
| ov17-01 | AGREE | `cs:"Put save disk in "` at 020C, 02F2, 087C, 1E30 (+ SavePath[1]) |
| ov17-02 | AGREE | OpenWithPrompt(…, False, f) at 0C26 (and 0D0B/0E09); prompt text built at 0B48 |
| ov17-03 | AGREE | `cs:"Load Which Game: "` 16B8; HorizontalMenu colours pushed 0Dh, 0Ah, 0Fh, 0, 0 (16C8..16D4); exit set CS:159F = ['A'..'J'] |
| ov17-04 | AGREE (text) | "Loading...Please Wait" path not re-read in detail (LoadEclBlock-style DrawText) |
| ov17-05 | AGREE | `cs:"Save Which Game: "` 1D65; key set CS:1CEB = [#0,'A'..'J'] |
| ov17-06 | AGREE | `cs:"Saving...Please Wait"` 1E7B; DrawText(0, 18h, 0Ah, s) pushes 0, 18h, 0Ah (1E6C..1E74) |
| ov17-07 | AGREE | `cs:"Unable to load monster"` 0F3A, colour `MOV AL,0Fh` 0F32 |
| ov17-08 | AGREE | `cs:"Save and exit  Insert disk #"` 2320 + StrLong; HorizontalMenu colours 0Dh/0Ah/0Fh (2356..235C) |

DISAGREE: none.

## ov11 (5700) — game-state initialisation

### Sample — 16 statements

| line | address | statement (short) | verdict | evidence |
|---|---|---|---|---|
| L332 | 5700:0038 | GetMem(ecl_Mem4900, $800) | AGREE | `MOV AX,800h; PUSH` (0034) → GetMem → [49D2] |
| L335 | 5700:0068 | GetMem(ecl_CodeBuf, $1E00) | AGREE | `MOV AX,1E00h` (0064) → [49DE] |
| L341 | 5700:00e7 | AllocPicture($18, 3, 1, 0, PicSaveBuffer) | AGREE | push 18h, 3, 1, 0, @DS:4A24 |
| L344 | 5700:011a | FillChar(view_SpanFirst, $150, $FF) | AGREE | push DS:4C20, 150h, 0FFh |
| L353 | 5700:01b0 | m2_LineSeg[InitIdx] := $B800 + (InitIdx shr 2)*10 | AGREE | SHR AX,1 ×2, MUL 0Ah, ADD 0B800h |
| L374 | 5700:031c | TreasureItems := nil | AGREE | [6810]/[6812] := AX (0) |
| L380 | 5700:0355 | g_6AB2 := 0; g_6AB4 := 1 | AGREE | |
| L386 | 5700:0392 | opt_Portraits := 1 | AGREE | [49F5] := 1 |
| L388 | 5700:039c | DebugFlag := 0 | AGREE | [49F7] := 0 |
| L394 | 5700:03c0 | ecl_PC := $9900 | AGREE | |
| L397 | 5700:03d0 | DataSet := 1 | AGREE | [5376] := 1 |
| L406 | 5700:0405 | menu_Top := 1 (word) | AGREE | `MOV word [6B29],1` |
| L420 | 5700:045b | SoundTransientMode := 0 | AGREE | word [5374] := 0 |
| L424 | 5700:047c | DataPath := '' (length byte only) | AGREE | `MOV byte [547C],0` |
| L434 | 5700:054a | LoadCombatIcon('COMSPR', 25, 25) | AGREE | `cs:"COMSPR"`, push 19h, 19h |
| L444 | 5700:060c | InstallEffectHandlers | AGREE | CALLF stub 0041:0025 |

### Extra argument-order checks

| address | call | verdict | push sequence |
|---|---|---|---|
| 5700:00cf (L340) | AllocPicture($A8, $15, 1, 0, g_4A20) | AGREE | 0A8h, 15h, 1, 0, @4A20 |
| 5700:0529 (L433) | LoadCombatIcon('COMSPR', InitIdx, InitIdx + 13) | AGREE | name, [465C], [465C]+0Dh |
| 5700:05db (L438) | BlockRead(ItemsFile, ItemTypeTable, $810, ItemsReadCount) | AGREE | @468C, @5582, 810h, @5E1E |

### Sweeps

| class | checked sites | findings |
|---|---|---|
| call-argument order | 19 sample/extra calls | none |
| signed vs unsigned | no signed jumps, no CBW in ov11 | — |
| byte vs word | menu_Top word store, byte flags 49F5..49F8 | none |
| folded indexes / ABS / set tests | m2_LineSeg table, no NEG, no @SetIn | none |
| string length bytes | DataPath := '' writes only [547C] (drive letter at 547D kept) | none |
| file record size | ITEMS BlockRead 810h | none (SAVES.md ITEMS table) |

### Screens (PARTY-ov11-01/02)

| id | verdict | evidence |
|---|---|---|
| ov11-01 | AGREE | ClearMenuLine (0486) then DrawText pushes 0, 18h, 0Ah + "Loading...Please Wait" (048B..) |
| ov11-02 | AGREE (by reference) | OpenWithPrompt → BiosPromptLine (ENGINE 0802:0193, colour 0Eh); ITEMS opened via OpenWithPrompt |

DISAGREE: none.

## ov01 (2500) — title, lightning, credits

### Sample — 7 statements

| line | address | statement (short) | verdict | evidence |
|---|---|---|---|---|
| L109 | 2500:022d | DrawTitledFrame(1, 1, 38, 3, 0, 0, '') | AGREE | push 1, 1, 26h, 3, 0, 0, cs:'' (020C..0228) |
| L118 | 2500:033b | DrawText($02, $07, $0E, 'programming:') | AGREE | push 2, 7, 0Eh, cs:"programming:" |
| L136 | 2500:0545 | DrawText($14, $11, $0B, 'dave shelley') | AGREE | push 14h, 11h, 0Bh, cs:"dave shelley" |
| L160 | 2500:068d | WaitSecondsOrKey(5) | AGREE | `MOV AX,5; PUSH; PUSH CS; CALL 0000` |
| L179 | 2500:0793 | SetEgaPaletteRegister(1, $0F); Delay(50) | AGREE | push 1, 0Fh; Delay 32h |
| L180 | 2500:07a7 | SetEgaPaletteRegister(1, $0B); Delay(100) | AGREE | push 1, 0Bh; Delay 64h |
| L188 | 2500:0802 | ShowCredits | AGREE | near call 0206 |

### Extra argument-order checks

| address | call | verdict | push sequence |
|---|---|---|---|
| 2500:0253 (L110) | DrawTitledFrame(1, 5, 38, 23, 0, 0, '') | AGREE | 1, 5, 26h, 17h, 0, 0, '' |
| 2500:02c7 (L114) | DrawText($02, $03, $0A, 'david cook,…') | AGREE | 2, 3, 0Ah, string |
| 2500:0497 (L130) | DrawText($14, $0E, $0B, 'paul murray') | AGREE | 14h, 0Eh, 0Bh, string |
| 2500:05f3 (L142) | DrawText($0B, $16, $0B, 'joel billings,steve salyer') | AGREE | 0Bh, 16h, 0Bh, string |

### Sweeps

| class | checked sites | findings |
|---|---|---|
| call-argument order | 11 calls | none |
| signed vs unsigned | all 6 signed jumps: 002D/002F (`TimeInHundredths < target`, signed 32-bit), 072D/072F (`acc > 50000` signed LongInt), 07ED/07EF (end-time compare) | none — written signed |
| byte/word, folded indexes, ABS, sets, strings | no CBW/NEG/@SetIn; credits strings via StrCopy | none |

### Screens (PARTY-ov01-01..03)

| id | verdict | evidence |
|---|---|---|
| ov01-01 | AGREE | capture ENGINE-29 (TITLE1 at (0,0), zero differing pixels, DECODE_CHECKS.md) |
| ov01-02 | AGREE | flash sequence 09h/150 (0768/0770), 0Bh/100 (077C/0784), 0Fh/50 (0790/0798), 0Bh/100 (07A4/07AC), 09h/150 (07B8/07C0); Random(3)+1 bursts (0746) |
| ov01-03 | AGREE | frames (1,1,38,3)/(1,5,38,23) style 0; rows spot-checked: (2,3,0Ah), (2,7,0Eh), (20,14,0Bh), (20,17,0Bh), (11,22,0Bh) |

DISAGREE: none.

## ov00 (2000) — heap error handler

No sample lines. Extra: 2000:0064 (L41) `ShowBottomPromptAndReadKey($0E, 'WARNING: Insufficient Memory')` — AGREE (push AL=0Eh, then cs:0000 string; colour first). Sweeps: no signed jumps/CBW/NEG/sets. Screens: PARTY-ov00-01 AGREE (0Eh, row 24 via 0709:0BF5); PARTY-ov00-02 AGREE (`cs:"Insufficient Memory. Exiting Program"`, colour 0Eh at 0081, then TerminateGame 009E).

DISAGREE: none.

## ov02 (2A00) — code wheel

No sample lines. Extra: 2A00:013A (L264) `DrawTitledFrame(1, 1, 38, 22, 0, 0, '')` AGREE (1, 1, 26h, 16h, 0, 0, ''); 2A00:0202 (L271) `DrawText(1, 8, $0A, 'WITH THE DETHEK RUNE (INNER RING)')` AGREE. Sweeps: no signed jumps/CBW/NEG/sets. Screens PARTY-ov02-01 AGREE (texts at (1,1)/(1,2)/(1,5)/(1,8)/(1,11) colour 0Ah; outer rune DrawRepeatedGlyph(8,6,0Ch,1,…,False) and (9,6,…) at 01BB/01E5; inner rune (8,9) 022C and (9,9) for entry 0; prompt colour 0Dh 028E); PARTY-ov02-02 not re-read in detail (UNSURE-free text check only).

DISAGREE: none.

## Resident-anchor sample lines (conventions notes inside PARTY.pas.md)

| line | address | statement | verdict | evidence |
|---|---|---|---|---|
| L215 | 03f1:02e8 | DrawTitledFrame(x1, y1, x2, y2, style, colour, title) | AGREE | ENGINE.pas.md 03F1:02E8 BP offsets 14h..6 |
| L83 | 0464:0111 | LoadPicture(name, id, maskFlags, transpColour, var pic) | AGREE | ENGINE.pas.md LoadPicture name [BP+10h] … |
| L316 | 0464:248e | AllocPicture(height, width8, count, flags, var pic) | AGREE | ENGINE.pas.md 0464:248E; matches 5700:00BC pushes |
| L28 | 0899:0000 | TerminateGame (stop sound, restore video, Halt(0)) | AGREE | ENGINE.pas.md 0899:0000 |

## Counts (Q3)

Sample 59 (ov17 32, ov11 16, ov01 7, resident 4): 59 AGREE, 0 DISAGREE, 0 UNSURE. Extra arg-order checks 11: 11 AGREE. Sweeps: 0 findings. Screens 15 rows: 15 AGREE. DISAGREE total: 0.

## ov20 (8400) — game clock, rest

Sample (seed 20261018, 15 statements; evidence = `decode/ecl/hdis.py ov20` / ov20.lst)

| line | address | statement (short) | verdict | evidence |
|---|---|---|---|---|
| L2049 | 8400:0020 | `any := false; i := 1` | AGREE | `MOV [bp-0Bh],0` / `MOV [bp-2],1`; loop 0028..0051 exits on any, continues while i <= count (`JBE` vs w[$67C]) |
| L2066 | 8400:00cc | `if EffectsPending[i] <> 0` | AGREE | `CMP [di+471Dh],0 / JNZ` |
| L2071 | 8400:0137 | `while last^.next <> nil do last := last^.next` | AGREE | 0129 tests c^.effects (+7Fh/+81h) ≠ nil, 0137..0155 walks +5/+7 |
| L2087 | 8400:0239 | `prev := c^.effects` | AGREE | 023C..0248 loads +7Fh/+81h into [bp-13h]; walk 024B..0289 tests prev≠nil, prev≠e, prev^.next≠e |
| L2150 | 8400:04bf | `while (RestClock[k]=0) and (k<5) do Inc(k)` | AGREE | `CMP [di+6DC2h],0 / JNZ`; `CMP k,5 / JGE` (signed, k ShortInt) |
| L2153 | 8400:04f5 | `amount := 0` | AGREE | `MOV byte [bp+8],0` after FillChar(6DC2h,0Eh,0) |
| L2180 | 8400:0641 | `for i := 4 downto 3` | AGREE | `MOV [bp-1],4` … `DEC`, exit `CMP [bp-1],3 / JNZ` |
| L2212 | 8400:07f5 | `'I': ...` (minutes +5 / field +1, Normalize) | AGREE | 07F5 `CMP AL,'I'`; 07FF `ADD [6DC4h],5` when sel=2 else `INC [di+6DC2h]`; `CALL 03A3` |
| L2224 | 8400:0850 | `RestMenu := start` | AGREE | loop exit after `@SetIn` CS:0701 = [#0,'E','R'] (set bytes decoded) |
| L2253 | 8400:094f | `if c^.mem_spell[k] > $7F` | AGREE | `CMP byte es:[di+17h],7Fh / JBE` (unsigned) |
| L2257 | 8400:098a | `mem_spell[k] := mem_spell[k] - $80` | AGREE | `SUB byte es:[di+17h],80h` |
| L2259 | 8400:09ba | `ShowCasts(c, 'has memorized', c^.mem_spell[k])` | AGREE | pushes c (far), string CS:0917, byte spell → order c, s, spell |
| L2275 | 8400:0a22 | `if IsScroll(item)` | AGREE | pushes item far ptr, `CALLF IsScroll / OR AL,AL / JNZ` |
| L2321 | 8400:0be2 | `while c <> nil` | AGREE | 0BE2 `OR AX,[bp-4] / JE 0C64`; body 0BED `CMP +2Ch,0 / JLE` = signed rest_need > 0 |
| L2364 | 8400:0ddb | `RestEncCounter := RestEncCounter + 1` | AGREE | `INC word [49FBh]` inside `if w[$5A4] > 0` (`JBE` 0DD9) |

Extra argument-order checks (argcheck UNSURE with constant/string args; push sequence vs written order)

| address | call | verdict |
|---|---|---|
| 8400:0638 | `DrawText(1, 17, 10, 'Rest Time:')` | AGREE (push 1, 11h, 0Ah, s) |
| 8400:069a | `DrawText(col + 3, 17, 10, ':')` | AGREE |
| 8400:0677 | `DrawText(col + 1, 17, colour[i], TwoDigits(Lo(RestClock[i])))` | AGREE (byte [di+6DC2h] → TwoDigits) |
| 8400:0769 | `HorizontalMenu('', 'Rest   daYs …', $0D, $0A, $0F, true, false, ext)` | AGREE (title, opts, 0D, 0A, 0F, 1, 0, @ext) |
| 8400:08ec | `DrawText(1, 19, 10, 'The Whole Party Is Healed')` | AGREE |
| 8400:08ab | `HealCharacter(c, 1, false)` | AGREE (c far, 1, 0) |
| 8400:0ad5 | `ShowCasts(c, 'has scribed', s)` | AGREE |
| 8400:0d79 | `AskYesNo('Stop Resting? ', $0D, $0A, $0F)` | AGREE |
| 8400:0dbb | `AdvanceClock(5, 1)` | AGREE (push 5, 1; callee: [BP+8] = loop count, [BP+6] = digit) |
| 8400:0df8 | `Roll(1, 100)` | AGREE (push 1, 64h) |
| 8400:0e2e | `DrawText(1, 19, 15, 'The Party is rudely interrupted!')` | AGREE |

Rest-time arithmetic (requested; MAGIC-14 left for PARTY): **AGREE.** One rest step = 5 game minutes: `DecRestClock(5, 1)` (0D9D) and `AdvanceClock(5, 1)` (0DBB, digit 1 = minutes, radix table ClockLimits DS:363A = 10,10,6,24,30,12,256 decoded); rest display refreshed every 5 steps (`CMP [bp-0Dh],5 / JB`); DailyHealing every 120h = 288 steps = 24 h (`CMP [6DD8h],120h / JAE`, HealCharacter(c,1,false)); StudyTick timers armed with level*3 steps (0B82..0B91 `SHL AX,1 / ADD AX,SI`) = 15 min per spell level; StudyHourTick every 12 steps (1 h). Rest interruption 0DD3..0E3B exactly as written: every `w[$5A4]` (ECL 6DD2) steps (`CMP [49FBh], w[$5A4] / JB`), `Roll(1,100) <= w[$5A6]` (ECL 6DD3, `CMP AX,w[$5A6] / JA` = unsigned ≤), message (1,19) colour 0Fh, `stop := interrupted := true`. (The rest-time *preset* formula RestTimeNeeded is in ov15 = MAGIC; not re-derived here.)

Sweeps (all ov20 sections)

| class | checked sites | findings |
|---|---|---|
| call-argument order | all 11 constant/string calls above + every call in the sample | none |
| signed vs unsigned | all 6 signed jumps (006E JLE u>1, 04D2 JGE k<5, 0509 JL k>=unit+1, 0799 JLE sel>4, 07B0 JGE sel<2, 0BF2 JLE rest_need>0) — all on ShortInt/byte-signed values written as signed; unsigned sites spot-checked (094F, 0DD9, 0DEB, 0E08, 087B) | none |
| byte vs word | RestClock words / TwoDigits(Lo()) byte, StudyTimer bytes (DS:6DCF+i, 0 wraps), HealCounter word | none |
| folded constant array indexes | ClockLimits `[di+363Ah]` (007A: `ClockLimits[u-1]`), SpellTable `[di+31FBh]` (0977 level = byte 1 of 16-byte record), EffectsPending `[di+471Dh]` | none |
| ABS idiom | no NEG in ov20 | — |
| Pascal set tests | 1 (`@SetIn` CS:0701 = [#0,'E','R']) — matches | none |
| string length bytes | TwoDigits (`Copy(s,1,2)`, '0' prefix) | none |

Screens (PARTY_SCREENS ov20 rows)

| id | verdict | evidence |
|---|---|---|
| PARTY-ov20-01 | AGREE | code 0638..06CD positions (col 1 / 12 / 14 / 15 / 17 / 18, row 17), colours 10/15; menu CS:06D9; capture `acceptance/ref/ECL-14-REST.png`: "REST TIME:  00:00:00" on row 17 with only the minutes white (start selection = minutes) and the menu "REST DAYS HOURS MINS INC DEC EXIT" on row 24 |
| PARTY-ov20-02 | AGREE | RestLoop 0D9D..0DBB (5-minute steps, redraw every 5) |
| PARTY-ov20-03 | AGREE | AskYesNo 0D79, `='Y'` → stop |
| PARTY-ov20-04 | AGREE | 08D6..08EC (1,19) colour 0Ah, shown unconditionally; roster redraw only if `any` |
| PARTY-ov20-05 | AGREE | CS:0917 / CS:09DB via ShowCasts |
| PARTY-ov20-06 | AGREE | 0DD3..0E3B (see above); capture ECL-14-AFTER-REST shows the post-interruption city-watch choice (route evidence only) |

DISAGREE: none.

## ov21 (8900) — encumbrance, coins, pool money, appraisal, random items

Sample (seed 20261018, 28 statements)

| line | address | statement (short) | verdict | evidence |
|---|---|---|---|---|
| L2428 | 8900:005a | `if c^.encumbrance + amount > MaxCarryWeight(c)` | AGREE | `ADD AX,[bp+0Ah]` to +102h, `CMP AX,DX / JBE` (unsigned) |
| L2485 | 8900:02d3 | `len := Length(p); col := len` | AGREE | `MOV AL,[bp-2Bh]` (length byte) → [bp-2Eh] → [bp-2Ch] |
| L2547 | 8900:05ff | `if (npc_morale = 0) or (npc_morale = $B3) then Inc(n)` | AGREE | `CMP +84h,0 / JE`; `CMP +84h,B3h / JNZ`; `INC [bp-6]` |
| L2559 | 8900:0658 | `FillChar(share,14,0); FillChar(rest,14,0)` | AGREE | two FillChar 0Eh at [bp-1Ah] / [bp-28h] |
| L2565 | 8900:0701 | `share[k] := 0; rest[k] := 0` | AGREE | `MOV [bp+di-1Ah],0` (and [bp+di-28h]) |
| L2585 | 8900:0878 | `p := p^.next` | AGREE | +104h/+106h |
| L2619 | 8900:0a44 | `TreasureMoney[coin] := TreasureMoney[coin] + amount` | AGREE | word amount zero-extended (`XOR DX,DX`), LongInt [di+67F4h] |
| L2639 | 8900:0bae | `i := 1; while t[i] = ' ' do Inc(i)` | AGREE | `CMP [bp+di-101h],20h / JNZ` |
| L2664 | 8900:0d67 | `GetMem(list, 46); list^.next := nil` | AGREE | `MOV AX,2Eh` GetMem; +2Ah/+2Ch := 0 |
| L2666 | 8900:0d85 | `prev := list; GetMem(list, 46); list^.next := prev` | AGREE | 0D85..0DA9 |
| L2685 | 8900:0f46 | `if TreasureMoney[k] > 0 then …` | AGREE | signed LongInt (`JG`/`JL` high word, `JBE` low word) |
| L2704 | 8900:0ff7 | `else if (r >= 15) and (r <= 19) then 2` | AGREE | Roll(1,20); `CMP 0Fh / JB`, `CMP 13h / JA` |
| L2705 | 8900:1005 | `else RollMagicPlus := 3` | AGREE | 1005 |
| L2719 | 8900:10ab | `it.plus := RollMagicPlus` | AGREE | 10AC call, `MOV es:[di+32h],AL` |
| L2723 | 8900:10d9 | `it.word[3] := $15; it.word[2] := it.plus + $A1` | AGREE | 10DC `MOV +31h,15h`; 10E4.. plus + A1h → +30h |
| L2726 | 8900:111f | types 50,51: word[3]:=typ, word[2]:=$31, word[1]:=plus+$A1 | AGREE | 1117/111B `CMP 32h/33h`; +31h := type, +30h := 31h, plus+A1h |
| L2741 | 8900:1285 | `it.plus2 := 0; it.count := 0` | AGREE | 1288 `+33h := 0`, 1290 `+39h := 0` |
| L2794 | 8900:1678 | `1: sp := Roll(1, 8)` | AGREE | push 1, 8 |
| L2835 | 8900:188d | `it.value := MagicItemTable[rec + 4]` | AGREE | word `[di+970h]`, di = (rec+4)*2 → +3Ah |
| L2836 | 8900:18a4 | `for k := 1 to 3 do it.power[k] := Lo(MagicItemTable[rec+4+k])` | AGREE | byte of word table → +3Bh+k |
| L2848 | 8900:19ed | `changed := False` | AGREE | `MOV byte es:[di],0` (var param) |
| L2854 | 8900:1a17 | `done := False` | AGREE | `MOV [bp-0B3h],0` |
| L2870 | 8900:1b73 | `DrawText(1, 9, $0F, gemStr)` | AGREE | push 1, 9, 0Fh, [bp-29h] |
| L2874 | 8900:1bbc | `if money[6] <> 0 then opts := opts + '  Jewelry'` | AGREE | `CMP +94h,0` (money[6] = jewelry) |
| L2875 | 8900:1bf0 | `opts := opts + ' Exit'` | AGREE | CS:1953 " Exit" |
| L2900 | 8900:1dfa | `it^.next := nil; it^.readied := 0` | AGREE | +2Ah/+2Ch := 0; 1E0C +34h := 0 |
| L2917 | 8900:1ef0 | `Dec(SelectedChar^.money[6])` | AGREE | `DEC word es:[di+94h]` |
| L2938 | 8900:212a | jewel item = gem construction with word[3] := $D6 | AGREE | 212A GetMem 3Fh, FillChar, 2168 `+31h := D6h`, +2Eh := 46h, +35h := 0 |

Extra argument-order checks

| address | call | verdict |
|---|---|---|
| 8900:0cf2 (written 0cf2) | `DrawTitledFrame(1, 1, $26, $16, 0, $0A, '')` | AGREE (push 1,1,26h,16h,0,0Ah, '') |
| 8900:0e8b | `VerticalListMenu(…, list window 2,2..15,8 …)` | AGREE (… 0Ah, 0Fh, 2, 2, 0Fh, 8, list, 1, …) |
| 8900:1b55 / 1b6e | `DrawText(1, 7, $0F, 'You have a fine collection of:')` | AGREE |
| 8900:1c18 | `HorizontalMenu('Appraise : ', opts, $0D, $0A, $0F, True, False, ext)` | AGREE |
| 8900:1d24..1d32 | `DrawText(1, 12, $0F, 'The Gem is Valued at …')` | AGREE |
| 8900:0221, 04ee, 0aa4, 19d8 | `ShowTimedBottomMessage(s)` (single string) | AGREE |

Sweeps (all ov21 sections)

| class | checked sites | findings |
|---|---|---|
| call-argument order | sample calls + 9 extra | none |
| signed vs unsigned | all 12 signed jumps: 0363/0365 (`v <= max`, LongInt Val vs zero-extended max), 0692/0694, 0D4B/0D4D, 0F55/0F57 (`TreasureMoney[k] > 0`, signed LongInt), 0AD4/0AD6 (`amount > TreasureMoney[coin]`, zero-extended amount vs LongInt) — all written as LongInt/signed comparisons; unsigned word compare 0073 (`JBE`, "unsigned compare") | none |
| byte vs word | coin index ShortInt (`CBW` before `SHL DI,2`), money[] words, npc_morale byte | none |
| folded constant array indexes | `CoinValue[3]` = `[0D30h]` (0111) decoded = 200 (table DS:0D24 = 1,10,100,200,1000); MagicItemTable `[di+970h]`; TreasureMoney `[di+67F4h]` | none |
| ABS idiom | no NEG in ov21 | — |
| Pascal set tests | none in ov21 | — |
| string length bytes | 02D3 Length(p), 0384 `col := len + Length(maxStr)`, 03AF `Length(num) > 0` (`JBE`), 03C4 Copy(num,1,Length-1) | none |

Screens (PARTY_SCREENS ov21 rows)

| id | verdict | evidence |
|---|---|---|
| PARTY-ov21-01 | AGREE | 02BA ClearGlyphRun row 24; DrawText(len, 24, 0Fh, num) (0395..03A4); max clamp 0371 |
| PARTY-ov21-02 | AGREE | 0AA4 / 04EE "Overloaded" |
| PARTY-ov21-03 | AGREE | 0221 |
| PARTY-ov21-04 | AGREE | DrawTitledFrame 0CF2 (style 0, colour 0Ah, ''); VerticalListMenu window (2,2)-(15,8), prompt CS:0CBD "Select type of coin" |
| PARTY-ov21-05 | AGREE | 0ECB "How much " + coin + " will you take? " |
| PARTY-ov21-06 | AGREE | 19D8 |
| PARTY-ov21-07 | AGREE | 1B43 name, (1,7)/(1,9)/(1,10) colour 0Fh, menu 1C18 |
| PARTY-ov21-08 | AGREE | 1CF8 / 204B, DrawText(1,12,0Fh,…) 1D24..1D32 |

DISAGREE: none.

## ov06 (3E00) — shop

Sample (seed 20261018, 3 statements)

| line | address | statement (short) | verdict | evidence |
|---|---|---|---|---|
| L3063 | 3e00:0568 | `FillChar(TreasureMoney, $1C, 0)` | AGREE | push DS:67F4h, 1Ch, 0 |
| L3086 | 3e00:06d0 | `DrawWrappedText(1, 17, 38, 22, 10, true, 'As you Leave …')` | AGREE | push 1, 11h, 26h, 16h, 0Ah, 1, CS:04C0 |
| L3094 | 3e00:075d | `if (key = 'B') or (key = 'T') then RedrawCurrentMode` | AGREE | `CMP 42h / JE`, `CMP 54h / JNZ`; 076F 'A' and appraised ([bp-32h]) |

Extra argument-order checks

| address | call | verdict |
|---|---|---|
| 3e00:0167 | `DrawTitledFrame(1, 1, 38, 22, 0, 15, 'Shop')` | AGREE |
| 3e00:01c4 | `VerticalListMenu('Items: ', 'Buy', $0D, $0A, $0F, 1, 4, 38, 22, list, true, redraw, index, cur)` (14 args) | AGREE (push order exactly as written, cur = [BP+0Ah], index = [BP+6]) |
| 3e00:05a7 | `BuildItemName(nil, item, 0, 0, false, false)` | AGREE (far 0, item, 4 zero bytes) |
| 3e00:061a | `HorizontalMenu(prompt, opts, $0D, $0A, $0F, true, false, ext)` | AGREE |
| 3e00:06f6 | `DrawWrappedText(1, 17, 38, 22, 15, false, 'Do you want …')` | AGREE |
| 3e00:0714 | `MenuSelect(prompt, '~Yes ~No', $0D, $0A, $0F, false, 0)` | AGREE (7 pushes) |
| 3e00:03de / 0427 | `AddItemToChar(chosen, failed)` | AGREE |
| 3e00:0462 | `ShowTimedBottomMessage('Not enough Money.')` | AGREE |

Sweeps (all ov06 sections)

| class | checked sites | findings |
|---|---|---|
| call-argument order | all calls of Shop / ShopBuy / ShopItemsMenu | none |
| signed vs unsigned | 3E00:0412/0414 (`LongInt(price) <= pool`, signed LongInt with zero-extended price) written as LongInt; 03D0 `price <= gold` `JA` unsigned word | none |
| byte vs word | price word (+3Ah), MoneyInGold low word kept (quirk stated) | none |
| folded constant array indexes | none | — |
| ABS idiom | no NEG in ov06 | — |
| Pascal set tests | none | — |
| string length bytes | ShopItemsMenu line building 00A0..012E: `line[30 - Length(num) + k]` (`MOV AX,1Eh / SUB / ADD`), name over the left part, `name[0] := Chr(30)` (`MOV byte es:[di],1Eh`) | none |

Screens (PARTY_SCREENS ov06 rows; no shop capture in acceptance/ref — temple capture ECL-12-TEMPLE belongs to ov04/MAGIC)

| id | verdict | evidence |
|---|---|---|
| PARTY-ov06-01 | AGREE | menu strings CS:0474 / CS:049B; key dispatch 0625..0758 incl. 'P' only without ext, 'G'/'O' |
| PARTY-ov06-02 | AGREE | frame 0167 title "Shop" colour 0Fh; list window (1,4)-(38,22) 01C4; price right-aligned col 30 |
| PARTY-ov06-03 | AGREE | ShopBuy 03C2..0462 |
| PARTY-ov06-04 | AGREE | 06AE..0734; MenuSelect index 1 (N) → leave |

DISAGREE: none.

## Totals (Q4)

Sample 46 statements (ov20 15, ov21 28, ov06 3): 46 AGREE, 0 DISAGREE, 0 UNSURE. Extra argument-order checks 26: all AGREE. Sweeps: 0 findings. Screens: 18 rows (ov20 6, ov21 8, ov06 4) AGREE, capture-checked: PARTY-ov20-01 (ECL-14-REST.png). Rest-time arithmetic verified.

## ov12

Sample: seed 20261018, 58 statements (all ov12 lines of `PARTY_sample_ov12.txt`), each re-read in `decode/listings/ov12.lst` / `hdis.py ov12`.

| line | address | statement (short) | verdict | evidence |
|---|---|---|---|---|
| L3174 | 5c00:0110 | `MoraleValue := MoraleValue + 5;` | AGREE | ADD byte [6825],5 |
| L3199 | 5c00:01a0 | `ShowCharacterMessage(c, 'starts to train', 10, true);` | AGREE | push c([BP+0Eh/0Ch]), StrCopy "starts to train", 0Ah, 1 |
| L3223 | 5c00:0263 | `if c^.con >= 20 then begin` | AGREE | CMP +14h,14h; JC (unsigned >=) |
| L3233 | 5c00:02f4 | `else if c^.con > 15 then perLvl := perLvl + c^.level[i] * 2` | AGREE | CMP +14h,0Fh; JBE; level[i] CBW |
| L3236 | 5c00:0335 | `old := old div perLvl;` | AGREE | CWD; IDIV CX; store AL |
| L3264 | 5c00:03e4 | `if DamageType and 2 <> 0 then begin` | AGREE | AND AL,2; JZ |
| L3307 | 5c00:05b0 | `best^.p3 := StrengthCode(c^.str, c^.str_exc);` | AGREE | push +10h (str), push +16h (str_exc); CALLF StrengthCode; store e+3 |
| L3316 | 5c00:05d9 | `c^.cha := e^.p3;` | AGREE | e+3 -> c+15h |
| L3331 | 5c00:0647 | `Type 10h — empty body (`PUSH BP; MOV BP,SP; POP BP; RETF 0Ah`).` | AGREE | PUSH BP;MOV BP,SP;POP BP;RETF 0Ah |
| L3358 | 5c00:06e7 | `if DamageType and 1 <> 0 then begin` | AGREE | AND AL,1; JZ |
| L3432 | 5c00:0a19 | `if e^.p3 = 0 then RemoveEffect(c, $1C, nil);` | AGREE | CMP e+3,0; JNZ; push c,1Ch,nil |
| L3465 | 5c00:0b6a | `c^.ai_mode := 0;` | AGREE | MOV c+76h,0 (ai_mode, SAVES.md) |
| L3555 | 5c00:0f2e | `cm_Map^[7 + (p^.y + g_273F[CloudSquareDir[k]])*50 + p^.x + g_2736[CloudSquareDir` | AGREE | CloudSquareDir g_290D, g_2736/g_273F, map store 1Eh |
| L3579 | 5c00:102b | `if c^.readied[0] <> nil then begin` | AGREE | +0CCh/+0CEh OR; JZ |
| L3580 | 5c00:1045 | `ok := GetMissileAmmo(c, p);` | AGREE | push c, @p; CALLF GetMissileAmmo |
| L3616 | 5c00:1184 | `if AddEffectUnlessCuring(c, $2C, e^.p3, 10) then` | AGREE | push c,2Ch,e+3,000Ah; CALL 001F |
| L3677 | 5c00:135c | `Type 37h (Poisoned, added by PoisonOpponent; tested by EffSlowPoisonEnd) — empty` | AGREE | empty RETF 0Ah |
| L3715 | 5c00:1496 | `if DamageType and 1 <> 0 then begin` | AGREE | AND AL,1; JZ |
| L3721 | 5c00:14d5 | `if DamageType and 8 = 0 then CancelDamageAndEffect(0);` | AGREE | AND AL,8; JNZ skip; push 0; CALL 0000 |
| L3728 | 5c00:1504 | `if AddEffectUnlessCuring(c, $3E, e^.p3, $3C) then` | AGREE | push c,3Eh,e+3,003Ch; CALL 001F |
| L3738 | 5c00:1597 | `ShowCharacterMessage(HookOpponent, 'is Poisoned', 10, false);` | AGREE | push Hook, "is Poisoned", 0Ah, 0 |
| L3762 | 5c00:1692 | `Type 42h — event 03h. `PoisonOpponent(c, 2)`.` | AGREE | push c, 2; CALL 1545 |
| L3778 | 5c00:1718 | `Type 46h — event 03h. `PoisonOpponent(c, -2)` (FEh).` | AGREE | push c, FEh; CALL 1545 |
| L3800 | 5c00:17cc | `e^.callOnRemove := 0;` | AGREE | MOV e+4,0 |
| L3809 | 5c00:1854 | `DamageCharacter(HookOpponent, dmg, 0, false);` | AGREE | push Hook, [bp-2], 0, 0; CALLF DamageCharacter |
| L3835 | 5c00:1993 | `AddEffect(HookOpponent, $3A, 0, $FF, 0);` | AGREE | push Hook,3Ah,0(word),FFh,0; CALLF AddEffect |
| L3844 | 5c00:19ee | `if not ReviveCombatant(c, c^.hp) then` | AGREE | push c, c+11Bh; CALLF ReviveCombatant; JNZ |
| L3845 | 5c00:1a0d | `ok := AddEffectUnlessCuring(c, $4E, e^.p3, 1);` | AGREE | push c,4Eh,e+3,0001; result -> [bp-1] unused |
| L3905 | 5c00:1c01 | `if side_ActiveCount[m^.side] >= 6 then Inc(bonus);` | AGREE | CBW m+10Eh; CMP [DI+6814h],6; JC (unsigned) |
| L3918 | 5c00:1cb3 | `HookOpponent := c^.combatant^.target;` | AGREE | c+108h -> +0Ah far ptr -> 6826 |
| L3928 | 5c00:1d77 | `((it^.word[1] = $76) or (it^.word[2] = $76) or (it^.word[3] = $76)) then begin` | AGREE | +34h<>0, words +2F/+30/+31 = 76h |
| L3947 | 5c00:1e94 | `tx := CombatantCol(HookOpponent);` | AGREE | push Hook; CombatantCol -> [bp-7] |
| L3948 | 5c00:1ea4 | `ty := CombatantRow(HookOpponent);` | AGREE | push Hook; CombatantRow -> [bp-8] |
| L3949 | 5c00:1eb4 | `if not CanAttack(c, HookOpponent) then exit;` | AGREE | push c, Hook; CanAttack; JNZ else exit |
| L3950 | 5c00:1ece | `if not TraceLine(CombatantCol(c), CombatantRow(c), tx, ty, range, cm_Map) then e` | AGREE | Col(c), Row(c), @tx, @ty, @range, cm_Map far; TraceLine |
| L4004 | 5c00:2271 | `if c^.hp_max > 0 then Dec(c^.hp_max);` | AGREE | CMP +32h,0; JBE; DEC |
| L4013 | 5c00:22fe | `c^.level[DrainClass] := 0;` | AGREE | nested DrainClass; CBW; MOV +96h+idx,0 |
| L4024 | 5c00:2393 | `end;` | AGREE | loop test CMP [bp-33h],[bp-37h] |
| L4077 | 5c00:2531 | `SaveRoll := SaveRoll + bonus;` | AGREE | zero-ext add to SaveRoll byte |
| L4102 | 5c00:25d4 | `if (it <> nil) and ((ITEMS[it^.type].wflags and $81) <> 0) then` | AGREE | nil test; type*16 + 5589h |
| L4146 | 5c00:273a | `if (c^.status = 5) and (c^.combatant^[$0E] < 6) then` | AGREE | CMP +10Ch,5; combatant+0Eh <6 JNC |
| L4169 | 5c00:281a | `if not HasEffect(c, $62, p)` | AGREE | push c,62h,@p; HasEffect |
| L4170 | 5c00:2831 | `and not HasEffect(c, $3B, p) then` | AGREE | push c,3Bh,@p; HasEffect |
| L4222 | 5c00:29a4 | `CancelDamageAndEffect($35);` | AGREE | push 35h; CALL 0000 |
| L4223 | 5c00:29ab | `CancelDamageAndEffect($0B);` | AGREE | push 0Bh; CALL 0000 |
| L4231 | 5c00:29c0 | `CancelDamageAndEffect($35);` | AGREE | push 35h; CALL 0000 |
| L4265 | 5c00:2a37 | `for i := 1 to LastDiceCount do begin` | AGREE | LastDiceCount -> limit; 1 > limit -> skip |
| L4291 | 5c00:2afe | `if (it <> nil) and (ShortInt(it^.plus) > 0) then` | AGREE | nil test; CMP +32h,0; JLE (signed) |
| L4365 | 5c00:2dc8 | `DamageAmount := 0;` | AGREE | CMP +32h,0; JNZ; [6818]:=0 |
| L4373 | 5c00:2de7 | `if Roll(1, 100) <= 30 then begin` | AGREE | push 1,64h; Roll; CMP AL,1Eh; JA (unsigned) |
| L4399 | 5c00:2eb6 | `AttackBlocked := 1;` | AGREE | MOV [681E],1 |
| L4411 | 5c00:2ef2 | `RemoveEffect(c, it^.power[2], nil)` | AGREE | push c, it+3Dh (power[2]), nil |
| L4436 | 5c00:2fff | `p := p^.next;` | AGREE | p+5/+7 -> p (effect next) |
| L4443 | 5c00:305b | `game_Mode := 5;` | AGREE | MOV [49F3],5 |
| L4446 | 5c00:3082 | `ItemsChanged := 1;` | AGREE | MOV [6821],1 |
| L4461 | 5c00:30ea | `DamageType := 8;` | AGREE | MOV [6819],8 |
| L4462 | 5c00:30ef | `if game_Mode = 5 then DrawCombatLayout;` | AGREE | CMP [49F3],5; JNZ; DrawCombatLayout |
| L4474 | 5c00:3158 | `it^.readied := 0;` | AGREE | CMP +10h,13h JNC; MOV it+34h,0 |

### Extra argument-order checks (argcheck ov12: 265 calls, 41 OK, 224 UNSURE, 0 MISMATCH)

Automated: all 88 UNSURE ov12 calls with >= 2 constant arguments compared with the constant push order (subsequence test): 80 consistent; the 8 flagged plus 2 more were re-read by hand and are all correct (pushes interrupted by nested Roll/CombatantIndex calls):

| address | call | pushes | verdict |
|---|---|---|---|
| 5c00:18ed | `AddEffect(c, $4B, $CF, CombatantIndex(HookOpponent), 1)` | c, 4Bh, 00CFh, CombatantIndex(Hook), 1 | AGREE |
| 5c00:197a | `AddEffect(c, $4A, 0, CombatantIndex(HookOpponent), 1)` | c, 4Ah, 0, CombatantIndex(Hook), 1 | AGREE |
| 5c00:1b11 | `ApplyEffect(m, $34, 0, $0C, 0, 1, saved, 'is paralyzed with fear')` | m, 34h, 0, 0Ch, 0, 1, [bp-5], str (call 1B39) | AGREE |
| 5c00:1b48 | `ApplyEffect(m, $02, 0, $0C, 0, 1, saved, 'is weakened by fear')` | m, 2, 0, 0Ch, 0, 1, [bp-5], str (call 1B70) | AGREE |
| 5c00:1c39 | `ApplyEffect(m, $34, Roll(1, 4), $0C, 0, 1, saved, ...)` | m, 34h, Roll(1,4), 0Ch, 0, 1, [bp-6], str | AGREE |
| 5c00:243c | `AddEffect(HookOpponent, $39, $A8C0, Roll(1, 6) * 16 + $0F, 1)` | Hook, 39h, A8C0h, Roll(1,6) shl 4 + 0Fh, 1 | AGREE |
| 5c00:2794 | `AddEffect(c, $5F, Roll(1, 4) + 1, $FF, 1)` | c, 5Fh, Roll(1,4)(+1), FFh, 1 | AGREE |
| 5c00:27ee | `AddEffect(c, $66, Roll(3, 6), $FF, 1)` | c, 66h, Roll(3,6), FFh, 1 | AGREE |
| 5c00:2422 | `AddEffect(HookOpponent, $32, $3840, $FF, 1)` | Hook, 32h, 3840h, FFh, 1 | AGREE |
| 5c00:1692 / 1718 | `PoisonOpponent(c, 2) / (c, -2)` | c, 2 / c, FEh | AGREE |

### Sweeps (all ov12 sections, PARTY.pas.md L3127..4530)

| class | checked sites | findings |
|---|---|---|
| call-argument order | 265 argcheck rows (0 MISMATCH), 88 multi-constant calls automated, ~20 by hand (sample + table above) | none |
| signed vs unsigned compares | all 15 signed jumps (JL/JG/JLE/JGE) and 2 IDIV of ov12 mapped to their pseudo statements | 14 written signed or sign-neutral; **1 finding: 5c00:035A** (below) |
| byte vs word operands | sample + all signed-jump sites; byte globals 6816, 6818, 6819, 6822, 6825 used as bytes | none |
| folded constant array indexes | all 12 DS-indexed bases (2736/273F step tables, 290D CloudSquareDir, 409B/409D XpForLevel[i,lvl] = 409B+i*38h+lvl*4, 5589 ITEMS, 65B9 cb_Char, 66D6..66DB BodyList 7-byte records, 6814 side_ActiveCount) | all written as arrays; none |
| and/jge/neg = ABS idiom | no NEG/ABS sequence in ov12 | n/a |
| Pascal set tests (`in`) | 5c00:0087 status in [7,6,8], 037A alignment in [2,5,8], 03AF alignment in [0,3,6] | constants match the CMP chains |
| string length-byte handling | 50 runtime string calls; no Length/[0] use in ov12 bodies; 'is drained ' + s concatenation (2177) | none |

### Screens (PARTY_SCREENS.md, ov12 rows PARTY-ov12a-01..16, ov12b-01..14)

| id | verdict | evidence |
|---|---|---|
| PARTY-ov12a-01 | AGREE | strings found as Pascal literals at the cited CS offsets in ov12.bin (or present in ov12 when no offset is given); route as cited; no capture in acceptance/ref covers ov12 messages |
| PARTY-ov12a-02 | AGREE | strings found as Pascal literals at the cited CS offsets in ov12.bin (or present in ov12 when no offset is given); route as cited; no capture in acceptance/ref covers ov12 messages |
| PARTY-ov12a-03 | AGREE | strings found as Pascal literals at the cited CS offsets in ov12.bin (or present in ov12 when no offset is given); route as cited; no capture in acceptance/ref covers ov12 messages |
| PARTY-ov12a-04 | AGREE | strings found as Pascal literals at the cited CS offsets in ov12.bin (or present in ov12 when no offset is given); route as cited; no capture in acceptance/ref covers ov12 messages |
| PARTY-ov12a-05 | AGREE | strings found as Pascal literals at the cited CS offsets in ov12.bin (or present in ov12 when no offset is given); route as cited; no capture in acceptance/ref covers ov12 messages |
| PARTY-ov12a-06 | AGREE | strings found as Pascal literals at the cited CS offsets in ov12.bin (or present in ov12 when no offset is given); route as cited; no capture in acceptance/ref covers ov12 messages |
| PARTY-ov12a-07 | AGREE | strings found as Pascal literals at the cited CS offsets in ov12.bin (or present in ov12 when no offset is given); route as cited; no capture in acceptance/ref covers ov12 messages |
| PARTY-ov12a-08 | AGREE | strings found as Pascal literals at the cited CS offsets in ov12.bin (or present in ov12 when no offset is given); route as cited; no capture in acceptance/ref covers ov12 messages |
| PARTY-ov12a-09 | AGREE | strings found as Pascal literals at the cited CS offsets in ov12.bin (or present in ov12 when no offset is given); route as cited; no capture in acceptance/ref covers ov12 messages |
| PARTY-ov12a-10 | AGREE | strings found as Pascal literals at the cited CS offsets in ov12.bin (or present in ov12 when no offset is given); route as cited; no capture in acceptance/ref covers ov12 messages |
| PARTY-ov12a-11 | AGREE | strings found as Pascal literals at the cited CS offsets in ov12.bin (or present in ov12 when no offset is given); route as cited; no capture in acceptance/ref covers ov12 messages |
| PARTY-ov12a-12 | AGREE | strings found as Pascal literals at the cited CS offsets in ov12.bin (or present in ov12 when no offset is given); route as cited; no capture in acceptance/ref covers ov12 messages |
| PARTY-ov12a-13 | AGREE | strings found as Pascal literals at the cited CS offsets in ov12.bin (or present in ov12 when no offset is given); route as cited; no capture in acceptance/ref covers ov12 messages |
| PARTY-ov12a-14 | AGREE | strings found as Pascal literals at the cited CS offsets in ov12.bin (or present in ov12 when no offset is given); route as cited; no capture in acceptance/ref covers ov12 messages |
| PARTY-ov12a-15 | AGREE | strings found as Pascal literals at the cited CS offsets in ov12.bin (or present in ov12 when no offset is given); route as cited; no capture in acceptance/ref covers ov12 messages |
| PARTY-ov12a-16 | AGREE | strings found as Pascal literals at the cited CS offsets in ov12.bin (or present in ov12 when no offset is given); route as cited; no capture in acceptance/ref covers ov12 messages |
| PARTY-ov12b-01 | AGREE | strings found as Pascal literals at the cited CS offsets in ov12.bin (or present in ov12 when no offset is given); route as cited; no capture in acceptance/ref covers ov12 messages |
| PARTY-ov12b-02 | AGREE | strings found as Pascal literals at the cited CS offsets in ov12.bin (or present in ov12 when no offset is given); route as cited; no capture in acceptance/ref covers ov12 messages |
| PARTY-ov12b-03 | AGREE | strings found as Pascal literals at the cited CS offsets in ov12.bin (or present in ov12 when no offset is given); route as cited; no capture in acceptance/ref covers ov12 messages |
| PARTY-ov12b-04 | AGREE | strings found as Pascal literals at the cited CS offsets in ov12.bin (or present in ov12 when no offset is given); route as cited; no capture in acceptance/ref covers ov12 messages |
| PARTY-ov12b-05 | AGREE | strings found as Pascal literals at the cited CS offsets in ov12.bin (or present in ov12 when no offset is given); route as cited; no capture in acceptance/ref covers ov12 messages |
| PARTY-ov12b-06 | AGREE | strings found as Pascal literals at the cited CS offsets in ov12.bin (or present in ov12 when no offset is given); route as cited; no capture in acceptance/ref covers ov12 messages |
| PARTY-ov12b-07 | AGREE | strings found as Pascal literals at the cited CS offsets in ov12.bin (or present in ov12 when no offset is given); route as cited; no capture in acceptance/ref covers ov12 messages |
| PARTY-ov12b-08 | AGREE | strings found as Pascal literals at the cited CS offsets in ov12.bin (or present in ov12 when no offset is given); route as cited; no capture in acceptance/ref covers ov12 messages |
| PARTY-ov12b-09 | AGREE | strings found as Pascal literals at the cited CS offsets in ov12.bin (or present in ov12 when no offset is given); route as cited; no capture in acceptance/ref covers ov12 messages |
| PARTY-ov12b-10 | AGREE | strings found as Pascal literals at the cited CS offsets in ov12.bin (or present in ov12 when no offset is given); route as cited; no capture in acceptance/ref covers ov12 messages |
| PARTY-ov12b-11 | AGREE | strings found as Pascal literals at the cited CS offsets in ov12.bin (or present in ov12 when no offset is given); route as cited; no capture in acceptance/ref covers ov12 messages |
| PARTY-ov12b-12 | AGREE | strings found as Pascal literals at the cited CS offsets in ov12.bin (or present in ov12 when no offset is given); route as cited; no capture in acceptance/ref covers ov12 messages |
| PARTY-ov12b-13 | AGREE | strings found as Pascal literals at the cited CS offsets in ov12.bin (or present in ov12 when no offset is given); route as cited; no capture in acceptance/ref covers ov12 messages |
| PARTY-ov12b-14 | AGREE | strings found as Pascal literals at the cited CS offsets in ov12.bin (or present in ov12 when no offset is given); route as cited; no capture in acceptance/ref covers ov12 messages |

DISAGREE:

- 5c00:035A (PARTY.pas.md L3237, HP recalculation after CON change): written `if (c^.con >= 17) and (c^.level[2] <= 0) then exit;` -> correct `... and (ShortInt(c^.level[2]) <= 0)` (bytes 0354 `CMP byte ES:[DI+98h],0` / 035A `JLE` = signed: levels 80h..FFh also exit). Behaviour differs only for a fighter level >= 128 (never in normal play); minor.

Counts: sample 58 AGREE / 0 DISAGREE / 0 UNSURE; extra arg-order 10 AGREE; sweeps 1 finding (signed compare, minor); screens 30 AGREE / 0 DISAGREE.

## ov16

Verifier part Q1 (lane por-verify), unit ov16 (seg 7000), against `decode/listings/ov16.lst` / `decode/ecl/hdis.py ov16` and the DS image (`decode/bin/ghidra/resident.bin`, DS = 0C7C).

### Sample (seed 20261018, 75 statements of `PARTY_sample_ov16.txt`)

| line | address | statement (short) | verdict | evidence |
|---|---|---|---|---|
| L534 | 7000:0034 | it := p^.items | AGREE | `LES DI,[bp-14h]; MOV AX/DX,ES:[DI+0C8h/0CAh]` → [bp-8] |
| L540 | 7000:008f | while e <> nil | AGREE | `MOV AX,[bp-10h]; OR AX,[bp-0Eh]; JZ 00C5` |
| L541 | 7000:0097 | q := e; e := e^.next | AGREE | copy to [bp-0Ch]; next = ES:[DI+5]/[DI+7]; FreeMem(q, 9) at 00BE |
| L560 | 7000:0175 | StingMode := 0 | AGREE | `MOV byte [470Ch],0` |
| L561 | 7000:017a | game_Mode := 0 | AGREE | `MOV byte [49F3h],0` |
| L580 | 7000:02c0 | row := row + 1 | AGREE | `INC byte [bp-0Eh]` (byte) |
| L586 | 7000:0305 | if ext then | AGREE | `CMP byte [bp-3],0; JZ 0334` |
| L591 | 7000:0331 | continue (no redraw) | AGREE | `JMP 04EA` (loop end), roster redraw skipped |
| L675 | 7000:07ab | case c^.race of | AGREE | `MOV AL,ES:[DI+2Eh]; CMP AL,5 ...` (5,1,3,2,4,else) |
| L676 | 7000:07b3 | 5 {Halfling}: icon_size := 1 | AGREE | `MOV byte ES:[DI+0C0h],1` |
| L680 | 7000:080c | AddEffect(c, $5A, 0, $FF, 0) | AGREE | pushes c far, 5Ah, word 0, FFh, 0 → call 080C (dwarf branch, 07ED `CMP AL,1`) |
| L682 | 7000:083a | AddEffect(c, $1A, 0, $FF, 0) | AGREE | 082E `MOV AL,1Ah` … call 083A |
| L688 | 7000:08bd | AddEffect(c, $30, 0, $FF, 0) | AGREE | 08B1 `MOV AL,30h` … call 08BD (gnome) |
| L691 | 7000:08ee | 4 {Half-Elf}: icon_size := 2 | AGREE | 08EA `CMP AL,4`; `MOV ES:[DI+0C0h],2`; AddEffect 7Ch |
| L727 | 7000:0c0b | 10: level[0] := 1; level[4] := 1 | AGREE | `MOV ES:[DI+96h],1; MOV ES:[DI+9Ah],1` |
| L747 | 7000:0d89 | n := ClassAligns[class*10] | AGREE | class (+2Fh) `MUL 0Ah`; `MOV AL,[DI+3FE7h]` |
| L765 | 7000:0f51 | multi-class age = base + dice*sides | AGREE | byte[3E5Dh]·byte[3E5Eh] (MUL) + word[3E5Bh], race·1Ch; no Roll (maximum) |
| L775 | 7000:1203 | str_exc := 0 | AGREE | `MOV ES:[DI+16h],0` |
| L777 | 7000:121a | abil[abil] := 0 | AGREE | `MOV ES:[DI+10h],0`, DI += abil |
| L778 | 7000:121f | for try := 1 to 6 (3d6) | AGREE | `[bp-14h] := 1`; `Roll(3, 6)` push 3, 6 |
| L781 | 7000:123d | dwarf: CON+1, CHA-1 | AGREE | abil=4 `INC [bp-15h]`, abil=5 `DEC` |
| L795 | 7000:131c | str>0 and a^[1]<age → str-1 | AGREE | `CMP ES:[DI+10h],0; JBE`; word[3F33h+race·0Ah] vs age `JAE` skip; 1351 `DEC` |
| L796 | 7000:1355 | str>0 and a^[2]<age → str-2 | AGREE | word[3F35h]; 138A `SUB ...,2` |
| L813 | 7000:1692 | a^[0] >= age → wis-1 | AGREE | word[3F31h] `CMP AX,age; JC` skip; `DEC` |
| L815 | 7000:16e4 | a^[2] < age → wis+1 | AGREE | word[3F35h] `JAE` skip; `INC` |
| L824 | 7000:18a3 | clamp dex to L^[0A]..L^[0B] | AGREE | byte[3DADh+race·10h] = 3DA3h+0Ah, unsigned `JAE` |
| L839 | 7000:1bd3 | DrawAbility(abil, false) | AGREE | push [bp-1Bh], push 0 |
| L851 | 7000:1c60 | cls=5 → spell_slots[3] := 1 | AGREE | `MOV ES:[DI+0B5h],1` (B2h+3) |
| L856 | 7000:1ca0 | for k := 1 to $38 | AGREE | `[bp-13h] := 1`; spell table `k shl 4 + 31FAh` |
| L859 | 7000:1ce8 | else if cls = 5 | AGREE | `CMP AL,5; JNZ 1D0C` |
| L860 | 7000:1cec | known_spell[$0B], [$12] := 1 | AGREE | `+3Dh`, `+44h` (then +45h, +47h on the next statement) |
| L879 | 7000:1e24 | if key <> 'Y' then goto reroll | AGREE | `CMP [bp-16h],59h; JZ; JMP 1200` |
| L882 | 7000:1e32 | SelectedChar := saved | AGREE | [bp-8]/[bp-6] → 5D92h/5D94h |
| L884 | 7000:1e5a | name := ReadBottomLine('Character name: ', $0D, 15) | AGREE | pushes prompt, 0Dh, 0Fh = ReadBottomLine(prompt [BP+0Ah], colour [BP+8], maxLen [BP+6]); StrAssign 15 |
| L935 | 7000:1f4a | c := SelectedChar | AGREE | `LES DI,[5D92h]` → [bp-5] |
| L966 | 7000:20e2 | DrawCharacterSheet | AGREE | `CALLF` stub ov19 e1 |
| L991 | 7000:221a | str < strMin[race,gender] | AGREE | byte[3DA3h+race·10h+gender] `JC` → then-branch |
| L992 | 7000:2241 | or str < ClassAbilityMin[class,0] | AGREE | class·6 (`SHL;MOV SI;SHL;ADD`) + 3F81h, `JNC` skip |
| L1019 | 7000:2546 | hp_max := MinHitPoints(SelectedChar) | AGREE | `CALL 3FB3`; AL → ES:[DI+32h] |
| L1031 | 7000:2605 | Inc(str_exc) | AGREE | `INC ES:[DI+16h]` |
| L1032 | 7000:2624 | str := strMax[race,gender] | AGREE | byte[3DA5h+race·10h+gender] |
| L1034 | 7000:264a | int > intMax → intMax | AGREE | byte[3DAAh] (3DA3h+7), `JBE` skip |
| L1037 | 7000:26c7 | spell_slots[0] > 0 → 1 | AGREE | `CMP ES:[DI+0B2h],0; JBE` |
| L1062 | 7000:288a | SelectedChar^.hp_max := savedHp | AGREE | [bp-8] byte → ES:[DI+32h] |
| L1094 | 7000:2a78 | case race (level limits) | AGREE | `CMP AL,1 …` |
| L1104 | 7000:2be6 | XpForLevel[cls,lvl+1] > 0 | AGREE | LongInt test: hi word [409Dh] `JG`/`JGE`, lo [409Bh] `JA` |
| L1113 | 7000:2cae | (haveBits and w[$550]) = 0 | AGREE | `AND AX,ES:[DI+550h]; OR AL,AL` (AH = 0, byte test equivalent) |
| L1134 | 7000:2e98 | AskYesNo('Do you wish to train? ', $0D, $0A, $0F) | AGREE | pushes string, 0Dh, 0Ah, 0Fh |
| L1136 | 7000:2eb8 | if not StingMode then PayGold(1000, SelectedChar) | AGREE | `CMP [470Ch],0; JNZ`; push DX:AX = 1000 then SelectedChar; PayGold(gold [BP+0Ah], c [BP+6]) |
| L1143 | 7000:2f18 | Inc(level[cls]) | AGREE | `INC ES:[DI+96h]` (DI += cls) |
| L1152 | 7000:2f6c | index := -1 | AGREE | `MOV word [bp-1Bh],0FFFFh` |
| L1159 | 7000:2fc4 | gain := hpRoll div nClasses; if 0 then 1 | AGREE | `IDIV CX` (signed), word [bp-11h]; `JNZ`/`MOV 1` |
| L1198 | 7000:31e0 | p := p^.next | AGREE | ES:[DI+104h]/[106h] |
| L1224 | 7000:32b0 | if p = SelectedChar | AGREE | far compare DX/AX vs 5D94h/5D92h |
| L1229 | 7000:33b5 | SelectedChar := p | AGREE | [bp-4]/[bp-2] → 5D92h |
| L1230 | 7000:33c2 | if not keepCount then Dec(w[$67C]) | AGREE | `CMP [bp+8],0; JNZ`; `DEC ES:[DI+67Ch]` (word) |
| L1249 | 7000:33f7 | head := head_pic; body := body_pic | AGREE | +0BBh, +0BCh |
| L1278 | 7000:357f | DrawIconAt(col + 3, row, 0, 1, $19) | AGREE | push [bp+0Ah]+3, [bp+8], 0, 1, 19h; DrawIconAt(col [BP+0Eh], row, dir, pose, slot [BP+6]) |
| L1290 | 7000:35c4 | maskSize := CombatIcons[dst].pose0^.frameSize | AGREE | `LES DI,[DI+5E5Ah]` (dst·8), word ES:[DI+11h] |
| L1295 | 7000:36ce | Move(src.pose1^.mask^, dst.pose1^.mask^, maskSize) | AGREE | first push [5E5Eh+src·8]→+13h (src = [bp+0Ch]), second dst ([bp+0Ah]), count [bp-24h] |
| L1317 | 7000:3862 | LoadCharacterIcon(0) | AGREE | push AL=0 |
| L1361 | 7000:3b1a | else slot := 1 | AGREE | `MOV [bp-16h],1` |
| L1365 | 7000:3b3b | 4: (size state) | AGREE | `CMP AL,4; JNZ 3BAF` |
| L1366 | 7000:3b46 | 'L' → icon_size := 2; LoadCharacterIcon(0) | AGREE | `CMP AL,4Ch`; +0C0h := 2; push 0 |
| L1367 | 7000:3b5d | 'S' → icon_size := 1; LoadCharacterIcon(0) | AGREE | `CMP AL,53h`; +0C0h := 1 |
| L1376 | 7000:3c19 | 'K' → cHead := icon_head; state := prev; key := ' ' | AGREE | +0BDh → [bp-4]; [bp-1Ah] → [bp-8]; [bp-2] := 20h |
| L1380 | 7000:3c62 | else if part = 'W' | AGREE | AL = [bp-1Bh] (part, loaded 3BC0, `CMP AL,48h` failed); `CMP AL,57h` |
| L1409 | 7000:3eb7 | ClearMenuLine | AGREE | stub ov25 e3 |
| L1443 | 7000:3fdc | if level[cls] > 0 | AGREE | `CMP ES:[DI+96h],0; JLE` (signed, ShortInt) |
| L1462 | 7000:40b5 | if level[cls] > 0 | AGREE | `JG` signed |
| L1467 | 7000:413f | 4: sum += (level+1)*8 | AGREE | `INC AX; SHL AX,3; ADD [bp-3],AL` |
| L1470 | 7000:4198 | 7: sum += (level+1)*4 | AGREE | `INC AX; SHL AX,1 ×2` |
| L1478 | 7000:4226 | MaxHitPoints := sum | AGREE | [bp-3] → result [bp-1]; `RETF 4` |
| L1486 | 7000:423f | for cls := 0 to 7 | AGREE | `[bp-4] := 0` … `CMP 7` |
| L1490 | 7000:42b8 | r := HitDieSides[cls]*2 div 3 | AGREE | byte[08BEh+cls] `SHL 1; DIV 3` (unsigned) |

Result: **75 AGREE, 0 DISAGREE, 0 UNSURE**.

### Extra argument-order checks (beyond argcheck: constants / string arguments)

| address | call | pushes (asm order) | verdict |
|---|---|---|---|
| 7000:01A9 | DrawTitledFrame(1, 1, $26, $16, 0, 0, '') | 1, 1, 26h, 16h, 0, 0, '' | AGREE |
| 7000:0273 / 02BB | DrawText(2, row+12, $0F, text[1]) / DrawText(3, row+12, $0A, Copy(text, 2, Length-1)) | 2, row+0Ch, 0Fh, CharToStr; 3, row+0Ch, 0Ah, Copy(ds:619h+i·2Ah, 2, len−1) | AGREE |
| 7000:02F8 | HorizontalMenu('Choose a function ', g_05F0, $0D, 0, 0, true, false, ext) | string, DS:05F0, 0Dh, 0, 0, 1, 0, @ext | AGREE |
| 7000:0481 | AskYesNo('Quit to DOS ', $0E, $0A, $0F) | string, 0Eh, 0Ah, 0Fh | AGREE |
| 7000:0F26 | Roll(a^.dice, a^.sides) | ES:[DI+2], ES:[DI+3] | AGREE |
| 7000:1E1C | AskYesNo('Keep this character? ', $0D, $0A, $0F) | string, 0Dh, 0Ah, 0Fh | AGREE |
| 7000:1F81 / 1FA6 | AskYesNo('Drop <name> forever? ' / 'Are you sure? ', $0E, $0A, $0F) | string, 0Eh, 0Ah, 0Fh | AGREE |
| 7000:2169 | HorizontalMenu('Modify character: ', 'Keep Exit', $0D, $0A, $0F, true, false, ext) | …, 0Dh, 0Ah, 0Fh, 1, 0, @ext | AGREE |
| 7000:2D76 | DrawText(Length(name) + 4, row, $0A, ' will become:') | len+4, [bp-16h] (= 4 at 2D39), 0Ah, string | AGREE |
| 7000:30E5 | VerticalListMenu(…, $0D, $0A, $0F, 1, 2, $26, $16, …) | 0Dh, 0Ah, 0Fh, 1, 2, 26h, 16h, list | AGREE |
| 7000:3444 | HorizontalMenu('', 'Head Body Keep', 0, $0F, $0A, false, false, ext) | '', string, 0, 0Fh, 0Ah, 0, 0 | AGREE |
| 7000:390B | DrawText(8, 6, $0F, 'old') | 8, 6, 0Fh, string | AGREE |
| 7000:39F9 | HorizontalMenu('', sizeStr + IconMenuText[state], $0D, $0A, $0F, false, false, ext) | DI = state·29h + 07BFh; 0Dh, 0Ah, 0Fh, 0, 0 | AGREE |
| 7000:3F17 | AskYesNo('Is this icon ok? ', $0D, $0A, $0F) | string, 0Dh, 0Ah, 0Fh | AGREE |

argcheck (scratch run): PARTY 1015 calls, 0 MISMATCH; no ov16 call found reversed in the sample or these 14.

### Sweeps (all ov16 sections)

| class | checked sites | findings |
|---|---|---|
| call-argument order | 75 sample + 14 extra calls; signatures of AddEffect, DrawAbility, ReadBottomLine, AskYesNo, HorizontalMenu, PayGold, DrawIconAt, LoadCharacterIcon cross-checked against their [BP+xx] layouts (COMBAT/ENGINE/VIEW/PARTY headers) | 0 |
| signed vs unsigned compares | all 48 signed jumps (JL/JG/JLE/JGE) in ov16 mapped to their pseudo statement: range/case tests (0666, 0BB0), ShortInt levels (0CC1 … 4257, marked "signed" where it matters), LongInt XP/gold/due tests (20B0, 2BB8–2C8C, 29F2, 431A–43E7), signed Abs/HP comparisons (1D87, 403F, 41E8, 42B6), IDIV results (3006) — all written with signed semantics; unsigned sites in the sample (JC/JAE/JBE) written unsigned | 0 |
| byte vs word operands | sample (row/index bytes, gain/index words, w[$67C] word, LongInt XP, longint CoinValue) | 0 |
| folded constant array indexes | all 56 DS-indexed bases in ov16 (3C7C BaseThac0, 3CF5, 3DA3..3DB2 RaceAbilityLimits fields, 3E17 RaceClasses, 3E5B..3E72 StartAge [race·1Ch + class·4], 3F31..3F37 AgeCategory, 3F81..3F86 ClassAbilityMin, 3FE7 ClassAligns, 408E ConHpAdj, 409B/409D XpForLevel, 4263/4264, 05D6 ClassMaskBit, 05DE ClassTrainBits, 08B6/08BE hit dice, 0D24/0D26 CoinValue (LongInt), 5E5A..5E60 CombatIcons, 0619/061A/0642 MenuEntry) appear as arrays with the right base; table values spot-checked against the DS image: 05D6 = 02 10 08 40 80 01 04 20, 08B6 = 1 1 1 1 2 1 1 2, 08BE = 8 8 10 10 8 4 6 4, 0D24 = 1, 10, 100, 200, 1000, 3CF5[1..6] = 1 2 3 4 6 7, 3C7C level 1 = 28h | 0 |
| and/jge/neg = ABS | 1D73 `CWD; XOR AX,DX; SUB AX,DX` = Abs(conAdj) (L869), 4024/41CD same pattern (L1449/L1475), 43D2 System.@LongAbs (L1511) | 0 |
| Pascal set tests | all 6 @SetIn sites, set constants decoded from CS: 0314 ['G','O'], 033D ['E','S'], 1831 [8..12], 3AAF/3B27/3E4D [#0,'E'] — all match the pseudo | 0 |
| string length bytes | 02BB `Copy(text, 2, Length − 1)` (length byte [619h+i·2Ah] − 1), 2D5C `Length(name) + 4`, 1E70 empty-name test `CMP ES:[DI],0` → re-prompt; icon menu text Delete/Insert at 3A3E/3A55 | 0 |

### Screens (ov16 rows of PARTY_SCREENS.md)

| id | verdict | evidence |
|---|---|---|
| PARTY-ov16a-01 | AGREE | DrawTitledFrame(1,1,26h,16h,0,0,'') 01A9; enable flags MenuEntry[i].+29h (DS:0642+i·2Ah) set at 01C4..0224 exactly as the table (T: w[$550] > 0 `JA` or StingMode); rows 12+, col 2 colour 0Fh / col 3 colour 0Ah; HorizontalMenu prompt 0Dh, option string DS:05F0 colours 0/0 (invisible); Home/End = set ['G','O'] 0314 |
| PARTY-ov16a-02 | AGREE | 'Quit to DOS ' AskYesNo 0Eh/0Ah/0Fh (0471..0481) |
| PARTY-ov16a-03 | AGREE | 'STING' param test, 'I Understand, master...' ShowTimedBottomMessage (04DA..04E1) |
| PARTY-ov16a-04 | AGREE | 'Pick Race' header; items 1..5 and 7 with '  ' prefix (0664 `in [1..5]`, 06B8 `=7`); index 6 → 7 (078C); VerticalListMenu window args 1, 2, 26h, 16h, colours 0Dh/0Ah/0Fh (0775) |
| PARTY-ov16a-05 | AGREE | 'Pick Gender' 093C, same list routine |
| PARTY-ov16a-06 | AGREE | 'Pick Class' 0A6A, RaceClasses[race·12] (0A47) |
| PARTY-ov16a-07 | AGREE | 'Pick Alignment' 0DAC, ClassAligns[class·10] (0D89) |
| PARTY-ov16a-08 | AGREE | 'Keep this character? ' AskYesNo 0Dh/0Ah/0Fh (1E0C..1E1C); N → `JMP 1200` re-roll |
| PARTY-ov16a-09 | AGREE | 'Character name: ' ReadBottomLine colour 0Dh, max 0Fh (1E4D..1E5A); empty → loop 1E74 |
| PARTY-ov16b-01 / 01a / 01b | AGREE | 'Drop '+name+' forever? ', 'Are you sure? ' AskYesNo 0Eh/0Ah/0Fh (1F5D..1FA6); 'You dump '…' out back.', ' bids you farewell.', ' breathes a sigh of relief.' (1FC3..2023) |
| PARTY-ov16b-02 | AGREE | ' can't be modified.' ShowTimedBottomPrompt colour 0Eh (20D0..20DA) |
| PARTY-ov16b-03 | AGREE | 'Modify character: ' + 'Keep Exit' HorizontalMenu 0Dh/0Ah/0Fh, allowExt (213F..2169) |
| PARTY-ov16b-04 | AGREE | four refusal strings, ShowTimedBottomPrompt 0Eh (29D0, 2A0A, 2CC8, 2CF6); StingMode bypasses (29EA/29FB) |
| PARTY-ov16b-05 | AGREE | ClearRectangle, row [bp-16h] := 4 (2D39), DrawCharacterName col 4, ' will become:' at Length(name)+4 colour 0Ah (2D76); '    a level ' / 'and a level ' (2DC8 / 2E2A) col 6 (2DB5); 'Do you wish to train? ' 0Dh/0Ah/0Fh (2E88..2E98) |
| PARTY-ov16b-06 | AGREE | 'Congratulations...' ShowTimedBottomMessage (2EAC); PayGold(1000) unless StingMode; SpellList(4, 4, idx, found) loop (2F71..2F81) |
| PARTY-ov16b-07 | AGREE | 'Add a character: ' + 'Add Exit' 0Dh/0Ah/0Fh, list window 1, 2, 26h, 16h (30B7..30E5); '* ' prefix (314D) |
| PARTY-ov16b-08 | AGREE | 'Head Body Keep' HorizontalMenu colours 0/0Fh/0Ah (3429..3444); ShowPortrait 340D |
| PARTY-ov16b-09 | AGREE | DrawTitledFrame + PaletteFlashOn (3855/385A); 'old' (8,6) 0Fh, 'ready   action' (3,10) 0Fh, 'new' (8,12), 'ready   action' (3,16) (38F3..395B) |
| PARTY-ov16b-09a..09e | AGREE | IconMenuText DS:07BF + state·29h (39DA): 1 'Parts color-1 color-2 Size Exit', 2 'Head Weapon Exit', 3 'Weapon Body xxxx Shield Arm Leg Exit' (xxxx → 'Hair'/'Face' 3A46/3A7D), 4 sizeStr ('Small'/'Large' 398A/399F) + ' Keep Exit', 5 'Next Prev Keep Exit' — image bytes; HorizontalMenu 0Dh/0Ah/0Fh (39E5..39EB) |
| PARTY-ov16b-09f | AGREE | 'ICON' reload when travel_Mode > 1 (3EC4..3EED); 'Is this icon ok? ' AskYesNo 0Dh/0Ah/0Fh (3F07..3F17); PaletteFlashOff 3F28 |

26 rows: 26 AGREE. No acceptance/ref capture covers an ov16 screen (DECODE_CHECKS.md lists PARTY rows as reserved).

DISAGREE: none.
