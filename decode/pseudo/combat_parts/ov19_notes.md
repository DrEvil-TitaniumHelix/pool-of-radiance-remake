# ov19 notes — evidence, globals, unknowns, cross-area questions, self-check (lane por-mod-combat)

Main file: `decode/pseudo/combat_parts/ov19.pas.md`; screens: `ov19_SCREENS.md`; names: `ov19_names.json`.
Coverage: **23/23** entries of `functions.tsv` (unit ov19), incl. the three formerly missing routines 0D70, 2156, 24A7, and the two Ghidra pseudo-functions 231A / 2468 (documented as "not a routine").

## (a) Routines

| routine | name | conf | one-line evidence |
|---|---|---|---|
| 7F00:004A | DrawCharacterSheet | H | prints "Age ", "STR ".."CHA ", "Level", "Exp ", "Weapon", "Armor", "Status" and the race/class/alignment/gender/status tables for `SelectedChar` |
| 7F00:050D | DrawMoney | H | `money[i]` (+88h+2i) with `CoinName` DS:0FFA, i = 6 downto 0 |
| 7F00:0608 | DrawCombatStats | H | labels "AC", "HP", "THAC0", "Damage", "Encumbrance", "Movement"; `60 - thac0`, dmg dice/sides/bonus, +102h, +11Ch with effects 2Ah/27h |
| 7F00:0901 | DrawAbility | H | `+10h+stat` at row stat+7; STR 18 exceptional "(nn)"/"(00)" |
| 7F00:0AB3 | ViewMenu | H | prompt "View:", "Items Spells Trade Drop Exit"; shop calls it on 'V' |
| 7F00:0D70 | MayLoseItem | H | "Must be unreadied", " was going to scribe from that scroll", "is it Okay to lose it? "; returns Boolean, used before Trade/Drop/Sell |
| 7F00:0EF8 | ItemsMenu | H | "Items", "Ready Item", menu "Ready Use Trade Drop Halve Join Sell Id"; dispatches every item action |
| 7F00:14D0 | ReadyItem | H | toggles item +34h; "It's Cursed", "Wrong Class", "already using ", "Your hands are full!"; ITEMS slot/hands/usable_by |
| 7F00:1734 | TradeItem | H | "Trade with Whom?", "Overloaded"; AppendItemCopy + LoseItem |
| 7F00:17ED | HalveItem | H | "Can't halve that"; GetMem(3Fh)+Move, count split |
| 7F00:189D | JoinItems | M | 'J' handler; merges counts of identical items up to 255 (no string of its own) |
| 7F00:1A8A | UseItem | H | "uses an item", "Item:"; scroll → spell list mode 2; wand → `power[2]`; CastSpell CastSpell; consumes charge/count |
| 7F00:1CEE | SellItem | H | "I'll give you ", " gold pieces for your ", "Is It a Deal? ", "Sold!", "Overloaded.  Money will be put in pool." |
| 7F00:1F52 | IdentifyItem | H | "For 200 gold pieces I'll identify your ", "Not Enough Money", "It looks like some sort of "; clears item +35h |
| 7F00:2156 | TradeCoins | H | "Trade to?", "Select type of coin", "How much ", "will you trade? " |
| 7F00:231A | (not a routine) | H | false entry at the 3rd byte of `89 46 EC` (7f00:2318) inside TradeCoins |
| 7F00:2468 | (TradeCoins loop tail) | H | only reached by JMP/JNZ from TradeCoins, uses its frame and epilogue |
| 7F00:24A7 | DropCoins | H | "Select type of coin", "How much ", "will you drop? "; DropCoinsToPool |
| 7F00:275B | ItemOverloads | H | >15 items or encumbrance+weight > StrWeightAllowance+1500; both callers print "Overloaded"/"OverLoaded" on true |
| 7F00:27DF | CycleSelectedChar | M | walks the party list (+104h) from `PartyHead` for keys 47h/4Fh, sets `SelectedChar`; called by MenuSelect on extended keys |
| 7F00:28BE | MoneyInGold | H | Σ money[0..4]·CoinValue[i] (1,10,100,200,1000) +100 div 200; callers compare with prices ("Not enough Money.") |
| 7F00:299C | SpellList | H | "Spells " + "in Memory"/"in Spell Book"/"on Scroll"/"on Scrolls"/"to choose from"/"to be memorized"/"to be scribed" |
| 7F00:2B0D | ov19_init | H | empty init (entry 0) |

Counts: named 20 (H 18, M 2, L 0); plus init (H, existing name) and 2 non-routines.

## (b) Globals named here (evidence)

| DS | name | conf | evidence |
|---|---|---|---|
| 0D24 | CoinValue (5 LongInt) | H | image bytes 1, 10, 100, 200, 1000; MoneyInGold multiplies money[0..4] by it and divides by entry 3 (`g_0D30` = 200 = 1 gp in copper); MoneyValueInGold uses the same table |
| 0D38 | ClassName (string[26] × 17, 27 B) | H | image "Cleric", "Druid", "Fighter"…; indexed by TChar +2Fh in 004A |
| 0F03 | RaceName (string[9], 10 B) | H | "Monster", "Dwarf" … "Human"; indexed by +2Eh |
| 0F53 | AlignmentName (17 B) | H | "Lawful Good" … "Chaotic Evil"; indexed by +A0h |
| 0FEC | GenderName (7 B) | H | "Male", "Female"; indexed by +9Eh |
| 0FFA | CoinName (string[10], 11 B) | H | "Copper" "Silver" "Electrum" "Gold" "Platinum" "Gems" "Jewelry"; indexed by money index in 050D/2156/24A7 |
| 1047 | StatusNameTable (13 B) | H | "Okay" "Animated" "tempgone" "Running" "Unconscious" "Dying" "Dead" "Stoned" "Gone"; indexed by +10Ch |
| 4716 | ViewChar (far ptr) | M | written only by DrawCharacterSheet (`:= SelectedChar`), read by ViewMenu menu building, SellItem/IdentifyItem (BuildItemName owner) |
| 471A | TradePartner (far ptr) | M | default and memory of the receiver in "Trade with Whom?" / "Trade to?" (1734, 2156); initialised by ViewMenu |
| 49F3 | game_Mode | M | ov19 tests: 1 = shop (Sell, Id offered; DropCoins to pool), 5 = combat (no Trade; Use needs the combat flag; palette ov31), 2/3/4 = Use allowed; ECL_VM: 3/4 set by the game loop (outdoor/3D), SAVES.md "game mode/state byte" |
| 49F5 | opt_Portraits | H | ov15 Alter menu toggles it on 'P' and shows "Portraits on " when ≠ 0 (6b00:1d31/1dfc); 004A shows the portrait only when ≠ 0 |
| 5E24 / 5E25 | text_Col / text_Row | M | ECL_VM.md §4.2 "text cursor column/row" of DrawWrappedText; 0D70 sets them to continue after the name |
| 6B80 | ScrollItem (far ptr) | M | UseItem stores the scroll before SpellList mode 2; read by ov22 `AddItemSpells/051C` (scroll spell list) |
| 6DBF | ItemCast (byte) | M | 1 only around CastSpell from UseItem (and for wand-type items); read by SpellRange/0C20, 00BA_26C2 |

Other globals used without a new name: `SelectedChar` (5D92), `PartyHead` (5D96), `DataSet` (5376), `ecl_Mem4900` (49D2), `TreasureMoney` (67F4, 7 LongInt; `g_6804` = TreasureMoney[4] platinum), `g_6821` (forces a full Items-screen redraw; written by ItemGiantStrength/30A5, InitSpellTable — meaning L), `g_3205` (= byte 11 of the 16-byte spell table entry DS:31FA+id*16: when ≠ 0 a spell cast from an item in combat ends the turn via ClearCombatantActionFlags — L), ITEMS table `DS:5582/5583/558F`.

## (c) Unknowns

1. `ecl_Mem4900^` word at byte offset 1CAh (ECL address 49E5h): "Use" is offered only when it is 0 (0EF8). Meaning unknown (ECL lane).
2. `c^.combatant^[2]` (byte +2 of the combat record): "Use" in combat requires ≠ 0. Meaning unknown (combat record spec).
3. `g_3205` spell-table byte 11 (see b): name unknown.
4. Item `+36h`: SAVES.md calls it `magic_flag` (Detect Magic); ReadyItem refuses to unready when it is ≠ 0 with "It's Cursed" — so it (also) marks cursed items. Exact semantics: data lane.
5. Spell ids > 38h stored in wand-type items are reduced by 17h before casting (1A8A:1B28) — numbering of item-only spells unknown (MAGIC).
6. HorizontalMenu returns #13 on Enter; ViewMenu has no case for it, so Enter does nothing there (unless ov25 translates it — VIEW lane to confirm).
7. `PaletteFlashOff` / `PaletteFlashOn` (EGA palette registers 0/8) around the View menu in combat: visual purpose L.
8. TradeCoins `noMoney` uninitialised when the coin list is cancelled on the first pass (stack garbage decides whether "Trade to?" is asked again).
9. ShowCharacterMessage (00BA:16EC) 4th argument and the non-combat window rows: ENGINE lane.

## (d) Cross-area questions / flags

- Area: ov19 is mostly PARTY/inventory (sheet, items, coins, shop sell/identify) with MAGIC parts (SpellList, UseItem → ov22). It is decoded fully here; the PARTY and MAGIC lanes should reference these names instead of re-decoding. Suggest moving ov19 to PARTY in `por-areas.md` (COMBAT only uses ReadyItem/UseItem/ItemsMenu via ov08/ov09 and SpellList via ov13).
- ENGINE: aliases used for resident routines (table in the .pas.md). Verified in the callee body here: DrawText (col,row,colour,s), DrawFrame (border outside the rectangle), DrawTitledFrame, ShowTimedBottomMessage, DrawCharacterName (colours 0Bh/0Eh/0Ch, "'s" suffix), BuildItemName (param layout, RETF 10h; the owner parameter [BP+12h] is never read, the Detect-Magic test scans the whole party from PartyHead).
- VIEW (ov25): menu routines' Enter/hot-key semantics (item 6), VerticalListMenu window parameters (x1,y1,x2,y2) inferred from ov25.c `local_56 = p8 - p10 + 1`, `local_5b = p7 - p9 + 1`.
- PARTY (ov21): `TransferCoins` (TransferCoins) calls the encumbrance helpers `SubEncumbrance` (−) and `AddEncumbrance` (+) both on the **giver** (`param_4`), so the receiver's encumbrance is not raised until its next RecalcCharacter — check in ov21.
- MAGIC (ov22): `UseScrollSpell` uses item `word[2]` (+30h) as "spells left" with threshold D2h; scroll name words should be checked against the name table (DS:10A7).
- DATA: SAVES.md §4 item `+36h` (item 4 of (c)); ITEMS slot 0Bh..0Dh = scrolls (IsScroll tests 0Bh ≤ slot ≤ 0Dh; SAVES.md lists 0Bh/0Ch).
- Listing artifacts met: (1) the epilogue `MOV SP,BP; POP BP; RETF 4` of ItemsMenu at 7f00:148E is printed as "8e00:1f30 RETF" (near-branch wrap); (2) `FUN_7f00_231a` false entry; (3) jump operands `0x7000:fxxx` / `0x8000:0xxx` = 7f00:0xxx / 7f00:1xxx (linear wrap, LAYOUT.md); (4) `[ps] cs:"(NPC)"` comment at 7f00:02cf is a false string annotation on `MOV AL,0` (argument 0 of DrawAbility).

## Self-check

Method: 46 of 444 statement lines (10.4 %) drawn with `random.seed(19)` (40) plus 6 hand-picked tricky ones, each re-read against `ov19.lst` (push order, constants, branch sense, field offsets).

| # | stmt addr | statement | result |
|---|---|---|---|
| 1 | 7f00:219c | DrawCharacterSheet (TradeCoins) | match (`PUSH CS; CALL DrawCharacterSheet`) |
| 2 | 7f00:0301 | any := False | match (`[BP-107h] := 0`) |
| 3 | 7f00:2613 | list := head | match |
| 4 | 7f00:1ad3 | `power[2] > 0 and power[3] < 80h` | match (JBE / JNC) |
| 5 | 7f00:0698 | DrawText(col+1,row,0Fh,'THAC0   ') | match |
| 6 | 7f00:1a95 | ItemCast := 0 | match |
| 7 | 7f00:0b92 | 'Spells ' if hasSpells | match |
| 8 | 7f00:1508 | "It's Cursed" when +36h ≠ 0 | match |
| 9 | 7f00:131e | if not turnUsed then fullRedraw | match (`[BP-2Ch] := 1`) |
| 10 | 7f00:1afc | done := False; exit | match (jumps to 1c13 whose test fails → epilogue) |
| 11 | 7f00:106f | Halve if item_count < 16 | match (`CMP +C7h,10h; JNC`) |
| 12 | 7f00:1d46 | price := count*price (unreachable) | match: the JNZ 49h / JZ 1Ch pair makes this path unreachable (written as such) |
| 13 | 7f00:0885 | effect 27h halves movement | match (`SHR AX,1`) |
| 14 | 7f00:1dfa | LoseItem(SelectedChar, item) | match |
| 15 | 7f00:0eff | c := SelectedChar | match |
| 16 | 7f00:0627 | row := 17 | match (11h) |
| 17 | 7f00:15bf | ring: +F4h tested | match |
| 18 | 7f00:1247 | VerticalListMenu('', menu, 13,10,15, 1,5,38,22, items, True, …) | match (push order) |
| 19 | 7f00:0f28 | redraw := True | match (`[BP-2Dh]`) |
| 20 | 7f00:2816 | walk to last member | match |
| 21 | 7f00:2544 | Str(money[i]:0, num) | match (@StrLong width 0, max 15) |
| 22 | 7f00:1242 | g_6821 := 0 | match |
| 23 | 7f00:11a9 | DrawFrame(1,1,38,22,0) | match; border position taken from 03F1:0006..000F (DEC x1,y1 / INC x2,y2): border on cols 0/39, rows 0/23 |
| 24 | 7f00:0139 | DrawText(x,3,0Fh,race) | match |
| 25 | 7f00:1c58 | dec(count) | match |
| 26 | 7f00:1eb1 | ClearRectangle(1,21,38,22) | match |
| 27 | 7f00:0bc0 | Trade condition (NPC rule, money, not combat) | match (JC 80h / +10Dh / +10Ch = 1 / [BP-2Ch] / 49F3 ≠ 5) |
| 28 | 7f00:0454 | row := row + 1 | match |
| 29 | 7f00:065b | DrawText(1,row+1,0Fh,'HP    ') | match |
| 30 | 7f00:1b78 | BuildItemName(SelectedChar,item,5,23,False,True) | match |
| 31 | 7f00:17cb | RecalcCharacter(whom) | match |
| 32 | 7f00:14e7 | c := SelectedChar | match |
| 33 | 7f00:2aa5 | DrawCharacterName(SelectedChar,1,1,True) | match |
| 34 | 7f00:23fe | TransferCoins(@SelectedChar,@whom,amount,coin) | match (`MOV DI,5D92h; PUSH DS`) |
| 35 | 7f00:0457 | armour = +D4h | match |
| 36 | 7f00:2711 | done := True | match (`[BP-15h]`) |
| 37 | 7f00:0565 | DrawText(20-len,row,0Ah,name) | match (14h − len) |
| 38 | 7f00:15eb | err := 2; slot := 11 | match (0Bh) |
| 39 | 7f00:00ec | DrawText(x,3,0Fh,gender) | match |
| 40 | 7f00:1d10 | count > 1 | match (JBE) |
| 41 | 7f00:0de5 | text_Col := len(name)+2 | match (`INC AX; INC AX; MOV [5E24h],AL`) |
| 42 | 7f00:27a2 | Word(enc+w) > Integer(allow+1500) | match (CWD on allowance, `XOR DX,DX` on the sum; JG/JL then JBE) |
| 43 | 7f00:19e4 | merge if count+total ≤ 255 | match (`CMP AX,0FFh; JG`) |
| 44 | 7f00:28d5 | total += money[i]*CoinValue[i] | match (@LongMul with [DI+0D24h]) |
| 45 | 7f00:2a5b | count := BuildSpellList(mode) | match (AL stored through [BP+6]) |
| 46 | 7f00:0a13 | DrawText(7,7,colour,'('+s+')') | match (cs:08FD '(' / 08FF ')') |

Result: 46/46 match, no mismatch found in the sample. Corrections made while decoding (before the sample was drawn): ItemsMenu RETF 4 found in the raw bytes (listing shows a misplaced RETF); 231A identified as a false entry by capstone re-disassembly from 7f00:2312.

## Normalisation pass

- **Names replaced** (local alias → published name, from engine_names.json / VIEW.pas.md / combat_parts ov24, as in the current `ov19.lst` comments): ShowBottomMessage→ShowTimedBottomMessage, ShowCharMessage→ShowCharacterMessage, ClearCharMessage→ClearCharacterMessage, ClearRect→ClearRectangle, DrawArmorClass→DrawAC, DrawHitPoints→DrawHP, BuildItemDisplay→BuildItemName, StrengthWeightAllowance→StrWeightAllowance, ClearCombatObjectFlags→ClearCombatantActionFlags, YesNo→AskYesNo, ListMenu→VerticalListMenu (VerticalListMenu; note the ECL names file also uses VerticalListMenu for 4300:1788), ItemEffectHook→CallEffectHandler (CallEffectHandler), PaletteFlashOff→PaletteFlashOff, PaletteFlashOn→PaletteFlashOn. Unchanged because already published: DrawText, DrawWrappedText, DrawFrame, DrawTitledFrame, ClearScreen, MessageDelay, RecalcCharacter, ByteToStr/WordToStr/LongToStr, LoseItem, AppendItemCopy, DrawCharacterName, HasEffect, RedrawCurrentMode, DrawCombatLayout, SelectPartyCharacter, HorizontalMenu, FreeMenuList, ShowPortrait. ov21/ov22 have no published names: aliases IsScroll, SpellMenu, BuildSpellList, CastSpell, RemoveScrollSpell, CharRoomFor, PoolMoneyInGold, SetCharMoneyGold, SetPoolMoneyGold, InputNumber, TransferCoins, CoinFromText were replaced by `IsScroll/008A/059C/0C20/328A`, `WouldOverload/00A8/0130/0185/0294/044C/0B93`. Global renames by the verifier (StatusNameTable, game_Mode, opt_Portraits, text_Col, text_Row) kept.
- **Calls re-checked**: every external call site (≈150, 48 callees) against its push sequence in the current .lst and against the published signature (ENGINE.pas.md, VIEW.pas.md, ov24.pas.md); ov21/ov22 against push order + callee decompile.
- **Arg-order fixes (3, all in calls to unpublished ov21/ov22 routines, taken in Ghidra's reversed order before)**:
  1. `UseScrollSpell` (7f00:1c2b): pushes SelectedChar, item, spell → now `UseScrollSpell(SelectedChar, item, spell)` (was `(spell, item, c)`).
  2. `CoinFromText` (7f00:2394, 2692): pushes the list node, then @coinName → now `CoinFromText(sel, coinName)` (was `(coinName, sel^.text)`).
  3. `ChooseSpell` (7f00:2aed): pushes flag [BP+0Eh], then @index → now `ChooseSpell(flag, index)` (was `(index, flag)`).
  All other calls matched (incl. VerticalListMenu 14 args, HorizontalMenu 8, ShowCharacterMessage, DrawHP, BuildItemName, CallEffectHandler, CastSpell = consistent with MAGIC's `CastSpell(s, 0, 1, done)` at 4800:0365).
- **Defect found in another lane**: MAGIC.pas.md writes SpellList as `SelectSpell(found, idx, menuKind, listMode)` (e.g. `SelectSpell(found, idx, 1, 0)` at 6b00:04d6). The pushes at 6b00:04c6..04d5 are `0, 1, @[BP-2], @[BP-3]`, and SpellList reads the list mode at [BP+10h] (first pushed): Pascal order is `SpellList(listMode, menuKind, var idx, var found)` = `SpellList(0, 1, idx, found)`. MAGIC's argument list is reversed (values right).
