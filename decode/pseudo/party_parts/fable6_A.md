# #fable-6 part A — CreateCharacter 7000:07A8..11FF, every statement (fork of por-verify2)

Source: decode/pseudo/party_parts/ov16a.pas.md lines 214..313 vs `python -I decode/ecl/hdis.py ov16 07a4 1204` (decode/listings/ov16.lst). Tables cited in the range re-dumped from decode/bin/START.unpacked.exe (DS 0C7C): RaceClasses 3E17, ClassAligns 3FE7, StartAge 3E5B, BaseThac0 3C7C (level 1 = 40 for all 8 classes), ClassMaskBit 05D6 = 02 10 08 40 80 01 04 20, GenderName 0FEC/7, ClassName 0D38/27, AlignmentName 0F53/17 — all identical to the values in the ov16a header (lines 44..62). TChar offsets checked against SAVES.md (+2Eh race, +2Fh class, +30h age word, +73h level_main, +96h level[0..7], +9Eh gender, +A0h alignment, +B0h class_mask, +2Dh base_thac0, +C0h icon_size). Call signatures: AddEffect COMBAT 9800:0E52 (c, type, duration Word, p3, callOnRemove), Roll(count, sides), NewMenuList(n, var list), ListItem(n, list), VerticalListMenu (VIEW).

## 1. Statements

| line | anchor | verdict | evidence | statement |
|---|---|---|---|---|
| 214 | 7000:07a4 | AGREE | 07A4 mov es:[di+2Eh],al (race +2Eh) | `c^.race := index;` |
| 215 | 7000:07ab | AGREE | 07A8 les p; 07AB al:=+2Eh; cmp 5/1/3/2/4 chain 07AF..08EC, else 0910 | `case c^.race of` |
| 216 | 7000:07b3 | AGREE | 07B6 mov byte +C0h,1 (icon_size) | `5` |
| 217 | 7000:07ce | AGREE | pushes c (bp-2:bp-4), 5Ah, word 0, FFh, 0 = AddEffect(c, type, duration, p3, callOnRemove) COMBAT 9800:0E52 | `AddEffect(c, $5A, 0, $FF, 0);` |
| 218 | 7000:07e5 | AGREE | 61h, 0, FFh, 0; 07EA jmp 0919 | `AddEffect(c, $61, 0, $FF, 0) end;` |
| 219 | 7000:07f1 | AGREE | 07F4 +C0h:=1 | `1` |
| 220 | 7000:080c | AGREE | 5Ah | `AddEffect(c, $5A, 0, $FF, 0);` |
| 221 | 7000:0823 | AGREE | 61h | `AddEffect(c, $61, 0, $FF, 0);` |
| 222 | 7000:083a | AGREE | 1Ah | `AddEffect(c, $1A, 0, $FF, 0);` |
| 223 | 7000:0851 | AGREE | 2Fh; 0856 jmp 0919 | `AddEffect(c, $2F, 0, $FF, 0) end;` |
| 224 | 7000:085d | AGREE | 0860 +C0h:=1 | `3` |
| 225 | 7000:0878 | AGREE | 61h | `AddEffect(c, $61, 0, $FF, 0);` |
| 226 | 7000:088f | AGREE | 12h | `AddEffect(c, $12, 0, $FF, 0);` |
| 227 | 7000:08a6 | AGREE | 2Fh | `AddEffect(c, $2F, 0, $FF, 0);` |
| 228 | 7000:08bd | AGREE | 30h; jmp 0919 | `AddEffect(c, $30, 0, $FF, 0) end;` |
| 229 | 7000:08c8 | AGREE | 08CB +C0h:=2 | `2` |
| 230 | 7000:08e3 | AGREE | 6Bh | `AddEffect(c, $6B, 0, $FF, 0) end;` |
| 231 | 7000:08ee | AGREE | 08F1 +C0h:=2 | `4` |
| 232 | 7000:0909 | AGREE | 7Ch | `AddEffect(c, $7C, 0, $FF, 0) end;` |
| 233 | 7000:0910 | AGREE | 0913 +C0h:=2 (else) | `else            c^.icon_size := 2;` |
| 235 | 7000:091e | AGREE | FreeMenuList(@list [bp-0Ch]) | `FreeMenuList(list);` |
| 238 | 7000:092c | AGREE | push 3, @list = NewMenuList(n, var list) | `NewMenuList(3, list);` |
| 239 | 7000:0934 | AGREE | +29h:=1; StrAssign "Pick Gender" (CS:04FF), max 28h | `list^.isHeader := 1;  list^.text := 'Pick Gender';` |
| 240 | 7000:094c | AGREE | [bp-18h] 0..1, exit test 09A0 cmp 1 | `for k := 0 to 1 do` |
| 241 | 7000:0961 | AGREE | push k+1, list = ListItem(n, list); "  " + DS:0FEC+k*7 (Male/Female, image) | `ListItem(k + 1, list)^.text := '  ' + GenderName[k];` |
| 242 | 7000:09a6 | AGREE | item:=list, index [bp-12h]:=1, [bp-22h]:=1, [bp-23h]:=1 | `item := list;  index := 1;  showExit := true;  redraw := true;` |
| 244 | 7000:0a0b | AGREE | '', '', 0Dh, 0Ah, 0Fh, 1, 2, 26h, 16h, list, showExit, @redraw, @index, @item | `key := VerticalListMenu('', '', $0D, $0A, $0F, 1, 2, $26, $16, list, showExit, redraw, ind` |
| 245 | 7000:0a13 | AGREE | cmp 0 / jmp 1ECE (exit) | `if key = #0 then exit;` |
| 246 | 7000:0a1c | AGREE | cmp 0Dh, jne 09BF | `until key = #13;` |
| 247 | 7000:0a29 | AGREE | 0A22 ax:=index-1; mov +9Eh,al (gender) | `c^.gender := index - 1;` |
| 248 | 7000:0a33 | AGREE | FreeMenuList | `FreeMenuList(list);` |
| 251 | 7000:0a47 | AGREE | DS:3E17 + race*0Ch -> [bp-1Ch] | `n := RaceClasses` |
| 252 | 7000:0a5a | AGREE | push n+1 | `NewMenuList(n + 1, list);` |
| 253 | 7000:0a62 | AGREE | +29h:=1; "Pick Class" CS:050B | `list^.isHeader := 1;  list^.text := 'Pick Class';` |
| 254 | 7000:0a7a | AGREE | 1..n, 0A85 ja (unsigned) skip | `for k := 1 to n do` |
| 255 | 7000:0a9b | AGREE | ListItem(k, list); "  " + DS:0D38 + RaceClasses[race*12+k]*1Bh | `ListItem(k, list)^.text := '  ' + ClassName[RaceClasses[c^.race*12 + k]];` |
| 256 | 7000:0afb | AGREE | item/index/showExit/redraw as gender | `item := list;  index := 1;  showExit := true;  redraw := true;` |
| 258 | 7000:0b60 | AGREE | same pushes as 0A0B | `key := VerticalListMenu('', '', $0D, $0A, $0F, 1, 2, $26, $16, list, showExit, redraw, ind` |
| 259 | 7000:0b68 | AGREE | jmp 1ECE | `if key = #0 then exit;` |
| 260 | 7000:0b71 | AGREE | jne 0B14 | `until key = #13;` |
| 261 | 7000:0b94 | FIXED | 0B77 p:=c (missing); 0B94 DS:3E17[race*12+index] -> +2Fh | `c^.class := RaceClasses[c^.race*12 + index];` |
| 262 | 7000:0ba2 | AGREE | +73h := 1 (level_main) | `c^.level_main := 1;` |
| 263 | 7000:0baa | AGREE | 0BAE cmp 0 jl / cmp 7 jg (signed range) | `case c^.class of` |
| 264 | 7000:0bc3 | AGREE | +96h+class := 1 | `0..7: c^.level[c^.class] := 1;` |
| 265 | 7000:0bd0 | AGREE | 8: +96h, +98h | `8:  begin c^.level[0] := 1; c^.level[2] := 1 end;` |
| 266 | 7000:0be9 | AGREE | 9: +96h, +98h, +9Bh | `9:  begin c^.level[0] := 1; c^.level[2] := 1; c^.level[5] := 1 end;` |
| 267 | 7000:0c0b | AGREE | 10: +96h, +9Ah | `10: begin c^.level[0] := 1; c^.level[4] := 1 end;` |
| 268 | 7000:0c24 | AGREE | 11: +96h, +9Bh | `11: begin c^.level[0] := 1; c^.level[5] := 1 end;` |
| 269 | 7000:0c3d | AGREE | 12: +96h, +9Ch | `12: begin c^.level[0] := 1; c^.level[6] := 1 end;` |
| 270 | 7000:0c55 | AGREE | 13: +98h, +9Bh | `13: begin c^.level[2] := 1; c^.level[5] := 1 end;` |
| 271 | 7000:0c6d | AGREE | 14: +98h, +9Ch | `14: begin c^.level[2] := 1; c^.level[6] := 1 end;` |
| 272 | 7000:0c85 | AGREE | 15: +98h, +9Bh, +9Ch | `15: begin c^.level[2] := 1; c^.level[5] := 1; c^.level[6] := 1 end;` |
| 273 | 7000:0ca6 | AGREE | 16: +9Bh, +9Ch | `16: begin c^.level[5] := 1; c^.level[6] := 1 end;` |
| 275 | 7000:0cb8 | FIXED | 0CBB cmp +9Ch,0 / 0CC1 JLE (signed, annotation missing) -> UpdateThiefSkills(c) 0CC9 | `if c^.level[6] > 0 then UpdateThiefSkills(c);` |
| 276 | 7000:0cce | AGREE | +B0h:=0, +2Dh:=0 | `c^.class_mask := 0;  c^.base_thac0 := 0;` |
| 277 | 7000:0cdf | AGREE | [bp-19h] 0..7, 0D5F cmp 7 | `for cls := 0 to 7 do` |
| 278 | 7000:0cf1 | AGREE | cmp +96h+cls,0 / JLE (signed) | `if c^.level[cls] > 0 then begin` |
| 280 | 7000:0d17 | AGREE | DS:3C7C[cls*0Bh+level] vs +2Dh: JBE (unsigned) skip; 0D49 store | `c^.base_thac0 := BaseThac0[cls*11 + c^.level[cls]];` |
| 281 | 7000:0d53 | AGREE | add +B0h, DS:05D6[cls] | `c^.class_mask := c^.class_mask + ClassMaskBit` |
| 283 | 7000:0d6b | AGREE | UpdateSaves(c) | `UpdateSaves(c);` |
| 284 | 7000:0d75 | AGREE | FreeMenuList | `FreeMenuList(list);` |
| 287 | 7000:0d89 | AGREE | DS:3FE7 + class*0Ah | `n := ClassAligns` |
| 288 | 7000:0d9c | AGREE | push n+1 | `NewMenuList(n + 1, list);` |
| 289 | 7000:0da4 | AGREE | "Pick Alignment" CS:0516 | `list^.isHeader := 1;  list^.text := 'Pick Alignment';` |
| 290 | 7000:0dbc | AGREE | 1..n, ja skip | `for k := 1 to n do` |
| 291 | 7000:0ddd | AGREE | "  " + DS:0F53 + ClassAligns[..]*11h | `ListItem(k, list)^.text := '  ' + AlignmentName[ClassAligns[c^.class*10 + k]];` |
| 292 | 7000:0e3d | AGREE | as gender | `item := list;  index := 1;  showExit := true;  redraw := true;` |
| 294 | 7000:0ea2 | AGREE | same pushes | `key := VerticalListMenu('', '', $0D, $0A, $0F, 1, 2, $26, $16, list, showExit, redraw, ind` |
| 295 | 7000:0eaa | AGREE | jmp 1ECE | `if key = #0 then exit;` |
| 296 | 7000:0eb3 | AGREE | jne 0E56 | `until key = #13;` |
| 297 | 7000:0ecd | AGREE | +A0h := ClassAligns[class*10+index] | `c^.alignment := ClassAligns[c^.class*10 + index];` |
| 298 | 7000:0ede | AGREE | FreeMenuList | `FreeMenuList(list);` |
| 301 | 7000:0ee6 | AGREE | cmp +2Fh,7 / JG (signed) | `if c^.class <= 7 then begin` |
| 302 | 7000:0eef | AGREE | [bp-27h] := DS:3E5B + race*1Ch + class*4 (p's slot) | `a := @StartAge` |
| 303 | 7000:0f26 | AGREE | push [+2] dice, [+3] sides = Roll(count, sides); + word [+0]; -> +30h (age word) | `c^.age := a^.base + Roll(a^.dice, a^.sides);` |
| 304 | 7000:0f49 | FIXED | 0F3D p:=c (missing); cmp 8/9/0Bh/0Ch/0Dh/0Eh/0Fh/10h chain | `end else case c^.class of` |
| 305 | 7000:0f51 | AGREE | 8/9/11/12: word 3E5B+race*1Ch + byte 3E5D * 3E5E (entry 0, cleric) | `8, 9, 11, 12: c^.age := StartAge[race,0].base + StartAge[race,0].dice * StartAge[race,0].s` |
| 306 | 7000:109d | AGREE | 13/15/16: 3E6F + 3E71*3E72 (entry 5, MU) | `13, 15, 16:   c^.age := StartAge[race,5].base + StartAge[race,5].dice * StartAge[race,5].s` |
| 307 | 7000:10f0 | AGREE | 14: 3E63 + 3E65*3E66 (entry 2, fighter); class 10 falls to 11E1 (age stays 0) | `14:           c^.age := StartAge[race,2].base + StartAge[race,2].dice * StartAge[race,2].s` |
| 310 | 7000:11e1 | AGREE | saved [bp-8] := SelectedChar; SelectedChar := c | `saved := SelectedChar;  SelectedChar := c;` |
| 311 | 7000:11fb | AGREE | DrawCharacterSheet (0085:0025 stub) | `DrawCharacterSheet;` |

Counts: 81 anchored statements; AGREE 78, FIXED 3 (annotation / missing alias reload only, no behavioural change). No other asm statement in 07A8..11FF is missing.

## 2. Corrections

1. Line 261, missing statement `p := c` (0B77..0B7D):
   - old: `c^.class := RaceClasses[c^.race*12 + index];                      { 7000:0b94 }`
   - new (two lines):
     `p := c;                                                           { 7000:0b77  [BP-27h] reloaded }`
     `c^.class := RaceClasses[c^.race*12 + index];                      { 7000:0b80  stored via p at 0b9b }`
2. Line 275, signedness annotation (0CBB `CMP byte [DI+9Ch],0` / 0CC1 `JLE`):
   - old: `if c^.level[6] > 0 then UpdateThiefSkills(c);                     { 7000:0cb8 / 0cc9  ov23 e4 }`
   - new: `if ShortInt(c^.level[6]) > 0 then UpdateThiefSkills(c);           { 7000:0cb8 / 0cc9  ov23 e4; JLE = signed }`
3. Line 304, missing statement `p := c` (0F3D..0F43); the <= 7 branch's `a` uses the same slot [BP-27h]:
   - old: `end else case c^.class of                                         { 7000:0f49  multi-class: base + dice*sides (the maximum) }`
   - new (two lines):
     `end else begin p := c;                                            { 7000:0f3d  [BP-27h] := c again (a and p share the slot) }`
     `  case c^.class of                                               { 7000:0f49  multi-class: base + dice*sides (the maximum) }`
   - and line 308 `end;` (the one before the `{ quirk: class 10 ...}` comment) becomes `end end;`.

Note (no change): after a single-class age roll [BP-27h] points into StartAge until 7000:12D0 `p := c` (line 329, already present); no read of p in 11E1..12CF.
