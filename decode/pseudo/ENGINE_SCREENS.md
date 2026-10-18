# ENGINE_SCREENS — screens, messages and prompts of the resident engine (lane por-mod-engine)

Routines: decode/pseudo/ENGINE.pas.md. Script-driven screens: ECL_SCREENS.md (they use the primitives below).

Geometry and colours (H): 40×25 cells of 8×8 glyphs from 8X8D1.DAX record C9h (LoadTextFont 0709:017C), drawn opaque (background = palette index 0, gray in combat, ENGINE-15);
text goes through `UpCase(ch) mod 64`, so **all text, engine and script, appears in the font's upper-case 64-glyph set**.
Picture box (1,1)-(15,15) with inner frame (3,3)-(13,13), roster (17..38, 1..15), status line row 15 cols 17..38, text
window (1,17)-(38,22), bottom line row 24. EGA colours are the palette index (0Ah light green normal text, 0Bh light cyan
party names, 0Ch light red inactive, 0Dh light magenta prompts, 0Eh yellow, 0Fh white); CGA maps through g_25D5 to 4
colours (0..2→0, 3,9..11→1, 4..6,12,13→2, 7,8,14,15→3); mode 2 uses the index as the pixel nibble. BIOS-text prompts
(0802:0193) use colour 0Eh via INT 10h, not the game font. Startup messages before graphics are plain DOS `WriteLn`.


## Startup, configuration, keys, sound (main_0000, res_042B, res_0899, res_03F1, res_08AE)

### ENGINE-01
**Startup disk prompt** (042B:00FC): `Please insert startup disk.` + new line when `pool.cfg` cannot be opened; waits for any key (ReadGameKey), retries. Next: retry / config read.
### ENGINE-02
**Missing config** (042B:0153): `Unable to find POOL.CFG` then Halt(0) to DOS.
### ENGINE-03
**Not enough memory** (042B:024D): after returning to text mode (RestorePreviousVideoMode): `Not enough memory to run game.  You need <n> more bytes.` with n = 18800h − OvrGetBuf (quirk: not the real shortfall); Halt(0).
### ENGINE-04
**Overlay error** (042B:02A1): text mode, `Overlay error, program abort!`, Halt(0).
### ENGINE-05
**Video mode** (042B:0197..0201): POOL.CFG line 1 'E' → BIOS mode 0Dh (EGA 320×200×16), 'T' → mode 9 (Tandy 320×200×16), else mode 4 (CGA 320×200×4). On exit (TerminateGame 0899:0012) the original BIOS mode is restored.
### ENGINE-06
**Credits / code wheel / main menu sequence** (0000:0102..0127): unless `START.EXE STING`: credits (ShowTitle), code wheel (CodeWheelCheck); then the main menu (PartyCreationMenu); then the adventure (ecl_GameLoop).
### ENGINE-07
**Frames** (03F1:0000/02E8): borders of 8×8 symbols 114h+3*style (+0 corners, +1 vertical, +2 horizontal) drawn one cell outside the rectangle; DrawTitledFrame clears the inside first and centres an optional title (≤ 40 chars) on the first inner row in the given colour (DrawText). The border's visible colours come from the 8×8 symbol bitmaps 114h..116h (style 0) of the loaded 8X8D symbol set — multicolour (red / light-red edges, yellow corners in the captures) — **not** from a call argument; the `colour` argument of DrawTitledFrame only colours the optional title text (fix #ref-3, acceptance/ref/DECODE_CHECKS.md).
### ENGINE-08
**Keys** (0899:0059): `Ctrl-S` toggles sound off/on (no message); in STING mode `Ctrl-D` toggles DebugFlag (g_49F7, read by DebugPrint) and `Ctrl-C` quits to DOS at once. Type-ahead is discarded (last key wins).
### ENGINE-09
**Sounds** (08AE): no screen output; 10 sounds per device (PC speaker table 055Fh, Tandy table 0607h), id 0 = stop + mute, 1 = enable output, FFh = stop, n ≥ 2 → sound n−1. Step sound g_2628 = 0Ah, door sound g_262A = 0Bh. With SoundTransientMode > 0 each sound is cut off after 0.1 s.
### ENGINE-10
**Dormant fake error** (08AE:13EA): if ever armed, `Run-time  Error 209 at 0BAD:0038` at row 0, attribute 7, exit code 255. Never armed in the shipped game (H).

## Disk prompts and DAX errors (res_0802)

### ENGINE-11
0802:0193 BiosPromptLine (used by OpenWithPrompt and LoadDaxRecord): row 24 cleared to colour 0 (40 full-block chars 0DBh via BIOS INT 10h AH=9), the message written from col 0 in colour 0Eh (yellow; CGA: mapped through g_25D5) with BIOS text (not the game font), wait for a key (ReadGameKey), row 24 cleared again. In EGA mode written to both display pages (g_4A1B, g_4A1A).
### ENGINE-12
Disk prompt (OpenDax 0802:05CD → OpenWithPrompt): `Insert disk n in drive X:` (n = DataSet 1..8, X = g_547D) on row 24, yellow; after the key the file is tested again; repeats until the DAX file exists. Suppressed when g_557C <> 0 (then the load just fails: size 0).
### ENGINE-13
Fatal (LoadDaxRecord 0802:0716): `tempsize nnnnn` (packed record > 36000 bytes) on row 24, key, then exit to DOS (TerminateGame). Not reachable with the shipped data (max comp size well below).
### ENGINE-14
Startup (WaitOverlayDisk 0802:0212, from 042B init): `Please insert overlay disk.` written with WriteLn to the TP Output file (plain text, cursor position of the Crt/DOS console), wait for a key, repeated until `game.ovr` exists in the current directory.

## Text output and bottom-line prompts (res_0709)

### ENGINE-15
**Text cells** (DrawRepeatedGlyph 0709:01DF): 40×25 cells of 8×8 glyphs from 8X8D1.DAX record C9h (LoadTextFont 0709:017C, loaded once at game init into FontPtr g_5E20). Glyphs are drawn opaque: the cell background is palette index 0 — black, except in combat, where PaletteFlashOn (BB00:00E3: SetEgaPaletteRegister(0, 8), (8, 0); PaletteFlashOff restores) makes index 0 dark gray 85,85,85 and index 8 black (fix #ref-4: combat HITPOINTS cell (23,3) has gray background pixels). Text strings use `UpCase(ch) mod 64`, so all engine and script text appears in the font's 64-glyph upper-case set (mixed-case source strings such as "Press any key to continue" show upper case). Cells outside col 0..39 / row 0..24 are not drawn. EGA: written to both the display and the draw page.
### ENGINE-16
**Colours**: EGA = the 16-colour index directly (0Ah light green, 0Dh light magenta, 0Fh white); CGA maps through g_25D5 to 4 colours (0..2→0 black, 3,9..11→1, 4..6,12,13→2, 7,8,14,15→3); 16-colour mode (VideoMode 2) uses the index as the pixel nibble.
### ENGINE-17
**Word-wrapped window** (DrawWrappedText 0709:0768): prints from the text cursor (g_5E24 col, g_5E25 row) inside (x1,y1)-(x2,y2); if the cursor is outside the window it starts at the top left; `clear` clears the window first. Words break at spaces; the punctuation `! , - . : ; ?` sticks to the neighbouring word. When a word does not fit, a new line starts (leading spaces skipped). When the window is full and text remains: the bottom row shows `PRESS ANY KEY TO CONTINUE` (colour 0Dh) and waits for any key, then the window is cleared and printing continues at the top. While `TextOutputActive` (g_4A00, set by the ECL text opcodes) each character is followed by a delay of GameSpeed×10 ms (typewriter effect; speed 0 = instant). After the text, if the cursor passed x2 it moves to x1 of the next row.
### ENGINE-18
**Bottom-line prompt + key** (ShowBottomPromptAndReadKey 0709:0BF5): row 24 cleared (40 cells), message at (0,24) in the given colour (max 40 chars), waits for one key (ReadGameKey, any key incl. Ctrl-S sound toggle handling there); the message stays until something else clears row 24. Used for "press <enter>/<return> to continue", "Unable to find item file", paging.
### ENGINE-19
**Timed bottom message** (ShowTimedBottomPrompt 0709:0D68): row 24 cleared, message at (0,24), pause GameSpeed×225 ms (MessageDelay), row 24 cleared. No key.
### ENGINE-20
**Text input** (ReadBottomLine 0709:09E3): row 24 cleared, prompt at (0,24) in `colour`; typed characters (keys ' '..'z' only) appear in white (0Fh) from column Length(prompt)+1 (one blank cell after the prompt); Backspace (08h) deletes the last character; Enter (0Dh) or Esc (1Bh) ends input — Esc keeps the typed text (no cancel). Row 24 is cleared afterwards; the result is upper-cased, at most `maxLen` (≤ 40) characters.
### ENGINE-21
**Number input** (ReadWordNumber 0709:0B66): ReadBottomLine with max 6 characters, repeated until the text is a valid integer 0..65536 (65536 wraps to 0); no error message, the prompt simply reappears.
### ENGINE-22
**Clear rectangle** (ClearTextRectangle 0709:0DD3): cells (x1,y1)-(x2,y2) to black (both EGA pages). **Clear screen** (ClearScreen 0709:0CAB): whole screen black (both EGA pages). **ClearGlyphRun** (0709:05EB): `count` space glyphs from (col,row).

## Pictures and video primitives (res_0464)

### ENGINE-23
0464:00CF SetVideoMode: BIOS INT 10h AH=0 mode switch (whole screen cleared by the BIOS); 0464:00FF switches back to the previous BIOS mode — used before fatal error texts (Load3DMap, LoadWallSet, Load8x8Set, Put8x8Symbol, Show3DSprite, Load24x24Set "Unable to load ..." messages are shown in the restored text mode).
### ENGINE-24
0464:0111 LoadPicture / 0464:02A5 ConvertPicturePixels: nothing drawn; pictures are converted into the current video format (CGA 2 bpp, EGA planar, or 4 bpp linear per VideoMode g_4A1E) with a transparency mask for colour `transpColour` when `maskFlags and 1`.
### ENGINE-25
0464:08D4 DrawPictureInto: draws a picture frame into an off-screen picture (normally the 3D-view/screen buffer) at cell (x, y) = pixel (8x, 8y), transparent pixels keep the background; marks the touched lines dirty (g_4A28/4C20/4AD0/4D70) for the later flush to video (0464:1B52). Nothing reaches the screen until that flush.
### ENGINE-26
0464:0D71 DrawPicture: draws nothing on the screen directly; it composes a picture frame into another picture (normally the off-screen view/screen picture g_4A20) and marks the touched rows/byte spans in DirtyRow/DirtyMinOfs/DirtyMinCol/DirtyMaxOfs; the screen changes only when PresentDirtyRows (0464:1B52) runs. Transparent pixels (mask bits set) keep the destination. With flags bit 2 the covered destination area is first saved into PicSaveBuffer (g_4A24) for a later restore by the caller.
### ENGINE-27
0464:15C7 MirrorPicture: no output; produces the left-facing variant of a combat icon (first frame only) for DrawIconAt.
### ENGINE-28
0464:1484/1509/1596: no output.
### ENGINE-29
0464:1951 PutPicture: draws frame 0 of a picture, opaque, top-left at text cell (col,row) = pixel (col*8,row*8), directly into
  video memory (CGA B800-style segment table g_4EC0 / EGA A000h planes / mode-2 table g_51E0). Used for 8x8 symbols (Put8x8Symbol),
  the title picture (ov01) and full pictures (DrawPictureScreenOrView).
### ENGINE-30
0464:1B52 FlushViewDirtyLines: the 3D view / off-screen view picture g_4A20^ (168 lines) appears on screen at pixel (8,8)
  (cell (1,1)); only changed spans of changed lines are copied. EGA: built in the off-screen VRAM page A000:2000 and copied with
  write mode 1, so no tearing.
### ENGINE-31
0464:2632 FillPictureRect: filled rectangles in the view picture (3D backdrop sky/ground from DrawBackdrop: x=2 cells, y=16 lines,
  w=11 cells, h=43 lines etc.); visible after the next FlushViewDirtyLines.
### ENGINE-32
0464:1E5C RecolorPicture: no drawing; changes colours of a loaded picture (combat icon colours, icon editor; randomMix = partial,
  dithered recolour used for fades/effects).
### ENGINE-33
0464:2A0D SetEgaPaletteRegister: INT 10h AX=1000h — changes one of the 16 EGA palette registers (title fades ov01, ov31 effects);
  the whole screen's colour changes instantly.

## Roster, character panels, messages, status line, party picker (res_00BA)

### ENGINE-34
**Party roster** (DrawPartyRoster 00BA:0767): column x0 = 1 when g_49F3 = 0, else 17. Row 2 header: "Name" at (x0,2) colour 0Fh, "AC  HP" at (33,2) colour 0Fh. Members from row 4, one per row, line cleared (x0..38) first: name at x0 (selected member white 0Fh via DrawText; others via DrawCharacterName 00BA:1816 — status colour, part V); AC right-aligned ending at col 34 (DrawAC at col 32+dx, colour 0Ah, "-" prefix for negative AC); HP right-aligned ending at col 38 (DrawHP at col 36+dx: 0Ah, 0Eh yellow when hp < hp_max). The row after the last member is cleared. Monsters in the party list appear too.
### ENGINE-35
**Character summary panel** (DrawCharacterSummary 00BA:09E3, combat): cols 23..38 rows 1..21 cleared; row 1 name line (ShowCharacterMessage 00BA:16EC, part V); row 3 "Hitpoints" (23,3) colour 0Ah + value at (33,3); row 5 "AC" (23,5) + value at (26,5); if a weapon is readied: its name word-wrapped in (23,7)-(38,9) colour 0Ah; then (row after text) status in white: the status name (Okay, Animated, tempgone, Running, Unconscious, Dying, Dead, Stoned, Gone) when the character is not active, else "(Helpless)" when held/paralysed (effects 33h/34h/35h/1Fh).
### ENGINE-36
**Item name** (BuildItemName 00BA:0442): `[" Yes  "|" No   "]["* "][count " "]word3 word2 word1` — readied column only in lists that ask for it; "*" only when a party member has Detect Magic (effect 5) and the item is magical; hidden (unidentified) words omitted; plural "s" after the last shown word when count ≥ 2 (arrows/quarrels except "Silver"). Drawn at (col,row) colour 0Ah when requested.
### ENGINE-37
**Bottom-line timed message** (00BA:1693 ShowTimedBottomMessage): row 24 cleared, text at (0,24) colour 0Ah, game-speed pause (MessageDelay), row 24 cleared. Used e.g. for "Guarding" (00BA:2686) and 40+ other messages.
### ENGINE-38
**Character message** (00BA:16EC ShowCharacterMessage):
  - combat (game_Mode = 5): right panel (17h..26h, row..15h) cleared; name at (23,row); message word-wrapped below it from row+1 to row 21, colour 0Ah.
  - otherwise: text window; unless g_6DDA, a frame (1,17)-(38,22) is drawn and the window starts at row 17; name at (1,row+1), message from row+2, colour 0Ah. `wait` → pause, then the area is cleared (00BA:17E3: combat (23,10)-(38,21), else (1,18)-(38,22)).
### ENGINE-39
**Names** (00BA:1816 DrawCharacterName, fix #verify-3): colour 0Ch (light red) when TChar `+10Dh` (active flag) = 0, else 0Eh (yellow) when `+10Eh` (side) = 1, else 0Bh (light cyan) — flags, not the status byte; optional "'s" appended.
### ENGINE-40
**Healing** (00BA:234A): "<name>" / "is fully healed" or "is partially healed" (character message with pause); outside combat the roster is redrawn.
### ENGINE-41
**Fatal list errors** (00BA:1509): bottom prompt "Nil Item pointer..." / "Tried to Lose item & couldn't find it!" in colour 0Eh, waits for a key (ShowBottomPromptAndReadKey).
### ENGINE-42
**Combat sparkle** (00BA:1FEB): in combat the window scrolls to show the character, sound g_261C (spell) / g_261A, message in the side panel, 4-frame animation over the character's square (70 ms per frame; repeated g_49E2+1 times for spells), then pause only when reps = 0 (00BA:2171; no pause after a spell message with GameSpeed > 0 — fix #verify-4).
### ENGINE-43
**Missile/spell travel** (00BA:1A29 AnimateAlongPath): the 4-frame animation moves square to square in thirds of a square across the 7×7 combat window, scrolling the window when it leaves the visible part.
### ENGINE-44
**Status line** (00BA:290B): row 15, cols 17..38, colour 0Ah: `X,Y DIR HH:MM` (+ " camping" when camping, " search" when searching). Overland modes 3/4 add 13/26 to X; coordinates hidden when ECL [49FB] ≠ 0. DIR = direction name from DS:25A8 (2 chars per facing).
### ENGINE-45
**Mode redraw** (00BA:27D9 RedrawCurrentMode / 00BA:272A DrawStandardFrames, fix #verify-5): mode 0: whole-screen frame (1,1)-(38,22) only; modes 1, 2, 4, 6: all four frames — (1,1)-(38,22), text window (1,17)-(38,22), picture box (1,1)-(15,15), inner view frame (3,3)-(13,13); **mode 3: the first three, no inner frame**; then mode 1 portrait only (no roster, no status), mode 2 camp picture PIC record 1Dh + roster + status line, modes 3/4 3D/overland view (RefreshView) + roster + status line, mode 6 PIC record 1 + roster (no status); mode 5 (combat) and others: nothing. Style 0, title colour argument 0Fh, no title — the visible borders are the multicolour symbol glyphs (ENGINE-07, fix #ref-3).
### ENGINE-46
**Combat layout** (00BA:2B88): frames map window (1,1)-(21,21) and side panel (23,1)-(38,21) (style 0, title colour argument 0, no title — visible borders are the multicolour symbol glyphs, see ENGINE-07; fix #ref-3), rows 23..24 cleared, combat map redrawn around the window centre.
### ENGINE-47
**Party picker** (00BA:2C48 SelectPartyCharacter): roster with the current selection; menu line: `<prompt> ` + `Select` [+ ` Exit`] (HorizontalMenu colours 0Dh/0Ah/0Fh, picture animates in camp/mode 6). Keys: S or Enter = select current, E = exit (nil), Esc = leave with current, extended keys 47h (Home/keypad 7: previous member, wraps) and 4Fh (End/keypad 1: next, wraps).
