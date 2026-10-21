# ov12 (seg 5C00) — effect handlers (conditions, spell/item/monster effects) — part A: 5C00:0000..1A18 (FINAL pseudocode, lane por-mod-party)

Unit: ov12, analysis segment 5C00, 127 routines (functions.tsv), 117 stub entries. Part A = the 70 routines below 5C00:1A19 (helpers 0000/001F/0058/0FAC/101D/1545/15EB + effect handlers for types 01h..4Eh); part B (`ov12b.pas.md`) = 1A19..38A9 including the table builder InstallEffectHandlers.
Role (H): **ov12 is not training/level-up code** (provisional area map). It holds one far procedure per active-effect type (TChar `effects` +7Fh, 9-byte TEffect, SAVES.md §5). `InstallEffectHandlers` stores them in `EffectHandler{g_682C}` (entry for type t at DS:6828h+4t); they are called only through `CallEffectHandler{9800:0000}` (ov24): from `CallEffectHooks{9800:02FA}` (mode 0, per hook event) and from `RemoveEffect{9800:0026}` / `HealCharacter{9800:175D}` (mode 1, when the effect's `callOnRemove` +4 ≠ 0 — this is also how timed effects "tick": a handler re-adds its own effect when it is removed on expiry). Type → handler table and event lists: combat_parts/ov24.pas.md (H). The strings "starts to train" / "is hardier" belong to effect types 04h/07h (see below).
Sources: `decode/listings/ov12.lst` (evidence), `ov12.c` (aid), PARTY.draft.md (checklist). Pascal-string literals are in the code segment just before each routine (offsets in `[ps]` annotations).

Conventions (as VIEW.pas.md / combat_parts)
- **Signatures in Pascal order**: first parameter = highest BP offset (pushed first); parameters as `name [BP+xx]`. Every call below was written from its PUSH sequence.
- `{ seg:off }` = first instruction of the statement (or of the call that implements it). `{ quirk: … }` = behaviour a port must copy.
- **Every effect handler** has the signature `procedure EffXxx(c [BP+0Ch]: PChar; e [BP+8]: PEffect; mode [BP+6]: Byte)` (RETF 0Ah) — `c` = owner of the effect (in area effects: the character standing in the area), `e` = the effect record (may be another member's, see RunEffectIfActive), `mode` 0 = hook event / apply, 1 = removed. Handlers that ignore a parameter still take it. Only the handler's *types* and *events* are listed per routine: "types 08h, 2Dh — events 0Bh, 0Ch" (events from CallEffectHooks, ov24; "no event" = runs only when removed, i.e. on expiry/cure with callOnRemove ≠ 0).
- Hook events (meaning from the ov24/ov13/ov09 callers): 01h target may be attacked?, 02h/03h after a hit with attack slot 1/2, 04h attacker's damage, 05h target's damage (melee), 06h damage taken (DamageCharacter), 07h/0Fh turn checks (ov08 4800:01F6/0666), 08h combat start (StartCombat), 0Ah attacker's to-hit, 0Bh target before AC, 0Ch saving throw, 0Dh went down, 10h target of a to-hit roll, 11h morale (ov09 4D00:10D7), 12h stat recalculation (StatValue = attacks or movement), 13h once per round (ov08 4800:0880).
- Hook communication globals (ov24/ov13 names): `SaveRoll{g_6816}`, `EffectToApply{g_6817}`, `DamageAmount{g_6818}`, `DamageType{g_6819}` (1 fire, 2 cold, 4 electricity, 8 magic, 10h acid), `StatValue{g_681A}`, `StatKind{g_681D}` (0 attacks, 1 movement), `LastDiceCount{g_681C}`, `AttackBlocked{g_681E}`, `SpellArea{g_6820}`, `AttackRollValue{g_6822}` (d20, may go negative = miss), `SlotHits{g_6823}`, `cure_InProgress{g_681F}` (magic_names.json). Introduced here: `sp_Current{g_681B}`, `MoraleValue{g_6825}`, `HookOpponent{g_6826}`, `sc_List{g_6DBB}`, `CloudSquareDir{g_290D}`, name tables `GnomeFoeNames{g_0332}`, `DwarfFoeNames{g_0372}`, `GiantFoeNames{g_03F2}` (see ov12a_notes.md).
- `cr(c)` = `c^.combatant` (+108h), the combat record (ov13 names): `+1 mayCast`, `+2 mayUseItems` (ov09 names, M), `+3 initiative`, `+6 moveLeft`, `+0Ah target` (far ptr TChar), `+10h turned` (forced to flee).
- TChar fields by SAVES.md §3 names; TEffect = `type +0, duration +1 (Word), p3 +3, callOnRemove +4, next +5`; TItem by SAVES.md §4.
- In hook context `SelectedChar{g_5D92}` is the *other* party of the roll (the attacker when `c` is the target, the caster for saves) — evidence: protection/size handlers below test SelectedChar's alignment/race while `c` is the defender (M).
- Callees: ov24 names (`AddEffect(c, type, duration, p3, callOnRemove)`, `RemoveEffect(c, type, e)`, `CallEffectHandler(type, c, e, mode)`, `SavingThrow(c, saveType, bonus)`, `Roll(count, sides)`, `RollDice(count, sides)`, `DamageCharacter(c, dmg, saveEffect, saved)`, `HealCharacter(c, amount, onlyIfHurt)`, `ReviveCombatant(c, hp)`, `RemoveCombatEffects(c)`, `CallEffectHooks(event, c)`, `StrengthCode`, `DecodeStrength`); resident by ENGINE names (`ShowCharacterMessage(c, s, combatRow, wait)`, `ShowTimedBottomMessage(s)`, `ShowCombatMessageAnimation(c, spell, s)`, `HasEffect(c, id, var e)`, `MessageDelay`, `ClearCharacterMessage`, `DrawPartyRoster(sel)`, `DrawCharacterSummary(c)`, `RecalcCharacter(c)`, `LoseItem(c, item)`, `AppendItemCopy(c, item)`, `CountActiveSides`, `ClearCombatantActionFlags(c)`, `TargetDistance(c, target)`, `GetMissileAmmo(c, var ammo)`); VIEW names `RemoveCombatant{BB00:0E11}(c)`, `CombatantIndex{BB00:0C5F}(c)`, `cm_Map{g_6716}`, `cb_Char{g_65B9}` (element i at 65B9h+4i).

---

## Helpers

### 5C00:0000 CancelDamageAndEffect (M)
`procedure CancelDamageAndEffect(type [BP+6]: Byte)` — RETF 2. Callers: MagicResistance, EffMirrorImage, EffFireResistance, EffShield, EffResistSleepCharm90, EffImmuneSleepCharm, EffImmuneHold, EffImmuneCold, EffImmunePoisonParalysis, EffImmuneFire, EffResistSleepCharm30, EffUndeadImmunities.
Vetoes the pending damage and the pending new effect: unconditionally for `type = 0`, else only when the effect about to be applied is `type` (ApplyEffect reports "is Unaffected" when EffectToApply = 0, ov24).
```pascal
if (type = 0) or (EffectToApply = type) then begin     { 5c00:0003 }
  DamageAmount := 0;                                   { 5c00:0011 }
  EffectToApply := 0;                                  { 5c00:0016 }
end;
```

### 5C00:001F AddEffectUnlessCuring (M)
`function AddEffectUnlessCuring(c [BP+0Ch]: PChar; type [BP+0Ah], p3 [BP+8]: Byte; duration [BP+6]: Word): Boolean` — RETF 0Ah. Callers: EffHpLossTick, EffWeakness, EffHpDrainTick, EffSlowHeal, EffMummyRot, EffRegenerate, EffReviveCheck, EffTrollRise.
Used by the "ticking" effects to re-add themselves when they expire; does nothing while a cure is removing effects (`cure_InProgress`, set by the cure spells/temple, ov04/ov22).
```pascal
if cure_InProgress <> 0 then result := false              { 5c00:0025 }
else begin
  result := true;                                          { 5c00:0032 }
  AddEffect(c, type, duration, p3, 1);                     { 5c00:004a  callOnRemove = 1 }
end;
AddEffectUnlessCuring := result;                           { 5c00:004f }
```

### 5C00:0058 ApplyFatalStatus (M)
`procedure ApplyFatalStatus(c [BP+0Ch]: PChar; status [BP+0Ah]: Byte; msg [BP+6]: string[40])` — RETF 0Ah. Callers: PoisonOpponent, DrainLevels, EffSlowPoisonEnd, EffAnimatedEnd, EffMummyRot, EffFallsDead. Callees: ShowCharacterMessage, RemoveCombatEffects, CallEffectHooks, RemoveCombatant, MessageDelay, ClearCharacterMessage, DrawPartyRoster.
Shows `msg` and puts `c` out of action with `status` (6 Dead, 8 Gone …) — unless it is already Dead/Stoned/Gone.
```pascal
s := msg;                                                  { 5c00:006c }
ShowCharacterMessage(c, s, 10, false);                     { 5c00:0082 }
if c^.status in [7, 6, 8] then exit;                       { 5c00:0087  quirk: the message stays on screen (no delay/clear) }
c^.status := status;                                       { 5c00:00a3 }
c^.active := 0;                                            { 5c00:00ab }
c^.hp := 0;                                                { 5c00:00b4 }
RemoveCombatEffects(c);                                    { 5c00:00c0  RemoveCombatEffects }
CallEffectHooks($0D, c);                                   { 5c00:00ce  "went down" hooks may revive }
if c^.active = 0 then RemoveCombatant(c);                  { 5c00:00d6 }
MessageDelay;                                              { 5c00:00e9 }
ClearCharacterMessage;                                     { 5c00:00ee }
if game_Mode <> 5 then DrawPartyRoster(SelectedChar);      { 5c00:00f3 }
```

---

## Effect handlers 01h..12h

### 5C00:010D EffBless (M)
Type 01h — events 0Ah, 11h. +1 to hit, +5 morale (AD&D Bless; name M from the values).
```pascal
MoraleValue := MoraleValue + 5;                            { 5c00:0110 }
AttackRollValue := AttackRollValue + 1;                    { 5c00:0115 }
```

### 5C00:011D EffCurse (M)
Type 02h — events 0Ah, 11h. The inverse of Bless.
```pascal
if MoraleValue < 5 then MoraleValue := 0                   { 5c00:0120 }
else MoraleValue := MoraleValue - 5;                       { 5c00:012e }
AttackRollValue := AttackRollValue - 1;                    { 5c00:0133 }
```

### 5C00:013B EffBonusVsUndead (M)
Type 03h — events 04h, 0Ah. +2 to hit and +2 damage against a target whose `creature_type` is 4 (undead, cf. Animate Dead sets 4; SAVES.md).
```pascal
HookOpponent := cr(c)^.target;                             { 5c00:013e }
if HookOpponent^.creature_type = 4 then begin              { 5c00:0155 }
  AttackRollValue := AttackRollValue + 2;                  { 5c00:0161 }
  DamageAmount := DamageAmount + 2;                        { 5c00:0166 }
end;
```

### 5C00:017F EffStartsToTrain (L)
Type 04h — no event (runs when the effect is removed). Shows "starts to train" and starts effect 07h for 43 200 (A8C0h) time units, whose end is "is hardier" (EffHardier). Where effect 04h is created: not in ov12 (unknown).
```pascal
ShowCharacterMessage(c, 'starts to train', 10, true);      { 5c00:01a0 }
AddEffect(c, 7, $A8C0, $FF, 1);                            { 5c00:01b8 }
```

### 5C00:01C3 EffFlameTongue (M)
Type 06h — events 04h, 0Ah. Bonus to hit and damage by the target's creature type, damage becomes fire+magic. The bonus pattern (+1 type 0Ah, +2 types 9/0Ch, +3 type 4 = undead) is the AD&D Flame Tongue sword's (name M; meaning of creature types 9, 0Ah, 0Ch L).
```pascal
HookOpponent := cr(c)^.target;                             { 5c00:01c9 }
case HookOpponent^.creature_type of                        { 5c00:01e4 }
  $0A:     b := 1;                                         { 5c00:01ed }
  9, $0C:  b := 2;                                         { 5c00:01fb }
  4:       b := 3;                                         { 5c00:0205 }
else       b := 0;                                         { 5c00:020b }
end;
AttackRollValue := AttackRollValue + b;                    { 5c00:020f }
DamageAmount := DamageAmount + b;                          { 5c00:0216 }
DamageType := 9;                                           { 5c00:021d  fire + magic }
```

### 5C00:0233 EffHardier (M)
Type 07h — no event (end of the 30-day effect started by EffStartsToTrain). CON + 1 and HP rebuilt; at CON 20 the character instead gets effect 3Eh (EffRegenerate, 1 HP per 60).
```pascal
ShowCharacterMessage(c, 'is hardier', 10, true);           { 5c00:0254 }
c^.con := c^.con + 1;                                      { 5c00:025c }
if c^.con >= 20 then begin                                 { 5c00:0263 }
  AddEffect(c, $3E, $3C, $FF, 1);                          { 5c00:027d }
  exit;
end;
old := c^.hp_max - c^.hp_rolled;                           { 5c00:0285  the current CON bonus total (byte) }
perLvl := 0;                                               { 5c00:029f }
if c^.con < 15 then exit;                                  { 5c00:02a3 }
for i := 0 to 7 do                                         { 5c00:02b0 }
  if c^.level[i] > 0 then                                  { 5c00:02c2  signed }
    if i = 2 then perLvl := perLvl + c^.level[i] * (c^.con - 15)   { 5c00:02ca  fighter }
    else if c^.con > 15 then perLvl := perLvl + c^.level[i] * 2    { 5c00:02f4 }
    else perLvl := perLvl + c^.level[i];                   { 5c00:0314 }
if perLvl = 0 then perLvl := 1;                            { 5c00:032b }
old := old div perLvl;                                     { 5c00:0335  signed IDIV, byte result }
if (c^.con >= 17) and (ShortInt(c^.level[2]) <= 0) then exit;   { 5c00:0347  CON 17+ adds only for fighters; 0354 CMP byte [DI+98h],0 / 035A JLE = signed (#verify-1) }
c^.hp_max := c^.hp_max + old;                              { 5c00:035c }
c^.hp := c^.hp + old;                                      { 5c00:0366 }
```
{ quirk: the increase is `(hp_max − hp_rolled) div perLvl`, i.e. computed from the old bonus total, not from a CON table; port verbatim. }

### 5C00:0377 EffProtFromEvil (M)
Types 08h, 2Dh (2Dh = the 10-ft-radius area variant, see RunEffectIfActive) — events 0Bh, 0Ch. Against an evil opponent (SelectedChar alignment LE/NE/CE): +2 on c's save, −2 on the attack roll.
```pascal
if SelectedChar^.alignment in [2, 5, 8] then begin         { 5c00:037a }
  SaveRoll := SaveRoll + 2;                                { 5c00:039e }
  AttackRollValue := AttackRollValue - 2;                  { 5c00:03a3 }
end;
```

### 5C00:03AC EffProtFromGood (M)
Types 09h, 2Eh — events 0Bh, 0Ch. Same against good opponents (LG/NG/CG).
```pascal
if SelectedChar^.alignment in [0, 3, 6] then begin         { 5c00:03af }
  SaveRoll := SaveRoll + 2;                                { 5c00:03d3 }
  AttackRollValue := AttackRollValue - 2;                  { 5c00:03d8 }
end;
```

### 5C00:03E1 EffResistCold (M)
Type 0Ah — events 06h, 0Ch. Cold damage halved, +3 save (both only when the damage kind has bit 2 = cold; for a save hook DamageType is the pending damage's kind).
```pascal
if DamageType and 2 <> 0 then begin                        { 5c00:03e4 }
  DamageAmount := DamageAmount shr 1;                      { 5c00:03ed }
  SaveRoll := SaveRoll + 3;                                { 5c00:03f7 }
end;
```

### 5C00:0400 EffCharm (M)
Type 0Bh — events 0Fh, 11h, 13h; also mode 1. Switches the charmed character to the charmer's side. `e^.p3` bits: 7 = charmer's side, 6 = original side (saved here), 5 = already applied (M from the arithmetic).
```pascal
if mode <> 0 then begin                                    { 5c00:0403  removed: restore }
  c^.side := (e^.p3 and $40) shr 6;                        { 5c00:0409 }
  if c^.npc_morale = $B3 then c^.npc_morale := 0;          { 5c00:0420 }
  exit;                                                    { 5c00:0434 }
end;
if e^.p3 and $20 = 0 then begin                            { 5c00:0437  first time }
  e^.p3 := e^.p3 + $20 + (c^.side shl 6);                  { 5c00:0444  byte arithmetic }
  c^.side := e^.p3 shr 7;                                  { 5c00:0468 }
  c^.controlled := 1;                                      { 5c00:047d }
  if c^.npc_morale <= $7F then c^.npc_morale := $B3;       { 5c00:0486 }
  cr(c)^.target := nil;                                    { 5c00:049a }
  CountActiveSides;                                        { 5c00:04ac }
end;
MoraleValue := 100;                                        { 5c00:04b1  charmed creatures never fail morale }
```

### 5C00:04BA EffStrengthEnd (M)
Types 0Ch, 26h (strength-raising effects, cf. SetStrength 9800:115C) — no event (removed). If this effect holds the original strength (`p3 < 80h`), restore it; if another strength effect is still active, the strongest of them becomes the holder and its strength applies.
```pascal
if e^.p3 > $7F then exit;                                  { 5c00:04c0  not the holder }
DecodeStrength(e, s, x);                                   { 5c00:04dd }
c^.str := s;  c^.str_exc := x;                             { 5c00:04e2 }
best := nil;  bestS := 0;  bestX := 0;                     { 5c00:04f6 }
p := c^.effects;                                           { 5c00:0506 }
while p <> nil do begin                                    { 5c00:0518 }
  if ((p^.type = $0C) or (p^.type = $26)) and (p <> e) then begin   { 5c00:0520 }
    DecodeStrength(p, s, x);                               { 5c00:0552 }
    if (s > bestS) or ((bestS = 18) and (x > bestX)) then begin      { 5c00:0557 }
      bestS := s;  bestX := x;  best := p;                 { 5c00:056d }
    end;
  end;
  p := p^.next;                                            { 5c00:0585 }
end;
if best <> nil then begin                                  { 5c00:0598 }
  best^.p3 := StrengthCode(c^.str, c^.str_exc);            { 5c00:05b0  becomes the holder (bit 7 clear) }
  c^.str := bestS;  c^.str_exc := bestX;                   { 5c00:05bc }
end;
```
{ quirk: no RecalcCharacter here (the caller of RemoveEffect recalculates or not). }

### 5C00:05D6 EffSetCharisma (L)
Type 0Eh — no event (removed): `c^.cha := e^.p3` (restores a saved charisma — M for the field, L for the purpose).
```pascal
c^.cha := e^.p3;                                           { 5c00:05d9 }
```

### 5C00:05EB EffHpLossTick (L)
Type 0Fh — no event (removed on expiry, re-adds itself every 10 time units): 1 point of damage per tick while hp > 1. Removed (without effect) by EffSlowPoisonEnd.
```pascal
if AddEffectUnlessCuring(c, $0F, e^.p3, 10) then           { 5c00:0604 }
  if c^.hp > 1 then begin                                  { 5c00:060b }
    DamageType := 0;                                       { 5c00:0616 }
    DamageCharacter(c, 1, 0, false);                       { 5c00:062a }
    if game_Mode <> 5 then DrawPartyRoster(SelectedChar);  { 5c00:062f }
  end;
```

### 5C00:0647 EffNop10 (H)
Type 10h — empty body (`PUSH BP; MOV BP,SP; POP BP; RETF 0Ah`).  { 5c00:0647 }

### 5C00:064E EffShield (M)
Type 11h — events 06h, 0Bh, 0Ch. AC at least 3 (39h = 60−3), +1 save, and no damage from spell 0Fh (the AD&D Shield spell's immunity to Magic Missile; spell id from `sp_Current`, M).
```pascal
if c^.ac < $39 then c^.ac := $39;                          { 5c00:0651 }
SaveRoll := SaveRoll + 1;                                  { 5c00:0665 }
if sp_Current = $0F then DamageAmount := 0;              { 5c00:0669 }
```

### 5C00:0679 EffGnomeAttackBonus (M)
Type 12h — event 0Ah. +1 to hit when the target is a humanoid (`creature_type = 1`) of `size = 1` whose name is one of `GnomeFoeNames[1..4]` = KOBOLD, KOBOLD LEADER, GOBLIN, GOBLIN LEADER (DS:0342.., string[15] each; AD&D gnome racial bonus).
```pascal
HookOpponent := cr(c)^.target;                             { 5c00:067f }
if (HookOpponent^.creature_type = 1) and (HookOpponent^.size = 1) then   { 5c00:0696 }
  for i := 1 to 4 do                                       { 5c00:06ad }
    if HookOpponent^.name = GnomeFoeNames[i] then          { 5c00:06cd }
      AttackRollValue := AttackRollValue + 1;              { 5c00:06d4 }
```

---

## Effect handlers 14h..2Ch

### 5C00:06E4 EffResistFire (M)
Type 14h — events 06h, 0Ch. Fire (DamageType bit 0) damage halved, +3 save.
```pascal
if DamageType and 1 <> 0 then begin                        { 5c00:06e7 }
  DamageAmount := DamageAmount shr 1;                      { 5c00:06f0 }
  SaveRoll := SaveRoll + 3;                                { 5c00:06fa }
end;
```

### 5C00:070F EffSilence (M)
Type 15h (area type: also when a party member with the effect is within 1 square, RunEffectIfActive) — event 0Fh. No spells and no magic-item use this turn.
```pascal
if cr(c)^.mayUseItems <> 0 then                            { 5c00:0715 }
  ShowCharacterMessage(c, 'is silenced', 10, true);        { 5c00:073f }
cr(c)^.mayUseItems := 0;                                   { 5c00:0744 }
cr(c)^.mayCast := 0;                                       { 5c00:0751 }
```

### 5C00:0775 EffSlowPoisonEnd (M)
Type 16h — no event (removed). When the slow-poison effect ends: a still-poisoned character (effect 37h) dies; the 1-HP tick effect 0Fh is removed in "cure" mode (so it does not re-add itself).
```pascal
if HasEffect(c, $37, p) then                               { 5c00:0789 }
  ApplyFatalStatus(c, 6, 'dies from poison');              { 5c00:07ab  6 = Dead }
cure_InProgress := 1;                                      { 5c00:07ae }
RemoveEffect(c, $0F, nil);                                 { 5c00:07c2 }
cure_InProgress := 0;                                      { 5c00:07c7 }
```

### 5C00:07E0 EffSpiritualHammer (H)
Type 17h — event 13h (once per round) and mode 1. Name H: the item it creates is type 14h with words +30h = 14h "Hammer", +31h = F3h "Spiritual" (ItemWordTable DS:10A7) and plus 1.
```pascal
p := c^.items;  found := false;                            { 5c00:07e6 }
while (p <> nil) and not found do                          { 5c00:07fd }
  if (p^.type = $14) and (p^.word[3] = $F3) then found := true   { 5c00:080b  word[3] = +31h }
  else p := p^.next;                                       { 5c00:0825 }
if (mode <> 0) and (p <> nil) then LoseItem(c, p);         { 5c00:0838  effect removed: the hammer vanishes }
if (mode = 0) and not found and (c^.item_count < 16) then begin   { 5c00:0857 }
  p := GetMem($3F);                                        { 5c00:087b }
  FillChar(p^, $3F, 0);                                    { 5c00:0892 }
  p^.type := $14;                                          { 5c00:0897 }
  p^.word[2] := $14;                                       { 5c00:089f  "Hammer" }
  p^.word[3] := $F3;                                       { 5c00:08a7  "Spiritual" }
  p^.plus := 1;                                            { 5c00:08af }
  p^.power[2] := $17;                                      { 5c00:08b7  +3Dh }
  p^.power[3] := $89;                                      { 5c00:08bf  +3Eh }
  AppendItemCopy(c, p);                                    { 5c00:08d3 }
  FreeMem(p, $3F);                                         { 5c00:08e2 }
  ShowCharacterMessage(c, 'Gains an item', 10, true);      { 5c00:0902 }
end;
RecalcCharacter(c);                                        { 5c00:090d }
```
(The new hammer is not readied here; `power[2..3]` = 17h, 89h meaning L.)

### 5C00:0918 EffInvisible (M)
Type 19h — events 01h, 10h. Attacks on `c` are blocked unless the attacker has effect 18h (Detect Invisibility, M); in any case −4 on the attack roll.
```pascal
if not HasEffect(SelectedChar, $18, p) then AttackBlocked := 1;   { 5c00:092e }
AttackRollValue := AttackRollValue - 4;                    { 5c00:093c }
```

### 5C00:0947 EffDwarfAttackBonus (M)
Type 1Ah — event 0Ah. As EffGnomeAttackBonus with `DwarfFoeNames[1..8]` (DS:0382..): ORC, ORC LEADER, GOBLIN, GOBLIN LEADER, HOBGOBLIN, HOBGOBLIN CHIEF, GAGOOL, MACE.
```pascal
HookOpponent := cr(c)^.target;                             { 5c00:094d }
if (HookOpponent^.creature_type = 1) and (HookOpponent^.size = 1) then   { 5c00:0964 }
  for i := 1 to 8 do                                       { 5c00:097b }
    if HookOpponent^.name = DwarfFoeNames[i] then          { 5c00:099b }
      AttackRollValue := AttackRollValue + 1;              { 5c00:09a2 }
```

### 5C00:09C0 EffMirrorImage (M)
Type 1Ch — events 05h, 06h. `e^.p3` = number of images. With chance p3/(p3+1) an image is hit instead: damage and pending effect cancelled, one image lost; at 0 images the effect ends.
```pascal
if (Roll(1, e^.p3 + 1) > 1) and (sp_Current <> 0) and (SpellArea = 0) then begin   { 5c00:09d4 }
  CancelDamageAndEffect(0);                                { 5c00:09ef }
  ShowCharacterMessage(c, 'lost an image', 10, true);      { 5c00:0a0d }
  e^.p3 := e^.p3 - 1;                                      { 5c00:0a12 }
  if e^.p3 = 0 then RemoveEffect(c, $1C, nil);             { 5c00:0a19 }
end;
```
{ quirk: the test `sp_Current <> 0` (CMP [681B],0 / JBE at 5c00:09dd) means images only absorb non-area **spells**; weapon hits (sp_Current = 0) are not absorbed here. }

### 5C00:0A3D EffEnfeebled (M)
Type 1Dh — event 04h (attacker's damage). Damage −25 % (`d − d div 4`; AD&D Ray of Enfeeblement, name M).
```pascal
DamageAmount := DamageAmount - (DamageAmount shr 2);       { 5c00:0a40 }
```

### 5C00:0A65 EffCoughing (M)
Type 1Eh — events 0Bh, 0Fh. A character in a stinking cloud: no spells/items this turn, AC 2 worse (minimum AC 10), front AC := rear AC.
```pascal
if cr(c)^.mayUseItems <> 0 then                            { 5c00:0a6b }
  ShowCharacterMessage(c, 'is coughing', 10, true);        { 5c00:0a95 }
cr(c)^.mayUseItems := 0;                                   { 5c00:0a9a }
cr(c)^.mayCast := 0;                                       { 5c00:0aa7 }
RecalcCharacter(c);                                        { 5c00:0aba }
if c^.ac_rear > $34 then c^.ac_rear := c^.ac_rear - 2      { 5c00:0abf }
else c^.ac_rear := $32;                                    { 5c00:0ad5  AC 10 }
c^.ac := c^.ac_rear;                                       { 5c00:0ade }
if c = SelectedChar then DrawCharacterSummary(c);          { 5c00:0aee }
```

### 5C00:0B1B EffAnimatedEnd (M)
Type 20h — no event (removed). End of an animated corpse (cf. Animate Dead Spell_AnimateDead: ai_mode 2, creature_type 4, npc_morale B3h): it collapses (Dead) and its record is restored for the party.
```pascal
e^.callOnRemove := 0;                                      { 5c00:0b21 }
if cure_InProgress = 0 then                                { 5c00:0b29 }
  ApplyFatalStatus(c, 6, 'collapses');                     { 5c00:0b49 }
c^.side := e^.p3 shr 4;                                    { 5c00:0b4c }
c^.controlled := 1;                                        { 5c00:0b61 }
c^.ai_mode := 0;                                           { 5c00:0b6a }
c^.fighter_lvl_eff := c^.level[2];                         { 5c00:0b72 }
c^.base_move := 12;                                        { 5c00:0b81 }
if c^.npc_morale = $B3 then c^.npc_morale := 0;            { 5c00:0b89 }
c^.creature_type := 0;                                     { 5c00:0b9d }
```

### 5C00:0BAC EffPenaltyAll4 (L)
Type 21h — events 0Ah, 0Bh, 0Ch. −4 to hit, AC 4 worse, −4 save (which AD&D condition: unknown; candidates blindness).
```pascal
AttackRollValue := AttackRollValue - 4;                    { 5c00:0baf }
c^.ac := c^.ac - 4;                                        { 5c00:0bb4 }
c^.ac_rear := c^.ac_rear - 4;                              { 5c00:0bbd }
SaveRoll := SaveRoll - 4;                                  { 5c00:0bc6 }
```

### 5C00:0BCF EffWeaknessAndDrain (L)
Type 22h — no event (removed): runs the handlers of 2Bh (EffWeakness) and 2Ch (EffHpDrainTick) with the same arguments.
```pascal
CallEffectHandler($2B, c, e, mode);                        { 5c00:0be5 }
CallEffectHandler($2C, c, e, mode);                        { 5c00:0bfd }
```
{ quirk: both handlers re-add *their own* type (2Bh / 2Ch), so a type-22h effect turns into two effects on its first expiry. }

### 5C00:0C06 EffPlusOne (L)
Type 23h (in no hook list) and called directly by EffPrayer: +1 save, +1 to hit.
```pascal
SaveRoll := SaveRoll + 1;                                  { 5c00:0c09 }
AttackRollValue := AttackRollValue + 1;                    { 5c00:0c0d }
```

### 5C00:0C15 EffPenalty4 (L)
Type 24h — events 0Ah, 0Ch. −4 to hit, −4 save.
```pascal
AttackRollValue := AttackRollValue - 4;                    { 5c00:0c18 }
SaveRoll := SaveRoll - 4;                                  { 5c00:0c1d }
```

### 5C00:0C26 EffUntouchableBeforeTurn (L)
Type 25h — events 01h, 10h. While `c` has not acted yet this round (`initiative > 0`) it cannot be attacked.
```pascal
if cr(c)^.initiative > 0 then begin                        { 5c00:0c29  signed }
  AttackBlocked := 1;                                      { 5c00:0c38 }
  AttackRollValue := -1;                                   { 5c00:0c3d  FFh }
end;
```

### 5C00:0C4B EffHaste (H)
Type 27h — event 12h. Doubles attacks/movement (StatValue); the first time it ages the character one year ("ages"). Name H (AD&D Haste: double moves/attacks, ages 1 year). Confirms the ECL lane: 27h doubles, 2Ah halves.
```pascal
if e^.p3 and $10 = 0 then begin                            { 5c00:0c51 }
  e^.p3 := e^.p3 + $10;                                    { 5c00:0c5e }
  ShowCharacterMessage(c, 'ages', 10, true);               { 5c00:0c8c }
  c^.age := c^.age + 1;                                    { 5c00:0c91  word }
end;
StatValue := StatValue shl 1;                              { 5c00:0c98  byte }
```

### 5C00:0CC3 EffCloudRemoved (M)
Type 28h — no event (removed). Removes the cloud (stinking cloud, 2×2 squares) that belongs to `c` with id `e^.p3 shr 4` from `sc_List` and restores the combat-map ground under it; corpses get the body tile 1Fh; squares of the remaining clouds are re-marked with the cloud tile 1Eh.
Area node (19 = 13h bytes, M): `+0 owner: PChar, +4 next, +7+k ground[k] (k = 1..4, saved tile), +0Bh+k active[k], +10h x, +11h y, +12h id`; square k = (x, y) + step `CloudSquareDir[k]` = dirs 8, 2, 3, 4 (own square, E, SE, S; image bytes DS:290E..2911, H).
```pascal
id := e^.p3 shr 4;  found := false;                        { 5c00:0cc9 }
a := sc_List;                                       { 5c00:0cdd }
while (a <> nil) and not found do                          { 5c00:0cea }
  if (a^.owner = c) and (a^.id = id) then found := true    { 5c00:0cf8 }
  else a := a^.next;                                       { 5c00:0d1e }
if not found then exit;                                    { 5c00:0d31 }
ShowTimedBottomMessage('The air clears a little...');      { 5c00:0d49 }
for k := 1 to 4 do                                         { 5c00:0d4e }
  if a^.active[k] <> 0 then begin                          { 5c00:0d57 }
    x := a^.x + g_2736[CloudSquareDir[k]];                 { 5c00:0d6b }
    y := a^.y + g_273F[CloudSquareDir[k]];                 { 5c00:0d8e }
    body := false;                                         { 5c00:0db1 }
    for i := 1 to BodyCount do                             { 5c00:0db5 }
      if (BodyList[i].char <> nil) and (BodyList[i].x = x) and (BodyList[i].y = y) then body := true;   { 5c00:0dca }
    if body then cm_Map^[7 + y*50 + x] := $1F              { 5c00:0e24 }
    else cm_Map^[7 + y*50 + x] := a^.ground[k];            { 5c00:0e4a }
  end;
p := sc_List;                                       { 5c00:0e7e  unlink a }
if p = a then sc_List := a^.next                    { 5c00:0e8b }
else begin
  while p^.next <> a do p := p^.next;                      { 5c00:0eaf }
end;
p^.next := a^.next;                                        { 5c00:0ed7  (no-op when a was the head) }
FreeMem(a, $13);                                           { 5c00:0ef7 }
p := sc_List;                                       { 5c00:0efc }
while p <> nil do begin                                    { 5c00:0f09 }
  for k := 1 to 4 do                                       { 5c00:0f14 }
    if p^.active[k] <> 0 then                              { 5c00:0f1d }
      cm_Map^[7 + (p^.y + g_273F[CloudSquareDir[k]])*50 + p^.x + g_2736[CloudSquareDir[k]]] := $1E;   { 5c00:0f2e }
  p := p^.next;                                            { 5c00:0f88 }
end;
```

### 5C00:0FAC AvoidRangedAttack (M)
`procedure AvoidRangedAttack(c [BP+8]: PChar; chance [BP+6]: Byte)` — RETF 6. Callers: EffMagicWeaponOnly, EffAvoidMissiles60, EffAvoidBoulders.
When the attacker (SelectedChar) has a weapon readied and is not adjacent (distance > 1), `c` avoids the attack with `chance` %.
```pascal
if SelectedChar^.readied[0] <> nil then                    { 5c00:0fb2 }
  if TargetDistance(SelectedChar, c) > 1 then              { 5c00:0fd0 }
    if Roll(1, 100) <= chance then begin                   { 5c00:0fdf }
      ShowCharacterMessage(c, 'Avoids it', 10, true);      { 5c00:1004 }
      DamageAmount := 0;                                   { 5c00:1009 }
      AttackRollValue := -1;                               { 5c00:100e }
      SlotHits := SlotHits - 1;                            { 5c00:1013  g_6823 }
    end;
```

### 5C00:101D CurrentAttackItem (M)
`function CurrentAttackItem(c [BP+6]: PChar): PItem` — RETF 4. Callers: EffMagicWeaponOnly, EffHalveWeapon, EffNeedSilverOrMagic, EffHalveEdged, EffHalveMagicWeapon, EffNeedMagicWeapon, EffNeedMagicSilverHalf.
The item that delivers c's attack: the ammunition when the readied weapon fires missiles and ammo is present, else the readied weapon; nil without a weapon.
```pascal
p := nil;                                                  { 5c00:1023 }
if c^.readied[0] <> nil then begin                         { 5c00:102b }
  ok := GetMissileAmmo(c, p);                              { 5c00:1045 }
  if (not ok) or (p = nil) then p := c^.readied[0];        { 5c00:104d }
end;
CurrentAttackItem := p;                                    { 5c00:106e }
```

### 5C00:1086 EffMagicWeaponOnly (L)
Type 29h — event 05h. A ranged attack (distance > 1) with a non-magical item (`plus = 0`) is always avoided (AvoidRangedAttack 100 %).
```pascal
if CurrentAttackItem(SelectedChar) <> nil then             { 5c00:1092 }
  if CurrentAttackItem(SelectedChar)^.plus = 0 then        { 5c00:10a2 }
    AvoidRangedAttack(c, 100);                             { 5c00:10ba }
```
{ quirk: adjacent attackers are not affected (AvoidRangedAttack's distance test). }

### 5C00:10C1 EffSlow (H)
Type 2Ah — event 12h. Halves attacks/movement.
```pascal
StatValue := StatValue shr 1;                              { 5c00:10c4 }
```

### 5C00:10DE EffWeakness (M)
Type 2Bh — no event (re-added every 60 time units): −1 STR per tick ("is weakened"); at STR 3 the character becomes helpless (effect 1Fh, EffHelpless) once.
```pascal
if AddEffectUnlessCuring(c, $2B, e^.p3, $3C) then          { 5c00:10fa }
  if c^.str > 3 then begin                                 { 5c00:1101 }
    ShowCharacterMessage(c, 'is weakened', 10, true);      { 5c00:1126 }
    c^.str := c^.str - 1;                                  { 5c00:112b }
  end
  else if not HasEffect(c, $1F, p) then                    { 5c00:1142 }
    AddEffect(c, $1F, 0, $FF, 0);                          { 5c00:115d }
```

### 5C00:1168 EffHpDrainTick (L)
Type 2Ch — no event (re-added every 10): 1 damage per tick while hp > 1; at hp ≤ 1 the character becomes helpless (1Fh).
```pascal
if AddEffectUnlessCuring(c, $2C, e^.p3, 10) then           { 5c00:1184 }
  if c^.hp > 1 then begin                                  { 5c00:118b }
    DamageType := 0;                                       { 5c00:1196 }
    DamageCharacter(c, 1, 0, false);                       { 5c00:11aa }
    if game_Mode <> 5 then DrawPartyRoster(SelectedChar);  { 5c00:11af }
  end
  else if not HasEffect(c, $1F, p) then                    { 5c00:11d3 }
    AddEffect(c, $1F, 0, $FF, 0);                          { 5c00:11ee }
```

---

## Effect handlers 2Fh..4Eh

### 5C00:11F9 EffDwarfGiantDefence (M)
Type 2Fh — event 10h (c = target). −4 on the attack roll when the attacker is a large (`size and 7Fh = 2`) humanoid and the name matches `GiantFoeNames[1..8]` (DS:0402..: OGRE, OGRE LEADER, TROLL, FIRE GIANT, HILL GIANT, then 3 non-name byte strings).
```pascal
HookOpponent := cr(c)^.target;                             { 5c00:11ff }
if (SelectedChar^.creature_type = 1) and (SelectedChar^.size and $7F = 2) then   { 5c00:1216 }
  for i := 1 to 8 do                                       { 5c00:1230 }
    if HookOpponent^.name = GiantFoeNames[i] then          { 5c00:1250 }
      AttackRollValue := AttackRollValue - 4;              { 5c00:1257 }
```
{ quirk: the name compared is that of c's own current target (`cr(c)^.target`), not of the attacker SelectedChar (EffGnomeGiantDefence compares SelectedChar); entries 6..8 of the table are not names (table overrun). }

### 5C00:1276 EffGnomeGiantDefence (M)
Type 30h — event 10h. −4 on the attack roll by a humanoid attacker named BUGBEAR or GNOLL (literals 5C00:1268/1270).
```pascal
if SelectedChar^.creature_type = 1 then                    { 5c00:1279 }
  if (SelectedChar^.name = 'BUGBEAR') or (SelectedChar^.name = 'GNOLL') then   { 5c00:1290 }
    AttackRollValue := AttackRollValue - 4;                { 5c00:12a9 }
```

### 5C00:12B2 EffPrayer (M)
Type 31h (area type, range 6 squares) — events 0Ah, 0Ch. +1 to hit and save for the caster's side (`(p3 and 10h) shr 4`), −1 for the other side (AD&D Prayer).
```pascal
side := (e^.p3 and $10) shr 4;                             { 5c00:12b8 }
if c^.side = side then EffPlusOne(c, e, mode)              { 5c00:12e8 }
else begin
  AttackRollValue := AttackRollValue - 1;                  { 5c00:12ed }
  SaveRoll := SaveRoll - 1;                                { 5c00:12f1 }
end;
```

### 5C00:12FB EffSlowHeal (L)
Type 32h — no event (re-added every 3840h = 14 400 time units): heals 1 HP per tick.
```pascal
if AddEffectUnlessCuring(c, $32, e^.p3, $3840) then        { 5c00:1314 }
  if HealCharacter(c, 1, true) then ShowHealingResult(c);  { 5c00:1327 }
```

### 5C00:133F EffHelpless (M)
Types 1Fh, 33h, 34h, 35h — event 07h. `ClearCombatantActionFlags(c)` (result ignored: the conditional jump at 5c00:134f goes to the next instruction). 34h is "is Paralyzed" (ParalyzeOpponent), 1Fh is set by EffWeakness/EffHpDrainTick.
```pascal
ClearCombatantActionFlags(c);                              { 5c00:1348 }
```

### 5C00:1355 EffNop36 (H)
Type 36h — empty body.  { 5c00:1355 }

### 5C00:135C EffNop37 (H)
Type 37h (Poisoned, added by PoisonOpponent; tested by EffSlowPoisonEnd) — empty body.  { 5c00:135c }

### 5C00:1363 EffGrantInvisible (L)
Type 38h — events 08h, 13h. Each round: invisibility (19h) for 1 time unit.
```pascal
AddEffect(c, $19, 1, $0C, 0);                              { 5c00:1379 }
```

### 5C00:1399 EffMummyRot (M)
Type 39h — no event (re-added every 43 200 = A8C0h). "Rots...": CHA −2 (but not below 3); `p3 shr 4` counts the remaining ticks; at the last one the character "Dies rots away" (status 8 Gone).
```pascal
if cure_InProgress <> 0 then exit;                         { 5c00:139f }
ShowCharacterMessage(c, 'Rots...', 10, true);              { 5c00:13c4 }
if c^.cha > 2 then c^.cha := c^.cha - 2 else c^.cha := 0;  { 5c00:13c9 }
if c^.cha < 3 then c^.cha := 3;                            { 5c00:13e5 }
if (e^.p3 shr 4) > 1 then begin                            { 5c00:13f7 }
  e^.p3 := e^.p3 - $10;                                    { 5c00:1409 }
  AddEffectUnlessCuring(c, $39, e^.p3, $A8C0);             { 5c00:1427 }
end else
  ApplyFatalStatus(c, 8, 'Dies rots away');                { 5c00:1449  8 = Gone }
```

### 5C00:1452 EffHeld (M)
Type 3Ah — event 12h. No movement: `moveLeft := 0`, and while the stat being recalculated is movement, StatValue := 0. Set on the victim by EffStirgeAttach / EffGrab ("is held fast").
```pascal
cr(c)^.moveLeft := 0;                                      { 5c00:1455 }
if StatKind <> 0 then StatValue := 0;                      { 5c00:1462 }
```

### 5C00:1472 EffBecome62 (L)
Type 3Bh — no event (removed): adds the permanent effect 62h (meaning: part B).
```pascal
AddEffect(c, $62, 0, $FF, 0);                              { 5c00:1487 }
```

### 5C00:1490 EffFireResistance (M)
Type 3Dh — events 06h, 0Ch. Fire: −2 per damage die (but at least 1 per die), +4 save, and non-magical fire (DamageType without bit 3) does no damage at all.
```pascal
if DamageType and 1 <> 0 then begin                        { 5c00:1496 }
  for i := 1 to LastDiceCount do begin                     { 5c00:14a5 }
    DamageAmount := DamageAmount - 2;                      { 5c00:14b4 }
    if DamageAmount < LastDiceCount then DamageAmount := LastDiceCount;   { 5c00:14b9  unsigned }
  end;
  SaveRoll := SaveRoll + 4;                                { 5c00:14d0 }
  if DamageType and 8 = 0 then CancelDamageAndEffect(0);   { 5c00:14d5 }
end;
```

### 5C00:14EB EffRegenerate (M)
Type 3Eh (given by EffHardier at CON 20) — no event (re-added every 60): heals 1 HP per tick.
```pascal
if AddEffectUnlessCuring(c, $3E, e^.p3, $3C) then          { 5c00:1504 }
  if HealCharacter(c, 1, true) then ShowHealingResult(c);  { 5c00:1517 }
```

### 5C00:1545 PoisonOpponent (M)
`procedure PoisonOpponent(c [BP+8]: PChar; bonus [BP+6]: ShortInt)` — RETF 6. Callers: EffPoisonHit, EffPoisonHitP4, EffPoisonHitP2, EffPoisonHitM2.
The target of c's attack saves vs poison (save type 0) with `bonus`, or is poisoned and killed.
```pascal
HookOpponent := cr(c)^.target;                             { 5c00:154b }
if not SavingThrow(HookOpponent, 0, bonus) then begin      { 5c00:1571 }
  ShowCharacterMessage(HookOpponent, 'is Poisoned', 10, false);   { 5c00:1597 }
  MessageDelay;                                            { 5c00:159c }
  AddEffect(HookOpponent, $37, 0, $FF, 0);                 { 5c00:15b5 }
  ApplyFatalStatus(HookOpponent, 6, 'is killed');          { 5c00:15d5 }
end;
```

### 5C00:15EB ParalyzeOpponent (M)
`procedure ParalyzeOpponent(c [BP+0Ah]: PChar; duration [BP+8]: Word; bonus [BP+6]: ShortInt)` — RETF 8. Callers: EffParalyzeHit2d8, EffGhoulParalysis, EffParalyzeHitLong.
```pascal
HookOpponent := cr(c)^.target;                             { 5c00:15f1 }
if not SavingThrow(HookOpponent, 0, 0) then begin          { 5c00:1616  quirk: bonus is not used (0 pushed) }
  ShowCombatMessageAnimation(HookOpponent, true, 'is Paralyzed');   { 5c00:1639 }
  AddEffect(HookOpponent, $34, duration, $0C, 0);          { 5c00:1652 }
end;
```

### 5C00:165D EffPoisonHit (M)
Type 40h — event 03h (hit with attack slot 2). `PoisonOpponent(c, 0)`.  { 5c00:166a }

### 5C00:1671 EffPoisonHitP4 (M)
Type 41h — event 03h. `PoisonOpponent(c, 4)` (save +4).  { 5c00:167e }

### 5C00:1685 EffPoisonHitP2 (M)
Type 42h — event 03h. `PoisonOpponent(c, 2)`.  { 5c00:1692 }

### 5C00:1699 EffParalyzeHit2d8 (M)
Type 43h — event 03h. `ParalyzeOpponent(c, Roll(2, 8), 0)`.  { 5c00:16a8 Roll, 5c00:16b4 call }

### 5C00:16BB EffGhoulParalysis (M)
Type 44h — events 02h, 03h. Paralysis for 3Fh time units unless the target is an elf (race 2) — the AD&D ghoul touch (elves immune).
```pascal
if cr(c)^.target^.race <> 2 then                           { 5c00:16be }
  ParalyzeOpponent(c, $3F, 0);                             { 5c00:16df }
```

### 5C00:16E6 EffParalyzeHitLong (M)
Type 45h — event 03h. `ParalyzeOpponent(c, Roll(1, 9) + 10, -2)` (bonus −2 unused, see ParalyzeOpponent).  { 5c00:16f5 Roll, 5c00:1704 call }

### 5C00:170B EffPoisonHitM2 (M)
Type 46h — event 03h. `PoisonOpponent(c, -2)` (FEh).  { 5c00:1718 }

### 5C00:171F EffUnattackable (L)
Type 47h — events 01h, 10h. Attacks on c are blocked, −4 on the roll (as EffInvisible without the detect test).
```pascal
AttackBlocked := 1;                                        { 5c00:1722 }
AttackRollValue := AttackRollValue - 4;                    { 5c00:1727 }
```

### 5C00:1730 EffGrantInvisible95 (L)
Type 48h — events 08h, 13h. With 95 % each round invisibility (19h) for 1 time unit.
```pascal
if Roll(1, 100) <= $5F then AddEffect(c, $19, 1, $0C, 0);  { 5c00:1739 / 5c00:1755 }
```

### 5C00:176F EffBloodDrain (M)
Type 4Bh — events 0Dh, 0Fh; also mode 1. The attached blood-sucker `c` (set up by EffStirgeAttach) drains its victim `cb_Char[e^.p3]` 1d4 HP per turn; `e^.duration shr 4` = HP it still wants. It lets go when it or the victim is out of action, when satiated, or when the effect is removed.
```pascal
HookOpponent := cb_Char[e^.p3];                            { 5c00:1775 }
if (mode <> 0) or (c^.active = 0) or (HookOpponent^.active = 0) then begin   { 5c00:1793 }
  RemoveEffect(HookOpponent, $3A, nil);                    { 5c00:17c1  victim no longer held }
  if mode = 0 then begin                                   { 5c00:17c6 }
    e^.callOnRemove := 0;                                  { 5c00:17cc }
    RemoveEffect(c, $4B, e);                               { 5c00:17e3 }
  end;
  if (c^.active <> 0) and (HookOpponent^.active <> 0) then { 5c00:17e8 }
    cr(c)^.turned := 1;                                    { 5c00:17ff  M: flies off (forced to flee) }
end else begin
  ShowCharacterMessage(c, 'Sucks some Blood', 10, true);   { 5c00:182a }
  dmg := RollDice(1, 4);                                   { 5c00:1835 }
  DamageType := 0;                                         { 5c00:183d }
  DamageCharacter(HookOpponent, dmg, 0, false);            { 5c00:1854 }
  ok := ClearCombatantActionFlags(c);                      { 5c00:185f  result unused }
  if (HookOpponent^.active <> 0) and ((e^.duration shr 4) > dmg) then   { 5c00:1867 }
    e^.duration := e^.duration - (dmg shl 4)               { 5c00:1889 }
  else
    RemoveEffect(c, $4B, e);                               { 5c00:18aa }
end;
```
{ quirk: in the satiated/victim-down branch callOnRemove is not cleared, so RemoveEffect calls this handler again in mode 1 (which removes 3Ah from the victim and may set `turned`). }

### 5C00:18B5 EffStirgeAttach (M)
Type 4Ch — event 02h (hit with slot 1). The attacker attaches to its target: effect 4Bh on itself (duration 0CFh → wants 12 HP; p3 = target's combatant index), 3Ah (held) on the target, and the 3Ah handler is run at once.
```pascal
HookOpponent := cr(c)^.target;                             { 5c00:18b8 }
AddEffect(c, $4B, $CF, CombatantIndex(HookOpponent), 1);   { 5c00:18ed }
AddEffect(HookOpponent, $3A, 0, $FF, 0);                   { 5c00:1906 }
CallEffectHandler($3A, HookOpponent, nil, 0);              { 5c00:191f }
```
(Name M: "Sucks some Blood" + 1d4 + 12-HP budget fit the AD&D stirge.)

### 5C00:1935 EffGrab (M)
Type 4Dh — event 02h. If the target's STR is below 19, the attacker holds it: effect 4Ah (EffHold, ov13_3A86) on c with the target's index, 3Ah on the target, "is held fast".
```pascal
HookOpponent := cr(c)^.target;                             { 5c00:193b }
if HookOpponent^.str < 19 then begin                       { 5c00:1952 }
  AddEffect(c, $4A, 0, CombatantIndex(HookOpponent), 1);   { 5c00:197a }
  AddEffect(HookOpponent, $3A, 0, $FF, 0);                 { 5c00:1993 }
  CallEffectHandler($3A, HookOpponent, nil, 0);            { 5c00:19ac }
  ShowCharacterMessage(HookOpponent, 'is held fast', 10, true);   { 5c00:19ce }
end;
```

### 5C00:19D9 EffReviveCheck (L)
Type 4Eh — no event (re-added with duration 1 on every expiry): tries `ReviveCombatant(c, c^.hp)`; while that fails, keeps checking (troll-like regeneration back to life, L).
```pascal
if not ReviveCombatant(c, c^.hp) then                      { 5c00:19ee }
  ok := AddEffectUnlessCuring(c, $4E, e^.p3, 1);           { 5c00:1a0d  result unused }
```
