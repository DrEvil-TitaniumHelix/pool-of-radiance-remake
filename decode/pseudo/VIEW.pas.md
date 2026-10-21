# VIEW — 3D view, area map, movement, wall sets, sprites (FINAL pseudocode, lane por-mod-view)

Units (herdr/assignments/por-areas.md): ov10, ov14, ov23, ov25, ov26, ov27, ov28, ov29, ov30, ov31, ov32, ov33, ov34.
Sources: `decode/listings/<unit>.lst` (evidence) and `.c` (Ghidra aid). Data specs: `decode/data/GEO.md`, `WALLDEF.md`, `PICTURES.md`, `SAVES.md`.

Conventions
- **Signatures are in Pascal order**: first parameter = highest BP offset (pushed first). Ghidra's `param_1..n` list is the reverse (verified: b100:070F..0723 pushes col, row, type, piece for DrawWallPiece, whose body reads piece at `[BP+6]`, col at `[BP+0Ch]`). Parameters are given as `name [BP+xx]`.
- `{ seg:off }` = address of the first instruction of the statement (or of the call that implements it).
- Globals: `g_XXXX` = DS:XXXX (GLOBALS.md); names introduced here are listed in `decode/names/view_names.json` and requested in STATUS.md. Pointers `p^[i]` are far.
- ENGINE routines (other lane) are named by behaviour in comments and kept as `FUN_` here: `0802:0716 LoadDaxRecord`, `0464:0111 LoadPicture` (written in Pascal order `LoadPicture(name, id, flag, maskColour, var pic)` = push order; fix #fable-3), `0464:1B52` (copy changed view lines from the off-screen view buffer `g_4A20^` to video), `0464:1951` (blit a picture at a cell position), `0464:08D4` (draw one frame of a picture into a target picture), `0464:2632` (fill a rectangle of a picture with a colour), `0464:00FF` (restore text colours), `0899:0059`/`0899:0000` (wait key / halt to DOS), `0AF8:*` = Turbo Pascal System (RT_LEDGER names).

Map coordinate convention (from the getters): cell index = `y*16 + x`; directions 0/2/4/6 = N/E/S/W; step tables `g_2736[dir]` = dx `{0,1,1,1,0,-1,-1,-1,0}` and `g_273F[dir]` = dy `{-1,-1,0,1,1,1,0,-1,0}` (image bytes, H).

---

## ov29 (B100) — map access, 3D view renderer, wall sets, map loader

### B100:0000 DrawAreaMap (M)
`procedure DrawAreaMap(x [BP+0Ah], y [BP+8], dir [BP+6]: ShortInt)` — callers: Draw3DView (when `g_6AAC <> 0`). Callees: GetWallType, Put8x8Symbol (ov34 e2), FlushView.
Draws an 11×11-cell overhead map of the area around the party (one 8×8 symbol per map cell) into the view window, plus an arrow for the party. Name: M (behaviour; it is the alternate branch of the 3D renderer selected by `g_6AAC`, symbols 104h..113h are the 16 wall-combination symbols of block 4).
```pascal
x0 := x - 5;  if x0 < 0 then x0 := 0;  if x0 > 5 then x0 := 5;          { b100:0007 }
y0 := y - 5;  if y0 < 0 then y0 := 0;  if y0 > 5 then y0 := 5;          { b100:0034 }
for r := 0 to 10 do                                                     { b100:0061 }
  for c := 0 to 10 do begin                                             { b100:0079 }
    sym := $104;                                                        { b100:0082 }
    if GetWallType(x0+c, y0+r, 0) <> 0 then sym := $105;                { b100:00a2 }
    if GetWallType(x0+c, y0+r, 2) <> 0 then sym := sym + 2;             { b100:00b8 }
    if GetWallType(x0+c, y0+r, 4) <> 0 then sym := sym + 4;             { b100:00cf }
    if GetWallType(x0+c, y0+r, 6) <> 0 then sym := sym + 8;             { b100:00e6 }
    Put8x8Symbol(c+2, r+2, sym, 1, 0);                                  { b100:010c }
  end;
Put8x8Symbol(x - x0 + 2, y - y0 + 2, (dir shr 1) + $100, 1, 0);         { b100:0146  party arrow = symbols 100h..103h }
FlushView;                                                              { b100:014c }
```
Note: the area map shows a 16×16 map as an 11×11 window clamped to the map (x0, y0 ∈ 0..5).

### B100:0155 SetBackdropColours (M)
`procedure SetBackdropColours(c0 [BP+0Ch], c1 [BP+0Ah], c2 [BP+8], c3 [BP+6]: Byte)` — no static callers in the VIEW units (called via stub ov29 e1 by ov26).
```pascal
g_6A60 := c0;  g_6A61 := c1;  g_6A62 := c2;  g_6A63 := c3;            { b100:0158 }
```
### B100:0174 DrawBackdrop (M)
`procedure DrawBackdrop` — caller Draw3DView. Fills four rectangles of the view picture `g_4A20^` (FillPictureRect 0464:2632, Pascal order = push order: x, y, width, height, colour, pattern table `@g_260A`, picture):
```pascal
FillPictureRect(2, $10, $0B, $2B, g_6A60, @g_260A, g_4A20);            { b100:0198  sky / ceiling }
FillPictureRect(2, $3B, $0B, $01, g_6A61, @g_260A, g_4A20);            { b100:01be }
FillPictureRect(2, $3C, $0B, $02, g_6A62, @g_260A, g_4A20);            { b100:01e4 }
FillPictureRect(2, $3E, $0B, $2A, g_6A63, @g_260A, g_4A20);            { b100:020a  ground }
```
(Argument order fixed after por-argcheck VIEW: x = 2, y = 10h/3Bh/3Ch/3Eh, width 0Bh, height 2Bh/1/2/2Ah — sky rows 10h..3Ah, then horizon bands and ground, M.)

### B100:0211 DrawWallPiece (H)
`procedure DrawWallPiece(col [BP+0Ch], row [BP+0Ah]: ShortInt; wallType [BP+8], piece [BP+6]: Byte)` — caller Draw3DView. Callee Put8x8Symbol.
Draws piece `piece` (0..9) of wall type `wallType` (1..15) as a block of 8×8 symbols whose top-left cell is (col, row) of the 11×11 view grid; cells outside 0..10 are clipped, symbol 0 is transparent (not drawn).
```pascal
k := g_0C8C[piece];                                  { b100:0217  start offset of the piece in the 156-byte wall type }
lastCol := col + g_0C96[piece] - 1;                  { b100:0225  width in cells }
lastRow := row + g_0CA0[piece] - 1;                  { b100:023e  height in cells }
for r := row to lastRow do
  for c := col to lastCol do begin
    if (r >= 0) and (r < 11) and (c >= 0) and (c < 11) then
      if g_6A58^[(wallType-1)*$9C + k] <> 0 then     { WallBuf, 156 bytes per wall type }
        Put8x8Symbol(c+2, r+2, g_6A58^[(wallType-1)*$9C + k], 1, 1);
    k := k + 1;                                      { advances even for clipped cells }
  end;
```
Tables (image bytes, H): `g_0C8C` start = 0, 2, 6, 10, 22, 38, 54, 110, 132, 154; `g_0C96` width = 1, 1, 1, 3, 2, 2, 7, 2, 2, 1; `g_0CA0` height = 2, 4, 4, 4, 8, 8, 8, 11, 11, 2. Σ width×height = 156 → **this resolves the 156-byte wall-type layout** (see WALLDEF.md update): row-major blocks of symbol numbers, piece by piece.

### B100:031F InMap (H)
`function InMap(x [BP+8], y [BP+6]: ShortInt): Boolean`
```pascal
InMap := (y < 16) and (y >= 0) and (x < 16) and (x >= 0);               { b100:0325 }
```
### B100:0350 GetPassage (H)
`function GetPassage(x [BP+0Ah], y [BP+8]: ShortInt; dir [BP+6]: Byte): Byte` — callers: movement/ECL via stub ov29 e2.
```pascal
if not InMap(x, y) and ((g_84DC = 0) or (g_84DC = 10)) then GetPassage := 0   { b100:035f }
else begin
  if x > 15 then x := 0;  if x < 0 then x := 15;                         { b100:037b  wrap }
  if y > 15 then y := 0;  if y < 0 then y := 15;                         { b100:038f }
  result := 1;
  if GetWallType(x, y, dir) <> 0 then                                    { b100:03b4 }
    case dir of                                                          { b100:03c1 }
      6: result :=  g_6A5C^[$300 + y*16 + x] shr 6;
      4: result := (g_6A5C^[$300 + y*16 + x] and $30) shr 4;
      2: result := (g_6A5C^[$300 + y*16 + x] and $0C) shr 2;
      0: result :=  g_6A5C^[$300 + y*16 + x] and 3;
    end;
  GetPassage := result;
end;
```
### B100:047B GetWallType (H)
`function GetWallType(x [BP+0Ah], y [BP+8]: ShortInt; dir [BP+6]: Byte): Byte`
```pascal
if not InMap(x, y) and ((g_84DC = 0) or (g_84DC = 10)) then GetWallType := 0  { b100:048a }
else begin
  wrap x, y into 0..15 as in GetPassage;                                 { b100:04a6 }
  case dir of                                                            { b100:04d1 }
    0: GetWallType := g_6A5C^[y*16 + x] shr 4;
    2: GetWallType := g_6A5C^[y*16 + x] and $0F;
    4: GetWallType := g_6A5C^[$100 + y*16 + x] shr 4;
    6: GetWallType := g_6A5C^[$100 + y*16 + x] and $0F;
  end;
end;
```
`g_84DC` = area/map kind: values 0 and 10 = bounded map (outside cells have no walls), others = the map wraps at the edges (H for the test; the kind's meaning: see ov14 / ECL).

### B100:057A GetCellAttr (H)
`function GetCellAttr(x [BP+8], y [BP+6]: ShortInt): Byte` — same bounds/wrap rule, returns `g_6A5C^[$200 + y*16 + x]` (plane 2).  { b100:0589 .. b100:05cc }

### B100:05F3 FlushView (M)
`procedure FlushView` → `FlushViewDirtyLines` (copy the changed lines of the off-screen view picture to the screen).  { b100:05f6 }

### B100:05FD Draw3DView (H)
`procedure Draw3DView(x [BP+0Ah], y [BP+8]: ShortInt; dir [BP+6]: Byte)` — callers: ov14 movement (stub ov29 e5). Callees: DrawAreaMap, DrawBackdrop, GetWallType, InMap, DrawWallPiece, FlushView.
The view is an 11×11 grid of 8×8 cells (88×88 px) placed at screen pixel (24,24) = text cell (3,3), measured in a DOSBox capture (fix #ref-1); the code passes cell coordinates `+2` to DrawWallPiece/Put8x8Symbol, so those routines' origin is one cell further in (ENGINE, L). The renderer starts two squares ahead of the party and works back to the party's square (painter's order, far → near). For each distance it draws, for the squares in a row across the view, the front wall (facing the party = side `dir`) and the side walls (sides `left = dir+6`, `right = dir+2`).
```pascal
if g_6AAC <> 0 then begin DrawAreaMap(x, y, dir); exit end;                 { b100:0603 }
DrawBackdrop;                                                               { b100:061e }
left := (dir + 6) mod 8;  back := (dir + 4) mod 8;  right := (dir + 2) mod 8;  { b100:0621 }
cx := x + 2*g_2736[dir];  cy := y + 2*g_273F[dir];                          { b100:066b  square two ahead }
for dist := 2 downto 0 do begin                                             { b100:069c }
  case dist of
  2: begin                                                                   { far row: 4 squares to each side }
       { pass 1: from the centre to the left }                               { b100:06a6 }
       sx := cx; sy := cy; off := 0; edge := 0;
       for i := 0 to 3 do begin
         w := GetWallType(sx, sy, dir);                                      { b100:06d5  front wall of that square }
         if not InMap(sx, sy) and (GetWallType(sx, sy, right) = 0) then edge := 0;   { b100:06e4 }
         if w = 0 then begin
           if (edge <> 0) and (GetWallType(sx - g_2736[left], sy - g_273F[left], left) <> 0) then
             DrawWallPiece(g_0CBC + off + 1, g_0CD0, edge, 9);               { b100:0723  far corner piece }
           edge := 0;
         end else begin
           if edge <> 0 then DrawWallPiece(g_0CBC + off + 1, g_0CD0, edge, 9);   { b100:0792 }
           DrawWallPiece(g_0CAA + off, g_0CBE, w, 0);                        { b100:073f  far front wall 1×2 }
           edge := w;
         end;
         off := off - 2;  sx := sx + g_2736[left];  sy := sy + g_273F[left];
       end;
       { pass 2: from the centre to the right — same with `right`, corner at g_0CBC + off - 1, off := off + 2 }   { b100:07c7..08e5 }
       { far side walls, left: }                                             { b100:08e8 }
       sx := cx; sy := cy; off := 0;
       for i := 0 to 2 do begin
         w := GetWallType(sx, sy, left);                                     { b100:0910 }
         if w <> 0 then
           if i = 0 then DrawWallPiece(g_0CAC + off, g_0CC0, w, 1)           { b100:0935 }
           else DrawWallPiece(g_0CAC + off - 1, g_0CC0, w, 1);               { b100:094e }
         off := off - 2;  sx := sx + g_2736[left];  sy := sy + g_273F[left];
       end;
       { far side walls, right: piece 2 at g_0CAE + off (+1 after the first), off := off + 2 }   { b100:097f; calls b100:09cc / 09e5 }
     end;
  1: begin                                                                   { middle row, squares -2..+2 }
       sx := cx + 2*g_2736[left]; sy := cy + 2*g_273F[left]; off := -6;      { b100:0a20; draws b100:0aa6 (piece 3), b100:0ad5 (piece 4) }
       for i := 0 to 2 do begin
         w := GetWallType(sx, sy, dir);   if w <> 0 then DrawWallPiece(g_0CB0 + off, g_0CC4, w, 3);   { front 3×4 }
         w := GetWallType(sx, sy, left);  if w <> 0 then DrawWallPiece(g_0CB2 + off, g_0CC6, w, 4);   { left side 2×8 }
         off := off + 3;  sx := sx + g_2736[right];  sy := sy + g_273F[right];
       end;
       sx := cx + 2*g_2736[right]; sy := cy + 2*g_273F[right]; off := 6;     { b100:0b06; draws b100:0b8c (3), b100:0bbb (5) }
       for i := 0 to 2 do begin
         w := GetWallType(sx, sy, dir);   if w <> 0 then DrawWallPiece(g_0CB0 + off, g_0CC4, w, 3);
         w := GetWallType(sx, sy, right); if w <> 0 then DrawWallPiece(g_0CB4 + off, g_0CC8, w, 5);   { right side 2×8 }
         off := off - 3;  sx := sx + g_2736[left];  sy := sy + g_273F[left];
       end;
     end;
  0: begin                                                                   { near row: squares -1..+1 }
       sx := cx + g_2736[left]; sy := cy + g_273F[left]; off := -7;          { b100:0bf6; draws b100:0c58 (6), b100:0c87 (7) }
       for i := 0 to 1 do begin
         w := GetWallType(sx, sy, dir);   if w <> 0 then DrawWallPiece(g_0CB6 + off, g_0CCA, w, 6);   { front 7×8 }
         w := GetWallType(sx, sy, left);  if w <> 0 then DrawWallPiece(g_0CB8 + off, g_0CCC, w, 7);   { left side 2×11 }
         off := off + 7;  sx := sx + g_2736[right];  sy := sy + g_273F[right];
       end;
       sx := cx + g_2736[right]; sy := cy + g_273F[right]; off := 7;         { b100:0cb8; draws b100:0d1a (6), b100:0d49 (8) }
       for i := 0 to 1 do begin
         w := GetWallType(sx, sy, dir);   if w <> 0 then DrawWallPiece(g_0CB6 + off, g_0CCA, w, 6);
         w := GetWallType(sx, sy, right); if w <> 0 then DrawWallPiece(g_0CBA + off, g_0CCE, w, 8);   { right side 2×11 }
         off := off - 7;  sx := sx + g_2736[left];  sy := sy + g_273F[left];
       end;
     end;
  end;
  cx := cx + g_2736[back];  cy := cy + g_273F[back];                         { b100:0d7a  one square nearer; dist dec b100:0d9e }
end;
FlushView;                                                                   { b100:0dab }
```
Placement tables (image words, H): column `g_0CAA[piece]` = 5, 4, 6, 4, 2, 7, 2, 0, 9, 5 and row `g_0CBE[piece]` = 4, 3, 3, 3, 1, 1, 1, 0, 0, 4 (piece 0..9). So, in view cells: far front walls (piece 0, 1×2) at row 4, columns 5±2k; far side walls (1, 2; 1×4) at row 3; middle front (3, 3×4) at row 3, columns 4±3k; middle sides (4, 5; 2×8) at row 1; near front (6, 7×8) at row 1, columns 2±7k; near sides (7, 8; 2×11) at row 0, columns 0 and 9; far corner/edge pieces (9, 1×2) at row 4.
Note: in the decompile the "distance 1/0" squares are addressed from `cx + 2·left` / `cx + left` after `cx` has already been moved back by the loop; the exact square geometry is given by the code above (H as code; the "row of squares" description is M).

### B100:0E08 LoadWallSet (H)
`procedure LoadWallSet(id [BP+8], slot [BP+6]: Byte)` — name from the error string "Unable to load wallset in LoadWallSet." (b100:0dc1). Pseudocode: WALLDEF.md §Loader (verified against b100:0e08..10c4). Key addresses: name build `{ b100:0e33 }` (StrLong of g_5376), LoadDaxRecord `{ b100:0e70 }`, size check `{ b100:0e87 }`, error = Write + wait + halt `{ b100:0ea5 .. 0ebc }`, delta from `g_2722` `{ b100:0eca }`, copy loop Move(30Ch) `{ b100:0f07 }`, FreeMem `{ b100:0f25 }`, slot-set test `{ b100:0f5b }`, slot := FFFFh `{ b100:0f74 }`, rebasing compare with `g_272C` `{ b100:0fd0 }`, Load8x8Set calls `{ b100:103c / 1051 }`, slot table `g_6AAE[slot*4] := id` `{ b100:107d }`, `g_6AB0[slot*4] := slot` `{ b100:1093 }`, `RETF 4`.
Correction: the remembered-slot table is `g_6AB2..g_6ABD` (= `g_6AAE + slot*4`, slot 1..3), not the party position bytes `g_6AAD..g_6AB1`.

### B100:10C7 Load3DMap (H)
`procedure Load3DMap(id [BP+6]: Byte)` — error string "Unable to load geo in Load3DMap." Pseudocode: GEO.md §Loader. `{ b100:1120 LoadDaxRecord; b100:112b size <> 402h → fatal (b100:1132..115b); b100:1179 / 119b / 11bd / 11df four Move($100); b100:11ed FreeMem; b100:11fb g_49D2^[$18A] := id }`.

### B100:1206 ov29_init — empty unit initialiser (`RETF`).

---

## ov34 (CA00) — 8×8 symbol sets

### CA00:003B Load8x8Set (H)
`procedure Load8x8Set(id [BP+8], block [BP+6]: Byte)` — name from "Unable to load 8x8D" (cs:0025). Callers: LoadWallSet (B100:103C/1051), InitGameState (startup, blocks 0 and 4). `RETF 4`.
```pascal
if block in [0..4] then begin                       { ca00:004b  set constant at CS:0000 = 1Fh }
  name := '8x8d' + Str(g_5376);                     { ca00:006a / 0094 / 009e }
  LoadPicture(name, id, 1, $0D, var g_5E3A[block]);     { ca00:00be  Pascal order verified on the pushes (fix #fable-3) }
  if g_5E3A[block] = nil then begin                 { ca00:00ce }
    RestorePreviousVideoMode;                             { ca00:00d8  RestorePreviousVideoMode }
    WriteLn(Output, 'Unable to load 8x8D' + Str(g_5376) + '-' + Str(id));   { ca00:00e8 .. 0118 }
    ReadGameKey; RestorePreviousVideoMode; TerminateGame;     { ca00:011d / 0125 / 012a  ReadGameKey, 0464_00FF, 0899_0000 TerminateGame (#verify-23) }
  end;
  FUN_0899_0104;                                    { ca00:012f  (ENGINE, after every picture load; meaning L) }
end;
```
`g_5E3A[0..4]` = picture pointers of the five symbol blocks (WALLDEF.md §8×8 symbol space).

### CA00:015D Put8x8Symbol (H)
`procedure Put8x8Symbol(col [BP+0Eh], row [BP+0Ch]: ShortInt; sym [BP+0Ah]: Word; toView [BP+8], masked [BP+6]: Byte)` — name from "Bad symbol number in Put8x8Symbol." (cs:013A). `RETF 0Ah`. (col, row) are text cells (8×8) on the screen.
```pascal
case sym of                                         { ca00:0166 }
  1..$2D:     blk := 0;
  $2E..$73:   blk := 1;
  $74..$B9:   blk := 2;
  $BA..$FF:   blk := 3;
  $100..$11E: blk := 4;
else if (sym = 0) or ((sym > $11E) and (sym < $8000)) then begin   { ca00:01b6 }
  RestorePreviousVideoMode; WriteLn('Bad symbol number in Put8x8Symbol.');   { ca00:01c5 .. 01dc }
  ReadGameKey; TerminateGame;                           { ca00:01e1 / 01e9  0899:0000 (#verify-23) }
end end;
if g_5E3A[blk] <> nil then begin                    { ca00:01ee }
  sym := sym - g_2722[blk];                         { ca00:020f  tile index inside the block }
  if toView <> 0 then                               { ca00:0216 }
    DrawPictureInto(col, row, sym, masked, g_5E3A[blk], g_4A20)   { ca00:0249  0464:08D4 into the view picture; bit 0 of masked = use the transparency mask (#verify-15) }
  else begin
    Move(g_5E3A[blk]^.pixels[sym * frameSize], g_5E4E^.pixels, frameSize);   { ca00:028b  frameSize = pic+11h }
    PutPicture(col, row, g_5E4E);                  { ca00:02a2  PutPicture: straight to the screen (#verify-16) }
  end;
end;
```
Note: symbols ≥ 8000h pass the check but select the block chosen by the last matching range (Pascal `blk` uninitialised, `[BP-1]`) — engine quirk, not used by the data seen (L).

### CA00:02AD ov34_init — empty.

---

## ov14 (6600) — party movement, doors, the 3D / overland command loop

Globals (ECL lane names, ecl_names.json): `party_MapX` g_6AAD, `party_MapY` g_6AAE, `party_Dir` g_6AAF, `PartyHead` g_5D96 (TChar list linked by `+104h`), `SelectedChar` g_5D92, `ecl_Mem4900` g_49D2, `ecl_Mem6B00` g_49D6, `ecl_Block` g_84DC. View-lane names introduced here (view_names.json; globals request in STATUS.md): `party_Ahead` g_6AB0 (wall type in front), `party_CellAttr` g_6AB1, `view_AreaMap` g_6AAC, `travel_Mode` g_49FA, `door_CanBash` g_6DDE, `door_CanPick` g_6DDF, `door_CanKnock` g_6DE0.
`Roll(count, sides)` = ov24 9800:0DE3: Σ count × (Random(sides)+1) (Pascal order verified: count at `[BP+8]` 9800:0DED, sides at `[BP+6]` 9800:0E08). `AdvanceClock` = ov20 8400:03D5 (ECL lane). dx/dy = `g_2736`/`g_273F`.

### 6600:0000 ClosePassage (H)
`procedure ClosePassage(x [BP+0Ah], y [BP+8]: ShortInt; dir [BP+6]: Byte)` — sets the dir's 2-bit door field of cell (x,y) to 0 (plane 3: dir 6 `and 3Fh`, 4 `and CFh`, 2 `and F3h`, 0 `and FCh`) `{ 6600:0018 }` (… 6600:00f8). No bounds check. Caller MoveParty, when a locked door offers no action (the door then behaves as a wall).

### 6600:0109 OpenPassage (H)
`procedure OpenPassage(x [BP+0Ah], y [BP+8]: ShortInt; dir [BP+6]: Byte)` — if 0 ≤ x,y ≤ 15: set the dir's door field to 1 (`and 3Fh or 40h`, `and CFh or 10h`, `and F3h or 04h`, `and FCh or 01h`) `{ 6600:013c }` (… 6600:0225).

### 6600:0236 PartyHasClass (H)
`function PartyHasClass(cls [BP+6]: Byte): Boolean` — true if some party member has `level[cls] > 0` (TChar `+96h+cls`) `{ 6600:0264 }`. Called with 6 (thief → Pick offered) and 5 (magic-user → Knock offered at wizard locks).

### 6600:0294 BashDoor (H)
`function BashDoor: Boolean` — party members try in turn until one succeeds; success opens the door from both sides.
```pascal
ok := false; c := PartyHead;
while (c <> nil) and not ok do begin
  if GetPassage(party_MapX, party_MapY, party_Dir) = 3 then        { 6600:02d4  wizard-locked: only great strength }
    case c^.str of                                                 { TChar +10h }
      18:     if c^.str_exc in [91..99] then ok := Roll(1,6) = 1   { 6600:0300 }
              else if c^.str_exc = 100 then ok := Roll(1,6) < 3    { 6600:0319 }
              else door_CanBash := 0;                              { 6600:0328 }
      19, 20: ok := Roll(1,6) < 4;                                 { 6600:033d }
      21, 22: ok := Roll(1,6) < 5;                                 { 6600:035a }
      23:     ok := Roll(1,6) < 6;                                 { 6600:0373 }
      24:     ok := Roll(1,8) < 8;                                 { 6600:038c }
      25:     ok := true;
    else door_CanBash := 0;                                        { 6600:03a5 }
    end
  else                                                             { ordinary locked door (state 2) }
    case c^.str of
      3..7:   ok := Roll(1,6) = 1;                                 { 6600:03c2 }
      8..15:  ok := Roll(1,6) < 3;                                 { 6600:03e0 }
      16, 17: ok := Roll(1,6) < 4;                                 { 6600:03fd }
      18:     if c^.str_exc < 51 then ok := Roll(1,6) < 4          { 6600:0425 }
              else if c^.str_exc < 100 then ok := Roll(1,6) < 5    { 6600:0442 }
              else ok := Roll(1,6) < 6;                            { 6600:045b  (= 100) }
    end;
  c := c^.next;
end;
if ok then begin
  OpenPassage(party_MapX, party_MapY, party_Dir);                                                    { 6600:0491 }
  OpenPassage(party_MapX + dx[party_Dir], party_MapY + dy[party_Dir], (party_Dir + 4) mod 8);       { 6600:04cf  far side }
end;
BashDoor := ok;
```
(State 2 = AD&D "open doors" odds, state 3 = "magically held / barred" odds — interpretation M, code H.)

### 6600:04DF PickLock (H)
`function PickLock: Boolean`
```pascal
ok := false; c := PartyHead;
while (c <> nil) and not ok do begin
  if (Roll(1,100) <= c^.thief_skill[1]) and (c^.status = 0) then ok := true;   { 6600:0513  TChar +78h }
  c := c^.next;
end;
door_CanPick := 0;                                                 { 6600:0545  one attempt per door }
if ok then open both sides as in BashDoor;                         { 6600:055d / 059b }
PickLock := ok;
```
Confirms TChar `+78h` = thief skill "open locks" (SAVES.md `thief_skill[1]`).

### 6600:05AB FindMemorizedSpell (H)
`function FindMemorizedSpell(spell [BP+0Ah]: Byte; c: ^TChar [BP+6]): Byte` — slot 0..20 of `c^.mem_spell[]` (TChar +17h) equal to `spell`, else FFh `{ 6600:05b5 }`.
### 6600:05EE FindCasterOf (H)
`function FindCasterOf(spell [BP+6]: Byte): ^TChar` — first party member with `FindMemorizedSpell(spell, c) <> FFh`, else nil `{ 6600:0614 }`.
### 6600:0648 CastKnock (H)
`function CastKnock: Boolean` — `c := FindCasterOf($1F)` `{ 6600:0652 }`; if found, `c^.mem_spell[FindMemorizedSpell($1F, c)] := 0` `{ 6600:066d }` and return true (MoveParty then steps through). Spell 1Fh = Knock (M, from use).

### 6600:068D TryWalkOffMap (M)
`procedure TryWalkOffMap` — caller ExploreCommand on the forward key. `ecl_Mem6B00^.w[$5AA] := 0` `{ 6600:06a9 }`; if `GetPassage(party_MapX, party_MapY, party_Dir) <> 0` `{ 6600:06c0 }` and the square ahead lies outside 0..15, clamp the position to the edge and set `ecl_Mem6B00^.w[$5AA] := 1` (ECL variable "left the map", M) `{ 6600:06e5 }` (… 6600:072c).

### 6600:073B StepForward3D (H)
`procedure StepForward3D` — caller MoveParty.
```pascal
PlayOrStopSound(g_2628);                                  { 6600:0742  ENGINE (sound/delay — L) }
party_MapX := party_MapX + dx[party_Dir];               { 6600:0752 }
party_MapY := party_MapY + dy[party_Dir];               { 6600:0761 }
wrap party_MapX, party_MapY into 0..15;                 { 6600:0765 }
party_Ahead := GetWallType(party_MapX, party_MapY, party_Dir);   { 6600:07a1 }
FillChar(door_CanBash, 3, 1);                           { 6600:07b5  re-arm Bash/Pick/Knock }
party_CellAttr := GetCellAttr(party_MapX, party_MapY);  { 6600:07c2 }
if ecl_Mem6B00^.w[$594] and 1 <> 0 then AdvanceClock(1, 2)  { 6600:07e0  Search mode costs more time }
else AdvanceClock(1, 1);                                { 6600:07ed  (JBE 07E7 when bit 0 clear; arg roles per ECL lane) }
```
### 6600:0818 StepOverland (H)
`procedure StepOverland` — caller MoveParty when `travel_Mode` ∈ 2..4. **The overland map is the image table `g_3648`: 36 rows × 44 bytes of SQRPACI tile numbers** (it lives in START.EXE's initialised data, not in a DAX file); `g_3C76[travel_Mode]` = column offset of the 16-column window (mode 2: 0, 3: 13, 4: 26).
```pascal
nx := ecl_Mem4900^.w[$186] + dx[party_Dir];  ny := ecl_Mem4900^.w[$188] + dy[party_Dir];   { 6600:081e / 0841 }
clamp nx to 0..15, ny to 0..35;                                    { 6600:0864 }
t := g_3648[ny*44 + nx + g_3C76[travel_Mode]];                     { 6600:088c }
if not (t in [$4E, $7E..$80, $82..$84, $A8..$AC, $AE..$B3, $BC, $DD..$DE, $E1..$E9, $F5]) then   { 6600:08bb  impassable (4Eh = sea) }
  if (t in [$66..$6C]) or (t = $72) then begin                     { 6600:08f9  river }
    if ecl_Mem4900^.w[$344] = 0 then ShowMessage('The river''s stench drives you back.', $0E)   { 6600:0909 / 0923 }
    else begin ecl_Mem4900^.w[$186] := nx; ecl_Mem4900^.w[$188] := ny; AdvanceClock($0C, 3) end   { 6600:094a }
  end else begin
    ecl_Mem4900^.w[$186] := nx; ecl_Mem4900^.w[$188] := ny;
    AdvanceClock($0C, 3);                                          { 6600:0971 }
  end;
```
(`ShowTimedBottomPrompt` = show a message line in a colour, ENGINE; named ShowMessage here only as a reading aid.)

### 6600:0989 ExploreCommand (H) — stub ov14 e2
`function ExploreCommand: Char` — the command prompt of 3D areas and of the overland map; returns the last key.
```pascal
ecl_Mem6B00^.w[$592] := 0;
if travel_Mode = 1 then begin                                      { 6600:099a  3D area }
  repeat
    key := HorizontalMenu(g_04B6 = 'Area Cast View Encamp Search Look', ext);   { 6600:09d0  HorizontalMenu }
    if not ext then case key of
      'A': if ecl_Mem4900^.w[$1F6] = 0 then begin                  { 6600:09ec }
             view_AreaMap := not view_AreaMap;                     { 6600:09fe }
             Draw3DView(party_MapX, party_MapY, party_Dir);        { 6600:0a0d }
           end else ShowMessage('Not Here', $0E);                  { 6600:0a26 }
      'C': if SelectedChar^.status = 0 then CastMenu;              { 6600:0a3d  CastMenu }
      'V': ViewMenu;                                          { 6600:0a4d  ViewMenu }
      'E': done := true;                                           { Encamp: the caller acts on the returned key }
      'S': ecl_Mem6B00^.w[$594] := ecl_Mem6B00^.w[$594] xor 1;     { 6600:0a5e  Search on/off }
      'L': begin ecl_Mem6B00^.w[$594] := ecl_Mem6B00^.w[$594] or 2;   { 6600:0a79  Look }
                 AdvanceClock(1, 2); ecl_PC := ecl_VecB; done := true end;   { 6600:0a98 }
    end else case key of                                           { extended (cursor) keys }
      #$48 {Up}:    begin TryWalkOffMap; done := true end;         { 6600:0ab2 }
      #$50 {Down}:  begin party_Dir := (party_Dir+4) mod 8; party_Ahead := GetWallType(party_MapX, party_MapY, party_Dir);
                          Draw3DView(party_MapX, party_MapY, party_Dir) end;          { 6600:0ade / 0af2 }
      #$4B {Left}:  begin party_Dir := (party_Dir+6) mod 8; PlayOrStopSound(g_2628); party_Ahead := …; Draw3DView(…) end;   { 6600:0b14 / 0b25 / 0b39 }
      #$4D {Right}: begin party_Dir := (party_Dir+2) mod 8; PlayOrStopSound(g_2628); party_Ahead := …; Draw3DView(…) end;   { 6600:0b59 / 0b6a / 0b7e }
    else begin SelectCharacterByKey(key); DrawPartyRoster(SelectedChar) end end;   { 6600:0b89 CycleSelectedChar / 0b96 }
    DrawLocationTimeStatus;                                                 { 6600:0b9b  redraw party list (ENGINE) }
  until done
end else if travel_Mode in [2..4] then begin                       { 6600:0bac  overland }
  if g_49F9 < 2 then begin                                         { 6600:0bba  just arrived: load the overland icons }
    LoadCombatIcon('ICON', 0, 9); LoadCombatIcon('ICON', 1, 10); LoadCombatIcon('ICON', 2, 11);   { 6600:0bd6 / 0bf0 / 0c0a  LoadCombatIcon }
    SwitchToExploreMode;                                                 { 6600:0c0f }
  end;
  repeat
    key := HorizontalMenu(g_04DF = 'Cast View Encamp Search Look', ext);    { 6600:0c40 }
    if not ext then handle 'C','V','E','S','L' as above            { 6600:0c51 }
    else begin done := true;
      case key of #$48: party_Dir := 0; #$4D: party_Dir := 2; #$50: party_Dir := 4; #$4B: party_Dir := 6;   { 6600:0cc8 }
      else begin SelectCharacterByKey(key); DrawPartyRoster(SelectedChar); done := false end end;   { 6600:0cf8 / 0d05 }
    end;
    DrawLocationTimeStatus;                                                 { 6600:0d0e }
  until done;
end;
g_49F9 := travel_Mode;                                             { 6600:0d1c  previous mode }
if g_84E4 = 0 then begin ClearRectangle(1, $11, $26, $16); g_84E4 := 1 end;   { 6600:0d22 / 0d35  clear text window (ENGINE) }
ExploreCommand := key;
```
### 6600:0D6D MoveParty (H) — stub ov14 e1
`procedure MoveParty` — performs the forward step chosen in ExploreCommand; handles doors.
```pascal
if travel_Mode = 1 then begin                                      { 6600:0d78 }
  if ecl_Mem6B00^.w[$592] < $FF then begin                         { 6600:0d86 }
    moved := false;
    p := GetPassage(party_MapX, party_MapY, party_Dir);            { 6600:0d9e }
    case p of
      1: moved := true;                                            { 6600:0da3 }
      2: begin                                                     { 6600:0dae  locked door }
           opts := '';
           if door_CanBash <> 0 then opts := 'Bash';               { 6600:0db9 }
           if (door_CanPick <> 0) and PartyHasClass(6) then opts := opts + ' Pick';   { 6600:0dd3 / 0dde }
           if (door_CanKnock <> 0) and (FindCasterOf($1F) <> nil) then opts := opts + ' Knock';   { 6600:0e0d / 0e18 }
           opts := opts + ' Exit';
           if opts = ' Exit' then ClosePassage(party_MapX, party_MapY, party_Dir)    { 6600:0e79 / 0e8d }
           else case HorizontalMenu('Locked. ', opts) of                     { 6600:0eba }
             'B': moved := BashDoor;                               { 6600:0eca }
             'P': moved := PickLock;                               { 6600:0ed7 }
             'K': moved := CastKnock;                              { 6600:0ee4 }
           end;
         end;
      3: begin                                                     { 6600:0eed  wizard-locked door }
           same menu, but Knock is offered when PartyHasClass(5);  { 6600:0f4c / 0f57 }
           'B' → BashDoor { 6600:1009 }; 'P' → door_CanPick := 0 (cannot be picked) { 6600:1015 }; 'K' → CastKnock { 6600:1021 };
           no option → ClosePassage { 6600:0fcc }
         end;
    end;                                                           { p = 0: closed — no move }
    if moved then StepForward3D                                    { 6600:102e }
    else PlayOrStopSound(g_2622);                                    { 6600:1037  (bump sound, L) }
    DrawLocationTimeStatus;                                                 { 6600:103c }
  end else ecl_Mem6B00^.w[$592] := 0;
end else if travel_Mode in [2..4] then begin                       { 6600:1050 }
  if ecl_Mem6B00^.w[$592] < $FF then begin StepOverland; DrawLocationTimeStatus end   { 6600:1066 / 1069 }
  else ecl_Mem6B00^.w[$592] := 0;
end;
FreeAnimation(@g_6ABE);                                    { 6600:1080  FreeAnimation }
FreePicture(@g_6B01); FreePicture(@g_6B06);                    { 6600:108a / 1094  free head/body pictures (ENGINE) }
g_6B00 := $FF; g_6B05 := $FF;                                      { loaded head/body ids reset }
```
**Door / passage states — resolved (H):** 0 = closed (no passage; a locked door with no possible action is set to 0), 1 = open passage, 2 = locked door (Bash with normal open-doors odds, Pick by a thief, Knock if someone has Knock memorised), 3 = wizard-locked door (Bash only with STR 18/91+, cannot be picked, Knock offered when a magic-user is in the party). Success sets both sides to 1.

### 6600:10A7 ov14_init — empty.

---

## ov10 (5200) — combat battlefield construction and party deployment

`StartCombat` (5200:1E31) builds the tactical map `g_6716^` (named `cm_Map` here): GetMem(4E9h) — header bytes +0..+6 and a **25-row × 50-column grid of combat-tile numbers at +7** (`cm_Map^.grid[row, col]` = byte at `+7 + row*32h + col`). In a 3D area (`travel_Mode = 1`) the grid is derived from the 16×16 map around the party; on the overland map it is generated from the overland terrain under the party. Tile numbers index the terrain table `g_2744` (4 bytes per tile, image data: +0 movement cost 1 / FFh = impassable, +2 = 2 for sight-blocking tiles (M), +3 = symbol frame in the loaded combat tile set; `g_2747[t*4]` = that frame, 16h = plain floor/ground).
Nested procedures (Turbo Pascal: the first hidden argument is the parent's frame pointer) are marked *nested in …*.

### 5200:0000 ScatterFloorDebris (H)
`procedure ScatterFloorDebris` — for every cell (col 0..49, row 0..24) whose frame `g_2747[grid*4]` is 16h (floor): r := Roll(1,100) `{ 5200:004b }`; r = 98 → tile 1Ah; r = 99 → tile 1Bh; r = 100, `ecl_Block <> 10` and Roll(1,100) = 1 `{ 5200:00b7 }` → Roll(1,10) `{ 5200:00c6 }` ≤ 6: tile 1Ch, 7..10: tile 1Dh. (Rare floor variants; meaning of tiles 1Ah..1Dh from the tile set — L.)

### 5200:012B ProbeSide (H) *nested in ProbeWall*
`function ProbeSide(x [BP+0Ch], y [BP+0Ah]: ShortInt; dir [BP+8]: Byte): Byte`
```pascal
if (x < 0) or (x > 15) or (y < 0) or (y > 15) then             { 5200:0131 }
  if (y = party_MapY) and (dir in [2, 6]) then result := 0 else result := 1
else if GetPassage(x, y, dir) = 0 then result := 1             { 5200:0155  closed → wall }
else if GetWallType(x, y, dir) = 0 then result := 0            { 5200:0170  open }
else result := 3;                                              { passable wall = door }
```
### 5200:01AD ProbeWall (H)
`function ProbeWall(x [BP+0Ah], y [BP+8]: ShortInt; dir [BP+6]: Byte): Byte` = `ProbeSide(x, y, dir) or ProbeSide(x+dx[dir], y+dy[dir], (dir+4) mod 8)` `{ 5200:01d3 / 0209 }` — 0 open, 1 wall, 3 door (or-combined from both sides).

### 5200:0221 PutCombatTile (H) *nested in BuildDungeonField*
`procedure PutCombatTile(col [BP+0Ch], row [BP+0Ah], tile [BP+8]: Byte)` — places a tile of the current 3D square (parent locals `sq_dx` [BP-1], `sq_dy` [BP-2]):
```pascal
c := sq_dx*6 + sq_dy*5 + 21 + col;  r := sq_dy*5 + 10 + row;   { 5200:0227 / 025a }
if (c >= 0) and (c < 50) and (r >= 0) and (r < 25) then cm_Map^.grid[r, c] := tile + 1;
```
So each 3D square becomes a 6×5 block, rows skewed by 5 columns per map row (the battlefield is drawn as a slanted projection of the dungeon).

### 5200:02BA FillSquareFloor (H) *nested in BuildDungeonField*
```pascal
for row := 2 to 4 do for col := 0 to 5 do PutCombatTile(col, row, $16);   { 5200:02e1 }
if west = 1 then for row := 2 to 4 do begin                    { parent [BP-8] = ProbeWall(x,y,6) }
  PutCombatTile(row-1, row, 4); PutCombatTile(row, row, 3); PutCombatTile(row+1, row, $0D)   { 5200:0315 / 0327 / 033c }
end else if west = 3 then begin PutCombatTile(1, 2, 8); PutCombatTile(5, 4, 0) end;          { 5200:035e / 036e  door }
```
### 5200:0377 FillSquareNorth (H) *nested*
`north` = parent [BP-7] = ProbeWall(x,y,0): if north = 1 → tiles (col 3/4, row 0) := 5 and (col 3/4, row 1) := 0Ah `{ 5200:0394 .. 03c4 }`; else (cols 3,4 × rows 0,1) := 16h `{ 5200:03d6 .. 0406 }`.

### 5200:040F FillSquareNW (H) / 5200:0615 FillSquareNE (H) *nested*
Corner blocks (cols 1,2 resp. 5,6 × rows 0,1) chosen from `north`, `west`, `east` (parent [BP-9] = ProbeWall(x,y,2)) and two extra probes (`ProbeWall(x, y-1, 6)` / `ProbeWall(x-1, y, 0)` for NW `{ 5200:042b / 0448 }`; `ProbeWall(x, y-1, 2)` / `ProbeWall(x+1, y, 0)` for NE `{ 5200:0631 / 064d }`), then four PutCombatTile calls `{ 5200:05d9 / 05ea / 05fb / 060c }` resp. `{ 5200:07d4 / 07e5 / 07f6 / 0807 }`. Decision tables (tile numbers before +1), NW (`open` = both extra probes 0):

| cell | north = 0 | north = 1 or 3 |
|---|---|---|
| (1,0) | west 0 → 16h; west 3 → 0Dh; west 1 → 0 if open else 0Dh | west 0 → 0Fh if open else 5; west ≠ 0 → 12h if open else 2 |
| (2,0) | 16h | north 3 → 11h; north 1 → 5 |
| (1,1) | west 0 → 16h if north 0, else 10h if open else 0Ah; west 3 → 14h if open else 7; west 1 → 1 if open else 3 | (same column rule) |
| (2,1) | west 0/3: north 0 → 16h, 3 → 17h, 1 → 0Ah; west 1: north 0 → 0Dh, 3 → 15h, 1 → 6 | |

NE follows the same pattern with its own values (5200:0615 body: 4/16h, 0Fh, 5; 16h/18h/1/0Bh/3/11h/13h/5/9; 16h/10h/0Ah; 16h/8/0Ch/4/17h/0Ah/0Eh) — transcribed from the decompile, H as data, the visual meaning (wall/door corner pieces of the combat tile set) M.

### 5200:0810 BuildDungeonField (H)
`procedure BuildDungeonField` — locals: `sq_dx` [BP-1], `sq_dy` [BP-2], `sq_x` [BP-3], `sq_y` [BP-4], `north` [BP-7], `west` [BP-8], `east` [BP-9].
```pascal
for sq_dy := -2 to 2 do                                        { 5200:0816 }
  for sq_dx := -6 to 6 do begin                                { 5200:081f }
    sq_x := party_MapX + sq_dx;  sq_y := party_MapY + sq_dy;   { 5200:082e / 083d }
    west  := ProbeWall(sq_x, sq_y, 6);                         { 5200:0852 }
    north := ProbeWall(sq_x, sq_y, 0);                         { 5200:0864 }
    east  := ProbeWall(sq_x, sq_y, 2);                         { 5200:0876 }
    FillSquareFloor; FillSquareNorth; FillSquareNW; FillSquareNE;   { 5200:087e / 0883 / 0888 / 088d }
  end;
ScatterFloorDebris;                                            { 5200:089d }
```
Note: the battlefield is always oriented with map north up, independent of `party_Dir`.

### 5200:08A4 OverlandTerrainFlags (H)
`function OverlandTerrainFlags: Byte` — classifies the overland tile `g_465A` (set by BuildWildernessField) into a bitset used by the generators; ranges exactly as in the code (5200:08a4..0b96):
1 for {0..2, 28h..29h, 4Fh..56h, 5Bh..5Ch, 2Bh, F1h}; 21h for A8h..B1h; 11h for {B9h, BCh..C0h}; 3 for {3..4, 6..9, 13h..15h, 17h..19h}; 2 for {7, 0Ah..12h, 16h, 1Ah..24h, C9h..D0h} (not already matched); 12h for D1h..D5h; 4 for {25h, 39h, 40h, 9Ah..9Eh, A4h..A5h, B4h, F3h, EFh..F0h, FAh, FCh}; 5 for {27h..2Ch, 99h, 9Fh}; 44h for {2Dh..2Eh, 33h..38h, 43h..4Dh, 5Dh..61h}; 14h for {B5h..B8h, BAh, C1h..C8h}; 40h for {2Fh..32h, 62h..65h, F2h}; 41h for 26h; 60h for B2h..B3h; 48h for {3Ah..3Ch, 41h..42h}; 8 for {3Dh..3Fh, 79h..7Ch, 87h..89h, 8Bh, 8Dh, 90h..93h, 95h, 97h..98h, A0h..A2h, A6h..A7h, D6h..D8h, EEh}; 88h for {57h..5Ah, A3h, E0h}; 9 for {7Ch..7Dh, 8Ah, 8Ch, 8Eh, 8Fh, 94h, 96h}; 28h for {7Eh..85h, E5h..E7h}; 18h for D9h..DFh; 20h for {4Eh, F5h, E8h..E9h}; 80h for {6Dh, F4h..F6h}; 81h for {6Eh..71h, 73h..78h}; 90h for {66h..6Ch, 72h}; A0h for {E1h..E4h, EAh..EDh}; else 0.
Finally: if bit 7 is set and `ecl_Mem4900^.w[$366] = $FF` then `result := (result − $80) or 1` (bit 7 replaced by bit 0) `{ 5200:0b6b / 0b75 / 0b7e }` — ECL-controlled terrain override, meaning L.
Bit use in the generators: 20h/10h → wall-like features (BuildForest), 4/40h/8/80h → density (BuildTrees), 2/4/40h/80h → scatter (BuildRocks). Meaning of each bit (forest, hills, water, road …): L.

### 5200:0B97 PlaceBoulderPair (H) *nested in BuildRoadOrRidge*
`procedure PlaceBoulderPair(col [BP+0Ah], row [BP+8])` — `grid[row, col] := 34h; grid[row, col+1] := 35h` `{ 5200:0b9a }`; parent counter `[BP-2]` + 1.

### 5200:0BDE BuildRoadOrRidge (M)
```pascal
chance := 0;
if OverlandTerrainFlags and $20 <> 0 then chance := $23;       { 5200:0bed }
if OverlandTerrainFlags and $10 <> 0 then chance := $4B;       { 5200:0bfb }
if Roll(1,100) <= chance then begin                            { 5200:0c0e }
  c := 34 - Roll(5,4);  while (c+2) mod 7 > 0 do c := c - 1;   { 5200:0c21 }
  start := c;
  for row := 0 to 24 do begin                                  { a diagonal band of tiles 32h/33h }
    if c < 50 then begin grid[row, c] := $32; grid[row, c+1] := $33;
      if Roll(1,20) = 1 then PlaceBoulderPair(c, row);         { 5200:0c9c / 0cb6 }
      c := c + 1 end;
  end;
  r := 16 - Roll(1,9);                                         { 5200:0cce }
  PlaceBoulderPair(start + r, r); PlaceBoulderPair(start + r + 1, r + 1);   { 5200:0cfb / 0d0c }
end;
```
### 5200:0D13 BuildTrees (H)
density := 1, overridden in order by flags 4 → 3, 40h → 4, 8 → 7, 80h → 0 `{ 5200:0d1e .. 0d56 }`. For every floor cell whose upper neighbour is also floor, with Roll(1,100) ≤ density `{ 5200:0dd6 }`: size := (Roll(1,10)+1) div 2 for rolls < 9, else Roll(1,2)+4 `{ 5200:0de9 / 0dfd }`; with flag 40h size := Roll(1,3)+3 `{ 5200:0e27 }`; `grid[row, col] := size + 23h`; if size < 5 then `grid[row-1, col] := size + 1Fh` (two-cell tall object).

### 5200:0E9E BuildGroundCover (H)
Thresholds a := 0, b := 0Fh, c := 28h, e := 0 adjusted by flags (2: b := 2Dh, c := 0Ah; 4: b := 19h; 40h: c := 5, e := 1Eh; 80h: a := 0Fh, c := 19h, b := 0Ah) `{ 5200:0eb9 .. 0eeb }`. For every floor cell r := Roll(1,255) `{ 5200:0f45 }`:
r ≤ a → small pair (Roll(1,4) = 4 and row > 0 and floor above: tiles 41h above / 40h; Roll < 4 → 3Ch + roll) `{ 5200:0f5e }`;
r ≤ a+6 → 36h + Roll(1,3) `{ 5200:1026 }`; r ≤ a+b+6 → 29h + Roll(1,4) `{ 5200:107b }`; r ≤ a+b+e+6 → 39h + (Roll(1,10)−1) div 3 `{ 5200:10d9 }`; r ≤ a+b+e+c+6 → 2Dh + Roll(1,4) (a 4 is re-rolled as Roll(1,3) unless flag 40h) `{ 5200:1150 / 116e }`.

### 5200:11B4 BuildWildernessField (H)
```pascal
FillChar(cm_Map^.grid, $4E2, $17);                            { 5200:11cb  all 25×50 cells := tile 17h (= floor 16h + 1) }
x := ecl_Mem4900^.w[$186];  if travel_Mode = 3 then x := x + 13;  if travel_Mode = 4 then x := x + 26;
g_465A := OverlandMap[ecl_Mem4900^.w[$188]*44 + x];            { tile under the party }
BuildRoadOrRidge; BuildTrees; BuildGroundCover; ScatterFloorDebris;   { 5200:1219 .. 1225 }
```
### 5200:1244 PrepareBattlefield (H)
```pascal
if travel_Mode = 1 then Load24x24Set('DungCom', 0, $18)   { 5200:1266  Load24x24Set: frames 0..18h }
else Load24x24Set('WildCom', 0, $21);                     { 5200:1282 }
Load24x24Set('RandCom', $22, 5);                          { 5200:129c  frames 22h.. }
cm_Map := GetMem($4E9);                                        { 5200:12a5 }
cm_Map^[4] := 0; cm_Map^[5] := 1; cm_Map^[6] := 0;
if travel_Mode = 1 then BuildDungeonField else BuildWildernessField;   { 5200:12d4 / 12da }
```
### 5200:12E1 InitPartyCombatants (H)
For each party member: Recalc (RecalcCharacter) `{ 5200:1309 }`; `c^.combatant := GetMem($16)` zero-filled `{ 5200:1315 / 1338 }`; members beyond `ecl_Mem6B00^.w[$67C]` (party size) get `combatant^[$13] := 1`; `combatant^[9] := g_02F2[party_Dir shr 1]` (facing on the battlefield: 7, 2, 3, 6), reversed (+4 mod 8) for enemies (`side = 1`); for allied NPCs with `combatant^[$13] = 1` and morale 0 or > 66h: `npc_morale := ecl_Mem6B00^.w[$58C] − 80h`.

### 5200:1403 OutsideDeployBox (H)
`function OutsideDeployBox(c [BP+8], r [BP+6]: ShortInt): Boolean` := `((c < 0) or (c > 10)) and ((r < 0) or (r > 5))` `{ 5200:1403 }` — the deployment box is 11 columns × 6 rows.

### 5200:1434 TryPlaceCombatant (H)
`function TryPlaceCombatant(who [BP+10h], c [BP+0Eh], r [BP+0Ch], sq_x [BP+0Ah], sq_y [BP+8], tmpl [BP+6]: ShortInt): Boolean` — if (c, r) is inside the 11×6 deployment box and the box cell is free (`g_4440[side*108h + tmpl*42h + r*0Bh + c] <> 0`): set the combatant's map position `g_5F27[who*4] := c + sq_x*6 + sq_y*5 + 16h`, `g_5F28[who*4] := r + sq_y*5 + 0Ah`; check the spot with ProbeMove `{ 5200:150e }`; if empty and the tile is passable (`g_2744[tile*4] <> FFh`) mark the box cell used and return true.

### 5200:1577 FindDeploySpot (M)
`function FindDeploySpot(who [BP+6]: Byte): Boolean` — spiral search from the side's start square (`g_4650/g_4652[side]`) through the deployment template (`g_02E2`, `g_02F6`, `g_02FE`, direction table `g_02F2`), stepping to neighbouring 3D squares through open walls (ProbeWall `{ 5200:1894 / 1950 }`) when a box is exhausted, until TryPlaceCombatant succeeds `{ 5200:19c7 }` or all three alternatives fail. Detailed step order: transcribed in the .c (5200:1577..19f2); the algorithm is long but purely arithmetic on these tables (M as a summary).

### 5200:19F5 DeployParty (H)
Clears the combatant table `g_5F2A[1..255]`, sets the two sides' start squares (`g_4656 := party_Dir shr 1`, `g_4657 := ((party_Dir+4) mod 8) shr 1`), half-sizes `g_4654[side] := (g_6814[side]+1) shr 1`, fills the 2 × 4 × 6 × 11 deployment boxes `g_4440` from the row ranges at `g_0306 + facing*12` `{ 5200:1a5c .. }`; then for each party member: record pointer in `g_65B9[n]`, side := `+10Eh`, size := `+6Ch and 7`, FindDeploySpot `{ 5200:1c75 }`; members that cannot be placed and are flagged extra (`combatant^[$13] = 1`) are dropped from the party (RemoveFromParty `{ 5200:1dcf }`); members not active (`+10Dh = 0`) and outside special encounters (`g_84D4 = 0`) are stored as corpses/markers (`g_66D6..g_66DC` list, tile 1Fh) — M.

### 5200:1E31 StartCombat (H) — stub ov10 e1
```pascal
FreeAnimation(@g_6ABE); FreePicture(@g_6B01); FreePicture(@g_6B06);   { 5200:1e3c .. 1e50 }
g_6B00 := $FF; g_6B05 := $FF;
ClearMenuLine;  MessageDelay;                                     { 5200:1e5f / 1e64  clear text area (ENGINE/ov25) }
DrawText('A battle begins...', …);                      { 5200:1e81  ENGINE text output; argument meaning (colour 0Ah, row 18h) per ENGINE spec }
clear combat globals (g_6E30, g_6DE3, g_6822, g_6715, g_6DBB, g_5D9A/C), FillChar(g_66DD, 38h, 0);   { 5200:1eb6 }
ecl_Mem6B00^.w[$666] := 0; if ecl_Mem6B00^.w[$58C] > 100 then ecl_Mem6B00^.w[$58C] := 100;
PrepareBattlefield;  InitPartyCombatants;  DeployParty;       { 5200:1ede / 1ee7 / 1ef0 }
AllocatePicture($18, 3, 4, 1, g_6E36);                         { 5200:1f0b  ENGINE 0464:248E, Pascal order (argcheck fix) }
cm_Map^[2] := CombatantCol(PartyHead) - 3;  cm_Map^[3] := CombatantRow(PartyHead) - 3;   { 5200:1f18 / 1f31  view origin }
DrawCombatLayout;                                                 { 5200:1f42 }
for c in party do CallEffectHooks(c, 8);                             { 5200:1f65 }
CalcEnemyHpPct;                                                     { 5200:1f7f  combat main (COMBAT lane) }
g_49F3 := 5;
```
### 5200:1F8D ov10_init — empty.

Note on area ownership: ov10 is combat setup rather than view code; it is documented here because the area map assigns it to VIEW. The COMBAT lane should link to this section.

---

## ov23 (9300) — level-dependent character statistics

(Placed in VIEW by the provisional area map; it is character/class logic. Field names: SAVES.md §3.) All four routines take `c: ^TChar [BP+6]` (`RETF 4`). Tables are image data in DS.

### 9300:0000 UpdateLevelStats (H)
`procedure UpdateLevelStats(c: ^TChar)` — callers: training/level-up and creation (via stub ov23 e1).
```pascal
c^.base_thac0 := 0;                                                  { 9300:0009 }
for cls := 0 to 7 do begin
  lvl := c^.level[cls];
  if g_3C7C[cls*11 + lvl] > c^.base_thac0 then c^.base_thac0 := g_3C7C[cls*11 + lvl];   { 9300:003b / 005b  best THAC0 (as 60−THAC0) }
  if lvl > c^.level_main then c^.level_main := lvl;                  { 9300:0069 / 0078 }
  case cls of
    2: if lvl < 7 then c^.attacks := 2 else c^.attacks := 3;         { 9300:0097 / 008c  fighter: 1 or 3/2 attacks per round }
    0: if lvl > 1 then begin                                         { cleric }
         for k := 1 to 3 do c^.spell_slots[k-1] := g_40BC[lvl*3 + k];   { 9300:00cd  +B2h..+B4h }
         WisdomBonusSpells(c);                                       { 9300:00ec }
         for id := 1 to $38 do                                       { all cleric spells of castable levels become known }
           if (g_31FA[id*16] = 0) and (c^.byte[$B1 + g_31FB[id*16]] <> 0) then c^.known_spell[id] := 1;   { 9300:0103 }
       end;
    5: if lvl > 1 then for k := 1 to 3 do c^.byte[$B4 + k] := g_41D4[lvl*3 + k];   { 9300:0169  magic-user slots +B5h..+B7h }
  end;
end;
UpdateSaves(c);                                                      { 9300:0191 }
if c^.level[6] > 0 then UpdateThiefSkills(c);                        { 9300:0197 / 01a6  TChar +9Ch = thief level }
```
### 9300:01AF WisdomBonusSpells (H)
WIS (`+12h`) > 12 and slot1 ≠ 0 → slot1 + 1 `{ 9300:01c1 }`; WIS > 13 → slot1 + 1 `{ 9300:01de }`; WIS > 14 → slot2 + 1; WIS > 15 → slot2 + 1; WIS > 16 → slot3 + 1 (only slots that are already non-zero) — AD&D bonus cleric spells.
### 9300:0255 UpdateSaves (H)
for k := 0 to 4: `c^.save[k] := 20`, then for every class with level > 0: `c^.save[k] := min(c^.save[k], g_426E[cls*45 + lvl*5 + k])` `{ 9300:02bd / 0300 }` — confirms TChar +6Dh..+71h = five saving throws (H).
### 9300:0329 UpdateThiefSkills (H)
for k := 1 to 8: `base := g_3CF3[thiefLvl*8 + k]` `{ 9300:0377 }`, `raceAdj := g_3D3B[race*8 + k]` `{ 9300:0358 / 0396 }`; if raceAdj < 0 and |raceAdj| > base then `skill[k] := 0` else `skill[k] := base + raceAdj` plus, for k < 6, the DEX adjustment `g_3D4E[dex*5 + k]` (`+13h` = DEX) → `TChar +76h+k` = +77h..+7Eh (H).

---

## ov26 (A200) — view refresh, overland party icon

### A200:0000 DrawOverlandParty (H)
`procedure DrawOverlandParty` — screen position of the party inside the 5×5 overland window: `col := g_3C76[travel_Mode] + ecl_Mem4900^.w[$186]`; if col > 1 then col := 2 (col < 42), 3 (col = 42) or 4; `row := ecl_Mem4900^.w[$188]` if < 2, else 2 (< 34), 3 (= 34), 4 — i.e. the party stays centred except near the map edges.
```pascal
DrawIconAt(col, row, party_Dir, g_6DDC mod 2, (g_6DDC shr 1) + 9);   { a200:00a9  DrawIconAt: overland party icons 9..11, 2 frames }
g_6DDC := (g_6DDC + 1) mod 6;                                         { a200:00bb  animation counter }
FlushView;                                                            { a200:00be }
```
### A200:00C7 BackdropColour1 (H) *nested in RefreshView*
### A200:00FB BackdropColour2 (H) *nested in RefreshView*
### A200:012F BackdropColour3 (H) *nested in RefreshView*
Lookup functions on a key byte (`g_6F69` for 1 and 2, `g_6F68` for 3): colour1: 8 → 0, 'A' → 0, E8h → 0Fh, else 0Fh; colour2: 8 → 8, else 7; colour3: 0Bh → 8, 9 → 6, DBh → 6, 6 → 1, else 6 `{ a200:00c7 / 00fb / 012f }`. (`g_6F68/6F69` are set by ECL — L for their meaning.)
### A200:016D RefreshView (H) — stub ov26 e1
```pascal
mode := travel_Mode;  if ecl_Mem4900^.w[$1CC] <> 0 then mode := 1;     { a200:017d  ECL forces the 3D view }
if mode = 1 then begin
  party_CellAttr := GetCellAttr(party_MapX, party_MapY);                { a200:019b }
  if party_CellAttr < $80 then g_6A60 := g_0C26[ecl_Mem4900^.w[$1FA]]  { sky colour, cell attribute bit 7 clear }
  else g_6A60 := g_0C26[ecl_Mem4900^.w[$1FC]];                          { bit 7 set }
  if g_84E5 <> 0 then begin g_6A61 := BackdropColour1(g_6F69); g_6A62 := BackdropColour2(g_6F69); g_6A63 := BackdropColour3(g_6F68) end;   { a200:01d9 .. 01f1 }
  SetBackdropColours(g_6A60, g_6A61, g_6A62, g_6A63);                  { a200:0207 }
  if ecl_Mem4900^.w[$1F6] <> 0 then view_AreaMap := 0;                  { a200:0210  area map not allowed here }
  Draw3DView(party_MapX, party_MapY, party_Dir);                        { a200:0229 }
end else if mode in [2..4] then begin
  wx := g_3C76[mode] + ecl_Mem4900^.w[$186] - 2;  clamp 0..39;
  wy := ecl_Mem4900^.w[$188] - 2;  clamp 0..31;
  DrawOverlandWindow(wx, wy);                                           { a200:0293  DrawOverlandWindow }
  DrawOverlandParty;                                                    { a200:0299 }
end;
```
`g_0C26` = EGA colour list (image, 16 bytes: 0, 15, 12, 11, 13, 10, 9, 14, then the same 8 again; the scripts use indexes up to 0Bh, e.g. ECL3/0 sets ECL[49FD] = 0Bh → colour 11, light cyan sky; checked against capture ECL-02 by por-build-ecl). **Engine use of the GEO cell attribute:** bit 7 selects which of two ECL-chosen sky colours is used (GEO.md) — H.

---

## ov27 (A700) — overland window

### A700:0000 DrawOverlandWindow (H)
`procedure DrawOverlandWindow(wx [BP+8], wy [BP+6]: ShortInt)` — draws 5×5 overland squares (24×24 px each = 3×3 text cells) starting at map column wx, row wy.
```pascal
for r := 0 to 4 do for c := 0 to 4 do begin
  t := OverlandMap[(wy+r)*44 + (wx+c)] - 1;                         { a700:0049 }
  for k := 1 to 9 do                                                { landmark overrides, table g_0C30: 9 × (x, y, tile) words }
    if (wx+c = g_0C30[k].x) and (wy+r = g_0C32[k].y) then           { a700:006a / 0095 }
      case k of
        3: if ecl_Mem4900^.w[$318] <> $FF then t := g_0C34[3].tile - 1;
        4: if (ecl_Mem4900^.w[$3A4] <> 0) or (ecl_Mem4900^.w[$2F8] and 8 <> 0) or (ecl_Mem4900^.w[$33E] = 0) then t := g_0C34[4].tile - 1;
        5: if ecl_Mem4900^.w[$340] and 2 = 0 then t := g_0C34[5].tile - 1;
        6: t := g_0C34[6].tile - 1;
        7: if ecl_Mem4900^.w[$340] and 1 = 0 then t := g_0C34[7].tile - 1;
        8, 9: if ecl_Mem4900^.w[$366] > $FD then t := g_0C34[k].tile - 1;
      end;
  DrawTile24(c*3, r*3, t, 1);                                       { a700:01e1  DrawTile24 }
end;
```
Landmark table (image, H): 1 (10,9,240) · 2 (3,32,2) · 3 (12,31,2) · 4 (25,11,1) · 5 (32,15,165) · 6 (33,23,157) · 7 (37,8,147) · 8 (19,16,247) · 9 (25,27,256) (entries 1 and 2 are never overridden — only k = 3..9 have cases).
### A700:0207 DrawExploreFrames (H)
From the pushes (por-build-ecl): `DrawTitledFrame(1, 1, 0Fh, 0Fh, 0, 0, '')` `{ a700:022e }` (picture / 3D view box), `DrawTitledFrame(11h, 1, 26h, 0Fh, 0, 0, '')` `{ a700:0254 }` (roster box), `DrawTitledFrame(1, 11h, 26h, 16h, 0, 0, '')` `{ a700:027a }` (text window); empty title cs:0206. Called by ENGINE 00BA:2B66.

---

## ov33 (C500) — debug output

### C500:0004 DebugPrint (H)
`procedure DebugPrint(msg: string [BP+0Ch]; a [BP+0Ah], b [BP+8], c [BP+6]: Byte)` — only if `g_49F7 <> 0` (debug switch, M) `{ c500:001e }`: show `Str(a) + ' , ' + Str(b) + ' , ' + Str(c)` (separator string cs:0000 = " , ") and `msg` on the message line in colour 0Eh `{ c500:00ce / 00db }`, framed by ClearTextRectangle calls `{ c500:0085 / 00ec }`. Used by level drain ("max,cur,lost").

---

## ov28 (AC00) — encounter pictures, animations, portraits, 3D sprites

`TAnim` (66 = 42h bytes, FreeAnimation clears 42h): +0 frame count n (≤ 8), +1 current frame, and for frame k = 1..n: `+k*8−6` delay (longint, from the A-record) and `+k*8−2` picture pointer. The encounter animation is `g_6ABE` (`enc_Anim`), the portrait head/body pictures are `g_6B01` / `g_6B06` with their loaded ids `g_6B00` / `g_6B05` (FFh = none). Video mode `g_4A1E`: 0 = CGA (LoadPicture's cga_map path), 1 = EGA (planar output) — H from 0464:0111/1951.

### AC00:0000 DrawPictureScreenOrView (H)
`procedure DrawPictureScreenOrView(col [BP+0Eh], row [BP+0Ch]: Integer; toView [BP+0Ah]: Boolean; pic: Pointer [BP+6])` — nil → nothing; `toView = false` → PutPicture(col, row, pic) straight to the screen `{ ac00:0047 }` (#verify-17); else draw into the view picture at (row−1, col−1) (`DrawPicture`) `{ ac00:002f }` and FlushView `{ ac00:0034 }`.
### AC00:0050 DrawHead (H) / AC00:0070 DrawBody (H)
`DrawHead(col, row, pic)` = `DrawPictureScreenOrView(col, row, false, pic)` `{ ac00:0069 }`; `DrawBody(col, row, pic)` = `DrawPictureScreenOrView(col, row + 5, false, pic)` `{ ac00:008c }` (the body is drawn 5 text rows = 40 px below the 88×40 head).

### AC00:00A2 LoadAnimation (H)
`procedure LoadAnimation(name: string[8] [BP+0Eh]; id [BP+0Ch]: Byte; flags [BP+0Ah]: Byte; var anim: TAnim [BP+6])` — loads an A-record (PICTURES.md §2) into `anim`, unless the same name/id is already loaded (`g_6B0A` name, `g_6B1C` id) `{ ac00:00c6 / 00d0 }`.
```pascal
if (name <> g_6B0A) or (id <> g_6B1C) then begin
  FreeAnimation(anim); g_6B0A := name; g_6B1C := id;              { ac00:00df / 00f0 / 00f8 }
  isPic := (name = 'PIC') or (name = 'FINAL');                    { ac00:0105 / 0116 }
  LoadDaxRecord(name + Str(DataSet) + '.dax', id, p, size);       { ac00:0178 }
  if size <> 0 then begin
    anim.count := p^[0];                                          { frame count }
    if (name = 'PIC') and (id = 1) and (anim.count > 4) then anim.count := 4;   { ac00:01b3 / 01c3  (record PIC?/1 is capped) }
    o := 1; anim.cur := 1; loaded := 0;
    for k := 1 to anim.count do begin
      Move(p^[o], anim.delay[k], 4); o := o + 4;                  { ac00:021c }
      h := word(p^[o]); o := o + 2;  w := word(p^[o]); o := o + 2;   { ac00:0238 / 0254 }
      if MaxAvail > $F3B then begin                               { ac00:025d  out of memory → frame skipped }
        loaded := loaded + 1;
        anim.pic[k] := AllocPicture(w, h, 1, flags);                { ac00:0298  AllocPicture }
        Move(p^[o], anim.pic[k]^.x, 2); o := o + 2;               { ac00:02cc }
        Move(p^[o], anim.pic[k]^.y, 2); o := o + 3;               { ac00:02ec  skips the frame-count byte }
        Move(p^[o], anim.pic[k]^.cga_map, 8); o := o + 8;         { ac00:030c }
        len := raw frame size (pic^.frameSize, ×2 in CGA mode);   { ac00:0315 }
        if isPic then
          if k = 1 then begin base := GetMem(len); Move(p^[o], base^, len) end    { ac00:0368 / 0387  keep frame 1 }
          else for i := 0 to len-1 do p^[o+i] := p^[o+i] xor base^[i];           { ac00:0392..03d6  XOR delta! }
        ConvertPicturePixels(anim.pic[k], p, o, flags);                    { ac00:0400  ConvertPicturePixels }
        if (flags and 1 <> 0) and (g_4A1E <> 0) then Recolour(anim.pic[k], @g_0C6C, @g_0C7C);   { ac00:043a }
        o := o + len;
      end;
    end;
    anim.count := loaded;
    if isPic and (base <> nil) then FreeMem(base, len);           { ac00:0471 }
    FreeMem(p, size);  FUN_0899_0104;                             { ac00:047f / 0484 }
  end;
end;
```
**Data correction (H):** in PIC and FINAL animations every frame after the first is stored as the **byte-wise XOR of its pixel data with frame 1's pixel data** (packed 4-bpp bytes, header excluded). Frames are full pictures, not overlays. PICTURES.md and the PNG renders are corrected accordingly. SPRIT records are not XOR-coded (name check).

### AC00:048F FreeAnimation (H)
`procedure FreeAnimation(var anim: TAnim [BP+6])` — free `anim.pic[1..count]` (`g_70C7` as loop counter) `{ ac00:04ca }`, `FillChar(anim, $42, 0)` `{ ac00:04e3 }`, `g_6B0A := ''`, `g_6B1C := $FF` `{ ac00:04e8 / 04ed }`.

### AC00:04F9 ShowPortrait (H)
`procedure ShowPortrait` — if `SelectedChar^.head_pic <> 0` and `body_pic <> 0` (TChar +BBh/+BCh): draw a frame box (DrawTitledFrame, rows 1..0Bh, cols 1Ch..26h — ENGINE argument meaning M) `{ ac00:053b }`; `head := g_286F[head_pic]`, `body := g_287D[body_pic]` (portrait-id tables, image data) `{ ac00:056c / 0593 }`; LoadPortrait(head, body) `{ ac00:05bb }`; DrawPortrait(1Ch, 1, true) `{ ac00:05c8 }`.
### AC00:05D9 LoadPortrait (H)
`procedure LoadPortrait(head [BP+8], body [BP+6]: ShortInt)` — `if (head <> -1) and (head <> g_6B00) then LoadPicture('HEAD' + Str(DataSet), head, 0, 0, var g_6B01); g_6B00 := head` `{ ac00:0600 / 0638 / 0640 }`; same for body with 'BODY' into `g_6B06`, `g_6B05` `{ ac00:0649 / 0681 / 0689 }`; FUN_0899_0104 `{ ac00:068c }`.
### AC00:0697 DrawPortrait (H)
`procedure DrawPortrait(col [BP+0Ah], row [BP+8]: Byte; both [BP+6]: Boolean)` — `both` → DrawHead(col, row, g_6B01) and DrawBody(col, row, g_6B06) `{ ac00:06b1 / 06c5 }`; else `DrawPictureScreenOrView(col, row, false, g_6B01)` `{ ac00:06e2 }` (single 88×88 picture loaded into the head slot).
### AC00:0708 Show3DSprite (H)
`procedure Show3DSprite(k [BP+0Ah]: Byte; anim: TAnim [BP+6])` (#verify-18) — name from "Illegal range in Show3DSprite." (cs:06E9). Copies the 66-byte TAnim `{ ac00:071c }`; `k` must be 1..3 else fatal `{ ac00:072d .. 0749 }`; if `anim.pic[k] <> nil`: draw it into the view picture at text cell (`pic^.y + 2`, `pic^.x + 2`) `{ ac00:07ac }` and FlushView `{ ac00:07b5 }`.
**Data resolution (H):** the `x`, `y` words of a picture header are the frame's position in 8×8 cells inside the 88×88 view window (SPRIT frames: e.g. 48×80 at (3,1)); frame k = distance k (1 = nearest).

---

## ov32 (C000) — 24×24 tile sets and combat icons

Tile sets: `g_5E52` (tiles 0..127, SQRPACI/1 at startup, combat sets overwrite frames) and `g_5E56` (tiles 128..255, SQRPACI/2). Combat icons: `g_5E5A[slot*8 + pose*4]`, slot 0..12, pose 0/1 (two frames: ready / action).

### C000:0022 Load24x24Set (H)
`procedure Load24x24Set(name: string [BP+0Ah]; start [BP+8]: Byte; unused [BP+6]: Word)` — name from "Start range error in Load24x24Set" (cs:0000). `RETF 8`; `[BP+6]` is never read (callers pass the frame count).
```pascal
if start > $7F then begin RestorePreviousVideoMode; WriteLn('Start range error in Load24x24Set'); TerminateGame end;   { #verify-23 }   { c000:003d .. 005f }
LoadPicture(name, 1, 0, 0, var tmp);                                       { c000:0083  record 1 of name.DAX, no data-set suffix }
if g_5E52 <> nil then Move(tmp^.pixels, g_5E52^.pixels[start * frameSize], tmp^.count * frameSize);   { c000:00d6 }
FreePicture(tmp); FUN_0899_0104;                                       { c000:00e1 / 00e6 }
```
So DUNGCOM/WILDCOM land at tile 0.., RANDCOM at tile 22h.. of the same 128-tile set (H; PrepareBattlefield).
### C000:00F1 DrawTile24 (H)
`procedure DrawTile24(col [BP+0Ch], row [BP+0Ah]: ShortInt; tile [BP+8]: Byte; unused [BP+6]: Byte)` — tile < 80h → frame `tile` of `g_5E52` `{ c000:011d }`, else frame `tile and 7Fh` of `g_5E56` `{ c000:0145 }`, drawn opaque (flags 0) into the view picture at text cell (row, col) (DrawPictureInto). `[BP+6]` is not read.
### C000:014E FreeCombatIcon (H)
`procedure FreeCombatIcon(slot [BP+6]: Byte)` — frees `g_5E5A[slot*8]` and `g_5E5E[slot*8]` if set `{ c000:017a / 01a5 }`.
### C000:01C8 LoadCombatIcon (H)
`procedure LoadCombatIcon(name: string [BP+0Ah]; id [BP+8]: Byte; slot [BP+6]: Byte)` — loads the two poses `id` and `id + 80h`:
```pascal
if (Copy(name,1,5) = 'CHEAD') or (Copy(name,1,5) = 'CBODY') then begin   { c000:0201 / 0226 }
  if UpCase(name[Length(name)]) = 'T' then id := id + $40;           { c000:023d  trailing letter selects a variant set }
  name := Copy(name, 1, Length(name) - 1);                            { c000:0262 }
  LoadPicture(name, id, 1, 0, var g_5E5A[slot*8]);                        { c000:02b2 }
  LoadPicture(name, id + $80, 1, 0, var g_5E5E[slot*8]);                  { c000:02f3 }
end else if (name = 'COMSPR') or (name = 'ICON') then begin           { c000:0306 / 0318 }
  LoadPicture(name, id, 1, 0, var g_5E5A[slot*8]);  LoadPicture(name, id + $80, 1, 0, var g_5E5E[slot*8]);   { c000:035e / 039f }
  if name = 'ICON' then begin Recolour(g_5E5A[slot*8], @g_0CD2, @g_0CF2); Recolour(g_5E5E[slot*8], @g_0CD2, @g_0CF2) end;   { c000:03af / 03d9 / 0401  colour 13 → 0 }
end else begin                                                        { monster icons: CPIC + data set }
  LoadPicture(name + Str(DataSet), id, 1, 0, var g_5E5A[slot*8]); Recolour(…, @g_0CD2, @g_0CE2);   { c000:045b / 0483  colour 13 → 8 }
  LoadPicture(name + Str(DataSet), id + $80, 1, 0, var g_5E5E[slot*8]); Recolour(…, @g_0CD2, @g_0CE2);   { c000:04c4 / 04ec }
end;
FUN_0899_0104;                                                        { c000:04f1 }
```
(`RecolorPicture` = remap colours of a picture with a from/to table; tables `g_0CD2` identity, `g_0CE2` maps 13→8, `g_0CF2` maps 13→0 — image data, H.) This explains the CHEAD/CBODY/ICON/COMSPR/CPIC record id pairs n / n+128 in the DAX files (two poses).
### C000:04FC DrawIconAt (H)
`procedure DrawIconAt(col [BP+0Eh], row [BP+0Ch]: ShortInt; dir [BP+0Ah], pose [BP+8], slot [BP+6]: Byte)` — copies picture `g_5E5A[slot*8 + pose*4]` into a temporary picture `{ c000:0561 }`; `dir < 4` → copy pixels and mask as they are `{ c000:05b2 .. 05fc }`, `dir >= 4` → horizontally mirrored copy (MirrorPicture) `{ c000:0592 }`; draw into the view at (row*3, col*3) `{ c000:062b }`; free the temporary `{ c000:0635 }`. Icons face right for dir 0..3 and left for 4..7 (M: "right" assumed from the mirroring).

---

## ov30 (B600) — combat line of sight and target list

Combat terrain bytes (`CombatTerrain` g_2744, 4 per tile): +1 (`g_2745`) = tile height, +2 (`g_2746`) = obstacle height (2 for wall tiles, 0 for floor — image data). Combatant table `g_5F27..g_5F2A[n*4]` = column, row, index, size (0 = unused) for n = 1..`g_5F2A` (count in entry 0). Target list (`tg_List`, base `g_6718`): entry n (1..`tg_Count` = `g_671A`) at `g_6718 + 3n`: +0 combatant index, +1 distance, +2 direction code.

`TLine` record (used for both the map line and the height line), word fields: +0 x0, +2 y0, +4 x1, +6 y1, +8 err, +0Ah |dx|, +0Ch |dy|, +0Eh incDiag, +10h incStraight; bytes +12h sx, +13h sy; words +14h x, +16h y; bytes +18h dist (×2: straight step 2, diagonal 3), +19h last step direction.

### B600:0000 Sign (H)
`function Sign(n [BP+6]: Integer): Integer` = −1 / 0 / 1 `{ b600:0000 }`.
### B600:002E SortTargets (H)
Exchange sort of `tg_List[1..tg_Count]` by distance ascending; for equal distance the lower direction code wins when its parity is not greater (`dir_j < dir_i` and `dir_j mod 2 <= dir_i mod 2` → swap) `{ b600:0034 }`, 3-byte swaps with CopyBytes `{ b600:0131 / 0160 / 0181 }`.
### B600:01A0 LineInit (H)
`procedure LineInit(var L: TLine [BP+6])`
```pascal
L.dist := 0;  L.adx := Abs(L.x1 - L.x0);  L.ady := Abs(L.y1 - L.y0);     { b600:01a0 }
L.sx := Sign(L.x1 - L.x0);  L.sy := Sign(L.y1 - L.y0);                   { b600:01f9 / 0213 }
L.x := L.x0;  L.y := L.y0;
if L.ady < L.adx then begin L.err := 2*L.ady - L.adx; L.incDiag := 2*(L.ady - L.adx); L.incStraight := 2*L.ady end
else begin L.err := 2*L.adx - L.ady; L.incDiag := 2*(L.adx - L.ady); L.incStraight := 2*L.adx end;
```
### B600:02CC LineStep (H)
`function LineStep(var L: TLine [BP+6]): Boolean` — one Bresenham step towards (x1, y1); false when already there.
```pascal
ox := 0; oy := 0; LineStep := false;
if L.ady < L.adx then begin                                         { x-major }
  if L.x <> L.x1 then begin
    ox := L.sx;
    if L.err < 0 then begin L.err := L.err + L.incStraight; L.dist := L.dist + 2 end
    else begin oy := L.sy; L.y := L.y + L.sy; L.err := L.err + L.incDiag; L.dist := L.dist + 3 end;
    L.x := L.x + L.sx; LineStep := true;
  end
end else if L.y <> L.y1 then … (same with the axes exchanged);
L.dir := g_25C0[(oy+1)*3 + (ox+1)];                                { b600:040e  g_25C0 = 7,0,1,6,8,2,5,4,3 (image) }
```
### B600:0422 TraceLine (H)
`function TraceLine(x0 [BP+18h], y0 [BP+16h]: ShortInt; var x1 [BP+12h], y1 [BP+0Eh]: ShortInt; var range [BP+0Ah]: Word; map: ^TCombatMap [BP+6]): Boolean`
```pascal
maxSteps := range;
L.x0 := x0; L.y0 := y0; L.x1 := x1; L.y1 := y1;  LineInit(L);       { b600:045c }
H.x0 := 0; H.y0 := height[map^.grid[y0, x0]];                       { g_2745 }
H.x1 := Max(L.adx, L.ady);  H.y1 := height[map^.grid[y0, x0]];     { (as compiled: both ends use the start tile) }
LineInit(H);                                                        { b600:04d6 }
while ((map^[6] <> 0) or (obstacle[map^.grid[L.y, L.x]] <= H.y)) and (L.dist <= maxSteps*2 + 1) do begin   { g_2746 }
  LineStep(H);                                                      { b600:0541 }
  if not LineStep(L) then begin range := L.dist; TraceLine := true; exit end;   { b600:054d  target reached }
end;
x1 := L.x; y1 := L.y; range := L.dist; TraceLine := false;          { blocked or out of range: where it stopped }
```
Note: the decompile shows both height endpoints read from the start tile (`local_35` and `local_31`); with all heights 0 in the shipped table this has no visible effect (L whether intended). `map^[6] <> 0` disables blocking (set elsewhere; L).
### B600:057B InFrontArc (H)
`function InFrontArc(sx [BP+0Eh], sy [BP+0Ch], tx [BP+0Ah], ty [BP+8]: ShortInt; dir [BP+6]: Byte): Boolean` — false if either point is outside 50×25; dir FFh → 8 (all); `(fx, fy) := (sx, sy) + step[dir]`; true if the target is the source or the square in front, or lies in the 90° quadrant opened from (fx, fy) towards `dir` (eight cases, one per direction, e.g. dir 0: `ty <= fy − |tx − fx|`); dir 8 → true `{ b600:057b .. 0906 }`.
### B600:0909 BuildTargetList (H)
`procedure BuildTargetList(col [BP+12h], row [BP+10h]: ShortInt; range [BP+0Eh]: Word; dir [BP+0Ch], size [BP+0Ah]: Byte; map: ^TCombatMap [BP+6])` — `size` = the attacker's footprint size (1..4)
```pascal
for k := 0 to 3 do                                                  { the attacker's footprint cells }
  if FootprintCell(size, k, dx, dy) then begin ac[k] := col + dx; ar[k] := row + dy end else ac[k] := -1;   { b600:092a  FootprintCell }
tg_Count := 0;                                                      { b600:0976 }
for n := 1 to g_5F2A do if g_5F2A[n*4] <> 0 then begin
  found := false; best := $FF;
  for m := 0 to 3 do target footprint cells tc[m], tr[m] of combatant n (FootprintCell(cb_Size[n], m, …));   { b600:09d8 }
  for m := 0 to 3 do if tc[m] >= 0 then for k := 0 to 3 do if ac[k] >= 0 then
    if InFrontArc(ac[k], ar[k], tc[m], tr[m], dir) then begin       { b600:0aa2 }
      x := tc[m]; y := tr[m]; d := range;
      if TraceLine(ac[k], ar[k], x, y, d, map) and (d < best) then begin found := true; best := d; bk := k; bm := m end;   { b600:0af5 }
    end;
  if found then begin
    tg_Count := tg_Count + 1;                                       { b600:0b35 }
    tg_List[tg_Count].who := n;  tg_List[tg_Count].dist := best;
    if dir < 8 then d := dir else begin d := 0; while not InFrontArc(ac[bk], ar[bk], tc[bm], tr[bm], d) do d := d + 1 end;   { b600:0ba4 }
    tg_List[tg_Count].dir := d;
  end;
end;
SortTargets;                                                        { b600:0bd0 }
```

---

## ov25 (9D00) — menus and keyboard input

`TMenuItem` (46 = 2Eh bytes): +0 text string[40], +29h `isHeader` (≠ 0: not selectable, drawn in the header colour), +2Ah next. Menu globals (view names): `menu_Sel` g_6B2B (highlighted option, 1-based), `menu_Ext` g_6B2C (last result was an extended key), `menu_Timeout` g_6B2E/g_6B30 (longint ticks, ≤ 0 = none), `menu_TimeoutKey` g_6B32, `menu_Top` g_6B29 (first visible list line). `TimeInHundredths` = timer ticks (ENGINE), `DrawText` = write string (text, colour, row, col), `DrawRepeatedGlyph` = write one character, `ReadGameKey` = read key (ENGINE).

### 9D00:0000 ListItem (H)
`function ListItem(n [BP+0Ah]: Integer; list: ^TMenuItem [BP+6]): ^TMenuItem` (#verify-19) — the n-th node (0-based) or nil `{ 9d00:0000 }`.
### 9D00:0067 ListCount (H)
`function ListCount(list: ^TMenuItem [BP+6]): Integer` `{ 9d00:0067 }`.

### 9D00:00CB ParseOptions (H) *nested in HorizontalMenu*
`procedure ParseOptions(s: string[40])` — splits `s` into options: an option starts at every character in the set (CS:00AB) `['0'..'9','A'..'Z']` (verified, fix #fable-5: bytes CS:00AB..00CA = `00×6 FF 03 FE FF FF 07 00×20` → exactly 30h..39h, 41h..5Ah; the copy at CS:01BA is identical); parent locals `optStart[k]`, `optEnd[k]` (k = 1..), `optCount` (`[BP-8Eh]`) `{ 9d00:00f4 / 012b }`. So "Area Cast View" → 3 options with hotkeys A, C, V.
### 9D00:01DA DrawOptions (H) *nested in HorizontalMenu*
`procedure DrawOptions(sel: Byte)` — writes the options string character by character on row 24 (18h) starting after the prompt (`col := promptLen + i − 1`): characters outside option `sel` that are in the hotkey set (CS:01BA = '0'..'9', 'A'..'Z') use the parent's `hotColour [BP+0Eh]`, the other letters `textColour [BP+10h]`; the selected option is drawn highlighted `{ 9d00:0273 .. 0305 }` (ExploreCommand: hotkeys/selection white 0Fh, other letters green 0Ah — confirmed by DOSBox capture, fix #ref-2); the rest of the line up to column 39 is cleared `{ 9d00:0372 }`.

### 9D00:03BD HorizontalMenu (H) — stub ov25 e2
`function HorizontalMenu(prompt: string[40] [BP+18h]; options: string[40] [BP+14h]; promptColour [BP+12h], textColour [BP+10h], hotColour [BP+0Eh]: Byte; allowExt [BP+0Ch], animate [BP+0Ah]: Boolean; var ext: Boolean [BP+6]): Char` — `RETF 16h`. The bottom-line menu used everywhere ("Area Cast View Encamp Search Look", "Bash Pick Knock Exit", …).
```pascal
menu_Ext := false;  haveOpts := (textColour <> 0) or (hotColour <> 0);  { 9d00:03e5  Enter accepted only then (#verify-22) }
ParseOptions(options);                                                  { 9d00:040c }
if menu_Sel > optCount then menu_Sel := 1;                              { 9d00:040f / 0418 }
ext := false; done := false;
t0 := Ticks; tAnim := Ticks;                                            { 9d00:0432 / 043d }
if prompt <> '' then WriteAt(prompt, promptColour, 24, 0);              { 9d00:0475 }
DrawOptions(menu_Sel);                                                  { 9d00:048b }
repeat
  if ((ecl_Mem4900^.w[$3FE] <> 0) or animate) and (enc_Anim.cur <> 0) then begin   { animate the encounter picture while waiting }
    DrawPicture(3, 3, animate, enc_Anim.pic[enc_Anim.cur]);             { 9d00:04cc }
    if Ticks - tAnim >= enc_Anim.delay[enc_Anim.cur] * k or (ecl_Mem4900^.w[$3FE] <> 0) then begin   { 9d00:04e9 .. 0525  LongMul by a constant }
      enc_Anim.cur := enc_Anim.cur + 1; if enc_Anim.cur > enc_Anim.count then enc_Anim.cur := 1;
      tAnim := Ticks;
    end;
  end;
  if (menu_Timeout > 0) and (Ticks - t0 >= menu_Timeout) then begin key := menu_TimeoutKey; done := true end   { 9d00:0530 .. 0559 }
  else if KeyPressed then begin                                         { 9d00:0566 }
    key := ReadKey;                                                     { 9d00:0572 }
    case key of
      #0:  begin key := ReadKey; if allowExt then begin ext := true; done := true end end;   { 9d00:0580  extended key → scan code }
      #27: begin key := #0; done := true end;                           { 9d00:059f  Esc }
      #13: if haveOpts then begin key := #13; done := true end;         { 9d00:05ae / 05b9  Enter: selection = menu_Sel }
      ',': begin if menu_Sel = 1 then menu_Sel := optCount else Dec(menu_Sel); DrawOptions(menu_Sel) end;   { 9d00:05c4 .. 05e2 }
      '.': begin if menu_Sel = optCount then menu_Sel := 1 else Inc(menu_Sel); DrawOptions(menu_Sel) end;   { 9d00:05e8 .. 0606 }
    else
      key := UpCase(key);                                               { 9d00:0610 }
      if key in [' ', '0'..'9', 'A'..'Z'] then                          { 9d00:0621  set CS:037D }
        if key = ' ' then done := true                                  { 9d00:0628 }
        else for each option o whose start character = key do begin menu_Sel := o; DrawOptions(o); done := true end;   { 9d00:067c / 0685 }
      if allowExt and (key in ['1'..'9', '\']) then begin               { 9d00:06a0  keypad digits as cursor keys }
        if key = '\' then key := #$37 else key := g_288C[Ord(key) - Ord('1')];   { 9d00:06ad / 06bd  4Fh,50h,51h,4Bh,' ',4Dh,47h,48h,49h }
        ext := true; done := true;
      end;
    end;
  end;
until done;
ecl_Mem4900^.w[$3FE] := 0;  menu_Ext := ext;                            { 9d00:06de / 06ef }
HorizontalMenu := key;                                                  { RETF 16h at 9d00:06f8 }
```
Note: Enter returns #13 and leaves the chosen option in `menu_Sel`; callers that compare letters must map #13 themselves (L — the callers seen here only compare letters).

### 9D00:06FB ClearMenuLine (M)
`ClearGlyphRun(0, 24, 0, 40)` — clear text row 24 `{ 9d00:070a }`.

### 9D00:0711 LastHeaderAbove (H) *nested in VerticalListMenu*
`function LastHeaderAbove(list; n): ^TMenuItem` — the last header item among the first n items (or the first item if it is a header).
### 9D00:07A4 DrawList (H) *nested*
`procedure DrawList(top: Integer)` — clears the list window (`ClearRectangle(left, top, right, bottom)` `{ 9d00:07ca }`, #verify-20), then draws items from `ListItem(top, list)` (#verify-19) row by row: normal items in colour `[BP+22h]`, headers in `[BP+24h]` `{ 9d00:0849 / 0869 }`, padding each line with spaces to the window width `{ 9d00:08b5 }`.
### 9D00:08D7 FirstNonBlank / 9D00:0923 LastNonBlank (H) *nested* — index of the first / last non-space character of an item text.
### 9D00:0969 DrawItemSelected / 9D00:0A08 DrawItemNormal (H) *nested*
Rewrite item n's trimmed text at row `top + n − menu_Top`, col `left + first − 1` in the selection colour `[BP+20h]` `{ 9d00:09fd }` resp. its normal/header colour `{ 9d00:0aa6 / 0af8 }`.
### 9D00:0B03 SkipHeaders (H) / 9D00:0C33 PageList (H) / 9D00:0CC5 MoveSelection (H) *nested*
Move the current index up/down by one, wrapping inside the visible page and skipping header items (`isHeader <> 0`) `{ 9d00:0b39 / 0bc4 }`; PageList moves `menu_Top` by a page (clamped to 0..count − pageSize), keeps the relative position, then SkipHeaders and DrawList `{ 9d00:0cb1 / 0cbc }`.

### 9D00:0D9A VerticalListMenu (H) — stub ov25 e4
`function VerticalListMenu(prompt [BP+2Ah], options [BP+26h]: string[40]; headerColour [BP+24h], normalColour [BP+22h], selColour [BP+20h]: Byte; left [BP+1Eh], top [BP+1Ch], right [BP+1Ah], bottom [BP+18h]: ShortInt; list: ^TMenuItem [BP+14h]; showExit [BP+12h]: Boolean; var redraw: Boolean [BP+0Eh]; var index: Integer [BP+0Ah]; var item: ^TMenuItem [BP+6]): Char` — `RETF 28h`. Scrolling list (spell lists, item lists, …) with a bottom-line menu. Colour roles per #verify-21: [BP+24h] headers, [BP+22h] normal items, [BP+20h] selection.
```pascal
if list = nil then begin index := 0; item := nil; exit(#0) end;
menu_Sel := 1;  pageSize := bottom - top + 1;  count := ListCount(list);           { 9d00:0e06 }
firstSel := number of leading header items;  if index < menu_Top then begin menu_Top := index; redraw := true end;
if menu_Top > count then begin menu_Top := 0; redraw := true end;
index := index + 1;  MoveSelection(up);                                            { 9d00:0ed2 }
if redraw then DrawList(menu_Top);  redraw := false;                               { 9d00:0ee4 }
repeat
  DrawItemSelected(index);                                                         { 9d00:0ef6 }
  opts := options;  if menu_Top < count - pageSize then opts := opts + ' Next';   { cs:0D88 }
  if menu_Top > firstSel then opts := opts + ' Prev';                             { cs:0D8E }
  if showExit then opts := opts + ' Exit';                                        { cs:0D94 }
  key := HorizontalMenu(prompt, opts, c?, c?, c?, true, false, ext);              { 9d00:0fdd }
  DrawItemNormal(index);                                                           { 9d00:0feb }
  if ext then case key of
    'G' {Home}: MoveSelection(up);  'O' {End}: MoveSelection(down);                { 9d00:1000 / 100e }
    'I' {PgUp}: if hasPrev then PageList(up);  'Q' {PgDn}: if hasNext then PageList(down);   { 9d00:1023 / 1038 }
  end
  else if key = 'P' then PageList(up)                                              { 9d00:1049  "Prev" }
  else if key = 'N' then PageList(down)                                            { 9d00:1057  "Next" }
until (not ext) and (key <> 'P') and (key <> 'N');
if key in [#27, 'E', #0] then begin item := nil; result := #0 end
else begin item := ListItem(index, list); result := key end;   { #verify-19 }                       { 9d00:1089 }
```
(Extended scan codes 47h/4Fh are Home/End, 49h/51h PgUp/PgDn; the menu passes them through as letters 'G','O','I','Q'.)

### 9D00:10D1 AskYesNo (H) — stub ov25 e5
`function AskYesNo(prompt: string[40] [BP+0Ch]; c1 [BP+0Ah], c2 [BP+8], c3 [BP+6]: Byte): Char` — `menu_Sel := 2` (default "No"); repeat `key := HorizontalMenu(prompt, 'Yes No', …)` `{ 9d00:111b }` until key in ['N','Y'] (set CS:10B1) `{ 9d00:112a }`. `RETF 0Ah`.
### 9D00:1140 NewMenuList (H) — stub ov25 e6
`procedure NewMenuList(n [BP+0Ah]: Integer; var list: ^TMenuItem [BP+6])` — allocates n empty TMenuItem nodes (text '', isHeader 0) linked by +2Ah `{ 9d00:114a / 11a8 }`.
### 9D00:11F3 FreeMenuList (H) — stub ov25 e7
Frees every node (FreeMem 2Eh) `{ 9d00:1238 }`.

---

## ov31 (BB00) — combat map window, occupancy, combatant placement

The combat screen shows a **7 × 7-square window** of the 50 × 25 battlefield (24×24-px tiles = 3×3 text cells each); window origin `cm_Map^[2]` (column) / `cm_Map^[3]` (row); `cm_Map^[4]` = cursor visible, `cm_Map^[5]` = cursor size. Combatant table `cb_Col/cb_Row/cb_Index/cb_Size` = `g_5F27/g_5F28/g_5F29/g_5F2A[n*4]`, record pointers `cb_Char[n]` = `g_65B9[n*4]`, screen positions `cb_ScrCol[n]` g_604A / `cb_ScrRow[n]` g_6092 (relative to the window), occupancy grid `cm_Occupant` g_60DB (50 × 25 bytes: combatant index per cell). Footprint table `g_2844[size*8 + k*2]` (image): k-th cell (dx, dy) of a combatant of size 1..4, dx < 0 = unused: size 1 {(0,0)}, size 2 {(0,0),(0,1)} (1 wide × 2 tall), size 3 {(0,0),(1,0)} (2 × 1), size 4 {(0,0),(1,0),(0,1),(1,1)} — the CPIC 24×24 / 24×48 / 48×24 / 48×48 icons (H). Icon slots: combatants use `TChar.party_slot` (+BFh); slot 19h = the cursor.

### BB00:0000 FootprintCell (H) — stub ov31 e1
`function FootprintCell(size [BP+10h], k [BP+0Eh]: Byte; var dx [BP+0Ah], dy [BP+6]: ShortInt): Boolean` — size 0 → false; `dx := g_2844[size*8 + k*2]`, `dy := g_2845[size*8 + k*2]`; result `dx >= 0` `{ bb00:0000 .. 0065 }`.
### BB00:0068 UpdateScreenPositions (H)
For n := 1..g_5F2A: `cb_ScrCol[n] := cb_Col[n] − cm_Map^[2]`, `cb_ScrRow[n] := cb_Row[n] − cm_Map^[3]` `{ bb00:0068 }`.
### BB00:00E3 PaletteFlashOn / BB00:0105 PaletteFlashOff (M)
EGA only (`VideoMode = 1`): two `SetEgaPaletteRegister` calls swapping palette entries 0 and 8 (8,0 / 0,8 resp. 0,0 / 8,8) `{ bb00:00f3 / 00fe ; 0115 / 0120 }` — ENGINE palette routine, effect L.
### BB00:0127 RedrawCell (H)
`procedure RedrawCell(col [BP+8], row [BP+6]: ShortInt)` — for each footprint cell k of the cursor (`cm_Map^[5]`) inside the window: redraw the terrain tile `DrawTile24(sc*3, sr*3, CombatTerrain[grid].frame, 0)` `{ bb00:0206 }` and, if the cursor is visible, `DrawIconAt(sc, sr, 0, 0, $19)` `{ bb00:0239 }`; then redraw the occupant of (col,row) if it is visible (`CellAt` `{ bb00:025a }`, `IsVisible` `{ bb00:027a }`, `DrawIconAt(scr col, scr row, facing, 0, party_slot)` `{ bb00:02ca }`).
### BB00:02D5 RedrawSquare (H)
`procedure RedrawSquare(col [BP+8], row [BP+6])` — `RestoreTerrain(row − top, col − left, 0)` `{ bb00:030f }`, then redraw the occupant as in RedrawCell `{ bb00:0325 / 0345 / 0395 }`.
### BB00:03A0 RebuildOccupancy (H) — stub ov31 e5
`FillChar(cm_Occupant, 1250, 0)` `{ bb00:03b2 }`; for every combatant n with size ≠ 0: mark its footprint cells with n `{ bb00:040c }`; update its screen position.
### BB00:04BE CellAt (H)
`procedure CellAt(col [BP+10h], row [BP+0Eh]: ShortInt; var occupant [BP+0Ah], tile [BP+6]: Byte)` — outside 50 × 25 → both 0; else `tile := cm_Map^.grid[row, col]`, `occupant := cm_Occupant[row*50 + col]` `{ bb00:04be }`.
### BB00:052B RestoreTerrain (H)
`procedure RestoreTerrain(scol [BP+0Ah], srow [BP+8]: ShortInt; who [BP+6]: Byte)` — who = 0: look up the occupant of the screen cell (`CellAt` `{ bb00:0572 }`); still 0 → redraw that one terrain tile if inside the window `{ bb00:0615 / 067d }`; else redraw the terrain under every footprint cell of combatant `who` `{ bb00:05f0 / 0696 / 06de }`.
### BB00:06E9 InWindow (H)
`function InWindow(a [BP+8], b [BP+6]: ShortInt): Boolean` := both in 0..6 `{ bb00:06e9 }`.
### BB00:071A IsVisible (H)
`function IsVisible(c: ^TChar [BP+8]; all [BP+6]: Boolean): Boolean` — n := CombatantIndex(c) `{ bb00:072b }`; size 0 → false; `all` → every footprint cell inside the window, else any cell `{ bb00:0772 / 07a4 }`.
### BB00:07D4 ScrollToShow (H)
`function ScrollToShow(col [BP+0Ah], row [BP+8]: ShortInt; margin [BP+6]: Byte): Boolean` — centre := origin + 3; if margin = FFh or (col,row) is farther than `margin` from the centre: move the centre towards it (column centre 3..46, row centre 3..21), set the origin, redraw all 7 × 7 tiles `DrawTile24(c*3, r*3, frame, 1)` `{ bb00:0966 }`, UpdateScreenPositions `{ bb00:0986 }`, result true.
### BB00:0996 FocusSquare (H)
`procedure FocusSquare(col [BP+0Ch], row [BP+0Ah]: ShortInt; margin [BP+8], dir [BP+6]: Byte)` — target := (col,row) + step[dir] (dir 8 = no step); `if ScrollToShow(target, margin)` `{ bb00:09d7 }` then draw every active (`+10Dh`) visible combatant `{ bb00:0a39 / 0a71 }`; RedrawSquare(col,row) `{ bb00:0a8a }`; clamp the target to the battlefield if it is outside the window `{ bb00:0ab2 }`; RedrawCell(target) `{ bb00:0aea }`; FlushView `{ bb00:0aed }`. (Moves the cursor.)
### BB00:0AF8 ShowCombatant (H) — stub ov31 e11
`procedure ShowCombatant(c: ^TChar [BP+0Ch]; dir [BP+0Ah], pose [BP+8]: Byte; noDraw [BP+6]: Boolean)` — if c is not fully visible: FocusSquare(its col,row, 3, 8) `{ bb00:0b39 }`; if the facing half changes (`dir shr 2`) or pose/noDraw set: RestoreTerrain `{ bb00:0b74 }`; `c^.combatant^[9] := dir`; unless noDraw: if visible DrawIconAt(scr col, scr row, dir, pose, party_slot) `{ bb00:0bd7 }` and FlushView.
### BB00:0BE7 CombatantCol / BB00:0C0F CombatantRow / BB00:0C37 CombatantSize (H) — stub ov31 e12/e13/e14
`cb_Col/cb_Row/cb_Size[CombatantIndex(c)]` `{ bb00:0bf4 / 0c1c / 0c44 }`.
### BB00:0C5F CombatantIndex (H) — stub ov31 e15
Linear search of `cb_Char[1..g_5F2A]` for c; 0 if absent `{ bb00:0c5f }`.
### BB00:0CB9 ProbeMove (H) — stub ov31 e16
`procedure ProbeMove(c: ^TChar [BP+10h]; dir [BP+0Eh]: Byte; var occupant [BP+0Ah], tile [BP+6]: Byte)` — `tile := 17h`, `occupant := 0`; for each footprint cell of c moved one step in `dir` (dir 8 = in place): CellAt `{ bb00:0d85 }`; an occupant other than c itself is reported; tile result: 0 if any cell is 0 (off-map), else 1Eh if any is 1Eh, else the tile with the highest movement cost `CombatTerrain[t].cost` (H). Used by TryPlaceCombatant and movement.
### BB00:0E11 RemoveCombatant (H) — stub ov31 e17
`procedure RemoveCombatant(c: ^TChar [BP+6])` — `SetSoundTimerMode(0)` `{ bb00:0e1a }`; in combat (`g_49F3 = 5`) and if c is not yet in the corpse list (`g_66D6`, 8 entries of 7 bytes): make it visible (FocusSquare `{ bb00:0eb3 }`), RestoreTerrain `{ bb00:0ec1 }`, draw the "fallen" picture `g_5F1A` over its footprint `{ bb00:0f3f }`, FlushView; unless it is an extra (`combatant^[13h]`), append to the corpse list (old tile, position) and set the grid tile to 1Fh unless it is 1Eh; sound `PlayOrStopSound(g_261E)` `{ bb00:100e }`; `MessageDelay`; RestoreTerrain `{ bb00:1023 }`; `cb_Size[n] := 0`; RebuildOccupancy `{ bb00:103e }`; recentre `{ bb00:1062 }`; clear combatant fields 0, 3, 6, 7; `SetSoundTimerMode(10)` `{ bb00:109c }`. Outside combat only the sound and MessageDelay.
### BB00:10A7 PlaceCombatant (H) — stub ov31 e18
`function PlaceCombatant(c: ^TChar [BP+0Ch]; col [BP+0Ah], row [BP+8]: Byte; restoreTile [BP+6]: Boolean): Boolean` — in combat: set c's size (`+6Ch and 7Fh`) and position `{ bb00:10c2 }`; `ProbeMove(c, 8, occ, tile)` `{ bb00:111a }`; if no other occupant and tile passable: success; with `restoreTile` and not an extra, remove c from the corpse list (restoring the saved tile) and, if no other corpse lies there, put the tile back `{ bb00:11df }`; RebuildOccupancy `{ bb00:1286 }`; else `cb_Size := 0` (not placed). Outside combat → true.
### BB00:1298 FocusCombatant (H) — stub ov31 e19
`procedure FocusCombatant(c: ^TChar [BP+0Ah]; margin [BP+8]: Byte; cursor [BP+6]: Boolean)` — `cm_Map^[4] := cursor; cm_Map^[5] := CombatantSize(c)`; FocusSquare(col, row, margin, 8) `{ bb00:12e2 }`; then `cm_Map^[4] := 0; cm_Map^[5] := 1`.

---

## Unit initialisers (all empty `RETF`, H)
### 9300:045E ov23_init · ### A200:02A0 ov26_init · ### A700:0283 ov27_init · ### AC00:07C0 ov28_init · ### B600:0BD9 ov30_init · ### BB00:12FB ov31_init · ### C000:0640 ov32_init · ### C500:00F7 ov33_init · ### 9D00:1245 ov25_init
(also 5200:1F8D, 6600:10A7, B100:1206, CA00:02AD, listed with their units.)

---

## Build notes (por-build-ecl, translation against the bytes; game/areas/view*.js)
- ov31: RedrawSquare calls `RestoreTerrain(col − left, row − top, 0)` (column first, bb00:030f); RemoveCombatant's "already a corpse" test indexes the corpse list with the global `gfx_LoopCounter` (g_70C7), not its own loop variable (original bug, kept); the fallen picture is `DrawPicture(col*3, row*3, 0, 5, g_5F1A, g_4A20)` (bb00:0f3f); DrawIconAt draws with `DrawPicture(col*3, row*3, 0, 1, tmp, g_4A20)` (c000:062b).
- ov10: DeployParty sets the enemy start square to `ECL w[$582] (6DC1, encounter distance) × step[party_Dir]` (5200:1a40..1a9f), counts `cb_Size[0]` from 1 (5200:1bf1), drops unplaced extras with `RemoveFromParty(1, 0)` (5200:1dc9) and finally cuts the party list after the last kept member (5200:1e0b); OverlandTerrainFlags has no final else (unclassified tile → uninitialised result); PrepareBattlefield's GetMem leaves cells the dungeon builder does not reach uninitialised. FillSquareNE and FindDeploySpot are in view_ov10.js as translated from ov10.c/.lst.
- ov30 (helper of this lane): BuildTargetList sets `found` on any successful TraceLine before the `d < best` test (b600:0b04); its outer loop runs over the target's footprint cells (b600:0a3f/0a58); InFrontArc with dir 9..FEh leaves the result uninitialised (b600:08f8); all eight InFrontArc direction cases transcribed from b600:0617..08f8.
- ov23: level_main = TChar +73h, fighter attacks = +A1h (9300:0069 / 0086); UpdateThiefSkills skips the DEX adjustment when the racial malus zeroes the skill (9300:03a6).
- ov26: BackdropColour1..3 bodies from a200:00c7..016c; `g_0C26` has 16 entries. DrawOverlandParty keeps col/row unchanged when < 2 (a200:001f / 0047).
- ov14: overland ExploreCommand has no 'A' and no status test for 'C' (6600:0c51); door menu `HorizontalMenu('Locked. ', opts, 0Dh, 0Ah, 0Fh, 0, 0, var ext)`.
- ov28: LoadAnimation converts with `ConvertPicturePixels(buf, ofs, flags, 0, pic)` (colour 0 transparent for masked sprites) and recolours 13 → 0 (`RecolorPicture(@g_0C6C, @g_0C7C, 0, 0, pic)`, ac00:043a); the HorizontalMenu animation step advances when `TimeInHundredths − t ≥ delay·10` (9d00:04e4).

## Open items (explicit unknowns)
- ENGINE routines referenced by behaviour only (named by the ENGINE lane): 0464:08D4, 0D71, 1951, 1B52, 1E5C, 248E, 2595, 2632, 2A0D, 15C7, 02A5; 0709:0626, 01DF, 05EB, 0C3F, 0D68, 0DBE, 0DD3, 0BF5; 03F1:0137, 02E8; 08AE:00DC, 01A5; 0899:0059, 0104, 0122; 00BA:0767, 290B, 2B5E, 2B88, 23DB.
- Meanings left L/M: ECL-controlled words `ecl_Mem4900^.w[$1CC, $1F6, $1FA, $1FC, $318, $33E, $340, $344, $366, $3A4, $3FE]`, `ecl_Mem6B00^.w[$58C, $592, $594, $5AA, $666, $67C]` (see ECL_VM.md); `g_6F68/6F69` (backdrop colour keys); bits of OverlandTerrainFlags; tiles 1Ah..1Dh, 1Eh, 1Fh of the combat tile set; `cm_Map^[6]` (LOS blocking off); `g_49F7` (debug flag); timer unit of animation delays.
- TraceLine reads the start tile's height for both ends of the height line (as compiled).

## Self-check
Method: every `{ seg:off }` in this file (472 citations) was machine-checked to be the address of a real instruction in `decode/listings/*.lst` (0 failures). Then a random 10 % sample (47 citations, seed 7) was re-read against the 5 instructions at each address and compared with the pseudocode statement.
Sample (address → result): 6600:0DAE ok · CA00:01B6 ok · 5200:05D9 ok · C000:0083 ok · B100:03B4 ok · B100:06D5 ok · 9D00:1089 ok · A200:00BB ok · B100:0A20 ok · 5200:004B ok · AC00:00DF ok · B100:0589 ok · BB00:1062 ok · 9300:003B ok · 6600:05B5 ok · B100:023E ok · B100:0910 ok · 5200:0DD6 ok · 5200:0BED ok · B100:069C ok · 6600:07E0 ok · B100:094E ok · A200:0229 ok · 5200:0C21 ok · B100:05F6 ok · 9D00:114A ok · C500:001E ok · B100:0FD0 ok · 6600:06C0 ok · AC00:05C8 ok · AC00:05BB ok (pushes 1Ch then 1: col first, confirms DrawPortrait order) · B100:0603 ok · AC00:0069 ok · AC00:0105 ok · 5200:07D4 ok · B100:03C1 ok · 6600:06A9 ok · B100:038F ok · A700:0049 ok · BB00:0615 ok · CA00:004B ok · 6600:0B89 ok · CA00:00E8 ok · A200:00C7 ok (nested: argument at [BP+8], frame link at [BP+6]) · B100:0F25 ok · AC00:0047 ok · 6600:0CF8 ok.
Result: 47/47 consistent. Errors found and fixed during writing (before the sample): 22 citations in the first ov29 draft that were not instruction addresses (replaced from the listing); argument order of FillChar in BuildWildernessField; OverlandTerrainFlags bit-7 rule (SUB, not ADD); deploy-box axes; DrawTile24's unused argument; BuildTargetList's `size` parameter (not an index).
