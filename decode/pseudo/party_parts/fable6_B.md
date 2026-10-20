# #fable-6 part B - CreateCharacter 7000:1200..1ED1, every statement (lane por-verify2 fork)

Source: `decode/pseudo/party_parts/ov16a.pas.md` lines 314..440 (CreateCharacter from `reroll:` + the 7000:1551 section) vs `decode/listings/ov16.lst` and `python -I decode/ecl/hdis.py ov16 1200 1ED8` (full byte dump, incl. 120E and 1BCC..1BE1 that Ghidra missed). Callee declarations: Roll (COMBAT ov24), DrawAbility 7F00:0901 / DrawCombatStats / DrawMoney / DrawCharacterSheet (COMBAT ov19), WisdomBonusSpells 9300:01AF (VIEW ov23), RollHitDice 7000:4235, ConHpBonus 7000:3F31, PortraitMenu, IconEditor (party_parts/ov16b), WriteCharacter 7500:069E (party_parts/ov17), AskYesNo / ReadBottomLine (VIEW/ENGINE). Fields: SAVES.md TChar. Tables: AgeCategory 3F31 (5 words/race, words 0..3 used), RaceAbilityLimits 3DA3 (16 B/race: [0+g] STR min, [2+g] STR max, [4+g] STR exc max, [6..0Fh] INT..CHA min/max without gender), ClassAbilityMin 3F81 (6 B/class), StartGoldDice 4263 (2 B/class), SpellTable 31FA (16 B/spell), set CS:0525 = [8..12] (image bytes `00 1F 00 ...`).

## 1. Every statement

| line | anchor | verdict | evidence (asm) |
|---|---|---|---|
| 314 | 7000:1200 | AGREE | 1200 les c; label = target of JMP 1200 at 1E2A (No answer) |
| 315 | 7000:1203 | AGREE | 1203 mov byte es:[di+16h],0 (str_exc +16h) |
| 316 | 7000:1208 | AGREE | 1208 [bp-1Bh]:=0; 120E inc (bytes, Ghidra missed); 1BD8 cmp 5 / JE 1BE1 else JMP 120E |
| 317 | 7000:121a | AGREE | 121A mov byte es:[di+10h+abil],0 |
| 318 | 7000:121f | AGREE | 121F [bp-14h]:=1; 1225 inc; 12C7 cmp 6 / JE 12D0 else JMP 1225 |
| 319 | 7000:122e | AGREE | 1228..122E push 3, push 6, Roll(count, sides) (COMBAT ov24 decl.); AL -> [bp-15h] |
| 320 | 7000:1236 | AGREE | 1236 AL=[bp-17h] = race-list loop var (0658 :=1 .. 0707 cmp 7 exit; never written later -> 7) |
| 321 | 7000:123d | AGREE | 1239 cmp 1; 1240 abil=4 inc / 1249 abil=5 dec |
| 322 | 7000:1256 | AGREE | 1252 cmp 2; 1259 abil=3 inc / 1262 abil=4 dec |
| 323 | 7000:126f | AGREE | 126B cmp 5; 1272 abil=0 dec / 127B abil=3 inc |
| 325 | 7000:1288 | AGREE | 1284 cmp 6; 128B abil=0 inc, 1294 abil=4 inc, 129D abil=5 sub 2 |
| 327 | 7000:12a5 | AGREE | 12AE..12B5 cmp abil,r / JAE skip (unsigned); 12C3 store |
| 329 | 7000:12d0 | AGREE | 12D0..12D6 [bp-27h]:=c (p); a/L are notation for 3F31+race*10 / 3DA3+race*16 (no own code) |
| 332 | 7000:12d9 | AGREE | 12D9 cmp abil,0 / JE 12E3 else JMP 1551; 1551.. cmp 1/2/3/4/5 chain; each case ends JMP 1BCC |
| 334 | 7000:12e3 | AGREE | 12EC cmp str,0 / JBE; 1302 word [3F31+race*10] cmp age(+30h) / JAE skip; 1318 inc |
| 335 | 7000:131c | AGREE | 1325 str>0; 133B [3F33]; 1351 dec |
| 336 | 7000:1355 | AGREE | 135E str>0; 1374 [3F35]; 138A sub 2 |
| 337 | 7000:138f | AGREE | 1398 str>0; 13AE [3F37]; 13C4 dec |
| 338 | 7000:13c8 | AGREE | 13CB gender +9Eh + race*16 -> [3DA3+..]; 13F4 cmp / JAE; 1420 store (minimum) |
| 339 | 7000:1424 | AGREE | 143F [3DA5+race*16+gender]; 1450 cmp / JBE; 147C store (maximum) |
| 340 | 7000:1480 | AGREE | 1489 class +2Fh *6 + abil -> [3F81]; 14AB cmp / JAE; 14D6 store |
| 341 | 7000:14da | AGREE | 14DD cmp str,12h / JNE; 14E7 cmp byte +98h (level[2]),0 / JLE (signed) |
| 342 | 7000:14f3 | AGREE | 14EF push 64h; RandomWord; 14F8 inc; 14FC store +16h (byte) |
| 343 | 7000:151b | AGREE | 151B [3DA7+race*16+gender] cmp str_exc / JAE skip; 154A store |
| 347 | 7000:1558 | AGREE | 1558 [3F33] cmp age / JAE; 157D inc (+10h+abil, abil=1) |
| 348 | 7000:1581 | AGREE | 1590 [3F37] / JAE; 15A6 inc |
| 349 | 7000:15aa | AGREE | 15B8 [3DA9+race*16] (no gender) JAE / store; 15FA [3DAA] JBE / store |
| 350 | 7000:162e | AGREE | 1648 [3F81+class*6+abil] / JAE / store |
| 353 | 7000:1692 | AGREE | 16A1 [3F31] cmp age / JB skip -> dec when a0 >= age |
| 354 | 7000:16bb | AGREE | 16CA [3F33] / JAE; inc |
| 355 | 7000:16e4 | AGREE | 16F3 [3F35] / JAE; inc |
| 356 | 7000:170d | AGREE | 171C [3F37] / JAE; inc |
| 357 | 7000:1736 | AGREE | 1744 [3DAB] JAE store; 1786 [3DAC] JBE store |
| 358 | 7000:17ba | AGREE | 17D4 [3F81+class*6+abil] / JAE / store |
| 359 | 7000:1814 | AGREE | 181D cmp wis,0Dh / JAE skip; 182B push class, set CS:0525 = [8..12] (image bytes 00 1F 00..), @SetIn / JE skip; 1841 := 0Dh |
| 362 | 7000:1850 | AGREE | 185F [3F35] / JAE; 1875 sub 2 |
| 363 | 7000:187a | AGREE | 1889 [3F37] / JAE; dec |
| 364 | 7000:18a3 | AGREE | 18B1 [3DAD] JAE store; 18F3 [3DAE] JBE store |
| 365 | 7000:1927 | AGREE | 1941 [3F81] / JAE / store |
| 368 | 7000:198b | AGREE | 199A [3F33] / JAE; dec |
| 369 | 7000:19b4 | AGREE | 19C3 [3F35] / JAE; dec |
| 370 | 7000:19dd | AGREE | 19EC [3F37] / JAE; dec |
| 371 | 7000:1a06 | AGREE | 1A14 [3DAF] JAE store; 1A56 [3DB0] JBE store |
| 372 | 7000:1a8a | AGREE | 1AA4 [3F81] / JAE / store |
| 375 | 7000:1aee | AGREE | 1AE7 cmp 5 / else JMP 1BCC; 1AFC [3DB1] JAE store; 1B3E [3DB2] JBE store (no age code) |
| 376 | 7000:1b72 | AGREE | 1B8C [3F81] / JAE 1BCC / store |
| 379 | 7000:1bd3 | AGREE | 1BCC push abil, push 0; DrawAbility(stat [BP+8], highlight [BP+6]) (COMBAT 7F00:0901) |
| 383 | 7000:1be1 | AGREE | 1BE1..1BE7 [bp-27h]:=c |
| 384 | 7000:1bed | AGREE | 1BED al:=+32h; 1BF4 +11Bh:=al |
| 385 | 7000:1bfc | AGREE | 1BFC +A1h:=2; 1C05 +A3h:=1; 1C0E +A5h:=2 (SAVES attacks / base_dmg_dice[1] / base_dmg_sides[1]) |
| 386 | 7000:1c14 | AGREE | 1C17 +AAh:=1; 1C20 +72h:=0Ch |
| 387 | 7000:1c25 | AGREE | 1C25 [bp-21h]:=0 (byte); 1C29 [bp-20h]:=0 |
| 388 | 7000:1c2d | AGREE | 1C2D [bp-19h]:=0; 1C33 inc; 1D0C cmp 7 / JE 1D15 |
| 389 | 7000:1c3f | AGREE | 1C3F cmp byte +96h+cls,0 / JG (signed) |
| 390 | 7000:1c51 | AGREE | 1C4D cls=0 -> 1C54 +B2h:=1 |
| 391 | 7000:1c60 | AGREE | 1C5C cls=5 -> 1C63 +B5h:=1 |
| 392 | 7000:1c83 | AGREE | 1C71 push [4263+cls*2], 1C7E push [4264+cls*2]; Roll; 1C88 add byte [bp-21h] |
| 393 | 7000:1c8b | AGREE | 1C8B inc [bp-20h] |
| 394 | 7000:1c91 | AGREE | 1C91 cmp cls,0 / JNE 1CE8 |
| 395 | 7000:1c9b | AGREE | 1C95 push c (far); lcall stub 00AC -> 9300:01AF WisdomBonusSpells(c [BP+6]) (VIEW ov23) |
| 396 | 7000:1ca0 | AGREE | 1CA0 k:=1; 1CA6 inc; 1CE0 cmp 38h / JNE |
| 397 | 7000:1cc1 | AGREE | 1CB0 k*16 + 31FAh; 1CC1 cmp byte [0],0 / JNE; 1CCA cmp byte [1],1 / JNE |
| 398 | 7000:1cdb | AGREE | 1CDB +32h+k := 1 |
| 399 | 7000:1ce8 | AGREE | 1CE8 cmp cls,5 / JNE 1D0C |
| 400 | 7000:1cec | AGREE | 1CEF +3Dh:=1, 1CF7 +44h:=1 |
| 401 | 7000:1cfc | AGREE | 1CFF +45h:=1, 1D07 +47h:=1 |
| 404 | 7000:1d15 | AGREE | 1D1C goldSum*0Ah (MUL word), CWD, IDIV nCls; 1D2C word +8Eh (money[3] gold) |
| 405 | 7000:1d3b | AGREE | 1D31 push c, push FFh, near call 4235 RollHitDice(c [BP+8], classBits [BP+6]); 1D41 +B1h:=AL |
| 406 | 7000:1d49 | AGREE | 1D49 +32h := +B1h |
| 407 | 7000:1d5c | AGREE | 1D55 push c; call 3F31 ConHpBonus (ShortInt in AL); 1D5F CBW; 1D60 word [bp-1Eh] |
| 408 | 7000:1d63 | AGREE | 1D63 cmp word,0 / JGE 1DB2 (signed) |
| 409 | 7000:1d69 | AGREE | 1D73 CWD/XOR/SUB = Abs; +nCls; 1D85 cmp hp_max(word) / JLE 1DA8 (signed) |
| 410 | 7000:1d9d | AGREE | 1D99 hp_max + conAdj, CWD, IDIV nCls; 1DA2 byte store |
| 411 | 7000:1da8 | AGREE | 1DAB +32h := 1 |
| 413 | 7000:1dc6 | AGREE | 1DC2 add conAdj; IDIV nCls; 1DCB store |
| 414 | 7000:1dcf | AGREE | 1DD2 +11Bh := +32h |
| 415 | 7000:1df0 | AGREE | 1DE8 +B1h IDIV nCls; 1DF5 store |
| 416 | 7000:1dfa | AGREE | 1DFA lcall stub 0085 -> DrawCombatStats |
| 417 | 7000:1dff | AGREE | 1DFF lcall stub 0085 -> DrawMoney |
| 418 | 7000:1e1c | AGREE | 1E04..1E1C push 'Keep this character? ' (cs:0545), 0Dh, 0Ah, 0Fh; AskYesNo; 1E21 -> [bp-16h] |
| 419 | 7000:1e24 | AGREE | 1E24 cmp 'Y' / JE 1E2D else JMP 1200 |
| 421 | 7000:1e2d | AGREE | 1E2D DrawCharacterSheet (stub 0085) |
| 422 | 7000:1e32 | AGREE | 1E32..1E3B SelectedChar := [bp-8]:[bp-6] |
| 424 | 7000:1e5a | AGREE | 1E3F..1E5A ReadBottomLine('Character name: ' cs:055B, 0Dh, 0Fh=15); 1E68 @StrAssign(c^, max 0Fh) |
| 425 | 7000:1e70 | AGREE | 1E70 cmp byte c^[0],0 / JE 1E3F |
| 426 | 7000:1e76 | AGREE | 1E76..1E8C saved := SelectedChar; SelectedChar := c |
| 427 | 7000:1e91 | AGREE | 1E90 push cs / call 33E7 PortraitMenu |
| 428 | 7000:1e95 | AGREE | 1E94 push cs / call 382D IconEditor |
| 429 | 7000:1ead | AGREE | 1E98 push c (var c [BP+0Ah]), '' (cs:04FE) -> WriteCharacter(var c, name) 7500:069E (ov17 decl.) |
| 430 | 7000:1eb2 | AGREE | 1EB2..1EBB SelectedChar := saved |
| 431 | 7000:1ec9 | AGREE | 1EBF push c, 11Dh; System.FreeMem; 1ECE..1ED1 RETF (end of CreateCharacter) |

Lines without their own anchor (checked with their neighbours): 324 (half-orc continuation, row 1288), 330/331 (`a`/`L` notation for the table bases computed inline at every use), the `begin`/`end` lines of the case arms, 381 (clamp definition: minimum first with JAE, then maximum with JBE - matches every clamp pair), 432..436 (port notes: signed JG/JLE for level/class tests, unsigned clamps - confirmed), 437..440 (1551 section: only entry JMP 1551 at 12E0, shared frame, RETF at 1ED1 - confirmed).

Completeness: every instruction 7000:1200..1ED1 belongs to one of the rows above (no unrepresented store, call or branch). 1ED2.. is data (string literals of part B).

## 2. Corrections

None. All 91 anchored statements AGREE (0 FIXED, 0 missing). Notes, no change needed:
- 1D5C ConHpBonus returns a ShortInt in AL (7000:3FAA `mov al,[bp-1]`, AH undefined); the caller sign-extends with CBW at 1D5F before storing the Integer `conAdj` - the signed reading in the pseudocode is right.
- 1C83 goldSum is a byte (`add byte [bp-21h]`), wraps mod 256; 1D15 then multiplies by 10 as a word and divides signed (IDIV) into the word `money[3]` (+8Eh).
- 1236 the racial-adjustment quirk is confirmed: [bp-17h] is only written by the race-list loop (0658 := 1, 065E inc, 0707 exit at 7) and is 7 at 1236, so no case arm (1, 2, 5, 6) ever matches.
