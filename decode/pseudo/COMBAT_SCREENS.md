# COMBAT — screens, menus and messages (lane por-mod-combat)

Assembled from `decode/pseudo/combat_parts/*_SCREENS.md`. Ids COMBAT-01..72 in unit order (definition order within a unit); the unit-local ids of the parts are mapped at the end. Text-routine and coordinate conventions are stated in each unit section.

## ov05 screens — after combat (lane por-mod-combat)

Frame: DrawTitledFrame(1, 1, 38, 22, style 0, title colour 15, title) = the full-screen frame (text cols 1..38, rows 1..22). Text: DrawText(col, row, colour, s) / DrawWrappedText(col1, row1, col2, row2, colour, clear, s). Menu line: HorizontalMenu (horizontal menu on the bottom line, colours 0Dh/0Ah/0Fh = 0Dh prompt, 0Ah ordinary letters, 0Fh hot keys and the selected option (VIEW.pas.md 9D00:01DA), H). All texts exact (code-segment strings 3900:xxxx).

### COMBAT-01 Combat result
- Trigger: AfterCombat 3900:155C → ShowCombatResult 3900:0916 (unless the party was destroyed outside a duel).
- Frame with empty title. Row 3, col 1, colour 10, one of:
  - `You have lost the duel.` (duel, PartyWon = 0; number shown 0)
  - `You have won the duel.` (duel won)
  - `The party has won.` (enemies were fought)
  - `The party has fled.` (no enemy processed and somebody ran; number shown 0)
  - `The party has found Treasure!` (otherwise, e.g. treasure-only encounter)
- Row 5: `The duelist receives <n>` (duel) or `Each character receives <n>` ; row 7: `experience points.` (n = CombatXP, Str width 0).
- Bottom menu: `press <enter>/<return> to continue` (colours 15/15/15, Enter accepted; any hotkey key returns too). Next: COMBAT-02 is shown before this one if an NPC took a share; after it COMBAT-03.

### COMBAT-02 NPC takes a share
- Trigger: NpcTakesShare 3900:12E8 when an NPC (npc_morale ≥ 80h, status Okay, share byte +85h and 7 > 0) took coins from the pool (runs before COMBAT-01).
- Frame with empty title; for each such NPC a line at col 5, rows 5, 7, 9, … (wrap window to col 34 / row 22), colour 10: `<name> takes and hides his share.`
- Bottom menu: `press <enter>/<return> to continue`. Next: COMBAT-01.

### COMBAT-03 Treasure menu
- Trigger: TreasureMenu 3900:0ECD after COMBAT-01. Screen = current mode redrawn (RedrawCurrentMode), party roster.
- Bottom menu (title empty), one of:
  - `View Pool Exit` (no treasure) / `View Take Pool Exit` or `View Take Pool Detect Exit` (items only) / `View Take Pool Share Exit` or `View Take Pool Share Detect Exit` (money present). "Detect" when there are items and SelectedChar has spell 5 or 0Bh memorised.
- Keys: `V` character view (ViewMenu: "Items Spells Trade Drop Exit"); `T` → COMBAT-04; `P` pool the party's money (PoolMoney; ignored for an extended key); `S` share the pool (ShareMoney); `D` cast the Detect spell (CastSpell); `G`/`O` (47h/4Fh) → CycleSelectedChar (select another character), roster redrawn; `E` or Esc → if treasure is left COMBAT-05, else leave.
- Next: back to the ECL script; unclaimed items are freed.

### COMBAT-04 Take
- Trigger: `T` in COMBAT-03 → TakeTreasureMenu 3900:0D38.
- Only money: the coin dialog (TakeMoney: "Select type of coin", "How much", "will you take?"). Only items: COMBAT-06 directly.
- Both: bottom menu title `Take: ` items `Money Items Exit`; keys `M` coin dialog, `I` → COMBAT-06, `E`/Esc back, `G`/`O` select character. Returns to COMBAT-03 as soon as money or items are exhausted.

### COMBAT-05 Treasure left
- Trigger: `E`/Esc in COMBAT-03 while money or items remain.
- Bottom window rows 17..22, cols 1..38: `There is still treasure left.  ` (colour 10, window cleared) followed by `Do you want to go back and claim your treasure?` (colour 15).
- Menu `~Yes ~No` (MenuSelect, Enter not accepted): `No` → leave the treasure (lost: items freed); `Yes` → window cleared, back to COMBAT-03.

### COMBAT-06 Loot list
- Trigger: TakeLootItems 3900:0C06 (from COMBAT-04).
- Frame titled `Loot` (centred on row 1); item list window cols 1..38, rows 4..22 (VerticalListMenu, with its own ` Next`/` Prev`/` Exit` items, M), list title `Items: `, command `Take`.
- Keys: `T` or Enter = give the highlighted item to the selected character (refused "OverLoaded" by AddItemToChar), any other key = leave. Loops until left or the list is empty; then RedrawCurrentMode. Next: COMBAT-04 / -03.

### COMBAT-07 The END
- Trigger: AfterCombat 3900:15B9 when the party was destroyed (PartyDead, not a duel). ECL variable `ecl_Mem6B00^.w[$58E]` := 80h.
- Frame titled `The END!`; text cursor set to (2,6), then the wrapped text starts at (2,5) because the window is cleared first: `The monsters rejoice for the party has been destroyed` (wrap window cols 2..37, rows 5..22, colour 10).
- Bottom line (row 24, colour 13): `Press any key to continue`, waits for any key. Next: back to the ECL script / game loop (PartyDead set; ECL ends the game, ECL_VM.md).

## ov07 (4300) — screens and messages

ov07 has no screen of its own; it writes into the bottom line (row 24), the text window (ECL convention: cols 1..38, rows 17..22, `text_Col`/`text_Row` cursor) and the picture area of the adventure screen. Positions are text cells (40×25).

| id | trigger (routine, address) | exact text / content and position | keys | pictures | next |
|---|---|---|---|---|---|
| COMBAT-08 | LoadEclBlock 4300:0364, every attempt to load ECL block `block` (game start, NEW_ECL) | row 24 cleared (ClearMenuLine), then `Loading...Please Wait` at col 0/row 24, colour 0Fh; repeated until the record `ECL<DataSet>.dax` id `block` has ≥ 2 bytes; row 24 cleared again when done | none | none | script block runs (vector E) |
| COMBAT-09 | ApplyEclDamage 4300:2146 (ECL DAMAGE opcode 2Eh), victim not Dead and `dmg <= hp + 10` | `  <name> is hit FOR <n> points of Damage.` — two leading blanks, `<n>` = decimal damage without padding (string[3]); DrawWrappedText into cols 1..38 rows 17..22, colour 0Fh, starting with `text_Col := 38` (so the two blanks wrap the message onto a new line, M) | none | none | ApplyDamage; roster redrawn (cols 17..38 rows 1..15 cleared first) |
| COMBAT-10 | ApplyEclDamage 4300:2111, `dmg > hp + 10` | `  <name> dies. ` (same window and colour) | none | none | as 02 |
| COMBAT-11 | ApplyEclDamage 4300:219F, before 02/03 when `text_Row > 22` (window full) | `press <enter>/<return> to continue` at col 0/row 24, colour 0Fh (ShowBottomPromptAndReadKey: row 24 cleared first); then the window is cleared and printing restarts at row 17 | any key (ReadGameKey) | none | 02/03 |
| COMBAT-12 | ShowEncounter 4300:0599..05e4 (SETUP_MONSTER, APPROACH, ENCOUNTER_MENU) | encounter sprite: SPRIT<DataSet>.dax record `enc_SpriteId` loaded once (flags 1) and frame `dist+1` (1..3; 2 outside travel mode 1) drawn in the 3D view window (Show3DSprite); the overhead map is switched off first | none | SPRIT record | close-up (06/07) at distance 0 |
| COMBAT-13 | ShowEncounter 4300:0648, distance 0, travel mode 1, `Mem[6DE1] = FFh`, not inside ENCOUNTER_MENU (unless `opt_MonsterPics` g_49F6 ≠ 0) | full close-up picture: PIC<DataSet>.dax record `enc_PicId`, frame 1 drawn at cell (3,3) into the view | none | PIC record | — |
| COMBAT-14 | ShowEncounter 4300:068A / ShowHeadBodyPicture 4300:0511 (also PICTURE opcode) | portrait: HEAD record `Mem[6DE1]` and BODY record `pic` drawn at (3,3), body 5 rows below the head | none | HEAD/BODY records | — |
| COMBAT-15 | MenuSelect 4300:1684 (HORIZONTAL_MENU, ENCOUNTER_MENU, PARLAY, other units) | bottom-line menu via HorizontalMenu: `title` + items; `~X` marks hot key X (shown upper case, the rest lower-cased, digits not after `~` shown as P..Y) | hot-key letters/digits (other letters/digits return 0FFh), Enter only if `acceptEnter` (→ item 0), extended keys → CycleSelectedChar then roster redraw | optional animation | caller |
| COMBAT-16 | VerticalListMenu 4300:1788 (VERTICAL_MENU opcode) | scrolling list via VIEW's VerticalListMenu 9D00:0D9A in window (left, top)-(right, bottom) given by the caller | as 9D00:0D9A | none | caller |

## ov09 (4D00) — screens, messages and keys of the computer-controlled combat turn

ov09 draws no full screen of its own; it writes into two text areas of the combat screen (game mode `g_49F3 = 5`):
- **Message panel** (right side): routine `00ba:16ec` ShowCharacterMessage(c, text, row, wait) clears the rectangle cols 23..38 × rows `row`..21 (`ClearRectangle($17, row, $26, $15)`), prints the combatant's name at col 23 / row `row` (`DrawCharacterName`), then the text word-wrapped in cols 23..38 from row `row+1` (`DrawWrappedText`, attribute argument 0Ah). ov09 always passes `row = 10`, `wait = True`: after printing it waits `GameSpeed * 225` ms (`MessageDelay` = `Crt.Delay(g_49E2 * $E1)`) and clears rows 10..21 again (`00ba:17e3`).
- **Bottom line** (row 24): `00ba:1693` ShowTimedBottomMessage(text) clears row 24 cols 0..39, prints the text at col 0 / row 24 (attribute 0Ah), waits `GameSpeed * 225` ms and clears row 24. `DrawText(col, row, attr, s)` prints without waiting or clearing.
Positions are text cells (40×25). No pictures are loaded by ov09.

| id | trigger (routine, address) | exact text and position | keys | pictures | next |
|---|---|---|---|---|---|
| COMBAT-17 | AiCombatTurn 4d00:00e6: after the morale check, `cb.fleeing <> 0` and `cb.turned = 0` | name (col 23,row 10) + `flees in panic` (from row 11, cols 23..38), pause, panel cleared | none | none | the turn continues (AiMoveAttack moves away) |
| COMBAT-18 | AiMove 4d00:07f9, before every computer step | `Move/Attack, Move Left = ` + decimal `moveLeft shr 1` + one blank, at col 0 / row 24, attribute 0Ah; not cleared by AiMove (cleared by `ClearMenuLine` ClearMenuLine at the start of the next AI turn: 40 blanks at row 24) | interrupt keys of COMBAT-19 are polled right after printing | none | step / attack |
| COMBAT-19 | CheckCombatHotkeys 4d00:0fc1, polled at the start of every AI turn, after weapon choice and before every AI step (non-blocking: only if `KeyPressed`) | key `32h` (after a 0 prefix = scan code of **M**, i.e. Alt-M; without prefix = `'2'`): toggles `MagicOn` and shows `Magic On` or `Magic Off` on the bottom line (col 0,row 24, pause, cleared) | `32h`, space (`20h`), `2Dh` | none | same turn |
| COMBAT-20 | CheckCombatHotkeys, key space (`20h`) | no text. Every party member that is not an NPC (`+84h < 80h`) and not Animated (`+10Ch <> 1`) leaves Quick mode (`+10Fh := 0`); if the acting combatant itself left Quick mode: `cb.initiative := 14h` and the AI turn ends (control returns to ov08's manual menu, see ov08 lane) | space | none | ov08 combat menu for that character |
| COMBAT-21 | CheckCombatHotkeys, key `2Dh` (`'-'`, or Alt-X scan code after a 0 prefix) → GodsIntervene | only when the game was started as `START.EXE STING`: bottom line `The Gods intervene!`; every side-1 combatant becomes Dead (status 6) and is removed from the map (text owned by ov13) | `2Dh` | none | same turn |
| COMBAT-22 | AiMoraleCheck 4d00:1115: `cb.turned <> 0` (the combatant was turned by a cleric) | name + `is forced to flee` in the message panel (row 10/11), pause, cleared | none | none | fleeing movement |
| COMBAT-23 | AiMoraleCheck 4d00:1259: morale failed, cannot outrun the fastest enemy (`MaxEnemyMove > own move/2`) and INT (`+11h`) > 5 | `Surrenders` shown by RemoveFromCombat RemoveFromCombat (ShowCharacterMessage(c, text, 10, True)): name + text in the message panel; the icon is removed, status := 4 (Unconscious), HP := 0 | none | none | turn ended |
| COMBAT-24 | AiEndTurn 4d00:0f97 → `00ba:2686` Guard: the combatant is not held, has no missile weapon and still has initiative | `Guarding` on the bottom line (col 0,row 24, pause, cleared; string at 00BA:267D) | none | none | turn ended (cb.guarding = 1) |

Messages caused by ov09 but printed by other units (texts owned there, listed for completeness): `Begins Casting` (BeginCast, AI spell), `uses an item` / `Item:` (UseItem), `turns undead...` / `is turned` / `Is destroyed` / `Nothing Happens...` (TurnUndead), `Got Away` / `Escape is blocked` (Flee, fleeing combatant blocked), `sweeps` (FighterSweep), `starts to cough` / `chokes and gags from nausea` (StinkingCloudCheck after a step), attack and damage messages (Attack / ov24), the readied-item messages of ReadyItem (`It's Cursed`, `Wrong Class`, `already using `, `Your hands are full!`) are not expected for AI choices but are reachable through ReadyItem.

## ov13 — screens, menus and messages (lane por-mod-combat)

All texts are the exact Pascal literals of ov13 (STRINGS.md, `6100:xxxx`); spaces are significant. Coordinates are text cells (x = column 0..39, y = row 0..24) on the 320×200 screen, as passed to the ENGINE text routines:
- `ShowCharacterMessage(c, s, row, wait)` (00BA:16EC, combat mode `g_49F3 = 5`): clears x 17h..26h, y row..15h; the name of c at (17h, row) in colour 0Ch (c inactive) / 0Eh (side 1, monsters) / 0Bh (side 0, party); s word-wrapped in x 17h..26h from y row+1 (down to 15h) in colour 0Ah; wait ≠ 0 → MessageDelay (`g_49E2` × 225 ms) and the panel is cleared (x 17h..26h, y 0Ah..15h).
- `ShowTimedBottomMessage(s)` (00BA:1693): s at (0, 18h) colour 0Ah, MessageDelay, then row 18h is cleared.
- `DrawText(x, y, colour, s)` (0709:0626) and `DrawWrappedText(x0, y0, x1, y1, colour, f, s)` (0709:0768).
- Menus `HorizontalMenu(prompt, items, 0Dh, 0Ah, 0Fh, a, b, var ext)` / `AskYesNo(prompt, 0Dh, 0Ah, 0Fh)`: the horizontal hot-key menu of the VIEW/ENGINE lane (the three bytes = 0Dh prompt, 0Ah ordinary letters, 0Fh hot keys and the selected option (VIEW.pas.md 9D00:01DA), H; position: bottom line — L, owner ov25). Each item word is selected by its first (capital) letter.
Pictures: the combat map and icons are drawn by ov31/ov32 (VIEW lane); this unit only selects icon poses (ShowCombatant: normal / attack pose), missile sprite frames (combat sprite set `g_6E36`, frames 0Dh.. via 00BA:1892/19DE, flown by 00BA:1A29) and the target cursor frame 19h.

| id | trigger (routine) | text / layout | keys | pictures / sound | next |
|---|---|---|---|---|---|
| COMBAT-25 | ShowAttackResult 6100:02F9 (every attack by MeleeAttack 1406) | attacker name at (17h,0Ah) + verb at row 0Bh: `Attacks` / `-Backstabs-` (backstab) / `slays helpless` (helpless target). Target name at (17h,0Ch) (DrawCharacterName). From (17h,0Dh), window x 17h..26h y 0Dh..10h, colour 0Ah: [`(from behind) `] + `Hitting for ` n ` point ` (n = 1) or ` points ` + `of damage`; helpless: `with one cruel blow`; miss: [`(from behind) `] + `and Misses` | none (MessageDelay) | sounds `g_2622` = 7 (hit / slay), `g_2626` = 9 (all swings missed) | COMBAT-26 / -03 or the next attack |
| COMBAT-26 | ShowAttackResult, damage > 0 to a target that was casting (`cr^.castSpell > 0`) | target name at (17h,0Ch), `lost a spell` at row 0Dh, colour 0Ah, then MessageDelay and clear | none | — | — |
| COMBAT-27 | ShowAttackResult, target became inactive | target name at (17h, r) and `goes down` at row r+1, r = last written row (`g_5E25`) + 1; status 5: `and is Dying` at (17h, r+2) colour 0Ah; status 6/7/8: name at (17h, r+2) + `is killed` at row r+3; then MessageDelay / the body replaces the icon (RemoveCombatant, RemoveCombatant) | none | — | — |
| COMBAT-28 | FighterSweep 6100:0E82 | attacker name (17h,0Ah) + `sweeps` (row 0Bh), MessageDelay, clear; then one COMBAT-25 per swept target | none | — | ov13-01 |
| COMBAT-29 | Flee 6100:0C6A, success | via RemoveFromCombat: c's name (17h,0Ah) + `Got Away` (row 0Bh), MessageDelay; icon removed (status 3 Running) | none | — | combat continues |
| COMBAT-30 | Flee, failure | `Escape is blocked` at (0,18h) colour 0Ah, MessageDelay, cleared | none | — | combat continues (turn ended) |
| COMBAT-31 | TurnUndead 6100:116A | cleric name (17h,0Ah) + `turns undead...` (row 0Bh); bottom line cleared (ClearMenuLine); MessageDelay. Per affected undead: its summary panel (00BA:09E3), then `is turned` (00BA:1FEB: name + text at row 0Ah with the turn animation and sound `g_261C`) or name + `Is destroyed` (row 0Ah) and its icon/body removed | none | undead flash/animation (00BA:1FEB) | ov13-08 if none affected |
| COMBAT-32 | TurnUndead, no undead affected | `Nothing Happens...` at (0,18h) colour 0Ah, MessageDelay | none | — | turn ends |
| COMBAT-33 | CollectSpellTargets 6100:20C3, player picks a combatant twice (multi-target spells) | `Already been targeted` at (0,18h) colour 0Ah, MessageDelay | none | — | the target selection repeats |
| COMBAT-34 | BeginCast 6100:2414, spell not usable in combat (`DS:3205 = 0`) | `Camp Only Spell` at (0,18h) colour 0Ah | none | — | no cast |
| COMBAT-35 | BeginCast, casting time > 0 | caster name (17h,0Ah) + `Begins Casting` (row 0Bh), MessageDelay, clear | none | — | spell fires later (castSpell) |
| COMBAT-36 | ConfirmAttackAlly 6100:2998 (target on the own side, attacker not `controlled`) | prompt `Attack Ally: ` with the items `Yes No` (AskYesNo, literal "Yes No" at 9D00:10AA) | `Y` = yes (NPCs of the party turn hostile), anything else = no | — | attack or back to aiming |
| COMBAT-37 | TargetMenu 6100:2AA0 inside SelectTarget 6100:3558 (combat Aim / spell target) | attack mode: `Range = ` n `  ` at (0,17h) colour 0Ah (n = TargetDistance); prompt `Aim:` items `Next Prev Manual ` + [`Target `] + `Center Exit`; the highlighted combatant's summary panel (00BA:09E3, x 17h..26h, y 1..15h) and focus on its icon | `N` next, `P` previous, `M` manual cursor (ov13-14), `T` target (only if offered), `C` centre the view on it, `E` / Esc exit | cursor frame 19h animated between targets (00BA:1A29) | ConfirmTarget → attack (ov13-01) or spell; ov13-12 for allies |
| COMBAT-38 | ManualAim 6100:2DFA (`M` in the Aim menu) | attack mode: `Range = ` n `  ` at (0,17h) (n = line-of-sight range / 2) or row 17h cleared when there is no line of sight; summary of the combatant or body under the cursor, else the panel x 17h..26h y 1..15h is cleared; prompt `(Use Cursor keys) ` items [`Target `] + `Center Exit` | cursor keys / keypad (scan codes 48h Up, 49h PgUp, 4Dh Right, 51h PgDn, 50h Down, 4Fh End, 4Bh Left, 47h Home = 8 directions), `T` / Enter select, `C` centre, `E` / Esc exit; other keys stop the cursor | cursor on the map (FocusSquare mode 3) | ConfirmTarget (attack) / spell target, back to ov13-13 |
| COMBAT-39 | EffRake 6100:39D2 (effect 49h, both claws hit) | attacker name (17h,0Ah) + `Rakes...` (row 0Bh), MessageDelay, clear; then COMBAT-25 for the 2 rake swings | none | — | ov13-01 |
| COMBAT-40 | GodsIntervene 6100:3B93 (game started as `START STING`) | `The Gods intervene!` at (0,18h) colour 0Ah, MessageDelay; all monsters removed, view redrawn | none | — | combat ends (no enemies) |
| COMBAT-41 | StepCombatant 6100:0712 / Attack 6100:1884 | no text: icon moves (sound `g_2628` = 0Ah per step); attack: attacker turns to the target (attack pose), 100 ms delay, missile flight for thrown/missile weapons and slings (sounds `g_2620` = 6 launch, `g_262C` = 0Ch impact), pose restored | — | icons, missile frames | ov13-01 |

## ov18 screens — dragon finale (lane por-mod-combat)

Text window = text rows 17..22, columns 1..38 (cleared with ClearTextRectangle(1,17,38,22)); all text colour 10. Pictures: DAX file `FINAL<DataSet>.dax` (LoadPicture/LoadAnimation append `.dax`). No key is read anywhere in ov18.

### COMBAT-42 Dragon dies (page 1)
- Trigger: ECL `PROGRAM 8` (ecl_op38_Program 2F00:2E5A) → DragonFinale 7A00:02A4. Game mode `game_Mode` := 7 for the whole sequence.
- Text (col 1): row 17 `Mortally wounded, the dragon roars!`, row 18 `The spirit of Tyranthraxus flares up`, row 19 `from the dragon's body.`
- Then RedrawCurrentMode: mode 7 has no case in RedrawCurrentMode 00BA:27D9 (cases 0,1,2,3,4,6 only), so nothing is drawn; picture FINAL record 1 drawn at cell (0,0) into the screen picture, animation FINAL record 2 played at cell (3,5) for `(5*(10-GameSpeed)) shr 1` loops. The FINAL picture first becomes visible at the first FlushViewDirtyLines in PlayFinaleAnimation (7a00:006f).
- Keys: none. Next: COMBAT-43.

### COMBAT-43 Tyranthraxus speaks (page 2)
- Pictures: FINAL record 3 at (0,0); if party members (`ecl_Mem6B00^.w[$67C]`) > 1: record 4 at (0,11); > 2: record 5 at (13,9); > 3: record 6 at (0,9) (col,row cells, M).
- Text (col 1, rows 17..22):
  - `"Fools, you have but slain the body`
  - `I possessed.  I cannot be defeated!"`
  - `With the power of the pool of radiance`
  - `which I moved here, to my lair,`
  - `I will still rule, by possessing one`
  - `of you!"`
- Animation FINAL record 7 at (3,1), `(5*(10-GameSpeed)) shr 1` loops. Keys: none. Next: COMBAT-44.

### COMBAT-44 Bane recalls him (page 3)
- Text (col 1, rows 17..20): `"No Lord Bane!  I can still rule here!` / `I have not failed.  Do not call me back` / `through the pool!"` / `Noooo...`
- Animation FINAL record 8 at (3,1), 1 loop; then 3 × MessageDelay (3 × GameSpeed*225 ms).
- Exit: game mode restored, RedrawCurrentMode; control returns to the ECL script (next instruction after PROGRAM).

### COMBAT-45 Overland tiles recolour (no text)
- Trigger: RecolourOverlandTiles 7A00:06B3. From ecl_RunAfterNewBlock (2F00:3243) with animate = 1 when `ecl_Mem4900^.w[$1CC] = 0`, `ecl_Block = $1A` and `ecl_Mem4900^.w[$366] = $FE` and `ecl_Mem4900^.w[$344] = 0`; from LoadGame (7500:1CB2) with animate = 0 when `ecl_Mem4900^.w[$344] <> 0` (restores the changed tiles after loading).
- animate = 1: overland view drawn at map (17,15); 9 steps of a 25 % dithered recolouring of 29 SQRPACI tiles (colour 7→2, plus 0→1 in 11 of them), the view redrawn after each step at (17,15)×3, (19,20)×3, (23,25)×3; then the full recolouring, view at (23,25), two MessageDelays.
- animate = 0: full recolouring only, nothing drawn.
- Keys: none. Next: back to the caller.

## ov19 SCREENS — character sheet, View/Items menus, item and coin dialogs (lane por-mod-combat)

Source: `decode/pseudo/combat_parts/ov19.pas.md` (statement addresses `7f00:xxxx`). Screen = 40×25 text cells of 8×8 pixels (EGA 320×200); positions are (col, row), 0-based. Colours are EGA indices: 0Ah light green, 0Bh light cyan, 0Ch light red, 0Dh light magenta, 0Eh yellow, 0Fh white.
Shared conventions (callee evidence in the .pas.md alias table):
- **Bottom menu line** (HorizontalMenu HorizontalMenu): prompt at (0,24) in colour 0Dh, followed by the item words: ordinary letters 0Ah, hot keys and the selected option 0Fh (VIEW.pas.md 9D00:01DA). Keys: the first letter of a word (upper-cased), ',' / '.' move the highlight, Enter returns #13, Esc returns #0. Extended keys are not enabled by ov19's own calls.
- **List menu** (VerticalListMenu VerticalListMenu): list window (x1,y1)-(x2,y2); the bottom line gets the given items plus " Next" / " Prev" (when the list scrolls) and " Exit". Esc/Exit → nothing selected.
- **Bottom message** (ShowTimedBottomMessage 00BA:1693): row 24 cleared, text at (0,24) colour 0Ah, timed delay (`g_49E2*225` ms), row 24 cleared again. No key.
- **Yes/No** (AskYesNo AskYesNo): bottom menu `<prompt>Yes No`, colours (0Dh,0Ah,0Fh) = 0Dh prompt, 0Ah ordinary letters, 0Fh hot keys and the selected option (VIEW.pas.md 9D00:01DA); keys Y / N.
- **Dialog window** rows 21..22, cols 1..38 (DrawWrappedText colour 0Eh, cleared first unless noted), removed afterwards by ClearRectangle(1,21,38,22).
- DrawFrame(x1,y1,x2,y2) draws the border one cell outside the rectangle (cols x1-1 / x2+1, rows y1-1 / y2+1).

---

### COMBAT-46 Character sheet
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

Pictures: portrait via ShowPortrait when `opt_Portraits{g_49F5} <> 0` and `DataSet = 3` (picture placement: VIEW/ov28). Keys: none (static); the menu is COMBAT-47. Note: rows 20/21 stay empty when no weapon/armour is readied; the Status line is always row 22.

### COMBAT-47 View menu
Trigger: `ViewMenu` 7F00:0AB3 (shop 'V', temple, treasure, camp, area command loop, top level, combat menu). Shown under COMBAT-46.
Bottom line: `View:` + `Items ` (if any items) + `Spells ` (if any memorised spell) + `Trade ` (if coins, not an NPC unless inactive/animated, not in combat) + `Drop ` (if coins) + `Exit`.
Keys: `I` → COMBAT-48; `S` → COMBAT-60 (spells in memory); `T` → COMBAT-58; `D` → COMBAT-59; `E` or Esc → leave (RedrawCurrentMode); Enter → ignored. After I/S/T the sheet is redrawn. In combat (game_Mode 5) the palette is switched by ov31 on entry/exit; the loop also ends when an item use took the turn.

### COMBAT-48 Items screen
Trigger: `ItemsMenu` 7F00:0EF8 (View 'I'; combat via stub e6). Full redraw: ClearScreen; DrawFrame(1,1,38,22); `<name>'s` at (1,1) (DrawCharacterName colours); `Items` at (len+4, 1) colour 0Ah; DrawTitledFrame(1,3,38,22) (border rows 2/23); `Ready Item` at (1,3) colour 0Fh.
List window (1,5)-(38,22): one line per item = BuildItemName text: ` Yes  ` / ` No   ` (readied) + count + name words.
Bottom line: `Ready` + ` Use` (active, ECL word 49E5 = 0, and game_Mode 2/3/4, or combat with combatant flag) + ` Trade` (not combat; NPC rule as in -02) + ` Drop` + ` Halve` (fewer than 16 items) + ` Join` + ` Sell` (shop, game_Mode 1; NPC rule) + ` Id` (shop) + ` Next`/` Prev` + ` Exit`.
Keys: R → -04 Ready; U → -05/-10; T → -07 then -08; D → -07 then -06; H → -09; J → join (no screen); S → -07 then -11; I → -12; E/Esc → back to -02. The screen closes when the last item is gone.

### COMBAT-49 Ready / unready messages
Trigger: `ReadyItem` 7F00:14D0. Bottom messages (row 24, colour 0Ah, timed): `It's Cursed` (unready a cursed item, item +36h ≠ 0) · `Wrong Class` · `already using <name of the item in that slot>` · `Your hands are full!` (not shown in combat for controlled creatures). Success: no message, the Yes/No column changes on the next list draw.

### COMBAT-50 Use: "Must be Readied"
Trigger: ItemsMenu 'U' on an unreadied item (7f00:12c4). Bottom message `Must be Readied`.

### COMBAT-51 Drop item confirmation
Trigger: ItemsMenu 'D' (7f00:138c). Dialog window (1,21)-(38,22) colour 0Eh: `Your <item name>will be gone forever` (item name as built by BuildItemName, concatenated without an extra blank by ov19). Bottom: `Drop It? Yes No`. Y → item deleted; window cleared either way.

### COMBAT-52 May-lose checks (Trade / Drop / Sell)
Trigger: `MayLoseItem` 7F00:0D70.
- Readied item: bottom message `Must be unreadied`.
- Scroll with a spell being scribed: name of SelectedChar at (1,21) (DrawCharacterName colours), then ` was going to scribe from that scroll` continuing after the name (colour 0Eh, window (1,21)-(38,22), not cleared); bottom `is it Okay to lose it? Yes No`. Window cleared afterwards.

### COMBAT-53 Trade item
Trigger: `TradeItem` 7F00:1734. RedrawCurrentMode (normal screen of the current mode), then SelectPartyCharacter with prompt `Trade with Whom?` (ENGINE 00BA:2C48 screen). Receiver over 15 items or over the weight limit → bottom message `Overloaded`. Next: back to -03 (full redraw).

### COMBAT-54 Halve
Trigger: `HalveItem` 7F00:17ED. Stack of 1 (or 0) → bottom message `Can't halve that`; otherwise the list shows the new stack.

### COMBAT-55 Use item
Trigger: `UseItem` 7F00:1A8A. Scroll → COMBAT-60 in mode 2 (`Spells on Scroll`). Wand-type item (spell in `power[2]`): in combat the combat layout is redrawn (DrawCombatLayout) unless the user is a controlled creature; ShowCharacterMessage: name + `uses an item` (combat: right panel from (23,10); outside combat: message rows 17/18 area, ENGINE); in combat `Item:` at (0,23) colour 0Ah and the item name at (5,23), otherwise the item name at (1,22); timed delay; message cleared. Then the MAGIC cast screens (CastSpell: "casts", "is a combat-only item... Use it?", "Abort Spell?").

### COMBAT-56 Sell (shop)
Trigger: `SellItem` 7F00:1CEE. Window (1,21)-(38,22) colour 0Eh: `I'll give you <price> gold pieces for your <item name>`; bottom `Is It a Deal? Yes No`. Y → bottom message `Sold!`; if the coins do not fit: bottom message `Overloaded.  Money will be put in pool.` (two blanks after the full stop). Window cleared.

### COMBAT-57 Identify (shop)
Trigger: `IdentifyItem` 7F00:1F52. Window: `For 200 gold pieces I'll identify your <item name>`; bottom `Is It a Deal? Yes No`. Not affordable (character and pool both < 200 gp): bottom message `Not Enough Money`. Paid: window `I can't tell anything new about your <name>` (nothing hidden) or `It looks like some sort of <new full name>`; timed delay; window cleared.

### COMBAT-58 Trade coins
Trigger: `TradeCoins` 7F00:2156 (View 'T'). RedrawCurrentMode, SelectPartyCharacter `Trade to?`; then the character sheet (COMBAT-46) with the money column; coin list window (12,7)-(25,13), one line per non-zero kind, Jewelry first: 8-character right-aligned kind name + blank + amount (e.g. `    Gold 120`); bottom `Select type of coin` + ` Next`/` Prev`/` Exit`. After a choice: row 24 `How much <Kind> will you trade? ` (kind text from ov21: `Copper `, `silver `, `electrum `, `Gold `, `Platinum `, `Gems `, `Jewelry `) colour 0Ah, digits typed after it (Enter ends, Esc = 0, value capped at the coins held). Receiver overloaded → bottom message `Overloaded` (ov21). Next: coin list again while coins remain; Exit/Esc → back to `Trade to?` (see quirk in .pas.md).

### COMBAT-59 Drop coins
Trigger: `DropCoins` 7F00:24A7 (View 'D'). Money column redrawn, same coin list window (12,7)-(25,13) with `Select type of coin`; amount prompt `How much <Kind> will you drop? `. Repeats while coins remain; Exit/Esc returns to -02 (money column redrawn). In shop/treasure modes the coins go to the treasure pool (DropCoinsToPool).

### COMBAT-60 Spell list header
Trigger: `SpellList` 7F00:299C (View 'S' mode 0; scroll use mode 2; combat cast BeginCast; camp memorize/scribe ov15). On the first call (index < 0): DrawTitledFrame(1,1,38,1) (one-row frame), `<name>'s` at (1,1), `Spells <mode text>` at (len+4, 1) colour 0Ah, mode text = `in Memory` / `in Spell Book` / `on Scroll` / `on Scrolls` / `to choose from` / `to be memorized` / `to be scribed`. The list and its menu are MAGIC (ChooseSpell: "Cast", "Memorize", "Scribe", "Learn", "Choose Spell:"). Nothing is shown when the list is empty.

### Not a screen
- `CycleSelectedChar` 7F00:27DF: Home/End (scan 47h/4Fh) in any bottom menu select the previous/next party member (the caller redraws).
- `ItemOverloads` 7F00:275B, `MoneyInGold` 7F00:28BE, `JoinItems` 7F00:189D: no output.

## ov24 screens / messages — effects, damage, healing (lane por-mod-combat)

ov24 has no screens or menus of its own and reads no keys; it emits character messages through the resident routines
`ShowCharacterMessage{00BA:16EC}(c, msg, row, wait)` (in combat, `game_Mode = 5`: name at col 23 row `row`, text at row+1 of the right-hand panel (rectangle pushes 17h, row, 26h, 15h → cols 23..38, M); outside combat: bottom text window rows 17..; `wait <> 0` = MessageDelay (GameSpeed*225 ms) then the panel is cleared) and
`ShowCombatMessageAnimation{00BA:1FEB}(c, flag, msg)` (combat message with the hit animation, ENGINE).
All texts are exact (code-segment Pascal strings, 9800:xxxx).

| id | trigger (routine) | text | how shown | next |
|---|---|---|---|---|
| COMBAT-61 | StinkingCloudCheck 9800:0BB7, save succeeded (effect 1Eh, 1 round) | `starts to cough` | ShowCombatMessageAnimation(c, 1, …) via ApplyEffect, then cleared | caller continues |
| COMBAT-62 | StinkingCloudCheck 9800:0BFC, save failed (effect 1Fh, 1d4+1 rounds) | `chokes and gags from nausea` | same | caller continues |
| COMBAT-63 | CureEffect 9800:10A3 (effect removed by a cure) | `is Cured` | ShowCharacterMessage(c, …, row 10, wait) | — |
| COMBAT-64 | DamageCharacter 9800:1391, amount ≥ 2 | `takes <n> points of damage ` + optional suffix | ShowCombatMessageAnimation(c, 0, …) | 05/06/07 |
| COMBAT-65 | DamageCharacter 9800:13D0, amount = 1 | `takes 1 point of damage ` + optional suffix | same | |
| COMBAT-64a | suffix by `DamageType and $F7` = 1 / 2 / 4 / 10h; or `DamageType` ∈ {0, 8} | `from Fire` / `from Cold` / `from Electricity` / `from Acid`; `from Magic` | appended to 04/05 (no extra space) | |
| COMBAT-66 | DamageCharacter 9800:1522, in combat, the victim was casting (`combatant^[0] <> 0`) | `lost a spell` | ShowCharacterMessage(c, …, row 12, wait) | |
| COMBAT-67 | DamageCharacter 9800:156E, victim no longer active | `Goes Down`; status Dying → `Goes Down, and is Dying`; status Dead/Stoned/Gone → `is killed` | ShowCharacterMessage(c, …, row text_Row+1, no wait); then MessageDelay outside combat, or (combat) icon removal RemoveCombatant / MessageDelay | |
| COMBAT-68 | ApplyEffect 9800:1695, effect vetoed by a hook (event 9) or negated by the save | `is Unaffected` | ShowCharacterMessage(c, …, row 10, wait) | |
| COMBAT-69 | ApplyEffect 9800:171F, caller supplied a non-empty message | caller's text (string[40]) | ShowCombatMessageAnimation(c, 1, …), cleared | |
| COMBAT-70 | RemoveFromCombat 9800:0F4C | caller's text: "Got Away" (Flee), "Surrenders" (ov09 AiMoraleCheck), "Turns gaseous and escapes" (EffGaseousEscape) | ShowCharacterMessage(c, …, row 10, wait); icon removed from the combat map | |
| COMBAT-71 | ReviveCombatant 9800:1904, enemy (side 1) | `stands up and grins` | ShowCharacterMessage(c, …, row 10, wait) | |
| COMBAT-72 | ReviveCombatant 9800:1904, party side | `gets back up` | same | |

Pictures: none loaded here (icon redraws are delegated to RestoreTerrain / RemoveCombatant / FocusCombatant, VIEW lane).

## Id map (unit-local -> area id)

| part id | area id |
|---|---|
| COMBAT-ov05-01 | COMBAT-01 |
| COMBAT-ov05-02 | COMBAT-02 |
| COMBAT-ov05-03 | COMBAT-03 |
| COMBAT-ov05-04 | COMBAT-04 |
| COMBAT-ov05-05 | COMBAT-05 |
| COMBAT-ov05-06 | COMBAT-06 |
| COMBAT-ov05-07 | COMBAT-07 |
| COMBAT-ov07-01 | COMBAT-08 |
| COMBAT-ov07-02 | COMBAT-09 |
| COMBAT-ov07-03 | COMBAT-10 |
| COMBAT-ov07-04 | COMBAT-11 |
| COMBAT-ov07-05 | COMBAT-12 |
| COMBAT-ov07-06 | COMBAT-13 |
| COMBAT-ov07-07 | COMBAT-14 |
| COMBAT-ov07-08 | COMBAT-15 |
| COMBAT-ov07-09 | COMBAT-16 |
| COMBAT-ov09-01 | COMBAT-17 |
| COMBAT-ov09-02 | COMBAT-18 |
| COMBAT-ov09-03 | COMBAT-19 |
| COMBAT-ov09-04 | COMBAT-20 |
| COMBAT-ov09-05 | COMBAT-21 |
| COMBAT-ov09-06 | COMBAT-22 |
| COMBAT-ov09-07 | COMBAT-23 |
| COMBAT-ov09-08 | COMBAT-24 |
| COMBAT-ov13-01 | COMBAT-25 |
| COMBAT-ov13-02 | COMBAT-26 |
| COMBAT-ov13-03 | COMBAT-27 |
| COMBAT-ov13-04 | COMBAT-28 |
| COMBAT-ov13-05 | COMBAT-29 |
| COMBAT-ov13-06 | COMBAT-30 |
| COMBAT-ov13-07 | COMBAT-31 |
| COMBAT-ov13-08 | COMBAT-32 |
| COMBAT-ov13-09 | COMBAT-33 |
| COMBAT-ov13-10 | COMBAT-34 |
| COMBAT-ov13-11 | COMBAT-35 |
| COMBAT-ov13-12 | COMBAT-36 |
| COMBAT-ov13-13 | COMBAT-37 |
| COMBAT-ov13-14 | COMBAT-38 |
| COMBAT-ov13-15 | COMBAT-39 |
| COMBAT-ov13-16 | COMBAT-40 |
| COMBAT-ov13-17 | COMBAT-41 |
| COMBAT-ov18-01 | COMBAT-42 |
| COMBAT-ov18-02 | COMBAT-43 |
| COMBAT-ov18-03 | COMBAT-44 |
| COMBAT-ov18-04 | COMBAT-45 |
| COMBAT-ov19-01 | COMBAT-46 |
| COMBAT-ov19-02 | COMBAT-47 |
| COMBAT-ov19-03 | COMBAT-48 |
| COMBAT-ov19-04 | COMBAT-49 |
| COMBAT-ov19-05 | COMBAT-50 |
| COMBAT-ov19-06 | COMBAT-51 |
| COMBAT-ov19-07 | COMBAT-52 |
| COMBAT-ov19-08 | COMBAT-53 |
| COMBAT-ov19-09 | COMBAT-54 |
| COMBAT-ov19-10 | COMBAT-55 |
| COMBAT-ov19-11 | COMBAT-56 |
| COMBAT-ov19-12 | COMBAT-57 |
| COMBAT-ov19-13 | COMBAT-58 |
| COMBAT-ov19-14 | COMBAT-59 |
| COMBAT-ov19-15 | COMBAT-60 |
| COMBAT-ov24-01 | COMBAT-61 |
| COMBAT-ov24-02 | COMBAT-62 |
| COMBAT-ov24-03 | COMBAT-63 |
| COMBAT-ov24-04 | COMBAT-64 |
| COMBAT-ov24-05 | COMBAT-65 |
| COMBAT-ov24-06 | COMBAT-66 |
| COMBAT-ov24-07 | COMBAT-67 |
| COMBAT-ov24-08 | COMBAT-68 |
| COMBAT-ov24-09 | COMBAT-69 |
| COMBAT-ov24-10 | COMBAT-70 |
| COMBAT-ov24-11 | COMBAT-71 |
| COMBAT-ov24-12 | COMBAT-72 |
