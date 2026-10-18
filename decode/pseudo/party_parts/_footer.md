## Coverage

| part | unit / range | routines | H | M | L |
|---|---|---|---|---|---|
| ov00 | 2000 heap-error handler | 2 | 2 | 0 | 0 |
| ov01 | 2500 title, lightning, credits | 4 | 4 | 0 | 0 |
| ov02 | 2A00 code wheel | 2 | 2 | 0 | 0 |
| ov11 | 5700 InitGameState | 2 | 1 | 1 | 0 |
| ov16a | 7000:0000..1F36 top menu, character creation (1551 = second half of CreateCharacter, split by Ghidra at a JMP) | 4 | 4 | 0 | 0 |
| ov16b | 7000:1F37..end drop, modify, train, add/remove, portraits, icon editor | 16 | 11 | 5 | 0 |
| ov17 | 7500 charlist, character/monster files, load/save game | 14 | 10 | 4 | 0 |
| ov20 | 8400 clock, rest | 16 | 15 | 1 | 0 |
| ov21 | 8900 encumbrance, coins, pool/share/take, treasure item builder, appraisal | 22 | 16 | 6 | 0 |
| ov06 | 3E00 shop | 5 | 5 | 0 | 0 |
| ov12a | 5C00:0000..1A18 effect handlers | 70 | 6 | 48 | 16 |
| ov12b | 5C00:1A19..end effect handlers, InstallEffectHandlers | 57 | 20 | 36 | 1 |
| **total** | 10 units | **214** | 96 | 101 | 17 |

**ov12 is not a training unit** (the provisional por-areas.md note): it is the active-effect handler unit. `InstallEffectHandlers` (5C00:31A2, called by ov11 InitGameState) stores 138 far pointers into `EffectHandler{g_682C}`/DS:6828+4t for effect types 01h..8Bh (58h left nil → a dispatch of type 58h would call 0000:0000); ov24 CallEffectHooks/RemoveEffect call them with an event code. "starts to train"/"is hardier" are messages of effect types 04h/07h. Types 80h..8Bh are item powers (second parameter is a `^TItem`). The type→handler table matches `combat_parts/ov24.pas.md`.

## Open items (unknowns)

Listed in detail in each `party_parts/<part>_notes.md` section (c) (≈70 items). Main ones:
- ov12: meaning of 16 L handlers (effect types whose spell/monster is not named by a string), event codes of some hooks; 9 + 5 quirks listed in the notes.
- ov11: meaning of ≈15 new-game default values; letter 'F' flag of POOL.CFG line 5 (`cfg_FullIntro`).
- ov02: whether the rune glyphs 41h..B0h match the printed wheel (needs a visual check against the PDF / DOSBox-X).
- ov16/ov17: TChar +85h/+ABh (AddNpcToParty sets +ABh := Random(256)); arguments of some ov17 callees.
- ov20: role of g_6DC0 (named PoolHasMoney by ov21: written by several routines, read nowhere).

## Cross-lane findings (code wins; for the owners)
- ECL.pas.md 2F00:1CCD: call is `MakeTreasureItem(typ, item)` (type pushed first) — ECL owner.
- VIEW.pas.md: `ListItem` (9D00) argument order printed reversed (bytes 9D00:000B/0022) — VIEW owner.
- SAVES.md: parameter order of WriteCharacter/ReadCharacter (7500:069E/0AEC) reversed; LoadGame/SaveGame erase each party member's roster .CHA/.ITM/.SPC files — por-saves.
- MONSTERS.md: LoadMonster (7500:0EC4) parameter order reversed; its colour roll is 1..6, not 0..5 — por-data.

## Self-check

1. **Per part (fork workers)**: each part re-read ≥ 10 % random statements against the asm/bytes (hdis), incl. call push orders: ov00 7/7, ov01 12, ov02 8, ov11 14, ov16a 24 (+8 push orders), ov16b 32 (+11), ov17 34 (13 push orders), ov20 27 (14 %), ov06 12 (16 %), ov21 41 (15 push orders), ov12a 36 (16 push orders), ov12b 26/26 (+14/14). Fixes found there were applied before the merge (ov06 VerticalListMenu list argument, ov20 StudyTick note, ov17 caller addresses). Samples are listed in the notes files, section (d).
2. **argcheck** (`decode/tools/argcheck.py` audit('PARTY'), PARTY_ARGCHECK.md): 1015 calls, OK 214, **MISMATCH 0**, UNSURE 801. The first run had 6 MISMATCH, all tool artefacts of two calls written on one line (the tool paired the second call's text with the first call's address; bytes at 7000:07BC..08A6 and 5C00:281A..2831 matched the pseudocode). Those lines were split to one call per line.
3. **Merge sample** (lane, seed 20261016, 12 random anchored statements of the merged file vs `hdis.py`): L984 7000:21B8 `field < 6` (cmp [bp-0Dh],6 / jb) OK; L4169 5C00:281A HasEffect(c,$62,p) pushes [bp+0Eh]:[bp+0Ch], 62h, ss:[bp-4] OK; L3229 5C00:02A3 `c^.con < 15` (es:[di+14h], 0Fh, jae) OK (SAVES +14h con); L2946 8900:2239 RecalcCharacter(SelectedChar) OK; L3740 5C00:15B5 AddEffect(HookOpponent,…) call OK; L3837 5C00:19CE ShowCharacterMessage call OK; L2370 8400:0E2E DrawText call OK; L3162 5C00:00E9 MessageDelay OK; L1801 7500:1244 FreeMem(p,size) pushes [bp-4]:[bp-6], [bp-2] OK; L2576 8900:07D7 money[k] (+88h + 2k) inc OK; L1163 7000:300D wounds := +32h − +11Bh (hp_max − hp per SAVES) OK; L748 7000:0D9C NewMenuList call OK. **12/12 OK.** Note: for call statements several parts anchor the CALL instruction rather than the first PUSH (allowed by the VIEW convention "or of the call that implements it").
