# ov07 (4300) — notes: names, globals, unknowns, ECL_VM.md disagreements, self-check

Coverage: 33 / 33 functions of `functions.tsv` (32 routines + ov07_init); data blocks listed at the end of ov07.pas.md.

## (a) Routines
All names are the current `ecl_names.json` names (reference), kept; each was checked against the asm in this pass.

| routine | name | conf | evidence (asm, this pass) |
|---|---|---|---|
| 4300:0000 | ecl_ReadOperands | H | type-byte decoder 1/2/3/80h/81h, string slot counter, PC+1 at end (4300:012c) |
| 4300:0136 | ecl_OperandValue | H | CBW index, type 0 / 1,3,80h (GetMem) / 2,81h (MakeWord) |
| 4300:01B6 | ecl_InitVM | H | `ecl_PC := 9900h`, five ReadOperands(1)+MakeWord → ecl_VecA..E |
| 4300:0341 | LoadEclBlock | H | "Loading...Please Wait", 'ECL'+DataSet+'.dax', record id = parameter, Move(+2) into ecl_CodeBuf |
| 4300:0411 | ecl_LoadMonsterRec | H | GetMem(11Dh), LoadMonster, returns +C8h/+7Fh lists |
| 4300:0482 | ApproachDistance | H | GetWallType steps, max 2, 2 when `Mem[49E6] = 0` |
| 4300:0511 | ShowHeadBodyPicture | H | stores pic_HeadId/pic_BodyId, LoadPortrait + DrawPortrait(3,3,True) |
| 4300:054E | ShowEncounter | H | SPRIT animation + Show3DSprite, PIC close-up or portrait at distance 0 |
| 4300:06AF | MakeWord | H | `hi*256 + lo` |
| 4300:06D3 | ecl_SixBitChar | H | `c > 1Fh ? c : c + 40h` |
| 4300:06FB | ecl_MemRegion | H | 4900/6B00/9700/9900 ranges |
| 4300:0756 | PartyIndexOf | H | list walk with counter |
| 4300:07BC | ecl_GetCharField | H | case table (ECL_VM.md §3.1) |
| 4300:0A74 | ecl_SetCharField | H | case table |
| 4300:0C77 | ecl_SetMem | H | region store, region-4 engine variables |
| 4300:0E0C | ecl_GetMem | H | region load, region-4 engine variables |
| 4300:0F53 | ecl_SetMemString | H | per-region 0-terminated string store |
| 4300:1153 | ecl_UnpackString | H | 6-bit unpacking (phases 1..4) |
| 4300:12FB | ecl_GetMemString | H | per-region string load |
| 4300:156D | MenuHotkeys | H | `~` hot-key extraction, set constant CS:154D |
| 4300:1684 | MenuSelect | H | HorizontalMenu loop, index lookup, 0FFh for non-hot keys |
| 4300:1788 | VerticalListMenu | M | wrapper of 9D00:0D9A — **name collides** with VIEW's 9D00:0D9A VerticalListMenu (see d) |
| 4300:1815 | ecl_CompareStrings | H | six @StrCompare tests into ecl_FlagEQ..GE |
| 4300:18EB | ecl_CompareWords | H | six unsigned word tests |
| 4300:1951 | ecl_Gosub | H | 6-byte heap node push, PC := operand address |
| 4300:19DB | StepForward | H | wrap 0..15 by party_Dir, update party_CellAttr / party_Ahead |
| 4300:1A6F | SetupDuel | M | DuelActive := 1; ROLF copy with CPIC icon 0Bh (strings CS:1A65/1A6A) |
| 4300:1CC3 | ScaleMoney | H | 7 money words × Real, Trunc |
| 4300:1DF0 | LoseItemsChance | H | cumulative weight penalties, 1d100 ≤ p → LoseItem |
| 4300:1EA6 | ecl_SkipInstruction | H | skip table (ECL_VM.md §2.4) |
| 4300:1FB1 | PartyMoveRange | H | min/max move, effect 27h ×2, 2Ah ÷2 |
| 4300:20CC | ApplyEclDamage | H | strings " is hit FOR ", " points of Damage.", " dies. " |
| 4300:2215 | ov07_init | H | empty init |

No new routine names: ov07_names.json holds only three globals. (Earlier in this lane's brief `ecl_names.json` named 4300:0511 `ShowEncounterSprite` and 4300:1A6F was unnamed; the current file already has `ShowHeadBodyPicture` and `SetupDuel`, both consistent with the asm: 0511 loads/draws a HEAD/BODY portrait via LoadPortrait/DrawPortrait, not a sprite.)

### (a2) Callees of other units (published names; arguments re-checked against the push sequence)
RefreshView, LoadAnimation(name, id, flags, var anim), Show3DSprite(k, anim), DrawPictureScreenOrView(col, row, toView, pic), LoadPortrait(head, body), DrawPortrait(col, row, both), LoadCombatIcon(name, id, slot), HorizontalMenu(prompt, options, promptColour, hotColour, textColour, allowExt, animate, var ext), VerticalListMenu 9D00:0D9A (14 args), ClearMenuLine, GetWallType(x, y, dir), GetCellAttr(x, y), LoadWallSet(id, slot) — VIEW; DrawText(col, row, colour, s), DrawWrappedText(x1, y1, x2, y2, colour, clear, s), ShowBottomPromptAndReadKey(colour, s), ClearTextRectangle(x1, y1, x2, y2), DrawPartyRoster(sel), ApplyDamage(c, dmg), LoseItem(c, item), SetDataSet(n), HasEffect(c, id, var e), LoadDaxRecord(name, ext, id, var size, var p) — ENGINE; Roll(n, s) — ov24 (ecl_names); unpublished: LoadMonster (LoadMonster(id, var rec), MONSTERS.md), CycleSelectedChar (extended-key handler of the character screens, M).

## (b) Globals
Named here (ov07_names.json):
| DS | name | conf | evidence |
|---|---|---|---|
| 84E0 | view_RedrawPicture | M | set 1 when a close-up picture covers the view (ShowEncounter 4300:0636, PICTURE 2F00:08B2); PICTURE FFh / SPRITE_OFF / CALL 2C90h treat it as a redraw request together with view_RedrawParams/Pos/Portrait (84E5/84E6/84E8, ecl_names) and clear it after RefreshView; ecl_InitVM clears it |
| 6F68 | backdrop_Key3 | M | ECL C059 write target (4300:0de2), default 41h (4300:01d0); RefreshView derives backdrop colour 3 from it (VIEW.pas.md A200:016D, a200:01d9..01f1) |
| 6F69 | backdrop_Key12 | M | ECL C05F write target (4300:0df4), default 09h; RefreshView derives backdrop colours 1 and 2 from it |

Used with other lanes' names (not repeated): ecl_* VM state, enc_SpriteShown/enc_PictureShown/enc_SpriteOnScreen/enc_LastHeadId/enc_MenuActive/enc_NextIconSlot/enc_SpriteId/enc_PicId, pic_HeadId/pic_BodyId, DuelActive, text_Col/text_Row, view_RedrawParams/Pos/Portrait, MonstersPresent (ecl_names); NoDiskPrompt g_557C (engine_names); opt_MonsterPics g_49F6 (magic_names); party_*, view_AreaMap, travel_Mode, enc_Anim (view_names).

## (c) Unknowns
1. g_84E1 (cleared by ShowHeadBodyPicture and the PIC/portrait path, set elsewhere by ov03), g_84D2/g_84D3 (set when ECL writes 0 to 6C00/6B00, consumed by LOAD_CHARACTER), g_84E2, g_70C6, g_84CC/84CE/84D0 (ECL 03DE/00B8/00B9 writes), g_6F6A/6F6C/6F6E (ECL 00FB/00FC/00B1 reads), g_49F8 (resume flag, ECL_VM §5).
2. ECL reads of 035F, C059 and of unlisted region-4 addresses return an uninitialised local (`[BP-2]`), as do GetCharField 6C0D and the CHA reaction table for CHA < 3 or > 25 — a faithful port must decide a value (garbage in the original).
3. CycleSelectedChar exact role (called for extended keys inside MenuSelect).
4. Meaning of TChar +B8h/+BAh when written by ECL (SAVES.md calls them xp_value/xp_per_hp; scripts may use them otherwise).

## (d) Disagreements and cross-area questions
**ECL_VM.md vs asm** — no semantic disagreement found; every row of §2, §2.4 (skip table byte for byte), §3, §3.1, §3.2 and §3.3 that concerns ov07 matches. Notation/omission issues only:
- D1 §2 pseudocode writes `ecl_UnpackString(k, OpLo[i])`; the asm pushes `len` then `k` (4300:00b3..00bc): Pascal order is `(len, slot)`.
- D2 §2 pseudocode writes `ecl_GetMemString(MakeWord(OpHi[i], OpLo[i]), k)`; asm: `MakeWord(OpLo[i], OpHi[i])` (lo pushed first, 4300:00f7) and `ecl_GetMemString(k, addr)` (k pushed first, 4300:0116). Same value; §1's table also lists `(a, slot)`.
- D3 §3.1 writes `LoadWallSet(slot 1/2/3, v and 7Fh)`; Pascal order is `LoadWallSet(id, slot)` (4300:0c1f pushes `v and 7Fh` then the slot; VIEW signature id [BP+8], slot [BP+6]).
- D4 §4.4 writes `ShowEncounter(DS:84C8, 6DC1, 6F82, 6F81)` and `ShowHeadBodyPicture(p, 6DE1)`; Pascal order is `ShowEncounter(enc_SpriteId, enc_PicId, Mem[6DC1], enc_SpriteShown)` and `ShowHeadBodyPicture(Mem[6DE1], p)` (head first, 4300:068a).
- D5 omissions: LoadEclBlock also clears `NoDiskPrompt` and shows "Loading...Please Wait" on row 24 on each attempt; ApproachDistance writes `Mem[6DC1] := 2` when not in a 3D area; ecl_InitVM sets the gosub pointer to nil without freeing a non-empty stack.

**ECL.pas.md (por-mod-ecl) vs asm**:
- E1 ApplyEclDamage: ECL.pas.md writes `num := Str(dmg:3)` (width 3). The asm pushes width **0** and capacity 3 (`@StrLong` [BP+0Ch] = 0, [BP+6] = 3, 4300:20ed/20f6; System 0AF8:1385 takes width from [BP+0Ch]). So the message is `is hit FOR 5 points of Damage.` — **no padding** (exact text matters for acceptance).
- E2 ECL.pas.md writes `LoadWallSet(1, v and $7F)` and `ShowBottomPromptAndReadKey('press…', $0F)`: Pascal orders are `(id, slot)` and `(colour, s)`.
- E3 LoadEclBlock `Str(DataSet:1, ds)`: width 0, capacity 1 (no visible difference).

**Other lanes**:
- X1 VIEW.pas.md `Show3DSprite(anim [BP+8]; k [BP+6])`: AC00:0708 reads `k` at `[BP+0Ah]` (0721) and the TAnim pointer at `[BP+6]` (070e); callers push k first (4300:05cc). Correct signature: `Show3DSprite(k [BP+0Ah]: Byte; anim [BP+6])`.
- X2 Name collision: ecl_names.json `4300:1788 VerticalListMenu` and view_names.json `9D00:0D9A VerticalListMenu` (the routine it wraps). One must be renamed (suggest `EclVerticalMenu` or `VerticalMenuHotkeys` for 4300:1788) — for por-tooling / por-ecl.
- X3 SAVES.md TChar +11Ch / effect table: SAVES says effect 27h halves and 2Ah doubles movement (DrawCombatStats); PartyMoveRange doubles for 27h (`SHL` 4300:2012) and halves for 2Ah (`SHR` 4300:2035). Already flagged by ECL.pas.md; confirmed on the bytes.
- X4 SAVES.md TChar +10Fh `controlled`: SetupDuel's ROLF copy gets side 1 + controlled 1; with ov09's evidence (+10Fh ≠ 0 → AiCombatTurn) the field is the computer-control (Quick) flag (see ov09_notes §d1).

## Self-check
Sample: 40 of 439 statement addresses (9.1 % of addresses, > 10 % of statements since many addresses cover several), drawn with Python `random.seed(707)`: 4300:0006 009d 0156 022c 035a 0406 07c2 091b 095a 0ae5 0bff 0d45 0dd6 0ed0 0eff 0f2c 0f89 0ff2 1017 115a 11a1 1217 130c 1327 146b 14ce 1730 177b 17b6 18b5 18cd 1940 197d 199b 19ae 1a94 1b58 1cf0 1e1f 218e. Each address was confirmed to be an instruction start in ov07.lst and the statement re-read against the following instructions: **40/40 correct**. Second draw (`random.seed(708)`, 6 new addresses: 4300:0488 0c87 1933 1c7b 20ff 21b9): **6/6 correct** → 46 of 439 addresses (10.5 %). Additional targeted re-checks (all against bytes): the IF skip table (all 8 groups), @StrLong width/capacity (E1), push order of every external call (§a2), MakeWord operand order, region-4 `JNC` bounds BF68h/C04Bh.
Fix made during the pass: `g_557C`/`g_49F6` replaced by the published names NoDiskPrompt / opt_MonsterPics after the listing re-export.

## Normalisation pass
1. **Callee names**: 9 local behaviour aliases replaced by published names (PrintAt→DrawText, PrintWrapped→DrawWrappedText, PromptKey→ShowBottomPromptAndReadKey, ClearRect→ClearTextRectangle, RedrawRoster→DrawPartyRoster, TakeDamage→ApplyDamage, SelectDataSet→SetDataSet, LoseItem and HasEffect kept as published), 1 alias reverted to its unpublished name (LoadMonster→LoadMonster); 2 globals renamed to published names (NoDiskPrompt, opt_MonsterPics). Conventions paragraph rewritten to list the published names with their signatures.
2. **Argument order**: all 35 far-call sites (26 distinct callees) plus the 9 near calls into ov07 routines re-checked against the push sequence and the published signatures (VIEW.pas.md, ENGINE.pas.md): **0 order errors in ov07.pas.md**; 1 error found in another lane's signature (X1 Show3DSprite) and 3 notation-order differences in ECL_VM.md/ECL.pas.md (D1–D4, E2).

3. **Sibling names (not yet published)**: the por-mod-combat siblings' `ov13_names.json` / `ov19_names.json` / `ov24_names.json` (combat_parts, unmerged) name routines that ov09/ov07 still write as `ovNN_XXXX`. For the merge, rename: CalcMove CalcMove, StepCombatant StepCombatant, AttacksOfOpportunity AttacksOfOpportunity, Flee Flee, CalcAttacks CalcAttacks, FighterSweep FighterSweep, CanAttack CanAttack, TurnUndead TurnUndead, FindTurnTarget FindTurnTarget, FaceAttacker FaceAttacker, Attack Attack, FindHealTarget FindHealTarget, BeginCast BeginCast, DirectionTo DirectionTo, MaxEnemyMove MaxEnemyMove, AutoTarget AutoTarget, GodsIntervene GodsIntervene, ReadyItem ReadyItem, UseItem UseItem, CycleSelectedChar CycleSelectedChar, RemoveEffect RemoveEffect, CallEffectHooks CallEffectHooks, StinkingCloudCheck StinkingCloudCheck, RemoveFromCombat RemoveFromCombat (ov24_1041, ov22_* unnamed). Behaviour stated in §a2 agrees with those names.
