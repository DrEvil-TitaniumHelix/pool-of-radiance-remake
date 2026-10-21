# ENGINE — resident units: startup, DAX loader, pictures/video, text, character support, sound (FINAL pseudocode, lane por-mod-engine)

Units (herdr/assignments/por-areas.md): main_0000, res_00BA, res_03F1, res_042B, res_0464, res_0709, res_0802, res_0899,
res_08AE — 132 exported routines + 5 sound/timer routines missing from the export (08AE), 137 sections.
Evidence = `decode/listings/res_*.lst` and the image bytes (`python decode/ecl/hdis.py rSSSS START END`); `.c` and the codex
draft `ENGINE.draft.md` were used only as a checklist. Screens: `ENGINE_SCREENS.md`. Names: `decode/names/engine_names.json`.

Conventions (as VIEW.pas.md / ECL.pas.md)
- **Signatures in Pascal order**: first parameter = highest BP offset = pushed first; parameters as `name [BP+xx]`. Every call in the bodies was written from its PUSH sequence (first pushed = first argument) — the error class found 7× in the ECL pass; each part re-checked ≥ 5 call orders against the bytes (§Self-check).
- `{ seg:off }` = first instruction of the statement; `{ quirk: ... }` = behaviour a faithful port must copy.
- Globals `g_XXXX` = DS:XXXX (GLOBALS.md) or the name from decode/names/*.json; 08AE switches DS to CS — its private variables are `cs08AE_XXXX`. Data structures by decode/data/*.md (DAX, PICTURES, SAVES TChar/item/effect) and ECL_VM.md.
- Runtime: TP System/Crt/Dos by RT_LEDGER names; **0AF8:1593 = FilePos** (not FileSize; draft finding, confirmed by the DAX directory scan 0802:0860).
- Video modes (`VideoMode`): 0 = CGA 320×200×4 (mode 4), 1 = EGA 320×200×16 planar (mode 0Dh), 2 = 4 bpp packed (Tandy mode 9) — selected by POOL.CFG line 1 (E/T/other); hardware identity of 2: M.
- Production: eight fork workers of this lane wrote one range each from the asm (P main/042B/0899/03F1/08AE, Q 0464 0000..0D70, R1 0D71..1950, R2 1951..end, S 0709, T 0802, U 00BA 0000..1508, V 1509..end) with their own byte re-checks; merged here, global names unified.

---

## main_0000 (0000) — program body

### 0000:0006 MainProgram (H)
`program Pool` — the TP program body; entry point of START.EXE (CS:IP 0000:0006 after EXEPACK). Callers: none (DOS).
Callees: the 47 unit initialisers, InitGameState, ShowTitle, CodeWheelCheck, PartyCreationMenu, SetBackdropColours (ov29), ecl_GameLoop (ov03), TerminateGame.
The bytes at 0000:0000 are the Pascal string `'STING'` (`05 53 54 49 4E 47`) compared below.
```pascal
{ unit initialisation chain, in TP order (System first, then the units in `uses` order) }
System.Init; Crt.Init; FUN_0A31_0000; FUN_08AE_01D2; FUN_0899_013C;    { 0000:0006 .. 001a }
Unit0802_Init; Unit0709Init; Init0464; InitConfiguration;          { 0000:001f .. 002e  042B:00A4 }
ov34_init; FUN_03F1_0367; ov33_init; FUN_03ED_0000; ov32_init; ov31_init; ov30_init;   { 0000:0033 .. 0051 }
FUN_03DA_0000; ov29_init; ov28_init; ov27_init; ov26_init; ov25_init;    { 0000:0056 .. 006f }
UnitInit_00BA; ov24_init; ov23_init; ov22_init; ... ; ov01_init; ov00_init;  { 0000:0074 .. 00f1  overlay inits via stub entry 0 }
{ program body }
InitGameState;                                              { 0000:00fd  new-game / engine initialisation (ov11, M) }
if ParamStr(1) <> 'STING' then begin                    { 0000:0102 }
  ShowTitle;                                            { 0000:011d  title + credits ("scenario created by", "tsr, inc.") }
  CodeWheelCheck;                                            { 0000:0122  code-wheel copy protection }
end;
PartyCreationMenu;                                              { 0000:0127  top-level menu ("Choose a function", "Quit to DOS") }
SetBackdropColours($0B, 0, 7, 6);                       { 0000:0138  SetBackdropColours: pushes 0Bh, 0, 7, 6 }
ecl_GameLoop;                                           { 0000:013d  ecl_GameLoop }
TerminateGame;                                          { 0000:0142  0899:0000 }
Halt(0);                                                { 0000:014c  not reached: TerminateGame halts }
```
`{ quirk: the command-line word STING skips the credits and the code wheel (and enables the debug keys of ReadGameKey). }`

---

---

## res_00BA (00BA) part U — character derived stats, item names, roster / summary display, number strings, ability tables (00BA:0000 .. 00BA:1508)

Conventions as VIEW.pas.md / ECL.pas.md: **Pascal-order signatures** (first parameter = highest BP offset = pushed
first), parameters as `name [BP+xx]`; `{ 00ba:oooo }` = first instruction of the statement. Evidence = asm
(`python decode/ecl/hdis.py r00BA START END`). TChar / item / ITEMS fields by decode/data/SAVES.md names
(`c^.thac0` = `+110h` ...); `ITEMS[t].x` = byte `DS:5582 + t*16 + j` (SAVES.md §ITEMS: j0 slot 5582, j1 hands 5583,
j6 ac_value 5588, j9 dice 558B, j10 sides 558C, j11 dmg_bonus 558D, j14 wflags2 5590). All character/item
parameters are far pointers (`^TChar`, `^TItem`). ENGINE callees in other parts by the draft names: `DrawText`
0709:0626 = `DrawText(col, row, colour, s)` (push order col,row,colour,s — e.g. LoadEclBlock `(0, 18h, 0Fh, ...)` =
bottom row), `DrawWrappedText` 0709:0768 `(x1, y1, x2, y2, colour, clear, s)`, `ClearRectangle` 03F1:0137
`(x1, y1, x2, y2)` (text cells), `FindEffectById` 00BA:2199 = `HasEffect(c, id, var node): Boolean` (push order:
c, id, @node).

### 00BA:0000 RecalcWeaponStats (H)
`procedure RecalcWeaponStats(c [BP+6]: ^TChar)` (retf 4) — callers: RecalcCharacter (00ba:0ed4).
callees: DexMissileAdj, StrToHitAdj, StrDamageAdj.
Sets THAC0 and attack-1 damage from the readied weapon (`readied[0]` = `+CCh`). Nothing happens without a weapon.
```pascal
w := c^.readied[0];                                                  { 00ba:0006 }
if w = nil then Exit;                                                { 00ba:0019 }
t := w^.type;                                                        { 00ba:0024 }
c^.thac0 := c^.base_thac0;                                           { 00ba:002e }
if ITEMS[t].wflags2 and 2 <> 0 then                                  { 00ba:003d }
  c^.thac0 := c^.thac0 + DexMissileAdj(c);                           { 00ba:0052 }
c^.dmg_bonus[1] := ITEMS[t].dmg_bonus;                               { 00ba:0073 }
if ITEMS[t].wflags2 and 4 <> 0 then begin                            { 00ba:008a }
  c^.thac0 := c^.thac0 + StrToHitAdj(c);                             { 00ba:009f }
  c^.dmg_bonus[1] := c^.dmg_bonus[1] + StrDamageAdj(c);              { 00ba:00c0 }
end;
plus := w^.plus;                                                     { 00ba:00e0  ShortInt }
if (ITEMS[t].wflags2 > $7F) and (c^.readied[12] <> nil) then         { 00ba:00ea  bit 7: quarrels at +FCh }
  plus := plus + c^.readied[12]^.plus;                               { 00ba:010b }
if (ITEMS[t].wflags2 and 1 <> 0) and (c^.readied[11] <> nil) then    { 00ba:0123  bit 0: arrows at +F8h }
  plus := plus + c^.readied[11]^.plus;                               { 00ba:0147 }
c^.dmg_bonus[1] := c^.dmg_bonus[1] + plus;                           { 00ba:015f }
if (c^.race = 2) and                                                 { 00ba:0178  Elf }
   (((w^.type > $28) and (w^.type < $2D)) or (w^.type = $25) or (w^.type = $24)) then
  plus := plus + 1;                                                  { 00ba:01aa  elf +1 to hit with these weapon types }
c^.thac0 := c^.thac0 + plus;                                         { 00ba:01ad }
c^.dmg_dice[1]  := ITEMS[t].dice;                                    { 00ba:01c7 }
c^.dmg_sides[1] := ITEMS[t].sides;                                   { 00ba:01de }
```
`{ quirk: the elf bonus is added to THAC0 only (after plus was already added to damage). }`

### 00BA:01FB ArmourMoveLimit (H)
`procedure ArmourMoveLimit(c [BP+0Ah]: ^TChar; item [BP+6]: ^TItem)` (retf 8) — callers: RecalcCharacter (00ba:0f09).
Body armour (slot 2) limits movement by its weight; magical armour (plus ≠ 0) adds 3 when the limit is ≤ 9.
```pascal
if ITEMS[item^.type].slot = 2 then begin                              { 00ba:01fe }
  w := item^.weight;                                                 { 00ba:0214 }
  if w <= 150 then c^.move := c^.base_move                           { 00ba:021b }
  else if (w >= 151) and (w <= 399) then c^.move := 9                { 00ba:0236 }
  else c^.move := 6;                                                 { 00ba:024b }
  if (item^.plus <> 0) and (c^.move <= 9) then                       { 00ba:0254 }
    c^.move := c^.move + 3;                                          { 00ba:0269 }
end;
```
`{ quirk: weight 151..399 → 9, ≥ 400 → 6; magic armour turns 12 into 12 (no change, > 9), 9 → 12, 6 → 9. }`

### 00BA:0282 AddItemAC (H)
`procedure AddItemAC(c [BP+12h]: ^TChar; item [BP+0Eh]: ^TItem; var part [BP+0Ah]: array[0..4] of ShortInt; var magicArmour [BP+6]: Boolean)` (retf 10h)
— callers: RecalcCharacter (00ba:0f23, part = its locals f[0..4], magicArmour = its flag).
```pascal
acv := ITEMS[item^.type].ac_value;                                   { 00ba:0288 }
if acv <= $7F then Exit;                                             { 00ba:029e  not an AC item }
acv := acv and $7F;                                                  { 00ba:02a7 }
slot := ITEMS[item^.type].slot;                                      { 00ba:02af }
if slot = 1 then                                                     { 00ba:02c5  shield }
  part[1] := acv + item^.plus                                        { 00ba:02cb }
else if acv = 0 then begin                                           { 00ba:02e6  protection item (ring, cloak ...) }
  if slot = 9 then begin                                             { 00ba:02ec  ring: only the best one counts }
    if item^.plus > part[3] then part[3] := item^.plus               { 00ba:02f2  signed }
  end else
    part[2] := part[2] + item^.plus;                                 { 00ba:0312 }
  c^.ac_item_bonus := c^.ac_item_bonus + item^.plus2;                { 00ba:032d }
end else if acv + item^.plus > part[4] then begin                    { 00ba:034c  armour: best base AC + plus }
  part[4] := acv + item^.plus;                                       { 00ba:036b }
  if (item^.plus > 0) and (slot = 2) then magicArmour := True;       { 00ba:0383 }
end;
```
`part[]` is in 60−AC units (bigger = better). part[0] = DEX adjustment (set by the caller).

### 00BA:03A0 EncumbranceMoveLimit (H)
`procedure EncumbranceMoveLimit(c [BP+6]: ^TChar)` (retf 4) — callers: RecalcCharacter (00ba:0f8b).
```pascal
e := LongInt(c^.encumbrance) - StrWeightAllowance(c);                { 00ba:03a6  allowance sign-extended }
if e < 0 then e := 0;                                                { 00ba:03c6 (low word) }
if (e >= 0) and (e <= 512) then m := c^.move                         { 00ba:03d4 }
else if (e >= 513) and (e <= 768) then m := 9                        { 00ba:03eb }
else if (e >= 769) and (e <= 1024) then m := 6                       { 00ba:03fb }
else m := 3;                                                         { 00ba:040b }
if m < c^.move then c^.move := m;                                    { 00ba:040f }
```
`{ quirk: only the low word of the longint difference is tested (signed). }`

### 00BA:0442 BuildItemName (H)
`procedure BuildItemName(c [BP+12h]: ^TChar; item [BP+0Eh]: ^TItem; col [BP+0Ch], row [BP+0Ah]: Byte; withReady [BP+8], draw [BP+6]: Boolean)` (retf 10h)
— callers: DrawCharacterSummary, ecl_op27_Treasure (`(SelectedChar, item, 0, 0, 0, 0)`), DrawCharacterSheet/0EF8/14D0/1A8A, Shop, ov39xx ...
Builds `item^.name` (string[40], +00h) from the name words; `c` is not used. String literals at 00ba:042D " Yes  ",
0434 " No   ", 043B "*", 043D " ", 043F "s ".
```pascal
item^.name := '';                                                    { 00ba:0449 }
if withReady then                                                    { 00ba:0450 }
  if item^.readied <> 0 then item^.name := ' Yes  '                  { 00ba:0456 }
  else item^.name := ' No   ';                                       { 00ba:0475 }
detect := False;                                                     { 00ba:0488 }
p := PartyHead;                                                      { 00ba:048c }
while (p <> nil) and not detect do begin                             { 00ba:0499 }
  if HasEffect(p, 5, node) then detect := True;                      { 00ba:04a7  effect 5 = Detect Magic }
  p := p^.next;                                                      { 00ba:04c1 }
end;
if detect and ((item^.plus > 0) or (item^.plus2 > 0) or (item^.magic_flag <> 0)) then   { 00ba:04d6 }
  item^.name := item^.name + '*' + ' ';                              { 00ba:04fa }
if item^.count > 0 then                                              { 00ba:052c }
  item^.name := item^.name + ByteToStr(item^.count) + ' ';           { 00ba:0536 }
shown := 0;                                                          { 00ba:0575  bit k-1 = word k shown }
for k := 1 to 3 do                                                   { 00ba:0579 }
  if (item^.word[k] <> 0) and (((item^.hidden shr (3 - k)) and 1) = 0) then   { 00ba:0582 }
    shown := shown + (1 shl (k - 1));                                { 00ba:05b5 }
plural := False;                                                     { 00ba:05cd }
for k := 3 downto 1 do                                               { 00ba:05d1 }
  if (shown shr (k - 1)) and 1 > 0 then begin                        { 00ba:05da }
    item^.name := item^.name + ItemWord[item^.word[k]];              { 00ba:05f5  ItemWord = string[20] table DS:10A7 + w*21 }
    if (item^.count < 2) or plural then                              { 00ba:0635 }
      item^.name := item^.name + ' '                                 { 00ba:0645 }
    else if ((1 shl (k - 1)) = shown)                                { 00ba:0670  only this word shown }
         or ((k = 1) and (shown > 4) and (item^.type <> $56))        { 00ba:068a }
         or ((k = 2) and not Odd(shown))                             { 00ba:06a0  word 1 not shown: word 2 is last }
         or ((k = 3) and (item^.type = $56))                         { 00ba:06ad }
         or (((item^.type = $49) or (item^.type = $1C)) and (item^.word[3] <> $B1)) then begin  { 00ba:06bd  arrows / quarrels, not "Silver" }
      item^.name := item^.name + 's ';                               { 00ba:06db  plural on the first eligible word }
      plural := True;                                                { 00ba:0703 }
    end else
      item^.name := item^.name + ' ';                                { 00ba:0709 }
  end;
if draw then DrawText(col, row, $0A, item^.name);                    { 00ba:073a }
```
Word order on screen: word[3], word[2], word[1] (e.g. "Long Sword +1" = words +31h "Long", +30h "Sword", +2Fh "+1"
when not hidden). All string assignments are `string[40]` (StrAssign 28h).

### 00BA:0767 DrawPartyRoster (H)
`procedure DrawPartyRoster(sel [BP+6]: ^TChar)` (retf 4) — callers: ~27 (ECL handlers with `SelectedChar`, menus, combat,
camp ...). callees: DrawText, ClearRectangle, DrawCharacterName (00BA:1816), DrawAC, DrawHP.
Strings: 00ba:075B "Name", 0760 "AC  HP".
```pascal
if g_49F3 = 0 then x0 := 1 else x0 := $11;                           { 00ba:076d  roster at col 1 or col 17 }
y := 2;                                                              { 00ba:077e }
DrawText(x0, y, $0F, 'Name');                                        { 00ba:0782 }
DrawText($21, y, $0F, 'AC  HP');                                     { 00ba:07a1  col 33 }
y := y + 2;                                                          { 00ba:07bf }
p := PartyHead;                                                      { 00ba:07c3 }
while p <> nil do begin                                              { 00ba:07d0 }
  ClearRectangle(x0, y, $26, y);                                     { 00ba:07db  clear the line up to col 38 }
  if p = sel then DrawText(x0, y, $0F, p^.name)                      { 00ba:07ef  selected: white }
  else DrawCharacterName(p, x0, y, 0);                               { 00ba:0816 }
  case p^.ac of                                                      { 00ba:082b  right-align AC by digit count }
    $00..$32: dx := 1;                                               {   AC 10..60 }
    $33..$3C: dx := 2;                                               {   AC 0..9 }
    $3D..$45: dx := 1;                                               {   AC -1..-9 }
  else dx := 0;
  end;
  DrawAC(p, $20 + dx, y);                                            { 00ba:0861 }
  case p^.hp of                                                      { 00ba:0878 }
    0..9:   dx := 2;
    10..99: dx := 1;
  else dx := 0;
  end;
  DrawHP(p, $24 + dx, y, False);                                     { 00ba:08a0 }
  y := y + 1;                                                        { 00ba:08ba }
  p := p^.next;                                                      { 00ba:08bd }
end;
ClearRectangle(x0, y, $26, y);                                       { 00ba:08d3  clear the line after the last member }
```
Note: monsters loaded by ECL LOAD_MONSTER are in the same list and are drawn too.

### 00BA:08EF DrawAC (H)
`procedure DrawAC(c [BP+0Ah]: ^TChar; col [BP+8], row [BP+6]: Byte)` (retf 8) — callers: DrawPartyRoster, DrawCharacterSummary, DrawCombatStats.
String 00ba:08ED "-".
```pascal
s := ByteToStr(Abs(c^.ac - 60));                                     { 00ba:08f6  AC = 60 - ac }
if c^.ac > 60 then s := '-' + s;                                     { 00ba:0922 }
DrawText(col, row, $0A, s);                                          { 00ba:0957 }
```

### 00BA:0973 DrawHP (H)
`procedure DrawHP(c [BP+0Ch]: ^TChar; col [BP+0Ah], row [BP+8]: Byte; highlight [BP+6]: Boolean)` (retf 0Ah) — callers: DrawPartyRoster, DrawCharacterSummary, DrawModifyField, DrawCombatStats.
```pascal
if c^.hp < c^.hp_max then colour := $0E else colour := $0A;          { 00ba:097a  yellow when hurt }
if highlight then colour := $0D;                                     { 00ba:0995 }
DrawText(col, row, colour, ByteToStr(c^.hp));                        { 00ba:099f }
```

### 00BA:09E3 DrawCharacterSummary (H)
`procedure DrawCharacterSummary(c [BP+6]: ^TChar)` (retf 4) — callers: combat (ov13_*, FUN_6100_*, FUN_4800_*, AiReadyBestWeapon), EffCoughing.
Strings: 00ba:09C9 " ", 09CB "Hitpoints", 09D5 "AC", 09D8 "(Helpless)". Uses the right panel cols 23..38.
```pascal
ClearRectangle($17, 1, $26, $15);                                    { 00ba:09e9  cols 23..38, rows 1..21 }
y := 1;                                                              { 00ba:09fa }
ShowCharacterMessage(c, ' ', y, 0);                                         { 00ba:09fe  ShowCharacterMessage (part V): name line }
y := y + 1;                                                          { 00ba:0a1e }
DrawText($17, y + 1, $0A, 'Hitpoints');                              { 00ba:0a21  row 3 }
DrawHP(c, $21, y + 1, False);                                        { 00ba:0a42 }
y := y + 2;                                                          { 00ba:0a59 }
DrawText($17, y + 1, $0A, 'AC');                                     { 00ba:0a5d  row 5 }
DrawAC(c, $1A, y + 1);                                               { 00ba:0a7e }
text_Row := y + 1;                                                   { 00ba:0a92 }
if c^.readied[0] <> nil then begin                                   { 00ba:0a9b }
  y := y + 2;                                                        { 00ba:0aaa }
  BuildItemName(c, c^.readied[0], 0, 0, False, False);               { 00ba:0ab2 }
  DrawWrappedText($17, y + 1, $26, y + 3, $0A, True, c^.readied[0]^.name);   { 00ba:0ad5  rows 7..9 }
end;
y := text_Row + 1;                                                   { 00ba:0b00 }
if c^.active = 0 then                                                { 00ba:0b09 }
  DrawText($17, y + 1, $0F, StatusName[c^.status])                   { 00ba:0b14  string[12] table DS:1047 + s*13 }
else if IsHelpless(c) then                                           { 00ba:0b3e }
  DrawText($17, y + 1, $0F, '(Helpless)');                           { 00ba:0b4c }
```
`{ quirk: local [bp-1] := 17h at 00ba:0aae is never read. }` StatusName (image bytes): Okay, Animated, tempgone,
Running, Unconscious, Dying, Dead, Stoned, Gone.

### 00BA:0B73 IsHelpless (M)
`function IsHelpless(c [BP+6]: ^TChar): Boolean` (retf 4) — callers: DrawCharacterSummary, combat (FreeAttacksOnMover/1406/1e16, StepCombatant/08B2, MoveAttack, AiEndTurn).
```pascal
r := False;                                                          { 00ba:0b79 }
for k := 1 to 4 do                                                   { 00ba:0b7d }
  if HasEffect(c, HelplessEffect[k], node) then r := True;           { 00ba:0b86  table DS:286C..286F = 33h 34h 35h 1Fh }
IsHelpless := r;                                                     { 00ba:0baf }
```
Name M: it decides the "(Helpless)" label; which spells effects 1Fh/33h..35h are is the MAGIC lane's.

### 00BA:0BB8 RecalcCharacter (H)
`procedure RecalcCharacter(c [BP+6]: ^TChar)` (retf 4) — callers: ~18 (item/inventory code, training, combat, ecl_op36_AddNpc ...).
callees: DexDefenseAdj, StrToHitAdj, StrDamageAdj, RecalcWeaponStats, ArmourMoveLimit, AddItemAC, EncumbranceMoveLimit.
Locals: `f[0..4]` = bytes [bp-0Dh..bp-9] (AC parts), `magicArmour` [bp-7], `holding` [bp-8] (Bag of Holding readied).
```pascal
for k := 0 to 12 do c^.readied[k] := nil;                            { 00ba:0bbe }
holding := False;                                                    { 00ba:0be6 }
c^.item_count := 0;                                                  { 00ba:0bea }
it := c^.items;                                                      { 00ba:0bf3 }
c^.hands_used := 0;                                                  { 00ba:0c06 }
c^.encumbrance := 0;                                                 { 00ba:0c0f }
g_4846 := 0;                                                         { 00ba:0c19  weight of readied items }
while it <> nil do begin                                             { 00ba:0c1e }
  c^.item_count := c^.item_count + 1;                                { 00ba:0c29 }
  w := it^.weight;                                                   { 00ba:0c31 }
  if it^.count > 0 then w := it^.count * w;                          { 00ba:0c3b }
  c^.encumbrance := c^.encumbrance + w;                              { 00ba:0c54 }
  if it^.readied <> 0 then begin                                     { 00ba:0c5f }
    g_4846 := g_4846 + w;                                            { 00ba:0c6c }
    s := ITEMS[it^.type].slot;                                       { 00ba:0c73 }
    if s <= 8 then c^.readied[s] := it                               { 00ba:0c89 }
    else if s = 9 then                                               { 00ba:0cb3  rings: +F0h, then +F4h }
      if c^.readied[9] <> nil then begin
        if c^.readied[10] = nil then c^.readied[10] := it            { 00ba:0cc6 }
      end else c^.readied[9] := it;                                  { 00ba:0cea }
    if it^.type = $49 then c^.readied[11] := it;                     { 00ba:0cfd  arrows +F8h }
    if it^.type = $1C then c^.readied[12] := it;                     { 00ba:0d1a  quarrels +FCh }
    if it^.word[1] = $BA then holding := True;                       { 00ba:0d37  word BAh = "Holding" }
    c^.hands_used := c^.hands_used + ITEMS[it^.type].hands;          { 00ba:0d45 }
  end;
  it := it^.next;                                                    { 00ba:0d70 }
end;
for k := 0 to 6 do c^.encumbrance := c^.encumbrance + c^.money[k];   { 00ba:0d84  one unit per coin }
for k := 1 to 2 do begin                                             { 00ba:0db3 }
  c^.dmg_dice[k]  := c^.base_dmg_dice[k];                            { 00ba:0dbc  +114h+k := +A2h+k }
  c^.dmg_sides[k] := c^.base_dmg_sides[k];                           { 00ba:0dda }
  c^.dmg_bonus[k] := c^.base_dmg_bonus[k];                           { 00ba:0df8 }
end;
for k := 0 to 4 do f[k] := 0;                                        { 00ba:0e1c }
magicArmour := False;                                                { 00ba:0e35 }
c^.ac_item_bonus := 0;                                               { 00ba:0e39 }
c^.ac := c^.base_ac;                                                 { 00ba:0e42 }
c^.move := c^.base_move;                                             { 00ba:0e52 }
c^.thac0 := c^.base_thac0;                                           { 00ba:0e61 }
f[0] := DexDefenseAdj(c);                                            { 00ba:0e70 }
if c^.readied[0] = nil then begin                                    { 00ba:0e7d  no weapon: STR applies to the natural attack }
  c^.thac0 := c^.thac0 + StrToHitAdj(c);                             { 00ba:0e8c }
  c^.dmg_bonus[1] := c^.dmg_bonus[1] + StrDamageAdj(c);              { 00ba:0ead }
end;
RecalcWeaponStats(c);                                                { 00ba:0ecd }
it := c^.items;                                                      { 00ba:0ed7 }
while it <> nil do begin                                             { 00ba:0eea }
  if it^.readied <> 0 then begin                                     { 00ba:0ef2 }
    ArmourMoveLimit(c, it);                                          { 00ba:0efc }
    AddItemAC(c, it, f, magicArmour);                                { 00ba:0f0c }
  end;
  it := it^.next;                                                    { 00ba:0f26 }
end;
if magicArmour then f[3] := 0;                                       { 00ba:0f39  rings of protection do not stack with magic armour }
if holding then begin                                                { 00ba:0f43 }
  if c^.encumbrance < 5000 then c^.encumbrance := 0                  { 00ba:0f49 }
  else c^.encumbrance := c^.encumbrance - 5000;                      { 00ba:0f61 }
  if c^.encumbrance < g_4846 then c^.encumbrance := g_4846;          { 00ba:0f6b  never below the readied weight }
end;
EncumbranceMoveLimit(c);                                             { 00ba:0f84 }
if f[4] < c^.ac then f[4] := c^.ac;                                  { 00ba:0f8e  base AC if no better armour }
c^.ac := 0;                                                          { 00ba:0fad }
for k := 0 to 4 do c^.ac := c^.ac + f[k];                            { 00ba:0fb6 }
c^.ac_rear := f[4] + f[2] + f[3] - 2;                                { 00ba:0fe5  no shield, no DEX, -2 }
if (c^.level[2] > 0) and (c^.race > 0) then                          { 00ba:1003  fighter level, not a monster }
  c^.fighter_lvl_eff := c^.level[2]                                  { 00ba:1018 }
else c^.fighter_lvl_eff := 1;                                        { 00ba:1029 }
```
`{ quirk: ac_item_bonus (+101h, item plus2) is recomputed but not added to ac here. }`
`{ quirk: the comparison f[4] < ac is signed (cwde) against an unsigned byte. }`

### 00BA:1037 ByteToStr (H)
`function ByteToStr(v [BP+6]: Byte): String` (result ptr [BP+8], retf 2) — ~19 callers.
```pascal
Str(LongInt(v), result);                                             { 00ba:103e  width 0 }
ByteToStr := result;                                                 { 00ba:1059 }
```
### 00BA:1073 WordToStr (H)
`function WordToStr(v [BP+6]: Word): String` (result [BP+8], retf 2) — callers: ecl_op11_Print, ov19_*, DrawLocationTimeStatus ...
```pascal
Str(LongInt(v), result);                                             { 00ba:107a }
```
### 00BA:10AD LongToStr (H)
`function LongToStr(v [BP+6]: LongInt): String` (result [BP+0Ah], retf 4) — caller: DrawCharacterSheet (XP).
```pascal
Str(v, result);                                                      { 00ba:10b4 }
```

### 00BA:10E6 DexDefenseAdj (H)
`function DexDefenseAdj(c [BP+6]: ^TChar): ShortInt` (retf 4) — caller: RecalcCharacter. AC adjustment in 60−AC units (AD&D DEX defensive table, sign = better).
```pascal
case c^.dex of                                                       { 00ba:10ec }
  1..3:   r := -4;
  4..6:   r := c^.dex - 7;                                           { -3..-1 }
  15..18: r := c^.dex - 14;                                          { +1..+4 }
  19..20: r := 4;
  21..23: r := 5;
  24..25: r := 6;
else r := 0;
end;
```

### 00BA:1168 DexMissileAdj (M)
`function DexMissileAdj(c [BP+6]: ^TChar): ShortInt` (retf 4) — callers: RecalcWeaponStats (weapons with wflags2 bit 1), StartCombatRound (missile combat).
```pascal
case c^.dex of                                                       { 00ba:116e }
  0..2:   r := -4;
  3..5:   r := c^.dex - 6;                                           { -3..-1 }
  16..18: r := c^.dex - 15;                                          { +1..+3 }
  19..20: r := 3;
  21..23: r := 4;
  24..25: r := 5;
else r := 0;
end;
```
Name M: AD&D "reaction/attacking adjustment" table; "missile" from the ov13 caller.

### 00BA:11EA StrengthIndex (H)
`function StrengthIndex(c [BP+6]: ^TChar): Byte` (retf 4) — callers: StrToHitAdj, StrDamageAdj, StrWeightAllowance.
```pascal
if c^.str <= 17 then r := c^.str                                     { 00ba:11f3 }
else if c^.str = 18 then                                             { 00ba:120b }
  case c^.str_exc of
    0:      r := 18;
    1..50:  r := 19;
    51..75: r := 20;
    76..90: r := 21;
    91..99: r := 22;
    100:    r := 23;                                                 { 18/00 }
  end                                                                { other str_exc: r unassigned }
else if (c^.str >= 19) and (c^.str <= 25) then r := c^.str + 5;      { 00ba:1262  24..30 }
```
`{ quirk: STR > 25 or str_exc > 100 leave r uninitialised (stack garbage). }`

### 00BA:1282 StrToHitAdj (H)
`function StrToHitAdj(c [BP+6]: ^TChar): ShortInt` (retf 4) — callers: RecalcWeaponStats, RecalcCharacter.
```pascal
r := 0;                                                              { 00ba:1288 }
i := StrengthIndex(c);                                               { 00ba:128c }
if c^.unk_AA <> 0 then                                               { 00ba:1299  +AAh (1 in saves): STR bonuses apply }
  case i of
    1..3:   r := -3;
    4..5:   r := -2;
    6..7:   r := -1;
    17..19: r := 1;                                                  { 17, 18, 18/01-50 }
    20..22: r := 2;                                                  { 18/51-99 }
    23..25: r := 3;                                                  { 18/00, 19, 20 }
    26..27: r := 4;
    28..30: r := i - 23;                                             { 5..7 }
  end;
```

### 00BA:1325 StrDamageAdj (H)
`function StrDamageAdj(c [BP+6]: ^TChar): ShortInt` (retf 4) — callers: RecalcWeaponStats, RecalcCharacter.
```pascal
r := 0;                                                              { 00ba:132b }
i := StrengthIndex(c);                                               { 00ba:132f }
if c^.unk_AA <> 0 then                                               { 00ba:133c }
  case i of
    1..2:   r := -2;
    3..5:   r := -1;
    16:     r := 1;
    17..19: r := i - 16;                                             { 1..3 }
    20..29: r := i - 17;                                             { 3..12 }
    30:     r := 14;
  end;
```

### 00BA:13AB StrWeightAllowance (H)
`function StrWeightAllowance(c [BP+6]: ^TChar): Integer` (retf 4) — callers: EncumbranceMoveLimit, MaxCarryWeight, ItemOverloads.
```pascal
case StrengthIndex(c) of                                             { 00ba:13b1 }
  1..3:   r := -350;
  4..5:   r := -250;
  6..7:   r := -150;
  12..13: r := 100;
  14..15: r := 200;
  16:     r := 350;
  17..21: r := (i - 17) * 250 + 500;                                 { 500..1500 }
  22..26: r := (i - 22) * 1000 + 2000;                               { 2000..6000 }
  27:     r := 7500;
  28..30: r := (i - 28) * 3000 + 9000;                               { 9000..15000 }
else r := 0;
end;
```

### 00BA:148B ForgetMemorizedSpell (M)
`procedure ForgetMemorizedSpell(id [BP+6]: Byte)` (retf 2) — callers: ShowAttackResult, CastSpell, DamageCharacter (spell casting).
Clears the first memorised slot of SelectedChar holding spell `id`.
```pascal
k := 0;                                                              { 00ba:1491 }
while k <= 20 do begin                                               { 00ba:1495 }
  if SelectedChar^.mem_spell[k] = id then begin                      { 00ba:149b  +17h+k }
    SelectedChar^.mem_spell[k] := 0;                                 { 00ba:14af }
    k := 21;                                                         { 00ba:14bf  exit after the first match }
  end;
  k := k + 1;                                                        { 00ba:14c3 }
end;
```
Strings following (00ba:14CE.., used by part V's 1509): "Nil Item pointer...", "Tried to Lose item & couldn't find it!".

## res_00BA (00BA) part V — items, messages, combat animation, damage, status line, party picker (00BA:1509 .. 00BA:30A2)

Conventions as VIEW.pas.md: **Pascal-order signatures** (first parameter = highest BP offset = pushed first), `{ 00ba:oooo }`
= first instruction of the statement. Every call's argument order below was derived from its PUSH sequence (first
push = first argument). Character fields by SAVES.md TChar names (`c^.items` = +C8h, `c^.next` = +104h, `c^.combatant`
= +108h, `status` +10Ch, `active` +10Dh, `side` +10Eh (combat side, 0 = party; M), `hp` +11Bh, `hp_max` +32h);
item fields by SAVES.md item names (`next` +2Ah, `type` +2Eh); ITEMS type table = `g_5582[type*16 + j]`.
Callee names: VIEW lane (decode/names/view_names.json) for ov25/ov26/ov27/ov28/ov30/ov31; other ENGINE routines by the
ENGINE draft names (parts P/Q/R/S/T own them): `DrawText 0709:0626(col, row, colour, s)`, `DrawWrappedText 0709:0768(x1, y1, x2, y2, colour, clear, s)`,
`MessageDelay 0709:0DBE`, `ShowBottomPromptAndReadKey 0709:0BF5(colour, s)` (colour is pushed first, 00ba:1517), `DrawFrame 03F1:0000`, `ClearRectangle 03F1:0137(x1, y1, x2, y2)`,
`DrawTitledFrame 03F1:02E8(x1, y1, x2, y2, a, colour, title)`, `DrawPartyRoster 00BA:0767(c)`, `ByteToDecimalString 00BA:1037`,
`WordToDecimalString 00BA:1073`, `AllocatePicture 0464:248E`, `MirrorPicture 0464:15C7`, `FreePicture 0464:2595`,
`DrawClippedPicture 0464:0D71`, `PresentDirtyRows 0464:1B52`, `PlayOrStopSound 08AE:00DC`, `SetSoundTimerMode 08AE:01A5`.
`g_49F3` = game mode byte (5 = combat, 2 = camping, SAVES.md "mode/state", M).

### 00BA:1509 LoseItem (H)
`procedure LoseItem(c: ^TChar [BP+0Ah]; item: ^TItem [BP+6])` (retf 8) — callers: LoseItemsChance (ov07), EffSpiritualHammer, Attack, ItemsMenu/1A8A, UseScrollSpell, FUN_7F00_*.
Unlinks `item` from `c^.items` and frees it (3Fh bytes). Name from its own error texts.
```pascal
if item = nil then begin                                             { 00ba:150f }
  ShowBottomPromptAndReadKey($0E, 'Nil Item pointer...');            { 00ba:1529 }
  exit                                                               { 00ba:152e }
end;
p := c^.items;                                                       { 00ba:1531 }
if p = item then                                                     { 00ba:1544 }
  c^.items := item^.next                                             { 00ba:1554  first in list: unlink head, then free below }
else begin
  while (p <> nil) and (p^.next <> item) do p := p^.next;            { 00ba:156e }
  if p = nil then begin                                              { 00ba:159e }
    ShowBottomPromptAndReadKey($0E, 'Tried to Lose item & couldn''t find it!');  { 00ba:15b8 }
    exit
  end;
  p^.next := item^.next;                                             { 00ba:15bf }
end;
{ quirk: the head case jumps to 159E with p = item (non-nil), so it also runs 15BF: item^.next := item^.next }
item^.next := nil;                                                   { 00ba:15d5 }
FreeMem(item, $3F);                                                  { 00ba:15ec }
```

### 00BA:15F7 AppendItemCopy (H)
`procedure AppendItemCopy(c: ^TChar [BP+0Ah]; item: ^TItem [BP+6])` (retf 8) — callers: EffSpiritualHammer, TradeItem.
```pascal
GetMem(n, $3F);                                                      { 00ba:1601 }
Move(item^, n^, $3F);                                                { 00ba:161a }
n^.next := nil;                                                      { 00ba:161f }
p := c^.items;                                                       { 00ba:162c }
if p = nil then c^.items := n                                        { 00ba:163f }
else begin
  while p^.next <> nil do p := p^.next;                              { 00ba:165c }
  p^.next := n                                                       { 00ba:167c }
end;
```

### 00BA:1693 ShowTimedBottomMessage (H)
`procedure ShowTimedBottomMessage(s: string[40] [BP+6])` (retf 4) — 40+ callers (all game areas).
```pascal
ClearRectangle(0, $18, $27, $18);                                    { 00ba:16b8  menu line, row 24 }
DrawText(0, $18, $0A, s);                                            { 00ba:16cb }
MessageDelay;                                                        { 00ba:16d0 }
ClearRectangle(0, $18, $27, $18);                                    { 00ba:16e1 }
```

### 00BA:16EC ShowCharacterMessage (H)
`procedure ShowCharacterMessage(c: ^TChar [BP+0Eh]; s: string [BP+0Ah]; combatRow [BP+8]: Byte; wait [BP+6]: Boolean)` (retf 0Ch) — callers: very many (spells, combat, healing, ...).
Prints "<name>" then the message under it; in combat in the right-hand panel at `combatRow`, otherwise in the text window.
```pascal
t := s;                                                              { 00ba:1702  string[255] copy }
if g_49F3 = 5 then begin                                             { 00ba:1707  combat }
  ClearRectangle($17, combatRow, $26, $15);                          { 00ba:171b }
  DrawCharacterName(c, $17, combatRow, false);                       { 00ba:1731 }
  DrawWrappedText($17, combatRow + 1, $26, $15, $0A, 1, t);          { 00ba:1750 }
end else begin
  if g_6DDA <> 0 then row := $12                                     { 00ba:1757 }
  else begin
    row := $11;                                                      { 00ba:1765 }
    DrawFrame(1, row, $26, $16, 0);                                  { 00ba:177b }
  end;
  ClearRectangle(1, row, $26, $16);                                  { 00ba:178e }
  DrawCharacterName(c, 1, row + 1, false);                           { 00ba:17a8 }
  DrawWrappedText(1, row + 2, $26, $16, $0A, 1, t);                  { 00ba:17c9 }
end;
if wait then begin                                                   { 00ba:17ce }
  MessageDelay;                                                      { 00ba:17d4 }
  ClearCharacterMessage;                                             { 00ba:17da }
end;
```
`g_6DDA`: DS byte (direct `[6DDA]`), a layout flag: text window starts one row lower (role L).

### 00BA:17E3 ClearCharacterMessage (H)
`procedure ClearCharacterMessage`
```pascal
if g_49F3 = 5 then ClearRectangle($17, $0A, $26, $15)                { 00ba:17e6 }
else ClearRectangle(1, $12, $26, $16);                               { 00ba:180c }
```

### 00BA:1816 DrawCharacterName (H)
`procedure DrawCharacterName(c: ^TChar [BP+0Ch]; col [BP+0Ah], row [BP+8]: Byte; possessive [BP+6]: Boolean)` (retf 0Ah) — callers: DrawPartyRoster, ShowCharacterMessage, ov19, ov21, ov22, ...
The byte at 00BA:1813 is the literal `'s` (string[2]).
```pascal
if c^.active = 0 then colour := $0C                                  { 00ba:181c  inactive: light red }
else if c^.side = 1 then colour := $0E                               { 00ba:182d  side 1: yellow }
else colour := $0B;                                                  { 00ba:183e  party: light cyan }
DrawText(col, row, colour, c^.name);                                 { 00ba:1853 }
if possessive then
  DrawText(col + Length(c^.name), row, colour, '''s');              { 00ba:1887 }
```

### 00BA:1892 CopyCombatAnimationFrame (M)
`procedure CopyCombatAnimationFrame(icon [BP+0Ch], part [BP+0Ah], frame [BP+8]: Byte; mirror [BP+6]: Boolean)` (retf 8) — callers: BuildFourAnimationFrames, MissileAnim, SelectTarget.
Copies picture `CombatIcons[icon, part]` (`g_5E5A + icon*8 + part*4`, far pointers) into frame `frame` of the animation picture `g_6E36^`, optionally mirrored.
```pascal
size := g_6E36^.w[$11];                                              { 00ba:1898  bytes per frame (picture header +11h) }
size2 := size;                                                       { 00ba:18a6 }
if VideoMode = 1 then size2 := size2 shr 2;                          { 00ba:18a9  g_4A1E }
if mirror then begin                                                 { 00ba:18ba }
  AllocatePicture($18, 3, 1, 1, tmp);                                { 00ba:18d6 }
  MirrorPicture(CombatIcons[icon, part], tmp);                       { 00ba:1901 }
  Move(tmp^.data[$17], g_6E36^.data[$17 + frame*size], size);        { 00ba:1926 }
  Move(tmp^.plane2^, g_6E36^.plane2^[frame*size2], size2);           { 00ba:194b  far pointer at picture +13h }
  FreePicture(tmp);                                                  { 00ba:1955 }
end else begin
  Move(CombatIcons[icon, part]^.data[$17], g_6E36^.data[$17 + frame*size], size);       { 00ba:1995 }
  Move(CombatIcons[icon, part]^.plane2^, g_6E36^.plane2^[frame*size2], size2);          { 00ba:19d3 }
end;
```

### 00BA:19DE BuildFourAnimationFrames (M)
`procedure BuildFourAnimationFrames(icon [BP+6]: Byte)` — callers: ShowCombatMessageAnimation, ov12, ov22, MissileAnim, FUN_8E00_*.
```pascal
CopyCombatAnimationFrame(icon, 0, 0, false);                         { 00ba:19ef }
CopyCombatAnimationFrame(icon, 0, 1, true);                          { 00ba:1a00 }
CopyCombatAnimationFrame(icon, 1, 2, true);                          { 00ba:1a11 }
CopyCombatAnimationFrame(icon, 1, 3, false);                         { 00ba:1a22 }
```

### 00BA:1A29 AnimateAlongPath (M)
`procedure AnimateAlongPath(x0 [BP+10h], y0 [BP+0Eh], x1 [BP+0Ch], y1 [BP+0Ah]: ShortInt; frames [BP+8], delay [BP+6]: Byte)` (retf 0Ch) — callers: ov12 (spells), ov22, MissileAnim/3389 (missiles), LightningBolt.
Moves the 4-frame animation `g_6E36^` over the combat map from square (x0,y0) to (x1,y1) in steps of 1/3 square, scrolling the 7×7 window (`cm_Map^.x0/y0` = bytes +2/+3 = window origin) when needed. `TLine` = the VIEW Bresenham record (words x0,y0,x1,y1 at +0..+7, last step direction at +19h).
```pascal
FillChar(path, $94, 8);                                              { 00ba:1a4b  148 direction bytes, 8 = none }
FillChar(L, $1A, 0);                                                 { 00ba:1a5d }
n := 0;  frame := 0;                                                 { 00ba:1a62 }
L.x0 := x0*3;  L.y0 := y0*3;  L.x1 := x1*3;  L.y1 := y1*3;           { 00ba:1a6c  in thirds of a square }
LineInit(L);                                                         { 00ba:1aaa }
repeat
  more := LineStep(L);                                               { 00ba:1ab5 }
  path[n] := L.dir;  n := n + 1;                                     { 00ba:1ac5 }
until not more;                                                      { 00ba:1ad9 }
count := n;                                                          { 00ba:1ae0 }
if count < 2 then exit;                                              { 00ba:1ae8 }
dx := x1 - x0;  dy := y1 - y0;                                       { 00ba:1af2 }
if InWindow(x0 - cm_Map^.x0, y0 - cm_Map^.y0) and InWindow(x1 - cm_Map^.x0, y1 - cm_Map^.y0) then begin   { 00ba:1b36 / 1b63 }
  stay := true;  cx := cm_Map^.x0 + 3;  cy := cm_Map^.y0 + 3         { 00ba:1be6  both ends visible: keep window }
end else if (Abs(dx) <= 6) and (Abs(dy) <= 6) then begin             { 00ba:1b6c }
  stay := true;  cx := x0 + dx div 2;  cy := y0 + dy div 2           { 00ba:1b8a  centre on the midpoint }
end else begin
  stay := false;  cx := cm_Map^.x0 + 3;  cy := cm_Map^.y0 + 3        { 00ba:1bbf }
end;
FocusSquare(cx, cy, $FF, 8);                                         { 00ba:1c1b }
i := 0;  fx := 0;  fy := 0;                                          { 00ba:1c20 }
repeat                                                               { 00ba:1c2f  one screenful }
  px := (x0 - cm_Map^.x0)*3 + fx;  py := (y0 - cm_Map^.y0)*3 + fy;   { 00ba:1c2f }
  sx0 := x0;  sy0 := y0;  off := false;                              { 00ba:1c77 }
  repeat
    if (delay > 0) or (px mod 3 = 0) or (py mod 3 = 0) then begin    { 00ba:1c8a  draw on whole squares when delay = 0 }
      DrawClippedPicture(px, py, frame, 5, g_6E36, g_4A20);          { 00ba:1cd4  animation frame into the view picture }
      PresentDirtyRows;                                              { 00ba:1cd9 }
      Delay(delay);                                                  { 00ba:1ce4  Crt.Delay }
      DrawClippedPicture(px, py, 0, 0, g_4A24, g_4A20);              { 00ba:1d0b  restore background }
      frame := frame + 1;  if frame >= frames then frame := 0;       { 00ba:1d10 }
    end;
    i := i + 1;                                                      { 00ba:1d22 }
    ddx := g_2736[path[i]];  ddy := g_273F[path[i]];                 { 00ba:1d26  step tables dx/dy (VIEW) }
    px := px + ddx;  py := py + ddy;                                 { 00ba:1d56 }
    if (px < 0) or (px > $12) or (py < 0) or (py > $12) then off := true;   { 00ba:1d66  left the 7×7 window }
    if not off and (i < count) then begin                            { 00ba:1d87 }
      fx := fx + ddx;  fy := fy + ddy;                               { 00ba:1d98 }
      if Abs(fx) = 3 then begin x0 := x0 + Sign(fx); cx := cx + Sign(fx); fx := 0 end;   { 00ba:1da8 }
      if Abs(fy) = 3 then begin y0 := y0 + Sign(fy); cy := cy + Sign(fy); fy := 0 end;   { 00ba:1dd9 }
    end;
  until (i >= count) or off;                                         { 00ba:1e0a }
  if i < count then begin                                            { 00ba:1e1e  scrolled off: re-centre }
    if Sign(sx0 - x0) <> 0 then                                      { 00ba:1e2b }
      if x0 >= cm_Map^.x0 + 6 then cx := x0 + 3                      { 00ba:1e60 }
      else if x0 <= cm_Map^.x0 then cx := x0 - 3;                    { 00ba:1e83 }
    if Sign(sy0 - y0) <> 0 then                                      { 00ba:1e9b }
      if y0 >= cm_Map^.y0 + 6 then cy := y0 + 3                      { 00ba:1ea2 }
      else if y0 <= cm_Map^.y0 then cy := y0 - 3;                    { 00ba:1ec5 }
    FocusSquare(cx, cy, $FF, 8);                                     { 00ba:1eed }
  end else begin                                                     { 00ba:1ef5  arrived }
    stay := true;
    if not InWindow(x1 - cm_Map^.x0, y1 - cm_Map^.y0) then FocusSquare(x1, y1, 3, 8);   { 00ba:1f1e / 1f35 }
    px := (x1 - cm_Map^.x0)*3;  py := (y1 - cm_Map^.y0)*3;           { 00ba:1f3a }
    DrawClippedPicture(px, py, frame, 5, g_6E36, g_4A20);            { 00ba:1f94 }
    if delay > 0 then begin                                          { 00ba:1f99 }
      PresentDirtyRows;  Delay(delay);                               { 00ba:1f9f }
      DrawClippedPicture(px, py, 0, 0, g_4A24, g_4A20);              { 00ba:1fd1 }
    end;
  end;
until stay;                                                          { 00ba:1fd6 }
PresentDirtyRows;                                                    { 00ba:1fe0 }
{ quirk: when `stay` was already true at the start and the animation leaves the window, the loop ends at once —
  the rest of the path is not shown. With delay = 0 the final frame stays drawn (no restore). }
```

### 00BA:1FEB ShowCombatMessageAnimation (M)
`procedure ShowCombatMessageAnimation(c: ^TChar [BP+0Ch]; spell [BP+0Ah]: Boolean; s: string[40] [BP+6])` (retf 0Ah) — callers: TurnUndead, ov22 (spells), DamageCharacter/1656, ParalyzeOpponent.
Outside combat only the message; in combat a 4-frame sparkle over the combatant with sound. Name M (behaviour).
```pascal
t := s;                                                              { 00ba:1fff }
if g_49F3 = 5 then begin                                             { 00ba:2004 }
  SetSoundTimerMode(0);                                              { 00ba:2011 }
  if spell then icon := $16 else icon := $17;                        { 00ba:2016 }
  BuildFourAnimationFrames(icon);                                    { 00ba:202b }
  if not IsVisible(c, true) then                                     { 00ba:2037 }
    FocusSquare(CombatantCol(c), CombatantRow(c), 3, 8);             { 00ba:205e }
  if spell then PlayOrStopSound(g_261C) else PlayOrStopSound(g_261A);   { 00ba:206d / 2078 }
  ShowCharacterMessage(c, t, $0A, false);                            { 00ba:208f }
  if spell then reps := g_49E2 else reps := 0;                       { 00ba:2092 }
  k := CombatantIndex(c);                                            { 00ba:20aa }
  px := cb_ScrCol[k]*3;  py := cb_ScrRow[k]*3;                       { 00ba:20b3 / 20d0 }
  for r := 0 to reps do                                              { 00ba:20e4 }
    for f := 0 to 3 do begin                                         { 00ba:20f3 }
      DrawClippedPicture(px, py, f, 5, g_6E36, g_4A20);              { 00ba:211d }
      PresentDirtyRows;                                              { 00ba:2122 }
      Delay(70);                                                     { 00ba:212b }
      DrawClippedPicture(px, py, 0, 0, g_4A24, g_4A20);              { 00ba:2150 }
    end;
  SetSoundTimerMode(10);                                             { 00ba:2167 }
  PresentDirtyRows;                                                  { 00ba:216c }
  if reps = 0 then MessageDelay;                                     { 00ba:2171 }
end else
  ShowCharacterMessage(c, t, $0A, true);                             { 00ba:2190 }
```

### 00BA:2199 HasEffect (H)
`function HasEffect(c: ^TChar [BP+0Ch]; id [BP+0Ah]: Byte; var e: ^TEffect [BP+6]): Boolean` (retf 0Ah) — 30+ callers (SAVES.md "HasEffect").
```pascal
found := false;                                                      { 00ba:219f }
e := c^.effects;                                                     { 00ba:21a3  +7Fh }
while (e <> nil) and not found do                                    { 00ba:21b9 }
  if e^.type = id then found := true                                 { 00ba:21cb }
  else e := e^.next;                                                 { 00ba:21df  effect +5 }
HasEffect := found;                                                  { 00ba:21f9  e = the effect when found }
```

### 00BA:2228 ApplyDamage (H)
`procedure ApplyDamage(c: ^TChar [BP+8]; dmg [BP+6]: Byte)` (retf 6) — callers: ApplyEclDamage (ov07), ShowAttackResult (melee), DamageCharacter.
The 32-byte set constant at 00BA:2208 is `[0, 1]` (statuses Okay, Animated).
```pascal
over := 0;  left := 0;                                               { 00ba:222e }
if c^.hp >= dmg then left := c^.hp - dmg                             { 00ba:2236 }
else over := dmg - c^.hp;                                            { 00ba:225b }
if (over > 9) or ((left = 0) and (c^.status = 1)) then               { 00ba:2271 }
  c^.status := 6                                                     { 00ba:2288  Dead (animated dead at 0 hp) }
else if over > 0 then begin                                          { 00ba:2293 }
  c^.status := 5;                                                    { 00ba:2299  Dying }
  if g_49F3 = 5 then c^.combatant^.b[$0E] := over;                   { 00ba:22a2  bleeding counter (M) }
end else if left = 0 then
  c^.status := 4;                                                    { 00ba:22c0  Unconscious }
if c^.status in [0, 1] then                                          { 00ba:22d7 }
  c^.hp := left                                                      { 00ba:2315 }
else begin
  c^.active := 0;                                                    { 00ba:22de }
  c^.hp := 0;                                                        { 00ba:22e7 }
  if g_49F3 = 5 then begin                                           { 00ba:22f0 }
    Dec(g_6814[c^.side]);                                            { 00ba:2302  active combatants per side }
    c^.combatant^.b[3] := 0;                                         { 00ba:2309 }
  end;
end;
{ quirk: a status other than 0..1 that was already set before (e.g. 7 Stoned) and is not changed above also
  clears hp and active. }
```

### 00BA:234A ShowHealingResult (H)
`procedure ShowHealingResult(c: ^TChar [BP+6])` (retf 4) — callers: EffSlowHeal, EffRegenerate, Spell_CureLightWounds.
```pascal
if c^.hp = c^.hp_max then s := 'is fully healed'                    { 00ba:2350 }
else s := 'is partially healed';                                     { 00ba:2376 }
ShowCharacterMessage(c, s, $0A, true);                               { 00ba:239b }
if g_49F3 <> 5 then DrawPartyRoster(SelectedChar);                   { 00ba:239e }
```

### 00BA:23B7 IsSideZero (H)
`function IsSideZero(c: ^TChar [BP+6]): Boolean` := `c^.side = 0` `{ 00ba:23bd }`.

### 00BA:23DB CountActiveSides (H)
`procedure CountActiveSides` — callers: CombatMain, EffCharm, ov13, ReviveCombatant, EndOfRound, DeployParty.
```pascal
g_6814 := 0;  g_6815 := 0;                                           { 00ba:23e1  count[side 0], count[side 1] }
c := PartyHead;                                                      { 00ba:23eb }
while c <> nil do begin                                              { 00ba:23f8 }
  if c^.active <> 0 then Inc(g_6814[c^.side]);                       { 00ba:2400 }
  c := c^.next;                                                      { 00ba:241a }
end;
```

### 00BA:2433 CollectOppositeSideTargets (M)
`function CollectOppositeSideTargets(c: ^TChar [BP+8]; range [BP+6]: Byte): Byte` (retf 6) — callers: ov13 (combat AI), FUN_4D00_*, FUN_6100_*, ApplyToSide.
Builds the target list around c and keeps only combatants whose side equals `IsSideZero(c)` (i.e. the other side when sides are 0/1).
```pascal
BuildTargetList(CombatantCol(c), CombatantRow(c), range, $FF, CombatantSize(c), cm_Map);   { 00ba:246e }
n := tg_Count;  kept := 0;                                           { 00ba:2473 }
if n > 0 then begin                                                  { 00ba:247d }
  for i := 1 to n do                                                 { 00ba:248c }
    if cb_Char[tg_List[i].idx]^.side = Ord(IsSideZero(c)) then begin { 00ba:24a2 / 24c9 }
      kept := kept + 1;                                              { 00ba:24cd }
      Move(tg_List[i], tg_List[kept], 3);                            { 00ba:24fa  3-byte entries }
    end;
  n := kept;  tg_Count := kept;                                      { 00ba:2507 }
end;
for i := 1 to n do g_6DE4[i] := tg_List[i].idx;                      { 00ba:251f  DS byte array g_6DE4[1..n] (target indices for the caller, M) }
CollectOppositeSideTargets := n;                                     { 00ba:2552 }
```

### 00BA:255B TargetDistance (M)
`function TargetDistance(c: ^TChar [BP+0Ah]; target: ^TChar [BP+6]): Byte` (retf 8) — callers: EffSpitAcid, FighterSweep, AiMoveAttack, AvoidRangedAttack, FUN_6100_*.
```pascal
Move(g_671B, save, $D8);                                             { 00ba:2571  save the target list }
cm_Map^.b[6] := 1;                                                   { 00ba:2576  flag for BuildTargetList (M) }
BuildTargetList(CombatantCol(c), CombatantRow(c), $FF, $FF, CombatantSize(c), cm_Map);   { 00ba:25b2 }
cm_Map^.b[6] := 0;                                                   { 00ba:25b7 }
i := 1;                                                              { 00ba:25c0 }
while (cb_Char[tg_List[i].idx] <> target) and (i < tg_Count) do i := i + 1;   { 00ba:25c5 }
d := tg_List[i].dist shr 1;                                          { 00ba:2601  entry byte 1 }
Move(save, g_671B, $D8);                                             { 00ba:2629 }
TargetDistance := d;
{ quirk: target not found → the last entry's distance }
```

### 00BA:2637 ClearCombatantActionFlags (M)
`function ClearCombatantActionFlags(c: ^TChar [BP+6]): Boolean` (retf 4) — 25 callers (combat, spells).
```pascal
c^.combatant^.b[3] := 0;  c^.combatant^.b[0] := 0;                   { 00ba:263d }
c^.combatant^.b[7] := 0;  c^.combatant^.b[6] := 0;                   { 00ba:2656 }
ClearCombatantActionFlags := true;                                   { 00ba:2670 }
```

### 00BA:2686 SetGuarding (H)
`function SetGuarding(c: ^TChar [BP+6]): Boolean` (retf 4) — callers: DoneMenu, AiEndTurn. String "Guarding" at 00BA:267D.
```pascal
r := ClearCombatantActionFlags(c);                                   { 00ba:2693 }
c^.combatant^.b[7] := 1;                                             { 00ba:2699  guarding }
ShowTimedBottomMessage('Guarding');                                  { 00ba:26b6 }
SetGuarding := r;
```

### 00BA:26C2 SpellCasterLevel (M)
`function SpellCasterLevel(spell [BP+6]: Byte): Byte` (retf 2) — callers: ov22 (magic), MagicResistance, FUN_8E00_*.
Spell table `g_31FA[spell*16]` byte 0 = caster class (SAVES.md: 0 cleric, 1 magic-user).
```pascal
case g_31FA[spell*16] of                                             { 00ba:26c8 }
  0: lvl := SelectedChar^.level[0];                                  { 00ba:26db  cleric }
  1: lvl := SelectedChar^.level[5];                                  { 00ba:26ed  magic-user }
  2: lvl := $0C;                                                     { 00ba:26ff  item/innate: level 12 }
end;                                                                 { quirk: other classes → uninitialised }
if (g_6DBF <> 0) and (g_31FA[spell*16] <> 2) then lvl := 6;          { 00ba:2703  DS byte g_6DBF forces level 6 (L) }
SpellCasterLevel := lvl;
```

### 00BA:272A DrawStandardFrames (H)
`procedure DrawStandardFrames(inner [BP+6]: Boolean)` — caller RedrawCurrentMode. The byte at 00BA:2729 is `''`.
```pascal
DrawTitledFrame(1, 1, $26, $16, 0, $0F, '');                         { 00ba:2751  whole screen }
DrawTitledFrame(1, $11, $26, $16, 0, $0F, '');                       { 00ba:2777  text window }
DrawTitledFrame(1, 1, $0F, $0F, 0, $0F, '');                         { 00ba:279d  picture box }
if inner then DrawTitledFrame(3, 3, $0D, $0D, 0, $0F, '');           { 00ba:27c9  view inner frame }
```

### 00BA:27D9 RedrawCurrentMode (H)
`procedure RedrawCurrentMode` — 22 callers (ECL game loop, camp, shops, temple, LOAD_FILES, ...). Strings `''`, `PIC` at 00BA:27D4/27D5.
```pascal
case g_49F3 of                                                       { 00ba:27df }
  0: DrawTitledFrame(1, 1, $26, $16, 0, $0F, '');                    { 00ba:2807 }
  1: begin DrawStandardFrames(true);                                 { 00ba:2817 }
           LoadPortrait(pic_HeadId, pic_BodyId);                     { 00ba:2822 }
           DrawPortrait(3, 3, true) end;                             { 00ba:2830 }
  2: begin DrawStandardFrames(true);                                 { 00ba:2840  camping }
           LoadAnimation('PIC', $1D, 0, g_6ABE);                     { 00ba:285d  camp picture }
           DrawPartyRoster(SelectedChar);  DrawLocationTimeStatus end;   { 00ba:286b / 286f }
  4: begin DrawStandardFrames(true);  RefreshView;                   { 00ba:287c / 287f }
           DrawPartyRoster(SelectedChar);  DrawLocationTimeStatus end;
  3: begin DrawStandardFrames(false);  RefreshView;                  { 00ba:289e / 28a1 }
           DrawPartyRoster(SelectedChar);  DrawLocationTimeStatus end;
  6: begin DrawStandardFrames(true);                                 { 00ba:28c0 }
           LoadAnimation('PIC', 1, 0, g_6ABE);                       { 00ba:28dd }
           DrawPartyRoster(SelectedChar) end;                        { 00ba:28eb }
end;                                                                 { 5 (combat) and others: nothing }
```

### 00BA:290B DrawLocationTimeStatus (H)
`procedure DrawLocationTimeStatus` — callers: RedrawCurrentMode, SwitchToMode3, ecl_op2D_Call (2C90h), ExploreCommand/0D6D, Camp, Rest.
Literals at 00BA:28F2..2909: `'0'`, `','`, `' '`, `':'`, `' camping'`, `' search'`. ECL VM words: `49C3/49C4` overland x/y (+186h/+188h), `49C7/49C8/49C9` clock minutes/ten-minutes/hours (+18Eh/+190h/+192h), `49FB` hide-coordinates flag (+1F6h), `6DCA` search flags (+594h of block 2).
```pascal
s := '';                                                             { 00ba:2912 }
x := party_MapX;  y := party_MapY;                                   { 00ba:2916 }
if travel_Mode > 1 then begin                                        { 00ba:2922  overland modes }
  x := Mem[$49C3];  y := Mem[$49C4];                                 { 00ba:2929 }
  if travel_Mode = 3 then x := x + $0D;                              { 00ba:2941 }
  if travel_Mode = 4 then x := x + $1A;                              { 00ba:294c }
end;
hh := WordToDecimalString(Mem[$49C9]);                               { 00ba:2967  string[2] }
if Length(hh) < 2 then hh := '0' + hh;                               { 00ba:2978 }
mm := WordToDecimalString(10*Mem[$49C8] + Mem[$49C7]);               { 00ba:29c3 }
if Length(mm) < 2 then mm := '0' + mm;                               { 00ba:29d4 }
if Mem[$49FB] = 0 then                                               { 00ba:2a02 }
  s := ByteToDecimalString(x) + ',' + ByteToDecimalString(y) + ' ';  { 00ba:2a19 .. 2a4c }
s := s + g_25A8[party_Dir] + ' ';                                    { 00ba:2a74  direction name, string[2] per facing }
s := s + hh + ':' + mm;                                              { 00ba:2a9c .. 2ac8 }
if g_49F3 = 2 then s := s + ' camping'                               { 00ba:2acd }
else if Mem[$6DCA] and 1 > 0 then s := s + ' search';                { 00ba:2afe }
ClearRectangle($11, $0F, $26, $0F);                                  { 00ba:2b42  row 15, cols 17..38 }
DrawText($11, $0F, $0A, s);                                          { 00ba:2b55 }
```

### 00BA:2B5E SwitchToExploreMode (M)
`procedure SwitchToExploreMode` — caller ExploreCommand.
```pascal
g_49F3 := 3;                                                         { 00ba:2b61 }
DrawExploreFrames;                                                   { 00ba:2b66  ov27 }
RefreshView;                                                         { 00ba:2b6b }
DrawOverlandParty;                                                   { 00ba:2b70 }
DrawLocationTimeStatus;                                              { 00ba:2b76 }
DrawPartyRoster(SelectedChar);                                       { 00ba:2b82 }
```

### 00BA:2B88 DrawCombatLayout (M)
`procedure DrawCombatLayout` — callers: StartCombat, ItemAlignmentShock, BeginCast, UseItem, PlayerTurn. The byte at 00BA:2B87 is `''`.
```pascal
PaletteFlashOn;                                                      { 00ba:2b8e  ov31 e1 (VIEW name) }
DrawTitledFrame(1, 1, $15, $15, 0, 0, '');                           { 00ba:2bb4  map window }
DrawTitledFrame($17, 1, $26, $15, 0, 0, '');                         { 00ba:2bda  side panel }
ClearRectangle(0, $17, $27, $18);                                    { 00ba:2beb  rows 23..24 }
FocusSquare(cm_Map^.x0 + 3, cm_Map^.y0 + 3, $FF, 8);                 { 00ba:2c10  redraw the map around the window centre }
```

### 00BA:2C48 SelectPartyCharacter (H)
`procedure SelectPartyCharacter(prompt: string[40] [BP+0Ch]; allowExit [BP+0Ah]: Boolean; var sel: ^TChar [BP+6])` (retf 0Ah) — callers: ecl_op39_Who, SelectTargetsCamp, TradeItem/2156.
Literals: `' Exit'` 00BA:2C19, set `[#13, #27, 'E', 'S']` 00BA:2C1F, `' '` 2C3F, `'Select'` 2C41.
```pascal
p := prompt;                                                         { 00ba:2c5d }
key := ' ';  exitItem := '';                                         { 00ba:2c62 }
if allowExit then exitItem := ' Exit';                               { 00ba:2c6a }
while not (key in [#13, #27, 'E', 'S']) do begin                     { 00ba:2c83 }
  DrawPartyRoster(sel);                                              { 00ba:2ca1  highlights sel }
  anim := (g_49F3 = 2) or (g_49F3 = 6);                              { 00ba:2ca4 }
  key := HorizontalMenu(p + ' ', 'Select' + exitItem, $0D, $0A, $0F, true, anim, ext);   { 00ba:2d05 }
  c := sel;                                                          { 00ba:2d0d }
  if ext then begin                                                  { 00ba:2d1d  extended key }
    if key = 'O' then begin                                          { 00ba:2d26  scan 4Fh: next }
      c := c^.next;  if c = nil then c := PartyHead                  { 00ba:2d2d }
    end else if key = 'G' then begin                                 { 00ba:2d57  scan 47h: previous }
      c := PartyHead;                                                { 00ba:2d5b }
      if sel = PartyHead then
        while c^.next <> nil do c := c^.next                         { 00ba:2db0  wrap to the last }
      else
        while c^.next <> sel do c := c^.next;                        { 00ba:2d7e }
    end;
  end else if (key = 'E') or (key = #0) then
    c := nil;                                                        { 00ba:2de2  Exit }
  sel := c;                                                          { 00ba:2dea }
end;
{ quirk: key #0 sets sel := nil but does not end the loop (not in the set) }
```

### 00BA:2E03 WeaponIsRanged (M)
`function WeaponIsRanged(c: ^TChar [BP+6]): Boolean` := `(c^.readied[0] <> nil) and (ITEMS[c^.readied[0]^.type].range > 1)` `{ 00ba:2e09 / 2e2c }` (`g_558E` = ITEMS j12 `range`).

### 00BA:2E46 FUN_00BA_2E46 (L)
`function FUN_00BA_2E46(c: ^TChar [BP+6]): Boolean` := `WeaponIsRanged(c) and (ITEMS[c^.readied[0]^.type].wflags2 and $14 = $14)` `{ 00ba:2e53 / 2e6e }` — ranged weapon with wflags2 bits 2 and 4 (bit 2 = STR bonus, bit 4 = see GetMissileAmmo; meaning of the pair L).

### 00BA:2E8B GetMissileAmmo (M)
`function GetMissileAmmo(c: ^TChar [BP+0Ah]; var ammo: ^TItem [BP+6]): Boolean` (retf 8) — callers: CalcAttacks, AiMoveAttack, CurrentAttackItem, FUN_6100_*.
```pascal
ok := false;                                                         { 00ba:2e91 }
w := c^.readied[0];                                                  { 00ba:2e95  weapon slot +CCh }
ammo := nil;  f := 0;                                                { 00ba:2ea8 }
if w <> nil then begin                                               { 00ba:2eb8 }
  f := ITEMS[w^.type].wflags2;                                       { 00ba:2ec0 }
  if f and $10 <> 0 then ammo := w;                                  { 00ba:2ed6  weapon is its own missile (thrown) }
  if f and $08 <> 0 then begin                                       { 00ba:2eef  needs ammunition }
    if f and $01 <> 0 then ammo := c^.readied_arrows;                { 00ba:2ef8  +F8h }
    if f and $80 <> 0 then ammo := c^.readied_quarrels;              { 00ba:2f18  +FCh }
  end;
end;
if (ammo <> nil) or (f = $0A) then ok := true;                       { 00ba:2f38  f = 0Ah: launcher needing no ammo item (L) }
GetMissileAmmo := ok;
```

### 00BA:2F57 RacialLevelLimitReached (M)
`function RacialLevelLimitReached(c: ^TChar [BP+8]; cls [BP+6]: ShortInt): Boolean` (retf 6) — caller Spell_Restoration.
True when a demi-human is at its AD&D maximum level in class `cls` (0 cleric, 2 fighter; `c^.str` = +10h).
```pascal
r := false;                                                          { 00ba:2f5d }
lvl := c^.level[cls];                                                { 00ba:2f6a }
if lvl > 0 then                                                      { 00ba:2f7b }
  case c^.race of                                                    { 00ba:2f84 }
    1 {Dwarf}:    if cls = 2 then r := ((lvl = 8) and (c^.str = 17)) or ((lvl = 7) and (c^.str < 17));   { 00ba:2f8f }
    2 {Elf}:      if cls = 2 then r := (lvl = 7) or ((lvl = 6) and (c^.str = 17)) or ((lvl = 5) and (c^.str < 17));   { 00ba:2fc0 }
    3 {Gnome}:    if cls = 2 then r := (lvl = 6) or ((lvl = 5) and (c^.str < 18));   { 00ba:2ff7 }
    4 {Half-Elf}: if (cls = 0) and (lvl = 5) then r := true          { 00ba:301d }
                  else if cls = 2 then r := (lvl = 8) or ((lvl = 7) and (c^.str = 17)) or ((lvl = 6) and (c^.str < 17));   { 00ba:302f }
    5 {Halfling}: if cls = 2 then r := (lvl = 6) or ((lvl = 5) and (c^.str = 17)) or ((lvl = 4) and (c^.str < 17));   { 00ba:3065 }
  end;
RacialLevelLimitReached := r;
{ quirk: Dwarf with STR 18 never limited; only fighter (and half-elf cleric) limits are coded }
```

### 00BA:309E UnitInit_00BA (H)
`procedure UnitInit` — empty unit initialiser (`push bp / mov bp,sp / pop bp / retf`) `{ 00ba:309e }`, called from main.

---

## res_03F1 (03F1) — frames and screen rectangles

### 03F1:0000 DrawFrame (H)
`procedure DrawFrame(x1 [BP+0Eh], y1 [BP+0Ch], x2 [BP+0Ah], y2 [BP+8], style [BP+6]: ShortInt)` (`RETF 0Ah`) — callers: DrawTitledFrame, ShowCharacterMessage, CastMenu, DrawCharacterSheet, ItemsMenu. Callee: Put8x8Symbol (ov34).
Draws a border of 8×8 symbols one cell **outside** the rectangle (x1,y1)-(x2,y2): symbol base `114h + 3*style`; +0 corners, +1 vertical edges, +2 horizontal edges.
```pascal
Dec(x1); Dec(y1); Inc(x2); Inc(y2);                     { 03f1:0006 }
base := style * 3 + $114;                               { 03f1:0012 }
Put8x8Symbol(x1, y1, base, 0, 0);                       { 03f1:0038  corners; args col, row, sym, toView, masked }
Put8x8Symbol(x2, y1, base, 0, 0);                       { 03f1:0052 }
Put8x8Symbol(x1, y2, base, 0, 0);                       { 03f1:006c }
Put8x8Symbol(x2, y2, base, 0, 0);                       { 03f1:0086 }
for c := x1 + 1 to x2 - 1 do begin                      { 03f1:008b }
  Put8x8Symbol(c, y1, base + 2, 0, 0);                  { 03f1:00b9  top edge }
  Put8x8Symbol(c, y2, base + 2, 0, 0);                  { 03f1:00d2  bottom edge }
end;
for r := y1 + 1 to y2 - 1 do begin                      { 03f1:00df }
  Put8x8Symbol(x1, r, base + 1, 0, 0);                  { 03f1:010c  left edge }
  Put8x8Symbol(x2, r, base + 1, 0, 0);                  { 03f1:0124  right edge }
end;
```

### 03F1:0137 ClearRectangle (H)
`procedure ClearRectangle(x1 [BP+0Ch], y1 [BP+0Ah], x2 [BP+8], y2 [BP+6]: ShortInt)` (`RETF 8`) — callers: DrawTitledFrame and 30 others (functions.tsv). Clears text cells (x1,y1)-(x2,y2) to colour 0 directly in video RAM.
```pascal
case VideoMode of                                       { 03f1:013d  g_4A1E }
  0: { CGA 320x200x4: 2 banks, 80 bytes/line, 2 bytes per cell }
    for line := y1 * 4 to y2 * 4 + 3 do begin           { 03f1:0147 }
      FillChar(Mem[$B800 : line * 80 + x1 * 2], (x2 - x1 + 1) * 2, 0);   { 03f1:01a5  even scan lines }
      FillChar(Mem[$BA00 : line * 80 + x1 * 2], (x2 - x1 + 1) * 2, 0);   { 03f1:01c7  odd scan lines }
    end;
  1: begin { EGA }
    FillEgaTextRectangle(x1, y1, x2, y2, 0, 0);                { 03f1:01f1  pushes x1,y1,x2,y2,0,0 (0709 unit: EGA rect fill, M) }
    FillEgaTextRectangle(x1, y1, x2, y2, 1, 0);                { 03f1:020c  same with 5th arg 1 (second page/buffer, M) }
  end;
  2: { Tandy 320x200x16: 4 banks, 160 bytes/line, 4 bytes per cell }
    for line := y1 * 2 to y2 * 2 + 1 do begin           { 03f1:021b }
      FillChar(Mem[$B800 : line * 160 + x1 * 4], (x2 - x1 + 1) * 4, 0);  { 03f1:027e }
      FillChar(Mem[$BA00 : line * 160 + x1 * 4], (x2 - x1 + 1) * 4, 0);  { 03f1:029b }
      FillChar(Mem[$BC00 : line * 160 + x1 * 4], (x2 - x1 + 1) * 4, 0);  { 03f1:02b8 }
      FillChar(Mem[$BE00 : line * 160 + x1 * 4], (x2 - x1 + 1) * 4, 0);  { 03f1:02d5 }
    end;
end;
```

### 03F1:02E8 DrawTitledFrame (H)
`procedure DrawTitledFrame(x1 [BP+14h], y1 [BP+12h], x2 [BP+10h], y2 [BP+0Eh], style [BP+0Ch], colour [BP+0Ah]: ShortInt; title [BP+6]: String[40])` (`RETF 10h`) — callers: ecl_op00_Exit, ecl_op0E_Picture, ecl_op2E_Damage, ecl_RunAfterNewBlock, CodeWheelCheck and ~20 others (functions.tsv).
```pascal
t := title;                                             { 03f1:02fc  StrAssign(40) into [bp-29h] }
ClearRectangle(x1, y1, x2, y2);                         { 03f1:0312 }
DrawFrame(x1, y1, x2, y2, style);                       { 03f1:032a }
if Length(t) <> 0 then                                  { 03f1:032d }
  DrawText((x1 + x2 - Length(t)) div 2, y1, colour, t);   { 03f1:035c  PrintAt(col, row, colour, s): centred on the first inner row }
```
Note (fix #ref-3): `colour` is used **only** for the title (DrawText); the border glyphs are symbols `114h + 3*style` drawn by Put8x8Symbol with the symbol set's own pixel colours (multicolour in the captures), so no call argument determines the visible border colour.
Note: ECL calls such as `DrawTitledFrame(1, 1, $0F, $0F, 0, $0F, '')` draw the picture-box frame around cells (1,1)-(15,15) with style 0; the ECL part wrote the 5th/6th arguments as (0, 0Fh) = style 0, colour 0Fh.

### 03F1:0367 FUN_03F1_0367 — unit init, empty (H)

---

---

## res_042B (042B) — startup configuration

### 042B:00A4 InitConfiguration (H)
`procedure InitConfiguration` — the unit's initialisation part (called from MainProgram 0000:002E). Callers: MainProgram.
Callees: WaitOverlayDisk, Overlay.OvrInit/OvrGetBuf/OvrSetBuf, System file/text I/O, Dos.Intr, SetVideoMode (set video mode), RestorePreviousVideoMode (back to text mode, M), SetDisplayPage/00A0, ReadGameKey, ResetSound.
Name: evidence = its strings (CS:0000 `GAME.OVR`, 0009 `pool.cfg`, 0012 `Please insert startup disk.`, 002E `POOL.CFG`, 0037 `Unable to find POOL.CFG`, 004F `Not enough memory to run game.  You need `, 0079 ` more bytes.`, 0086 `Overlay error, program abort!`).
POOL.CFG layout (from the reads below; agrees with CFG.C `printf("%c\n%c\n%s\\\n%s\\SAVE\\\n%c\n")`, cross-check only): line 1 video char, line 2 sound char, line 3 data path, line 4 save path, line 5 flag char.
```pascal
WaitOverlayDisk;                                          { 042b:00aa  (0802 unit, disk/drive setup; ENGINE part T) }
OvrInit('GAME.OVR');                                    { 042b:00be  string value parameter copied to a temp at [bp-9] }
repeat
  Assign(g_494D, 'pool.cfg');                           { 042b:00cd  untyped file }
  Reset(g_494D, 128);                                   { 042b:00db }
  g_49CD := IOResult;                                   { 042b:00e0 }
  if g_49CD <> 0 then begin                             { 042b:00e8 }
    WriteLn(Output, 'Please insert startup disk.');     { 042b:00fc }
    g_484C := ReadGameKey;                              { 042b:0106 }
  end;
until g_49CD = 0;                                       { 042b:010e }
Close(g_494D);                                          { 042b:011a }
g_84F0 := 0;                                            { 042b:011f  Crt unit variable (written by RT_0A40_002E too; L) }
Assign(g_484D, 'POOL.CFG');                             { 042b:012e  text file }
Reset(g_484D);                                          { 042b:0138 }
if IOResult <> 0 then begin                             { 042b:013d }
  WriteLn(Output, 'Unable to find POOL.CFG');           { 042b:0153 }
  Halt(0);                                              { 042b:015f }
end;
Read(g_484D, g_484C); ReadLn(g_484D);                   { 042b:0169  line 1: video }
Regs.AH := $0F; Intr($10, Regs);                        { 042b:0176  Regs = g_4A02 (AL 4A02, AH 4A03); get video mode }
PrevBiosVideoMode := Regs.AL;                               { 042b:018b  g_4A1C }
g_4A1D := PrevBiosVideoMode;                                { 042b:0191 }
if g_484C = 'E' then begin                              { 042b:0197 }
  VideoMode := 1;                                       { 042b:019b  g_4A1E: 1 = EGA }
  SetVideoMode($0D);                                   { 042b:01a3  BIOS mode 0Dh, EGA 320x200x16 }
  g_4A1B := 0; g_4A1A := 0;                             { 042b:01a8 }
  SetDisplayPage(g_4A1B);                                { 042b:01b6  (0709 unit, EGA plane/page setup, M) }
  SetDrawPage(g_4A1A);                                { 042b:01bf }
end else if g_484C = 'T' then begin                     { 042b:01c6 }
  VideoMode := 2;                                       { 042b:01ca  2 = Tandy }
  g_4848 := Ptr(Seg(HeapEnd^) - $400, Ofs(HeapEnd^));   { 042b:01cf  take 16 KB off the top of the heap }
  HeapEnd := g_4848;                                    { 042b:01e1 }
  SetVideoMode(9);                                     { 042b:01f2  BIOS mode 9, Tandy 320x200x16 }
end else begin
  VideoMode := 0;                                       { 042b:01f9  0 = CGA }
  SetVideoMode(4);                                     { 042b:0201  BIOS mode 4, CGA 320x200x4 }
end;
if MemAvail >= $18800 - OvrGetBuf then                  { 042b:0206  signed 32-bit compare, need <= MemAvail }
  OvrSetBuf($18800)                                     { 042b:0234  100352-byte overlay buffer }
else begin
  RestorePreviousVideoMode;                                        { 042b:023b  restore text mode (M) }
  WriteLn(Output, 'Not enough memory to run game.  You need ', $18800 - OvrGetBuf, ' more bytes.');  { 042b:024d }
  Halt(0);                                              { 042b:0283 }
end;
{ quirk: the number printed is 18800h − OvrGetBuf (the extra buffer size), not the shortfall against MemAvail. }
if OvrResult <> 0 then begin                            { 042b:0288  g_43DC = Overlay.OvrResult }
  RestorePreviousVideoMode;                                        { 042b:028f }
  WriteLn(Output, 'Overlay error, program abort!');     { 042b:02a1 }
  Halt(0);                                              { 042b:02ad }
end;
Read(g_484D, g_484C); ReadLn(g_484D);                   { 042b:02b7  line 2: sound }
if g_484C = 'T' then SoundDevice := 0                   { 042b:02c7  g_5372: 0 = Tandy PSG }
else if g_484C = 'P' then SoundDevice := 1              { 042b:02d2  1 = PC speaker }
else SoundDevice := 2;                                  { 042b:02dd  2 = none }
g_4848 := Ptr(Seg(HeapEnd^) - $400, Ofs(HeapEnd^));     { 042b:02e2  again 16 KB off the heap (all modes) }
HeapEnd := g_4848;                                      { 042b:02f4 }
ResetSound;                                             { 042b:0302  08AE:017B }
ReadLn(g_484D, DataPath);                               { 042b:0315  line 3 → g_547C (string[255]) }
DataPath := DataPath;                                   { 042b:032d  quirk: self-assignment (StrAssign of g_547C to itself) }
ReadLn(g_484D, SavePath);                               { 042b:0340  line 4 → g_537A }
SavePath := SavePath;                                   { 042b:0358  quirk: self-assignment }
Read(g_484D, g_484C); ReadLn(g_484D);                   { 042b:0362  line 5 }
g_49D1 := Ord(g_484C = 'F');                            { 042b:036f  'F' → 1 else 0 (read by ShowTitle; meaning L) }
Close(g_484D);                                          { 042b:0387 }
```

---

---

## res_0464 part Q — picture loading / pixel conversion / video mode (0464:0000 .. 0464:0D70)

Conventions as VIEW.pas.md: Pascal-order signatures (first parameter = highest BP offset = pushed first),
`{ 0464:oooo }` = first instruction of the statement. Evidence: `python decode/ecl/hdis.py r0464 START END`.

**TPicture** (the struct built by LoadPicture/AllocPicture; offsets from the code below and AllocPicture 0464:248E):
`+00 height: Word` · `+02 width8: Word` (8-pixel units) · `+04 x: Word` · `+06 y: Word` · `+08 count: Byte` (frames)
· `+09 cgaMap: array[0..7] of Byte` (PICTURES.md cga_map) · `+11h frameSize: Word` (bytes per frame in the current
video format) · `+13h mask: ^array of Byte` (nil = no transparency) · `+17h pixels: array of Byte` (converted pixels,
frames back to back).

**Video formats** selected by `VideoMode` (g_4A1E): 0 = CGA (2 bytes per 8 pixels, 2 bpp), 1 = EGA planar
(4 bytes per 8 pixels = one byte per plane, plane order bit 1,2,4,8), 2 = 4-bpp linear (4 bytes per 8 pixels, the DAX
format itself). Constant tables (image bytes at DS, H):
- `g_25E5` word table, entries k = 4..7 (DS:25ED..25F3, low bytes): `C0h, 30h, 0Ch, 03h` = CGA 2-bit pixel masks for pixel positions 0..3 of a CGA byte.
- `g_25F6[0..3]` = `01h, 02h, 04h, 08h` = EGA plane bits.
- `g_25FA[c*4 + j]` (c = CGA colour 0..3, j = pixel position 0..3) = `00 00 00 00 | 40 10 04 01 | 80 20 08 02 | C0 30 0C 03` = colour c shifted into position j.

**Line-dirty tables** written by DrawPictureInto (used by the view flush 0464:1B52, VIEW lane): `g_4A28[row]: Byte`
dirty flag, `g_4C20[row]: Word` lowest written byte offset, `g_4AD0[row]: Word` x byte of that write, `g_4D70[row]: Word`
highest written byte offset; row = pixel line of the destination picture.

### 0464:0000 MaskByte (H)
`function MaskByte(colour [BP+0Ah]: Byte; pix [BP+6]: array[0..3] of Byte): Byte` (retf 6; `pix` = 4 packed source
bytes = 8 pixels, passed by value) — callers: ConvertPicturePixels. Name from PICTURES.md (por-data) and the body.
Result: bit (7−i) set where pixel i (0..7, high nibble first) equals `colour` (transparent pixel mask).
```pascal
res := 0;                                                    { 0464:0006 }
hi := colour shl 4;                                          { 0464:000a }
bit := $80;                                                  { 0464:0017 }
for i := 0 to 3 do begin                                     { 0464:001b }
  if (pix[i] and $F0) = hi then res := res + bit;            { 0464:002b  left pixel }
  bit := bit shr 1;                                          { 0464:003b }
  if (pix[i] and $0F) = colour then res := res + bit;        { 0464:004c  right pixel }
  bit := bit shr 1;                                          { 0464:005c }
end;
MaskByte := res;                                             { 0464:006c }
```

### 0464:007B GetCgaMapEntry (H)
`function GetCgaMapEntry(n [BP+0Ah]: Byte; map [BP+6]: array[0..7] of Byte): Byte` (retf 6; `map` passed by
reference and copied to a local, i.e. a Pascal value parameter of 8 bytes) — callers: ConvertPicturePixels,
RecolorPicture, FillPictureRect.
```pascal
local := map;                                                { 0464:0081  CopyBytes 8 }
if Odd(n) then GetCgaMapEntry := local[n shr 1] and $0F      { 0464:0094 }
else GetCgaMapEntry := (local[n shr 1] and $F0) shr 4;       { 0464:00ae }
```
(even n = high nibble, odd n = low nibble, as PICTURES.md cga_map.)

### 0464:00CF SetVideoMode (H)
`procedure SetVideoMode(mode [BP+6]: Byte)` (retf 2) — callers: InitConfiguration (startup), RestorePreviousVideoMode.
`g_4A02` = a Dos `Registers` record (AL at +0, AH at +1).
```pascal
g_4A1C := g_4A1D;                                            { 0464:00d5  previous BIOS mode := current }
Regs.AH := 0;                                                { 0464:00db  g_4A03 }
Regs.AL := mode;                                             { 0464:00e0  g_4A02 }
Intr($10, Regs);                                             { 0464:00e6  BIOS set video mode }
g_4A1D := mode;                                              { 0464:00f3  current BIOS mode }
```

### 0464:00FF RestorePreviousVideoMode (H)
`procedure RestorePreviousVideoMode` — callers: InitConfiguration, Load3DMap, Load8x8Set, LoadWallSet, Put8x8Symbol,
Show3DSprite (Show3DSprite), Load24x24Set (their error paths switch back to the text mode before printing a fatal message).
```pascal
SetVideoMode(g_4A1C);                                        { 0464:0102 }
```
(The bytes at 0464:010C = Pascal string `'.dax'` used by LoadPicture.)

### 0464:0111 LoadPicture (H)
`procedure LoadPicture(name [BP+10h]: String; id [BP+0Eh]: Byte; maskFlags [BP+0Ch]: Byte; transpColour [BP+0Ah]: Byte;
var pic [BP+6]: PPicture)` (retf 0Eh) — callers: Load8x8Set, ShowTitle (title), InitGameState, DragonFinale, LoadPortrait,
Load24x24Set, LoadCombatIcon. Callees: FreePicture (free picture), LoadDaxRecord 0802:0716, AllocPicture 0464:248E,
ConvertPicturePixels, FreeMem, FUN_0899_0104. Name: PICTURES.md (M there); the body loads a P-record (H).
```pascal
s := name;                                                   { 0464:0118  string[255] }
if pic <> nil then FreePicture(pic);                       { 0464:012c  free the previous picture (var pic) }
LoadDaxRecord(s, '.dax', id, size, buf);                     { 0464:0141  push order: name, ext, id, var size, var buf }
if size = 0 then Exit;                                       { 0464:016c }
Move(buf^[0], height, 2);                                    { 0464:0176  P-record header (PICTURES.md §1) }
Move(buf^[2], width8, 2);                                    { 0464:018b }
Move(buf^[4], x, 2);                                         { 0464:01a4 }
Move(buf^[6], y, 2);                                         { 0464:01bd }
Move(buf^[8], count, 1);                                     { 0464:01d6 }
Move(buf^[9], cgaMap, 8);                                    { 0464:01ef }
AllocPicture(height, width8, count, maskFlags, pic);         { 0464:0208  push order: height, width8, count, maskFlags, var pic }
pic^.x := x;                                                 { 0464:0230 }
pic^.y := y;                                                 { 0464:023c }
pic^.cgaMap := cgaMap;                                       { 0464:0248  CopyBytes 8 }
ofs := $11;                                                  { 0464:0261  pixel data start in the record }
ConvertPicturePixels(buf, ofs, maskFlags, transpColour, pic);{ 0464:0267  push order: buf, ofs, maskFlags, transpColour, pic (value) }
FreeMem(buf, size);                                          { 0464:0289 }
FUN_0899_0104;                                               { 0464:029a  (ENGINE 0899, disabled routine per draft) }
```
`{ quirk: the pixel data offset passed is 11h = 17, i.e. directly after the 17-byte header; size 0 (record missing)
returns silently with pic unchanged (nil after the free) }`.

### 0464:02A5 ConvertPicturePixels (H)
`procedure ConvertPicturePixels(src [BP+10h]: Pointer; ofs [BP+0Eh]: Word; maskFlags [BP+0Ch]: Byte;
transpColour [BP+0Ah]: Byte; pic [BP+6]: PPicture)` (retf 0Eh) — callers: LoadPicture, LoadAnimation (LoadAnimation).
Callees: MaskByte, GetCgaMapEntry, Move. Converts the 4-bpp DAX pixels (`src^[ofs..]`) into the current video format
in `pic^.pixels`, building `pic^.mask` (if allocated) from `transpColour`. `maskFlags` is not read (the mask pointer
decides). `pi` = output index (+17h base), `mi` = mask index.
```pascal
if pic = nil then Exit;                                      { 0464:02ab }
pi := 0;  mi := 0;                                           { 0464:02bf }
case VideoMode of                                            { 0464:02c9 }
0: { CGA: 8 source pixels -> 2 bytes }
  for f := 1 to pic^.count do                                { 0464:02d3 }
    for r := 0 to pic^.height - 1 do                         { 0464:02ef }
      for c := 0 to pic^.width8 - 1 do begin                 { 0464:030b }
        Move(src^[ofs], b, 4);                               { 0464:0328  b: array[0..3] of Byte }
        if pic^.mask <> nil then begin                       { 0464:0340 }
          m := MaskByte(transpColour, b);                    { 0464:034d  push order: colour, b }
          bit := $80;                                        { 0464:035e }
          for half := 1 to 2 do begin                        { 0464:0362 }
            for k := 4 to 7 do begin                         { 0464:036b }
              if (bit and m) > 0 then
                pic^.mask^[mi] := pic^.mask^[mi] or Lo(g_25E5[k]);  { 0464:0374  CGA pixel mask C0/30/0C/03 }
              bit := bit shr 1;                              { 0464:03af }
            end;
            Inc(mi);                                         { 0464:03bf }
          end;
        end;
        for j := 0 to 3 do begin                             { 0464:03c8  first CGA byte = pixels 0..3 }
          if Odd(j) then e := GetCgaMapEntry(b[j shr 1] and $0F, pic^.cgaMap)             { 0464:03d8 }
          else e := GetCgaMapEntry((b[j shr 1] and $F0) shr 4, pic^.cgaMap);              { 0464:0427 }
          pic^.pixels[pi] := pic^.pixels[pi] or g_25FA[e*4 + j];                          { 0464:0405 }
        end;
        if pic^.mask <> nil then pic^.pixels[pi] := pic^.pixels[pi] and not pic^.mask^[mi-2];  { 0464:0484 }
        Inc(pi);                                             { 0464:04c2 }
        for j := 4 to 7 do begin                             { 0464:04c5  second CGA byte = pixels 4..7 }
          if Odd(j) then e := GetCgaMapEntry(b[j shr 1] and $0F, pic^.cgaMap)             { 0464:04d5 }
          else e := GetCgaMapEntry((b[j shr 1] and $F0) shr 4, pic^.cgaMap);              { 0464:0527 }
          pic^.pixels[pi] := pic^.pixels[pi] or g_25FA[e*4 + (j-4)];                      { 0464:0505 }
        end;
        if pic^.mask <> nil then pic^.pixels[pi] := pic^.pixels[pi] and not pic^.mask^[mi-1];  { 0464:0587 }
        Inc(pi);                                             { 0464:05c4 }
        ofs := ofs + 4;                                      { 0464:05c7 }
      end;
1: { EGA planar: 8 source pixels -> 4 plane bytes + 1 mask byte }
  for f := 1 to pic^.count do                                { 0464:05f6 }
    for r := 0 to pic^.height - 1 do                         { 0464:0612 }
      for c := 0 to pic^.width8 - 1 do begin                 { 0464:062e }
        Move(src^[ofs], b, 4);                               { 0464:064b }
        if pic^.mask <> nil then begin                       { 0464:0663 }
          pic^.mask^[mi] := MaskByte(transpColour, b);       { 0464:0670 }
          Inc(mi);                                           { 0464:068f }
        end;
        bit := $80;                                          { 0464:0692 }
        for j := 0 to 7 do begin                             { 0464:0696  pixel j }
          if Odd(j) then nib := b[j shr 1] and $0F           { 0464:06a6 }
          else nib := b[j shr 1] shr 4;                      { 0464:06b9 }
          for p := 0 to 3 do                                 { 0464:06cf  plane p }
            if (g_25F6[p] and nib) > 0 then
              pic^.pixels[pi + p] := pic^.pixels[pi + p] or bit;  { 0464:06d8 }
          bit := bit shr 1;                                  { 0464:0717 }
        end;
        if pic^.mask <> nil then
          for p := 0 to 3 do
            pic^.pixels[pi + p] := pic^.pixels[pi + p] and not pic^.mask^[mi-1];  { 0464:072a }
        pi := pi + 4;                                        { 0464:0780 }
        ofs := ofs + 4;                                      { 0464:0784 }
      end;
2: { 4-bpp linear: copy whole frames }
  for f := 1 to pic^.count do begin                          { 0464:07b3 }
    Move(src^[ofs], pic^.pixels[pi], pic^.frameSize);        { 0464:07cf }
    if pic^.mask <> nil then
      for k := pi to pi + pic^.frameSize - 1 do begin        { 0464:07f3 }
        if (pic^.pixels[k] shr 4) = transpColour then pic^.mask^[k] := $F0;        { 0464:0824 }
        if (pic^.pixels[k] and $0F) = transpColour then pic^.mask^[k] := pic^.mask^[k] + $0F;  { 0464:0852 }
        pic^.pixels[k] := pic^.pixels[k] and not pic^.mask^[k];                     { 0464:0875 }
      end;
    pi := pi + pic^.frameSize;                               { 0464:08af }
    ofs := ofs + pic^.frameSize;                             { 0464:08b9 }
  end;
end;  { other VideoMode values: nothing }
```
Quirks: `{ quirk: mode 2 sets mask^[k] := F0h only when the left pixel is transparent and otherwise adds 0Fh to the
existing byte; correct only because AllocPicture zero-fills the mask }`; mode 1 uses one mask byte per 8 pixels (shared
by the 4 plane bytes), mode 0 two (one per CGA byte), mode 2 one per source byte.

### 0464:08D4 DrawPictureInto (H)
`procedure DrawPictureInto(x [BP+14h]: Word; y [BP+12h]: Word; frame [BP+10h]: Byte; flags [BP+0Eh]: Byte;
src [BP+0Ah]: PPicture; dst [BP+6]: PPicture)` (retf 10h) — callers: Put8x8Symbol (ov34), DrawTile24.
Copies frame `frame` (0-based) of `src` into the off-screen picture `dst` with its top-left at (x·8 pixels, y·8 lines)
(x, y in 8×8 cells), transparently when `flags and 1` and `src` has a mask, and records the touched byte range per
line in the line-dirty tables. Name: behaviour (H); the VIEW lane calls it "draw one frame of a picture into a target
picture".
```pascal
useMask := ((flags and 1) <> 0) and (src^.mask <> nil);     { 0464:08da }
row := y * 8;                                                { 0464:08f9  destination pixel line }
d := row * dst^.width8;                                      { 0464:0903  destination offset (scaled below) }
lastR := src^.height - 1;                                    { 0464:0910 }
xs := x;                                                     { 0464:091a }
gap := dst^.width8 - (x + src^.width8);                      { 0464:0920  rest of the destination line (32-bit arithmetic, low word kept) }
if (VideoMode = 0) or (VideoMode = 2) then begin             { 0464:0949 }
  if VideoMode = 0 then begin                                { 0464:0957  CGA: 2 bytes per cell }
    xb := xs*2;  rowBytes := src^.width8*2;  xs := xs*2;  gap := gap*2;    { 0464:095e }
    s := frame * src^.frameSize;                             { 0464:0982 }
    d := d*2;                                                { 0464:0991 }
  end else begin                                             { 0464:099b  4-bpp linear: 4 bytes per cell }
    xb := xs*4;  rowBytes := src^.width8*4;  xs := xs*4;  gap := gap*4;    { 0464:099b }
    s := frame * src^.frameSize;                             { 0464:09c7 }
    d := d*4;                                                { 0464:09d6 }
  end;
  for r := 0 to lastR do begin                               { 0464:09e9 / 0ac5 }
    g_4A28[row] := 1;                                        { 0464:0a01 }
    d := d + xs;                                             { 0464:0a09 }
    if g_4C20[row] > d then begin                            { 0464:0a0f }
      g_4AD0[row] := xb;                                     { 0464:0a1d }
      g_4C20[row] := d;                                      { 0464:0a29 }
    end;
    if useMask then
      for gfx_LoopCounter := 1 to Byte(rowBytes) do begin             { 0464:0a35  quirk: loop counter is the global byte gfx_LoopCounter }
        dst^.pixels[d] := (dst^.pixels[d] and src^.mask^[s]) or src^.pixels[s];   { 0464:0a4b }
        Inc(s);  Inc(d);                                     { 0464:0a84 }
      end
    else begin
      Move(src^.pixels[s], dst^.pixels[d], rowBytes);        { 0464:0b11 }
      s := s + rowBytes;  d := d + rowBytes;                 { 0464:0b35 }
    end;
    if d - 1 > g_4D70[row] then g_4D70[row] := d - 1;        { 0464:0a92 / 0b41 }
    d := d + gap;                                            { 0464:0aae / 0b5d }
    Inc(row);                                                { 0464:0ab4 / 0b63 }
  end;
end else if VideoMode = 1 then begin                         { 0464:0b74  EGA planar: 4 bytes per cell, 1 mask byte per 4 }
  xb := xs;                                                  { 0464:0b7b  quirk: x byte NOT scaled (unlike modes 0/2) }
  rowBytes := src^.width8*4;  xs := xs*4;  gap := gap*4;     { 0464:0b81 }
  s := frame * src^.frameSize;                               { 0464:0ba3 }
  ms := s div 4;  cnt := 4;                                  { 0464:0bb2  mask index, bytes left for this mask byte }
  d := d*4;                                                  { 0464:0bc0 }
  for r := 0 to lastR do begin                               { 0464:0bd3 / 0cbf }
    g_4A28[row] := 1;                                        { 0464:0beb }
    d := d + xs;                                             { 0464:0bf3 }
    if g_4C20[row] > d then begin g_4AD0[row] := xb; g_4C20[row] := d end;   { 0464:0bf9 }
    if useMask then
      for gfx_LoopCounter := 1 to Byte(rowBytes) do begin             { 0464:0c1f }
        dst^.pixels[d] := (dst^.pixels[d] and src^.mask^[ms]) or src^.pixels[s];  { 0464:0c35 }
        Inc(s);                                              { 0464:0c6e }
        Dec(cnt);  if cnt = 0 then begin cnt := 4; Inc(ms) end;  { 0464:0c71 }
        Inc(d);                                              { 0464:0c81 }
      end
    else begin
      Move(src^.pixels[s], dst^.pixels[d], rowBytes);        { 0464:0d0b }
      s := s + rowBytes;  d := d + rowBytes;                 { 0464:0d2f }
    end;
    if d - 1 > g_4D70[row] then g_4D70[row] := d - 1;        { 0464:0c8c / 0d3b }
    d := d + gap;                                            { 0464:0ca8 / 0d57 }
    Inc(row);                                                { 0464:0cae / 0d5d }
  end;
end;
```
Quirks: `{ quirk: the masked loop is "for gfx_LoopCounter := 1 to Byte(rowBytes)" with a signed test (JG at 0464:0A40/0C2A):
rows of 128..255 bytes (≥ 32 cells in modes 1/2, ≥ 64 in mode 0) copy nothing when masked; ms (mode 1) is not reset per
row, correct because each row is a whole number of 4-byte groups }`; `{ quirk: in mode 1 the x value stored in g_4AD0 is
the cell x, in modes 0/2 the byte x }`.

## res_0464 part R1 — picture blit with clipping/mask, picture mirroring (0464:0D71 .. 0464:1950)

Conventions as VIEW.pas.md (Pascal-order signatures, first parameter = highest BP offset; `{ 0464:oooo }` = first
instruction of the statement). Evidence: `python decode/ecl/hdis.py r0464 START END` (bytes of the unpacked image).

Picture record in memory (`TPicture`, built by LoadPicture 0464:0111 / AllocatePicture 0464:248E; PICTURES.md §1):
`+0 height` (rows), `+2 width8` (8-pixel units), `+4 x`, `+6 y`, `+8 count` (frames), `+9..+10h cga_map`,
`+11h frameSize` (bytes per frame = height*width8*2 in CGA, *4 otherwise — 0464:2494..2508), `+13h mask` (far ptr,
nil = no transparency mask), `+17h pix[]` (frames back to back). `pix[i]` below = byte at `+17h+i`.
Video mode `VideoMode` (g_4A1E, VIEW.pas.md): 0 = CGA (2 bpp, 2 bytes per 8 px), 1 = EGA (4 plane bytes per 8 px,
mask 1 byte per 8 px), 2 = packed 4 bpp (4 bytes per 8 px, nibble per pixel; mask byte per pixel byte) — value 2's
hardware is not named by this code (L: Tandy/PCjr).

Dirty-row bookkeeping shared with PresentDirtyRows (0464:1B52, which copies only the marked byte span of each row to
video): `g_4A28[row]` (byte) row changed, `g_4C20[row]` (word) lowest changed byte offset in the destination,
`g_4AD0[row]` (word) destination byte column belonging to that lowest offset, `g_4D70[row]` (word) highest changed
offset. Names proposed (M): view_LineDirty, view_SpanFirst, view_SpanScreenX, view_SpanLast.

### 0464:0D71 DrawPicture (M)
`procedure DrawPicture(col [BP+14h], row [BP+12h]: Integer; frame [BP+10h], flags [BP+0Eh]: Byte; src [BP+0Ah], dst [BP+6]: PPicture)` (retf 10h)
callers: AnimateAlongPath, ShowCombatMessageAnimation, PlayFinaleAnimation, DragonFinale, DrawPictureScreenOrView, Show3DSprite (Show3DSprite), RemoveCombatant, DrawIconAt (DrawIconAt).
callees: System.@LongMul, System.Move.
Copies frame `frame` of picture `src` into picture `dst` with its top-left at 8×8 cell (col, row) (col in 8-pixel
units, row ×8 pixel rows). `flags` bit 0 = use `src^.mask` (transparency), bit 2 = first **save** each covered
destination row span into the save buffer `g_4A24^` (laid out with the source geometry, so the area can be put back
later). With `g_5370 <> 0` the source is clipped against `dst` (negative
col/row allowed); with `g_5370 = 0` no clipping is done. Name M: same name used by VIEW.pas.md (DrawPictureScreenOrView calls it
"draw into the view picture") and combat_parts/ov18.pas.md; argument order checked at ov28 ac00:0011..002F (push
col−1, row−1, 0, 1, pic, g_4A20) and 00BA:1CB0..1CD4.
```pascal
if (src = nil) or (dst = nil) then Exit;                                   { 0464:0d77 }
masked := ((flags and 1) <> 0) and (src^.mask <> nil);                     { 0464:0d8a }
saveBg := (flags and 4) <> 0;                                             { 0464:0da9 }
if g_5370 <> 0 then begin                                                  { 0464:0db8  clipping on }
  if col < 0 then begin                                                    { 0464:0dc2 }
    skipL := Abs(col);                                                     { 0464:0dc8 }
    if skipL > src^.width8 then Exit;                                      { 0464:0dd3 }
    dstX := 0;                                                             { 0464:0de2 }
  end else begin
    skipL := 0;                                                            { 0464:0de9 }
    dstX := col;                                                           { 0464:0dee }
    if dstX > dst^.width8 then Exit;                                       { 0464:0df4 }
  end;
  if LongInt(col) + src^.width8 > dst^.width8 then begin                   { 0464:0e03  32-bit compare }
    skipR := LongInt(col) + src^.width8 - dst^.width8;                     { 0464:0e2f }
    if skipR > src^.width8 then Exit;                                      { 0464:0e58 }
    dstSkip := 0;                                                          { 0464:0e67 }
  end else begin
    skipR := 0;                                                            { 0464:0e6e }
    dstSkip := dst^.width8 - (LongInt(col) + src^.width8);                 { 0464:0e73 }
    if dstSkip > dst^.width8 then Exit;                                    { 0464:0e9c  (cannot trigger) }
  end;
  if row < 0 then begin                                                    { 0464:0eab }
    srcOff := Abs(row) * src^.width8 * 8;                                  { 0464:0eb1  two LongMul, low word kept }
    dstOff := 0;                                                           { 0464:0ed9 }
    dstRow := 0;                                                           { 0464:0ede }
    lastRow := src^.height - 1 - Abs(row) * 8;                             { 0464:0ee3 }
    if (src^.frameSize - 1 < srcOff) or (src^.height - 1 < lastRow) then Exit;   { 0464:0f04 }
  end else begin
    srcOff := 0;                                                           { 0464:0f23 }
    dstRow := row * 8;                                                     { 0464:0f28 }
    dstOff := dstRow * dst^.width8;                                        { 0464:0f32 }
    lastRow := src^.height - 1;                                            { 0464:0f3f }
    if dst^.height < LongInt(src^.height) + row * 8 then                   { 0464:0f49 }
      lastRow := dst^.height - 1 - row * 8;                                { 0464:0f77 }
    if (src^.frameSize - 1 < srcOff) or (dst^.frameSize - 1 < dstOff)
       or (src^.height - 1 < lastRow) then Exit;                           { 0464:0f9f }
  end;
end else begin                                                             { 0464:0fca  no clipping }
  skipL := 0;  skipR := 0;  srcOff := 0;                                   { 0464:0fca }
  dstRow := row * 8;                                                       { 0464:0fd9 }
  dstOff := dstRow * dst^.width8;                                          { 0464:0fe3 }
  lastRow := src^.height - 1;                                              { 0464:0ff0 }
  dstX := col;                                                             { 0464:0ffa }
  dstSkip := dst^.width8 - (LongInt(col) + src^.width8);                   { 0464:1000 }
end;
{ all offsets above are in 8-pixel units / pixel rows; now scale to bytes per video mode }
case VideoMode of                                                          { 0464:1029 }
  0, 2: begin                                                              { 0464:1037 }
    if VideoMode = 0 then k := 2 else k := 4;                              { 0464:1037  CGA 2 B, mode 2 4 B per 8 px }
    dstCol  := dstX * k;                                                   { 0464:103e / 10a2 }
    rowBytes := (src^.width8 - skipL - skipR) * k;                         { 0464:1046 / 10ac }
    skipL := skipL * k;  skipR := skipR * k;                               { 0464:1058 / 10c0 }
    dstX := dstX * k;  dstSkip := dstSkip * k;  srcOff := srcOff * k;      { 0464:1068 / 10d4 }
    bgOff := srcOff;                                                       { 0464:1080 / 10f2  save buffer has the source geometry (frame not added) }
    srcOff := srcOff + frame * src^.frameSize;                             { 0464:1086 / 10f8 }
    dstOff := dstOff * k;                                                  { 0464:1098 / 110a  quirk: row offset uses dst width8, then ×k }
    for r := 0 to lastRow do begin                                         { 0464:1114 }
      g_4A28[dstRow] := 1;                                                 { 0464:112c }
      srcOff := srcOff + skipL;  bgOff := bgOff + skipL;                   { 0464:1134 }
      dstOff := dstOff + dstX;                                             { 0464:1140 }
      if g_4C20[dstRow] > dstOff then begin                                { 0464:1146 }
        g_4AD0[dstRow] := dstCol;                                          { 0464:1154 }
        g_4C20[dstRow] := dstOff;                                          { 0464:1160 }
      end;
      if saveBg then Move(dst^.pix[dstOff], g_4A24^.pix[bgOff], rowBytes);   { 0464:116c  push order: dst span first = Source }
      bgOff := bgOff + rowBytes;                                           { 0464:1197 }
      if masked then begin                                                 { 0464:119d }
        for gfx_LoopCounter := 1 to ShortInt(rowBytes) do begin                     { 0464:11a3  quirk: global loop counter; byte count, signed test (≥ 80h → no bytes) }
          dst^.pix[dstOff] := (dst^.pix[dstOff] and src^.mask^[srcOff]) or src^.pix[srcOff];   { 0464:11b9 }
          Inc(srcOff);  Inc(dstOff);                                       { 0464:11f2 }
        end;
      end else begin
        Move(src^.pix[srcOff], dst^.pix[dstOff], rowBytes);                { 0464:1202 }
        srcOff := srcOff + rowBytes;  dstOff := dstOff + rowBytes;         { 0464:1226 }
      end;
      if dstOff - 1 > g_4D70[dstRow] then g_4D70[dstRow] := dstOff - 1;    { 0464:1232 }
      srcOff := srcOff + skipR;  bgOff := bgOff + skipR;                   { 0464:124e }
      dstOff := dstOff + dstSkip;                                          { 0464:125a }
      Inc(dstRow);                                                         { 0464:1260 }
    end;
  end;
  1: begin                                                                 { 0464:1278  EGA planar }
    dstCol := dstX;                                                        { 0464:1278  not scaled: EGA screen has 1 byte per 8 px per plane }
    rowBytes := (src^.width8 - skipL - skipR) * 4;                         { 0464:127e }
    skipL := skipL * 4;  skipR := skipR * 4;                               { 0464:1292 }
    dstX := dstX * 4;  dstSkip := dstSkip * 4;  srcOff := srcOff * 4;      { 0464:12a6 }
    bgOff := srcOff;                                                       { 0464:12c4 }
    srcOff := srcOff + frame * src^.frameSize;                             { 0464:12ca }
    maskOff := srcOff div 4;                                               { 0464:12dc  mask: 1 byte per 8 px }
    maskSkipL := skipL div 4;  maskSkipR := skipR div 4;                   { 0464:12e6 }
    phase := 4;                                                            { 0464:12fa }
    dstOff := dstOff * 4;                                                  { 0464:12fe }
    for r := 0 to lastRow do begin                                         { 0464:1308 }
      g_4A28[dstRow] := 1;                                                 { 0464:1320 }
      srcOff := srcOff + skipL;  maskOff := maskOff + maskSkipL;           { 0464:1328 }
      bgOff := bgOff + skipL;  dstOff := dstOff + dstX;                    { 0464:1334 }
      if g_4C20[dstRow] > dstOff then begin                                { 0464:1340 }
        g_4AD0[dstRow] := dstCol;                                          { 0464:134e }
        g_4C20[dstRow] := dstOff;                                          { 0464:135a }
      end;
      if saveBg then Move(dst^.pix[dstOff], g_4A24^.pix[bgOff], rowBytes);   { 0464:1366 }
      bgOff := bgOff + rowBytes;                                           { 0464:1391 }
      if masked then begin                                                 { 0464:1397 }
        for gfx_LoopCounter := 1 to ShortInt(rowBytes) do begin                     { 0464:139d  quirk: as above }
          dst^.pix[dstOff] := (dst^.pix[dstOff] and src^.mask^[maskOff]) or src^.pix[srcOff];  { 0464:13b3  same mask byte for the 4 plane bytes }
          Inc(srcOff);                                                     { 0464:13ec }
          Dec(phase);  if phase = 0 then begin phase := 4; Inc(maskOff) end;   { 0464:13ef  quirk: phase not reset per row }
          Inc(dstOff);                                                     { 0464:13ff }
        end;
      end else begin
        Move(src^.pix[srcOff], dst^.pix[dstOff], rowBytes);                { 0464:140c }
        srcOff := srcOff + rowBytes;  dstOff := dstOff + rowBytes;         { 0464:1430 }
      end;
      if dstOff - 1 > g_4D70[dstRow] then g_4D70[dstRow] := dstOff - 1;    { 0464:143c }
      srcOff := srcOff + skipR;  maskOff := maskOff + maskSkipR;           { 0464:1458 }
      bgOff := bgOff + skipR;  dstOff := dstOff + dstSkip;                 { 0464:1464 }
      Inc(dstRow);                                                         { 0464:1470 }
    end;
  end;
end;                                                                       { other modes: nothing drawn }
```
Notes: the signed-byte-count quirk affects only masked draws. In mode 1 the mask index advances per row by the
skips even when `masked` is false (harmless). The row loop runs
`lastRow+1` times starting at destination row `dstRow`; `g_4D70`/`g_4C20` are only widened, never reset here
(PresentDirtyRows resets them).

### 0464:1484 ReverseBits (H)
`function ReverseBits(b [BP+6]: Byte): Byte` (retf 2) — caller: MirrorPicture (EGA plane bytes and EGA mask).
```pascal
r := Byte(b shl 7);                                                        { 0464:148a  bit0 → bit7 }
r := r + (b and $02) shl 5 + (b and $04) shl 3 + (b and $08) shl 1;        { 0464:1497 }
r := r + (b and $10) shr 1 + (b and $20) shr 3 + (b and $40) shr 5 + (b and $80) shr 7;   { 0464:14c1 }
ReverseBits := r;                                                          { 0464:14fa  = the 8 bits in reverse order }
```

### 0464:1509 MirrorCgaWord (H)
`function MirrorCgaWord(w [BP+6]: Word): Word` (retf 2) — caller: MirrorPicture (CGA mode).
Reverses the order of the eight 2-bit fields of `w` using the mask table `g_25E5..g_25F3` = C000h, 3000h, 0C00h,
0300h, 00C0h, 0030h, 000Ch, 0003h (image words, H). Because the word holds two CGA bytes little-endian, the result
stored back is the 8-pixel group mirrored left↔right.
```pascal
r := (w and g_25F3) shl 14;                                                { 0464:150f  0003h }
r := r + (w and g_25F1) shl 10 + (w and g_25EF) shl 6 + (w and g_25ED) shl 2;   { 0464:151e  000Ch, 0030h, 00C0h }
r := r + (w and g_25EB) shr 2 + (w and g_25E9) shr 6;                      { 0464:154b  0300h, 0C00h }
r := r + (w and g_25E7) shr 10 + (w and g_25E5) shr 14;                    { 0464:1569  3000h, C000h }
MirrorCgaWord := r;                                                        { 0464:1587 }
```

### 0464:1596 SwapNibbles (H)
`function SwapNibbles(b [BP+6]: Byte): Byte` (retf 2) — caller: MirrorPicture (packed 4-bpp mode 2).
```pascal
SwapNibbles := Byte(b shl 4) + (b and $F0) shr 4;                          { 0464:159c }
```

### 0464:15C7 MirrorPicture (H)
`procedure MirrorPicture(src [BP+0Ah], dst [BP+6]: PPicture)` (retf 8)
callers: CopyCombatAnimationFrame (00BA:1901), DrawIconAt DrawIconAt (c000:0592) — both push the icon `g_5E5A[...]` first, then the temporary picture (argument order H).
callees: System.Move, MirrorCgaWord, ReverseBits, SwapNibbles.
Writes into `dst` (already allocated with the same geometry) the left↔right mirror image of `src`'s **first frame**
(only `height` rows are processed — quirk: frames 2.. are not mirrored) and of its mask. Name H: VIEW.pas.md
DrawIconAt uses it for icons facing left (dir ≥ 4).
```pascal
if (src = nil) or (dst = nil) then Exit;                                   { 0464:15cd }
p := src;                                                                  { 0464:15e0 }
Move(p^.cga_map, dst^.cga_map, 8);                                         { 0464:15e9 }
case VideoMode of                                                          { 0464:1604 }
  0: begin                                                                 { 0464:160e  CGA: 2 bytes per 8 px }
    rowBytes := p^.width8 * 2;                                             { 0464:160e }
    srcEnd := rowBytes - 2;                                                { 0464:161a  last word of row 1 }
    di := 0;                                                               { 0464:1622 }
    for y := 1 to p^.height do begin                                       { 0464:1627 }
      rowStart := di;                                                      { 0464:1643 }
      for c := 0 to p^.width8 - 1 do begin                                 { 0464:1649 }
        Move(p^.pix[srcEnd - di + rowStart], w, 2);                        { 0464:1666  mirrored source word }
        w := MirrorCgaWord(w);                                             { 0464:1688 }
        Move(w, dst^.pix[di], 2);                                          { 0464:1692 }
        if p^.mask <> nil then begin                                       { 0464:16ae }
          Move(p^.mask^[srcEnd - di + rowStart], w, 2);                    { 0464:16bb }
          w := MirrorCgaWord(w);                                           { 0464:16dd }
          Move(w, dst^.mask^[di], 2);                                      { 0464:16e7  quirk: dst^.mask not checked for nil }
        end;
        di := di + 2;                                                      { 0464:1703 }
      end;
      srcEnd := srcEnd + rowBytes;                                         { 0464:1712 }
    end;
  end;
  1: begin                                                                 { 0464:172d  EGA: 4 plane bytes per 8 px }
    rowBytes := p^.width8 * 4;                                             { 0464:172d }
    srcEnd := rowBytes - 4;                                                { 0464:173b }
    di := 0;                                                               { 0464:1744 }
    for y := 1 to p^.height do begin                                       { 0464:1749 }
      rowStart := di;                                                      { 0464:1765 }
      for c := 1 to p^.width8 do begin                                     { 0464:176b }
        for plane := 0 to 3 do                                             { 0464:1785 }
          dst^.pix[di + plane] := ReverseBits(p^.pix[srcEnd - di + rowStart + plane]);   { 0464:178e }
        di := di + 4;                                                      { 0464:17c7 }
      end;
      srcEnd := srcEnd + rowBytes;                                         { 0464:17d3 }
    end;
    if p^.mask <> nil then begin                                           { 0464:17e1  mask: width8 bytes per row }
      m := 0;                                                              { 0464:17f1 }
      for y := 1 to p^.height do begin                                     { 0464:17f6 }
        for c := 0 to p^.width8 - 1 do                                     { 0464:180f }
          dst^.mask^[m + p^.width8 - c - 1] := ReverseBits(p^.mask^[m + c]);   { 0464:1829  quirk: dst^.mask not checked }
        m := m + p^.width8;                                                { 0464:1864 }
      end;
    end;
  end;
  2: begin                                                                 { 0464:1880  packed 4 bpp: 4 bytes per 8 px }
    rowBytes := p^.width8 * 4;                                             { 0464:1880 }
    srcEnd := rowBytes - 1;                                                { 0464:188e  last byte of row 1 }
    di := 0;                                                               { 0464:1895 }
    for y := 1 to p^.height do begin                                       { 0464:189a }
      rowStart := di;                                                      { 0464:18b6 }
      for c := 1 to rowBytes do begin                                      { 0464:18bc }
        dst^.pix[di] := SwapNibbles(p^.pix[srcEnd - di + rowStart]);       { 0464:18d2 }
        if p^.mask <> nil then
          dst^.mask^[di] := SwapNibbles(p^.mask^[srcEnd - di + rowStart]); { 0464:18f7  quirk: dst^.mask not checked }
        Inc(di);                                                           { 0464:192f }
      end;
      srcEnd := srcEnd + rowBytes;                                         { 0464:193a }
    end;
  end;
end;                                                                       { other modes: only cga_map copied }
```

## res_0464 part R2 — picture blit, view flush, recolour, picture alloc/free, rectangle fill, palette (0464:1951 .. 0464:2A4E)

Conventions as VIEW.pas.md: Pascal-order signatures (first parameter = highest BP offset = pushed first), `{ 0464:oooo }` = first
instruction of the statement. Picture record (`PPicture`, built by LoadPicture 0464:0111 / AllocPicture 0464:248E, PICTURES.md):
`+0 height` (pixel lines), `+2 width` (8-pixel cells), `+4 x`, `+6 y`, `+8 count` (frames), `+9 cgaMap[8]` (16 nibbles EGA→CGA),
`+11h frameSize` (bytes per frame, set by AllocPicture), `+13h mask` (far ptr or nil), `+17h data`.
`VideoMode` = `g_4A1E`: 0 = CGA 2 bpp (2 bytes per cell row), 1 = EGA planar (4 bytes per cell row = one byte per plane,
planes interleaved), 2 = 4 bpp packed (4 bytes per cell row; Tandy/PCjr-style, M). Mode names M (from the byte layouts below and
the EGA port I/O, H for EGA).
View dirty-span tables (used for the off-screen view picture `g_4A20^`, 168 lines = 0A8h, H from 1B52):
`g_4A28[line]` byte dirty flag, `g_4C20[line]` word lowest changed data offset (reset FFFFh), `g_4D70[line]` word highest changed
data offset (reset 0), `g_4AD0[line]` word screen byte column of the span start (in mode bytes).
Screen line tables (built by InitGameState): `g_4EC0[y]` CGA segment of pixel line y, `g_5050[y]` EGA offset of line y in A000h,
`g_51E0[y]` mode-2 segment of line y. `g_25F6[0..3]` = 01 02 04 08 (plane bits). CGA tables: `g_25FA[c*4+p]` = bits of CGA
colour c at pixel position p in a byte (00 00 00 00 / 40 10 04 01 / 80 20 08 02 / C0 30 0C 03), `g_25ED[p]` (word) = mask of pixel p
(C0h 30h 0Ch 03h). Fill-byte tables: `g_0D02[c]` = 00 55 AA FF (CGA), `g_0D06[c]` = c*11h (mode 2). All table bytes: image (H).

### 0464:1951 PutPicture (H)
`procedure PutPicture(col [BP+0Ch], row [BP+0Ah]: Integer; pic [BP+6]: PPicture)` (retf 8) — callers: Put8x8Symbol (ov34),
ShowTitle (title), DrawPictureScreenOrView (pushes `[BP+0Eh],[BP+0Ch]` then the pic pointer, ac00:003b). Callees: System.Move.
Copies frame 0 of `pic` straight to video memory, top-left at text cell (col, row) = pixel (col*8, row*8); no clipping, no mask.
```pascal
if pic = nil then Exit;                                                   { 0464:1957 }
if VideoMode = 0 then begin                                               { 0464:196b  CGA }
  lineBytes := pic^.width * 2;                                            { 0464:1975 }
  src := 0;                                                               { 0464:1981 }
  for y := row*8 to row*8 + pic^.height - 1 do begin                      { 0464:1986 }
    Move(pic^.data[src], Ptr(g_4EC0[y], col*2)^, lineBytes);              { 0464:19bb }
    src := src + lineBytes;                                               { 0464:19e1 }
  end;
end else if VideoMode = 1 then begin                                      { 0464:19f2  EGA }
  src := 0;                                                               { 0464:19f9 }
  Port[$3C4] := 2;                                                        { 0464:1a29  sequencer: map mask register }
  for y := row*8 to row*8 + pic^.height - 1 do                            { 0464:1a2f }
    for x := col to col + pic^.width - 1 do                               { 0464:1a48 }
      for p := 0 to 3 do begin                                            { 0464:1a5e }
        Port[$3C5] := g_25F6[p];                                          { 0464:1a67  select plane p }
        Mem[$A000 : g_5050[y] + x] := pic^.data[src];                     { 0464:1a76 }
        src := src + 1;                                                   { 0464:1aa5 }
      end;
  Port[$3C5] := $0F;                                                      { 0464:1abe  all planes again }
end else if VideoMode = 2 then begin                                      { 0464:1ac7 }
  lineBytes := pic^.width * 4;                                            { 0464:1ace }
  src := 0;                                                               { 0464:1adc }
  for y := row*8 to row*8 + pic^.height - 1 do begin                      { 0464:1ae1 }
    Move(pic^.data[src], Ptr(g_51E0[y], col*4)^, lineBytes);              { 0464:1b18 }
    src := src + lineBytes;                                               { 0464:1b3e }
  end;
end;
```
Note: name H (behaviour; the VIEW lane's "blit a picture at a cell position" agrees). Loop bounds are signed (`JG`).

### 0464:1B52 FlushViewDirtyLines (H)
`procedure FlushViewDirtyLines` (retf) — callers: FlushView (ov29), DrawPictureScreenOrView, Show3DSprite, FocusSquare/0AF8/0E11, DrawOverlandParty, RecolourOverlandTiles,
RemoveFromCombat, AnimateAlongPath, ShowCombatMessageAnimation, DrawIconPreview, PlayFinaleAnimation. Callees: System.Move, System.FillChar.
Copies the changed span of every dirty line of the view picture `g_4A20^` (168 lines) to the screen at pixel (8, line+8), then
resets the dirty tables.
```pascal
if VideoMode = 0 then begin                                               { 0464:1b58  CGA }
  for line := 0 to $A7 do                                                 { 0464:1b5f }
    if g_4A28[line] <> 0 then                                             { 0464:1b69 }
      Move(g_4A20^.data[g_4C20[line]],                                    { 0464:1b73 }
           Ptr(g_4EC0[line+8], g_4AD0[line] + 2)^,
           g_4D70[line] - g_4C20[line] + 1);                              { 0464:1bbb }
end else if VideoMode = 1 then begin                                      { 0464:1bca  EGA }
  Port[$3C4] := 2;                                                        { 0464:1bd1  map mask }
  for line := 0 to $A7 do begin                                           { 0464:1bd7 }
    if g_4A28[line] <> 0 then begin                                       { 0464:1be1 }
      dst := g_5050[line+8] + g_4AD0[line] + 1;                           { 0464:1bee }
      for p := 0 to 3 do begin                                            { 0464:1c09  unrolled 4x in the code }
        Port[$3C5] := g_25F6[p];                                          { 0464:1c09 / 1c4f / 1c96 / 1cde }
        s := g_4C20[line] + p;  d := dst;                                 { 0464:1c10 }
        repeat                                                            { 0464:1c22 }
          Mem[$A200 : d] := g_4A20^.data[s];                              { 0464:1c22  off-screen VRAM page at A000:2000 }
          s := s + 4;  d := d + 1;                                        { 0464:1c3a }
        until s > g_4D70[line];                                           { 0464:1c41  JBE: unsigned }
      end;
    end;
  end;
  Port[$3C5] := $0F;                                                      { 0464:1d31 }
  d := g_5060 + 1;                                                        { 0464:1d37  g_5060 = g_5050[8] (line 8) }
  PortW[$3CE] := $0105;                                                   { 0464:1d3e  graphics ctrl reg 5 := 1: write mode 1 (latch copy) }
  for line := 0 to $A7 do begin                                           { 0464:1d4a }
    if g_4A28[line] <> 0 then                                             { 0464:1d54 }
      Move(Mem[$A200 : d + g_4AD0[line]], Mem[$A000 : d + g_4AD0[line]],  { 0464:1d5e }
           (g_4D70[line] - g_4C20[line]) div 4 + 1);                      { 0464:1da0 }
    d := d + $28;                                                         { 0464:1da5  40 bytes per EGA line }
  end;
  Port[$3CF] := 0;                                                        { 0464:1db0  write mode 0 }
end else if VideoMode = 2 then begin                                      { 0464:1db8 }
  for line := 0 to $A7 do                                                 { 0464:1dbc }
    if g_4A28[line] <> 0 then                                             { 0464:1dc6 }
      Move(g_4A20^.data[g_4C20[line]],                                    { 0464:1dd0 }
           Ptr(g_51E0[line+8], g_4AD0[line] + 4)^,
           g_4D70[line] - g_4C20[line] + 1);                              { 0464:1e19 }
end;
FillChar(g_4A28, $A8, 0);                                                 { 0464:1e25  no line dirty }
FillChar(g_4C20, $150, $FF);                                              { 0464:1e36  lowest offset := FFFFh }
FillChar(g_4D70, $150, 0);                                                { 0464:1e47  highest offset := 0 }
```
Quirks: the EGA path writes the planes into the off-screen page (A200h) first and then copies with the latch write mode, so the
visible page never shows a half-written line; `Move` between two VRAM addresses works only because write mode 1 copies the
latches (every read loads all 4 planes, every write stores them). The EGA second pass uses `g_5060 + 1 + 40*line` instead of the
table (equal when the table is linear, H for EGA). The flush is driven by line index only: the screen x is `g_4AD0[line]` + 8 px.

### 0464:1E5C RecolorPicture (M)
`procedure RecolorPicture(const fromCol [BP+12h], toCol [BP+0Eh]: array[0..15] of Byte; frame [BP+0Ch]: Integer;
randomMix [BP+0Ah]: Boolean; pic [BP+6]: PPicture)` (retf 10h) — callers: LoadCombatIcon LoadCombatIcon (c000:03c0..03d9 pushes
`g_5E5A[k]` pair = from, then to, then `0`, `0`, the picture: icon colour customisation), LoadCharacterIcon (icon editor), RecolourOverlandTiles,
LoadAnimation, CopyIconSlot. Callees: AllocPicture, FreePicture, GetCgaMapEntry (CGA map lookup), System.@CopyBytes, Move,
@LongMul, RandomWord.
For every colour i with `fromCol[i] <> toCol[i]`, pixels of colour `fromCol[i]` in `pic` become `toCol[i]` — all 16 replacements
are tested against the *unchanged* original and written into a copy, so the remap is simultaneous (no chains). `frame < 0` = all
frames. `randomMix` replaces only about 1/4 of the matching pixels (dithered fade). Name M (behaviour).
```pascal
from := fromCol;  to_ := toCol;                                            { 0464:1e62  CopyBytes 16 each }
if pic = nil then Exit;                                                   { 0464:1e88 }
if frame < 0 then begin frame := 0; n := pic^.count end                    { 0464:1e9c }
else n := 1;                                                              { 0464:1eb3 }
src := frame * pic^.frameSize;                                            { 0464:1eb7  LongMul, low word }
dst := 0;                                                                 { 0464:1ed0 }
AllocPicture(pic^.height, pic^.width, n, 0, tmp);                         { 0464:1ed5  push height, width, n, 0, @tmp }
tmp^.cgaMap := pic^.cgaMap;                                               { 0464:1ef2  CopyBytes 8 }
Move(pic^.data[src], tmp^.data[dst], tmp^.count * tmp^.frameSize);        { 0464:1f0d }
for i := 0 to 15 do begin                                                 { 0464:1f3f }
  if frame < 0 then ... else ...;                                         { 0464:1f51  n recomputed exactly as above (frame is already >= 0 here) }
  src := frame * pic^.frameSize;  dst := 0;                               { 0464:1f6c }
  if from[i] = to_[i] then Continue;                                      { 0464:1f8a }
  case VideoMode of
  0: begin                                                                { 0464:1fae  CGA, 2 bpp }
       lineBytes := tmp^.width * 2;                                       { 0464:1fb8 }
       for gfx_LoopCounter := frame to frame + n - 1 do                            { 0464:1fc4  quirk: loop counter is a global byte, signed compare }
         for y := 1 to tmp^.height do                                     { 0464:1fe4 }
           for x := 1 to lineBytes do begin                               { 0464:2000 }
             for p := 0 to 3 do                                           { 0464:2019 }
               if (pic^.data[src] and g_25ED[p]) =                        { 0464:2022 }
                  g_25FA[GetCgaMapEntry(from[i], tmp^.cgaMap)*4 + p] then  {   CGA colour of from[i], bits at pixel p }
                 if (not randomMix) or (Random(4) = 0) then               { 0464:207a  quirk: randomMix tested twice }
                   tmp^.data[dst] := (tmp^.data[dst] and not g_25ED[p])   { 0464:2093 }
                     or g_25FA[GetCgaMapEntry(to_[i], tmp^.cgaMap)*4 + p];
             src := src + 1;  dst := dst + 1;                             { 0464:2101 }
           end;
     end;
  1: begin                                                                { 0464:212b  EGA planar }
       for p := 0 to 3 do                                                 { 0464:2132 }
         if (from[i] and g_25F6[p]) > 0 then want[p] := 0 else want[p] := $FF;  { 0464:213b }
       for gfx_LoopCounter := frame to frame + n - 1 do                            { 0464:2174 }
         for y := 1 to tmp^.height do                                     { 0464:2194 }
           for x := 1 to tmp^.width do begin                              { 0464:21b0 }
             if randomMix then m := Random(256) and Random(256)           { 0464:21cd  ~1/4 of the bits }
             else m := $FF;                                               { 0464:21ee }
             for p := 0 to 3 do                                           { 0464:21f2 }
               m := m and (pic^.data[src+p] xor want[p]);                 { 0464:21fb  bits of pixels whose colour = from[i] }
             for p := 0 to 3 do                                           { 0464:2224 }
               if (to_[i] and g_25F6[p]) > 0 then                         { 0464:222d }
                 tmp^.data[dst+p] := tmp^.data[dst+p] or m                { 0464:2248 }
               else
                 tmp^.data[dst+p] := tmp^.data[dst+p] and not m;          { 0464:2271 }
             src := src + 4;  dst := dst + 4;                             { 0464:22a4 }
           end;
     end;
  2: begin                                                                { 0464:22d0  4 bpp packed }
       lineBytes := tmp^.width * 4;                                       { 0464:22d7 }
       hiFrom := from[i] shl 4;  hiTo := to_[i] shl 4;                    { 0464:22e5 }
       for gfx_LoopCounter := frame to frame + n - 1 do                            { 0464:230d }
         for y := 1 to tmp^.height do                                     { 0464:232d }
           for x := 1 to lineBytes do begin                               { 0464:2349 }
             if (pic^.data[src] and $F0) = hiFrom then                    { 0464:2362  left pixel }
               if (not randomMix) or (Random(4) = 0) then                 { 0464:2375 }
                 tmp^.data[dst] := (tmp^.data[dst] and $0F) or hiTo;      { 0464:238e }
             if (pic^.data[src] and $0F) = from[i] then                   { 0464:23ad  right pixel }
               if (not randomMix) or (Random(4) = 0) then                 { 0464:23c9 }
                 tmp^.data[dst] := (tmp^.data[dst] and $F0) or to_[i];    { 0464:23e2 }
             src := src + 1;  dst := dst + 1;                             { 0464:240a }
           end;
     end;
  end;
end;
Move(tmp^.data[0], pic^.data[frame * pic^.frameSize], n * pic^.frameSize);  { 0464:243a  copy the result back }
FreePicture(tmp);                                                         { 0464:247f }
```
Quirks: `gfx_LoopCounter` (a DS byte) is the frame loop variable; the frame loop only repeats the same offsets per frame because `src`/`dst`
are not reset per frame — they continue through the frames, so all n frames are processed in sequence (H). The mask `+13h` is
not updated.

### 0464:248E AllocPicture (H)
`procedure AllocPicture(height [BP+10h], width [BP+0Eh]: Word; count [BP+0Ch]: Byte; flags [BP+0Ah]: Byte;
var pic [BP+6]: PPicture)` (retf 0Ch) — callers: LoadPicture (0464:0111), RecolorPicture, CopyCombatAnimationFrame, StartCombat, InitGameState,
LoadAnimation, DrawIconAt. Callees: System.GetMem, FillChar.
```pascal
frameSize := height * width * 2;                                          { 0464:2494  CGA: 2 bytes per cell row }
if VideoMode <> 0 then frameSize := frameSize * 2;                        { 0464:249f  EGA / mode 2: 4 bytes }
total := count * frameSize;                                               { 0464:24ae }
GetMem(pic, total + $17);                                                 { 0464:24b9 }
FillChar(pic^, total + $17, 0);                                           { 0464:24cf }
pic^.height := height;                                                    { 0464:24e6 }
pic^.width := width;                                                      { 0464:24f2 }
pic^.frameSize := frameSize;                                              { 0464:24ff }
pic^.count := count;                                                      { 0464:250c }
if (flags and 1) > 0 then                                                 { 0464:2519  with transparency mask }
  if VideoMode = 1 then begin                                             { 0464:2522 }
    GetMem(pic^.mask, total div 4);                                       { 0464:2529  EGA: 1 mask bit per pixel = 1/4 of the 4 plane bytes }
    FillChar(pic^.mask^, total div 4, 0);                                 { 0464:2544 }
  end else begin
    GetMem(pic^.mask, total);                                             { 0464:2562 }
    FillChar(pic^.mask^, total, 0);                                       { 0464:2578 }
  end;
```
Quirk: the mask is as large as the data in CGA and mode 2 (byte mask per data byte); `+4 x`, `+6 y`, `cgaMap` stay 0.

### 0464:2595 FreePicture (H)
`procedure FreePicture(var pic [BP+6]: PPicture)` (retf 4) — callers: LoadPicture, RecolorPicture, CopyCombatAnimationFrame, EndCombat,
ShowTitle, StartCombat, MoveParty, FreeAnimation, Load24x24Set/014E/04FC. Callees: System.FreeMem.
```pascal
if pic = nil then Exit;                                                   { 0464:259b }
total := pic^.count * pic^.frameSize;                                     { 0464:25b6 }
if pic^.mask <> nil then                                                  { 0464:25c9 }
  if VideoMode = 1 then FreeMem(pic^.mask, total div 4)                   { 0464:25d6 }
  else FreeMem(pic^.mask, total);                                         { 0464:25f7 }
FreeMem(pic, total + $17);                                                { 0464:260a }
pic := nil;                                                               { 0464:2620 }
```
Note: the mask pointer itself is not cleared (the record is freed anyway).

### 0464:2632 FillPictureRect (H)
`procedure FillPictureRect(x [BP+16h], y [BP+14h]: Integer; w [BP+12h], h [BP+10h]: Word; colour [BP+0Eh]: Byte;
const cgaMap [BP+0Ah]: TCgaMap; pic [BP+6]: PPicture)` (retf 12h) — callers: DrawBackdrop (ov29 b100:0177..0198 pushes
2, 10h, 0Bh, 2Bh, g_6A60, @g_260A, g_4A20 → x=2, y=16, w=11 cells, h=43 lines), DrawIconPreview. Callees: GetCgaMapEntry,
System.@CopyBytes, FillChar, Move.
Fills the rectangle of w cells × h lines at cell column x, pixel line y of `pic` (frame 0) with `colour`, clipped to the picture,
and records the changed spans in the view dirty tables.
```pascal
map := cgaMap;                                                            { 0464:2638  CopyBytes 8 }
if pic = nil then Exit;                                                   { 0464:264b }
if x < 0 then begin skipL := Abs(x); x0 := 0 end                          { 0464:2656 }
else begin skipL := 0; x0 := x end;                                       { 0464:266e }
if pic^.width < x + w then begin                                          { 0464:2679  32-bit signed compare }
  skipR := x + w - pic^.width;  tail := 0                                 { 0464:26a1 }
end else begin
  skipR := 0;  tail := pic^.width - (x + w)                               { 0464:26cd }
end;
if y < 0 then begin                                                       { 0464:26f7 }
  ofs := 0;  line := 0;                                                   { 0464:26fd }
  last := h - Abs(y);                                                     { 0464:2707  quirk: no "- 1" here, one extra line; no bottom clip }
end else begin
  line := y;                                                              { 0464:2722 }
  ofs := line * pic^.width;                                               { 0464:2728 }
  last := h - 1;                                                          { 0464:2735 }
  if pic^.height < y + h then last := pic^.height - 1 - y;                { 0464:273c }
end;
if (VideoMode = 0) or (VideoMode = 2) then begin                          { 0464:2784  byte-packed modes }
  if VideoMode = 0 then begin                                             { 0464:2792 }
    spanX := x0 * 2;  rowBytes := (w - skipL - skipR) * 2;                { 0464:2799 }
    x0 := x0 * 2;  tail := tail * 2;  ofs := ofs * 2;                     { 0464:27af }
  end else begin
    rowBytes := (w - skipL - skipR) * 4;                                  { 0464:27c9 }
    x0 := x0 * 4;  tail := tail * 4;  ofs := ofs * 4;                     { 0464:27d9 }
    spanX := x0;                                                          { 0464:27f7 }
  end;
  for r := 0 to last do begin                                             { 0464:27fd  unsigned bound }
    g_4A28[line] := 1;                                                    { 0464:2815  line dirty }
    ofs := ofs + x0;                                                      { 0464:281d }
    if g_4C20[line] > ofs then begin                                      { 0464:2823 }
      g_4AD0[line] := spanX;  g_4C20[line] := ofs                         { 0464:2831 }
    end;
    if VideoMode = 0 then                                                 { 0464:2849 }
      FillChar(pic^.data[ofs], rowBytes, g_0D02[GetCgaMapEntry(colour, map)])  { 0464:2850  CGA fill byte 00/55/AA/FF }
    else
      FillChar(pic^.data[ofs], rowBytes, g_0D06[colour]);                 { 0464:287e  colour*11h }
    ofs := ofs + rowBytes;                                                { 0464:28a0 }
    if ofs - 1 > g_4D70[line] then g_4D70[line] := ofs - 1;               { 0464:28a6 }
    ofs := ofs + tail;                                                    { 0464:28c2 }
    line := line + 1;                                                     { 0464:28c8 }
  end;
end else if VideoMode = 1 then begin                                      { 0464:28d9  EGA }
  spanX := x0;                                                            { 0464:28e0 }
  cells := w - skipL - skipR;                                             { 0464:28e6 }
  x0 := x0 * 4;  tail := tail * 4;  ofs := ofs * 4;                       { 0464:28f2 }
  FillChar(planeByte, 4, 0);                                              { 0464:2910 }
  for p := 0 to 3 do                                                      { 0464:2921 }
    if (g_25F6[p] and colour) > 0 then planeByte[p] := $FF;               { 0464:292a }
  for r := 0 to last do begin                                             { 0464:294d }
    g_4A28[line] := 1;                                                    { 0464:2965 }
    ofs := ofs + x0;                                                      { 0464:296d }
    if g_4C20[line] > ofs then begin                                      { 0464:2973 }
      g_4AD0[line] := spanX;  g_4C20[line] := ofs                         { 0464:2981 }
    end;
    for gfx_LoopCounter := 1 to ShortInt(cells) do begin                           { 0464:2999  quirk: global byte counter, signed: > 127 cells fills nothing }
      Move(planeByte, pic^.data[ofs], 4);                                 { 0464:29af }
      ofs := ofs + 4;                                                     { 0464:29cb }
    end;
    if ofs - 1 > g_4D70[line] then g_4D70[line] := ofs - 1;               { 0464:29d7 }
    ofs := ofs + tail;                                                    { 0464:29f3 }
    line := line + 1;                                                     { 0464:29f9 }
  end;
end;
```
Quirks: the dirty tables are updated whatever picture is filled (they only make sense for the view picture `g_4A20^`; every
current caller passes it). The data offset uses frame 0 only. Correction for VIEW.pas.md DrawBackdrop: its `FillRect(...)` lines list
the arguments in reverse; the Pascal call is `FillPictureRect(2, $10, $0B, $2B, g_6A60, @g_260A, g_4A20)` etc.

### 0464:2A0D SetEgaPaletteRegister (H)
`procedure SetEgaPaletteRegister(index [BP+8], colour [BP+6]: Byte)` (retf 4) — callers: ShowTitle (title fades), PaletteFlashOn,
PaletteFlashOff. Callees: Dos.Intr.
```pascal
Regs.AH := $10;  Regs.AL := 0;                                            { 0464:2a10  g_4A03 / g_4A02: INT 10h AX=1000h set palette register }
if colour < 8 then Regs.BH := colour                                      { 0464:2a1a }
else Regs.BH := colour + 8;                                               { 0464:2a28  8..15 -> 10h..17h }
Regs.BL := index;                                                         { 0464:2a33 }
Intr($10, Regs);                                                          { 0464:2a39  Regs = g_4A02 (TP Registers record) }
```
Note: BH is the EGA palette value. Colours 8..15 become 10h..17h (bit 4 set), not the 350-line bright values 38h..3Fh: in the
200-line EGA modes the monitor reads bit 4 as intensity, so 10h..17h are the bright colours there (M: depends on the video mode set
by ov11; the arithmetic is H).

### 0464:2A4A Init0464 init 0464 (H)
`procedure Init0464` — called by the main program's unit-init chain.
```pascal
{ empty: PUSH BP / MOV BP,SP / POP BP / RETF }                            { 0464:2a4a }
```

---

## res_0709 (0709) — text cells, 8×8 font, video pages, bottom-line prompts and input (part S)

Conventions as VIEW.pas.md: Pascal-order signatures (first parameter = highest BP offset = pushed first), parameters
as `name [BP+xx]`, `{ 0709:oooo }` = first instruction of the statement. Text coordinates are 8×8 cells:
col 0..39, row 0..24. `VideoMode` = g_4A1E (view_names.json; 0 = CGA 4-colour B800/BA00, 1 = EGA planar A000,
2 = 16-colour 4-bank B800/BA00/BC00/BE00, i.e. Tandy/PCjr layout — names of modes 0/2 M, from the memory layout).
Globals introduced here (S_names.json): g_49E2 GameSpeed, g_4A16 DisplayPageSeg, g_4A18 DrawPageSeg,
g_4A1A CurrentDrawPage, g_5E20 FontPtr, g_4A02 Regs (Dos `Registers` record used with Intr).
TP string functions (09E3) return through a hidden result pointer pushed first by the caller (not popped by RETF).

### 0709:0000 ResetEgaRegisters (H)
`procedure ResetEgaRegisters` — callers: FillEgaTextRectangle. Port writes only.
```pascal
Port[$3CE] := 0; Port[$3CF] := 0;      { 0709:0003  GC 0 set/reset := 0 }
Port[$3CE] := 1; Port[$3CF] := 0;      { 0709:000f  GC 1 enable set/reset := 0 }
Port[$3CE] := 2; Port[$3CF] := 0;      { 0709:001b  GC 2 colour compare := 0 }
Port[$3CE] := 3; Port[$3CF] := 0;      { 0709:0027  GC 3 rotate/function := 0 }
Port[$3CE] := 4; Port[$3CF] := 0;      { 0709:0033  GC 4 read map := 0 }
Port[$3CE] := 5; Port[$3CF] := 0;      { 0709:003f  GC 5 mode := write mode 0 }
Port[$3CE] := 7; Port[$3CF] := $0F;    { 0709:004b  GC 7 colour don't care := 0Fh }
Port[$3CE] := 8; Port[$3CF] := $FF;    { 0709:0057  GC 8 bit mask := FFh }
Port[$3C4] := 2; Port[$3C5] := $0F;    { 0709:0063  sequencer map mask := all planes }
```

### 0709:0071 SetDisplayPage (H)
`procedure SetDisplayPage(page [BP+6]: Byte)` — callers: InitConfiguration (startup).
```pascal
Regs.AH := 5;                     { 0709:0074  g_4A03 }
Regs.AL := page;                  { 0709:0079  g_4A02 }
Intr($10, Regs);                  { 0709:007f  BIOS: select active display page }
DisplayPageSeg := $A000 + page shl 9;  { 0709:008c  g_4A16: 8 KB per page }
```

### 0709:00A0 SetDrawPage (H)
`procedure SetDrawPage(page [BP+6]: Byte)` — callers: InitConfiguration, FillEgaTextRectangle.
```pascal
DrawPageSeg := $A000 + page shl 9;     { 0709:00a3  g_4A18 }
```

### 0709:00B7 FillEgaTextRectangle (H)
`procedure FillEgaTextRectangle(x1 [BP+10h], y1 [BP+0Eh], x2 [BP+0Ch], y2 [BP+0Ah]: ShortInt; page [BP+8], colour [BP+6]: Byte)`
— callers: ClearRectangle, ClearScreen, ClearTextRectangle. callees: SetDrawPage, ResetEgaRegisters, FillChar.
Fills the cell rectangle (x1,y1)-(x2,y2) of EGA page `page` with `colour` (write mode 2: the written byte value is the colour of all 8 pixels).
```pascal
saved := CurrentDrawPage;                              { 0709:00bd  g_4A1A }
ofs := y1 * 40 * 8 + x1;                               { 0709:00c3  byte offset of the first scan line (signed byte args) }
lastLine := (y2 - y1 + 1) * 8 - 1;                     { 0709:00e2 }
SetDrawPage(page);                                     { 0709:00f7 }
ResetEgaRegisters;                                     { 0709:00ff }
Port[$3CE] := 5; Port[$3CF] := 2;                      { 0709:0103  write mode 2 }
for line := 0 to lastLine do begin                     { 0709:010f }
  FillChar(Ptr(DrawPageSeg, ofs)^, x2 - x1 + 1, colour); { 0709:0124 }
  ofs := ofs + 40;                                     { 0709:0145 }
end;
Port[$3CE] := 5; Port[$3CF] := 0;                      { 0709:0151  write mode 0 }
CurrentDrawPage := saved;                              { 0709:015d }
SetDrawPage(CurrentDrawPage);                          { 0709:0163 }
```

### 0709:017C LoadTextFont (H)
`procedure LoadTextFont` — callers: InitGameState (game init). callees: LoadDaxRecord 0802:0716, Move, FreeMem.
```pascal
LoadDaxRecord('8X8d1', '.dax', $C9, size, p);          { 0709:0182  args pushed: name, ext, id C9h, var size, var ptr }
if size <> 0 then begin                                { 0709:01b2 }
  Move(p^, FontPtr^, size);                            { 0709:01ba  g_5E20: preallocated 8-bytes-per-glyph font }
  FreeMem(p, size);                                    { 0709:01cd }
end;
```

### 0709:01DF DrawRepeatedGlyph (H)
`procedure DrawRepeatedGlyph(col [BP+10h], row [BP+0Eh], colour [BP+0Ch], count [BP+0Ah]: Byte; ch [BP+8]: Char; textMap [BP+6]: Boolean)` (RETF 0Ch)
— callers: ClearGlyphRun, DrawText, RenderWrappedRun, DrawOptions, DrawList, ecl_op3C_PrintMem, CodeWheelCheck.
Draws glyph `ch` `count` times from (col,row) rightwards, opaque: glyph pixels get `colour`, all other pixels of the cell palette **index 0** (EGA 0709:03ef..0449 writes the font byte to the planes in `colour` and 0 to the others). Index 0 is black except while combat's PaletteFlashOn BB00:00E3 has set palette register 0 to 08h (and 8 to 0): then the cell background shows dark gray 85,85,85 (fix #ref-4, DOSBox capture ENGINE-15-COMBAT). With `textMap` the glyph index is
`UpCase(ch) mod 64` (font holds the 64-glyph 6-bit set: '@A..Z[\]^_' = 0..31, ' '..'?' = 32..63); else `ch` is the raw glyph index.
```pascal
if (col > 39) or (row > 24) or (FontPtr = nil) then Exit;   { 0709:01e5 }
if textMap then g := Ord(UpCase(ch)) mod 64                 { 0709:01fd }
else g := Ord(ch);                                          { 0709:021a }
for i := 1 to count do begin                                { 0709:0220 }
  case VideoMode of                                         { 0709:0238  g_4A1E }
  0: begin                                                  { CGA 320x200x4, 2 banks }
       colour := CgaColourMap[colour];                      { 0709:0242  g_25D5 = 00 00 00 01 02 02 02 03 03 01 01 01 02 02 03 03;
                                                              quirk: re-applied for every repetition, so count > 1 maps twice }
       line := row * 4;  fl := 0;                           { 0709:0250 }
       for pair := 0 to 3 do begin                          { 0709:0261 }
         w := 0;                                            { 0709:026a  even scan line -> bank B800 }
         for bit := 0 to 7 do                               { 0709:026f }
           if FontPtr^[g*8 + fl] and ($80 shr bit) <> 0 then
             w := w or (CgaPixelMask[bit] and CgaFill[colour]); { 0709:029a  g_25E5 masks, g_25CD = 0000 5555 AAAA FFFF }
         MemW[$B800 : line*80 + col*2] := Swap(w);          { 0709:02cc }
         Inc(fl);                                           { 0709:02ee }
         w := 0;                                            { 0709:02f1  odd scan line -> bank BA00 }
         for bit := 0 to 7 do                               { 0709:02f6 }
           if FontPtr^[g*8 + fl] and ($80 shr bit) <> 0 then
             w := w or (CgaPixelMask[bit] and CgaFill[colour]); { 0709:0321 }
         MemW[$BA00 : line*80 + col*2] := Swap(w);          { 0709:0353 }
         Inc(fl); Inc(line);                                { 0709:0375 }
       end;
     end;
  1: begin                                                  { EGA planar, both pages }
       ofs := row * 8 * 40 + col;                           { 0709:038e }
       Port[$3C4] := 2;                                     { 0709:03a8  sequencer index: map mask }
       for fl := 0 to 7 do begin                            { 0709:03ae }
         for k := 0 to 3 do begin                           { 0709:03b7 }
           Port[$3C5] := PlaneBit[3 - k];                   { 0709:03c0  g_25C9 = 08 04 02 01 }
           if PlaneBit[3 - k] and colour <> 0 then begin    { 0709:03d6 }
             Mem[DisplayPageSeg : ofs] := FontPtr^[g*8 + fl];  { 0709:03ef }
             Mem[DrawPageSeg : ofs]    := FontPtr^[g*8 + fl];  { 0709:0415 }
           end else begin
             Mem[DisplayPageSeg : ofs] := 0;                { 0709:043d }
             Mem[DrawPageSeg : ofs]    := 0;                { 0709:0449 }
           end;
         end;
         ofs := ofs + 40;                                   { 0709:045e }
       end;
       Port[$3C5] := $0F;                                   { 0709:046b }
     end;
  2: begin                                                  { 16-colour, 4 interleaved banks, 4 bytes per glyph row }
       fl := 0; srow := row * 2; scol := col * 4;           { 0709:047b }
       for half := 0 to 1 do begin                          { 0709:0496 }
         for bank := 0 to 3 do begin                        { 0709:049f }
           mask := $80;
           for c := 0 to 3 do begin                         { 0709:04a8 }
             if FontPtr^[g*8 + fl] and mask <> 0 then b := colour shl 4 else b := 0;  { 0709:04b5 }
             mask := mask shr 1;
             if FontPtr^[g*8 + fl] and mask <> 0 then b := b or colour;              { 0709:04f0 }
             mask := mask shr 1;
             Mem[$B800 + bank*$200 : srow*160 + scol + c] := b;  { 0709:0521  banks B800/BA00/BC00/BE00 }
           end;
           Inc(fl);                                         { 0709:05bf }
         end;
         Inc(srow);                                         { 0709:05cb }
       end;
     end;
  end;
  Inc(col);                                                 { 0709:05d7 }
end;
```

### 0709:05EB ClearGlyphRun (H)
`procedure ClearGlyphRun(col [BP+0Ch], row [BP+0Ah], colour [BP+8], count [BP+6]: Byte)` — callers: ReadBottomLine,
ShowBottomPromptAndReadKey, ShowTimedBottomPrompt, InputNumber, ClearMenuLine.
```pascal
if (col <= 39) and (row <= 24) then                          { 0709:05ee }
  DrawRepeatedGlyph(col, row, colour, count, ' ', True);    { 0709:0608  blank cells (space glyph) }
```

### 0709:0626 DrawText (H)
`procedure DrawText(col [BP+0Eh], row [BP+0Ch], colour [BP+0Ah]: Byte; const s [BP+6]: String)` (RETF 0Ah) — ~50 callers (status lines, menus, sheets, LoadEclBlock "Loading...Please Wait").
```pascal
t := s;                                                      { 0709:062d  local String[255] }
if (col > 39) or (row > 39) then Exit;                       { 0709:0641  quirk: row tested against 39, not 24 }
for k := 1 to Length(t) do begin                             { 0709:064f }
  DrawRepeatedGlyph(col, row, colour, 1, t[k], True);       { 0709:0671 }
  Inc(col);                                                  { 0709:0694  no clipping at column 39 (DrawRepeatedGlyph drops cells > 39) }
end;
```

### 0709:06A7 RenderWrappedRun (nested in DrawWrappedText, H)
`procedure RenderWrappedRun(parentBP [BP+6])` — uses the frame of DrawWrappedText: `t` (text), `i` (next char), `j` (end of run), `colour`.
```pascal
while i <= j do begin                                        { 0709:06aa }
  DrawRepeatedGlyph(text_Col, text_Row, colour, 1, t[i], True);  { 0709:06bc  g_5E24 / g_5E25 }
  if TextOutputActive then Delay(GameSpeed * 10);            { 0709:06eb  g_4A00 (ecl_names), g_49E2: typewriter effect }
  Inc(i);                                                    { 0709:0702 }
  Inc(text_Col);                                             { 0709:070a }
end;
```

### 0709:0714 SkipLeadingSpaces (nested in DrawWrappedText, H)
`procedure SkipLeadingSpaces(parentBP [BP+6])`
```pascal
while (i < len) and (t[i] = ' ') do Inc(i);                  { 0709:0717 }
```

### 0709:0768 DrawWrappedText (H)
`procedure DrawWrappedText(x1 [BP+14h], y1 [BP+12h], x2 [BP+10h], y2 [BP+0Eh], colour [BP+0Ch]: Byte; clear [BP+0Ah]: Boolean; const s [BP+6]: String)` (RETF 10h)
— callers: ApplyEclDamage, ecl_op11_Print, ecl_op15_VerticalMenu, ecl_op29_EncounterMenu, ecl_op2E_Damage, DrawCharacterSummary, ShowCharacterMessage,
PayForCure, TreasureMenu/12E8, ShowAttackResult, MayLoseItem/1CEE/1F52, Temple, AfterCombat, Shop, ItemsMenu.
Callees: ClearTextRectangle, RenderWrappedRun, SkipLeadingSpaces, ShowBottomPromptAndReadKey, FUN_0899_0104 (no-op poll), SetIn.
Word-wrapped output inside the window (x1,y1)-(x2,y2) from the text cursor `text_Col/text_Row` (g_5E24/g_5E25).
`Punct` = the set constant at DS:0D16 = `['!', ',', '-', '.', ':', ';', '?']` (image bytes 02 70 00 8C, elements 32..63).
```pascal
t := s;                                                      { 0709:076f }
if (x1 > 39) or (y1 > 24) or (x2 > 39) or (y2 > 39) then Exit;  { 0709:0783  quirk: y2 tested against 39 }
if (text_Col < x1) or (text_Col > x2) or (text_Row < y1) or (text_Row > y2) then begin  { 0709:079e }
  text_Col := x1;  text_Row := y1;                           { 0709:07be  cursor outside the window -> top left }
end;
if clear then begin                                          { 0709:07ca }
  ClearTextRectangle(x1, y1, x2, y2);                        { 0709:07d0 }
  text_Col := x1;  text_Row := y1;                           { 0709:07e4 }
end;
i := 1;                                                      { 0709:07f0 }
len := Length(t);                                            { 0709:07f5 }
if len = 0 then Exit;                                        { 0709:07fd }
width := x2 - x1 + 1;                                        { 0709:0807  computed, never used }
repeat
  j := i;                                                    { 0709:081a }
  while (j < len) and (t[j] in Punct) do Inc(j);             { 0709:0822  leading punctuation belongs to the run }
  while (j < len) and not (t[j] in Punct) and (t[j] <> ' ') do Inc(j);  { 0709:085a  the word }
  if t[j] <> ' ' then                                        { 0709:08a1 }
    while (j + 1 < len) and (t[j+1] in Punct) do Inc(j);     { 0709:08b0  trailing punctuation }
  if (j - i) + text_Col > x2 then begin                      { 0709:08f2  run does not fit on this line }
    if ((j - i) + text_Col = x2) and (t[j] = ' ') then begin { 0709:0919  quirk: dead test (> x2 already holds) }
      Dec(j);  RenderWrappedRun;                             { 0709:094c }
    end;
    text_Col := x1;  Inc(text_Row);                          { 0709:0955  new line }
    SkipLeadingSpaces;                                       { 0709:095f }
    if (text_Row > y2) and (i < len) then begin              { 0709:0964  window full, text left }
      text_Col := x1;  text_Row := y1;                       { 0709:0976 }
      ShowBottomPromptAndReadKey($0D, 'Press any key to continue');  { 0709:0982  string at 0709:074E }
      FUN_0899_0104;                                         { 0709:0999  no-op }
      ClearTextRectangle(x1, y1, x2, y2);                    { 0709:099e }
      RenderWrappedRun;                                      { 0709:09b2  quirk: run printed without re-checking its width }
    end;
    { else: the run is re-scanned and printed in the next iteration }
  end else
    RenderWrappedRun;                                        { 0709:09b9 }
until i > len;                                               { 0709:09be }
if text_Col > x2 then begin                                  { 0709:09cb }
  text_Col := x1;  Inc(text_Row);                            { 0709:09d3 }
end;
```
Notes: a run wider than the window is printed anyway on the new line (text_Col then passes x2; cells beyond col 39 are
dropped by DrawRepeatedGlyph). The scans stop at `j < len`, so the final run always ends at `len`.

### 0709:09E3 ReadBottomLine (H)
`function ReadBottomLine(const prompt [BP+0Ah]: String[40]; colour [BP+8], maxLen [BP+6]: Byte): String[40]` (RETF 8; result pointer at [BP+0Eh])
— callers: ReadWordNumber, FUN_7000_1551, ecl_op10_InputString, CodeWheelCheck. callees: ClearGlyphRun, DrawText, ReadGameKey 0899:0059, UpCase.
```pascal
p := prompt;                                                 { 0709:09ea }
ClearGlyphRun(0, 24, 0, 40);                                 { 0709:09fd  clear the bottom row }
DrawText(0, 24, colour, p);                                  { 0709:0a0d }
x := Length(p);                                              { 0709:0a20 }
s := '';                                                     { 0709:0a26 }
repeat
  k := ReadGameKey;                                          { 0709:0a2b }
  if (k >= ' ') and (k <= 'z') then begin                    { 0709:0a38 }
    if Length(s) < maxLen then begin                         { 0709:0a40 }
      s := s + k;                                            { 0709:0a49 }
      Inc(x);                                                { 0709:0a7e }
      DrawText(x, 24, $0F, k);                               { 0709:0a81  typed text in white; first char at col Length(prompt)+1 }
    end;
  end else if (k = #8) and (Length(s) > 0) then begin        { 0709:0aa1 }
    s := Copy(s, 1, Length(s) - 1);                          { 0709:0aac }
    ClearGlyphRun(x, 24, 0, 1);                              { 0709:0ad8 }
    Dec(x);                                                  { 0709:0ae9 }
  end;
until (k = #13) or (k = #27);                                { 0709:0aec  quirk: Esc also returns the typed text }
ClearGlyphRun(0, 24, 0, 40);                                 { 0709:0afd }
for n := 1 to Length(s) do s[n] := UpCase(s[n]);             { 0709:0b0d }
ReadBottomLine := s;                                         { 0709:0b4c }
```

### 0709:0B66 ReadWordNumber (H)
`function ReadWordNumber(const prompt [BP+8]: String[40]; colour [BP+6]: Byte): Word` (RETF 6) — callers: ecl_op0F_InputNumber.
```pascal
p := prompt;                                                 { 0709:0b6d }
repeat
  s := ReadBottomLine(p, colour, 6);                         { 0709:0b80  up to 6 characters }
  Val(s, n, code);                                           { 0709:0ba4  n: LongInt }
  if (code = 0) and ((n > 65536) or (n < 0)) then code := 1; { 0709:0bb9  quirk: 65536 accepted (returns 0) }
until code = 0;                                              { 0709:0be0 }
ReadWordNumber := Word(n);                                   { 0709:0be6 }
```

### 0709:0BF5 ShowBottomPromptAndReadKey (H)
`procedure ShowBottomPromptAndReadKey(colour [BP+0Ah]: Byte; const s [BP+6]: String[40])` (RETF 6) — callers: ApplyEclDamage,
LoseItem, DrawWrappedText, EnsureSaveDir, ecl_op27_Treasure, ecl_op2E_Damage, HeapErrorHandler, AfterCombat, WriteCharList/069E/0EC4/1D58, DebugPrint.
```pascal
t := s;                                                      { 0709:0bfb }
ClearGlyphRun(0, 24, 0, 40);                                 { 0709:0c0e }
DrawText(0, 24, colour, t);                                  { 0709:0c1e }
key := ReadGameKey;                                          { 0709:0c31  result discarded; the prompt stays on screen }
```

### 0709:0C3F TimeInHundredths (H)
`function TimeInHundredths: LongInt` — callers: WaitSecondsOrKey, PlayFinaleAnimation, ShowTitle, HorizontalMenu.
```pascal
GetTime(h, m, sec, hund);                                    { 0709:0c45  Dos.GetTime(var h, m, s, s100) }
TimeInHundredths := h * 360000 + m * 6000 + sec * 100 + hund;  { 0709:0c5e  360000 = 5:7E40h }
```

### 0709:0CAB ClearScreen (H)
`procedure ClearScreen` — callers: DrawCharacterSheet, ItemsMenu.
```pascal
case VideoMode of                                            { 0709:0cae }
  0: begin FillChar(Ptr($BA00, 0)^, 8000, 0); FillChar(Ptr($B800, 0)^, 8000, 0) end;    { 0709:0cb5 }
  1: begin FillEgaTextRectangle(0, 0, 39, 24, 0, 0);         { 0709:0ce4  page 0 }
           FillEgaTextRectangle(0, 0, 39, 24, 1, 0) end;     { 0709:0cfa  page 1 }
  2: for bank := 0 to 3 do FillChar(Ptr($B800 + bank*$200, 0)^, 8000, 0);              { 0709:0d16  unrolled ×4 }
end;
```

### 0709:0D68 ShowTimedBottomPrompt (H)
`procedure ShowTimedBottomPrompt(const s [BP+8]: String[40]; colour [BP+6]: Byte)` (RETF 6) — callers: StepOverland,
ModifyCharacter, TrainCharacter, CodeWheelCheck, ExploreCommand.
```pascal
t := s;                                                      { 0709:0d6e }
ClearGlyphRun(0, 24, 0, 40);                                 { 0709:0d81 }
DrawText(0, 24, colour, t);                                  { 0709:0d91 }
MessageDelay;                                                { 0709:0da4 }
ClearGlyphRun(0, 24, 0, 40);                                 { 0709:0da8 }
```
Note the argument order differs from ShowBottomPromptAndReadKey: here the string is the first parameter.

### 0709:0DBE MessageDelay (H)
`procedure MessageDelay` — ~20 callers (ecl_op3A_Delay, combat, magic, sheets).
```pascal
Delay(GameSpeed * 225);                                      { 0709:0dc1  g_49E2 0..9 -> 0..2025 ms }
```

### 0709:0DD3 ClearTextRectangle (H)
`procedure ClearTextRectangle(x1 [BP+0Ch], y1 [BP+0Ah], x2 [BP+8], y2 [BP+6]: ShortInt)` (RETF 8) — callers: DrawWrappedText,
ApplyEclDamage, ecl_op15/29/2B/39/3D, HealMenu, TreasureMenu, Temple, Shop, DragonFinale, RestLoop, AppraiseGems, DebugPrint.
Clears cells (x1,y1)-(x2,y2) to colour 0.
```pascal
case VideoMode of                                            { 0709:0dd9 }
  0: for line := y1*4 to y2*4 + 3 do begin                   { 0709:0de3  CGA: 4 line pairs per cell row }
       FillChar(Ptr($B800, line*80 + x1*2)^, (x2 - x1 + 1) * 2, 0);  { 0709:0e24 }
       FillChar(Ptr($BA00, line*80 + x1*2)^, (x2 - x1 + 1) * 2, 0);  { 0709:0e46 }
     end;
  1: begin FillEgaTextRectangle(x1, y1, x2, y2, 0, 0);       { 0709:0e77 }
           FillEgaTextRectangle(x1, y1, x2, y2, 1, 0) end;   { 0709:0e91 }
  2: for line := y1*2 to y2*2 + 1 do                         { 0709:0eb5  4 banks, 2 lines per bank per cell row }
       for bank := 0 to 3 do                                 { 0709:0f00  unrolled }
         FillChar(Ptr($B800 + bank*$200, line*160 + x1*4)^, (x2 - x1 + 1) * 4, 0);
end;
```

### 0709:0F82 Unit0709Init (H)
`procedure Unit0709Init` — caller: main program init chain (0000:0024). Empty body.
```pascal
{ 0709:0f82  no statements }
```

---

## res_0802 (0802) — DAX files, disk prompts, BIOS text line, data-set switch (part T)

Conventions as VIEW.pas.md: Pascal-order signatures (first parameter = highest BP offset = pushed first), `{ 0802:oooo }` =
first instruction of the statement. Evidence: `python decode/ecl/hdis.py r0802 START END` (resident image, stubs
rewritten) = decode/listings/res_0802.lst. Runtime calls are written as the Pascal they implement (RT_LEDGER names; note
**0AF8:1593 = FilePos**, not FileSize — draft finding confirmed by its use here: it is compared with the data-area
start while the directory is being read, 0802:0860..0881).
Globals: `DataSet` = g_5376 (ecl_names), `VideoMode` = g_4A1E (0 CGA, 1 EGA; view_names), `Output` = DS:8608 (TP text
file). `Regs` = DS:4A02, a TP `Registers` record (AL 4A02, AH 4A03, BL 4A04, BH 4A05, CX 4A06, DL 4A08, DH 4A09) used
with `Dos.Intr`. Data at the DS offsets below were read from the image (START.unpacked.exe, DS = 0C7C):
`g_2614[1..8]` = string[29] `'Insert disk n in drive '` (stride 1Eh, index = DataSet; entry 0 is not a string),
`g_0D19` = string `' .*,?/\:;|'` (length byte 8Ch, only chars 1..10 used), `g_547C` = string whose first char
`g_547D` is the data drive letter (both BSS, set by ov11/ov01, L).

### 0802:0000 FreeBlock (H)
`procedure FreeBlock(var p [BP+8]: Pointer; size [BP+6]: Word)` (retf 6) — callers: LoadDaxRecord.
```pascal
FreeMem(p, (size + 7) and $FFF8);                       { 0802:0003  size rounded up to 8 }
```

### 0802:0020 AllocBlock (H)
`procedure AllocBlock(var p [BP+8]: Pointer; size [BP+6]: Word)` (retf 6) — callers: LoadDaxRecord.
```pascal
GetMem(p, (size + 7) and $FFF8);                        { 0802:0023 }
```

### 0802:0040 BiosPutChars (H)
`procedure BiosPutChars(col [BP+0Eh], row [BP+0Ch], colour [BP+0Ah], count [BP+8], ch [BP+6]: Byte)` (retf 0Ah) — callers: BiosWriteString, BiosFillChars. Callee: Dos.Intr.
BIOS INT 10h: set cursor (AH=2) then write `count` copies of `ch` with attribute (AH=9), on page `g_4A1B`; in EGA mode
the same is repeated on page `g_4A1A`.
```pascal
Regs.AH := 2; Regs.BH := g_4A1B; Regs.DH := row; Regs.DL := col;      { 0802:0043  set cursor }
Intr($10, Regs);                                                       { 0802:0062 }
Regs.AH := 9; Regs.AL := ch; Regs.BH := g_4A1B;                        { 0802:0067  write char + attribute }
if VideoMode = 0 then Regs.BL := g_25D5[colour]                        { 0802:0078  CGA: colour map }
else Regs.BL := colour;                                                { 0802:008f }
Regs.CX := count;                                                      { 0802:0095 }
Intr($10, Regs);                                                       { 0802:00a5 }
if VideoMode = 1 then begin                                            { 0802:00aa  EGA: second page }
  Regs.AH := 2; Regs.BH := g_4A1A; Regs.DH := row; Regs.DL := col;     { 0802:00b1 }
  Intr($10, Regs);                                                     { 0802:00d0 }
  Regs.AH := 9; Regs.AL := ch; Regs.BH := g_4A1A; Regs.BL := colour; Regs.CX := count;  { 0802:00d5 }
  Intr($10, Regs);                                                     { 0802:00fc }
end;
```

### 0802:0105 BiosWriteString (H)
`procedure BiosWriteString(col [BP+0Eh], row [BP+0Ch], colour [BP+0Ah]: Byte; s [BP+6]: String)` (retf 0Ah) — callers: BiosPromptLine.
```pascal
t := s;                                                                { 0802:010c }
for i := 1 to Length(t) do begin                                       { 0802:0120 }
  BiosPutChars(col, row, colour, 1, t[i]);                             { 0802:0142  push col,row,colour,1,ch }
  Inc(col);                                                            { 0802:0162 }
end;
```

### 0802:0175 BiosFillChars (H)
`procedure BiosFillChars(col [BP+0Ch], row [BP+0Ah], colour [BP+8], count [BP+6]: Byte)` (retf 8) — callers: BiosPromptLine.
```pascal
BiosPutChars(col, row, colour, count, #$DB);                          { 0802:0178  full block character }
```

### 0802:0193 BiosPromptLine (H)
`procedure BiosPromptLine(colour [BP+0Ah]: Byte; s [BP+6]: String[40])` (retf 6) — callers: OpenWithPrompt, LoadDaxRecord. Callees: BiosFillChars, BiosWriteString, ReadGameKey (wait for a key, M).
```pascal
t := s;                                                                { 0802:0199 }
BiosFillChars(0, 24, 0, 40);                                           { 0802:01ac  clear row 24 (blocks in colour 0) }
BiosWriteString(0, 24, colour, t);                                     { 0802:01bc }
key := ReadGameKey;                                                  { 0802:01cf  result unused }
BiosFillChars(0, 24, 0, 40);                                           { 0802:01d7 }
```

### 0802:0212 WaitOverlayDisk (H)
`procedure WaitOverlayDisk` — callers: InitConfiguration (startup unit). Callees: FileExists, WriteLn, ReadGameKey.
```pascal
repeat                                                                 { 0802:0218 }
  ok := FileExists('game.ovr');                                        { 0802:0218 }
  if not ok then begin                                                 { 0802:022e }
    WriteLn(Output, 'Please insert overlay disk.');                    { 0802:0234 }
    key := ReadGameKey;                                              { 0802:024b }
  end;
until ok;                                                              { 0802:0253 }
```

### 0802:025D OpenWithPrompt (H)
`function OpenWithPrompt(name [BP+10h], prompt [BP+0Ch]: String[40]; noPrompt [BP+0Ah]: Boolean; var f [BP+6]: File): Boolean` (retf 0Eh) — callers: OpenDax, InitGameState, ReadCharacter, LoadGame.
```pascal
n := name; p := prompt;                                                { 0802:0263 }
repeat
  ok := FileExists(n);                                                 { 0802:0289 }
  if not ok and not noPrompt then BiosPromptLine($0E, p);              { 0802:0295  yellow prompt on row 24, waits key }
until ok or noPrompt;                                                  { 0802:02ad }
if ok then begin                                                       { 0802:02b9 }
  Assign(f, n);                                                        { 0802:02bf }
  Reset(f, 1);                                                         { 0802:02ce  record size 1 }
end;
OpenWithPrompt := ok;                                                  { 0802:02dc }
```

### 0802:02EB FileExists (H)
`function FileExists(name [BP+6]: String[40]): Boolean` (retf 4) — callers: WaitOverlayDisk, OpenWithPrompt, ov17 (save/load/roster).
```pascal
n := name;                                                             { 0802:02f2 }
Assign(f, n);  {$I-} Reset(f, $80); Close(f); {$I+}                    { 0802:0305  record size 128 }
g_49CE := IOResult;                                                    { 0802:032f  last I/O result kept in a global }
FileExists := (g_49CE = 0) and (n <> '');                              { 0802:0337 }
```
{ quirk: Close is called even when Reset failed; its error is the one IOResult reports (TP keeps the first error). }

### 0802:0356 DeleteAll (H)
`function DeleteAll(s [BP+0Ah], sub [BP+6]: String): String` (retf 8; result buffer [BP+0Eh]) — caller: MakeDosName.
```pascal
a := s; b := sub;                                                      { 0802:035d }
n := Length(a) - Length(b) + 1;                                        { 0802:0385  computed once }
for i := 1 to n do                                                     { 0802:03aa }
  if Copy(a, i, Length(b)) = b then Delete(a, i, Length(b));           { 0802:03bc }
DeleteAll := a;                                                        { 0802:040b }
```
{ quirk: the loop bound is not reduced after a deletion and i still advances, so two adjacent occurrences leave the second one. }

### 0802:0425 MakeDosName (H)
`function MakeDosName(s [BP+6]: String): String[40]` (retf 4; result buffer [BP+0Ah]) — callers: WriteCharacter, ReadCharacter, LoadGame, SaveGame (character / save file names).
```pascal
a := s;                                                                { 0802:042c }
for i := 1 to 10 do                                                    { 0802:0440 }
  a := DeleteAll(a, g_0D19[i]);                                        { 0802:044b  removes ' ' . * , ? / \ : ; | }
a := Copy(a, 1, 8);                                                    { 0802:0489 }
for i := 1 to Length(a) do a[i] := UpCase(a[i]);                       { 0802:04b1 }
MakeDosName := a;                                                      { 0802:04f5 }
```

### 0802:050F DaxRleDecode (H)
`procedure DaxRleDecode(var src [BP+12h], dst [BP+0Eh]: Pointer; var compSize [BP+0Ah], rawSize [BP+6]: Word)` (retf 10h) — caller: LoadDaxRecord. rawSize is not used.
```pascal
si := 0; di := 0;                                                      { 0802:0515 }
repeat
  c := ShortInt(src^[si]);                                             { 0802:051f }
  if (c >= 0) and (c <= $7E) then begin                                { 0802:0533 }
    Move(src^[si+1], dst^[di], c + 1);                                 { 0802:053b  literal run }
    si := si + c + 2;  di := di + c + 1;                               { 0802:0561 }
  end else if (c >= -127) and (c <= -1) then begin                     { 0802:0574 }
    FillChar(dst^[di], -c, src^[si+1]);                                { 0802:057c  repeat run }
    si := si + 2;  di := di - c;                                       { 0802:05ac }
  end;                                                                 { quirk: c = 7Fh or 80h: no progress -> endless loop (not in data) }
until si >= compSize;                                                  { 0802:05b7 }
```

### 0802:05CD OpenDax (H)
`function OpenDax(name [BP+16h], ext [BP+12h]: String[40]; var dataStart [BP+0Eh]: Word; var dataF [BP+0Ah], dirF [BP+6]: File): Boolean` (retf 14h) — callers: LoadDaxRecord.
Two handles on the same file: `dataF` is positioned at the data area, `dirF` stays on the directory.
```pascal
n := name; e := ext;                                                   { 0802:05d4 }
ok := OpenWithPrompt(n + e,                                            { 0802:05fa }
                     g_2614[DataSet] + g_547D + ':',                   { 0802:0614  'Insert disk n in drive X:' }
                     g_557C <> 0, dataF);                              { 0802:064f  g_557C = no-prompt flag }
if ok then begin                                                       { 0802:065c }
  Assign(dirF, n + e);                                                 { 0802:0660 }
  Reset(dirF, 1);                                                      { 0802:0684  + IOCheck }
  BlockRead(dirF, dataStart, 2);                                       { 0802:0697  dir_size (+ IOCheck) }
  dataStart := dataStart + 2;                                          { 0802:06b4 }
  Seek(dataF, dataStart);                                              { 0802:06bb  + IOCheck }
  OpenDax := true;                                                     { 0802:06d4 }
end else OpenDax := false;                                             { 0802:06da }
```

### 0802:06E7 CloseDax (H)
`procedure CloseDax(var dataF [BP+0Ah], dirF [BP+6]: File)` (retf 8) — caller: LoadDaxRecord.
```pascal
Close(dataF);                                                          { 0802:06ea  + IOCheck }
Close(dirF);                                                           { 0802:06f9  + IOCheck }
```

### 0802:0716 LoadDaxRecord (H)
`procedure LoadDaxRecord(name [BP+14h], ext [BP+10h]: String[20]; id [BP+0Eh]: Byte; var size [BP+0Ah]: Word; var p [BP+6]: Pointer)` (retf 12h) —
callers: LoadPicture 0464:0111, LoadTextFont (8x8 font), LoadEclBlock, Load3DMap, LoadWallSet, ecl_op27_Treasure, LoadMonster LoadMonster, LoadAnimation.
Signature checked at the caller LoadEclBlock 4300:039B..03D3: pushes name ('ECL'+n), ext ('.dax'), id, @size, @p in this order.
`size` returns the **decompressed** size (raw_size); `p` = new heap block of that size (nil / size 0 if not found).
```pascal
n := name; e := ext;                                                   { 0802:071d }
if not OpenDax(g_547C + n, e, dataStart, dataF, dirF) then begin       { 0802:0743  drive/path prefix + name }
  size := 0; p := nil; exit;                                           { 0802:077c }
end;
repeat                                                                 { 0802:0793 }
  BlockRead(dirF, rid, 1);                                             { 0802:0793  + IOCheck each }
  BlockRead(dirF, ofs, 4);                                             { 0802:07b1  longint }
  BlockRead(dirF, size, 2);                                            { 0802:07cf  raw size -> caller's var }
  BlockRead(dirF, comp, 2);                                            { 0802:07ed }
  if comp > 36000 then begin                                           { 0802:080b  8CA0h }
    BiosPromptLine($0E, 'tempsize ' + Str(comp));                      { 0802:0812  Str(comp:0) into string[6] }
    Halt_0899_0000;                                                    { 0802:084d  TerminateGame (exit to DOS, M) }
  end;
until (rid = id) or (FilePos(dirF) >= dataStart);                      { 0802:0852 }
if rid <> id then begin                                                { 0802:0884 }
  size := 0; p := nil;                                                 { 0802:088c }
  CloseDax(dataF, dirF);                                               { 0802:08a0 }
  exit;
end;
AllocBlock(g_557E, comp);                                              { 0802:08b3  temp buffer for the packed data }
p := GetMem(size);                                                     { 0802:08bf  exact raw size }
Seek(dataF, dataStart + ofs);                                          { 0802:08d4  + IOCheck }
BlockRead(dataF, g_557E^, comp);                                       { 0802:08f2  + IOCheck }
CloseDax(dataF, dirF);                                                 { 0802:0910 }
DaxRleDecode(g_557E, p, comp, size);                                   { 0802:0920 }
FreeBlock(g_557E, comp);                                               { 0802:0938 }
```
{ quirk: the record that ends the scan at the data start is still compared (the test runs after reading it); a file
  whose directory lacks the id gives size 0 without any message — callers check size. }
{ correction to DAX.md §1: the packed buffer is a heap block `g_557E^` allocated per call (AllocBlock/FreeBlock),
  not a static buffer at DS:557E; DS:557E holds the pointer. }

### 0802:094A SetDataSet (H)
`procedure SetDataSet(n [BP+6]: Byte)` (retf 2) — callers: ecl_SetCharField (ECL write to 6E12), LoadCharacterIcon.
```pascal
g_5377 := DataSet;                                                     { 0802:094d  remember the previous one }
DataSet := n;                                                          { 0802:0953 }
```
{ correction to ECL_VM.md §3.1 / ECL fork D: one Byte argument, no disk prompt here (the prompt comes from OpenDax when a file is opened). }

### 0802:095D RestoreDataSet (H)
`procedure RestoreDataSet` — callers: LoadCharacterIcon, CheckEclDisk.
```pascal
DataSet := g_5377;                                                     { 0802:0960 }
```

### 0802:0968 Unit0802_Init (H)
`procedure Unit0802_Init` — caller: main program init chain (0000:0006). Empty body.
```pascal
{ 0802:0968  push bp / mov bp,sp / pop bp / retf }
```

---

## res_0899 (0899) — key input and program exit

### 0899:0000 TerminateGame (H)
`procedure TerminateGame` — restores the sound and video state and halts. Callers: MainProgram, ReadGameKey (^C in STING mode), LoadDaxRecord (0802:0716) and many overlay error paths ("Unable to load ...").
```pascal
SoundDevice := g_5373;                                  { 0899:0003  restore the device saved by a ^S mute }
PlayOrStopSound(g_2612);                                { 0899:000d  g_2612 = 00FFh (image) → stop all channels }
Regs.AH := 0; Regs.AL := PrevBiosVideoMode;                 { 0899:0012  g_4A03, g_4A02 }
Intr($10, Regs);                                        { 0899:0025  set the video mode found at startup }
Halt(0);                                                { 0899:002c }
```

### 0899:0059 ReadGameKey (H)
`function ReadGameKey: Char` — the game's key reader. Callers: InitConfiguration, the 0709 text/prompt routines, menus (ov25), PollOneKey, 0104, many overlays (see functions.tsv).
The set constant at 0899:0033 is `[0, 1]` (byte 0 = 03h); CS:0053 = `'STING'`.
```pascal
ch := ReadKey;                                          { 0899:0060 }
if ch = ^S then begin                                   { 0899:0068  sound on/off toggle }
  if SoundDevice <> 2 then begin                        { 0899:006e }
    g_5373 := SoundDevice;                              { 0899:0078  remember the device }
    PlayOrStopSound(g_2612);                            { 0899:007f  stop (FFh) }
    SoundDevice := 2;                                   { 0899:0084  mute }
  end else if g_5373 in [0, 1] then begin               { 0899:0094 }
    SoundDevice := g_5373;                              { 0899:009e  unmute }
    ResetSound;                                         { 0899:00a1 }
  end;
end;
if ParamStr(1) = 'STING' then begin                     { 0899:00ba  debug keys }
  if ch = ^D then DebugFlag := not DebugFlag;           { 0899:00c1  g_49F7 := Ord(g_49F7 = 0) }
  if ch = ^C then TerminateGame;                        { 0899:00d4  near call to 0000 with PUSH CS (far) }
end;
if ch <> #0 then                                        { 0899:00de }
  while KeyPressed do ch := ReadKey;                    { 0899:00e4  quirk: drains type-ahead, the LAST key pressed wins }
ReadGameKey := ch;                                      { 0899:00f7 }
```
`{ quirk: an extended key returns #0 and leaves the scan code for the next call (Crt.ReadKey convention); only non-zero keys drain the buffer. }`

### 0899:0104 FUN_0899_0104 — disabled key flush (H)
`procedure FUN_0899_0104` — callers: 17 (picture/loader routines, see functions.tsv).
```pascal
{ 0899:010a  JMP 011E: the loop below is skipped, the routine returns at once }
{ dead code: while KeyPressed do dummy := ReadGameKey;    0899:010c..011c }
```
`{ quirk: compiled as a while loop whose test was bypassed; a no-op in the shipped game. }` (Name: none; behaviour H.)

### 0899:0122 PollOneKey (M)
`procedure PollOneKey` — callers: DeployParty, StartCombat.
```pascal
if KeyPressed then dummy := ReadGameKey;                { 0899:0128  result stored in a local and discarded }
```

### 0899:013C FUN_0899_013C — unit init, empty (H)

---

---

## res_08AE (08AE) — sound and timer

All routines from 137Ch on run with `DS = CS = 08AE`; their variables are CS-relative (`cs08AE_XXXX`), not DS 0C7C globals. Data (image bytes, H): `cs08AE_01D7` tick divider (0Dh), `01D8` busy flag, `01D9` channel loop counter, `01DA` channel record size (30h), `01DB` word countdown (0), `01DD..01FD` 33 bytes = `'Run-time  Error 209 at 0BAD:0038'#10` with bit 7 set on every byte, `01FF` current sound index, `0201` current channel pointer, `0203` channel array base, `0205` note-divisor table, `0207` subroutine return pointer, `0209..020C` sound index per channel, `020D` output enable, `0221` sound-command jump table (FA..FF), `022D` 4 speaker channel records + `03AD` speaker note table (12 PIT divisors, C = 36484), `03C7` 4 PSG channel records + `0547` PSG note table (12 values), `055F` speaker sound table (10 sounds × 4 channel pointers), `0607` PSG sound table (10 × 4).

### 08AE:0000 TimeInHundredths_08AE (H)
`function TimeInHundredths_08AE: LongInt` — callers: WaitHundredths.
```pascal
GetTime(h, m, s, s100);                                 { 08ae:001a  pushes @h, @m, @s, @s100 }
TimeInHundredths_08AE := LongInt(h) * 360000                 { 08ae:002a  LongMul 57E40h }
                  + Word(m * 6000)                      { 08ae:0036  quirk: 16-bit MUL, high word dropped (wrong for m >= 11) }
                  + Word(s * 100) + s100;               { 08ae:0046 }
```

### 08AE:006C WaitHundredths (H)
`procedure WaitHundredths(n [BP+6]: Word)` — callers: PlayOrStopSound.
```pascal
target := TimeInHundredths_08AE + n;                         { 08ae:0073 }
repeat
  now := TimeInHundredths_08AE;                              { 08ae:008a }
  if target - now > n then now := target + 1;           { 08ae:00a2  guards a clock jump backwards (midnight / the m*6000 wrap) }
until now >= target;                                    { 08ae:00ca }
```

### 08AE:00DC PlayOrStopSound (H)
`procedure PlayOrStopSound(snd [BP+6]: Word)` — callers: TerminateGame, ReadGameKey, ecl_GameLoop and ecl_op2D_Call (step / door sounds g_2628 = 0Ah, g_262A = 0Bh), combat and spell code (functions.tsv).
```pascal
if SoundDevice = 2 then Exit;                           { 08ae:00df }
if g_5374 > 0 then InstallSoundTimer;                   { 08ae:00e9  transient mode: timer only while a sound plays }
case snd of
  0:   begin StartPsgChannels(0); StartSpeakerChannels(0); SetSoundOutput(0) end;   { 08ae:00fc }
  1:   SetSoundOutput(1);                               { 08ae:0118 }
  $FF: begin StartPsgChannels(0); StartSpeakerChannels(0) end;                     { 08ae:0127 }
else
  if SoundDevice = 1 then StartSpeakerChannels(snd - 1) { 08ae:013e }
  else if SoundDevice = 0 then StartPsgChannels(snd - 1);                          { 08ae:014d }
end;
if g_5374 > 0 then begin                                { 08ae:0156 }
  WaitHundredths(10);                                   { 08ae:0162 }
  StartPsgChannels(0); StartSpeakerChannels(0);         { 08ae:0169 }
  RemoveSoundTimer;                                     { 08ae:0174 }
end;
```

### 08AE:017B ResetSound (H)
`procedure ResetSound` — callers: InitConfiguration, ReadGameKey.
```pascal
g_5373 := SoundDevice;                                  { 08ae:017e }
if SoundDevice <> 2 then begin                          { 08ae:0184 }
  InstallSoundTimer;                                    { 08ae:018e }
  StartSpeakerChannels(0); StartPsgChannels(0);         { 08ae:0195 }
  RemoveSoundTimer;                                     { 08ae:01a0 }
end;
```

### 08AE:01A5 SetSoundTimerMode (M)
`procedure SetSoundTimerMode(mode [BP+6]: Word)` — callers: InitGameState, ShowCombatMessageAnimation, MissileAnim, CastSpell, Spell_HoldPerson, RemoveCombatant.
```pascal
if SoundDevice = 2 then Exit;                           { 08ae:01a8 }
if mode > 0 then begin                                  { 08ae:01b1 }
  if g_5374 = 0 then RemoveSoundTimer                   { 08ae:01b7  leaving resident mode }
end else
  InstallSoundTimer;                                    { 08ae:01c5  mode 0: timer stays installed }
g_5374 := mode;                                         { 08ae:01cb }
```
`{ hazard: SetSoundTimerMode(0) while already resident (g_5374 = 0) installs again, saving the game's own handler as the "old" vector (chain to itself); the callers pair SetSoundTimerMode(0) … SetSoundTimerMode(0Ah) around a sound sequence (00BA:200E/2163, 6100:2813/286A, 8E00:0DED/0E3A, 8E00:16DA/1732, BB00:0E17/1098) and ov11 sets 64h at startup (5700:0460), so it is not hit — H on the call sites. }`
Meaning (H from the uses): g_5374 = 0 → the timer ISR stays resident and sounds play in the background; > 0 → each PlayOrStopSound installs the timer, waits 10/100 s and removes it (the value itself is only tested for > 0).

### 08AE:01D2 FUN_08AE_01D2 — unit init, empty (H)

### 08AE:137C InstallSoundTimer (H)
`procedure InstallSoundTimer` (no frame; saves DS/ES) — callers: PlayOrStopSound, ResetSound, SetSoundTimerMode.
```pascal
GetIntVec($08, cs08AE_SavedInt08);                      { 08ae:1383  INT 21h AX=3508h → CS:1378/137A }
SetIntVec($08, @SoundTimerInterrupt);                   { 08ae:1398  INT 21h AX=2508h, DS:DX = 08AE:13EA }
Port[$43] := $B6;                                       { 08ae:13a1  PIT control word B6h = counter 2, LSB/MSB, mode 3 (see note) }
Port[$40] := Lo($13B1); Port[$40] := Hi($13B1);         { 08ae:13a5  counter 0 reload 13B1h = 5041 → 236.7 Hz }
```
Note (H on bytes): the control word B6h selects **counter 2** (speaker), but the reload is written to port 40h (counter 0); the timer-0 rate change relies on counter 0 accepting the LSB/MSB pair in its current mode (BIOS mode 3, LSB/MSB). Behaviour: INT 08 then fires 13× per BIOS tick (the ISR chains every 13th, 236.7/13 = 18.2 Hz).

### 08AE:13B1 RemoveSoundTimer (H)
`procedure RemoveSoundTimer` — callers: PlayOrStopSound, ResetSound, SetSoundTimerMode.
```pascal
SetIntVec($08, cs08AE_SavedInt08);                      { 08ae:13b8 }
Port[$40] := $FF; Port[$40] := $FF;                     { 08ae:13c9  counter 0 back to 65536 (18.2 Hz) }
Port[$61] := Port[$61] and $FC;                         { 08ae:13d2  speaker off }
Port[$C0] := $9F; Port[$C0] := $BF; Port[$C0] := $DF; Port[$C0] := $FF;   { 08ae:13d8  SN76489 (Tandy): all 4 channels attenuation 15 = silent }
```

### 08AE:13EA SoundTimerInterrupt (H) — not in the export
`procedure SoundTimerInterrupt; interrupt` (INT 08 handler, installed by InstallSoundTimer).
```pascal
EnableInterrupts;                                       { 08ae:13ea  STI }
if cs08AE_01DB <> 0 then begin                          { 08ae:13f5  dormant countdown }
  Dec(cs08AE_01DB);
  if cs08AE_01DB = 0 then begin                         { 08ae:1400 }
    { re-set the current video mode (INT 10h AH=0Fh, then AH=0) }   { 08ae:1402 }
    for i := 0 to 32 do cs08AE_01DD[i] := cs08AE_01DD[i] and $7F;   { 08ae:1419  decode 'Run-time  Error 209 at 0BAD:0038' }
    { INT 10h AH=13h: write the 33-byte string at row 0, col 0, attribute 7 }   { 08ae:1439 }
    { INT 21h AX=4CFFh: terminate with exit code 255 }                    { 08ae:143f }
  end;
end;
if cs08AE_01D8 = 0 then begin                           { 08ae:1441  not inside a Start routine }
  cs08AE_01D8 := 1;
  SpeakerChannelTick;                                   { 08ae:144d }
  PsgChannelTick;                                       { 08ae:1450 }
  cs08AE_01D8 := 0;
end;
Dec(cs08AE_01D7);                                       { 08ae:1458 }
if cs08AE_01D7 = 0 then begin
  cs08AE_01D7 := $0D;                                   { 08ae:145e }
  JumpFar(cs08AE_SavedInt08);                           { 08ae:1468  chain to the BIOS tick every 13th interrupt }
end else
  Port[$20] := $20;                                     { 08ae:146d  EOI; IRET }
```
`{ quirk: a hidden timebomb: when the CS:01DB countdown (image value 0) reaches 0 the game prints a fake "Run-time  Error 209 at 0BAD:0038" and exits with code 255. Nothing in the code writes 01DB (only the decrement at 08ae:13FC; no other reference in any listing), so it is never armed in the shipped game. }` (H)

### 08AE:1477 SpeakerChannelTick (M) — not in the export
`procedure SpeakerChannelTick` (near; DS = CS) — caller: SoundTimerInterrupt.
```pascal
if cs08AE_01FF = 0 then begin gate := 0; goto Out end;  { 08ae:1477  no sound: bl = 0 }
loudest := nil;                                         { 08ae:1480  cs08AE_03C5 }
cs08AE_0205 := @SpeakerNoteTable;                       { 08ae:148b  03ADh }
cs08AE_0203 := @SpeakerChannels;                        { 08ae:1492  022Dh }
for k := 1 to 4 do begin                                { 08ae:1486  counter 01D9 }
  ch := @SpeakerChannels[k];                            { si, stride 30h }
  if ch^.duration <> 0 then begin                       { 08ae:1499  +0 }
    ChannelStep(ch);                                    { 08ae:149e  157A }
    if (loudest = nil) and (ch^.volume <> 0) and (ch^.duration <> 0) then loudest := ch;   { 08ae:14a1  +0Ah }
  end;
end;
gate := cs08AE_020D;                                    { 08ae:14c0 }
if (gate <> 0) and (loudest <> nil) then begin          { 08ae:14c4 }
  Port[$42] := Lo(loudest^.divisor); Port[$42] := Hi(loudest^.divisor);   { 08ae:14d7  +8 → PIT counter 2 }
  gate := loudest^.volume and 3;                        { 08ae:14dd }
end;
Out:
Port[$61] := (Port[$61] and $FC) or gate;               { 08ae:14e3  speaker gate + data bits }
```
(gate = 0 whenever the output is disabled, no sound is set, or no channel is audible: `BX` is reloaded from 03C5h before the test at 08ae:14CD.)

### 08AE:14EC PsgChannelTick (M) — not in the export
`procedure PsgChannelTick` — caller: SoundTimerInterrupt. SN76489 on port C0h (Tandy).
```pascal
if cs08AE_01FF = 0 then goto Silence;                   { 08ae:14ec }
cs08AE_0205 := @PsgNoteTable;                           { 08ae:14fa  0547h }
cs08AE_0203 := @PsgChannels;                            { 08ae:1501  03C7h }
for k := 1 to 4 do                                      { 08ae:14f5 }
  if PsgChannels[k].duration <> 0 then ChannelStep(@PsgChannels[k]);   { 08ae:1508 }
if cs08AE_020D = 0 then goto Silence;                   { 08ae:1519 }
latch := $80;                                           { 08ae:1528 }
for k := 1 to 4 do begin                                { 08ae:1520 }
  f := PsgChannels[k].divisor shr 2;                    { 08ae:152a  +8 }
  Port[$C0] := latch xor (Lo(f) shr 4);                 { 08ae:153b  low 4 bits of the tone register (as coded) }
  if latch <> $E0 then Port[$C0] := Hi(f);              { 08ae:1542  second byte, not for the noise channel }
  Port[$C0] := (latch xor (Hi($FFFF - PsgChannels[k].volume) shr 4)) + $10;   { 08ae:1546  attenuation (XOR, then ADD 10h) }
  latch := latch + $20;                                 { 08ae:155c }
end;
Exit;
Silence:
Port[$C0] := $9F; Port[$C0] := $BF; Port[$C0] := $DF; Port[$C0] := $FF;   { 08ae:1569 }
```
(The exact SN76489 bit packing is transcribed as coded, M; the attenuation `+10h` lands in the latch's volume bit.)

### 08AE:157A SoundChannelStep (M) — not in the export (draft name SoundCommandInterpreter)
`procedure ChannelStep(ch = SI)` — one tick of one channel record (30h bytes; field names by use, M).
```pascal
ch^.volume := ch^.volume + ch^.volDelta;               { 08ae:157c  +0Ah += +0Ch }
ch^.pitch := ch^.pitch + ch^.slide;                     { 08ae:1582  +4 += +6 }
vib := 0;                                               { 08ae:1588 }
p := ch^.vibPhase + ch^.vibRate;                        { 08ae:158a  +1Eh + +20h }
if p <> 0 then begin
  if p >= ch^.vibLength then p := p - ch^.vibLength;    { 08ae:1592  +24h }
  ch^.vibPhase := p;                                    { 08ae:159a }
  vib := HiWord(SmallInt(ch^.vibTable^[p sar 4] shl 8) * ch^.vibDepth);   { 08ae:159d  table +1Ch, depth +22h, IMUL high word }
end;
ch^.divisor := ch^.pitch + vib;                         { 08ae:15ad  +8 }
if ch^.noteOff <> 0 then begin                          { 08ae:15b3  +14h }
  Dec(ch^.noteOff);
  if ch^.noteOff = 0 then begin ch^.envIndex := $10; ch^.envCount := 1 end;   { 08ae:15be  release part of the envelope }
end;
Dec(ch^.duration);                                      { 08ae:15c8  +0 }
if ch^.duration = 0 then ReadSoundCommands(ch);         { 08ae:15cc  160B }
if ch^.envCount <> 0 then begin                         { 08ae:15cf  +1Ah }
  Dec(ch^.envCount);
  if ch^.envCount = 0 then
    repeat                                              { 08ae:15da }
      e := ch^.envTable + ch^.envIndex;                 { +16h, +18h; 4-byte entries }
      if e^.count = $FFFF then begin                    { 08ae:15e0 }
        ch^.volume := e^.value;                         { 08ae:15e8  set level }
        if e^.value = 0 then ch^.volDelta := 0;         { 08ae:15eb }
        ch^.envIndex := ch^.envIndex + 4;               { 08ae:15f3 }
      end else begin
        ch^.volDelta := e^.value;                       { 08ae:15f9  ramp }
        ch^.envCount := e^.count;                       { 08ae:15fe }
        ch^.envIndex := ch^.envIndex + 4;               { 08ae:1604 }
        Break;
      end;
    until False;
end;
```

### 08AE:160B ReadSoundCommands (M) — not in the export (draft name SoundParameterReader)
`procedure ReadSoundCommands(ch = SI)` — interprets the channel's command bytes at `ch^.cmdPtr` (+2) until a step ends.
```pascal
p := ch^.cmdPtr; if p = nil then Exit;                  { 08ae:160b }
cs08AE_0201 := ch;                                      { 08ae:1614 }
repeat
  op := p^; Inc(p);                                     { 08ae:1618 }
  if op < $FA then begin NoteList(op); Exit end;        { 08ae:161b → 16C4 }
  case op of                                            { 08ae:162a  JMP [0221h + 2*(op-FAh)] }
    $FA: ResetChannel(ch);                              { 08ae:164e  fix #verify-2: clears words +04..+0C, +10, +12, +16..+24 only; +0Eh tempo and +14h noteOff are kept }
    $FB: p := cs08AE_0207;                              { 08ae:16ac  return from sub-sequence }
    $FC: begin cs08AE_0207 := p + 2; p := PWord(p)^ end;{ 08ae:16b3  call sub-sequence }
    $FD: begin ch := cs08AE_0203 + PWord(p)^; Inc(p, 2); ResetChannel(ch) end;  { 08ae:1645  select + clear another channel (offset word); quirk: SI stays on it, so the following commands set that channel's fields; FinishStep reloads 0201 }
    $FE: begin f := p^; target := PWord(p+1)^; Inc(p, 3);                      { 08ae:162e  loop }
           if PWord(@ch^ + f)^ <> 0 then begin Dec(PWord(@ch^ + f)^); if PWord(@ch^ + f)^ = 0 then Continue end;
           p := target end;
    $FF: begin f := p^; PWord(@ch^ + f)^ := PWord(p+1)^; Inc(p, 3);            { 08ae:167f  set field f }
           if f = 0 then begin FinishStep; Exit end end;                        { 08ae:168a  setting the duration ends the step }
  end;
until False;
FinishStep:                                             { 08ae:168f }
  ch := cs08AE_0201;
  if ch^.duration = 0 then begin                        { 08ae:1693  sequence finished }
    cs08AE_0209[4 - cs08AE_01D9] := 0;                  { 08ae:16a0  channel's sound index cleared }
    p := nil;
  end;
  ch^.cmdPtr := p;                                      { 08ae:16a8 }
NoteList (08ae:16c1..173f) — fix #verify-1: **3-byte entries {chanByte e0, note e1, length e2}**; the list ends after the
entry whose e1 has bit 7 set (08ae:1735..173b: `di += 2` after the e1 test):
  chan := e0 shr 5; dst := cs08AE_0203 + chan * cs08AE_01DA;            { 08ae:16c1 / 16c5 }
  if Lo(ch^.tempo) <= 1 then ch^.duration := e2                          { 08ae:16d9 / 16e2  +0Eh low byte }
  else ch^.duration := Lo(ch^.tempo) * e2;                               { 08ae:16e7 }
  n := e1 and $7F;                                                       { 08ae:16ec  7Fh = rest }
  if (n <> $7F) and (chan = 0) then begin                               { 08ae:16f1  quirk: notes for chan > 0 only set the length }
    dst^.duration := ch^.duration; dst^.noteOff := ch^.duration;        { 08ae:16fb }
    n := n + dst^.transpose;                                            { 08ae:1702  +12h }
    dst^.envIndex := 0; dst^.envCount := 1;                             { 08ae:1705  attack }
    octave := n div 12; n := n mod 12;                                  { 08ae:170f }
    dst^.pitch := NoteTable[n] shr octave; dst^.divisor := dst^.pitch;  { 08ae:1726 }
  end;
  then FinishStep.
```
`{ quirk: the FE loop counter decrements a field of the channel and jumps back while it is non-zero after the decrement (counter 0 on entry jumps unconditionally). }`

### 08AE:1742 StartSpeakerChannels (H)
`procedure StartSpeakerChannels(snd [BP+6]: Word)` (`RETF 2`, preserves registers, DS := 08AE) — callers: PlayOrStopSound, ResetSound.
```pascal
cs08AE_01FF := snd;                                     { 08ae:1752 }
cs08AE_01D8 := 1;                                       { 08ae:175c  keep the ISR out }
for k := 0 to 3 do begin                                { 08ae:1761 }
  seq := SpeakerSoundTable[snd*4 + k];                  { 08ae:1769  word at 055Fh + snd*8 + k*2 }
  if seq <> 0 then begin
    FillChar(SpeakerChannels[k], $30, 0);               { 08ae:1772  words +0..+2Eh }
    SpeakerChannels[k].cmdPtr := seq;                   { 08ae:177e }
    cs08AE_0209[k] := Lo(snd);                          { 08ae:178c }
    SpeakerChannels[k].duration := 1;                   { 08ae:1790  first tick reads the commands }
  end;
end;
cs08AE_01D8 := 0;                                       { 08ae:17a0 }
```

### 08AE:17AE StartPsgChannels (H)
`procedure StartPsgChannels(snd [BP+6]: Word)` — same as StartSpeakerChannels with `PsgSoundTable` (0607h) and `PsgChannels` (03C7h). { 08ae:17be .. 180c }

### 08AE:181A SetSoundOutput (M)
`procedure SetSoundOutput(on [BP+6]: Word)` — callers: PlayOrStopSound (0 with "stop", 1 for sound id 1).
```pascal
cs08AE_020D := Lo(on);                                  { 08ae:1827  output enable read by both channel ticks }
```

---

## Unknowns (explicit, collected from all parts)
- Hardware identity of VideoMode 2 (Tandy/PCjr, M); whether EGA colours 8..15 written as 10h..17h are meant for the 200-line mode (M).
- POOL.CFG line 5 'F' (g_49D1); TChar +AAh (STR bonuses only when ≠ 0); effects 1Fh, 33h..35h (MAGIC lane); combatant record fields +0/+3/+6/+7/+0Eh; g_6DDA, g_6DBF roles; g_5370 (clip enable, M).
- Field names of the 30h-byte sound channel record (08AE, M); argument meaning of 0709:00B7/0071/00A0 (page/mode helpers, M).
- 00BA:2E46 stays FUN_ (L).

## Self-check
Each part re-read ~10% of its statements and ≥ 5 call argument orders against the bytes (`hdis.py rSSSS`):

| part | units / range | OK | fixed | notable fix |
|---|---|---|---|---|
| P | main, 042B, 0899, 03F1, 08AE | 17 | 4 | speaker gate, Tandy volume order, FD command channel switch |
| Q | 0464 0000..0D70 | 18 | 0 | (one call site pushes a saved temp before its arguments — marked) |
| R1 | 0464 0D71..1950 | 18 | 2 | DrawPicture flag bit 2 *saves* the destination (Move order) — the arg-order class |
| R2 | 0464 1951..end | 20 | 0 | found VIEW.pas.md DrawBackdrop args reversed |
| S | 0709 | 18 | 0 | found ECL.pas.md 0709:0BF5 args reversed (fixed there) |
| T | 0802 | 18 | 0 | LoadDaxRecord signature settled (name, ext, id, var size, var p) |
| U | 00BA 0000..1508 | 23 | 0 | — |
| V | 00BA 1509..end | 19 | 3 | ShowBottomPromptAndReadKey(colour, s); g_6DE4/6DDA/6DBF are DS, not VM |

Merge-level sample (lane, seed 17, call statements only, checked against the push sequences):

| statement | address | result |
|---|---|---|
| `if saveBg then Move(dst^.pix[dstOff], g_4A24^.pix[bgOff], rowBytes)` | 0464:116c | OK (dst span pushed first = Source, g_4A24 second = Dest, count [bp-0Eh]) |
| `ConvertPicturePixels(buf, ofs, maskFlags, transpColour, pic)` | 0464:0267 | OK (far buf, word 11h, [bp+0Ch], [bp+0Ah], pic^ far) |
| `CopyCombatAnimationFrame(icon, 1, 2, true)` | 00ba:1a11 | OK (push [bp+6], 1, 2, 1) |
| `ClearRectangle($17, 1, $26, $15)` | 00ba:09e9 | OK |
| `for bank := 0 to 3 do FillChar(Ptr($B800 + bank*$200, 0)^, 8000, 0)` | 0709:0d16 | OK (segment B800h pushed, unrolled) |
| `ShowBottomPromptAndReadKey($0F, 'Unable to find item file')` (ECL.pas.md) | 2f00:1a63 | OK after fix (`MOV AL,0Fh; PUSH AX` before the string) |

Result: 6/6 against the bytes; 137 routine sections present (`grep -c '^### '`).
