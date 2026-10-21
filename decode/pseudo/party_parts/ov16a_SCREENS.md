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
