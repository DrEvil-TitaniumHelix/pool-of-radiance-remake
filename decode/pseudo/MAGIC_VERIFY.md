# MAGIC_VERIFY — independent verification of MAGIC.pas.md / MAGIC_SCREENS.md (lane por-verify)

Input: `decode/pseudo/MAGIC.pas.md` (owner por-mod-magic), `MAGIC_SCREENS.md`, `acceptance/ref/DECODE_CHECKS.md` and captures. Method as COMBAT_VERIFY.md (herdr/assignments/por-verify.md); one verifier worker of this lane, merge and the arg-order defect re-checked by the lane itself.

## Summary

| item | result |
|---|---|
| argcheck (scratch copy of `decode/tools/argcheck.py`) | 233 calls: OK 67, MISMATCH 0, UNSURE 166 |
| sample | **seed 20261017**, 29 of 282 anchored statements (10%; the file anchors few statements): 27 AGREE, 1 DISAGREE, 1 UNSURE |
| extra statements (verifier's choice, unanchored bodies in all 4 units) | 20: 18 AGREE, 2 DISAGREE |
| sweeps (arg order, signed/unsigned, byte/word, folded indexes, ABS, set tests, string length) | 14 set constants decoded, 12/27 signed compares, folded tables and widths: no further findings; no NEG in these units |
| screens MAGIC rows | 21: 20 AGREE, 1 UNSURE (MAGIC-14 rest-time formula belongs to PARTY) |
| COMBAT's earlier report 6b00:04d6 (SpellList args) | already fixed: `SpellList(0, 1, idx, found)` matches the pushes |

## Fix requests (posted in STATUS.md)

- **magic fix request #verify-1** — `3400:00BF PayForCure`: signature reversed. The body reads the service string at `[BP+8]` (far pointer, `LES DI,[BP+8]` 3400:00C6 → StrAssign) and the price at `[BP+6]`; callers push the string first. Correct: `function PayForCure(service [BP+8]: string; price [BP+6]: Word): Char`, calls L38 `PayForCure('Cure Blindness', 1000)` (3400:02A7) and L47 `PayForCure('Raise Dead', 5500)` (3400:0378/0590). (argcheck UNSURE because of the string argument.)
- **magic fix request #verify-2** — `8E00:1561/1565` (L516, Sleep cost table): not "≤ 1": cost 1 only for the signed byte +73h in 0..1; negative values fall through to cost 20 (signed compare pair).
- **magic fix request #verify-3** — `8E00:0239` (L358, ChooseSpell result): `if key in [#0, 'E'] then 0 else sl_Ids[n]` (not `if key = #13 …`); the loop at 01E8 exits on `[#0, #13, 'C', 'E', 'L', 'M', 'S']` — the option hotkeys C/L/M/S also select the highlighted spell; L356 lists only part of the set.
- Notes (no fix): Game Speed L300 'F'/'S' have no bound check, safe only because " Faster"/" Slower" are offered conditionally (UNSURE, wording); DECODE_CHECKS.md ECL-14 text omits REST although the MAGIC-CAMP capture shows it (por-dosbox-ref wording).

## Details

## MAGIC (ov04 3400, ov08 4800, ov15 6B00, ov22 8E00) — por-verify worker

Input: decode/pseudo/MAGIC.pas.md (677 lines, 282 anchored statements), MAGIC_SCREENS.md (MAGIC-01..21), argcheck (233 calls, 0 MISMATCH, 166 UNSURE). Evidence: decode/listings/ov04/08/15/22.lst and `decode/ecl/hdis.py`; push sequences via a scratch push-dump helper.

### Seeded sample (seed 20261017, 29 = 10% of 282 anchored statements)

| line | address | statement (short) | verdict | evidence |
|---|---|---|---|---|
| L21 | 3400:0139 | ShowText(msg, …) | AGREE | pushes 1,11h,26h,16h,0Ah,1,msg → DrawWrappedText 0709:0768 |
| L27 | 3400:019b | pool := PoolGoldValue(TreasureMoney) | AGREE | MOV DI,67F4h; PUSH DS:DI; CALLF ov21_00A8; DX:AX stored |
| L47 | 3400:0590 | `PayForCure(5500, 'Raise Dead') = 'Y'` | **DISAGREE** | push order: string temp ([bp-118h], "Raise Dead") first, then `MOV AX,157Ch; PUSH AX`; callee 3400:00BF reads the string with `LES DI,[BP+8]` and the price at `[BP+6]` → Pascal `PayForCure(service, price)` = `PayForCure('Raise Dead', 5500)` |
| L96 | 3400:0e86 | ShowText('Do you want to go back…') | AGREE | push 1,11h,26h,16h,0Ah,1,str; CALLF DrawWrappedText |
| L97 | 3400:0eae | MenuSelect('', '~Yes ~No', …) = 1 → done | AGREE | AL=1 → [bp-2]:=1; else ClearTextRectangle(1,11h,26h,16h) at 0ECE |
| L144 | 4800:02ea | RedrawSquare(CombatantCol(c), CombatantRow(c)) | AGREE | 02D2..02EA push Col, Row |
| L163 | 4800:0405 | 'U': UseItem(done); ov13_0D23(c); … | AGREE (name note) | 0405 calls ov19 e6 = 7F00:0EF8 published as `ItemsMenu` (var [bp-2]); 0410 ov13 e6 = 6100:0D23 `CalcAttacks`; 041B DrawCombatLayout |
| L190 | 4800:0917 | if AnyoneDying(false) then ShowError('Your Teammate is Dying') | AGREE | push 0; CALL 0FFF; 092D ShowTimedBottomMessage(str) |
| L206 | 4800:0bc3 | ShowCombatant(c, dir, 0, false); ProbeMove(c, dir, occ, tile) | AGREE | pushes c,[bp-7],0,0 / c,[bp-7],@[bp-8],@[bp-9] |
| L207 | 4800:0c06 | AttackTarget(c, cb_Char[occ], done) | AGREE | c; [DI+65B9/65BB] with DI=occ*4; far [bp+6] |
| L210 | 4800:0c80 | moveLeft < CombatTerrain[tile].cost → 'Blocked' | AGREE | AL=[2744h+tile*4] vs combatant+6; JBE (unsigned) skips |
| L212 | 4800:0c92 | AttacksOfOpportunity(c, dir) | AGREE | push c, [bp-7] |
| L300 | 6b00:1ad5 | Game Speed text; F/↓ −1, S/↑ +1 (bounded 0..9) | UNSURE | text/row (1,12h,0Ah) AGREE; ↓/↑ (scan 50h/48h) are bounded in code (1BA1/1BB2), but 'F'/'S' do `DEC/INC [49E2]` unbounded (1BC6/1BD0) — bounded only because ` Faster`/` Slower` are offered only when > 0 / < 9 |
| L350 | 8e00:0104 | if mode in [1..4] then prompt := 'Choose Spell: ' | AGREE | @SetIn with CS:001B = {1,2,3,4} (bytes decoded) |
| L396 | 8e00:0809 | $39,$3D: d := Roll(5, 4) | AGREE | push 5, push 4 |
| L401 | 8e00:0880 | else d := duration + durPerLvl * SpellCasterLevel(spell) | AGREE | [31FE+id*16] + [31FF+id*16]*level |
| L414 | 8e00:098d | saved := SavingThrow(t, tbl[spell].saveType, 0) | AGREE | push t, [3203+id*16], 0 (after saveEffect [3202] test) |
| L416 | 8e00:09ad | RecalcCharacter(t); CallEffectHooks($0B, t) | AGREE | 09AD / push 0Bh, t at 09BB (inside range = FFh test 09A0) |
| L467 | 8e00:0d9c | col/row := CombatantCol/Row(caster) | AGREE | push [bp-9]/[bp-7] |
| L492 | 8e00:0f44 | if game_Mode = 5 then ClearRectangle(0,$17,$27,$17) | AGREE | CMP [49F3],5; push 0,17h,27h,17h |
| L520 | 8e00:1891 | Slow Poison: HasEffect(t, 37h) … AddEffect(t,0Fh,10,FFh,1) | AGREE | 1891 push t,37h,@e; 18E3 CallEffectHandler(4Eh,t,nil,1); 18FB push t,0Fh,0Ah(word),FFh,1 |
| L526 | 8e00:1af2 | ApplySpell(…, 'is weakened') | AGREE | string pushed last ([bp-0Ch]) |
| L546 | 8e00:2efe | SetStrength(t, 21, 0, old) | AGREE | push t, 15h, 0, @[bp-1] |
| L550 | 8e00:3050 | ApplySpell(…, 'is invisible') | AGREE | string last |
| L585 | 8e00:20f9 | p3 := c^.side*16 + SpellCasterLevel(sp) | AGREE | CBW of c+10Eh, SHL 4, ADD level (signed side) |
| L615 | 8e00:2463 | if Roll(1,100) <= chance then RemoveEffect(t, e^.type, e) | AGREE | push 1,64h; CMP AL,[4844]; JA skip; push t, [e], e |
| L619 | 8e00:24b7 | ShowCombatMessageAnimation(t, true, 'is affected') | AGREE | push t, 1, str |
| L631 | 8e00:272e | FocusSquare(SpellX, SpellY, 0, 8) | AGREE | push [6DB9],[6DBA],0,8 |
| L660 | 8e00:3413 | InitSpellTable: handlers, BreathWeapon, cure_InProgress:=0, ItemCast:=0, sp_CampTarget:=nil, g_6821:=1 | AGREE | [6B84]=0096:0034 (stub e4 = SelectTargetsCamp) …[6C90] (67 slots), [6988]=0096:015B, [681F]=0, [6DBF]=0, [6DB5..]=nil, [6821]=1 |

Sample: 29 — AGREE 27, DISAGREE 1, UNSURE 1.

### Extra statements (20, chosen across units, mostly prose/unanchored)

| unit / routine | statement | verdict | evidence |
|---|---|---|---|
| ov04 CureDisease | price 1000 | AGREE (value) | 0378 `MOV AX,3E8h` (but call order: see PayForCure DISAGREE) |
| ov04 CureWounds | CLW price 100, heal Roll(1,8) | AGREE | 0422 64h; 0434 push 1,8 |
| ov04 CureWounds | CSW price 350, Roll(2,8)+1 | AGREE | 046E 15Eh; 0480 push 2,8; 0487 INC AX |
| ov04 CureWounds | CCW price 600, Roll(3,8)+3 | AGREE | 04BC 258h; 04CE push 3,8; 04D5 ADD AX,3 |
| ov04 CureWounds | ov24_175D(SelectedChar, amount, 0) | AGREE | 044B/049A/04EA push SelectedChar, [bp-1], 0 (amount is a byte) |
| ov04 NeutralizePoison | price 1000; RemoveEffect 37h, 16h, 0Fh | AGREE | 07C0 3E8h; 07DB/07F1/0807 |
| ov04 RemoveCurseService | price 3500 | AGREE | 08E5 0DACh |
| ov04 StoneToFlesh | price 2000; status 7 → status 0, active 1, hp 1 | AGREE | 0979 7D0h; 098B..09AB |
| ov04 RaiseDead | dead := status in [6, 1] | AGREE | 0539 CMP +10Ch,6 / 0545 CMP,1 |
| ov04 PayForCure | pool check `(pool < 10000h) and (pool < price)` → 'Not enough money.' | AGREE | 01AD..01B9 32-bit compare price:pool (JL/JG on high word, JA low) — equivalent |
| ov04 ConfirmNeedless | AskYesNo('cast cure anyway: ', $0D, $0A, $0F) | AGREE | 0060 push str,0Dh,0Ah,0Fh |
| ov22 Sleep | budget := Roll(4,4) | AGREE | 1526 push 4,4 |
| ov22 Sleep | cost by +73h: "≤ 1 → 1" | **DISAGREE** | 155F `CMP AL,0 / JL` and `CMP AL,1 / JG` (signed): cost 1 only for 0..1; negative values fall to the `else 20` (15B7) |
| ov22 SpellDuration | $28: Roll(1,6)*10; $3B: Roll(1,4)*10+40; $3F: Roll(2,10)*10 / (Roll(1,10)+10)*10; $43: 1440 | AGREE | 07E3..0875 |
| ov22 ChooseSpell | `if key = #13 then result := sl_Ids[n] else result := 0` | **DISAGREE** | 0239 `@SetIn(key, CS:006A = [#0,'E'])`; in-set → 0, otherwise sl_Ids[n] — the loop (01E8, set CS:004A = [#0,#13,'C','E','L','M','S']) also exits on the option hotkeys C/L/M/S, which select the highlighted spell |
| ov15 MagicMenu | HorizontalMenu('', DS:0531 'Cast Memorize Scribe Display Rest Exit') | AGREE | 1429 MOV DI,531h; DS string bytes; capture MAGIC-CAMP shows REST |
| ov15 Camp/Alter/PartyOrder menus | g_0508/055A/0584/05AD texts | AGREE | DS image bytes 'Save View Magic Rest Alter Exit', 'Order Drop Speed Icon Pics Exit', 'Select Exit', 'Place Exit' |
| ov08 CombatMenu | until key in [10h,13h,' ','-','2','A','C','D','M','Q','T','U','V'] | AGREE | 084B set CS:0646 decoded = exactly these |
| ov08 CombatMenu | extended keys other than 10h,13h,2Dh,32h discarded | AGREE | 0831 set CS:0626 = {10h,13h,2Dh,32h} |
| ov08 DoneMenu / GameSpeedMenu | until key in [#0,'E'] | AGREE | 0F2D set CS:0E25, 110A set CS:10AF = {0,'E'} |

Extra: 20 — AGREE 18, DISAGREE 2.

### Sweeps

| class | checked sites | findings |
|---|---|---|
| call-argument order | all 9 PayForCure calls (02A7, 0378, 0422, 046E, 04BC, 0590, 07C0, 08E5, 0979) + signature 3400:00BF; AskYesNo ×5, ShowTimedBottomMessage ×4, ShowCharacterMessage ×2, ApplySpell ×4, AddEffect/CallEffectHandler/HasEffect/SetStrength/RemoveEffect ×6, Roll ×9, MenuSelect/HorizontalMenu ×3; COMBAT's report on 6b00:04d6 | **PayForCure reversed** (signature + 2 written calls L38, L47; the prose for the other 7 gives only prices). All others AGREE. **6b00:04d6 SpellList: fixed** — MAGIC.pas.md L253 now `SpellList(0, 1, idx, found)` = push 0, 1, @idx, @found |
| signed vs unsigned | 27 JL/JG/JLE/JGE sites in the 4 units; checked 3400:01B1/01B3, 4800:017B/0199/023E/02AE/078B, 8E00:014F/1561/1565/2CDA/2CE5 | 8E00:1561/1565 Sleep cost range **DISAGREE** (signed 0..1 range written as "≤ 1"); others: shortint fields (initiative +3, level[0] +96h, page) written as "> 0"/"< 0" — consistent with signed fields, no defect |
| byte vs word | heal amount (byte [bp-1]), PayForCure price (word), SpellDuration (word), Roll results (AL), g_49E2 (byte) | none |
| folded constant array indexes | tbl[spell] = DS:31FA+id*16 (+2,+3,+4,+5,+8,+9 fields), CombatTerrain DS:2744+tile*4, cb_Char DS:65B9+occ*4, sl_Ids DS:476A, sl_Items DS:477F, SpellHandlers DS:6B84 | none — all written as indexed tables |
| and/jge/neg ABS idioms | `NEG` occurs 0× in ov04/08/15/22 | none possible |
| Pascal set tests | all 14 @SetIn sites decoded (ov08 4, ov15 7, ov22 3) | ChooseSpell 8E00:0239 **DISAGREE** (set [#0,'E'] → 0, not "key = #13"); 8E00:01E8 set written as `[#0, #13, …]` (elided; actual [#0,#13,'C','E','L','M','S']) — UNSURE/incomplete; the other 12 agree |
| string length-byte | ChooseSpell empty prompt (`MOV byte [bp-32h],0`), DrawTitledFrame title '' (ENGINE), MenuSelect '' titles | none |

### Screens (MAGIC_SCREENS.md vs code and captures)

| id | verdict | evidence |
|---|---|---|
| MAGIC-01 | AGREE | ov04 strings 'Heal View Take Pool Share Appraise Exit' / 'Heal View Pool Appraise Exit' |
| MAGIC-02 | AGREE | ', how can we help you?', 'Heal Exit', service strings |
| MAGIC-03 | AGREE | 'is not blind.' … 'is not stoned.', 'cast cure anyway: ' |
| MAGIC-04 | AGREE | ' will only cost ', ' gold pieces.', 'pay for cure ', prices (extra table), 'Not enough money.', 'is cured.' |
| MAGIC-05 | AGREE | 'As you leave a priest says, ', 'Do you want to go back…', '~Yes ~No' |
| MAGIC-06 | AGREE | 'Move ', 'View Aim ', 'Use ', 'Cast ', 'Turn ', 'Quick Done'; key sets CS:0626/0646 |
| MAGIC-07 | AGREE | 'Move/Attack, Move Left = ' |
| MAGIC-08 | AGREE | 'Blocked', 'Not with that weapon', 'Your Teammate is Dying', 'Flee:', 'Continue Battle:' |
| MAGIC-09 | AGREE | DS:0508; capture ECL-14 / MAGIC-CAMP: "THE PARTY MAKES CAMP..." at (1,18), CAMP menu row 24 |
| MAGIC-10 | AGREE | DS:0531; capture MAGIC-CAMP shows CAST MEMORIZE SCRIBE DISPLAY REST EXIT (note: DECODE_CHECKS.md ECL-14 row text omits REST — the PNG shows it) |
| MAGIC-11 | AGREE | menu/keys incl. C as select match the asm (the pseudo body, not the screen, is wrong — see ChooseSpell) |
| MAGIC-12 | AGREE | 'Memorize These Spells? ', 'Memorize these spells? ', 'can memorize:' |
| MAGIC-13 | AGREE | 'scibing' (sic) string present |
| MAGIC-14 | UNSURE | rest time formula not re-derived (PARTY lane RestLoop) |
| MAGIC-15 | AGREE | DS:055A/0584/05AD; Game Speed strings; F/S, ↓/↑ (see L300 note) |
| MAGIC-16 | AGREE | 'Funky--', 'Dreaded Mummy…', '<No Spell Effects>' present |
| MAGIC-17 | AGREE | 'Cast Spell on whom', 'Casts a Spell', 'Spell:' |
| MAGIC-18 | AGREE | 'is a combat-only spell', 'is a combat-only item', 'Lose it' |
| MAGIC-19 | AGREE | 'Abort Spell', 'Spell Aborted' |
| MAGIC-20 | AGREE (sampled) | 'is weakened', 'is affected', 'is invisible', 'is charmed', 'is unaffected', 'falls asleep' checked in code |
| MAGIC-21 | AGREE | 'cannot cast spells in this area', 'is in no condition to', 'cannot memorize any spells' |

Screens: 21 — AGREE 20, UNSURE 1.

### DISAGREE:
- 3400:00BF / 3400:0590 / 3400:02A7: `PayForCure(price [BP+0Ah]: Word; service [BP+6])` and calls `PayForCure(5500, 'Raise Dead')`, `PayForCure(1000, 'Cure Blindness')` → `PayForCure(service: string [BP+8]; price: Word [BP+6])`, calls `PayForCure('Raise Dead', 5500)` / `PayForCure('Cure Blindness', 1000)` (callee `LES DI,[BP+8]` = string, `PUSH [BP+6]` = price into Str; every caller pushes the string temp first, then the price word)
- 8E00:1561/1565 (Sleep, MAGIC.pas.md L516): cost "≤ 1 → 1" → "0..1 (signed shortint +73h) → 1; negative → falls through to 20" (`CMP AL,0 / JL`, `CMP AL,1 / JG`, else-branch 15B7 = 14h)
- 8E00:0239 (ChooseSpell, L358): `if key = #13 then result := sl_Ids[n] else result := 0` → `if key in [#0, 'E'] then result := 0 else result := sl_Ids[n]` (SetIn CS:006A = {0,'E'}); and L356 set → `[#0, #13, 'C', 'E', 'L', 'M', 'S']` (CS:004A), i.e. the option hotkeys C/L/M/S also choose the highlighted spell

Counts: sample 29 (27 AGREE / 1 DISAGREE / 1 UNSURE); extra 20 (18 / 2 / 0); screens 21 (20 / 0 / 1); defects 3 (one is a signature affecting 9 call sites).
