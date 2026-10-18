# COMBAT — FINAL Pascal-style pseudocode (lane por-mod-combat)

Units (herdr/assignments/por-areas.md): ov05 (3900), ov07 (4300), ov09 (4D00), ov13 (6100), ov18 (7A00), ov19 (7F00), ov24 (9800).
Sources: `decode/listings/<unit>.lst` (evidence) and `.c` (Ghidra aid); data specs `decode/data/SAVES.md` (TChar, item, effect records), `ITEMS.md`, `MONSTERS.md`; `decode/ecl/ECL_VM.md`; `decode/GLOBALS.md`; `decode/rt/RT_LEDGER.md`. The codex draft `COMBAT.draft.md` was used as a checklist only.
Assembled from `decode/pseudo/combat_parts/<unit>.pas.md`; per-unit evidence tables, unknowns, cross-area questions and self-checks are in `combat_parts/<unit>_notes.md`. Names: `decode/names/combat_names.json` (107 routines, 58 globals).

Conventions (all units, as VIEW.pas.md): signatures in **Pascal order** (first parameter = highest BP offset = pushed first); `{ seg:off }` = first instruction of the statement; globals by GLOBALS.md / lane names, new ones written `Name{g_XXXX}`; runtime calls written as the Pascal they implement; external callees by their published names (normalisation pass: every external call re-checked against its push sequence).

Area notes:
- **ov07 is ECL VM support** (operand fetch, memory access, script loading, menus); `decode/ecl/ECL_VM.md` is the semantic spec and every ecl_names.json name was confirmed against the asm (disagreements in argument order listed in ov07_notes.md (d)).
- **ov19 is mostly party UI** (character sheet with THAC0/Damage/Encumbrance, items, trade, drop, coins, shop sell/identify, spell list); proposal: move to PARTY in por-areas.md.
- **ov24** is the effect/condition engine (effect hooks, saving throws, attack roll, damage, healing); **ov13** the combat actions (initiative, attacks, backstab, turn undead, flee, targeting); **ov09** the computer-controlled combat turn (monsters and Quick mode); **ov05** combat outcome, XP and treasure; **ov18** the dragon finale.
- Original quirks reproduced as found (examples): negative damage wraps (unsigned byte compare), "lost a spell" removes the spell from SelectedChar (the attacker), NPC treasure share truncated to a byte, `START STING` = developer mode ("The Gods intervene!" removes all monsters, ov13 GodsIntervene).


---

## ov05 (seg 3900) — after combat: outcome, duel, experience, treasure (FINAL pseudocode, lane por-mod-combat)

Unit: ov05, analysis segment 3900, 12 routines (functions.tsv), entry `AfterCombat` (stub e1) + init.
Role: everything between the last combat round and the return to the ECL script: decide won / fled / destroyed (and duel won/lost), clean the party list of monsters, compute and award experience, NPC shares, the treasure screen ("View Take Pool Share Detect Exit"), the loot item list, and "The END!" when the party is destroyed. Called only by ECL `COMBAT` (ecl_op24_Combat 2F00:179B, ECL_VM.md op 24: after `CombatMain` combat, and directly when there are no monsters, to show treasure).
Sources: `decode/listings/ov05.lst` (evidence), `ov05.c` (aid). Strings: code segment 3900:083C..0915, 0B02..0B13, 0D20..0D37, 0E2E..0ECC, 12A8..12E7, 14CE..1526 (exact bytes re-read from `decode/bin/ghidra/ov05.bin`; 3900:083C and 3900:12A8 are empty strings `''`).

Conventions (as VIEW.pas.md)
- **Signatures in Pascal order**: first parameter = highest BP offset (pushed first); parameters as `name [BP+xx]`.
- `{ seg:off }` = address of the first instruction of the statement (or of the call implementing it).
- Globals `g_XXXX` = DS:XXXX; names introduced here written `Name{g_XXXX}` at first use, listed in `ov05_names.json` / `ov05_notes.md`. ECL lane names used: `PartyHead` (5D96), `SelectedChar` (5D92), `PartyDead` (49FF), `TreasureMoney` (67F4, 7 LongInts: copper, silver, electrum, gold, platinum, gems, jewelry — indexing `[k*4]`, H), `TreasureItems` (6810, list of 63-byte items linked at +2Ah), `ecl_Mem6B00` (VM block, `w[x]` = word at byte offset x).
- TChar fields by SAVES.md §3 (`c^.side` +10Eh, `c^.status` +10Ch, `c^.active` +10Dh, `c^.money[k]` +88h+2k, `c^.xp` +ACh, `c^.xp_value` +B8h, `c^.xp_per_hp` +BAh, `c^.hp_rolled` +B1h, `c^.level_main` +73h, `c^.class` +2Fh, `c^.str/int/wis/dex` +10h..+13h, `c^.items` +C8h, `c^.npc_morale` +84h, `c^.combatant` +108h, `c^.next` +104h, `c^.mem_spell[i]` +17h+i). Item fields by SAVES.md §4 (`value` +3Ah, `plus` +32h, `readied` +34h, `next` +2Ah).
- `c^.combatant^[$13]` (byte +13h of the 22-byte combat record, FreeMem size 16h at 3900:126C) = 1 marks a combatant that is **not a party member** (every loop over the party portion stops at the first such entry: the monsters are appended behind the party in the PartyHead list) — M (the flag's writer is in ov13/ov10).
- Resident callees (ENGINE names (decode/names/engine_names.json), `Name{SSSS:OOOO}`, arguments in Pascal order = first pushed first; re-checked against the ENGINE/ECL/VIEW/PARTY declarations, fix request #fable-3):
  - `DrawTitledFrame{03F1:02E8}(x1, y1, x2, y2, style, titleColour, title)` — clears the rectangle, draws the frame with `style`, centres `title` on row y1 (asm 03F1:02E8..035C, H).
  - `DrawText{0709:0626}(col, row, colour, s)`; `DrawWrappedText{0709:0768}(col1, row1, col2, row2, colour, clearFirst, s)` (sets the text cursor `text_Col`/`text_Row`); `ClearTextRectangle{0709:0DD3}(col1, row1, col2, row2)`; `ShowBottomPromptAndReadKey{0709:0BF5}(colour, s)` (row 24, waits for a key).
  - `BuildItemName{00BA:0442}(c, item, col, row: Byte; withReady, draw: Boolean)` — fills `item^.name` (SAVES.md §4), RETF 10h; `DrawPartyRoster{00BA:0767}(c)`; `RedrawCurrentMode{00BA:27D9}`.
- Other overlays (names from their lanes where they exist, else behaviour from the body, M/L):
  - `MenuSelect` (ov07 4300:1684, ECL lane, H): `MenuSelect(title, items, c0E, c0C, c0A, acceptEnter, animate): Byte` (0-based item index).
  - `HorizontalMenu(title, items, c0E, c0C, c0A, enterOk, animate, var special): Char` — horizontal menu input (ECL.pas.md 4300:1684 description, M): returns the key (upper-case hotkey letter, 13 = Enter, 0 = Esc), `special` := 1 for an extended key.
  - `VerticalListMenu(title, keys, c24, c22, c20, x1, y1, x2, y2, list, b12, var flag, var index, var cur): Char` — scrolling vertical list picker over an item list (ECL.pas.md VerticalListMenu, M).
  - `RemoveFromParty(keepCount, freeIcon: Byte)` — unlink `SelectedChar` from the PartyHead list and free it (FreeCharacter); `freeIcon <> 0` → release its icon slot (`stub_ov32_e3(c^.party_slot)`); `keepCount = 0` → `ecl_Mem6B00^.w[$67C]` (party member count) := −1; SelectedChar := the previous member (ov16.c 7000:3291, M).
  - `TreasurePoolStatus(var money, var items: Boolean)` — money := some TreasureMoney[k] ≠ 0; items := TreasureItems ≠ nil (ov21.c, H).
  - `TakeMoney` take coins ("Select type of coin", "How much", "will you take?"), `PoolMoney` pool the party's money, `ShareMoney` share the pool, `AddItemToChar(item, var refused)` give an item to SelectedChar ("OverLoaded" → refused), `ViewMenu(var special)` character view ("Items Spells Trade Drop Exit", "View:"), `CycleSelectedChar(key)` extended-key command (select character), `CastSpell(spell, 0, 0, var special)` cast a memorised spell (here Detect Magic) — roles M from their strings.

---

### 3900:0000 ComputeCombatXP (H)
`procedure ComputeCombatXP(var xp [BP+6]: LongInt)` — RETF 4. Caller: ResolveCombatOutcome (2×, with `@CombatXP{g_84D6}`). Callees: Roll, GetMem, BuildItemName, @CopyBytes, @LongDivMod, @LongMul.
Per-character experience for the battle. Duel: the opponent's level × 100. Otherwise: for every enemy that did not run away, its XP value (+B8h + hp_rolled × xp_per_hp), its money goes into the treasure pool, and its items go into the treasure list (always if the item has a value, else with 30 % chance while fewer than 8 items have been taken); then the treasure is worth XP too (coins converted to gold pieces, gems 250, jewelry 2200, magic items 400 per plus); the sum is divided by the number of party members still sharing. Name H (result shown as "Each character receives …", added to `+ACh` by AwardXP).
```pascal
if (DuelActive{g_84D4} <> 0) and (ecl_Mem6B00^.w[$5CC] <> 0) then begin             { 3900:0006 }
  xp := SmallInt(ShortInt(SelectedChar^.level_main) * 100);                        { 3900:0019  16-bit product, sign-extended }
  exit;
end;
total := 0;                                                                          { 3900:0035 }
c := PartyHead;                                                                      { 3900:003d }
taken := 0;                                                                          { 3900:004a  items taken from the enemies }
while c <> nil do begin                                                              { 3900:004e }
  it := c^.items;                                                                    { 3900:0059 }
  if (c^.side = 1) and (c^.status <> 3) then begin                                   { 3900:006c  enemy, not Running }
    EnemiesFought{g_443A} := 1;                                                      { 3900:0088 }
    for k := 0 to 6 do                                                               { 3900:008d }
      TreasureMoney[k] := TreasureMoney[k] + c^.money[k];                            { 3900:0096  word zero-extended }
    total := total + c^.xp_value + LongInt(SmallInt(c^.hp_rolled * c^.xp_per_hp));   { 3900:00c4  8×8-bit MUL then CWD }
    if ecl_Mem6B00^.w[$5C6] <> 1 then                                                { 3900:00fb  1 = enemies' items are not looted }
      while it <> nil do begin                                                       { 3900:010a }
        if (it^.value > 0) or ((taken < 8) and (Roll(1, 10) <= 3)) then begin        { 3900:0115 }
          taken := taken + 1;                                                        { 3900:013a }
          old := TreasureItems;                                                      { 3900:013d / 01a0 }
          GetMem(TreasureItems, $3F);                                                { 3900:0146 / 01ad }
          BuildItemName(c, it, 0, 0, 0, 0);                                       { 3900:0156 / 01bd }
          TreasureItems^ := it^;                                                     { 3900:0173 / 01da  63-byte copy }
          TreasureItems^.readied := 0;                                               { 3900:0187 / 01ee }
          TreasureItems^.next := old;                                                { 3900:0190 / 01f7  pushed at the head (nil if the list was empty) }
        end;
        it := it^.next;                                                              { 3900:0209 }
      end;
  end;
  c := c^.next;                                                                      { 3900:021d }
end;
total := total + TreasureMoney[0] div 200;                                           { 3900:0233  copper }
total := total + TreasureMoney[1] div 20;                                            { 3900:024a  silver }
total := total + TreasureMoney[2] div 2;                                             { 3900:0261  electrum }
total := total + TreasureMoney[3];                                                   { 3900:0278  gold }
total := total + TreasureMoney[4] * 5;                                               { 3900:0285  platinum }
total := total + TreasureMoney[5] * 250;                                             { 3900:029c  gems }
total := total + TreasureMoney[6] * 2200;                                            { 3900:02b3  jewelry (898h) }
it := TreasureItems;                                                                 { 3900:02ca }
while (it <> nil) and (it <> g_5D9A) do begin                                        { 3900:02d7  g_5D9A:g_5D9C = list mark set in combat (Attack), 0 at combat start (StartCombat) }
  if it^.plus > 0 then                                                               { 3900:02f1  signed }
    total := total + LongInt(SmallInt(it^.plus * 400));                              { 3900:02fb }
  it := it^.next;                                                                    { 3900:030f }
end;
xp := total div Word(ecl_Mem6B00^.w[$67C] - NonSharing{g_84D5});                     { 3900:0322  signed 32-bit div, 16-bit divisor; 0 → runtime error 200 }
```
Notes: all treasure in the pool counts, including money/items that were already in it (e.g. placed by the ECL TREASURE opcode) up to the mark `g_5D9A`. `hp_rolled × xp_per_hp` above 32767 becomes negative (CWD of an unsigned product) — H, original quirk.

### 3900:0355 AwardXP (H)
`procedure AwardXP(xp [BP+6]: LongInt)` — RETF 4 (value parameter). Caller: ResolveCombatOutcome. Callee: @LongDivMod.
Adds the share to every active party member that is not Animated: +10 % for a single-class cleric/fighter/magic-user/thief whose prime requisite is ≥ 16; multi-class characters get xp/2 (two classes) or xp/3 (three classes). Name H (SAVES.md §3a).
```pascal
c := PartyHead;                                                                      { 3900:035b }
while c <> nil do begin                                                              { 3900:0368 }
  if (c^.active <> 0) and (c^.status <> 1) then begin                                { 3900:0373 }
    share := xp;                                                                     { 3900:038f }
    case c^.class of                                                                 { 3900:039b }
      0:  if c^.wis > 15 then share := xp div 10 + xp;                               { 3900:03a6  cleric, WIS +12h }
      2:  if c^.str > 15 then share := xp div 10 + xp;                               { 3900:03d3  fighter, STR +10h }
      5:  if c^.int > 15 then share := xp div 10 + xp;                               { 3900:0400  magic-user, INT +11h }
      6:  if c^.dex > 15 then share := xp div 10 + xp;                               { 3900:042c  thief, DEX +13h }
      8, 10..14, 16: share := xp div 2;                                              { 3900:0454  C/F, C/R, C/MU, C/T, F/MU, F/T, MU/T }
      9, 15:         share := xp div 3;                                              { 3900:047c  C/F/MU, F/MU/T }
    end;                                                                             { druid 1, paladin 3, ranger 4, monk 7: share = xp }
    c^.xp := c^.xp + share;                                                          { 3900:049a }
  end;
  c := c^.next;                                                                      { 3900:04ad }
end;
```
Note: the loop runs over the whole PartyHead list (monsters are inactive at this point); paladins and rangers get no prime-requisite bonus (H, no case for 3/4).

### 3900:04C9 ResolveCombatOutcome (M)
`procedure ResolveCombatOutcome` — RETF. Caller: AfterCombat. Callees: ComputeCombatXP, AwardXP, RemoveFromParty.
Decides destroyed / fled / won, counts the members that do not share XP, awards XP when someone is still standing, then repairs the party: after a normal end, runners return and dying/unconscious members recover; if the party fled, everyone who did not run is **removed from the party**; if the party is destroyed, all members are removed and the member count is set to 0. Duel: only the duelist is checked and awarded.
```pascal
NonSharing := 0;                                                                     { 3900:04cf }
PartyDead := 1;                                                                      { 3900:04d4 }
PartyFled{g_443B} := 0;                                                              { 3900:04d9 }
c := PartyHead;                                                                      { 3900:04de }
while (c <> nil) and (c^.combatant^[$13] <> 1) do begin                              { 3900:04eb }
  if c^.status = 3 then PartyFled := 1;                                              { 3900:0502  someone ran away }
  c := c^.next;                                                                      { 3900:0512 }
end;
if DuelActive <> 0 then PartyDead := 0;                                              { 3900:0527 }
PartyWon{g_84DA} := 0;                                                               { 3900:0533 }
c := PartyHead;                                                                      { 3900:0538 }
if DuelActive = 0 then begin                                                         { 3900:0545 }
  while (c <> nil) and (c^.combatant^[$13] <> 1) do begin                            { 3900:054f }
    if (c^.status in [3, 1, 0]) or (ecl_Mem6B00^.w[$5CC] = 1) then                   { 3900:056c }
      if (c^.side = 0) and (c^.npc_morale < $80) then PartyDead := 0;                { 3900:0599  a PC (not an NPC) is still alive / fled }
    if c^.status in [1, 0] then begin                                                { 3900:05b4 }
      PartyWon := 1;                                                                 { 3900:05ca }
      PartyFled := 0;                                                                { 3900:05cf }
    end;
    if (c^.active = 0) or (c^.status = 1) then NonSharing := NonSharing + 1;         { 3900:05d4 }
    c := c^.next;                                                                    { 3900:05ee }
  end;
  if PartyWon <> 0 then begin                                                        { 3900:0604 }
    ComputeCombatXP(CombatXP{g_84D6});                                               { 3900:060b }
    AwardXP(CombatXP);                                                               { 3900:0614 }
  end;
  c := PartyHead;                                                                    { 3900:0620 }
  if PartyDead = 0 then begin                                                        { 3900:062d }
    while (c <> nil) and (c^.combatant^[$13] <> 1) do begin                          { 3900:0637 }
      if PartyFled = 0 then                                                          { 3900:0654 }
        case c^.status of                                                            { 3900:065b }
          3: begin c^.status := 0; c^.active := 1 end;                               { 3900:0667  Running → Okay }
          5: c^.status := 4;                                                         { 3900:067f  Dying → Unconscious }
          4: if c^.hp > 0 then begin c^.status := 0; c^.active := 1 end;             { 3900:068e }
        end
      else begin
        ecl_Mem6B00^.w[$58E] := $81;                                                 { 3900:06ad  combat result for ECL: fled }
        if c^.status = 3 then begin c^.status := 0; c^.active := 1 end               { 3900:06b8 }
        else begin
          SelectedChar := c;                                                         { 3900:06d7 }
          RemoveFromParty(0, 1);                                                           { 3900:06e4  left behind: removed from the party }
        end;
      end;
      c := c^.next;                                                                  { 3900:06ef  read after c may have been freed }
    end;
  end else begin
    c := PartyHead;                                                                  { 3900:0707 }
    stop := false;                                                                   { 3900:0714 }
    while (c <> nil) and not stop do begin                                           { 3900:0718 }
      if c^.combatant^[$13] = 1 then stop := true                                    { 3900:0726 }
      else begin
        SelectedChar := c;                                                           { 3900:0735 }
        RemoveFromParty(0, 1);                                                             { 3900:0742 }
      end;
      c := c^.next;                                                                  { 3900:0753 }
    end;
    ecl_Mem6B00^.w[$67C] := 0;                                                       { 3900:0768  no party members }
  end;
end else begin                                                                       { duel }
  c := PartyHead;                                                                    { 3900:0776 }
  while c <> nil do begin                                                            { 3900:0783 }
    if (c^.active = 1) and (c^.status = 0) and (c^.side <> 1) then begin             { 3900:078b }
      PartyWon := 1;                                                                 { 3900:07ac }
      ComputeCombatXP(CombatXP);                                                     { 3900:07b1 }
      AwardXP(CombatXP);                                                             { 3900:07ba }
    end;
    c := c^.next;                                                                    { 3900:07c6 }
  end;
  c := PartyHead;                                                                    { 3900:07db }
  while c <> nil do begin                                                            { 3900:07e8 }
    if c^.status in [0, 1] then c^.active := 1;                                      { 3900:07f0 }
    if c^.status = 5 then c^.status := 4;                                            { 3900:080f }
    c := c^.next;                                                                    { 3900:0823 }
  end;
end;
```
Notes: `RemoveFromParty` frees the character record; the loop then reads `c^.next` (+104h) from the freed block (TP's FreeMem only overwrites the first 8 bytes, so it still works) — H, keep the order when porting. When the party fled, the members that did not flee (unconscious, dying, dead, stoned, also `Okay` ones if some fled and none stayed `Okay`) are lost.

### 3900:0916 ShowCombatResult (H)
`procedure ShowCombatResult(xp [BP+6]: LongInt)` — RETF 4. Caller: AfterCombat (with CombatXP). Callees: DrawTitledFrame, DrawText, StrLong, HorizontalMenu.
The result screen (COMBAT-ov05-01). `xp` is a value parameter: the zeroing below only changes the number shown.
```pascal
title := '';                                                                         { 3900:091d }
DrawTitledFrame(1, 1, 38, 22, 0, 15, '');                                            { 3900:0922 }
if (EnemiesFought <> 0) or (DuelActive <> 0) then begin                              { 3900:0949 }
  if (DuelActive <> 0) and (PartyWon = 0) then begin                                 { 3900:095a }
    DrawText(1, 3, 10, 'You have lost the duel.');                                   { 3900:0968 }
    xp := 0;                                                                         { 3900:0986 }
  end else if DuelActive <> 0 then
    DrawText(1, 3, 10, 'You have won the duel.')                                     { 3900:0997 }
  else
    DrawText(1, 3, 10, 'The party has won.');                                        { 3900:09b7 }
end else if PartyFled <> 0 then begin                                                { 3900:09d7 }
  DrawText(1, 3, 10, 'The party has fled.');                                         { 3900:09de }
  xp := 0;                                                                           { 3900:09fc }
end else
  DrawText(1, 3, 10, 'The party has found Treasure!');                               { 3900:0a06 }
Str(xp:0, n);                                                                        { 3900:0a24  string[10] }
if DuelActive <> 0 then s := 'The duelist receives ' + n                             { 3900:0a3b }
else s := 'Each character receives ' + n;                                            { 3900:0a6d }
DrawText(1, 5, 10, s);                                                               { 3900:0a96 }
DrawText(1, 7, 10, 'experience points.');                                            { 3900:0aaa }
HorizontalMenu(title, 'press <enter>/<return> to continue', 15, 15, 15, 1, 0, special);  { 3900:0ac8  result unused }
```
Notes: in a treasure-only encounter (no monsters) ResolveCombatOutcome still sets PartyWon and ComputeCombatXP turns the treasure's value into XP, so the screen reads "The party has found Treasure!" / "Each character receives N experience points." with N = treasure XP. CombatXP is never cleared: if ComputeCombatXP was not called (nobody standing, not fled, not destroyed — only possible through the `ecl_Mem6B00^.w[$5CC] = 1` rule) the number of the previous battle is shown (H for the data flow, rare case).

### 3900:0B14 ChooseLootItem (M)
`procedure ChooseLootItem(var key [BP+12h]: Char; var sel [BP+0Eh]: PItem; var cur [BP+0Ah]: PItem; var index [BP+6]: Word)` — RETF 10h. Caller: TakeLootItems. Callees: DrawTitledFrame, BuildItemName, VerticalListMenu.
Draws the "Loot" frame and the list of treasure items; returns the key and the highlighted item.
```pascal
flag := 1;                                                                           { 3900:0b1a }
DrawTitledFrame(1, 1, 38, 22, 0, 15, 'Loot');                                        { 3900:0b1e }
it := TreasureItems;                                                                 { 3900:0b44 }
while it <> nil do begin                                                             { 3900:0b51 }
  BuildItemName(nil, it, 0, 0, 0, 0);                                             { 3900:0b59  refresh the item names }
  it := it^.next;                                                                    { 3900:0b76 }
end;
list := TreasureItems;                                                               { 3900:0b89 }
key := VerticalListMenu('Items: ', 'Take', 13, 10, 15, 1, 4, 38, 22, list, 1, flag, index, cur);   { 3900:0b96 }
sel := cur;                                                                          { 3900:0bec }
```

### 3900:0C06 TakeLootItems (M)
`procedure TakeLootItems` — RETF. Callers: TakeTreasureMenu (2×). Callees: ChooseLootItem, AddItemToChar, FreeMem, RedrawCurrentMode.
Repeats: pick an item, `T` or Enter gives it to SelectedChar (refused when overloaded) and removes it from the treasure; any other key leaves; also leaves when the list is empty.
```pascal
sel := nil;                                                                          { 3900:0c0c }
cur := TreasureItems;                                                                { 3900:0c14 }
index := 0;                                                                          { 3900:0c21 }
repeat
  ChooseLootItem(key, sel, cur, index);                                              { 3900:0c26 }
  if (key <> 'T') and (key <> #13) then done := true                                 { 3900:0c3e }
  else begin
    done := false;                                                                   { 3900:0c51 }
    AddItemToChar(sel, refused);                                                         { 3900:0c55  give to SelectedChar }
    if not refused then begin                                                        { 3900:0c65 }
      if TreasureItems = sel then TreasureItems := sel^.next                         { 3900:0c6e }
      else begin
        p := TreasureItems;                                                          { 3900:0c6e }
        while p^.next <> sel do p := p^.next;                                        { 3900:0c9f }
        p^.next := sel^.next;                                                        { 3900:0cc7 }
      end;
      sel^.next := nil;                                                              { 3900:0cdd }
      if sel <> nil then FreeMem(sel, $3F);                                          { 3900:0cea  AddItemToChar keeps its own copy }
      if TreasureItems = nil then done := true;                                      { 3900:0d01 }
    end;
  end;
until done;                                                                          { 3900:0d0e }
RedrawCurrentMode;                                                                   { 3900:0d17 }
```

### 3900:0D38 TakeTreasureMenu (M)
`procedure TakeTreasureMenu(var money [BP+0Ah], items [BP+6]: Boolean)` — RETF 8. Caller: TreasureMenu (key `T`). Callees: TakeLootItems, TakeMoney, RedrawCurrentMode, HorizontalMenu, CycleSelectedChar, DrawPartyRoster, TreasurePoolStatus.
Only money → coin dialog; only items → item list; both → "Take: Money Items Exit" until one kind is gone.
```pascal
done := false;                                                                       { 3900:0d3e }
if not money then begin TakeLootItems; exit end;                                     { 3900:0d42 / 0e24 }
if not items then begin TakeMoney; RedrawCurrentMode; exit end;                      { 3900:0d4e / 0e18 }
repeat
  key := HorizontalMenu('Take: ', 'Money Items Exit', 13, 10, 15, 1, 1, special);         { 3900:0d5a }
  case key of                                                                        { 3900:0d94 }
    'M': begin TakeMoney; RedrawCurrentMode end;                                     { 3900:0d9b }
    'I': TakeLootItems;                                                              { 3900:0dab }
    'E', #0: done := true;                                                           { 3900:0db9 }
    'G', 'O': CycleSelectedChar(key);                                                        { 3900:0dc3 / 0dd2  47h/4Fh }
  end;
  DrawPartyRoster(SelectedChar);                                                     { 3900:0ddb }
  TreasurePoolStatus(money, items);                                                           { 3900:0de8 }
  if (not money) or (not items) then done := true;                                   { 3900:0df7 }
until done;                                                                          { 3900:0e0d }
```
Note: `'G'`/`'O'` (47h/4Fh, also the Home/End scan codes) are passed to CycleSelectedChar without looking at `special`; the menu is left as soon as one kind of treasure is exhausted (the outer TreasureMenu then offers the rest).

### 3900:0ECD TreasureMenu (M)
`procedure TreasureMenu` — RETF. Caller: AfterCombat. Callees: RedrawCurrentMode, TreasurePoolStatus, HorizontalMenu, ViewMenu, TakeTreasureMenu, PoolMoney, ShareMoney, CastSpell, DrawWrappedText, MenuSelect, ClearTextRectangle, CycleSelectedChar, DrawPartyRoster.
The treasure screen (COMBAT-ov05-03): View / Take / Pool / Share / Detect / Exit; on Exit with treasure left asks "Do you want to go back and claim your treasure?".
```pascal
title := '';                                                                         { 3900:0ed4 }
done := false;                                                                       { 3900:0ed9 }
RedrawCurrentMode;                                                                   { 3900:0ede }
repeat
  money := false;                                                                    { 3900:0ee3 }
  TreasurePoolStatus(money, items);                                                           { 3900:0ee7 }
  menu := 'View Pool Exit';                                                          { 3900:0ef6 }
  i := 0;                                                                            { 3900:0f0a }
  tail := ' Exit';                                                                   { 3900:0f0f  string[13] }
  detect := false;                                                                   { 3900:0f23 }
  while items and (i <= 20) and not detect do begin                                  { 3900:0f28 }
    if (SelectedChar^.mem_spell[i] = 5) or (SelectedChar^.mem_spell[i] = $0B) then begin   { 3900:0f3c  Detect Magic (cleric 5 / magic-user 0Bh, M) }
      detect := true;                                                                { 3900:0f62 }
      spell := SelectedChar^.mem_spell[i];                                           { 3900:0f67 }
    end;
    i := i + 1;                                                                      { 3900:0f7b }
  end;
  if detect then tail := ' Detect Exit';                                             { 3900:0f81 }
  if money then menu := 'View Take Pool Share' + tail                                { 3900:0f9c }
  else if items then menu := 'View Take Pool' + tail;                                { 3900:0fce }
  key := HorizontalMenu(title, menu, 13, 10, 15, 1, 1, special);                          { 3900:0ffe }
  case key of                                                                        { 3900:1028 }
    'V': ViewMenu(special);                                                         { 3900:1030 }
    'T': TakeTreasureMenu(money, items);                                             { 3900:1042 }
    'P': if not special then PoolMoney;                                              { 3900:1057 }
    'S': ShareMoney;                                                                  { 3900:106a }
    'D': CastSpell(spell, 0, 0, special);                                            { 3900:1076 }
    'E', #0: begin                                                                   { 3900:109a }
        TreasurePoolStatus(money, items);
        if (not money) and (not items) then done := true                             { 3900:10a9 / 115f }
        else begin
          menu := '~Yes ~No';                                                        { 3900:10b8 }
          DrawWrappedText(1, 17, 38, 22, 10, 1, 'There is still treasure left.  ');  { 3900:10cc }
          DrawWrappedText(1, 17, 38, 22, 15, 0, 'Do you want to go back and claim your treasure?');   { 3900:10f3 }
          ans := MenuSelect(title, menu, 13, 10, 15, 0, 0);                          { 3900:111a }
          if ans = 1 then done := true                                               { 3900:113e  "No" }
          else ClearTextRectangle(1, 17, 38, 22);                                         { 3900:114c }
        end;
      end;
    'G', 'O': begin CycleSelectedChar(key); DrawPartyRoster(SelectedChar) end;               { 3900:116a / 1187 }
  end;
until done;                                                                          { 3900:119e }
```
Notes: "Detect" is offered only while there are items and SelectedChar has spell 5 or 0Bh memorised (only the last found id is kept; the scan stops at the first). `Pool` (P) is ignored when the key came as an extended key. "Share" appears only while there is money; "Take" only when there is money or items.

### 3900:11AC RemoveMonstersAfterCombat (M)
`procedure RemoveMonstersAfterCombat` — RETF. Caller: AfterCombat. Callees: RemoveFromParty, FreeMem.
Removes every non-party combatant and every party member on the enemy side from the party list (counting those that were not active), frees the party members' combat records, and selects the first member.
```pascal
ecl_Mem6B00^.w[$590] := 0;                                                           { 3900:11b2 }
c := PartyHead;                                                                      { 3900:11bd }
while c <> nil do                                                                    { 3900:11ca }
  if (c^.combatant^[$13] = 1) or (c^.side = 1) then begin                            { 3900:11d5 }
    if c^.active <> 1 then ecl_Mem6B00^.w[$590] := ecl_Mem6B00^.w[$590] + 1;         { 3900:11ef  defeated enemies (ECL variable) }
    n := c^.next;                                                                    { 3900:1203 }
    SelectedChar := c;                                                               { 3900:1216 }
    RemoveFromParty(Ord(c^.combatant^[$13] = 1), 1);                                       { 3900:1223  a party member on side 1 also lowers the member count }
    c := n;                                                                          { 3900:123e }
  end else begin
    if c^.combatant <> nil then begin                                                { 3900:124c }
      FreeMem(c^.combatant, $16);                                                    { 3900:125b  22-byte combat record }
      c^.combatant := nil;                                                           { 3900:1271 }
    end;
    c := c^.next;                                                                    { 3900:1280 }
  end;
SelectedChar := PartyHead;                                                           { 3900:1296 }
```

### 3900:12E8 NpcTakesShare (H)
`procedure NpcTakesShare` — RETF. Caller: AfterCombat. Callees: @LongDivMod, DrawTitledFrame, DrawWrappedText, HorizontalMenu.
Every NPC (npc_morale bit 7) with status Okay takes `npc_shares = c^.b85 and 7` shares of each coin type in the pool; party members count one share each.
```pascal
hid := false;                                                                        { 3900:12ef }
c := PartyHead;                                                                      { 3900:12f3 }
npcShares := 0;  totalShares := 0;                                                   { 3900:1300 }
while c <> nil do begin                                                              { 3900:1308 }
  if (c^.npc_morale > $7F) and (c^.status = 0) then begin                            { 3900:1310 }
    npcShares := npcShares + (c^.b85 and 7);                                         { 3900:1326  +85h }
    totalShares := totalShares + (c^.b85 and 7);                                     { 3900:1333 }
  end else
    totalShares := totalShares + 1;                                                  { 3900:1342  every other list entry }
  c := c^.next;                                                                      { 3900:1345 }
end;
if npcShares > 0 then                                                                { 3900:135a }
  for k := 0 to 6 do                                                                 { 3900:1360 }
    if TreasureMoney[k] > 0 then begin                                               { 3900:1369  signed 32-bit }
      per := Byte(TreasureMoney[k] div totalShares);                                 { 3900:1383  quotient truncated to a byte! }
      TreasureMoney[k] := TreasureMoney[k] - LongInt(SmallInt(per * npcShares));     { 3900:13a8 }
      hid := true;                                                                   { 3900:13cd }
    end;
if hid then begin                                                                    { 3900:13d7 }
  DrawTitledFrame(1, 1, 38, 22, 0, 15, '');                                          { 3900:13e0 }
  c := PartyHead;                                                                    { 3900:1406 }
  row := 0;                                                                          { 3900:1413 }
  while c <> nil do begin                                                            { 3900:1417 }
    if (c^.npc_morale > $7F) and (c^.status = 0) and (c^.b85 > 0) then begin         { 3900:141f }
      DrawWrappedText(5, row + 5, 34, 22, 10, 1, c^.name + ' takes and hides his share.');   { 3900:1440 }
      row := row + 2;                                                                { 3900:1477 }
    end;
    c := c^.next;                                                                    { 3900:147b }
  end;
  HorizontalMenu('', 'press <enter>/<return> to continue', 15, 15, 15, 1, 0, special);  { 3900:1490 }
end;
```
Notes (H, original quirks): `per` is the low byte of the quotient, so a pile of more than 255 × totalShares coins of one kind loses only `(quotient mod 256) × npcShares`; monsters still in the list would count as shares (none are left: RemoveMonstersAfterCombat runs first). The message line is shown for NPCs with `b85 > 0` even if `b85 and 7 = 0`.

### 3900:1527 AfterCombat (H)
`procedure AfterCombat` — RETF, entry (stub e1). Caller: ecl_op24_Combat (ECL COMBAT, after `CombatMain` and for treasure-only encounters). Callees: ResolveCombatOutcome, RemoveMonstersAfterCombat, NpcTakesShare, ShowCombatResult, TreasureMenu, FreeMem, DrawTitledFrame, DrawWrappedText, ShowBottomPromptAndReadKey.
```pascal
ecl_Mem6B00^.w[$58E] := 0;                                                           { 3900:152d  combat result for the script }
EnemiesFought := 0;                                                                  { 3900:1538 }
game_Mode := 6;                                                                         { 3900:153d  game mode: after combat }
ResolveCombatOutcome;                                                                { 3900:1542 }
RemoveMonstersAfterCombat;                                                           { 3900:1546 }
if (PartyDead = 0) or (DuelActive <> 0) then begin                                   { 3900:154a }
  NpcTakesShare;                                                                     { 3900:1558 }
  ShowCombatResult(CombatXP);                                                        { 3900:155c }
  TreasureMenu;                                                                      { 3900:1568 }
  it := TreasureItems;                                                               { 3900:156c  unclaimed items are lost }
  while it <> nil do begin                                                           { 3900:1579 }
    n := it^.next;                                                                   { 3900:1581 }
    FreeMem(it, $3F);                                                                { 3900:159e }
    it := n;
  end;
  TreasureItems := nil;                                                              { 3900:15af }
end else begin
  ecl_Mem6B00^.w[$58E] := $80;                                                       { 3900:15b9  party destroyed }
  DrawTitledFrame(1, 1, 38, 22, 0, 15, 'The END!');                                  { 3900:15c4 }
  text_Col := 2;  text_Row := 6;                                                         { 3900:15ea  text cursor }
  DrawWrappedText(2, 5, 37, 22, 10, 1, 'The monsters rejoice for the party has been destroyed');   { 3900:15f4 }
  ShowBottomPromptAndReadKey(13, 'Press any key to continue');                       { 3900:161a }
end;
TextOutputActive := 1;                                                                         { 3900:1631  both paths (JMP 1631 at 3900:15b7) }
ecl_Mem6B00^.w[$6E0] := 0;                                                           { 3900:1636  side to-hit modifiers (AttackRoll) }
ecl_Mem6B00^.w[$6E2] := 0;                                                           { 3900:1641 }
ecl_Mem6B00^.w[$6E4] := 0;                                                           { 3900:164c }
ecl_Mem6B00^.w[$5C6] := 0;                                                           { 3900:1657  "no loot" flag }
ecl_Mem6B00^.w[$5CC] := 0;                                                           { 3900:1662  duel-XP flag }
```
Note: unclaimed coins stay in `TreasureMoney` (only the item list is freed here) — H; who clears the money is outside ov05 (ecl_op1C_ClearMonsters writes TreasureMoney).

### 3900:1671 ov05_init (H)
Empty unit initialiser (`PUSH BP; MOV BP,SP; POP BP; RETF`), called from the main init chain.  { 3900:1671 }

---

## ov07 (seg 4300) — ECL VM support: POINTER

**Canonical section: `decode/pseudo/ECL.pas.md` (ov07, 33 routines).** Decided in `decode/CROSSREF.md` §1: ov07 is the ECL VM's operand/memory/script-loading support. por-mod-combat decoded the unit independently (`decode/pseudo/combat_parts/ov07.pas.md`, kept as the second decode). Result of the comparison: all 33 routine names agree; the bodies are semantically identical. The differences are anchor convention only (combat_parts cites the first instruction of each statement) and global naming (combat_parts uses the published names, e.g. `view_RedrawPos` for g_84E6). The data-in-code table was moved to ECL.pas.md.


---

## ov09 (seg 4D00) — combat AI: computer-controlled combatant turn (FINAL pseudocode, lane por-mod-combat)

Unit: ov09, analysis segment **4D00** (stub seg 0038, GAME.OVR ofs 00ABC0, code 1927h, 2 entries: e0 = ov09_init, e1 = 4D00:000F).
Role: the turn of every combatant that the computer plays — monsters and party members in *Quick* mode (TChar `+10Fh <> 0`). Morale/flight, turn undead, magic items, spell choice, weapon choice, step-by-step movement towards (or away from) a target, and the attack. Callers: ov08 `TakeTurn` 4800:01F6 (at 4800:02c1, when `c.+10Fh <> 0`) and ov08 `PlayerTurn` 4800:031A (at 4800:0485, menu key `Q` = Quick, after `SetQuick` 4800:122B) — ov08 names from magic_names.json.
Sources: `decode/listings/ov09.lst` (evidence), `ov09.c` (aid). Data: `decode/data/SAVES.md` (TChar §3, item §4, effect §5, ITEMS §6), `ITEMS.md`.

## Conventions
- Format as `decode/pseudo/VIEW.pas.md`: **signatures in Pascal order** (first parameter = highest BP offset; Ghidra's `param_1..n` is the reverse), `name [BP+xx]`; `{ seg:off }` = first instruction of the statement.
- `c` = the acting combatant (a TChar far pointer, SAVES.md §3); `cb` = `c.combatant^` (`c+108h`, far pointer to the per-combat record). Item records: SAVES.md §4; `ITEMS[t].field` = `DS:5582 + t*16 + j` (SAVES.md §6 names).
- Byte arithmetic is kept where the asm stores into a byte (`Byte(...)`); `div`/`mod` are the signed `IDIV` the code uses.
- Runtime: `Roll(n, s)` = ov24 `9800:0DE3` (sum of `n` × (`Random(s)+1`), ecl_names H, verified: count `[BP+8]`, sides `[BP+6]`); `StrCopy` temporaries are written as string literals.
- Routines of other units are written with their **published names** (decode/names/*.json: engine_names, view_names, magic_names, ecl_names; the re-exported listings show them as `;` comments); routines without a published name keep their `ovNN_XXXX`/`FUN_` name, with the behaviour in the comment and in `ov09_notes.md` §(a2). Arguments in Pascal order (first pushed = first argument), checked against each callee's published signature (notes, Normalisation pass).
- Globals: `Name{g_XXXX}` for names introduced here (ov09_names.json, notes §b); names of other lanes without braces: `cb_Char` (g_65B9, combatant n → TChar), `cb_Col`/`cb_Row` (g_5F27/g_5F28, per combatant n ×4), `tg_List`/`tg_Count` (g_6718+3n: who, dist, dir / g_671A), `cm_Map` (g_6716), `CombatTerrain[t].cost` (g_2744 + 4t) — view_names.json / VIEW.pas.md; ov30/ov31/ov25 routine names (BuildTargetList, TraceLine, CombatantCol/Row, ProbeMove, ShowCombatant, FocusSquare, ClearMenuLine) are VIEW's.

### Combat record `cb` (`c+108h`) — fields used by ov09 (record owned by ov13; names are this file's, conf in brackets)
| off | name here | evidence | conf |
|---|---|---|---|
| +00 | `castingSpell` | BeginCast stores the spell id when "Begins Casting" (casting time > 0); ov09 finishes it with CastSpell | H |
| +01 | `mayCast` | set 1 by StartCombatRound (round init), cleared by ov12/ov24 effect handlers; ov09 gathers memorised spells only if ≠ 0 | M |
| +02 | `mayUseItems` | set 1 by StartCombatRound, cleared together with +01 by ov12 (ov12.c:537/755); ov09 uses magic items only if ≠ 0 | M |
| +03 | `initiative` | StartCombatRound: 1d6 + DexMissileAdj (−6 when surprised), clamped 0..20; ClearCombatantActionFlags sets 0; ov09: `> 0` and `< 14h` = may still act, 14h = handed back to the player | M |
| +06 | `moveLeft` | half-square move points: shown as "Move Left = " `moveLeft shr 1`; orthogonal step costs 2, diagonal 3 (× terrain cost); StartCombatRound sets it from CalcMove | H |
| +07 | `guarding` | SetGuarding sets 1 and shows "Guarding"; ClearCombatantActionFlags clears | H |
| +09 | `facing` | direction 0..7; ShowCombatant writes it, StepCombatant/08B2 step along it | H |
| +0A | `target` | far ptr to the target TChar; AutoTarget sets/clears it; Attack attacks it | H |
| +10 | `turned` | TurnUndead (turn undead) sets 1 ("is turned"); ov09 then forces flight ("is forced to flee") | H |
| +11 | `hasTurned` | TurnUndead sets 1 at the start of a turn attempt; ov09 only tries Turn Undead while 0 | H |
| +14 | `fleeing` | set by the morale check, shown as "flees in panic"; while set the AI moves away from the party | H |
| +15 | `movePattern` | 1..6, row of the direction-offset table `ai_DirOffsets{g_02AE}` (5 tries per row) | M |

---

### 4D00:000F AiCombatTurn (H)
`procedure AiCombatTurn(c [BP+6]: PChar)` — callers: ov08 TakeTurn (4800:02c1), PlayerTurn (4800:0485, key `Q`) via stub_ov09_e1. Callees: CheckCombatHotkeys, AiMoraleCheck, AiTryUseMagicItem, AiTryTurnUndead, AiTryCastSpell, AiReadyBestWeapon, AiMoveAttack, AiEndTurn; ClearMenuLine{ClearMenuLine}, ClearCharacterMessage, ClearCombatantActionFlags, ShowCharacterMessage, CastSpell, AutoTarget, Roll.
One complete computer-controlled turn. The decision order is: hot keys → movement pattern → morale → (finish a spell being cast | use a magic item | turn undead | cast a spell | re-arm) → move/attack loop until the turn is over.
```pascal
done := CheckCombatHotkeys(c);                                   { 4d00:0015 }
ClearMenuLine;                                                   { 4d00:0022  ClearMenuLine: 40 blanks at row 24 }
ClearCharacterMessage;                                               { 4d00:0027  00ba:17e3 }
if c.active = 0 then done := ClearCombatantActionFlags(c);                         { 4d00:002c  TChar +10Dh }
pat := cb.movePattern;                                           { 4d00:0045 }
if (pat = 0) or (pat > 4) or (Roll(1, 4) = 1) then begin         { 4d00:0054 }
  pat := Roll(1, 8);                                             { 4d00:006f }
  if pat = 8 then pat := Roll(1, 2) + 4                          { 4d00:007d }
  else pat := Roll(1, 4);                                        { 4d00:0098 }
end;
cb.movePattern := pat;                                           { 4d00:00a6 }
if not done then done := AiMoraleCheck(c);                       { 4d00:00b5 }
if (cb.fleeing <> 0) and (cb.turned = 0) then                    { 4d00:00c8 }
  ShowCharacterMessage(c, 'flees in panic', 10, True);                  { 4d00:00e6  00ba:16ec(c, msg, row, wait) }
if done then exit;                                               { 4d00:0106 }
if AiTryUseMagicItem(c) then done := ClearCombatantActionFlags(c)                  { 4d00:010f }
else if cb.castingSpell > 0 then begin                           { 4d00:012e }
  CastSpell(cb.castingSpell, 1, 1, done);                     { 4d00:013c  CastSpell (spell, 1, 1, var done) }
  done := ClearCombatantActionFlags(c);                                            { 4d00:0158 }
end
else if AiTryTurnUndead(c) then done := ClearCombatantActionFlags(c)               { 4d00:0169 }
else if AiTryCastSpell(c) then done := True                      { 4d00:0187 }
else begin
  AiReadyBestWeapon(c);                                          { 4d00:019b }
  done := CheckCombatHotkeys(c);                                 { 4d00:01a5 }
  while not done do                                              { 4d00:01b2 }
    if AutoTarget(c, $FF, 1, 0) and (cb.initiative > 0) then  { 4d00:01b8  AutoTarget; signed test }
      done := AiMoveAttack(c)                                    { 4d00:01df }
    else
      done := AiEndTurn(c);                                      { 4d00:01ee }
end;
```
Notes: a pattern value 5 or 6 (1 in 8 rerolls) is always rerolled on the next turn (`pat > 4`). Every exit path of the `else`-chain sets `done` (ClearCombatantActionFlags always returns True, see notes), so only the last branch loops.

### 4D00:0203 AiTryTurnUndead (H)
`function AiTryTurnUndead(c [BP+6]: PChar): Boolean` — caller AiCombatTurn. Callees FindTurnTarget, TurnUndead.
```pascal
if (cb.hasTurned = 0) and (c.level[0] > 0) and                   { 4d00:0209  TChar +96h cleric level, signed }
   FindTurnTarget(c, u) then begin                           { 4d00:0223  FindTurnTarget: an enemy with +76h > 0 and cb.turned = 0 }
  AiTryTurnUndead := True;                                       { 4d00:0237 }
  TurnUndead(c);                                                 { 4d00:023b  TurnUndead "turns undead..." }
end
else AiTryTurnUndead := False;                                   { 4d00:0248 }
```

### 4D00:0255 AreaHitsFriend (M)
`function AreaHitsFriend(x [BP+0Ch], y [BP+0Ah], spell [BP+8]: Byte): Boolean` — **nested** in AiSpellUseful (static link pushed at 4d00:03c4, `[BP+6]`); RETF 8. Callees BuildTargetList{BuildTargetList}, IsSideZero.
True if a combatant within the area of `spell` around square (x, y) stands on the side of the acting character (`SelectedChar`, set by ov08 before the AI is called).
```pascal
Result := False;                                                 { 4d00:025b }
BuildTargetList(x, y, spell_AreaSize{g_3209}[spell*16], $FF, 1, cm_Map);  { 4d00:025f  BuildTargetList (col, row, range, dir FFh = all, size, map) → tg_List / tg_Count }
for i := 1 to tg_Count do                              { 4d00:028c }
  if cb_Char[tg_List[i].who].side <> Ord(IsSideZero(SelectedChar)) then  { 4d00:02a1  TChar +10Eh }
    Result := True;                                              { 4d00:02d6 }
```
(`IsSideZero(x)` = `x.side = 0`; with sides 0/1 the test means "same side as SelectedChar".)

### 4D00:02EB AiSpellUseful (M)
`function AiSpellUseful(c [BP+0Ah]: PChar; spell [BP+8], minValue [BP+6]: Byte): Boolean` — callers AiTryUseMagicItem, AiTryCastSpell. Callees FindHealTarget, SpellRange, CollectOppositeSideTargets, AreaHitsFriend.
Spell-table fields (`DS:31FA + spell*16`, SAVES.md): `+0Dh` = `spell_AiValue{g_3207}`, `+0Eh` = `spell_NeedsTarget{g_3208}`, `+0Fh` = `spell_AreaSize{g_3209}`.
```pascal
Result := False;                                                 { 4d00:02f1 }
if spell_AiValue{g_3207}[spell*16] < minValue then exit;         { 4d00:02f5 }
if (spell <> 3) and (spell_NeedsTarget{g_3208}[spell*16] = 0) then begin   { 4d00:030c }
  Result := True; exit                                           { 4d00:033e }
end;
if (spell = 3) and FindHealTarget(c, f) then begin            { 4d00:0324  3 = Cure Light Wounds; FindHealTarget }
  Result := True; exit                                           { 4d00:033e }
end;
n := CollectOppositeSideTargets(c, SpellRange(spell));                   { 4d00:0345 }
if n > 0 then begin                                              { 4d00:035d }
  if spell_AreaSize{g_3209}[spell*16] = 0 then begin             { 4d00:0363 }
    Result := True; exit                                         { 4d00:0375 }
  end;
  for i := 1 to n do                                             { 4d00:037b }
    if AreaHitsFriend(cb_Col[foe_List{g_6DE4}[i]],
                      cb_Row[foe_List{g_6DE4}[i]], spell) then
      exit;                                                      { 4d00:0390 }
  Result := True;                                                { 4d00:03d7 }
end;
```
Note: for spell 3 without a wounded friend in reach the code falls through to the enemy test (so Cure Light Wounds is then judged like an attack spell: `+0Eh` = 0 is not re-tested).

### 4D00:03E4 AiTryUseMagicItem (M)
`function AiTryUseMagicItem(c [BP+6]: PChar): Boolean` — caller AiCombatTurn. Callees Roll, IsSideZero, IsScroll, AiSpellUseful, UseItem.
```pascal
Result := False;  chosen := nil;  minValue := 7;                 { 4d00:03ea }
passes := Roll(1, 7);                                            { 4d00:03fa }
if cb.mayUseItems = 0 then goto done;                            { 4d00:0408 }
if side_ActiveCount{g_6814}[Ord(IsSideZero(c))] = 0 then goto done;  { 4d00:041a  = opponents still active }
if ecl_Mem4900^[$1CA] <> 0 then goto done;                       { 4d00:0432  word = ECL variable 49E5h }
for pass := 1 to passes do begin                                 { 4d00:0441 }
  it := c.items;                                                 { 4d00:0459  TChar +C8h }
  while (it <> nil) and (chosen = nil) do begin                  { 4d00:046c }
    sp := it.power[1];                                           { 4d00:0482  item +3Dh }
    slot := ITEMS[it.type].slot;                                 { 4d00:048c  stored, never used }
    if not IsScroll(it) and (it.power[2] < $80) and (it.readied <> 0) and (sp > 0) then begin  { 4d00:04a2  +3Eh, +34h }
      if sp > $38 then sp := sp - $17;                           { 4d00:04cb }
      if AiSpellUseful(c, sp, minValue) then chosen := it;       { 4d00:04dc }
    end;
    it := it.next;                                               { 4d00:04fe  +2Ah }
  end;
  minValue := minValue - 1;                                      { 4d00:0512 }
end;
done:
if chosen <> nil then begin                                      { 4d00:0520 }
  UseItem(chosen, dummy);                                        { 4d00:0528  UseItem "uses an item" }
  Result := True;                                                { 4d00:0538 }
end;
```

### 4D00:0545 AiTryCastSpell (M)
`function AiTryCastSpell(c [BP+6]: PChar): Boolean` — caller AiCombatTurn. Callees Roll, IsSideZero, AiSpellUseful, BeginCast.
```pascal
cnt := 0;                                                        { 4d00:054b }
if cb.mayCast <> 0 then                                          { 4d00:054f }
  for k := 0 to 20 do                                            { 4d00:055e }
    if c.mem_spell[k] > 0 then begin list[cnt] := c.mem_spell[k]; cnt := cnt + 1 end;  { 4d00:0567  TChar +17h+k (bit 7 not filtered) }
chosen := 0;  minValue := 7;                                     { 4d00:0599 }
passes := Roll(1, 7);                                            { 4d00:05a1 }
pass := 1;                                                       { 4d00:05af }
if (cnt > 0) and ((c.npc_morale > $7F) or (MagicOn <> 0)) and   { 4d00:05b3  TChar +84h }
   (side_ActiveCount{g_6814}[Ord(IsSideZero(c))] > 0) then      { 4d00:05ce }
  while (pass <= passes) and (chosen = 0) do begin               { 4d00:05e3 }
    k := 1;                                                      { 4d00:05f1 }
    while (k < 4) and (chosen = 0) do begin                      { 4d00:05f5 }
      pick := list[Roll(1, cnt) - 1];                            { 4d00:0601 }
      if AiSpellUseful(c, pick, minValue) then chosen := pick;   { 4d00:0620 }
      k := k + 1;                                                { 4d00:063c }
    end;
    minValue := minValue - 1;                                    { 4d00:0641 }
    pass := pass + 1;                                            { 4d00:0644 }
  end;
if chosen > 0 then BeginCast(chosen, 1, r)                       { 4d00:0649  BeginCast (spell, aiFlag, var r): "Begins Casting" / immediate }
else r := False;                                                 { 4d00:0662 }
Result := r;                                                     { 4d00:0666 }
```

### 4D00:0675 AiCanStep (M)
`function AiCanStep(c [BP+0Eh]: PChar; try [BP+0Ch], baseDir [BP+0Ah]: Byte; var blocked [BP+6]: Boolean): Boolean` — caller AiMove. Callees ProbeMove{ProbeMove}, HasEffect.
Tests try number `try` (1..5) of the current movement pattern: direction `baseDir` + pattern offset.
```pascal
blocked := False;  Result := False;                              { 4d00:067b }
dir := (ai_DirOffsets{g_02AE}[cb.movePattern*5 + try] + baseDir) mod 8;   { 4d00:0686 }
ProbeMove(c, dir, occupant, terrain);                            { 4d00:06c6  ProbeMove: square ahead → occupant index, worst tile }
if terrain = 0 then begin blocked := True; exit end;             { 4d00:06df }
if occupant <> 0 then exit;                                      { 4d00:06ef }
if not (CombatTerrain[terrain].cost < cb.moveLeft) then exit;  { 4d00:06f8 }
cost := 2;                                                       { 4d00:0718 }
if Odd(dir) then cost := 3;                                      { 4d00:071c  diagonal }
cost := Byte(cost * CombatTerrain[terrain].cost);        { 4d00:0727 }
if (terrain = $1E) and not HasEffect(c, $20, e) and not HasEffect(c, $1E, e)   { 4d00:0744 }
   and not HasEffect(c, $6F, e) and not HasEffect(c, $7D, e) then
  cost := Byte(cb.moveLeft + 1);                                 { 4d00:07a6  impassable without one of these effects }
if cb.moveLeft >= cost then Result := True;                      { 4d00:07b8 }
```

### 4D00:07F2 AiMove (M)
`procedure AiMove(c [BP+6]: PChar)` — callers AiMoveAttack (4d00:0bd3, 4d00:0d7c). Callees DrawText (print at col/row), ByteToStr, CheckCombatHotkeys, DirectionTo, Roll, AiCanStep, Flee, ClearCombatantActionFlags, AutoTarget, AiEndTurn, ShowCombatant{ShowCombatant}, AttacksOfOpportunity, StepCombatant, StinkingCloudCheck.
One step: towards the target, or (fleeing) towards a fixed map side; tries up to 5 directions of the movement pattern.
```pascal
DrawText(0, 24, $0A, 'Move/Attack, Move Left = ' + ByteToStr(cb.moveLeft shr 1) + ' ');  { 4d00:07f9  DrawText(col, row, attr, s) }
if CheckCombatHotkeys(c) then exit;                              { 4d00:0842 }
if (cb.moveLeft shr 1 > 0) and (cb.initiative > 0) and           { 4d00:0853  initiative: signed }
   not ((cb.fleeing = 0) and (c.class = 5)) then begin           { 4d00:087c  pure Magic-User does not advance }
  if cb.fleeing = 0 then
    dir := DirectionTo(c, cb.target)                             { 4d00:08a7  DirectionTo }
  else begin
    cb.movePattern := Roll(1, 2);                                { 4d00:08c7 }
    dir := Byte(party_Dir - ((party_Dir + 2) mod 4) shr 1);      { 4d00:08de }
    if c.side = 0 then dir := Byte(dir + 4);                     { 4d00:08fa }
    dir := dir mod 8;                                            { 4d00:0910 }
  end;
  blocked := False;  stop := False;  i := 1;                     { 4d00:091f }
  while (i < 6) and not stop do begin                            { 4d00:092b }
    if AiCanStep(c, i, dir, blocked) then break;                 { 4d00:0937 }
    if (cb.fleeing <> 0) and blocked then stop := Flee(c)   { 4d00:0952  Flee "Got Away"/"Escape is blocked" }
    else i := i + 1;                                             { 4d00:0977 }
  end;
  if stop then begin                                             { 4d00:097c }
    cb.moveLeft := 0;                                            { 4d00:0982 }
    cb.fleeing := 0;                                             { 4d00:098f }
    stop := ClearCombatantActionFlags(c);                                          { 4d00:099c }
  end else begin
    newDir := (ai_DirOffsets{g_02AE}[cb.movePattern*5 + i] + dir) mod 8;   { 4d00:09ad }
    if (i = 6) or ((newDir + 4) mod 8 = ai_LastStepDir{g_443C}) then begin   { 4d00:09e7  no free square, or stepping back }
      ai_StuckCount{g_443D} := ai_StuckCount + 1;                { 4d00:0a0a }
      cb.movePattern := cb.movePattern mod 6 + 1;                { 4d00:0a0e }
      if ai_StuckCount > 1 then begin                            { 4d00:0a30 }
        cb.target := nil;                                        { 4d00:0a37 }
        if ai_StuckCount > 2 then begin                          { 4d00:0a49 }
          cb.moveLeft := 0;                                      { 4d00:0a50 }
          stop := True;                                          { 4d00:0a5d }
        end
        else if not AutoTarget(c, $FF, 1, 0) then             { 4d00:0a63 }
          stop := AiEndTurn(c);                                  { 4d00:0a7b }
      end;
    end;
    if i < 6 then ai_LastStepDir{g_443C} := newDir               { 4d00:0a88 }
    else stop := True;                                           { 4d00:0a96 }
  end;
  if stop then exit;                                             { 4d00:0a9a }
  ShowCombatant(c, newDir, 0, False);                            { 4d00:0aa3  ShowCombatant: cb.facing := newDir, redraw icon }
  AttacksOfOpportunity(c, cb.facing);                              { 4d00:0ab8  AttacksOfOpportunity }
  if c.active = 0 then stop := ClearCombatantActionFlags(c)                        { 4d00:0ad0 }
  else begin
    StepCombatant(c, cb.facing);                                 { 4d00:0aeb  StepCombatant: moveLeft −2/−3, new square }
    if c.active = 0 then stop := ClearCombatantActionFlags(c);                     { 4d00:0b03 }
    StinkingCloudCheck(c);                                               { 4d00:0b1c  StinkingCloudCheck "starts to cough"/"chokes and gags" }
  end;
end
else stop := AiEndTurn(c);                                       { 4d00:0b29 }
```
The printed line has a trailing blank (`' '` = 4d00:07F0, length 1). `party_Dir` (6AAF) is the 3D-map facing of the party; the flee direction formula is exact (party_Dir 0/2/4/6 → monsters 7/2/3/6, party side 3/6/7/2).

### 4D00:0B3C AiMoveAttack (M)
`function AiMoveAttack(c [BP+6]: PChar): Boolean` — caller AiCombatTurn. Callees CallEffectHooks, AiMove, AiEndTurn, CanAttack, CombatantCol{CombatantCol}, CombatantRow{CombatantRow}, TraceLine{TraceLine}, CollectOppositeSideTargets, AutoTarget, Roll, WeaponIsRanged, FUN_00ba_2e46, AiReadyBestWeapon, TargetDistance, FocusSquare{FocusSquare}, DirectionTo, FighterSweep, ClearCombatantActionFlags, FaceAttacker, GetMissileAmmo, Attack.
Repeats "move, then attack if a target is in reach" until the turn is used up; returns True when the turn ended.
```pascal
ai_LastStepDir{g_443C} := 8;  ai_StuckCount{g_443D} := 0;  g_443E := 0;   { 4d00:0b42  g_443E: written only }
steps := 0;  going := True;  done := False;                      { 4d00:0b51 }
CallEffectHooks($0E, c);                                           { 4d00:0b5d  CallEffectHooks(event, c): event 0Eh → effect 53h }
if cb.initiative = 0 then going := False;                        { 4d00:0b6b }
while not done and going do begin                                { 4d00:0b7e }
  if cb.fleeing <> 0 then                                        { 4d00:0b90 }
    while (cb.moveLeft > 0) and (cb.initiative > 0) and (cb.initiative < $14) do  { 4d00:0b9f  signed for initiative }
      AiMove(c);                                                 { 4d00:0bcc }
  if (cb.initiative = 0) or (cb.initiative = $14) then going := False   { 4d00:0bd8 }
  else done := False;                                            { 4d00:0bfc }
  if done or not going then continue;                            { 4d00:0c00 }
  steps := steps + 1;                                            { 4d00:0c12 }
  if steps > 20 then begin                                       { 4d00:0c15 }
    done := True;                                                { 4d00:0c1b }
    going := not AiEndTurn(c);                                   { 4d00:0c1f  (the rest of this pass still runs) }
  end;
  canHit := False;                                               { 4d00:0c33 }
  range := 1;                                                    { 4d00:0c37 }
  if c.readied[0] <> nil then range := ITEMS[c.readied[0].type].range - 1;   { 4d00:0c3b  +CCh, g_558E }
  if (range = 0) or (range = $FF) then range := 1;               { 4d00:0c68 }
  tgt := cb.target;                                              { 4d00:0c78 }
  if (tgt.active = 0) or (tgt.side = 0) then tgt := nil;         { 4d00:0c8e  only side-1 targets are kept (fields read even when tgt = nil) }
  if tgt <> nil then                                             { 4d00:0cac }
    if CanAttack(c, tgt) then begin                              { 4d00:0cb7  CanAttack }
      tx := CombatantCol(tgt);  ty := CombatantRow(tgt);                   { 4d00:0ccc }
      dist := range;                                             { 4d00:0ce8  word }
      if TraceLine(CombatantCol(c), CombatantRow(c), tx, ty, dist, cm_Map) and   { 4d00:0cf0  TraceLine }
         (dist shr 1 <= range) then
        canHit := True;                                          { 4d00:0d38 }
    end;
  if not canHit then begin                                       { 4d00:0d3c }
    n := CollectOppositeSideTargets(c, range);                           { 4d00:0d45 }
    if n = 0 then begin
      if AutoTarget(c, $FF, 0, 0) then AiMove(c)              { 4d00:0d5d }
      else done := AiEndTurn(c);                                 { 4d00:0d81 }
    end else begin
      k := Roll(1, n);                                           { 4d00:0d91 }
      tgt := cb_Char[foe_List{g_6DE4}[k]];          { 4d00:0da0 }
      if WeaponIsRanged(c) and not FUN_00ba_2e46(c) and     { 4d00:0dc1 }
         (CollectOppositeSideTargets(c, 1) > 0) then begin               { 4d00:0ddf  enemy adjacent: change weapon }
        AiReadyBestWeapon(c);                                    { 4d00:0df1 }
        done := True;                                            { 4d00:0dfb }
      end
      else if (TargetDistance(c, tgt) = 1) or CanAttack(c, tgt) then   { 4d00:0e01 }
        canHit := True;                                          { 4d00:0e2b }
    end;
  end;
  if canHit then                                                 { 4d00:0e2f }
    FocusSquare(CombatantCol(c), CombatantRow(c), 2, DirectionTo(c, tgt));   { 4d00:0e35  FocusSquare: cursor on the attacked square }
  if canHit then begin                                           { 4d00:0e67 }
    if FighterSweep(c, tgt) then done := ClearCombatantActionFlags(c)                  { 4d00:0e70  FighterSweep "sweeps" }
    else begin
      FaceAttacker(c, tgt);                                    { 4d00:0e96  FaceAttacker }
      ammo := nil;                                               { 4d00:0ea7 }
      if WeaponIsRanged(c) then begin                          { 4d00:0eaf }
        canHit := GetMissileAmmo(c, ammo);                       { 4d00:0ebe }
        if FUN_00ba_2e46(c) and (TargetDistance(c, tgt) = 1) then ammo := nil;   { 4d00:0ed1  melee with a throwable weapon }
      end;
      Attack(c, tgt, 0, ammo, done);                             { 4d00:0efd  Attack }
      if done then going := False                                { 4d00:0f1c }
      else if tgt.active = 0 then done := True;                  { 4d00:0f28 }
    end;
  end;
end;
AiMoveAttack := not going;                                       { 4d00:0f3a }
```

### 4D00:0F4F AiEndTurn (M)
`function AiEndTurn(c [BP+6]: PChar): Boolean` — callers AiCombatTurn, AiMove, AiMoveAttack. Callees ClearCharacterMessage, IsHelpless, WeaponIsRanged, ClearCombatantActionFlags, SetGuarding.
```pascal
ClearCharacterMessage;                                               { 4d00:0f55 }
if IsHelpless(c) or WeaponIsRanged(c) or (cb.initiative = 0) then  { 4d00:0f5a  IsHelpless = has effect 33h/34h/35h/1Fh (DS:286C..286F) }
  Result := ClearCombatantActionFlags(c)                                           { 4d00:0f87 }
else
  Result := SetGuarding(c);                                            { 4d00:0f97  "Guarding", cb.guarding := 1 }
```

### 4D00:0FC1 CheckCombatHotkeys (M)
`function CheckCombatHotkeys(c [BP+6]: PChar): Boolean` — callers AiCombatTurn, AiMove. Callees Crt.KeyPressed, ReadGameKey, ShowTimedBottomMessage, GodsIntervene, FUN_0899_0104 (no-op).
Lets the player interrupt Quick combat. True = this combatant goes back to manual control.
```pascal
Result := False;                                                 { 4d00:0fc7 }
if KeyPressed then begin                                         { 4d00:0fcb }
  key := ReadGameKey;                                                 { 4d00:0fd7 }
  if key = 0 then key := ReadGameKey;                                 { 4d00:0fdf  extended key: scan code }
  if key = $32 then begin                                        { 4d00:0fed  32h = scan code of M (Alt-M), or '2' }
    MagicOn := not MagicOn;                  { 4d00:0ff4 }
    if MagicOn then ShowTimedBottomMessage('Magic On')              { 4d00:1001 }
    else ShowTimedBottomMessage('Magic Off');                             { 4d00:101e }
  end
  else if key = $20 then begin                                   { 4d00:1034  space }
    p := PartyHead;                                              { 4d00:1038 }
    while p <> nil do begin                                      { 4d00:1045 }
      if (p.npc_morale < $80) and (p.status <> 1) then p.quick := 0;   { 4d00:104d  TChar +84h, +10Ch (1 = Animated), +10Fh }
      p := p.next;                                               { 4d00:106c }
    end;
    if c.quick = 0 then begin                                    { 4d00:1081 }
      cb.initiative := $14;                                      { 4d00:108c }
      Result := True;                                            { 4d00:1099 }
    end;
  end
  else if key = $2D then                                         { 4d00:109f  '-' (or scan code of X = Alt-X) }
    GodsIntervene;                                              { 4d00:10a3  GodsIntervene: only with START.EXE STING: "The Gods intervene!"; result unused }
end;
FUN_0899_0104;                                                   { 4d00:10ac  body is a JMP to its exit: does nothing }
```

### 4D00:10D7 AiMoraleCheck (M)
`function AiMoraleCheck(c [BP+6]: PChar): Boolean` — caller AiCombatTurn. Callees ov24_1041, ShowCharacterMessage, CallEffectHooks, MaxEnemyMove, CalcMove, RemoveEffect, RemoveFromCombat, ClearCombatantActionFlags.
Returns True when the turn is over (surrender). Sets `cb.fleeing` when the combatant flees.
```pascal
Result := False;                                                 { 4d00:10dd }
cb.fleeing := 0;                                                 { 4d00:10e1 }
ov24_1041(c);                                          { 4d00:10ee  ov24_1041: RemoveEffect(c, 4Ah), RemoveEffect(c, 4Bh) (DS:0C24/0C25) }
if cb.turned <> 0 then begin                                     { 4d00:10f9 }
  cb.fleeing := 1;                                               { 4d00:1108 }
  ShowCharacterMessage(c, 'is forced to flee', 10, True);               { 4d00:1115 }
  exit;                                                          { 4d00:1135 }
end;
if c.npc_morale <= $7F then exit;                                { 4d00:1138  only NPCs/monsters (bit 7) test morale }
g_6825 := Byte((c.npc_morale and $7F) * 2);                      { 4d00:1146 }
if g_6825 > $66 then g_6825 := 0;                                { 4d00:1157 }
CallEffectHooks($11, c);                                           { 4d00:1163  event 11h → effect 01h; may change g_6825 }
if (g_6825 >= 100 - c.hp * 100 div c.hp_max) and (g_6825 <> 0) then exit;   { 4d00:1171  own HP: +11Bh, +32h }
saved := g_6825;                                                 { 4d00:11aa  never used again }
g_6825 := enemy_HpPercent{g_6E2F};                               { 4d00:11b0  % of side-1 HP left (CalcEnemyHpPct) }
CallEffectHooks($11, c);                                           { 4d00:11b6 }
if (g_6825 >= 100 - ecl_Mem6B00^[$58C]) and (g_6825 <> 0) and (c.side <> 0) then exit;   { 4d00:11c4  word = ECL variable 6DC6h }
if MaxEnemyMove(c) <= CalcMove(c) shr 1 then begin      { 4d00:11f0 }
  cb.fleeing := 1;                                               { 4d00:1218 }
  RemoveEffect(c, $4A, nil);                                     { 4d00:1225 }
  RemoveEffect(c, $4B, nil);                                     { 4d00:1239 }
end
else if c.int > 5 then begin                                     { 4d00:124f  TChar +11h }
  RemoveFromCombat(c, 4, 'Surrenders');                               { 4d00:1259  RemoveFromCombat(c, status, msg): status 4 = Unconscious, hp := 0 }
  Result := ClearCombatantActionFlags(c);                                          { 4d00:1276 }
end;
```
Comparisons: the HP term is `100 - (hp*100) div hp_max` (word `MUL` then signed `IDIV`), compared signed (`JL`); the ECL term is compared unsigned (`JC`).

### 4D00:128D AiWeaponScore (M)
`function AiWeaponScore(c [BP+0Ah]: PChar; it [BP+6]: PItem): Byte` — caller AiReadyBestWeapon. RETF 8.
```pascal
t := ITEMS[it.type];                                             { 4d00:1293  16-byte copy to a local }
s := Byte(t.dice * t.sides);                                     { 4d00:12b6  j9 × j10 (vs small/medium) }
if it.plus > 0 then s := Byte(s + it.plus * 8);                  { 4d00:12c7  item +32h, signed }
if t.dmg_bonus > 0 then s := Byte(s + t.dmg_bonus * 2);          { 4d00:12e9  j11, signed }
if (it.type = $55) and (cb.target <> nil) and (cb.target.+76h > 0) then s := 8;   { 4d00:1301  85 = Holy Water vial vs undead }
if (t.wflags2 and 8) <> 0 then s := Byte(s + (t.rof - 1) * 2);  { 4d00:1334  launcher: rate of fire }
if t.hands <= 1 then s := Byte(s + 3);                           { 4d00:1351 }
if c.hands_used + t.hands > 3 then s := 0;                       { 4d00:1362  TChar +100h }
if (it.power[2] = $84) and ((it.power[1] and $0F) <> c.alignment) then s := 0;   { 4d00:137e  +3Eh, +3Dh, TChar +A0h }
if it.power[1] = $53 then s := 0;                                { 4d00:139f }
if it.magic_flag <> 0 then s := 0;                               { 4d00:13ad  +36h (cursed? see notes) }
Result := s;                                                     { 4d00:13bb }
```

### 4D00:13CA AiReadyBestWeapon (M)
`procedure AiReadyBestWeapon(c [BP+6]: PChar)` — callers AiCombatTurn, AiMoveAttack. Callees AiWeaponScore, CollectOppositeSideTargets, ReadyItem, RecalcCharacter, CalcAttacks, DrawCharacterSummary.
Chooses the best usable weapon (missile or melee) and shield from the inventory and readies them.
```pascal
if c.readied[0] <> nil then c.hands_used := Byte(c.hands_used - ITEMS[c.readied[0].type].hands);   { 4d00:13d0  +CCh, g_5583 }
if c.readied[1] <> nil then c.hands_used := Byte(c.hands_used - ITEMS[c.readied[1].type].hands);   { 4d00:140f  +D0h shield }
bestMissile := nil;  bestMelee := nil;  bestShield := nil;       { 4d00:144e }
missileScore := 1;                                               { 4d00:1466 }
meleeScore := Byte(c.base_dmg_dice[1] * c.base_dmg_sides[1]);    { 4d00:146a  +A3h × +A5h }
if c.base_dmg_bonus[1] > 0 then meleeScore := Byte(meleeScore + c.base_dmg_bonus[1] * 2);   { 4d00:1485  +A7h signed }
shieldScore := 0;                                                { 4d00:14a7 }
it := c.items;                                                   { 4d00:14ab }
while it <> nil do begin                                         { 4d00:14be }
  t := it.type;                                                  { 4d00:14c9 }
  if (ITEMS[t].slot = 0) and ((ITEMS[t].usable_by and c.class_mask) <> 0) then begin   { 4d00:14d3  +B0h }
    s := AiWeaponScore(c, it);                                   { 4d00:1506 }
    if ((ITEMS[t].wflags2 and 8) <> 0) or ((ITEMS[t].wflags2 and $10) <> 0) then   { 4d00:1519 }
      if s > missileScore then begin bestMissile := it; missileScore := s end;      { 4d00:1543 }
    if ((ITEMS[t].wflags2 and 8) = 0) and (s > meleeScore) then begin bestMelee := it; meleeScore := s end;   { 4d00:155d }
  end;
  if (ITEMS[t].slot = 1) and ((ITEMS[t].usable_by and c.class_mask) > 0) then begin   { 4d00:158c }
    if it.plus >= 0 then s := it.plus + 1 else s := 0;           { 4d00:15b9 }
    if s > shieldScore then begin bestShield := it; shieldScore := s end;           { 4d00:15d5 }
  end;
  it := it.next;                                                 { 4d00:15ef }
end;
throwable := (bestMissile <> nil) and (ITEMS[bestMissile.type].range > 1) and      { 4d00:1603 }
             ((ITEMS[bestMissile.type].wflags2 and $14) = $14);
canShoot := False;  ammo := nil;  fl := 0;                       { 4d00:1644 }
if bestMissile <> nil then begin                                 { 4d00:1654 }
  fl := ITEMS[bestMissile.type].wflags2;                         { 4d00:165c }
  if (fl and $10) <> 0 then ammo := bestMissile;                 { 4d00:1672  thrown: the weapon is its own ammo }
  if (fl and 8) <> 0 then begin                                  { 4d00:1687 }
    if (fl and 1) <> 0 then ammo := c.readied[11];               { 4d00:1690  +F8h arrows }
    if (fl and $80) <> 0 then ammo := c.readied[12];             { 4d00:16ac  +FCh quarrels }
  end;
end;
if (ammo <> nil) or (fl = $0A) then canShoot := True;            { 4d00:16c8  0Ah = sling: no ammo item needed }
if (bestMissile <> nil) and (missileScore > meleeScore shr 1) and canShoot and     { 4d00:16da }
   (throwable or (CollectOppositeSideTargets(c, 1) = 0)) then
  chosen := bestMissile                                          { 4d00:1712 }
else chosen := bestMelee;                                        { 4d00:1720 }
changed := False;  ok := True;                                   { 4d00:172c }
if (c.readied[0] <> nil) and ((c.readied[0] = chosen) or (c.readied[0].magic_flag <> 0)) then ok := False;   { 4d00:1734 }
if ok then begin                                                 { 4d00:176d }
  if c.readied[0] <> nil then ReadyItem(c.readied[0]);         { 4d00:1776  un-ready the old weapon }
  RecalcCharacter(c);                                            { 4d00:1797 }
  if (c.readied[1] <> nil) and (c.readied[1].magic_flag = 0) then
    c.hands_used := Byte(c.hands_used - ITEMS[c.readied[1].type].hands);   { 4d00:17a2 }
  if chosen <> nil then ReadyItem(chosen);                     { 4d00:17f0 }
  changed := True;                                               { 4d00:1803 }
end;
RecalcCharacter(c);                                              { 4d00:1807 }
CalcAttacks(c);                                           { 4d00:1812  CalcAttacks }
ok := True;                                                      { 4d00:181d }
if (c.readied[1] <> nil) and ((c.readied[1] = bestShield) or (c.readied[1].magic_flag <> 0)) then ok := False;   { 4d00:1821 }
if c.hands_used > 2 then begin                                   { 4d00:185a }
  if (c.readied[1] <> nil) and (c.readied[1].magic_flag = 0) then ReadyItem(c.readied[1])   { 4d00:1894 }
  else ReadyItem(chosen);                                      { 4d00:1883  (chosen may be nil) }
  changed := True;                                               { 4d00:188e / 4d00:18a6 }
end
else if (c.hands_used < 2) and ok then begin                     { 4d00:18ac }
  if c.readied[1] <> nil then ReadyItem(c.readied[1]);         { 4d00:18bd }
  RecalcCharacter(c);                                            { 4d00:18de }
  if bestShield <> nil then ReadyItem(bestShield);             { 4d00:18e9 }
  changed := True;                                               { 4d00:18fc }
end;
RecalcCharacter(c);                                              { 4d00:1900 }
if changed then DrawCharacterSummary(c);                          { 4d00:190b }
```

### 4D00:1922 ov09_init (H)
`procedure ov09_init` — empty unit initialiser (`PUSH BP; MOV BP,SP; POP BP; RETF`), called by the main program via stub_ov09_e0 (0000:00c4).  { 4d00:1922 }

### Data inside the code segment (not routines)
| range | content |
|---|---|
| 4D00:0000..000E | string[14] "flees in panic" |
| 4D00:07D6..07F1 | strings "Move/Attack, Move Left = ", " " (07D3..07D5 is the `RETF 0Ch` of AiCanStep) |
| 4D00:0FAE..0FC0 | strings "Magic On", "Magic Off" |
| 4D00:10BA..10D6 | strings "is forced to flee", "Surrenders" |

---

## ov13 (6100) — melee / missile attacks, attack messages, targeting, turn undead, flee (FINAL pseudocode, lane por-mod-combat)

Unit: GAME.OVR unit 13, stub segment 0068, analysis segment **6100**, code 3C72h bytes, 25 entry points (e0 = init 3C6D).
Sources: `decode/listings/ov13.lst` (evidence), `ov13.c` (Ghidra aid). Data specs: `decode/data/SAVES.md` (TChar, item record, ITEMS table), `decode/data/ITEMS.md`, `decode/ecl/ECL_VM.md`.

Role: the per-combatant **attack engine** of tactical combat. Round start (attacks per round, initiative, movement allowance), the melee/missile attack sequence (to-hit via ov24, damage dice, vs-large dice, backstab multiplier, auto-kill of helpless targets) and its text ("Attacks / -Backstabs- / slays helpless", "Hitting for n points of damage", "and Misses", "goes down", "and is Dying", "is killed", "lost a spell"); facing and "from behind" bookkeeping; free attacks when a combatant leaves an enemy's reach; fighter sweeps vs. sub-1-HD creatures; combatant step movement; Flee ("Got Away" / "Escape is blocked"); Turn Undead with its 10×10 table; the target selection UI ("Next Prev Manual Target Center Exit", the manual aiming cursor "(Use Cursor keys)"); AI target choice; spell target collection; "Attack handheld:" confirmation; Begin casting ("Camp Only Spell", "Begins Casting"); two monster special-attack effect handlers (49h "Rakes...", 4Ah hold/hug); the `STING` debug cheat ("The Gods intervene!").

Entry table (stub 0068 entry k → routine; external callers from `functions.tsv`):
e0 init 3C6D · e1 0000 (CombatMain) · e2 0123 (ov09 4D00:10D7) · e3 0712, e4 08B2, e5 0C6A (ov08 4800:09DF, ov09 4D00:07F2 = movement/flee command) · e6 0D23 (4800:031A, 4D00:13CA) · e7 0E82, e11 17F6, e12 1884 (4800:0D45, 4D00:0B3C) · e8 1085 (4D00:0B3C, EffCharmGaze) · e9 116A, e10 1351 (4800:031A, 4D00:0203) · e13 1BF8 (4D00:02EB) · e14 20C3 (procedure variable `g_6B84`, set by CombatMain) · e15 2414 (4800:031A, 4D00:0545) · e16 2998 (4800:0D45) · e17 3558 (4800:031A) · e18 263D · e19 2879 (4800:0880 once per round, StartCombat) · e20 2908 (4D00:10D7) · e21 37E4 (4D00:07F2, 4D00:0B3C, AiCombatTurn) · e22 39D2 / e23 3A86 (effect-handler table `DS:6828 + id*4`, ids 49h / 4Ah, installed by InstallEffectHandlers at 5C00:354D/355A) · e24 3B93 (4800:031A, 4D00:0FC1).

Conventions (same as `VIEW.pas.md`)
- **Signatures are in Pascal order**: first parameter = highest BP offset (pushed first); Ghidra's `param_1..n` is the reverse. Parameters are given as `name [BP+xx]`. `var` = a far pointer parameter that the body writes through.
- `{ seg:off }` = address of the first instruction of the statement (or of the CALL that implements it). Near branch targets printed by Ghidra as `0x6000:1XXX` are 6100:0XXX (LAYOUT "Near-branch fix").
- Globals: `g_XXXX` = DS:XXXX (GLOBALS.md name). Names introduced here are written `Name{g_XXXX}` and listed in `ov13_names.json` / `ov13_notes.md`. For 1-based arrays `Name{g_A}[i]`, g_A is the address of element 1 (the asm indexes `[DI + A - size]`), e.g. `SlotHits{g_6823}[k]` = byte DS:6822 + k, `SpellTargets{g_6C95}[i]` = far ptr DS:6C91 + 4i. Exception: `foe_List{g_6DE4}[i]` = byte DS:6DE4 + i (ov09 lane name, keyed at the asm base). Names already given by sibling COMBAT parts are reused: ov24 (`Roll`, `RollDice`, `AttackRoll`, `CallEffectHooks`, `RemoveEffect`, `RemoveFromCombat`, `RemoveCombatEffects`, `DamageAmount{g_6818}`), ov09 (`foe_List{g_6DE4}`, `enemy_HpPercent{g_6E2F}`, spell-table bytes `needsTarget` DS:3208, `areaSize` DS:3209).
- `c^.field` = TChar field by its SAVES.md §3 name (`c^.hp` = +11Bh, `c^.side` = +10Eh, `c^.active` = +10Dh, `c^.status` = +10Ch, `c^.readied[0]` = +CCh weapon, `c^.readied[2]` = +D4h armour, `c^.attacks_left[k]` = +112h+k, `c^.dmg_dice[k]` = +114h+k, `c^.dmg_sides[k]` = +116h+k, `c^.dmg_bonus[k]` = +118h+k, `c^.level[i]` = +96h+i, …). Byte fields are unsigned unless the asm uses signed compares (`JL/JG/CBW`), then written as ShortInt.
- `cr(c)` = `c^.combatant` (+108h), the per-combatant combat record (far pointer). Its layout is not specified elsewhere yet; the fields this unit uses (byte unless noted):
  `+0 castSpell` (spell id being cast; set by BeginCast, cleared when the caster is hit), `+1` (set 1 at round start, cleared by a damaging hit; meaning L), `+2` (set 1 at round start; L), `+3 initiative` (ShortInt, 1d6+DEX adj, 0 = has acted), `+4 attackSlot` (1/2, slot of the current swing), `+5 sweepLeft` (fighter-level sweeps vs <1 HD), `+6 moveLeft` (half-squares), `+7 freeAttack` (may take a free attack this round), `+8 attacked` (made an attack this round), `+9 facing` (direction 0..7), `+0Ah target` (far ptr TChar), `+0Fh timesAttacked` (attacked this round), `+10h turned` (undead turned), `+11h hasTurned` (turned undead this combat), `+12h rotation` (accumulated facing change mod 8). Names are M (evidence per routine below).
- Combat tables (ov31 owner, M): `g_65B9[i]` (4 bytes) = far ptr TChar of combatant i (1..n); `g_5F27[i*4]` = map x, `g_5F28[i*4]` = map y, `g_5F2A[i*4]` = icon size (0 = removed); `g_5F2A` itself (i = 0) = combatant count n. `g_6716` = far ptr to the combat map record (+2 view x, +3 view y, +4/+5 cursor flags, +6 scan flag, +7.. = 50×25 ground bytes). Ground value 1Fh = a body lies here. Bodies list `BodyList{g_66DD}[k]` (7-byte records at DS:66D6 + 7k: far ptr TChar, +4 x, +5 y, +6 ground), count `BodyCount{g_6715}`, filled by RemoveCombatant.
- Direction steps `g_2736[dir]` dx = {0,1,1,1,0,-1,-1,-1,0}, `g_273F[dir]` dy = {-1,-1,0,1,1,1,0,-1,0} (image bytes, H; dir 8 = no move).
- Runtime / other-lane routines used: **published names** (decode/names/*.json as shown in the current ov13.lst `;` comments, VIEW.pas.md, ENGINE.pas.md, combat_parts/ov24/ov19, MAGIC.pas.md alias CastSpell = CastSpell); arguments in Pascal order = push order, checked against the published signatures (normalisation pass, see notes). Unnamed callees keep their address name (`FUN_00ba_2e46`, `ov24_0FD2`, `FUN_0899_0104`, `SpellRange` = SpellRange). Former local aliases (first draft): ShowCharMsg, BottomMsg, PrintAt, Summary, EndTurn, CollectEnemies, ScanArea, ViewTo, TurnIcon, EraseIcon, RedrawCell, CX/CY, … — all replaced.
  `Roll(n, s)` = ov24 9800:0DE3 (ecl_names.json): Σ n × (Random(s)+1), byte result (H). `RollDice(n, s)` = RollDice: `g_681C := n; Roll(n, s)` (H).
  `AttackRoll(att, tgt, ac)` = AttackRoll: removes effect 19h from att, d20 (20 → 100), hit if d20 > 1 and `ac <= d20 + att^.thac0 + sideBonus` (M; ov24 lane).
  `CallEffectHooks(ev, c)` = CallEffectHooks (event pushed first): runs the effect handlers of c for event ev (event numbers seen here: 0, 1, 2, 3, 4, 5, 0Bh, 0Dh, 12h) (M).
  `RemoveEffect(c, id, p)` = RemoveEffect (M). `ov24_0FD2(c)` = ov24_0FD2: while HasEffect(c,19h) remove it (H). `RemoveCombatEffects(c)` = RemoveCombatEffects: removes the 16 effect ids of table DS:0C14.. (M). `RemoveFromCombat(c, status, msg)` = RemoveFromCombat: shows msg, `c^.active := 0`, `c^.status := status`, hp := 0 unless status 3, removes the icon (M).
  `HasEffect(c, id, var p)` = 00BA:2199 (SAVES.md, H). `IsHelpless(c)` = 00BA:0B73: HasEffect for any of the ids `HelplessEffectIds{g_286C}[1..4]` = 33h, 34h, 35h, 1Fh (H). `DexMissileAdj(c)` = 00BA:1168: AD&D DEX reaction/attack adjustment of `c^.dex` (0..2 → −4, 3..5 → dex−6, 6..15 → 0, 16..18 → dex−15, 19..20 → 3, 21..23 → 4, 24..25 → 5) (H).
  `RecalcCharacter(c)` = 00BA:0BB8 RecalcCharacter (SAVES.md). `LoseItem(c, it)` = 00BA:1509 (H, strings). `WeaponIsRanged(c)` = 00BA:2E03: weapon readied and `ITEMS[type].range >= 2` (H). `FUN_00ba_2e46(c)` = 00BA:2E46: missile and `ITEMS[type].wflags2 and 14h = 14h` (H). `GetMissileAmmo(c, var it)` = 00BA:2E8B: it := weapon (wflags2 bit 4) / arrows `+F8h` (bits 3+0) / quarrels `+FCh` (bits 3+7); true if it <> nil or wflags2 = 0Ah (H).
  `CollectOppositeSideTargets(c, range)` = 00BA:2433: scans the combat map (BuildTargetList) around c and keeps the combatants of the other side; count → result, indices → `foe_List{g_6DE4}[1..n]` (M). `BuildTargetList(col, row, range, dir = $FF, size, map)` = B600:0909 (VIEW): combatants within r of (x,y) → triples `g_6718[3i]` (byte 0 = combatant index), count `g_671A` (M). `TargetDistance(a, t)` = 00BA:255B (scan entry byte >> 1; M). `InFrontArc(x1, y1, x2, y2, dir)` = InFrontArc: (x2,y2) lies in the 45° sector `dir` seen from (x1,y1); dir 8 = always (H, decompile). `TraceLine(x, y, var tx, var ty, var range, map)` = TraceLine (L).
  `CombatantIndex(c)` = CombatantIndex, `CombatantCol(c)` = CombatantCol (x), `CombatantRow(c)` = CombatantRow (y), `CombatantSize(c)` = CombatantSize (H, bodies read). `InWindow(dx, dy)` = InWindow: 0 <= dx,dy <= 6 (H). `IsVisible(c, all)` = IsVisible (M). `FocusSquare(col, row, margin, dir)` = FocusSquare: scroll/redraw the combat view around (x+dx[dir], y+dy[dir]) (M). `ShowCombatant(c, dir, pose, eraseOnly)` = ShowCombatant: `cr(c)^.facing := dir`, redraw the icon (M). `RedrawSquare(x, y)` = RedrawSquare (M). `RestoreTerrain(scol, srow, who)` = RestoreTerrain (VIEW signature; who = combatant index) (M). `RebuildOccupancy` = RebuildOccupancy (M). `CellAt(x, y, var occ, var ground)` = CellAt: occ := `g_60DB[y*50+x]` (combatant index), ground := map ground byte; both 0 outside 0..49 × 0..24 (H). `FocusCombatant(c, margin, cursor)` = FocusCombatant (M). `RemoveCombatant(c)` = RemoveCombatant: removes a killed combatant's icon, records a body (M).
  Text: `ShowCharacterMessage(c, s, row, wait)` = 00BA:16EC: in combat (`g_49F3 = 5`) clears x 17h..26h, rows row..15h, prints c's name at (17h, row) and s word-wrapped at (17h..26h, row+1..15h) colour 0Ah; if wait: MessageDelay + ClearCharacterMessage (H). `ClearCharacterMessage` = 00BA:17E3 (H). `DrawCharacterName(c, x, y, space)` = 00BA:1816 (colour 0Ch inactive / 0Eh side 1 / 0Bh side 0) (H). `DrawText(x, y, colour, s)` = 0709:0626 (H). `DrawWrappedText(x0, y0, x1, y1, colour, f, s)` = 0709:0768 (M). `ClearRectangle(x0, y0, x1, y1)` = 03F1:0137 (M). `ShowTimedBottomMessage(s)` = 00BA:1693: s at (0, 18h) colour 0Ah, MessageDelay, clear row 18h (H). `MessageDelay` = 0709:0DBE: `Delay(g_49E2 * 225)` (H). `ByteToStr(b)` = 00BA:1037 = Str(b) (H), `WordToStr(w)` = 00BA:1073 (M). `DrawCharacterSummary(c)` = 00BA:09E3 combatant summary panel ("Hitpoints", "(Helpless)") (M). `ShowCombatMessageAnimation(c, flag, s)` = 00BA:1FEB (M). `PlayOrStopSound(n)` = 08AE:00DC (M); sound ids `g_2620`=6, `g_2622`=7, `g_2626`=9, `g_2628`=0Ah, `g_262C`=0Ch (image words).
  `ClearCombatantActionFlags(c)` = 00BA:2637: `cr^.initiative := 0; cr^.castSpell := 0; cr^.freeAttack := 0; cr^.moveLeft := 0`; returns 1 (H).
- The spell table is `DS:31FA + spell*16` (SAVES.md); bytes read here: `+6` (DS:3200) target code, `+0Ah` (DS:3204) effect id, `+0Bh` (DS:3205) combat-usable, `+0Ch` (DS:3206) casting time, `+0Eh` (DS:3208) auto-target kind, `+0Fh` (DS:3209) area radius. Field names M (from use here).

---

### 6100:0000 StartCombatRound (M)
`procedure StartCombatRound(c [BP+6]: PChar)` — callers: CombatMain (stub e1). Callees: CalcAttacks (0D23), CallEffectHooks, HalfRound (0E52), DexMissileAdj, Roll, CalcMove (0123).
Initialises the combat record of c for a new round: attacks of slot 1 and 2, sweep allowance, initiative (1d6 + DEX adjustment, −6 for a surprised side, 0 if inactive or out of 0..20) and the movement allowance.
```pascal
r := cr(c);                                                          { 6100:0006 }
r^.castSpell := 0;                                                   { 6100:0014 }
r^[1] := 1;                                                          { 6100:001b }
r^[2] := 1;                                                          { 6100:0023 }
r^.attacked := 0;                                                    { 6100:002b }
r^.attackSlot := 2;                                                  { 6100:0033 }
CalcAttacks(c);                                                      { 6100:003b }
StatValue{g_681A} := c^[$A2];                                        { 6100:0045  unk_A2 = half-attacks of slot 2 }
StatKind{g_681D} := 0;                                               { 6100:0050 }
CallEffectHooks($12, c);                                                 { 6100:0055 }
c^.attacks_left[2] := HalfRound(StatValue{g_681A});                  { 6100:0063  +114h }
r^.sweepLeft := c^.fighter_lvl_eff;                                  { 6100:0073  +6Bh }
if c^.active <> 0 then begin                                         { 6100:0081 }
  r^.initiative := DexMissileAdj(c) + Roll(1, 6);                           { 6100:008c  ShortInt }
  if r^.initiative < 1 then r^.initiative := 1;                      { 6100:00b0 }
  if ((c^.side + 1) and ecl_Mem6B00^.w[$596]) and $FF <> 0 then      { 6100:00c2  ECL word 6DCBh = SURPRISE result, bit 0 party / bit 1 monsters }
    r^.initiative := r^.initiative - 6;                              { 6100:00d9 }
  if (r^.initiative < 0) or (r^.initiative > 20) then r^.initiative := 0;  { 6100:00e1 }
end else
  r^.initiative := 0;                                                { 6100:00ff }
r^.moveLeft := CalcMove(c);                                          { 6100:0107 }
```

### 6100:0123 CalcMove (M)
`function CalcMove(c [BP+6]: PChar): Byte` — callers: StartCombatRound, Flee (0C6A), MaxEnemyMove (2908); ov09 4D00:10D7 (stub e2). Callees: CallEffectHooks.
Movement allowance in half-squares: `move` (+ an ECL bonus for the party side), clamped to 1..96, doubled, then passed through the effect hooks with `StatKind = 1`.
```pascal
m := c^.move;                                                        { 6100:0129  +11Ch }
if c^.side = 0 then m := Byte(m + ecl_Mem6B00^.w[$6E4]);             { 6100:0134  ECL word 6E72h (meaning unknown) }
StatKind{g_681D} := 1;                                               { 6100:0150 }
if (m < 1) or (m > $60) then m := 1;                                 { 6100:0155 }
StatValue{g_681A} := m * 2;                                          { 6100:0165 }
CallEffectHooks($12, c);                                                 { 6100:016f }
StatKind{g_681D} := 0;                                               { 6100:017d }
CalcMove := StatValue{g_681A};                                       { 6100:0182 }
```

### 6100:0191 RollDamage (H)
`procedure RollDamage(att [BP+0Ch], tgt [BP+8]: PChar; k [BP+6]: Byte)` — caller MeleeAttack (1406). Callees: RollDice, CanBackstab (2574), CallEffectHooks.
Damage of swing k into `DamageAmount{g_6818}`: `dmg_dice[k]` d `dmg_sides[k]` + `dmg_bonus[k]`, times (thief level div 4 + 2) on a backstab; then the attacker's (event 4) and target's (event 5) effect hooks may modify it.
```pascal
DamageAmount{g_6818} := RollDice(att^.dmg_dice[k], att^.dmg_sides[k]) + ShortInt(att^.dmg_bonus[k]);   { 6100:0194  8-bit add }
if DamageAmount{g_6818} < 0 then DamageAmount{g_6818} := 0;                      { 6100:01d2  BUG: unsigned compare (JNC), never true; a negative sum stays as 256+sum }
if CanBackstab(att, tgt) then                                        { 6100:01de }
  DamageAmount{g_6818} := Byte(DamageAmount{g_6818} * ((ShortInt(att^.level[6]) shr 2) + 2));   { 6100:01f2  +9Ch thief level }
g_6819 := 0;                                                         { 6100:020d }
CallEffectHooks(4, att);                                                 { 6100:0212 }
CallEffectHooks(5, tgt);                                                 { 6100:0220 }
```

### 6100:02F9 ShowAttackResult (H)
`procedure ShowAttackResult(att [BP+12h], tgt [BP+0Eh]: PChar; kind [BP+0Ch], dmgApplied [BP+0Ah], dmgShown [BP+8], hit [BP+6]: Byte)` — caller MeleeAttack. Callees: ShowCharacterMessage, DrawCharacterName, ByteToStr, ApplyDamage (00BA:2228), DrawWrappedText, MessageDelay, ForgetMemorizedSpell, DrawText, RemoveCombatEffects, CallEffectHooks, RemoveCombatant, ClearCharacterMessage.
Prints the attack line, applies the damage and prints the target's fate. kind: 0 normal, 1 from behind, 2 backstab, 3 helpless target. Text layout (right panel, x = 17h): attacker name row 0Ah + verb, target name row 0Ch, result text rows 0Dh..0Fh, then fate lines.
```pascal
case kind of                                                         { 6100:0300 }
  2: s := '-Backstabs-';                                             { 6100:0307 }
  3: s := 'slays helpless';                                          { 6100:0320 }
  else s := 'Attacks';                                               { 6100:0335 }
end;
ShowCharacterMessage(att, s, $0A, 0);                                         { 6100:0348 }
row := $0C;                                                          { 6100:035e }
DrawCharacterName(tgt, $17, row, 0);                                         { 6100:0362 }
row := row + 1;                                                      { 6100:0377 }
if kind = 1 then s := '(from behind) ' else s := '';                 { 6100:037a }
if hit <> 0 then begin                                               { 6100:0399 }
  if kind = 3 then s := 'with one cruel blow'                        { 6100:03a2 }
  else begin
    s := s + 'Hitting for ' + ByteToStr(dmgShown);                     { 6100:03be }
    if dmgShown = 1 then s := s + ' point '                          { 6100:03fa }
    else s := s + ' points ';                                        { 6100:042a }
    s := s + 'of damage';                                            { 6100:0452 }
  end;
  ApplyDamage(tgt, dmgApplied);                                    { 6100:047a  ApplyDamage (ENGINE) }
end else
  s := s + 'and Misses';                                             { 6100:048b }
DrawWrappedText($17, row, $26, row + 3, $0A, 1, s);                     { 6100:04b3 }
row := g_5E25 + 1;                                                   { 6100:04d6  g_5E25 = last text row written (ENGINE) }
if dmgApplied > 0 then begin                                         { 6100:04df }
  cr(tgt)^[1] := 0;                                                  { 6100:04e5 }
  if cr(tgt)^.castSpell > 0 then begin                               { 6100:04f2 }
    MessageDelay;                                                    { 6100:0500 }
    ShowCharacterMessage(tgt, 'lost a spell', $0C, 1);                        { 6100:0505 }
    ForgetMemorizedSpell(cr(tgt)^.castSpell);                               { 6100:0525  clears that id in SelectedChar^.mem_spell[] — see notes (BUG: SelectedChar = attacker here) }
    cr(tgt)^.castSpell := 0;                                         { 6100:0536 }
  end else MessageDelay;                                             { 6100:0544 }
end else MessageDelay;                                               { 6100:054b }
if tgt^.active = 0 then begin                                        { 6100:0550 }
  ShowCharacterMessage(tgt, 'goes down', row, 0);                             { 6100:055e }
  row := row + 2;                                                    { 6100:057f }
  if tgt^.status = 5 then DrawText($17, row, $0A, 'and is Dying');    { 6100:0583  status 5 = Dying }
  if tgt^.status in [6, 7, 8] then ShowCharacterMessage(tgt, 'is killed', row, 0);   { 6100:05ac  set constant CS:02CF = {6,7,8} Dead/Stoned/Gone }
  row := row + 2;                                                    { 6100:05e2 }
  RemoveCombatEffects(tgt);                                                 { 6100:05e6 }
  CallEffectHooks($0D, tgt);                                             { 6100:05f1 }
  if tgt^.active = 0 then RemoveCombatant(tgt)                            { 6100:05ff }
  else MessageDelay;                                                 { 6100:0617 }
end;
ClearCharacterMessage;                                                        { 6100:061c }
```

### 6100:0627 FreeAttacksOnMover (M)
`procedure FreeAttacksOnMover(c [BP+6]: PChar)` — caller StepCombatant (0712). Callees: CollectOppositeSideTargets, IsHelpless, CombatantCol, CombatantRow, FocusSquare, FaceAttacker (17F6), Attack (1884).
Every adjacent enemy that still has its free attack (`freeAttack`) and is not helpless strikes c once (used after c has stepped).
```pascal
n := CollectOppositeSideTargets(c, 1);                                           { 6100:062d }
for i := 1 to n do                                                   { 6100:0644 }
  if c^.active <> 0 then begin                                       { 6100:0656 }
    e := g_65B9[foe_List{g_6DE4}[i]];                               { 6100:0664 }
    if (cr(e)^.freeAttack <> 0) and not IsHelpless(e) then begin     { 6100:0685 }
      FocusSquare(CombatantCol(c), CombatantRow(c), 2, 8);                                    { 6100:06a3 }
      cr(e)^.freeAttack := 0;                                        { 6100:06c6 }
      FaceAttacker(e, c);                                            { 6100:06d3 }
      Attack(e, c, 0, nil, dummy);                                   { 6100:06e3 }
    end;
  end;
```

### 6100:0712 StepCombatant (M)
`procedure StepCombatant(c [BP+8]: PChar; dir [BP+6]: Byte)` — external (stub e3: ov08 4800:09DF, ov09 4D00:07F2). Callees: CombatantIndex, InWindow, FocusSquare, RestoreTerrain, RebuildOccupancy, PlayOrStopSound, FreeAttacksOnMover, IsHelpless.
Moves c one square in direction dir if its movement allowance (half-squares) covers the cost (2 orthogonal, 3 diagonal); otherwise the allowance is zeroed. Resets the "attacked/rotation" counters, plays the step sound and lets adjacent enemies take free attacks.
```pascal
if Odd(dir) then cost := 3 else cost := 2;                           { 6100:0718 }
if cost > cr(c)^.moveLeft then begin                                 { 6100:0729 }
  cr(c)^.moveLeft := 0;                                              { 6100:073a }
  exit;
end;
cr(c)^.moveLeft := cr(c)^.moveLeft - cost;                           { 6100:074a }
idx := CombatantIndex(c);                                            { 6100:0759 }
ox := g_5F27[idx*4];  oy := g_5F28[idx*4];                           { 6100:0767 }
nx := ox + g_2736[dir];                                              { 6100:078b }
ny := oy + g_273F[dir];                                              { 6100:07a2 }
mode := 1;                                                           { 6100:07b9 }
if c^.controlled <> 0 then begin                                     { 6100:07bd  +10Fh }
  mode := 3;                                                         { 6100:07c8 }
  if not InWindow(nx - g_6716^.viewX, ny - g_6716^.viewY) then       { 6100:07cc }
    FocusSquare(ox, oy, 2, 8);                                            { 6100:07f9 }
end;
RestoreTerrain(0, 0, idx);                                                { 6100:080c }
g_5F27[idx*4] := nx;                                                 { 6100:081b }
g_5F28[idx*4] := ny;                                                 { 6100:082d }
RebuildOccupancy;                                                    { 6100:083f }
FocusSquare(nx, ny, mode, 8);                                             { 6100:0844 }
cr(c)^.timesAttacked := 0;                                           { 6100:0858 }
cr(c)^.rotation := 0;                                                { 6100:0865 }
PlayOrStopSound(g_2628);                                                   { 6100:0872 }
FreeAttacksOnMover(c);                                               { 6100:087b }
if (c^.active = 0) or IsHelpless(c) then                             { 6100:0885 }
  cr(c)^.moveLeft := 0;                                              { 6100:089f }
```

### 6100:08B2 AttacksOfOpportunity (M)
`procedure AttacksOfOpportunity(c [BP+8]: PChar; dir [BP+6]: Byte)` — external (stub e4: 4800:09DF, 4D00:07F2). Callees: FillChar, CombatantIndex, CollectOppositeSideTargets, IsHelpless, CanAttack (1085), HasEffect, CombatantCol, CombatantRow, InFrontArc, Attack, DrawCharacterSummary.
Enemies adjacent to c now but no longer adjacent after a step in direction dir get one swing at c (once each), if they can attack, are not helpless, do not have effect 4Ah/4Bh, and either have not acted yet this round (`initiative > 0`), or were not attacked this round (`timesAttacked = 0`), or c lies in one of the 5 directions around their facing (front half).
```pascal
FillChar(L, 12, 0);                                                  { 6100:08b8  L[1..12] }
idx := CombatantIndex(c);                                            { 6100:08c9 }
n := CollectOppositeSideTargets(c, 1);                                           { 6100:08d7 }
if n = 0 then exit;                                                  { 6100:08e8 }
for i := 1 to n do L[i] := foe_List{g_6DE4}[i];                     { 6100:08f1 }
g_5F27[idx*4] := g_5F27[idx*4] + g_2736[dir];                        { 6100:0923  tentative step }
g_5F28[idx*4] := g_5F28[idx*4] + g_273F[dir];                        { 6100:093d }
m := CollectOppositeSideTargets(c, 1);                                           { 6100:0957 }
g_5F27[idx*4] := g_5F27[idx*4] - g_2736[dir];                        { 6100:0968  undo }
g_5F28[idx*4] := g_5F28[idx*4] - g_273F[dir];                        { 6100:0982 }
for i := 1 to n do begin                                             { 6100:099c }
  still := false;                                                    { 6100:09b1 }
  for j := 1 to m do                                                 { 6100:09b5 }
    if foe_List{g_6DE4}[j] = L[i] then still := true;               { 6100:09ca }
  if still then L[i] := 0;                                           { 6100:09ef }
end;
for i := 1 to n do                                                   { 6100:0a08 }
  if (L[i] > 0) and (c^.active <> 0) then begin                      { 6100:0a20 }
    done := false;                                                   { 6100:0a3e }
    e := g_65B9[L[i]];                                               { 6100:0a42 }
    if IsHelpless(e) then continue;                                  { 6100:0a62 }
    if not CanAttack(e, c) then continue;                            { 6100:0a74 }
    if HasEffect(e, $4B, p) then continue;                           { 6100:0a8b }
    if HasEffect(e, $4A, p) then continue;                           { 6100:0aa5 }
    for k := cr(e)^.facing + 6 to cr(e)^.facing + 10 do              { 6100:0abf  byte loop }
      if not done then                                               { 6100:0af4 }
        if (cr(e)^.initiative > 0) or (cr(e)^.timesAttacked = 0)     { 6100:0afd }
           or InFrontArc(CombatantCol(e), CombatantRow(e), CombatantCol(c), CombatantRow(c), k mod 8) then begin   { 6100:0b1b }
          slot := 1;                                                 { 6100:0b64 }
          if e^.attacks = 0 then slot := 2;                          { 6100:0b68  +A1h }
          for j := 1 to 2 do                                         { 6100:0b77 }
            if e^.attacks_left[j] > 0 then slot := j;                { 6100:0b80 }
          if e^.attacks_left[slot] = 0 then e^.attacks_left[slot] := 1;   { 6100:0b9e }
          cr(e)^.attackSlot := slot;                                 { 6100:0bc0 }
          saved := cr(e)^.target;                                    { 6100:0bcf }
          Attack(e, c, 1, nil, g_6E31);                              { 6100:0be5 }
          done := true;                                              { 6100:0c03 }
          cr(e)^.target := saved;                                    { 6100:0c07 }
          if c^.active <> 0 then DrawCharacterSummary(c);                         { 6100:0c1d }
        end;
  end;
```

### 6100:0C6A Flee (M)
`function Flee(c [BP+6]: PChar): Byte` — external (stub e5: 4800:09DF, 4D00:07F2). Callees: CollectOppositeSideTargets, CalcMove, MaxEnemyMove (2908), Roll, RemoveFromCombat, ShowTimedBottomMessage, ClearCombatantActionFlags.
c escapes if no enemy is on the map, or if its movement (squares) beats the fastest enemy's, or on a tie with 1 chance in 2. Result = ClearCombatantActionFlags(c) = 1.
```pascal
escaped := false;                                                    { 6100:0c70 }
if CollectOppositeSideTargets(c, $FF) = 0 then escaped := true                   { 6100:0c74 }
else begin
  mine := CalcMove(c) shr 1;                                         { 6100:0c8c }
  theirs := MaxEnemyMove(c);                                         { 6100:0c9d }
  if theirs < mine then escaped := true                              { 6100:0caa }
  else if (theirs = mine) and (Roll(1, 2) = 1) then escaped := true; { 6100:0cb8 }
end;
if escaped then RemoveFromCombat(c, 3, 'Got Away')                        { 6100:0cd3  status 3 = Running }
else ShowTimedBottomMessage('Escape is blocked');                                 { 6100:0cf8 }
Flee := ClearCombatantActionFlags(c);                                                  { 6100:0d0c }
```

### 6100:0D23 CalcAttacks (H)
`procedure CalcAttacks(c [BP+6]: PChar)` — callers: StartCombatRound; external (stub e6: 4800:031A, 4D00:13CA). Callees: WeaponIsRanged, GetMissileAmmo, CallEffectHooks, HalfRound.
Swings of slot 1 for this round: the character's `attacks` (half-attacks) or, with a usable missile weapon, the weapon's rate of fire (min 2), through the effect hooks and HalfRound; limited by the ammunition stack; if the combatant already attacked this round (`attacked`), the old count is only replaced by a smaller value or (for non-missile use) by a value below twice the old one.
```pascal
missile := false;                                                    { 6100:0d29 }
old := c^.attacks_left[1];                                           { 6100:0d2d  +113h }
c^.attacks_left[1] := c^.attacks;                                    { 6100:0d38  +A1h }
if WeaponIsRanged(c) and GetMissileAmmo(c, ammo) then begin               { 6100:0d48 }
  missile := true;                                                   { 6100:0d6b }
  rof := ITEMS[c^.readied[0]^.type].rof;                             { 6100:0d6f  DS:5587 + type*16 }
  if rof < 2 then rof := 2;                                          { 6100:0d8a }
  StatValue{g_681A} := rof;                                          { 6100:0d94 }
end else
  StatValue{g_681A} := c^.attacks_left[1];                           { 6100:0d9c }
StatKind{g_681D} := 0;                                               { 6100:0da7 }
CallEffectHooks($12, c);                                                 { 6100:0dac }
n := HalfRound(StatValue{g_681A});                                   { 6100:0dba }
if missile and (ammo <> nil) then begin                              { 6100:0dc5 }
  k := 1;                                                            { 6100:0dd3 }
  if (ammo <> nil) and (ammo^.count > k) then k := ammo^.count;      { 6100:0dd7  item +39h }
  if k < n then n := k;                                              { 6100:0df5 }
end;
if (cr(c)^.attacked = 0) or (n < old) then                           { 6100:0e03 }
  c^.attacks_left[1] := n                                            { 6100:0e41 }
else if (n < 2 * old) and not missile then                           { 6100:0e29 }
  c^.attacks_left[1] := n;                                           { 6100:0e41 }
```

### 6100:0E52 HalfRound (H)
`function HalfRound(v [BP+6]: Byte): Byte` — callers: StartCombatRound, CalcAttacks.
Converts half-attacks per round to swings this round: rounds up on odd combat rounds (3 half-attacks → 2, 1, 2, …).
```pascal
t := v;                                                              { 6100:0e58 }
if Odd(CombatRound{g_6DE3}) then t := t + 1;                         { 6100:0e5e }
HalfRound := t shr 1;                                                { 6100:0e68 }
```

### 6100:0E82 FighterSweep (M)
`function FighterSweep(att [BP+0Ah], tgt [BP+6]: PChar): Boolean` — callers: ConfirmTarget (2C3D); external (stub e7). Callees: TargetDistance, CollectOppositeSideTargets, ShowCharacterMessage, CombatantIndex, FaceAttacker, Attack.
AD&D "one attack per level against creatures under 1 HD": if the target is adjacent and has `level_main = 0`, and more such enemies stand adjacent than the attacker has swings, the attacker ("sweeps") makes one swing at each of them (at most `sweepLeft` = effective fighter level), the chosen target first.
```pascal
FighterSweep := false;                                               { 6100:0e88 }
if att^.attacks_left[1] >= cr(att)^.sweepLeft then exit;             { 6100:0e8c }
if tgt^.level_main <> 0 then exit;                                   { 6100:0ea5  +73h }
if TargetDistance(att, tgt) <> 1 then exit;                                { 6100:0eb2 }
n := CollectOppositeSideTargets(att, 1);                                         { 6100:0eca }
cnt := 0;                                                            { 6100:0edb }
for i := 1 to n do begin                                             { 6100:0ee5 }
  e := g_65B9[foe_List{g_6DE4}[i]];                                 { 6100:0ef4 }
  if e = tgt then pos := i;                                          { 6100:0f15  pos stays uninitialised if tgt is not in the list }
  if e^.level_main = 0 then cnt := cnt + 1;                          { 6100:0f2b }
end;
if cnt <= att^.attacks_left[1] then exit;                            { 6100:0f40 }
if cnt > cr(att)^.sweepLeft then cnt := cr(att)^.sweepLeft;          { 6100:0f50 }
ShowCharacterMessage(att, 'sweeps', $0A, 1);                                  { 6100:0f70 }
if g_65B9[foe_List{g_6DE4}[1]] <> tgt then begin                    { 6100:0f90 }
  foe_List{g_6DE4}[pos] := foe_List{g_6DE4}[1];                    { 6100:0fb9 }
  foe_List{g_6DE4}[1] := CombatantIndex(tgt);                       { 6100:0fc8 }
end;
for i := 1 to n do                                                   { 6100:0fd6 }
  if (cnt > 0) and (g_65B9[foe_List{g_6DE4}[i]]^.level_main = 0) then begin   { 6100:0fee }
    e := g_65B9[foe_List{g_6DE4}[i]];                               { 6100:1012 }
    FaceAttacker(att, e);                                            { 6100:1033 }
    att^.attacks_left[1] := 1;                                       { 6100:1043 }
    Attack(att, e, 0, nil, g_6E31);                                  { 6100:104c }
    cnt := cnt - 1;                                                  { 6100:106a }
  end;
FighterSweep := true;                                                { 6100:1078 }
```

### 6100:1085 CanAttack (M)
`function CanAttack(att [BP+0Ah], tgt [BP+6]: PChar): Boolean` — callers: AttacksOfOpportunity, ManualAim, SelectTarget, AutoTarget; external (stub e8: 4D00:0B3C, EffCharmGaze). Callees: CallEffectHooks.
Lets the effect handlers veto an attack: target event 1, then attacker event 0 with `cr(att)^.target` temporarily set to tgt; a handler vetoes by setting `AttackBlocked{g_681E}`.
```pascal
CanAttack := false;                                                  { 6100:108b }
if tgt = nil then exit;                                              { 6100:108f }
if att = tgt then begin CanAttack := true; exit end;                 { 6100:109a }
AttackBlocked{g_681E} := 0;                                          { 6100:10b0 }
CallEffectHooks(1, tgt);                                                 { 6100:10b5 }
if AttackBlocked{g_681E} = 0 then begin                              { 6100:10c3 }
  saved := cr(att)^.target;                                          { 6100:10ca }
  cr(att)^.target := tgt;                                            { 6100:10e0 }
  CallEffectHooks(0, att);                                               { 6100:10f6 }
  cr(att)^.target := saved;                                          { 6100:1104 }
end;
CanAttack := AttackBlocked{g_681E} = 0;                              { 6100:111a }
```

### 6100:116A TurnUndead (H)
`procedure TurnUndead(c [BP+6]: PChar)` — external (stub e9: 4800:031A, 4D00:0203 = combat menu "Turn"). Callees: ShowCharacterMessage, ClearMenuLine, MessageDelay, Roll, FindTurnTarget (1351), FocusCombatant, DrawCharacterSummary, ShowCombatMessageAnimation, RemoveCombatant, ClearCharacterMessage, ShowTimedBottomMessage, CountActiveSides, ClearCombatantActionFlags.
One d20 roll against the AD&D turning table `TurnTable[undeadType, column]` (signed bytes at `DS:0447 + type*10 + column`; column = cleric level 1..8, 9 for levels 9..13, 10 for 14+). Undead are processed weakest type first; 1d12 of them can be affected; a value v is a success when d20 ≥ |v|: v > 0 = turned, v ≤ 0 = destroyed (status Gone); up to 6 extra destroyed undead do not use up the count when the count would reach 0 (v < 0 only). The first failure stops.
```pascal
ShowCharacterMessage(c, 'turns undead...', $0A, 0);                           { 6100:1170 }
ClearMenuLine;                                                           { 6100:1190  clears the bottom text line }
MessageDelay;                                                        { 6100:1195 }
any := false;                                                        { 6100:119a }
stop := false;                                                       { 6100:119e }
cr(c)^.hasTurned := 1;                                               { 6100:11a2  cr+11h }
extra := 6;                                                          { 6100:11af }
count := Roll(1, 12);                                                { 6100:11b3 }
d20 := Roll(1, 20);                                                  { 6100:11c1 }
if (ShortInt(c^.level[0]) >= 1) and (ShortInt(c^.level[0]) <= 8) then col := c^.level[0]   { 6100:11cf  cleric level +96h }
else if (ShortInt(c^.level[0]) >= 9) and (ShortInt(c^.level[0]) <= 13) then col := 9
else col := 10;                                                      { 6100:11fa }
while FindTurnTarget(c, u) and (count > 0) and not stop do begin     { 6100:11fe }
  v := ShortInt(TurnUndeadTable{g_0447}[u^.undead_type * 10 + col]); { 6100:1226  byte DS:0447 + 10*type + col; type = u^[+76h] }
  if d20 >= Abs(v) then begin                                        { 6100:1244 }
    any := true;                                                     { 6100:125b }
    FocusCombatant(u, 3, 0);                                                { 6100:125f }
    DrawCharacterSummary(u);                                                      { 6100:1270 }
    if v > 0 then begin                                              { 6100:127b }
      cr(u)^.turned := 1;                                            { 6100:1281  cr+10h }
      ShowCombatMessageAnimation(u, 1, 'is turned');                                    { 6100:128e }
    end else begin
      ShowCharacterMessage(u, 'Is destroyed', $0A, 0);                        { 6100:12ad }
      RemoveCombatant(u);                                                 { 6100:12cd }
      u^.status := 8;                                                { 6100:12d8  Gone }
      u^.active := 0;                                                { 6100:12e1 }
    end;
    if extra > 0 then extra := extra - 1;                            { 6100:12ea }
    count := count - 1;                                              { 6100:12f3 }
    if (count = 0) and (extra > 0) and (v < 0) then count := count + 1;   { 6100:12f6 }
    ClearCharacterMessage;                                                    { 6100:130b }
  end else
    stop := true;                                                    { 6100:1312 }
end;
if not any then ShowTimedBottomMessage('Nothing Happens...');                     { 6100:1319 }
CountActiveSides;                                                       { 6100:1333  recount active combatants per side into g_6814/g_6815 }
g_6E31 := ClearCombatantActionFlags(c);                                                { 6100:1338 }
ClearCharacterMessage;                                                        { 6100:1346 }
```
Effective table (column 1..10, rows = undead type 1..10; T = 1 (auto-turn), D = 0, D* = −1 (destroy, keeps the count while `extra` > 0), 99 = impossible), read from the image at DS:0447 (row t, column l = byte `0447h + 10t + l`; the column-10 value of row t is the first byte of row t+1 in a 10-byte dump):
| type | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 | 10 | 7 | 4 | T | T | D | D | D* | D* | D* |
| 2 | 13 | 10 | 7 | T | T | D | D | D | D* | D* |
| 3 | 16 | 13 | 10 | 4 | T | T | D | D | D | D* |
| 4 | 19 | 16 | 13 | 7 | 4 | T | T | D | D | D* |
| 5 | 20 | 19 | 16 | 10 | 7 | 4 | T | T | D | D |
| 6 | 99 | 20 | 19 | 13 | 10 | 7 | 4 | T | T | D |
| 7 | 99 | 99 | 20 | 16 | 13 | 10 | 7 | 4 | T | D |
| 8 | 99 | 99 | 99 | 20 | 16 | 13 | 10 | 7 | 4 | T |
| 9 | 99 | 99 | 99 | 99 | 20 | 16 | 13 | 10 | 7 | T |
| 10 | 99 | 99 | 99 | 99 | 99 | 20 | 16 | 13 | 10 | 4 |
(The type-10/column-10 byte 04 is the length byte of the next DS item; types 11 and 12 — reachable because FindTurnTarget accepts types < 13 — would read unrelated bytes. Data: no monster with type > 10 checked here; see notes.)

### 6100:1351 FindTurnTarget (H)
`function FindTurnTarget(c [BP+0Ah]: PChar; var u [BP+6]: PChar): Boolean` — caller TurnUndead; external (stub e10: 4D00:0203). Callees: CollectOppositeSideTargets.
The not-yet-turned enemy undead with the lowest undead type (1..12) anywhere on the map.
```pascal
best := $0D;                                                         { 6100:1357 }
u := nil;                                                            { 6100:135b }
n := CollectOppositeSideTargets(c, $FF);                                         { 6100:1367 }
FindTurnTarget := false;                                             { 6100:1378 }
for i := 1 to n do begin                                             { 6100:1382 }
  e := g_65B9[foe_List{g_6DE4}[i]];                                 { 6100:1391 }
  if (cr(e)^.turned = 0) and (ShortInt(e^.undead_type) > 0)          { 6100:13b2 }
     and (ShortInt(e^.undead_type) < best) then begin
    best := e^.undead_type;                                          { 6100:13d7 }
    u := e;                                                          { 6100:13e1 }
    FindTurnTarget := true;                                          { 6100:13f1 }
  end;
end;
```

### 6100:1406 MeleeAttack (H)
`procedure MeleeAttack(att [BP+10h], tgt [BP+0Ch]: PChar; behind [BP+0Ah]: Byte; var done [BP+6]: Byte)` — caller Attack (1884). Callees: IsHelpless, PlayOrStopSound, ShowAttackResult, ov24_0FD2, CopyBytes, RecalcCharacter, CallEffectHooks, CanBackstab (2574), DirectionTo (263D), RangePenalty (1B1E), AttackRoll, RollDamage, ClearCombatantActionFlags.
Performs all remaining swings of att against tgt: helpless targets are slain outright; otherwise the vs-large dice of the weapon are applied for a large target, the target AC (front, rear if attacked from behind, rear − 2 for a backstab, plus range penalties) is computed once, then for slot k = attackSlot downto 1 every swing left is rolled with AttackRoll; hits roll damage and print, the loop stops when the target drops. `done` := 1 when att has no swings left (then ClearCombatantActionFlags).
```pascal
backstab := behind;                                                  { 6100:140c }
done := 0;                                                           { 6100:1412 }
SlotHits{g_6823}[1] := 0;  SlotHits{g_6823}[2] := 0;                 { 6100:1419  g_6823, g_6824 }
SlotSwings{g_6E2D}[1] := 0;  SlotSwings{g_6E2D}[2] := 0;             { 6100:1423  g_6E2D, g_6E2E }
anyHit := false;                                                     { 6100:142d }
stop := false;                                                       { 6100:1431 }
DamageAmount{g_6818} := 0;                                                 { 6100:1435 }
cr(att)^.attacked := 1;                                              { 6100:143a }
if IsHelpless(tgt) then begin                                        { 6100:1447 }
  PlayOrStopSound(g_2622);                                                 { 6100:1459 }
  while att^.attacks_left[cr(att)^.attackSlot] = 0 do                { 6100:1462 }
    cr(att)^.attackSlot := cr(att)^.attackSlot - 1;                  { 6100:147d }
  SlotSwings{g_6E2D}[cr(att)^.attackSlot] := SlotSwings{g_6E2D}[cr(att)^.attackSlot] + 1;   { 6100:148b }
  ShowAttackResult(att, tgt, 3, tgt^.hp + 5, 1, 1);                  { 6100:149f  "slays helpless" … "with one cruel blow" }
  ov24_0FD2(att);                                               { 6100:14c6 }
  for k := 1 to 2 do att^.attacks_left[k] := 0;                      { 6100:14d1 }
  anyHit := true;                                                    { 6100:14f0 }
  done := 1;                                                         { 6100:14f4 }
end else begin
  if att^.readied[0] <> nil then                                     { 6100:14fe }
    if (tgt^.size > $80) or ((tgt^.size and 7) > 1) then begin       { 6100:150d  large target }
      it := ITEMS[att^.readied[0]^.type];                            { 6100:1524  16-byte copy of DS:5582 + type*16 }
      att^.dmg_dice[1] := it.dice_L;                                 { 6100:154c }
      att^.dmg_sides[1] := it.sides_L;                               { 6100:1557 }
      att^.dmg_bonus[1] := ShortInt(att^.dmg_bonus[1]) - ShortInt(it.dmg_bonus) + ShortInt(it.bonus_L);   { 6100:1562 }
    end;
  RecalcCharacter(tgt);                                                       { 6100:1583 }
  CallEffectHooks($0B, tgt);                                             { 6100:158e }
  acIdx := 0;                                                        { 6100:159c }
  if CanBackstab(att, tgt) then                                      { 6100:15a0 }
    ac := tgt^.ac_rear - 2                                           { 6100:15b4  +112h }
  else begin
    if cr(tgt)^.timesAttacked > 1 then                               { 6100:15c5 }
      if (DirectionTo(att, tgt) = cr(tgt)^.facing) and (cr(tgt)^.rotation > 4) then   { 6100:15d4 }
        backstab := 1;                                               { 6100:1601 }
    if backstab <> 0 then acIdx := 1;                                { 6100:1605 }
    ac := tgt^[$111 + acIdx];                                        { 6100:160f  ac or ac_rear }
  end;
  RangePenalty(att, tgt, ac);                                        { 6100:1620 }
  kind := 0;                                                         { 6100:1635 }
  if backstab <> 0 then kind := 1;                                   { 6100:1639  "(from behind) " }
  if CanBackstab(att, tgt) then kind := 2;                           { 6100:1643  "-Backstabs-" }
  for k := cr(att)^.attackSlot downto 1 do                           { 6100:165b }
    while (att^.attacks_left[k] > 0) and not stop do begin           { 6100:167c }
      att^.attacks_left[k] := att^.attacks_left[k] - 1;              { 6100:169a }
      cr(att)^.attackSlot := k;                                      { 6100:16a9 }
      SlotSwings{g_6E2D}[k] := SlotSwings{g_6E2D}[k] + 1;            { 6100:16b8 }
      if AttackRoll(att, tgt, ac) or IsHelpless(tgt) then begin           { 6100:16c3 }
        SlotHits{g_6823}[k] := SlotHits{g_6823}[k] + 1;              { 6100:16eb }
        PlayOrStopSound(g_2622);                                           { 6100:16f6 }
        anyHit := true;                                              { 6100:16ff }
        RollDamage(att, tgt, k);                                     { 6100:1703 }
        ShowAttackResult(att, tgt, kind, DamageAmount{g_6818}, DamageAmount{g_6818}, 1);   { 6100:1717 }
        if tgt^.active <> 0 then CallEffectHooks(k + 1, att);            { 6100:1736  event 2 / 3 = hit with slot 1 / 2 }
        if tgt^.active = 0 then stop := true;                        { 6100:1753 }
      end;
    end;
  if not anyHit then begin                                           { 6100:176e }
    PlayOrStopSound(g_2626);                                               { 6100:1774 }
    ShowAttackResult(att, tgt, kind, 0, 0, 0);                       { 6100:177d  "… and Misses" }
  end;
  done := 1;                                                         { 6100:179a }
  for k := 1 to 2 do                                                 { 6100:17a1 }
    if att^.attacks_left[k] > 0 then done := 0;                      { 6100:17aa }
  cr(att)^.sweepLeft := 0;                                           { 6100:17c9 }
end;
if done <> 0 then done := ClearCombatantActionFlags(att);                              { 6100:17d6 }
```

### 6100:17F6 FaceAttacker (M)
`procedure FaceAttacker(att [BP+0Ah], def [BP+6]: PChar)` — callers: FreeAttacksOnMover, ConfirmTarget, FighterSweep; external (stub e11). Callees: DirectionTo.
Counts one more attack on def this round and accumulates how far (0..4 eighth-turns) the attacker is from def's facing; MeleeAttack treats `timesAttacked > 1` with the attacker directly behind and `rotation > 4` as an attack from behind.
```pascal
cr(def)^.timesAttacked := cr(def)^.timesAttacked + 1;                { 6100:17fc }
d := DirectionTo(def, att);                                          { 6100:1808 }
diff := (d - cr(def)^.facing + 8) mod 8;                             { 6100:181b }
if diff > 4 then diff := 8 - diff;                                   { 6100:183f }
cr(def)^.rotation := (cr(def)^.rotation + diff) mod 8;               { 6100:1854 }
```

### 6100:1884 Attack (M)
`procedure Attack(att [BP+14h], tgt [BP+10h]: PChar; behind [BP+0Eh]: Byte; missile [BP+0Ah]: PItem; var done [BP+6]: Byte)` — callers: FreeAttacksOnMover, ConfirmTarget, AttacksOfOpportunity, FighterSweep, EffRake, EffHold; external (stub e12: 4800:0D45, 4D00:0B3C). Callees: DirectionTo, IsVisible, ShowCombatant, DrawCharacterSummary, Delay, MissileAnim (26B0), MeleeAttack, FUN_00ba_2e46, GetMem, Move, LoseItem, RecalcCharacter, ClearCombatantActionFlags.
Turns the defender towards the attacker (while it has been attacked fewer than 3 times and the attack is not a free/behind attack), turns the attacker to the target with the attack pose, animates a missile (and always for a sling), then runs MeleeAttack with the attacker as `SelectedChar`. Missile stack: the number of slot-1 swings is subtracted from `missile^.count`; when it reaches 0 a thrown weapon is copied into the treasure list (dropped on the field) unless its `power[3]` (+3Eh) = 89h, and the item is removed from the attacker.
```pascal
if (cr(tgt)^.timesAttacked < 3) and (behind = 0) then begin          { 6100:188a }
  d := DirectionTo(tgt, att);                                        { 6100:189f }
  if IsVisible(tgt, 0) then ShowCombatant(tgt, d, 0, 0)                 { 6100:18b2 }
  else cr(tgt)^.facing := d;                                         { 6100:18db }
end;
d := DirectionTo(att, tgt);                                          { 6100:18ea }
DrawCharacterSummary(att);                                                        { 6100:18fd }
ShowCombatant(att, d, 1, 0);                                              { 6100:1908  attack pose }
cr(att)^.target := tgt;                                              { 6100:191d }
Delay(100);                                                          { 6100:1933 }
if missile <> nil then MissileAnim(att, tgt, missile);               { 6100:193c }
if att^.readied[0]^.type = $2F then MissileAnim(att, tgt, att^.readied[0]);   { 6100:195a  Sling; readied[0] is dereferenced without a nil test }
done := 1;                                                           { 6100:1986 }
if (att^.attacks_left[1] > 0) or (att^.attacks_left[2] > 0) then begin   { 6100:198d }
  savedSel := SelectedChar;                                          { 6100:19a6 }
  SelectedChar := att;                                               { 6100:19b3 }
  MeleeAttack(att, tgt, behind, done);                               { 6100:19c0 }
  if missile <> nil then begin                                       { 6100:19d9 }
    if missile^.count > 0 then                                       { 6100:19e4  item +39h }
      missile^.count := missile^.count - SlotSwings{g_6E2D}[1];      { 6100:19ee  g_6E2D }
    if missile^.count = 0 then                                       { 6100:19f8 }
      if FUN_00ba_2e46(att) and (missile^.power[3] <> $89) then begin   { 6100:1a05  item +3Eh }
        copy := GetMem($3F);                                         { 6100:1a1e }
        Move(missile^, copy^, $3F);                                  { 6100:1a2d }
        copy^.next := TreasureItems;                                 { 6100:1a40 }
        TreasureItems := copy;                                       { 6100:1a52 }
        copy^.readied := 0;                                          { 6100:1a5f }
        LoseItem(att, missile);                                      { 6100:1a67 }
        g_5D9A := copy;                                       { 6100:1a78 }
      end else
        LoseItem(att, missile);                                      { 6100:1a87 }
  end;
  RecalcCharacter(att);                                                       { 6100:1a98 }
  SelectedChar := savedSel;                                          { 6100:1aa3 }
end;
if done <> 0 then done := ClearCombatantActionFlags(att);                              { 6100:1ab0 }
if IsVisible(att, 0) then begin                                    { 6100:1aca }
  ShowCombatant(att, cr(att)^.facing, 1, 1);                              { 6100:1adc }
  ShowCombatant(att, cr(att)^.facing, 0, 0);                              { 6100:1afa  back to the normal pose }
end;
```

### 6100:1B1E RangePenalty (M)
`procedure RangePenalty(att [BP+0Eh], tgt [BP+0Ah]: PChar; var ac [BP+6]: Byte)` — caller MeleeAttack. Callees: TargetDistance, WeaponIsRanged.
Missile range bands: with a missile weapon the band width is `(ITEMS[type].range − 1) div 3`, otherwise the distance itself (so melee is never penalised); each band beyond the first makes the target's AC value 2, then 3 points better (medium −2, long −5 to hit).
```pascal
dist := TargetDistance(att, tgt);                                          { 6100:1b24 }
if WeaponIsRanged(att) then                                        { 6100:1b38 }
  band := (ITEMS[att^.readied[0]^.type].range - 1) div 3             { 6100:1b47  DS:558E + type*16, unsigned }
else band := dist;                                                   { 6100:1b6d }
if ShortInt(dist) - ShortInt(band) > 0 then begin                    { 6100:1b73 }
  dist := dist - band;                                               { 6100:1b83 }
  ac := ac + 2;                                                      { 6100:1b92 }
end;
if ShortInt(dist) - ShortInt(band) > 0 then begin                    { 6100:1ba2 }
  dist := dist - band;                                               { 6100:1bb2 }
  ac := ac + 3;                                                      { 6100:1bc1 }
end;
```

### 6100:1BF8 FindHealTarget (M)
`function FindHealTarget(c [BP+0Ah]: PChar; var t [BP+6]: PChar): Boolean` — caller ChooseSpellTarget (1E16, spell 3 only); external (stub e13: 4D00:02EB). Callees: CombatantCol, CombatantRow, CellAt, SetIn.
Looks at c's square and the 8 around it: the wounded ally (same side, hp < hp_max) with the lowest hp, c itself also when below half its hp_max; and a body (ground 1Fh) of a character whose status is not Dead/Stoned/Gone. The body wins only when the best ally has hp ≥ 8.
```pascal
best := nil;                                                         { 6100:1bfe }
body := 0;                                                           { 6100:1c06 }
minHp := $FF;                                                        { 6100:1c0a }
for d := 0 to 8 do begin                                             { 6100:1c0e }
  x := CombatantCol(c) + g_2736[d];                                            { 6100:1c17 }
  y := CombatantRow(c) + g_273F[d];                                            { 6100:1c36 }
  CellAt(x, y, occ, ground);                                         { 6100:1c55 }
  if occ > 0 then begin                                              { 6100:1c6c }
    t := g_65B9[occ];                                                { 6100:1c75 }
    if (t^.side = c^.side) and (t^.hp < t^.hp_max) then              { 6100:1c92 }
      if (t^.hp < minHp) or ((t = c) and (t^.hp < t^.hp_max shr 1)) then begin   { 6100:1cbe }
        best := t;                                                   { 6100:1d03 }
        minHp := t^.hp;                                              { 6100:1d13 }
      end;
  end else if ground = $1F then                                      { 6100:1d24 }
    for k := 1 to BodyCount{g_6715} do                                  { 6100:1d2d }
      if (BodyList{g_66DD}[k].char <> nil)                           { 6100:1d42 }
         and not (BodyList{g_66DD}[k].char^.status in [6, 7, 8])     { 6100:1d58  set CS:1BD8 }
         and (BodyList{g_66DD}[k].x = x) and (BodyList{g_66DD}[k].y = y) then   { 6100:1d7a }
        body := k;                                                   { 6100:1da4 }
end;
if (minHp < 8) or (body = 0) then t := best                          { 6100:1dbb }
else t := BodyList{g_66DD}[body].char;                               { 6100:1dd9 }
FindHealTarget := t <> nil;                                          { 6100:1df7 }
```

### 6100:1E16 ChooseSpellTarget (M)
`function ChooseSpellTarget(spell [BP+0Eh], auto [BP+0Ch], allowEmpty [BP+0Ah]: Byte; var tgt [BP+6]: TTargetRec): Boolean` — caller CollectSpellTargets (20C3). Callees: SpellRange (SpellRange), SelectTarget (3558), FindHealTarget, CombatantCol, CombatantRow, AutoTarget (37E4), BuildTargetList, IsSideZero, IsHelpless, FillChar.
`TTargetRec` = 7 bytes: `+0 char` (far ptr, may be nil for an empty square), `+4 x`, `+5 y`, `+6` (unused here). Player (`auto = 0`): the interactive target menu with the spell's range. AI: spells whose auto-target kind (`DS:3208`) is 0 target the caster (spell 3: the best FindHealTarget); otherwise up to 20 random picks among attackable enemies in range, rejecting a pick for an area spell (`DS:3209` radius > 0) whose area contains an enemy of the caster (see note), and rejecting helpless targets for spells whose effect id (`DS:3204`) is a helpless effect. Sets `SpellX{g_6DB9}`, `SpellY{g_6DBA}`.
```pascal
found := false;                                                      { 6100:1e1c }
if auto = 0 then begin                                               { 6100:1e20 }
  SelectTarget(SelectedChar, SpellRange(spell), 0, allowEmpty, found, tgt);   { 6100:1e26 }
  cr(SelectedChar)^.target := tgt.char;                              { 6100:1e4d }
end else if SpellTab[spell].needsTarget = 0 then begin                  { 6100:1e6b  DS:3208 }
  tgt.char := SelectedChar;                                          { 6100:1e7d }
  if (spell <> 3) or FindHealTarget(SelectedChar, tgt.char) then begin   { 6100:1e8e }
    tgt.x := CombatantCol(tgt.char);                                           { 6100:1ea9 }
    tgt.y := CombatantRow(tgt.char);                                           { 6100:1ebf }
    found := true;                                                   { 6100:1ed5 }
  end;
end else begin
  tries := 20;                                                       { 6100:1edc }
  while (tries > 0) and not found do begin                           { 6100:1ee0 }
    ok := true;                                                      { 6100:1ef2 }
    if AutoTarget(SelectedChar, SpellRange(spell), 0, 1) then begin  { 6100:1ef6 }
      t := cr(SelectedChar)^.target;                                 { 6100:1f19 }
      if SpellTab[spell].areaSize > 0 then begin                       { 6100:1f30  DS:3209 }
        BuildTargetList(CombatantCol(t), CombatantRow(t), SpellTab[spell].areaSize, $FF, 1, g_6716);   { 6100:1f45 }
        for i := 1 to g_671A do                                      { 6100:1f82 }
          if g_65B9[g_6718[3*i]]^.side = Ord(IsSideZero(SelectedChar)) then   { 6100:1f97  23b7 = (side = 0) }
            ok := false;                                             { 6100:1fcc }
      end;
      if IsHelpless(t) then                                          { 6100:1fd8 }
        for k := 1 to 4 do
          if SpellTab[spell].effect = HelplessEffectIds{g_286C}[k] then ok := false;   { 6100:1ff0  DS:3204 vs DS:286C..286F }
      if ok then begin                                               { 6100:2018 }
        tgt.char := cr(SelectedChar)^.target;                        { 6100:201e }
        tgt.x := CombatantCol(tgt.char);                                       { 6100:2039 }
        tgt.y := CombatantRow(tgt.char);                                       { 6100:204f }
        found := true;                                               { 6100:2065 }
      end;
    end;
    tries := tries - 1;                                              { 6100:2069 }
  end;
end;
if found then begin                                                  { 6100:206f }
  ChooseSpellTarget := true;                                         { 6100:2075 }
  SpellX{g_6DB9} := tgt.x;                                           { 6100:2079 }
  SpellY{g_6DBA} := tgt.y;                                           { 6100:2083 }
end else begin
  ChooseSpellTarget := false;                                        { 6100:208f }
  FillChar(tgt, 7, 0);                                               { 6100:2093 }
end;
```
Note on the area test: `IsSideZero(c)` = `c^.side = 0`; a combatant whose side equals that value is on the **other** side than the caster (side 1 when the caster is a party member, side 0 when it is a monster). So the AI rejects an area pick that contains an enemy of the caster — i.e. this AI path is meant for area spells cast on the caster's own group (L: which spells have needsTarget ≠ 0 and radius > 0 is MAGIC-lane data). Code read literally (H for the code, L for the intent).

### 6100:20C3 CollectSpellTargets (M)
`procedure CollectSpellTargets(spell [BP+0Ch], auto [BP+0Ah]: Byte; var ok [BP+6]: Byte)` — no static caller; installed as the procedure variable `SpellHandlers[0]{g_6B84}` (COMBAT formerly SpellTargetProc) by CombatMain (combat) and called from ov22 (8E00:0D70, 0EBD, 313F). Callees: CombatantCol, CombatantRow, ChooseSpellTarget, BuildTargetList, ShowTimedBottomMessage, RedrawSquare.
Fills `SpellTargets{g_6C95}[1..n]` (far ptrs, 4 bytes each, `g_6C91 + 4i`) and `SpellTargetCount{g_6C94}` according to the target code `SpellTab[spell].target` (DS:3200, low nibble): 0 = caster; 0Fh = one chosen combatant, or the combatants on the chosen square; 8..0Eh = area of radius (code and 7) around the chosen point; 1..7 = (code and 3)+1 distinct chosen combatants. `SpellArea{g_6820}` := 1 for area targeting.
```pascal
ok := 1;                                                             { 6100:20c9 }
SpellTargetCount{g_6C94} := 0;                                       { 6100:20d0 }
SpellArea{g_6820} := 0;                                              { 6100:20d5 }
SpellX{g_6DB9} := CombatantCol(SelectedChar);                                  { 6100:20da }
SpellY{g_6DBA} := CombatantRow(SelectedChar);                                  { 6100:20ea }
code := SpellTab[spell].target and $0F;                              { 6100:20fa  DS:3200 }
if code = 0 then begin                                               { 6100:210b }
  SpellTargets{g_6C95}[1] := SelectedChar;                           { 6100:210f }
  SpellTargetCount{g_6C94} := 1;                                     { 6100:211d }
end else if code = $0F then begin                                    { 6100:2125 }
  if ChooseSpellTarget(spell, auto, 0, t) then begin                 { 6100:212c }
    if cr(SelectedChar)^.target <> nil then begin                    { 6100:2147 }
      SpellTargets{g_6C95}[1] := cr(SelectedChar)^.target;           { 6100:215a }
      SpellTargetCount{g_6C94} := 1;                                 { 6100:2172 }
    end else begin
      BuildTargetList(SpellX{g_6DB9}, SpellY{g_6DBA}, (SpellTab[spell].target and $0F) shr 4, $FF, 1, g_6716);   { 6100:217a  radius always 0 (BUG/quirk: and 0Fh then shr 4) }
      for i := 1 to g_671A do                                        { 6100:21ae }
        SpellTargets{g_6C95}[i] := g_65B9[g_6718[3*i]];              { 6100:21c3 }
      SpellTargetCount{g_6C94} := g_671A;                            { 6100:21ff }
      SpellArea{g_6820} := 1;                                        { 6100:2205 }
    end;
  end else ok := 0;                                                  { 6100:220c }
end else if (code >= 8) and (code <= $0E) then begin                 { 6100:2216 }
  if ChooseSpellTarget(spell, auto, 1, t) then begin                 { 6100:2224 }
    BuildTargetList(SpellX{g_6DB9}, SpellY{g_6DBA}, SpellTab[spell].target and 7, $FF, 1, g_6716);   { 6100:223f }
    for i := 1 to g_671A do                                          { 6100:226e }
      SpellTargets{g_6C95}[i] := g_65B9[g_6718[3*i]];                { 6100:2283 }
    SpellTargetCount{g_6C94} := g_671A;                              { 6100:22bf }
    SpellArea{g_6820} := 1;                                          { 6100:22c5 }
  end else ok := 0;                                                  { 6100:22cc }
end else begin
  left := (SpellTab[spell].target and 3) + 1;                        { 6100:22d6 }
  n := 0;                                                            { 6100:22ed }
  while left > 0 do begin                                            { 6100:22f1 }
    if ChooseSpellTarget(spell, auto, 0, t) then begin               { 6100:22fa }
      dup := false;                                                  { 6100:2315 }
      for j := 1 to n do                                             { 6100:2319 }
        if SpellTargets{g_6C95}[j] = t.char then dup := true;        { 6100:232e }
      if not dup then begin                                          { 6100:2357 }
        n := n + 1;                                                  { 6100:235d }
        SpellTargets{g_6C95}[n] := t.char;                           { 6100:2360 }
        left := left - 1;                                            { 6100:2379 }
      end else if auto = 0 then                                      { 6100:237e }
        ShowTimedBottomMessage('Already been targeted')                           { 6100:2384 }
      else left := left - 1;                                         { 6100:239a }
      RedrawSquare(CombatantCol(SpellTargets{g_6C95}[n]), CombatantRow(SpellTargets{g_6C95}[n]));   { 6100:239d }
    end else left := left - 1;                                       { 6100:23d6 }
  end;
  SpellTargetCount{g_6C94} := n;                                     { 6100:23dc }
  if n = 0 then ok := 0;                                             { 6100:23e2 }
end;
```

### 6100:2414 BeginCast (M)
`procedure BeginCast(spell [BP+0Ch], auto [BP+0Ah]: Byte; var done [BP+6]: Byte)` — external (stub e15: 4800:031A, 4D00:0545 = combat "Cast"). Callees: SpellList (spell list menu), ShowTimedBottomMessage, DrawCombatLayout, FocusCombatant, DrawCharacterSummary, CastSpell (cast now), ClearCombatantActionFlags, ShowCharacterMessage.
Spell 0 = let the player choose from the memorised list. Spells not usable in combat (`DS:3205 = 0`) are refused ("Camp Only Spell"). Casting time `DS:3206 div 3` = 0 → cast at once; otherwise "Begins Casting": the spell is stored in `castSpell` and the caster's initiative is delayed by the casting time (min 1).
```pascal
caster := SelectedChar;                                              { 6100:241a }
f := 1;  w := $FFFF;                                                 { 6100:2427 }
done := 0;                                                           { 6100:2430 }
sp := spell;                                                         { 6100:2437 }
if sp = 0 then sp := SpellList(0, 1, w, f);                          { 6100:243d  choose a memorised spell ("Spells … in Memory") }
if (sp > 0) and (SpellTab[sp].combat = 0) then begin                 { 6100:245b  DS:3205 }
  ShowTimedBottomMessage('Camp Only Spell');                                      { 6100:2473 }
  sp := 0;                                                           { 6100:2487 }
end;
if auto = 0 then begin                                               { 6100:248b }
  DrawCombatLayout;                                                     { 6100:2491  redraw the combat screen layout (ENGINE) }
  FocusCombatant(caster, 3, 1);                                             { 6100:2496 }
  DrawCharacterSummary(caster);                                                   { 6100:24a7 }
end;
if sp > 0 then begin                                                 { 6100:24b2 }
  ct := SpellTab[sp].castTime div 3;                                 { 6100:24bb  DS:3206 }
  if ct = 0 then begin                                               { 6100:24d5 }
    CastSpell(sp, auto, 1, done);                                    { 6100:24db  cast immediately (MAGIC) }
    done := ClearCombatantActionFlags(caster);                                         { 6100:24f0 }
  end else begin
    done := 1;                                                       { 6100:2503 }
    ShowCharacterMessage(caster, 'Begins Casting', $0A, 1);                   { 6100:250a }
    cr(caster)^.castSpell := sp;                                     { 6100:252a }
    if cr(caster)^.initiative > ct then                              { 6100:2538  signed }
      cr(caster)^.initiative := cr(caster)^.initiative - ct          { 6100:2550 }
    else cr(caster)^.initiative := 1;                                { 6100:2561 }
  end;
end;
```

### 6100:2574 CanBackstab (H)
`function CanBackstab(att [BP+0Ah], tgt [BP+6]: PChar): Boolean` — callers: RollDamage, MeleeAttack. Callees: DirectionTo.
A thief (thief level > 0) without armour or in leather (item type 32h), wielding nothing, a club (7), dagger (8), broad, long or short sword (23h..25h), standing directly behind a target that is already engaged (`timesAttacked > 1`).
```pascal
ok := false;                                                         { 6100:257a }
w := att^.readied[0];                                                { 6100:257e }
if w <> nil then wt := w^.type;                                      { 6100:2591 }
arm := att^.readied[2];                                              { 6100:25a3  +D4h }
if ShortInt(att^.level[6]) > 0 then                                  { 6100:25b6  +9Ch }
  if (arm = nil) or (arm^.type = $32) then                           { 6100:25c1 }
    if (w = nil) or (wt = 7) or (wt = 8) or ((wt > $22) and (wt < $26)) then   { 6100:25d3 }
      ok := true;                                                    { 6100:25f3 }
CanBackstab := ok and (cr(tgt)^.timesAttacked > 1)                   { 6100:25f7 }
               and (DirectionTo(att, tgt) = cr(tgt)^.facing);        { 6100:260c }
```

### 6100:263D DirectionTo (H)
`function DirectionTo(a [BP+0Ah], b [BP+6]: PChar): Byte` — callers: MeleeAttack, CanBackstab, MissileAnim, TargetMenu, FaceAttacker, Attack; external (stub e18). Callees: CombatantCol, CombatantRow, InFrontArc.
The first direction 0..8 whose sector (seen from a) contains b.
```pascal
ax := CombatantCol(a);  ay := CombatantRow(a);                                           { 6100:2643 }
bx := CombatantCol(b);  by := CombatantRow(b);                                           { 6100:265f }
d := 0;                                                              { 6100:267b }
while not InFrontArc(ax, ay, bx, by, d) do d := d + 1;              { 6100:267f  never ends if a or b lies outside the 50×25 map }
DirectionTo := d;                                                    { 6100:26a1 }
```

### 6100:26B0 MissileAnim (M)
`procedure MissileAnim(att [BP+0Eh], tgt [BP+0Ah]: PChar; it [BP+6]: PItem)` — caller Attack. Callees: DirectionTo, CopyCombatAnimationFrame, BuildFourAnimationFrames, SetSoundTimerMode, PlayOrStopSound, AnimateAlongPath.
Chooses the missile sprite frames by item type and flies it from the attacker to the target (frame numbers are indexes into the combat sprite set `g_6E36`, base 0Dh).
```pascal
d := DirectionTo(att, tgt);                                          { 6100:26b6 }
steps := 1;  pause := $0A;  frame := $0D;                            { 6100:26c9 }
spd := g_6E36^.w[$11];                                               { 6100:26d5  computed but never used }
if g_4A1E = 1 then spd := spd shr 2;                                 { 6100:26e0 }
t := it^.type;                                                       { 6100:26f1 }
if t in [9, $15, $1C, $1F, $49] then begin                           { 6100:26f8  dart, javelin, quarrel, spear, type 49h }
  if Odd(d) then begin                                               { 6100:270f }
    if (d = 3) or (d = 5) then CopyCombatAnimationFrame(frame + 1, 1, 0, Ord(d = 5))     { 6100:2716  diagonal frame, flags L }
    else CopyCombatAnimationFrame(frame + 1, 0, 0, Ord(d = 7));                 { 6100:2740 }
  end else
    CopyCombatAnimationFrame(frame + (d mod 4), d shr 2, 0, 0);                 { 6100:275e }
end else if t in [2, 7, $14] then begin                              { 6100:278c  hand axe, club, hammer (spinning) }
  BuildFourAnimationFrames(frame + 3);                                          { 6100:2798 }
  steps := 4;  pause := $32;                                         { 6100:27a6 }
end else if t in [$55, $56] then begin                               { 6100:27b0 }
  BuildFourAnimationFrames(frame + 4);                                          { 6100:27b8 }
  steps := 4;  pause := $32;                                         { 6100:27c6 }
end else begin
  if it^.type = $2F then frame := frame + 1;                         { 6100:27d0  sling stone }
  CopyCombatAnimationFrame(frame + 7, 0, 0, 0);                                 { 6100:27dd }
  CopyCombatAnimationFrame(frame + 7, 1, 1, 0);                                 { 6100:27f4 }
  steps := 2;  pause := $14;                                         { 6100:280b }
end;
SetSoundTimerMode(0);                                                    { 6100:2813  sound timer mode (ENGINE) }
PlayOrStopSound(g_2620);                                                   { 6100:281b }
AnimateAlongPath(CombatantCol(att), CombatantRow(att), CombatantCol(tgt), CombatantRow(tgt), steps, pause);     { 6100:2824  animate along the path }
PlayOrStopSound(g_262C);                                                   { 6100:2861 }
SetSoundTimerMode($0A);                                                  { 6100:286a }
```

### 6100:2879 CalcEnemyHpPct (M)
`procedure CalcEnemyHpPct` — external (stub e19: ov08 4800:0880 once per round right after `CombatRound` is incremented; StartCombat). 
`enemy_HpPercent{g_6E2F}` := remaining hit points of the monster side (side 1, active members only) as a percentage of their total `hp_max` (all side-1 members), truncated to a multiple of 5; unchanged when the side has no hp_max at all. Read by ov09 4D00:11B0 (morale).
```pascal
sumMax := 0;                                                         { 6100:287f }
sumHp := 0;                                                          { 6100:2884 }
p := PartyHead;                                                      { 6100:2889 }
while p <> nil do begin                                              { 6100:2896 }
  if p^.side = 1 then begin                                          { 6100:289e }
    if p^.active <> 0 then sumHp := sumHp + p^.hp;                   { 6100:28a9 }
    sumMax := sumMax + p^.hp_max;                                    { 6100:28c4 }
  end;
  p := p^.next;                                                      { 6100:28d3 }
end;
if sumMax > 0 then                                                   { 6100:28e8 }
  enemy_HpPercent{g_6E2F} := Byte(((Word($14 * sumHp) div sumMax)) * 5); { 6100:28ee  16-bit product, high word discarded }
```

### 6100:2908 MaxEnemyMove (M)
`function MaxEnemyMove(c [BP+6]: PChar): Byte` — callers: Flee; external (stub e20: 4D00:10D7). Callees: IsSideZero, CalcMove.
The largest movement (in squares) among the active combatants of the other side.
```pascal
best := 0;                                                           { 6100:290e }
p := PartyHead;                                                      { 6100:2912 }
while p <> nil do begin                                              { 6100:291f }
  if (p^.side = Ord(IsSideZero(c))) and (p^.active <> 0) then begin   { 6100:2927 }
    m := CalcMove(p) shr 1;                                          { 6100:2947 }
    if m > best then best := m;                                      { 6100:2958 }
  end;
  p := p^.next;                                                      { 6100:2966 }
end;
MaxEnemyMove := best;                                                { 6100:297b }
```

### 6100:2998 ConfirmAttackAlly (M)
`function ConfirmAttackAlly(att [BP+0Ah], tgt [BP+6]: PChar): Boolean` — caller ConfirmTarget; external (stub e16: 4800:0D45). Callees: IsSideZero, AskYesNo (Yes/No prompt), CountActiveSides.
Attacking a combatant of the own side asks "Attack handheld: Yes No" (unless the attacker is `controlled`). Yes: every NPC party member (`npc_morale` bit 7) whose status is Okay turns hostile (side 1, target cleared), `AllyAttacked{g_6DE2}` and the ECL flag word 6E33h are set.
```pascal
if (att^.side = Ord(IsSideZero(tgt))) or (att^.controlled <> 0) then begin   { 6100:299e }
  ConfirmAttackAlly := true;                                         { 6100:29be }
  exit;
end;
if AskYesNo('Attack handheld: ', $0D, $0A, $0F) <> 'Y' then             { 6100:29c5  menu "Yes No" }
  ConfirmAttackAlly := false                                         { 6100:29e6 }
else begin
  ConfirmAttackAlly := true;                                         { 6100:29ec }
  AllyAttacked{g_6DE2} := 1;                                         { 6100:29f0 }
  ecl_Mem6B00^.w[$666] := 1;                                         { 6100:29f5  ECL word 6E33h }
  p := PartyHead;                                                    { 6100:2a00 }
  while p <> nil do begin                                            { 6100:2a0d }
    if (p^.status = 0) and (p^.npc_morale > $7F) then begin          { 6100:2a15 }
      p^.side := 1;                                                  { 6100:2a2b }
      cr(p)^.target := nil;                                          { 6100:2a34 }
    end;
    p := p^.next;                                                    { 6100:2a46 }
  end;
  CountActiveSides;                                                     { 6100:2a5b  recount sides }
end;
```

### 6100:2AA0 TargetMenu (M)
`function TargetMenu(att [BP+10h], t [BP+0Ch]: PChar; maxRange [BP+0Ah], showRange [BP+8], unused [BP+6]: Byte): Char` — caller SelectTarget. Callees: TargetDistance, DirectionTo, DrawText, ByteToStr, WeaponIsRanged, GetMissileAmmo, CollectOppositeSideTargets, FUN_00ba_2e46, FocusCombatant, DrawCharacterSummary, HorizontalMenu (horizontal menu).
Shows the currently highlighted combatant t and the menu "Aim: Next Prev Manual [Target ]Center Exit"; "Target " is offered only when t is within maxRange and, for an attack (`showRange <> 0`) with a missile weapon, the attacker has ammunition and is not in melee (no adjacent enemy) unless the weapon is thrown. Returns the key (menu hotkey letter).
```pascal
menu := '';                                                          { 6100:2aa7 }
dist := TargetDistance(att, t);                                            { 6100:2aab }
dir := DirectionTo(att, t);                                          { 6100:2abf  unused }
if showRange <> 0 then                                               { 6100:2ad2 }
  DrawText(0, $17, $0A, 'Range = ' + ByteToStr(dist) + '  ');           { 6100:2ad8  row 23 }
if dist <= maxRange then                                             { 6100:2b14 }
  if showRange = 0 then menu := 'Target '                            { 6100:2b1f }
  else if att <> t then                                              { 6100:2b3a }
    if not WeaponIsRanged(att) then menu := 'Target '              { 6100:2b4a }
    else if GetMissileAmmo(att, ammo) then                                  { 6100:2b6e }
      if (CollectOppositeSideTargets(att, 1) = 0) or FUN_00ba_2e46(att) then    { 6100:2b82 }
        menu := 'Target ';                                           { 6100:2ba3 }
menu := 'Next Prev Manual ' + menu + 'Center Exit';                  { 6100:2bb6 }
FocusCombatant(t, 3, 1);                                                    { 6100:2be8 }
DrawCharacterSummary(t);                                                          { 6100:2bf9 }
TargetMenu := HorizontalMenu('Aim:', menu, $0D, $0A, $0F, 0, 0, k);       { 6100:2c04 }
```

### 6100:2C3D ConfirmTarget (M)
`procedure ConfirmTarget(att [BP+14h], t [BP+10h]: PChar; mode [BP+0Eh]: Byte; var ok [BP+0Ah]: Byte; var tgt [BP+6]: TTargetRec)` — callers: ManualAim, SelectTarget. Callees: ConfirmAttackAlly, CombatantCol, CombatantRow, FocusSquare, FighterSweep, ClearCombatantActionFlags, FaceAttacker, WeaponIsRanged, GetMissileAmmo, FUN_00ba_2e46, TargetDistance, Attack, FillChar.
Accepts t as the target; for an attack (`mode = 1`) asks for confirmation against allies, then performs the attack: a fighter sweep if possible, otherwise one Attack with the ammunition item (none for a thrown weapon used against an adjacent target, i.e. melee).
```pascal
ammo := nil;                                                         { 6100:2c43 }
ok := 1;                                                             { 6100:2c4b }
if (mode = 1) and not ConfirmAttackAlly(att, t) then ok := 0;        { 6100:2c52 }
if ok <> 0 then begin                                                { 6100:2c73 }
  tgt.char := t;                                                     { 6100:2c7f }
  tgt.x := CombatantCol(t);                                                    { 6100:2c8f }
  tgt.y := CombatantRow(t);                                                    { 6100:2ca1 }
  g_6716^.cursor := 0;                                               { 6100:2cb3  map +4 }
  FocusSquare(g_6716^.viewX + 3, g_6716^.viewY + 3, 3, 8);                { 6100:2cbc }
  if mode = 1 then                                                   { 6100:2ce1 }
    if FighterSweep(att, t) then ok := ClearCombatantActionFlags(att)                  { 6100:2cea }
    else begin
      FaceAttacker(att, t);                                          { 6100:2d11 }
      if WeaponIsRanged(att) and GetMissileAmmo(att, ammo) and FUN_00ba_2e46(att)   { 6100:2d21 }
         and (TargetDistance(att, t) = 1) then
        ammo := nil;                                                 { 6100:2d68 }
      Attack(att, t, 0, ammo, ok);                                   { 6100:2d70 }
    end;
end else
  FillChar(tgt, 7, 0);                                               { 6100:2d90 }
```

### 6100:2DFA ManualAim (M)
`procedure ManualAim(att [BP+18h], start [BP+14h]: PChar; maxRange [BP+12h], mode [BP+10h], allowEmpty [BP+0Eh]: Byte; var ok [BP+0Ah]: Byte; var tgt [BP+6]: TTargetRec)` — caller SelectTarget. Callees: FillChar, CombatantCol, CombatantRow, SetIn, FocusSquare, CellAt, FUN_0899_0104, TraceLine (TraceLine), DrawText, WordToStr, ClearRectangle, DrawCharacterSummary, CanAttack, WeaponIsRanged, GetMissileAmmo, CollectOppositeSideTargets, FUN_00ba_2e46, HorizontalMenu, ConfirmTarget, RedrawSquare.
A free cursor on the combat map, moved with the cursor/keypad keys; shows "Range = n" (attack mode) and the summary of the combatant (or body) under it; the menu "(Use Cursor keys) [Target ]Center Exit" offers Target only for a valid square (line of sight, within maxRange, terrain not blocking, attackable). Keys: arrow scan codes 48h↑ 49h PgUp 4Dh→ 51h PgDn 50h↓ 4Fh End 4Bh← 47h Home = directions 0..7; 'C' recentre; 'E'/Esc(#0) exit; 'T'/Enter select.
```pascal
FillChar(tgt, 7, 0);                                                 { 6100:2e01 }
cx := CombatantCol(start);  cy := CombatantRow(start);                                   { 6100:2e12 }
key := ' ';                                                          { 6100:2e2e }
dir := 8;                                                            { 6100:2e32 }
ok := 0;                                                             { 6100:2e36 }
g_6716^.cursor := 1;                                                 { 6100:2e3d  map +4 }
g_6716^[5] := 1;                                                     { 6100:2e46 }
while not (key in [#0, #13, 'E', 'T']) do begin                      { 6100:2e4f  set CS:2DA7 }
  FocusSquare(cx, cy, 3, dir);                                            { 6100:2e62 }
  cx := cx + g_2736[dir];                                            { 6100:2e76 }
  cy := cy + g_273F[dir];                                            { 6100:2e84 }
  if cx < 0 then cx := 0;                                            { 6100:2e92 }
  if cy < 0 then cy := 0;                                            { 6100:2e9c }
  if cx > $31 then cx := $31;                                        { 6100:2ea6 }
  if cy > $18 then cy := $18;                                        { 6100:2eb0 }
  CellAt(cx, cy, occ, ground);                                       { 6100:2eba }
  FUN_0899_0104;                                                     { 6100:2ed1  input poll (disabled routine, ENGINE) }
  valid := false;                                                    { 6100:2ed6 }
  rng := $FF;                                                        { 6100:2eda  word }
  tx := cx;  ty := cy;                                               { 6100:2edf }
  if TraceLine(CombatantCol(att), CombatantRow(att), tx, ty, rng, g_6716) then begin   { 6100:2eeb }
    valid := true;                                                   { 6100:2f23 }
    if mode <> 0 then                                                { 6100:2f27 }
      DrawText(0, $17, $0A, 'Range = ' + WordToStr(rng shr 1) + '  ');  { 6100:2f2d }
  end else if mode <> 0 then                                         { 6100:2f6d }
    ClearRectangle(0, $17, $27, $17);                                      { 6100:2f73 }
  rng := rng shr 1;                                                  { 6100:2f84 }
  start := nil;                                                      { 6100:2f8c  the parameter is reused as "combatant under the cursor" }
  if valid then                                                      { 6100:2f94 }
    if occ > 0 then start := g_65B9[occ]                             { 6100:2f9d }
    else if ground = $1F then                                        { 6100:2fbe }
      for k := 1 to BodyCount{g_6715} do                                { 6100:2fc4 }
        if (BodyList{g_66DD}[k].x = cx) and (BodyList{g_66DD}[k].y = cy) then   { 6100:2fd9 }
          start := BodyList{g_66DD}[k].char;                         { 6100:3003 }
  if start <> nil then DrawCharacterSummary(start)                                { 6100:3025 }
  else ClearRectangle($17, 1, $26, $15);                                   { 6100:303a  clear the summary panel }
  if (maxRange < rng) or (g_2744[ground*4] = $FF) then valid := false;   { 6100:304b  terrain table byte }
  if start <> nil then begin                                         { 6100:306b }
    if not CanAttack(att, start) then valid := false;                { 6100:3076 }
    if mode = 1 then                                                 { 6100:308e }
      if (att = start) or ((occ = 0) and (ground = $1F)) then valid := false   { 6100:3094  self, or a body }
      else if WeaponIsRanged(att) then                             { 6100:30b6 }
        if not GetMissileAmmo(att, ammo) then valid := false                { 6100:30c5 }
        else if (CollectOppositeSideTargets(att, 1) > 0) and not FUN_00ba_2e46(att) then   { 6100:30d9 }
          valid := false;                                            { 6100:30fa }
  end else if allowEmpty = 0 then valid := false;                    { 6100:3100 }
  menu := 'Center Exit';                                             { 6100:310a }
  if valid then menu := 'Target ' + menu;                            { 6100:311d }
  key := HorizontalMenu('(Use Cursor keys) ', menu, $0D, $0A, $0F, 1, 0, g_6E31);   { 6100:314b }
  case key of                                                        { 6100:317b }
    #13, 'T': begin
        g_6716^.cursor := 0;                                         { 6100:3189 }
        if valid then begin                                          { 6100:3192 }
          tgt.x := cx;  tgt.y := cy;                                 { 6100:3198 }
          if start <> nil then tgt.char := start else tgt.char := nil;   { 6100:31ac }
          if mode = 1 then ConfirmTarget(att, tgt.char, mode, ok, tgt)   { 6100:31d2 }
          else ok := 1;                                              { 6100:31fc }
        end;
        if (not valid) or (ok = 0) then begin                        { 6100:3203 }
          RedrawSquare(cx, cy);                                        { 6100:3212 }
          ok := 0;                                                   { 6100:321f }
          FillChar(tgt, 7, 0);                                       { 6100:3226 }
        end;
      end;
    'H': dir := 0;                                                   { 6100:323a }
    'I': dir := 1;                                                   { 6100:3245 }
    'M': dir := 2;                                                   { 6100:3250 }
    'Q': dir := 3;                                                   { 6100:325b }
    'P': dir := 4;                                                   { 6100:3265 }
    'O': dir := 5;                                                   { 6100:326f }
    'K': dir := 6;                                                   { 6100:3279 }
    'G': dir := 7;                                                   { 6100:3283 }
    #0, 'E': begin                                                   { 6100:328d }
        RedrawSquare(cx, cy);                                          { 6100:3295 }
        FillChar(tgt, 7, 0);                                         { 6100:32a2 }
        ok := 0;                                                     { 6100:32b3 }
      end;
    'C': begin                                                       { 6100:32bc }
        FocusSquare(cx, cy, 0, 8);                                        { 6100:32c0 }
        dir := 8;                                                    { 6100:32d3 }
      end;
    else dir := 8;                                                   { 6100:32d9 }
  end;
end;
```

### 6100:32E6 CombatBuildTargetList (M) — nested procedure of SelectTarget
`procedure CombatBuildTargetList(c [BP+8]: PChar)` (+ static link [BP+6] to SelectTarget's frame) — caller SelectTarget. Callees: CombatantCol, CombatantRow, CombatantSize, BuildTargetList, CopyBytes.
All combatants within 7Fh of c (in the scan order of BuildTargetList) into SelectTarget's list `L[1..n]` (3-byte entries copied from `g_6718`; byte 0 = combatant index).
```pascal
BuildTargetList(CombatantCol(c), CombatantRow(c), $7F, $FF, CombatantSize(c), g_6716);                  { 6100:32ec }
n := g_671A;                                                         { 6100:3324  parent local [BP-0DAh] }
for i := 1 to n do                                                   { 6100:332f }
  L[i] := g_6718[3*i .. 3*i+2];                                      { 6100:3349  CopyBytes 3 }
```

### 6100:3389 NextTarget (M) — nested function of SelectTarget
`function NextTarget(step [BP+0Ah]: ShortInt; draw [BP+8]: Byte): PChar` (+ static link [BP+6]) — caller SelectTarget. Callees: RedrawSquare, AnimateAlongPath.
Moves the highlight `cur` by step (wrapping 1..n), returns the combatant; with draw ≠ 0 the cursor is animated from the old to the new position, else the old cell is redrawn.
```pascal
if draw <> 0 then begin                                              { 6100:338f }
  px := g_5F27[L[cur].idx*4];                                        { 6100:3395  parent [BP-0DEh] }
  py := g_5F28[L[cur].idx*4];                                        { 6100:33c3  parent [BP-0DFh] }
end else
  RedrawSquare(px, py);                                                { 6100:33f3 }
cur := cur + step;                                                   { 6100:340a }
if cur = 0 then cur := n;                                            { 6100:3415 }
if cur > n then cur := 1;                                            { 6100:3430 }
t := g_65B9[L[cur].idx];                                             { 6100:344b }
nx := g_5F27[L[cur].idx*4];                                          { 6100:347b  parent [BP-0E0h] }
ny := g_5F28[L[cur].idx*4];                                          { 6100:34a9  parent [BP-0E1h] }
if draw <> 0 then begin                                              { 6100:34d7 }
  AnimateAlongPath(px, py, nx, ny, 1, 0);                               { 6100:34dd  move the cursor sprite }
  px := nx;                                                          { 6100:350c }
  py := ny;                                                          { 6100:351c }
end;
NextTarget := t;                                                     { 6100:352c }
```

### 6100:3558 SelectTarget (M)
`procedure SelectTarget(att [BP+14h]: PChar; range [BP+12h], mode [BP+10h], allowEmpty [BP+0Eh]: Byte; var ok [BP+0Ah]: Byte; var tgt [BP+6]: TTargetRec)` — callers: ChooseSpellTarget (mode 0, spell range); external (stub e17: ov08 4800:031A = combat "Aim"/attack, mode 1). Callees: CopyCombatAnimationFrame, FillChar, CombatBuildTargetList, NextTarget, CanAttack, TargetMenu, ManualAim, ConfirmTarget, FocusSquare, RedrawSquare, CombatantCol, CombatantRow, ClearRectangle.
The "Aim:" loop over the combatants in range (nearest first, as BuildTargetList orders them), skipping those that cannot be attacked. range = FFh → weapon range − 1 (1 without a weapon); 0 or FFh → 1. Keys from TargetMenu: N next, P previous, M manual cursor, T target, C centre, E / Esc leave.
```pascal
CopyCombatAnimationFrame($19, 0, 0, 0);                                         { 6100:355f  load the cursor frame }
FillChar(tgt, 7, 0);                                                 { 6100:3570 }
ok := 0;                                                             { 6100:3581 }
maxR := range;                                                       { 6100:3588 }
if maxR = $FF then                                                   { 6100:358f }
  if att^.readied[0] <> nil then maxR := ITEMS[att^.readied[0]^.type].range - 1   { 6100:3596 }
  else maxR := 1;                                                    { 6100:35c6 }
if (maxR = 0) or (maxR = $FF) then maxR := 1;                        { 6100:35cb }
CombatBuildTargetList(att);                                                { 6100:35de }
cur := 1;                                                            { 6100:35e9 }
skip := 0;                                                           { 6100:35ee }
t := NextTarget(skip, 1);                                            { 6100:35f3 }
skip := 1;                                                           { 6100:3608 }
key := ' ';                                                          { 6100:360d }
while (ok = 0) and not (key in [#0, 'E']) do begin                   { 6100:3612  set CS:3538 }
  if not CanAttack(att, t) then                                      { 6100:3632 }
    t := NextTarget(skip, 0)                                         { 6100:3648 }
  else begin
    key := TargetMenu(att, t, maxR, mode, allowEmpty);               { 6100:3660 }
    case key of
      'N': begin skip := 1;  move := 1 end;                          { 6100:3687 }
      'P': begin skip := -1; move := -1 end;                         { 6100:3698 }
      'M': begin                                                     { 6100:36a9 }
          ManualAim(att, t, maxR, mode, allowEmpty, ok, tgt);        { 6100:36ad }
          CopyCombatAnimationFrame($19, 0, 0, 0);                               { 6100:36d6 }
          CombatBuildTargetList(att);                                      { 6100:36e7 }
          move := 0;                                                 { 6100:36f2 }
        end;
      'T': begin                                                     { 6100:36f9 }
          ConfirmTarget(att, t, mode, ok, tgt);                      { 6100:36fd }
          CopyCombatAnimationFrame($19, 0, 0, 0);                               { 6100:371d }
          CombatBuildTargetList(att);                                      { 6100:372e }
          move := 0;                                                 { 6100:3739 }
        end;
      'C': begin                                                     { 6100:3740 }
          FocusSquare(CombatantCol(t), CombatantRow(t), 0, 8);                                { 6100:3744 }
          move := 0;                                                 { 6100:376b }
        end;
    end;                                                             { other keys: move keeps its previous value (uninitialised before the first N/P/M/T/C) }
    RedrawSquare(CombatantCol(t), CombatantRow(t));                                        { 6100:3770 }
    t := NextTarget(move, Ord((ok = 0) and not (key in [#0, 'E'])));  { 6100:3791 }
  end;
end;
if mode <> 0 then ClearRectangle(0, $17, $27, $17);                        { 6100:37c7  clear the "Range =" row }
```

### 6100:37E4 AutoTarget (M)
`function AutoTarget(c [BP+0Ch]: PChar; range [BP+0Ah], ignoreBlock [BP+8], fresh [BP+6]: Byte): Boolean` — callers: ChooseSpellTarget (range, 0, 1); external (stub e21: 4D00:07F2, 4D00:0B3C, AiCombatTurn = monster AI). Callees: CanAttack, CollectOppositeSideTargets, Roll.
AI target choice: keeps the current target if `fresh = 0` and it is a live, attackable enemy; otherwise up to 20 random picks among the enemies within range, discarding those that cannot be attacked; a second pass sets the map scan flag (`g_6716^[6] := 1`, used by BuildTargetList) when `fresh = 0`. Result: a target was set in `cr(c)^.target`.
```pascal
pass := 0;  found := false;  last := 0;                              { 6100:37ea }
t := cr(c)^.target;                                                  { 6100:37f6 }
if fresh <> 0 then cr(c)^.target := nil                              { 6100:380c }
else if t <> nil then                                                { 6100:3812 }
  if (t^.side = c^.side) or (t^.active = 0) or not CanAttack(c, t) then   { 6100:381a }
    cr(c)^.target := nil;                                            { 6100:384b }
if cr(c)^.target <> nil then found := true;                          { 6100:385d }
while not found and (last = 0) do begin                              { 6100:3873 }
  last := pass;                                                      { 6100:3885 }
  if (pass <> 0) and (fresh = 0) then g_6716^[6] := 1;               { 6100:388b }
  tries := 20;                                                       { 6100:38a0 }
  n := CollectOppositeSideTargets(c, range);                                     { 6100:38a4 }
  while (tries > 0) and not found and (n > 0) do begin               { 6100:38b6 }
    tries := tries - 1;                                              { 6100:38d1 }
    r := Roll(1, n);                                                 { 6100:38d4 }
    if foe_List{g_6DE4}[r] > 0 then begin                           { 6100:38e3 }
      e := g_65B9[foe_List{g_6DE4}[r]];                             { 6100:38f4 }
      if ((ignoreBlock <> 0) and (g_6716^[6] <> 0)) or CanAttack(c, e) then begin   { 6100:3915 }
        found := true;                                               { 6100:393a }
        cr(c)^.target := e;                                          { 6100:393e }
      end else begin
        foe_List{g_6DE4}[r] := 0;                                   { 6100:3956 }
        for k := 1 to n do                                           { 6100:3962 }
          if foe_List{g_6DE4}[k] > 0 then found := true;            { 6100:3977  reused as "any left" }
        if found then found := false                                 { 6100:3991 }
        else n := 0;                                                 { 6100:399d }
      end;
    end;
  end;
  if pass = 0 then pass := 1;                                        { 6100:39a4 }
end;
g_6716^[6] := 0;                                                     { 6100:39b1 }
AutoTarget := found;                                                 { 6100:39ba }
```

### 6100:39D2 EffRake (M)
`procedure EffRake(c [BP+0Ch]: PChar; eff [BP+8]: PEffect; event [BP+6]: Byte)` — effect handler for effect id **49h** (table `DS:6828 + 49h*4` = DS:694C, installed by InstallEffectHandlers), called through ov24 (handler signature (char, effect record, event)). Callees: ShowCharacterMessage, Attack, ClearCombatantActionFlags.
When both slot-1 attacks hit this round (`SlotHits[1] = 2`) and the target is still up, two extra rear-claw swings of 2d4 ("Rakes...").
```pascal
if SlotHits{g_6823}[1] <> 2 then exit;                               { 6100:39d8  g_6823 }
if cr(c)^.target^.active = 0 then exit;                              { 6100:39e2 }
cr(c)^.attackSlot := 2;                                              { 6100:39f9 }
c^.attacks_left[2] := 2;                                             { 6100:3a06  +114h }
c^.dmg_dice[2] := 2;                                                 { 6100:3a0f  +116h }
c^.dmg_sides[2] := 4;                                                { 6100:3a18  +118h }
c^.attacks_left[1] := 0;                                             { 6100:3a21 }
ShowCharacterMessage(c, 'Rakes...', $0A, 1);                                  { 6100:3a2a }
Attack(c, cr(c)^.target, 0, nil, d);                                 { 6100:3a4a }
d := ClearCombatantActionFlags(c);                                                     { 6100:3a72 }
```

### 6100:3A86 EffHold (L)
`procedure EffHold(c [BP+0Ch]: PChar; eff [BP+8]: PEffect; event [BP+6]: Byte)` — effect handler for effect id **4Ah** (DS:6950). Callees: RemoveEffect, Attack, ClearCombatantActionFlags.
The effect's `p3` byte (+3) is the combatant index of the held victim (`g_6826`). If the event is not 0, or either party is down, the hold ends (victim loses effect 3Ah; for event 0 also c loses this 4Ah record, after clearing `eff^.p4`). Otherwise c makes one attack (1 swing of 3d4) on the victim with `behind = 1` (rear AC, "(from behind)" text); if the victim drops, c loses effect 4Ah. (Which monster grants 4Ah/3Ah: MONSTERS lane; name L.)
```pascal
g_6826 := g_65B9[eff^.p3];                               { 6100:3a8c }
if (event <> 0) or (c^.active = 0) or (g_6826^.active = 0) then begin   { 6100:3aaa }
  RemoveEffect(g_6826, $3A, nil);                        { 6100:3ac7 }
  if event = 0 then begin                                            { 6100:3add }
    eff^.p4 := 0;                                                    { 6100:3ae3 }
    RemoveEffect(c, $4A, eff);                                       { 6100:3aeb }
  end;
end else begin
  c^.attacks_left[1] := 1;                                           { 6100:3b01 }
  c^.attacks_left[2] := 0;                                           { 6100:3b0a }
  c^.dmg_dice[1] := 3;                                               { 6100:3b13  +115h }
  c^.dmg_sides[1] := 4;                                              { 6100:3b1c  +117h }
  Attack(c, g_6826, 1, nil, d);                          { 6100:3b25 }
  d := ClearCombatantActionFlags(c);                                                   { 6100:3b45 }
  if g_6826^.active = 0 then RemoveEffect(c, $4A, eff);  { 6100:3b53 }
end;
```

### 6100:3B93 GodsIntervene (H)
`function GodsIntervene: Boolean` — external (stub e24: 4800:031A, 4D00:0FC1). Callees: ParamStr, ShowTimedBottomMessage, CombatantIndex, ClearCombatantActionFlags, FocusSquare.
Debug cheat: when the game was started as `START STING` (LAYOUT.md finding), every monster (side 1) is killed at once and the combat view is redrawn; result true. Otherwise false.
```pascal
GodsIntervene := false;                                              { 6100:3b9a }
if ParamStr(1) = 'STING' then begin                                  { 6100:3b9e }
  GodsIntervene := true;                                             { 6100:3bbc }
  ShowTimedBottomMessage('The Gods intervene!');                                  { 6100:3bc0 }
  p := PartyHead;                                                    { 6100:3bd4 }
  while p <> nil do begin                                            { 6100:3be1 }
    if p^.side = 1 then begin                                        { 6100:3be9 }
      p^.active := 0;                                                { 6100:3bf4 }
      p^.status := 6;                                                { 6100:3bfd  Dead }
      g_5F2A[CombatantIndex(p)*4] := 0;                              { 6100:3c06  icon removed }
    end;
    ClearCombatantActionFlags(p);                                                      { 6100:3c1e  for every list member }
    p := p^.next;                                                    { 6100:3c2c }
  end;
  FocusSquare(g_6716^.viewX + 3, g_6716^.viewY + 3, $FF, 8);              { 6100:3c41 }
end;
```

### 6100:3C6D ov13_init (H)
`procedure ov13_init` — unit initialisation (entry e0, called by the main program through stub_ov13_e0); empty body.
```pascal
{ empty }                                                            { 6100:3c6d }
```

---

## ov18 (seg 7A00) — dragon finale, overland tile recolouring (FINAL pseudocode, lane por-mod-combat)

Unit: ov18, analysis segment 7A00, 4 routines (functions.tsv): 7A00:0006, 7A00:02A4 (entry e1), 7A00:06B3 (entry e2), 7A00:08F6 (init).
Role: the end-game sequence run by ECL `PROGRAM 8` (ecl_op38_Program 2F00:2E5A, ECL_VM.md op 38) — "Mortally wounded, the dragon roars!", the spirit of Tyranthraxus, the FINAL pictures/animations — plus a recolouring of overland-map tiles (SQRPACI) used by ecl_RunAfterNewBlock and LoadGame.
Sources: `decode/listings/ov18.lst` (evidence), `ov18.c` (aid). String literals live in the code segment 7A00:0000..0113 and 7A00:0114..02A3 (STRINGS.md 706..720).

Conventions (as VIEW.pas.md)
- **Signatures are in Pascal order**: first parameter = highest BP offset (pushed first). Parameters are given as `name [BP+xx]`.
- `{ seg:off }` = address of the first instruction of the statement (or of the call that implements it).
- Globals: `g_XXXX` = DS:XXXX (GLOBALS.md); names introduced here are written `Name{g_XXXX}` and listed in `ov18_names.json` / `ov18_notes.md`.
- Resident callees are written `Name{SSSS:OOOO}` with the ENGINE lane names (decode/names/engine_names.json); argument lists are in Pascal (push) order as read at the call sites here:
  - `ClearTextRectangle{0709:0DD3}(col1, row1, col2, row2)` — blank a text-cell rectangle.
  - `DrawText{0709:0626}(col, row, colour, s)` — draw a string at a text cell (col is advanced per character).
  - `MessageDelay{0709:0DBE}` = `Delay(GameSpeed * 225)`.
  - `TimeInHundredths{0709:0C3F}: LongInt` = GetTime → h*360000 + m*6000 + s*100 + hs.
  - `LoadPicture{0464:0111}(name, recId, b0C, b0A, var pic)` — load DAX picture record `recId` of `name+'.dax'`, freeing the old `pic` first (the two bytes `b0C`, `b0A` are 0 here; their meaning belongs to ENGINE).
  - `DrawPicture{0464:0D71}(col [BP+14h], row [BP+12h], b10, b0E, src, dst)` — copy picture `src` into picture `dst` at 8x8-cell (col,row) (row is the `*8` operand, M); `dst` is always `g_4A20` (off-screen screen picture).
  - `FlushViewDirtyLines{0464:1B52}` — copy changed lines of `g_4A20^` to video.
  - `RecolorPicture{0464:1E5C}(fromColours, toColours, frame, dither, pic)` — in frame `frame` of `pic` replace every pixel of colour `fromColours[k]` by `toColours[k]` (k = 0..15); `dither <> 0` = each pixel is replaced only when `Random(4) = 0` (asm 0464:207A..2091, H).
  - `RedrawCurrentMode{00BA:27D9}` — redraw the screen frame for the current game mode `game_Mode`.
- VIEW-lane callees (published names, decode/names/view_names.json; signatures from VIEW.pas.md): `LoadAnimation(name, id, flags, var anim)` (record `id` of `name + Str(DataSet) + '.dax'`, sets `anim.cur := 1`); `DrawPictureScreenOrView(col, row, toView, pic)` (draw `pic` at cell (col,row) into the view picture and flush; distinct from the ENGINE `DrawPicture{0464:0D71}` — plain `DrawPicture` below = 0464:0D71); `FreeAnimation(var anim)`; `DrawOverlandWindow(wx, wy)` (5×5 overland squares from map column wx, row wy of `OverlandMap` DS:3648).

Record used by PlayFinaleAnimation (layout read from LoadAnimation and the indexing at 7a00:0082/00b4, H):
```pascal
TAnim = record                      { 66 bytes, FillChar'ed by the caller }
  count : Byte;                     { +0  number of frames loaded }
  cur   : Byte;                     { +1  current frame, 1-based (LoadAnimation sets 1) }
  frame : array[1..8] of record     { +2  }
            delay : LongInt;        {     hundredths of a second (scaled, see below) }
            pic   : Pointer;        {     picture }
          end;
end;
```

---

### 7A00:0006 PlayFinaleAnimation (M)
`procedure PlayFinaleAnimation(col [BP+0Ch], row [BP+0Ah]: Integer; animId [BP+8], cycles [BP+6]: Byte)` — RETF 8. Callers: DragonFinale (3×). Callees: TimeInHundredths, FillChar, LoadAnimation, DrawPicture, FlushViewDirtyLines, DrawPictureScreenOrView, LongMul, FreeAnimation.
Loads animation `animId` of the FINAL file and plays it at cell (col,row) until it has run `cycles` complete loops; each frame stays for `(GameSpeed + 3) * frame.delay` hundredths of a second. Name: M (behaviour; string "FINAL" at 7A00:0000).
```pascal
done := 0;                                                         { 7a00:000c }
t0 := TimeInHundredths;                                            { 7a00:0010 }
FillChar(anim, $42, 0);                                            { 7a00:001b }
LoadAnimation('FINAL', animId, 2, anim);                               { 7a00:002c  file FINAL<DataSet>.dax }
DrawPicture(col - 1, row - 1, 0, 0, anim.frame[1].pic, g_4A20);    { 7a00:004c }
FlushViewDirtyLines;                                                  { 7a00:006f }
repeat
  DrawPictureScreenOrView(col, row, 1, anim.frame[anim.cur].pic);                { 7a00:0074 }
  t := TimeInHundredths;                                           { 7a00:0093 }
  if t - t0 > LongInt(GameSpeed + 3) * anim.frame[anim.cur].delay then begin   { 7a00:009e  signed 32-bit compare }
    anim.cur := anim.cur + 1;                                      { 7a00:00db }
    if anim.cur > anim.count then begin                            { 7a00:00de }
      anim.cur := 1;                                               { 7a00:00e6 }
      done := done + 1;                                            { 7a00:00ea }
    end;
    t0 := t;                                                       { 7a00:00ed }
  end;
until done = cycles;                                               { 7a00:00f9 }
FreeAnimation(anim);                                                   { 7a00:0104 }
```
Notes: the loop redraws the current frame continuously (busy loop); `GameSpeed` is the speed/delay setting also used by MessageDelay (`Delay(GameSpeed*225)`), so a larger value = slower animation. `cycles = 0` would loop until the byte counter wraps (256 loops) — not used.

### 7A00:02A4 DragonFinale (H)
`procedure DragonFinale` — no parameters, RETF. Caller: ecl_op38_Program (2F00:2E5A, `PROGRAM 8`, via stub_ov18_e1). Callees: StrLong, ClearTextRectangle, DrawText, RedrawCurrentMode, LoadPicture, DrawPicture, PlayFinaleAnimation, MessageDelay.
The end-game sequence: three text pages in the bottom text window (rows 17..22, colour 10), the FINAL pictures (record 1 and 3 full screen, records 4..6 = extra figures drawn only when the party has more than 1/2/3 members) and three animations. Name H (strings 7A00:0114..029B; ECL_VM.md: PROGRAM 8 = endgame).
```pascal
Str(DataSet:0, DataSetStr{g_4713});                                     { 7a00:02ab  string[1] }
SavedMode{g_4712} := game_Mode;                                            { 7a00:02c5 }
game_Mode := 7;                                                            { 7a00:02cb  game mode 7 during the finale }
FinalePic{g_470E} := nil;                                               { 7a00:02d0  far pointer g_470E:g_4710 }
ClearTextRectangle(1, 17, 38, 22);                                           { 7a00:02d8 }
DrawText(1, 17, 10, 'Mortally wounded, the dragon roars!');             { 7a00:02e9 }
DrawText(1, 18, 10, 'The spirit of Tyranthraxus flares up');            { 7a00:0306 }
DrawText(1, 19, 10, 'from the dragon''s body.');                        { 7a00:0323 }
RedrawCurrentMode;                                                      { 7a00:0340 }
LoadPicture('FINAL' + DataSetStr, 1, 0, 0, FinalePic);                  { 7a00:0345 }
DrawPicture(0, 0, 0, 0, FinalePic, g_4A20);                             { 7a00:0372 }
PlayFinaleAnimation(3, 5, 2, (5 * (10 - GameSpeed)) shr 1);                { 7a00:0393  16-bit arithmetic, low byte passed }
LoadPicture('FINAL' + DataSetStr, 3, 0, 0, FinalePic);                  { 7a00:03b9 }
DrawPicture(0, 0, 0, 0, FinalePic, g_4A20);                             { 7a00:03e6 }
if ecl_Mem6B00^.w[$67C] > 1 then begin                                  { 7a00:0407  party member count (SAVES §2) }
  LoadPicture('FINAL' + DataSetStr, 4, 0, 0, FinalePic);                { 7a00:0413 }
  DrawPicture(0, 11, 0, 0, FinalePic, g_4A20);                          { 7a00:0440 }
end;
if ecl_Mem6B00^.w[$67C] > 2 then begin                                  { 7a00:0462 }
  LoadPicture('FINAL' + DataSetStr, 5, 0, 0, FinalePic);                { 7a00:046e }
  DrawPicture(13, 9, 0, 0, FinalePic, g_4A20);                          { 7a00:049b }
end;
if ecl_Mem6B00^.w[$67C] > 3 then begin                                  { 7a00:04be }
  LoadPicture('FINAL' + DataSetStr, 6, 0, 0, FinalePic);                { 7a00:04ca }
  DrawPicture(0, 9, 0, 0, FinalePic, g_4A20);                           { 7a00:04f7 }
end;
ClearTextRectangle(1, 17, 38, 22);                                           { 7a00:0519 }
DrawText(1, 17, 10, '"Fools, you have but slain the body');             { 7a00:052a }
DrawText(1, 18, 10, 'I possessed.  I cannot be defeated!"');            { 7a00:0547 }
DrawText(1, 19, 10, 'With the power of the pool of radiance');          { 7a00:0564 }
DrawText(1, 20, 10, 'which I moved here, to my lair,');                 { 7a00:0581 }
DrawText(1, 21, 10, 'I will still rule, by possessing one');            { 7a00:059e }
DrawText(1, 22, 10, 'of you!"');                                        { 7a00:05bb }
PlayFinaleAnimation(3, 1, 7, (5 * (10 - GameSpeed)) shr 1);                { 7a00:05d8 }
ClearTextRectangle(1, 17, 38, 22);                                           { 7a00:05fe }
DrawText(1, 17, 10, '"No Lord Bane!  I can still rule here!');          { 7a00:060f }
DrawText(1, 18, 10, 'I have not failed.  Do not call me back');         { 7a00:062c }
DrawText(1, 19, 10, 'through the pool!"');                              { 7a00:0649 }
DrawText(1, 20, 10, 'Noooo...');                                        { 7a00:0666 }
PlayFinaleAnimation(3, 1, 8, 1);                                        { 7a00:0683 }
MessageDelay;                                                           { 7a00:0695 }
MessageDelay;                                                           { 7a00:069a }
MessageDelay;                                                           { 7a00:069f }
game_Mode := SavedMode;                                                    { 7a00:06a4 }
RedrawCurrentMode;                                                      { 7a00:06aa }
```
Notes: `FinalePic` is never freed here (the next LoadPicture of the same variable would free it; none follows) — a small heap leak in the original (H, no FreeMem/0464:2595 call in the routine). The text strings are drawn without waiting for a key; pacing comes only from the animations and the three MessageDelays. The PlayFinaleAnimation cycle count `(5*(10-GameSpeed)) shr 1` is computed in 16 bits (`SUB`, `SHL`×2, `ADD`, `SHR`) and pushed as a byte: speed 0 → 25 loops, speed 10 → 0 (= 256 loops, see PlayFinaleAnimation note) — GameSpeed > 10 gives a wrapped value.

### 7A00:06B3 RecolourOverlandTiles (M)
`procedure RecolourOverlandTiles(animate [BP+6]: Boolean)` — RETF 2. Callers: ecl_RunAfterNewBlock 2F00:3243 (`animate = 1`; after vector E of a newly loaded block, when `ecl_Mem4900^.w[$1CC] = 0`, `ecl_Block = $1A` (that branch also sets `g_49FA := 3`, `game_Mode := 3`), `ecl_Mem4900^.w[$366] = $FE` and `ecl_Mem4900^.w[$344] = 0`), LoadGame LoadGame at 7500:1CB2 (`animate = 0`, when `ecl_Mem4900^.w[$344] <> 0`). Callees: DrawOverlandWindow, FlushViewDirtyLines, RecolorPicture, MessageDelay.
Recolours 29 tiles of the overland tile sets (SQRPACI record 1 = `TileSetLo`, record 2 = `TileSetHi`, both loaded by InitGameState 5700:04C3..04FD): colour 7 → 2 in all of them, and colour 0 → 1 in the 11 tiles of list A. With `animate` it first shows the change progressively: 9 steps, each a 1/4 random dither of all 29 tiles followed by a redraw of the overland view at a moving map position. Name M (behaviour; what the change means in the story is not in the code).
```pascal
if animate then begin                                                   { 7a00:06b9 }
  DrawOverlandWindow($11, $0F);                                                  { 7a00:06c2 }
  FlushViewDirtyLines;                                                     { 7a00:06cf }
  for step := 0 to 8 do begin                                           { 7a00:06d4 }
    for i := 0 to 10 do                                                 { 7a00:06dd }
      if TileListA{g_0900}[i] > $7F then                                { 7a00:06e6 }
        RecolorPicture(g_091D, g_092D, TileListA[i] and $7F, 1, TileSetHi)   { 7a00:06f4 }
      else
        RecolorPicture(g_091D, g_092D, TileListA[i], 1, TileSetLo);    { 7a00:0720 }
    for i := 0 to 17 do                                                 { 7a00:074e }
      if TileListB{g_090B}[i] > $7F then                                { 7a00:0757 }
        RecolorPicture(g_091D, g_093D, TileListB[i] and $7F, 1, TileSetHi)   { 7a00:0765 }
      else
        RecolorPicture(g_091D, g_093D, TileListB[i], 1, TileSetLo);    { 7a00:0791 }
    DrawOverlandWindow(g_094D[step], g_095F[step]);                              { 7a00:07bf }
    FlushViewDirtyLines;                                                   { 7a00:07de }
  end;
end;
for i := 0 to 10 do                                                     { 7a00:07ec  final, complete pass }
  if TileListA[i] > $7F then
    RecolorPicture(g_091D, g_092D, TileListA[i] and $7F, 0, TileSetHi) { 7a00:0803 }
  else
    RecolorPicture(g_091D, g_092D, TileListA[i], 0, TileSetLo);        { 7a00:082f }
for i := 0 to 17 do                                                     { 7a00:085d }
  if TileListB[i] > $7F then
    RecolorPicture(g_091D, g_093D, TileListB[i] and $7F, 0, TileSetHi) { 7a00:0874 }
  else
    RecolorPicture(g_091D, g_093D, TileListB[i], 0, TileSetLo);        { 7a00:08a0 }
if animate then begin                                                   { 7a00:08ce }
  DrawOverlandWindow($17, $19);                                                  { 7a00:08d4 }
  FlushViewDirtyLines;                                                     { 7a00:08e1 }
  MessageDelay;                                                         { 7a00:08e6 }
  MessageDelay;                                                         { 7a00:08eb }
end;
```
Image data (DS bytes read from START.unpacked.exe, H):
- `TileListA{g_0900}` (11 B) = 65 66 67 68 69 6A 6B 71 E0 E1 E2 (E0..E2 → tiles 60h..62h of SQRPACI record 2).
- `TileListB{g_090B}` (18 B) = 56 57 58 59 6C 6D 6E 6F 70 72 73 74 75 76 77 DF F3 F5.
- `g_091D` (16 B, "from" colours) = 00 01 02 … 0F (identity).
- `g_092D` (16 B, "to" for list A) = 01 01 02 03 04 05 06 02 08 … 0F → colour 0→1, 7→2.
- `g_093D` (16 B, "to" for list B) = 00 01 02 03 04 05 06 02 08 … 0F → colour 7→2.
- `g_094D[0..8]` (words, view column) = 11h 11h 11h 13h 13h 13h 17h 17h 17h; `g_095F[0..8]` (words, view row) = 0Fh 0Fh 0Fh 14h 14h 14h 19h 19h 19h.
Note: the argument order of RecolorPicture is (from, to) = (`g_091D`, `g_092D`/`g_093D`) in Pascal order (first pushed `g_091D` = `fromCol [BP+12h]` of the ENGINE declaration 0464:1E5C; re-checked #fable-3, H); which list is "from" is taken from the identity contents of `g_091D` (M).

### 7A00:08F6 ov18_init (H)
`procedure ov18_init` — unit initialisation, empty body (`PUSH BP; MOV BP,SP; POP BP; RETF`). Called by the main program's init chain (0000:0097).  { 7a00:08f6 }

---

## ov19 (7F00) — character sheet, View menu, items menu, item/coin trade, sell/identify, spell-list header (FINAL pseudocode, lane por-mod-combat)

Unit: GAME.OVR unit 19, stub segment 0085, analysis segment **7F00**, code 2B12h bytes, 13 entry points (e0 = init, e1..e12 below).
Sources: `decode/listings/ov19.lst` (evidence, read instruction by instruction), `ov19.c` (aid only). Data specs: `decode/data/SAVES.md` (TChar, item record, ITEMS table), `decode/ecl/ECL_VM.md`.

Role summary (evidence = the strings each routine prints and the fields it touches):
- **Character sheet** (`DrawCharacterSheet` + `0901` abilities + `050D` money + `0608` AC/HP/THAC0/Damage/Encumbrance/Movement). Also used by character creation (ov16 `FUN_7000_1551` via stubs e1..e4).
- **View menu** (`ViewMenu`, "View:" Items/Spells/Trade/Drop/Exit). Entered from the shop (ov06), temple (ov04), treasure (ov05), camp (ov15), 3D/overland command loop (ov14), top level (ov16) and combat (ov08 `PlayerTurn`).
- **Items menu** (`ItemsMenu`, Ready/Use/Trade/Drop/Halve/Join/Sell/Id) and its actions (`14D0` ready, `1A8A` use, `1734` trade, `17ED` halve, `189D` join, `1CEE` sell, `1F52` identify, `0D70` may-lose check, `275B` overload check).
- **Coins** (`2156` trade coins, `24A7` drop coins, `28BE` money value in gold).
- **Party cycling** (`27DF`, extended keys from every menu: ov07 MenuSelect calls it).
- **Spell list header + menu** (`299C`, "Spells in Memory / in Spell Book / on Scroll ..."), used by combat casting (BeginCast) and camp memorize/scribe (ov15).

Cross-area: most of this unit is PARTY/inventory/MAGIC UI rather than combat; it is decoded fully here and flagged in `ov19_notes.md` (d).

Conventions (same as `decode/pseudo/VIEW.pas.md`)
- **Signatures are in Pascal order**: first parameter = highest BP offset (pushed first). Parameters are given as `name [BP+xx]`. `RETF n` of each routine is quoted and matches the parameter bytes.
- `{ seg:off }` = address of the first instruction of the statement (or of the call that implements it).
- Globals: `g_XXXX` = DS:XXXX (GLOBALS.md); evidence-named globals are written `Name{g_XXXX}` (list in `ov19_notes.md` (b) and `ov19_names.json`). Far pointers `p^`.
- TChar fields (285-byte character record) and item fields (63-byte record) use the SAVES.md §3/§4 names (`c^.status` = +10Ch, `item^.readied` = +34h ...). `ItemType[t].slot/.hands/.usable_by` = ITEMS table bytes `DS:5582/5583/558F + t*16` (SAVES.md §6).
- Runtime: `s := a + b` = @StrCopy/@StrAppend/@StrAssign chains; `x in [...]` = @SetIn with the 32-byte set constant at the quoted CS offset; `Str(v:0, s)` = @StrLong; `*`/`div` on LongInt = @LongMul/@LongDivMod.
- Callees outside this unit use their **published names** (decode/names/engine_names.json, view names, combat_parts/ov24) as shown in the current `ov19.lst` comments; ov21/ov22 routines have no published name yet and stay `ov21_XXXX`/`ov22_XXXX`. Parameter order was re-checked against every push sequence and the published signatures (normalisation pass, ov19_notes.md).

| name used here | address | parameters (Pascal order) | evidence |
|---|---|---|---|
| DrawText | 0709:0626 | (col [0Eh], row [0Ch], colour [0Ah], s [6]) | body: col incremented per char, both < 28h |
| DrawWrappedText | 0709:0768 | (x1, y1, x2, y2, colour, clear, s) | ECL_VM.md §4.2 (M); `clear` = 0 continues at the text cursor `text_Col{g_5E24}`, `text_Row{g_5E25}` |
| ClearScreen | 0709:0CAB | () | ENGINE draft (H there) |
| MessageDelay | 0709:0DBE | () | ENGINE draft: `Delay(g_49E2*225)` |
| DrawFrame | 03F1:0000 | (x1, y1, x2, y2, style) | body: border drawn one cell **outside** (x1-1..x2+1, y1-1..y2+1), symbols 114h+3*style |
| ClearRectangle | 03F1:0137 | (x1, y1, x2, y2) | call sites (0, 18h, 27h, 18h) = bottom row |
| DrawTitledFrame | 03F1:02E8 | (x1, y1, x2, y2, style, titleColour, title) | body: ClearRectangle + DrawFrame + title at ((x1+x2-len) div 2, y1) |
| BuildItemName | 00BA:0442 | (owner [12h], item [0Eh], col [0Ch], row [0Ah], withReadied [8], draw [6]) | body: rebuilds `item^.name` (" Yes  "/" No   " prefix when withReadied), draws it in colour 0Ah at (col,row) when draw; RETF 10h |
| DrawAC | 00BA:08EF | (c, col, row) | body: `60 - c^.ac` (minus sign when > 60), colour 0Ah |
| DrawHP | 00BA:0973 | (c, col, row, flag) | ENGINE draft (+11Bh vs +32h) |
| RecalcCharacter | 00BA:0BB8 | (c) | SAVES.md name |
| ByteToStr / WordToStr / LongToStr | 00BA:1037 / 1073 / 10AD | (v): string | ENGINE draft (Str of byte/word/longint) |
| StrWeightAllowance | 00BA:13AB | (c): Integer | ENGINE draft (M) |
| LoseItem | 00BA:1509 | (c, item) | ENGINE draft + strings "Tried to Lose item & couldn't find it!" (unlink + FreeMem 63) |
| AppendItemCopy | 00BA:15F7 | (c, item) | ENGINE draft (GetMem 63, Move, append to `c^.items`) |
| ShowTimedBottomMessage | 00BA:1693 | (s) | body: ClearRectangle(0,24,39,24); DrawText(0,24,0Ah,s); MessageDelay; ClearRectangle(0,24,39,24) |
| ShowCharacterMessage | 00BA:16EC | (c, s, combatRow, flag) | body: in combat (game_Mode = 5) name at (23,row), text window (23,row+1)-(38,21) colour 0Ah |
| ClearCharacterMessage | 00BA:17E3 | () | ENGINE draft |
| DrawCharacterName | 00BA:1816 | (c, col, row, withApos) | body: colour 0Ch if `c^.active = 0`, 0Eh if `c^.side = 1`, else 0Bh; appends "'s" (00BA:1813) when withApos |
| HasEffect | 00BA:2199 | (c, id, var node): Boolean | SAVES.md §5 |
| ClearCombatantActionFlags | 00BA:2637 | (c): Boolean | ENGINE draft (returns true) |
| RedrawCurrentMode | 00BA:27D9 | () | ENGINE draft |
| DrawCombatLayout | 00BA:2B88 | () | ENGINE draft |
| SelectPartyCharacter | 00BA:2C48 | (prompt, flag, var who) | ENGINE draft; who = nil when nothing chosen |
| HorizontalMenu | HorizontalMenu (stub ov25 e2) | (prompt, items, promptColour, c2, c3, extKeys, anim, var ext): Char | body ov25: prompt at (0,24) in promptColour; returns the upper-cased hot key, #13 on Enter (when c2/c3 not both 0), #0 on Esc, ',' '.' move the highlight |
| VerticalListMenu | VerticalListMenu (stub ov25 e4) | (prompt, items, c1, c2, c3, x1, y1, x2, y2, list, withExit, var redraw, var index, var selected): Char | ov25.c: appends " Next"/" Prev"/" Exit"; selected := nil on Esc/Exit |
| AskYesNo | AskYesNo (stub ov25 e5) | (prompt, c1, c2, c3): Char | ov25.c: HorizontalMenu(prompt, 'Yes No', ...) until 'Y'/'N' |
| FreeMenuList | FreeMenuList (stub ov25 e7) | (var list) | ov25.c: FreeMem($2E) per node, link +2Ah |
| IsScroll | IsScroll (stub ov22 e6) | (item): Boolean | ov22.c: `item <> nil and ItemType[item^.type].slot in [$0B..$0D]` |
| ChooseSpell | ChooseSpell (stub ov22 e1) | (flag, var index): Byte | strings "Cast/Memorize/Scribe/Learn", "Choose Spell:" |
| BuildSpellList | BuildSpellList (stub ov22 e2) | (mode): Byte | SAVES.md (mode 0..6 lists) |
| CastSpell | CastSpell (stub ov22 e5) | (spell, controlled, 0, var done) | strings "casts", "is a combat-only item... Use it?", "Abort Spell?" |
| UseScrollSpell | UseScrollSpell (stub ov22 e7) | (c, item, spell) | ov22.c: clears `power[k]`, `dec(word[2])`, LoseItem when `word[2] < D2h` |
| CallEffectHandler | CallEffectHandler (stub ov24 e1) | (id, c, item, flag) | body: `CALLF [DS:6828 + id*4](c, item, flag)` |
| WouldOverload | WouldOverload (stub ov21 e1) | (c, amount, var room): Boolean | ov21.c: true = `c^.encumbrance + amount > MaxLoad(c)`, room := MaxLoad(c) - encumbrance (MaxLoad = StrWeightAllowance + 1500) |
| MoneyValueInGold | MoneyValueInGold (stub ov21 e12) | (var money5): LongInt | ov21.c: same formula as MoneyInGold over 5 LongInts |
| SetCharMoneyGold | SetCharMoneyGold (stub ov21 e10) | (gold: Word) | ov21.c: `SelectedChar^.money[0..4] := 0; money[4] := gold div 5; money[3] := gold mod 5` |
| SetPoolMoneyGold | SetPoolMoneyGold (stub ov21 e11) | (gold: Word) | ov21.c: same on `TreasureMoney[0..4]` |
| InputNumber | InputNumber (stub ov21 e6) | (max, prompt, colour): Word | ov21.c: digits on row 24, capped at max, Esc = 0 |
| TransferCoins | TransferCoins (stub ov21 e7) | (var from, var to, amount, coin) | ov21.c: "Overloaded" (ov21:0441) if `to` cannot carry |
| DropCoins | DropCoinsToPool (stub ov21 e8) | (c, amount, coin) | ov21.c: money and encumbrance −amount; added to `TreasureMoney[coin]` when game_Mode in [1, 6] |
| CoinFromText | CoinFromText (stub ov21 e5) | (item, var coinName): Byte | ov21.c: first non-blank letter → 0..6, coinName := 'Copper '/'silver '/'electrum '/'Gold '/'Platinum '/'Gems '/'Jewelry ' |
| ShowPortrait | ShowPortrait (stub ov28 e4) | () | SAVES.md (head/body pictures); name L |
| PaletteFlashOff / PaletteFlashOn | stub ov31 e3 / e2 | () | ov31.c: EGA palette registers 0/8 swap (only when `g_4A1E = 1`); combat-screen palette, L |

Item-record field names (SAVES.md §4): `name`(+00, string[40]), `next`(+2Ah), `type`(+2Eh), `word[1..3]`(+2Fh..+31h), `plus`(+32h), `plus2`(+33h), `readied`(+34h), `hidden`(+35h), `magic_flag`(+36h; **this unit treats it as "cursed"**, see 14D0), `weight`(+37h), `count`(+39h), `value`(+3Ah), `power[1..3]`(+3Ch..+3Eh).

---
### 7F00:004A DrawCharacterSheet (H)
`procedure DrawCharacterSheet` — `RETF` (no parameters). Callers: ViewMenu, TradeCoins (TradeCoins); via stub ov19 e1: ov16 `FUN_7000_1156`, `FUN_7000_1551` (character creation), `ModifyCharacter`. Callees: ClearScreen, DrawFrame, DrawCharacterName, DrawText, DrawAbility, DrawMoney, DrawCombatStats, BuildItemName, ShowPortrait.
Clears the screen and draws the full character sheet of `SelectedChar` (name, gender/race/age, alignment, class, six abilities, money, levels, experience, combat values, readied weapon and armour, status). Name H: every label of the sheet is printed here ("Age ", "STR ".."CHA ", "Level", "Exp ", "Weapon", "Armor", "Status").
```pascal
ViewChar{g_4716} := SelectedChar;                                       { 7f00:0051 }
ClearScreen;                                                            { 7f00:005f }
DrawFrame(1, 1, 38, 22, 0);                                             { 7f00:0064 }
DrawCharacterName(ViewChar, 1, 1, False);                               { 7f00:0078 }
if ViewChar^.npc_morale > $7F then                                      { 7f00:008e }
  DrawText(Length(ViewChar^.name) + 3, 1, $0A, '(NPC)');                { 7f00:009a }
x := 1;                                                                 { 7f00:00c2 }
s := GenderName{g_0FEC}[ViewChar^.gender];                              { 7f00:00c6  string[6], 7 bytes per entry }
DrawText(x, 3, $0F, s);                                                 { 7f00:00ec }
x := x + Length(s) + 1;                                                 { 7f00:0101 }
s := RaceName{g_0F03}[ViewChar^.race];                                  { 7f00:0114  string[9], 10 bytes per entry }
DrawText(x, 3, $0F, s);                                                 { 7f00:0139 }
x := x + Length(s) + 1;                                                 { 7f00:014e }
DrawText(x, 3, $0F, 'Age ' + WordToStr(ViewChar^.age));                 { 7f00:0161 }
DrawText(1, 4, $0F, AlignmentName{g_0F53}[ViewChar^.alignment]);        { 7f00:0198  17 bytes per entry }
DrawText(1, 5, $0F, ClassName{g_0D38}[ViewChar^.class]);                { 7f00:01d2  27 bytes per entry }
for i := 0 to 5 do begin                                                { 7f00:020b }
  case i of                                                             { 7f00:0214 }
    0: s := 'STR ';  1: s := 'INT ';  2: s := 'WIS ';
    3: s := 'DEX ';  4: s := 'CON ';  5: s := 'CHA ';
  end;
  DrawText(1, i + 7, $0A, s);                                           { 7f00:02b2 }
  DrawAbility(i, False);                                                { 7f00:02cb  DrawAbility }
end;
DrawMoney;                                                              { 7f00:02df  DrawMoney }
DrawText(1, 15, $0F, 'Level');                                          { 7f00:02e3 }
any := False;                                                           { 7f00:0301 }
s := '';                                                                { 7f00:0306 }
for i := 0 to 7 do                                                      { 7f00:030b }
  if ShortInt(ViewChar^.level[i]) > 0 then begin                        { 7f00:0314  signed test (JLE) }
    if any then s := s + '/';                                           { 7f00:0326 }
    s := s + ByteToStr(ViewChar^.level[i]);                             { 7f00:0357 }
    any := True;                                                        { 7f00:0397 }
  end;
DrawText(7, 15, $0F, s);                                                { 7f00:03a5 }
DrawText(17, 15, $0F, 'Exp ' + LongToStr(ViewChar^.xp));                { 7f00:03b9 }
DrawCombatStats;                                                        { 7f00:03f5  DrawCombatStats }
row := 20;                                                              { 7f00:03f9 }
if ViewChar^.readied[0] <> nil then begin                               { 7f00:03fd  +CCh weapon }
  DrawText(1, row, $0F, 'Weapon');                                      { 7f00:040d }
  BuildItemName(ViewChar, ViewChar^.readied[0], 8, row, False, True);{ 7f00:042c }
end;
row := row + 1;                                                         { 7f00:0454 }
if ViewChar^.readied[2] <> nil then begin                               { 7f00:0457  +D4h armour }
  DrawText(2, row, $0F, 'Armor');                                       { 7f00:0467 }
  BuildItemName(ViewChar, ViewChar^.readied[2], 8, row, False, True);{ 7f00:0486 }
end;
row := row + 1;                                                         { 7f00:04ae }
DrawText(1, row, $0F, 'Status');                                        { 7f00:04b1 }
DrawText(8, row, $0A, StatusNameTable{g_1047}[ViewChar^.status]);            { 7f00:04d0  13 bytes per entry }
if (opt_Portraits{g_49F5} <> 0) and (DataSet = 3) then                    { 7f00:04f6 }
  ShowPortrait;                                                         { 7f00:0504  ShowPortrait }
```
Note: the six ability labels are drawn in colour 0Ah (not 0Fh); row 2 and row 6 stay empty.

### 7F00:050D DrawMoney (H)
`procedure DrawMoney` — `RETF`. Callers: DrawCharacterSheet, ViewMenu (after Drop), TradeCoins, DropCoins; via stub e4: ov16 `FUN_7000_1551`. Callees: ClearRectangle, DrawText, WordToStr.
Draws the non-zero coin/gem/jewellery counts of `SelectedChar`, one per row from row 7 down, highest kind (jewelry) first. Name H: `money[i]` (+88h + 2i) printed under `CoinName` (DS:0FFA "Copper".."Jewelry").
```pascal
ClearRectangle(12, 7, 26, 14);                                               { 7f00:0514 }
row := 7;                                                               { 7f00:0525 }
for i := 6 downto 0 do                                                  { 7f00:0529 }
  if SelectedChar^.money[i] > 0 then begin                              { 7f00:0532 }
    s := CoinName{g_0FFA}[i];                                           { 7f00:0546  string[10], 11 bytes per entry }
    DrawText(20 - Length(s), row, $0A, s);                              { 7f00:0565  right-aligned to column 19 }
    DrawText(21, row, $0A, WordToStr(SelectedChar^.money[i]));          { 7f00:0583 }
    row := row + 1;                                                     { 7f00:05ae }
  end;
```

### 7F00:0608 DrawCombatStats (H)
`procedure DrawCombatStats` — `RETF`. Callers: DrawCharacterSheet; via stub e2: ov16 `FUN_7000_1551`, `ModifyCharacter`. Callees: RecalcCharacter, DrawText, DrawAC, DrawHP, ByteToStr, WordToStr, HasEffect.
Recalculates `SelectedChar` and prints AC, HP, THAC0, Damage, Encumbrance and Movement on rows 17/18. Name H (labels "AC", "HP", "THAC0", "Damage", "Encumbrance", "Movement").
```pascal
c := SelectedChar;                                                      { 7f00:060f }
RecalcCharacter(c);                                                     { 7f00:061c }
row := 17;                                                              { 7f00:0627 }
DrawText(1, row, $0F, 'AC    ');                                        { 7f00:062b }
DrawAC(c, 4, row);                                              { 7f00:0649 }
DrawText(1, row + 1, $0F, 'HP    ');                                    { 7f00:065b }
DrawHP(c, 4, row + 1, 0);                                        { 7f00:067c }
col := 8;                                                               { 7f00:0694 }
DrawText(col + 1, row, $0F, 'THAC0   ');                                { 7f00:0698 }
DrawText(col + 7, row, $0A, ByteToStr(Byte(60 - c^.thac0)));            { 7f00:06ba  thac0 stored as 60-THAC0 }
s := ByteToStr(c^.dmg_dice[1]) + 'd' + ByteToStr(c^.dmg_sides[1]);      { 7f00:06ec }
if ShortInt(c^.dmg_bonus[1]) > 0 then                                   { 7f00:0731 }
  s := s + '+' + ByteToStr(c^.dmg_bonus[1]);                            { 7f00:073c }
if ShortInt(c^.dmg_bonus[1]) < 0 then                                   { 7f00:077d }
  s := s + '-' + ByteToStr(Abs(ShortInt(c^.dmg_bonus[1])));             { 7f00:0788 }
DrawText(col, row + 1, $0F, 'Damage        ');                          { 7f00:07cf }
DrawText(col + 7, row + 1, $0A, s);                                     { 7f00:07f1 }
col := 22;                                                              { 7f00:080e }
DrawText(col, row, $0F, 'Encumbrance      ');                           { 7f00:0812 }
DrawText(col + 12, row, $0A, WordToStr(c^.encumbrance));                { 7f00:0831 }
mv := c^.move;                                                          { 7f00:0859 }
if HasEffect(c, $2A, node) then mv := Byte(mv * 2);                     { 7f00:0864 }
if HasEffect(c, $27, node) then mv := mv shr 1;                         { 7f00:0885 }
DrawText(col + 3, row + 1, $0F, 'Movement   ');                         { 7f00:08a6 }
DrawText(col + 12, row + 1, $0A, ByteToStr(mv));                        { 7f00:08cd }
```
Notes: THAC0, AC and the damage value overwrite the trailing blanks of their labels (value columns 15 and 4). Only attack 1 (`+115h/+117h/+119h`) is shown.

### 7F00:0901 DrawAbility (H)
`procedure DrawAbility(stat [BP+8]: ShortInt; highlight [BP+6]: Boolean)` — `RETF 4`. Callers: DrawCharacterSheet; via stub e3: ov16 `FUN_7000_1551` (ability rolling), `DrawModifyField`. Callees: ClearRectangle, DrawText, ByteToStr.
Prints ability `stat` (0 STR .. 5 CHA = `SelectedChar^` +10h+stat) at row stat+7, right-aligned to column 6, with exceptional strength "(nn)" for STR 18. Name H (SAVES.md cites it as the evidence for the ability order).
```pascal
if highlight then colour := $0D else colour := $0A;                      { 7f00:0908 }
col := 5;                                                               { 7f00:0918 }
ClearRectangle(col, stat + 7, 11, stat + 7);                                 { 7f00:091c }
if SelectedChar^.abil[stat] < 10 then col := col + 1;                   { 7f00:0938  abil[0..5] = +10h..+15h }
DrawText(col, stat + 7, colour, ByteToStr(SelectedChar^.abil[stat]));   { 7f00:094c }
if (stat = 0) and (SelectedChar^.str = 18) and (SelectedChar^.str_exc > 0) then begin   { 7f00:097b }
  s := ByteToStr(SelectedChar^.str_exc);                                { 7f00:09a0 }
  if SelectedChar^.str_exc < 10 then s := '0' + s;                      { 7f00:09c2 }
  if SelectedChar^.str_exc = 100 then s := '00';                        { 7f00:09f5 }
  DrawText(7, 7, colour, '(' + s + ')');                                { 7f00:0a13 }
end;
```

### 7F00:0AB3 ViewMenu (H)
`procedure ViewMenu(var turnUsed [BP+6]: Boolean)` — `RETF 4`. Callers (all via stub ov19 e5): ov05 `TreasureMenu` (treasure), ov08 `PlayerTurn` (combat menu), Temple (temple), Shop (shop, key 'V'), ExploreCommand (area command loop), Camp (camp), PartyCreationMenu (top level). Callees: PaletteFlashOff/PaletteFlashOn, DrawCharacterSheet, HorizontalMenu, ItemsMenu, SpellList, TradeCoins, DropCoins, DrawMoney, RedrawCurrentMode.
The "View:" menu below the character sheet. Loops until Exit/Esc or until an action used the combat turn (`turnUsed`). Name H ("View:" prompt, items "Items Spells Trade Drop Exit"; called on the 'V' key of the shop menu "Buy View Take ...").
```pascal
if game_Mode{g_49F3} = 5 then PaletteFlashOff;                                 { 7f00:0aba  combat palette (L) }
key := ' ';                                                             { 7f00:0ac6 }
turnUsed := False;                                                      { 7f00:0aca }
TradePartner{g_471A} := SelectedChar;                                   { 7f00:0ad1 }
DrawCharacterSheet;                                                     { 7f00:0adf }
while not (key in [#0, 'E']) and not turnUsed do begin                  { 7f00:0ae3  set cs:0A4C; 7f00:0af6 }
  menu := '';                                                           { 7f00:0b02 }
  hasSpells := False;                                                   { 7f00:0b06 }
  hasMoney := False;                                                    { 7f00:0b0a }
  for i := 0 to 20 do                                                   { 7f00:0b0e }
    if ViewChar{g_4716}^.mem_spell[i] > 0 then hasSpells := True;       { 7f00:0b17 }
  for i := 0 to 6 do                                                    { 7f00:0b33 }
    if ViewChar^.money[i] > 0 then hasMoney := True;                    { 7f00:0b3c }
  if ViewChar^.items <> nil then menu := menu + 'Items ';               { 7f00:0b5a }
  if hasSpells then menu := menu + 'Spells ';                           { 7f00:0b92 }
  if ((ViewChar^.npc_morale < $80) or (ViewChar^.active = 0) or (ViewChar^.status = 1))
     and hasMoney and (game_Mode <> 5) then                              { 7f00:0bc0 }
    menu := menu + 'Trade ';                                            { 7f00:0bf1 }
  if hasMoney then menu := menu + 'Drop ';                              { 7f00:0c19 }
  menu := menu + 'Exit';                                                { 7f00:0c47 }
  key := HorizontalMenu('View:', menu, $0D, $0A, $0F, False, False, ext);   { 7f00:0c6f }
  spellIdx := -1;                                                       { 7f00:0c9f }
  case key of                                                           { 7f00:0ca4 }
    'I': ItemsMenu(turnUsed);                                           { 7f00:0cab  ItemsMenu }
    'S': n := SpellList(0, 0, spellIdx, hasSpells);                     { 7f00:0cba  result unused; hasSpells receives the count }
    'T': TradeCoins;                                                    { 7f00:0cd7  TradeCoins }
    'D': begin DropCoins; DrawMoney end;                                { 7f00:0ce1  DropCoins, DrawMoney }
  end;
  if not turnUsed and (key in ['I', 'S', 'T']) then                     { 7f00:0ce9  set cs:0A93 }
    DrawCharacterSheet;                                                 { 7f00:0d02 }
end;
if game_Mode = 5 then PaletteFlashOn;                                         { 7f00:0d09 }
RedrawCurrentMode;                                                      { 7f00:0d15 }
```
Note: Enter returns #13 from HorizontalMenu, which matches no case: the loop just repeats (see notes (c)).

### 7F00:0D70 MayLoseItem (H)
`function MayLoseItem(item [BP+6]: PItem): Boolean` — `RETF 4`. Callers: ItemsMenu (before Trade, Drop, Sell). Callees: ShowTimedBottomMessage, IsScroll, DrawCharacterName, DrawWrappedText, AskYesNo, ClearRectangle.
False if the item is readied ("Must be unreadied"). For a scroll from which a spell is being scribed (bit 7 in any `power[k]`) the player must confirm. Name H (strings).
```pascal
result := False;                                                        { 7f00:0d76 }
if item^.readied <> 0 then                                              { 7f00:0d7a }
  ShowTimedBottomMessage('Must be unreadied')                                { 7f00:0d84 }
else if not IsScroll(item) then                                         { 7f00:0d9b }
  result := True                                                        { 7f00:0daa }
else if (item^.power[1] > $7F) or (item^.power[2] > $7F) or (item^.power[3] > $7F) then begin  { 7f00:0db1 }
  DrawCharacterName(SelectedChar, 1, 21, False);                        { 7f00:0dcf }
  text_Col{g_5E24} := Length(SelectedChar^.name) + 2;                    { 7f00:0de5 }
  text_Row{g_5E25} := 21;                                                { 7f00:0df3 }
  DrawWrappedText(1, 21, 38, 22, $0E, False, ' was going to scribe from that scroll');   { 7f00:0df8 }
  if AskYesNo('is it Okay to lose it? ', $0D, $0A, $0F) = 'Y' then         { 7f00:0e1e }
    result := True;                                                     { 7f00:0e3f }
end else
  result := True;                                                       { 7f00:0e45 }
ClearRectangle(1, 21, 38, 22);                                               { 7f00:0e49 }
MayLoseItem := result;                                                  { 7f00:0e5a }
```

### 7F00:0EF8 ItemsMenu (H)
`procedure ItemsMenu(var turnUsed [BP+6]: Boolean)` — `RETF 4` (at 7f00:148e: `89 EC 5D CA 04 00`; the listing shows this RETF at a wrong address "8e00:1f30", near-branch artifact). Callers: ViewMenu ('I'); via stub ov19 e6: ov08 `PlayerTurn` (combat). Callees: VerticalListMenu, BuildItemName, ClearScreen, DrawFrame, DrawCharacterName, DrawText, DrawTitledFrame, ReadyItem, UseItem, MayLoseItem, TradeItem, DrawWrappedText, AskYesNo, LoseItem, ClearRectangle, HalveItem, JoinItems, SellItem, IdentifyItem, ShowTimedBottomMessage, IsScroll, RecalcCharacter.
The "<name>'s Items" screen: a list of the character's items (readied column + name) with the action menu Ready/Use/Trade/Drop/Halve/Join/Sell/Id. Loops until Exit/Esc, until the character has no items, or until an action used the combat turn. Name H (strings "Items", "Ready Item", the action words).
```pascal
c := SelectedChar;                                                      { 7f00:0eff }
key := ' ';                                                             { 7f00:0f0c }
sel := c^.items;                                                        { 7f00:0f10 }
index := 0;                                                             { 7f00:0f23 }
redraw := True;                                                         { 7f00:0f28 }
fullRedraw := True;                                                     { 7f00:0f2c }
while not (key in [#0, 'E']) and not turnUsed and (c^.item_count > 0) do begin   { 7f00:0f30  set cs:0E63; 0f43; 0f4f }
  oldCount := c^.item_count;                                            { 7f00:0f5d }
  if c^.items <> nil then begin                                         { 7f00:0f68 }
    menu := 'Ready';                                                    { 7f00:0f7a }
    if (c^.active <> 0) and (Word(ecl_Mem4900^[$1CA]) = 0) and
       ((game_Mode in [2, 3, 4]) or ((game_Mode = 5) and (c^.combatant^[2] <> 0))) then   { 7f00:0f8d }
      menu := menu + ' Use';                                            { 7f00:0fcf }
    if ((c^.npc_morale < $80) or (c^.active = 0) or (c^.status = 1)) and (game_Mode <> 5) then   { 7f00:0ff7 }
      menu := menu + ' Trade';                                          { 7f00:101f }
    menu := menu + ' Drop';                                             { 7f00:1047 }
    if c^.item_count < 16 then menu := menu + ' Halve';                 { 7f00:106f }
    menu := menu + ' Join';                                             { 7f00:10a2 }
    if ((c^.npc_morale < $80) or (c^.active = 0) or (c^.status = 1)) and (game_Mode = 1) then   { 7f00:10ca }
      menu := menu + ' Sell';                                           { 7f00:10f2 }
    if game_Mode = 1 then menu := menu + ' Id';                          { 7f00:111a }
    p := c^.items;                                                      { 7f00:1149 }
    while p <> nil do begin                                             { 7f00:115c }
      BuildItemName(c, p, 0, 0, True, False);                        { 7f00:1164  name with " Yes  "/" No   " prefix, not drawn }
      p := p^.next;                                                     { 7f00:1181 }
    end;
    if fullRedraw or (g_6821 <> 0) then begin                           { 7f00:1194 }
      ClearScreen;                                                      { 7f00:11a4 }
      DrawFrame(1, 1, 38, 22, 0);                                       { 7f00:11a9 }
      DrawCharacterName(c, 1, 1, True);                                 { 7f00:11bd  "<name>'s" }
      DrawText(Length(c^.name) + 4, 1, $0A, 'Items');                   { 7f00:11d1 }
      DrawTitledFrame(1, 3, 38, 22, 0, 0, '');                          { 7f00:11f7 }
      DrawText(1, 3, $0F, 'Ready Item');                                { 7f00:121d }
      redraw := True;                                                   { 7f00:123a }
      fullRedraw := False;                                              { 7f00:123e }
      g_6821 := 0;                                                      { 7f00:1242 }
    end;
    key := VerticalListMenu('', menu, $0D, $0A, $0F, 1, 5, 38, 22, c^.items, True,
                    redraw, index, sel);                                { 7f00:1247 }
    if sel <> nil then                                                  { 7f00:1297 }
      case key of                                                       { 7f00:12a2 }
        'R': ReadyItem(sel);                                            { 7f00:12a9  ReadyItem }
        'U': if sel^.readied = 0 then begin                             { 7f00:12ba }
               ShowTimedBottomMessage('Must be Readied');                    { 7f00:12c4 }
               key := ' ';                                              { 7f00:12d8 }
             end
             else if IsScroll(sel) or ((sel^.power[2] > 0) and (sel^.power[3] < $80)) then begin   { 7f00:12de }
               UseItem(sel, turnUsed);                                  { 7f00:1301  UseItem }
               if game_Mode <> 5 then turnUsed := False;                 { 7f00:1310 }
               if not turnUsed then fullRedraw := True;                 { 7f00:131e }
             end;
        'T': begin                                                      { 7f00:132e }
               if MayLoseItem(sel) then TradeItem(sel)                  { 7f00:1332  MayLoseItem, TradeItem }
               else key := ' ';                                         { 7f00:134c }
               fullRedraw := True;                                      { 7f00:1350 }
             end;
        'D': if MayLoseItem(sel) then begin                             { 7f00:135e }
               BuildItemName(c, sel, 0, 0, False, False);            { 7f00:136f  plain name }
               DrawWrappedText(1, 21, 38, 22, $0E, True,
                               'Your ' + sel^.name + 'will be gone forever');   { 7f00:138c }
               if AskYesNo('Drop It? ', $0D, $0A, $0F) = 'Y' then begin    { 7f00:13c7 }
                 LoseItem(SelectedChar, sel);                           { 7f00:13e8 }
                 redraw := True;                                        { 7f00:13fb }
               end;
               ClearRectangle(1, 21, 38, 22);                                { 7f00:13ff }
             end
             else key := ' ';                                           { 7f00:1412 }
        'H': HalveItem(sel);                                            { 7f00:141c  HalveItem }
        'J': JoinItems(sel);                                            { 7f00:142c  JoinItems }
        'S': if MayLoseItem(sel) then SellItem(sel)                     { 7f00:143c  SellItem }
             else key := ' ';                                           { 7f00:1456 }
        'I': IdentifyItem(sel, redraw);                                 { 7f00:1460  IdentifyItem }
      end;
    RecalcCharacter(c);                                                 { 7f00:146f }
  end;
  if c^.item_count <> oldCount then redraw := True;                     { 7f00:147a }
end;
```
Notes: `ecl_Mem4900^[$1CA]` is the word at byte offset 1CAh of the ECL variable block = ECL address 49E5h (meaning unknown, notes (c)). `c^.combatant^[2]` = byte +2 of the combat record (`+108h` far pointer). The key ' ' assignments keep the loop running after a refused action.

### 7F00:14D0 ReadyItem (H)
`procedure ReadyItem(item [BP+6]: PItem)` — `RETF 4`. Callers: ItemsMenu ('R'); via stub ov19 e7: ov09 `AiReadyBestWeapon` (combat AI). Callees: ShowTimedBottomMessage, CallEffectHandler, BuildItemName.
Toggles the readied state of `item` for `SelectedChar`. Unready fails on a cursed item; ready fails on hands, occupied slot or class. Name H (menu word "Ready", messages "It's Cursed", "Wrong Class", "already using ", "Your hands are full!").
```pascal
hasHook := item^.power[3] > $7F;                                        { 7f00:14d7 }
c := SelectedChar;                                                      { 7f00:14e7 }
if item^.readied <> 0 then begin                                        { 7f00:14f4 }
  if item^.magic_flag <> 0 then                                         { 7f00:14fe  +36h }
    ShowTimedBottomMessage('It''s Cursed')                                   { 7f00:1508 }
  else begin
    item^.readied := 0;                                                 { 7f00:151e }
    if hasHook then CallEffectHandler(item^.power[3], c, item, 1);         { 7f00:1526 }
  end;
end else begin
  err := 0;                                                             { 7f00:154b }
  if ItemType[item^.type].hands + c^.hands_used > 2 then err := 3;      { 7f00:154f  DS:5583, signed word compare }
  slot := ItemType[item^.type].slot;                                    { 7f00:157b  DS:5582 }
  if slot in [0..8] then begin                                          { 7f00:1591 }
    if c^.readied[slot] <> nil then err := 2;                           { 7f00:159c }
  end else if slot = 9 then                                             { 7f00:15bb }
    if c^.readied[10] <> nil then err := 2;                             { 7f00:15bf  +F4h second ring; slot stays 9 }
  if (item^.type = $49) and (c^.readied[11] <> nil) then begin          { 7f00:15d2  +F8h }
    err := 2;  slot := 11;                                              { 7f00:15eb }
  end;
  if (item^.type = $1C) and (c^.readied[12] <> nil) then begin          { 7f00:15f3  +FCh }
    err := 2;  slot := 12;                                              { 7f00:160c }
  end;
  if (ItemType[item^.type].usable_by and c^.class_mask) = 0 then err := 1;   { 7f00:1614  DS:558F }
  case err of                                                           { 7f00:1637 }
    0: begin
         item^.readied := 1;                                            { 7f00:163e }
         if hasHook then CallEffectHandler(item^.power[3], c, item, 0);    { 7f00:1646 }
       end;
    1: ShowTimedBottomMessage('Wrong Class');                                { 7f00:166f }
    2: begin
         BuildItemName(c, c^.readied[slot], 0, 0, False, False);     { 7f00:168a }
         ShowTimedBottomMessage('already using ' + c^.readied[slot]^.name);  { 7f00:16b8 }
       end;
    3: if (game_Mode <> 5) or (c^.controlled = 0) then                   { 7f00:16ec }
         ShowTimedBottomMessage('Your hands are full!');                     { 7f00:16fe }
  end;
end;
```
Notes: the class test is last and overrides err 2/3. Slots 0..12 map to `readied[]` = `+CCh + slot*4` (SAVES.md); the ring case only tests the second ring pointer (+F4h) but names `readied[9]` (+F0h) in the "already using" text.

### 7F00:1734 TradeItem (H)
`procedure TradeItem(item [BP+6]: PItem)` — `RETF 4`. Callers: ItemsMenu ('T', after MayLoseItem). Callees: RedrawCurrentMode, SelectPartyCharacter, CanCarryItem (as Overloaded test), ShowTimedBottomMessage, AppendItemCopy, LoseItem, RecalcCharacter.
Moves `item` from `SelectedChar` to another party member. Name H ("Trade with Whom?", "Overloaded").
```pascal
whom := TradePartner{g_471A};                                           { 7f00:173a }
RedrawCurrentMode;                                                      { 7f00:1747 }
SelectPartyCharacter('Trade with Whom?', True, whom);                   { 7f00:174c }
if whom <> nil then begin                                               { 7f00:1768 }
  TradePartner := whom;                                                 { 7f00:1770 }
  if ItemOverloads(whom, item) then                                     { 7f00:177d  ItemOverloads }
    ShowTimedBottomMessage('Overloaded')                                     { 7f00:1791 }
  else begin
    AppendItemCopy(whom, item);                                         { 7f00:17a7 }
    LoseItem(SelectedChar, item);                                       { 7f00:17b8 }
    RecalcCharacter(whom);                                              { 7f00:17cb }
  end;
end;
```

### 7F00:17ED HalveItem (H)
`procedure HalveItem(item [BP+6]: PItem)` — `RETF 4`. Callers: ItemsMenu ('H'). Callees: GetMem, Move, ShowTimedBottomMessage.
Splits a stack: a copy with `count div 2` is inserted after `item`, which keeps the rest. Name H (menu word "Halve", "Can't halve that").
```pascal
half := item^.count shr 1;                                              { 7f00:17f3 }
if half > 0 then begin                                                  { 7f00:1801 }
  rest := item^.count - half;                                           { 7f00:1807 }
  GetMem(p, $3F);                                                       { 7f00:181c }
  Move(item^, p^, $3F);                                                 { 7f00:182b }
  p^.count := half;                                                     { 7f00:183e }
  p^.readied := 0;                                                      { 7f00:1848 }
  p^.next := item^.next;                                                { 7f00:1850 }
  item^.count := rest;                                                  { 7f00:1866 }
  item^.next := p;                                                      { 7f00:1870 }
end else
  ShowTimedBottomMessage('Can''t halve that');                               { 7f00:1883 }
```
Note: `item_count` is not updated here; ItemsMenu's RecalcCharacter recounts the list.

### 7F00:189D JoinItems (M)
`procedure JoinItems(item [BP+6]: PItem)` — `RETF 4`. Callers: ItemsMenu ('J'). Callees: LoseItem.
Merges every other stack of the same kind into `item`, up to 255 per stack. Name M (menu word "Join"; the body merges counts).
```pascal
target := item;                                                         { 7f00:18a3 }
total := target^.count;                                                 { 7f00:18af }
p := SelectedChar^.items;                                               { 7f00:18b9 }
while p <> nil do begin                                                 { 7f00:18cd }
  nxt := p^.next;                                                       { 7f00:18d8 }
  if (p <> target) and (p^.count > 0)
     and (p^.word[1] = target^.word[1]) and (p^.word[2] = target^.word[2]) and (p^.word[3] = target^.word[3])
     and (p^.type = target^.type) and (p^.plus = target^.plus) and (p^.plus2 = target^.plus2)
     and (p^.magic_flag = target^.magic_flag) and (p^.weight = target^.weight)
     and (p^.power[1] = p^.power[1]) and (p^.power[1] < 2)
     and (p^.power[2] = p^.power[2]) and (p^.power[3] = p^.power[3]) then begin   { 7f00:18e9 .. 19e2  sic: power[] compared with itself }
    if p^.count + total <= 255 then begin                               { 7f00:19e4 }
      total := total + p^.count;                                        { 7f00:19fb }
      LoseItem(SelectedChar, p);                                        { 7f00:1a05 }
    end else begin
      target^.count := 255;                                             { 7f00:1a1a }
      p^.count := p^.count - (255 - total);                             { 7f00:1a22 }
      total := p^.count;                                                { 7f00:1a42 }
      target := p;                                                      { 7f00:1a4c }
    end;
  end;
  p := nxt;                                                             { 7f00:1a58 }
end;
target^.count := total;                                                 { 7f00:1a67 }
```
Note (faithful bug): the three `power[k]` comparisons read the same field twice (`[BP-4]` vs `[BP-4]`, 7f00:19a1/19c1/19d4), so different charges/spells do not prevent a join; only `p^.power[1] < 2` restricts it.

### 7F00:1A8A UseItem (H)
`procedure UseItem(item [BP+0Ah]: PItem; var done [BP+6]: Boolean)` — `RETF 8`. Callers: ItemsMenu ('U'); via stub ov19 e8: ov09 `AiTryUseMagicItem` (combat AI). Callees: IsScroll, SpellList, DrawCombatLayout, ShowCharacterMessage, DrawText, BuildItemName, MessageDelay, ClearCharacterMessage, CastSpell, ClearCombatantActionFlags, UseScrollSpell, LoseItem.
Casts the spell stored in a scroll (chosen from its spell list) or in a wand/potion-like item (`power[2]` = spell, `power[1]` = charges), then consumes the charge/count. `done` = the action used the turn. Name H ("uses an item", "Item:", calls CastSpell).
```pascal
spellIdx := -1;                                                         { 7f00:1a90 }
ItemCast{g_6DBF} := 0;                                                  { 7f00:1a95 }
spell := 0;                                                             { 7f00:1a9a }
if IsScroll(item) then begin                                            { 7f00:1a9e }
  ScrollItem{g_6B80} := item;                                           { 7f00:1aad }
  spell := SpellList(2, 1, spellIdx, n);                                { 7f00:1aba  mode 2 = 'on Scroll' }
end else if (item^.power[2] > 0) and (item^.power[3] < $80) then begin  { 7f00:1ad3 }
  ItemCast := 1;                                                        { 7f00:1ae7 }
  spell := item^.power[2];                                              { 7f00:1aec }
end;
if spell = 0 then begin                                                 { 7f00:1af6 }
  done := False;                                                        { 7f00:1afc }
  exit;
end;
if (game_Mode = 5) and (SelectedChar^.controlled = 0) then DrawCombatLayout;   { 7f00:1b06 }
if ItemCast <> 0 then begin                                             { 7f00:1b1e }
  if spell > $38 then spell := spell - $17;                             { 7f00:1b28 }
  ShowCharacterMessage(SelectedChar, 'uses an item', $0A, 0);                { 7f00:1b32 }
  if game_Mode = 5 then begin                                            { 7f00:1b54 }
    DrawText(0, 23, $0A, 'Item:');                                      { 7f00:1b5b }
    BuildItemName(SelectedChar, item, 5, 23, False, True);           { 7f00:1b78 }
  end else
    BuildItemName(SelectedChar, item, 1, 22, False, True);           { 7f00:1b99 }
  MessageDelay;                                                         { 7f00:1bb8 }
  ClearCharacterMessage;                                                     { 7f00:1bbd }
end;
ItemCast := 1;                                                          { 7f00:1bc2 }
CastSpell(spell, SelectedChar^.controlled, 0, done);                    { 7f00:1bc7  CastSpell }
ItemCast := 0;                                                          { 7f00:1be2 }
if (game_Mode = 5) and (SpellTable_b11{g_3205}[spell] <> 0) then         { 7f00:1be7  DS:3205 + spell*16 }
  done := ClearCombatantActionFlags(SelectedChar);                         { 7f00:1c00 }
if done then                                                            { 7f00:1c13 }
  if IsScroll(item) then                                                { 7f00:1c1c }
    UseScrollSpell(SelectedChar, item, spell)                        { 7f00:1c2b }
  else if item^.power[1] > 0 then                                       { 7f00:1c44 }
    if item^.count > 1 then                                             { 7f00:1c4e }
      item^.count := item^.count - 1                                    { 7f00:1c58 }
    else begin
      item^.power[1] := item^.power[1] - 1;                             { 7f00:1c61 }
      if item^.power[1] = 0 then LoseItem(SelectedChar, item);          { 7f00:1c68 }
    end;
```
Notes: spell ids above 38h stored in items are mapped down by 17h before casting (item-only spell numbering; L for meaning). The ShowCharacterMessage 3rd argument is the combat-panel row (ENGINE, M).

### 7F00:1CEE SellItem (H)
`procedure SellItem(item [BP+6]: PItem)` — `RETF 4`. Callers: ItemsMenu ('S' in a shop, after MayLoseItem). Callees: BuildItemName, DrawWrappedText, WordToStr, AskYesNo, ShowTimedBottomMessage, LoseItem, WouldOverload, ClearRectangle.
Shop sale: offers half the item value (stacks: count × half-value div 20), pays in platinum + gold; coins that do not fit go to the treasure pool. Name H (strings).
```pascal
price := 0;                                                             { 7f00:1cf5 }
if item^.value > 0 then price := item^.value shr 1;                     { 7f00:1cfa }
if item^.count > 1 then                                                 { 7f00:1d10 }
  if (item^.type <> $49) or (item^.type <> $1C) then                    { 7f00:1d1a  always true (1D22 JNZ body / 1D2C JZ skip only if 49h = 1Ch): original quirk, keep }
    price := Word(item^.count * price) div 20                           { 7f00:1d2e }
  else
    price := item^.count * price;                                       { 7f00:1d46  unreachable: type = 49h fails the second test only when it is 1Ch }
BuildItemName(ViewChar, item, 0, 0, False, False);                   { 7f00:1d55 }
DrawWrappedText(1, 21, 38, 22, $0E, True,
  'I''ll give you ' + WordToStr(price) + ' gold pieces for your ' + item^.name);   { 7f00:1d74 }
if AskYesNo('Is It a Deal? ', $0D, $0A, $0F) = 'Y' then begin              { 7f00:1dc2 }
  ShowTimedBottomMessage('Sold!');                                           { 7f00:1de6 }
  LoseItem(SelectedChar, item);                                         { 7f00:1dfa }
  plat := price div 5;                                                  { 7f00:1e0d }
  gold := price mod 5;                                                  { 7f00:1e1a }
  if WouldOverload(SelectedChar, gold + plat, room) then begin            { 7f00:1e28  true = overloaded }
    ShowTimedBottomMessage('Overloaded.  Money will be put in pool.');       { 7f00:1e45 }
    if room > plat then                                                 { 7f00:1e59 }
      SelectedChar^.money[4] := SelectedChar^.money[4] + plat           { 7f00:1e61 }
    else begin
      SelectedChar^.money[4] := SelectedChar^.money[4] + room;          { 7f00:1e6f }
      TreasureMoney[4] := TreasureMoney[4] + (plat - room);             { 7f00:1e7b  g_6804 (LongInt) }
    end;
    SelectedChar^.money[3] := SelectedChar^.money[3] + gold;            { 7f00:1e8b }
  end else begin
    SelectedChar^.money[4] := SelectedChar^.money[4] + plat;            { 7f00:1e99 }
    SelectedChar^.money[3] := SelectedChar^.money[3] + gold;            { 7f00:1ea5 }
  end;
end;
ClearRectangle(1, 21, 38, 22);                                               { 7f00:1eb1 }
```
Notes: money[3] = gold (+8Eh), money[4] = platinum (+90h); 1 pp = 5 gp. The product `count * price` is 16-bit (MUL word, high word dropped by `XOR DX,DX` before DIV 14h). Gold always goes to the character even when overloaded.

### 7F00:1F52 IdentifyItem (H)
`procedure IdentifyItem(item [BP+0Ah]: PItem; var redraw [BP+6]: Boolean)` — `RETF 8`. Callers: ItemsMenu ('I' in a shop). Callees: BuildItemName, DrawWrappedText, AskYesNo, MoneyInGold, SetCharMoneyGold, MoneyValueInGold, SetPoolMoneyGold, ShowTimedBottomMessage, MessageDelay, ClearRectangle.
Shop identification for 200 gp, paid from the character's coins or else from the treasure pool; clears the item's `hidden` bits. Name H (strings).
```pascal
paid := False;                                                          { 7f00:1f59 }
BuildItemName(ViewChar, item, 0, 0, False, False);                   { 7f00:1f5d }
DrawWrappedText(1, 21, 38, 22, $0E, True,
  'For 200 gold pieces I''ll identify your ' + item^.name);             { 7f00:1f7c }
if AskYesNo('Is It a Deal? ', $0D, $0A, $0F) = 'Y' then begin              { 7f00:1fad }
  m := MoneyInGold(SelectedChar);                                       { 7f00:1fd1  MoneyInGold, LongInt }
  if m >= 200 then begin                                                { 7f00:1fe3 }
    paid := True;                                                       { 7f00:1ff2 }
    m := m - 200;                                                       { 7f00:1ff6 }
    SetCharMoneyGold(Word(m));                                          { 7f00:1fff  coins 0..4 replaced by pp + gp }
  end else begin
    m := MoneyValueInGold(TreasureMoney);                                { 7f00:2009  MoneyValueInGold(@DS:67F4) }
    if m >= 200 then begin                                              { 7f00:2019 }
      paid := True;                                                     { 7f00:2028 }
      m := m - 200;                                                     { 7f00:202c }
      SetPoolMoneyGold(Word(m));                                        { 7f00:2035 }
    end else
      ShowTimedBottomMessage('Not Enough Money');                            { 7f00:203f }
  end;
end;
if paid then                                                            { 7f00:2053 }
  if item^.hidden = 0 then                                              { 7f00:205c }
    DrawWrappedText(1, 21, 38, 22, $0E, True,
      'I can''t tell anything new about your ' + item^.name)            { 7f00:2066 }
  else begin
    item^.hidden := 0;                                                  { 7f00:2099 }
    BuildItemName(ViewChar, item, 0, 0, False, False);               { 7f00:20a1 }
    DrawWrappedText(1, 21, 38, 22, $0E, True,
      'It looks like some sort of ' + item^.name);                      { 7f00:20c0 }
    redraw := True;                                                     { 7f00:20f1 }
  end;
if paid then MessageDelay;                                              { 7f00:20f8 }
ClearRectangle(1, 21, 38, 22);                                               { 7f00:2103 }
```
Note: paying converts all of the payer's copper..platinum into platinum + gold (`SetCharMoneyGold` zeroes money[0..4] first); gems and jewelry are untouched and do not count.

### 7F00:2156 TradeCoins (H)
`procedure TradeCoins` — plain `RETF` (7f00:2475). Callers: ViewMenu ('T'). Callees: RedrawCurrentMode, SelectPartyCharacter, DrawCharacterSheet, DrawMoney, GetMem, Str, VerticalListMenu, CoinFromText, InputNumber, TransferCoins, FreeMenuList.
Gives coins of one kind to another party member: choose the receiver ("Trade to?"), then the coin kind from a list, then the amount. Repeats until the giver has no coins left or the player cancels. Name H (strings "Trade to?", "Select type of coin", "How much ", "will you trade? ").
The Ghidra "functions" `FUN_7f00_231a` and `FUN_7f00_2468` are **not routines**: 231A is a false entry inside the instruction at 7f00:2318 (`89 46 EC` = `MOV [BP-14h],AX`, disassembled from its third byte as `IN AL,DX`), and 2468 is this routine's outer-loop test (only reached by `JNZ`/`JMP` from 2156). Both are covered here.
```pascal
repeat                                                                  { 7f00:215d  outer loop }
  whom := TradePartner{g_471A};                                         { 7f00:215d }
  RedrawCurrentMode;                                                    { 7f00:216a }
  SelectPartyCharacter('Trade to?', True, whom);                        { 7f00:216f }
  if whom = nil then
    noMoney := True                                                     { 7f00:2194  then to the test at 2468 }
  else begin
    DrawCharacterSheet;                                                 { 7f00:219c }
    repeat                                                              { 7f00:21a0  inner loop }
      DrawMoney;                                                        { 7f00:21a0 }
      TradePartner := whom;                                             { 7f00:21a4 }
      head := nil;  prev := nil;  list := nil;  kinds := 0;             { 7f00:21b1 }
      for i := 0 to 6 do                                                { 7f00:21ce }
        if SelectedChar^.money[i] <> 0 then begin                       { 7f00:21d7 }
          kinds := kinds + 1;                                           { 7f00:21ee }
          if head = nil then begin                                      { 7f00:21f1 }
            GetMem(head, $2E);                                          { 7f00:21f9 }
            head^.next := nil;                                          { 7f00:2208 }
          end else begin
            prev := head;                                               { 7f00:2217 }
            GetMem(head, $2E);                                          { 7f00:2223 }
            head^.next := prev;                                         { 7f00:2232  new node in front: list ends up jewelry-first }
          end;
          Str(LongInt(SelectedChar^.money[i]):0, num);                  { 7f00:2243  string[15] }
          pad := 8 - Length(CoinName{g_0FFA}[i]);                       { 7f00:2269 }
          blanks := '';  blanks[0] := Chr(pad);                         { 7f00:2284 }
          for j := 1 to pad do blanks[j] := ' ';                        { 7f00:2295 }
          head^.text := blanks + CoinName[i] + ' ' + num;               { 7f00:22b9  string[40] at +00 }
          head^.flag29 := 0;                                            { 7f00:2301  byte +29h }
        end;
      list := head;                                                     { 7f00:2312  (bytes at 2318 = false entry FUN_7f00_231a) }
      index := 0;                                                       { 7f00:231e }
      redraw := True;                                                   { 7f00:2323 }
      VerticalListMenu('Select type of coin', '', $0D, $0A, $0F, 12, 7, 25, 13,
               list, True, redraw, index, sel);                         { 7f00:2328 }
      if sel = nil then
        done := True                                                    { 7f00:2387 }
      else begin
        coinName := '';                                                 { 7f00:238f }
        coin := CoinFromText(sel, coinName);                             { 7f00:2394 }
        coinName := 'How much ' + coinName + 'will you trade? ';        { 7f00:23a7 }
        amount := InputNumber(SelectedChar^.money[coin], coinName, $0A);  { 7f00:23db }
        TransferCoins(SelectedChar, whom, amount, coin);                { 7f00:23fe  var params @DS:5D92, @whom }
        done := True;                                                   { 7f00:2415 }
        noMoney := True;                                                { 7f00:241a }
        for i := 0 to 6 do                                              { 7f00:241f }
          if SelectedChar^.money[i] > 0 then begin                      { 7f00:2428 }
            noMoney := False;                                           { 7f00:243c }
            done := False;                                              { 7f00:2441 }
          end;
      end;
      if list <> nil then FreeMenuList(list);                           { 7f00:244c }
    until done;                                                         { 7f00:245e }
  end;
until noMoney;                                                          { 7f00:2468  (Ghidra FUN_7f00_2468) }
```
Notes: `kinds` (BP-16h) is counted but never read. Each pass rebuilds and frees the coin list. `noMoney` (BP-131h) is only assigned on "no receiver" and after a transfer: if the player cancels the coin list on the first pass, the outer test reads an uninitialised stack byte (faithful quirk; non-zero = leave, zero = ask "Trade to?" again).

### 7F00:231A FUN_7f00_231a — not a routine (H)
Ghidra function seeded at the third byte of `MOV word ptr [BP-14h],AX` (7f00:2318, bytes `89 46 EC`); no call or jump targets 231A (no callers in functions.tsv; capstone from 2312 decodes 2318/231B/231E/2320/2323 cleanly). Its "body" is TradeCoins 7f00:231B..2467 (statements `{ 7f00:231e }` .. `{ 7f00:245e }` above). Nothing to implement.

### 7F00:2468 FUN_7f00_2468 — TradeCoins loop tail (H)
Reached only by `JMP 2468` (7f00:2199) and `JNZ 2468` (7f00:2463) inside TradeCoins, uses TradeCoins' frame (`[BP-131h]`) and ends with TradeCoins' epilogue `MOV SP,BP; POP BP; RETF` (7f00:2472). It is the `until noMoney` test above. Nothing separate to implement.

### 7F00:24A7 DropCoins (H)
`procedure DropCoins` — plain `RETF` (7f00:275a). Callers: ViewMenu ('D'). Callees: DrawMoney, GetMem, Str, VerticalListMenu, CoinFromText, InputNumber, DropCoinsToPool, FreeMenuList.
Same coin list as TradeCoins; the chosen amount leaves the character (into the treasure pool in shop/treasure modes). Name H (strings "Select type of coin", "How much ", "will you drop? ").
```pascal
repeat                                                                  { 7f00:24ae }
  DrawMoney;                                                            { 7f00:24ae }
  head := nil;  prev := nil;  list := nil;  kinds := 0;                 { 7f00:24b2 }
  for i := 0 to 6 do                                                    { 7f00:24cf }
    if SelectedChar^.money[i] <> 0 then begin                           { 7f00:24d8 }
      kinds := kinds + 1;                                               { 7f00:24ef }
      if head = nil then begin                                          { 7f00:24f2 }
        GetMem(head, $2E);  head^.next := nil;                          { 7f00:24fa }
      end else begin
        prev := head;  GetMem(head, $2E);  head^.next := prev;          { 7f00:2518 }
      end;
      Str(LongInt(SelectedChar^.money[i]):0, num);                      { 7f00:2544 }
      pad := 8 - Length(CoinName{g_0FFA}[i]);                           { 7f00:256a }
      blanks := '';  blanks[0] := Chr(pad);                             { 7f00:2585 }
      for j := 1 to pad do blanks[j] := ' ';                            { 7f00:2596 }
      head^.text := blanks + CoinName[i] + ' ' + num;                   { 7f00:25ba }
      head^.flag29 := 0;                                                { 7f00:2602 }
    end;
  list := head;                                                         { 7f00:2613 }
  index := 0;                                                           { 7f00:261f }
  redraw := True;                                                       { 7f00:2624 }
  VerticalListMenu('Select type of coin', '', $0D, $0A, $0F, 12, 7, 25, 13,
           list, True, redraw, index, sel);                             { 7f00:2628 }
  if sel = nil then
    done := True                                                        { 7f00:2686 }
  else begin
    coinName := '';                                                     { 7f00:268d }
    coin := CoinFromText(sel, coinName);                                 { 7f00:2692 }
    coinName := 'How much ' + coinName + 'will you drop? ';             { 7f00:26a5 }
    amount := InputNumber(SelectedChar^.money[coin], coinName, $0A);    { 7f00:26d9 }
    DropCoinsToPool(SelectedChar, amount, coin);                              { 7f00:26fc  drop coins }
    done := True;                                                       { 7f00:2711 }
    for i := 0 to 6 do                                                  { 7f00:2715 }
      if SelectedChar^.money[i] > 0 then done := False;                 { 7f00:271e }
  end;
  if list <> nil then FreeMenuList(list);                               { 7f00:273c }
until done;                                                             { 7f00:274e }
```

### 7F00:275B ItemOverloads (H)
`function ItemOverloads(c [BP+0Ah]: PChar; item [BP+6]: PItem): Boolean` — `RETF 8`. Callers: TradeItem; via stub ov19 e9: AddItemToChar (shop Buy, "OverLoaded"). Callees: RecalcCharacter, StrWeightAllowance.
True if `c` cannot take `item`: more than 15 items, or encumbrance + item weight above the strength allowance + 1500. Name H (both callers print "Overloaded"/"OverLoaded" on true).
```pascal
RecalcCharacter(c);                                                     { 7f00:2761 }
over := c^.item_count > 15;                                             { 7f00:276c }
w := item^.weight;                                                      { 7f00:277f }
if item^.count > 0 then w := Word(item^.count * w);                     { 7f00:2789 }
if LongInt(Word(c^.encumbrance + w)) > LongInt(StrWeightAllowance(c) + 1500) then   { 7f00:27a2  16-bit sum, signed allowance }
  over := True;                                                         { 7f00:27cc }
ItemOverloads := over;                                                  { 7f00:27d0 }
```

### 7F00:27DF CycleSelectedChar (M)
`procedure CycleSelectedChar(key [BP+6]: Char)` — `RETF 2`. No static callers in ov19; via stub ov19 e10: ov07 MenuSelect (when HorizontalMenu reports an extended key), Temple, ov05 `TakeTreasureMenu/0ECD`, Shop, ExploreCommand, ov15 `MagicMenu/1780/1C59`, Camp, PartyCreationMenu. Callees: none.
Sets `SelectedChar` to the previous party member for scan code 47h ('G', Home), the next one for 4Fh ('O', End), else to the first member. Name M (behaviour; the key meaning is from the scan codes, L).
```pascal
p := PartyHead;                                                         { 7f00:27e5 }
if p <> nil then                                                        { 7f00:27f2 }
  if key = 'G' then begin                                               { 7f00:27fd }
    if p = SelectedChar then begin                                      { 7f00:2804 }
      while p^.next <> nil do p := p^.next;                             { 7f00:2816  wrap to the last member }
    end else
      while (p <> nil) and (p^.next <> SelectedChar) do p := p^.next;   { 7f00:283c  predecessor }
  end
  else if key = 'O' then begin                                          { 7f00:2874 }
    if SelectedChar^.next <> nil then p := SelectedChar^.next;          { 7f00:2878  else stays PartyHead (wrap) }
  end
  else
    p := PartyHead;                                                     { 7f00:289e }
SelectedChar := p;                                                      { 7f00:28ab }
```
Note: with an empty party `SelectedChar` becomes nil; if `SelectedChar` is not in the list, 'G' yields nil.

### 7F00:28BE MoneyInGold (H)
`function MoneyInGold(c [BP+6]: PChar): LongInt` — `RETF 4`. Callers: IdentifyItem; via stub ov19 e11: ov04 `PayForCure` (temple cure: "will only cost", "Not enough money."), ov06 `ShopBuy` (shop: "Not enough Money."), ov16 `TrainCharacter` (training). Callees: @LongMul, @LongDivMod.
Value of the character's copper..platinum in gold pieces, rounded half up (gems/jewelry not counted). Name H (coin value table, callers test it against prices).
```pascal
total := 0;                                                             { 7f00:28c4 }
for i := 0 to 4 do                                                      { 7f00:28cc }
  total := total + LongInt(c^.money[i]) * CoinValue{g_0D24}[i];         { 7f00:28d5  CoinValue = 1, 10, 100, 200, 1000 (copper units) }
MoneyInGold := (total + 100) div CoinValue[3];                          { 7f00:290e  CoinValue[3] = g_0D30 = 200 }
```

### 7F00:299C SpellList (H)
`function SpellList(mode [BP+10h]: Byte; flag [BP+0Eh]: Byte; var index [BP+0Ah]: Integer; var count [BP+6]: Byte): Byte` — `RETF 0Ch`. Callers: ViewMenu ('S', mode 0), UseItem (mode 2, flag 1); via stub ov19 e12: BeginCast (combat cast), ov15 `MemorizeMenu` (memorize), `ScribeMenu` (scribe), CastMenu, ov16 `TrainCharacter`. Callees: BuildSpellList, DrawTitledFrame, DrawCharacterName, DrawText, ChooseSpell.
Builds the spell list for `mode`, draws the header "<name>'s Spells <mode text>" on the first call (`index < 0`), and runs the spell menu; returns the chosen spell id (0 = none). Name H (header strings).
```pascal
case mode of                                                            { 7f00:29a3 }
  0: s := 'in Memory';
  1: s := 'in Spell Book';
  2: s := 'on Scroll';
  3: s := 'on Scrolls';
  4: s := 'to choose from';
  5: s := 'to be memorized';
  6: s := 'to be scribed';
else s := '';                                                           { 7f00:2a57 }
end;
count := BuildSpellList(mode);                                          { 7f00:2a5b  BuildSpellList }
if count <> 0 then begin                                                { 7f00:2a6a }
  if index < 0 then begin                                               { 7f00:2a76 }
    DrawTitledFrame(1, 1, 38, 1, 0, 0, '');                             { 7f00:2a7f }
    DrawCharacterName(SelectedChar, 1, 1, True);                        { 7f00:2aa5  "<name>'s" }
    DrawText(Length(SelectedChar^.name) + 4, 1, $0A, 'Spells ' + s);    { 7f00:2abb }
  end;
  SpellList := ChooseSpell(flag, index);                                  { 7f00:2aed  ChooseSpell }
end else
  SpellList := 0;                                                       { 7f00:2b00 }
```

### 7F00:2B0D ov19_init (H)
`procedure ov19_init` — stub entry 0, called by the main program's init chain. Empty (`PUSH BP; MOV BP,SP; POP BP; RETF`).  { 7f00:2b0d }

---

## ov24 (seg 9800) — effects (conditions), effect hooks, saving throw, to-hit roll, damage, healing (FINAL pseudocode, lane por-mod-combat)

Unit: ov24, analysis segment 9800, 24 routines (functions.tsv), 23 stub entries (`stub_ov24_e1..e22` + init). Strings at 9800:0ABB.., 1078, 1287..133A, 1648, 1848, 185C (STRINGS.md).
Role: the active-effect list of a character (TChar `effects` +7Fh, 9-byte records, SAVES.md §5): add / remove / cure, the effect-handler dispatcher (one far procedure per effect type, table filled by InstallEffectHandlers), the "effect hook" events that let active effects modify a roll or a value (to-hit, save, damage, new effect), the d20 saving throw, the d20 to-hit roll, damage with its message ("takes n points of damage from Fire", "Goes Down", "is killed"), healing, revival, strength-changing effects, the stinking-cloud check ("starts to cough", "chokes and gags from nausea") and `Roll` (dice).
Sources: `decode/listings/ov24.lst` (evidence), `ov24.c` (aid). Image bytes read from `decode/bin/ghidra/ov24.bin` (code-segment set constants) and START.unpacked.exe (DS tables).

Conventions (as VIEW.pas.md)
- **Signatures are in Pascal order**: first parameter = highest BP offset (pushed first). Parameters are given as `name [BP+xx]`.
- `{ seg:off }` = address of the first instruction of the statement (or of the call that implements it).
- Globals: `g_XXXX` = DS:XXXX; names introduced here are written `Name{g_XXXX}` at first use and listed in `ov24_names.json` / `ov24_notes.md`.
- Character fields by SAVES.md §3 names (`c^.hp` = +11Bh, `c^.status` +10Ch, `c^.active` +10Dh, `c^.side` +10Eh, `c^.thac0` +110h, `c^.ac` +111h, `c^.hp_max` +32h, `c^.str` +10h, `c^.str_exc` +16h, `c^.save[k]` +6Dh+k, `c^.ac_item_bonus` +101h, `c^.combatant` +108h, `c^.next` +104h, `c^.effects` +7Fh). Status values: 0 Okay, 1 Animated, 3 Running, 4 Unconscious, 5 Dying, 6 Dead, 7 Stoned, 8 Gone.
- Effect record (SAVES.md §5): `TEffect = record type: Byte {+0}; duration: Word {+1}; p3: Byte {+3}; callOnRemove: Byte {+4}; next: ^TEffect {+5} end` (9 bytes). The name of +4 comes from RemoveEffect (the handler is called in mode 1 only when +4 ≠ 0, 9800:0086, H); AddEffect stores its last parameter there.
- Resident callees (ENGINE names (decode/names/engine_names.json), `Name{SSSS:OOOO}`, argument lists in Pascal order = first pushed first; re-checked against ENGINE.pas.md declarations, #fable-3):
  - `HasEffect{00BA:2199}(c, type, var e): Boolean` — first effect of `c` with that type (engine_names.json; ENGINE draft "FindEffectById").
  - `ShowCharacterMessage{00BA:16EC}(c, msg, row, wait)` — in combat (`game_Mode = 5`) prints the name at (col 23, row) and `msg` at row+1 in the right panel; outside combat in the bottom window; `wait <> 0` → MessageDelay then ClearCharacterMessage (asm 00BA:16EC..17DA).
  - `ShowCombatMessageAnimation{00BA:1FEB}(c, spell: Boolean, msg)`; `ClearCharacterMessage{00BA:17E3}`; `MessageDelay{0709:0DBE}` = Delay(GameSpeed*225); `FlushViewDirtyLines{0464:1B52}`.
  - `ApplyDamage{00BA:2228}(c, n)` — subtract n from hp, set status (Unconscious/Dying/Dead) and active (ENGINE).
  - `ByteToStr{00BA:1037}(b): string`; `RecalcCharacter{00BA:0BB8}(c)` (SAVES.md name); `CountActiveSides{00BA:23DB}`; `ClearCombatantActionFlags{00BA:2637}(c): Boolean`.
  - `ForgetMemorizedSpell{00BA:148B}(id)` — clears the first `mem_spell[0..20]` slot = id of **SelectedChar** (asm 00BA:148B..14C6, H).
- VIEW-lane callees (published names, decode/names/view_names.json; signatures from VIEW.pas.md, Pascal order): `CombatantIndex(c): Byte` (index in `cb_Char[1..g_5F2A]`, 0 = not in combat); `CombatantCol(c)`, `CombatantRow(c)`, `CombatantSize(c)` (= `cb_Col/cb_Row/cb_Size[CombatantIndex(c)]`, 4-byte records); `ProbeMove(c, dir, var occupant, var tile)` (tile type under the footprint moved in `dir`, 8 = in place; 1Eh returned with priority); `BuildTargetList(col, row, range, dir, size, map)` (fills the target list `tg_Count` / 3-byte entries at `g_671B`); `FocusCombatant(c, margin, cursor)`; `RestoreTerrain(scol, srow, who)`; `RebuildOccupancy`; `PlaceCombatant(c, col, row, restoreTile): Boolean`; `RemoveCombatant(c)`.

Effect handler table (H): `EffectHandler{g_682C}` — far procedure pointers, entry for type t at `DS:6828 + 4*t` (t ≥ 1; DS:6828 itself is the high word of g_6826, so type 0 has no entry). Filled once by **InstallEffectHandlers** with ov12/ov13 stub entries; every handler is `procedure(c: PChar; e: PEffect; mode: Byte)` (RETF 0Ah, e.g. the no-op handler EffNop). mode 0 = "event / apply", mode 1 = "effect removed" (from RemoveEffect, HealCharacter). Type → handler (read from InstallEffectHandlers + stub entry tables, H):
```
01 EffBless  02 EffCurse  03 EffBonusVsUndead  04 EffStartsToTrain  05 nop        06 EffFlameTongue  07 EffHardier  08 EffProtFromEvil
09 EffProtFromGood  0A EffResistCold  0B EffCharm  0C EffStrengthEnd  0D nop        0E EffSetCharisma  0F EffHpLossTick  10 EffNop10
11 EffShield  12 EffGnomeAttackBonus  13 nop        14 EffResistFire  15 EffSilence  16 EffSlowPoisonEnd  17 EffSpiritualHammer  18 nop
19 EffInvisible  1A EffDwarfAttackBonus  1B nop        1C EffMirrorImage  1D EffEnfeebled  1E EffCoughing  1F EffHelpless  20 EffAnimatedEnd
21 EffPenaltyAll4  22 EffWeaknessAndDrain  23 EffPlusOne  24 EffPenalty4  25 EffUntouchableBeforeTurn  26 EffStrengthEnd  27 EffHaste  28 EffCloudRemoved
29 EffMagicWeaponOnly  2A EffSlow  2B EffWeakness  2C EffHpDrainTick  2D EffProtFromEvil  2E EffProtFromGood  2F EffDwarfGiantDefence  30 EffGnomeGiantDefence
31 EffPrayer  32 EffSlowHeal  33 EffHelpless  34 EffHelpless  35 EffHelpless  36 EffNop36  37 EffNop37  38 EffGrantInvisible
39 EffMummyRot  3A EffHeld  3B EffBecome62  3C nop        3D EffFireResistance  3E EffRegenerate  3F nop        40 EffPoisonHit
41 EffPoisonHitP4  42 EffPoisonHitP2  43 EffParalyzeHit2d8  44 EffGhoulParalysis  45 EffParalyzeHitLong  46 EffPoisonHitM2  47 EffUnattackable  48 EffGrantInvisible95
49 EffRake  4A ov13_3A86  4B EffBloodDrain  4C EffStirgeAttach  4D EffGrab  4E EffReviveCheck  4F EffFireDamage  50 EffAcidDamage
51 EffFearAura  52 EffFearOnce  53 EffStoneGaze  54 EffCharmGaze  55 EffDrainOne  56 EffDrainTwo  57 EffMummyTouch  58 (not set!)
59 EffDisplacement  5A EffConSaveBonusPoison  5B EffShield  5C nop        5D EffHalveFire  5E EffHalveWeapon  5F EffFallsDead  60 EffNeedSilverOrMagic
61 EffConSaveBonusMagic  62 EffRegenerate3  63 EffReviveOnce  64 EffTrollDown  65 EffStartRegenerating  66 EffTrollRise  67 EffGaseousEscape  68 EffAvoidMissiles60
69 EffMagicRes50  6A EffMagicRes15  6B EffResistSleepCharm90  6C EffImmuneSleepCharm  6D EffImmuneHold  6E EffImmuneCold  6F EffImmunePoisonParalysis  70 EffImmuneFire
71 EffFireMinusOnePerDie  72 EffHalveElectricity  73 EffHalveEdged  74 EffHalveMagicWeapon  75 EffHolyWater  76 EffHalveCold  77 EffNeedMagicWeapon  78 EffAvoidBoulders
79 EffSpitAcid  7A EffOilFlask  7B EffNeedMagicSilverHalf  7C EffResistSleepCharm30  7D EffUndeadImmunities  7E EffWardedByItem  7F nop        80 ItemGrantsEffect
81 ItemGrantsEffect  82 ItemGrantsEffect  83 ItemGiantStrength  84 ItemAlignmentShock  85 ItemGrantsEffect  86 ItemGrantsEffect  87 ItemNeedsGiantStrength  88 ItemGrantsEffect
89 ItemRemove17  8A ItemGrantsEffect  8B ItemGrantsEffect
```
(nop = EffNop, empty body.) Type 58h has no entry: the slot stays 0000:0000 (BSS), so dispatching type 58h would call address 0 — it never occurs in the hook lists below (H for the table; whether an effect 58h can exist is unknown).

---

### 9800:0000 CallEffectHandler (H)
`procedure CallEffectHandler(type [BP+10h]: Byte; c [BP+0Ch]: PChar; e [BP+8]: PEffect; mode [BP+6]: Byte)` — RETF 0Ch. Callers: RemoveEffect, RunEffectIfActive, StinkingCloudCheck, HealCharacter; external (stub e1): EffWeaknessAndDrain, EffStirgeAttach, EffGrab, EffCharmGaze, ItemGrantsEffect, ReadyItem, Spell_CharmPerson, Spell_SlowPoison, Spell_SpiritualHammer.
```pascal
EffectHandler[type](c, e, mode);                       { 9800:0003  CALLF [type*4 + 6828h] }
```

### 9800:0026 RemoveEffect (H)
`procedure RemoveEffect(c [BP+0Ch]: PChar; type [BP+0Ah]: Byte; e [BP+6]: PEffect)` — RETF 0Ah. Callers: ov24_0FD2, RemoveCombatEffects, ov24_1041, CureEffect, ApplyEffect; external (stub e2) 20 routines in ov04, ov09, ov12, ov13, ov20, ov22.
Unlinks and frees effect `e` (or, when `e = nil`, the first effect of that type) from `c^.effects`, calling its handler in mode 1 first when `e^.callOnRemove <> 0`.
```pascal
p := e;                                                     { 9800:002c }
if p = nil then begin                                       { 9800:0038 }
  p := c^.effects;                                          { 9800:0040 }
  while (p <> nil) and (p^.type <> type) do p := p^.next;   { 9800:0052 }
end;
if p = nil then exit;                                       { 9800:0078 }
if p^.callOnRemove <> 0 then                                { 9800:0083 }
  CallEffectHandler(type, c, p, 1);                         { 9800:008d }
if c^.effects = p then                                      { 9800:00a4 }
  c^.effects := p^.next                                     { 9800:00ba }
else begin
  q := c^.effects;                                          { 9800:00d3 }
  while (q <> nil) and (q^.next <> p) do q := q^.next;      { 9800:00e5 }
  q^.next := p^.next;                                       { 9800:0115  (q = nil impossible when p is in the list) }
end;
FreeMem(p, 9);                                              { 9800:012b }
```
Note: when `e <> nil` is given, `type` is only used for the handler call (the handler of `type` is called even if `e^.type` differs) — H.

### 9800:0160 RunEffectIfActive (M)
`procedure RunEffectIfActive(c [BP+8]: PChar; type [BP+6]: Byte)` — RETF 6. Caller: CallEffectHooks (only).
Calls the handler of effect `type` in mode 0 if `c` has that effect; for the four "area" types 15h, 2Dh, 2Eh, 31h (set at 9800:0140) it is enough that **some party member** has the effect — outside combat always, in combat only if `c` stands within range of that member (range 6 squares for 31h, 1 otherwise). Name M (behaviour).
```pascal
found := false;                                                  { 9800:0167 }
m := PartyHead;                                                  { 9800:016c }
if HasEffect(c, type, e) then                                   { 9800:017b }
  found := true                                                  { 9800:0194 }
else if type in [$15, $2D, $2E, $31] then begin                  { 9800:019c  set CS:0140 }
  Move(g_671B, saved, $D8);                                      { 9800:01af  keep the caller's area list }
  while (m <> nil) and not found do begin                        { 9800:01c3 }
    if HasEffect(m, type, e) then                               { 9800:01da }
      if game_Mode = 5 then begin                                   { 9800:01f8  combat }
        if type = $31 then range := 6 else range := 1;           { 9800:0202 }
        BuildTargetList(CombatantCol(m), CombatantRow(m), range, $FF, CombatantSize(m), cm_Map);   { 9800:0214 }
        for i := 1 to tg_Count do                                  { 9800:0255 }
          if g_671B[(i-1)*3] = CombatantIndex(c) then found := true;  { 9800:026e }
      end else
        found := true;                                           { 9800:02a2 }
    m := m^.next;                                                { 9800:02a7 }
  end;
  Move(saved, g_671B, $D8);                                      { 9800:02c0 }
end;
if found then CallEffectHandler(type, c, e, 0);                  { 9800:02d4  e = the member's effect }
```

### 9800:02FA CallEffectHooks (M)
`procedure CallEffectHooks(event [BP+0Ah]: Byte; c [BP+6]: PChar)` — RETF 6. Callers: AttackRollVsAC (10h), AttackRoll (0Ah attacker, 10h target), SavingThrow (0Ch), DamageCharacter (06h, 0Dh), ApplyEffect (09h); external (stub e3): ov08 TakeTurn (07h, 0Fh), CombatMenu (0Fh), EndOfRound (13h), ov09 AiMoveAttack (0Eh), AiMoraleCheck (11h), StartCombat (08h), ov12 ApplyFatalStatus (0Dh), ov13 StartCombatRound/0123/0D23 (12h), RollDamage (04h, 05h), ShowAttackResult (0Dh), CanAttack (01h, 00h), MeleeAttack (0Bh, variable), ov22 ApplySpell (0Bh), HasteSlow (variable).
For event `event`, runs `RunEffectIfActive(c, t)` for each effect type t of the event's list, in this order (case chain 9800:0300..0AB5, every list exactly as in the asm, H). The handlers communicate through globals (`AttackRollValue`, `SaveRoll`, `SaveType`, `DamageAmount`, `DamageType`, `EffectToApply`, …).
```pascal
case event of                                                    { 9800:0300 }
  $00: types := [7E];                                            { 9800:0307 }
  $01: types := [3F, 25, 19, 47];                                { 9800:031b }
  $02: types := [55, 56, 57, 44, 4F, 50, 4C, 49, 4D];            { 9800:0356 }
  $03: types := [40, 41, 42, 43, 44, 45, 46, 4F, 55, 56, 57];    { 9800:03d5 }
  $04: types := [1D, 03, 06];                                    { 9800:046b }
  $05: types := [1C, 29, 68, 78, 65, 73, 74, 77, 7B, 60, 5E, 3C, 7A, 75];          { 9800:049c }
  $06: types := [71, 3D, 7A, 3C, 5B, 0A, 14, 69, 6A, 70, 72, 76, 11, 5D, 65, 1C];  { 9800:055c  damage taken }
  $07: types := [33, 34, 35, 1F];                                { 9800:0633 }
  $08: types := [63, 51, 52, 59, 48, 38];                        { 9800:066a }
  $09: types := [69, 6A, 6B, 6C, 6D, 6E, 6F, 70, 7C, 7D];        { 9800:06bf  new effect about to be applied }
  $0A: types := [01, 02, 21, 24, 31, 03, 06, 12, 1A];            { 9800:074b  attacker's to-hit }
  $0B: types := [21, 11, 08, 09, 2D, 2E, 1E];                    { 9800:07c7 }
  $0C: types := [08, 09, 0A, 11, 14, 21, 24, 2D, 2E, 31, 3D, 6F, 7D, 5A, 61];      { 9800:0829  saving throw }
  $0D: types := [63, 64, 67, 4B, 4A];                            { 9800:08f6  character went down }
  $0E: types := [53, 54, 58, 79];                                { 9800:093e }
  $0F: types := [15, 1E, 4A, 4B, 0B];                            { 9800:0979 }
  $10: types := [19, 47, 25, 2F, 30, 59];                        { 9800:09c1  target of a to-hit roll }
  $11: types := [01, 02, 0B];                                    { 9800:0a16 }
  $12: types := [27, 2A, 3A];                                    { 9800:0a43 }
  $13: types := [62, 17, 48, 38, 0B];                            { 9800:0a70 }
end;                                                             { other events: nothing }
for each t in types (in list order) do RunEffectIfActive(c, t);
```
(All numbers hexadecimal. Event meanings are given only where an ov24 caller shows them; the others belong to the calling areas.)

### 9800:0AE7 StinkingCloudCheck (M)
`procedure StinkingCloudCheck(c [BP+6]: PChar)` — RETF 4. External callers (stub e4): ov08 EndOfRound, MoveAttack, ov09 AiMove, ov22 FUN_8e00_1dc1. Callees: ProbeMove, HasEffect, SavingThrow, ApplyEffect, Roll, CallEffectHandler.
A combatant standing on ground type 1Eh (the cloud) that has none of the effects 1Eh, 1Fh, 20h, 6Fh, 7Dh makes a saving throw vs. type 0: success → effect 1Eh for 1 round "starts to cough"; failure → effect 1Fh for 1d4+1 rounds "chokes and gags from nausea". Name M (the AD&D Stinking Cloud rule matches exactly; the spell name itself is not in this routine).
```pascal
if c^.active = 0 then exit;                                            { 9800:0aed }
ProbeMove(c, 8, occupant, ground);                                     { 9800:0afb  dir 8 = no offset }
if ground <> $1E then exit;                                            { 9800:0b13 }
if HasEffect(c, $1E, e) then exit;                                    { 9800:0b1c }
if HasEffect(c, $1F, e) then exit;                                    { 9800:0b36 }
if HasEffect(c, $20, e) then exit;                                    { 9800:0b50 }
if HasEffect(c, $6F, e) then exit;                                    { 9800:0b6a }
if HasEffect(c, $7D, e) then exit;                                    { 9800:0b84 }
saved := SavingThrow(c, 0, 0);                                         { 9800:0b9e }
if saved then begin
  ApplyEffect(c, $1E, 1, $FF, 0, 0, saved, 'starts to cough');         { 9800:0bb7 }
  CallEffectHandler($1E, c, e, 0);                                     { 9800:0be4 }
end else begin
  ApplyEffect(c, $1F, Roll(1, 4) + 1, $FF, 0, 0, saved, 'chokes and gags from nausea');   { 9800:0bfc }
  CallEffectHandler($1F, c, e, 0);                                     { 9800:0c33 }
end;
```
Note: `e` passed to the handler is the variable last written by HasEffect(c, $7D, e) (no effect found → its "not found" value), not the newly added record (H by the push of `[BP-6]`).

### 9800:0C4F AttackRollVsAC (M)
`function AttackRollVsAC(target [BP+8]: PChar; toHit [BP+6]: Byte): Boolean` — RETF 6. External caller: ecl_op2E_Damage (2F00:2998, ECL DAMAGE: "target check" with operand 5).
d20 roll (a 20 counts as 100), target's hook event 10h may change it (a negative value = automatic miss); hit if `roll + toHit > target^.ac` (both in the 60-based form of SAVES.md).
```pascal
result := false;                                                       { 9800:0c55 }
AttackRollValue{g_6822} := Roll(1, 20);                                { 9800:0c59 }
if AttackRollValue <= 1 then exit;                                     { 9800:0c66  signed; a natural 1 always misses }
if AttackRollValue = 20 then AttackRollValue := 100;                   { 9800:0c6d }
CallEffectHooks($10, target);                                          { 9800:0c79 }
if (AttackRollValue >= 0) and (AttackRollValue + toHit > target^.ac) then   { 9800:0c86  ShortInt + Byte, 16-bit compare }
  result := true;                                                      { 9800:0caa }
```

### 9800:0CB7 AttackRoll (M)
`function AttackRoll(attacker [BP+0Ch], target [BP+8]: PChar; targetAC [BP+6]: Byte): Boolean` — RETF 0Ah. External callers: ov13 MeleeAttack (melee/missile attack, 6100:16D3), ov22 ApplySpell (spell attack, passes `target^.ac` after RecalcCharacter, 8E00:09D7).
Hit if `d20 + attacker^.thac0 + sideBonus >= targetAC` (60-based THAC0 and AC, so this is the AD&D "d20 ≥ THAC0 − AC" rule), natural 1 misses, natural 20 → 100 (always hits unless a hook lowers it), hooks: event 0Ah on the attacker, 10h on the target. Attacking ends effect 19h on the attacker first.
```pascal
result := false;                                                       { 9800:0cbd }
ov24_0FD2(attacker);                                                   { 9800:0cc1  remove every effect 19h of the attacker }
AttackRollValue := Roll(1, 20);                                        { 9800:0ccb }
if AttackRollValue <= 1 then exit;                                     { 9800:0cd8  signed }
if AttackRollValue = 20 then AttackRollValue := 100;                   { 9800:0cdf }
CallEffectHooks($0A, attacker);                                        { 9800:0ceb }
CallEffectHooks($10, target);                                          { 9800:0cf8 }
if attacker^.side = 0 then                                             { 9800:0d05 }
  sideBonus := ShortInt(ecl_Mem6B00^[$6E2])                            { 9800:0d10  party side }
else
  sideBonus := ShortInt(ecl_Mem6B00^[$6E0]);                           { 9800:0d1e  monster side }
if (AttackRollValue >= 0) and                                          { 9800:0d2a }
   (AttackRollValue + attacker^.thac0 + sideBonus >= targetAC) then    { 9800:0d31  16-bit signed compare }
  result := true;                                                      { 9800:0d56 }
```
`ecl_Mem6B00^[$6E0]` / `[$6E2]`: signed to-hit modifiers per side kept in the ECL variable block (ECL lane; ECL scripts can set them).

### 9800:0D63 SavingThrow (H)
`function SavingThrow(c [BP+0Ah]: PChar; saveType [BP+8], bonus [BP+6]: ShortInt): Boolean` — RETF 8. Callers: StinkingCloudCheck; external (stub e7, 14 sites): ecl_op2E_Damage, ov12 (PoisonOpponent/15eb, EffFearAura/1BA8/1CAD/1E77/2C1C), ov22 (ApplySpell with the spell's save type, BoltHitSquare, Spell_Reduce, Spell_HoldPerson).
d20: natural 1 fails, natural 20 succeeds; otherwise `roll + c^.ac_item_bonus + bonus` (byte arithmetic) may be changed by hooks (event 0Ch) and succeeds when `c^.save[saveType] <= roll`.
```pascal
SaveRoll{g_6816} := Roll(1, 20);                                       { 9800:0d69 }
if SaveRoll = 1 then begin result := false; exit end;                  { 9800:0d79 }
if SaveRoll = 20 then begin result := true; exit end;                  { 9800:0d83 }
SaveRoll := Byte(SaveRoll + ShortInt(c^.ac_item_bonus) + bonus);       { 9800:0d8d  +101h: item bonus (rings/cloaks of protection add to saves) }
SaveType{g_682A} := saveType;                                          { 9800:0daa }
CallEffectHooks($0C, c);                                               { 9800:0db0 }
result := c^.save[saveType] <= SaveRoll;                               { 9800:0dbd  unsigned byte compare, index sign-extended }
```
saveType 0..4 = paralysation/poison, petrification, rod/staff/wand, breath, spell (SAVES.md +6Dh, M).

### 9800:0DE3 Roll (H)
`function Roll(count [BP+8], sides [BP+6]: Byte): Byte` — RETF 4. Name from por-ecl (ecl_names.json). 122 external call sites (stub e8) in 58 routines; internal: StinkingCloudCheck, AttackRollVsAC, AttackRoll, SavingThrow, RollDice.
```pascal
sum := 0;                                                              { 9800:0de9 }
if count > 0 then                                                      { 9800:0ded }
  for i := 1 to count do                                               { 9800:0df3 }
    sum := Byte(sum + Random(sides) + 1);                              { 9800:0e08  Random(N) = HiWord(RandSeed) mod N }
Roll := sum;                                                           { 9800:0e1f }
```
Byte result: sums above 255 wrap. `sides = 0` gives `count` (Random(0) = 0).

### 9800:0E2E RollDice (M)
`function RollDice(count [BP+8], sides [BP+6]: Byte): Byte` — RETF 4. External callers (stub e9, 12 sites): EffBloodDrain/1A19/1A4C/2B20/2C1C/2D38, ov13 RollDamage, Spell_CauseLightWounds/1439/14C7/266B/3058 (spell damage, e.g. 8E00:10BD = 1d8).
Same as Roll but records the number of dice for the effect handlers (`LastDiceCount{g_681C}` is read by EffFireResistance, EffFireMinusOnePerDie, EffOilFlask — per-die damage adjustments, M).
```pascal
LastDiceCount{g_681C} := count;                                        { 9800:0e34 }
RollDice := Roll(count, sides);                                        { 9800:0e3a }
```

### 9800:0E52 AddEffect (H)
`procedure AddEffect(c [BP+0Eh]: PChar; type [BP+0Ch]: Byte; duration [BP+0Ah]: Word; p3 [BP+8], callOnRemove [BP+6]: Byte)` — RETF 0Ch. Callers: ApplyEffect; external (stub e10, 38 sites): ov12 (EffHardier passes 3Ch, FFh, 1 …), ov16 CreateCharacter, ov22 spell code. Name H (SAVES.md §5; appends a 9-byte record to `+7Fh`).
```pascal
GetMem(e, 9);                                                          { 9800:0e58 }
if c^.effects = nil then c^.effects := e                               { 9800:0e67 }
else begin
  q := c^.effects;                                                     { 9800:0e89 }
  while q^.next <> nil do q := q^.next;                                { 9800:0e9b }
  q^.next := e;                                                        { 9800:0ebb  appended at the end }
end;
e^.next := nil;                                                        { 9800:0ecc }
e^.type := type;                                                       { 9800:0ed9 }
e^.duration := duration;                                               { 9800:0ee2 }
e^.callOnRemove := callOnRemove;                                       { 9800:0eec }
e^.p3 := p3;                                                           { 9800:0ef6 }
```

### 9800:0F06 RemoveFromCombat (M)
`procedure RemoveFromCombat(c [BP+0Ch]: PChar; newStatus [BP+0Ah]: Byte; msg [BP+6]: string)` — RETF 0Ah. External callers (stub e11): Flee (status 3, "Got Away"), ov09 AiMoraleCheck (status 4, "Surrenders"), EffGaseousEscape (status 3, "Turns gaseous and escapes").
Takes a combatant off the battlefield: message, status change, icon removed, combat-only effects cleared.
```pascal
s := msg;                                                              { 9800:0f0c  string[40] }
if c^.active = 0 then exit;                                            { 9800:0f1f }
i := CombatantIndex(c);                                                     { 9800:0f2d  combatant index }
FocusCombatant(c, 3, 0);                                                    { 9800:0f3b }
ShowCharacterMessage(c, s, 10, 1);                                     { 9800:0f4c }
c^.active := 0;                                                        { 9800:0f62 }
c^.status := newStatus;                                                { 9800:0f6b }
if c^.status <> 3 then c^.hp := 0;                                     { 9800:0f76  only a Running character keeps its hit points }
RestoreTerrain(0, 0, i);                                                    { 9800:0f8a  pushes 0, 0, i = RestoreTerrain(scol, srow, who) of VIEW.pas.md BB00:052B; #fable-3 checked }
FlushViewDirtyLines;                                                      { 9800:0f99 }
cb_Size[i] := 0;                                                       { 9800:0f9e  [i*4 + 5F2Ah]: icon removed }
RebuildOccupancy;                                                             { 9800:0fae }
if ClearCombatantActionFlags(c) then RemoveCombatEffects(c);              { 9800:0fb3 }
```

### 9800:0FD2 ov24_0FD2 — remove all effects 19h (name L: BreakInvisibility)
`procedure ov24_0FD2(c [BP+6]: PChar)` — RETF 4. Callers: AttackRoll; external (stub e12): MeleeAttack, CastSpell, BreathWeapon.
```pascal
while HasEffect(c, $19, e) do                                         { 9800:0fd8 }
  RemoveEffect(c, $19, e);                                             { 9800:0fef }
```
Effect 19h is removed whenever the character attacks (AttackRoll) and is in the target hook list 10h and the event-01 list: consistent with invisibility (ends on attack, harder to hit) — L, not proven in ov24.

### 9800:100A RemoveCombatEffects (M)
`procedure RemoveCombatEffects(c [BP+6]: PChar)` — RETF 4. Callers: RemoveFromCombat, DamageCharacter; external (stub e13): ApplyFatalStatus, ShowAttackResult.
```pascal
for k := 1 to 16 do                                                    { 9800:1010 }
  RemoveEffect(c, CombatEffectTypes{g_0C13}[k], nil);                  { 9800:1019  one effect of each type }
```
`g_0C13[1..16]` (DS:0C14..0C23, image bytes, H) = 07 0B 1E 1F 20 33 34 35 36 3A 3B 5F 62 89 4A 4B. Only the first effect of each type is removed (RemoveEffect with e = nil).

### 9800:1041 ov24_1041 — remove effects 4Ah, 4Bh (L)
`procedure ov24_1041(c [BP+6]: PChar)` — RETF 4. External caller (stub e14): ov09 AiMoraleCheck.
```pascal
for k := 1 to 2 do                                                     { 9800:1047 }
  RemoveEffect(c, g_0C23[k], nil);                                     { 9800:1050  g_0C23[1..2] = 4A 4B }
```

### 9800:1081 CureEffect (H)
`function CureEffect(c [BP+8]: PChar; type [BP+6]: Byte): Boolean` — RETF 6. External callers (stub e15): ov22 CureDisease, HasteSlow, Spell_Reduce, Spell_CureBlindness, Spell_RemoveCurse, Power_Speed, Power_Cure (cure spells).
```pascal
result := false;                                                       { 9800:1087 }
if HasEffect(c, type, e) then begin                                   { 9800:108b }
  ShowCharacterMessage(c, 'is Cured', 10, 1);                          { 9800:10a3 }
  RemoveEffect(c, type, e);                                            { 9800:10c3 }
  result := true;                                                      { 9800:10d7 }
end;
```

### 9800:10E4 StrengthCode (M)
`function StrengthCode(str [BP+8], strExc [BP+6]: Byte): Byte` — RETF 4. Callers: SetStrength; external (stub e16): EffStrengthEnd.
Packs a strength into one byte: 18/xx → xx + 1 (1..101), other values → str + 100.
```pascal
code := str + 100;                                                     { 9800:10ea }
if str = 18 then code := strExc + 1;                                   { 9800:10f5 }
StrengthCode := code;                                                  { 9800:1104 }
```

### 9800:110D DecodeStrength (M)
`procedure DecodeStrength(e [BP+0Eh]: PEffect; var str [BP+0Ah], strExc [BP+6]: Byte)` — RETF 0Ch. Callers: SetStrength; external (stub e17): EffStrengthEnd, ItemGiantStrength.
Inverse of StrengthCode for the code kept in `e^.p3` (bit 7 masked off).
```pascal
strExc := 0;                                                           { 9800:1110 }
str := e^.p3 and $7F;                                                  { 9800:1117 }
if str <= $65 then begin                                               { 9800:1126 }
  strExc := str - 1;                                                   { 9800:112f }
  str := 18;                                                           { 9800:113e }
end else
  str := str - 100;                                                    { 9800:1147 }
```

### 9800:115C SetStrength (M)
`function SetStrength(c [BP+0Eh]: PChar; newStr [BP+0Ch], newExc [BP+0Ah]: Byte; var oldCode [BP+6]: Byte): Boolean` — RETF 0Ch. External callers (stub e18): ItemGiantStrength, Spell_Enlarge, Spell_Strength, Power_Strength (strength spells / items; effect types 0Ch and 26h share the handler EffStrengthEnd).
Raises the character's strength to (newStr, newExc) unless that would lower it; returns the previous strength as a code (for the effect's p3). A strength effect already active (type 0Ch or 26h whose p3 < 80h) takes over the role of "original strength" holder.
```pascal
curStr := c^.str;                                                      { 9800:1162 }
curExc := c^.str_exc;                                                  { 9800:116c }
if (newStr < curStr) or ((newStr = 18) and (newExc < curExc)) then begin   { 9800:1176 }
  result := false;                                                     { 9800:118c }
  oldCode := StrengthCode(newStr, newExc) + $80;                       { 9800:1190 }
  exit;
end;
old := nil;                                                            { 9800:11aa }
p := c^.effects;                                                       { 9800:11b2 }
while (p <> nil) and (old = nil) do begin                              { 9800:11c4 }
  if ((p^.type = $0C) or (p^.type = $26)) and (p^.p3 < $80) then old := p;   { 9800:11d4 }
  p := p^.next;                                                        { 9800:11fc }
end;
if old <> nil then begin                                               { 9800:120f }
  code := StrengthCode(curStr, curExc);                                { 9800:1217 }
  DecodeStrength(old, curStr, curExc);                                 { 9800:1226  the older effect's stored strength becomes "current" }
  old^.p3 := code + $80;                                               { 9800:123a }
end;
c^.str := newStr;                                                      { 9800:1249 }
c^.str_exc := newExc;                                                  { 9800:1253 }
RecalcCharacter(c);                                                    { 9800:125d }
oldCode := StrengthCode(curStr, curExc);                               { 9800:1268 }
result := true;                                                        { 9800:127a }
```

### 9800:1344 DamageCharacter (H)
`procedure DamageCharacter(c [BP+0Ch]: PChar; dmg [BP+0Ah], saveEffect [BP+8]: Byte; saved [BP+6]: Boolean)` — RETF 0Ah. External callers (stub e19): ov22 ApplySpell, BoltHitSquare; EffHpLossTick, 1168, 176F, 1A19, 1A4C, 2C1C, 30A5. The damage kind is passed in `DamageType{g_6819}` (set by the caller: 1 Fire, 2 Cold, 4 Electricity, 10h Acid, 8 Magic, combinable with 8).
Hooks (event 6) may change the amount; a successful save gives no damage (`saveEffect = 1`) or half (`= 2`); prints "takes n points of damage [from X]", applies it, interrupts spell casting in combat ("lost a spell"), and handles going down.
```pascal
DamageAmount{g_6818} := dmg;                                           { 9800:134b }
CallEffectHooks($06, c);                                               { 9800:1351 }
if saved then                                                          { 9800:135e }
  case saveEffect of
    1: DamageAmount := 0;                                              { 9800:136b }
    2: DamageAmount := DamageAmount shr 1;                             { 9800:1376  rounds down }
  end;
if DamageAmount = 0 then exit;                                         { 9800:1380  no message at all }
if DamageAmount <> 1 then                                              { 9800:138a }
  s := 'takes ' + ByteToStr(DamageAmount) + ' points of damage '       { 9800:1391 }
else
  s := 'takes 1 point of damage ';                                     { 9800:13d0 }
case DamageType and $F7 of                                             { 9800:13e4 }
  $01: s := s + 'from Fire';                                           { 9800:13ed }
  $02: s := s + 'from Cold';                                           { 9800:141e }
  $04: s := s + 'from Electricity';                                    { 9800:144e }
  $10: s := s + 'from Acid';                                           { 9800:147e }
end;
if (DamageType and 8) = DamageType then s := s + 'from Magic';         { 9800:14a8  true for 8 AND for 0 }
ShowCombatMessageAnimation(c, 0, s);                                   { 9800:14dd }
ApplyDamage(c, DamageAmount);                                          { 9800:14f1 }
if game_Mode = 5 then begin                                               { 9800:1500  in combat }
  c^.combatant^[1] := 0;                                               { 9800:1507 }
  if c^.combatant^[0] > 0 then begin                                   { 9800:1514  a spell was being cast }
    ShowCharacterMessage(c, 'lost a spell', 12, 1);                    { 9800:1522 }
    ForgetMemorizedSpell(c^.combatant^[0]);                            { 9800:1543  NB: removes it from SelectedChar }
    c^.combatant^[0] := 0;                                             { 9800:1554 }
  end;
end;
if c^.active = 0 then begin                                            { 9800:1560 }
  s := 'Goes Down';                                                    { 9800:156e }
  if c^.status = 5 then s := s + ', and is Dying';                     { 9800:1582 }
  if c^.status in [6, 7, 8] then s := 'is killed';                     { 9800:15b7  set CS:131A = Dead, Stoned, Gone }
  ShowCharacterMessage(c, s, text_Row + 1, 0);                           { 9800:15e0  next text row }
  if game_Mode <> 5 then
    MessageDelay                                                       { 9800:1602 }
  else begin
    RemoveCombatEffects(c);                                            { 9800:1609 }
    CallEffectHooks($0D, c);                                           { 9800:1613 }
    if c^.active = 0 then RemoveCombatant(c)                                 { 9800:1620  remove/redraw the icon }
    else MessageDelay;                                                 { 9800:1638  a hook brought it back }
  end;
end;
ClearCharacterMessage;                                                 { 9800:163d }
```
Notes: "takes n points of damage " keeps its trailing space, so "from Fire" follows directly; with `DamageType = 0` the text ends "from Magic" (literal behaviour). The `ForgetMemorizedSpell` call works on `SelectedChar`, not on `c` (00BA:148B reads DS:5D92) — when the damaged caster is not the selected character the wrong character loses the spell (original bug, H for the code; whether SelectedChar ≠ c happens here depends on the callers).

### 9800:1656 ApplyEffect (M)
`procedure ApplyEffect(c [BP+16h]: PChar; type [BP+14h]: Byte; duration [BP+12h]: Word; p3 [BP+10h], callOnRemove [BP+0Eh], negateOnSave [BP+0Ch]: Byte; saved [BP+0Ah]: Boolean; msg [BP+6]: string)` — RETF 14h. Callers: StinkingCloudCheck; external (stub e20): ov22 ApplySpell, Spell_HoldPerson, Spell_AnimateDead, EffFearAura, 1BA8, 1E77.
Gives `c` effect `type` unless a hook (event 9) vetoes it or the save negates it ("is Unaffected"); an existing effect of the same type is replaced only when the new duration is longer or the new one is permanent (duration 0) — otherwise the new record is added in addition.
```pascal
s := msg;                                                              { 9800:165c  string[40] }
EffectToApply{g_6817} := type;                                         { 9800:166f }
CallEffectHooks($09, c);                                               { 9800:1675 }
if (EffectToApply = 0) or (saved and (negateOnSave = 1)) then begin    { 9800:1682 }
  ShowCharacterMessage(c, 'is Unaffected', 10, 1);                     { 9800:1695 }
  exit;
end;
if HasEffect(c, type, e) then                                         { 9800:16b8 }
  if ((e^.duration > 0) and (duration > e^.duration)) or (duration = 0) then   { 9800:16d0 }
    RemoveEffect(c, type, e);                                          { 9800:16ec }
AddEffect(c, type, duration, p3, callOnRemove);                        { 9800:1700 }
if s <> '' then begin                                                  { 9800:1719 }
  ShowCombatMessageAnimation(c, 1, s);                                 { 9800:171f }
  ClearCharacterMessage;                                               { 9800:1732 }
end;
```

### 9800:175D HealCharacter (M)
`function HealCharacter(c [BP+0Ah]: PChar; amount [BP+8]: Byte; onlyIfHurt [BP+6]: Boolean): Boolean` — RETF 8. External callers (stub e21): ov04 CureWounds (cure spells), ov20 DailyHealing, EffSlowHeal, EffRegenerate, Spell_CureLightWounds, Power_Cure, Power_Healing.
Only for status Okay, Animated, Unconscious, Dying (set CS:173D); effect 32h blocks it unless `onlyIfHurt` and the character is hurt. A Dying character becomes Unconscious; an Unconscious one outside combat triggers handler 4Eh (mode 1).
```pascal
result := false;                                                       { 9800:1763 }
if not (c^.status in [0, 1, 4, 5]) then exit;                          { 9800:1767 }
if not ((c^.hp < c^.hp_max) and onlyIfHurt) then begin                 { 9800:177f }
  if HasEffect(c, $32, e) then exit;                                  { 9800:1796 }
  if onlyIfHurt then exit;                                             { 9800:17b0 }
end;
c^.hp := Byte(c^.hp + amount);                                         { 9800:17b9  byte add, can wrap }
if c^.hp > c^.hp_max then c^.hp := c^.hp_max;                          { 9800:17d4 }
if c^.active = 0 then begin                                            { 9800:17f4 }
  if c^.status = 5 then c^.status := 4;                                { 9800:17ff  Dying → Unconscious }
  if (c^.status = 4) and (game_Mode <> 5) then                            { 9800:1813 }
    CallEffectHandler($4E, c, nil, 1);                                 { 9800:1825 }
end;
result := true;                                                        { 9800:183b }
```
Note: with `onlyIfHurt = false` the routine "heals" (and returns true) even at full hit points unless effect 32h is present (H, branch structure 9800:177F..17B6).

### 9800:1869 ReviveCombatant (M)
`function ReviveCombatant(c [BP+8]: PChar; hp [BP+6]: Byte): Boolean` — RETF 6. External callers (stub e22): EffReviveCheck, EffReviveOnce, EffTrollRise, Spell_AnimateDead.
Puts a downed combatant back on its feet at its map position (if PlaceCombatant can place it): status Okay, active, `hp` hit points; enemies "stand up and grin".
```pascal
if not PlaceCombatant(c, CombatantCol(c), CombatantRow(c), 1) then begin result := false; exit end;   { 9800:186f }
c^.status := 0;                                                        { 9800:189c }
c^.active := 1;                                                        { 9800:18a5 }
c^.hp := hp;                                                           { 9800:18ae }
if game_Mode = 5 then FocusCombatant(c, 3, 0);                                 { 9800:18b9 }
if c^.side = 1 then s := 'stands up and grins'                         { 9800:18d1 }
else s := 'gets back up';                                              { 9800:18f1 }
ShowCharacterMessage(c, s, 10, 1);                                     { 9800:1904 }
CountActiveSides;                                                      { 9800:191a }
result := true;                                                        { 9800:191f }
```

### 9800:1932 ov24_init (H)
Empty unit initialiser (`PUSH BP; MOV BP,SP; POP BP; RETF`), called by the main init chain.  { 9800:1932 }

---

## Self-check (area)

| unit | lane self-check (sample / statements, result) | verifier (por-tooling) independent sample |
|---|---|---|
| ov05 | Sample (≥ 10 % of ~235 statements; re-read against ov05.lst): 3900:0006, 0019, 006c, 0088, 00c4, 00fb, 0115, 0128→013a, 0190/01f7, 0233..02b3 (7 divisors/multip | 4/4 |
| ov07 | Sample: 40 of 439 statement addresses (9.1 % of addresses, > 10 % of statements since many addresses cover several), drawn with Python `random.seed(707)`: 4300: | 5/5 |
| ov09 | Sample: 32 of 302 statement addresses (10.6 %), drawn with Python `random.seed(909)`: 4d00:0022 0045 01b2 01b8 01ee 025f 02a1 048c 054f 0567 0599 05e3 07f9 08fa | 5/5 |
| ov13 | Method: 80 of the 789 address-annotated pseudocode lines (10.1 %) drawn with Python `random.seed(1313); random.sample(range(789), 80)`; each line's `{ 6100:xxxx | 8+6: 1 arg-order defect found -> normalisation pass (11 fixes), resample 6/6 |
| ov18 | Sample (≥ 10 % of ~95 statements; re-read against ov18.lst): 7a00:000c, 7a00:004c, 7a00:009e, 7a00:00e6, 7a00:00f9, 7a00:02c5, 7a00:0393, 7a00:0407, 7a00:0440,  | 4/4 |
| ov19 | Method: 46 of 444 statement lines (10.4 %) drawn with `random.seed(19)` (40) plus 6 hand-picked tricky ones, each re-read against `ov19.lst` (push order, consta | 6/6 |
| ov24 | Sample (22 of ~205 statements, re-read against ov24.lst): 9800:0003, 0086, 00ba, 0167, 019c, 0202, 0214, 026e, 0b13, 0bfc, 0c66, 0c86, 0d05, 0d31, 0d8d, 0dbd, 0 | 4/4 |
