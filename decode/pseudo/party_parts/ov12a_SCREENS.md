# ov12 part A — messages (lane por-mod-party)

ov12 has no screens or menus of its own; it prints character messages while effects act. Output routes (ENGINE):
- `ShowCharacterMessage(c, msg, 10, wait)` — in combat (`game_Mode = 5`): the character's name at col 23 row 10 and `msg` at row 11 of the right-hand panel; outside combat: the bottom text window. `wait = true` → MessageDelay (`Delay(GameSpeed*225)`) then ClearCharacterMessage.
- `ShowTimedBottomMessage(msg)` — bottom window, timed.
- `ShowCombatMessageAnimation(c, true, msg)` — combat message with the spell/effect animation on c's icon (ENGINE 00BA:1FEB).
No keys are read anywhere in part A. After HP changes outside combat the roster is redrawn (`DrawPartyRoster(SelectedChar)`); after an AC change of the selected character its summary (`DrawCharacterSummary`).

| id | trigger (routine, effect type) | text (CS literal) | route / wait | next |
|---|---|---|---|---|
| PARTY-ov12a-01 | EffStartsToTrain 5C00:017F, type 04h ends | `starts to train` (5C00:016F) | ShowCharacterMessage, wait | effect 07h started |
| PARTY-ov12a-02 | EffHardier 5C00:0233, type 07h ends | `is hardier` (5C00:0228) | ShowCharacterMessage, wait | CON+1 |
| PARTY-ov12a-03 | ApplyFatalStatus 5C00:0058 (callers below) | caller's text: `dies from poison` (0764, EffSlowPoisonEnd), `collapses` (0B11, EffAnimatedEnd), `Dies rots away` (138A, EffMummyRot), `is killed` (153B, PoisonOpponent); part B callers add their own | ShowCharacterMessage **no wait**, then (unless already Dead/Stoned/Gone) MessageDelay + ClearCharacterMessage; roster redraw outside combat | combatant removed from the map if still inactive |
| PARTY-ov12a-04 | EffSilence 5C00:070F, type 15h, event 0Fh | `is silenced` (0703) | ShowCharacterMessage, wait (only if the character could still use items) | — |
| PARTY-ov12a-05 | EffSpiritualHammer 5C00:07E0, type 17h | `Gains an item` (07D2) | ShowCharacterMessage, wait | item "Spiritual Hammer +1" in inventory |
| PARTY-ov12a-06 | EffMirrorImage 5C00:09C0, type 1Ch | `lost an image` (09B2) | ShowCharacterMessage, wait | — |
| PARTY-ov12a-07 | EffCoughing 5C00:0A65, type 1Eh | `is coughing` (0A59) | ShowCharacterMessage, wait (only if items still usable) | summary redraw if selected |
| PARTY-ov12a-08 | EffHaste 5C00:0C4B, first application | `ages` (0C46) | ShowCharacterMessage, wait | age+1 |
| PARTY-ov12a-09 | EffCloudRemoved 5C00:0CC3, type 28h ends | `The air clears a little...` (0CA8) | ShowTimedBottomMessage | combat-map ground restored |
| PARTY-ov12a-10 | AvoidRangedAttack 5C00:0FAC (EffMagicWeaponOnly and part B) | `Avoids it` (0FA2) | ShowCharacterMessage, wait | attack misses |
| PARTY-ov12a-11 | EffWeakness 5C00:10DE, type 2Bh tick | `is weakened` (10D2) | ShowCharacterMessage, wait | STR−1 |
| PARTY-ov12a-12 | EffMummyRot 5C00:1399, type 39h tick | `Rots...` (1382) | ShowCharacterMessage, wait | CHA−2; last tick → PARTY-ov12a-03 `Dies rots away` |
| PARTY-ov12a-13 | PoisonOpponent 5C00:1545 (types 40h..42h, 46h) | `is Poisoned` (152F) | ShowCharacterMessage no wait, MessageDelay | PARTY-ov12a-03 `is killed` |
| PARTY-ov12a-14 | ParalyzeOpponent 5C00:15EB (types 43h..45h) | `is Paralyzed` (15DE) | ShowCombatMessageAnimation(target, true, …) | effect 34h on target |
| PARTY-ov12a-15 | EffBloodDrain 5C00:176F, type 4Bh | `Sucks some Blood` (175E) | ShowCharacterMessage (name of the sucker), wait | victim takes 1d4 ("takes n points of damage", ov24 DamageCharacter) |
| PARTY-ov12a-16 | EffGrab 5C00:1935, type 4Dh | `is held fast` (1928) | ShowCharacterMessage (victim), wait | victim held (3Ah) |

Indirect output: DamageCharacter (ov24) prints its own "takes n points of damage" lines for EffHpLossTick, EffHpDrainTick and EffBloodDrain; HealCharacter + ShowHealingResult for EffSlowHeal / EffRegenerate.
