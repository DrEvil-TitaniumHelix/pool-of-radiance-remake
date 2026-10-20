# Monsters — MONnCHA / MONnITM / MONnSPC.DAX (n = 1..8)

Owner: por-data. Record *field* layouts are shared with the save files and are specified by por-saves (`decode/data/SAVES*.md`: 285-byte character record, 63-byte item record, 9-byte spell/effect record). This file covers the containers, the loader and the inventory.

## Loader — `LoadMonster(var rec, id)` = ov17_0EC4 (7500:0EC4; strings "MON", "CHA", ".dax", "Unable to load monster", "SPC", "ITM") — H

```pascal
n := Str(DS:5376);                                    { current data-set number; same byte selects the data path in 0802:05CD }
LoadDaxRecord('MON'+n+'CHA.dax', id, p, size);
if size = 0 then Fatal('Unable to load monster');
Move(p^, rec, $11D);                                  { 285 bytes = character record }
rec[+C8h] := nil; rec[+7Fh] := nil;                   { item list, spell/effect list pointers }
rec[+104h..+10Ah] := 0;                               { 4 words }
case rec[+2Eh] of 1,3,5: rec[+C0h] := 1; 2,4,6,7: rec[+C0h] := 2 end;
for i := 1 to 3 do rec[+C0h+i] := Random(6)*$11 - $80;   { stub_ov24_e8(6,1) = random 1..6 (M) }
rec[+C4h] := $C4;
for i := 5 to 6 do rec[+C0h+i] := Random(6)*$11 - $80;
FreeMem(p);
DS:557C := 1;                                         { "optional record" flag while loading SPC/ITM (M) }
LoadDaxRecord('MON'+n+'SPC.dax', id, p, size);
if size <> 0 then  build linked list of 9-byte entries at rec[+7Fh]: Move(9) each, next ptr at entry +5..+8
LoadDaxRecord('MON'+n+'ITM.dax', id, p, size);
if size <> 0 then  build linked list of 63-byte items at rec[+C8h]: Move(3Fh) each, next ptr at item +2Ah..+2Dh
DS:557C := 0;
```
So the on-disk pointer fields (SPC +5..+8, ITM +2Ah..+2Dh) are overwritten — their stored values are meaningless (H).
The same id selects the CHA, SPC and ITM record; SPC/ITM are optional (every SPC/ITM id has a CHA record with the same id — checked).

## Containers — H
- MONnCHA: every record exactly 285 B (172 records).
- MONnITM: every record a multiple of 63 B (105 records); 1..n items.
- MONnSPC: every record a multiple of 9 B (42 records); MON1SPC and MON3SPC do not exist.
- Ids are per file set (same monster name can appear with different ids/sets, e.g. GOBLIN GUARD 1/2 and 2/2).

## Inventory (generated from the records; name = Pascal string at +0, `+2Eh` = byte the loader maps to +C0h)

| file set | id | name (Pascal string @0) | +2Eh | ITM items | SPC entries |
|---|---|---|---|---|---|
| 1 | 2 | GOBLIN GUARD | 0 | 3 | – |
| 1 | 3 | GOBLIN LEADER | 0 | 5 | – |
| 1 | 4 | ORC | 0 | – | – |
| 1 | 5 | ORC LEADER | 0 | 4 | – |
| 1 | 6 | HOBGOBLIN | 0 | 1 | – |
| 1 | 7 | HOBGOBLIN LDR | 0 | 3 | – |
| 1 | 8 | OGRE | 0 | – | – |
| 1 | 9 | OGRE LEADER | 0 | 2 | – |
| 1 | 22 | GIANT SKELETON | 0 | 1 | – |
| 1 | 23 | VAMPIRE | 0 | 1 | – |
| 1 | 33 | MACE | 6 | 3 | – |
| 1 | 41 | 4TH LVL FIGHTER | 7 | 3 | – |
| 1 | 44 | ORC | 0 | 2 | – |
| 1 | 75 | 6TH LVL FIGHTER | 7 | 3 | – |
| 1 | 107 | DIRTEN | 7 | 3 | – |
| 2 | 0 | KOBOLD | 0 | 1 | – |
| 2 | 1 | KOBOLD LEADER | 0 | 5 | – |
| 2 | 2 | GOBLIN GUARD | 0 | 3 | – |
| 2 | 3 | GOBLIN LEADER | 0 | 5 | – |
| 2 | 4 | ORC | 0 | – | – |
| 2 | 5 | ORC LEADER | 0 | 4 | – |
| 2 | 6 | HOBGOBLIN | 0 | 1 | – |
| 2 | 7 | HOBGOBLIN LDR | 0 | 3 | – |
| 2 | 8 | OGRE | 0 | – | – |
| 2 | 11 | KOBOLD LEADER | 0 | 4 | – |
| 2 | 12 | GOBLIN LEADER | 0 | 3 | – |
| 2 | 13 | ORC | 0 | 1 | – |
| 2 | 14 | ORC LEADER | 0 | 4 | – |
| 2 | 15 | ORC LEADER | 0 | 4 | – |
| 2 | 17 | SPECTRE | 7 | – | 7 |
| 2 | 24 | LEVEL 6 MU | 7 | 1 | – |
| 2 | 25 | MAD MAN | 7 | – | – |
| 2 | 26 | BASILISK | 0 | – | 2 |
| 2 | 31 | TROLL | 0 | – | 2 |
| 2 | 53 | AIDES | 7 | 4 | – |
| 2 | 55 | HILL GIANT | 0 | 2 | 1 |
| 2 | 63 | BUGBEAR | 0 | – | – |
| 2 | 71 | ETTIN | 0 | – | – |
| 2 | 73 | GNOLL | 0 | – | – |
| 2 | 75 | 6TH LVL FIGHTER | 7 | 3 | – |
| 2 | 82 | LEVEL 6 MU | 7 | 5 | – |
| 2 | 89 | 5TH LVL MU | 7 | 1 | – |
| 2 | 94 | LEVEL 3 MU | 7 | 1 | – |
| 3 | 36 | SWORDSMAN | 7 | 4 | – |
| 3 | 40 | NOMAD | 7 | 5 | – |
| 3 | 41 | 4TH LVL FIGHTER | 7 | 3 | – |
| 3 | 45 | 1ST LVL THIEF | 7 | 2 | – |
| 3 | 51 | 6TH LVL THIEF | 7 | 2 | – |
| 3 | 53 | AIDES | 7 | 4 | – |
| 3 | 54 | CORPORAL | 7 | – | – |
| 3 | 83 | 7TH LVL CLERIC | 7 | 3 | – |
| 3 | 84 | 6TH LVL FIGHTER | 7 | 3 | – |
| 3 | 85 | 8TH LVL FIGHTER | 7 | 3 | – |
| 3 | 94 | LEVEL 3 MU | 7 | 1 | – |
| 3 | 103 | WARRIOR | 7 | 5 | – |
| 3 | 106 | WOLF | 0 | – | – |
| 3 | 107 | DIRTEN | 7 | 3 | – |
| 3 | 108 | ACOLYTE | 0 | 5 | – |
| 3 | 109 | HERO | 7 | 4 | – |
| 3 | 110 | THEURGIST | 7 | 3 | – |
| 3 | 111 | ROBBER | 7 | 2 | – |
| 3 | 112 | CURATE | 7 | 2 | – |
| 3 | 122 | EVOKER | 7 | 2 | – |
| 4 | 4 | ORC | 0 | – | – |
| 4 | 5 | ORC LEADER | 0 | 4 | – |
| 4 | 6 | HOBGOBLIN | 0 | 1 | – |
| 4 | 7 | HOBGOBLIN LDR | 0 | 3 | – |
| 4 | 8 | OGRE | 0 | – | – |
| 4 | 17 | SPECTRE | 7 | – | 7 |
| 4 | 18 | LARGE SCORPION | 0 | – | 1 |
| 4 | 19 | FERRAN MARTINEZ | 7 | – | 6 |
| 4 | 20 | WIGHT | 0 | – | 7 |
| 4 | 21 | WRAITH | 0 | – | 7 |
| 4 | 22 | GIANT SKELETON | 0 | 1 | 4 |
| 4 | 23 | VAMPIRE | 0 | 1 | 10 |
| 4 | 24 | LEVEL 6 MU | 7 | 1 | – |
| 4 | 27 | SKULLCRUSHER | 7 | – | – |
| 4 | 28 | GRISHNAK | 0 | – | – |
| 4 | 29 | JUJU ZOMBIE | 0 | 1 | 7 |
| 4 | 34 | SKELETON | 0 | – | 4 |
| 4 | 35 | ZOMBIE | 0 | – | 3 |
| 4 | 38 | POISONOUS FROG | 0 | – | 1 |
| 4 | 39 | HUGE SCORPION | 0 | – | 1 |
| 4 | 70 | EFREETI | 0 | – | 1 |
| 4 | 72 | GHOUL | 0 | – | 2 |
| 4 | 104 | PRINCESS FATIMA | 7 | 3 | – |
| 4 | 105 | VAMPIRE | 0 | – | 10 |
| 4 | 106 | WOLF | 0 | – | – |
| 4 | 114 | MUMMY | 7 | – | 8 |
| 5 | 26 | BASILISK | 0 | – | 2 |
| 5 | 31 | TROLL | 0 | – | 2 |
| 5 | 41 | 4TH LVL FIGHTER | 7 | 3 | – |
| 5 | 45 | 1ST LVL THIEF | 7 | 2 | – |
| 5 | 49 | MEDUSA | 0 | – | 3 |
| 5 | 55 | HILL GIANT | 0 | 2 | 1 |
| 5 | 56 | FIRE GIANT | 0 | – | 2 |
| 5 | 60 | GIANT SNAKE | 0 | – | 1 |
| 5 | 66 | TYRANITHRAXUS | 0 | – | 6 |
| 5 | 75 | 6TH LVL FIGHTER | 7 | 3 | – |
| 5 | 84 | 6TH LVL FIGHTER | 7 | 3 | – |
| 5 | 85 | 8TH LVL FIGHTER | 7 | 3 | – |
| 5 | 86 | AL-HYAM DAZID | 7 | 3 | – |
| 5 | 87 | ENVOY | 7 | 2 | – |
| 5 | 88 | GENHEERIS | 7 | 1 | – |
| 5 | 90 | 1ST LVL CLERIC | 0 | 2 | – |
| 5 | 91 | LEVEL 5 CLERIC | 0 | 3 | – |
| 5 | 92 | TYRANITHRAXUS | 7 | 3 | – |
| 5 | 93 | 6TH LVL THIEF | 7 | – | 1 |
| 6 | 10 | QUICKLINGS | 0 | – | – |
| 6 | 41 | 4TH LVL FIGHTER | 7 | 3 | – |
| 6 | 45 | 1ST LVL THIEF | 7 | 2 | – |
| 6 | 48 | DWARVEN FIGHTER | 1 | 3 | – |
| 6 | 50 | COMMANDANT | 7 | 6 | – |
| 6 | 51 | 6TH LVL THIEF | 7 | 2 | – |
| 6 | 53 | AIDES | 7 | 4 | – |
| 6 | 54 | CORPORAL | 7 | – | – |
| 6 | 60 | GIANT SNAKE | 0 | – | 1 |
| 6 | 65 | AHNKHEG | 0 | – | 2 |
| 6 | 67 | CENTAUR | 0 | – | – |
| 6 | 74 | GIANT MANTIS | 0 | – | 1 |
| 6 | 86 | AL-HYAM DAZID | 7 | 3 | – |
| 6 | 96 | GUARD | 7 | 4 | – |
| 6 | 97 | BANDIT | 7 | 5 | – |
| 6 | 99 | BUCCANEER | 7 | – | – |
| 6 | 100 | 3RD LVL FIGHTER | 7 | 4 | – |
| 6 | 101 | 5TH LVL FIGHTER | 7 | – | – |
| 6 | 102 | CAPTAIN | 7 | 5 | – |
| 6 | 118 | THRI-KREEN | 0 | – | 2 |
| 6 | 119 | TIGER | 0 | – | 1 |
| 6 | 120 | WILD BOAR | 0 | – | 1 |
| 7 | 0 | KOBOLD | 0 | 1 | – |
| 7 | 1 | KOBOLD LEADER | 0 | 5 | – |
| 7 | 40 | NOMAD | 7 | 5 | – |
| 7 | 41 | 4TH LVL FIGHTER | 7 | 3 | – |
| 7 | 42 | HASSAD | 7 | 3 | – |
| 7 | 43 | SHAMAN | 7 | 3 | – |
| 7 | 44 | ORC | 0 | 2 | – |
| 7 | 53 | AIDES | 7 | 4 | – |
| 7 | 57 | LIZARDMAN | 0 | – | – |
| 7 | 58 | MUTANT LIZ-MAN  | 0 | – | – |
| 7 | 61 | STIRGE | 0 | – | 1 |
| 7 | 62 | MINOTAUR | 0 | – | – |
| 7 | 68 | DISPLACER BEAST | 0 | – | – |
| 7 | 69 | DRIDER | 2 | 3 | 1 |
| 7 | 75 | 6TH LVL FIGHTER | 7 | 3 | – |
| 7 | 76 | 7TH LVL DW FIGH | 1 | 1 | – |
| 7 | 77 | 7TH LVL THIEF | 7 | 2 | – |
| 7 | 78 | 2ND LVL CLERIC | 0 | – | – |
| 7 | 79 | DIANE | 7 | 1 | – |
| 7 | 80 | 7TH LVL FIGHTER | 1 | 2 | – |
| 7 | 81 | YARASH | 7 | 4 | – |
| 7 | 97 | BANDIT | 7 | 5 | – |
| 7 | 98 | MERCHANT | 7 | 5 | – |
| 7 | 123 | KOBOLD | 0 | 3 | – |
| 8 | 0 | KOBOLD | 0 | 1 | – |
| 8 | 1 | KOBOLD LEADER | 0 | 5 | – |
| 8 | 31 | TROLL | 0 | – | 2 |
| 8 | 32 | NORRIS THE GRAY | 6 | 3 | – |
| 8 | 57 | LIZARDMAN | 0 | – | – |
| 8 | 59 | GIANT LIZARD | 0 | – | – |
| 8 | 62 | MINOTAUR | 0 | – | – |
| 8 | 72 | GHOUL | 0 | – | 2 |
| 8 | 73 | GNOLL | 0 | – | – |
| 8 | 87 | ENVOY | 7 | 2 | – |
| 8 | 94 | LEVEL 3 MU | 7 | 1 | – |
| 8 | 95 | DRYTHH | 0 | – | – |
| 8 | 104 | PRINCESS FATIMA | 7 | 3 | – |
| 8 | 113 | HIPPOGRIFF | 0 | – | – |
| 8 | 116 | PHASE SPIDER | 0 | – | 2 |
| 8 | 120 | WILD BOAR | 0 | – | 1 |
| 8 | 121 | WYVERN | 0 | – | 1 |
| 8 | 124 | EFREETI | 0 | – | 1 |
