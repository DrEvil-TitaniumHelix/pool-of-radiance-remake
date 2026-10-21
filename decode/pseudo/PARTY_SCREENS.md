# PARTY screens (lane por-mod-party)

Ids `PARTY-<part>-nn`; per-part sources in `decode/pseudo/party_parts/*_SCREENS.md`.

---

# ov00 screens (lane por-mod-party)

## PARTY-ov00-01 — low-memory warning
- Trigger: a GetMem/New request the TP heap cannot satisfy → HeapErrorHandler (2000:0042).
- Text: row 24, col 0, colour 0Eh (yellow): `WARNING: Insufficient Memory` (row 24 cleared first). Rest of the screen unchanged.
- Keys: any key (ReadGameKey; ^S/^D/^C rules of ReadGameKey apply).
- Pictures: none.
- Next: PARTY-ov00-02 (the save branch via g_49D0 is dead code, see ov00.pas.md).

## PARTY-ov00-02 — exiting
- Text: row 24, col 0, colour 0Eh: `Insufficient Memory. Exiting Program`.
- Keys: any key.
- Next: TerminateGame → sound stopped, BIOS video mode restored, exit to DOS.

---

# ov01 screens (lane por-mod-party)

Skipped entirely when START.EXE is run with parameter `STING` (MainProgram 0000:0102).

## PARTY-ov01-01 — title picture 1
- Trigger: MainProgram → ShowTitle (after ov11 init has set the video mode and loaded the font).
- Picture: TITLE.DAX record 1 (320×200, PICTURES.md P), drawn at cell (0,0) by PutPicture; loaded with DataPath = '' (current dir).
- Duration: 5 s (TimeInHundredths) or until a key is pressed (key not consumed).
- Next: if POOL.CFG line 5 ≠ 'F' (cfg_FullIntro = 0) → return to MainProgram → code wheel (PARTY-ov02-01); else PARTY-ov01-02.

## PARTY-ov01-02 — title picture 2 with lightning (EGA)
- Picture: TITLE.DAX record 2 at (0,0).
- Effect (EGA only, VideoMode = 1): random bursts of 2..4 flashes; each flash sets EGA palette register 1 to 09h (150 ms), 0Bh
  (100 ms), 0Fh (50 ms), 0Bh (100 ms), 09h (150 ms), then 01h. Burst trigger = busy counter (CPU-speed dependent, see ov01.pas.md).
- Duration: 5 s (checked between bursts) or a key (not consumed).
- Next: PARTY-ov01-03.

## PARTY-ov01-03 — credits
- Frames: DrawTitledFrame(1,1,38,3) and (1,5,38,23), style 0 (symbols 114h..116h), no title text.
- Text (col, row, colour) — all shown in capitals (DrawText UpCase):

| col | row | colour | text |
|---|---|---|---|
| 5 | 1 | 0Ah | scenario created by: |
| 26 | 1 | 0Eh | tsr, inc. |
| 15 | 2 | 0Ah | jim ward |
| 2 | 3 | 0Ah | david cook,steve winter,mike breault |
| 1 | 5 | 0Ah | game created by: |
| 18 | 5 | 0Eh | ssi special projects |
| 14 | 6 | 0Bh | version 1.3 |
| 2 | 7 | 0Eh | programming: |
| 20 | 7 | 0Eh | original |
| 2 | 8 | 0Bh | scot bayless |
| 20 | 8 | 0Eh | programming: |
| 2 | 9 | 0Bh | brad myers |
| 20 | 9 | 0Bh | keith brors |
| 2 | 10 | 0Bh | russ brown |
| 20 | 10 | 0Bh | brad myers |
| 2 | 11 | 0Bh | ted greer |
| 2 | 13 | 0Eh | graphic arts: |
| 20 | 13 | 0Eh | encounter coding: |
| 2 | 14 | 0Bh | tom wahl |
| 20 | 14 | 0Bh | paul murray |
| 2 | 15 | 0Bh | fred butts |
| 20 | 15 | 0Bh | russ brown |
| 2 | 16 | 0Bh | darla marasco |
| 20 | 16 | 0Bh | victor penman |
| 2 | 17 | 0Bh | susan halbleib |
| 20 | 17 | 0Bh | dave shelley |
| 2 | 19 | 0Eh | project manager |
| 20 | 19 | 0Eh | developer: |
| 2 | 20 | 0Bh | victor penman |
| 20 | 20 | 0Bh | george mac donald |
| 2 | 22 | 0Eh | testing: |
| 11 | 22 | 0Bh | joel billings,steve salyer |
| 2 | 23 | 0Bh | james kucera,robert daly,rick white |

- Duration: 10 s or a key (not consumed — it becomes the first key of the code-wheel prompt).
- Next: return to MainProgram → PARTY-ov02-01.

---

# ov02 screens (lane por-mod-party)

Skipped when START.EXE is run with parameter `STING`.

## PARTY-ov02-01 — translation wheel question
- Trigger: MainProgram after ShowTitle (also directly after title 1 when cfg_FullIntro = 0).
- Frame: DrawTitledFrame(1,1,38,22) style 0: cells (1,1)-(38,22) cleared, border of symbols on rows 0 and 23, cols 0 and 39.
  Row 24 (prompt line) is outside the frame. Whatever was on screen outside the frame (e.g. credits row 24 border) stays.
- Text (col, row, colour):

| col | row | colour | text |
|---|---|---|---|
| 1 | 1 | 0Ah | USE THE TRANSLATION WHEEL TO DECIPHER |
| 1 | 2 | 0Ah | THE CODE WORD. |
| 1 | 5 | 0Ah | MATCH THE ESPRUAR RUNE (OUTER RING) |
| 8–9 | 6 | 0Ch | outer rune: glyphs outer[0]+40h, outer[1]+40h (raw font glyphs) |
| 1 | 8 | 0Ah | WITH THE DETHEK RUNE (INNER RING) |
| 8 (–9) | 9 | 0Ch | inner rune: glyph inner[0]+40h (and inner[1]+40h for entry 0 only) |
| 1 | 11 | 0Ah | AND READ THE CODE WORD UNDER THE PATH: |
| 1 | 13 | 0Ch | 5 spaces + path pattern (`- - - - -`, `-..-..-..` or `.........`) → pattern at cols 6..14 |
| 1 | 14 | 0Ah | READ FROM THE INSIDE TO THE OUTSIDE. |
| 0 | 24 | 0Dh | INPUT THE CODE WORD:  (typed text in 0Fh white from col 22) |

- Entry chosen: Random(13) per try from CodeWheelTable (ov02.pas.md).
- Keys: printable ' '..'z' (max 6 chars), Backspace, Enter or Esc to submit; ^S sound toggle (ReadGameKey).
- Next: correct → return (main menu ov16); wrong → PARTY-ov02-02.

## PARTY-ov02-02 — wrong answer
- Text: row 24, col 0, colour 0Eh: `Sorry, that's incorrect.` for GameSpeed*225 ms (225 ms at start-up), then row 24 cleared.
- Next: tries 1–2 → PARTY-ov02-01 with a new random entry (screen redrawn); try 3 → TerminateGame (exit to DOS, no message).

---

# ov11 screens (lane por-mod-party)

## PARTY-ov11-01 — start-up loading line
- Trigger: MainProgram → InitGameState (first thing after the unit inits; the video mode is selected earlier, by InitConfiguration from POOL.CFG line 1 — ENGINE).
- Text: row 24 cleared (ClearMenuLine), then `Loading...Please Wait` at col 0, row 24, colour 0Ah (light green). Nothing else
  on screen (whatever the video mode set left, i.e. black).
- Loads during this line: 8X8D1 records 202/203, SQRPACI 1/2, COMSPR 0..11 (+128) and 25 (+153), ITEMS.
- Keys: none (except the disk prompt below).
- Next: row 24 cleared; MainProgram continues with the title (PARTY-ov01-01) or, with `STING`, the main menu (ov16).

## PARTY-ov11-02 — ITEMS disk prompt (only if ITEMS is missing in the current directory)
- Text: OpenWithPrompt → BiosPromptLine(0Eh, 'Insert disk n in drive X:') on row 24, n = DataSet (1 at start-up), X = first
  character of the POOL.CFG data path (see ov11.pas.md quirk). Waits for a key, re-checks; repeats until the file exists.
- Keys: any key = retry.
- Next: PARTY-ov11-01 continues.

---

# ov16 part A — screens (lane por-mod-party)

Text cells are 40 columns × 25 rows (8×8 font); `(col,row)`. Colours are EGA indices (0 black, 0Ah light green, 0Dh light
magenta, 0Eh yellow, 0Fh white). Bottom-line menus: ov25 HorizontalMenu on row 24 (VIEW.pas.md); scrolling lists: ov25
VerticalListMenu (VIEW.pas.md).

## PARTY-ov16a-01 Party creation menu (top level)
- Trigger: main program after title + code wheel (`0000:0127`), and again after every command of this menu (7000:017F loop).
- Frame: DrawTitledFrame(1, 1, 38, 22, style 0, colour 0, no title) — the area inside cols 1..38 rows 1..22 is cleared and framed.
- Roster: if a character is selected, DrawPartyRoster(SelectedChar) (ENGINE: names / "AC  HP" columns at the top, col 1 in this mode
  because game_Mode = 0).
- List: the enabled entries, one per row from row 12 down, compacted (no gaps): first letter at col 2 in white (0Fh), the rest
  from col 3 in light green (0Ah). Entries and when they are shown:
  | key | text | shown |
  |---|---|---|
  | C | Create New Character | always |
  | D | Drop Character | a character is selected |
  | M | Modify Character | a character is selected |
  | T | Train Character | selected and (ECL word 6B00:550h > 0 or STING mode) — once set it stays set until no character is selected |
  | V | View Character | a character is selected |
  | A | Add Character to Party | always |
  | R | Remove Character from Party | a character is selected |
  | L | Load Saved Game | no character is selected |
  | S | Save Current Game | a character is selected |
  | B | BEGIN Adventuring | a character is selected |
  | E | Exit to DOS | always |
  So the very first screen shows: row 12 "Create New Character", 13 "Add Character to Party", 14 "Load Saved Game", 15 "Exit to DOS".
- Bottom line (row 24): "Choose a function " at col 0 in light magenta (0Dh); the option string 'C D M T V A R L S B E J' is drawn
  after it in colour 0 (invisible).
- Keys: C D M T V A R L S B E (only acted on when the entry is shown), J (hidden: with command-line parameter STING → STING
  mode + bottom message PARTY-ov16a-03), Home/End (extended 'G'/'O' scan codes, also keypad 7/1) → previous / next party member
  becomes the selected character, roster redrawn (no full redraw). Enter, Space, Esc (#0) → redraw only.
- Next: C → PARTY-ov16a-04; D/M/T/A → part B screens; V → ov19 character sheet / View menu; R → roster write + remove (part B);
  L → ov17 "Load Which Game:" (on success return to the main program → game); S → ov17 "Save Which Game:"; B → return to the
  main program (game_Mode := 4, menu line cleared) → ECL game loop; E → PARTY-ov16a-02.

## PARTY-ov16a-02 Quit to DOS
- Trigger: E on PARTY-ov16a-01.
- Bottom line: AskYesNo("Quit to DOS ", 0Eh, 0Ah, 0Fh) — "Quit to DOS " followed by the options "Yes No", default No.
- Keys: Y / N (Enter takes the highlighted option).
- Next: Y → if a party exists and the game is not marked saved: ov17 Save screen, repeated until saved; then TerminateGame
  (text mode, DOS). N → PARTY-ov16a-01.

## PARTY-ov16a-03 STING acknowledgement
- Trigger: J on PARTY-ov16a-01 when `START.EXE STING` was used.
- Bottom line: "I Understand, master..." at (0,24) in colour 0Ah for the message delay (ShowTimedBottomMessage), then cleared.
- Next: PARTY-ov16a-01 (Train now offered whenever a character is selected).

## PARTY-ov16a-04 Pick Race
- Trigger: C on PARTY-ov16a-01.
- List window cols 1..38, rows 2..22 (VerticalListMenu left 1, top 2, right 38, bottom 22; header colour 0Dh, items 0Ah,
  selected item 0Fh): header "Pick Race", items "  Dwarf", "  Elf", "  Gnome", "  Half-Elf", "  Halfling", "  Human"
  (Half-Orc is not offered). Menu line: "Exit" (plus Next/Prev when the list is longer than the window).
- Keys: cursor up/down (keypad), Enter = choose, Esc / E = abort creation.
- Next: Enter → PARTY-ov16a-05; abort → PARTY-ov16a-01.

## PARTY-ov16a-05 Pick Gender
- Same window/colours; header "Pick Gender", items "  Male", "  Female". Next: PARTY-ov16a-06 / abort.

## PARTY-ov16a-06 Pick Class
- Same window/colours; header "Pick Class", the classes allowed for the race (ov16a.pas.md, `RaceClasses`), e.g. Human:
  "  Cleric", "  Fighter", "  Magic-User", "  Thief"; Half-Elf: 11 entries. Next: PARTY-ov16a-07 / abort.

## PARTY-ov16a-07 Pick Alignment
- Same window/colours; header "Pick Alignment", the alignments allowed for the class (`ClassAligns`; Paladin only
  "  Lawful Good"; thieves without Lawful Good and Chaotic Good). Next: PARTY-ov16a-08 / abort.

## PARTY-ov16a-08 Ability roll / "Keep this character?"
- Trigger: alignment chosen.
- Screen: DrawCharacterSheet of the new character (ov19 sheet, full screen), then each ability line is redrawn as it is rolled
  (DrawAbility stat 0..5, rows 7..12), then the combat values (DrawCombatStats, rows 17/18) and money (DrawMoney, starting gold).
  The name field is still empty.
- Bottom line: AskYesNo("Keep this character? ", 0Dh, 0Ah, 0Fh), default No.
- Keys: Y / N.
- Next: N → abilities, HP and gold re-rolled on the same sheet (same screen again); Y → sheet redrawn, PARTY-ov16a-09.

## PARTY-ov16a-09 Character name
- Bottom line: ReadBottomLine("Character name: ", colour 0Dh, max 15 chars) at (0,24); typed text follows the prompt.
- Keys: printable characters, Backspace, Enter (ENGINE ReadBottomLine). An empty name repeats the prompt.
- Next: portrait picker "Head Body Keep" (PortraitMenu, part B), then the icon editor (IconEditor, part B: "Is this icon ok?"),
  then the character is written to SAVE\<name>.CHA and the roster; back to PARTY-ov16a-01 (the new character is not in the party
  and not selected).

---

# ov16 part B — screens (lane por-mod-party, fork ov16b)

Coordinates are text cells (col 0..39, row 0..24). Bottom line = row 24 (HorizontalMenu / AskYesNo / ShowTimedBottomPrompt / ShowTimedBottomMessage, VIEW.pas.md / ENGINE.pas.md). Menu colours given as (prompt, text, hotkey) in HorizontalMenu argument order (promptColour [BP+12h], textColour [BP+10h], hotColour [BP+0Eh]; screens fix request applied). Hotkeys: first character of each option (VIEW HorizontalMenu); arrows return extended codes 'H' up, 'P' down, 'K' left, 'M' right.

| id | trigger | what is shown | keys | pictures | next |
|---|---|---|---|---|---|
| PARTY-ov16b-01 | top menu "Drop" (PartyCreationMenu → DropCharacter) with a selected character | bottom line `Drop <name> forever? ` + `Yes No` (AskYesNo colours 0E/0A/0F, default No); on Yes `Are you sure? ` Yes/No | Y/N (Esc/other loop inside AskYesNo) | — | 01a/01b |
| PARTY-ov16b-01a | both answers Yes | timed bottom message `You dump <name> out back.` (character status active = 0) or `<name> bids you farewell.`; character removed from the party list | — | — | top menu |
| PARTY-ov16b-01b | an answer No | timed bottom message `<name> breathes a sigh of relief.` | — | — | top menu |
| PARTY-ov16b-02 | top menu "Modify" (ModifyCharacter), character XP > 0 | timed bottom prompt `<name> can't be modified.` colour 0Eh | — | — | top menu |
| PARTY-ov16b-03 | "Modify", XP = 0 | full character sheet (DrawCharacterSheet, ov19); the current field highlighted: ability rows 7..12 (DrawAbility) or HP (DrawHP col 4, row 18); bottom `Modify character: ` + `Keep Exit` (0D/0A/0F); after each change the combat stats (AC/HP/THAC0/…) are redrawn | Up/Down (or ext Enter) = previous/next field (STR INT WIS DEX CON CHA HP, wraps); Left/Right = −1/+1 within race/gender/class limits; K = keep (sets TChar +85h := 1); E or Esc = undo all changes | portrait via DrawCharacterSheet | top menu |
| PARTY-ov16b-04 | top menu "Train" (TrainCharacter) refusals | timed bottom prompts colour 0Eh: `we only train conscious people` (status ≠ Okay), `Training costs 1000 gp.` (< 1000 gp in coins), `We don't train that class here` (no class in the hall's mask), `Not Enough Experience`; all skipped in StingMode | — | — | top menu |
| PARTY-ov16b-05 | training possible | area cols 1..38, rows 1..22 cleared; row 4: `<name>` at col 4 + ` will become:` (colour 0Ah) right after the name; rows 5..: `    a level <n> <Class>` (first line), `and a level <n> <Class>` (further lines), col 6, colour 0Ah; bottom `Do you wish to train? ` Yes/No (0D/0A/0F) | Y/N | — | 06 or top menu |
| PARTY-ov16b-06 | answer Yes | timed bottom message `Congratulations...`; 1000 gp paid (smallest coins first, change in largest); if the magic-user level rose: spell list "learn" (SpellList mode 4, ov19) repeated until a spell is chosen or none is available | spell list keys (ov19/ov25) | — | top menu |
| PARTY-ov16b-07 | top menu "Add" (AddCharacterMenu) | area cols 1..38, rows 1..22 cleared; scrolling list (VerticalListMenu window cols 1..38, rows 2..22) of the names in `SAVE\charlist.txt`, entries already added shown with a `* ` prefix; bottom `Add a character: ` + `Add Exit` (+ ` Next`/` Prev` when the list pages) | Up/Down/Home/End/PgUp/PgDn, A or Enter = add the highlighted character, N/P page, E/Esc = leave; leaves automatically at 6 player characters or 8 members | — | top menu |
| PARTY-ov16b-08 | character creation (FUN_7000_1551, part A) → PortraitMenu | portrait frame (ShowPortrait: head + body, cols 1Ch..26h, rows 1..0Bh); bottom `Head Body Keep` (colours 0/0F/0A) | H = next head (1..14), B = next body (1..12), K = keep; nothing else leaves | HEAD/BODY records via ShowPortrait | creation |
| PARTY-ov16b-09 | creation → IconEditor | frame cols 1..38 rows 1..22 (DrawTitledFrame, no title), palette flash on; `old` at (8,6), `ready   action` at (3,10), `new` at (8,12), `ready   action` at (3,16); the original icon (two poses, slot 12 copy) at icon cells (1,2)/(4,2), the edited icon at (1,4)/(4,4) (icon cell = 3 text cells wide, 24 px high), drawn over icon slot 25 except in CGA | see 09a..09e | CHEAD/CBODY (LoadCharacterIcon / LoadCombatIcon) | 09a |
| PARTY-ov16b-09a | editor state 1 | bottom `Parts color-1 color-2 Size Exit` (0D/0A/0F) | P → 09b, 1 → 09c (Hair), 2 → 09c (Face), S → 09d, E/Esc → finish (09f) | | |
| PARTY-ov16b-09b | state 2 | bottom `Head Weapon Exit` | H/W → 09e for that part; E/Esc → 09a | | |
| PARTY-ov16b-09c | state 3 | bottom `Weapon Body Hair Shield Arm Leg Exit` (or `… Face …`) | W/B/H/F/S/A/L choose the colour slot → 09e; E/Esc → 09a | | |
| PARTY-ov16b-09d | state 4 | bottom `Small Keep Exit` (icon currently large) or `Large Keep Exit` | L/S change size (icon reloaded), K keep, E/Esc revert → 09a | | |
| PARTY-ov16b-09e | state 5 (browse) | bottom `Next Prev Keep Exit` | N/P: next/previous head (0..13), weapon (0..31) or colour value (0..15 of the chosen nibble); K keep; E/Esc revert → previous state | icon preview redrawn | |
| PARTY-ov16b-09f | finish | icon committed; on the overland map (travel mode > 1) the ICON records 0/1 are reloaded into slots 11/12; bottom `Is this icon ok? ` Yes/No (0D/0A/0F); No restarts the editor (09), Yes → palette flash off | Y/N | | creation |

---

## ov17 screens — prompts of the save / load / roster routines (lane por-mod-party)

All ov17 output is on the bottom text line (row 24, columns 0..39) over the current screen; no picture records are drawn except the combat icons built off-screen by LoadCharacterIcon. Colours are EGA text colours (0Ah light green, 0Dh light magenta, 0Eh yellow, 0Fh white). Bottom-line menu = HorizontalMenu (VIEW ov25): prompt in `promptColour`, hotkeys in `hotColour`, rest in `textColour`; `,` / `.` move the highlight, Enter returns #13, Esc returns #0.

| id | trigger (routine, address) | text (row/col, colour) | keys accepted | pictures | next |
|---|---|---|---|---|---|
| PARTY-ov17-01 | MkDir of the save directory fails with an error other than 5 (EnsureSaveDir 7500:02E9); Rewrite of charlist.txt / a character file / SAVGAM fails (WriteCharList 7500:0203, WriteCharacter 7500:0873, SaveGame 7500:1E27) | `Put save disk in X:` (X = first character of SavePath) row 24 col 0, colour 0Eh, via ShowBottomPromptAndReadKey | any key (then the operation is retried; the prompt repeats until it succeeds) | — | retry |
| PARTY-ov17-02 | ReadCharacter: file not found (OpenWithPrompt 0802:025D, noPrompt = False) — 7500:0C26, 0D0B, 0E09 | `Put save disk in X:` (save dir) or `Insert disk n in drive D:` (n = DataSet, D = DataPath[1]; strings DS:2614 + n*1Eh) — BiosPromptLine row 24, colour 0Eh | any key, repeated until the file exists | — | file read |
| PARTY-ov17-03 | LoadGame menu, only if at least one `SAVGAM<x>.DAT` exists (7500:16DD) | `Load Which Game: ` (colour 0Dh) followed by the letters of the existing games, e.g. `A C D ` (text 0Ah light green, hotkeys 0Fh white), row 24 | letters of existing games (others ignored by the menu), Esc = cancel, Enter (#13) and letters without a file re-show the menu | — | PARTY-ov17-04 or caller (Esc) |
| PARTY-ov17-04 | LoadGame after the choice (7500:17D0) | `Loading...Please Wait` row 24 col 0, colour 0Ah (menu line cleared first) | none | combat icons of all members rebuilt; 3D map / wall sets (or ICON for travel_Mode ≥ 2) reloaded | caller (ov16 main menu) |
| PARTY-ov17-05 | SaveGame menu (7500:1D9C) | `Save Which Game: ` (0Dh) + `A B C D E F G H I J` (text 0Ah, hotkeys 0Fh), row 24; the encounter picture keeps animating when game_Mode = 2 | A..J, Esc = cancel; Enter re-shows | — | PARTY-ov17-06 or caller |
| PARTY-ov17-06 | SaveGame after the file is open (7500:1E85) | `Saving...Please Wait` row 24 col 0, colour 0Ah | none | — | caller (menu line cleared) |
| PARTY-ov17-07 | LoadMonster: record not in MON<n>CHA.DAX (7500:0F32) | `Unable to load monster` row 24, colour 0Fh | any key | — | TerminateGame (exit to DOS) |
| PARTY-ov17-08 | CheckEclDisk: the new data set's `ECL<n>.DAX` is missing (7500:236A) | `Save and exit  Insert disk #n` row 24, colour 0Dh, no options | Space or Esc return (the `S` = save-and-exit branch is unreachable, see 7500:22D5) | — | caller (ecl_op20_NewEcl → LoadEclBlock, which prompts again) |

---

# ov20 screens — rest (lane por-mod-party)

Text window = rows 17..22, columns 1..38 (cleared with `ClearTextRectangle(1, 17, 38, 22)` at the start and end of RestLoop). Bottom menu line = row 24 (HorizontalMenu, ov25). Colours: 10 light green (normal), 15 white (highlight / alert), menu colours 0Dh prompt, 0Ah hot letters, 0Fh text. The camp frame around it is drawn by ov15 Camp (MAGIC lane).

## PARTY-ov20-01 Rest time editor
- Trigger: camp menu "Rest" → ov15 Rest presets the rest clock with the time the party needs to memorise/scribe → RestLoop → RestMenu.
- Row 17: `Rest Time:` (col 1, colour 10), then `DD` days (col 12), `:` (col 14), `HH` hours (col 15), `:` (col 17), `MM` minutes (col 18; = ten-minutes*10 + minutes), each two digits with leading zero. The selected field is white (15), the others 10. Start selection: minutes.
- Row 24 menu: `Rest   daYs Hours Mins   Inc Dec   Exit` (hotkeys R, Y, H, M, I, D, E; empty prompt).
- Keys: `R` or Enter = start resting (Enter starts whatever is highlighted); `Y`/`H`/`M` select days/hours/minutes; `I` / cursor-up = +1 (minutes +5); `D` / cursor-down = −1 (minutes −5, borrowing from higher fields; below zero → all 0); cursor-left / cursor-right = select the next larger / smaller field (wrapping minutes↔days); `E` or Esc = leave without resting; `,`/`.` move the menu highlight (ov25). Months overflow is folded into days, days ≤ 99.
- Next: R → PARTY-ov20-02; E/Esc → back to the camp menu (ov15).

## PARTY-ov20-02 Resting
- Row 17 shows the rest time counting down (refreshed every 5 steps = 25 game minutes, and after each message); one step = 5 game minutes (game clock advanced, effects counted down).
- Ends when the rest clock reaches 0 (→ camp menu) or by PARTY-ov20-03 / -06.
- Keys: any key → PARTY-ov20-03.

## PARTY-ov20-03 Stop resting?
- Row 24 menu (AskYesNo, ov25): prompt `Stop Resting? ` with `Yes No` (default No). `Y` → rest ends (not interrupted); `N` → menu line cleared, resting continues.

## PARTY-ov20-04 Daily healing
- After every 24 h of rest: row 19 col 1 colour 10 `The Whole Party Is Healed` (each member +1 HP; shown even if nobody gained); party roster redrawn if anybody was healed; MessageDelay (GameSpeed × 225 ms); message area cleared. Resting continues.

## PARTY-ov20-05 Spell learnt
- When a member finishes a spell: ov22 message routine (stub ov22 e8, MAGIC lane) shows `<name>` and `has memorized <spell>` or `has scribed <spell>` (texts CS:0917, CS:09DB). Resting continues.

## PARTY-ov20-06 Rest encounter
- Every `w[5A4h]` steps of block 2 (ECL VM 6DD2, set by the area script; 0 = never), a d100 ≤ `w[5A6h]` (VM 6DD3): message area cleared, rest time redrawn, row 19 col 1 colour 15 `The Party is rudely interrupted!`, MessageDelay. RestLoop returns true (interrupted) → ov15 Rest / Camp hand the encounter to the ECL vectors.

---

# ov21 screens (lane por-mod-party)

Text cells are 40×25 (col 0..39, row 0..24). Colours are EGA indices as pushed (0Ah light green, 0Dh light magenta, 0Fh white). Menus: HorizontalMenu / VerticalListMenu (ov25, VIEW.pas.md) — the bottom-line menu on row 24, first letter = hot key.

| id | trigger | text / layout | keys | pictures | next |
|---|---|---|---|---|---|
| PARTY-ov21-01 | InputNumber (8900:0294), from TakeMoney and ov19 TradeCoins / DropCoins | row 24 cleared (40 cells), prompt at (0,24) in the caller's colour (0Ah from all callers); the typed number at col = Length(prompt), row 24, colour 0Fh; a value above `max` is replaced by `max` | `0`..`9` append (max 6 digits), Backspace (#8) deletes the last digit (stale glyph quirk, see pas), Enter accepts, Esc returns 0; other keys ignored | — | row 24 cleared; caller continues |
| PARTY-ov21-02 | WouldOverload true in TakeCoins / TransferCoins | timed bottom message "Overloaded" (ShowTimedBottomMessage: row 24, colour 0Ah, MessageDelay, cleared) | — (timed) | — | caller |
| PARTY-ov21-03 | AddPlatinumOrPool overload (selling a gem/jewel) | timed bottom message "Overloaded.  Money will be put in Pool." | — (timed) | — | caller |
| PARTY-ov21-04 | TakeMoney (8900:0CEB): "Take" in shop / temple / treasure menus | DrawTitledFrame(1,1,38,22, style 0, colour 0Ah, no title); list window cells (2,2)..(15,8): one line per coin type with pool amount > 0, copper first: "Copper n", "Silver n", "Electrum n", "Gold n", "Platinum n", "Gems n", "Jewelry n" (CoinName DS:0FFA + ' ' + amount); bottom menu prompt "Select type of coin" with options [Next] [Prev] Exit (VerticalListMenu adds them; colours 0Dh/0Ah/0Fh) | Up/Down/Home/End/PgUp/PgDn move, hot key / Enter selects the highlighted coin, E/Esc leaves | — | PARTY-ov21-05 for the chosen coin; back to this list while the pool still has money; leaves when the pool is empty or on Exit |
| PARTY-ov21-05 | coin chosen in PARTY-ov21-04 | InputNumber prompt "How much <coin> will you take? " (coin = "Copper ", "silver ", "electrum ", "Gold ", "Platinum ", "Gems ", "Jewelry "), colour 0Ah, max = pool amount (low word) | as PARTY-ov21-01 | — | PARTY-ov21-02 if the character cannot carry the amount (nothing taken), else coins moved; back to PARTY-ov21-04 |
| PARTY-ov21-06 | AppraiseGems with no gems and no jewelry | timed bottom message "No Gems or Jewelry" | — | — | caller (changed := false) |
| PARTY-ov21-07 | AppraiseGems (8900:19B2): "Appraise" in shop / temple | text area (1,1)-(38,22) cleared; character name at (1,1); "You have a fine collection of:" (1,7) colour 0Fh; "n Gem(s)" (1,9); "n piece(s) of Jewelry" (1,10) (empty when 0); bottom menu "Appraise : " + "  Gems" (if any) + "  Jewelry" (if any) + " Exit" | G, J, E (Esc/#0 also leave) | — | G/J → PARTY-ov21-08; E → caller |
| PARTY-ov21-08 | G or J in PARTY-ov21-07 (one gem / jewel removed from money[5]/[6]) | "The Gem is Valued at N gp." resp. "The Jewel is Valued at N gp." at (1,12) colour 0Fh; bottom menu "You can : " with "Sell Keep" (or only "Sell" when the character is overloaded by 1 or has 16 items) | K keeps (adds a 63-byte item "Gem"/"Jewelry", type 70, weight 1, value N), any other key sells for N div 5 platinum | — | PARTY-ov21-03 if overloaded; RecalcCharacter; back to PARTY-ov21-07 |

---

# ov06 screens — shop (lane por-mod-party)

Frame and party panel: `game_Mode := 1` + RedrawCurrentMode (ENGINE 00BA:27D9, mode 1 layout) and DrawPartyRoster (party list with AC/HP, SelectedChar highlighted). Text window rows 17..22, cols 1..38. Bottom menu row 24 (ov25 HorizontalMenu; colours 0Dh prompt, 0Ah hot letters, 0Fh text).

## PARTY-ov06-01 Shop main menu
- Trigger: ECL `COMBAT` (op 24h) with no monsters and the shop flag (VM 6E6C = 1); entering empties the money pool.
- Row 24: `Buy View Take Pool Share Appraise Exit` when money is in the pool, else `Buy View Pool Appraise Exit` (empty prompt).
- Keys: `B` → PARTY-ov06-02; `V` → character View menu (ov19 ViewMenu, COMBAT lane screens); `T` Take money from the pool (ov21 coin menu "Select type of coin / How much … will you take?"); `P` Pool the party's money (ov21); `S` Share the pool among the party (ov21); `A` Appraise gems and jewelry (ov21, "No Gems or Jewelry", …); `E` → PARTY-ov06-04 or leave; Home/End (scan 47h/4Fh) = previous/next party member as buyer; Esc returns #0 (no action, menu again). Extended keys whose scan code equals an option letter act as that option (except P).
- After B or T (or A when something was appraised) the frame is redrawn; the roster is redrawn after every key.

## PARTY-ov06-02 Shop item list
- Frame (1,1)-(38,22) style 0 with the centred title `Shop` (colour 15) (DrawTitledFrame).
- Scrolling list window cols 1..38, rows 4..22 (ov25 VerticalListMenu): one line per ware, `name` left and the price in gp right-aligned so that it ends in column 30 of the line (wares with price 0 are shown and sold for 1).
- Row 24: prompt `Items: ` + `Buy` (+ ` Next` / ` Prev` when the list scrolls) + ` Exit`.
- Keys: cursor up/down (ov25), Home/End/PgUp/PgDn, `N`/`P` page, `B` or Enter = buy the highlighted ware → PARTY-ov06-03; `E`/Esc → back to PARTY-ov06-01.

## PARTY-ov06-03 Buy result (bottom message)
- Buyer = SelectedChar. Paid from the buyer's coins if their gold value suffices, else from the pool; else ShowTimedBottomMessage `Not enough Money.` (row 24, timed).
- Too many items / too heavy: `OverLoaded` (bottom message), nothing bought.
- On success the item is appended to the buyer's inventory, the payer's remaining coins become platinum + gold; back to PARTY-ov06-02 (list redrawn from the top position kept in `index`).

## PARTY-ov06-04 Leaving with money in the pool
- Text window (DrawWrappedText, cleared first, colour 10): `As you Leave the Shopkeeper says, "Excuse me but you have Left Some Money here."` then (colour 15) `Do you want to go back and get your Money?`
- Row 24 (MenuSelect): `Yes No` (from `~Yes ~No`), Enter not accepted. `N` → leave the shop (pool money is lost); `Y` → text window cleared, back to PARTY-ov06-01.

---

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

---

# ov12 part B — messages shown (lane por-mod-party, fork B)

All ov12 effect handlers run inside combat or effect processing; they draw no screens of their own. Messages go through
`ShowCharacterMessage(c, msg, row, wait)` (00BA:16EC: in combat `game_Mode = 5` the right panel, name at col 23 row `row`,
message under it in colour 0Ah; otherwise the bottom text window; `wait` = MessageDelay + clear), through ApplyEffect /
DamageCharacter (ov24) or `ShowTimedBottomMessage` (00BA:1693, row 24 colour 0Ah, delay, clear). No keys are read.

| id | trigger (routine) | text | where | picture/animation | next |
|---|---|---|---|---|---|
| PARTY-ov12b-01 | EffFearAura 5C00:1AAA (effect 51h, event 08h) | `is paralyzed with fear` / `is weakened by fear` (or ov24 "is Unaffected") | ApplyEffect → ShowCombatMessageAnimation (sparkle) | ov24 sparkle | combat continues |
| PARTY-ov12b-02 | EffFearOnce 5C00:1BA8 (52h) | `is paralyzed with fear` | as 01 | — | — |
| PARTY-ov12b-03 | EffStoneGaze 5C00:1CAD (53h) | `gazes...` (row 10, no wait); `reflects it!` (target, row 12); `is Stoned` (via ApplyFatalStatus, row 10, MessageDelay) | combat panel | animation frames 12h along the gaze line (AnimateAlongPath frames 4, delay 2Dh), and back when reflected | — |
| PARTY-ov12b-04 | EffCharmGaze 5C00:1E77 (54h) | `Gazes...` (row 10); `is charmed` | combat panel / ApplyEffect | animation 12h, 4 frames, delay 2Dh | — |
| PARTY-ov12b-05 | DrainLevels 5C00:2122 (55h/56h) | `is drained a level` / `is drained <n> levels` (row 10, wait); `is dead forever`; `is killed`; debug only (g_49F7 ≠ 0): `max,cur,lost` + `<hp_max> , <hp> , <hp_drained>` (DebugPrint ov33) | combat panel / bottom line (debug) | — | — |
| PARTY-ov12b-06 | EffMummyTouch 5C00:23EC (57h) | `is Diseased` (row 10, wait) | combat panel | — | — |
| PARTY-ov12b-07 | EffShield 5C00:2556 (5Bh) | `is unaffected` (row 10, wait) — Magic Missile only | combat panel | — | — |
| PARTY-ov12b-08 | EffFallsDead 5C00:2610 (5Fh) | `Falls dead` | via ApplyFatalStatus | — | — |
| PARTY-ov12b-09 | EffGaseousEscape 5C00:28BF (67h) | `Turns gaseous and escapes` | RemoveFromCombat (ov24) | view focused on the combatant (FocusCombatant margin 3) | combatant leaves (status 3) |
| PARTY-ov12b-10 | EffSpitAcid 5C00:2C1C (79h) | `Spits Acid` (row 10, wait) + ov24 damage text "takes n points of damage …" | combat panel | animation 17h, 1 frame step, delay 1Eh | — |
| PARTY-ov12b-11 | ItemGiantStrength 5C00:2F57 (83h) | `is stronger` (row 10, wait; in combat forced to the text window by game_Mode := 2) | text window | — | — |
| PARTY-ov12b-12 | ItemAlignmentShock 5C00:30A5 (84h) | ov24 damage text "takes n points of damage from Magic" | combat layout redrawn first when in combat | — | — |
| PARTY-ov12b-13 | ItemNeedsGiantStrength 5C00:3134 (87h) | `Must have Giant Strength` | bottom line (ShowTimedBottomMessage) | — | — |
| PARTY-ov12b-14 | AvoidRangedAttack (part A) via EffAvoidMissiles60 / EffAvoidBoulders | `Avoids it` (row 10, wait) | combat panel | — | — |

String literals (code segment, H): 1A7F "is paralyzed with fear", 1A96 "is weakened by fear", 1B91 "is paralyzed with fear",
1C8D "gazes...", 1C96 "reflects it!", 1CA3 "is Stoned", 1E63 "Gazes...", 1E6C "is charmed", 20DF " levels", 20E7 "a level",
20EF "is drained ", 20FB "is dead forever", 210B "max,cur,lost", 2118 "is killed", 23E0 "is Diseased", 2548 "is unaffected",
2605 "Falls dead", 28A5 "Turns gaseous and escapes", 2C11 "Spits Acid", 2F4B "is stronger", 311B "Must have Giant Strength".
