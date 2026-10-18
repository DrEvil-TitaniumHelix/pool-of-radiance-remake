# DAX container format (Pool of Radiance, SSI 1988)

Owner: por-data. Tool: `decode/tools/dax.py` (`list`, `extract`, `verify`). Extracted records: `decode/bin/dax/<FILE>/<id>.bin` (decompressed, not in git).

Addresses below are `SEG:OFF` in the **unpacked** resident image of START.EXE (`decode/bin/START.unpacked.exe`, load module at file offset 0x8E0; image offset = SEG*16+OFF). Segment boundaries come from the relocation table (resident code segments include 0464, 0802, 0899, 0AF8).

## 1. Container layout — confidence H

| offset | type | name | meaning |
|---|---|---|---|
| 0 | u16 LE | `dir_size` | byte size of the directory that follows (always a multiple of 9) |
| 2 | 9 × N | directory | N = dir_size / 9 entries |
| 2+dir_size | … | data area | compressed records, back to back |

Directory entry (9 bytes, packed, little-endian):

| +off | type | name | meaning |
|---|---|---|---|
| 0 | u8 | `id` | record id (the number the game asks for; not an index) |
| 1 | u32 | `offset` | offset of the compressed record from the start of the data area |
| 5 | u16 | `raw_size` | decompressed size |
| 7 | u16 | `comp_size` | stored (compressed) size |

Byte evidence: `GEO1.DAX` starts `1b 00 | 12 00000000 0204 a603 | 18 a6030000 0204 0c03 | 1f b2060000 0204 6c03` → dir_size 27 = 3 entries; ids 0x12/0x18/0x1F; offsets 0, 0x3A6, 0x6B2; raw 1026 each; comp 934/780/876; 2+27+934+780+876 = 2619 = file size.

Code evidence — `LoadDaxRecord` **0802:0716** (`55 89 e5 81 ec 3e 02 …`, retf 0x12; name confidence H):
- `0802:05CD` (open helper): builds the path from the data-directory string table `DS:2614 + drive*0x1E` + file name, opens the file twice (Reset, record size 1), BlockReads **2 bytes** = dir_size into the caller's var, adds 2 → start of data area, Seek(data file, dir_size+2).
- loop `0802:0793..0881`: BlockRead **1** byte → id `[bp-31h]`, **4** bytes → offset `[bp-30h]`, **2** bytes → raw_size (into caller's VAR at `[bp+0Ah]`), **2** bytes → comp_size `[bp-2Ch]`; compares id with the wanted id (byte arg `[bp+0Eh]`), continues while FilePos(dir) < data start (`0802:0860..0881`). Not found → size := 0, ptr := nil (`0802:088C`).
- `0802:080B`: `cmp comp_size, 8CA0h` → if larger, prints `"tempsize "` (string at 0802:070C) + value and aborts (`call 0899:0000`). So **max comp_size = 36000** bytes (static buffer `DS:557E`).
- `0802:08B3..0910`: GetMem(raw_size) (System `0AF8:023F`) → caller's pointer; Seek(data file, data_start + offset) (`0AF8:1563`); BlockRead comp_size bytes into the buffer `DS:557E` (`0AF8:14FB`).
- `0802:0935`: `call 050F` = decompress(buffer → caller's pointer, comp_size, raw_size).

## 2. Compression (RLE) — confidence H

Routine **0802:050F** `DaxRleDecode(var src, var dst, var compSize, var rawSize)` (`55 89 e5 83 ec 06 31 c0 …`, retf 0x10). Pseudocode from the routine body:

```pascal
si := 0; di := 0;
repeat
  c := ShortInt(src[si]);
  if (c >= 0) and (c <= $7E) then begin          { 0802:0533..0572 }
    Move(src[si+1], dst[di], c+1);                { System 0AF8:1685 = Move }
    si := si + c + 2;  di := di + c + 1;
  end else if (c >= -127) and (c <= -1) then begin { 0802:0574..05B4: cmp al,81h / cmp al,0FFh }
    FillChar(dst[di], -c, src[si+1]);             { System 0AF8:16A8 = FillChar }
    si := si + 2;      di := di + (-c);
  end;                                            { c = $7F or $80: nothing, si not advanced }
until si >= compSize;                             { 0802:05B7..05C2 }
```

- Control byte 0x00..0x7E: literal run of c+1 bytes (1..127).
- Control byte 0x81..0xFF: repeat the next byte 256−c times (1..127).
- 0x7F and 0x80 are not handled; the engine would loop forever on them. **No shipped record contains them** (checked over all 1,245 records by `dax.py`; the tool raises an error on them).
- Termination is on the **compressed** size; raw_size is not checked by the engine. `dax.py verify` checks both.

Cross-check (not evidence): same scheme as described in public Gold Box tooling (coab). Agrees.

## 3. Callers / users (partial; fill from listings)

| routine | evidence | use |
|---|---|---|
| 0802:0716 LoadDaxRecord | above | every DAX read |
| 0464:0111 LoadPicture (M) | builds `name + ".dax"` (string `\x04.dax` just before it), calls 0802:0716, parses the 17-byte picture header; see PICTURES.md | all picture groups |
| GAME.OVR strings | `ECL`+`.dax` (OVR 0x1914, 0x7811), `ITEM`+`.dax` (0x26DA), `MON`+n+`CHA`+`.dax` (0x1EE88), `PIC`/`FINAL`+`.dax` (0x2E16D), `WALLDEF`+`.dax` (0x2F6B5), `GEO`+`.dax` (0x2F99A), `8X8d1.dax` (START.EXE resident) | overlay loaders, to be located in the listings |

## 4. Verification — every record of all 113 files (`python decode/tools/dax.py verify <POOLRAD>`)

"decoded to raw_size" = decompressed length equals the directory raw_size; "comp fully consumed" = the decoder stops exactly at comp_size; "dir+data == file size" = the last record ends exactly at EOF (no gaps/trailers).

| file | bytes | records | decoded to raw_size | comp fully consumed | dir+data == file size | raw total |
|---|---|---|---|---|---|---|
| 8X8D1.DAX | 9711 | 6 | 6/6 | 6/6 | yes | 10653 |
| 8X8D2.DAX | 12190 | 6 | 6/6 | 6/6 | yes | 13542 |
| 8X8D3.DAX | 12967 | 6 | 6/6 | 6/6 | yes | 13542 |
| 8X8D4.DAX | 14343 | 7 | 7/7 | 7/7 | yes | 15799 |
| 8X8D5.DAX | 5847 | 3 | 3/3 | 3/3 | yes | 6771 |
| 8X8D6.DAX | 10285 | 5 | 5/5 | 5/5 | yes | 11285 |
| 8X8D7.DAX | 9820 | 5 | 5/5 | 5/5 | yes | 11285 |
| 8X8D8.DAX | 14510 | 7 | 7/7 | 7/7 | yes | 15799 |
| BACPAC.DAX | 11328 | 1 | 1/1 | 1/1 | yes | 11537 |
| BODY1.DAX | 4139 | 3 | 3/3 | 3/3 | yes | 6387 |
| BODY2.DAX | 7685 | 6 | 6/6 | 6/6 | yes | 12774 |
| BODY3.DAX | 21505 | 16 | 16/16 | 16/16 | yes | 34064 |
| BODY4.DAX | 4185 | 3 | 3/3 | 3/3 | yes | 6387 |
| BODY5.DAX | 8230 | 6 | 6/6 | 6/6 | yes | 12774 |
| BODY6.DAX | 6545 | 5 | 5/5 | 5/5 | yes | 10645 |
| BODY7.DAX | 5717 | 4 | 4/4 | 4/4 | yes | 8516 |
| BODY8.DAX | 3973 | 3 | 3/3 | 3/3 | yes | 6387 |
| CBODY.DAX | 23978 | 128 | 128/128 | 128/128 | yes | 39040 |
| CHEAD.DAX | 3442 | 56 | 56/56 | 56/56 | yes | 7000 |
| COMSPR.DAX | 3612 | 26 | 26/26 | 26/26 | yes | 7930 |
| CPIC1.DAX | 6182 | 22 | 22/22 | 22/22 | yes | 7862 |
| CPIC2.DAX | 11505 | 38 | 38/38 | 38/38 | yes | 15046 |
| CPIC3.DAX | 3150 | 14 | 14/14 | 14/14 | yes | 4270 |
| CPIC4.DAX | 12154 | 44 | 44/44 | 44/44 | yes | 16300 |
| CPIC5.DAX | 7779 | 20 | 20/20 | 20/20 | yes | 10132 |
| CPIC6.DAX | 8101 | 30 | 30/30 | 30/30 | yes | 12606 |
| CPIC7.DAX | 6178 | 22 | 22/22 | 22/22 | yes | 8438 |
| CPIC8.DAX | 10325 | 28 | 28/28 | 28/28 | yes | 14876 |
| DUNGCOM.DAX | 5664 | 1 | 1/1 | 1/1 | yes | 7217 |
| ECL1.DAX | 14564 | 2 | 2/2 | 2/2 | yes | 14206 |
| ECL2.DAX | 19968 | 3 | 3/3 | 3/3 | yes | 19594 |
| ECL3.DAX | 24955 | 4 | 4/4 | 4/4 | yes | 24476 |
| ECL4.DAX | 19950 | 3 | 3/3 | 3/3 | yes | 19552 |
| ECL5.DAX | 27914 | 5 | 5/5 | 5/5 | yes | 27334 |
| ECL6.DAX | 24894 | 4 | 4/4 | 4/4 | yes | 24230 |
| ECL7.DAX | 23574 | 4 | 4/4 | 4/4 | yes | 23212 |
| ECL8.DAX | 24167 | 4 | 4/4 | 4/4 | yes | 23661 |
| FINAL5.DAX | 36603 | 8 | 8/8 | 8/8 | yes | 78440 |
| GEO1.DAX | 2619 | 3 | 3/3 | 3/3 | yes | 3078 |
| GEO2.DAX | 2572 | 3 | 3/3 | 3/3 | yes | 3078 |
| GEO3.DAX | 1761 | 2 | 2/2 | 2/2 | yes | 2052 |
| GEO4.DAX | 2861 | 3 | 3/3 | 3/3 | yes | 3078 |
| GEO5.DAX | 3612 | 5 | 5/5 | 5/5 | yes | 5130 |
| GEO6.DAX | 2324 | 3 | 3/3 | 3/3 | yes | 3078 |
| GEO7.DAX | 3118 | 4 | 4/4 | 4/4 | yes | 4104 |
| GEO8.DAX | 4690 | 6 | 6/6 | 6/6 | yes | 6156 |
| HEAD1.DAX | 1863 | 3 | 3/3 | 3/3 | yes | 5331 |
| HEAD2.DAX | 2808 | 5 | 5/5 | 5/5 | yes | 8885 |
| HEAD3.DAX | 12403 | 21 | 21/21 | 21/21 | yes | 37317 |
| HEAD4.DAX | 1702 | 3 | 3/3 | 3/3 | yes | 5331 |
| HEAD5.DAX | 6708 | 11 | 11/11 | 11/11 | yes | 19547 |
| HEAD6.DAX | 4577 | 7 | 7/7 | 7/7 | yes | 12439 |
| HEAD7.DAX | 6192 | 10 | 10/10 | 10/10 | yes | 17770 |
| HEAD8.DAX | 1814 | 3 | 3/3 | 3/3 | yes | 5331 |
| ICON.DAX | 1287 | 6 | 6/6 | 6/6 | yes | 1830 |
| ITEM1.DAX | 2785 | 7 | 7/7 | 7/7 | yes | 5040 |
| ITEM2.DAX | 632 | 8 | 8/8 | 8/8 | yes | 1008 |
| ITEM3.DAX | 4687 | 10 | 10/10 | 10/10 | yes | 7749 |
| ITEM4.DAX | 2364 | 10 | 10/10 | 10/10 | yes | 3276 |
| ITEM5.DAX | 2130 | 4 | 4/4 | 4/4 | yes | 3906 |
| ITEM6.DAX | 27 | 1 | 1/1 | 1/1 | yes | 63 |
| ITEM7.DAX | 81 | 1 | 1/1 | 1/1 | yes | 126 |
| ITEM8.DAX | 716 | 5 | 5/5 | 5/5 | yes | 1008 |
| MON1CHA.DAX | 1766 | 15 | 15/15 | 15/15 | yes | 4275 |
| MON1ITM.DAX | 792 | 13 | 13/13 | 13/13 | yes | 2142 |
| MON2CHA.DAX | 3254 | 28 | 28/28 | 28/28 | yes | 7980 |
| MON2ITM.DAX | 1293 | 19 | 19/19 | 19/19 | yes | 3465 |
| MON2SPC.DAX | 150 | 4 | 4/4 | 4/4 | yes | 108 |
| MON3CHA.DAX | 2521 | 20 | 20/20 | 20/20 | yes | 5700 |
| MON3ITM.DAX | 1329 | 18 | 18/18 | 18/18 | yes | 3528 |
| MON4CHA.DAX | 3006 | 26 | 26/26 | 26/26 | yes | 7410 |
| MON4ITM.DAX | 349 | 8 | 8/8 | 8/8 | yes | 945 |
| MON4SPC.DAX | 904 | 16 | 16/16 | 16/16 | yes | 711 |
| MON5CHA.DAX | 2377 | 19 | 19/19 | 19/19 | yes | 5415 |
| MON5ITM.DAX | 739 | 12 | 12/12 | 12/12 | yes | 1890 |
| MON5SPC.DAX | 238 | 8 | 8/8 | 8/8 | yes | 162 |
| MON6CHA.DAX | 2562 | 22 | 22/22 | 22/22 | yes | 6270 |
| MON6ITM.DAX | 978 | 11 | 11/11 | 11/11 | yes | 2583 |
| MON6SPC.DAX | 124 | 6 | 6/6 | 6/6 | yes | 72 |
| MON7CHA.DAX | 2773 | 24 | 24/24 | 24/24 | yes | 6840 |
| MON7ITM.DAX | 1320 | 18 | 18/18 | 18/18 | yes | 3465 |
| MON7SPC.DAX | 36 | 2 | 2/2 | 2/2 | yes | 18 |
| MON8CHA.DAX | 2042 | 18 | 18/18 | 18/18 | yes | 5130 |
| MON8ITM.DAX | 350 | 6 | 6/6 | 6/6 | yes | 945 |
| MON8SPC.DAX | 134 | 6 | 6/6 | 6/6 | yes | 81 |
| PIC1.DAX | 36273 | 7 | 7/7 | 7/7 | yes | 101225 |
| PIC2.DAX | 71533 | 13 | 13/13 | 13/13 | yes | 186877 |
| PIC3.DAX | 15316 | 3 | 3/3 | 3/3 | yes | 38933 |
| PIC4.DAX | 91885 | 17 | 17/17 | 17/17 | yes | 264741 |
| PIC5.DAX | 46750 | 10 | 10/10 | 10/10 | yes | 132372 |
| PIC6.DAX | 66888 | 14 | 14/14 | 14/14 | yes | 175199 |
| PIC7.DAX | 67804 | 14 | 14/14 | 14/14 | yes | 202450 |
| PIC8.DAX | 67227 | 14 | 14/14 | 14/14 | yes | 163520 |
| RANDCOM.DAX | 755 | 1 | 1/1 | 1/1 | yes | 1745 |
| SPRIT1.DAX | 5613 | 5 | 5/5 | 5/5 | yes | 16784 |
| SPRIT2.DAX | 16768 | 15 | 15/15 | 15/15 | yes | 48784 |
| SPRIT3.DAX | 6124 | 7 | 7/7 | 7/7 | yes | 18832 |
| SPRIT4.DAX | 11176 | 12 | 12/12 | 12/12 | yes | 38488 |
| SPRIT5.DAX | 13174 | 11 | 11/11 | 11/11 | yes | 35924 |
| SPRIT6.DAX | 13727 | 14 | 14/14 | 14/14 | yes | 57644 |
| SPRIT7.DAX | 12985 | 12 | 12/12 | 12/12 | yes | 40264 |
| SPRIT8.DAX | 14853 | 12 | 12/12 | 12/12 | yes | 51126 |
| SQRPACI.DAX | 69788 | 2 | 2/2 | 2/2 | yes | 73762 |
| TITLE.DAX | 33898 | 2 | 2/2 | 2/2 | yes | 64034 |
| WALLDEF1.DAX | 2147 | 3 | 3/3 | 3/3 | yes | 2340 |
| WALLDEF2.DAX | 4044 | 6 | 6/6 | 6/6 | yes | 4680 |
| WALLDEF3.DAX | 4289 | 4 | 4/4 | 4/4 | yes | 4680 |
| WALLDEF4.DAX | 4956 | 6 | 6/6 | 6/6 | yes | 5460 |
| WALLDEF5.DAX | 2121 | 2 | 2/2 | 2/2 | yes | 2340 |
| WALLDEF6.DAX | 3492 | 5 | 5/5 | 5/5 | yes | 3900 |
| WALLDEF7.DAX | 3176 | 5 | 5/5 | 5/5 | yes | 3900 |
| WALLDEF8.DAX | 4998 | 7 | 7/7 | 7/7 | yes | 5460 |
| WILDCOM.DAX | 5786 | 1 | 1/1 | 1/1 | yes | 9809 |

files=113 records=1245 all_ok=True
