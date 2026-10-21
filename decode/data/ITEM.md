# ITEM1..8.DAX — fixed treasure item lists

Owner: por-data. The 63-byte item record layout is shared with `.ITM` save files and MONnITM and is specified by por-saves (`decode/data/SAVES*.md`). DS addresses as in GEO.md.

## Loader — treasure routine FUN_2f00_19b0 (ov03, 2F00:19B0; strings "ITEM", ".dax", "Unable to find item file") — H

```pascal
EclArgs(8);                                         { stub_ov07_e2(8): fetch 8 ECL operands (M) }
for i := 0 to 6 do DS:67F4[i*4] := EclArg(i+1);    { 7 values, words, high word 0 (money amounts? owned by ECL lane) }
k := EclArg(8);
if k < $80 then begin
  LoadDaxRecord('ITEM' + Str(DS:5376) + '.dax', k, p, size);
  if size = 0 then Fatal('Unable to find item file');
  for each 63-byte item in p^: copy, clear next ptr (+2Ah..+2Dh), push onto treasure list DS:6810 (new item first)
end else if k <> $FF then
  generate (k - $80) random items (stub_ov24_e8 = random; tables of item types 22h..5Dh) and push them;
then walk the list calling FUN_00ba_0442 for each item (M: identify/price setup).
```
So ITEMn.DAX record id = the ECL treasure operand value 0..7Fh, file digit = current data set DS:5376 (H).

## Records — H
Every record is a multiple of 63 bytes (46 records, all checked). Byte +2Eh of each item (first byte after the next pointer) varies per item (item type, per por-saves).

| file | id | items | bytes +2Eh..+3Eh of the first item |
|---|---|---|---|
| ITEM1 | 4 | 1 | 48 00 00 ae 00 00 00 00 00 f4 01 00 fa 00 00 00 00 |
| ITEM1 | 6 | 3 | 5a ee a7 42 03 00 00 06 00 00 00 00 88 13 00 00 00 |
| ITEM1 | 8 | 3 | 3d 00 d4 d1 02 00 00 06 00 19 00 00 34 08 2f 21 22 |
| ITEM1 | 9 | 7 | 46 00 98 3c 00 00 00 00 00 14 00 00 f4 01 00 00 00 |
| ITEM1 | 17 | 8 | 25 00 a2 25 01 00 00 06 00 23 00 00 d0 07 00 00 00 |
| ITEM1 | 22 | 1 | 4a 00 98 32 00 00 00 00 00 00 01 06 00 00 00 00 00 |
| ITEM1 | 53 | 57 | 3b 00 00 3b 00 00 00 00 00 64 00 00 0f 00 00 00 00 |
| ITEM2 | 1 | 1 | 46 af a7 72 0c 00 00 06 00 c8 00 00 50 c3 01 5a 00 |
| ITEM2 | 2 | 1 | 46 b3 a7 b7 00 00 00 00 00 00 00 03 03 00 00 00 00 |
| ITEM2 | 3 | 4 | 3e 00 d3 d0 01 00 00 00 00 0a 00 00 e8 03 38 38 00 |
| ITEM2 | 4 | 1 | 48 00 00 ae 00 00 00 00 00 f4 01 00 fa 00 00 00 00 |
| ITEM2 | 5 | 3 | 46 b9 bb 40 01 00 00 06 00 0a 00 00 20 03 03 03 00 |
| ITEM2 | 40 | 2 | 2c 00 a2 2c 01 00 00 06 00 32 00 00 ac 0d 00 00 00 |
| ITEM2 | 41 | 2 | 2c 00 a2 2c 01 00 00 06 00 32 00 00 ac 0d 00 00 00 |
| ITEM2 | 42 | 2 | 3d 00 d2 d1 01 00 00 00 00 0a 00 00 2c 01 0f 00 00 |
| ITEM3 | 24 | 2 | 46 00 ae d7 00 00 00 00 00 20 03 02 88 13 00 00 00 |
| ITEM3 | 25 | 8 | 3d 00 d4 d1 01 00 00 06 00 32 00 00 58 02 2d 09 20 |
| ITEM3 | 26 | 5 | 3e 00 d3 d0 01 00 00 06 00 0a 00 00 e8 03 38 38 00 |
| ITEM3 | 27 | 9 | 23 ff ca 23 fe 00 00 06 01 4b 00 00 00 00 00 00 00 |
| ITEM3 | 51 | 5 | 3e 00 d3 d0 01 00 00 00 00 0a 00 00 e8 03 38 38 00 |
| ITEM3 | 52 | 11 | 46 62 9c da 00 00 00 00 00 00 00 01 4b 00 00 00 00 |
| ITEM3 | 53 | 57 | 3b 00 00 3b 00 00 00 00 00 64 00 00 0f 00 00 00 00 |
| ITEM3 | 54 | 7 | 55 00 00 99 00 00 00 00 00 0a 00 01 19 00 00 00 00 |
| ITEM3 | 55 | 13 | 2d 00 29 d7 00 00 00 00 00 3c 00 00 a8 61 00 00 00 |
| ITEM3 | 56 | 6 | 46 00 5d b2 00 00 00 00 00 64 00 00 0f 00 00 00 00 |
| ITEM4 | 19 | 1 | 14 00 a2 14 01 00 00 06 00 32 00 00 c4 09 00 00 00 |
| ITEM4 | 21 | 4 | 17 00 a3 17 02 00 00 06 00 64 00 00 94 11 00 00 00 |
| ITEM4 | 26 | 5 | 3e 00 d3 d0 01 00 00 06 00 0a 00 00 e8 03 38 38 00 |
| ITEM4 | 28 | 4 | 3e 00 d3 d0 01 00 00 00 00 0a 00 00 e8 03 38 38 00 |
| ITEM4 | 29 | 8 | 3e 00 d3 d0 01 00 00 00 00 0a 00 00 e8 03 38 38 00 |
| ITEM4 | 30 | 8 | 3e 00 d3 d0 01 00 00 00 00 0a 00 00 e8 03 38 38 00 |
| ITEM4 | 38 | 8 | 3d 00 d4 d1 01 00 00 06 00 32 00 00 58 02 2d 09 20 |
| ITEM4 | 39 | 5 | 3f e2 a7 64 02 00 00 00 00 28 00 00 98 3a 00 26 83 |
| ITEM4 | 51 | 5 | 3e 00 d3 d0 01 00 00 00 00 0a 00 00 e8 03 38 38 00 |
| ITEM4 | 59 | 4 | 3e 00 d3 d0 01 00 00 00 00 0a 00 00 e8 03 38 38 00 |
| ITEM5 | 33 | 58 | 2f 00 00 2f 00 00 00 00 00 02 00 00 00 00 00 00 00 |
| ITEM5 | 34 | 1 | 47 ad a7 40 01 00 00 06 00 14 00 00 c2 01 01 50 00 |
| ITEM5 | 35 | 2 | 24 00 a4 24 03 00 00 06 00 3c 00 00 58 1b 00 52 84 |
| ITEM5 | 36 | 1 | 24 f1 a3 24 02 00 00 06 00 3c 00 00 94 11 00 16 00 |
| ITEM6 | 57 | 1 | 5b 00 00 fe 00 00 00 00 00 00 00 00 00 00 00 00 00 |
| ITEM7 | 37 | 2 | 4f ce a7 45 0a 00 00 06 00 14 00 00 20 4e 23 58 00 |
| ITEM8 | 31 | 1 | 3b 00 a3 3b 02 00 00 06 00 3c 00 00 88 13 00 00 00 |
| ITEM8 | 32 | 1 | 24 00 a2 24 01 00 00 06 00 3c 00 00 d0 07 00 00 00 |
| ITEM8 | 43 | 10 | 3d 00 d4 d1 01 00 00 06 00 0a 00 00 e8 03 0e 1e 36 |
| ITEM8 | 50 | 1 | 52 00 e9 e8 0a 00 00 00 00 00 00 00 b8 88 00 00 00 |
| ITEM8 | 58 | 3 | 4d 00 de 4f 06 00 00 06 00 00 00 00 50 46 00 00 00 |
