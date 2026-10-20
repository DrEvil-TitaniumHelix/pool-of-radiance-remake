# ov13 (6100) — notes (lane por-mod-combat)

Pseudocode: `ov13.pas.md` (39 routines = every ov13 row of `functions.tsv`, incl. the nested 32E6/3389 and the empty init). Screens: `ov13_SCREENS.md` (COMBAT-ov13-01..17). Names: `ov13_names.json` (M/H only; EffHold 3A86 is L and not exported).

## (a) Routines

| routine | name | conf | evidence (one line) |
|---|---|---|---|
| 6100:0000 | StartCombatRound | M | inits cr+0..+8, attacks of both slots, sweepLeft := +6Bh, initiative 1d6+DexMissileAdj (−6 for the side flagged in ECL SURPRISE word 6DCBh), moveLeft; called by CombatMain combat |
| 6100:0123 | CalcMove | M | `move` (+11Ch) (+ECL 6E72h for side 0), clamp 1..96, ×2, effect event 12h with StatKind = 1 |
| 6100:0191 | RollDamage | H | RollDice(+114h+k, +116h+k) + (+118h+k) into g_6818; ×(thief lvl div 4 + 2) if CanBackstab; events 4/5 |
| 6100:02F9 | ShowAttackResult | H | all attack-result strings ("Attacks", "-Backstabs-", "Hitting for", "and Misses", "goes down", "is killed"…) + ApplyDamage call |
| 6100:0627 | FreeAttacksOnMover | M | adjacent enemies with cr+7 set and not helpless call Attack on c; caller = step routine |
| 6100:0712 | StepCombatant | M | cost 2/3 vs cr+6, updates combatant x/y tables g_5F27/28 by g_2736/273F, redraw, step sound |
| 6100:08B2 | AttacksOfOpportunity | M | enemy set before vs after a tentative step; leaving enemies get one swing (Attack with behind = 1) |
| 6100:0C6A | Flee | M | strings "Got Away" / "Escape is blocked"; compares movement with the fastest enemy |
| 6100:0D23 | CalcAttacks | H | attacks_left[1] := attacks (+A1h) or ITEMS.rof (≥2) for missiles; SAVES.md already cites it for +A1h/rof |
| 6100:0E52 | HalfRound | H | (v + Odd(CombatRound)) shr 1 |
| 6100:0E82 | FighterSweep | M | string "sweeps"; targets with level_main (+73h) = 0, limit cr+5 = fighter_lvl_eff |
| 6100:1085 | CanAttack | M | effect events 1 (target) and 0 (attacker), veto flag g_681E |
| 6100:116A | TurnUndead | H | strings "turns undead...", "is turned", "Is destroyed", "Nothing Happens..."; cleric level +96h; d20 vs table DS:0447 |
| 6100:1351 | FindTurnTarget | H | lowest +76h (1..12) among unturned enemies; only caller TurnUndead |
| 6100:1406 | MeleeAttack | H | swing loop with AttackRoll (AttackRoll), RollDamage, ShowAttackResult; helpless → "slays helpless" |
| 6100:17F6 | FaceAttacker | M | defender cr+0Fh += 1, cr+12h += angle(attacker vs facing) |
| 6100:1884 | Attack | M | turns icons, missile animation, SelectedChar := attacker, MeleeAttack, ammo count/LoseItem/drop to TreasureItems |
| 6100:1B1E | RangePenalty | M | (ITEMS.range − 1) div 3 bands, AC +2 / +3 |
| 6100:1BF8 | FindHealTarget | M | lowest-hp wounded friendly combatant in the 3×3 block or a body; used for spell 3 auto-targeting |
| 6100:1E16 | ChooseSpellTarget | M | player: SelectTarget with SpellRange (SpellRange); AI: AutoTarget; writes SpellX/SpellY |
| 6100:20C3 | CollectSpellTargets | M | fills g_6C95[]/g_6C94 per spell target code DS:3200; "Already been targeted"; installed in g_6B84 by ov08 |
| 6100:2414 | BeginCast | M | "Camp Only Spell", "Begins Casting"; castSpell := spell, initiative −= casting time div 3 |
| 6100:2574 | CanBackstab | H | thief level, armour none/leather (32h), weapon none/7/8/23h..25h, behind an engaged target |
| 6100:263D | DirectionTo | H | first dir with InFrontArc true |
| 6100:26B0 | MissileAnim | M | per item type sprite frames + 00BA:1A29 flight + launch/impact sounds |
| 6100:2879 | CalcEnemyHpPct | M | Σhp(active side 1)·20 div Σhp_max ·5 → g_6E2F; called each round by ov08 |
| 6100:2908 | MaxEnemyMove | M | max CalcMove/2 of active enemies; used by Flee |
| 6100:2998 | ConfirmAttackAlly | M | string "Attack Ally: " + Yes/No; NPCs (+84h bit 7) turn to side 1 |
| 6100:2AA0 | TargetMenu | M | strings "Range = ", "Next Prev Manual ", "Target ", "Center Exit", "Aim:" |
| 6100:2C3D | ConfirmTarget | M | own-side check, FighterSweep or Attack with ammo |
| 6100:2DFA | ManualAim | M | "(Use Cursor keys) ", scan-code direction keys, line of sight, Target/Center/Exit |
| 6100:32E6 | CombatBuildTargetList | M | nested in 3558: BuildTargetList range 7Fh copied into the parent's list |
| 6100:3389 | NextTarget | M | nested in 3558: cyclic step through the list, cursor animation |
| 6100:3558 | SelectTarget | M | the N/P/M/T/C/E loop around TargetMenu; external caller ov08 combat command |
| 6100:37E4 | AutoTarget | M | random enemy within range, CanAttack filter, keeps a valid current target; callers = ov09 monster AI |
| 6100:39D2 | EffRake | M | effect-handler table slot 49h (InstallEffectHandlers stores 0068:008E at DS:694C = 6828h + 49h·4); "Rakes..." 2×2d4 when both claws hit |
| 6100:3A86 | EffHold | L | handler slot 4Ah (DS:6950); victim index in effect +3, removes 3Ah/4Ah, 1 swing 3d4 from behind; creature/ability name unknown |
| 6100:3B93 | GodsIntervene | H | ParamStr(1) = 'STING' + "The Gods intervene!" kills side 1 |
| 6100:3C6D | ov13_init | H | unit init (entry 0), empty |

## (b) Globals named here (evidence) — names already given by the ov24/ov09 COMBAT parts are reused and marked

| DS | name | conf | evidence |
|---|---|---|---|
| 0447 | TurnUndeadTable | H | only reader TurnUndead: `[DI+0447h]`, DI = type·10 + column; values are the AD&D turning table (10/7/4/T/T/D… for type 1) |
| 286C | HelplessEffectIds | M | 4 effect ids (33h, 34h, 35h, 1Fh; image bytes) tested by IsHelpless 00BA:0B73 and compared with a spell's effect id in ChooseSpellTarget (asm base `[DI+286Bh]`, k = 1..4) |
| 6818 | DamageAmount (ov24 part name, reused; not in ov13_names.json) | M | RollDamage writes the swing's damage, ShowAttackResult/ApplyDamage get it; also used by ov12 handlers and DamageCharacter (damage of the current hit) |
| 681A | StatValue | M | value passed through the effect hooks (event 12h): half-attacks (StartCombatRound, CalcAttacks) or movement ×2 (CalcMove) |
| 681D | StatKind | M | 0 while StatValue holds attacks, 1 while it holds movement (CalcMove); read by EffHeld |
| 681E | AttackBlocked | M | cleared by CanAttack, set by effect handlers (ov12) to veto an attack |
| 6820 | SpellArea | M | 1 when CollectSpellTargets used an area scan; read by EffMirrorImage, set by ov22 |
| 6823 | SlotHits (element 1 of [1..2]; 6824 = slot 2) | M | MeleeAttack `inc [DI+6822h]` per hit of slot k; EffRake tests `g_6823 = 2`. Note: `g_6822` itself is the last d20 to-hit roll (AttackRoll writes it) — not part of this array |
| 6E2D | SlotSwings (element 1; 6E2E = slot 2) | M | MeleeAttack `inc [DI+6E2Ch]` per swing; Attack subtracts g_6E2D from the missile stack |
| 6B84 | SpellTargetProc | M | far procedure variable: CombatMain stores 0068:0066 (= stub_ov13_e14 → CollectSpellTargets); ov22 calls `CALLF [6B84h]` |
| 6C94 | SpellTargetCount | M | count written by CollectSpellTargets, read by ov22 spell code (GLOBALS: g_6C91_3) |
| 6C95 | SpellTargets (element 1, far ptrs at 6C91h + 4i) | M | CollectSpellTargets fills it; ov22 reads it |
| 6DB9 / 6DBA | SpellX / SpellY | M | map x/y of the chosen spell target point (ChooseSpellTarget, CollectSpellTargets); read by ov22 |
| 6DE2 | AllyAttacked | M | only writer ConfirmAttackAlly (:= 1 when the player attacks a friendly combatant); reader unknown (no static reader) |
| 6DE3 | CombatRound | M | StartCombat := 0 at combat start, ov08 4800:0891 `inc` once per round (after AdvanceClock(1,1)); HalfRound uses its parity |
| 6DE4 | foe_List (ov09 part name keyed at the asm base 6DE4h, element i = 6DE4h+i; reused, not in ov13_names.json) | M | filled by 00BA:2433 with the combatant indices of the enemies in range; read by ov13 and ov09 |
| 6E2F | enemy_HpPercent (ov09 part name, reused; not in ov13_names.json) | M | CalcEnemyHpPct; read by ov09 4D00:11B0 (morale) |
| 6715 | BodyCount | M | count of the bodies list (RemoveCombatant increments it when a combatant dies); FindHealTarget/ManualAim loop 1..g_6715 |
| 66DD | BodyList (element 1, 7-byte records at 66D6h + 7k) | M | RemoveCombatant stores char ptr, x, y, old ground; ov13 matches x/y and reads the char |

Fields proposed for other specs (not globals): `TChar +76h` = **undead type** (1..12, 0 = not undead) — TurnUndead/FindTurnTarget (H for the use; SAVES.md currently "ai_mode L"); `TChar +A2h` = half-attacks of attack slot 2 (StartCombatRound → attacks_left[2]) (H for the use; SAVES.md "unk_A2"); `TChar +10Fh` (`controlled`) suppresses the "Attack Ally" question and selects FocusSquare mode 3 when stepping (M); the combat-record fields listed in the pas.md conventions (`cr+0` … `cr+12h`).

## (c) Unknowns (explicit)
- `cr+1` and `cr+2` (both set to 1 at round start; `cr+1` cleared by a damaging hit): meaning unknown.
- ECL word `6B00h+372h` = ECL address 6E72h, added to the party's movement in CalcMove: meaning unknown (not in ECL_VM.md §3).
- ECL word 6E33h set to 1 by ConfirmAttackAlly (presumably read by scripts): meaning beyond "own side attacked" unknown.
- `AllyAttacked{g_6DE2}`: no static reader found.
- `g_2744[ground*4] = FFh` blocks manual targeting (terrain table of the VIEW/ov31 lane; field meaning L).
- `g_6716^[5]`, `g_6716^[6]` (map record flags set by ManualAim / AutoTarget / 00BA:255B; consumed by BuildTargetList/ov31): exact meaning unknown.
- Missile frame selection parameters of 00BA:1892 (flip/mirror flags) and item types 49h, 55h, 56h in MissileAnim (49h/55h/56h are not base weapon words; which item types they are: ITEMS lane).
- EffHold (4Ah) / effect 3Ah: which monster ability (hug/constrict/bite-and-hold) — MONSTERS/ov12 lanes.
- Spell table bytes +0Eh (needsTarget) and +0Fh (radius) and +0Ah (effect id) are named from this unit's use only (M); the MAGIC lane owns the spell table spec.
- TurnUndead with undead type 11 or 12 (accepted by FindTurnTarget, `< 13`) would read bytes past the table (DS:04BD..04CF = string data); whether any monster record has type ≥ 11 is a MONSTERS question.
- TargetDistance "TargetDistance" returns the scan record byte `>> 1`; its unit (squares) is M.

## (d) Cross-area questions / findings for other lanes
1. **BUG (H, ShowAttackResult 6100:0525):** "lost a spell" calls 00BA:148B, which clears the spell id in `SelectedChar^.mem_spell[]`; during an attack SelectedChar is the **attacker** (Attack 6100:19B9), so the attacker loses a memorised copy of the target's spell (if it has one), the target loses only its cast in progress (`cr+0 := 0`). ENGINE/MAGIC lanes: confirm 00BA:148B has no other context.
2. **BUG (H, RollDamage 6100:01D2):** the "damage < 0 → 0" clamp is compiled as an unsigned byte compare (`CMP [6818h],0; JNC`) and never fires: a negative dice+bonus total becomes 256+total damage (only possible with negative `dmg_bonus`).
3. **Quirk (H, CollectSpellTargets 6100:2182):** for target code 0Fh without a combatant on the chosen square the area radius is `(code and 0Fh) shr 4` = 0 (only the square itself).
4. **Quirk (H, Attack 6100:195A):** `readied[0]^.type = 2Fh` is tested without a nil check (reads 0000:002E when no weapon is readied).
5. DirectionTo (6100:267F) loops forever if a combatant lies outside the 50×25 map (InFrontArc returns false for every direction).
6. FighterSweep: `pos` is uninitialised if the chosen target is not in foe_List (cannot happen when TargetDistance = 1 is consistent with CollectOppositeSideTargets(…, 1); M).
7. SelectTarget: after a key other than N/P/M/T/C the cursor step `move` keeps its previous value (uninitialised before the first N/P/M/T/C).
8. AttackRoll (AttackRoll) adds a per-side bonus from ECL words 6B00h+6E0h/6E2h (ECL 6E70h side 1 / 6E71h side 0): COMBAT ov24 part should name them.
9. AttacksOfOpportunity and EffHold call Attack with `behind = 1`: the defender does not turn, MeleeAttack uses `ac_rear` (+112h) and prints "(from behind) ".
10. Effect-handler events used by this unit (CallEffectHooks): 0 attacker may attack?, 1 target may be attacked?, 2/3 after a hit with slot 1/2, 4 attacker damage, 5 target damage, 0Bh target before AC, 0Dh target went down, 12h stat recalculation (StatKind 0 = attacks, 1 = movement). ov12/ov24 parts should list which effect ids react to which event.
11. The turning table needs a check against MONSTERS data for the `+76h` values actually used (skeleton = 1, zombie = 2, … expected).
12. CollectSpellTargets is reached only through `SpellTargetProc{g_6B84}`; ov22 also stores another procedure there (8E00:341C) — MAGIC lane: name it.

## Self-check

Method: 80 of the 789 address-annotated pseudocode lines (10.1 %) drawn with Python `random.seed(1313); random.sample(range(789), 80)`; each line's `{ 6100:xxxx }` instruction and the following 6 instructions of `decode/listings/ov13.lst` were re-read (script output kept in the scratchpad, not in the repo) and compared with the statement (operands, BP offsets, constants, comparison signedness, branch sense, Pascal argument order).

Result: 80/80 recorded as match at first writing; **corrected by the normalisation pass to 78/80**: 6100:016F and 6100:05F1 had the arguments of CallEffectHooks (CallEffectHooks) reversed (now fixed; rows below show the fixed text). Fixes made during writing (before the sample, from the asm re-reads): parameter order of ShowAttackResult (`dmgApplied` [BP+0Ah] vs `dmgShown` [BP+8]); SpellRange takes only the spell (RETF 2), so `SelectedChar` pushed before it is SelectTarget's/AutoTarget's first argument; the arrays SlotHits/SlotSwings/SpellTargets/BodyList are written with their element-1 address (foe_List keeps the ov09 base-6DE4h key) (g_6822 is the d20 roll, not slot 0); turning-table column 10 comes from the next 10-byte row.

| addr | statement | result |
|---|---|---|
| 6100:00e1 | `if (r^.initiative < 0) or (r^.initiative > 20) then r^.initiative := 0;` | match |
| 6100:016f | `CallEffectHooks($12, c);` | match |
| 6100:01de | `if CanBackstab(att, tgt) then` | match |
| 6100:03fa | `if dmgShown = 1 then s := s + ' point '` | match |
| 6100:04df | `if dmgApplied > 0 then begin` | match |
| 6100:05f1 | `CallEffectHooks($0D, tgt);` | match |
| 6100:06a3 | `FocusSquare(CombatantCol(c), CombatantRow(c), 2, 8);` | match |
| 6100:07a2 | `ny := oy + g_273F[dir];` | match |
| 6100:08f1 | `for i := 1 to n do L[i] := foe_List{g_6DE4}[i];` | match |
| 6100:0a20 | `if (L[i] > 0) and (c^.active <> 0) then begin` | match |
| 6100:0a62 | `if IsHelpless(e) then continue;` | match |
| 6100:0d6f | `rof := ITEMS[c^.readied[0]^.type].rof;` | match |
| 6100:0d9c | `StatValue{g_681A} := c^.attacks_left[1];` | match |
| 6100:0dc5 | `if missile and (ammo <> nil) then begin` | match |
| 6100:0dd3 | `k := 1;` | match |
| 6100:1043 | `att^.attacks_left[1] := 1;` | match |
| 6100:104c | `Attack(att, e, 0, nil, g_6E31);` | match |
| 6100:1195 | `MessageDelay;` | match |
| 6100:1244 | `if d20 >= Abs(v) then begin` | match |
| 6100:125b | `any := true;` | match |
| 6100:12e1 | `u^.active := 0;` | match |
| 6100:12f3 | `count := count - 1;` | match |
| 6100:13f1 | `FindTurnTarget := true;` | match |
| 6100:142d | `anyHit := false;` | match |
| 6100:143a | `cr(att)^.attacked := 1;` | match |
| 6100:147d | `cr(att)^.attackSlot := cr(att)^.attackSlot - 1;` | match |
| 6100:149f | `ShowAttackResult(att, tgt, 3, tgt^.hp + 5, 1, 1);` | match |
| 6100:1583 | `RecalcCharacter(tgt);` | match |
| 6100:1717 | `ShowAttackResult(att, tgt, kind, DamageAmount{g_6818}, DamageAmount{g_6818}, 1);` | match |
| 6100:179a | `done := 1;` | match |
| 6100:17d6 | `if done <> 0 then done := ClearCombatantActionFlags(att);` | match |
| 6100:17fc | `cr(def)^.timesAttacked := cr(def)^.timesAttacked + 1;` | match |
| 6100:19a6 | `savedSel := SelectedChar;` | match |
| 6100:1a5f | `copy^.readied := 0;` | match |
| 6100:1a67 | `LoseItem(att, missile);` | match |
| 6100:1a87 | `LoseItem(att, missile);` | match |
| 6100:1afa | `ShowCombatant(att, cr(att)^.facing, 0, 0);` | match |
| 6100:1c17 | `x := CombatantCol(c) + g_2736[d];` | match |
| 6100:1d13 | `minHp := t^.hp;` | match |
| 6100:1d7a | `and (BodyList{g_66DD}[k].x = x) and (BodyList{g_66DD}[k].y = y) then` | match |
| 6100:1e6b | `end else if SpellTab[spell].needsTarget = 0 then begin` | match |
| 6100:1ea9 | `tgt.x := CombatantCol(tgt.char);` | match |
| 6100:1ee0 | `while (tries > 0) and not found do begin` | match |
| 6100:1ff0 | `if SpellTab[spell].effect = HelplessEffectIds{g_286C}[k] then ok := false;` | match |
| 6100:215a | `SpellTargets{g_6C95}[1] := cr(SelectedChar)^.target;` | match |
| 6100:2216 | `end else if (code >= 8) and (code <= $0E) then begin` | match |
| 6100:2319 | `for j := 1 to n do` | match |
| 6100:235d | `n := n + 1;` | match |
| 6100:23e2 | `if n = 0 then ok := 0;` | match |
| 6100:2427 | `f := 1;  w := $FFFF;` | match |
| 6100:248b | `if auto = 0 then begin` | match |
| 6100:2496 | `FocusCombatant(caster, 3, 1);` | match |
| 6100:24bb | `ct := SpellTab[sp].castTime div 3;` | match |
| 6100:2503 | `done := 1;` | match |
| 6100:2550 | `cr(caster)^.initiative := cr(caster)^.initiative - ct` | match |
| 6100:2561 | `else cr(caster)^.initiative := 1;` | match |
| 6100:27a6 | `steps := 4;  pause := $32;` | match |
| 6100:27b8 | `BuildFourAnimationFrames(frame + 4);` | match |
| 6100:27dd | `CopyCombatAnimationFrame(frame + 7, 0, 0, 0);` | match |
| 6100:2889 | `p := PartyHead;` | match |
| 6100:291f | `while p <> nil do begin` | match |
| 6100:2a5b | `CountActiveSides;` | match |
| 6100:2b1f | `if showRange = 0 then menu := 'Target '` | match |
| 6100:2bb6 | `menu := 'Next Prev Manual ' + menu + 'Center Exit';` | match |
| 6100:2bf9 | `DrawCharacterSummary(t);` | match |
| 6100:2f94 | `if valid then` | match |
| 6100:3003 | `start := BodyList{g_66DD}[k].char;` | match |
| 6100:3025 | `if start <> nil then DrawCharacterSummary(start)` | match |
| 6100:308e | `if mode = 1 then` | match |
| 6100:30b6 | `else if WeaponIsRanged(att) then` | match |
| 6100:30fa | `valid := false;` | match |
| 6100:321f | `ok := 0;` | match |
| 6100:332f | `for i := 1 to n do` | match |
| 6100:34d7 | `if draw <> 0 then begin` | match |
| 6100:355f | `CopyCombatAnimationFrame($19, 0, 0, 0);` | match |
| 6100:35cb | `if (maxR = 0) or (maxR = $FF) then maxR := 1;` | match |
| 6100:3739 | `move := 0;` | match |
| 6100:39f9 | `cr(c)^.attackSlot := 2;` | match |
| 6100:3c2c | `p := p^.next;` | match |
| 6100:3c6d | `{ empty }` | match |

## Normalisation pass (verifier request, 2026-10-16)

- **Names replaced:** 50 distinct local aliases / FUN_ names of routines outside ov13 replaced by the published names (decode/names/*.json via the current ov13.lst comments, VIEW.pas.md, ENGINE.pas.md, combat_parts/ov24 + ov19, MAGIC alias CastSpell for CastSpell): 390 occurrences in ov13.pas.md / ov13_SCREENS.md / ov13_notes.md (e.g. ShowCharMsg → ShowCharacterMessage, EndTurn → ClearCombatantActionFlags, CollectEnemies → CollectOppositeSideTargets, ScanArea → BuildTargetList, ViewTo → FocusSquare, TurnIcon → ShowCombatant, EraseIcon → RestoreTerrain, RedrawCell → RedrawSquare, CX/CY → CombatantCol/CombatantRow, IsSideZero → IsSideZero, HorizontalMenu → HorizontalMenu, AskYesNo → AskYesNo, SpellList → SpellList). Unnamed callees keep address names: FUN_00ba_2e46, ov24_0FD2, FUN_0899_0104, SpellRange (= SpellRange, local alias, no published name). Own routine 6100:32E6 = CombatBuildTargetList (verifier rename; VIEW owns BuildTargetList = B600:0909).
- **Calls re-checked:** all 227 external call sites in ov13.lst (System runtime and ov13-internal calls excluded) compared push sequence ↔ pseudocode argument order ↔ published signature.
- **Argument-order fixes: 11 statements** — CallEffectHooks(event, c) at 6100:0055, 016F, 0212, 0220, 05F1, 0DAC, 10B5, 10F6, 158E, 1736 (event is pushed first; ov24 signature `CallEffectHooks(event [BP+0Ah]; c [BP+6])`), and RestoreTerrain(0, 0, idx) at 6100:080C. Conventions signatures corrected accordingly (CallEffectHooks, RestoreTerrain, BuildTargetList, FocusSquare, FocusCombatant parameter names). All other 216 call sites already matched (incl. FocusSquare, ShowCombatant, CellAt, TraceLine, HorizontalMenu, AskYesNo, SpellList, CastSpell, RemoveEffect, AnimateAlongPath, CopyCombatAnimationFrame, DrawWrappedText, ShowCharacterMessage).
