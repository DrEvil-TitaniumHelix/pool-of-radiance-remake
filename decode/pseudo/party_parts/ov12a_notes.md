# ov12 part A notes (5C00:0000..1A18, lane por-mod-party)

## (a) Routines — 70/70 functions.tsv entries below 5C00:1A19 covered

Effect types per handler from the ov24 handler table (combat_parts/ov24.pas.md, read from InstallEffectHandlers, H); events from CallEffectHooks (ov24, H).

| routine | name | conf | type(s) / events | evidence |
|---|---|---|---|---|
| 5C00:0000 | CancelDamageAndEffect | M | helper | zeroes DamageAmount + EffectToApply when type = 0 or = EffectToApply (5c00:0003..0016); ApplyEffect's veto rule (ov24) |
| 5C00:001F | AddEffectUnlessCuring | M | helper | returns 0 if cure_InProgress, else AddEffect(c, type, duration, p3, 1) (5c00:0025..004a) |
| 5C00:0058 | ApplyFatalStatus | M | helper | message, status := param, active/hp := 0, RemoveCombatEffects, hook 0Dh, RemoveCombatant (5c00:006c..0102); callers pass 6 (Dead) / 8 (Gone) with "is killed", "Dies rots away" |
| 5C00:010D | EffBless | M | 01 / 0A, 11 | +1 AttackRollValue, +5 MoraleValue |
| 5C00:011D | EffCurse | M | 02 / 0A, 11 | −1 / −5 (min 0) |
| 5C00:013B | EffBonusVsUndead | M | 03 / 04, 0A | +2/+2 when target creature_type = 4 |
| 5C00:017F | EffStartsToTrain | L | 04 / – | string "starts to train"; adds 07h for A8C0h |
| 5C00:01C3 | EffFlameTongue | M | 06 / 04, 0A | +1/+2/+3 by creature type 0Ah / 9,0Ch / 4, DamageType := 9 (AD&D Flame Tongue pattern) |
| 5C00:0233 | EffHardier | M | 07 / – | string "is hardier"; CON+1, HP rebuild, CON 20 → effect 3Eh |
| 5C00:0377 | EffProtFromEvil | M | 08, 2D / 0B, 0C | opponent alignment 2/5/8 → save +2, roll −2 |
| 5C00:03AC | EffProtFromGood | M | 09, 2E / 0B, 0C | alignment 0/3/6 |
| 5C00:03E1 | EffResistCold | M | 0A / 06, 0C | DamageType bit 2 → half damage, save +3 |
| 5C00:0400 | EffCharm | M | 0B / 0F, 11, 13 (+mode 1) | side switch via p3 bits 7/6/5, controlled := 1, MoraleValue := 100 |
| 5C00:04BA | EffStrengthEnd | M | 0C, 26 / – | DecodeStrength/StrengthCode (ov24 e16/e17) restore + re-holder |
| 5C00:05D6 | EffSetCharisma | L | 0E / – | cha := p3 |
| 5C00:05EB | EffHpLossTick | L | 0F / – | re-add every 0Ah, DamageCharacter(c,1,0,0) while hp > 1 |
| 5C00:0647 | EffNop10 | H | 10 | empty |
| 5C00:064E | EffShield | M | 11 / 06, 0B, 0C | AC ≥ 39h (AC 3), save +1, spell 0Fh → no damage |
| 5C00:0679 | EffGnomeAttackBonus | M | 12 / 0A | table DS:0342..0372 KOBOLD..GOBLIN LEADER (image bytes) |
| 5C00:06E4 | EffResistFire | M | 14 / 06, 0C | DamageType bit 0 |
| 5C00:070F | EffSilence | M | 15 (area) / 0F | string "is silenced", clears cr+1/cr+2 |
| 5C00:0775 | EffSlowPoisonEnd | M | 16 / – | HasEffect 37h → "dies from poison"; removes 0Fh in cure mode |
| 5C00:07E0 | EffSpiritualHammer | H | 17 / 13 (+mode 1) | creates item type 14h words "Hammer" (14h) "Spiritual" (F3h), plus 1 (ItemWordTable DS:10A7+w*21) |
| 5C00:0918 | EffInvisible | M | 19 / 01, 10 | AttackBlocked unless attacker has 18h; −4 |
| 5C00:0947 | EffDwarfAttackBonus | M | 1A / 0A | table DS:0382..03F2 ORC..MACE |
| 5C00:09C0 | EffMirrorImage | M | 1C / 05, 06 | string "lost an image", p3 = image count, Roll(1, p3+1) |
| 5C00:0A3D | EffEnfeebled | M | 1D / 04 | damage − damage div 4 |
| 5C00:0A65 | EffCoughing | M | 1E / 0B, 0F | string "is coughing"; AC −2 |
| 5C00:0B1B | EffAnimatedEnd | M | 20 / – | "collapses"; undoes the Animate Dead fields (ai_mode, creature_type, npc_morale B3h) |
| 5C00:0BAC | EffPenaltyAll4 | L | 21 / 0A, 0B, 0C | −4 roll, AC, save |
| 5C00:0BCF | EffWeaknessAndDrain | L | 22 / – | CallEffectHandler 2Bh and 2Ch |
| 5C00:0C06 | EffPlusOne | L | 23 (no hook) | +1/+1; called by EffPrayer |
| 5C00:0C15 | EffPenalty4 | L | 24 / 0A, 0C | −4/−4 |
| 5C00:0C26 | EffUntouchableBeforeTurn | L | 25 / 01, 10 | initiative > 0 → AttackBlocked |
| 5C00:0C4B | EffHaste | H | 27 / 12 | "ages" + StatValue shl 1 |
| 5C00:0CC3 | EffCloudRemoved | M | 28 / – | "The air clears a little..."; sc_List node unlink/free 13h |
| 5C00:0FAC | AvoidRangedAttack | M | helper | "Avoids it" when distance > 1 and Roll(1,100) ≤ chance |
| 5C00:101D | CurrentAttackItem | M | helper | GetMissileAmmo or readied[0] |
| 5C00:1086 | EffMagicWeaponOnly | L | 29 / 05 | plus = 0 → AvoidRangedAttack(c, 100) |
| 5C00:10C1 | EffSlow | H | 2A / 12 | StatValue shr 1 |
| 5C00:10DE | EffWeakness | M | 2B / – | "is weakened", STR −1 per 3Ch |
| 5C00:1168 | EffHpDrainTick | L | 2C / – | 1 dmg per 0Ah |
| 5C00:11F9 | EffDwarfGiantDefence | M | 2F / 10 | table DS:0402.. OGRE..HILL GIANT, −4 |
| 5C00:1276 | EffGnomeGiantDefence | M | 30 / 10 | literals BUGBEAR, GNOLL, −4 |
| 5C00:12B2 | EffPrayer | M | 31 (area, range 6) / 0A, 0C | own side +1/+1, other −1/−1 |
| 5C00:12FB | EffSlowHeal | L | 32 / – | heal 1 per 3840h |
| 5C00:133F | EffHelpless | M | 1F, 33, 34, 35 / 07 | ClearCombatantActionFlags |
| 5C00:1355 | EffNop36 | H | 36 | empty |
| 5C00:135C | EffNop37 | H | 37 | empty (37h = poisoned marker) |
| 5C00:1363 | EffGrantInvisible | L | 38 / 08, 13 | AddEffect(c, 19h, 1, 0Ch, 0) |
| 5C00:1399 | EffMummyRot | M | 39 / – | "Rots...", "Dies rots away" (status 8) |
| 5C00:1452 | EffHeld | M | 3A / 12 | moveLeft := 0; movement StatValue := 0 |
| 5C00:1472 | EffBecome62 | L | 3B / – | AddEffect 62h |
| 5C00:1490 | EffFireResistance | M | 3D / 06, 0C | −2 per die (min 1/die), +4 save, non-magic fire cancelled |
| 5C00:14EB | EffRegenerate | M | 3E / – | heal 1 per 3Ch |
| 5C00:1545 | PoisonOpponent | M | helper | "is Poisoned", "is killed", effect 37h |
| 5C00:15EB | ParalyzeOpponent | M | helper | "is Paralyzed", effect 34h |
| 5C00:165D | EffPoisonHit | M | 40 / 03 | PoisonOpponent(c, 0) |
| 5C00:1671 | EffPoisonHitP4 | M | 41 / 03 | (c, 4) |
| 5C00:1685 | EffPoisonHitP2 | M | 42 / 03 | (c, 2) |
| 5C00:1699 | EffParalyzeHit2d8 | M | 43 / 03 | ParalyzeOpponent(c, Roll(2,8), 0) |
| 5C00:16BB | EffGhoulParalysis | M | 44 / 02, 03 | race ≠ 2 (elf) → ParalyzeOpponent(c, 3Fh, 0) |
| 5C00:16E6 | EffParalyzeHitLong | M | 45 / 03 | (c, Roll(1,9)+10, −2) |
| 5C00:170B | EffPoisonHitM2 | M | 46 / 03 | (c, −2) |
| 5C00:171F | EffUnattackable | L | 47 / 01, 10 | AttackBlocked, −4 |
| 5C00:1730 | EffGrantInvisible95 | L | 48 / 08, 13 | 95 % invisibility 19h |
| 5C00:176F | EffBloodDrain | M | 4B / 0D, 0F (+mode 1) | "Sucks some Blood", RollDice(1,4), duration shr 4 budget |
| 5C00:18B5 | EffStirgeAttach | M | 4C / 02 | adds 4Bh (0CFh, CombatantIndex) + 3Ah |
| 5C00:1935 | EffGrab | M | 4D / 02 | STR < 19 → 4Ah + 3Ah, "is held fast" |
| 5C00:19D9 | EffReviveCheck | L | 4E / – | ReviveCombatant(c, hp) else re-add duration 1 |

Counts: 70 routines; H 6 (EffNop10, EffNop36, EffNop37, EffSpiritualHammer, EffHaste, EffSlow), M 48, L 16.

## (b) Globals named (globals request material)

| DS | name | conf | evidence |
|---|---|---|---|
| 681B | sp_Current | M | only writer CastSpell (`:= spell id` 8E00:0EAF, `:= 0` 8E00:0EC1) around the spell-effect call; EffCharmGaze sets 0Ah; read by EffShield (= 0Fh), EffMirrorImage (≠ 0) and ~40 ov22 spell routines |
| 6825 | MoraleValue | M | ov09 AiMoraleCheck morale check computes it from npc_morale and HP % (ov09_notes); event-11h handlers EffBless +5, EffCurse −5, EffCharm := 100 |
| 6826 | HookOpponent | M | far ptr scratch of the effect handlers: `:= cr(c)^.target` (013B, 01C3, 0679, 0947, 11F9, 1545, 15EB, 18B5, 1935) or `cb_Char[p3]` (176F); never read outside ov12/ov13_3A86 (GLOBALS.md) |
| 6DBB | sc_List | M | head of the 13h-byte cloud nodes (owner, next +4, ground[1..4] +8.., active[1..4] +0Ch.., x +10h, y +11h, id +12h): EffCloudRemoved walks/unlinks/frees it; ov08 4800:002D frees the list at combat end (MAGIC.pas.md "effect-area list") |
| 290D | CloudSquareDir | M | `[k]`, k = 1..4 = 08 02 03 04 (image bytes DS:290E..2911), used as direction index into g_2736/g_273F for the 2×2 cloud squares |
| 0332 | GnomeFoeNames | M | string[15] table, entry i at 0332h+16i (asm base); entries 1..4 used by EffGnomeAttackBonus: KOBOLD, KOBOLD LEADER, GOBLIN, GOBLIN LEADER |
| 0372 | DwarfFoeNames | M | entry i at 0372h+16i, i = 1..8: ORC, ORC LEADER, GOBLIN, GOBLIN LEADER, HOBGOBLIN, HOBGOBLIN CHIEF, GAGOOL, MACE (EffDwarfAttackBonus) |
| 03F2 | GiantFoeNames | M | entry i at 03F2h+16i, i = 1..8: OGRE, OGRE LEADER, TROLL, FIRE GIANT, HILL GIANT + 3 non-name entries (EffDwarfGiantDefence) |

Keys are the asm base offsets (the tables overlap: GnomeFoeNames[4] = DS:0372 = DwarfFoeNames base). Existing names reused: SaveRoll, EffectToApply, DamageAmount, DamageType, StatValue, StatKind, LastDiceCount, AttackBlocked, SpellArea, AttackRollValue, SlotHits, cure_InProgress, SelectedChar, game_Mode, cm_Map, cb_Char, BodyList (g_66DD), BodyCount (g_6715).

## (c) Unknowns
- Where effects 04h (→ "starts to train"), 0Eh, 0Fh, 21h..25h, 29h, 2Ch, 32h, 38h, 3Bh, 47h, 48h, 4Eh are created (ov22 spells, monster MONnSPC records, items' power bytes, ECL) — not in part A; their AD&D identity is L where marked.
- Time unit of effect durations (minutes vs rounds; A8C0h = 43 200, 3840h = 14 400, 3Ch = 60) — owned by the clock/effect-expiry code (ov24/ov20 AdvanceClock).
- `power[2..3]` = 17h, 89h of the created Spiritual Hammer.
- Creature types 9, 0Ah, 0Ch (EffFlameTongue tiers); `p3` meaning in effects created with 0Ch / FFh.
- Why EffMirrorImage only absorbs spells (sp_Current ≠ 0) — recorded as a quirk; melee may be handled elsewhere (not seen in ov12 part A).
- The DwarfFoeNames entries GAGOOL and MACE (data as in the image; whether intended).
- cr(c)+1 / +2 names mayCast / mayUseItems kept from ov09 (M); EffSilence/EffCoughing print only when +2 ≠ 0.

## (d) Self-check (36 statements ≈ 11 % of 328 anchors, re-read against ov12.lst)

Call push orders (first push = first argument):
1. 5c00:004a AddEffect(c, type, duration, p3, 1): pushes [0E][0C], [0A], [06] word, [08], 1 ✓ (→ signature AddEffectUnlessCuring(c, type [0A], p3 [8], duration [6])).
2. 5c00:0604 AddEffectUnlessCuring(c, $0F, e^.p3, 10): c, 0Fh, p3, 0Ah ✓.
3. 5c00:062a DamageCharacter(c, 1, 0, false): c, 1, 0, 0 ✓.
4. 5c00:07c2 RemoveEffect(c, $0F, nil): c, 0Fh, 0:0 ✓.
5. 5c00:0be5 CallEffectHandler($2B, c, e, mode): 2Bh, c, e, mode ✓.
6. 5c00:0fd0 TargetDistance(SelectedChar, c): SelectedChar first, then [0A][08] ✓.
7. 5c00:09d4 Roll(1, e^.p3 + 1): 1 then p3+1 ✓ (Roll(count, sides)).
8. 5c00:1571 SavingThrow(HookOpponent, 0, bonus): opp, 0, [BP+6] ✓.
9. 5c00:1616 SavingThrow(HookOpponent, 0, 0): opp, 0, 0 — bonus unused ✓ (quirk recorded).
10. 5c00:1652 AddEffect(HookOpponent, $34, duration, $0C, 0): opp, 34h, [BP+8], 0Ch, 0 ✓.
11. 5c00:18ed AddEffect(c, $4B, $CF, CombatantIndex(opp), 1): c, 4Bh, 0CFh, AX of CombatantIndex, 1 ✓.
12. 5c00:191f CallEffectHandler($3A, opp, nil, 0): 3Ah, opp, 0:0, 0 ✓.
13. 5c00:1327 HealCharacter(c, 1, true): c, 1, 1 ✓.
14. 5c00:19ee ReviveCombatant(c, c^.hp): c, [+11Bh] ✓.
15. 5c00:16f5 / 1704 ParalyzeOpponent(c, Roll(1,9)+10, -2): Roll pushes 1, 9; then c, sum, FEh ✓.
16. 5c00:05b0 StrengthCode(c^.str, c^.str_exc): +10h then +16h ✓.
Statements:
17. 5c00:0263 `if con >= 20` (CMP 14h / JC) ✓. 18. 5c00:0347 CON ≥ 17 → only with fighter level > 0 (CMP 11h JC; CMP [+98h] JLE) ✓. 19. 5c00:02ca fighter term `level*(con-15)` (SUB AX,0Fh; MUL) ✓.
20. 5c00:0420 npc_morale B3h → 0 in mode 1 ✓. 21. 5c00:0486 `<= 7Fh → B3h` (JA skip) ✓. 22. 5c00:04b1 MoraleValue := 64h reached from mode-0 both paths, not from mode 1 (JMP 04b6) ✓.
23. 5c00:0651 `ac < 39h → 39h` (JNC skip) ✓. 24. 5c00:0669 sp_Current = 0Fh → DamageAmount := 0 ✓.
25. 5c00:0838 LoseItem only if mode ≠ 0 and p ≠ nil ✓. 26. 5c00:0869 item_count < 10h (JC) ✓. 27. 5c00:08aa word[3] := F3h (+31h) ✓.
28. 5c00:09dd JBE on sp_Current = 0 → skip ✓ (quirk). 29. 5c00:0a40 `d − (d shr 2)` (two SHR) ✓.
30. 5c00:0ac2 ac_rear > 34h → −2 else 32h ✓. 31. 5c00:0d72 CloudSquareDir[k] then g_2736[...] ✓ (290Dh table bytes 08 02 03 04 for k=1..4).
32. 5c00:0e43 body → 1Fh at cm_Map + y*32h + x + 7 ✓. 33. 5c00:0f7d remaining clouds → 1Eh ✓.
34. 5c00:13c9 cha > 2 → −2 else 0; then < 3 → 3 ✓. 35. 5c00:14b9 DamageAmount < LastDiceCount (JNC) → := LastDiceCount ✓.
36. 5c00:1867 victim active and (duration shr 4) > dmg (JBE → remove) ✓.
Result: 36/36 match after writing; no corrections needed in the sample. Argument names of ov24 callees follow combat_parts/ov24.pas.md signatures.
