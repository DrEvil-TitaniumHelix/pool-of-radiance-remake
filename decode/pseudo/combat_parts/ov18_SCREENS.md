# ov18 screens — dragon finale (lane por-mod-combat)

Text window = text rows 17..22, columns 1..38 (cleared with ClearTextRectangle(1,17,38,22)); all text colour 10. Pictures: DAX file `FINAL<DataSet>.dax` (LoadPicture/LoadAnimation append `.dax`). No key is read anywhere in ov18.

## COMBAT-ov18-01 Dragon dies (page 1)
- Trigger: ECL `PROGRAM 8` (ecl_op38_Program 2F00:2E5A) → DragonFinale 7A00:02A4. Game mode `game_Mode` := 7 for the whole sequence.
- Text (col 1): row 17 `Mortally wounded, the dragon roars!`, row 18 `The spirit of Tyranthraxus flares up`, row 19 `from the dragon's body.`
- Then RedrawCurrentMode: mode 7 has no case in RedrawCurrentMode 00BA:27D9 (cases 0,1,2,3,4,6 only), so nothing is drawn; picture FINAL record 1 drawn at cell (0,0) into the screen picture, animation FINAL record 2 played at cell (3,5) for `(5*(10-GameSpeed)) shr 1` loops. The FINAL picture first becomes visible at the first FlushViewDirtyLines in PlayFinaleAnimation (7a00:006f).
- Keys: none. Next: COMBAT-ov18-02.

## COMBAT-ov18-02 Tyranthraxus speaks (page 2)
- Pictures: FINAL record 3 at (0,0); if party members (`ecl_Mem6B00^.w[$67C]`) > 1: record 4 at (0,11); > 2: record 5 at (13,9); > 3: record 6 at (0,9) (col,row cells, M).
- Text (col 1, rows 17..22):
  - `"Fools, you have but slain the body`
  - `I possessed.  I cannot be defeated!"`
  - `With the power of the pool of radiance`
  - `which I moved here, to my lair,`
  - `I will still rule, by possessing one`
  - `of you!"`
- Animation FINAL record 7 at (3,1), `(5*(10-GameSpeed)) shr 1` loops. Keys: none. Next: COMBAT-ov18-03.

## COMBAT-ov18-03 Bane recalls him (page 3)
- Text (col 1, rows 17..20): `"No Lord Bane!  I can still rule here!` / `I have not failed.  Do not call me back` / `through the pool!"` / `Noooo...`
- Animation FINAL record 8 at (3,1), 1 loop; then 3 × MessageDelay (3 × GameSpeed*225 ms).
- Exit: game mode restored, RedrawCurrentMode; control returns to the ECL script (next instruction after PROGRAM).

## COMBAT-ov18-04 Overland tiles recolour (no text)
- Trigger: RecolourOverlandTiles 7A00:06B3. From ecl_RunAfterNewBlock (2F00:3243) with animate = 1 when `ecl_Mem4900^.w[$1CC] = 0`, `ecl_Block = $1A` and `ecl_Mem4900^.w[$366] = $FE` and `ecl_Mem4900^.w[$344] = 0`; from LoadGame (7500:1CB2) with animate = 0 when `ecl_Mem4900^.w[$344] <> 0` (restores the changed tiles after loading).
- animate = 1: overland view drawn at map (17,15); 9 steps of a 25 % dithered recolouring of 29 SQRPACI tiles (colour 7→2, plus 0→1 in 11 of them), the view redrawn after each step at (17,15)×3, (19,20)×3, (23,25)×3; then the full recolouring, view at (23,25), two MessageDelays.
- animate = 0: full recolouring only, nothing drawn.
- Keys: none. Next: back to the caller.
