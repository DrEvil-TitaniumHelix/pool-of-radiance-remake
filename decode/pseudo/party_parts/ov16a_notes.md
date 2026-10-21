# ov16 part A notes (lane por-mod-party)

## (a) Routines

| routine | name | conf | evidence |
|---|---|---|---|
| 7000:0000 | FreeCharacter | H | frees +108h (16h B), item list (3Fh B, link +2Ah), effect list (9 B, link +05h), record (11Dh B), sets var ptr nil (7000:0012..00d9) — exactly the SAVES.md §1/§3 structures |
| 7000:0161 | PartyCreationMenu | H | "Choose a function ", 11 menu texts g_0619, "Quit to DOS ", called by MainProgram 0000:0127 before ecl_GameLoop; BEGIN/Load return |
| 7000:056C | CreateCharacter | H | "Pick Race/Gender/Class/Alignment", "Keep this character? ", "Character name: "; writes the new record with WriteCharacter(c,'') |
| 7000:1551 | (not a routine) | H | tail of CreateCharacter: only entry = `JMP 1551` at 7000:12E0 inside the ability case; same frame; returns through 7000:1ECE..1ED1 |

Counts: 3 routines + 1 split fragment; H 3. Ghidra missed the instruction `INC [BP-1Bh]` at 7000:120E (loop increment, reached
only from 7000:1BDE) — read from the bytes with hdis.py.

## (b) Globals named (requested from por-tooling)

| DS | name | conf | evidence |
|---|---|---|---|
| 0619 | MenuEntry | H | 11 × 2Ah: text string[40] (+0, first char drawn from 061A) + enabled byte (+29h = 0642, 066C, … 07E6); drawn at 7000:0242..02bb |
| 470C | StingMode | M | set to 1 only by key J when ParamStr(1) = 'STING' (7000:04cc) with "I Understand, master..."; enables Train (7000:01da); read by TrainCharacter (training) |
| 557D | GameSaved | M | cleared by every top-menu command except E/S (7000:0344); the Exit path loops SaveGame while it is 0 (7000:048f); written by SaveGame SaveGame (GLOBALS writers), read by ov00 HeapErrorHandler after SaveGame ("done := g_557D") |
| 3E17 | RaceClasses | H | race*12: count + class ids, used to build "Pick Class" (7000:0a47..0aee) and to map the choice (0b94) |
| 3FE7 | ClassAligns | H | class*10: count + alignment ids, "Pick Alignment" (0d89..0e30, 0ecd) |
| 3E5B | StartAge | H | race*28 + cls*4: word base + dice + sides → `age` (+30h) (0f26/0f30) |
| 3F31 | AgeCategory | M | race*10, 5 words compared with age before the ability adjustments; values are the AD&D age-category limits (human 20/40/60/90/120) |
| 3DA3 | RaceAbilityLimits | H | race*16: STR min/max/exc-max by gender, then min/max of INT, WIS, DEX, CON, CHA (13c8..1b72); also read by ModifyCharacter (Modify) |
| 3F81 | ClassAbilityMin | H | class*6 + ability: minimum raised to (1480, 162e, 17ba, 1927, 1a8a, 1b72); also ModifyCharacter |
| 3C7C | BaseThac0 | H | cls*11 + level, best value → base_thac0 (+2Dh) (0d17); also ov23 UpdateLevelStats |
| 05D6 | ClassMaskBit | H | cls → class_mask (+B0h) bits 02 10 08 40 80 01 04 20 (0d53); SAVES.md bits 0..3 MU/C/T/F confirmed, druid 10h, monk 20h, paladin 40h, ranger 80h new |
| 4263 | StartGoldDice | M | cls*2: (dice, sides) rolled once per class; gold +8Eh := sum*10 div classes (1c83, 1d2c) — AD&D starting gold values |
| 0F03, 0D38, 0FEC, 0F53 | RaceName, ClassName, GenderName, AlignmentName | H | string tables (SAVES.md); names as already used by other lanes |

Left as g_: g_0642/066C/0696/06C0/06EA/0714/073E/0768/07BC/07E6/0792 (the `enabled` bytes of MenuEntry 0..10 — write as
`MenuEntry[i].enabled`), g_05F0 (hot-key string), g_3CF5 (icon colour seeds 1..6, also read by CopyIconSlot and LoadCharacterIcon —
part B / ov17 owner), g_49F8 (set to 1 after a successful Load from this menu; read by ecl_GameLoop, written by ecl_InitVM/ov11 —
meaning L: "game was loaded"), `ecl_Mem6B00^.w[$550]` (ECL variable gating Train, L).

TChar facts confirmed/new for SAVES.md (por-data): `+AB` = Random(256) at creation (still unknown use); `+AA` := 1, `+A1` attacks := 2,
`+A3` := 1, `+A5` := 2 (bare-hand 1d2), `+72` := 12, `+A9` := 32h, `+6C` := 1, `+BB`/`+BC` := 1, `+10D` := 1, `+73` := 1 at creation;
`+C0` icon_size by race (Dwarf/Gnome/Halfling 1, others 2 — same rule as LoadMonster); `+B2`/`+B5` spell slots 1 for C / MU.

## (c) Unknowns
- Meaning of the racial effects added at creation (AddEffect types 5Ah, 61h Halfling; 5Ah, 61h, 1Ah, 2Fh Dwarf; 61h, 12h, 2Fh, 30h Gnome;
  6Bh Elf; 7Ch Half-Elf; duration 0, p3 FFh, callOnRemove 0). Handlers per type are in the ov24 table (EffConSaveBonusPoison, EffConSaveBonusMagic, EffDwarfAttackBonus,
  EffDwarfGiantDefence, EffGnomeAttackBonus, EffGnomeGiantDefence, EffResistSleepCharm90, EffResistSleepCharm30) — names belong to the ov12 parts (likely dwarf/gnome/halfling save bonuses,
  infravision, giant/goblin defences, elf sleep/charm resistance — L).
- `ecl_Mem6B00^.w[$550]` (Train availability) — ECL lane.
- `beginMode` = 4 written to game_Mode by BEGIN: meaning of mode 4 belongs to the ECL/ENGINE owners of game_Mode.
- Whether SaveGame can return with GameSaved = 0 (then "Quit to DOS" would re-enter SaveGame endlessly) — ov17 owner.
- The racial ability adjustments in the roll loop are dead code (they test `[BP-17h]`, the race-list loop variable = 7, not
  `c^.race`) — H that they never apply in this binary; whether the designers intended them is unknowable.
- Exact names/semantics of the part-B helpers RollHitDice (hit dice; bytes: Roll(g_08B6[k], g_08BE[k]) per class with
  `g_05DE[k] and mask`, level-1 minimum `2*sides div 3`) and ConHpBonus (CON adjustment `g_408E[con]`, +1/+2 for fighters with
  CON 17/18) — finalised by part B.

## (d) Self-check
Sample: 24 of ≈ 215 pseudocode statements (11 %), plus 8 call push orders, re-read against the bytes (hdis.py / ov16.lst):
1. 7000:0168 DataSet := 3; 016D beginMode := 4; 0175 StingMode := 0; 017A game_Mode := 0 — OK (hdis).
2. 7000:01a9 DrawTitledFrame pushes 1,1,26h,16h,0,0,'' — OK (RETF 10h in ENGINE = 6×2 + 4).
3. 7000:0273 DrawText pushes 2, row+0Ch, 0Fh, CharToStr(text[1]) — OK; 02bb pushes 3, row+0Ch, 0Ah, Copy(text,2,len−1) — OK.
4. 7000:02f8 HorizontalMenu pushes prompt, g_05F0, 0Dh, 0, 0, 1, 0, @ext — OK, 22 bytes = RETF 16h.
5. 7000:0314 set CS:00F6 = ['G','O'], 033d set CS:0116 = ['E','S'] — OK (bytes 0x00F6+8 = 80h → 'G'(47h) bit 7, 'O' (4Fh); 0116+8 = 20h 'E', +0Ah = 08h 'S').
6. 7000:0481 AskYesNo pushes 'Quit to DOS ', 0Eh, 0Ah, 0Fh — OK.
7. 7000:03e9 WriteCharacter pushes SelectedChar then '' — OK; WriteCharacter reads name at [BP+6], c at [BP+0Ah] (hdis ov17 069E).
8. 7000:03f5 RemoveFromParty pushes 0 then 1 — OK.
9. 7000:05ac icon_colours: ((g_3CF5[k]+8) shl 4) + g_3CF5[k] → +C0h+k — OK.
10. 7000:05e4..062a base_ac 32h, base_thac0 28h, status 0, active 1, head/body 1, size 1, unk_AB := Random(100h) — OK (hdis).
11. 7000:0677 ListItem pushes n then list; ov25 9D00:000B/0022 read list at [BP+6], n at [BP+0Ah] — OK, VIEW signature order is reversed (reported in the conventions).
12. 7000:0775 VerticalListMenu pushes '', '', 0Dh, 0Ah, 0Fh, 1, 2, 26h, 16h, list, [BP-22h], @[BP-23h], @[BP-12h], @[BP-10h] — OK, 40 bytes = RETF 28h.
13. 7000:078c `if index = 6 then Inc(index)` (CMP word 6, INC) — OK.
14. 7000:07ce AddEffect pushes c, 5Ah, 0 (word), FFh, 0 — OK, 12 bytes = RETF 0Ch.
15. 7000:0a29 gender := index − 1 — OK.
16. 7000:0b94 class := g_3E17[race*12 + index] — OK.
17. 7000:0bd0..0cb2 multi-class level bytes 96/98/9A/9B/9C — OK (each case re-read).
18. 7000:0d17/0d49 base_thac0 := max g_3C7C[cls*11 + level] (JBE skip when ≤) — OK.
19. 7000:0f26 Roll pushes byte +2 then +3 (dice, sides); age := Roll + word +0 — OK (hdis).
20. 7000:122e Roll(3, 6) — OK; 1236 compares [BP-17h] (race-list loop var), not c^.race — OK (only writes to [BP-17h]: 0658/065E).
21. 7000:1692 WIS: `CMP AX(t0), age; JC skip; DEC` → dec when t0 ≥ age — OK.
22. 7000:1814 WIS < 0Dh and class in CS:0525 set (bits 8..12) → 0Dh — OK.
23. 7000:1c51/1c60 +B2h := 1 for cleric, +B5h := 1 for MU; 1c83 Roll pushes g_4263[k*2], g_4264[k*2] — OK (hdis).
24. 7000:1d15..1d2c `+8Eh := (goldSum*10) idiv nCls` — OK; 1d3b RollHitDice pushes c then FFh — OK; 1e5a ReadBottomLine pushes prompt, 0Dh, 0Fh then StrAssign 15 into c^.name — OK.
Result: 24/24 statements and all 8 push orders match; corrections made during the check: ListItem argument order (now push
order), alignment table name unified with the existing `AlignmentName`.
