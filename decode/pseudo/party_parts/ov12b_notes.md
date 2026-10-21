# ov12 part B notes (5C00:1A19 .. 5C00:38A9) — lane por-mod-party, fork B

## ov12 role (for the unit header)
ov12 (analysis seg 5C00, stub seg 0041, 117 stub entries) is the **effect-handler unit**: one far procedure per active-effect
type (TChar `effects` +7Fh, 9-byte TEffect, SAVES.md §5). Entry 1 = `InstallEffectHandlers` (5C00:31A2), called once at
startup by InitGameState (5700:060C); it writes 138 far pointers (stub entries of ov12, two of ov13) into `EffectHandler`
(DS:6828 + 4·t, t = 01h..8Bh, 58h left nil). Entries 2..116 are the handlers themselves (plus entry 0 = empty ov12_init);
nothing calls an ov12 handler directly — all go through ov24 `CallEffectHandler(type, c, e, mode)` (9800:0000) from
`CallEffectHooks(event, c)` (event lists in combat_parts/ov24.pas.md), RemoveEffect (mode 1 on expiry / removal when
`callOnRemove <> 0`), HealCharacter, ApplyEffect and a few spell routines. Handler ABI: `procedure(c: PChar [BP+0Ch];
e: PEffect [BP+8]; mode: Byte [BP+6])`, RETF 0Ah. The handlers talk to the caller through the ov24/ov13 globals
(`DamageAmount` 6818, `DamageType` 6819, `EffectToApply` 6817, `SaveRoll` 6816, `SaveType` 682A, `AttackRollValue` 6822,
`AttackBlocked` 681E, `LastDiceCount` 681C) and `SelectedChar` (the attacker during weapon-damage event 05h).
Types 80h..8Bh are **item powers**: the second parameter is the readied ^TItem (power byte with bit 7; +3Dh = power[2]).
Part B content: special attacks of monsters (fire/acid touch, fear auras, petrifying/charming gaze, energy drain, mummy
disease, spit acid), regeneration/revival (troll, "fights on"), damage filters (halve fire/cold/electricity, weapon-type
immunities: silver, magic, blunt, holy water, oil, boulders), save bonuses (dwarf/halfling CON table), racial/undead
immunities and magic resistance, the item-power handlers (grant effect, Giant Strength item, alignment shock,
"Must have Giant Strength") and the table installer.

## (a) Routines (57)

| routine | name | conf | evidence |
|---|---|---|---|
| 5C00:1A19 | EffFireDamage | M | table slot 4Fh; DamageType := 9; DamageCharacter(target, RollDice(2,10)) |
| 5C00:1A4C | EffAcidDamage | M | slot 50h; DamageType := 10h (Acid); 1d4 |
| 5C00:1AAA | EffFearAura | M | slot 51h; "is paralyzed with fear"/"is weakened by fear" by level_main 0..3 / 4..5 |
| 5C00:1BA8 | EffFearOnce | M | slot 52h; removes 52h from all listed chars; save bonus count/human |
| 5C00:1CAD | EffStoneGaze | H | slot 53h; "gazes...", "reflects it!" (Mirror word 76h), "is Stoned" status 7 |
| 5C00:1E77 | EffCharmGaze | H | slot 54h; "Gazes...", "is charmed", effect 0Bh, sp_Current := 0Ah (Charm Person) |
| 5C00:2002 | DrainClass | M | nested in DrainLevels; argmax of level[0..7] with XpForLevel tie rule |
| 5C00:2122 | DrainLevels | H | " levels"/"a level"/"is drained "/"is dead forever"; +73h/+74h/+75h |
| 5C00:23A4 | EffDrainOne | H | slot 55h; DrainLevels(target, 1) |
| 5C00:23C2 | EffDrainTwo | H | slot 56h; DrainLevels(target, 2) |
| 5C00:23EC | EffMummyTouch | M | slot 57h; "is Diseased"; effects 32h ('Dreaded Mummy Disease', DisplayEffects) + 39h |
| 5C00:2490 | EffDisplacement | M | slot 59h ('Displaced' in DisplayEffects); AttackRollValue := -1 once per round |
| 5C00:24D9 | EffConSaveBonusPoison | H | slot 5Ah; SaveType 0; CON table 4..6→1 … 18..20→5 (AD&D dwarf/halfling) |
| 5C00:2556 | EffShield | M | slot 5Bh; immune to Magic Missile (spell 0Fh) ("is unaffected") and electricity |
| 5C00:25A2 | EffHalveFire | H | slot 5Dh |
| 5C00:25BC | EffHalveWeapon | M | slot 5Eh; ITEMS wflags and 81h |
| 5C00:2610 | EffFallsDead | H | slot 5Fh; "Falls dead" |
| 5C00:264B | EffNeedSilverOrMagic | M | slot 60h; plus = 0 and word3 <> B1h 'Silver' → 0 |
| 5C00:268A | EffConSaveBonusMagic | H | slot 61h; SaveType 4/2; same CON table |
| 5C00:2700 | EffRegenerate3 | H | slot 62h; hp +3 capped |
| 5C00:2730 | EffReviveOnce | M | slot 63h; ReviveCombatant, then effect 5Fh in 1d4+1 |
| 5C00:27D9 | EffTrollDown | M | slot 64h; not Fire/Acid → effect 66h for 3d6 |
| 5C00:2814 | EffStartRegenerating | M | slot 65h; effect 3Bh ('Regenerating') for 3 |
| 5C00:2866 | EffTrollRise | M | slot 66h; ReviveCombatant(c, hp_max) else re-add for 1 |
| 5C00:28BF | EffGaseousEscape | H | slot 67h; "Turns gaseous and escapes", RemoveFromCombat status 3 |
| 5C00:2901 | EffAvoidMissiles60 | M | slot 68h; AvoidRangedAttack(c, 60) |
| 5C00:2915 | MagicResistance | M | SpellCasterLevel(sp_Current), pct − 5·(11−lvl) |
| 5C00:2976 | EffMagicRes50 | M | slot 69h |
| 5C00:2984 | EffMagicRes15 | M | slot 6Ah |
| 5C00:2992 | EffResistSleepCharm90 | M | slot 6Bh; 90 % block 35h/0Bh |
| 5C00:29B6 | EffImmuneSleepCharm | M | slot 6Ch |
| 5C00:29CB | EffImmuneHold | M | slot 6Dh; block 34h |
| 5C00:29D9 | EffImmuneCold | H | slot 6Eh |
| 5C00:29F0 | EffImmunePoisonParalysis | M | slot 6Fh; block 37h ('Poisoned') and 34h, SaveRoll := 100 for save type 0 |
| 5C00:2A11 | EffImmuneFire | H | slot 70h |
| 5C00:2A28 | EffFireMinusOnePerDie | M | slot 71h; LastDiceCount |
| 5C00:2A6D | EffHalveElectricity | H | slot 72h |
| 5C00:2A87 | EffHalveEdged | M | slot 73h; wflags 0 or bit 0 |
| 5C00:2AE6 | EffHalveMagicWeapon | M | slot 74h; plus > 0 |
| 5C00:2B20 | EffHolyWater | M | slot 75h; weapon type 55h = Holy Water vial (ITEMS.md) → 1d6+1 |
| 5C00:2B63 | EffHalveCold | H | slot 76h |
| 5C00:2B7D | EffNeedMagicWeapon | M | slot 77h; race/level_main exception |
| 5C00:2BC8 | EffAvoidBoulders | M | slot 78h; weapon type 57h/58h (Boulder) → 50 % avoid |
| 5C00:2C1C | EffSpitAcid | H | slot 79h; "Spits Acid", 8d4, save 3 for half |
| 5C00:2D38 | EffOilFlask | M | slot 7Ah; weapon type 56h Flask of Oil → 3d8 |
| 5C00:2D88 | EffNeedMagicSilverHalf | M | slot 7Bh |
| 5C00:2DE4 | EffResistSleepCharm30 | M | slot 7Ch; 30 % |
| 5C00:2E08 | EffUndeadImmunities | M | slot 7Dh; block 0Bh/35h/34h/37h + poison save |
| 5C00:2E37 | EffWardedByItem | M | slot 7Eh (event 00h); AttackBlocked := 1 for Mirror / Wooden Holy Symbol |
| 5C00:2EDA | ItemGrantsEffect | M | slots 80..82, 85, 86, 88, 8A, 8B; item +3Dh effect while readied |
| 5C00:2F57 | ItemGiantStrength | M | slot 83h; SetStrength(c, 18, 100), "is stronger", effect 26h |
| 5C00:30A5 | ItemAlignmentShock | M | slot 84h; power[2] low nibble vs alignment +A0h |
| 5C00:3134 | ItemNeedsGiantStrength | H | slot 87h; "Must have Giant Strength", STR < 19 |
| 5C00:317A | ItemRemove17 | L | slot 89h; RemoveEffect(c, 17h) on un-ready |
| 5C00:319B | EffNop | H | empty handler, 9 slots |
| 5C00:31A2 | InstallEffectHandlers | H | 138 stores into DS:6828+4t; caller InitGameState 5700:060C |
| 5C00:38A9 | ov12_init | H | empty unit init |

Counts: 57/57 routines (functions.tsv 5c00:1a19 .. 5c00:38a9); H 20, M 36, L 1.
Gaps between routines (e.g. 5C00:1A7D..1AA9, 1C8B..1CAC, 1E61..1E76, 20DD..2121, 2546..2555, 2603..260F, 28A3..28BE,
2C0F..2C1B, 2F49..2F56, 3119..3133) hold the Pascal string literals listed in ov12b_SCREENS.md (no code).

## (b) Globals named (requests for por-tooling; evidence in ov12b.pas.md)

| DS | name | conf | evidence |
|---|---|---|---|
| 409B | XpForLevel | M | 8 × 14 LongInt, index DS:409B + cls·38h + lvl·4 (DrainClass 5c00:2054); values = AD&D XP thresholds (fighter 2001 … 125001), −1 = unreachable; also read by ov16 TrainCharacter (training) and Spell_Restoration |
| 681B | sp_Current | M | spell id whose caster level SpellCasterLevel looks up (MagicResistance 5c00:291b); written by CastSpell (8e00:0eaf/0ec1) and set to 0Ah (Charm Person) by EffCharmGaze; compared with 0Fh (Magic Missile) in EffShield |
| 6821 | ItemsChanged | M | set 1 by ItemGiantStrength/ItemAlignmentShock (and InitSpellTable), read and cleared by the ov19 Ready-Item menu (7f00:119a / 1242) to redraw the list |
| 6826 | HookOpponent | M | far ptr := `c^.combatant^.target` at the start of the special-attack handlers (1CAD, 1E77, 23EC, 2C1C, 2E37; part A: 1545, 15EB, 176F, …; ov13_3A86), then the victim (gaze reflection swaps it to the gazer) |

Used with existing names: PartyHead (5D96), SelectedChar (5D92), game_Mode (49F3), side_ActiveCount (6814), CombatRound (6DE3),
cm_Map (6716; the listing labels its high word 6718 "tg_List" — here it is cm_Map's segment), DamageAmount, DamageType,
EffectToApply, SaveRoll, SaveType, AttackRollValue, AttackBlocked, LastDiceCount, EffectHandler (682C), SlotHits (6823),
cure_InProgress (681F).

## (c) Unknowns
- Combat-record byte `combatant^[$0E]` (EffReviveOnce: dying with value < 6 → revive with 6 − value hp) — meaning L.
- Effect 7Fh (nop handler) as the precondition of the mirror reflection in EffStoneGaze — what sets it (monster data) L.
- EffDisplacement reset condition `(CombatRound = 0) and (AttackRollValue = 0)` — which event-08h caller makes it true (L).
- Item-power handlers 80h..8Bh: the caller that passes an item pointer (ready/unready code) is outside ov12, not located here.
- Effect types 02h ("is weakened by fear"), 34h, 35h, 0Bh, 37h: semantics from their handlers (part A) and the MAGIC
  DisplayEffects texts; the names used in comments are M.
- ItemRemove17 purpose (effect 17h = part-A EffSpiritualHammer handler ("Gains an item")) — L.

## Quirks a faithful port must copy (H, from the bytes)
1. EffCharmGaze passes an uninitialised word ([BP-2]) as TraceLine's `range`.
2. EffConSaveBonusPoison / EffConSaveBonusMagic: CON outside 4..20 adds an uninitialised bonus byte.
3. MagicResistance: byte wrap — low-level casters vs small pct → always resisted.
4. DrainLevels: `hp_max div Σlevels` → division by zero if all levels are 0; `xp` reset to the threshold of the new level.
5. EffFearAura: paralysis with duration 0 (permanent).
6. EffSpitAcid: DamageType not set (stale).
7. ItemGiantStrength: `p^.type < 80h` test always true; AddEffect 26h done even if SetStrength failed.
8. EffFearOnce removes effect 52h from every character of the list, not only from `c`.
9. InstallEffectHandlers leaves type 58h nil (a dispatch would call 0000:0000).

## (d) Self-check
Sample: 26 of 266 annotated statements (≈10 %, `random.seed(12)` over the `{ 5c00:xxxx }` anchors) re-read against
decode/listings/ov12.lst: 1a1c, 1abd, 1bda, 1e3f, 1eb4, 2015, 2022, 222f, 2337, 23f2, 25a5, 2616, 27ee, 286c, 28c5, 2927,
29f3, 2a9f, 2b83, 2c93, 2d1e, 2dfd, 2f7c, 2fc6, 303b, 30ab — **26/26 match** (operands, constants, signed/unsigned tests).
Call push orders checked against the PUSH sequences (first pushed = first argument), 14 calls: SavingThrow(m,4,0) 1afa;
ApplyEffect(m,$34,0,$0C,0,1,saved,…) 1b39; ApplyEffect(m,$34,Roll(1,4),$0C,0,1,…) 1c6c (Roll consumes the pushed 1,4);
ApplyFatalStatus(HookOpponent,7,'is Stoned') 1e5a; CanAttack(c,HookOpponent) 1ec2; TraceLine(col,row,@tx,@ty,@range,cm_Map) 1efd;
ApplyEffect(target,$0B,0,side*80h+0Ch,1,1,SavingThrow(target,4,-2),'is charmed') 1fc5; CallEffectHandler($0B,target,p,0) 1ff7;
DebugPrint('max,cur,lost',hp_max,hp,hp_drained) 2257; AddEffect(target,$39,$A8C0,Roll(1,6)*16+$0F,1) 2463;
AddEffect(c,$5F,Roll(1,4)+1,$FF,1) 27b2; DamageCharacter(target,RollDice(8,4),2,SavingThrow(target,3,0)) 2d05;
AddEffect(c,$26,0,oldCode,1) 309a; CallEffectHandler(power2,c,nil,0) 2f40 — **14/14 OK**.
Handler table: regenerated mechanically from the 138 stores + stub entry tables (ovl_layout.json) and compared with the
ov24 table — identical. argcheck.py was not run on this part file (it only accepts whole-area files); run it on PARTY.pas.md after the merge.
