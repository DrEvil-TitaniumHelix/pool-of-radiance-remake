# Data file index — Pool of Radiance (POOLRAD folder)

Owner: por-data. Every data file → group, record ids, format spec, code that loads it. Container for all `.DAX`: [DAX.md](DAX.md) (all 1,245 records of the 113 files verified). `n` in a file name = data-set/disk number, global byte `DS:5376` (see GEO.md). Code addresses: resident `SEG:OFF` (unpacked START.EXE), overlays `ovNN_XXXX` / `SEG:OFF` from `decode/listings/`.

Shared loaders: `LoadDaxRecord(name, id, var size, var ptr)` 0802:0716 (+ RLE 0802:050F) is used by everything below; `LoadPicture(var pic, maskColour, flag, id, name)` 0464:0111 for all picture groups (PICTURES.md).

| file(s) | group | records (ids) | format spec | loaded by (code) |
|---|---|---|---|---|
| TITLE.DAX | TITLE | 1, 2 (320×200) | [PICTURES.md](PICTURES.md) P | ov01_0627 (2500:0627, string "title") → LoadPicture |
| PIC1..8.DAX | PIC | 92 animations, 88×88 | PICTURES.md A | ov28_00A2 (AC00:00A2, "PIC"/"FINAL" + n + ".dax", LoadDaxRecord); ov07_054E ("SPRIT"/"PIC", ECL picture opcodes, M) |
| FINAL5.DAX | FINAL | 1..8 | PICTURES.md A/P | ov28_00A2; ov18 FUN_7A00_0006 and ov18_02A4 (end-game text "Mortally wounded, the dragon roars!") |
| SPRIT1..8.DAX | SPRIT | 88 sprites (3 distances) | PICTURES.md A | ov07_054E (4300:054E); drawn by ov28_0708 "Show3DSprite" (M) |
| HEAD1..8.DAX / BODY1..8.DAX | HEAD, BODY | 63 heads 88×40, 46 bodies 88×48 | PICTURES.md P | ov28_05D9 (AC00:05D9) → LoadPicture into DS:6B01 (head), DS:6B06 (body) |
| CHEAD.DAX / CBODY.DAX | CHEAD, CBODY | 56 heads, 128 bodies (24 px) | PICTURES.md P | ov32_01C8 (C000:01C8, into DS:5E5A/5E5E + slot*8), ov17_0482 (7500:0482), icon editor ov16_382D |
| CPIC1..8.DAX | CPIC | 218 combat icons | PICTURES.md P | ov07_1A6F (4300:1A6F, "CPIC") |
| COMSPR.DAX | COMSPR | 26 (24×24) | PICTURES.md P | ov11_002D (5700:002D, startup), ov32_01C8 |
| ICON.DAX | ICON | 0, 1, 2, 128, 129, 130 | PICTURES.md P | FUN_2F00_179B, ov14_0989, ov17_1602 (load game), ov32_01C8 |
| BACPAC.DAX | BACPAC | 1 (40 tiles) | PICTURES.md P | FUN_2F00_179B (2F00:179B, strings "BACPAC", "ICON") |
| SQRPACI.DAX | SQRPACI | 1, 2 (128 tiles each) | PICTURES.md P | ov11_002D → LoadPicture into DS:5E52 / DS:5E56 |
| DUNGCOM / WILDCOM / RANDCOM.DAX | combat terrain | 1 each (25 / 34 / 6 tiles) | PICTURES.md P | FUN_5200_1244 (ov10, 5200:1244, strings "DungCom", "WildCom", "RandCom") |
| 8X8D1..8.DAX | 8X8D | 70-tile wall sets (ids = WALLDEF ids, multi-block id*10+k); 8X8D1 also 201 (font), 202 (31 tiles), 203 (45 tiles) | PICTURES.md P/F, [WALLDEF.md](WALLDEF.md) | ov34_003B Load8x8Set (CA00:003B); 0709:017C loads 8X8d1/201 (font, resident); ov11_002D loads 202/203 |
| WALLDEF1..8.DAX | WALLDEF | 1..7 per file, 780-byte blocks | [WALLDEF.md](WALLDEF.md) | ov29_0E08 LoadWallSet (B100:0E08) |
| GEO1..8.DAX | GEO | 29 maps, global ids 0..32 | [GEO.md](GEO.md) | ov29_10C7 Load3DMap (B100:10C7) |
| ECL1..8.DAX | ECL | see below | container only here; bytecode: ECL lane (`decode/ecl/`) | ov07_0341 (4300:0341) |
| MON1..8CHA.DAX | monsters | 172 × 285 B | [MONSTERS.md](MONSTERS.md) (record fields: SAVES*.md) | ov17_0EC4 LoadMonster (7500:0EC4) |
| MON1..8ITM.DAX | monster items | 105, n × 63 B | MONSTERS.md / SAVES*.md | ov17_0EC4 |
| MON2,4..8SPC.DAX | monster spells/effects | 42, n × 9 B | MONSTERS.md / SAVES*.md | ov17_0EC4 |
| ITEM1..8.DAX | treasure lists | 46, n × 63 B | [ITEM.md](ITEM.md) | FUN_2F00_19B0 (ov03 treasure routine) |
| ITEMS | item catalogue (not DAX, 2050 B) | — | por-saves (SAVES*.md) | ov11_002D (string "ITEMS", read from the data path `DS:2614 + DS:5376*1Eh`) |
| SAVE/CHRDAT*.SAV/.ITM/.SPC, SAVGAMA.DAT | saves | — | por-saves (SAVES*.md) | ov17_069E / 0AEC / 1602 / 1D58 |
| START.EXE, GAME.OVR | code | — | `decode/LAYOUT.md` (por-tooling) | — |
| POOL.CFG, POOL.BAT, CFG.EXE, CFG.C | configuration files (not part of the original release) | — | out of scope (FOREMAN.md) | 042B:00A4 reads "POOL.CFG" |

## ECL container (bytecode owned by the ECL lane) — H

Loader `ov07_0341(id)` (4300:0341, strings "Loading...Please Wait", "ECL", ".dax"):
```pascal
FillChar(DS:49DE^, $1E00, 0);                  { 7680-byte script buffer }
DS:557C := 0;
repeat ShowText('Loading...Please Wait'); LoadDaxRecord('ECL' + Str(DS:5376) + '.dax', id, p, size) until size >= 2;
Move(p[2], DS:49DE^, size - 2);                { first 2 bytes skipped }
FreeMem(p, size);
```
So an ECL record = 2 skipped bytes + script bytes, loaded at buffer offset 0; max script = 0x1E00 bytes (largest record raw 7679 → 7677 bytes, fits).

| file | ids (raw bytes) |
|---|---|
| ECL1 | 18 (6550), 24 (7656) |
| ECL2 | 9 (6367), 15 (5548), 20 (7679) |
| ECL3 | 0 (7473), 8 (7500), 11 (2171), 14 (7332) |
| ECL4 | 2 (6170), 10 (7672), 21 (5710) |
| ECL5 | 3 (6800), 4 (6627), 5 (4943), 6 (4859), 7 (4105) |
| ECL6 | 1 (7673), 19 (3236), 25 (5652), 28 (7669) |
| ECL7 | 17 (7603), 22 (3400), 23 (5640), 26 (6569) |
| ECL8 | 13 (7313), 16 (5394), 27 (5079), 29 (5875) |

ECL ids use the same global area numbers as GEO: every ECL id except 8, 11, 19 has a GEO map with the same id in the same-numbered file; ECL 8, 11, 19 have no GEO map (areas without a 3D map, e.g. overland/wilderness — L); GEO 30, 31, 32 have no ECL record of their own (L: shared/sub-maps).
