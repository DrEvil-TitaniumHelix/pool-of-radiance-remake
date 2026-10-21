<!-- ov12 part B (5C00:1A19 .. 5C00:38A9), lane por-mod-party (fork B). Unit header / conventions: part A (ov12a.pas.md). -->
<!-- Effect handler ABI (ov24 CallEffectHandler 9800:0000, H): procedure(c [BP+0Ch]: PChar; e [BP+8]: PEffect; mode [BP+6]: Byte), RETF 0Ah.
     mode 0 = hook event / apply, mode 1 = effect being removed (RemoveEffect with e^.callOnRemove <> 0). For the item-power types 80h..8Bh
     the second parameter is a ^TItem (the readied item; fields +34h readied, +3Dh power[2]) — see 5C00:2EDA. -->
<!-- Part-A helpers used here (names from ov12a_names.json):
     CancelDamageAndEffect(t)                   if (t = 0) or (EffectToApply = t) then begin DamageAmount := 0; EffectToApply := 0 end   (asm 5c00:0003..0016, H)
     AddEffectUnlessCuring(c, type, p3, dur)    if cure_InProgress = 0 then AddEffect(c, type, dur, p3, 1); result := cure_InProgress = 0   (asm 5c00:0025..004f, H)
     ApplyFatalStatus(c, status, msg)      ShowCharacterMessage(c, msg, 10, false); unless status already 6/7/8: status, active := 0, hp := 0,
                                        RemoveCombatEffects, CallEffectHooks($0D), RemoveCombatant if inactive; MessageDelay; ... (asm 5c00:0058..0107, H)
     AvoidRangedAttack(target, pct)         if SelectedChar has a weapon and TargetDistance(SelectedChar, target) > 1 and Roll(1,100) <= pct then
                                        "Avoids it": DamageAmount := 0; AttackRollValue := -1; dec(SlotHits[1])   (asm 5c00:0fb2..1013, H)
     CurrentAttackItem(c): ^TItem           the item the attacker strikes with: ammo from GetMissileAmmo if it returns true and non-nil, else c^.readied[0] (weapon); nil without weapon (asm 5c00:1023..107d, H) -->

### 5C00:1A19 EffFireDamage (M)
`procedure EffFireDamage(c [BP+0Ch]: PChar; e [BP+8]: PEffect; mode [BP+6]: Byte)` — effect handler type **4Fh** (events 02h, 03h). Callers: CallEffectHandler (table slot 4Fh, installed by InstallEffectHandlers). Callees: RollDice, DamageCharacter.
The creature's hit also burns its target for 2d10 (damage kind 9 = Fire+Magic). Name M (DamageType 9 → "from Fire" in DamageCharacter, whose `case DamageType and F7h` selects 1).
```pascal
DamageType := 9;                                                          { 5c00:1a1c }
DamageCharacter(c^.combatant^.target, RollDice(2, 10), 0, false);         { 5c00:1a21 .. 1a43 }
```

### 5C00:1A4C EffAcidDamage (M)
`procedure EffAcidDamage(c [BP+0Ch]: PChar; e [BP+8]: PEffect; mode [BP+6]: Byte)` — effect handler type **50h** (events 02h, 03h). Callees: RollDice, DamageCharacter.
```pascal
DamageType := $10;                                                        { 5c00:1a4f  Acid }
DamageCharacter(c^.combatant^.target, RollDice(1, 4), 0, false);          { 5c00:1a54 .. 1a76 }
```
(Removed again by EffSpitAcid 5C00:2C1C: `RemoveEffect(c, $50, nil)`.)

### 5C00:1AAA EffFearAura (M)
`procedure EffFearAura(c [BP+0Ch]: PChar; e [BP+8]: PEffect; mode [BP+6]: Byte)` — effect handler type **51h** (event 08h). Callees: IsSideZero, SavingThrow, ApplyEffect.
Every active character of the other side (list `PartyHead`, link `+104h`) saves vs spell; low-level ones (level_main 0..3) are paralysed with fear, level 4..5 weakened by fear (dragon-fear aura, M).
```pascal
m := PartyHead;                                                           { 5c00:1ab0 }
while m <> nil do begin                                                   { 5c00:1abd }
  if (m^.active <> 0) and (Ord(IsSideZero(c)) = m^.side) then begin       { 5c00:1ac8 / 1ad6  side opposite to c }
    saved := SavingThrow(m, 4, 0);                                        { 5c00:1aee }
    case ShortInt(m^.level_main) of                                       { 5c00:1b02  signed compares }
      0..3: ApplyEffect(m, $34, 0, $0C, 0, 1, saved, 'is paralyzed with fear');   { 5c00:1b11  duration 0 = permanent }
      4, 5: ApplyEffect(m, $02, 0, $0C, 0, 1, saved, 'is weakened by fear');      { 5c00:1b48 }
    end;
  end;
  m := m^.next;                                                           { 5c00:1b75 }
end;
```
Quirk: the paralysis has duration 0 (permanent until cured/removed) — H from the pushed word `XOR AX,AX` at 5c00:1b1a.

### 5C00:1BA8 EffFearOnce (M)
`procedure EffFearOnce(c [BP+0Ch]: PChar; e [BP+8]: PEffect; mode [BP+6]: Byte)` — effect handler type **52h** (event 08h). Callees: RemoveEffect, IsSideZero, SavingThrow, Roll, ApplyEffect.
```pascal
m := PartyHead;                                                           { 5c00:1bae }
while m <> nil do begin                                                   { 5c00:1bbb }
  RemoveEffect(m, $52, nil);                                              { 5c00:1bc6  every listed character loses effect 52h (so it fires once) }
  if (m^.active <> 0) and (Ord(IsSideZero(c)) = m^.side) then begin       { 5c00:1bda / 1be8 }
    bonus := 0;                                                           { 5c00:1bfd }
    if side_ActiveCount[m^.side] >= 6 then Inc(bonus);                    { 5c00:1c01 }
    if m^.race = 7 then bonus := bonus + 2;                               { 5c00:1c16  Human }
    saved := SavingThrow(m, 0, bonus);                                    { 5c00:1c24 }
    ApplyEffect(m, $34, Roll(1, 4), $0C, 0, 1, saved, 'is paralyzed with fear');   { 5c00:1c39 .. 1c6c }
  end;
  m := m^.next;                                                           { 5c00:1c71 }
end;
```

### 5C00:1CAD EffStoneGaze (H)
`procedure EffStoneGaze(c [BP+0Ch]: PChar; e [BP+8]: PEffect; mode [BP+6]: Byte)` — effect handler type **53h** (event 0Eh). Callees: ShowCharacterMessage, BuildFourAnimationFrames, CombatantCol/Row, AnimateAlongPath, HasEffect, SavingThrow, ApplyFatalStatus.
Petrifying gaze at the current target; a readied item with a "Mirror" name word (76h) reflects it back onto the gazer (only checked when the gazer has effect 7Fh). Name H (strings "gazes...", "reflects it!", "is Stoned", status 7 = Stoned).
```pascal
HookOpponent := c^.combatant^.target;                                    { 5c00:1cb3 }
ShowCharacterMessage(c, 'gazes...', 10, false);                           { 5c00:1cca }
BuildFourAnimationFrames($12);                                            { 5c00:1cea }
AnimateAlongPath(CombatantCol(c), CombatantRow(c),
                 CombatantCol(HookOpponent), CombatantRow(HookOpponent), 4, $2D);   { 5c00:1cf2 .. 1d2c }
if HasEffect(c, $7F, p) then begin                                        { 5c00:1d31 }
  reflected := false;                                                     { 5c00:1d4b }
  it := HookOpponent^.items;                                             { 5c00:1d4f }
  while (it <> nil) and not reflected do begin                            { 5c00:1d63 / 1d6e }
    if (it^.readied <> 0) and
       ((it^.word[1] = $76) or (it^.word[2] = $76) or (it^.word[3] = $76)) then begin   { 5c00:1d77 .. 1da0  'Mirror' }
      ShowCharacterMessage(HookOpponent, 'reflects it!', 12, false);     { 5c00:1da2 }
      AnimateAlongPath(CombatantCol(HookOpponent), CombatantRow(HookOpponent),
                       CombatantCol(c), CombatantRow(c), 4, $2D);         { 5c00:1dc4 .. 1dfe }
      reflected := true;                                                  { 5c00:1e03 }
      HookOpponent := c;                                                 { 5c00:1e07 }
    end;
    it := it^.next;                                                       { 5c00:1e14 }
  end;
end;
if not SavingThrow(HookOpponent, 1, 0) then                              { 5c00:1e28  petrification }
  ApplyFatalStatus(HookOpponent, 7, 'is Stoned');                           { 5c00:1e3f }
```

### 5C00:1E77 EffCharmGaze (H)
`procedure EffCharmGaze(c [BP+0Ch]: PChar; e [BP+8]: PEffect; mode [BP+6]: Byte)` — effect handler type **54h** (event 0Eh). Callees: CombatantCol/Row, CanAttack (ov13 e8), TraceLine (ov30 e5), ShowCharacterMessage, BuildFourAnimationFrames, AnimateAlongPath, SavingThrow, ApplyEffect, HasEffect, CallEffectHandler.
Charming gaze ("Gazes...", "is charmed"; effect 0Bh = charm, spell 0Ah = Charm Person, image name table DS:28E9 + 0Ah·29h, H).
```pascal
HookOpponent := c^.combatant^.target;                                    { 5c00:1e7d }
tx := CombatantCol(HookOpponent);                                        { 5c00:1e94 }
ty := CombatantRow(HookOpponent);                                        { 5c00:1ea4 }
if not CanAttack(c, HookOpponent) then exit;                             { 5c00:1eb4 }
if not TraceLine(CombatantCol(c), CombatantRow(c), tx, ty, range, cm_Map) then exit;   { 5c00:1ece .. 1efd }
ShowCharacterMessage(c, 'Gazes...', 10, false);                           { 5c00:1f09 }
BuildFourAnimationFrames($12);                                            { 5c00:1f29 }
AnimateAlongPath(CombatantCol(c), CombatantRow(c),
                 CombatantCol(HookOpponent), CombatantRow(HookOpponent), 4, $2D);   { 5c00:1f31 .. 1f6b }
sp_Current := $0A;                                                       { 5c00:1f70  Charm Person (for the magic-resistance hooks) }
ApplyEffect(HookOpponent, $0B, 0, c^.side * $80 + $0C, 1, 1,
            SavingThrow(c^.combatant^.target, 4, -2), 'is charmed');       { 5c00:1f75 .. 1fc5 }
if HasEffect(HookOpponent, $0B, p) then                                  { 5c00:1fca }
  CallEffectHandler($0B, HookOpponent, p, 0);                            { 5c00:1fe3 }
```
Quirk: `range` ([BP-2]) is never initialised before it is passed (by reference) as TraceLine's step limit — the line test uses whatever word is on the stack (H: no write to [BP-2] in 1E77).

### 5C00:2002 DrainClass (M)
`function DrainClass: Byte` — **nested** procedure of DrainLevels (parent frame pointer pushed at [BP+6], RETF 2; reads the parent's `c` = parent [BP+8] and writes the parent's locals `xpBest` = parent [BP-31h] (LongInt) and `xpTmp` = parent [BP-2Dh] (LongInt)). Callers: DrainLevels only.
Chooses the class whose level is drained: the class with the highest level; on equal levels the later class wins when its XP threshold is ≥ the best one so far. Also leaves the XP threshold of that class/level in `xpBest`.
```pascal
xpBest := 0;                                                              { 5c00:2008 }
bestLvl := 0;                                                             { 5c00:2015 }
for i := 0 to 7 do begin                                                  { 5c00:2019 }
  lvl := ShortInt(c^.level[i]);                                           { 5c00:2022 }
  if lvl > 1 then xpTmp := XpForLevel[i, lvl]                             { 5c00:2037  DS:409B + i*38h + lvl*4 }
  else xpTmp := 0;                                                        { 5c00:2069 }
  if lvl >= bestLvl then                                                  { 5c00:2076  signed }
    if (xpTmp >= xpBest) or (xpTmp = -1) then begin                       { 5c00:207e .. 20a9  signed LongInt compare }
      xpBest := xpTmp;                                                    { 5c00:20ab }
      result := i;                                                        { 5c00:20c1 }
      bestLvl := lvl;                                                     { 5c00:20c7 }
    end;
end;
DrainClass := result;                                                     { 5c00:20d6 }
```
`XpForLevel` (DS:409B, 8 classes × 14 LongInts, image bytes, H): fighter 2001, 4001, 8001, 18001, 35001, 70001, 125001 at levels 2..8; cleric 1501..27501 (levels 2..6), magic-user 2501..40001 (2..6), thief 1251..110001 (2..9); −1 = level not reachable; classes 1, 3, 4, 7 all −1 (not playable).

### 5C00:2122 DrainLevels (H)
`procedure DrainLevels(c [BP+8]: PChar; n [BP+6]: Byte)` — RETF 6. Callers: EffDrainOne (5C00:23A4), EffDrainTwo (5C00:23C2). Callees: ByteToStr, ShowCharacterMessage, ApplyFatalStatus, DebugPrint (ov33 e1), DrainClass, UpdateLevelStats (ov23 e1), RecalcCharacter.
Energy drain (strings " levels", "a level", "is drained ", "is dead forever", "max,cur,lost", "is killed"; fields +73h/+74h/+75h, SAVES.md §3).
```pascal
if n > 1 then s := ByteToStr(n) + ' levels'                               { 5c00:2129 }
else s := 'a level';                                                      { 5c00:2158 }
ShowCharacterMessage(c, 'is drained ' + s, 10, true);                     { 5c00:216b }
if c^.status = 1 then begin                                               { 5c00:2196  Animated (undead) }
  ApplyFatalStatus(c, 8, 'is dead forever');                                 { 5c00:21a1  status Gone }
  c^.hp_max := 0;                                                         { 5c00:21bd }
  exit;
end;
for k := 1 to n do begin                                                  { 5c00:21c8 }
  if c^.status <> 8 then begin                                            { 5c00:21e0  Gone: skip }
    Inc(c^.levels_drained);                                               { 5c00:21ee }
    sum := 0;
    for i := 0 to 7 do sum := sum + c^.level[i];                          { 5c00:21f5  byte sum }
    hpLoss := c^.hp_max div sum;                                          { 5c00:2219  signed IDIV; sum = 0 → runtime error 200 }
    DebugPrint('max,cur,lost', c^.hp_max, c^.hp, c^.hp_drained);          { 5c00:222f }
    for j := 1 to hpLoss do begin                                         { 5c00:225c }
      if c^.hp_max > 0 then Dec(c^.hp_max);                               { 5c00:2271 }
      if c^.hp_rolled > 0 then Dec(c^.hp_rolled);                         { 5c00:2282 }
      if c^.hp > 0 then Dec(c^.hp);                                       { 5c00:2295 }
      Inc(c^.hp_drained);                                                 { 5c00:22a8 }
    end;
    if ShortInt(c^.level_main) < 2 then begin                             { 5c00:22b7 }
      ApplyFatalStatus(c, 8, 'is dead forever');                             { 5c00:22c1 }
      c^.hp_max := 0;                                                     { 5c00:22dd }
      if (ShortInt(c^.level[DrainClass]) > 0) and (n = 2) then            { 5c00:22e5 / 22f8 }
        c^.level[DrainClass] := 0;                                        { 5c00:22fe }
    end else begin
      Dec(c^.level[DrainClass]);                                          { 5c00:2311 }
      if (c^.hp = 0) and (c^.status <> 6) then                            { 5c00:2321 }
        ApplyFatalStatus(c, 6, 'is killed');                                 { 5c00:2337  Dead }
      UpdateLevelStats(c);                                                { 5c00:2353 }
    end;
    c^.level_main := c^.level[DrainClass];                                { 5c00:235e }
    c^.xp := xpBest;                                                      { 5c00:2375  XP threshold left by the last DrainClass call }
    RecalcCharacter(c);                                                   { 5c00:2388 }
  end;
end;                                                                      { 5c00:2393 }
```
Notes (H): DrainClass is re-evaluated at every use (after the `Dec` the next call may pick another class); `c^.xp` is set to the XP threshold of the drained class's new level (0 when that level ≤ 1).

### 5C00:23A4 EffDrainOne (H)
`procedure EffDrainOne(c [BP+0Ch]: PChar; e [BP+8]: PEffect; mode [BP+6]: Byte)` — effect handler type **55h** (events 02h, 03h).
```pascal
DrainLevels(c^.combatant^.target, 1);                                     { 5c00:23a7 }
```

### 5C00:23C2 EffDrainTwo (H)
`procedure EffDrainTwo(c [BP+0Ch]: PChar; e [BP+8]: PEffect; mode [BP+6]: Byte)` — effect handler type **56h** (events 02h, 03h).
```pascal
DrainLevels(c^.combatant^.target, 2);                                     { 5c00:23c5 }
```

### 5C00:23EC EffMummyTouch (M)
`procedure EffMummyTouch(c [BP+0Ch]: PChar; e [BP+8]: PEffect; mode [BP+6]: Byte)` — effect handler type **57h** (events 02h, 03h). Callees: HasEffect, AddEffect, Roll, ShowCharacterMessage.
Infects the target with effect 32h ("Dreaded Mummy Disease" in DisplayEffects, MAGIC.pas.md) and 39h (rot, handler 5C00:1399 "Rots...").
```pascal
HookOpponent := c^.combatant^.target;                                    { 5c00:23f2 }
if not HasEffect(HookOpponent, $32, p) then begin                        { 5c00:2409 }
  AddEffect(HookOpponent, $32, $3840, $FF, 1);                           { 5c00:2422  duration 14400 }
  AddEffect(HookOpponent, $39, $A8C0, Roll(1, 6) * 16 + $0F, 1);         { 5c00:243c  duration 43200 }
  ShowCharacterMessage(HookOpponent, 'is Diseased', 10, true);           { 5c00:2468 }
end;
```

### 5C00:2490 EffDisplacement (M)
`procedure EffDisplacement(c [BP+0Ch]: PChar; e [BP+8]: PEffect; mode [BP+6]: Byte)` — effect handler type **59h** ("Displaced" in DisplayEffects) — events 08h and 10h (target of a to-hit roll).
The first attack against the character in each round misses; `e^.p3` bit 4 = "already used this round".
```pascal
if (CombatRound = 0) and (AttackRollValue = 0) then                      { 5c00:2493 }
  e^.p3 := e^.p3 and $0F                                                  { 5c00:24a1  reset }
else if (e^.p3 and $10) = 0 then begin                                    { 5c00:24b3 }
  AttackRollValue := -1;                                                  { 5c00:24c0  miss }
  e^.p3 := e^.p3 or $10;                                                  { 5c00:24c5 }
end;
```
Name M (behaviour + the DisplayEffects text of type 59h); the meaning of the reset condition (round 0 and roll 0) is L.

### 5C00:24D9 EffConSaveBonusPoison (H)
`procedure EffConSaveBonusPoison(c [BP+0Ch]: PChar; e [BP+8]: PEffect; mode [BP+6]: Byte)` — effect handler type **5Ah** (event 0Ch saving throw).
AD&D dwarf/halfling CON bonus to saves vs poison (save type 0).
```pascal
if SaveType = 0 then begin                                                { 5c00:24df }
  case c^.con of                                                          { 5c00:24e6 }
    4..6:   bonus := 1;
    7..10:  bonus := 2;
    11..13: bonus := 3;
    14..17: bonus := 4;
    18..20: bonus := 5;
  end;                                                                    { quirk: CON < 4 or > 20 → bonus uninitialised ([BP-1]) }
  SaveRoll := SaveRoll + bonus;                                           { 5c00:2531 }
end;
```

### 5C00:2556 EffShield (M)
`procedure EffShield(c [BP+0Ch]: PChar; e [BP+8]: PEffect; mode [BP+6]: Byte)` — effect handler type **5Bh** (event 06h damage taken).
Immune to Magic Missile (spell 0Fh, name table DS:28E9) and to electricity damage. Name M (AD&D Shield spell behaviour vs magic missile; the electricity part is from the asm).
```pascal
if sp_Current = $0F then begin                                           { 5c00:255c  Magic Missile }
  CancelDamageAndEffect(0);                                                       { 5c00:2563  no damage, no effect }
  ShowCharacterMessage(c, 'is unaffected', 10, true);                     { 5c00:256a }
end else if (DamageType and 4) <> 0 then                                  { 5c00:258c  Electricity }
  CancelDamageAndEffect(0);                                                       { 5c00:2595 }
```

### 5C00:25A2 EffHalveFire (H)
`procedure EffHalveFire(c [BP+0Ch]: PChar; e [BP+8]: PEffect; mode [BP+6]: Byte)` — effect handler type **5Dh** (event 06h).
```pascal
if (DamageType and 1) <> 0 then DamageAmount := DamageAmount shr 1;      { 5c00:25a5 }
```

### 5C00:25BC EffHalveWeapon (M)
`procedure EffHalveWeapon(c [BP+0Ch]: PChar; e [BP+8]: PEffect; mode [BP+6]: Byte)` — effect handler type **5Eh** (event 05h, weapon damage; the attacker is SelectedChar).
```pascal
it := CurrentAttackItem(SelectedChar);                                        { 5c00:25c2  attacker's weapon/ammo }
if (it <> nil) and ((ITEMS[it^.type].wflags and $81) <> 0) then          { 5c00:25d4  DS:5589 + type*16 }
  DamageAmount := DamageAmount shr 1;                                     { 5c00:25f5 }
```

### 5C00:2610 EffFallsDead (H)
`procedure EffFallsDead(c [BP+0Ch]: PChar; e [BP+8]: PEffect; mode [BP+6]: Byte)` — effect handler type **5Fh** (no hook event: runs when the effect expires, AddEffect callOnRemove = 1 by EffReviveOnce 5C00:2730).
```pascal
e^.callOnRemove := 0;                                                     { 5c00:2616 }
if c^.active <> 0 then                                                    { 5c00:261e }
  ApplyFatalStatus(c, 6, 'Falls dead');                                      { 5c00:2629 }
```

### 5C00:264B EffNeedSilverOrMagic (M)
`procedure EffNeedSilverOrMagic(c [BP+0Ch]: PChar; e [BP+8]: PEffect; mode [BP+6]: Byte)` — effect handler type **60h** (event 05h).
Only magic (+1 or better) or Silver (name word B1h) weapons hurt.
```pascal
it := CurrentAttackItem(SelectedChar);                                        { 5c00:2651 }
if (it = nil) or ((it^.plus = 0) and (it^.word[3] <> $B1)) then           { 5c00:2663 .. 267d  'Silver' }
  DamageAmount := 0;                                                      { 5c00:267f }
```

### 5C00:268A EffConSaveBonusMagic (H)
`procedure EffConSaveBonusMagic(c [BP+0Ch]: PChar; e [BP+8]: PEffect; mode [BP+6]: Byte)` — effect handler type **61h** (event 0Ch).
Same CON table as 5C00:24D9, for save types 4 (spell) and 2 (rod/staff/wand).
```pascal
if (SaveType = 4) or (SaveType = 2) then begin                            { 5c00:2690 }
  case c^.con of 4..6: bonus := 1; 7..10: bonus := 2; 11..13: bonus := 3;
                 14..17: bonus := 4; 18..20: bonus := 5 end;              { 5c00:269e  same quirk: other CON → uninitialised }
  SaveRoll := SaveRoll + bonus;                                           { 5c00:26e9 }
end;
```

### 5C00:2700 EffRegenerate3 (H)
`procedure EffRegenerate3(c [BP+0Ch]: PChar; e [BP+8]: PEffect; mode [BP+6]: Byte)` — effect handler type **62h** (event 13h).
```pascal
c^.hp := c^.hp + 3;                                                       { 5c00:2703 }
if c^.hp > c^.hp_max then c^.hp := c^.hp_max;                             { 5c00:270c }
```

### 5C00:2730 EffReviveOnce (M)
`procedure EffReviveOnce(c [BP+0Ch]: PChar; e [BP+8]: PEffect; mode [BP+6]: Byte)` — effect handler type **63h** (events 08h, 0Dh character went down). Callees: ReviveCombatant, Roll, AddEffect, RemoveEffect.
A downed creature gets up again once, with up to 6 hp, and falls dead 2..5 rounds later (effect 5Fh).
```pascal
hp := 0;                                                                  { 5c00:2736 }
if (c^.status = 5) and (c^.combatant^[$0E] < 6) then                      { 5c00:273a  Dying }
  hp := 6 - c^.combatant^[$0E];                                           { 5c00:2754 }
if c^.status = 4 then hp := 6;                                            { 5c00:276c  Unconscious }
if hp > 0 then                                                            { 5c00:277b }
  if ReviveCombatant(c, hp) then begin                                    { 5c00:2781 }
    AddEffect(c, $5F, Roll(1, 4) + 1, $FF, 1);                            { 5c00:2794 }
    e^.callOnRemove := 0;                                                 { 5c00:27b7 }
    RemoveEffect(c, $63, e);                                              { 5c00:27bf }
  end;
```
`combatant^[$0E]` = combat-record byte +0Eh (meaning L; not among the fields named by ov13).

### 5C00:27D9 EffTrollDown (M)
`procedure EffTrollDown(c [BP+0Ch]: PChar; e [BP+8]: PEffect; mode [BP+6]: Byte)` — effect handler type **64h** (event 0Dh character went down).
Unless the blow was fire or acid, the creature will regenerate (effect 66h for 3d6 rounds).
```pascal
if ((DamageType and 1) = 0) and ((DamageType and $10) = 0) then          { 5c00:27dc }
  AddEffect(c, $66, Roll(3, 6), $FF, 1);                                  { 5c00:27ee }
```

### 5C00:2814 EffStartRegenerating (M)
`procedure EffStartRegenerating(c [BP+0Ch]: PChar; e [BP+8]: PEffect; mode [BP+6]: Byte)` — effect handler type **65h** (events 05h, 06h).
```pascal
if not HasEffect(c, $62, p)                                               { 5c00:281a }
   and not HasEffect(c, $3B, p) then                                      { 5c00:2831 }
  AddEffect(c, $3B, 3, $FF, 1);                                           { 5c00:2848  3Bh = 'Regenerating' (DisplayEffects) }
```

### 5C00:2866 EffTrollRise (M)
`procedure EffTrollRise(c [BP+0Ch]: PChar; e [BP+8]: PEffect; mode [BP+6]: Byte)` — effect handler type **66h** (not in a hook list: runs when the effect expires, callOnRemove = 1).
```pascal
if not ReviveCombatant(c, c^.hp_max) then                                 { 5c00:286c }
  ok := AddEffectUnlessCuring(c, $66, e^.p3, 1);                                  { 5c00:2883  try again next round (duration 1) }
```

### 5C00:28BF EffGaseousEscape (H)
`procedure EffGaseousEscape(c [BP+0Ch]: PChar; e [BP+8]: PEffect; mode [BP+6]: Byte)` — effect handler type **67h** (event 0Dh). Callees: FocusCombatant (ov31 e19), RemoveFromCombat.
```pascal
e^.callOnRemove := 0;                                                     { 5c00:28c5 }
FocusCombatant(c, 3, false);                                              { 5c00:28cd }
RemoveFromCombat(c, 3, 'Turns gaseous and escapes');                      { 5c00:28de  status 3 = Running }
```

### 5C00:2901 EffAvoidMissiles60 (M)
`procedure EffAvoidMissiles60(c [BP+0Ch]: PChar; e [BP+8]: PEffect; mode [BP+6]: Byte)` — effect handler type **68h** (event 05h).
```pascal
AvoidRangedAttack(c, 60);                                                     { 5c00:2904  60 % "Avoids it" vs ranged attacks }
```

### 5C00:2915 MagicResistance (M)
`procedure MagicResistance(pct [BP+6]: Byte)` — near-called with far frame (PUSH CS; CALL), RETF 2. Callers: EffMagicRes50 (2976), EffMagicRes15 (2984). Callees: SpellCasterLevel, Roll, CancelDamageAndEffect.
Magic resistance `pct` %, adjusted by 5 % per caster level difference from 11.
```pascal
lvl := SpellCasterLevel(sp_Current);                                     { 5c00:291b }
chance := pct - (11 - lvl) * 5;                                           { 5c00:2927  byte arithmetic }
if (EffectToApply <> 0) or ((DamageType and 8) <> 0) then                 { 5c00:2947  a spell effect or magic damage }
  if Roll(1, 100) <= chance then CancelDamageAndEffect(0);                        { 5c00:2959  unsigned compare }
```
Quirk (H): `chance` is a byte and compared unsigned — when `(11 - lvl)*5 > pct` it wraps to ≥ 0x80 and the resistance then **always** succeeds (e.g. pct 15 vs a caster level ≤ 7).

### 5C00:2976 EffMagicRes50 (M)
`procedure EffMagicRes50(c [BP+0Ch]: PChar; e [BP+8]: PEffect; mode [BP+6]: Byte)` — effect handler type **69h** (events 06h, 09h).
```pascal
MagicResistance(50);                                                      { 5c00:2979 }
```

### 5C00:2984 EffMagicRes15 (M)
`procedure EffMagicRes15(c [BP+0Ch]: PChar; e [BP+8]: PEffect; mode [BP+6]: Byte)` — effect handler type **6Ah** (events 06h, 09h).
```pascal
MagicResistance(15);                                                      { 5c00:2987 }
```

### 5C00:2992 EffResistSleepCharm90 (M)
`procedure EffResistSleepCharm90(c [BP+0Ch]: PChar; e [BP+8]: PEffect; mode [BP+6]: Byte)` — effect handler type **6Bh** (event 09h new effect). AD&D elf 90 % resistance (M).
```pascal
if Roll(1, 100) <= 90 then begin                                          { 5c00:2995 }
  CancelDamageAndEffect($35);                                                     { 5c00:29a4  sleep/helpless effect 35h }
  CancelDamageAndEffect($0B);                                                     { 5c00:29ab  charm }
end;
```

### 5C00:29B6 EffImmuneSleepCharm (M)
`procedure EffImmuneSleepCharm(c [BP+0Ch]: PChar; e [BP+8]: PEffect; mode [BP+6]: Byte)` — effect handler type **6Ch** (event 09h).
```pascal
CancelDamageAndEffect($0B);                                                       { 5c00:29b9 }
CancelDamageAndEffect($35);                                                       { 5c00:29c0 }
```

### 5C00:29CB EffImmuneHold (M)
`procedure EffImmuneHold(c [BP+0Ch]: PChar; e [BP+8]: PEffect; mode [BP+6]: Byte)` — effect handler type **6Dh** (event 09h).
```pascal
CancelDamageAndEffect($34);                                                       { 5c00:29ce  paralysis/hold effect 34h }
```

### 5C00:29D9 EffImmuneCold (H)
`procedure EffImmuneCold(c [BP+0Ch]: PChar; e [BP+8]: PEffect; mode [BP+6]: Byte)` — effect handler type **6Eh** (event 09h).
```pascal
if (DamageType and 2) <> 0 then CancelDamageAndEffect(0);                        { 5c00:29dc }
```

### 5C00:29F0 EffImmunePoisonParalysis (M)
`procedure EffImmunePoisonParalysis(c [BP+0Ch]: PChar; e [BP+8]: PEffect; mode [BP+6]: Byte)` — effect handler type **6Fh** (events 09h, 0Ch).
```pascal
CancelDamageAndEffect($37);                                                       { 5c00:29f3  'Poisoned' }
CancelDamageAndEffect($34);                                                       { 5c00:29fa }
if SaveType = 0 then SaveRoll := 100;                                     { 5c00:2a01  save vs paralysis/poison always made }
```

### 5C00:2A11 EffImmuneFire (H)
`procedure EffImmuneFire(c [BP+0Ch]: PChar; e [BP+8]: PEffect; mode [BP+6]: Byte)` — effect handler type **70h** (events 06h, 09h).
```pascal
if (DamageType and 1) <> 0 then CancelDamageAndEffect(0);                        { 5c00:2a14 }
```

### 5C00:2A28 EffFireMinusOnePerDie (M)
`procedure EffFireMinusOnePerDie(c [BP+0Ch]: PChar; e [BP+8]: PEffect; mode [BP+6]: Byte)` — effect handler type **71h** (event 06h).
Fire damage −1 per die rolled, but at least 1 per die.
```pascal
if (DamageType and 1) <> 0 then                                           { 5c00:2a2e }
  for i := 1 to LastDiceCount do begin                                    { 5c00:2a37 }
    Dec(DamageAmount);                                                    { 5c00:2a4c }
    if DamageAmount < LastDiceCount then DamageAmount := LastDiceCount;   { 5c00:2a50 }
  end;
```

### 5C00:2A6D EffHalveElectricity (H)
`procedure EffHalveElectricity(c [BP+0Ch]: PChar; e [BP+8]: PEffect; mode [BP+6]: Byte)` — effect handler type **72h** (event 06h).
```pascal
if (DamageType and 4) <> 0 then DamageAmount := DamageAmount shr 1;      { 5c00:2a70 }
```

### 5C00:2A87 EffHalveEdged (M)
`procedure EffHalveEdged(c [BP+0Ch]: PChar; e [BP+8]: PEffect; mode [BP+6]: Byte)` — effect handler type **73h** (event 05h).
Half damage from weapons that are not blunt (ITEMS wflags 01h = edged/pointed, 80h = blunt; SAVES.md §6) and from non-weapon items (wflags 0).
```pascal
it := CurrentAttackItem(SelectedChar);                                        { 5c00:2a8d }
if it <> nil then                                                         { 5c00:2a9f }
  if (ITEMS[it^.type].wflags = 0) or ((ITEMS[it^.type].wflags and 1) <> 0) then   { 5c00:2aa7 / 2abd }
    DamageAmount := DamageAmount shr 1;                                   { 5c00:2ad6 }
```

### 5C00:2AE6 EffHalveMagicWeapon (M)
`procedure EffHalveMagicWeapon(c [BP+0Ch]: PChar; e [BP+8]: PEffect; mode [BP+6]: Byte)` — effect handler type **74h** (event 05h).
```pascal
it := CurrentAttackItem(SelectedChar);                                        { 5c00:2aec }
if (it <> nil) and (ShortInt(it^.plus) > 0) then                          { 5c00:2afe }
  DamageAmount := DamageAmount shr 1;                                     { 5c00:2b10 }
```

### 5C00:2B20 EffHolyWater (M)
`procedure EffHolyWater(c [BP+0Ch]: PChar; e [BP+8]: PEffect; mode [BP+6]: Byte)` — effect handler type **75h** (event 05h).
A Holy Water vial (item type 55h = 85, ITEMS.md) does 1d6+1.
```pascal
w := SelectedChar^.readied[0];                                            { 5c00:2b26  weapon slot +CCh }
if (w <> nil) and (w^.type = $55) then                                    { 5c00:2b3a }
  DamageAmount := RollDice(1, 6) + 1;                                     { 5c00:2b4c }
```

### 5C00:2B63 EffHalveCold (H)
`procedure EffHalveCold(c [BP+0Ch]: PChar; e [BP+8]: PEffect; mode [BP+6]: Byte)` — effect handler type **76h** (event 06h).
```pascal
if (DamageType and 2) <> 0 then DamageAmount := DamageAmount shr 1;      { 5c00:2b66 }
```

### 5C00:2B7D EffNeedMagicWeapon (M)
`procedure EffNeedMagicWeapon(c [BP+0Ch]: PChar; e [BP+8]: PEffect; mode [BP+6]: Byte)` — effect handler type **77h** (event 05h).
Non-magic weapons do no damage — except for monster attackers (race 0) of level_main ≥ 4.
```pascal
it := CurrentAttackItem(SelectedChar);                                        { 5c00:2b83 }
if (it = nil) or (it^.plus = 0) then                                      { 5c00:2b95 }
  if (ShortInt(SelectedChar^.race) > 0) or (ShortInt(SelectedChar^.level_main) < 4) then   { 5c00:2ba7 / 2bb2 }
    DamageAmount := 0;                                                    { 5c00:2bbd }
```

### 5C00:2BC8 EffAvoidBoulders (M)
`procedure EffAvoidBoulders(c [BP+0Ch]: PChar; e [BP+8]: PEffect; mode [BP+6]: Byte)` — effect handler type **78h** (event 05h).
```pascal
w := SelectedChar^.readied[0];                                            { 5c00:2bce }
if (w <> nil) and ((w^.type = $57) or (w^.type = $58)) then               { 5c00:2be2  Boulder types 87/88 (ITEMS.md) }
  AvoidRangedAttack(c, 50);                                                   { 5c00:2bfe  50 % "Avoids it" }
```

### 5C00:2C1C EffSpitAcid (H)
`procedure EffSpitAcid(c [BP+0Ch]: PChar; e [BP+8]: PEffect; mode [BP+6]: Byte)` — effect handler type **79h** (event 0Eh). Callees: Roll, TargetDistance, ClearCombatantActionFlags, ShowCharacterMessage, BuildFourAnimationFrames, CombatantCol/Row, AnimateAlongPath, RollDice, SavingThrow, DamageCharacter, RemoveEffect.
25 % chance per turn, target within 3 squares: 8d4, half on a save vs breath (save type 3); then the attack is used up (removes 79h and the acid-touch effect 50h).
```pascal
HookOpponent := c^.combatant^.target;                                    { 5c00:2c22 }
if Roll(1, 100) > 25 then exit;                                           { 5c00:2c39 }
if TargetDistance(c, HookOpponent) >= 4 then exit;                       { 5c00:2c4b }
done := ClearCombatantActionFlags(c);                                     { 5c00:2c65  result unused }
ShowCharacterMessage(c, 'Spits Acid', 10, true);                          { 5c00:2c73 }
BuildFourAnimationFrames($17);                                            { 5c00:2c93 }
AnimateAlongPath(CombatantCol(c), CombatantRow(c),
                 CombatantCol(HookOpponent), CombatantRow(HookOpponent), 1, $1E);   { 5c00:2c9b .. 2cd5 }
DamageCharacter(HookOpponent, RollDice(8, 4), 2, SavingThrow(HookOpponent, 3, 0));  { 5c00:2cda .. 2d05 }
RemoveEffect(c, $79, e);                                                  { 5c00:2d0a }
RemoveEffect(c, $50, nil);                                                { 5c00:2d1e }
```
Quirk (H): DamageType is not set here — the damage text/hooks see whatever kind the previous damage left.

### 5C00:2D38 EffOilFlask (M)
`procedure EffOilFlask(c [BP+0Ch]: PChar; e [BP+8]: PEffect; mode [BP+6]: Byte)` — effect handler type **7Ah** (events 05h, 06h).
```pascal
w := SelectedChar^.readied[0];                                            { 5c00:2d3e }
if (w <> nil) and (w^.type = $56) then                                    { 5c00:2d52  Flask of Oil (86) }
  DamageAmount := RollDice(3, 8);                                         { 5c00:2d64 }
if (DamageType and 9) <> 0 then                                           { 5c00:2d72  Fire or Magic }
  DamageAmount := DamageAmount + LastDiceCount;                           { 5c00:2d7b  +1 per die }
```

### 5C00:2D88 EffNeedMagicSilverHalf (M)
`procedure EffNeedMagicSilverHalf(c [BP+0Ch]: PChar; e [BP+8]: PEffect; mode [BP+6]: Byte)` — effect handler type **7Bh** (event 05h).
Non-magic weapons do nothing, non-magic Silver weapons half.
```pascal
it := CurrentAttackItem(SelectedChar);                                        { 5c00:2d8e }
if it <> nil then begin                                                   { 5c00:2da0 }
  if (it^.plus = 0) and (it^.word[3] = $B1) then                          { 5c00:2da8  'Silver' }
    DamageAmount := DamageAmount shr 1                                    { 5c00:2dbc }
  else if it^.plus = 0 then
    DamageAmount := 0;                                                    { 5c00:2dc8 }
end else
  DamageAmount := 0;                                                      { 5c00:2dd9 }
```

### 5C00:2DE4 EffResistSleepCharm30 (M)
`procedure EffResistSleepCharm30(c [BP+0Ch]: PChar; e [BP+8]: PEffect; mode [BP+6]: Byte)` — effect handler type **7Ch** (event 09h). AD&D half-elf 30 % (M).
```pascal
if Roll(1, 100) <= 30 then begin                                          { 5c00:2de7 }
  CancelDamageAndEffect($0B);                                                     { 5c00:2df6 }
  CancelDamageAndEffect($35);                                                     { 5c00:2dfd }
end;
```

### 5C00:2E08 EffUndeadImmunities (M)
`procedure EffUndeadImmunities(c [BP+0Ch]: PChar; e [BP+8]: PEffect; mode [BP+6]: Byte)` — effect handler type **7Dh** (events 09h, 0Ch).
```pascal
CancelDamageAndEffect($0B);                                                       { 5c00:2e0b  charm }
CancelDamageAndEffect($35);                                                       { 5c00:2e12  sleep }
CancelDamageAndEffect($34);                                                       { 5c00:2e19  hold/paralysis }
CancelDamageAndEffect($37);                                                       { 5c00:2e20  poison }
if SaveType = 0 then SaveRoll := 100;                                     { 5c00:2e27 }
```
Name M (the set charm+sleep+hold+poison is the AD&D undead immunity list).

### 5C00:2E37 EffWardedByItem (M)
`procedure EffWardedByItem(c [BP+0Ch]: PChar; e [BP+8]: PEffect; mode [BP+6]: Byte)` — effect handler type **7Eh** (event 00h). Sets `AttackBlocked` (ov13 CanAttack veto) when the target carries a readied Mirror (word 76h) or a non-wooden Holy Symbol... see note.
```pascal
HookOpponent := c^.combatant^.target;                                    { 5c00:2e3d }
it := HookOpponent^.items;                                               { 5c00:2e54 }
while (it <> nil) and (AttackBlocked = 0) do begin                        { 5c00:2e68 / 2e70 }
  if it^.readied <> 0 then                                                { 5c00:2e77 }
    for k := 1 to 3 do                                                    { 5c00:2e81 }
      if ((it^.word[k] = $98) and (it^.word[3] = $FC)) or (it^.word[k] = $76) then   { 5c00:2e8a .. 2eb4 }
        AttackBlocked := 1;                                               { 5c00:2eb6 }
  it := it^.next;                                                         { 5c00:2ec1 }
end;
```
Note (H from bytes): the Holy Symbol test is `word[k] = 98h ('Holy Symbol') and word[3] = FCh ('Wooden')` — i.e. a *Wooden* Holy Symbol counts (name words read from DS:10A7 + w·21). Story meaning (vampire warding) L.

### 5C00:2EDA ItemGrantsEffect (M)
`procedure ItemGrantsEffect(c [BP+0Ch]: PChar; item [BP+8]: ^TItem; mode [BP+6]: Byte)` — handler for item-power types **80h, 81h, 82h, 85h, 86h, 88h, 8Ah, 8Bh** (the readied-item power byte with bit 7, SAVES.md §4 `power`). Callees: RemoveEffect, AddEffect, CallEffectHandler.
While the item is readied the wearer has effect `item^.power[2]` (+3Dh).
```pascal
it := item;                                                               { 5c00:2ee0 }
if mode <> 0 then                                                         { 5c00:2eec  item un-readied }
  RemoveEffect(c, it^.power[2], nil)                                      { 5c00:2ef2 }
else begin
  AddEffect(c, it^.power[2], 0, $0C, 0);                                  { 5c00:2f0d  permanent }
  CallEffectHandler(it^.power[2], c, nil, 0);                             { 5c00:2f29 }
end;
```
Name M: the 2nd parameter is dereferenced at +3Dh, inside the 63-byte item record (`power[1..3]` = +3Ch..+3Eh); whose code calls these handlers with an item is not in ov12 (L: item ready/unready code).

### 5C00:2F57 ItemGiantStrength (M)
`procedure ItemGiantStrength(c [BP+0Ch]: PChar; item [BP+8]: ^TItem; mode [BP+6]: Byte)` — item-power handler type **83h**. Callees: DecodeStrength, RemoveEffect, SetStrength, ShowCharacterMessage, AddEffect.
Readying the item sets STR 18/00 (effect 26h keeps the old strength code in p3); un-readying removes that effect again.
```pascal
if mode <> 0 then begin                                                   { 5c00:2f5d }
  found := false;                                                         { 5c00:2f66 }
  p := c^.effects;                                                        { 5c00:2f6a }
  is1800 := (c^.str = 18) and (c^.str_exc = 100);                         { 5c00:2f7c }
  while (p <> nil) and not found do begin                                 { 5c00:2f9a }
    if p^.type = $26 then begin                                           { 5c00:2fa8 }
      DecodeStrength(p, oldStr, oldExc);                                  { 5c00:2fb1 }
      if (is1800 and (p^.type < $80)) or
         ((oldStr = 18) and (oldExc = 100) and not is1800) then begin     { 5c00:2fc6 .. 2fe5 }
        RemoveEffect(c, $26, p);                                          { 5c00:2fe7 }
        found := true;                                                    { 5c00:2ffb }
      end;
    end;
    p := p^.next;                                                         { 5c00:2fff }
  end;
end else begin
  if SetStrength(c, 18, 100, oldCode) then                                { 5c00:3015 }
    if game_Mode = 5 then begin                                           { 5c00:302f }
      game_Mode := 2;                                                     { 5c00:3036  message in the text window, not the combat panel }
      ShowCharacterMessage(c, 'is stronger', 10, true);                   { 5c00:303b }
      game_Mode := 5;                                                     { 5c00:305b }
    end else
      ShowCharacterMessage(c, 'is stronger', 10, true);                   { 5c00:3062 }
  ItemsChanged := 1;                                                      { 5c00:3082 }
  AddEffect(c, $26, 0, oldCode, 1);                                       { 5c00:3087  also when SetStrength failed }
end;
```
Quirk (H): `p^.type < 80h` is always true for a type-26h record, so with STR 18/00 the first 26h effect is removed regardless of its stored code (the asm compares the record's byte +0, 5c00:2fcf).

### 5C00:30A5 ItemAlignmentShock (M)
`procedure ItemAlignmentShock(c [BP+0Ch]: PChar; item [BP+8]: ^TItem; mode [BP+6]: Byte)` — item-power handler type **84h**. Callees: DrawCombatLayout, DamageCharacter.
An item keyed to an alignment (low nibble of power[2]) refuses another wearer: it is un-readied and deals (power[2] shr 4) magic damage.
```pascal
it := item;                                                               { 5c00:30ab }
if mode <> 0 then exit;                                                   { 5c00:30b7 }
if (it^.power[2] and $0F) <> c^.alignment then begin                      { 5c00:30bf }
  it^.readied := 0;                                                       { 5c00:30d2 }
  dmg := it^.power[2] shr 4;                                              { 5c00:30da }
  DamageType := 8;                                                        { 5c00:30ea  Magic }
  if game_Mode = 5 then DrawCombatLayout;                                 { 5c00:30ef }
  DamageCharacter(c, dmg, 0, false);                                      { 5c00:30fb }
  ItemsChanged := 1;                                                      { 5c00:3110 }
end;
```

### 5C00:3134 ItemNeedsGiantStrength (H)
`procedure ItemNeedsGiantStrength(c [BP+0Ch]: PChar; item [BP+8]: ^TItem; mode [BP+6]: Byte)` — item-power handler type **87h**.
```pascal
it := item;                                                               { 5c00:313a }
if mode <> 0 then exit;                                                   { 5c00:3146 }
if c^.str < 19 then begin                                                 { 5c00:314e }
  it^.readied := 0;                                                       { 5c00:3158 }
  ShowTimedBottomMessage('Must have Giant Strength');                     { 5c00:3160 }
end;
```

### 5C00:317A ItemRemove17 (L)
`procedure ItemRemove17(c [BP+0Ch]: PChar; item [BP+8]: ^TItem; mode [BP+6]: Byte)` — item-power handler type **89h**.
```pascal
if mode <> 0 then RemoveEffect(c, $17, nil);                              { 5c00:317d }
```
(On un-readying removes effect 17h, whose handler is EffSpiritualHammer 5C00:07E0 "Gains an item" — part A. Name L.)

### 5C00:319B EffNop (H)
`procedure EffNop(c [BP+0Ch]: PChar; e [BP+8]: PEffect; mode [BP+6]: Byte)` — empty body (`55 89 E5 5D CA 0A 00`), handler of types 05h, 0Dh, 13h, 18h, 1Bh, 3Ch, 3Fh, 5Ch, 7Fh.
```pascal
{ nothing }                                                               { 5c00:319b }
```

### 5C00:31A2 InstallEffectHandlers (H)
`procedure InstallEffectHandlers` — RETF. Caller: InitGameState (5700:060C, startup, via stub_ov12_e1). Stub entry 1 of ov12.
Fills `EffectHandler` (far pointers at DS:6828 + 4·t) for t = 01h..8Bh except 58h: 138 stores of `MOV AX,stubofs; MOV DX,stubseg; MOV [6828h+4t],AX; MOV [682Ah+4t],DX` (13 bytes each), ascending t. The stub segments are 0041 (ov12) and 0068 (ov13, entries for 49h/4Ah); each `stubofs = 20h + 5·k` = entry k.
```pascal
for t := $01 to $57 do EffectHandler[t] := Handler[t];                    { 5c00:31a5 .. 3566 }
{ EffectHandler[$58] is not written: stays 0000:0000 (BSS) }
for t := $59 to $8B do EffectHandler[t] := Handler[t];                    { 5c00:3567 .. 38a3 }
```
`Handler[t]` (resolved through the stub entry tables, scratch script over ov12.lst + ovl_layout.json; identical to the table in combat_parts/ov24.pas.md, H):
```
01 EffBless  02 EffCurse  03 EffBonusVsUndead  04 EffStartsToTrain  05 EffNop     06 EffFlameTongue  07 EffHardier  08 EffProtFromEvil
09 EffProtFromGood  0A EffResistCold  0B EffCharm  0C EffStrengthEnd  0D EffNop     0E EffSetCharisma  0F EffHpLossTick  10 EffNop10
11 EffShield  12 EffGnomeAttackBonus  13 EffNop     14 EffResistFire  15 EffSilence  16 EffSlowPoisonEnd  17 EffSpiritualHammer  18 EffNop
19 EffInvisible  1A EffDwarfAttackBonus  1B EffNop     1C EffMirrorImage  1D EffEnfeebled  1E EffCoughing  1F EffHelpless  20 EffAnimatedEnd
21 EffPenaltyAll4  22 EffWeaknessAndDrain  23 EffPlusOne  24 EffPenalty4  25 EffUntouchableBeforeTurn  26 EffStrengthEnd  27 EffHaste  28 EffCloudRemoved
29 EffMagicWeaponOnly  2A EffSlow  2B EffWeakness  2C EffHpDrainTick  2D EffProtFromEvil  2E EffProtFromGood  2F EffDwarfGiantDefence  30 EffGnomeGiantDefence
31 EffPrayer  32 EffSlowHeal  33 EffHelpless  34 EffHelpless  35 EffHelpless  36 EffNop36  37 EffNop37  38 EffGrantInvisible
39 EffMummyRot  3A EffHeld  3B EffBecome62  3C EffNop     3D EffFireResistance  3E EffRegenerate  3F EffNop     40 EffPoisonHit
41 EffPoisonHitP4  42 EffPoisonHitP2  43 EffParalyzeHit2d8  44 EffGhoulParalysis  45 EffParalyzeHitLong  46 EffPoisonHitM2  47 EffUnattackable  48 EffGrantInvisible95
49 EffRake(EffRake)  4A ov13_3A86  4B EffBloodDrain  4C EffStirgeAttach  4D EffGrab  4E EffReviveCheck
4F EffFireDamage  50 EffAcidDamage  51 EffFearAura  52 EffFearOnce  53 EffStoneGaze  54 EffCharmGaze
55 EffDrainOne  56 EffDrainTwo  57 EffMummyTouch  58 (none)  59 EffDisplacement  5A EffConSaveBonusPoison
5B EffShield  5C EffNop  5D EffHalveFire  5E EffHalveWeapon  5F EffFallsDead  60 EffNeedSilverOrMagic
61 EffConSaveBonusMagic  62 EffRegenerate3  63 EffReviveOnce  64 EffTrollDown  65 EffStartRegenerating  66 EffTrollRise
67 EffGaseousEscape  68 EffAvoidMissiles60  69 EffMagicRes50  6A EffMagicRes15  6B EffResistSleepCharm90  6C EffImmuneSleepCharm
6D EffImmuneHold  6E EffImmuneCold  6F EffImmunePoisonParalysis  70 EffImmuneFire  71 EffFireMinusOnePerDie  72 EffHalveElectricity
73 EffHalveEdged  74 EffHalveMagicWeapon  75 EffHolyWater  76 EffHalveCold  77 EffNeedMagicWeapon  78 EffAvoidBoulders
79 EffSpitAcid  7A EffOilFlask  7B EffNeedMagicSilverHalf  7C EffResistSleepCharm30  7D EffUndeadImmunities  7E EffWardedByItem
7F EffNop  80 ItemGrantsEffect  81 ItemGrantsEffect  82 ItemGrantsEffect  83 ItemGiantStrength  84 ItemAlignmentShock
85 ItemGrantsEffect  86 ItemGrantsEffect  87 ItemNeedsGiantStrength  88 ItemGrantsEffect  89 ItemRemove17  8A ItemGrantsEffect  8B ItemGrantsEffect
```
Anchors (address of the `MOV AX` of the store of type t = 31A5h + 13·(t−1) for t ≤ 57h, 31A5h + 13·(t−2) for t ≥ 59h; checked: t=01 at 5c00:31a5, t=49h → `MOV [694C],AX` at 5c00:3553, t=8Bh → `MOV [6A54],AX` at 5c00:38a0).

### 5C00:38A9 ov12_init (H)
`procedure ov12_init` — empty unit initialiser (`55 89 E5 5D CB`), called through stub entry 0 from the main program's init chain.
```pascal
{ nothing }                                                               { 5c00:38a9 }
```
