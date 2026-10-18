# ov24 screens / messages — effects, damage, healing (lane por-mod-combat)

ov24 has no screens or menus of its own and reads no keys; it emits character messages through the resident routines
`ShowCharacterMessage{00BA:16EC}(c, msg, row, wait)` (in combat, `game_Mode = 5`: name at col 23 row `row`, text at row+1 of the right-hand panel (rectangle pushes 17h, row, 26h, 15h → cols 23..38, M); outside combat: bottom text window rows 17..; `wait <> 0` = MessageDelay (GameSpeed*225 ms) then the panel is cleared) and
`ShowCombatMessageAnimation{00BA:1FEB}(c, flag, msg)` (combat message with the hit animation, ENGINE).
All texts are exact (code-segment Pascal strings, 9800:xxxx).

| id | trigger (routine) | text | how shown | next |
|---|---|---|---|---|
| COMBAT-ov24-01 | StinkingCloudCheck 9800:0BB7, save succeeded (effect 1Eh, 1 round) | `starts to cough` | ShowCombatMessageAnimation(c, 1, …) via ApplyEffect, then cleared | caller continues |
| COMBAT-ov24-02 | StinkingCloudCheck 9800:0BFC, save failed (effect 1Fh, 1d4+1 rounds) | `chokes and gags from nausea` | same | caller continues |
| COMBAT-ov24-03 | CureEffect 9800:10A3 (effect removed by a cure) | `is Cured` | ShowCharacterMessage(c, …, row 10, wait) | — |
| COMBAT-ov24-04 | DamageCharacter 9800:1391, amount ≥ 2 | `takes <n> points of damage ` + optional suffix | ShowCombatMessageAnimation(c, 0, …) | 05/06/07 |
| COMBAT-ov24-05 | DamageCharacter 9800:13D0, amount = 1 | `takes 1 point of damage ` + optional suffix | same | |
| COMBAT-ov24-04a | suffix by `DamageType and $F7` = 1 / 2 / 4 / 10h; or `DamageType` ∈ {0, 8} | `from Fire` / `from Cold` / `from Electricity` / `from Acid`; `from Magic` | appended to 04/05 (no extra space) | |
| COMBAT-ov24-06 | DamageCharacter 9800:1522, in combat, the victim was casting (`combatant^[0] <> 0`) | `lost a spell` | ShowCharacterMessage(c, …, row 12, wait) | |
| COMBAT-ov24-07 | DamageCharacter 9800:156E, victim no longer active | `Goes Down`; status Dying → `Goes Down, and is Dying`; status Dead/Stoned/Gone → `is killed` | ShowCharacterMessage(c, …, row text_Row+1, no wait); then MessageDelay outside combat, or (combat) icon removal RemoveCombatant / MessageDelay | |
| COMBAT-ov24-08 | ApplyEffect 9800:1695, effect vetoed by a hook (event 9) or negated by the save | `is Unaffected` | ShowCharacterMessage(c, …, row 10, wait) | |
| COMBAT-ov24-09 | ApplyEffect 9800:171F, caller supplied a non-empty message | caller's text (string[40]) | ShowCombatMessageAnimation(c, 1, …), cleared | |
| COMBAT-ov24-10 | RemoveFromCombat 9800:0F4C | caller's text: "Got Away" (Flee), "Surrenders" (ov09 AiMoraleCheck), "Turns gaseous and escapes" (EffGaseousEscape) | ShowCharacterMessage(c, …, row 10, wait); icon removed from the combat map | |
| COMBAT-ov24-11 | ReviveCombatant 9800:1904, enemy (side 1) | `stands up and grins` | ShowCharacterMessage(c, …, row 10, wait) | |
| COMBAT-ov24-12 | ReviveCombatant 9800:1904, party side | `gets back up` | same | |

Pictures: none loaded here (icon redraws are delegated to RestoreTerrain / RemoveCombatant / FocusCombatant, VIEW lane).
