# ov09 (4D00) — notes: names, globals, unknowns, cross-area questions, self-check

Coverage: 15 / 15 functions of `functions.tsv` (14 routines + ov09_init); the four string blocks are listed at the end of ov09.pas.md.

## (a) Routines

| routine | name | conf | evidence |
|---|---|---|---|
| 4D00:000F | AiCombatTurn | H | Only callers: ov08 4800:02c1 (`if c.+10Fh <> 0`, i.e. computer-controlled) and 4800:0485 (menu key `Q` = Quick, after SetQuick 4800:122B); ov08 names TakeTurn/PlayerTurn/SetQuick from magic_names.json; body = morale, magic item, finishing a cast, turn undead, spell, weapon choice, then the move/attack loop; string "flees in panic" |
| 4D00:0203 | AiTryTurnUndead | H | tests `cb+11h = 0` (set by TurnUndead), cleric level `+96h > 0`, FindTurnTarget (enemy with `+76h > 0` and `cb+10h = 0`), then calls TurnUndead whose strings are "turns undead...", "is turned", "Is destroyed" |
| 4D00:0255 | AreaHitsFriend | M | nested procedure of 02EB (static link `PUSH BP` 4d00:03c4); scans combatants within `g_3209[spell]` of (x,y) and flags those with `side <> IsSideZero(SelectedChar)` = the caster's side |
| 4D00:02EB | AiSpellUseful | M | threshold test on spell-table byte +0Dh, special case spell 3 = "Cure Light Wounds" (name table DS:28E9+id*41) via FindHealTarget (adjacent wounded friend), enemy-in-range test with SpellRange SpellRange, area-friend test; used by both AI spell and AI item choice |
| 4D00:03E4 | AiTryUseMagicItem | M | walks `c.items`, uses item power byte +3Dh as a spell id (minus 17h above 38h), skips scrolls (IsScroll: slot 0Bh..0Dh) and items not readied, then UseItem ("uses an item") |
| 4D00:0545 | AiTryCastSpell | M | list = memorised spells `+17h..+2Bh`; gated by `cb+1`, NPC bit / Magic On, opponents active; BeginCast ("Begins Casting") |
| 4D00:0675 | AiCanStep | M | direction = pattern offset + base; ProbeMove square info; cost 2/3 × terrain cost against `cb+6`; effect exemptions for terrain 1Eh |
| 4D00:07F2 | AiMove | M | prints "Move/Attack, Move Left = "; one step via ShowCombatant / AttacksOfOpportunity / StepCombatant |
| 4D00:0B3C | AiMoveAttack | M | loop: move, find a target in weapon range / line of fire, sweep or attack (Attack); 20-iteration guard |
| 4D00:0F4F | AiEndTurn | M | ClearCombatantActionFlags (00ba:2637) or Guard (00ba:2686, "Guarding") |
| 4D00:0FC1 | CheckCombatHotkeys | M | KeyPressed / ReadGameKey; "Magic On"/"Magic Off" toggle, space = leave Quick mode, `2Dh` = STING debug |
| 4D00:10D7 | AiMoraleCheck | M | "is forced to flee", morale from `+84h`, HP percentages, outrun test, "Surrenders" |
| 4D00:128D | AiWeaponScore | M | scores an item from ITEMS dice/sides/bonus, plus, rof, hands; zero for alignment-locked / power 53h / `+36h` items |
| 4D00:13CA | AiReadyBestWeapon | M | best missile / melee / shield from the inventory, ReadyItem (ReadyItem "already using", "Your hands are full!"), RecalcCharacter |
| 4D00:1922 | ov09_init | H | empty init called by main via stub_ov09_e0 |

### (a2) Callees of other units — published name (or ovNN/FUN name if unpublished) and the behaviour relied on
| address | name in ov09.pas.md + behaviour | evidence |
|---|---|---|
| 00ba:2637 | ClearCombatantActionFlags(c): `cb+3 := 0; cb+0 := 0; cb+7 := 0; cb+6 := 0; Result := 1` | res_00BA.c, always returns 1 |
| 00ba:2686 | SetGuarding(c): ClearCombatantActionFlags; `cb+7 := 1`; ShowTimedBottomMessage('Guarding') | string 00BA:267D |
| 00ba:0b73 | IsHelpless(c): HasEffect for any of DS:286C..286F = 33h, 34h, 35h, 1Fh | image bytes `01 33 34 35 1f` at DS:286B |
| 00ba:2199 | HasEffect(c, id, var e) (SAVES.md §5, H) | |
| 00ba:23b7 | IsSideZero(c) := `c.+10Eh = 0` | 1 instruction body |
| 00ba:2433 | CollectOppositeSideTargets(c, range): BuildTargetList scan from c's square, keeps entries whose side = IsSideZero(c) (= opponents), copies their indexes to `foe_List[1..n]`, returns n | res_00BA.c |
| 00ba:255b | TargetDistance(c, t): scan with range FFh, returns the found entry's distance byte `shr 1` | res_00BA.c |
| 00ba:2e03 | WeaponIsRanged(c): readied weapon with ITEMS range ≥ 2 | |
| 00ba:2e46 | FUN_00ba_2e46(c): WeaponIsRanged and `(wflags2 and 14h) = 14h` | ITEMS.md: 14h on hand axe, club, hammer, spear |
| 00ba:2e8b | GetMissileAmmo(c, var ammo): thrown (bit 10h) = the weapon; launcher (bit 8): arrows `+F8h` (bit 1) / quarrels `+FCh` (bit 80h); True if ammo or wflags2 = 0Ah (sling) | |
| 00ba:16ec | ShowCharacterMessage(c, text, row, wait) | see SCREENS |
| 00ba:1693 | ShowTimedBottomMessage(text) | see SCREENS |
| 00ba:17e3 | ClearCharacterMessage: combat: clear cols 23..38 rows 10..21; else cols 1..38 rows 18..22 | |
| 00ba:1037 | `function ByteToStr(n: Byte): string` (Str via System.@StrLong) | |
| 00ba:0bb8 | RecalcCharacter (SAVES.md, H) | |
| 00ba:09e3 | DrawCharacterSummary(c) (strings "Hitpoints", "(Helpless)") | functions.tsv |
| 0709:0626 | DrawText(col, row, attr, s) | loop increments the column argument |
| 0899:0059 | ReadGameKey: ReadKey; Ctrl-S toggles sound; with STING Ctrl-D toggles `g_49F7`, Ctrl-C quits; a non-zero key flushes the type-ahead buffer | res_0899.lst |
| 0899:0104 | no-op (`JMP` to its own exit over a dead `while KeyPressed do ReadGameKey` body) | bytes 0899:010A `EB 12` |
| CalcMove | CalcMove(c): `+11Ch` (+ ECL var 6E72h for side 0), clamp 1..96, ×2, effect hook 12h; returns half-squares | |
| CanAttack | CanAttack(c, t): nil → False, self → True, else effect hooks 1/0 may veto (`g_681E`) | |
| FindTurnTarget | FindTurnTarget(c, var u): enemy (any range) with `cb+10h = 0`, `+76h > 0`, lowest `+76h` < 13 | |
| TurnUndead | TurnUndead(c) | strings |
| FaceAttacker | FaceAttacker(attacker, target): `target.cb+0Fh += 1`, accumulates a turn into `target.cb+12h` | |
| FindHealTarget | FindHealTarget(c, var f): adjacent same-side combatant with HP < max (or a Talisman bearer) | |
| DirectionTo | DirectionTo(from, to): first direction 0..7 accepted by ov30_e4 | |
| MaxEnemyMove | MaxEnemyMove(c): max over active opponents in the party list of `CalcMove shr 1` | |
| AutoTarget | AutoTarget(c, range, p2, forceNew): keeps/chooses `cb.target` among CollectOppositeSideTargets results (random, up to 20 tries, CanAttack), True if a target is set | |
| Flee | Flee(c): no opponent or faster than all → "Got Away" (RemoveFromCombat status 3); equal speed → 1d2; else "Escape is blocked"; returns ClearCombatantActionFlags | strings |
| CalcAttacks | CalcAttacks(c): `+113h := +A1h` or missile rof | SAVES.md |
| FighterSweep | FighterSweep(c, t) ("sweeps") | string |
| AttacksOfOpportunity | AttacksOfOpportunity(c, dir): opponents adjacent now but not after the step get a free attack (Attack) | |
| StepCombatant | StepCombatant(c, dir): `cb+6 -= 2/3` (or 0 if not enough), moves the icon one square | |
| Attack | Attack(c, t, free, ammo, var done) | |
| BeginCast | BeginCast(spell, aiFlag, var r): casting time `DS:3206[id*16] div 3`; 0 → cast now (CastSpell), else "Begins Casting", `cb+0 := spell`, `cb+3 -= time` | |
| GodsIntervene | GodsIntervene: ParamStr(1) = 'STING' → "The Gods intervene!", side-1 all Dead | strings |
| SpellRange | SpellRange(spell) | spell-table +02h/+03h × level |
| CastSpell | CastSpell(spell, a, b, var r) | strings "casts", "Spell Aborted" |
| IsScroll | IsScroll(it): ITEMS slot 0Bh..0Dh | |
| UseItem | UseItem(it, var r) ("uses an item") | |
| ReadyItem | ReadyItem(it) | strings |
| RemoveEffect | RemoveEffect(c, id, e) (e = nil: first effect of type id) | |
| ov24_1041 | ov24_1041(c): RemoveEffect(c, DS:0C24 = 4Ah), (c, DS:0C25 = 4Bh) | image bytes |
| CallEffectHooks | CallEffectHooks(event, c): event → effect id table (0→7Eh, 1→3Fh, …, 0Eh→53h, 0Fh→15h, 11h→01h, 12h→…), calls the handler if present | ov24.c |
| RemoveFromCombat | RemoveFromCombat(c, status, text) | ov24.c |
| StinkingCloudCheck | StinkingCloudCheck(c) ("starts to cough", "chokes and gags from nausea") | strings |
| ClearMenuLine | ClearMenuLine (VIEW name; 40 blanks at row 24) | VIEW.pas.md |
| BuildTargetList | BuildTargetList(col, row, range, dir, size, map) (VIEW name) → `tg_List`/`tg_Count` | VIEW.pas.md |
| TraceLine | TraceLine(x0, y0, var x1, var y1, var range, map) (VIEW name) | VIEW.pas.md |
| CombatantCol / 0C0F | CombatantCol(c) / CombatantRow(c) (VIEW names) | VIEW.pas.md |
| ProbeMove | ProbeMove(c, dir, var occupant, var tile) (VIEW name) | VIEW.pas.md |
| ShowCombatant | ShowCombatant(c, dir, pose, noDraw) (VIEW name): `cb+9 := dir`, redraws | VIEW.pas.md |
| FocusSquare | FocusSquare(col, row, margin, dir) (VIEW name): cursor on the square in `dir` | VIEW.pas.md |

## (b) Globals named (ov09_names.json)

| DS | name | conf | evidence |
|---|---|---|---|
| 02AE | ai_DirOffsets | M | `[DI+2AEh]`, DI = `cb+15h*5 + try` (4d00:06a7, 09ce); image rows (try 1..5): 1: 8 7 6 1 2 / 2: 8 1 2 7 6 / 3: 7 1 8 6 2 / 4: 1 7 8 2 6 / 5: 8 7 6 5 4 / 6: 8 1 2 3 4 (offsets added to the base direction, mod 8); row 0 = 0 0 0 0 0 |
| 443C | ai_LastStepDir | M | set to the chosen step direction (4d00:0a91), 8 at the start of AiMoveAttack; reverse step compare 4d00:09fe |
| 443D | ai_StuckCount | M | incremented when no step is possible or the step would reverse (4d00:0a0a); > 1 drops the target, > 2 ends the movement |
| 6E30 | MagicOn | H | **name already given by magic_names.json** (not repeated in ov09_names.json); ov09 evidence: toggled with "Magic On"/"Magic Off" (4d00:0ff4..102d), gates AI casting for PCs (4d00:05c7) |
| 6814 | side_ActiveCount (now published by engine_names.json; removed from ov09_names.json) | H | `CountActiveSides` zeroes 6814/6815 and counts active (`+10Dh`) combatants per `+10Eh` side; decremented on death in `ApplyDamage`; 2 bytes, index = side |
| 6E2F | enemy_HpPercent | M | written only by CalcEnemyHpPct: `(Σ hp of active side-1 × 20 div Σ hp_max of side 1) × 5` |
| 3207 | spell_AiValue | M | spell table `DS:31FA + id*16` byte +0Dh; AI casts only spells whose value ≥ the falling threshold 7..1 (4d00:0300) |
| 3208 | spell_NeedsTarget | M | byte +0Eh; 0 → spell useful without an enemy (4d00:031d); also read by ov13 ChooseSpellTarget |
| 3209 | spell_AreaSize | M | byte +0Fh; range argument of the area scan (4d00:0272), 0 = single target (4d00:036e) |
| 6DE4 | foe_List | M | `foe_List[1..n]` = combatant indexes of the opponents found by CollectOppositeSideTargets (00ba:2433 copies `tg_List[i].who`); read by ov09 and ov13 (FighterSweep/1351/37E4) |

Used with the names of the VIEW lane (view_names.json, not repeated here): `CombatTerrain` g_2744 (+0 = movement cost, compared with `cb+6` and multiplied by 2/3 per step at 4d00:0703/0732), `cb_Char` g_65B9, `cb_Col`/`cb_Row` g_5F27/g_5F28, `tg_List` g_6718, `tg_Count` g_671A, `cm_Map` g_6716.

Not named (seen in ov09): `g_443E` (only written 0, 4d00:0b4c); `g_6825` (morale value: `(+84h and 7Fh)*2`, then the enemy HP percent; effect hook 11h handlers EffBless/011D/0400 read/write it — L, left unnamed); `cm_Map^[6]` (non-zero disables line-of-sight blocking, set by Distance 00ba:255b and AutoTarget's second pass — L).

## (c) Unknowns
1. `cb+01` / `cb+02` exact meaning (named mayCast / mayUseItems, M): both set 1 at round start, cleared together by ov12 handlers — which conditions (silence? held?) is for the ov12 lane.
2. `cb+03` = initiative; values 13h (ov08 4800:025a) and 14h (CheckCombatHotkeys) are special; their meaning in ov08's round loop is for the ov08 owner.
3. Terrain 1Eh in AiCanStep and the four exempting effects 20h, 1Eh, 6Fh, 7Dh (likely flying/levitation/water-walking-type effects) — names unknown.
4. Effects 33h, 34h, 35h, 1Fh tested by IsHelpless (00ba:0b73) — names unknown (hold/sleep/paralysis type).
5. Item power byte values `+3Eh = 84h` (alignment-locked: `+3Dh and 0Fh` = alignment) and `+3Dh = 53h` (AI never uses as a weapon): meaning of 53h unknown.
6. ECL variables read: `ecl_Mem4900^` word index E5h (ECL address 49E5h, non-zero blocks AI item use) and `ecl_Mem6B00^` word index 2C6h (ECL address 6DC6h, morale modifier). Their ECL names are not in ECL_VM.md.
7. Key `32h`/`2Dh`: the code does not distinguish ASCII from a scan code after a 0 prefix; "Alt-M" is inferred from the "Magic On/Off" texts (M), `2Dh` = '-' or Alt-X (L).
8. Flee direction uses `party_Dir` (3D-map facing): why the party side adds 4 is a combat-map orientation question (ov31/ov13 owners).

## (d) Cross-area questions
1. **SAVES.md TChar +10Fh** is described as `controlled` (L, "1 for animated/controlled creatures"). ov08 calls the AI turn when `+10Fh <> 0`, the Quick command leads into it, and space clears `+10Fh` for every non-NPC, non-Animated party member: **+10Fh = computer-controlled ("Quick") flag** (H from ov08/ov09). Suggest renaming to `quick`/`ai_controlled`.
2. **SAVES.md TChar +76h** (`ai_mode`, L): TurnUndead indexes its table with `+76h*10 + level` (TurnUndead, `DS:0447`), FindTurnTarget picks the target with the lowest `+76h > 0`, AiWeaponScore prefers Holy Water vs `+76h > 0`: **+76h = undead turning class (0 = not undead)** (M-H). Animate Dead setting it to 2 fits (zombie class).
3. **SAVES.md item +36h** (`magic_flag`, M): AiReadyBestWeapon never un-readies a current weapon/shield with `+36h <> 0`, and AiWeaponScore scores such items 0. This fits a *cursed* flag (ReadyItem "It's Cursed") better than "magical" — for the item/ITEM owner.
4. **SAVES.md ITEMS j14 (`wflags2`)**: bits 3 (08h, launcher: bows, crossbows, sling, javelin) and 4 (10h, thrown: dart, hand axe, club, hammer, spear, javelin) are used here; 14h = thrown melee weapon; value 0Ah = sling (no ammo item). SAVES lists only bits 0, 1, 2, 7.
5. AiMoveAttack keeps a remembered target only if `tgt.side <> 0` (4d00:0c9c): monsters (side 1) never keep a party member as the line-of-fire target and use CollectOppositeSideTargets instead. Faithful, possibly an original quirk; ov08/ov13 owners may confirm.
6. ov07/ECL: none.

## Self-check
Sample: 32 of 302 statement addresses (10.6 %), drawn with Python `random.seed(909)`: 4d00:0022 0045 01b2 01b8 01ee 025f 02a1 048c 054f 0567 0599 05e3 07f9 08fa 0937 0977 0a0e 0a37 0b29 0c12 0f28 0f97 1001 1045 1099 1115 12c7 144e 15b9 1672 17f0 18de.
Each was re-read against ov09.lst (instruction at the address, operands, branch sense, signedness): **32/32 correct**.
Fixes made during the pass (before/while sampling): the data table at the end of ov09.pas.md first listed `07D4..07D5` as an unused word — it is the tail of `RETF 0Ch` (4d00:07d3); ranges corrected to 07D6/0FAE/10BA. Parameter order re-verified for every cross-unit call with ≥ 2 arguments (push order vs. callee `[BP+x]` use): 00ba:16ec, 0709:0626, AutoTarget, Attack, BeginCast, CastSpell, RemoveEffect, CallEffectHooks (event first), RemoveFromCombat, TraceLine, BuildTargetList, FocusSquare, ShowCombatant, ProbeMove.

## Normalisation pass
(coordinator request, after the listing re-export with engine/view/magic/ecl names)
1. **Callee names**: every local alias of a routine outside ov09 was replaced by its published name (engine_names.json: ClearCombatantActionFlags, SetGuarding, IsHelpless, IsSideZero, CollectOppositeSideTargets, TargetDistance, WeaponIsRanged, GetMissileAmmo, ShowCharacterMessage, ShowTimedBottomMessage, ClearCharacterMessage, ByteToStr, DrawCharacterSummary, RecalcCharacter, DrawText, ReadGameKey, HasEffect; view_names.json: BuildTargetList, TraceLine, CombatantCol/Row, ProbeMove, ShowCombatant, FocusSquare, ClearMenuLine; magic_names.json: MagicOn, TakeTurn, PlayerTurn, SetQuick). Routines with no published name were reverted from local aliases to `ovNN_XXXX`/`FUN_` names (behaviour kept in comments and §a2): CalcMove 0712 08B2 0C6A 0D23 0E82 1085 116A 1351 17F6 1884 1BF8 2414 263D 2908 37E4 3B93, ReadyItem 1A8A, SpellRange 0C20 323D, RemoveEffect 02FA 0AE7 0F06 1041, FUN_00ba_2e46, FUN_0899_0104. **Counts**: 22 distinct local aliases → published names, 27 distinct aliases → ovNN/FUN names; about 250 textual replacements in ov09.pas.md / ov09_SCREENS.md / ov09_notes.md (script output of the pass). Global name `quick_MagicOn` dropped for magic_names' `MagicOn`; `side_ActiveCount` (identical) now owned by engine_names.json.
2. **Argument order**: all 107 far-call sites (55 distinct callees, Roll and ov13/ov24 included) in ov09 re-checked push-by-push against the callee's `[BP+x]` use and, where published, its signature (ENGINE.pas.md / VIEW.pas.md): **0 order errors** (the pseudocode was written in push order from the start; the earlier 14 multi-argument checks of the Self-check are included). Signatures confirmed equal: ShowCharacterMessage(c, s, row, wait), CollectOppositeSideTargets(c, range), TargetDistance(c, target), GetMissileAmmo(c, var ammo), HasEffect(c, id, var e), DrawText(col, row, colour, s), BuildTargetList(col, row, range, dir, size, map), TraceLine(x0, y0, var x1, var y1, var range, map), ProbeMove(c, dir, var occupant, var tile), ShowCombatant(c, dir, pose, noDraw), FocusSquare(col, row, margin, dir).
3. Coordinator correction kept: BuildTargetList = VIEW's BuildTargetList (ov13's 6100:32E6 is CombatBuildTargetList, not used by ov09).

4. **Sibling names (not yet published)**: the por-mod-combat siblings' `ov13_names.json` / `ov19_names.json` / `ov24_names.json` (combat_parts, unmerged) name routines that ov09/ov07 still write as `ovNN_XXXX`. For the merge, rename: CalcMove CalcMove, StepCombatant StepCombatant, AttacksOfOpportunity AttacksOfOpportunity, Flee Flee, CalcAttacks CalcAttacks, FighterSweep FighterSweep, CanAttack CanAttack, TurnUndead TurnUndead, FindTurnTarget FindTurnTarget, FaceAttacker FaceAttacker, Attack Attack, FindHealTarget FindHealTarget, BeginCast BeginCast, DirectionTo DirectionTo, MaxEnemyMove MaxEnemyMove, AutoTarget AutoTarget, GodsIntervene GodsIntervene, ReadyItem ReadyItem, UseItem UseItem, CycleSelectedChar CycleSelectedChar, RemoveEffect RemoveEffect, CallEffectHooks CallEffectHooks, StinkingCloudCheck StinkingCloudCheck, RemoveFromCombat RemoveFromCombat (ov24_1041, ov22_* unnamed). Behaviour stated in §a2 agrees with those names.
