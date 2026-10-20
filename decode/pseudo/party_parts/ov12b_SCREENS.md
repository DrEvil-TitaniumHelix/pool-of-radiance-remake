# ov12 part B — messages shown (lane por-mod-party, fork B)

All ov12 effect handlers run inside combat or effect processing; they draw no screens of their own. Messages go through
`ShowCharacterMessage(c, msg, row, wait)` (00BA:16EC: in combat `game_Mode = 5` the right panel, name at col 23 row `row`,
message under it in colour 0Ah; otherwise the bottom text window; `wait` = MessageDelay + clear), through ApplyEffect /
DamageCharacter (ov24) or `ShowTimedBottomMessage` (00BA:1693, row 24 colour 0Ah, delay, clear). No keys are read.

| id | trigger (routine) | text | where | picture/animation | next |
|---|---|---|---|---|---|
| PARTY-ov12b-01 | EffFearAura 5C00:1AAA (effect 51h, event 08h) | `is paralyzed with fear` / `is weakened by fear` (or ov24 "is Unaffected") | ApplyEffect → ShowCombatMessageAnimation (sparkle) | ov24 sparkle | combat continues |
| PARTY-ov12b-02 | EffFearOnce 5C00:1BA8 (52h) | `is paralyzed with fear` | as 01 | — | — |
| PARTY-ov12b-03 | EffStoneGaze 5C00:1CAD (53h) | `gazes...` (row 10, no wait); `reflects it!` (target, row 12); `is Stoned` (via ApplyFatalStatus, row 10, MessageDelay) | combat panel | animation frames 12h along the gaze line (AnimateAlongPath frames 4, delay 2Dh), and back when reflected | — |
| PARTY-ov12b-04 | EffCharmGaze 5C00:1E77 (54h) | `Gazes...` (row 10); `is charmed` | combat panel / ApplyEffect | animation 12h, 4 frames, delay 2Dh | — |
| PARTY-ov12b-05 | DrainLevels 5C00:2122 (55h/56h) | `is drained a level` / `is drained <n> levels` (row 10, wait); `is dead forever`; `is killed`; debug only (g_49F7 ≠ 0): `max,cur,lost` + `<hp_max> , <hp> , <hp_drained>` (DebugPrint ov33) | combat panel / bottom line (debug) | — | — |
| PARTY-ov12b-06 | EffMummyTouch 5C00:23EC (57h) | `is Diseased` (row 10, wait) | combat panel | — | — |
| PARTY-ov12b-07 | EffShield 5C00:2556 (5Bh) | `is unaffected` (row 10, wait) — Magic Missile only | combat panel | — | — |
| PARTY-ov12b-08 | EffFallsDead 5C00:2610 (5Fh) | `Falls dead` | via ApplyFatalStatus | — | — |
| PARTY-ov12b-09 | EffGaseousEscape 5C00:28BF (67h) | `Turns gaseous and escapes` | RemoveFromCombat (ov24) | view focused on the combatant (FocusCombatant margin 3) | combatant leaves (status 3) |
| PARTY-ov12b-10 | EffSpitAcid 5C00:2C1C (79h) | `Spits Acid` (row 10, wait) + ov24 damage text "takes n points of damage …" | combat panel | animation 17h, 1 frame step, delay 1Eh | — |
| PARTY-ov12b-11 | ItemGiantStrength 5C00:2F57 (83h) | `is stronger` (row 10, wait; in combat forced to the text window by game_Mode := 2) | text window | — | — |
| PARTY-ov12b-12 | ItemAlignmentShock 5C00:30A5 (84h) | ov24 damage text "takes n points of damage from Magic" | combat layout redrawn first when in combat | — | — |
| PARTY-ov12b-13 | ItemNeedsGiantStrength 5C00:3134 (87h) | `Must have Giant Strength` | bottom line (ShowTimedBottomMessage) | — | — |
| PARTY-ov12b-14 | AvoidRangedAttack (part A) via EffAvoidMissiles60 / EffAvoidBoulders | `Avoids it` (row 10, wait) | combat panel | — | — |

String literals (code segment, H): 1A7F "is paralyzed with fear", 1A96 "is weakened by fear", 1B91 "is paralyzed with fear",
1C8D "gazes...", 1C96 "reflects it!", 1CA3 "is Stoned", 1E63 "Gazes...", 1E6C "is charmed", 20DF " levels", 20E7 "a level",
20EF "is drained ", 20FB "is dead forever", 210B "max,cur,lost", 2118 "is killed", 23E0 "is Diseased", 2548 "is unaffected",
2605 "Falls dead", 28A5 "Turns gaseous and escapes", 2C11 "Spits Acid", 2F4B "is stronger", 311B "Must have Giant Strength".
