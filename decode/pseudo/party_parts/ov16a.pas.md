# ov16 part A (seg 7000, 0000..1F36) — free character, top-level menu, character creation (FINAL pseudocode, lane por-mod-party)

Unit: ov16, analysis segment 7000, stub segment 0078. This part: 7000:0000, 7000:0161 (entry e1, called by the main program at
0000:0127), 7000:056C, 7000:1551 (not a routine: the second half of 056C, see below). Part B (7000:1F37..) holds Drop, Modify,
Train, Add, Remove, portrait/icon pickers and the HP/CON helpers called from here.
Role: the start-of-game "party creation" screen — the list of functions (Create / Drop / Modify / Train / View / Add / Remove /
Load / Save / BEGIN / Exit) with its hidden hot-key menu line, and the complete character generator (race, gender, class,
alignment, age, six abilities with age / race / gender / class limits, starting gold, HP, first-level spells, name, then
portrait + icon, then the character is written to the roster file).
Sources: `decode/listings/ov16.lst` (evidence), image bytes (`python decode/ecl/hdis.py ov16 START END`) — needed at
7000:120E (loop increment Ghidra did not disassemble) and 7000:1BCC..1BE1; `ov16.c` and PARTY.draft.md as checklist only.
String literals in the code segment: 7000:00E2 `''`, 00E3 "Choose a function ", 00F6 set `['G','O']`, 0116 set `['E','S']`,
0136 "Quit to DOS ", 0143 "STING", 0149 "I Understand, master...", 04F1 "Pick Race", 04FB `'  '` (two blanks), 04FE `''`,
04FF "Pick Gender", 050B "Pick Class", 0516 "Pick Alignment", 0525 set `[8..12]`, 0545 "Keep this character? ",
055B "Character name: ".

Conventions (as VIEW.pas.md / ENGINE.pas.md)
- **Signatures in Pascal order**: first parameter = highest BP offset (pushed first); parameters as `name [BP+xx]`. Every call
  below was written from its PUSH sequence (first pushed = first argument).
- `{ seg:off }` = first instruction of the statement (or of the call that implements it); `{ quirk: ... }` = behaviour a port must copy.
- Globals `g_XXXX` = DS:XXXX (GLOBALS.md) or the lane name `Name{g_XXXX}` (listed in `ov16a_names.json`, requested from por-tooling).
- TChar fields by the SAVES.md §3 names (`c^.race` = +2Eh …). `TMenuItem` (VIEW, ov25 NewMenuList): text string[40] at +0,
  `isHeader` byte at +29h, next at +2Ah.
- Callees: resident by ENGINE names; ov25 menus by VIEW names — `HorizontalMenu(prompt, options, promptColour [BP+12h], textColour [BP+10h],
  hotColour [BP+0Eh], allowExt, animate, var ext): Char`, `VerticalListMenu(prompt, options, cHeader [BP+24h], cItem [BP+22h],
  cSel [BP+20h], left, top, right, bottom, list, showExit, var redraw, var index, var item): Char`, `AskYesNo(prompt, c1, c2, c3): Char`,
  `NewMenuList(n, var list)`, `FreeMenuList(var list)`, `ListItem(n [BP+0Ah], list [BP+6])` (bytes 9D00:000B/0022: list at +6, n at +0Ah — VIEW.pas.md prints the two reversed; pushes here are n first), `ClearMenuLine`; ov19 by COMBAT names
  (CycleSelectedChar, ViewMenu, DrawCharacterSheet, DrawCombatStats, DrawAbility, DrawMoney); ov24 `Roll(count, sides)`,
  `AddEffect(c, type, duration, p3, callOnRemove)`; ov23 (VIEW) `WisdomBonusSpells(c)`, `UpdateSaves(c)`, `UpdateThiefSkills(c)`;
  ov17 `WriteCharacter{WriteCharacter}(var c [BP+0Ah], name [BP+6])` (pushes c first; `name = ''` → roster file `<name>.CHA`),
  `LoadGame{LoadGame}`, `SaveGame{SaveGame}`.
- Part-B routines called from here are kept as `FUN_7000_xxxx`/`ov16_xxxx` with a behaviour comment (their names belong to
  ov16b): `RollHitDice(c, classMask): Byte` = sum of one hit-die roll per class (level-1 minimum 2/3 of the die), `ConHpBonus(c): ShortInt` = CON hit-point
  adjustment summed over the classes, `PortraitMenu` = "Head Body Keep" portrait picker, `IconEditor` = combat-icon editor,
  `DropCharacter` Drop, `ModifyCharacter` Modify, `TrainCharacter` Train, `AddCharacterMenu` Add, `RemoveFromParty(a, b)` remove from party.

Data tables read here (image bytes, DS:xxxx, H):
- `MenuEntry{g_0619}`: 11 × 42 bytes = string[40] text + `enabled` byte at +29h. Texts / initial enabled: 0 "Create New Character" 1
  (`g_0642`), 1 "Drop Character" 0 (`g_066C`), 2 "Modify Character" 0 (`g_0696`), 3 "Train Character" 0 (`g_06C0`), 4 "View
  Character" 0 (`g_06EA`), 5 "Add Character to Party" 1 (`g_0714`), 6 "Remove Character from Party" 0 (`g_073E`), 7 "Load Saved
  Game" 1 (`g_0768`), 8 "Save Current Game" 0 (`g_0792`), 9 "BEGIN Adventuring" 0 (`g_07BC`), 10 "Exit to DOS" 1 (`g_07E6`).
  0642/0714/07E6 are never written by code (GLOBALS.md: readers only) → Create, Add and Exit are always offered.
- `g_05F0` = string `'C D M T V A R L S B E J'` (the hot keys; J is the hidden debug key).
- `RaceName{g_0F03}`[10], `ClassName{g_0D38}`[27], `GenderName{g_0FEC}`[7], `AlignmentName{g_0F53}`[17] (SAVES.md string tables).
- `g_3CF5[1..6]` = 01 02 03 04 06 07 (icon colour seeds → icon_colours 91 A2 B3 C4 E6 F7).
- `RaceClasses{g_3E17}`[race*12]: count, class ids — Dwarf 3: F, T, F/T · Elf 7: F, MU, T, F/MU, F/T, F/MU/T, MU/T · Gnome 3: F, T,
  F/T · Half-Elf 11: C, F, MU, T, C/F, C/F/MU, C/MU, F/MU, F/T, F/MU/T, MU/T · Halfling 3: F, T, F/T · Half-Orc 6: C, F, T, C/F, C/T,
  F/T · Human 4: C, F, MU, T (raw: `03 02 06 0E`, `07 02 05 06 0D 0E 0F 10`, … `04 00 02 05 06`).
- `ClassAligns{g_3FE7}`[class*10]: count, alignment ids — all 9 for Cleric, Fighter, Ranger, MU, Monk and every multi-class
  except the thief ones; Druid 5: LN, NG, TN, NE, CN (`05 01 03 04 05 07`); Paladin 1: LG (`01 00`); Thief, F/T, F/MU/T, MU/T 7:
  all except LG and CG (`07 01 02 03 04 05 07 08`).
- `StartAge{g_3E5B}`[race*28 + cls*4] = (word base, byte dice, byte sides), cls 0..6; e.g. Human: C 18+1d4, Dr 18+1d4, F 15+1d4,
  Pa 17+1d4, Ra 20+1d4, MU 24+2d4, T 18+1d4; Dwarf: C 250+2d20, F 40+5d4, T 75+3d6.
- `AgeCategory{g_3F31}`[race*10] = 5 words (age limits of young adult / mature / middle aged / old / venerable); Human 20 40 60 90 120,
  Dwarf 50 150 250 350 450, Elf 175 550 875 1200 1600, Gnome 90 300 450 600 750, Half-Elf 40 100 175 250 325,
  Halfling 33 68 101 144 199, Half-Orc 15 30 45 60 80.
- `RaceAbilityLimits{g_3DA3}`[race*16 + …]: +0/+1 STR min (male/female), +2/+3 STR max, +4/+5 exceptional-STR max, +6/+7 INT min/max,
  +8/+9 WIS, +0Ah/+0Bh DEX, +0Ch/+0Dh CON, +0Eh/+0Fh CHA; e.g. Human `03 03 12 12 64 32 03 12 03 12 03 12 03 12 03 12`,
  Dwarf `08 08 12 11 63 00 03 12 03 12 03 11 0C 13 03 10`.
- `ClassAbilityMin{g_3F81}`[class*6 + ability] (e.g. Cleric 6 6 9 0 0 0, Paladin 13 9 12 0 9 17, Ranger 0 13 14 0 14 0, Monk 15 0 15 15 11 0).
- `BaseThac0{g_3C7C}`[cls*11 + level] (level 1 = 40 for every class = THAC0 20).
- `ClassMaskBit{g_05D6}`[cls] = 02 10 08 40 80 01 04 20 (cleric 2, druid 10h, fighter 8, paladin 40h, ranger 80h, MU 1, thief 4, monk 20h).
- `StartGoldDice{g_4263}`[cls*2] = (dice, sides): C 3d6, Dr 3d6, F 5d4, Pa 5d4, Ra 5d4, MU 2d4, T 2d6, Mo 5d4.

---

### 7000:0000 FreeCharacter (H)
`procedure FreeCharacter(var c [BP+6]: ^TChar)` — `RETF 4`. Caller: RemoveFromParty (part B). Callees: System.FreeMem.
Frees a character record with everything hanging off it and sets the pointer to nil. Name H (frees exactly the four
structures of SAVES.md §1/§3: combat record 16h B, item list 3Fh B linked at +2Ah, effect list 9 B linked at +05h, record 11Dh B).
```pascal
p := c;                                                           { 7000:0006 }
if p^.combatant <> nil then FreeMem(p^.combatant, $16);           { 7000:0012 / 002f  +108h; the field itself is not cleared }
it := p^.items;                                                   { 7000:0034  +C8h }
while it <> nil do begin                                          { 7000:0047 }
  q := it;  it := it^.next;                                       { 7000:004f  item +2Ah }
  FreeMem(q, $3F);                                                { 7000:0076 }
end;
e := p^.effects;                                                  { 7000:007d  +7Fh }
while e <> nil do begin                                           { 7000:008f }
  q := e;  e := e^.next;                                          { 7000:0097  effect +05h }
  FreeMem(q, 9);                                                  { 7000:00be }
end;
FreeMem(c, $11D);                                                 { 7000:00cf }
c := nil;                                                         { 7000:00d4 }
```

### 7000:0161 PartyCreationMenu (H)
`procedure PartyCreationMenu` — `RETF`, no parameters; stub ov16 e1. Caller: MainProgram (0000:0127). Callees: DrawTitledFrame,
DrawPartyRoster, DrawText, HorizontalMenu, ClearMenuLine, CycleSelectedChar (CycleSelectedChar), CreateCharacter (056C), DropCharacter,
ModifyCharacter, TrainCharacter, ViewMenu (ViewMenu), AddCharacterMenu, WriteCharacter (WriteCharacter), RemoveFromParty, LoadGame (LoadGame),
SaveGame (SaveGame), AskYesNo, TerminateGame, ParamStr, ShowTimedBottomMessage.
The first game screen after the title and code wheel: a framed list of the available functions; leaving it with BEGIN (or a
successful Load) returns to the main program, which starts the ECL game loop. Name H (strings "Choose a function ", the 11 entry
texts, "Quit to DOS "; the main program calls it right before ecl_GameLoop).
Locals: `beginMode [BP-10h]` = 4 (constant), `redraw [BP-0Fh]`, `row [BP-0Eh]`, `i [BP-1]`, `ext [BP-3]`, `key [BP-2]`, `turnUsed [BP-4]`.
```pascal
DataSet{g_5376} := 3;                                             { 7000:0168 }
beginMode := 4;  redraw := true;                                  { 7000:016d }
StingMode{g_470C} := 0;                                           { 7000:0175 }
game_Mode := 0;                                                   { 7000:017a }
repeat
  if redraw then begin                                            { 7000:017f }
    DrawTitledFrame(1, 1, $26, $16, 0, 0, '');                    { 7000:01a9  frame cols 1..38, rows 1..22, no title }
    if SelectedChar <> nil then begin                             { 7000:01ae }
      DrawPartyRoster(SelectedChar);                              { 7000:01bf }
      g_066C := 1;  g_0696 := 1;                                  { 7000:01c4  Drop, Modify }
      if (ecl_Mem6B00^.w[$550] > 0) or (StingMode{g_470C} <> 0) then g_06C0 := 1;   { 7000:01ce  Train (else unchanged) }
      g_06EA := 1;  g_073E := 1;  g_0768 := 0;                    { 7000:01e6  View, Remove on; Load off }
      g_0792 := 1;  g_07BC := 1;                                  { 7000:01f5  Save, BEGIN }
    end else begin
      g_066C := 0; g_0696 := 0; g_06C0 := 0; g_06EA := 0;         { 7000:0201 }
      g_073E := 0; g_0768 := 1; g_0792 := 0; g_07BC := 0;         { 7000:0215 }
    end;
    row := 0;                                                     { 7000:0229 }
    for i := 0 to 10 do                                           { 7000:022d }
      if MenuEntry{g_0619}[i].enabled <> 0 then begin             { 7000:0242 }
        DrawText(2, row + 12, $0F, MenuEntry[i].text[1]);         { 7000:0273  first letter, white }
        DrawText(3, row + 12, $0A, Copy(MenuEntry[i].text, 2, Length(MenuEntry[i].text) - 1));   { 7000:02bb  rest, green }
        row := row + 1;                                           { 7000:02c0 }
      end;
    redraw := false;                                              { 7000:02cc }
  end;
  key := HorizontalMenu('Choose a function ', g_05F0, $0D, 0, 0, true, false, ext);   { 7000:02f8  hot keys drawn in colour 0 = invisible }
  ClearMenuLine;                                                  { 7000:0300 }
  if ext then begin                                               { 7000:0305 }
    if key in ['G', 'O'] then begin                               { 7000:0314  Home / End scan codes }
      CycleSelectedChar(key);                                     { 7000:031f }
      DrawPartyRoster(SelectedChar);                              { 7000:032c }
    end;
    continue;                                                     { 7000:0331  no redraw }
  end;
  if not (key in ['E', 'S']) then GameSaved{g_557D} := 0;         { 7000:033d }
  case key of                                                     { 7000:0349 }
    'C': if g_0642 <> 0 then CreateCharacter;                     { 7000:0350 / 0358 }
    'D': if g_066C <> 0 then DropCharacter;                       { 7000:0362 / 036a  Drop }
    'M': if g_0696 <> 0 then ModifyCharacter;                       { 7000:0374 / 037c  Modify }
    'T': if g_06C0 <> 0 then TrainCharacter;                       { 7000:0386 / 038e  Train }
    'V': if g_06EA <> 0 then ViewMenu(turnUsed);                  { 7000:0398 / 03a4 }
    'A': if g_0714 <> 0 then AddCharacterMenu;                       { 7000:03b0 / 03b8  Add }
    'R': if (g_073E <> 0) and (SelectedChar <> nil) then begin    { 7000:03c2 }
           WriteCharacter(SelectedChar^, '');                     { 7000:03e9  store back to the roster (<name>.CHA) }
           RemoveFromParty(0, 1);                                       { 7000:03f5  remove from party (part B) }
         end;
    'L': if g_0768 <> 0 then begin                                { 7000:03ff }
           LoadGame;                                              { 7000:0406 }
           if game_Mode <> 0 then begin g_49F8 := 1; exit end;    { 7000:040b  a game was loaded → return to main }
         end;
    'S': if (g_0792 <> 0) and (PartyHead <> nil) then SaveGame;   { 7000:0421 / 0431 }
    'B': if (g_07BC <> 0) and (PartyHead <> nil) then begin       { 7000:043d }
           game_Mode := beginMode;                                { 7000:0450  = 4 }
           ClearMenuLine;                                         { 7000:0453 }
           exit;                                                  { 7000:0458 }
         end;
    'E': if g_07E6 <> 0 then                                      { 7000:0462 }
           if AskYesNo('Quit to DOS ', $0E, $0A, $0F) = 'Y' then begin   { 7000:0481 }
             while (GameSaved{g_557D} = 0) and (PartyHead <> nil) do SaveGame;   { 7000:048f  quirk: keeps asking until saved }
             TerminateGame;                                       { 7000:04a6 }
           end;
    'J': if ParamStr(1) = 'STING' then begin                      { 7000:04bb / 04c5 }
           StingMode{g_470C} := 1;                                { 7000:04cc }
           ShowTimedBottomMessage('I Understand, master...');     { 7000:04e1 }
         end;
  end;
  redraw := true;                                                 { 7000:04e6 }
until false;                                                      { 7000:04ea }
```
Notes: the menu line shows only the prompt "Choose a function " (colour 0Dh); the letters of the option string are drawn with
colour 0 (black), so the player sees the list in the frame, not the hot keys (H from HorizontalMenu's colour use). A key of a
disabled entry is accepted but does nothing except force a redraw. `Train` additionally needs `ecl_Mem6B00^.w[550h] > 0`
(an ECL variable, meaning L — probably "in a city with a training hall") or the STING debug mode. Exit forces a save when a party
exists and the game is not marked saved (`GameSaved`, set by SaveGame, cleared by every other command here) — if SaveGame is
cancelled without setting the flag the loop repeats (M: depends on SaveGame).

### 7000:056C CreateCharacter (H)

**#fable-6 (2026-10-16):** every statement after 7000:07A8 re-checked against ov16.lst/bytes (172 statements, 7000:07A8..1ED1, incl. the bytes Ghidra missed at 120E and 1BCC..1BE1): 169 AGREE, 3 fixed (two missing `p := c` reloads, one signed compare; no behaviour change). Reports: `party_parts/fable6_A.md`, `fable6_B.md`.
`procedure CreateCharacter` — near (`PUSH CS; CALL`), `RETF`; no parameters. Caller: PartyCreationMenu ('C'). Callees: GetMem,
FillChar, Random, NewMenuList, FreeMenuList, ListItem, VerticalListMenu, AddEffect, UpdateThiefSkills, UpdateSaves, Roll,
DrawCharacterSheet, DrawAbility, WisdomBonusSpells, RollHitDice, ConHpBonus, DrawCombatStats, DrawMoney, AskYesNo,
ReadBottomLine, PortraitMenu, IconEditor, WriteCharacter, FreeMem.
Name H (strings "Pick Race", "Pick Gender", "Pick Class", "Pick Alignment", "Keep this character? ", "Character name: "; the
result is written to the roster with WriteCharacter(c, '')).
**7000:1551 is not a separate routine**: Ghidra split the function at the target of the `JMP 1551` (7000:12E0) of the per-ability
`case`; 1551..1ED1 is the same frame (`[BP-1Bh]`, `[BP-27h]`), its only entry is that jump, and the function returns at
7000:1ECE..1ED1 (`MOV SP,BP; POP BP; RETF`). Both halves are written here as one body (H).
Locals: `c [BP-4]` (new record), `p [BP-27h]` (alias), `list [BP-0Ch]`, `item [BP-10h]`, `index [BP-12h]` (Integer), `key [BP-16h]`,
`raceLoop [BP-17h]`, `k [BP-13h]`, `n [BP-1Ch]`/`[BP-24h]`, `cls [BP-19h]`, `abil [BP-1Bh]`, `try [BP-14h]`, `r [BP-15h]`,
`goldSum [BP-21h]`, `nCls [BP-20h]`, `conAdj [BP-1Eh]`, `saved [BP-8]` (SelectedChar), `redraw [BP-23h]`, `showExit [BP-22h]`.
```pascal
GetMem(c, $11D);                                                  { 7000:0577 }
FillChar(c^, $11D, 0);                                            { 7000:058e }
for k := 1 to 6 do                                                { 7000:059c }
  c^.icon_colours[k] := (g_3CF5[k] + 8) * 16 + g_3CF5[k];         { 7000:05ac  TChar +C0h+k: 91 A2 B3 C4 E6 F7 }
c^.base_ac := $32;                                                { 7000:05e4  AC 10 }
c^.base_thac0 := $28;                                             { 7000:05ed  THAC0 20 (recomputed below) }
c^.status := 0;  c^.active := 1;                                  { 7000:05f5 }
c^.head_pic := 1;  c^.body_pic := 1;  c^.size := 1;               { 7000:0607 }
c^.unk_AB := Random(256);                                         { 7000:0622 }

{ ---- race ---- }
NewMenuList(7, list);                                             { 7000:0638 }
list^.isHeader := 1;  list^.text := 'Pick Race';                  { 7000:0640 / 0653 }
for raceLoop := 1 to 7 do begin                                   { 7000:0658 }
  if raceLoop in [1..5] then                                      { 7000:0664 }
    ListItem(raceLoop, list)^.text := '  ' + RaceName[raceLoop]   { 7000:0677 .. 06b1  Dwarf Elf Gnome Half-Elf Halfling }
  else if raceLoop = 7 then
    ListItem(raceLoop - 1, list)^.text := '  ' + RaceName[7];     { 7000:06c8 .. 0702  item 6 = Human; Half-Orc (6) is not offered }
end;
item := list;  index := 1;  redraw := true;  showExit := true;    { 7000:0710 }
repeat
  key := VerticalListMenu('', '', $0D, $0A, $0F, 1, 2, $26, $16, list, showExit, redraw, index, item);   { 7000:0775 }
  if key = #0 then exit;                                          { 7000:077d  Esc / Exit: quirk — c and list are not freed }
until key = #13;                                                  { 7000:0786 }
if index = 6 then index := 7;                                     { 7000:078c }
c^.race := index;                                                 { 7000:07a4 }
case c^.race of                                                   { 7000:07ab  innate racial effects (types: ov24 effect table; meaning L) }
  5 {Halfling}: begin c^.icon_size := 1;                          { 7000:07b3 }
       AddEffect(c, $5A, 0, $FF, 0);                          { 7000:07ce }
       AddEffect(c, $61, 0, $FF, 0) end;                      { 7000:07e5 }
  1 {Dwarf}:    begin c^.icon_size := 1;                          { 7000:07f1 }
       AddEffect(c, $5A, 0, $FF, 0);                          { 7000:080c }
       AddEffect(c, $61, 0, $FF, 0);                          { 7000:0823 }
       AddEffect(c, $1A, 0, $FF, 0);                          { 7000:083a }
       AddEffect(c, $2F, 0, $FF, 0) end;                      { 7000:0851 }
  3 {Gnome}:    begin c^.icon_size := 1;                          { 7000:085d }
       AddEffect(c, $61, 0, $FF, 0);                          { 7000:0878 }
       AddEffect(c, $12, 0, $FF, 0);                          { 7000:088f }
       AddEffect(c, $2F, 0, $FF, 0);                          { 7000:08a6 }
       AddEffect(c, $30, 0, $FF, 0) end;                      { 7000:08bd }
  2 {Elf}:      begin c^.icon_size := 2;                          { 7000:08c8 }
       AddEffect(c, $6B, 0, $FF, 0) end;                          { 7000:08e3 }
  4 {Half-Elf}: begin c^.icon_size := 2;                          { 7000:08ee }
       AddEffect(c, $7C, 0, $FF, 0) end;                          { 7000:0909 }
else            c^.icon_size := 2;                                { 7000:0910  Human }
end;
FreeMenuList(list);                                               { 7000:091e }

{ ---- gender ---- }
NewMenuList(3, list);                                             { 7000:092c }
list^.isHeader := 1;  list^.text := 'Pick Gender';                { 7000:0934 / 0947 }
for k := 0 to 1 do                                                { 7000:094c  local [BP-18h] }
  ListItem(k + 1, list)^.text := '  ' + GenderName[k];            { 7000:0961 .. 099b  Male, Female }
item := list;  index := 1;  showExit := true;  redraw := true;    { 7000:09a6 }
repeat
  key := VerticalListMenu('', '', $0D, $0A, $0F, 1, 2, $26, $16, list, showExit, redraw, index, item);   { 7000:0a0b }
  if key = #0 then exit;                                          { 7000:0a13 }
until key = #13;                                                  { 7000:0a1c }
c^.gender := index - 1;                                           { 7000:0a29 }
FreeMenuList(list);                                               { 7000:0a33 }

{ ---- class ---- }
n := RaceClasses{g_3E17}[c^.race*12];                             { 7000:0a47 }
NewMenuList(n + 1, list);                                         { 7000:0a5a }
list^.isHeader := 1;  list^.text := 'Pick Class';                 { 7000:0a62 / 0a75 }
for k := 1 to n do                                                { 7000:0a7a }
  ListItem(k, list)^.text := '  ' + ClassName[RaceClasses[c^.race*12 + k]];   { 7000:0a9b .. 0aee }
item := list;  index := 1;  showExit := true;  redraw := true;    { 7000:0afb }
repeat
  key := VerticalListMenu('', '', $0D, $0A, $0F, 1, 2, $26, $16, list, showExit, redraw, index, item);   { 7000:0b60 }
  if key = #0 then exit;                                          { 7000:0b68 }
until key = #13;                                                  { 7000:0b71 }
p := c;                                                           { 7000:0b77  [BP-27h] reloaded (#fable-6) }
c^.class := RaceClasses[c^.race*12 + index];                      { 7000:0b80  stored via p at 0b9b }
c^.level_main := 1;                                               { 7000:0ba2 }
case c^.class of                                                  { 7000:0baa  level 1 in each base class }
  0..7: c^.level[c^.class] := 1;                                  { 7000:0bc3 }
  8:  begin c^.level[0] := 1; c^.level[2] := 1 end;               { 7000:0bd0  C/F }
  9:  begin c^.level[0] := 1; c^.level[2] := 1; c^.level[5] := 1 end;   { 7000:0be9  C/F/MU }
  10: begin c^.level[0] := 1; c^.level[4] := 1 end;               { 7000:0c0b  C/R }
  11: begin c^.level[0] := 1; c^.level[5] := 1 end;               { 7000:0c24  C/MU }
  12: begin c^.level[0] := 1; c^.level[6] := 1 end;               { 7000:0c3d  C/T }
  13: begin c^.level[2] := 1; c^.level[5] := 1 end;               { 7000:0c55  F/MU }
  14: begin c^.level[2] := 1; c^.level[6] := 1 end;               { 7000:0c6d  F/T }
  15: begin c^.level[2] := 1; c^.level[5] := 1; c^.level[6] := 1 end;   { 7000:0c85  F/MU/T }
  16: begin c^.level[5] := 1; c^.level[6] := 1 end;               { 7000:0ca6  MU/T }
end;
if ShortInt(c^.level[6]) > 0 then UpdateThiefSkills(c);           { 7000:0cb8 / 0cc9  ov23 e4; JLE = signed (#fable-6) }
c^.class_mask := 0;  c^.base_thac0 := 0;                          { 7000:0cce }
for cls := 0 to 7 do                                              { 7000:0cdf }
  if c^.level[cls] > 0 then begin                                 { 7000:0cf1  signed }
    if BaseThac0{g_3C7C}[cls*11 + c^.level[cls]] > c^.base_thac0 then
      c^.base_thac0 := BaseThac0[cls*11 + c^.level[cls]];         { 7000:0d17 / 0d49  best of the classes }
    c^.class_mask := c^.class_mask + ClassMaskBit{g_05D6}[cls];   { 7000:0d53 }
  end;
UpdateSaves(c);                                                   { 7000:0d6b  ov23 e3 }
FreeMenuList(list);                                               { 7000:0d75 }

{ ---- alignment ---- }
n := ClassAligns{g_3FE7}[c^.class*10];                            { 7000:0d89 }
NewMenuList(n + 1, list);                                         { 7000:0d9c }
list^.isHeader := 1;  list^.text := 'Pick Alignment';             { 7000:0da4 / 0db7 }
for k := 1 to n do                                                { 7000:0dbc }
  ListItem(k, list)^.text := '  ' + AlignmentName[ClassAligns[c^.class*10 + k]];  { 7000:0ddd .. 0e30 }
item := list;  index := 1;  showExit := true;  redraw := true;    { 7000:0e3d }
repeat
  key := VerticalListMenu('', '', $0D, $0A, $0F, 1, 2, $26, $16, list, showExit, redraw, index, item);   { 7000:0ea2 }
  if key = #0 then exit;                                          { 7000:0eaa }
until key = #13;                                                  { 7000:0eb3 }
c^.alignment := ClassAligns[c^.class*10 + index];                 { 7000:0ecd }
FreeMenuList(list);                                               { 7000:0ede }

{ ---- age ---- }
if c^.class <= 7 then begin                                       { 7000:0ee6  signed }
  a := @StartAge{g_3E5B}[c^.race*28 + c^.class*4];                { 7000:0eef }
  c^.age := a^.base + Roll(a^.dice, a^.sides);                    { 7000:0f26 }
end else begin p := c;                                            { 7000:0f3d  [BP-27h] := c again (a and p share the slot; #fable-6) }
  case c^.class of                                               { 7000:0f49  multi-class: base + dice*sides (the maximum) }
  8, 9, 11, 12: c^.age := StartAge[race,0].base + StartAge[race,0].dice * StartAge[race,0].sides;   { 7000:0f51 / 0fa4 / 0ff7 / 104a  cleric entry }
  13, 15, 16:   c^.age := StartAge[race,5].base + StartAge[race,5].dice * StartAge[race,5].sides;   { 7000:109d / 1143 / 1195  magic-user entry }
  14:           c^.age := StartAge[race,2].base + StartAge[race,2].dice * StartAge[race,2].sides;   { 7000:10f0  fighter entry }
end end;                                                          { quirk: class 10 (C/R) leaves age 0 — no race offers C/R }

saved := SelectedChar;  SelectedChar := c;                        { 7000:11e1 }
DrawCharacterSheet;                                               { 7000:11fb  DrawCharacterSheet }

{ ---- ability rolls; the "Keep this character?" No answer restarts here ---- }
reroll:                                                           { 7000:1200 }
c^.str_exc := 0;                                                  { 7000:1203 }
for abil := 0 to 5 do begin                                       { 7000:1208 / 120e (increment) / 1bd8 }
  c^.abil[abil] := 0;                                             { 7000:121a  TChar +10h+abil }
  for try := 1 to 6 do begin                                      { 7000:121f  best of six rolls of 3d6 }
    r := Roll(3, 6);                                              { 7000:122e }
    case raceLoop of                                              { 7000:1236  quirk: tests the race-list loop variable, always 7 here → never applies }
      1: if abil = 4 then r := r + 1 else if abil = 5 then r := r - 1;          { 7000:123d  dwarf: CON+1, CHA-1 }
      2: if abil = 3 then r := r + 1 else if abil = 4 then r := r - 1;          { 7000:1256  elf: DEX+1, CON-1 }
      5: if abil = 0 then r := r - 1 else if abil = 3 then r := r + 1;          { 7000:126f  halfling: STR-1, DEX+1 }
      6: if abil = 0 then r := r + 1 else if abil = 4 then r := r + 1
         else if abil = 5 then r := r - 2;                                     { 7000:1288  half-orc: STR+1, CON+1, CHA-2 }
    end;
    if c^.abil[abil] < r then c^.abil[abil] := r;                 { 7000:12a5  unsigned }
  end;
  p := c;                                                         { 7000:12d0 }
  a := @AgeCategory{g_3F31}[p^.race*10];                          { age limits t0..t3 (words), compare `t < p^.age` }
  L := @RaceAbilityLimits{g_3DA3}[p^.race*16];
  case abil of                                                    { 7000:12d9 / 1551 }
  0: begin                                                        { STR }
       if (p^.str > 0) and (a^[0] < p^.age) then p^.str := p^.str + 1;   { 7000:12e3 }
       if (p^.str > 0) and (a^[1] < p^.age) then p^.str := p^.str - 1;   { 7000:131c }
       if (p^.str > 0) and (a^[2] < p^.age) then p^.str := p^.str - 2;   { 7000:1355 }
       if (p^.str > 0) and (a^[3] < p^.age) then p^.str := p^.str - 1;   { 7000:138f }
       if p^.str < L^[0 + p^.gender] then p^.str := L^[0 + p^.gender];  { 7000:13c8  race/gender minimum }
       if p^.str > L^[2 + p^.gender] then p^.str := L^[2 + p^.gender];  { 7000:1424  race/gender maximum }
       if p^.str < ClassAbilityMin{g_3F81}[p^.class*6 + 0] then p^.str := ClassAbilityMin[p^.class*6 + 0];  { 7000:1480 }
       if (p^.str = 18) and (p^.level[2] > 0) then begin          { 7000:14da  fighter level > 0 (signed) }
         p^.str_exc := Random(100) + 1;                           { 7000:14f3 }
         if L^[4 + p^.gender] < p^.str_exc then p^.str_exc := L^[4 + p^.gender];  { 7000:151b  e.g. female human max 50 }
       end;
     end;
  1: begin                                                        { INT }
       if a^[1] < p^.age then p^.int := p^.int + 1;               { 7000:1558 }
       if a^[3] < p^.age then p^.int := p^.int + 1;               { 7000:1581 }
       clamp p^.int to L^[6] .. L^[7];                            { 7000:15aa / 15ec }
       if p^.int < ClassAbilityMin[p^.class*6 + 1] then p^.int := ClassAbilityMin[p^.class*6 + 1];   { 7000:162e }
     end;
  2: begin                                                        { WIS }
       if a^[0] >= p^.age then p^.wis := p^.wis - 1;              { 7000:1692  young adult }
       if a^[1] < p^.age then p^.wis := p^.wis + 1;               { 7000:16bb }
       if a^[2] < p^.age then p^.wis := p^.wis + 1;               { 7000:16e4 }
       if a^[3] < p^.age then p^.wis := p^.wis + 1;               { 7000:170d }
       clamp p^.wis to L^[8] .. L^[9];                            { 7000:1736 / 1778 }
       if p^.wis < ClassAbilityMin[p^.class*6 + 2] then p^.wis := ClassAbilityMin[p^.class*6 + 2];   { 7000:17ba }
       if (p^.wis < 13) and (p^.class in [8..12]) then p^.wis := 13;   { 7000:1814  cleric multi-classes (set CS:0525) }
     end;
  3: begin                                                        { DEX }
       if a^[2] < p^.age then p^.dex := p^.dex - 2;               { 7000:1850 }
       if a^[3] < p^.age then p^.dex := p^.dex - 1;               { 7000:187a }
       clamp p^.dex to L^[$0A] .. L^[$0B];                        { 7000:18a3 / 18e5 }
       if p^.dex < ClassAbilityMin[p^.class*6 + 3] then p^.dex := ClassAbilityMin[p^.class*6 + 3];   { 7000:1927 }
     end;
  4: begin                                                        { CON }
       if a^[1] < p^.age then p^.con := p^.con - 1;               { 7000:198b }
       if a^[2] < p^.age then p^.con := p^.con - 1;               { 7000:19b4 }
       if a^[3] < p^.age then p^.con := p^.con - 1;               { 7000:19dd }
       clamp p^.con to L^[$0C] .. L^[$0D];                        { 7000:1a06 / 1a48 }
       if p^.con < ClassAbilityMin[p^.class*6 + 4] then p^.con := ClassAbilityMin[p^.class*6 + 4];   { 7000:1a8a }
     end;
  5: begin                                                        { CHA — no age adjustment }
       clamp p^.cha to L^[$0E] .. L^[$0F];                        { 7000:1aee / 1b30 }
       if p^.cha < ClassAbilityMin[p^.class*6 + 5] then p^.cha := ClassAbilityMin[p^.class*6 + 5];   { 7000:1b72 }
     end;
  end;
  DrawAbility(abil, false);                                       { 7000:1bd3  DrawAbility }
end;
{ "clamp x to lo .. hi" = if x < lo then x := lo; if x > hi then x := hi (unsigned bytes, the minimum first). }

p := c;                                                           { 7000:1be1 }
p^.hp := p^.hp_max;                                               { 7000:1bed  (old value; set again below) }
p^.attacks := 2;  p^.base_dmg_dice[1] := 1;  p^.base_dmg_sides[1] := 2;   { 7000:1bfc  1 attack/round, 1d2 bare hands }
p^.unk_AA := 1;  p^.base_move := 12;                              { 7000:1c14 }
goldSum := 0;  nCls := 0;                                         { 7000:1c25 }
for cls := 0 to 7 do                                              { 7000:1c2d }
  if p^.level[cls] > 0 then begin                                 { 7000:1c3f  signed }
    if cls = 0 then p^.spell_slots[0] := 1                        { 7000:1c51  cleric level-1 slot (+B2h) }
    else if cls = 5 then p^.spell_slots[3] := 1;                  { 7000:1c60  magic-user level-1 slot (+B5h) }
    goldSum := goldSum + Roll(StartGoldDice{g_4263}[cls*2], StartGoldDice[cls*2 + 1]);   { 7000:1c83  byte }
    nCls := nCls + 1;                                             { 7000:1c8b }
    if cls = 0 then begin                                         { 7000:1c91 }
      WisdomBonusSpells(c);                                       { 7000:1c9b  ov23 e2 }
      for k := 1 to $38 do                                        { 7000:1ca0 }
        if (SpellTable{g_31FA}[k].cls = 0) and (SpellTable[k].lvl = 1) then   { 7000:1cc1  byte 0 / byte 1 of the 16-byte entry }
          p^.known_spell[k] := 1;                                 { 7000:1cdb  +32h+k: every level-1 cleric spell }
    end else if cls = 5 then begin                                { 7000:1ce8 }
      p^.known_spell[$0B] := 1;  p^.known_spell[$12] := 1;        { 7000:1cec  +3Dh, +44h }
      p^.known_spell[$13] := 1;  p^.known_spell[$15] := 1;        { 7000:1cfc  +45h, +47h: four first-level MU spells }
    end;
  end;
p^.money[3] := (goldSum * 10) div nCls;                           { 7000:1d15  gold (+8Eh) = average class roll ×10 }
p^.hp_rolled := RollHitDice(c, $FF);                            { 7000:1d3b  one hit die per class }
p^.hp_max := p^.hp_rolled;                                        { 7000:1d49 }
conAdj := ConHpBonus(c);                                       { 7000:1d5c  signed CON hit-point adjustment }
if conAdj < 0 then begin                                          { 7000:1d63 }
  if p^.hp_max > Abs(conAdj) + nCls then                          { 7000:1d69 .. 1d87 }
    p^.hp_max := (p^.hp_max + conAdj) div nCls                    { 7000:1d9d }
  else p^.hp_max := 1;                                            { 7000:1da8 }
end else
  p^.hp_max := (p^.hp_max + conAdj) div nCls;                     { 7000:1dc6 }
p^.hp := p^.hp_max;                                               { 7000:1dcf }
p^.hp_rolled := p^.hp_rolled div nCls;                            { 7000:1df0 }
DrawCombatStats;                                                  { 7000:1dfa  DrawCombatStats }
DrawMoney;                                                        { 7000:1dff  DrawMoney }
key := AskYesNo('Keep this character? ', $0D, $0A, $0F);          { 7000:1e1c }
if key <> 'Y' then goto reroll;                                   { 7000:1e24  quirk: gold, slots, HP re-rolled; known spells stay set }

DrawCharacterSheet;                                               { 7000:1e2d }
SelectedChar := saved;                                            { 7000:1e32 }
repeat
  c^.name := ReadBottomLine('Character name: ', $0D, 15);         { 7000:1e5a / 1e68  StrAssign max 15 }
until c^.name <> '';                                              { 7000:1e70 }
saved := SelectedChar;  SelectedChar := c;                        { 7000:1e76 }
PortraitMenu;                                                    { 7000:1e91  "Head Body Keep" portrait picker (part B) }
IconEditor;                                                        { 7000:1e95  combat-icon editor (part B) }
WriteCharacter(c^, '');                                           { 7000:1ead  WriteCharacter: SAVE\<name>.CHA (+.ITM/.SPC) + charlist.txt }
SelectedChar := saved;                                            { 7000:1eb2 }
FreeMem(c, $11D);                                                 { 7000:1ec9  quirk: the effect list (racial effects) is not freed }
```
Notes (port): the new character does not join the party here — it is only stored in the roster; "Add Character to Party" loads it.
`level[k] > 0`, `class <= 7` and `level[2] > 0` are signed byte tests (`JLE`/`JG`), the ability clamps unsigned (`JNC`/`JBE`).
Abort (#0 from any list) leaks `c`, the current menu list and any racial effects; a port may free them (no visible difference).

### 7000:1551 FUN_7000_1551 — not a routine (H)
Second half of CreateCharacter (ability cases 1..5, HP/gold, keep/name/portrait/save) — written above. Its only entry is
`JMP 7000:1551` at 7000:12E0 from the ability `case`; it uses CreateCharacter's frame and ends with CreateCharacter's
`RETF` at 7000:1ED1. Ghidra's callers line "CreateCharacter" is that jump.
