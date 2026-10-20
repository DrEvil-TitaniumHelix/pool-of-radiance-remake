# ECL_SCREENS — what the event scripts put on screen (lane por-mod-ecl)

Routines: decode/pseudo/ECL.pas.md (ov03/ov07). Opcode semantics: decode/ecl/ECL_VM.md. Script texts: decode/ecl/listings/.

Screen geometry (from the call arguments, H unless noted): 40×25 text cells of 8×8 glyphs from the game font
(8X8D), not BIOS text. Cells are (col, row), 0-based.

| region | cells | used for |
|---|---|---|
| picture box | (1,1)-(15,15), frame drawn by `DrawTitledFrame 03F1:02E8` | 3D view / encounter pictures (drawn with top-left cell (3,3), inner frame (3,3)-(13,13)) |
| roster | (17,1)-(38,15) | party list, redrawn by `DrawPartyRoster` after damage / selection |
| text window | (1,17)-(38,22) | PRINT / PRINTCLEAR / prompts, word-wrapped by `DrawWrappedText 0709:0768`, cursor `text_Col/text_Row` (DS:5E24/5E25) |
| menu line | row 24 (cols 0..39) | horizontal menus, "Loading...Please Wait", continue prompts |

Colours: 0Ah light green = script text, 0Fh white = highlights, messages, prompts; 0Dh = menu colour argument
(role inside ov25 M). All text is displayed in upper-case glyphs (`UpCase(ch) mod 64`, ENGINE_SCREENS.md); script text is upper case already (6-bit character set, ECL_VM.md §2.2).

---

### ECL-01 Loading block
- Trigger: `LoadEclBlock` (4300:0341) — game start, NEW_ECL (20h).
- Screen: menu line cleared, `Loading...Please Wait` at (0,24) colour 0Fh; repeats while the DAX record cannot be read; line cleared when loaded.
- Before it (NEW_ECL only): disk check `CheckEclDisk(g_547C+'ECL'+n+'.dax')` — "Insert disk #" prompt when needed (M).
- Next: ECL-02 (block init runs).

### ECL-02 Block init / area entry
- Trigger: vector E after load (`ecl_GameLoop` 2F00:32F8, `ecl_RunAfterNewBlock` 2F00:31B4).
- Screen: whatever the init script does (LOAD_FILES/LOAD_PIECES load map and wall sets; when map + walls are loaded the whole screen is redrawn `RedrawCurrentMode` + roster). Entering a 3D area from the overland: `DrawTitledFrame(3,3,0Dh,0Dh,0,0Ah,'')` (2F00:3266) clears cells (3,3)-(13,13) and draws the style-0 border one cell outside (cells 2/14, multicolour symbol glyphs, #ref-3); 0Ah is only the colour of the empty title; view redrawn (#verify-14). 2D (non-3D) area with LOAD_FILES b3 ≠ FFh: `BACPAC` backdrop picture.
- Next: ECL-03.

### ECL-03 Adventure screen (between scripts)
- Trigger: `ecl_GameLoop` input `ExploreCommand` (VIEW lane: command line "Area Cast View Encamp Search Look" in 3D, without "Area" overland).
- Keys: the command letters; moves. Vector A runs before a move, vector B after it (step sound `g_2628` if the position changed), Encamp → ECL-14.
- Next: script screens below, or back here.

### ECL-04 Script text
- Trigger: PRINT (11h) / PRINTCLEAR (12h) (2F00:0A09); PRINT_RETURN (33h) = new line.
- Screen: text window, colour 0Ah, word-wrapped; PRINTCLEAR clears the window and starts at (1,17), PRINT continues at the cursor. Numbers print in decimal.
- Example: ECL1/18 9B9A `THEY GLARE AT YOUR PARTY, ` + 9C19 `AND DEMAND, 'WHO ARE YOU?'`.
- Next: the script continues immediately (no key wait; scripts follow with DELAY 3Ah or a menu).

### ECL-05 Horizontal menu
- Trigger: HORIZONTAL_MENU (2Bh, 2F00:10D1) → `MenuSelect` (4300:1684).
- Screen: menu line row 24: items shown as `ITEM1 ITEM2 ...`: `MenuHotkeys` lowers every letter except the one after `~` (the hot key, the first letter here), but the text renderer maps every character through `UpCase(ch) mod 64` (ENGINE_SCREENS.md), so all letters appear as upper-case glyphs; the hot key is distinguished by colour (ov25, M). Colours: 0Dh prompt, 0Ah ordinary letters, 0Fh hot keys and the selected option (VIEW.pas.md 9D00:01DA); one item: both 0Fh. The current picture keeps animating when a picture/sprite is up.
- Text substitution: a single item `PRESS <RETURN> OR BUTTON TO CONTINUE` is shown as `PRESS <ENTER>/<RETURN> TO CONTINUE`.
- Keys: the hot-key letters; `,` / `.` move the highlight (ov25); Enter selects only in single-item menus (item 0). HorizontalMenu (9D00:0610..068F) ends only on a capital that starts a displayed option, Space, Esc, Enter or an extended key; MenuSelect keeps looping on Space/Esc and on letters not in the line, which are ignored. Digits 1..9 become cursor scan codes (allowExt = 1, 9D00:06A0) → `special` → `CycleSelectedChar` + roster redraw, menu continues. 0FFh (stored unchecked, quirk) only for a displayed capital that is not a `~` hot key, e.g. an un-marked digit shown as P..Y by MenuHotkeys, or a timeout key (#verify-14).
- Next: row 24 cleared; script continues with the 0-based choice stored.

### ECL-06 Vertical menu
- Trigger: VERTICAL_MENU (15h, 2F00:0F08).
- Screen: text window cleared, the prompt (operand 2) at (1,17) colour 0Ah word-wrapped; below it (from cursor row+1 to row 22, cols 1..38) a vertical list of the items (≤ 40 chars each), highlight 0Fh / normal 0Ah (`VerticalListMenu` → VerticalListMenu).
- Example ECL1/18 9A36: `THE PLAZA AHEAD IS CROWDED WITH MONSTERS. HOW WILL YOU PROCEDE?` / `STRIDE BOLDLY FORWARD!` / `DISGUISE PARTY AS MONSTERS.` / `SNEAK, REMAINING UNSEEN`.
- Keys: list navigation and Enter/Esc (ov25, M); the index is stored even after Esc (quirk).
- Next: text window cleared, script continues.

### ECL-07 Number / text entry
- Trigger: INPUT_NUMBER (0Fh, 2F00:0951), INPUT_STRING (10h, 2F00:0994).
- Screen: entry on the bottom line row 24 (`ReadWordNumber('', 0Ah)` 0709:0B66 / `ReadBottomLine('', 0Ah, 28h)` 0709:09E3, text up to 40 chars): the prompt is empty, so 0Ah is unused; typed characters are white 0Fh from column 1 (0709:0A81); text is upper-cased on return; Esc also returns the typed text (0709:0AEC). Empty text becomes " " (#verify-14).
- Next: value stored, script continues.

### ECL-08 Picture
- Trigger: PICTURE (0Eh, 2F00:0856).
- Screen: p ≠ FFh, not 3D: `DrawTitledFrame(3,3,0Dh,0Dh,0,0Fh,'')` first (2F00:0881): clears (3,3)-(13,13), border one cell outside in the symbol glyphs' own colours; 0Fh = colour of the empty title (#verify-14). If `Mem[6DE1] = FFh`: `PIC<DataSet>.DAX` record p (animation) at cell (3,3) inside the picture box; else head/body portrait: HEAD id `Mem[6DE1]`, BODY id p (`ShowHeadBodyPicture` 4300:0511) at (3,3). p = FFh: picture removed, view redrawn (`RefreshView` RefreshView).
- Next: script continues.

### ECL-09 Encounter approach
- Trigger: SETUP_MONSTER (0Ch), APPROACH (0Dh), and inside ECL-10.
- Screen: `ShowEncounter` (4300:054E): at distance > 0 the `SPRIT<DataSet>.DAX` sprite enc_SpriteId is drawn in the 3D view at size (distance+1) (`Show3DSprite` Show3DSprite; size 2 outside 3D mode); at distance 0 in 3D mode the close-up replaces the view: `PIC` record enc_PicId at (3,3), or the head/body portrait when `Mem[6DE1] ≠ FFh`. The overhead area map is switched off first if it was on.
- Next: script continues; APPROACH shows one step closer.

### ECL-10 Encounter menu
- Trigger: ENCOUNTER_MENU (29h, 2F00:1EF8).
- Screen: ECL-09 picture at the current distance; text window cleared, colour 0Ah: the script text for the distance (operand 10/11/12 = distance 0/1/2, an empty one falls back to the next non-empty one); menu line `Combat Wait Flee Parlay` (distance 0 or not 3D) or `Combat Wait Flee Advance` (3D, distance > 0), hot keys C W F P/A.
- Messages (text window, colour 0Ah): `Both sides wait.` (menu again), `The monsters flee.` (ends).
- Keys: C, W, F, P or A (ECL-05 rules). Advance / approach: distance −1, sprite redrawn closer, menu again.
- Next: row 24 cleared; result stored (0 monsters fled, 1 combat, 2 party fled, 3 parlay) → script (usually COMBAT ECL-12 or PARLAY ECL-11).

### ECL-11 Parlay
- Trigger: PARLAY (2Ch, 2F00:25CB).
- Screen: menu line `Haughty Sly Nice Meek Abusive` (hot keys H S N M A), title " ".
- Next: the script's reaction value for the chosen attitude is stored.

### ECL-12 Combat / shop / temple / duel
- Trigger: COMBAT (24h, 2F00:179B).
- Screen: not drawn by ECL: with monsters loaded → combat (`CombatMain`) then after-combat/treasure (`AfterCombat`) — COMBAT lane; no monsters and `Mem[6E6C] = 1` → shop (`Shop`); `Mem[6DE2] = 1` → temple (`Temple`); no monsters, no duel, neither flag → `AfterCombat` directly (treasure / after-combat screen without a fight, 2F00:17EF); `DuelActive` (after CALL 8000h, SetupDuel) takes the combat branch → duel (#verify-14). Outside 3D areas the 2D panels are reloaded afterwards (`BACPAC`, `ICON` records 0..2) and the main screen redrawn.
- Next: script continues.

### ECL-13 Damage
- Trigger: DAMAGE (2Eh, 2F00:2775) → `ApplyEclDamage` (4300:20CC).
- Screen: per victim in the text window, colour 0Fh, each on a new line: `  <name> is hit FOR nnn points of Damage.` (n in decimal without padding, at most 3 digits: Str into string[3], 4300:20E6) or `  <name> dies. ` (damage > hp+10); dead characters get no line. When the window is full the prompt `press <enter>/<return> to continue` waits and the window is cleared. After each message the roster (17,1)-(38,15) is redrawn.
- Whole party dead: `DrawTitledFrame(1,1,26h,16h,0,0Fh,'The END!')`, then cursor (2,2) but `DrawWrappedText(1,1,26h,16h,0Ah,clear=1,'The entire party is killed!')` clears (1,1)-(38,22) — erasing the centred title on row 1 — and prints from **(1,1)**; only the border and the message stay; 3 s delay (H from code, no capture yet; #verify-14).
- Always ends with `press <enter>/<return> to continue` (colour 0Fh) and a key wait.
- Next: script continues, or (party dead) the game loop ends.

### ECL-14 Camp
- Trigger: Encamp key `E` in ECL-03, or PROGRAM 9 (38h) → `ecl_CampCheck` (2F00:2DD3).
- Screen: vector C script output (may interrupt with text/encounter), then the camp menu `Camp` (`The party makes camp...`, `Camp:` ... — PARTY/MENU lanes); after a rest the screen is redrawn and vector D runs; finally the view is redrawn.
- Next: ECL-03 (PROGRAM 9 then also ends the script, EXIT).

### ECL-15 Who
- Trigger: WHO (39h, 2F00:2B33).
- Screen: text window cleared; party picker `SelectPartyCharacter(prompt, 0, var SelectedChar)` with the script string as prompt: allowExit = 0 (2F00:2B6D), so the menu shows `<prompt> Select` only.
- Keys: S or Enter choose; Home/End etc. move the selection; Esc does nothing (HorizontalMenu returns #0, not in the exit set) (#verify-14).
- Next: the chosen character is SelectedChar.

### ECL-16 Text from memory / picture-box text
- Trigger: PRINT_MEM (3Ch, 2F00:2E7D); CLEAR_BOX (3Dh, 2F00:2B14) clears the picture box (1,1)-(15,15) first.
- Screen: glyphs (VM bytes + 1, until 0 or FFh) at the text cursor, colour 0Fh, then next row; after CLEAR_BOX and if the cursor row > 13, printing restarts at (2,5), i.e. inside the picture box. EXIT (2F00:0007..0040) then calls `DrawTitledFrame(1,1,0Fh,0Fh,…)`, which first **clears (1,1)-(15,15)** — the text printed into the box is erased — and redraws the frame, then in 3D the inner frame (3,3)-(13,13) (#verify-14).
- Next: script continues.

### ECL-17 Silent screen effects
- SPRITE_OFF (31h): view redrawn without the sprite. DELAY (3Ah): game-speed pause. CALL 2C90h: view + status line redraw when a redraw flag is set (party moved C04B..C04D, backdrop C059/C05F, portrait 49FD/49FE); CALL BA03h: sound; CALL C01Eh: party steps forward (shown at the next redraw).
- PROGRAM 0: top-level menu screen (`PartyCreationMenu`, "Choose a function", M); PROGRAM 8: end-game sequence (`DragonFinale`, M).
- LOAD_MONSTER: nothing visible (loads combat icon `CPIC` record into slot g_6F83).
