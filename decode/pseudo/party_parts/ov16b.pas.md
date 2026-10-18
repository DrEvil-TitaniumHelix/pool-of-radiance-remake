## ov16 (7000), part B — 7000:1F37 .. 4454: drop, modify, training, add, remove, portrait + icon editor, hit-point and money helpers (FINAL pseudocode, lane por-mod-party, fork ov16b)

Routines: 7000:1F37, 2033, 209F, 29AE, 306D, 3291, 33E7, 34DF, 35BE, 382D, 3F31, 3FB3, 408C, 4235, 42ED, 4454 (16, all of functions.tsv in the range).
Evidence: `decode/listings/ov16.lst` lines 3101..6910 and the unit bytes (`python decode/ecl/hdis.py ov16 START END`); DS tables read from `decode/bin/START.unpacked.exe` (file offset = 8E0h + C7C0h + DS offset). Character fields by SAVES.md §3 (TChar), coin order by SAVES.md `money[0..6]`.

Conventions (as VIEW.pas.md / ENGINE.pas.md)
- **Signatures in Pascal order**: first parameter = highest BP offset = pushed first; parameters as `name [BP+xx]`. Every call below was written from its PUSH sequence.
- **Nested procedures**: a near `CALL` preceded by `PUSH BP; PUSH CS` passes the caller's frame as static link at `[BP+6]` (2033 in ModifyCharacter, 34DF/35BE in IconEditor). They read the parent's locals; written here as the parent's variable names.
- Temp strings: `@StrCopy(tmp, lit); @StrAppend(x)` leaves `tmp` on the stack as the next call's string argument — written as `lit + x`.
- `{ seg:off }` = first instruction of the statement; `{ quirk: ... }` = behaviour a faithful port must copy.
- Globals: names from decode/names/*.json (SelectedChar DS:5D92, PartyHead DS:5D96, ecl_Mem6B00 DS:49D6, VideoMode DS:4A1E, travel_Mode DS:49FA, CombatIcons DS:5E5A, ClassName DS:0D38, CoinValue DS:0D24); names introduced here (ov16b_names.json) are written `Name{g_XXXX}` on first use.
- Callees in other units by their lane names: AskYesNo / HorizontalMenu / VerticalListMenu / ClearMenuLine / FreeMenuList (ov25, VIEW.pas.md), DrawCharacterSheet / DrawCombatStats / DrawAbility / MoneyInGold / SpellList (ov19, combat_parts/ov19.pas.md), UpdateLevelStats / WisdomBonusSpells (ov23), ShowPortrait (ov28), FreeCombatIcon / LoadCombatIcon / DrawIconAt (ov32), PaletteFlashOn / PaletteFlashOff (ov31), Roll (ov24), resident ENGINE names. ov17 routines are kept as `ov17_XXXX` with their SAVES.md role in a comment (ov17 belongs to another PARTY fork): ReadCharList ReadRoster(var list), WriteCharList WriteRoster(list), LoadCharacterIcon (load SelectedChar's combat icon into CombatIcons slot `party_slot`; byte arg, L), ReadCharacter ReadCharacter(name, var c, b1, b2), AddToParty AddToParty(c). `FreeCharacter` (ov16 part A) frees a TChar with its combat record, items and effects.

Tables (image bytes, H unless noted)
- `RaceAbilityLimits{g_3DA3}`: 16 bytes per race (`+race*16`): +0/+1 STR min (male/female, `+gender`), +2/+3 STR max, +4/+5 exceptional-STR max, +6/+7 INT min/max, +8/+9 WIS, +0Ah/+0Bh DEX, +0Ch/+0Dh CON, +0Eh/+0Fh CHA. E.g. human `03 03 12 12 64 32 03 12 ...` (STR 3..18, 18/00 male, 18/50 female), dwarf `08 08 12 11 63 00 03 12 03 12 03 11 0C 13 03 10`.
- `ClassAbilityMin{g_3F81}`: 6 bytes per class (`+class*6 + stat`, stat order STR INT WIS DEX CON CHA): cleric 6 6 9 0 0 0, druid 0 0 12 0 0 15, fighter 9 0 6 6 7 0, paladin 13 9 12 0 9 17, ranger 0 13 14 0 14 0, MU 0 9 6 6 0 0, thief 6 6 0 9 0 0, monk 15 0 15 15 11 0, multi-classes 8..16 (see notes).
- `XpForLevel{g_409B}`: LongInt, `[cls*38h + lvl*4]` = XP needed for level `lvl` of base class `cls`; −1 = level not attainable: cleric 1501, 3001, 6001, 13001, 27501 (L2..6); fighter 2001 .. 125001 (L2..8); MU 2501 .. 40001 (L2..6); thief 1251 .. 110001 (L2..9); druid/paladin/ranger/monk all −1.
- `ClassTrainBits{g_05DE}`[cls] = 02 02 08 0A 0A 01 04 06 (MU 1, cleric 2, thief 4, fighter 8 — the TChar class_mask bits; compared with the training hall's mask `ecl_Mem6B00^.w[$550]`).
- `ConHpAdj{g_408E}`[CON] (signed): CON 3 → −2, 4..6 → −1, 7..14 → 0, 15 → +1, 16..20 → +2.
- `HitDiceCount{g_08B6}`[cls] = 1 1 1 1 2 1 1 2, `HitDieSides{g_08BE}`[cls] = 8 8 10 10 8 4 6 4 (cleric d8, druid d8, fighter d10, paladin d10, ranger 2d8, MU d4, thief d6, monk 2d4).
- `CoinValue{g_0D24}`[0..4] = 1, 10, 100, 200, 1000 (copper value of copper, silver, electrum, gold, platinum).
- `IconMenuText{g_07BF}`: string[40] per icon-editor state (`+state*29h`): 1 'Parts color-1 color-2 Size Exit', 2 'Head Weapon Exit', 3 'Weapon Body xxxx Shield Arm Leg Exit' (chars 13..16 replaced by 'Hair'/'Face'), 4 ' Keep Exit', 5 'Next Prev Keep Exit'.
- `IconColourSlot{g_3CF5}`[1..6] = 1, 2, 3, 4, 6, 7 (EGA colour replaced by the low nibble of `icon_colours[i-1]`; colour+8 by the high nibble).

---

### 7000:1F37 DropCharacter (H)
`procedure DropCharacter` — `RETF`. Callers: PartyCreationMenu (top menu). Callees: AskYesNo, ShowTimedBottomMessage, RemoveFromParty.
Name H: strings "Drop ", " forever? ", "Are you sure? ", "You dump ", " out back.", " bids you farewell.", " breathes a sigh of relief." (cs:1ED2..1F1B).
```pascal
if SelectedChar = nil then exit;                                                   { 7000:1f3e }
c := SelectedChar;                                                                 { 7000:1f4a }
if AskYesNo('Drop ' + c^.name + ' forever? ', $0E, $0A, $0F) = 'Y' then begin      { 7000:1f81 }
  if AskYesNo('Are you sure? ', $0E, $0A, $0F) = 'Y' then begin                    { 7000:1fa6 }
    if c^.active = 0 then                                                          { 7000:1faf  TChar +10Dh }
      ShowTimedBottomMessage('You dump ' + c^.name + ' out back.')                 { 7000:1fde }
    else
      ShowTimedBottomMessage(c^.name + ' bids you farewell.');                     { 7000:1fff }
    RemoveFromParty(false, true);                                                  { 7000:200b  count decremented, icon freed }
    exit;                                                                          { 7000:200e }
  end;
end;
ShowTimedBottomMessage(c^.name + ' breathes a sigh of relief.');                   { 7000:202a  first or second answer not 'Y' }
```
{ quirk: the character is removed from the party list and freed, but nothing is deleted on disk here (the roster file is not touched). }

### 7000:2033 DrawModifyField (M) *nested in ModifyCharacter*
`procedure DrawModifyField(highlight [BP+8]: Boolean)` (static link [BP+6]; `RETF 4`). Reads the parent's `field` ([BP−0Dh] of ModifyCharacter).
```pascal
if field < 6 then DrawAbility(field, highlight)                                    { 7000:2039 / 204c  ability row }
else DrawHP(SelectedChar, 4, $12, highlight);                                      { 7000:2065  HP }
```

### 7000:209F ModifyCharacter (H)
`procedure ModifyCharacter` — `RETF`. Callers: PartyCreationMenu. Callees: ShowTimedBottomPrompt, DrawCharacterSheet, System.Move, DrawModifyField, HorizontalMenu, WisdomBonusSpells, MaxHitPoints, MinHitPoints, RecalcCharacter, DrawCombatStats.
Lets the player edit the six abilities and max HP of a character that has no experience yet, within race/gender/class limits. Name H ("Modify character: ", "Keep Exit", " can't be modified.").
Locals: `saved[0..5]` [BP−6] (abilities), `savedExc` [BP−7], `savedHp` [BP−8], `field` [BP−0Dh] (0..5 = STR..CHA, 6 = HP), `key` [BP−0Bh], `ext` [BP−0Ch], `c` [BP−18h] = SelectedChar.
```pascal
if SelectedChar^.xp > 0 then begin                                                 { 7000:20a6  signed LongInt test }
  ShowTimedBottomPrompt(SelectedChar^.name + ' can''t be modified.', $0E);         { 7000:20da }
  exit;
end;
DrawCharacterSheet;                                                                { 7000:20e2 }
Move(SelectedChar^.str, saved, 6);                                                 { 7000:20fa  +10h..+15h }
savedExc := SelectedChar^.str_exc;                                                 { 7000:20ff  +16h }
savedHp := SelectedChar^.hp_max;                                                   { 7000:210a  +32h }
field := 6;  DrawModifyField(false);                                               { 7000:2115 / 211e }
field := 0;  DrawModifyField(true);                                                { 7000:2121 / 212a }
c := SelectedChar;                                                                 { 7000:212d }
repeat
  key := HorizontalMenu('Modify character: ', 'Keep Exit', $0D, $0A, $0F, true, false, ext);   { 7000:2169 }
  DrawModifyField(false);                                                          { 7000:2176 }
  if ext then begin                                                                { 7000:2179 }
    if (key = 'P') or (key = #13) then begin                                       { 7000:2182  Down }
      field := field + 1;  if field > 6 then field := 0;                           { 7000:218d }
    end
    else if key = 'H' then begin                                                   { 7000:219d  Up }
      field := field - 1;  if field = -1 then field := 6;                          { 7000:21a1 }
    end
    else if key = 'K' then begin                                                   { 7000:21b1  Left = decrease }
      if field < 6 then begin                                                      { 7000:21b8 }
        i := field;                                                                { 7000:21c1 }
        Dec(c^.ability[i]);                                                        { 7000:21d0  c^ +10h+i }
        case i of
          0: if c^.str_exc > 0 then begin                                          { 7000:21de }
               Dec(c^.str_exc);  Inc(c^.str);                                      { 7000:21eb / 21f8  exceptional strength first }
             end
             else if (c^.str < RaceAbilityLimits[c^.race].strMin[c^.gender])       { 7000:221a }
                  or (c^.str < ClassAbilityMin[c^.class, 0]) then                  { 7000:2241 }
               c^.str := RaceAbilityLimits[c^.race].strMin[c^.gender];             { 7000:2271 }
          1: if (c^.int < RaceAbilityLimits[c^.race].intMin) or (c^.int < ClassAbilityMin[c^.class, 1]) then   { 7000:2297 / 22be }
               c^.int := RaceAbilityLimits[c^.race].intMin;                        { 7000:22e1 }
          2: begin
               if (c^.wis < RaceAbilityLimits[c^.race].wisMin) or (c^.wis < ClassAbilityMin[c^.class, 2]) then   { 7000:230a / 2331 }
                 c^.wis := RaceAbilityLimits[c^.race].wisMin;                      { 7000:2354 }
               if c^.spell_slots[0] > 0 then c^.spell_slots[0] := 1;               { 7000:2365  +B2h cleric L1 slots }
               WisdomBonusSpells(SelectedChar);                                    { 7000:2381 }
             end;
          3: if (c^.dex < RaceAbilityLimits[c^.race].dexMin) or (c^.dex < ClassAbilityMin[c^.class, 3]) then   { 7000:239b / 23c2 }
               c^.dex := RaceAbilityLimits[c^.race].dexMin;                        { 7000:23e5 }
          4: begin
               if (c^.con < RaceAbilityLimits[c^.race].conMin) or (c^.con < ClassAbilityMin[c^.class, 4]) then   { 7000:240e / 2435 }
                 c^.con := RaceAbilityLimits[c^.race].conMin;                      { 7000:2458 }
               if MaxHitPoints(SelectedChar) < c^.hp_max then                      { 7000:2472 }
                 c^.hp_max := MaxHitPoints(SelectedChar);                          { 7000:2487 }
               c^.hp := c^.hp_max;                                                 { 7000:2491  +11Bh }
               field := 6;  DrawModifyField(false);  field := 4;                   { 7000:24a0 / 24a9 / 24ac  redraw HP }
             end;
          5: if (c^.cha < RaceAbilityLimits[c^.race].chaMin) or (c^.cha < ClassAbilityMin[c^.class, 5]) then   { 7000:24c4 / 24eb }
               c^.cha := RaceAbilityLimits[c^.race].chaMin;                        { 7000:250e }
        end;
      end
      else begin                                                                   { field 6 = HP }
        Dec(c^.hp_max);                                                            { 7000:2521 }
        if MinHitPoints(SelectedChar) > c^.hp_max then                             { 7000:2531 }
          c^.hp_max := MinHitPoints(SelectedChar);                                 { 7000:2546 }
        c^.hp := c^.hp_max;                                                        { 7000:2550 }
      end;
    end
    else if key = 'M' then begin                                                   { 7000:2562  Right = increase }
      if field < 6 then begin                                                      { 7000:2569 }
        i := field;                                                                { 7000:2572 }
        Inc(c^.ability[i]);                                                        { 7000:2581 }
        case i of
          0: if c^.str > RaceAbilityLimits[c^.race].strMax[c^.gender] then begin   { 7000:25aa }
               if (c^.str > 18) and (c^.level[2] > 0)                              { 7000:25c8 / 25cf  fighter level +98h }
                  and (RaceAbilityLimits[c^.race].excMax[c^.gender] > c^.str_exc) then   { 7000:25f5 }
                 Inc(c^.str_exc);                                                  { 7000:2605 }
               c^.str := RaceAbilityLimits[c^.race].strMax[c^.gender];             { 7000:2624 }
             end;
          1: if c^.int > RaceAbilityLimits[c^.race].intMax then c^.int := RaceAbilityLimits[c^.race].intMax;   { 7000:264a / 266d }
          2: begin
               if c^.wis > RaceAbilityLimits[c^.race].wisMax then c^.wis := RaceAbilityLimits[c^.race].wisMax; { 7000:2693 / 26b6 }
               if c^.spell_slots[0] > 0 then c^.spell_slots[0] := 1;               { 7000:26c7 }
               WisdomBonusSpells(SelectedChar);                                    { 7000:26e3 }
             end;
          3: if c^.dex > RaceAbilityLimits[c^.race].dexMax then c^.dex := RaceAbilityLimits[c^.race].dexMax;   { 7000:26fd / 2720 }
          4: begin
               if c^.con > RaceAbilityLimits[c^.race].conMax then c^.con := RaceAbilityLimits[c^.race].conMax; { 7000:2749 / 276c }
               if MinHitPoints(SelectedChar) > c^.hp_max then                      { 7000:2786 }
                 c^.hp_max := MinHitPoints(SelectedChar);                          { 7000:279b }
               c^.hp := c^.hp_max;                                                 { 7000:27a5 }
               field := 6;  DrawModifyField(false);  field := 4;                   { 7000:27b4 / 27bd / 27c0 }
             end;
          5: if c^.cha > RaceAbilityLimits[c^.race].chaMax then c^.cha := RaceAbilityLimits[c^.race].chaMax;   { 7000:27d8 / 27fb }
        end;
      end
      else begin                                                                   { HP }
        Inc(c^.hp_max);                                                            { 7000:280e }
        if MaxHitPoints(SelectedChar) < c^.hp_max then                             { 7000:281e }
          c^.hp_max := MaxHitPoints(SelectedChar);                                 { 7000:2833 }
        c^.hp := c^.hp_max;                                                        { 7000:283d }
      end;
    end;
  end
  else if (key = 'E') or (key = #0) then begin                                     { 7000:284e  Exit / Esc: undo everything }
    for i := 0 to 5 do SelectedChar^.ability[i] := saved[i];                       { 7000:2859 }
    SelectedChar^.str_exc := savedExc;                                             { 7000:287f }
    SelectedChar^.hp_max := savedHp;                                               { 7000:288a }
    SelectedChar^.hp := c^.hp_max;                                                 { 7000:2895 }
    RecalcCharacter(SelectedChar);                                                 { 7000:28ad }
    exit;
  end;
  RecalcCharacter(SelectedChar);                                                   { 7000:28bc }
  DrawCombatStats;                                                                 { 7000:28c1 }
  DrawModifyField(true);                                                           { 7000:28cb }
until (not ext) and (key = 'K');                                                   { 7000:28ce / 28d7 }
SelectedChar^.unk_85 := 1;                                                         { 7000:28e0  "Keep" }
```
{ quirk: decreasing below the class minimum (but not below the race minimum) resets the ability to the **race** minimum, which can be lower than the class minimum (e.g. a human cleric's WIS 9 → 8 → 3). }
{ quirk: STR above 18 only raises exceptional strength when the *fighter* level (+98h) is > 0 — paladins and rangers (levels at +99h/+9Ah) cannot raise it here. }
{ quirk: lowering CON clamps hp_max to MaxHitPoints, raising CON clamps it to MinHitPoints (the asm calls 408C on decrease and 3FB3 on increase). }
{ quirk: a non-extended #13 (Enter) does nothing (only extended 'P'/#13 move the field; HorizontalMenu never sets ext with #13). }

### 7000:29AE TrainCharacter (H)
`procedure TrainCharacter` — `RETF`. Callers: PartyCreationMenu (training hall 'T'). Callees: ShowTimedBottomPrompt, MoneyInGold, ClearRectangle, DrawCharacterName, DrawText, ByteToStr, AskYesNo, ShowTimedBottomMessage, PayGold, UpdateLevelStats, SpellList, RollHitDice, ConHpBonus.
Name H: "we only train conscious people", "Training costs 1000 gp.", "We don't train that class here", "Not Enough Experience", " will become:", "Do you wish to train? ", "Congratulations...".
Locals: `c` [BP−21h] = SelectedChar, `haveBits` [BP−0Bh], `canBits` [BP−0Ah], `trainBits` [BP−0Ch], `xpCap` [BP−5] (LongInt), `cls` [BP−13h], `lvl` [BP−18h], `blocked` [BP−1], `nextXp` [BP−9], `row` [BP−16h], `nClasses` [BP−0Dh], `oldMuLvl` [BP−17h].
```pascal
if (SelectedChar^.status <> 0) and not StingMode{g_470C} then begin               { 7000:29b5 / 29c1 }
  ShowTimedBottomPrompt('we only train conscious people', $0E);  exit;             { 7000:29da }
end;
if (MoneyInGold(SelectedChar) < 1000) and not StingMode then begin                 { 7000:29ea / 29fb }
  ShowTimedBottomPrompt('Training costs 1000 gp.', $0E);  exit;                    { 7000:2a14 }
end;
canBits := 0;  haveBits := 0;  c := SelectedChar;  xpCap := 0;                     { 7000:2a1c .. 2a33 }
for cls := 0 to 7 do                                                               { 7000:2a36 }
  if c^.level[cls] > 0 then begin                                                  { 7000:2a48 }
    haveBits := haveBits + ClassTrainBits[cls];                                    { 7000:2a59 }
    blocked := false;  lvl := c^.level[cls];                                       { 7000:2a60 / 2a6d }
    case c^.race of                                                                { 7000:2a78  demi-human level limits }
      1 {dwarf}:    if cls = 2 then if ((lvl = 8) and (c^.str = 17)) or ((lvl = 7) and (c^.str < 17)) then blocked := true;   { 7000:2a80 }
      2 {elf}:      if cls = 2 then if (lvl = 7) or ((lvl = 6) and (c^.str = 17)) or ((lvl = 5) and (c^.str < 17)) then blocked := true;   { 7000:2ab1 }
      3 {gnome}:    if cls = 2 then if (lvl = 6) or ((lvl = 5) and (c^.str < 18)) then blocked := true;   { 7000:2ae8 }
      4 {half-elf}: if (cls = 0) and (lvl = 5) then blocked := true                { 7000:2b0e }
                    else if cls = 2 then if (lvl = 8) or ((lvl = 7) and (c^.str = 17)) or ((lvl = 6) and (c^.str < 17)) then blocked := true;   { 7000:2b20 }
      5 {halfling}: if cls = 2 then if (lvl = 6) or ((lvl = 5) and (c^.str = 17)) or ((lvl = 4) and (c^.str < 17)) then blocked := true;   { 7000:2b56 }
    end;
    if not blocked then                                                            { 7000:2b86 }
      if (XpForLevel[cls, lvl+1] <= c^.xp) or StingMode then                       { 7000:2ba8 / 2bc3  signed LongInt compare }
        if XpForLevel[cls, lvl+1] > 0 then begin                                   { 7000:2be6  −1 = no further level }
          canBits := canBits + ClassTrainBits[cls];                                { 7000:2c02 }
          nextXp := XpForLevel[cls, lvl+2];                                        { 7000:2c24 }
          if (nextXp > 0) and (c^.xp >= nextXp) and (nextXp > xpCap) then          { 7000:2c32 / 2c40 / 2c59 }
            xpCap := nextXp - 1;                                                   { 7000:2c6b }
        end;
  end;
if xpCap > 0 then c^.xp := xpCap;                                                  { 7000:2c86 / 2c94  at most one level per training }
if not StingMode then begin                                                        { 7000:2ca7 }
  if (haveBits and ecl_Mem6B00^.w[$550]) = 0 then begin                            { 7000:2cae  hall's class mask }
    ShowTimedBottomPrompt('We don''t train that class here', $0E);  exit;          { 7000:2cd2 }
  end;
  if (canBits and ecl_Mem6B00^.w[$550]) = 0 then begin                             { 7000:2cdc }
    ShowTimedBottomPrompt('Not Enough Experience', $0E);  exit;                    { 7000:2d00 }
  end;
  trainBits := canBits and ecl_Mem6B00^.w[$550];                                   { 7000:2d0f }
end
else trainBits := canBits;                                                         { 7000:2d22 }
ClearRectangle(1, 1, $26, $16);                                                    { 7000:2d34 }
row := 4;                                                                          { 7000:2d39 }
DrawCharacterName(SelectedChar, 4, row, false);                                    { 7000:2d4f }
DrawText(Length(c^.name) + 4, row, $0A, ' will become:');                          { 7000:2d76 }
for cls := 0 to 7 do                                                               { 7000:2d7b }
  if (c^.level[cls] > 0) and ((ClassTrainBits[cls] and trainBits) <> 0) then begin { 7000:2d8d / 2da2 }
    row := row + 1;                                                                { 7000:2dac }
    if row = 5 then
      DrawText(6, row, $0A, '    a level ' + ByteToStr(c^.level[cls] + 1) + ' ' + ClassName[cls])   { 7000:2e10 }
    else
      DrawText(6, row, $0A, 'and a level ' + ByteToStr(c^.level[cls] + 1) + ' ' + ClassName[cls]);  { 7000:2e72 }
  end;
if AskYesNo('Do you wish to train? ', $0D, $0A, $0F) <> 'Y' then exit;             { 7000:2e98 }
ShowTimedBottomMessage('Congratulations...');                                      { 7000:2eb3 }
if not StingMode then PayGold(1000, SelectedChar);                                 { 7000:2eb8 / 2ecf }
nClasses := 0;                                                                     { 7000:2ed2 }
oldMuLvl := c^.level[5];                                                           { 7000:2ed6  +9Bh }
for cls := 0 to 7 do                                                               { 7000:2ee1 }
  if c^.level[cls] > 0 then begin                                                  { 7000:2ef3 }
    nClasses := nClasses + 1;                                                      { 7000:2efb }
    if (ClassTrainBits[cls] and trainBits) <> 0 then begin                         { 7000:2f04 }
      Inc(c^.level[cls]);                                                          { 7000:2f18 }
      if c^.levels_drained > 0 then begin                                          { 7000:2f20  +74h }
        c^.hp_drained := c^.hp_drained - c^.hp_drained div c^.levels_drained;      { 7000:2f27  +75h }
        Dec(c^.levels_drained);                                                    { 7000:2f48 }
      end;
    end;
  end;
UpdateLevelStats(SelectedChar);                                                    { 7000:2f5a  ov23: THAC0, attacks, slots, saves, thief skills }
if c^.level[5] > oldMuLvl then begin                                               { 7000:2f62  magic-user gained a level: learn one spell }
  index := -1;                                                                     { 7000:2f6c }
  repeat
    spell := SpellList(4, 4, index, count);                                        { 7000:2f81  mode 4 = learnable spells }
  until (spell > 0) or (count = 0);                                                { 7000:2f89 / 2f8f }
  c^.known_spell[spell] := 1;                                                      { 7000:2f95  byte +32h+spell }
end;
hpRoll := RollHitDice(SelectedChar, trainBits);                                    { 7000:2fb1 }
gain := hpRoll div nClasses;  if gain = 0 then gain := 1;                          { 7000:2fc4 / 2fc9 }
c^.hp_rolled := c^.hp_rolled + gain;                                               { 7000:2fd4  +B1h }
conAdj := ConHpBonus(SelectedChar);                                                { 7000:2fe8 }
gain := (hpRoll + conAdj) div nClasses;  if gain < 1 then gain := 1;               { 7000:2ffd / 3002 }
wounds := c^.hp_max - c^.hp;                                                       { 7000:300d }
c^.hp_max := c^.hp_max + gain;                                                     { 7000:3027 }
c^.hp := c^.hp_max - wounds;                                                       { 7000:3031 }
```
{ quirk: the XP cap (`xp := XP of the level after next − 1`) is written before the hall/class checks, so a character turned away with "We don't train that class here" or "Not Enough Experience" still loses the excess XP. }
{ quirk: if the magic-user has no learnable spell (`count = 0`, `spell = 0`) the store goes to byte +32h = `hp_max`, setting it to 1 before the HP gain is added. }
{ quirk: the per-class HP split divides by the number of *all* classes with level > 0 (`nClasses`), also for classes not trained this time. }
Note: `ecl_Mem6B00^.w[$550]` (training hall class mask) is set by the ECL script before the hall menu (ECL var; L for the variable's ECL name).

### 7000:306D AddCharacterMenu (H)
`procedure AddCharacterMenu` — `RETF`. Callers: PartyCreationMenu ('A' Add). Callees: ClearRectangle, ReadCharList ReadRoster, VerticalListMenu, System.GetMem/FreeMem, ReadCharacter ReadCharacter, @StrAssign, System.@StrCompare, AddToParty AddToParty, LoadCharacterIcon, WriteCharList WriteRoster, FreeMenuList.
Name H ("Add a character: ", "Add Exit"; roster list from charlist.txt).
Locals: `list` [BP−4], `item` [BP−8], `index` [BP−12h], `redraw` [BP−15h], `showExit` [BP−14h] (never initialised), `key` [BP−13h], `newC` [BP−0Ch], `p` [BP−10h], `pcCount` [BP−16h].
```pascal
ClearRectangle(1, 1, $26, $16);                                                    { 7000:3080 }
ReadCharList(list);                                                                   { 7000:308a  ReadRoster: one menu item per charlist.txt line }
if list = nil then exit;                                                           { 7000:308f }
index := 0;  item := list;  redraw := true;                                        { 7000:309a .. 30ab }
repeat
  key := VerticalListMenu('Add a character: ', 'Add Exit', $0D, $0A, $0F, 1, 2, $26, $16,
                          list, showExit, redraw, index, item);                    { 7000:30fb }
  if ((key = #13) or (key = 'A')) and (item^.text[1] <> '*') then begin            { 7000:3103 / 3112  '*' = already added }
    GetMem(newC, $11D);                                                            { 7000:3123 }
    ReadCharacter(item^.text, newC^, false, true);                                     { 7000:313f  ReadCharacter from SAVE\<name>.CHA }
    item^.text := '* ' + item^.text;                                               { 7000:3167  mark the roster line }
    pcCount := 0;                                                                  { 7000:316c }
    if PartyHead = nil then begin                                                  { 7000:3170 }
      ecl_Mem6B00^.w[$67C] := 0;                                                   { 7000:317f  party member count }
      AddToParty(newC);                                                             { 7000:318a  AddToParty }
      LoadCharacterIcon(1);                                                                { 7000:3192  load its combat icon }
    end
    else begin
      p := PartyHead;                                                              { 7000:319a }
      while (p <> nil) and not ((p^.name = newC^.name) and (p^.unk_AB = newC^.unk_AB)) do begin   { 7000:31a7 / 31b9 / 31cb }
        if p^.npc_morale < $80 then pcCount := pcCount + 1;                        { 7000:31d2  count player characters }
        p := p^.next;                                                              { 7000:31e0 }
      end;
      if (p = nil) and                                                             { 7000:31f5  not already in the party }
         (((newC^.npc_morale < $80) and (pcCount < 6))                             { 7000:31fd / 3208  max 6 PCs }
          or ((newC^.npc_morale > $7F) and (ecl_Mem6B00^.w[$67C] < 8))) then begin { 7000:320e / 3219  max 8 members }
        AddToParty(newC);                                                           { 7000:322b }
        LoadCharacterIcon(1);                                                              { 7000:3233 }
        if newC^.npc_morale < $80 then pcCount := pcCount + 1;                     { 7000:3238 }
      end
      else FreeMem(newC, $11D);                                                    { 7000:3252 }
    end;
  end;
until (key = 'E') or (key = #0) or (pcCount > 5) or (ecl_Mem6B00^.w[$67C] > 7);    { 7000:3257 .. 326d }
WriteCharList(list);                                                                   { 7000:327e  WriteRoster }
FreeMenuList(list);                                                                { 7000:3288 }
```
{ quirk: the '* ' mark is set before the duplicate/size checks, so a refused character is still shown as added (and its line is not written back by WriteRoster, SAVES.md §1). }
{ quirk: `showExit` ([BP−14h]) is passed to VerticalListMenu uninitialised (stack garbage); the options string already contains "Exit". }
{ quirk: the duplicate test compares name and TChar byte +ABh (unk_AB); TP's StrCompare is exact (case-sensitive). }

### 7000:3291 RemoveFromParty (H)
`procedure RemoveFromParty(keepCount [BP+8], freeIcon [BP+6]: Boolean)` — `RETF 4`. Callers: DropCharacter (false, true), PartyCreationMenu (false, true, after saving the character to the roster). Callees: FreeCombatIcon, FreeCharacter (free the record).
Unlinks `SelectedChar` from the party list (`PartyHead`, link TChar +104h), frees it, and makes its predecessor (or the new head) the selected character.
```pascal
if PartyHead = nil then exit;                                                      { 7000:3297 }
p := PartyHead;                                                                    { 7000:32a3 }
if p = SelectedChar then begin                                                     { 7000:32b0  first member }
  if freeIcon then FreeCombatIcon(SelectedChar^.party_slot);                       { 7000:336b / 337b }
  PartyHead := SelectedChar^.next;                                                 { 7000:3380 }
  p := SelectedChar^.next;                                                         { 7000:3395 }
  FreeCharacter(SelectedChar);                                                     { 7000:33b2  free record, items, effects }
  SelectedChar := p;                                                               { 7000:33b5 }
  if not keepCount then Dec(ecl_Mem6B00^.w[$67C]);                                 { 7000:33c2 / 33cc }
end
else begin
  while (p^.next <> SelectedChar) and (p^.next <> nil) do p := p^.next;            { 7000:32c5 .. 32fd }
  if p^.next <> nil then begin                                                     { 7000:3302 }
    if freeIcon then FreeCombatIcon(SelectedChar^.party_slot);                     { 7000:3311 / 3321 }
    p^.next := SelectedChar^.next;                                                 { 7000:3326 }
    FreeCharacter(SelectedChar);                                                   { 7000:334a }
    SelectedChar := p;                                                             { 7000:334d  predecessor becomes selected }
    if not keepCount then Dec(ecl_Mem6B00^.w[$67C]);                               { 7000:335a / 3364 }
  end;
end;
```

### 7000:33E7 PortraitMenu (H)
`procedure PortraitMenu` — `RETF`. Callers: FUN_7000_1551 (character creation, ov16 part A). Callees: ShowPortrait, HorizontalMenu, ClearMenuLine.
Name H ("Head Body Keep"; cycles TChar +BBh head_pic and +BCh body_pic, both drawn by ShowPortrait).
```pascal
c := SelectedChar;                                                                 { 7000:33ed }
head := c^.head_pic;  body := c^.body_pic;                                         { 7000:33f7 / 3402 }
repeat
  ShowPortrait;                                                                    { 7000:340d }
  key := HorizontalMenu('', 'Head Body Keep', 0, $0F, $0A, false, false, ext);     { 7000:3444 }
  if not ext then                                                                  { 7000:344c }
    if key = 'H' then begin
      if c^.head_pic < 14 then Inc(c^.head_pic) else c^.head_pic := 1;             { 7000:3459  heads 1..14 }
    end
    else if key = 'B' then begin
      if c^.body_pic < 12 then Inc(c^.body_pic) else c^.body_pic := 1;             { 7000:347d  bodies 1..12 }
    end
    else if key = 'K' then begin
      head := c^.head_pic;  body := c^.body_pic;                                   { 7000:34a1 }
    end;
until key = 'K';                                                                   { 7000:34b7 }
c^.head_pic := head;  c^.body_pic := body;                                         { 7000:34c0 / 34cb }
ClearMenuLine;                                                                     { 7000:34d6 }
```
{ quirk: only 'K' leaves the menu (Esc returns #0 and loops). }

### 7000:34DF DrawIconPreview (M) *nested in IconEditor*
`procedure DrawIconPreview(col [BP+0Ah], row [BP+8]: Byte)` (static link [BP+6]; `RETF 6`). Callees: FillPictureRect, DrawIconAt, FlushViewDirtyLines.
Draws the two poses (ready, action) of the icon in CombatIcons slot 12 side by side at icon cell (col, row) and (col+3, row) of the screen picture.
```pascal
if VideoMode = 0 then                                                              { 7000:34e2  CGA }
  FillPictureRect(col*3, row*24, $0C, $18, 3, g_260A, g_4A20)                      { 7000:3518 }
else begin
  FillPictureRect(col*3, row*24, $0C, $18, 0, g_260A, g_4A20);                     { 7000:354e }
  DrawIconAt(col, row, 0, 0, $19);                                                 { 7000:3564  slot 25 behind the icon (L: backdrop) }
  DrawIconAt(col + 3, row, 0, 1, $19);                                             { 7000:357f }
end;
DrawIconAt(col, row, 0, 0, $0C);                                                   { 7000:3595  pose 0 = ready }
DrawIconAt(col + 3, row, 0, 1, $0C);                                               { 7000:35b0  pose 1 = action }
FlushViewDirtyLines;                                                               { 7000:35b5 }
```
(`g_260A` = CGA colour map passed by address, as in DrawBackdrop; `g_4A20` = off-screen screen picture.)

### 7000:35BE CopyIconSlot (M) *nested in IconEditor*
`procedure CopyIconSlot(src [BP+0Ch], dst [BP+0Ah]: Byte; recolour [BP+8]: Boolean)` (static link [BP+6]; `RETF 8`). Callees: System.Move, RecolorPicture.
Copies both poses of combat icon `src` into the already allocated pictures of slot `dst` (pixels at TPicture +17h, mask at +13h^), optionally applying SelectedChar's six icon colours.
```pascal
maskSize := CombatIcons[dst].pose0^.frameSize;                                     { 7000:35c4  TPicture +11h }
if VideoMode = 1 then maskSize := maskSize shr 2;                                  { 7000:35da  EGA: 1 mask bit per 4 plane bits }
Move(CombatIcons[src].pose0^.pixels, CombatIcons[dst].pose0^.pixels, CombatIcons[dst].pose0^.frameSize);   { 7000:3628 }
Move(CombatIcons[src].pose1^.pixels, CombatIcons[dst].pose1^.pixels, CombatIcons[dst].pose1^.frameSize);   { 7000:366a }
Move(CombatIcons[src].pose0^.mask^, CombatIcons[dst].pose0^.mask^, maskSize);      { 7000:369c }
Move(CombatIcons[src].pose1^.mask^, CombatIcons[dst].pose1^.mask^, maskSize);      { 7000:36ce }
if recolour then begin                                                             { 7000:36d3 }
  c := SelectedChar;                                                               { 7000:36dc }
  for k := 0 to 15 do begin fromCol[k] := k;  toCol[k] := k end;                   { 7000:36e6 }
  for i := 1 to 6 do begin                                                         { 7000:370f }
    toCol[IconColourSlot{g_3CF5}[i]]     := c^.icon_colours[i-1] and $0F;         { 7000:3718  TChar +C0h+i }
    toCol[IconColourSlot[i] + 8]         := (c^.icon_colours[i-1] and $F0) shr 4; { 7000:373d }
  end;
  RecolorPicture(fromCol, toCol, 0, false, CombatIcons[dst].pose0);                { 7000:3795 }
  RecolorPicture(fromCol, toCol, 0, false, CombatIcons[dst].pose1);                { 7000:37bd }
end;
```
(CombatIcons = DS:5E5A, 8 bytes per slot: pose 0 picture at +0, pose 1 at +4 = DS:5E5E.)

### 7000:382D IconEditor (H)
`procedure IconEditor` — `RETF`. Callers: FUN_7000_1551 (creation / "Icon" in part A). Callees: DrawTitledFrame, PaletteFlashOn/Off, LoadCharacterIcon, System.@CopyBytes, CopyIconSlot, DrawIconPreview, DrawText, HorizontalMenu, System.Delete/Insert/@SetIn, ClearMenuLine, FreeCombatIcon, LoadCombatIcon, AskYesNo.
Name H ("old", "ready   action", "new", "Small", "Large", "Hair", "Face", "Is this icon ok? ").
State machine `state` [BP−8]: 1 main ("Parts color-1 color-2 Size Exit"), 2 parts ("Head Weapon Exit"), 3 colour part ("Weapon Body Hair|Face Shield Arm Leg Exit"), 4 size ("Small|Large Keep Exit"), 5 browse ("Next Prev Keep Exit"). `prev` [BP−1Ah] = state that leads back from 5; `part` [BP−1Bh] = 'H'/'W'; `slot` [BP−16h] = colour slot 1..6; `hiNib` [BP−17h]; committed values `cHead` [BP−4], `cBody` [BP−5], `cSize` [BP−6], `cColours[0..5]` [BP−15h].
```pascal
DrawTitledFrame(1, 1, $26, $16, 0, 0, '');                                         { 7000:3855 }
PaletteFlashOn;                                                                    { 7000:385a }
repeat                                                                             { 7000:385f  restart point after "Is this icon ok? No" }
  LoadCharacterIcon(0);                                                                    { 7000:3862  load SelectedChar's icon into its slot }
  c := SelectedChar;  state := 1;                                                  { 7000:3867 / 3871 }
  CopyBytes(c^.icon_colours, cColours, 6);                                         { 7000:3887  +C1h }
  savedSlot := c^.party_slot;  c^.party_slot := 12;                                { 7000:388c / 3897 }
  LoadCharacterIcon(0);                                                                    { 7000:38a3  same icon also into slot 12 (preview) }
  c^.party_slot := savedSlot;                                                      { 7000:38a8 }
  cHead := c^.icon_head;  cBody := c^.icon_body;  cSize := c^.icon_size;           { 7000:38b3 / 38be / 38c9  +BDh +BEh +C0h }
  CopyIconSlot(c^.party_slot, 12, true);                                           { 7000:38e5 }
  DrawIconPreview(1, 2);                                                           { 7000:38f0  "old" row }
  DrawText(8, 6, $0F, 'old');                                                      { 7000:390b }
  DrawText(3, $0A, $0F, 'ready   action');                                         { 7000:3928 }
  DrawText(8, $0C, $0F, 'new');                                                    { 7000:3945 }
  DrawText(3, $10, $0F, 'ready   action');                                         { 7000:3962 }
  repeat
    DrawIconPreview(1, 4);                                                         { 7000:396f  "new" row }
    sizeStr := '';                                                                 { 7000:3972 }
    if state = 4 then
      if c^.icon_size = 2 then sizeStr := 'Small' else sizeStr := 'Large';         { 7000:397c / 3995 / 39aa  offer the other size }
    key := HorizontalMenu('', sizeStr + IconMenuText{g_07BF}[state], $0D, $0A, $0F, false, false, ext);   { 7000:39f9 }
    if not ext then                                                                { 7000:3a01 }
      case state of
        1: begin                                                                   { 7000:3a0a }
             prev := 1;                                                            { 7000:3a14 }
             if key = 'P' then state := 2                                          { 7000:3a1b }
             else if key = '1' then begin                                          { 7000:3a25  color-1 }
               state := 3;  hiNib := 0;                                            { 7000:3a29 }
               Delete(IconMenuText[3], 13, 4);  Insert('Hair', IconMenuText[3], 13);   { 7000:3a3e / 3a55 }
             end
             else if key = '2' then begin                                          { 7000:3a5c  color-2 }
               state := 3;  hiNib := 1;                                            { 7000:3a60 }
               Delete(IconMenuText[3], 13, 4);  Insert('Face', IconMenuText[3], 13);   { 7000:3a75 / 3a8c }
             end
             else if key = 'S' then state := 4;                                    { 7000:3a93 }
           end;
        2: begin                                                                   { 7000:3a9e }
             prev := 2;                                                            { 7000:3aa2 }
             if key in [#0, 'E'] then state := 1                                   { 7000:3aaf }
             else begin part := key;  state := 5 end;                              { 7000:3abc }
           end;
        3: begin                                                                   { 7000:3ac9 }
             prev := 3;                                                            { 7000:3acd }
             case key of
               'W': slot := 6;  'B': slot := 1;  'H', 'F': slot := 4;              { 7000:3ad4 .. 3af6 }
               'S': slot := 5;  'A': slot := 2;  'L': slot := 3;                   { 7000:3afc .. 3b14 }
             else slot := 1;                                                       { 7000:3b1a }
             end;
             if key in [#0, 'E'] then state := 1 else state := 5;                  { 7000:3b27 }
           end;
        4: begin                                                                   { 7000:3b3b  size }
             if key = 'L' then begin c^.icon_size := 2;  LoadCharacterIcon(0) end          { 7000:3b46 / 3b52 }
             else if key = 'S' then begin c^.icon_size := 1;  LoadCharacterIcon(0) end     { 7000:3b5d / 3b69 }
             else if key = 'K' then begin cSize := c^.icon_size;  state := 1;  key := ' ' end   { 7000:3b74 }
             else if key in ['E', #0] then begin c^.icon_size := cSize;  state := 1;  key := ' ' end;   { 7000:3b91 }
             LoadCharacterIcon(0);                                                         { 7000:3ba7 }
           end;
        5: if prev = 2 then begin                                                  { 7000:3bb6  browse a part }
             if part = 'H' then begin                                              { 7000:3bc0 }
               if key = 'P' then begin if c^.icon_head > 0 then Dec(c^.icon_head) else c^.icon_head := 13 end   { 7000:3bd1 }
               else if key = 'N' then begin if c^.icon_head < 13 then Inc(c^.icon_head) else c^.icon_head := 0 end   { 7000:3bf5 }
               else if key = 'K' then begin cHead := SelectedChar^.icon_head;  state := prev;  key := ' ' end   { 7000:3c19 }
               else if key in ['E', #0] then begin c^.icon_head := cHead;  state := prev;  key := ' ' end;   { 7000:3c42 }
               LoadCharacterIcon(0);                                                       { 7000:3c5a }
             end
             else if part = 'W' then begin                                         { 7000:3c62 }
               if key = 'P' then begin if c^.icon_body > 0 then Dec(c^.icon_body) else c^.icon_body := $1F end   { 7000:3c70 }
               else if key = 'N' then begin if c^.icon_body < $1F then Inc(c^.icon_body) else c^.icon_body := 0 end   { 7000:3c94 }
               else if key = 'K' then begin cBody := SelectedChar^.icon_body;  state := prev;  key := ' ' end   { 7000:3cb8 }
               else if key in ['E', #0] then begin c^.icon_body := cBody;  state := prev;  key := ' ' end;   { 7000:3ce1 }
               LoadCharacterIcon(0);                                                       { 7000:3cf9 }
             end;
           end
           else if prev = 3 then begin                                             { 7000:3d01  browse a colour }
             lo := c^.icon_colours[slot-1] and $0F;                                { 7000:3d08 }
             hi := (c^.icon_colours[slot-1] and $F0) shr 4;                        { 7000:3d1c }
             if key = 'N' then begin
               if hiNib <> 0 then hi := (hi + 1) mod 16 else lo := (lo + 1) mod 16;   { 7000:3d3e / 3d56 }
               c^.icon_colours[slot-1] := hi shl 4 + lo;                           { 7000:3d66 }
             end
             else if key = 'P' then begin
               if hiNib <> 0 then hi := (hi - 1) and $0F else lo := (lo - 1) and $0F;   { 7000:3d91 / 3da5 }
               c^.icon_colours[slot-1] := hi shl 4 + lo;                           { 7000:3db1 }
             end
             else if key = 'K' then begin CopyBytes(c^.icon_colours, cColours, 6);  state := prev;  key := ' ' end   { 7000:3ded }
             else if key in ['E', #0] then begin CopyBytes(cColours, c^.icon_colours, 6);  state := prev;  key := ' ' end;   { 7000:3e18 }
           end;
      end;
    CopyIconSlot(c^.party_slot, 12, true);                                         { 7000:3e38  refresh the preview }
  until (prev = 1) and (key in [#0, 'E']);                                         { 7000:3e3b / 3e4d }
  c^.icon_head := cHead;  c^.icon_body := cBody;  c^.icon_size := cSize;           { 7000:3e57 .. 3e6d  keep only committed values }
  CopyBytes(cColours, c^.icon_colours, 6);                                         { 7000:3e8a }
  CopyIconSlot(c^.party_slot, 12, true);                                           { 7000:3ea0 }
  CopyIconSlot(12, c^.party_slot, false);                                          { 7000:3eb4  preview becomes the party icon }
  ClearMenuLine;                                                                   { 7000:3eb7 }
  FreeCombatIcon(12);                                                              { 7000:3ebf }
  if travel_Mode > 1 then begin                                                    { 7000:3ec4  overland: slots 11/12 hold the travel icons }
    LoadCombatIcon('ICON', 0, $0B);                                                { 7000:3ee0 }
    LoadCombatIcon('ICON', 1, $0C);                                                { 7000:3efa }
  end;
until AskYesNo('Is this icon ok? ', $0D, $0A, $0F) = 'Y';                          { 7000:3f17 / 3f1f }
PaletteFlashOff;                                                                   { 7000:3f28 }
```
Colour slots (from the letter → slot table and `IconColourSlot`): 1 Body (colours 1/9), 2 Arm (2/10), 3 Leg (3/11), 4 Hair = color-1 / Face = color-2 (4/12), 5 Shield (6/14), 6 Weapon (7/15); "color-1" edits the low nibble, "color-2" the high nibble of the chosen slot (names H from the menu strings, slot mapping H from 3AD4..3B1A).
{ quirk: the state-3 menu text is edited in place in the DS string table (Delete/Insert at position 13), so it keeps the last 'Hair'/'Face' across calls. }
{ quirk: keys in state 1 other than P/1/2/S/E/Esc are ignored; in state 3 any letter not in W B H F S A L (e.g. '1') selects slot 1 (Body) and enters state 5. }

### 7000:3F31 ConHpBonus (H)
`function ConHpBonus(c [BP+6]: ^TChar): ShortInt` — `RETF 4`. Callers: FUN_7000_1551, TrainCharacter, MinHitPoints, MaxHitPoints.
Total CON hit-point adjustment summed over the character's classes (AD&D CON table; fighters get the higher values).
```pascal
sum := 0;                                                                          { 7000:3f37 }
for cls := 0 to 7 do                                                               { 7000:3f44 }
  if c^.level[cls] > 0 then begin                                                  { 7000:3f56 }
    sum := sum + ConHpAdj{g_408E}[c^.con];                                         { 7000:3f69 }
    if (c^.con > 16) and (c^.class = 2) then sum := sum + 1;                       { 7000:3f73 / 3f7d }
    if (c^.con > 17) and (c^.class = 2) then sum := sum + 1;                       { 7000:3f8a / 3f94 }
  end;
ConHpBonus := sum;                                                                 { 7000:3fa4 }
```
{ quirk: the fighter extra (+3 at CON 17, +4 at CON 18) applies only to class 2 = pure Fighter, not to paladins, rangers or multi-class fighters. }

### 7000:3FB3 MinHitPoints (M)
`function MinHitPoints(c [BP+6]: ^TChar): Byte` — `RETF 4`. Callers: ModifyCharacter.
Smallest allowed max HP: one point per level (rangers and monks one more), plus the CON adjustment, averaged over the classes.
```pascal
n := 0;  sum := 0;                                                                 { 7000:3fc2 / 3fc6 }
for cls := 0 to 7 do                                                               { 7000:3fca }
  if c^.level[cls] > 0 then begin                                                  { 7000:3fdc }
    sum := sum + c^.level[cls];  n := n + 1;                                       { 7000:3fed / 3ff5 }
    if (cls = 4) or (cls = 7) then sum := sum + 1;                                 { 7000:3ffb / 4004  ranger, monk: 2 HD at level 1 }
  end;
adj := ConHpBonus(c);                                                              { 7000:4018 }
if adj < 0 then begin
  if sum > n + Abs(adj) then sum := (sum + adj) div n else sum := 1;               { 7000:4024 / 4041 / 405d }
end
else sum := (sum + adj) div n;                                                     { 7000:4063 }
MinHitPoints := sum;                                                               { 7000:407d }
```
(Byte arithmetic for `sum`; `n = 0` would be a division by zero — every character has ≥ 1 class.)

### 7000:408C MaxHitPoints (M)
`function MaxHitPoints(c [BP+6]: ^TChar): Byte` — `RETF 4`. Callers: ModifyCharacter.
Largest allowed max HP: maximum hit-die roll per level, plus the CON adjustment, averaged over the classes.
```pascal
n := 0;  sum := 0;                                                                 { 7000:409b / 409f }
for cls := 0 to 7 do                                                               { 7000:40a3 }
  if c^.level[cls] > 0 then begin                                                  { 7000:40b5 }
    n := n + 1;                                                                    { 7000:40c0 }
    case cls of
      0, 1: sum := sum + c^.level[cls] * 8;                                        { 7000:40ca / 40e7  cleric, druid d8 }
      2, 3: sum := sum + c^.level[cls] * 10;                                       { 7000:4104 / 4122  fighter, paladin d10 }
      4:    sum := sum + (c^.level[cls] + 1) * 8;                                  { 7000:413f  ranger 2d8 at level 1 }
      5:    sum := sum + c^.level[cls] * 4;                                        { 7000:415c  magic-user d4 }
      6:    sum := sum + c^.level[cls] * 6;                                        { 7000:4178  thief d6 }
      7:    sum := sum + (c^.level[cls] + 1) * 4;                                  { 7000:4198  monk 2d4 at level 1 }
    end;
  end;
adj := ConHpBonus(SelectedChar);                                                   { 7000:41c1 }
if adj < 0 then begin
  if sum > n + Abs(adj) then sum := (sum + adj) div n else sum := 1;               { 7000:41cd / 41ea / 4206 }
end
else sum := (sum + adj) div n;                                                     { 7000:420c }
MaxHitPoints := sum;                                                               { 7000:4226 }
```
{ quirk: the CON adjustment is taken from `SelectedChar`, not from the parameter `c` (all callers pass SelectedChar). `sum` is a byte (wraps above 255). }

### 7000:4235 RollHitDice (H)
`function RollHitDice(c [BP+8]: ^TChar; classBits [BP+6]: Byte): Byte` — `RETF 6`. Callers: FUN_7000_1551 (creation), TrainCharacter. Callees: Roll (ov24).
```pascal
sum := 0;                                                                          { 7000:423b }
for cls := 0 to 7 do                                                               { 7000:423f }
  if (c^.level[cls] > 0) and ((ClassTrainBits[cls] and classBits) <> 0) then begin { 7000:4251 / 425f }
    r := Roll(HitDiceCount{g_08B6}[cls], HitDieSides{g_08BE}[cls]);                { 7000:4280 }
    if (c^.level[cls] = 1) and (r < HitDieSides[cls] * 2 div 3) then               { 7000:4291 / 42a5 }
      r := HitDieSides[cls] * 2 div 3;                                             { 7000:42b8  level-1 minimum 2/3 of one die }
    sum := sum + r;                                                                { 7000:42cf }
  end;
RollHitDice := sum;                                                                { 7000:42de }
```
{ quirk: the level-1 floor uses the sides of one die (ranger/monk 2 dice are floored at 5 / 2). Classes sharing a bit (cleric/druid 2; paladin/ranger 0Ah overlap fighter 8) are all rolled when any of their bits is in `classBits`. }

### 7000:42ED PayGold (H)
`procedure PayGold(gold [BP+0Ah]: LongInt; c [BP+6]: ^TChar)` — `RETF 8`. Callers: TrainCharacter (1000 gp). Callees: @LongMul, @LongDivMod, @LongAbs.
Pays `gold` gold pieces from the character's coins, spending the smallest coins first, and returns change in the largest coins.
```pascal
due := gold * 200;                                                                 { 7000:42fe  in copper (CoinValue[3] = 200) }
i := 0;  p := c;                                                                   { 7000:4309 / 430d }
while due > 0 do begin                                                             { 7000:4316 }
  n := due div CoinValue[i] + 1;                                                   { 7000:4342 }
  if p^.money[i] < n then n := p^.money[i];                                        { 7000:435b / 4370 }
  due := due - n * CoinValue[i];                                                   { 7000:438f }
  p^.money[i] := p^.money[i] - n;                                                  { 7000:43a8 }
  i := i + 1;                                                                      { 7000:43ad }
end;
if due < 0 then begin                                                              { 7000:43b8  overpaid: give change }
  due := Abs(due);                                                                 { 7000:43d2 }
  i := 4;                                                                          { 7000:43dd  platinum first }
  while due > 0 do begin                                                           { 7000:43e1 }
    n := due div CoinValue[i];                                                     { 7000:4407 }
    due := due - n * CoinValue[i];                                                 { 7000:4426 }
    p^.money[i] := p^.money[i] + n;                                                { 7000:443f }
    i := i - 1;                                                                    { 7000:4444 }
  end;
end;
```
{ quirk: no bound on `i` — with too little money the first loop runs past platinum into gems/jewelry and beyond (CoinValue[5..] is unrelated data); callers check MoneyInGold first. }

### 7000:4454 ov16_init (H)
Empty unit initialiser (`push bp; mov bp,sp; pop bp; retf`), called from the main program's init chain.  { 7000:4454 }
