# ov18 notes (lane por-mod-combat)

## (a) Routines

| routine | name | conf | evidence |
|---|---|---|---|
| 7A00:0006 | PlayFinaleAnimation | M | loads animation via LoadAnimation with literal "FINAL" (7A00:0000), plays frames timed by TimeInHundredths until `cycles` loops (7a00:0074..0101), frees it (FreeAnimation) |
| 7A00:02A4 | DragonFinale | H | strings "Mortally wounded, the dragon roars!" … "Noooo..." (7A00:0114..029B); only caller ecl_op38_Program `PROGRAM 8` (2F00:2E5A); ECL_VM.md op 38 "endgame sequence" |
| 7A00:06B3 | RecolourOverlandTiles | M | RecolorPicture on SQRPACI tile sets TileSetLo/TileSetHi (loaded "sqrpaci" rec 1/2 in ov11 5700:04C3..04FD) with colour tables 7→2 / 0→1; redraws via DrawOverlandWindow (overland table DS:3648, GEO.md) |
| 7A00:08F6 | ov18_init | H | empty unit initialiser, called from main 0000:0097 |

Counts: 4/4 routines covered; H 2 (DragonFinale, ov18_init), M 2, L 0.

## (b) Globals named

| DS | name | conf | evidence |
|---|---|---|---|
| 470E (far ptr 470E:4710) | FinalePic | M | `var pic` of every LoadPicture('FINAL'+…) and `src` of DrawPicture in DragonFinale; only user ov18 (GLOBALS.md) |
| 4712 | SavedMode | H | `:= game_Mode` at 7a00:02c5, restored to game_Mode at 7a00:06a4; only user ov18 |
| 4713 | DataSetStr | M | `Str(DataSet:0, s)` into a string[1] at 7a00:02c0, appended to 'FINAL' (3 users, all ov18) |
| 0900 | TileListA | M | 11 tile numbers (bit 7 = second SQRPACI set) recoloured with g_092D |
| 090B | TileListB | M | 18 tile numbers recoloured with g_093D |

Left as g_: `g_091D`, `g_092D`, `g_093D` (16-byte colour maps, contents in ov18.pas.md), `g_094D`/`g_095F` (view position per step), `TileSetLo`/`TileSetHi` (SQRPACI tile pictures; named by whoever owns ov11/ov32), `GameSpeed` (GameSpeed in magic_names.json: Delay(GameSpeed*225) in 0709:0DBE), `game_Mode` (game mode byte, SAVES §2; owner ECL/ENGINE), `g_4A20` (screen picture, VIEW).

## (c) Unknowns
- Meaning of the `mode = 2` argument of LoadAnimation (passed to the picture converter 0464:02A5 / bit 0 triggers a colour remap on EGA) — VIEW lane.
- Exact col/row semantics of DrawPicture (0464:0D71) arguments `[BP+14h]`/`[BP+12h]` (M: `[BP+12h]` is multiplied by 8 and by the destination width → row).
- What `ecl_Mem4900^.w[$344]`, `w[$366] = $FE` and `w[$1CC]` mean (ECL variables; the tile recolouring is shown when 344h = 0 and is re-applied on LoadGame when 344h ≠ 0, so 344h is presumably set by the script after the event — not set in ov18).
- The story meaning of the overland tile recolouring (which map feature the 29 tiles are).

## (d) Cross-area questions
- ECL lane: `PROGRAM 8` is the only entry to DragonFinale; confirm which ECL record calls it (ECL_VM.md mentions "TYRANTHRAXUS HAS FINALLY BEEN DEFEATED").
- VIEW lane: please name DrawOverlandWindow (overland view draw at map cell), DrawPictureScreenOrView (draw picture at cell + present), LoadAnimation (load animation), FreeAnimation (free animation) — used here with those behaviours.
- ENGINE lane: 0709:0626 argument order confirmed here from 30+ call sites as (col, row, colour, s); 0709:0DD3 as (col1, row1, col2, row2).
- Heap: FinalePic is not freed after the finale (leak, harmless at game end).

## Self-check
Sample (≥ 10 % of ~95 statements; re-read against ov18.lst): 7a00:000c, 7a00:004c, 7a00:009e, 7a00:00e6, 7a00:00f9, 7a00:02c5, 7a00:0393, 7a00:0407, 7a00:0440, 7a00:049b, 7a00:04f7, 7a00:05d8, 7a00:0683, 7a00:06b9, 7a00:06f4, 7a00:0765, 7a00:07bf, 7a00:08ce.
Results:
- 004c: pushes `[BP+0C]-1`, `[BP+0A]-1`, 0, 0, frame-1 pic `[BP-3C]`, g_4A20 → `DrawPicture(col-1,row-1,0,0,anim.frame[1].pic,g_4A20)` ✓.
- 009e: `(GameSpeed+3)` CWD → long, × `[BP+DI-48]` (frame.delay, DI = cur*8) via LongMul; `t-t0` compared signed hi / unsigned lo, JG → advance ✓.
- 00f9: `CMP [BP-4B],[BP+6]` JZ exit → `until done = cycles` ✓.
- 0393: pushes 3, 5, 2, `((10-GameSpeed)*5) shr 1` → (col 3, row 5, anim 2) ✓.
- 0407/0462/04be: `CMP ES:[DI+67Ch], 1/2/3; JBE skip` → `> 1/2/3` ✓.
- 0440/049b/04f7: positions (0,0Bh), (0Dh,9), (0,9) in push order ✓.
- 0683: pushes 3, 1, 8, 1 ✓.
- 06b9: `CMP [BP+6],0; JNZ 06c2; JMP 07ec` → animated part skipped when 0 ✓.
- 06f4/0720: bit-7 test `CMP [DI+900h],7Fh JBE` → >7Fh uses TileSetHi with `AND 7Fh`, else TileSetLo; dither byte 1; colour tables 091D/092D ✓. 0765: 093D for list B ✓.
- 07bf: pushes `[094D+2*step]` then `[095F+2*step]` → DrawOverlandWindow(col,row) ✓.
- Fix made during the check: the caller of 7A00:06B3 at 2F00:3243 is ecl_RunAfterNewBlock (not ecl_GameLoop); corrected in ov18.pas.md and ov18_SCREENS.md.

## Normalisation pass
- Names replaced: VIEW `LoadAnimation` (LoadAnimation), `DrawPictureScreenOrView` (DrawPictureScreenOrView; written with its address because ENGINE 0464:0D71 is also published as `DrawPicture`), `FreeAnimation` (FreeAnimation), `DrawOverlandWindow` (DrawOverlandWindow); ENGINE `ClearTextRectangle`, `FlushViewDirtyLines`, `RecolorPicture`; globals `GameSpeed` (49E2), `game_Mode` (49F3), `TileSetLo`/`TileSetHi` (5E52/5E56), `OverlandMap` (3648).
- Calls re-checked (push order vs published signature): LoadAnimation(name, id, flags, anim), DrawPictureScreenOrView(col, row, toView, pic), DrawOverlandWindow(wx, wy), DrawPicture{0464:0D71}(col, row, frame, flags, src, dst), LoadPicture(name, id, maskFlags, transpColour, pic), RecolorPicture(from, to, frame, dither, pic), DrawText, ClearTextRectangle, TimeInHundredths, MessageDelay, RedrawCurrentMode — all already in Pascal order; no arg-order fixes.
