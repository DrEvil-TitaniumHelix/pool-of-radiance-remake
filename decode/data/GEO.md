# GEO — 3D-area maps (GEO1..8.DAX)

Owner: por-data. Tool: `decode/tools/geo.py` (`render`, `dump FILE/ID`). Renders: `png/GEO/` (index `png/GEO/INDEX.md`).
Addresses: resident `SEG:OFF` = unpacked START.EXE image; `ovNN_XXXX` / `B100:xxxx` = overlay listings (`decode/listings/`, LAYOUT.md).
`DS:xxxx` = offset in the data segment 0C7C. **Ghidra listing note:** a symbol `DAT_0c7c_XXXX` is `DS:XXXX`, but `DAT_10bf_YYYY` is the same data segment seen from paragraph 10BF, i.e. `DS:(YYYY + 4430h)` (e.g. `DAT_10bf_0f46` = `DS:5376`, the byte that `DAT_0c7c_5376` names in ov07/ov17). All DS addresses here are converted.

## Files / records — H
29 records, all exactly 1026 B. Record ids are **unique across all 8 files** (0..32 with 8, 11, 12, 19 absent) → a global map number:
GEO1 {18,24,31} · GEO2 {9,15,20} · GEO3 {0,14} · GEO4 {2,10,21} · GEO5 {3,4,5,6,7} · GEO6 {1,25,28} · GEO7 {17,22,23,26} · GEO8 {13,16,27,29,30,32}.
The file digit is the current data set (global byte `DS:5376`, used to build every `<name><n>.dax` name: GEO, WALLDEF, 8x8d, ECL, MON..CHA/SPC/ITM, ITEM; 0802:05CD also uses it to pick the data path `DS:2614 + n*1Eh`, so it is the game-disk number, M).

## Loader — `Load3DMap(id)` = ov29_10C7 (B100:10C7), name from its own error string "Unable to load geo in Load3DMap." — H
- file name `"GEO" + Str(DS:5376) + ".dax"`, `LoadDaxRecord` 0802:0716 with id.
- **raw size must be 0x402**, else error + halt.
- the first 2 bytes are **skipped** (`local_a := 2`), then 4 × Move(0x100) into the map buffer `DS:6A5C^` at +0, +100h, +200h, +300h (buffer = GetMem(400h) in ov11_002D).
- stores id at `[DS:49D2^ + 18Ah]` (current map id).

## Layout — H (offsets within the record)

| off | size | name | meaning |
|---|---|---|---|
| 0 | u16 | `hdr` | always `00 04` (=0x0400, the plane data size) in all 29 records; **ignored** by the loader |
| 2 + y*16 + x | 256 | plane 0 | hi nibble = wall type **N**, lo nibble = wall type **E** |
| 0x102 + y*16 + x | 256 | plane 1 | hi nibble = wall type **S**, lo nibble = wall type **W** |
| 0x202 + y*16 + x | 256 | plane 2 | cell attribute byte (see below) |
| 0x302 + y*16 + x | 256 | plane 3 | 2-bit passage/door state per side: bits 1-0 **N**, 3-2 **E**, 5-4 **S**, 7-6 **W** |

Cell index = **y*16 + x** (row-major, y grows to the south). Code evidence (corrected by por-mod-view; pseudocode in decode/pseudo/VIEW.pas.md):
- `ov29_047B` = **GetWallType(x, y, dir)** (Pascal order; Ghidra lists the parameters reversed): if (x,y) is outside 0..15 **and** the area kind `g_84DC` is 0 or 10 it returns 0 (bounded map); otherwise x,y wrap (`>0Fh → 0`, `<0 → 0Fh`) and it reads `buf[y*16+x]` (dir 0 → `>>4`, dir 2 → `&0Fh`) or `buf[100h + y*16+x]` (dir 4 → `>>4`, dir 6 → `&0Fh`). Directions 0/2/4/6 = N/E/S/W (Gold Box 8-way facing, even = cardinal; the N/E/S/W assignment is confirmed by the neighbour statistics below).
- `ov29_0350` = **GetPassage(x, y, dir)**: same bounds/wrap rule; returns 1 if `GetWallType = 0`, else the `buf[300h + y*16+x]` field: dir 6 `>>6`, dir 4 `(&30h)>>4`, dir 2 `(&0Ch)>>2`, dir 0 `&3`.
- `ov29_057A` = **GetCellAttr(x, y)**: `buf[200h + y*16+x]`; the movement code stores it in `DS:6AB1` after every step (ov14 move routine ~ov14.c:396, ov07.c:1369, ov03.c:2063); ECL code reads `DS:6AB1` (ov07.c:838).
- ov14 `FUN_6600_0000(dir,y,x)` clears the dir's plane-3 field to 0; `FUN_6600_0109(dir,y,x)` sets it to 1.

Data cross-check (independent of the code): over all 29 maps, "E side of (x,y) has a wall" agrees with "W side of (x+1,y) has a wall" in 90.7 % of cases, S of (x,y) vs N of (x,y+1) 90.6 %; the plane-3 fields pair the same way (E-field with the neighbour's W-field 670/739, S with N 742/800). Exact type values agree only ~63 %: each side carries its **own** texture (the wall as seen from that cell); ~9 % of sides are one-way.

## Values (resolved by por-mod-view, see decode/pseudo/VIEW.pas.md ov14 / ov29)
- **Wall type** (nibble): 0 = no wall; 1..15 = wall type drawn by Draw3DView B100:05FD: types 1-5 = wall-set slot 1, 6-10 = slot 2, 11-15 = slot 3 (5 wall types per 780-byte WALLDEF block; WallBuf offset `(type−1)*9Ch`, H).
- **Passage state** (2 bits) — H, from MoveParty 6600:0D6D: **0** = closed, no passage (a locked door for which the party has no option is set to 0 by ClosePassage 6600:0000); **1** = open passage (also returned when there is no wall); **2** = locked door ("Locked." menu: Bash with AD&D open-doors odds by STR, Pick if a thief is present (TChar +78h open locks), Knock if someone has Knock (spell 1Fh) memorised); **3** = wizard-locked door (Bash only with STR 18/91+, cannot be picked, Knock offered with a magic-user in the party). Success sets the field on both sides to 1 (OpenPassage 6600:0109). Counts over all maps: 1 → 2962 sides, 2 → 130, 3 → 14.
- **Cell attribute** (plane 2) — H for the mechanism: the engine never interprets it; StepForward3D (6600:07C2) and the ECL CALL 2C90h copy it to `DS:6AB1` = ECL variable **C04F**, and the area scripts decide its meaning. Script usage (ECL listings, decode/ecl/listings): `C04F and 1Fh` → event/room number dispatched with ON_GOTO; `and 40h` / `and 20h` tested around the random-encounter code (skip / double the chance); comparisons with specific values (84h, 89h, 8Ah) and `< 7Fh` (bit 7) select special squares. Meaning per bit is therefore per-script (M); a reimplementation must expose the byte to ECL. **One engine use:** RefreshView A200:016D picks the sky colour from ECL word `4900:+1FAh` when bit 7 is clear and `+1FCh` when it is set (H).
- **Bounds:** GetWallType/GetPassage/GetCellAttr return 0 outside 0..15 when the current ECL block `g_84DC` is 0 or 10; for every other block the map wraps at the edges (H).

## Not covered here
The overland map is not a GEO record: it is a 36 × 44-byte table of SQRPACI tile numbers in START.EXE's initialised data at `DS:3648`, viewed through a 16-column window at column offset `DS:3C76[mode]` (0/13/26 for travel modes 2/3/4); StepOverland 6600:0818 (H).
