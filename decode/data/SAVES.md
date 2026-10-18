# Saves, character record, item and effect records — FINAL (Opus-verified)

Owner: por-data (verifier/finalizer of the codex draft `SAVES.draft.md`, which is kept unchanged as the comparative-evidence appendix: hashes, per-byte value counts, A/B/J diffs, full dumps).
Addresses: resident `SEG:OFF` (unpacked START.EXE), overlays `ovNN_XXXX` / `SEG:OFF` from `decode/listings/`. `DS:xxxx` = data segment 0C7C (Ghidra `DAT_10bf_YYYY` = `DS:(YYYY+4430h)`, see GEO.md). Confidence: **H** = read in code (and consistent with all data), **M** = code shows use but the meaning is inferred, or strong data match, **L** = hypothesis.
Draft corrections are marked **[corr]**.

## 1. Files and the routines that read/write them — H

| file | written by | read by | content |
|---|---|---|---|
| `SAVE\SAVGAM<x>.DAT`, x = A..J | `ov17_1D58` SaveGame ("Save Which Game:", "A B C D E F G H I J") | `ov17_1602` LoadGame ("Load Which Game:") | game state, §2 |
| `SAVE\CHRDAT<x><n>.SAV` + `.ITM` + `.SPC` (n = party position 1..8) | `ov17_069E` WriteCharacter(name ≠ '') from SaveGame | `ov17_0AEC` ReadCharacter(…, ext '.sav') from LoadGame | one party member |
| `SAVE\<name>.CHA` + `.ITM` + `.SPC`, `SAVE\charlist.txt` | `ov17_069E` WriteCharacter(name = '') — roster ("Add a character", training hall) | `ov17_0AEC`(…, ext '.cha'), `ov17_0010` reads charlist.txt | stored characters |

Save directory = `DS:537A` (Pascal string, created with MkDir by `FUN_7500_02AE`; drive letter `DS:537B` in "Put save disk in X:"). The roster file `charlist.txt` (`ov17_0010` read / `ov17_01B8` write) is a text file, one character name per line (`ReadStr(40)`), entries whose 2nd char is `*` are not written back.

### WriteCharacter `ov17_069E(name: string[8]; var c: TChar)` — H
```pascal
if name = '' then  begin {roster} add c.name to charlist.txt; file := SaveDir + c.name(8.3-safe, 0802:0356/0425) ; ext := '.cha' end
else               begin file := SaveDir + name; ext := '.sav' end;
repeat Assign(f, file+ext); Rewrite(f,1) until IOResult = 0;      { "Put save disk in X:" on error }
BlockWrite(f, c, $11D);  Close(f);                                 { the 285-byte record, raw }
if Exists(file+'.itm') then Erase;  if c.items  (+C8h) <> nil then write every item, $3F bytes each, following +2Ah links
if Exists(file+'.spc') then Erase;  if c.effects(+7Fh) <> nil then write every effect, 9 bytes each, following +05h links
```
So **.ITM = n × 63-byte item records, .SPC = n × 9-byte effect records, headerless, in list order**; an absent list means an absent file (explains the draft's "missing sidecars": e.g. CHRDATB5.ITM, A4/A5 .SPC) — H.

### ReadCharacter `ov17_0AEC(fromSave, isSav: boolean; var c: TChar; name)` — H
BlockRead 285 bytes into `c`; then clears the in-memory pointers `+104h, +106h, +C8h, +CAh, +7Fh, +81h, +108h, +10Ah` (all four far pointers); if `.itm` exists: read 63-byte records until EOF, relink at +2Ah; same for `.spc` (9 bytes, link at +05h). **[corr]** therefore every byte at +7F..+82, +C8..+CB, +104..+10B in a file is a stale pointer from the moment of saving (the draft's high-entropy "unk_81", "unk_CA", "unk_106" are pointers, not data).

## 2. SAVGAM<x>.DAT (13,137 bytes) — H

Order of BlockWrite in `ov17_1D58` = BlockRead in `ov17_1602`:

| file off | size | source | meaning |
|---|---|---|---|
| 0 | 1 | `DS:5376` | current data set / disk number (suffix of every DAX name) |
| 1 | 2048 | `DS:49D2^` | game-state block 1 (ECL variable area; contains +18Ah current map id (Load3DMap), +1F8h ← `DS:49E2`, +1FEh ← `DS:49F6`*2 + `DS:49F5`, +3F4h..+3F8h wall-set id per slot 1..3, +3FAh..+3FEh their slot numbers) |
| 2049 | 2048 | `DS:49D6^` | game-state block 2 (+594h flags, +624h ← DS:5376, +67Ch party member count) |
| 4097 | 1024 | `DS:49DA^` | 1 KB block (semantics: ECL lane) |
| 5121 | 7680 | `DS:49DE^` | the loaded ECL script buffer (0x1E00, see INDEX.md ECL container) |
| 12801 | 5 | `DS:6AAD` | party position: +0 x, +1 y, +2 facing, +3 passage, +4 cell attribute (GEO.md) |
| 12806 | 1 | `DS:49FA` | mode byte (`< 2` → 3D area: LoadGame reloads the map/wall sets) (M) |
| 12807 | 1 | `DS:49F3` | game mode/state byte (`= 2` disables saving in some state, `= 5` used by ov22) (M) |
| 12808 | 1 | local | number of party members k |
| 12809 | 328 | local | 8 × string[40] (41 B): file names `CHRDAT<x><n>` of the members, slots 1..k used |

Sum = 1+2048+2048+1024+7680+5+1+1+1+328 = **13,137** = size of SAVGAMA.DAT (H). LoadGame then calls ReadCharacter for each name, `ov17_1446` AddToParty, `ov17_0482` (load combat icons), restores wall sets and the map.

## 3. Character record TChar — 285 bytes on disk (0x11D), same layout in memory — H unless noted

Main readers used as evidence: `ov19_004A` (character sheet: "Age STR INT WIS DEX CON CHA Level Exp Weapon Armor Status"), `ov19_0608` (AC/HP/THAC0/Damage/Encumbrance/Movement), `ov19_0901` (one ability line), `ov19_050D` (money), `FUN_00BA_0BB8` **RecalcCharacter** (derived fields), `FUN_00BA_0000` (weapon → THAC0/damage), `FUN_00BA_01FB` (armour → movement), `FUN_00BA_0282` (item → AC parts), `FUN_00BA_03A0` (encumbrance → movement), `FUN_00BA_0973` (HP display), `FUN_00BA_08EF` (AC display), `ov22_059C` (spell lists), `FUN_6100_1406` (melee attack), `ov12_0233` ("is hardier"), `ov17_0EC4` LoadMonster, `ov17_1446` AddToParty, `FUN_4300_07BC` (ECL read of character variables).

String tables read from the image (DS offset, entry size): race `DS:0F03`/10, class `DS:0D38`/27, gender `DS:0FEC`/7, alignment `DS:0F53`/17, status `DS:1047`/13, money `DS:0FFA`/11.

| off | size | name | type / values | evidence | conf |
|---|---|---|---|---|---|
| 00 | 16 | `name` | string[15] (len byte + 15) | printed by FUN_00BA_1816 in ov19_004A; StrCompare with charlist names (ov17_0010) | H |
| 10 | 1 | `str` | 3..18(25) | ov19_0901(0): `+10h+i`, i = 0..5 in the order STR INT WIS DEX CON CHA (labels at 0709:000B..0024) | H |
| 11 | 1 | `int` | | ov19_0901(1) | H |
| 12 | 1 | `wis` | | ov19_0901(2) | H |
| 13 | 1 | `dex` | | ov19_0901(3) | H |
| 14 | 1 | `con` | | ov19_0901(4); ov12_0233 "is hardier": `inc(+14h)`, HP recalculated | H |
| 15 | 1 | `cha` | | ov19_0901(5); ECL var → reaction table (FUN_4300_07BC case 2CFh) | H |
| 16 | 1 | `str_exc` | exceptional strength 1..100 (100 shown "00") when STR = 18 | ov19_0901: shown only if `+10h = 18` and `+16h <> 0`; `'d'` (100) → "00" | H |
| 17 | 21 | `mem_spell[0..20]` | memorised spell ids; **bit 7 set = slot chosen but not yet memorised** | ov22_059C: mode 0 (Cast) lists entries `<> 0` and `< 80h`, mode 5 lists entries `>= 80h` | H |
| 2C | 1 | `rest_need` | 0 nothing pending, 4 spells pending to memorise/scribe, 6 one of them is level ≥ 3; rest time = rest_need·60 + 15·Σ pending levels (minutes) | RestTimeNeeded 6B00:0000 (MAGIC.pas.md) | H |
| 2D | 1 | `base_thac0` | stored as 60 − THAC0 (28h = THAC0 20) | Recalc: `+110h := +2Dh`; FUN_00BA_0000 | H |
| 2E | 1 | `race` | 0 Monster, 1 Dwarf, 2 Elf, 3 Gnome, 4 Half-Elf, 5 Halfling, 6 Half-Orc, 7 Human | ov19_004A: string `DS:0F03 + race*10` | H **[corr: draft "class candidate"]** |
| 2F | 1 | `class` | 0 Cleric, 1 Druid, 2 Fighter, 3 Paladin, 4 Ranger, 5 Magic-User, 6 Thief, 7 Monk, 8 C/F, 9 C/F/MU, 10 C/R, 11 C/MU, 12 C/T, 13 F/MU, 14 F/T, 15 F/MU/T, 16 MU/T | ov19_004A: string `DS:0D38 + class*27` | H **[corr: draft "race/alignment"]** |
| 30 | 2 | `age` | word, years | ov19_004A: "Age " + Str(word +30h) | H |
| 32 | 1 | `hp_max` | | FUN_00BA_0973 colours HP if `+11Bh < +32h`; ov12_0233 adds to both | H |
| 33 | 56 | `known_spell[1..56]` | byte per spell id (`+32h + id`, id 1..38h): ≠0 = in spell book | ov22_059C mode 1 (`id 1..37h`) and mode 4 Learn (`id 1..38h`, `+32h+id = 0`) | H |
| 6B | 1 | `fighter_lvl_eff` | Recalc: := fighter level `+98h` if ≥ 1 and race ≠ 0, else 1 (used for multiple attacks / ECL) | FUN_00BA_0BB8 end | H (use: M) |
| 6C | 1 | `size` | 1 = man-sized for every PC; melee against it uses the weapon's *vs-large* dice when `> 80h` or `(and 7) > 1`; Charm Person needs `< 2`, Hold Person fails if `> 1` | FUN_6100_1406, ov12_11F9, ov22_11DD, ov22_1658 | H (tests), M (name) |
| 6D | 5 | `save[0..4]` | saving-throw targets (paralysation/poison, petrification, rod/staff/wand, breath, spell) | data: fighter L1 = 14 15 16 17 17 exactly the AD&D table; readers: ECL var 9Bh → `+6Eh` | M |
| 72 | 1 | `base_move` | 12 for all PCs; Recalc `+11Ch := +72h` | FUN_00BA_0BB8 | H |
| 73 | 1 | `level_main` | signed; level of the class that is drained; level drain kills ("is dead forever") when `< 2`, then `+73h := level[cls]` | FUN_5C00_2122; ECL var A0h | M |
| 74 | 1 | `levels_drained` | +1 per drained level | FUN_5C00_2122 | H |
| 75 | 1 | `hp_drained` | +1 per max-HP point removed by drain (shown with max/cur as "max,cur,lost") | FUN_5C00_2122 (ov33_e1 debug print) | H |
| 76 | 1 | `ai_mode` | set to 2 when a corpse is animated (ov22_206F); combat AI byte | ov22_206F | L |
| 77 | 8 | `thief_skill[0..7]` | percentages (PHINEAS: 45 45 30 35 35 15 70 0 = PP, OL, F/RT, MS, HS, HN, CW, RL of a halfling thief L1) | ECL vars A5h..ACh → `+77h..+7Eh`; data | M |
| 7F | 4 | `effects` | far ptr to the 9-byte effect list (§5) — **stale on disk** | ov17_0AEC/069E, FUN_00BA_2199 HasEffect | H |
| 83 | 1 | unk_83 | 0 | — | — |
| 84 | 1 | `npc_morale` | bit 7 = NPC ("(NPC)" on the sheet); low 7 bits = morale/loyalty (Animate Dead sets B3h/B2h) | ov19_004A `if +84h > 7Fh`, ov22_206F; ECL var B8h | H (bit 7), L (low bits) |
| 85 | 1 | unk_85 | 1 in saves; used in treasure share (FUN_3900_12E8 "takes and hides his share") | — | L |
| 86 | 2 | unk_86 | 0 | — | — |
| 88 | 14 | `money[0..6]` | 7 words: copper, silver, electrum, gold, platinum, gems, jewelry | ov19_050D (names `DS:0FFA`); ECL vars BBh..C3h; Recalc adds them to encumbrance | H **[corr: draft "currency candidates" at 30, 102]** |
| 96 | 8 | `level[0..7]` | per base class 0..7 (cleric, druid, fighter, paladin, ranger, MU, thief, monk) | ov19_004A loop `+96h+i`, i = 0..7, joined with "/" | H |
| 9E | 1 | `gender` | 0 Male, 1 Female | ov19_004A string `DS:0FEC + g*7` | H |
| 9F | 1 | `creature_type` | 0/1 = human/humanoid (Charm Person needs `< 2`, Hold Person fails if `> 1`), 4 = animated undead (set by Animate Dead, which needs `0` and status Dead), 0Eh = snake (Snake Charm ov22_190F) | ov22_11DD, ov22_1658, ov22_190F, ov22_206F | M |
| A0 | 1 | `alignment` | 0 LG, 1 LN, 2 LE, 3 NG, 4 TN, 5 NE, 6 CG, 7 CN, 8 CE | ov19_004A string `DS:0F53 + a*17`; ECL var D8h | H |
| A1 | 1 | `attacks` | attacks per round in half-attacks (2 = 1/round); each round `+113h := +A1h`, missile weapons use `ITEMS[type].rof` (min 2) instead | ov13_0D23 | H |
| A2 | 1 | unk_A2 | 0 in saves (second attack? see +114h) | — | L |
| A3 | 2 | `base_dmg_dice[1..2]` | dice count for attack 1 / 2 | Recalc copies `+A3h,+A4h → +115h,+116h` | H |
| A5 | 2 | `base_dmg_sides[1..2]` | | `→ +117h,+118h` | H |
| A7 | 2 | `base_dmg_bonus[1..2]` | signed | `→ +119h,+11Ah` | H |
| A9 | 1 | `base_ac` | 60 − AC (32h = AC 10) | Recalc `+111h := +A9h` | H |
| AA | 1 | unk_AA | 1 in saves | — | — |
| AB | 1 | unk_AB | | **[corr]** XP is not at AB | — |
| AC | 4 | `xp` | longint | ov19_004A "Exp " + Str(dword +ACh); training FUN_7000_29AE | H **[corr: draft AB]** |
| B0 | 1 | `class_mask` | bit 0 MU, 1 cleric, 2 thief, 3 fighter (others: paladin/ranger/druid/monk, data-free) | `ITEMS[type].usable and +B0h` (ov19 / ov09) decides "can use"; data: F 08, C 02, MU 01, T 04, C/F/MU 0B, F/MU 09 | H (bits 0-3) |
| B1 | 1 | `hp_rolled` | max HP without the CON bonus: Raise Dead (FUN_3400_0510: hp := 1, status := 0, CON − 1) and "is hardier" (ov12_0233, CON + 1) rebuild `hp_max := +B1h + new CON bonus` (bonus = (CON−14)·fighter level for CON ≥ 15, per-level otherwise); level drain decrements it with hp_max. Saved values (10/5/4/5/3/6) differ from hp_max by less than the AD&D bonus — exact bonus rule to be finalised by the combat lane | FUN_3400_0510, ov12_0233, FUN_5C00_2122 | M |
| B2 | 6 | `spell_slots[cls*3 + lvl − 1]` | spells per day: cls 0 cleric (B2..B4), 1 magic-user (B5..B7), spell level 1..3. Learn lists a spell only if `+B1h + cls*3 + lvl <> 0` (cls = spell-table byte 0, lvl = byte 1, `DS:31FA + id*16`). Data: cleric L1 WIS 17 → B2 = 3; MU L1 → B5 = 1 | ov22_059C mode 4 | H (layout), M (counts) |
| B8 | 2 | `xp_value` | monster XP base: end of combat adds `+B8h + +BAh × +B1h` per defeated enemy (side 1, status ≠ Running) | FUN_3900_0000; ECL var F7h | H |
| BA | 1 | `xp_per_hp` | monster XP per hit point (× `hp_rolled` +B1h) | FUN_3900_0000; ECL var F9h | H |
| BB | 1 | `head_pic` | portrait head id (HEAD) | FUN_7000_33E7 "Head Body Keep", ov28_04F9 | M |
| BC | 1 | `body_pic` | portrait body id (BODY) | same | M |
| BD | 2 | `icon_head`, `icon_body` | combat icon parts (CHEAD/CBODY) | ov16_382D icon editor, ov17_0482 | M |
| BF | 1 | `party_slot` | 0..7, lowest free slot assigned by AddToParty | ov17_1446 | H |
| C0 | 1 | `icon_size` | 1 small, 2 large; LoadMonster sets it from race (1,3,5 → 1; 2,4,6,7 → 2); "Small"/"Large" in the icon editor | ov17_0EC4, ov16_382D | H |
| C1 | 6 | `icon_colours` | 6 nibble pairs, default `91 A2 B3 C4 E6 F7` | ov17_0EC4 (random for monsters, `+C4h := C4h`) | M |
| C7 | 1 | `item_count` | Recalc counts the item list | FUN_00BA_0BB8 | H |
| C8 | 4 | `items` | far ptr to the 63-byte item list — stale on disk | ov17_069E/0AEC | H |
| CC | 52 | `readied[0..12]` | far ptrs, rebuilt by Recalc: slot = `ITEMS[type].slot` (< 9 → `+CCh + slot*4`; 9 → rings `+F0h`/`+F4h`; type 49h → `+F8h` arrows; type 1Ch → `+FCh` quarrels). `+CCh` weapon, `+D0h` shield, `+D4h` armour (sheet "Weapon"/"Armor") | FUN_00BA_0BB8, ov19_004A | H |
| 100 | 1 | `hands_used` | Σ `ITEMS[type].hands` of readied items | Recalc | H |
| 101 | 1 | `ac_item_bonus` | Σ item `+33h` | FUN_00BA_0282 | H |
| 102 | 2 | `encumbrance` | Σ item weight×count + Σ money | Recalc; sheet "Encumbrance" | H |
| 104 | 4 | `next` | party list link (`DS:5D96` head) — stale on disk | ov17_1446, ov17_1D58 | H |
| 108 | 4 | `combatant` | far ptr to the combat record — stale on disk | FUN_6100_1406 `(+108h)^` | H |
| 10C | 1 | `status` | 0 Okay, 1 Animated, 2 tempgone, 3 Running, 4 Unconscious, 5 Dying, 6 Dead, 7 Stoned, 8 Gone | ov19_004A string `DS:1047 + s*13` | H |
| 10D | 1 | `active` | ECL var 100h: 0 → 80h else 1 | FUN_4300_07BC | M |
| 10E | 1 | `side` | combat side: 0 party, 1 enemy (Animate Dead copies the caster's side; spells use `side*80h + …`, `side*10h + …` for target lists) | ov22_206F, ov22_11DD, ov22_100F; ECL var 10Ch | M |
| 10F | 1 | `controlled` | 1 for animated/controlled creatures; ECL var 10Ch returns 80h for side 0 with +10Fh ≠ 0 | ov22_206F, FUN_4300_07BC | L |
| 110 | 1 | `thac0` | current, 60 − THAC0 | ov19_0608 shows `60 − +110h` | H |
| 111 | 1 | `ac` | current, 60 − AC (front) | FUN_00BA_08EF; FUN_6100_1406 target AC | H |
| 112 | 1 | `ac_rear` | AC used when attacked from behind (`+112h − 2` on backstab) | Recalc `= f4+f2+f3−2`; FUN_6100_1406 | M |
| 113 | 2 | `attacks_left[1..2]` | decremented per swing in the melee loop | FUN_6100_1406 (`+112h + k`, k = 1..2) | M |
| 115 | 2 | `dmg_dice[1..2]` | current | ov19_0608 "Damage" = `+115h` d `+117h` ± `+119h` | H |
| 117 | 2 | `dmg_sides[1..2]` | | | H |
| 119 | 2 | `dmg_bonus[1..2]` | signed | | H |
| 11B | 1 | `hp` | current hit points | FUN_00BA_0973 | H |
| 11C | 1 | `move` | current movement | ov19_0608 "Movement" (×2 with effect 2Ah, ÷2 with effect 27h); FUN_00BA_01FB / 03A0 | H |

Whole-record coverage: every byte 00..11C is in one row above (unknown rows explicit). Derived (Recalc-owned) fields: 6B, 100..103, 110..11A, 11C and the readied pointers; a reimplementation must call RecalcCharacter after loading instead of trusting the stored values.

Draft fields confirmed: name (H), abilities 10..15 (now individually named, H), max/current HP 32/11B (H), inventory count C7 (H), party index BF (H).

### 3a. Combat and magic readers (where the record is used)

Evidence index for the reimplementation (combat units ov05/09/12/13/18/24, magic ov04/08/15/22; area map herdr/assignments/por-areas.md):

| field(s) | combat readers | magic readers |
|---|---|---|
| `ac` +111h, `ac_rear` +112h | FUN_6100_1406 melee (target AC; rear `−2` on backstab), ov12_0A65 | FUN_8E00_08C3 (spell attack vs AC, Recalc first) |
| `thac0` +110h, `dmg_*` +115h..+11Ah, `readied` +CCh | FUN_6100_1406 (vs-large dice from ITEMS j2..j4 when target `size` +6Ch is large), FUN_00BA_0000 | — |
| `attacks` +A1h → `attacks_left` +113h/+114h | ov13_0D23 (round start), FUN_6100_1406 (decrement per swing), ov13_1884 | — |
| `hp` +11Bh, `hp_max` +32h | ov24_1344 damage ("takes … points of damage", "Goes Down", "is Dying", "is killed"), ov24_175D/1869, ov12_2700, ov13_2879, FUN_5C00_0058 status change | FUN_3400_0401 cures, FUN_3400_0510 Raise Dead, ov22_190F |
| `status` +10Ch | FUN_6100_02F9 attack loop, ov24_0F06/1344/175D/1869, FUN_5C00_0058, FUN_3900_04C9 end of combat | FUN_3400_0510 ("is not dead"), FUN_3400_0928 Stone to Flesh, ov22_206F Animate Dead |
| `active` +10Dh, `side` +10Eh, `controlled` +10Fh | FUN_3900_04C9, ov13_2879/2998, ov24_* | ov22_100F Bless, ov22_11DD Charm, ov22_206F, ov22_2892 |
| `combatant` +108h (far ptr to the combat record: +4 current attack no., +8 flag, +9, +0Fh, +12h …) | FUN_6100_02F9, FUN_6100_1406, ov13_0D23/116A/1884/20C3/2998, ov24_1344 | FUN_4800_0666/0880/0FFF, ov22_206F |
| `size` +6Ch, `creature_type` +9Fh | FUN_6100_1406, ov12_11F9, ov12_1276 (BUGBEAR/GNOLL) | ov22_11DD Charm, ov22_1658 Hold, ov22_190F, ov22_206F |
| `level[]` +96h.. | ov13_116A turn undead (cleric level), ov12_0233, FUN_5C00_2122 drain | FUN_8E00_044E (cleric can read clerical scrolls), FUN_4800_0666 |
| `con` +14h, `hp_max`, `hp_rolled` +B1h | ov12_0233 "is hardier" | FUN_3400_0510 Raise Dead (hp := 1, CON −1, HP rebuilt) |
| `level_main` +73h, `levels_drained` +74h, `hp_drained` +75h, `xp` +ACh | FUN_5C00_2122 level drain; FUN_3900_0355 XP award (+10 % when the prime requisite ≥ 16: cleric WIS +12h, fighter STR +10h, MU INT +11h, thief DEX +13h — confirms the stat order) | — |
| `xp_value` +B8h, `xp_per_hp` +BAh, `money` +88h, items | FUN_3900_0000 (monster XP and loot into the treasure pool `DS:67F4`/`DS:6810`) | — |
| `effects` +7Fh (§5) | ov24_0E52 AddEffect, FUN_00BA_2199 HasEffect, ov12_* condition handlers | ov22_* spell effects |
| `mem_spell` +17h, `known_spell` +33h.., `spell_slots` +B2h.. | — | ov22_059C (Cast/Memorize/Scribe/Learn lists), ov22_008A menu |
| `npc_morale` +84h | FUN_3900_04C9, ov13_2998 ("Attack handheld"), FUN_4D00_10D7 | ov22_206F |

Not yet located with code: unk_2C, 83, 86..87, AA, AB, A2 (zero or constant in all saves); saving throws +6Dh..+71h are named from data (AD&D table match), their combat reader (save roll) is in ov24 (`stub_ov24_e7`, FUN_8E00_08C3 calls it with the spell's save type `DS:3203 + spell*16`) — to be cited by the combat lane.

## 4. Item record — 63 bytes (`.ITM`, MONnITM, ITEMn.DAX, in-memory list) — H unless noted

Item fields are interpreted with the item-type table loaded from the ITEMS file (§6).

| off | size | name | meaning | evidence | conf |
|---|---|---|---|---|---|
| 00 | 42 | `name` | string[40] built by `FUN_00BA_0442` from the name words (zeros in DAX records; filled at load) | FUN_00BA_0442 writes into the record; ITEM/MON records have zeros here | H |
| 2A | 4 | `next` | far ptr link — stale on disk | all list walkers | H |
| 2E | 1 | `type` | index into the ITEMS type table (0..127) | `ITEMS[type*16 + j]` everywhere (Recalc, combat, shops) | H |
| 2F | 3 | `word[1..3]` | name word indices into the 1-based table `DS:10A7 + w*21` (string[20]; 1 = "Battle Axe" … 254 = "Cursed"); shown in order +31h, +30h, +2Fh ("Chain" "+1" … ) | FUN_00BA_0442 | H |
| 32 | 1 | `plus` | signed magic bonus (+1..+5, −1..−3): weapon to-hit/damage, armour/shield AC; with Detect Magic a `*` is appended if `+32h > 0`, `+33h > 0` or `+36h <> 0` | FUN_00BA_0000/0282/0442 | H |
| 33 | 1 | `plus2` | second bonus, added to char `+101h` (AC) | FUN_00BA_0282 | H |
| 34 | 1 | `readied` | ≠ 0 = readied/equipped (lists show " Yes"/" No ") | Recalc considers only readied items; FUN_00BA_0442 | H |
| 35 | 1 | `hidden` | bit (3−k) set hides word k (unidentified); e.g. 06 hides "+1" of "Long Sword +1" | FUN_00BA_0442 | H |
| 36 | 1 | `cursed` | ≠ 0 = cursed (Remove Curse ov22_2540 clears the first such item: "'s item is un-cursed"; temple Remove Curse tests it); also counts as magical for Detect Magic | FUN_00BA_0442, ov22_2540, ov04 | H |
| 37 | 2 | `weight` | word (AD&D gp-weight: plate 450, long sword 60, flail 150) | Recalc encumbrance `weight * count` | H |
| 39 | 1 | `count` | stack count (arrows 20, darts 11, quarrels 15); 0 = single; shown as prefix | Recalc, FUN_00BA_0442 | H |
| 3A | 2 | `value` | word, price in gp (plate 400, long sword +5 15000) | data; shop code (ov06) | M |
| 3C | 3 | `power[1..3]` | spell/effect bytes: scrolls = spell ids (MU scroll 3 spells: 2F 2D 2D), wands = charges + spell (Lightning: 43 33), rings/gauntlets/cloak: effect id with bit 7 (`3D 81`, `26 83`, `59 85`) | FUN_8E00_044E reads `+3Bh+k` (k = 1..3) as castable spells (bit 7 = ?) | M |

## 5. Effect record — 9 bytes (`.SPC`, MONnSPC, in-memory list at char `+7Fh`) — H (layout) / M (semantics)

**[corr]** These are *active effects* (spell affects, conditions), not memorised spells (those are in TChar +17h).
Created by `AddEffect` = `ov24_0E52(…)`: GetMem(9), append to `+7Fh` list, then

| off | size | name | meaning | conf |
|---|---|---|---|---|
| 0 | 1 | `type` | effect id; `HasEffect(c, id)` = FUN_00BA_2199 compares this byte (ids seen in code: 05 Detect Magic (used in item naming), 10h, 27h halves and 2Ah doubles movement, 3Eh …) | H |
| 1 | 2 | `duration` | word (ov12_0233 passes 3Ch) | M |
| 3 | 1 | `p3` | byte parameter (ov12_0233 passes FFh) | L |
| 4 | 1 | `p4` | byte parameter (ov12_0233 passes 1) | L |
| 5 | 4 | `next` | far ptr — stale on disk | H |

## 6. ITEMS file (2,050 bytes) — the item-type table — H

`ov11_002D` (startup): opens `<datapath>ITEMS` (path `DS:2614 + DS:5376*1Eh`), **Seek(2)**, `BlockRead(f, DS:5582, 810h, got)` → the bytes from file offset 2 on (2048 = **128 types × 16 bytes**) land at `DS:5582` (BSS, beyond the image). The first 2 bytes (`00 76`) are skipped and unused. Fields `ITEMS[t] = DS:5582 + t*16 + j`:

| j | DS | name | meaning | evidence | conf |
|---|---|---|---|---|---|
| 0 | 5582 | `slot` | 0 weapon, 1 shield, 2 armour, 3..8 other body slots (gauntlets, helm, cloak, boots …), 9 ring (2 slots), 0Ah ammunition/misc, 0Bh/0Ch scrolls (ov22 treats 0Ch as clerical) | Recalc (`< 9`, `= 9`), ov22 | H (0,1,2,9), M (rest) |
| 1 | 5583 | `hands` | hands needed (0/1/2) | Recalc `+100h` | H |
| 2 | 5584 | `dice_L` | damage dice count vs large | FUN_6100_1406 copies j2,j3,j4 when the target is large | H |
| 3 | 5585 | `sides_L` | | | H |
| 4 | 5586 | `bonus_L` | | | H |
| 5 | 5587 | `rof` | missile rate of fire in half-attacks (dart 6 = 3/round, bows 4, javelin 2); used instead of char `+A1h` (min 2) when firing | ov13_0D23 | H (use), M (AD&D match) |
| 6 | 5588 | `ac_value` | bit 7 set = AC item: `and 7Fh` = base AC as 60−AC for armour (padded B4h → AC 8 … plate B9h → AC 3), shield 81h = +1 | FUN_00BA_0282 | H |
| 7 | 5589 | `wflags` | 80h on blunt weapons (club, mace, flail, hammer, staff, morning star, sling), 01h on others; tested `and 81h` in ov12 | ov12.c:2591/3017 | M |
| 8 | 558A | unk_8 | 80h on all weapons | — | L |
| 9 | 558B | `dice` | damage dice count vs small/medium → char `+115h` | FUN_00BA_0000 | H |
| 10 | 558C | `sides` | → char `+117h` | FUN_00BA_0000 | H |
| 11 | 558D | `dmg_bonus` | → char `+119h` | FUN_00BA_0000 | H |
| 12 | 558E | `range` | missile range (long bow 16h, short bow 10h, javelin 7, dart 6); `(range−1) div 3` in ov13 | ov09/ov13 | M |
| 13 | 558F | `usable_by` | class mask, `and char.class_mask (+B0h)` ≠ 0 → usable | ov19.c:1264, ov09.c:1052 | H |
| 14 | 5590 | `wflags2` | bit 0 needs arrows (`+F8h`), bit 1 THAC0 adj. (FUN_00BA_1168), bit 2 STR to-hit/damage bonus (FUN_00BA_1282/1325), bit 7 needs quarrels (`+FCh`) | FUN_00BA_0000 | H |
| 15 | 5591 | unk_15 | always 0 | data | — |

The 128 rows: `ITEMS.md`.

## 7. Monster records

MONnCHA records are TChar (§3) loaded raw by LoadMonster (MONSTERS.md); MONnITM = §4 items; MONnSPC = §5 effects. Monster-specific use of the fields: `MONSTERS.md`.
