# ov16 part B notes (lane por-mod-party, fork ov16b)

## (a) Routines (16/16 of functions.tsv in 7000:1F37..4454)

| routine | name | conf | evidence |
|---|---|---|---|
| 7000:1F37 | DropCharacter | H | strings "Drop "/" forever? "/"Are you sure? "/"You dump "/" bids you farewell."/" breathes a sigh of relief."; calls RemoveFromParty |
| 7000:2033 | DrawModifyField | M | nested (static link [BP+6]); DrawAbility(field, hl) for field < 6, DrawHP(SelectedChar, 4, 12h, hl) otherwise |
| 7000:209F | ModifyCharacter | H | "Modify character: ", "Keep Exit", " can't be modified."; edits +10h..+16h, +32h within RaceAbilityLimits/ClassAbilityMin |
| 7000:29AE | TrainCharacter | H | training strings; XP table, hall mask `ecl_Mem6B00^.w[$550]`, level increment, UpdateLevelStats, HP gain |
| 7000:306D | AddCharacterMenu | H | "Add a character: ", "Add Exit"; roster list (ReadCharList), ReadCharacter, AddToParty, 6 PC / 8 member limits |
| 7000:3291 | RemoveFromParty | H | unlinks SelectedChar from PartyHead list (+104h), frees it (FreeCharacter), decrements `w[$67C]` |
| 7000:33E7 | PortraitMenu | H | "Head Body Keep"; cycles +BBh (1..14) / +BCh (1..12), ShowPortrait |
| 7000:34DF | DrawIconPreview | M | nested in IconEditor; FillPictureRect + DrawIconAt slot 25 / slot 12, poses 0/1 |
| 7000:35BE | CopyIconSlot | M | nested; Move of TPicture +17h pixels and +13h mask between CombatIcons slots, RecolorPicture with +C1..+C6 |
| 7000:382D | IconEditor | H | "old", "ready   action", "new", "Small"/"Large", "Hair"/"Face", "ICON", "Is this icon ok? "; menu table DS:07BF |
| 7000:3F31 | ConHpBonus | H | ConHpAdj[CON] per class, +1 at CON > 16 / > 17 for class 2 (AD&D CON table) |
| 7000:3FB3 | MinHitPoints | M | Σ levels (+1 ranger/monk) + CON adj, div #classes; clamp in ModifyCharacter |
| 7000:408C | MaxHitPoints | M | Σ level × die max (8/8/10/10/(L+1)8/4/6/(L+1)4) + CON adj, div #classes |
| 7000:4235 | RollHitDice | H | Roll(HitDiceCount[cls], HitDieSides[cls]) per class in the bit mask, level-1 floor 2/3 |
| 7000:42ED | PayGold | H | gold × 200 copper, pays from CoinValue[0..] upwards, change from platinum down |
| 7000:4454 | ov16_init | H | empty unit init |

Counts: H 11, M 5, L 0.

## (b) Globals named (ov16b_names.json)

| DS | name | conf | evidence |
|---|---|---|---|
| 470C | StingMode | M | set to 1 by PartyCreationMenu only for key 'J' when `ParamStr(1) = 'STING'` ("I Understand, master...", 7000:04ad..04e1), cleared at 7000:0175; makes TrainCharacter skip status/money/XP/hall checks and the 1000 gp payment |
| 3DA3 | RaceAbilityLimits | H | 16 B per race read at 7000:221a.. (min) and 25aa.. (max); data = AD&D racial limits (human 18/00 male, 18/50 female) |
| 3F81 | ClassAbilityMin | M | `+class*6 + stat` at 7000:2241, 22be, 2331, 23c2, 2435, 24eb; data match AD&D class minima (cleric WIS 9, paladin CHA 17, ...) |
| 409B | XpForLevel | H | `+cls*38h + lvl*4` LongInt compared with TChar +ACh xp (7000:2ba8, 2c24); values = PoR level XP; −1 = cap (cleric/MU 6, fighter 8, thief 9) |
| 05DE | ClassTrainBits | H | per base class, AND'ed with the hall mask `w[$550]` and the trained set (7000:2a59, 2cae, 2da2, 4263); values = class_mask bits |
| 408E | ConHpAdj | H | indexed by CON (7000:3f69); −2/−1/0/+1/+2 = AD&D CON HP adjustment |
| 08B6 | HitDiceCount | H | first Roll argument (7000:4270) |
| 08BE | HitDieSides | H | second Roll argument and level-1 floor (7000:427b, 42a5) |
| 07BF | IconMenuText | M | string[40] table `+state*29h` used as menu options (7000:39da); Delete/Insert at 083A (state 3) |
| 3CF5 | IconColourSlot | M | colour index per icon colour slot (7000:3732, 375e); also read by ov16 part A (056c) and LoadCharacterIcon |

Existing names used: SelectedChar 5D92, PartyHead 5D96, ecl_Mem6B00 49D6, VideoMode 4A1E, travel_Mode 49FA, CombatIcons 5E5A, ClassName 0D38, CoinValue 0D24. Left as g_: `g_260A` (CGA colour map for FillPictureRect, also DrawBackdrop), `g_4A20` (screen picture, VIEW).
ECL variables used (ECL lane to name): `ecl_Mem6B00^.w[$550]` = training hall class mask (H for the use), `ecl_Mem6B00^.w[$67C]` = party member count (SAVES §2 already says "+67Ch party member count").

**globals request (for the lane block):** please adopt the 10 DS names above from ov16b_names.json (StingMode 470C is M; the parent should reconcile with ov16 part A, which writes the flag).

## (c) Unknowns
- The parameter of `LoadCharacterIcon` (0 here in the editor, 1 after AddToParty) — ov17 owner.
- Meaning of ReadCharacter's last two byte arguments (false, true when reading a roster `.CHA`) — ov17 owner (SAVES.md gives `(fromSave, isSav ...)` in Ghidra order).
- TChar +85h (unk_85) is set to 1 by "Keep" in ModifyCharacter; TChar +ABh (unk_AB) is part of the duplicate test in AddCharacterMenu — meanings unknown (L).
- TChar +10Dh `active` = 0 selects "You dump <name> out back." (dead/inactive body) vs "bids you farewell." — SAVES gives `active` (M).
- CombatIcons slot 25 drawn behind the preview in non-CGA modes (backdrop tile? COMSPR?) — L.
- Exact units of FillPictureRect x/w (cells) vs y/h (pixel lines) in DrawIconPreview — follows the ENGINE note on DrawBackdrop (M).
- FreeCharacter (free character) and FUN_7000_1551 (creation, caller of PortraitMenu/IconEditor/RollHitDice/ConHpBonus) belong to ov16 part A.

## (d) Self-check
Sample: 32 statements drawn with `random.seed(16)` from the 373 `{ 7000:xxxx }`-annotated lines of ov16b.pas.md (8.6 %), each compared with the instructions at its address in ov16.lst, plus 8 call push orders re-read from the bytes with `decode/ecl/hdis.py ov16` (together > 10 %).
- Statements (all OK): 327e WriteRoster; 3867/3871 c, state := 1; 38e5 CopyIconSlot; 2f5a UpdateLevelStats; 34d6 ClearMenuLine; 2ca7 StingMode test; 36d3 recolour test; 1f81 AskYesNo = 'Y'; 347d body_pic < 12 (JNC); 40b5 level > 0 (JG); 43b8 due < 0 (JL / zero skips); 2e98 AskYesNo; 2d0f trainBits AND w[550]; 3fc2/3fc6 n, sum := 0; 2c32 nextXp > 0; 1fde dump message; 2fb1 RollHitDice; 2fe8 ConHpBonus (CBW = signed); 318a AddToParty; 415c MU ×4; 2786 MinHitPoints > hp_max (JBE skip); 3e8a CopyBytes; 3031 hp := hp_max − wounds; 2065 DrawHP; 2c24 XpForLevel[lvl+2]; 2dac row + 1, = 5 test; 2039 field < 6 (JNC); 281e MaxHitPoints < hp_max (JNC skip); 3eb4 CopyIconSlot(12, slot, false); 3f8a CON > 17 and class = 2; 20e2 DrawCharacterSheet; 385a PaletteFlashOn.
- Push orders (all OK): 2d4f DrawCharacterName(SelectedChar, 4, row, 0); 2d76 DrawText(len+4, row, 0Ah, ' will become:'); 313f ReadCharacter(item text, newC, 0, 1); 3ee0 LoadCombatIcon('ICON', 0, 0Bh); 3795 RecolorPicture(from [BP−12h], to [BP−22h], 0, 0, CombatIcons[dst]); 2169 HorizontalMenu('Modify character: ', 'Keep Exit', 0Dh, 0Ah, 0Fh, 1, 0, @ext); 4018 ConHpBonus(c); 2f81 SpellList(4, 4, @index, @count); also 4280 Roll(g_08B6[cls], g_08BE[cls]), 2ecf PayGold(1000 as DX:AX, SelectedChar), 30fb VerticalListMenu (13 args incl. uninitialised [BP−14h], confirmed: [BP−14h] has no write in 306D).
- Corrections made during the pass: none needed after the sample; earlier during writing the CON increase/decrease clamp (408C vs 3FB3) was checked against 7000:2472 / 2786 and written per the bytes.
