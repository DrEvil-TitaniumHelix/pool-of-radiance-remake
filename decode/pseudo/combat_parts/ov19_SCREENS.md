# ov19 SCREENS — character sheet, View/Items menus, item and coin dialogs (lane por-mod-combat)

Source: `decode/pseudo/combat_parts/ov19.pas.md` (statement addresses `7f00:xxxx`). Screen = 40×25 text cells of 8×8 pixels (EGA 320×200); positions are (col, row), 0-based. Colours are EGA indices: 0Ah light green, 0Bh light cyan, 0Ch light red, 0Dh light magenta, 0Eh yellow, 0Fh white.
Shared conventions (callee evidence in the .pas.md alias table):
- **Bottom menu line** (HorizontalMenu HorizontalMenu): prompt at (0,24) in colour 0Dh, followed by the item words: ordinary letters 0Ah, hot keys and the selected option 0Fh (VIEW.pas.md 9D00:01DA). Keys: the first letter of a word (upper-cased), ',' / '.' move the highlight, Enter returns #13, Esc returns #0. Extended keys are not enabled by ov19's own calls.
- **List menu** (VerticalListMenu VerticalListMenu): list window (x1,y1)-(x2,y2); the bottom line gets the given items plus " Next" / " Prev" (when the list scrolls) and " Exit". Esc/Exit → nothing selected.
- **Bottom message** (ShowTimedBottomMessage 00BA:1693): row 24 cleared, text at (0,24) colour 0Ah, timed delay (`g_49E2*225` ms), row 24 cleared again. No key.
- **Yes/No** (AskYesNo AskYesNo): bottom menu `<prompt>Yes No`, colours (0Dh,0Ah,0Fh) = 0Dh prompt, 0Ah ordinary letters, 0Fh hot keys and the selected option (VIEW.pas.md 9D00:01DA); keys Y / N.
- **Dialog window** rows 21..22, cols 1..38 (DrawWrappedText colour 0Eh, cleared first unless noted), removed afterwards by ClearRectangle(1,21,38,22).
- DrawFrame(x1,y1,x2,y2) draws the border one cell outside the rectangle (cols x1-1 / x2+1, rows y1-1 / y2+1).

---

## COMBAT-ov19-01 Character sheet
Trigger: `DrawCharacterSheet` 7F00:004A (from ViewMenu, TradeCoins; ov16 character creation via stub e1). Character = `SelectedChar` (copied to `ViewChar{g_4716}`).
Background: ClearScreen; frame DrawFrame(1,1,38,22,0) → border on cols 0/39, rows 0/23.

| row | col | text | colour | source |
|---|---|---|---|---|
| 1 | 1 | character name (string[15]) | 0Bh party / 0Eh side 1 / 0Ch `active = 0` | DrawCharacterName |
| 1 | len(name)+3 | `(NPC)` (only if `npc_morale > 7Fh`) | 0Ah | 7f00:009a |
| 3 | 1 | gender: `Male` / `Female` | 0Fh | GenderName DS:0FEC |
| 3 | after gender + 1 blank | race: `Monster` `Dwarf` `Elf` `Gnome` `Half-Elf` `Halfling` `Half-Orc` `Human` | 0Fh | RaceName DS:0F03 |
| 3 | after race + 1 blank | `Age ` + age | 0Fh | 7f00:0161 |
| 4 | 1 | alignment: `Lawful Good` … `Chaotic Evil` (9) | 0Fh | AlignmentName DS:0F53 |
| 5 | 1 | class: `Cleric` `Druid` `Fighter` … (17, SAVES.md §3 +2Fh) | 0Fh | ClassName DS:0D38 |
| 7..12 | 1 | `STR ` `INT ` `WIS ` `DEX ` `CON ` `CHA ` | 0Ah | 7f00:02b2 |
| 7..12 | 5 (6 if value < 10) | ability value | 0Ah (0Dh when highlighted by ov16) | DrawAbility |
| 7 | 7 | `(nn)` exceptional strength, `(00)` = 100, `(0n)` < 10 — only STR 18 with `str_exc > 0` | same | DrawAbility |
| 7.. (one per non-zero kind, Jewelry first) | right-aligned to col 19 / value at col 21 | `Jewelry` `Gems` `Platinum` `Gold` `Electrum` `Silver` `Copper` + count | 0Ah | DrawMoney (area (12,7)-(26,14) cleared first) |
| 15 | 1 | `Level` | 0Fh | |
| 15 | 7 | levels of every class with level > 0, joined by `/` (class order cleric, druid, fighter, paladin, ranger, magic-user, thief, monk) | 0Fh | |
| 15 | 17 | `Exp ` + experience (LongInt) | 0Fh | |
| 17 | 1 / 4 | `AC    ` / armour class (`60 - ac`, minus sign below 0) | 0Fh / 0Ah | DrawCombatStats, DrawAC |
| 17 | 9 / 15 | `THAC0   ` / `60 - thac0` (as a byte) | 0Fh / 0Ah | |
| 17 | 22 / 34 | `Encumbrance      ` / encumbrance (word) | 0Fh / 0Ah | |
| 18 | 1 / 4 | `HP    ` / current hit points (DrawHP colours by HP vs max) | 0Fh / ENGINE | |
| 18 | 8 / 15 | `Damage        ` / `<dice>d<sides>` + `+b` or `-b` (attack 1) | 0Fh / 0Ah | |
| 18 | 25 / 34 | `Movement   ` / movement (×2 with effect 2Ah, ÷2 with effect 27h) | 0Fh / 0Ah | |
| 20 | 1 / 8 | `Weapon` / readied weapon name (only if a weapon is readied) | 0Fh / 0Ah | BuildItemName |
| 21 | 2 / 8 | `Armor` / readied armour name (only if armour is readied) | 0Fh / 0Ah | |
| 22 | 1 / 8 | `Status` / `Okay` `Animated` `tempgone` `Running` `Unconscious` `Dying` `Dead` `Stoned` `Gone` | 0Fh / 0Ah | StatusNameTable DS:1047 |

Pictures: portrait via ShowPortrait when `opt_Portraits{g_49F5} <> 0` and `DataSet = 3` (picture placement: VIEW/ov28). Keys: none (static); the menu is COMBAT-ov19-02. Note: rows 20/21 stay empty when no weapon/armour is readied; the Status line is always row 22.

## COMBAT-ov19-02 View menu
Trigger: `ViewMenu` 7F00:0AB3 (shop 'V', temple, treasure, camp, area command loop, top level, combat menu). Shown under COMBAT-ov19-01.
Bottom line: `View:` + `Items ` (if any items) + `Spells ` (if any memorised spell) + `Trade ` (if coins, not an NPC unless inactive/animated, not in combat) + `Drop ` (if coins) + `Exit`.
Keys: `I` → COMBAT-ov19-03; `S` → COMBAT-ov19-15 (spells in memory); `T` → COMBAT-ov19-13; `D` → COMBAT-ov19-14; `E` or Esc → leave (RedrawCurrentMode); Enter → ignored. After I/S/T the sheet is redrawn. In combat (game_Mode 5) the palette is switched by ov31 on entry/exit; the loop also ends when an item use took the turn.

## COMBAT-ov19-03 Items screen
Trigger: `ItemsMenu` 7F00:0EF8 (View 'I'; combat via stub e6). Full redraw: ClearScreen; DrawFrame(1,1,38,22); `<name>'s` at (1,1) (DrawCharacterName colours); `Items` at (len+4, 1) colour 0Ah; DrawTitledFrame(1,3,38,22) (border rows 2/23); `Ready Item` at (1,3) colour 0Fh.
List window (1,5)-(38,22): one line per item = BuildItemName text: ` Yes  ` / ` No   ` (readied) + count + name words.
Bottom line: `Ready` + ` Use` (active, ECL word 49E5 = 0, and game_Mode 2/3/4, or combat with combatant flag) + ` Trade` (not combat; NPC rule as in -02) + ` Drop` + ` Halve` (fewer than 16 items) + ` Join` + ` Sell` (shop, game_Mode 1; NPC rule) + ` Id` (shop) + ` Next`/` Prev` + ` Exit`.
Keys: R → -04 Ready; U → -05/-10; T → -07 then -08; D → -07 then -06; H → -09; J → join (no screen); S → -07 then -11; I → -12; E/Esc → back to -02. The screen closes when the last item is gone.

## COMBAT-ov19-04 Ready / unready messages
Trigger: `ReadyItem` 7F00:14D0. Bottom messages (row 24, colour 0Ah, timed): `It's Cursed` (unready a cursed item, item +36h ≠ 0) · `Wrong Class` · `already using <name of the item in that slot>` · `Your hands are full!` (not shown in combat for controlled creatures). Success: no message, the Yes/No column changes on the next list draw.

## COMBAT-ov19-05 Use: "Must be Readied"
Trigger: ItemsMenu 'U' on an unreadied item (7f00:12c4). Bottom message `Must be Readied`.

## COMBAT-ov19-06 Drop item confirmation
Trigger: ItemsMenu 'D' (7f00:138c). Dialog window (1,21)-(38,22) colour 0Eh: `Your <item name>will be gone forever` (item name as built by BuildItemName, concatenated without an extra blank by ov19). Bottom: `Drop It? Yes No`. Y → item deleted; window cleared either way.

## COMBAT-ov19-07 May-lose checks (Trade / Drop / Sell)
Trigger: `MayLoseItem` 7F00:0D70.
- Readied item: bottom message `Must be unreadied`.
- Scroll with a spell being scribed: name of SelectedChar at (1,21) (DrawCharacterName colours), then ` was going to scribe from that scroll` continuing after the name (colour 0Eh, window (1,21)-(38,22), not cleared); bottom `is it Okay to lose it? Yes No`. Window cleared afterwards.

## COMBAT-ov19-08 Trade item
Trigger: `TradeItem` 7F00:1734. RedrawCurrentMode (normal screen of the current mode), then SelectPartyCharacter with prompt `Trade with Whom?` (ENGINE 00BA:2C48 screen). Receiver over 15 items or over the weight limit → bottom message `Overloaded`. Next: back to -03 (full redraw).

## COMBAT-ov19-09 Halve
Trigger: `HalveItem` 7F00:17ED. Stack of 1 (or 0) → bottom message `Can't halve that`; otherwise the list shows the new stack.

## COMBAT-ov19-10 Use item
Trigger: `UseItem` 7F00:1A8A. Scroll → COMBAT-ov19-15 in mode 2 (`Spells on Scroll`). Wand-type item (spell in `power[2]`): in combat the combat layout is redrawn (DrawCombatLayout) unless the user is a controlled creature; ShowCharacterMessage: name + `uses an item` (combat: right panel from (23,10); outside combat: message rows 17/18 area, ENGINE); in combat `Item:` at (0,23) colour 0Ah and the item name at (5,23), otherwise the item name at (1,22); timed delay; message cleared. Then the MAGIC cast screens (CastSpell: "casts", "is a combat-only item... Use it?", "Abort Spell?").

## COMBAT-ov19-11 Sell (shop)
Trigger: `SellItem` 7F00:1CEE. Window (1,21)-(38,22) colour 0Eh: `I'll give you <price> gold pieces for your <item name>`; bottom `Is It a Deal? Yes No`. Y → bottom message `Sold!`; if the coins do not fit: bottom message `Overloaded.  Money will be put in pool.` (two blanks after the full stop). Window cleared.

## COMBAT-ov19-12 Identify (shop)
Trigger: `IdentifyItem` 7F00:1F52. Window: `For 200 gold pieces I'll identify your <item name>`; bottom `Is It a Deal? Yes No`. Not affordable (character and pool both < 200 gp): bottom message `Not Enough Money`. Paid: window `I can't tell anything new about your <name>` (nothing hidden) or `It looks like some sort of <new full name>`; timed delay; window cleared.

## COMBAT-ov19-13 Trade coins
Trigger: `TradeCoins` 7F00:2156 (View 'T'). RedrawCurrentMode, SelectPartyCharacter `Trade to?`; then the character sheet (COMBAT-ov19-01) with the money column; coin list window (12,7)-(25,13), one line per non-zero kind, Jewelry first: 8-character right-aligned kind name + blank + amount (e.g. `    Gold 120`); bottom `Select type of coin` + ` Next`/` Prev`/` Exit`. After a choice: row 24 `How much <Kind> will you trade? ` (kind text from ov21: `Copper `, `silver `, `electrum `, `Gold `, `Platinum `, `Gems `, `Jewelry `) colour 0Ah, digits typed after it (Enter ends, Esc = 0, value capped at the coins held). Receiver overloaded → bottom message `Overloaded` (ov21). Next: coin list again while coins remain; Exit/Esc → back to `Trade to?` (see quirk in .pas.md).

## COMBAT-ov19-14 Drop coins
Trigger: `DropCoins` 7F00:24A7 (View 'D'). Money column redrawn, same coin list window (12,7)-(25,13) with `Select type of coin`; amount prompt `How much <Kind> will you drop? `. Repeats while coins remain; Exit/Esc returns to -02 (money column redrawn). In shop/treasure modes the coins go to the treasure pool (DropCoinsToPool).

## COMBAT-ov19-15 Spell list header
Trigger: `SpellList` 7F00:299C (View 'S' mode 0; scroll use mode 2; combat cast BeginCast; camp memorize/scribe ov15). On the first call (index < 0): DrawTitledFrame(1,1,38,1) (one-row frame), `<name>'s` at (1,1), `Spells <mode text>` at (len+4, 1) colour 0Ah, mode text = `in Memory` / `in Spell Book` / `on Scroll` / `on Scrolls` / `to choose from` / `to be memorized` / `to be scribed`. The list and its menu are MAGIC (ChooseSpell: "Cast", "Memorize", "Scribe", "Learn", "Choose Spell:"). Nothing is shown when the list is empty.

## Not a screen
- `CycleSelectedChar` 7F00:27DF: Home/End (scan 47h/4Fh) in any bottom menu select the previous/next party member (the caller redraws).
- `ItemOverloads` 7F00:275B, `MoneyInGold` 7F00:28BE, `JoinItems` 7F00:189D: no output.
