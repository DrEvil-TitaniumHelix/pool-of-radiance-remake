# WALLDEF — 3D wall sets (WALLDEF1..8.DAX) and their 8×8 symbol sets (8X8D1..8.DAX)

Owner: por-data. Addresses as in GEO.md (DS addresses converted from Ghidra `DAT_10bf_` names, +4430h).

## Records — H
Every record is a multiple of **780 (0x30C) bytes** = one wall-set block; each block = **5 wall types × 156 (0x9C) bytes**.

| file | records (id: bytes) |
|---|---|
| WALLDEF1 | 1, 3, 5: 780 |
| WALLDEF2 | 1, 2, 4, 9, 19, 23: 780 |
| WALLDEF3 | 0: **2340 (3 blocks)**; 1, 3, 5: 780 |
| WALLDEF4 | 1, 3, 5, 9, 20: 780; 21: **1560 (2 blocks)** |
| WALLDEF5 | 1: 780; 24: **1560** |
| WALLDEF6 | 1, 2, 6, 9, 17: 780 |
| WALLDEF7 | 1, 3, 7, 8, 23: 780 |
| WALLDEF8 | 1, 3, 9, 17, 18, 20, 23: 780 |

## Loader — `LoadWallSet(slot, id)` = ov29_0E08 (B100:0E08), name from "Unable to load wallset in LoadWallSet." — H
```pascal
if (slot <> 0) and (slot < 4) then begin
  LoadDaxRecord('WALLDEF' + Str(DS:5376) + '.dax', id, p, size);
  if (size = 0) or (size div $30C + slot > 4) then Fatal;          { blocks must fit slots slot..3 }
  delta := Word(DS:2722[slot]) - Word(DS:2724);                     { symbol base of slot - 46 }
  n := 0; f := 1;
  repeat Move(p[n], WallBuf(DS:6A58^)[(slot+f-2)*$30C], $30C); n += $30C; f += 1 until n >= size;
  FreeMem(p, size);
  for f := 1 to blocks do
    if <set test 0AF8:0DC0 on slot+f-1> then begin
      DS:6AAE[(slot+f-1)*4] := $FFFF; DS:6AB0[(slot+f-1)*4] := $FFFF;
      for t := 1 to 5 do for k := 0 to $9B do                         { 5 wall types x 156 bytes }
        if WallBuf[(slot+f-1)*$30C + t*$9C + k - $3A8] >= Byte(DS:272C) { = 45 }
          then inc(that byte, delta);
      if blocks < 2 then Load8x8Set(slot+f-1, id)                     { stub_ov34_e1 }
      else begin if id = 0 then id := 10; Load8x8Set(slot+f-1, id*10 + f) end;
    end;
  if id = 10 then id := 0;
  DS:6AAE[slot*4] := id; DS:6AB0[slot*4] := slot;                     { remembered per slot }
end;
```
(`t*$9C - $3A8` with t = 1..5 gives offset `(slot+f-2)*$30C + (t-1)*$9C + k`.) The rebasing delta uses `slot`, not `slot+f-1`, for every block of a multi-block record (as written; effect to be confirmed by the 3D-view lane).

So a 1-block record `id` pairs with **8X8D record `id`** (same number, same-numbered file); a multi-block record pairs with 8X8D records `id*10+1, id*10+2, …` (id 0 → 101, 102, 103). This matches the files exactly: WALLDEF4/21 ↔ 8X8D4/211, 212; WALLDEF5/24 ↔ 8X8D5/241, 242; WALLDEF3/0 ↔ 8X8D3/101, 102, 103; every 1-block WALLDEF id has an 8X8D record with the same id (H).

## 8×8 symbol space — `Put8x8Symbol` = ov34_015D (name from "Bad symbol number in Put8x8Symbol.") — H
Symbol numbers are global. Block = range; picture pointer `DS:5E3A[block*4]`; base `DS:2722[block]` (initialised words read from the image: `1, 46, 116, 186, 256`, then `DS:272C = 45`, `DS:272E = 115`):

| block | symbols | loaded from | by |
|---|---|---|---|
| 0 | 1..45 | 8X8D?/**203** (45 tiles) | ov11_002D: `Load8x8Set(0, 0CBh)` |
| 1 | 46..115 | 8X8D? record of wall slot 1 (70 tiles) | LoadWallSet |
| 2 | 116..185 | wall slot 2 | LoadWallSet |
| 3 | 186..255 | wall slot 3 | LoadWallSet |
| 4 | 256..286 | 8X8D?/**202** (31 tiles) | ov11_002D: `Load8x8Set(4, 0CAh)` |
| — | 0, 287..7FFFh | fatal "Bad symbol number in Put8x8Symbol." | |

(`?` = current DAX set `DS:5376`; only 8X8D1 contains 202/203, so they are loaded while set 1 is current — M.)
`Load8x8Set(block, id)` = ov34_003B: `LoadPicture(DS:5E3A[block*4], maskColour = 0Dh, 1, id, '8x8d' + Str(DS:5376))` → the 8×8 tiles are P-records (PICTURES.md) with **colour 13 (light magenta) transparent** (M: the argument lands in 0464:0111's `[bp+0Ah]`, which 0464:02A5 passes to MaskByte 0464:0000).
Put8x8Symbol copies tile `sym - base[block]` (tile size = struct +11h) into a scratch picture and blits it (0464:1951), or draws it through 0464:08D4.

The 8X8D1/201 1-bpp font is not part of this space: 0709:017C loads 8X8d1 record 0C9h (201) raw into `DS:5E20^` (text font, H).

WALLDEF bytes are **slot-1 symbol numbers** (common 1..45, own tiles 46..115); LoadWallSet adds `base(slot) - 46` to every byte ≥ 45 so slot-2/3 sets point at 116.. / 186... Values observed: 0..115 in every ordinary record, consistent. WALLDEF3/0 (3 blocks) contains bytes up to 255 → authored for slots 1..3 directly (L).
Note: the threshold is `>= 45`, so symbol 45 (the last common tile) is shifted too — engine quirk, keep it (M).

## The 156-byte wall-type layout — H (resolved by por-mod-view)
A wall type is 10 **pieces**, each a row-major block of 8×8 symbol numbers (0 = transparent, not drawn). `DrawWallPiece` B100:0211 reads the piece's start/width/height from image tables `DS:0C8C`/`0C96`/`0CA0`; `Draw3DView` B100:05FD places them in the 11×11-cell view (88×88 px at text cell 2,2) at column `DS:0CAA[p]` (+ per-square offset) and row `DS:0CBE[p]`:

| piece | bytes | cells w×h | row | column(s) | what (from Draw3DView) |
|---|---|---|---|---|---|
| 0 | 0..1 | 1×2 | 4 | 5 ± 2k (k = 0..3) | front wall, far (2 squares ahead), 4 squares each side |
| 1 | 2..5 | 1×4 | 3 | 4 − 2k (−1 more for k ≥ 1) | left side wall, far row |
| 2 | 6..9 | 1×4 | 3 | 6 + 2k (+1 more for k ≥ 1) | right side wall, far row |
| 3 | 10..21 | 3×4 | 3 | 4 ± 3k | front wall, middle row (1 ahead) |
| 4 | 22..37 | 2×8 | 1 | 2 − 3k | left side wall, middle row |
| 5 | 38..53 | 2×8 | 1 | 7 + 3k | right side wall, middle row |
| 6 | 54..109 | 7×8 | 1 | 2 ± 7k | front wall, near row (adjacent square) |
| 7 | 110..131 | 2×11 | 0 | 0 − 7k | left side wall, party's square |
| 8 | 132..153 | 2×11 | 0 | 9 + 7k | right side wall, party's square |
| 9 | 154..155 | 1×2 | 4 | 5 ± 2k ± 1 | far corner/edge piece (end of a far wall run) |

Full renderer pseudocode: `decode/pseudo/VIEW.pas.md` (B100:0211, B100:05FD).
