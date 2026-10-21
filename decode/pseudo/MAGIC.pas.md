# MAGIC — temples, spell lists, casting, spell effects (FINAL pseudocode, lane por-mod-magic)

Units (herdr/assignments/por-areas.md): ov04, ov08, ov15, ov22. The codex draft `MAGIC.draft.md` was used as a checklist only; sources are `decode/listings/<unit>.lst` (evidence) and `.c`.
Conventions as in VIEW.pas.md: **Pascal-order signatures** (first parameter = highest BP offset; Ghidra's `param_n` list is reversed), `{ seg:off }` = first instruction of the statement or the call implementing it, names from ecl/view/rt name files, data structures from `decode/data/SAVES.md` (TChar fields by name, e.g. `c^.hp` = +11Bh), routines of other lanes by their current names or `ovNN_XXXX` with a behaviour note. `Roll(count, sides)` = 9800:0DE3. `SelectedChar` g_5D92, `PartyHead` g_5D96.

Effect list helpers (ov24, COMBAT lane): `HasEffect(c, type, var e)` = 00BA:2199 (finds an effect of `type` in `c^.effects`), `RemoveEffect(c, type, entry)` = RemoveEffect 9800:0026 (entry nil → first effect of `type`; calls the effect's undo routine CallEffectHandler when entry+4 ≠ 0; unlinks and frees the 9-byte record), `AddEffect` = AddEffect.

---

## ov04 (3400) — temple

Service names: `DS:00F1 + k*29h` (k = 1..10): Cure Blindness, Cure Disease, Cure Light Wounds, Cure Serious Wounds, Cure Critical Wounds, Neutralize Poison, Raise Dead, Remove Curse, Stone to Flesh, Exit (image strings, H). Disease effect types: `g_0114..g_0119` = 1Fh, 22h, 2Bh, 2Ch, 32h, 39h (image). `g_681F` = "cure in progress" flag set around RemoveEffect calls (M: suppresses messages in the undo routines).

### 3400:0013 ConfirmNeedless (H) — see **B-1**
`function ConfirmNeedless(msg: string [BP+6]): Char` — show `SelectedChar^.name + ' ' + msg` (ShowCharacterMessage, ENGINE message) `{ 3400:0042 }`; `AskYesNo('cast cure anyway: ', $0D, $0A, $0F)` `{ 3400:0060 }`; ClearCharacterMessage (clear message) `{ 3400:0068 }`. Used when the target does not have the condition ("is not blind." …).

### 3400:00BF PayForCure (H) — see **B-2**
`function PayForCure(service [BP+8]: string; price [BP+6]: Word): Char` — service = far string at `[BP+8]` (`LES DI,[BP+8]` 3400:00C6), price = word `[BP+6]`; callers push the string first (fix #verify-1)
```pascal
msg := service + ' will only cost ' + Str(price) + ' gold pieces.';      { 3400:00fe }
ShowText(msg, …);                                                     { 3400:0139  DrawWrappedText (text box rows 11h..16h, cols 1..26h) }
answer := AskYesNo('pay for cure ', $0D, $0F, $0A);                   { 3400:0157 }
if answer = 'Y' then begin
  gold := CharGoldValue(SelectedChar);                                { 3400:0172  MoneyInGold }
  if gold >= price then SetCharGoldValue(gold - price)               { 3400:018f  SetCharMoneyGold }
  else begin
    pool := PoolGoldValue(TreasureMoney);                             { 3400:019b  MoneyValueInGold (money on the temple floor) }
    if (pool < $10000) and (pool < price) then begin ShowError('Not enough money.'); answer := 'N' end   { 3400:01e3 }
    else SetPoolGoldValue(pool - price);                              { 3400:01cc  SetPoolMoneyGold }
  end;
end;
if answer = 'Y' then begin ClearText; ShowCharMessage(SelectedChar, 'is cured.') end;   { 3400:01f4 / 0217 }
PayForCure := answer;
```
(Money routines of ov19/ov21 belong to PARTY; behaviour names here are M.)

### 3400:0249 CureBlindness (H)
`if not HasEffect(SelectedChar, $21, e) then ok := ConfirmNeedless('is not blind.')` `{ 3400:026a / 0284 }`; if ok: `PayForCure('Cure Blindness', 1000)` `{ 3400:02a7 }` and on 'Y' `RemoveEffect(SelectedChar, $21, nil)` `{ 3400:02c6 }`. Effect 21h = blindness (H).
### 3400:02ED CureDisease (H)
Needless unless one of the six disease effects (`g_0114..0119`) is present `{ 3400:0328 / 0355 }`; price 1000 `{ 3400:0378 }`; on 'Y': `g_681F := 1`, RemoveEffect for each of the six types `{ 3400:03b1 }`, `g_681F := 0`.
### 3400:0401 CureWounds (H)
`procedure CureWounds(kind [BP+6]: Byte)` — 1: 'Cure Light Wounds' price 100, heal Roll(1,8) `{ 3400:0422 / 0434 / 044b }`; 2: 'Cure Serious Wounds' price 350, heal Roll(2,8)+1 `{ 3400:046e / 0480 / 049a }`; 3: 'Cure Critical Wounds' price 600, heal Roll(3,8)+3 `{ 3400:04bc / 04ce / 04ea }`; healing via `HealCharacter(SelectedChar, amount, 0)` (COMBAT lane: add hit points up to the maximum, M).
### 3400:0510 RaiseDead (H) — see **B-3**
```pascal
c := SelectedChar; dead := c^.status in [6 {Dead}, 1 {Animated}];       { 3400:0539 / 0545 }
if not dead then ok := ConfirmNeedless('is not dead.');               { 3400:056a }
if ok and (PayForCure('Raise Dead', 5500) = 'Y') and dead then begin   { 3400:0590 }
  g_681F := 1; RemoveEffect(c, $20, nil); RemoveEffect(c, $37, nil); g_681F := 0;   { 3400:05c1 / 05d7 }
  c^.hp := 1;  c^.status := 0;  c^.active := 1;
  if c^.con > 0 then c^.con := c^.con - 1;
  rebuild hp_max from hp_rolled and the new CON (see SAVES.md +B1h; same formula as EffHardier "is hardier") { 3400:05dc .. 072d }
end;
```
### 3400:0751 NeutralizePoison (H)
Needless unless effect 37h (poison) `{ 3400:0777 / 079d }`; price 1000 `{ 3400:07c0 }`; on 'Y': RemoveEffect 37h, 16h, 0Fh `{ 3400:07e4 / 07fa / 0810 }` (with g_681F).
### 3400:083A RemoveCurseService (H)
Needless unless an item of SelectedChar has `+36h <> 0` (item `cursed`, SAVES.md) or effect 24h is present `{ 3400:08a8 / 08c2 }`; price 3500 `{ 3400:08e5 }`; on 'Y': `g_6C95 := SelectedChar` (spell target), `CastRemoveCurse` (Spell_RemoveCurse) `{ 3400:0901 }`.
### 3400:0928 StoneToFlesh (H)
Needless unless `status = 7` (Stoned) `{ 3400:093d / 0956 }`; price 2000 `{ 3400:0979 }`; on 'Y' and still stoned `{ 3400:098b }`: `status := 0; active := 1; hp := 1`.
### 3400:09D7 HealMenu (H) — see **B-4**
```pascal
NewMenuList(list, 10);  item k := service name k (DS:00F1 + k*29h), isHeader 0;   { 3400:09fb }
ClearTextRectangle(0, 24, 39, 24)  { 3400:0a6e }; draw two frame boxes { 3400:0a98 / 0abe };
repeat
  DrawText(1, 1, $0F, SelectedChar^.name + ', how can we help you?');  { 3400:0afa }
  key := VerticalListMenu('', 'Heal Exit', $0D, $0A, $0F, 2, 4, $26, $0F, list, false, redraw, idx, item);   { 3400:0b70 }
  if key in ['H', #13] then case idx of
    0: CureBlindness;                                                   { 3400:0b8c }
    1: CureDisease;                                                     { 3400:0b97 }
    2: CureWounds(1);                                                   { 3400:0ba5 }
    3: CureWounds(2);                                                   { 3400:0bb3 }
    4: CureWounds(3);                                                   { 3400:0bc1 }
    5: NeutralizePoison; 6: RaiseDead; 7: RemoveCurse; 8: StoneToFlesh; 9: done := true;   { 3400:0bcc .. 0bed }
  end else if key = #0 then done := true;
until done;
FreeMenuList(list) { 3400:0c13 }; restore screen { 3400:0c24 / 0c29 / 0c36 }.
```
### 3400:0D09 Temple (H) — stub ov04 e1 (ECL COMBAT opcode with the temple flag, ECL_VM.md) — see **B-5**
```pascal
g_49F3 := 1;  redraw party { 3400:0d14 / 0d21 };  FillChar(TreasureMoney, $1C, 0);  g_6DC0 := 0;   { 3400:0d32 }
repeat
  PoolStatus(hasMoney, hasItems);                                      { 3400:0d4a  TreasurePoolStatus }
  if hasMoney then opts := 'Heal View Take Pool Share Appraise Exit' else opts := 'Heal View Pool Appraise Exit';
  key := HorizontalMenu('', opts, $0D, $0A, $0F, true, false, ext);    { 3400:0da5 }
  case key of
    'H': if not ext then HealMenu;                                     { 3400:0dbb }
    'V': ViewCharacter;                                                { 3400:0dca  ViewMenu }
    'T': TakeMoney;                                                    { 3400:0dd6  TakeMoney }
    'P': if not ext then PoolMoney;                                    { 3400:0de8  PoolMoney }
    'S': ShareMoney;                                                   { 3400:0df4  ShareMoney }
    'A': Appraise(changed);                                            { 3400:0e05  AppraiseGems }
    'E': begin PoolStatus(hasMoney, hasItems);                         { 3400:0e1e }
           if not hasMoney then done := true
           else begin
             ShowText('As you leave a priest says, "Excuse me but you have left some money here" ');   { 3400:0e60 }
             ShowText('Do you want to go back and retrieve your money?');                              { 3400:0e86 }
             if MenuSelect('', '~Yes ~No', …) = 1 then done := true else clear box;                   { 3400:0eae / 0ece }
           end end;
    'G', 'O': SelectCharacterByKey(key);                               { 3400:0ee3 / 0ef2  Home/End }
  end;
  if key in ['B', 'T'] or ((key = 'A') and changed) then RedrawCurrentMode;   { 3400:0f02 / 0f13 }
  DrawPartyRoster(SelectedChar);                                         { 3400:0f20 }
until done;
```
Note: answering "Yes" to "go back and retrieve your money?" leaves the temple (MenuSelect returns 1 = second option? — the code tests `= 1`; ECL lane's MenuSelect returns the 0-based index, so 1 = "No"… L: wording vs. index).
### 3400:0F32 ov04_init — empty.

---

## ov08 (4800) — combat round loop and the player's turn menu

(Assigned to MAGIC by the provisional area map; it is the combat main loop. COMBAT should link here.) Combatant record `cs := c^.combatant` (TChar +108h, 16h bytes, zero-filled by InitPartyCombatants 5200:12E1), fields used here: +0 `castSpell` (spell queued for the start of the next turn), +1 `mayCast`, +3 `initiative` (> 0 = still to act this round; 14h = "Quick for all" marker), +6 `moveLeft` (half-squares), +7, +9 `facing`, +0Ah `target` (far ptr), +0Eh `dyingTurns`, +0Fh, +11h `turned`, +12h, +13h `extra` (not a regular party member). `g_6814` / `g_6815` = number of living combatants on side 0 / side 1 (M), `g_6E30` = "Magic On" (show spell effects), `g_6E31` = extended-key flag of the combat menus, `g_49E2` = game speed (0..9).

### 4800:0000 EndCombat (H)
Free the stinking-cloud list `sc_List{g_6DBB}` (13h-byte nodes linked at +4, see 8E00:1B11) `{ 4800:002d }`, free `cm_Map` (4E9h) `{ 4800:004d }`, free picture `g_6E36` `{ 4800:005f }`, `PaletteFlashOff` `{ 4800:0064 }`, `SpellHandlers[0] := 0096:0034` (= SelectTargetsCamp 8E00:0A91 via its stub; restores the camp target selector, H).
### 4800:007A CombatMain (H) — stub ov08 e1 (ECL COMBAT opcode)
```pascal
g_49F3 := 5;  SpellHandlers[0] := 0068:0066;   { combat target selector, ov13 stub e14 (COMBAT lane) }
StartCombat;                                                    { 4800:0092  5200:1E31 }
over := (g_6814 = 0) or (g_6815 = 0);
while not over do begin
  CountActiveSides;                                                { 4800:00b3  redraw combat status (ENGINE) }
  for c in party do StartCombatRound(c);                               { 4800:00d3  start-of-round setup per combatant (COMBAT lane) }
  ecl_Mem6B00^.w[$596] := 0;
  c := NextToAct;                                               { 4800:00fe }
  while c <> nil do begin TakeTurn(c); c := NextToAct end;      { 4800:0110 / 0119 }
  EndOfRound(over);                                             { 4800:0124 }
end;
EndCombat;                                                      { 4800:012a }
```
### 4800:0131 NextToAct (H) — see **B-6**
`procedure NextToAct(var who: ^TChar [BP+6])` — the party/monster member with the highest `cs^.initiative` > 0; ties broken by a fresh Roll(1,100) per candidate (higher roll wins) `{ 4800:015d }`; nil if nobody has initiative left.
### 4800:01F6 TakeTurn (H)
`procedure TakeTurn(c: ^TChar [BP+6])`
```pascal
cs^.f0F := 0; cs^.f12 := 0; cs^.f07 := 0;  CallEffectHooks(7, c);    { 4800:022c  effect hook 7 (start of turn, COMBAT lane) }
if cs^.initiative > 0 then begin
  if cs^.initiative = $14 then cs^.initiative := $13;
  SelectedChar := c;  FocusCombatant(c, 2, true);               { 4800:0278 }
  Recalc(c);  DrawCharacterSummary(c);  CallEffectHooks($0F, c);       { 4800:0283 / 028e / 029c }
  if cs^.initiative > 0 then
    if c^.controlled = 0 then PlayerTurn(c)                     { 4800:02cf }
    else AiCombatTurn(c);                                          { 4800:02c1  computer-controlled turn (COMBAT lane) }
  RedrawSquare(CombatantCol(c), CombatantRow(c));               { 4800:02ea }
end;
```
### 4800:031A PlayerTurn (H) — see **B-8**
`procedure PlayerTurn(c: ^TChar [BP+6])`
```pascal
if c^.active = 0 then ClearCombatantActionFlags(c)                          { 4800:0370  end turn (ENGINE: clears initiative, M) }
else if cs^.castSpell <> 0 then begin                           { a spell chosen last turn is cast now }
  s := cs^.castSpell; cs^.castSpell := 0;
  CastSpell(s, 0, 1, done);                                     { 4800:0365  CastSpell }
  ClearCombatantActionFlags(c);
end else begin
  done := false;
  repeat
    CombatMenu(c, key);                                         { 4800:0394 }
    case key of
      'M': MoveAttack(c, done);                                 { 4800:03aa }
      'V': begin ViewCharacter(done); CalcAttacks(c); if not done then DrawCombatLayout end;   { 4800:03b9 / 03c4 / 03cf }
      'A': SelectTarget(c, $FF, 1, 0, done, tgt);                { 4800:03f4  Aim (COMBAT) }
      'U': begin UseItem(done); CalcAttacks(c); if not done then DrawCombatLayout end;          { 4800:0405 .. 041b }
      'C': BeginCast(0, 0, done);                                { 4800:0432  Cast (COMBAT/MAGIC: chooses and casts) }
      'T': begin TurnUndead(c); done := ClearCombatantActionFlags(c) end;    { 4800:0444 / 044f  Turn undead }
      'Q': begin SetQuick(c); ClearMenuLine; FUN_0899_0104; Delay(200); done := true; AiCombatTurn(c) end;   { 4800:0465 .. 0485 }
      'D': DoneMenu(c, done);                                   { 4800:049d }
      #$32 {Alt-M}: begin g_6E30 := not g_6E30;                 { "Magic On" / "Magic Off" }
                    if g_6E30 then ShowError('Magic On') else ShowError('Magic Off') end;   { 4800:04ca / 04e0 }
      ' ': for p in party do if p^.npc_morale < $80 then p^.controlled := 0;   { space: take back control of all PCs }
      #$10 {Alt-Q}: begin cs^.initiative := $14; for p in party do SetQuick(p);   { 4800:055a  quick for everyone }
                    ClearMenuLine; Delay(200); done := true end;                 { 4800:0572 / 057b }
      #$2D {Alt-X}: if GodsIntervene then begin FocusCombatant(c, 3, false); done := true end   { 4800:058a / 059f }
                    else ShowError('That doesn''t work');                                   { 4800:05b9 }
    end;
    if not done then begin FocusCombatant(c, 2, true); DrawCharacterSummary(c) end;   { 4800:05d0 / 05db }
  until done;
end;
```
### 4800:0666 CombatMenu (H) — see **B-7**
`procedure CombatMenu(c: ^TChar [BP+0Ah]; var key: Char [BP+6])` — `CallEffectHooks($0F, c)` `{ 4800:0676 }`; options: `Move ` (if `cs^.moveLeft <> 0`), `View Aim `, `Use ` (if `c^.item_count <> 0`), `Cast ` (if any memorised spell, `cs^.mayCast <> 0` and `ecl_Mem4900^.w[$1CA] = 0`), `Turn ` (if cleric level > 0 and not yet turned this combat, `cs^.turned = 0`), `Quick Done`; repeat `key := HorizontalMenu('', opts, $0D, $0A, $0F, true, false, ext)` `{ 4800:0814 }`; extended keys other than 10h, 13h, 2Dh, 32h are discarded `{ 4800:0831 }` — until key in [10h, 13h, ' ', '-', '2', 'A','C','D','M','Q','T','U','V'] (set CS:0646) `{ 4800:084b }`.
### 4800:0880 EndOfRound (H)
`procedure EndOfRound(var over: Boolean [BP+6])`
```pascal
AdvanceClock(1, 1);  g_6DE3 := g_6DE3 + 1;  CalcEnemyHpPct;                    { 4800:088c / 0895 }
for c in party do begin
  CallEffectHooks($13, c);  StinkingCloudCheck(c);                                    { 4800:08bc / 08c7  end-of-round effects }
  if c^.status = 5 {Dying} then begin Inc(cs^.dyingTurns); if cs^.dyingTurns > 9 then c^.status := 6 {Dead} end;
end;
if AnyoneDying(false) then ShowError('Your Teammate is Dying');          { 4800:0917 / 092d }
CountActiveSides;  FocusSquare(origin+3, origin+3, $FF, 8);                  { 4800:0932 / 0957 }
if (g_6814 = 0) or (g_6815 = 0) then over := true;
if (g_6814 <> 0) and (g_6815 = 0) and (g_49F4 = 0) then
  if AskYesNo('Continue Battle:', …) = 'Y' then over := false;           { 4800:099e }
```
### 4800:09DF MoveAttack (H) — see **B-9**
`procedure MoveAttack(c: ^TChar [BP+0Ah]; var done: Boolean [BP+6])` — remembers `moveLeft`, `facing`, the position; loop while `moveLeft > 1` and the key is not #0/#13:
```pascal
ClearTextLine(24)  { 4800:0a5f };  prompt := 'Move/Attack, Move Left = ' + Str(cs^.moveLeft shr 1) + ' ';   { 4800:0a8b }
key := HorizontalMenu(prompt, '', $0A, $0A, $0F, true, false, g_6E31);    { 4800:0ac3 }
if key = #0 then begin                                                   { Esc: undo the move }
  cs^.moveLeft := saved; RestoreTerrain(0, 0, CombatantIndex(c))  { 4800:0af6 };
  done := not PlaceCombatant(c, savedCol, savedRow, false)  { 4800:0b0c }; FocusSquare(CombatantCol(c), CombatantRow(c), 0, 8) { 4800:0b3c }; cs^.facing := savedFacing;
end else dir := scan code → direction: 48h→0, 49h→1, 4Dh→2, 51h→3, 50h→4, 4Fh→5, 4Bh→6, 47h→7 (keypad incl. diagonals), else 8;
if dir < 8 then begin
  ShowCombatant(c, dir, 0, false)  { 4800:0bc3 };  ProbeMove(c, dir, occ, tile)  { 4800:0bdc };
  if occ <> 0 then AttackTarget(c, cb_Char[occ], done)                   { 4800:0c06 }
  else if tile = 0 then begin                                            { off the battlefield }
    case AskYesNo('Flee:', …) of 'Y': done := Flee(c); 'N': done := false end   { 4800:0c2a / 0c39 }
  end else if cs^.moveLeft < CombatTerrain[tile].cost then ShowError('Blocked')       { 4800:0c80 }
  else begin
    AttacksOfOpportunity(c, dir)  { 4800:0c92  attacks of opportunity (COMBAT, M) };
    if c^.active = 0 then done := ClearCombatantActionFlags(c)
    else begin StepCombatant(c, dir)  { 4800:0cbf  do the step };
      if c^.active = 0 then done := ClearCombatantActionFlags(c);
      StinkingCloudCheck(c)  { 4800:0ce6 }; if IsHelpless(c) then done := ClearCombatantActionFlags(c) end;   { 4800:0cf1 / 0d00 }
  end;
end;
```
finally `if moveLeft < 2 then moveLeft := 0`.
### 4800:0D45 AttackTarget (H)
`procedure AttackTarget(c: ^TChar [BP+0Eh]; target: ^TChar [BP+0Ah]; var done: Boolean [BP+6])` — if the readied weapon is a missile weapon (WeaponIsRanged) without usable ammunition (FUN_00BA_2E46 false): `ShowError('Not with that weapon')` `{ 4800:0d78 }`; else if `ConfirmAttackAlly(c, target)` (ConfirmAttackAlly, confirm "Attack Ally", COMBAT) `{ 4800:0d8b }`: `cs^.target := target`; `if FighterSweep(c, target)` (FighterSweep, sweep attack) `{ 4800:0db6 }` then done := true else `FaceAttacker(c, target); Attack(c, target, 0, nil, done)` (FaceAttacker, Attack) `{ 4800:0dd4 / 0df3 }` (melee attack, COMBAT).
### 4800:0E45 DoneMenu (H) — see **B-10**
`procedure DoneMenu(c: ^TChar [BP+0Ah]; var done: Boolean [BP+6])` — options: `Guard ` (unless holding a missile weapon without ammo), `Delay Quit `, `Bandage ` (if someone is dying, `AnyoneDying(false)`), `Speed Exit`; loop until key in [#0, 'E'] or done `{ 4800:0f2d }`: 'G' → `done := SetGuarding(c)` (guard) `{ 4800:0f80 }`; 'D' → `cs^.initiative := 1; done := true` (delay to the end of the round); 'Q' → `done := ClearCombatantActionFlags(c)` (quit = end turn) `{ 4800:0fb1 }`; 'B' → `AnyoneDying(true); done := ClearCombatantActionFlags(c)` `{ 4800:0fc6 / 0fd5 }`; 'S' → GameSpeedMenu `{ 4800:0fe7 }`.
### 4800:0FFF AnyoneDying (H)
`function AnyoneDying(bandage [BP+6]: Boolean): Boolean` — true if a regular party member (`cs^.extra = 0`, side 0) has status 5 (Dying); with `bandage`, the first such member gets `status := 4` (Unconscious), `dyingTurns := 0` and the message "is bandaged" `{ 4800:1081 }` (one per call).
### 4800:10F6 GameSpeedMenu (H) — see **B-11**
Prompt `'GameSpeed (' + Str(g_49E2) + ') : '`, options `Slower ` (if < 9), `Faster ` (if > 0), `Exit` `{ 4800:112e / 1207 }`; 'S' → `g_49E2 + 1`, 'F' → `g_49E2 − 1`; until key in [#0, 'E'] (set CS:10AF). Higher value = slower (delay factor, M).
### 4800:122B SetQuick (H)
`procedure SetQuick(c: ^TChar [BP+6])` — `c^.controlled := 1`; if the combatant's target is on its own side, clear the target `{ 4800:122b }`.
### 4800:127A ov08_init — empty.

---

## ov15 (6B00) — camp: rest, memorize, scribe, effects display, party options

Menus (DS strings, image): camp `g_0508` = 'Save View Magic Rest Alter Exit', magic `g_0531` = 'Cast Memorize Scribe Display Rest Exit', alter `g_055A` = 'Order Drop Speed Icon Pics Exit', party order `g_0584` = 'Select Exit' / `g_05AD` = 'Place Exit'. All loops end on Esc (#0) or 'E' (sets at CS:1E3B/13D1/1720/1BF0/1A77 = [#0,'E']). `SpellList(listMode, menuKind: Byte; var idx: Integer; var found: Boolean)` = SpellList SpellList 7F00:299C (listMode → BuildSpellList, menuKind → ChooseSpell) (PARTY lane; builds the list with BuildSpellList mode `listMode`: 0 memorised, 1 spell book, 3 scrolls, 5 pending memorisation, 6 pending scribing — M). Spell table and names: §Spell table below.
**TChar +2Ch resolved:** `rest_need` — 0 nothing to learn, 4 something pending, 6 something of spell level ≥ 3 pending (RestTimeNeeded, H). SAVES.md listed it as unk_2C.

### 6B00:0000 RestTimeNeeded (H)
`function RestTimeNeeded(c: ^TChar [BP+6]): Word` — sums the levels (`g_31FB[id*16]`) of all pending memorisations (mem_spell ≥ 80h) and of all pending scribings (scroll power bytes +3Ch..+3Eh ≥ 80h on items for which IsScroll (IsScroll) is true `{ 6b00:008a }`), and the highest such level of each: `c^.rest_need := 0 / 4 (any) / 6 (highest > 2)`; result (minutes) = `rest_need*60 + 15*levels_mem + 15*levels_scribe` `{ 6b00:0000 .. 0156 }`.
### 6B00:0159 CancelMemorizing (H) — clears every mem_spell slot ≥ 80h and `rest_need := 0`.
### 6B00:019C CancelScribing (H) — clears bit 7 of the power bytes of every scroll (IsScroll `{ 6b00:01c3 }`).
### 6B00:0214 CancelAllStudy (H) — for each party member: CancelMemorizing, CancelScribing `{ 6b00:0236 / 0240 }`.
### 6B00:025C FreeSlots (H) — see **B-16**
`function FreeSlots(lvl [BP+8], cls [BP+6]: ShortInt): Integer` = `SelectedChar^.spell_slots[cls*3 + lvl − 1]` − number of mem_spell entries (any state) whose spell has class cls and level lvl `{ 6b00:025c }`.
### 6B00:036C CanUseMagic (H)
`function CanUseMagic(what [BP+6]: Byte): Boolean` — what = 1 cast, 2 memorize, 3 scribe. If what = 1 and `ecl_Mem4900^.w[$1CA] <> 0`: "cannot cast spells in this area"; else if status = 1 (Animated) or not active: "is in no condition to " + 'cast any spells' / 'memorize spells' / 'scribe any scrolls'; message via ShowCharMessage `{ 6b00:047b }`; result = no message.
### 6B00:04A1 CastMenu (H) — stub ov15 e2 (used by ExploreCommand 'C') — see **B-12**
```pascal
g_6DB5 := 0; g_6DB7 := 0; idx := -1;
while CanUseMagic(1) do begin                                     { 6b00:04bc }
  s := SpellList(0, 1, idx, found);                               { 6b00:04d6 }
  if s = 0 then begin if not found then ShowCharMessage(SelectedChar, 'has no spells memorized') { 6b00:0551 }; break end;
  cast := true;  DrawFrame(…); ClearRectangle(1, $11, $26, $16)  { 6b00:04f7 / 0508  clear text window };
  CastSpell(s, 0, 1, dummy);  idx := -1                           { 6b00:051c  CastSpell }
end;
if cast then RedrawCurrentMode;                                       { 6b00:0565 }
```
### 6B00:05A4 ShowFreeSlots (H)
`function ShowFreeSlots: Boolean` — for cls 0 (cleric), 1 (magic-user) and lvl 1..3: text `Str(FreeSlots(lvl, cls))`, or a single blank (cs:056E = ' ') when the character has no slots of that level `{ 6b00:05da / 05de }`; if any slots: "<name> can memorize:" `{ 6b00:06a4 }`, lines "    Cleric Spells:" / "Magic-User Spells:" with the three counts at columns 20, 23, 26 `{ 6b00:070c / 0752 }`.
### 6B00:077A Rest (H) — see **B-17**
`procedure Rest(var interrupted: Boolean [BP+6])` — `t := max over party of RestTimeNeeded` `{ 6b00:07a1 }`; preset the rest clock `g_6DC8 := t div 60` (hours), `g_6DC6 := (t mod 60) div 10`, `g_6DC4 := t mod 10`; `interrupted := RestLoop` (RestLoop, PARTY lane: time passes, spells learnt, encounters) `{ 6b00:07fd }`; `FillChar(g_6DC2, 0Eh, 0)` `{ 6b00:0814 }`; redraw `{ 6b00:0819 }`.
### 6B00:0824 SortMemorized (H) — exchange sort of SelectedChar's 21 mem_spell bytes by `id and 7Fh` ascending.
### 6B00:090A MemorizeMenu (H)
```pascal
if not CanUseMagic(2) then exit;                                  { 6b00:0914 }
SpellList(5, 0, idx, found);                                      { 6b00:0937  pending list }
if found and (AskYesNo('Memorize These Spells? ', …) = 'N') then CancelMemorizing(SelectedChar)   { 6b00:0961 / 0973 }
else if found then done := true;
while not done do begin
  if not ShowFreeSlots then begin done := true; ShowCharMessage(SelectedChar, 'cannot memorize any spells') end   { 6b00:0991 / 09c1 }
  else begin
    s := SpellList(1, 2, idx, found);                             { 6b00:09d9  from the spell book }
    if s = 0 then done := true
    else if FreeSlots(level(s), class(s)) > 0 then begin          { 6b00:0a12 }
      put s or 80h into the first empty mem_spell slot; SortMemorized   { 6b00:0a4e }
    end;
  end;
end;
if idx <> -1 then if pending list not empty then
  if AskYesNo('Memorize these spells? ', …) = 'N' then CancelMemorizing(SelectedChar);   { 6b00:0a95 / 0aa7 }
if changed then RedrawCurrentMode;
```
### 6B00:0B5B ScribeMenu (H) — see **B-18**
Same structure for scrolls: pending list (mode 6) with 'Scribe These Spells? ' `{ 6b00:0bb2 }`; then `s := SpellList(3, 3, idx, found)` (spells on scrolls) `{ 6b00:0bf1 }`: none → "has no copyable scrolls" `{ 6b00:0c26 }`; already known (`known_spell[s] <> 0`) → "You already know that spell" `{ 6b00:0dca }`; already being scribed (a scroll power byte = s or 80h) → "You are already scibing that spell" (sic) `{ 6b00:0c59 }`; no slot for the spell's class/level (`spell_slots[cls*3+lvl−1] = 0`) → "You can not scribe that spell." `{ 6b00:0cd4 }`; else mark the first scroll byte equal to s with 80h (pending). Final confirmation 'Scribe these spells? ' `{ 6b00:0e13 }`. Scribing completes during Rest (PARTY/ov20).
### 6B00:0E37 AddLine (H) *nested in DisplayEffects* — see **B-15**
`procedure AddLine(text: string[40]; isHeader: Byte)` — appends a TMenuItem to the parent's list tail (`[BP-0Ch]`) `{ 6b00:0e54 }`.
### 6B00:0FBC DisplayEffects (H)
For every party member: a header line with the name, then one line per active effect (TChar +7Fh list): effect types that belong to spells (1, 2, 5, 8..0Eh, 10h, 11h, 13h..19h, 1Ch, 1Dh, 20h..22h, 24h..27h, 29h, 2Ah, 2Dh, 2Eh, 31h, 33h..35h) show the name of the first spell whose table field +0Ah equals the type (`g_3204[id*16]`, name `g_28E9[id*29h]`), unknown → "Funky--" + number; others have fixed texts: 4 'Studying Manual of Bodily Health', 7 'Training with Manual of Bodily Health', 1Bh 'Feather Fall', 1Fh 'Helpless', 23h 'Prayer', 2Ch 'Cause Disease', 32h 'Dreaded Mummy Disease', 36h 'Repulsed', 37h 'Poisoned', 3Bh 'Regenerating', 3Dh 'Fire Resistance', 47h 'Invisible', 48h 'Camouflaged', 59h 'Displaced'; others are not listed. No lines → ' <No Spell Effects>'. Shown with a frame 'Display' and VerticalListMenu `{ 6b00:1366 / 13b6 }`.
### 6B00:13F1 MagicMenu (H) — see **B-13**
`procedure MagicMenu(var done: Boolean [BP+6])` — loop `HorizontalMenu('', 'Cast Memorize Scribe Display Rest Exit', …)` `{ 6b00:1442 }`: C CastMenu `{ 6b00:1470 }`, M MemorizeMenu, S ScribeMenu, D DisplayEffects, R Rest(done) `{ 6b00:149d }`; other keys select a character `{ 6b00:1454 }`.
### 6B00:14A9 MoveSelectedDown (H) / 6B00:1601 MoveSelectedUp (H) — see **B-14**
Relink the PartyHead list: move SelectedChar one place towards the end (wrapping to the front) resp. towards the front (wrapping to the end) — list surgery on TChar +104h.
### 6B00:1780 PartyOrder (H) — see **B-19**
Prompt 'Party Order: ', options 'Select Exit' / 'Place Exit' (toggled by 'S'); in Place mode Home ('G') = MoveSelectedDown, End ('O') = MoveSelectedUp `{ 6b00:1809 / 1813 }`; in Select mode keys select the character; "<name> has been selected" when switching to Place `{ 6b00:1864 }`.
### 6B00:18E5 DropCharacter (H) — see **B-20**
If SelectedChar is the only member: "quit TO DOS: " Yes → RemoveFromParty + halt `{ 6b00:1926 / 1935 / 193a }`; else "<name> will be gone", 'Drop from party? ' `{ 6b00:1981 }`: Yes → message "is dumped in a ditch" (if not active) or "bids you farewell" `{ 6b00:19b6 / 19da }`, RemoveFromParty (RemoveFromParty) `{ 6b00:19e5 }`; No → "Breathes A sigh of relief" `{ 6b00:1a27 }`.
### 6B00:1A97 GameSpeedMenu (H) — see **B-21**
'Game Speed = ' + Str(g_49E2) + ' (0=fastest 9=slowest)' at row 18 `{ 6b00:1ad5 }`; options ' Faster' (if > 0), ' Slower' (if < 9), ' Exit'; 'F' or ↓ (scan 50h) → −1, 'S' or ↑ (scan 48h) → +1 (bounded 0..9) `{ 6b00:1b8c }`.
### 6B00:1C59 AlterMenu (H) — see **B-22**
'Alter: ' + 'Order Drop Speed Icon Pics Exit': O PartyOrder, D DropCharacter, S GameSpeedMenu, I icon editor (IconEditor) `{ 6b00:1cee }`, P → submenu toggling `g_49F6` ('Monsters on/off', monster pictures) and `g_49F5` ('Portraits on/off') `{ 6b00:1dda }`.
### 6B00:1E6F Camp (H) — stub ov15 e1
`procedure Camp(var done: Boolean [BP+6])` (RETF 4) — fix #fable-1 applied (decode/FABLE_CONFIRM.md R08), re-read on ov15.lst 6b00:1e6f..1fd6.
```pascal
saved := game_Mode{g_49F3};  game_Mode := 2;  HealCounter{g_6DD8} := 0;  FillChar(g_6DC2, $0E, 0);   { 6b00:1e75 .. 1e91 }
RedrawCurrentMode;                                                 { 6b00:1e96 }
ClearRectangle(1, $11, $26, $16);                                  { 6b00:1ea7  text window }
DrawText(1, $12, $0A, 'The party makes camp...');                  { 6b00:1ec4 }
CancelAllStudy;                                                    { 6b00:1eca }
done := false;  key := ' ';                                        { 6b00:1ed0 / 1ed4 }
while not done and not (key in [#0, 'E']) do begin                 { 6b00:1ed8 / 1eed  set CS:1E3B = [#0, 'E'] }
  key := HorizontalMenu('Camp: ', CampMenuText{DS:0508 = 'Save View Magic Rest Alter Exit'},
                        $0D, $0A, $0F, 1, 1, ext);                 { 6b00:1f1f  var ext [BP-4] }
  if ext <> 0 then begin                                           { 6b00:1f27  extended key: cycle the selection }
    CycleSelectedChar(key);                                        { 6b00:1f31 }
    DrawPartyRoster(SelectedChar);                                 { 6b00:1f3e }
  end else
    case key of                                                    { plain keys; any other key: nothing }
      'S': begin SaveGame;                                         { 6b00:1f4c }
             if AskYesNo('Quit TO DOS ', $0E, $0A, $0F) = 'Y' then TerminateGame   { 6b00:1f69 / 1f72 }
           end;
      'V': ViewMenu(viewLocal{[BP-3]});                            { 6b00:1f82  var byte local }
      'M': MagicMenu(done);                                        { 6b00:1f93 }
      'R': Rest(done);                                             { 6b00:1fa2 }
      'A': AlterMenu;                                              { 6b00:1fac }
    end;
end;
CancelAllStudy;  sp_CampTarget{g_6DB5} := nil {word 0};  g_6DB7 := 0;  game_Mode := saved;   { 6b00:1fb3 .. 1fc1 }
DrawLocationTimeStatus; ClearCharacterMessage; ClearMenuLine;      { 6b00:1fc4 .. 1fce }
```
### 6B00:1FD9 ov15_init — empty.

---

## ov22 (8E00) — spell lists, casting, spell handlers

**Spell table** `SpellTable{g_31FA}[id*16]` (image, dumped in full in the scratch list; ids 1..38h = the 56 spells whose names are `SpellNames{g_28E9}[id*29h]`, ids 39h..43h = item / monster powers without a name, class 2, level 6):

| +  | global | meaning | conf. |
|---|---|---|---|
| 0 | g_31FA | class: 0 cleric, 1 magic-user, 2 item/monster power (SpellCasterLevel 00BA:26C2) | H |
| 1 | g_31FB | spell level 1..7 (list headings "1st Level".. at DS:0A79 + level*29h) | H |
| 2, 3 | g_31FC, g_31FD | range = +2 + +3 × caster level (item: +2 + +3 × 6); FFh = touch (attack roll needed) | H |
| 4, 5 | g_31FE, g_31FF | duration = +4 + +5 × caster level (special cases in SpellDuration) | H |
| 6 | g_3200 | area / target-count code (targeting, COMBAT lane; ≠ 0 forces range ≥ 1) | M |
| 7 | g_3201 | target mode: 0 combat only, 1 caster, 2 one party member ("Cast Spell on whom"), 4 whole party | H |
| 8 | g_3202 | save effect: 0 none, 1 negates, 2 half damage | H |
| 9 | g_3203 | saving-throw type (index into `c^.save[]`) | H |
| A | g_3204 | effect type given (0 = none) | H |
| B..F | | AI aim/priority bytes (combat AI, COMBAT lane) | L |

Global names follow the COMBAT lane (`decode/names/combat_names.json`) where it already named them. **Target list**: `SpellTargetCount{g_6C94}` targets, far pointers `SpellTargets{g_6C95}[k]`, k = 1..count (Ghidra shows them as `g_6C90 + k*4 + 1`); `SpellTargets[1]` is the first (single) target. **Aim square** `SpellX{g_6DB9}`, `SpellY{g_6DBA}`. `sp_Current{g_681B}` = spell being executed, `DamageType{g_6819}` (ov24 DamageCharacter), `SpellArea{g_6820}` = area spell running (set by handlers, cleared by CastSpell), `ItemCast{g_6DBF}` = cast from a scroll/wand (no memorised spell is used up, range uses level 6), `sp_CampTarget{g_6DB5}` = last chosen camp target, `cure_InProgress{g_681F}`, `CombatRound{g_6DE3}`, `BodyCount{g_6715}`. **Handler table** `SpellHandlers{g_6B84}` (COMBAT: `SpellTargetProc` = entry 0): far pointers (to ov22 stubs in segment 0096h), index 0 = target selector, index id = handler of spell id (filled by InitSpellTable). Spell list being built: `sl_List{g_4766}` (linked 46-byte menu lines: string[40] +0, header flag +29h, next +2Ah), `sl_Ids{g_476A}[1..]` = spell id per selectable line, `sl_Items{g_477F}[0..30h]` = item per line (scroll lists), `sl_ItemCount{g_4843}`, `ScrollItem{g_6B80}`; `g_4844 / g_4845` = byte temporaries shared by several handlers.

### 8E00:008A ChooseSpell (H) — stub ov22 e1 — see **B-23**
`function ChooseSpell(mode [BP+0Ah]: Byte; var page [BP+6]: Integer): Byte` — caller ov19 (spell menus, PARTY lane). Callees: DrawTitledFrame, VerticalListMenu (option = the mode word, e.g. menu `Choose Spell: Cast Exit`), FreeMenuList.
```pascal
case mode of 1: opt := 'Cast'; 2: opt := 'Memorize'; 3: opt := 'Scribe'; 4: opt := 'Learn' else opt := '' end;   { 8e00:00a5 / 00be / 00d7 / 00f0 }
if mode in [1..4] then prompt := 'Choose Spell: ' else prompt := '';           { 8e00:0104 / 0119 }
if mode = 2 then bottom := $0F else bottom := $16;
redraw := (mode = 4) or (mode = 1) or (page < 0);
if page < 0 then begin DrawTitledFrame(1, 3, $26, bottom, 0, 0, ''); page := 0 end;   { 8e00:0173 }
repeat
  key := VerticalListMenu(prompt, opt, $0D, $0A, $0F, 1, 5, $26, bottom, sl_List, mode <> 4, redraw, page, sel);   { 8e00:01d7 }
until key in [#0, #13, 'C', 'E', 'L', 'M', 'S'];                               { 8e00:01e8  set CS:004A (fix #verify-3) }
n := number of non-header lines before sel;
if key in [#0, 'E'] then result := 0 else result := sl_Ids[n];                { 8e00:0239  set CS:006A; Enter and the option hotkeys C/L/M/S all return the highlighted spell (fix #verify-3) }
if mode = 3 then ScrollItem := sl_Items[n];                                    { scroll chosen for Scribe }
FreeMenuList(sl_List);                                                         { 8e00:0279 }
```

### 8E00:028D AddSpellLine (H) — see **B-26**
`procedure AddSpellLine(id [BP+6]: Byte)` — callers BuildSpellList, AddItemSpells. Appends a 46-byte line to `sl_List` (`GetMem($2E)` `{ 8e00:02ae / 031f }`); when the level of `id and 7Fh` differs from the previous selectable line's level, first a header line `'1st Level'..` (DS:0A79 + level*29h, header flag 1) `{ 8e00:038b / 039c }`; then the line `'  ' + name` (`' *' + name` when `id >= 80h` = not yet memorised) `{ 8e00:03de / 03f3 / 041c }`; `sl_Ids[n] := id and 7Fh` `{ 8e00:0444 }`.

### 8E00:044E AddItemSpells (H)
`procedure AddItemSpells(pendingOnly [BP+6]: Boolean)` — item = `ScrollItem`. If SelectedChar has effect 10h (Read Magic) `{ 8e00:0464 }` or is a cleric (`level[0] > 0`) and the item's type class (ITEMS byte 0) is 0Ch (cleric scroll), the item's `+35h` (unread flag) is cleared `{ 8e00:0489 }`. If `+35h = 0`: for k := 1..3, spell byte `item^[+3Bh+k]`: when `pendingOnly` and > 80h, or not `pendingOnly` and ≠ 0 → AddSpellLine `{ 8e00:04ee }`, `sl_Items[sl_ItemCount] := item; Inc(sl_ItemCount)`.

### 8E00:051C AddScrollSpells (H) — see **B-24**
`procedure AddScrollSpells(pendingOnly [BP+6]: Boolean)` — clears `sl_Items[0..30h]`, `sl_ItemCount := 0`; for each item of SelectedChar (`+C8h` list, next `+2Ah`): if IsScroll(item) `{ 8e00:0572 }` then AddItemSpells(pendingOnly) `{ 8e00:057e }`.

### 8E00:059C BuildSpellList (H) — stub ov22 e2
`function BuildSpellList(mode [BP+6]: Byte): Boolean` — caller ov19. Clears `sl_List` and `sl_Ids[0..14h]`; result = list not empty.
```pascal
case mode of
  0: for i := 0 to $14 do if (c^.mem_spell[i] <> 0) and (c^.mem_spell[i] < $80) then AddSpellLine(c^.mem_spell[i]);   { 8e00:060e  memorised }
  5: for i := 0 to $14 do if c^.mem_spell[i] >= $80 then AddSpellLine(c^.mem_spell[i]);       { 8e00:064a  chosen, not yet memorised }
  1: for id := 1 to $37 do if c^.known_spell[id] <> 0 then AddSpellLine(id);                     { 8e00:067a  spell book }
  2: AddItemSpells(false);                                    { 8e00:068e  current item }
  3: AddScrollSpells(false);                                  { 8e00:069c }
  6: AddScrollSpells(true);                                   { 8e00:06a9 }
  4: for id := 1 to $38 do                                    { Learn: spells the character could cast but does not know }
       if (c^.b[$B1 + SpellTable[id].b0*3 + SpellTable[id].b1] <> 0) and (c^.known_spell[id] = 0) then AddSpellLine(id);   { 8e00:070a  b0 = class, b1 = level 1..3 → spell_slots[class*3 + level − 1] at +B2h (SAVES.md); fix #fable-4 }
end;
```
(`mem_spell[i]` = `+17h+i`; `known_spell[id]` = `+32h+id`; `spell_slots[class*3 + level − 1]` = bytes from `+B2h` (level 1..3), i.e. the byte `+B1h + class*3 + level` that the code reads — SAVES.md; fix #fable-4.)

### 8E00:0729 SpellRange (H) — stub ov22 e3
`function SpellRange(spell [BP+6]: Byte): Byte` — callers ov09, ov13 (combat aiming). `if ItemCast = 0 then r := tbl.range + tbl.rangePerLvl * SpellCasterLevel(spell)` `{ 8e00:073a }` `else r := tbl.range + tbl.rangePerLvl * 6`; `if (r = 0) and (tbl.area <> 0) then r := 1`; `if r = FFh then r := 1` (touch).

### 8E00:07D6 SpellDuration (H)
`function SpellDuration(spell [BP+6]: Byte): Word` — callers ApplySpell, Enlarge, Hold, Strength, item strength.
```pascal
case spell of
  $28: d := Roll(1, 6) * 10;                     { 8e00:07e9  Cause Disease }
  $39, $3D: d := Roll(5, 4);                      { 8e00:0809 }
  $3B: d := Roll(1, 4) * 10 + 40;                 { 8e00:0820 }
  $3F: if game_Mode = 5 then d := Roll(2, 10) * 10                    { 8e00:0846 }
       else d := (Roll(1, 10) + 10) * 10;                             { 8e00:085d }
  $43: d := 1440;
else d := tbl.duration + tbl.durPerLvl * SpellCasterLevel(spell);    { 8e00:0880 }
end;
```

### 8E00:08C3 ApplySpell (H) — see **B-25**
`procedure ApplySpell(spell [BP+12h], level [BP+10h], onRemove [BP+0Eh], damage [BP+0Ch], dmgType [BP+0Ah]: Byte; msg: string [BP+6])` — the common spell resolver; callers: almost every handler. Callees: SpellCasterLevel, SavingThrow, RecalcCharacter, CallEffectHooks, AttackRoll, DamageCharacter, SpellDuration, ApplyEffect.
```pascal
if damage = 0 then DamageType := 0 else DamageType := dmgType;
if SpellTargetCount = 0 then exit;
if level = 0 then level := SpellCasterLevel(spell);                                 { 8e00:0903 }
for k := 1 to SpellTargetCount do if SpellTargets[k] <> nil then begin
  t := SpellTargets[k];
  if tbl[spell].saveEffect = 0 then saved := false
  else saved := SavingThrow(t, tbl[spell].saveType, 0);                            { 8e00:098d }
  if tbl[sp_Current].range = $FF then begin                                         { touch spell }
    RecalcCharacter(t);  CallEffectHooks($0B, t);                                    { 8e00:09ad / 09bb }
    if not AttackRoll(SelectedChar, t, t^.ac) then begin damage := 0; saved := true end;   { 8e00:09d7 }
  end;
  if damage <> 0 then DamageCharacter(t, damage, tbl[spell].saveEffect, saved);    { 8e00:0a0c }
  if tbl[spell].effect <> 0 then
    ApplyEffect(t, tbl[spell].effect, SpellDuration(spell), level, onRemove, tbl[spell].saveEffect, saved, msg);   { 8e00:0a3e / 0a63 }
end;
DamageType := 0;
```
`level` is stored as the effect's p3 (several handlers pass `side*16 + level` or `side*80h + level` instead, see below).

### 8E00:0A91 SelectTargetsCamp (H) — stub ov22 e4, `SpellHandlers[0]` outside combat
`procedure SelectTargetsCamp(spell [BP+0Ch]; auto [BP+0Ah]: Byte; var ok [BP+6]: Boolean)` — RETF 8. (In combat `SpellHandlers[0]` is replaced by the COMBAT lane's aiming routine, ov13 stub e14.)
```pascal
if sp_CampTarget = nil then sp_CampTarget := SelectedChar;
SpellTargets[1] := SelectedChar;  SpellTargetCount := 1;  ok := true;
case tbl[spell].targetMode of
  1: ;                                                                   { the caster }
  2: begin RedrawCurrentMode;                                            { 8e00:0ae2 }
       SelectPartyCharacter('Cast Spell on whom', true, sp_CampTarget);  { 8e00:0afe }
       if sp_CampTarget = nil then begin SpellTargets[1] := nil; SpellTargetCount := 0; ok := false end
       else SpellTargets[1] := sp_CampTarget end;
  4: begin SpellTargets[1] := PartyHead;                                   { 8e00:0b36  whole party }
       while SpellTargets[SpellTargetCount]^.next <> nil do begin
         SpellTargets[SpellTargetCount+1] := SpellTargets[SpellTargetCount]^.next; Inc(SpellTargetCount) end end;
else ok := false                                                          { 8e00:0ba1  combat-only spell }
end;
```

### 8E00:0C20 CastSpell (H) — stub ov22 e5
`procedure CastSpell(spell [BP+0Eh], auto [BP+0Ch], announce [BP+0Ah]: Byte; var used [BP+6]: Boolean)` — callers: ov05, ov08 (combat Cast), ov09, ov13 (AI), ov15 (camp), ov19. Callees: DrawText, AskYesNo, ForgetMemorizedSpell, ShowCasts, SpellHandlers[0] and [spell], BuildFourAnimationFrames, CombatantCol/Row, InFrontArc, ShowCombatant, sound routines, AnimateAlongPath, IsVisible, BreakInvisibility (ov24_0FD2), ShowTimedBottomMessage, ClearCharacterMessage, ClearRectangle.
```pascal
caster := SelectedChar;  again := true;
if (game_Mode <> 5) and (tbl[spell].targetMode = 0) then begin                  { combat-only outside combat }
  if ItemCast = 0 then begin
    DrawText(1, $13, 10, SpellNames[spell]);                                    { 8e00:0c78 }
    DrawText(1, $14, 10, 'is a combat-only spell...');                          { 8e00:0c95 }
    if AskYesNo('Lose it? ', $0D, $0F, $0A) = 'Y' then ForgetMemorizedSpell(spell)   { 8e00:0cb2 / 0cbf }
  end else begin
    DrawText(1, $13, 10, 'That Item');  DrawText(1, $14, 10, 'is a combat-only item...');   { 8e00:0cde / 0cfb }
    if AskYesNo('Use it? ', $0D, $0F, $0A) = 'Y' then used := true             { 8e00:0d18 }
  end;
  announce := 0;  again := false
end;
if (announce <> 0) and (ItemCast = 0) then ShowCasts(caster, 'casts', spell);   { 8e00:0d57 }
while again do begin
  SpellHandlers[0](spell, auto, used);                                          { 8e00:0d70  choose targets }
  if used then begin
    again := false;
    if game_Mode = 5 then begin
      BuildFourAnimationFrames($12);                                            { 8e00:0d91 }
      col := CombatantCol(caster); row := CombatantRow(caster);                 { 8e00:0d9c / 0daa }
      dir := 0; while not InFrontArc(col, row, SpellX, SpellY, dir) do Inc(dir);   { 8e00:0dca }
      ShowCombatant(caster, dir, 1, false);                                     { 8e00:0de8  casting pose }
      SetSoundTimerMode(0);                                                     { 8e00:0df0 }
      if spell = $2F then PlayOrStopSound(g_262A)                               { 8e00:0e00  Fireball }
      else if spell = $33 then PlayOrStopSound(g_2624)                          { 8e00:0e0f  Lightning Bolt }
      else PlayOrStopSound(g_2618);                                             { 8e00:0e1a }
      AnimateAlongPath(col, row, SpellX, SpellY, 4, $1E);                 { 8e00:0e35 }
      SetSoundTimerMode(10);                                                    { 8e00:0e3e }
      if IsVisible(caster, false) then begin                                    { 8e00:0e4c }
        ShowCombatant(caster, caster^.combatant^[9], 1, true);          { 8e00:0e6e }
        ShowCombatant(caster, caster^.combatant^[9], 0, false) end      { 8e00:0e8c }
    end;
    BreakInvisibility(caster);                                                  { 8e00:0e97  ov24_0FD2 }
    if ItemCast = 0 then ForgetMemorizedSpell(spell);                        { 8e00:0ea7 }
    sp_Current := spell;  SpellHandlers[spell];  sp_Current := 0;  SpellArea := 0;   { 8e00:0ebd }
  end
  else if game_Mode <> 5 then again := false                                    { camp: target selection cancelled }
  else if (auto <> 0) or (AskYesNo('Abort Spell? ', $0E, $0A, $0F) = 'Y') then begin   { 8e00:0ef8 }
    ShowTimedBottomMessage('Spell Aborted');                                    { 8e00:0f10 }
    if ItemCast = 0 then ForgetMemorizedSpell(spell);                        { 8e00:0f20 }
    again := false
  end
end;
ClearCharacterMessage;                                                          { 8e00:0f2c }
if game_Mode = 5 then ClearRectangle(0, $17, $27, $17);                         { 8e00:0f44 }
```

### 8E00:0F4F ApplyToSide (H)
`procedure ApplyToSide(side [BP+0Ah]: Byte; msg: string [BP+6])` — callers Bless, Curse. Drops every target whose `side <> side`; for Bless (`sp_Current = 1`) in combat also every target with an enemy within 1 square (`CollectOppositeSideTargets(t, 1) <> 0` `{ 8e00:0fbf }` — AD&D "not yet in melee", M); `SpellArea := 1`; ApplySpell(sp_Current, 0, 0, 0, 0, msg) `{ 8e00:0ffb }`.

### Spell handlers (`SpellHandlers[id]`, all parameterless, operate on the target list; H unless noted)
| id | spell | address | body |
|---|---|---|---|
| 1 | Bless | 8E00:100F | ApplyToSide(SelectedChar^.side, 'is Blessed') `{ 8e00:102f }` |
| 2 | Curse | 8E00:1040 | ApplyToSide(IsSideZero(SelectedChar), 'is Cursed') `{ 8e00:104e / 1064 }` (the other side) |
| 3 | Cure Light Wounds | 8E00:106B | if count ≠ 0 and HealCharacter(SpellTargets[1], Roll(1,8), false) `{ 8e00:1085 / 108e }` then ShowHealingResult(SpellTargets[1]) `{ 8e00:109f }` |
| 4 | Cause Light Wounds | 8E00:10A7 | ApplySpell(id, 0, 0, RollDice(1,8), 8, '') `{ 8e00:10bd / 10d6 }` (touch: attack roll) |
| 5, 11, 18, 22, 29 | Detect Magic ×2, Read Magic, Find Traps, Detect Invisibility | 8E00:10E9 | ApplySpell(id, 0,0,0,0, 'is affected') `{ 8e00:110f }` |
| 6, 7, 16, 17, 52, 53, 54 | Protection from Evil/Good (also 10' radius), Prot. from Normal Missiles | 8E00:1123 | ApplySpell(…, 'is protected') `{ 8e00:1149 }` |
| 8 | Resist Cold | 8E00:1162 | ApplySpell(…, 'is cold-resistant') `{ 8e00:1188 }` |
| 9 | Burning Hands | 8E00:1190 | ApplySpell(id, 0, 0, SpellCasterLevel(id), 9, '') `{ 8e00:11a4 / 11bd }` — damage = level, fire+magic |
| 10 | Charm Person | 8E00:11DD | if `t^.creature_type < 2` and `t^.size(+6Ch) < 2`: ApplySpell(id, SelectedChar^.side*80h + level, 1, 0, 0, 'is charmed') `{ 8e00:122f / 1262 }`; if HasEffect(t, 0Bh, e) then CallEffectHandler(0Bh, SpellTargets[1], e, 0) `{ 8e00:1273 / 1290 }` (switches side now); else ShowCharacterMessage(t, 'is unaffected', 10, true) `{ 8e00:1220 }` |
| 12 | Enlarge | 8E00:12A5 | strength (18, exc) with exc by caster level 1..6 = 0, 1, 51, 76, 91, 100 `{ 8e00:12b4 }`; if SetStrength(t, 18, exc, old) `{ 8e00:130e }` then ShowCharacterMessage(t, 'is stronger', 10, true) `{ 8e00:1334 }`; AddEffect(t, 0Ch, SpellDuration(id), old, 1) `{ 8e00:1349 / 1354 }` |
| 13 | Reduce | 8E00:136E | if count ≠ 0 and not SavingThrow(SpellTargets[1], 4, 0) `{ 8e00:1389 }` and CureEffect(SpellTargets[1], 0Ch) `{ 8e00:139d }` then 'has been reduced' `{ 8e00:13c3 }` (only undoes Enlarge) |
| 14 | Friends | 8E00:13D8 | old := t^.cha; `t^.cha += Roll(2,4)` `{ 8e00:13ef }`, max 25; ApplySpell(id, old, 1, 0, 0, 'is friendly') `{ 8e00:1431 }` (p3 = old CHA for the undo) |
| 15 | Magic Missile | 8E00:1439 | n := SpellCasterLevel(id) shr 1 `{ 8e00:1443 }`; ApplySpell(id, 0, 0, RollDice(n, 4) + n, 8, '') `{ 8e00:1460 / 1486 }` |
| 19 | Shield | 8E00:1499 | ApplySpell(…, 'is shielded') `{ 8e00:14bf }` |
| 20 | Shocking Grasp | 8E00:14C7 | ApplySpell(id, 0, 0, RollDice(1,8) + level, $0C, '') `{ 8e00:14e9 / 1507 }` (electricity+magic, touch) |
| 21 | Sleep | 8E00:151B | budget := Roll(4,4) `{ 8e00:152c }`; for each target: cost by `level_main(+73h)` (signed byte): 0..1 → 1 (JL/JG pair 8e00:1561/1565), 2 → 2, 3 → 4, 4 → 6, 5 → 10 (race 0 monster) or 20, else (incl. negative values) 20 (fix #verify-2); targets with status Animated, effect 35h `{ 8e00:15ee }` or cost > remaining budget are dropped, else budget −= cost; `SpellArea := 1`; ApplySpell(…, 'falls asleep') `{ 8e00:1649 }` |
| 23, 49 | Hold Person (cleric / MU) | 8E00:1658 | save bonus by number of targets: 1 → −2 (cleric, id 17h) / −3, 2 → −1, 3..4 → 0; for k := count downto 1: (k < count: missile animation from caster to target, sound g_2618 `{ 8e00:16e6 / 172d }`); saved := SavingThrow(t, saveType, bonus) `{ 8e00:1755 }`; creature_type > 1 or size > 1 → immune (saved := true); ApplyEffect(t, effect, SpellDuration, SpellCasterLevel, 0, saveEffect, saved, 'is held') `{ 8e00:1791 / 1799 / 17c5 }` |
| 24 | Resist Fire | 8E00:17E9 | ApplySpell(…, 'is fire resistant') `{ 8e00:180f }` |
| 25 | Silence 15' Radius | 8E00:1822 | ApplySpell(…, 'is silenced') `{ 8e00:1848 }` |
| 26 | Slow Poison | 8E00:185B | Animated target → nothing; if HasEffect(t, 37h) `{ 8e00:1891 }` (poisoned): `hp := max(hp, 1)`; ApplySpell(id, FFh, 1, 0, 0, 'is affected') `{ 8e00:18ce }`; CallEffectHandler(4Eh, t, nil, 1) `{ 8e00:18e3 }`; AddEffect(t, 0Fh, 10, FFh, 1) `{ 8e00:18fb }` (M) |
| 27 | Snake Charm | 8E00:190F | budget := caster hp; target list := every combatant with `creature_type = 0Eh` (snake) whose hp ≤ remaining budget (budget −= hp); ApplySpell(…, 'is charmed') `{ 8e00:19bb }` |
| 28 | Spiritual Hammer | 8E00:19C3 | ApplySpell(id, 0, 1, 0, 0, …) `{ 8e00:19e9 }`; CallEffectHandler(17h, SpellTargets[1], nil, 0) `{ 8e00:1a00 }` (creates the hammer, COMBAT lane) |
| 30, 50 | Invisibility (10' radius) | 8E00:1A16 | ApplySpell(…, 'is invisible') `{ 8e00:1a3c }` |
| 31 | Knock | 8E00:1A4F | ApplySpell(…, 'Knock-Knock') `{ 8e00:1a75 }` (door handling in VIEW ov14) |
| 32 | Mirror Image | 8E00:1A8A | ApplySpell(id, Roll(1,4), 0, 0, 0, 'is duplicated') `{ 8e00:1a9a / 1ab9 }` — p3 = number of images |
| 33 | Ray of Enfeeblement | 8E00:1ACC | ApplySpell(…, 'is weakened') `{ 8e00:1af2 }` |
| 34 | Stinking Cloud | 8E00:1B11 | see below |
| 35 | Strength | 8E00:1F41 | see below |
| 36 | Animate Dead | 8E00:206F | see below |
| 37 | Cure Blindness | 8E00:2217 | if CureEffect(SpellTargets[1], 21h) `{ 8e00:2228 }` then ShowCombatMessageAnimation(t, true, 'can see') `{ 8e00:224b }` |
| 38 | Cause Blindness | 8E00:225D | ApplySpell(…, 'is blind') `{ 8e00:2283 }` |
| 39 | Cure Disease | 8E00:232F | Spell_CureDisease `{ 8e00:2336 }` |
| 40 | Cause Disease | 8E00:234C | ApplySpell(id, 0, 1, 0, 0, 'is diseased') `{ 8e00:2372 }` |
| 41, 46 | Dispel Magic | 8E00:2385 | see below |
| 42 | Prayer | 8E00:24D6 | ApplySpell(id, SelectedChar^.side*16 + level, 0, 0, 0, 'is praying') `{ 8e00:24e4 / 2517 }` |
| 43 | Remove Curse | 8E00:2540 (also stub ov22 e9, temple) | if CureEffect(t, 24h) `{ 8e00:2551 }` then 'is un-cursed' `{ 8e00:2574 }` else clear the first item with `+36h <> 0` (cursed) and say "'s item is un-cursed" `{ 8e00:25ea }` |
| 44 | Bestow Curse | 8E00:2604 | ApplySpell(…, 'has been cursed!') `{ 8e00:262a }` |
| 45 | Blink | 8E00:263D | ApplySpell(…, 'is blinking') `{ 8e00:2663 }` |
| 47, 64 | Fireball (spell, item) | 8E00:266B | see below |
| 48 | Haste | 8E00:2892 | HasteSlow($2A, SelectedChar^.side, 'is Hasted') `{ 8e00:28b5 }` |
| 51 | Lightning Bolt | 8E00:2BB7 | dmg := Roll(SpellCasterLevel(id), 6) `{ 8e00:2bc1 / 2bca }`; BoltHitSquare(aim, dmg, 4) `{ 8e00:2be7 }`; LightningBolt(8, dmg, 4, true) `{ 8e00:2bf8 }` |
| 55 | Slow | 8E00:2C09 | HasteSlow($27, IsSideZero(SelectedChar), 'is Slowed') `{ 8e00:2c1a / 2c30 }` |
| 56 | Restoration | 8E00:2C43 | see below |
| 57 | (item: speed) | 8E00:2E02 | unless CureEffect(t, 2Ah) (was slowed) `{ 8e00:2e13 }`: ApplySpell(…, 'is Speedy') `{ 8e00:2e3c }` (effect 27h = haste) |
| 58 | (item: healing / neutralise) | 8E00:2E4D | if CureEffect(t, 37h) `{ 8e00:2e5e }` then RemoveEffect(t, 16h, nil) (with cure_InProgress) `{ 8e00:2e7d }` else if not Spell_CureDisease `{ 8e00:2e8a }` and HealCharacter(t, Roll(1,4) + 8, false) `{ 8e00:2e9f / 2ead }` then 'is Healed' `{ 8e00:2ed0 }` (M) |
| 59 | (item: strength) | 8E00:2EE5 | SetStrength(t, 21, 0, old) `{ 8e00:2efe }` → 'is stronger'; AddEffect(t, 26h, SpellDuration(3Bh), old, 1) `{ 8e00:2f39 / 2f44 }` |
| 60 | (lightning, wand/monster) | 8E00:2F4D | BoltHitSquare(aim, Roll(1,6) + 20, 4) `{ 8e00:2f61 / 2f75 }`; LightningBolt(3, 20, 4, false) `{ 8e00:2f85 }` (M) |
| 61 | (paralysis) | 8E00:2F99 | ApplySpell(…, 'is paralyzed') `{ 8e00:2fbf }` |
| 62 | (potion of healing) | 8E00:2FD0 | if HealCharacter(t, Roll(2,4) + 2, false) `{ 8e00:2fe4 / 2ff1 }` then 'is Healed' `{ 8e00:3014 }` |
| 63 | (item invisibility) | 8E00:302A | ApplySpell(…, 'is invisible') `{ 8e00:3050 }` |
| 65 | (magic missile, wand) | 8E00:3058 | ApplySpell(id, 0, 0, RollDice(2,4) + 2, 8, '') `{ 8e00:306e / 308b }` |
| 66 | (none) | 8E00:3092 | empty `{ 8e00:3092 }` |
| 67 | (reading) | 8E00:30A2 | ApplySpell(id, FFh, 1, 0, 0, 'is Reading') `{ 8e00:30c8 }` — effect 04h, duration 1440 |

### 8E00:1B11 Spell_StinkingCloud (M) — see **B-31**
One routine 8E00:1B11..1F40 (Ghidra splits it into FUN_8e00_1c31 / 1cf4 / 1d70 / 1daa / 1dbe / 1dc1 at loop labels). Cloud records `sc_List{g_6DBB}` (19 bytes, linked): +0 caster (4), +4 next (4), +8..+0Bh saved ground tile of square k = 1..4, +0Ch..+0Fh "cloud placed" flag of square k, +10h column, +11h row, +12h index of this caster's cloud.
```pascal
SpellArea := 1;  lvl := SpellCasterLevel(sp_Current);                                   { 8e00:1b20 }
n := number of existing clouds of SelectedChar; append a zeroed 19-byte record r;     { 8e00:1b46 / 1b9e / 1bcb }
AddEffect(SelectedChar, $28, lvl, lvl + n*16, 1);                                     { 8e00:1bf7  removing it removes the cloud }
r^.caster := SelectedChar;  r^.index := n;  r^.col := SpellX;  r^.row := SpellY;
for k := 1 to 4 do begin                                                              { 2 × 2 squares, offsets via g_290D[k] → g_2736/g_273F }
  CellAt(aim + offset[k], occ[k], tile);                                              { 8e00:1c7d }
  r^.placed[k] := (tile <> 0) and (CombatTerrain[tile].frame <> $FF);
  if tile = $1E then tile := original tile saved by the older cloud covering that square
  else if tile = $1F then tile := original tile from the corpse list g_66DA (count BodyCount);
  r^.saved[k] := tile;
  if r^.placed[k] then cm_Map^.grid[square] := $1E                                    { cloud ground }
end;
ShowCharacterMessage(SelectedChar, 'Creates a noxious cloud', 10, false);             { 8e00:1ed4 }
FocusSquare(SpellX, SpellY, $FF, 8);  MessageDelay;  ClearCharacterMessage;     { 8e00:1ee7 / 1eec / 1ef1 }
for k := 1 to 4 do if occ[k] <> 0 then StinkingCloudCheck(cb_Char[occ[k]]);           { 8e00:1f26 }
```

### 8E00:1F41 Spell_Strength (H) — see **B-29**
Roll by class (later tests win): magic-user `level[5] > 0` → Roll(1,4) `{ 8e00:1f69 }`; cleric or thief → Roll(1,6) `{ 8e00:1f8d }`; fighter → Roll(1,8) `{ 8e00:1fa6 }`. `s := t^.str + roll`; above 18: fighters get `exc := min(t^.str_exc + (s − 18)*10, 100)`, others nothing; `s := 18`. If SetStrength(t, s, exc, old) `{ 8e00:2018 }` → ShowCharacterMessage(t, 'is stronger', 10, true) `{ 8e00:203c }`; AddEffect(t, 26h, SpellDuration(id), old, 1) `{ 8e00:205a }`.

### 8E00:206F Spell_AnimateDead (H)
```pascal
SpellArea := 1;  budget := SpellCasterLevel(sp_Current);  SpellTargetCount := 0;           { 8e00:207e }
c := PartyHead;
while (c <> nil) and (budget <> 0) do begin
  if (c^.status = 6 {Dead}) and (c^.creature_type = 0) then
    if PlaceCombatant(c, CombatantCol(c), CombatantRow(c), true) then begin             { 8e00:20e9 }
      p3 := c^.side*16 + SpellCasterLevel(sp_Current);                                  { 8e00:20f9 }
      c^.side := SelectedChar^.side;  c^.controlled := 1;  c^.ai_mode := 2;
      c^.fighter_lvl_eff := 0;  c^.base_move := 6;  FillChar(c^.mem_spell, 21, 0);
      if c^.npc_morale < $80 then c^.npc_morale := $B3 else c^.npc_morale := $B2;
      c^.creature_type := 4;
      if game_Mode = 5 then begin c^.combatant^.w[$0A] := 0; c^.combatant^.w[$0C] := 0 end;
      Dec(budget);
      if ReviveCombatant(c, c^.hp_max) then begin                                       { 8e00:21b6 }
        ApplyEffect(c, $20, 0, p3, 1, 0, false, 'is animated');                         { 8e00:21e7 }
        c^.status := 1 {Animated} end
    end;
  c := c^.next
end;
```

### 8E00:228A Spell_CureDisease (H)
`function Spell_CureDisease: Boolean` — `cure_InProgress := 1`; a := CureEffect(SpellTargets[1], 22h) `{ 8e00:22a4 }`; if CureEffect(SpellTargets[1], 2Bh) `{ 8e00:22bc }` then RemoveEffect(SpellTargets[1], 2Ch, nil), RemoveEffect(SpellTargets[1], 1Fh, nil) `{ 8e00:22da / 22f0 }`; if CureEffect(SpellTargets[1], 32h) `{ 8e00:2300 }` then RemoveEffect(SpellTargets[1], 39h, nil) `{ 8e00:231e }`; result = any cured; `cure_InProgress := 0`. (Same disease effect set as the temple, ov04.)

### 8E00:2385 Spell_DispelMagic (H)
```pascal
SpellArea := 1;  lvl := SpellCasterLevel(sp_Current);                                   { 8e00:2394 }
for k := 1 to SpellTargetCount do begin
  t := SpellTargets[1];  dispelled := false;        { NB: always the first target — every pass works on SpellTargets[1] }
  e := t^.effects;
  while e <> nil do begin
    nx := e^.next;
    if e^.p3 <> $FF then begin
      el := e^.p3 and $0F;                                                             { caster level stored by ApplySpell }
      if el < lvl then chance := 50 + (lvl - el) * 5
      else if el > lvl then chance := 50 - (el - lvl) * 2 else chance := 50;
      if Roll(1, 100) <= chance then begin RemoveEffect(t, e^.type, e); dispelled := true end   { 8e00:2463 / 2481 }
    end;
    e := nx
  end;
  if dispelled then ShowCombatMessageAnimation(t, true, 'is affected')                 { 8e00:24b7 }
end;
```

### 8E00:266B Spell_Fireball (H)
```pascal
SpellArea := 1;
if sp_Current = $40 then lvl := Roll(1, 3) * 2 + 1 else lvl := SpellCasterLevel(sp_Current);   { 8e00:2683 / 2696  wand: 3, 5 or 7 dice }
if ecl_Mem4900^.w[$1CC] = 0 then begin                                                 { area flag set by ECL: keep the aimed list }
  BuildTargetList(SpellX, SpellY, 2, $FF, 1, cm_Map);                            { 8e00:26c4  radius 2 (BuildTargetList) }
  SpellTargets[1..tg_Count] := combatants of the new list;  SpellTargetCount := tg_Count
end;
FocusSquare(SpellX, SpellY, 0, 8);                                              { 8e00:272e }
ApplySpell(sp_Current, 0, 0, RollDice(lvl, 6), 9, '');                               { 8e00:2744 / 275d  fire+magic, save for half }
```

### 8E00:2764 HasteSlow (H)
`procedure HasteSlow(cancels [BP+0Ch], side [BP+0Ah]: Byte; msg: string [BP+6])` — RETF 8. `SpellArea := 1`; budget := SpellCasterLevel `{ 8e00:2786 }`; for each target: of side `side` while budget > 0 → Dec(budget); if CureEffect(t, cancels) `{ 8e00:27df }` the target is dropped (Haste only cancels Slow and vice versa); other targets dropped; ApplySpell(sp_Current, 0,0,0,0, msg) `{ 8e00:2832 }`; for each remaining target CallEffectHooks($12, t) `{ 8e00:2875 }`.

### 8E00:28BC BoltHitSquare (H)
`procedure BoltHitSquare(col [BP+10h], row [BP+0Eh], dmg [BP+0Ch], saveType [BP+0Ah]: Byte; var wall [BP+6]: Boolean)` — RETF 0Ch. `wall := false`; CellAt(col, row, occ, tile) `{ 8e00:28db }`; `wall := (tile <> 0) and (CombatTerrain[tile].frame = $FF)`; if occ ≠ 0: `DamageType := $0C`; DamageCharacter(cb_Char[occ], dmg, 2, SavingThrow(cb_Char[occ], saveType, 0)) `{ 8e00:293d / 2943 }`; BuildFourAnimationFrames($13) `{ 8e00:294b }`; `DamageType := 0`.

### 8E00:295B LightningBolt (M)
`procedure LightningBolt(length [BP+0Ch], dmg [BP+0Ah], saveType [BP+8]: Byte; mayBounce [BP+6]: Boolean)` — RETF 8. Callers Lightning Bolt (length 8), 2F4D (3), BreathWeapon (10). BuildFourAnimationFrames($13) `{ 8e00:2964 }`; if the aim square is not the caster's (`CombatantCol/Row` `{ 8e00:298c / 299c }`): `left := length*2`, `SpellArea := 1`; repeat: trace a line (LineInit / LineStep, ov30 `{ 8e00:2a4b / 2a71 }`) from the aim square away from the caster for up to `left` half-squares, stopping at the first other occupant, an off-map square or terrain with `CombatTerrain[tile].frame > 1`; animate the segment (AnimateAlongPath(…, 4, $32) `{ 8e00:2aea }`); BoltHitSquare on its end `{ 8e00:2b05 }`; on a wall the bolt bounces: the aim moves to the end square, the direction reverses (`step := −step`), a first bounce with a short segment costs 8 more (`mayBounce`); `left` decreases by the distance travelled, until 0. `SpellArea := 0`. (Line geometry details L; the AD&D bounce rule is recognisable.)

### 8E00:2C43 Spell_Restoration (H) — see **B-30**
If `t^.levels_drained <> 0`: `n := t^.hp_drained div t^.levels_drained`; `hp_max += n; hp += n; hp_rolled += n; hp_drained −= n; Dec(levels_drained)`; then a class is chosen by scanning j = 0..7: a class with `1 <= level[j] <= ` the current pick's level (start 13) whose next-level XP threshold (`g_409B[j*38h + (level+1)*4]`, longint, > 0) is below the current pick's (start 989680h = 10 000 000) and whose racial limit is not reached (`RacialLevelLimitReached(t, j)` `{ 8e00:2d4a }`) gets `Inc(level[j])`; `t^.xp := max(t^.xp, threshold)`; UpdateLevelStats(t) (ov23 e1) `{ 8e00:2dcf }`; ShowCharacterMessage(t, 'is restored', 10, true) `{ 8e00:2def }`.

### 8E00:30D9 BreathWeapon (H) — effect handler of type 58h (`g_6988`, set by InitSpellTable) — see **B-27**
`procedure BreathWeapon(c [BP+0Ch]; e [BP+8]: PEffect; mode [BP+6]: Word)` — RETF 0Ah. If `CombatRound = 0` or Roll(1,100) > 50 `{ 8e00:30ec }`: ShowCharacterMessage(c, 'Breathes!', 10, true) `{ 8e00:312f }`; SpellHandlers[0]($33, 1, g_70C6) (aim as for Lightning Bolt) `{ 8e00:313f }`; the aim square is moved to the adjacent square in that direction (`Sign` ov30 e1 `{ 8e00:3150 / 316d }`, one more step when it lands next to c); BreakInvisibility(c) `{ 8e00:31a9 }`; animation `{ 8e00:31b1 / 31cc }`; BoltHitSquare(aim, c^.hp_max, 3) `{ 8e00:31ea }`; LightningBolt(10, c^.hp_max, 3, false) `{ 8e00:31ff }` (damage = the breather's maximum hit points, save type 3 = breath); then `if e^.p3 < $FE then RemoveEffect(c, $58, e) else Dec(e^.p3)` `{ 8e00:3224 }`; ClearCombatantActionFlags(c) `{ 8e00:322f }`.

### 8E00:323D IsScroll (H) — stub ov22 e6
`function IsScroll(item [BP+6]): Boolean` — RETF 4; callers ov09, ov15, ov19, ov20. `item <> nil` and ITEMS[item^.type].class (byte 0, `g_5582`) in 0Bh..0Dh (MU scroll, cleric scroll, …) `{ 8e00:323d }`.

### 8E00:328A UseScrollSpell (H) — stub ov22 e7
`procedure UseScrollSpell(owner [BP+0Ch]; item [BP+8]; spell [BP+6]: Byte)` — RETF 0Ah; callers ov19 (Use), ov20. Finds the last k in 1..3 with `item^[+3Bh+k] and 7Fh = spell and 7Fh`; clears that byte; `Dec(item^.charges +30h)`; `if item^.charges < D2h then LoseItem(owner, item)` `{ 8e00:32fa }`.

### 8E00:331A ShowCasts (H) — stub ov22 e8
`procedure ShowCasts(c [BP+0Ch]; msg: string [BP+8]; spell [BP+6]: Byte)` — RETF 0Ah; callers CastSpell, ov20. Combat: ShowCharacterMessage(c, 'Casts a Spell', 10, true) `{ 8e00:3356 }`; ClearRectangle(0, $17, $27, $17) `{ 8e00:3367 }`; DrawText(0, $17, 10, 'Spell:' + SpellNames[spell]) `{ 8e00:339c }`. Otherwise: ClearRectangle(1, $12, $26, $16) `{ 8e00:33af }`; DrawCharacterName(c, 1, $13, false) `{ 8e00:33c3 }`; DrawText(Length(c^.name) + 2, $13, 10, msg) `{ 8e00:33de }`; DrawText(1, $14, 10, SpellNames[spell]) `{ 8e00:33fe }`; MessageDelay; ClearCharacterMessage `{ 8e00:3403 / 3408 }`.

### 8E00:3413 InitSpellTable (H) — stub ov22 e10
Caller ov11 (game start). `SpellHandlers[0] := SelectTargetsCamp`, `SpellHandlers[1..67] :=` the handlers in the table above (far pointers to ov22 stubs 0096:0057..0156) `{ 8e00:3413 }`; `g_6988 := BreathWeapon` (effect handler 58h); `cure_InProgress := 0; ItemCast := 0; sp_CampTarget := nil; g_6821 := 1`.

### 8E00:37B0 ov22_init — empty.

---

## Build corrections (por-build-magic, from the byte-level translation into game/areas/magic_*.js)

Found by the translators re-reading every routine on the listings (build-area-template caution rules); the JS follows the bytes. B-n is referenced from each routine heading.

- **B-1** ConfirmNeedless 3400:0042: the call is `ShowCharacterMessage(SelectedChar, msg, 0, 0)` — the routine prints the name itself (not name + ' ' + msg).
- **B-2** PayForCure 3400:0177/01CC: the character's gold keeps only its low word; SetPoolMoneyGold receives the low word of (pool − price) (quirks).
- **B-3** RaiseDead 3400:0612..0726: bonus := hp_max − hp_rolled(+B1h) if > 0 else 0; exit if new CON < 14; sum := Σ over level bytes +96h+i (i 0..7, signed > 0): fighter (i=2) level·(CON−14), others 2·level if CON > 15 else level (byte); if sum > 0 then bonus := bonus div sum; if (CON < 17) or (ShortInt(fighter level) > 0) then hp_max −= bonus.
- **B-4** HealMenu 3400:0C24: 'restore screen' = ClearTextRectangle(0, 0, 27h, 18h), RedrawCurrentMode, DrawPartyRoster; before the loop frames (1,1)-(26h,16h) and (1,1)-(26h,1); the header and the frame (1,11h)-(26h,16h) are redrawn on every pass.
- **B-5** Temple 3400:0DCA: 'V' = ViewMenu(var ext); 3400:0EE3/0EF2: 'G'/'O' = CycleSelectedChar(key); 3400:0EB6: MenuSelect is 0-based, `= 1` = 'No' to 'go back and retrieve your money?' → money left, temple exits; 'Yes' clears the text and stays.
- **B-6** NextToAct: initiative is a signed byte; a candidate wins if init > best, or init = best and roll >= bestRoll (an equal roll goes to the later member).
- **B-7** CombatMenu: 'Cast' is offered if any mem_spell byte ≠ 0 (incl. chosen-not-yet-memorised ≥ 80h); an extended key outside [10h, 13h, 2Dh, 32h] becomes #0 and the menu repeats; Esc is not in the exit set (CS:0626/0646).
- **B-8** PlayerTurn: Alt-R (13h) passes the CombatMenu exit set but has no case → the menu repeats.
- **B-9** MoveAttack: the cleared line is ClearRectangle(18h, 18h, 27h, 18h) (row 24 from col 24); the loop does not stop on `done`, it continues while the move counter > 1.
- **B-10** DoneMenu: exit set CS:0E25 = [#0, 'E'].
- **B-11** GameSpeedMenu (ov08): prompt 'GameSpeed (' + n + ') :' (no trailing blank), options ' Slower Faster Exit' (leading blank); exit set CS:10AF = [#0, 'E'].
- **B-12** CastMenu: CanUseMagic(1) is tested once before the loop; the loop repeats while SpellList returns a spell; SpellList = 0 with `found` set → cast := true, no message.
- **B-13** MagicMenu: as Camp — extended key → CycleSelectedChar + DrawPartyRoster, other plain keys nothing, exit [#0, 'E'].
- **B-14** MoveSelectedDown/Up: descriptions reversed — Down swaps SelectedChar with its predecessor (towards the front; the first wraps to the end), Up with its successor (the last wraps to the front).
- **B-15** AddLine: Pascal order is (header, text) (push order); nodes {text, header, next}; DisplayEffects starts with a ' ' line, the name line has header 1, a blank line after each character.
- **B-16** FreeSlots returns a Byte (AL): wraps when more spells are memorised than slots; MemorizeMenu tests it unsigned (a wrapped value counts as free).
- **B-17** Rest: the 'redraw' is DrawLocationTimeStatus.
- **B-18** ScribeMenu: messages via ShowTimedBottomMessage (not ShowCharMessage); the marking pass does not test IsScroll (first item with a matching power byte is marked).
- **B-19** PartyOrder: extended keys split by mode (select: cycle selection; place: 47h/4Fh = 'G'/'O' moves); mode toggles on #13, 'P', 'S'; exit [#0, 'E'].
- **B-20** DropCharacter: RemoveFromParty(0, 1), TerminateGame path, then ClearRectangle(11h, 1, 26h, 0Bh) before the roster redraw.
- **B-21** GameSpeedMenu (ov15): text via DrawText(1, 12h, 0Ah); colours 0Dh/0Ah/0Fh; ext ↓50h/↑48h bounded 0..9, 'F'/'S' unbounded.
- **B-22** AlterMenu: extended key cycles the selection; Pics submenu HorizontalMenu('', opts, 0Dh, 0Ah, 0Fh, 0, 1) until [#0, 'E'].
- **B-23** ChooseSpell: the selected-line pointer is not reset between menu loops (quirk).
- **B-24** AddScrollSpells ends with ScrollItem := nil.
- **B-25** ApplySpell: once a touch attack misses, damage stays 0 for every later target (quirk).
- **B-26** AddSpellLine writes sl_Ids[n] without a bound (> 21 lines overrun into sl_Items) — not reproduced byte-exactly in JS (TODO).
- **B-27** BreathWeapon 8E00:3188/319B: only when the new aim coordinate = breather's coordinate + 1 is one more step taken (not for −1).
- **B-28** (handler table row 12) Enlarge 8E00:12B4: caster levels outside 1..6 keep the stale g_4845 strength value (quirk); Hold Person 8E00:1665..168A: bonus [bp-7] uninitialised for 0 or ≥ 5 targets.  (heading not found: see the handler table)
- **B-29** Spell_Strength 8E00:1F47..1FAB: the roll stays uninitialised when no MU/cleric/thief/fighter level > 0.
- **B-30** Spell_Restoration 8E00:2D8F: chosen class index uninitialised when no class qualifies; the level increment still runs. Item strength 8E00:2EE5 calls SpellDuration(sp_Current) (= 3Bh for that power).
- **B-31** Spell_StinkingCloud 8E00:1B61: the existing-cloud count loop skips the last list record (undercounts by one when it is the caster's).

## Self-check
Method: every `{ seg:off }` in this file (406 citations) was machine-checked to be the address of a real instruction in `decode/listings/*.lst` (0 failures). A random 10 % sample (41 citations, seed 7) was re-read against the instructions around each address and compared with the pseudocode statement, including the push order of every argument.
Sample (address → result): 6B00:0E13 ok · 4800:02C1 ok · 8E00:038B ok · 8E00:2FBF ok · 3400:05C1 ok · 3400:0A98 ok · 8E00:12B4 ok · 3400:0DBB ok · 6B00:1F4C ok · 8E00:18FB ok · 3400:08A8 ok · 8E00:0F44 ok · 4800:0B0C ok · 3400:046E ok · 3400:0D14 ok · 8E00:0880 ok · 8E00:069C ok · 3400:09FB ok · **4800:0DD4 failed** (FaceAttacker/Attack written in Ghidra order) · **3400:0D4A failed** (PoolStatus out-parameters swapped) · 8E00:1431 ok · 8E00:073A ok · 3400:08E5 ok · 8E00:1649 ok · 4800:005F ok · 4800:0C2A ok · 8E00:2E13 ok · 8E00:2C1A ok · 3400:0901 ok · 8E00:1891 ok · 8E00:19BB ok · 8E00:03DE ok · 3400:05DC ok · 4800:0C06 ok · 3400:0590 ok · 8E00:14BF ok · 4800:00FE ok · 6B00:07FD ok · **4800:022C failed** (`CallEffectHooks(c, 7)` instead of `CallEffectHooks(7, c)`) · 8E00:1334 ok · 3400:0F20 ok.
Result: 38/41 on first reading. All three failures were argument order (Ghidra's reversed parameter list copied into ov04/ov08 statements), so every call with two or more arguments in the whole file was then re-audited against its pushes (script over all 406 citations): fixed ov04 HasEffect, DrawText, PoolStatus ×2; ov08 CallEffectHooks ×4, SelectTarget, BeginCast, RestoreTerrain, FocusSquare, AttacksOfOpportunity, StepCombatant, ConfirmAttackAlly, FighterSweep, FaceAttacker, Attack; ov15 SpellList ×4 (= ov19 7F00:299C, signature from its body), FreeSlots (parameters are level, class) ×3. ov22 (written in Pascal order from the start) had no mismatch. After the fixes the 41 sample statements are 41/41 consistent.
Other corrections made while writing ov22: SAVES.md item `+36h` is the `cursed` flag (was `magic_flag`); creature type 0Eh = snake; EndCombat/CombatMain store the camp/combat target selector in `SpellHandlers[0]` (was read as "text window bounds").

## Open items
- Spells 57..67 have no names in the game (SpellNames ends at 56); the names used here (Power_Speed, Power_Cure …) are from their messages and effects — the item/monster lanes should map them to concrete items (wands, potions, breath).
- `SpellCasterLevel` 00BA:26C2 (ENGINE) decides the effective level used by every formula (e.g. Magic Missile dice = level shr 1); its class/level rule is the ENGINE lane's.
- DispelMagic always tests `SpellTargets[1]`, once per target (H as code; a game bug).
- LightningBolt's line-tracing geometry (half-squares, bounce bonus of 8) is M/L; COMBAT's ov30 LineInit/LineStep spec decides.
- Effect types (`+0Ah` of the spell table and the fixed ones in DisplayEffects) are handled by the effect handlers of ov12/ov24 (COMBAT lane); this file only records which spell gives which type.
