# ov24 notes (lane por-mod-combat)

## (a) Routines

| routine | name | conf | evidence |
|---|---|---|---|
| 9800:0000 | CallEffectHandler | H | `CALLF [type*4+6828h]` with (c, e, mode); table filled by InstallEffectHandlers with handler stubs (all RETF 0Ah) |
| 9800:0026 | RemoveEffect | H | walks `+7Fh` list by `+5` links, compares `+0` type, FreeMem(9) |
| 9800:0160 | RunEffectIfActive | M | HasEffect + area rule for types {15h,2Dh,2Eh,31h} (set CS:0140) via BuildTargetList range list; calls handler mode 0 |
| 9800:02FA | CallEffectHooks | M | case on event 00..13h, each a fixed list of effect types passed to RunEffectIfActive (extracted mechanically, 0 unmatched instructions) |
| 9800:0AE7 | StinkingCloudCheck | M | ground type 1Eh from ProbeMove, immunity effects, SavingThrow(c,0,0), "starts to cough" 1 round / "chokes and gags from nausea" 1d4+1 rounds = AD&D Stinking Cloud |
| 9800:0C4F | AttackRollVsAC | M | d20 (20→100), hook 10h on target, `roll + toHit > target.ac (+111h)`; only caller ECL DAMAGE (ECL_VM.md op 2E) |
| 9800:0CB7 | AttackRoll | M | d20 (20→100), hooks 0Ah attacker / 10h target, `roll + attacker.thac0 (+110h) + side bonus >= targetAC`; callers melee MeleeAttack, spell attack ApplySpell |
| 9800:0D63 | SavingThrow | H | d20, 1 fails, 20 succeeds, + `+101h` + bonus, hook 0Ch, compare with `+6Dh + type` |
| 9800:0DE3 | Roll | H | por-ecl name; sum of count × (Random(sides)+1) |
| 9800:0E2E | RollDice | M | Roll + `g_681C := count` |
| 9800:0E52 | AddEffect | H | GetMem(9), append to `+7Fh`, fields +0/+1/+3/+4 (SAVES.md §5) |
| 9800:0F06 | RemoveFromCombat | M | message, `active := 0`, status := parameter, hp := 0 unless Running, icon removed; callers "Got Away", "Surrenders", "Turns gaseous and escapes" |
| 9800:0FD2 | (ov24_0FD2) | L | removes all effects 19h; L name "BreakInvisibility" (called when attacking) |
| 9800:100A | RemoveCombatEffects | M | removes the 16 effect types of DS:0C14..0C23; called when a combatant goes down / leaves combat |
| 9800:1041 | (ov24_1041) | L | removes effects 4Ah, 4Bh; one caller (ov09 AiMoraleCheck) |
| 9800:1081 | CureEffect | H | "is Cured" + RemoveEffect |
| 9800:10E4 | StrengthCode | M | 18/xx → xx+1, else str+100 |
| 9800:110D | DecodeStrength | M | inverse of StrengthCode on `e^.p3 and 7Fh` |
| 9800:115C | SetStrength | M | writes str +10h / str_exc +16h, RecalcCharacter, interacts with effects 0Ch/26h |
| 9800:1344 | DamageCharacter | H | "takes … points of damage", "from Fire/Cold/Electricity/Acid/Magic", ApplyDamage, "Goes Down", "is killed" |
| 9800:1656 | ApplyEffect | M | hook 09h veto via g_6817, "is Unaffected", replace/append effect, message |
| 9800:175D | HealCharacter | M | adds to hp +11Bh capped at hp_max +32h for status {Okay, Animated, Unconscious, Dying}; Dying → Unconscious |
| 9800:1869 | ReviveCombatant | M | status 0, active 1, hp := param; "stands up and grins"/"gets back up" |
| 9800:1932 | ov24_init | H | empty |

Counts: 24/24 routines covered; H 8, M 14, L 2 (0FD2, 1041 kept as ov24_XXXX).

## (b) Globals named

| DS | name | conf | evidence |
|---|---|---|---|
| 6816 | SaveRoll | H | `:= Roll(1,20)` + bonuses in SavingThrow, compared with the save target; read/written by ov12 save hooks |
| 6817 | EffectToApply | M | `:= type` before hook event 09h in ApplyEffect; 0 after the hooks = vetoed ("is Unaffected"); written by ov12 CancelDamageAndEffect/2915 |
| 6818 | DamageAmount | H | `:= dmg` before hook 06h, halved/zeroed by save, printed and passed to ApplyDamage (DamageCharacter); 55 refs in ov12/ov13 |
| 6819 | DamageType | H | bit values 1/2/4/10h/8 select "from Fire/Cold/Electricity/Acid/Magic" in DamageCharacter |
| 681C | LastDiceCount | M | `:= count` in RollDice; read by EffFireResistance/2A28/2D38 |
| 6822 | AttackRollValue | H | d20 of AttackRoll/AttackRollVsAC (20 → 100), hooks may lower it (negative = miss) |
| 682A | SaveType | M | `:= saveType` before hook 0Ch in SavingThrow; read by EffConSaveBonusPoison/268A/29F0/2E08 |
| 682C | EffectHandler | H | far-pointer table, entry t at 6828h+4t, written only by InstallEffectHandlers, called by CallEffectHandler |
| 0C13 | CombatEffectTypes | H | 16 effect ids (index 1..16) removed by RemoveCombatEffects |

Left as g_: `g_0C23` (1..2 = 4Ah, 4Bh), `tg_Count`/`g_671B` (combatant area list, owner VIEW ov30), `g_5F2A` (combat map records, VIEW ov31), `cm_Map` (far pointer passed to BuildTargetList), `game_Mode` (game mode, 5 = combat), `text_Row` (text cursor row), `ecl_Mem6B00^[$6E0]/[$6E2]` (side to-hit modifiers).

## (c) Unknowns
- Event meanings of CallEffectHooks except 06 (damage), 09 (new effect), 0A (attacker to-hit), 0C (save), 0D (went down), 10 (target of to-hit); the rest belong to the calling areas (ov08, ov09, ov10, ov12, ov13, ov22).
- Effect-type meanings: only behaviourally visible here (1Eh cough, 1Fh nausea, 19h removed on attack, 32h blocks healing, 4Eh handler on regaining consciousness, 0Ch/26h strength). A full effect-type table needs the ov12 handlers (PARTY/MAGIC lanes) — the type→handler map is in ov24.pas.md.
- Effect type 58h has no handler (null far pointer); not referenced by the hook lists.
- `p3` semantics are per effect type (strength code with bit 7 for 0Ch/26h; FFh in many AddEffect calls).
- `combatant^[0]` = spell being cast, `combatant^[1]` (cleared on damage) — meaning of [1] unknown (ov13 lane).
- ProbeMove out parameter `occupant` unused here.

## (d) Cross-area questions
- SAVES.md: `+101h` is named `ac_item_bonus` (Σ item +33h). SavingThrow adds it to the d20 save roll, so it is a general protection bonus (AC and saves, e.g. ring/cloak of protection). Suggest renaming to `prot_bonus` or noting the second use (H by 9800:0D8D).
- SAVES.md §5: effect +4 is the "call handler on removal" flag (RemoveEffect 9800:0086), +3 a per-type parameter.
- ENGINE: 00BA:148B removes a spell from **SelectedChar**'s memory; DamageCharacter calls it for the damaged character's pending spell → possible original bug when the victim is not SelectedChar.
- PARTY/MAGIC (ov12 owner): InstallEffectHandlers is the effect-handler table initialiser; EffNop is the no-op handler.
- ECL: `ecl_Mem6B00^` bytes 6E0h/6E2h are signed to-hit modifiers for monsters/party used by AttackRoll.
- VIEW (ov30/ov31): please confirm CombatantIndex (combatant index), 0BE7/0C0F/0C37 (map x, y, size), BuildTargetList (combatants within range), ProbeMove (ground type under icon).

## Self-check
Sample (22 of ~205 statements, re-read against ov24.lst): 9800:0003, 0086, 00ba, 0167, 019c, 0202, 0214, 026e, 0b13, 0bfc, 0c66, 0c86, 0d05, 0d31, 0d8d, 0dbd, 0ded, 0ee2/0eec/0ef6, 0f76, 1176, 11d4, 13e4, 14a8, 15b7, 1682, 16d0, 177f, 18d1.
Results (all ✓ unless noted):
- 0003: pushes [BP+0E],[BP+0C],[BP+0A],[BP+08],[BP+6] then `CALLF [DI+6828h]`, DI = [BP+10h]*4 → handler(c, e, mode) ✓.
- 0086: `CMP ES:[DI+4],0; JZ` skip → handler only when +4 ≠ 0; pushes `[BP+0A]` (the parameter type) ✓.
- 0214: pushes CombatantCol(m), CombatantRow(m), range, FFh, CombatantSize(m), cm_Map → BuildTargetList (RETF 0Eh = 5 words + far ptr) ✓ (note: CombatantSize takes only `c` (RETF 4); range and FFh pushed before it stay on the stack as BuildTargetList arguments).
- 026e: `[DI+6718h]`, DI = 3i → g_671B[(i-1)*3] vs CombatantIndex(c) ✓.
- 0bfc: `Roll(1,4)` pushes 1 then 4 → count 1, sides 4; `INC AX` → 1d4+1 as the word duration ✓.
- 0c66/0cd8: `CMP g_6822,1; JLE` exit ✓; `CMP 14h; JNZ`, `:= 64h` ✓.
- 0d05: side 0 → `[6E2h]`, else `[6E0h]` ✓.
- 0d8d: roll (XOR AH) + CBW(+101h) + CBW(bonus), stored as byte ✓. 0dbd: `CMP save[type], roll; JA` fail → success iff save ≤ roll ✓.
- 0ded: `CMP [BP+8],0; JBE` → count 0 returns 0 ✓.
- 0eec/0ef6: `[BP+6]` → +4, `[BP+8]` → +3 ✓ (Pascal order p3 before callOnRemove).
- 0f76: `CMP status,3; JZ` skip → hp := 0 unless Running ✓.
- 1176: `JC 118c` (newStr < curStr), `CMP newStr,12h; JNZ 11aa`, `CMP newExc,curExc; JNC 11aa` ✓.
- 13e4: `AND AL,0F7h` then 1/2/4/10h ✓; 14a8: `(g_6819 and 8) = g_6819` ✓.
- 15b7: set CS:131A = C0 01 00… → {6,7,8} ✓.
- 1682: `g_6817 = 0` → Unaffected; else `[BP+0A] <> 0 and [BP+0C] = 1` → Unaffected ✓.
- 16d0: `e.dur = 0` (JBE) → test `duration = 0`; else `duration > e.dur` (JA) → remove ✓; AddEffect always follows ✓.
- 177f: `hp >= hp_max` (JNC) → effect test; `hp < max` and flag ≠ 0 → heal ✓.
- 18d1: `CMP side,1; JNZ` → "gets back up" ✓.
Fixes made: routine count in the header (24, not 25).

## Normalisation pass
- Names replaced (published in decode/names/*.json + combat_parts): ENGINE `HasEffect`, `ClearCombatantActionFlags`, `ForgetMemorizedSpell`, `FlushViewDirtyLines`; VIEW `CombatantIndex/Col/Row/Size`, `ProbeMove`, `BuildTargetList`, `FocusCombatant`, `RestoreTerrain`, `RebuildOccupancy`, `PlaceCombatant`, `RemoveCombatant`; caller names `MeleeAttack`, `Attack`, `Flee`, `RollDamage`, `ShowAttackResult`, `StartCombatRound`, `CanAttack`, `EffRake`, `TakeTurn`, `CombatMenu`, `EndOfRound`, `MoveAttack`, `AiMove`, `AiMoveAttack`, `AiMoraleCheck`, `StartCombat`, `CureWounds`, `ReadyItem`; globals `game_Mode`, `text_Row`, `tg_Count`, `cm_Map`, `cb_Size`. Unpublished (kept): ov12_*, ov22_*, ov06/ov16/ov17/ov21 routines, FUN_5c00/7000/8400/8e00.
- Calls re-checked against the .lst push sequences and the published signatures: HasEffect, ShowCharacterMessage, ShowCombatMessageAnimation, ApplyDamage, ForgetMemorizedSpell, ByteToStr, RecalcCharacter, CountActiveSides, ClearCombatantActionFlags, MessageDelay, FlushViewDirtyLines, and all 11 VIEW calls.
- Arg-order fix: 9800:0F8A `RestoreTerrain(i, 0, 0)` → `RestoreTerrain(0, 0, i)` (pushes 0, 0, idx; who = [BP+6]). Also `g_5F2A[i*4]` → `cb_Size[i]`. All other calls already matched.
