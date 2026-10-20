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
