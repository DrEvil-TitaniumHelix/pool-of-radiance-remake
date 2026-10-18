# PARTY — title/credits, code wheel, startup, top-level menu, character creation/modify/train, save/load, rest, shop, money/items, special-attack effects (FINAL pseudocode, lane por-mod-party)

Units (herdr/assignments/por-areas.md): ov00, ov01, ov02, ov11, ov16, ov17, ov20, ov21, ov06, ov12.
Sources: `decode/listings/<unit>.lst` (evidence) and the image bytes (`python decode/ecl/hdis.py ovNN START END`); `.c` and the codex draft `PARTY.draft.md` were used only as a checklist. Screens: `PARTY_SCREENS.md`. Names: `decode/names/party_names.json`. Per-part working files (notes with routine tables, globals, unknowns and self-checks): `decode/pseudo/party_parts/`.

Conventions (as VIEW.pas.md / ENGINE.pas.md)
- **Signatures in Pascal order**: first parameter = highest BP offset = pushed first; parameters as `name [BP+xx]`. Every call was written from its PUSH sequence (first pushed = first argument).
- `{ seg:off }` = first instruction of the statement; `{ quirk: ... }` = behaviour a faithful port must copy.
- Globals `g_XXXX` = DS:XXXX (GLOBALS.md) or the name from decode/names/*.json; names introduced by this lane are written `Name{g_XXXX}` and requested from por-tooling (STATUS.md globals request).
- Resident callees by ENGINE names (`decode/names/engine_names.json`), `Name{SSSS:OOOO}`; other lanes' overlay routines by their lane names; Turbo Pascal runtime by RT_LEDGER names.
- Production: eight fork workers of this lane wrote one range each from the asm (ov12 0000..1A18 / 1A19..end, ov16 0000..1F36 / 1F37..end, ov17, ov21, ov20+ov06, ov00+ov01+ov02+ov11) with their own byte re-checks; merged here (unit order of the area table, ov12 last).

---

# ov00 (seg 2000) — heap-error handler "Insufficient Memory" (FINAL pseudocode, lane por-mod-party)

Unit: ov00, analysis segment 2000, stub segment 0016, 2 routines (functions.tsv): 2000:0042 (entry e1), 2000:00AC (init, entry e0).
Role: installs a Turbo Pascal `HeapError` function that is called by GetMem/New when the heap is exhausted; it shows the
low-memory messages on the bottom line and terminates the game.
Sources: `decode/listings/ov00.lst` (evidence), `ov00.c` (aid). String literals at 2000:0000 ("WARNING: Insufficient Memory",
28 chars) and 2000:001D ("Insufficient Memory. Exiting Program", 36 chars) — bytes `1C 57 41 52 ...`, `24 49 6E 73 ...`.

Conventions (as VIEW.pas.md / ENGINE.pas.md)
- **Signatures in Pascal order**: first parameter = highest BP offset (pushed first); parameters as `name [BP+xx]`.
- `{ seg:off }` = first instruction of the statement (or of the call that implements it); `{ quirk: ... }` = behaviour a port must copy.
- Globals `g_XXXX` = DS:XXXX (GLOBALS.md) or the lane name; names introduced here are listed in `ov00_names.json`.
- Resident callees by the ENGINE names: `ShowBottomPromptAndReadKey{0709:0BF5}(colour, s)` (clears row 24, draws `s` at col 0 in
  `colour`, waits for one key), `TerminateGame{0899:0000}` (stop sound, restore BIOS video mode, Halt(0)).

---

### 2000:0042 HeapErrorHandler (H)
`function HeapErrorHandler(size [BP+6]: Word): Integer` (far, `RETF 2`) — called by the TP heap manager through `HeapError`
(DS:4414/4416), installed by ov00_init. Name H: the far pointer stored in `HeapError` is 0016:0025 = stub ov00 entry 1 → 2000:0042
(LAYOUT stub layout `+20+5i`), and the TP heap calls `HeapError` with the requested size and expects 0/1/2.
Callees: ShowBottomPromptAndReadKey, SaveGame (SaveGame via stub_ov17_e9), TerminateGame.
```pascal
if size > 0 then begin                                          { 2000:0048  CMP [BP+6],0 ; JBE -> exit }
  done := False;                                                { 2000:004e  local [BP-3] }
  repeat
    ShowBottomPromptAndReadKey($0E, 'WARNING: Insufficient Memory');   { 2000:0064  pushes 0Eh, then the string }
    if LowMemSaveGame{g_49D0} <> 0 then begin                   { 2000:0069 }
      SaveGame;                                                 { 2000:0070  SaveGame "Save Which Game" }
      done := g_557D;                                           { 2000:0075  set by SaveGame (game saved = non-zero, M) }
    end else begin
      done := True;                                             { 2000:007d }
      ShowBottomPromptAndReadKey($0E, 'Insufficient Memory. Exiting Program');   { 2000:0093 }
    end;
  until done;                                                   { 2000:0098 }
  TerminateGame;                                                { 2000:009e  never returns }
end;
HeapErrorHandler := result;                                     { 2000:00a3  quirk: [BP-2] is never assigned }
```
`{ quirk: for size = 0 the function returns an uninitialised stack word (the TP heap only calls HeapError with size > 0, so this
path is not reached in practice). }`
`{ quirk: g_49D0 is never written by any code unit (GLOBALS.md: one reader, no writer) and lies in the zero-filled BSS, so the
save-game branch is dead code in the shipped game: a heap overflow always shows both messages, each waiting for a key, then exits
to DOS. }`

### 2000:00AC InstallHeapErrorHandler (H) — unit init (entry 0)
`procedure InstallHeapErrorHandler` — called by the main program's init chain (0000:00f1, the last overlay init).
```pascal
HeapError := Ptr($0016, $0025);                                 { 2000:00af  MOV AX,25h; MOV DX,16h -> DS:4414/4416 }
```
(0016:0025 is the overlay stub entry for HeapErrorHandler; the overlay manager loads ov00 on the call.)

---

# ov01 (seg 2500) — title pictures, lightning, credits (FINAL pseudocode, lane por-mod-party)

Unit: ov01, analysis segment 2500, stub segment 0019, 4 routines (functions.tsv): 2500:0000, 2500:0206, 2500:0627 (entry e1),
2500:0809 (init). Role: the start-up title sequence called by the main program when `ParamStr(1) <> 'STING'`
(MainProgram 0000:011d; `START.EXE STING` skips this unit and ov02 — LAYOUT gate check 3, ENGINE MainProgram).
Sources: `decode/listings/ov01.lst` (evidence), `ov01.c` (aid). String literals live at 2500:004A..0226 (credits) and
2500:0621 ("title", bytes `05 74 69 74 6C 65`); 2500:004A is the empty string (byte `00`).

Conventions (as VIEW.pas.md / ENGINE.pas.md)
- **Signatures in Pascal order**: first parameter = highest BP offset (pushed first); parameters as `name [BP+xx]`.
- `{ seg:off }` = first instruction of the statement (or of the call that implements it); `{ quirk: ... }` = behaviour a port must copy.
- Resident callees by ENGINE names, argument lists in Pascal order — Pascal order = first pushed first; every signature re-checked against its ENGINE/VIEW declaration, #fable-3:
  `DrawTitledFrame{03F1:02E8}(x1, y1, x2, y2, style, colour, title)` (clear the cell rectangle, border of 8×8 symbols one cell
  outside it, centred title on row y1), `DrawText{0709:0626}(col, row, colour, s)` (text glyphs via UpCase mod 64 → the credits
  appear in capitals), `LoadPicture{0464:0111}(name, id, maskFlags, transpColour, var pic)`, `PutPicture{0464:1951}(col, row, pic)`
  (frame 0 straight to video at cell (col,row)), `FreePicture{0464:2595}(var pic)`, `SetEgaPaletteRegister{0464:2A0D}(index, colour)`
  (INT 10h AX=1000h; colours 8..15 → 10h..17h), `TimeInHundredths{0709:0C3F}: LongInt`, `FUN_0899_0104` (disabled key flush —
  a no-op, ENGINE H).
- Globals: `DataPath` (DS:547C, string[255], POOL.CFG line 3), `VideoMode` (DS:4A1E: 0 CGA, 1 EGA, 2 Tandy-type), `cfg_FullIntro`
  (DS:49D1, named here: `Ord(POOL.CFG line 5 = 'F')`, InitConfiguration 042b:036f).

---

### 2500:0000 WaitSecondsOrKey (H)
`procedure WaitSecondsOrKey(secs [BP+6]: Word)` (near-called with PUSH CS, `RETF 2`) — callers: ShowCredits (10 s), ShowTitle (5 s).
Callees: TimeInHundredths, Crt.KeyPressed, FUN_0899_0104.
```pascal
start := TimeInHundredths;                                     { 2500:0006 }
target := start + LongInt(Word(secs * 100));                   { 2500:0011  16-bit MUL, DX cleared: secs*100 must fit a word }
while (TimeInHundredths < target) and not KeyPressed do ;      { 2500:0025 / 0036  signed 32-bit compare }
FUN_0899_0104;                                                 { 2500:003f  disabled flush: the key stays in the buffer }
```
`{ quirk: the pressed key is NOT consumed (0899:0104 is a no-op), so it is still pending for the next KeyPressed/ReadKey. }`
`{ quirk: TimeInHundredths wraps at midnight (8 640 000 → 0); a wait started in the last secs*100 hundredths before midnight only
ends on a key. }`

### 2500:0206 ShowCredits (H)
`procedure ShowCredits` (near-called, RETF) — caller: ShowTitle. Callees: DrawTitledFrame, DrawText, WaitSecondsOrKey.
All coordinates are text cells (col 0..39, row 0..24); colours: 0Ah light green (headings), 0Eh yellow, 0Bh light cyan (names).
```pascal
DrawTitledFrame(1, 1, 38, 3, 0, 0, '');                        { 2500:022d  top box }
DrawTitledFrame(1, 5, 38, 23, 0, 0, '');                       { 2500:0253  main box (borders on rows 0/4 and 4/24) }
DrawText($05, $01, $0A, 'scenario created by:');               { 2500:0270 }
DrawText($1A, $01, $0E, 'tsr, inc.');                          { 2500:028d }
DrawText($0F, $02, $0A, 'jim ward');                           { 2500:02aa }
DrawText($02, $03, $0A, 'david cook,steve winter,mike breault');   { 2500:02c7 }
DrawText($01, $05, $0A, 'game created by:');                   { 2500:02e4 }
DrawText($12, $05, $0E, 'ssi special projects');               { 2500:0301 }
DrawText($0E, $06, $0B, 'version 1.3');                        { 2500:031e }
DrawText($02, $07, $0E, 'programming:');                       { 2500:033b }
DrawText($14, $07, $0E, 'original');                           { 2500:0358 }
DrawText($02, $08, $0B, 'scot bayless');                       { 2500:0375 }
DrawText($14, $08, $0E, 'programming:');                       { 2500:0392  same literal 2500:00CA }
DrawText($02, $09, $0B, 'brad myers');                         { 2500:03af }
DrawText($14, $09, $0B, 'keith brors');                        { 2500:03cc }
DrawText($02, $0A, $0B, 'russ brown');                         { 2500:03e9 }
DrawText($14, $0A, $0B, 'brad myers');                         { 2500:0406  same literal 2500:00ED }
DrawText($02, $0B, $0B, 'ted greer');                          { 2500:0423 }
DrawText($02, $0D, $0E, 'graphic arts:');                      { 2500:0440 }
DrawText($14, $0D, $0E, 'encounter coding:');                  { 2500:045d }
DrawText($02, $0E, $0B, 'tom wahl');                           { 2500:047a }
DrawText($14, $0E, $0B, 'paul murray');                        { 2500:0497 }
DrawText($02, $0F, $0B, 'fred butts');                         { 2500:04b4 }
DrawText($14, $0F, $0B, 'russ brown');                         { 2500:04d1  same literal 2500:0104 }
DrawText($02, $10, $0B, 'darla marasco');                      { 2500:04ee }
DrawText($14, $10, $0B, 'victor penman');                      { 2500:050b }
DrawText($02, $11, $0B, 'susan halbleib');                     { 2500:0528 }
DrawText($14, $11, $0B, 'dave shelley');                       { 2500:0545 }
DrawText($02, $13, $0E, 'project manager');                    { 2500:0562 }
DrawText($14, $13, $0E, 'developer:');                         { 2500:057f }
DrawText($02, $14, $0B, 'victor penman');                      { 2500:059c  same literal 2500:0167 }
DrawText($14, $14, $0B, 'george mac donald');                  { 2500:05b9 }
DrawText($02, $16, $0E, 'testing:');                           { 2500:05d6 }
DrawText($0B, $16, $0B, 'joel billings,steve salyer');         { 2500:05f3 }
DrawText($02, $17, $0B, 'james kucera,robert daly,rick white');    { 2500:0610 }
WaitSecondsOrKey(10);                                          { 2500:061a }
```
(The screen is not cleared first: the two DrawTitledFrame calls clear cells (1,1)-(38,3) and (1,5)-(38,23); the borders cover
rows 0, 4, 24 and columns 0, 39, so the whole title picture is overdrawn — H from DrawFrame/ClearRectangle.)

### 2500:0627 ShowTitle (H)
`procedure ShowTitle` (far, stub ov01 e1) — caller: MainProgram (0000:011d). Callees: @StrAssign, LoadPicture, PutPicture,
FreePicture, WaitSecondsOrKey, TimeInHundredths, Random, SetEgaPaletteRegister, Crt.Delay, Crt.KeyPressed, ShowCredits.
Name H: loads TITLE.DAX records 1 and 2 (DATA INDEX: TITLE 320×200 ×2), then runs the credits.
```pascal
acc := 0;                                                      { 2500:062d  LongInt [BP-8] }
pic := nil;                                                    { 2500:0635  [BP-4] }
saved := DataPath;                                             { 2500:064b  string[40] [BP-32h] (push src, dest, max 28h) }
DataPath := '';                                                { 2500:0650  length byte := 0 → TITLE.DAX from the current dir }
LoadPicture('title', 1, 0, 0, pic);                            { 2500:0672 }
PutPicture(0, 0, pic);                                         { 2500:0683  full screen }
WaitSecondsOrKey(5);                                           { 2500:068d }
if cfg_FullIntro{g_49D1} = 0 then begin                        { 2500:0690 }
  DataPath := saved;                                           { 2500:06a5 }
  Exit;                                                        { 2500:06aa  quirk: picture 1 is not freed; no credits }
end;
LoadPicture('title', 2, 0, 0, pic);                            { 2500:06ca  frees picture 1 first (LoadPicture) }
DataPath := saved;                                             { 2500:06dd }
PutPicture(0, 0, pic);                                         { 2500:06ee }
FreePicture(pic);                                              { 2500:06f8 }
endTime := TimeInHundredths + 500;                             { 2500:06fd  5 s }
repeat
  if VideoMode = 1 then begin                                  { 2500:070e  EGA only }
    acc := acc + Random(4);                                    { 2500:071c }
    if acc > 50000 then begin                                  { 2500:0729  signed LongInt > C350h }
      acc := 0;                                                { 2500:073e }
      n := Random(3) + 1;                                      { 2500:074a  1..3 }
      for i := 0 to n do begin                                 { 2500:0753  n+1 flashes (2..4) }
        SetEgaPaletteRegister(1, $09);  Delay(150);            { 2500:076b / 0774  lightning: palette entry 1 }
        SetEgaPaletteRegister(1, $0B);  Delay(100);            { 2500:077f / 0788 }
        SetEgaPaletteRegister(1, $0F);  Delay(50);             { 2500:0793 / 079c }
        SetEgaPaletteRegister(1, $0B);  Delay(100);            { 2500:07a7 / 07b0 }
        SetEgaPaletteRegister(1, $09);  Delay(150);            { 2500:07bb / 07c4 }
        SetEgaPaletteRegister(1, $01);                         { 2500:07cf  back to blue }
      end;
    end;
  end;
until KeyPressed or (TimeInHundredths >= endTime);             { 2500:07dc / 07e5 }
FUN_0899_0104;                                                 { 2500:07fc  no-op }
ShowCredits;                                                   { 2500:0802 }
```
`{ quirk: the lightning trigger is a busy counter (average +1.5 per loop pass, fires after ≈33 000 passes), so its frequency
depends on CPU speed; a flash burst takes 550 ms per flash and the 5 s window is only checked between bursts. }`
`{ quirk: no key is consumed anywhere in ShowTitle/ShowCredits; one key press during picture 1 skips the rest of the 5 s, the whole
title-2 loop and the 10 s credits wait, and is then read by the code-wheel prompt (ov02 ReadBottomLine) as its first key — Enter
there submits an empty code word and costs one of the three tries. }`
`{ quirk: palette entry 1 is set via SetEgaPaletteRegister(1, 1) at the end of each flash; the title picture's colour 1 is assumed
to be blue (default EGA palette) — the routine never saves the old value. }`

### 2500:0809 ov01_init (H)
`procedure ov01_init` — empty unit initialiser (`PUSH BP; MOV BP,SP; POP BP; RETF`), called from the main init chain.

---

# ov02 (seg 2A00) — code-wheel copy protection (FINAL pseudocode, lane por-mod-party)

Unit: ov02, analysis segment 2A00, stub segment 001C, 2 routines (functions.tsv): 2A00:00FD (entry e1), 2A00:0359 (init).
Role: the translation-wheel check run once at start-up, right after the title/credits, by MainProgram (0000:0122) only when
`ParamStr(1) <> 'STING'` — **`START.EXE STING` bypasses it** (with ov01). This is the copy protection the reimplementation keeps
behind a flag (FOREMAN.md).
Sources: `decode/listings/ov02.lst` (evidence), `ov02.c` (aid), image bytes of DS:0002..0112 (the table, below), the code-wheel
scans in `decode/docs/__ Code Wheel __.pdf` (context only). String literals at 2A00:0000 ('' empty, byte 00), 0001..00E3
(prompts; bytes `25 55 53 45 20 ...`).

Conventions (as VIEW.pas.md / ENGINE.pas.md)
- **Signatures in Pascal order**; `{ seg:off }` = first instruction of the statement; `{ quirk: ... }` = behaviour a port must copy.
- Resident callees (ENGINE names, Pascal order — Pascal order = first pushed first; every signature re-checked against its ENGINE/VIEW declaration, #fable-3): `DrawTitledFrame{03F1:02E8}(x1, y1, x2, y2, style, colour, title)`,
  `DrawText{0709:0626}(col, row, colour, s)`, `DrawRepeatedGlyph{0709:01DF}(col, row, colour, count, ch, textMap)` (textMap = False →
  `ch` is the raw font glyph index), `ReadBottomLine{0709:09E3}(prompt, colour, maxLen): String[40]` (row 24, typed text white,
  Backspace edits, Enter **or Esc** ends, result upper-cased), `ShowTimedBottomPrompt{0709:0D68}(s, colour)` (row 24 for
  GameSpeed*225 ms), `TerminateGame{0899:0000}`, `FUN_0899_0104` (no-op).

## Data: CodeWheelTable (DS:0002, 13 records × 21 bytes, initialised data) — H
```pascal
TCodeWheelEntry = record            { 21 bytes; record i at DS:0002 + i*15h (code reads [i*15h + 2/9/0Ah/0Bh/0Ch/0Dh]) }
  code   : string[6];               { +00  the code word (upper case) }
  outer  : array[0..1] of Byte;     { +07  Espruar rune = 2 glyph cells, drawn as glyph (value + 40h) at (8,6),(9,6) }
  inner  : array[0..1] of Byte;     { +09  Dethek rune: glyph (value + 40h) at (8,9); second cell (9,9) only if <> FFh }
  path   : string[9];               { +0B  path pattern shown on row 13: one of the three red paths of the wheel }
end;
CodeWheelTable: array[0..12] of TCodeWheelEntry;   { DS:0002 .. DS:0112 }
```
Image bytes (START.unpacked.exe file offset 08E0h + C7C0h + 2 + i*21):

| i | code | outer | inner | path | raw record |
|---|---|---|---|---|---|
| 0 | BEWARE | 1D 1E | 6C 70 | `- - - - -` | `06 42 45 57 41 52 45 1d 1e 6c 70 09 2d 20 2d 20 2d 20 2d 20 2d` |
| 1 | ZOMBIE | 5B 5C | 4D FF | `-..-..-..` | `06 5a 4f 4d 42 49 45 5b 5c 4d ff 09 2d 2e 2e 2d 2e 2e 2d 2e 2e` |
| 2 | NOTNOW | 2C 2D | 6A FF | `.........` | `06 4e 4f 54 4e 4f 57 2c 2d 6a ff 09 2e 2e 2e 2e 2e 2e 2e 2e 2e` |
| 3 | COPPER | 09 0A | 43 FF | `- - - - -` | `06 43 4f 50 50 45 52 09 0a 43 ff 09 2d 20 2d 20 2d 20 2d 20 2d` |
| 4 | DRAGON | 01 02 | 68 FF | `-..-..-..` | `06 44 52 41 47 4f 4e 01 02 68 ff 09 2d 2e 2e 2d 2e 2e 2d 2e 2e` |
| 5 | EFREET | 11 12 | 6D FF | `.........` | `06 45 46 52 45 45 54 11 12 6d ff 09 2e 2e 2e 2e 2e 2e 2e 2e 2e` |
| 6 | FRIEND | 17 18 | 3F FF | `- - - - -` | `06 46 52 49 45 4e 44 17 18 3f ff 09 2d 20 2d 20 2d 20 2d 20 2d` |
| 7 | JUNGLE | 19 1A | 4E FF | `-..-..-..` | `06 4a 55 4e 47 4c 45 19 1a 4e ff 09 2d 2e 2e 2d 2e 2e 2d 2e 2e` |
| 8 | KNIGHT | 22 23 | 6C FF | `.........` | `06 4b 4e 49 47 48 54 22 23 6c ff 09 2e 2e 2e 2e 2e 2e 2e 2e 2e` |
| 9 | SAVIOR | 2E 2F | 42 FF | `- - - - -` | `06 53 41 56 49 4f 52 2e 2f 42 ff 09 2d 20 2d 20 2d 20 2d 20 2d` |
| 10 | TEMPLE | 36 37 | 4B FF | `-..-..-..` | `06 54 45 4d 50 4c 45 36 37 4b ff 09 2d 2e 2e 2d 2e 2e 2d 2e 2e` |
| 11 | VULCAN | 34 35 | 6E FF | `.........` | `06 56 55 4c 43 41 4e 34 35 6e ff 09 2e 2e 2e 2e 2e 2e 2e 2e 2e` |
| 12 | WYVERN | 2C 2D | 47 FF | `- - - - -` | `06 57 59 56 45 52 4e 2c 2d 47 ff 09 2d 20 2d 20 2d 20 2d 20 2d` |

Notes: outer runes are always two consecutive glyphs (a 16-px rune made of two 8×8 font cells); glyph numbers 41h..B0h lie inside
the font (FontPtr^, 588h bytes = 177 glyphs, LoadTextFont 8X8D1 record C9h — H for the size). Only entry 0 has a two-cell inner
rune (6Ch, 70h). The three path patterns (dashed / dash-dot-dot / dotted) correspond to the three red paths printed on the wheel
(PDF; cross-check only). NOTNOW and WYVERN share the outer rune 2C 2D but differ in inner rune and path.

---

### 2A00:00FD CodeWheelCheck (H)
`procedure CodeWheelCheck` (far, stub ov02 e1) — caller: MainProgram (0000:0122). Locals: tries [BP-2Bh], idx [BP-2Ah],
answer string[40] [BP-29h]. Name H: the only routine of the unit; texts "USE THE TRANSLATION WHEEL TO DECIPHER", "INPUT THE CODE WORD: ",
"Sorry, that's incorrect."; exits to DOS after 3 failures.
```pascal
tries := 1;                                                      { 2a00:0104 }
repeat
  idx := Random(13);                                             { 2a00:0111  0..12 (Randomize was called by ov11 InitGameState) }
  DrawTitledFrame(1, 1, 38, 22, 0, 0, '');                       { 2a00:013a  clears (1,1)-(38,22), border rows 0/23, cols 0/39 }
  DrawText(1, 1, $0A, 'USE THE TRANSLATION WHEEL TO DECIPHER');  { 2a00:0157 }
  DrawText(1, 2, $0A, 'THE CODE WORD.');                         { 2a00:0174 }
  DrawText(1, 5, $0A, 'MATCH THE ESPRUAR RUNE (OUTER RING)');    { 2a00:0191 }
  with CodeWheelTable[idx] do begin
    DrawRepeatedGlyph(8, 6, $0C, 1, Chr(outer[0] + $40), False); { 2a00:01bb }
    DrawRepeatedGlyph(9, 6, $0C, 1, Chr(outer[1] + $40), False); { 2a00:01e5 }
    DrawText(1, 8, $0A, 'WITH THE DETHEK RUNE (INNER RING)');    { 2a00:0202 }
    DrawRepeatedGlyph(8, 9, $0C, 1, Chr(inner[0] + $40), False); { 2a00:022c }
    if inner[1] <> $FF then                                      { 2a00:023d }
      DrawRepeatedGlyph(9, 9, $0C, 1, Chr(inner[1] + $40), False);   { 2a00:0269 }
    DrawText(1, 11, $0A, 'AND READ THE CODE WORD UNDER THE PATH:');  { 2a00:0286 }
    DrawText(1, 13, $0C, '     ' + path);                        { 2a00:02bb  5 spaces + pattern: pattern starts at col 6 }
  end;
  DrawText(1, 14, $0A, 'READ FROM THE INSIDE TO THE OUTSIDE.');  { 2a00:02d8 }
  FUN_0899_0104;                                                 { 2a00:02dd  no-op: pending keys are NOT flushed }
  answer := ReadBottomLine('INPUT THE CODE WORD: ', $0D, 6);     { 2a00:02fd  magenta prompt, max 6 characters }
  if answer = CodeWheelTable[idx].code then Exit;                { 2a00:0327  StrCompare; equal -> return to MainProgram }
  ShowTimedBottomPrompt('Sorry, that''s incorrect.', $0E);        { 2a00:0342 }
  if tries = 3 then TerminateGame;                               { 2a00:0347 / 0350  third failure: exit to DOS }
  tries := tries + 1;                                            { 2a00:010a }
until False;
```
`{ quirk: every try draws a NEW random entry (Random(13) inside the loop), possibly the same one again. }`
`{ quirk: ReadBottomLine returns on Esc as on Enter, so Esc submits the typed text. Input is upper-cased, so lower-case answers
are accepted. A key left pending from the title/credits (ov01 never consumes keys) is read as the first key here. }`
`{ quirk: the failure message is shown for GameSpeed*225 ms (GameSpeed = 1 at this point, set by InitGameState → 225 ms) and
there is no other delay or penalty; after the third failure TerminateGame restores the BIOS video mode and halts (exit code 0). }`

**Bypass (for the reimplementation flag):** the check is skipped as a whole by MainProgram when `ParamStr(1) = 'STING'`
(0000:0102..011d, bytes `05 53 54 49 4E 47` at 0000:0000), which also skips the title/credits; the same parameter enables the
^D (DebugFlag) / ^C (quit) keys in ReadGameKey (ENGINE 0899:00ba). Nothing in ov02 sets state for later code: passing the check
has no side effect other than returning.

### 2A00:0359 ov02_init (H)
`procedure ov02_init` — empty unit initialiser.

---

# ov11 (seg 5700) — game-state and engine initialisation at start-up (FINAL pseudocode, lane por-mod-party)

Unit: ov11, analysis segment 5700, stub segment 003E, 2 routines (functions.tsv): 5700:002D (entry e1), 5700:0615 (init).
Role: the first statement of the program body (MainProgram 0000:00fd, before the title): allocates the engine buffers, builds the
video line tables, resets every game-state global to its new-game value, loads the font, the fixed 8×8 symbol blocks, the SQRPACI
overland tiles, the COMSPR combat icons and the ITEMS item-type table, seeds the random generator and fills the spell and
affect handler tables.
Sources: `decode/listings/ov11.lst` (evidence), `ov11.c` (aid). String literals 5700:0000..002C: 'Loading...Please Wait' (15h),
'sqrpaci' (07), 'COMSPR' (06), 'ITEMS' (05), ':' (01) — bytes `15 4c 6f 61 ... 07 73 71 72 ... 06 43 4f 4d ... 05 49 54 45 4d 53 01 3a`.

Conventions (as VIEW.pas.md / ENGINE.pas.md)
- **Signatures in Pascal order**; `{ seg:off }` = first instruction of the statement; `{ quirk: ... }` = behaviour a port must copy.
- `FillChar(var x, count, value)` / `GetMem` / `BlockRead(var f, var buf, count, var result)` / `Seek(var f, pos)` / `Reset(var f, recSize)`
  = TP System (RT_LEDGER). Resident callees by ENGINE names in Pascal order — Pascal order = first pushed first; every signature re-checked against its ENGINE/VIEW declaration, #fable-3: `AllocPicture{0464:248E}(height, width8, count, flags, var pic)`,
  `LoadPicture{0464:0111}(name, id, maskFlags, transpColour, var pic)`, `LoadTextFont{0709:017C}` (8X8D1 record C9h → FontPtr^),
  `DrawText{0709:0626}(col, row, colour, s)`, `OpenWithPrompt{0802:025D}(name, prompt, noPrompt, var f): Boolean`,
  `SetSoundTimerMode{08AE:01A5}(mode)`. Overlay callees: `ClearMenuLine{ov25 9D00:06FB}` (clear row 24), `Load8x8Set{ov34 CA00:003B}(id, block)`,
  `LoadCombatIcon{ov32 C000:01C8}(name, id, slot)` (loads poses id and id+80h into CombatIcons[slot]), `InitSpellTable` (MAGIC: spell
  callback table DS:6B84, draft name InitializeSpellDispatch), `InstallEffectHandlers` (PARTY ov12: fills the far-pointer table from DS:682C with
  ov12 stub entries).
- Global names: as printed in the listing (engine/view/ecl/magic lanes) or `g_XXXX`; new names here are in `ov11_names.json`.

---

### 5700:002D InitGameState (M)
`procedure InitGameState` (far, stub ov11 e1) — caller: MainProgram (0000:00fd). No parameters; locals: name strings only.
Name M: behaviour (allocations + resets + start-up loads, called once before anything is shown); the original name is unknown.
```pascal
{ --- engine buffers --- }
GetMem(ecl_Mem4900, $800);                                      { 5700:0038  ECL VM region 4900 }
GetMem(ecl_Mem6B00, $800);                                      { 5700:0048  region 6B00 }
GetMem(ecl_Mem9700, $400);                                      { 5700:0058  region 9700 }
GetMem(ecl_CodeBuf, $1E00);                                     { 5700:0068  ECL script buffer (7680 bytes) }
GetMem(FontPtr, $588);                                          { 5700:0078  177 glyphs × 8 bytes }
GetMem(WallBuf, $924);                                          { 5700:0088  3 wall sets × 30Ch }
GetMem(MapBuf, $400);                                           { 5700:0098  GEO map planes 4 × 100h }
AllocPicture(8, 1, 1, 0, SymbolPic{g_5E4E});                    { 5700:00b7  8×8 scratch picture (Put8x8Symbol) }
AllocPicture($A8, $15, 1, 0, g_4A20);                           { 5700:00cf  off-screen view/screen picture 168 lines × 21 cells }
AllocPicture($18, 3, 1, 0, PicSaveBuffer);                      { 5700:00e7  24×24 background save buffer (DrawPicture flag 4) }
FillChar(view_LineDirty, $A8, 0);                               { 5700:00f8  168 bytes }
FillChar(view_SpanScreenX, $150, 0);                            { 5700:0109  168 words }
FillChar(view_SpanFirst, $150, $FF);                            { 5700:011a }
FillChar(view_SpanLast, $150, 0);                               { 5700:012b }
{ --- video line address tables, one entry per pixel line 0..199 --- }
InitIdx{g_465C} := 0;                                           { 5700:0130  a DS byte is used as the loop variable }
repeat
  if Odd(InitIdx) then cga_LineSeg[InitIdx] := $BA00 + (InitIdx shr 1) * 5   { 5700:0142  CGA odd bank, 80 bytes = 5 paragraphs }
  else cga_LineSeg[InitIdx] := $B800 + (InitIdx shr 1) * 5;                  { 5700:0165 }
  ega_LineOfs[InitIdx] := InitIdx * 40;                                      { 5700:0186  EGA: 40 bytes per line }
  case InitIdx mod 4 of                                                      { 5700:01a4  4-bank mode 2: 160 bytes = 10 paragraphs }
    0: m2_LineSeg[InitIdx] := $B800 + (InitIdx shr 2) * 10;                  { 5700:01b0 }
    1: m2_LineSeg[InitIdx] := $BA00 + (InitIdx shr 2) * 10;                  { 5700:01d7 }
    2: m2_LineSeg[InitIdx] := $BC00 + (InitIdx shr 2) * 10;                  { 5700:01fe }
    3: m2_LineSeg[InitIdx] := $BE00 + (InitIdx shr 2) * 10;                  { 5700:0225 }
  end;
  if InitIdx = 199 then Break;                                               { 5700:0245 }
  Inc(InitIdx);
until False;
{ --- picture / VM state --- }
FillChar(SymbolSets, $14, 0);                                   { 5700:025b  5 far pointers (8×8 symbol blocks 0..4) := nil }
FillChar(TileSetLo{g_5E52}, 8, 0);                          { 5700:026c  2 far pointers (SQRPACI sets 1, 2) := nil }
FillChar(ecl_Mem4900^, $800, 0);                                { 5700:027e }
FillChar(ecl_Mem6B00^, $800, 0);                                { 5700:0290 }
FillChar(ecl_Mem9700^, $400, 0);                                { 5700:02a2 }
FillChar(ecl_CodeBuf^, $1E00, 0);                               { 5700:02b4 }
FillChar(CombatIcons, $D0, 0);                                  { 5700:02c5  26 slots × 2 poses × far pointer }
for InitIdx := 1 to 2 do begin                                  { 5700:02ca  portrait slots: 1 = head (DS:6B00), 2 = body (DS:6B05) }
  g_6AFB[InitIdx*5] := $FF;                                     { 5700:02e4  loaded record id: none }
  PPointer(@g_6AFC[InitIdx*5])^ := nil;                         { 5700:02fa  picture }
end;
FillChar(enc_Anim, $42, 0);                                     { 5700:0315  66-byte animation record (TAnim, combat_parts/ov18) }
TreasureItems := nil;                                           { 5700:031c }
FillChar(party_MapX, 5, 0);                                     { 5700:032e  DS:6AAD..6AB1 }
party_MapX := 15;                                               { 5700:0333  start position x = 15 }
party_MapY := 1;                                                { 5700:0338  y = 1 }
party_Dir := 6;                                                 { 5700:033d  facing west }
FillChar(door_CanBash, 3, 1);                                   { 5700:034e  DS:6DDE..6DE0 := 1 }
g_6AB2 := 0;  g_6AB4 := 1;                                      { 5700:0355  wall-set slot 1: id 0, slot 1 (VIEW: LoadWallSet slot table 6AAE+slot*4) }
for InitIdx := 2 to 3 do begin                                  { 5700:035e  wall-set slots 2, 3 empty }
  PWord(@g_6AAE[InitIdx*4])^ := $FFFF;                          { 5700:0374 }
  PWord(@g_6AB0[InitIdx*4])^ := $FFFF;                          { 5700:0385 }
end;
{ --- option / mode flags (new-game defaults) --- }
opt_Portraits := 1;                                             { 5700:0392 }
opt_MonsterPics := 1;                                           { 5700:0397 }
DebugFlag := 0;                                                 { 5700:039c }
TextOutputActive := 1;                                          { 5700:03a1 }
g_49F8 := 0;                                                    { 5700:03a6 }
g_49FB := 0;                                                    { 5700:03ab  word }
PartyHead := nil;                                               { 5700:03b0  linked list of party characters }
SelectedChar := nil;                                            { 5700:03b8 }
ecl_PC := $9900;                                                { 5700:03c0 }
GameSpeed := 1;                                                 { 5700:03c6  MessageDelay = 225 ms }
g_49F4 := 0;                                                    { 5700:03cb }
DataSet := 1;                                                   { 5700:03d0  disk / data set 1 }
PrevDataSet := 1;                                               { 5700:03d5 }
g_547A := 1;                                                    { 5700:03da  word }
g_5378 := 1;                                                    { 5700:03e0  word }
view_AreaMap := 0;                                              { 5700:03e6 }
g_49F9 := 1;                                                    { 5700:03eb }
travel_Mode := 1;                                               { 5700:03f0 }
ecl_Mem6B00^.w[$67C] := 0;                                      { 5700:03fb  word at region offset 67Ch (ECL address 717Ch, M) }
g_6DDC := 0;                                                    { 5700:0400 }
menu_Top := 1;                                                  { 5700:0405  word }
DuelActive := 0;                                                { 5700:040b }
g_6DDA := 0;                                                    { 5700:0410 }
g_84DD := 0;  g_84DE := 0;  g_84DF := 0;  g_84E0 := 0;          { 5700:0415 .. 0424 }
PartyDead := 0;                                                 { 5700:0429 }
ClipPictures := 1;                                              { 5700:042e  DrawPicture clips (g_5370) }
enc_SpriteOnScreen := 0;                                        { 5700:0433 }
NoDiskPrompt := 0;                                              { 5700:0438 }
g_6B0A := 0;                                                    { 5700:043d }
g_6B1C := $FF;                                                  { 5700:0442 }
g_557D := 0;                                                    { 5700:0447 }
g_6F69 := $E8;                                                  { 5700:044c }
g_6F68 := $DB;                                                  { 5700:0451 }
enc_MenuActive := 0;                                            { 5700:0456 }
SoundTransientMode := 0;                                        { 5700:045b  g_5374 }
SetSoundTimerMode($64);                                         { 5700:0464  > 0: timer installed only while a sound plays }
{ --- start-up loads (from the current directory) --- }
SavedDataPath{g_4661} := DataPath;                              { 5700:0477  string[40] (push src, dest, max 28h) }
DataPath := '';                                                 { 5700:047c  length byte := 0; DataPath[1] (DS:547D) keeps the drive letter }
LoadTextFont;                                                   { 5700:0481 }
ClearMenuLine;                                                  { 5700:0486 }
DrawText(0, 24, $0A, 'Loading...Please Wait');                  { 5700:04a3 }
Load8x8Set($CA, 4);                                             { 5700:04ae  8X8D1 record 202 → symbol block 4 (frames, area-map symbols) }
Load8x8Set($CB, 0);                                             { 5700:04b9  record 203 → block 0 }
LoadPicture('sqrpaci', 1, 0, 0, TileSetLo{g_5E52});       { 5700:04db  SQRPACI.DAX 1 }
LoadPicture('sqrpaci', 2, 0, 0, TileSetHi{g_5E56});       { 5700:04fd  SQRPACI.DAX 2 }
for InitIdx := 0 to 11 do                                       { 5700:0502 }
  LoadCombatIcon('COMSPR', InitIdx, InitIdx + 13);              { 5700:0529  COMSPR ids 0..11 (+80h) → icon slots 13..24 }
LoadCombatIcon('COMSPR', 25, 25);                               { 5700:054a  id 25 → slot 25 }
ItemsFound{g_4660} := OpenWithPrompt('ITEMS', DiskPromptText[DataSet] + DataPath[1] + ':', False, ItemsFile{g_468C});   { 5700:05a1 }
Reset(ItemsFile, 1);                                            { 5700:05b2  again (OpenWithPrompt already reset it) }
Seek(ItemsFile, 2);                                             { 5700:05c3  skip the 2-byte header }
BlockRead(ItemsFile, ItemTypeTable{g_5582}, $810, ItemsReadCount{g_5E1E});   { 5700:05db  asks 2064 bytes; the file has 2048 left }
Close(ItemsFile);                                               { 5700:05e5 }
DataPath := SavedDataPath;                                      { 5700:05f8 }
ClearMenuLine;                                                  { 5700:05fd }
Randomize;                                                      { 5700:0602 }
InitSpellTable;                                                      { 5700:0607  spell callback table (MAGIC) }
InstallEffectHandlers;                                                      { 5700:060c  ov12 handler table from DS:682C (PARTY ov12) }
```
`DiskPromptText` = DS:2614, `array[0..9] of string[29]` (30-byte records): entries 1..8 = 'Insert disk n in drive ' (image bytes,
H); entry 0 and 9 empty. The prompt is shown by OpenWithPrompt (yellow, row 24, waits for a key) every time ITEMS is not found,
until it is: `noPrompt = False` → the result is always True.
`{ quirk: the drive letter comes from DataPath[1] although DataPath was just set to '' — only its length byte was cleared, so the
character of the POOL.CFG data path (e.g. 'C' of 'C:\...') is still there; the ITEMS file itself is searched in the current
directory (DataPath empty). }`
`{ quirk: BlockRead asks for 810h bytes into DS:5582; a longer ITEMS file would overwrite DS:5582..5D91 up to (not including)
SelectedChar DS:5D92. The shipped file (2050 B) gives 2048 bytes = 128 item types × 16 (ITEMS.md). }`
`{ quirk: InitIdx (DS:465C) is a global byte used as the loop counter of all loops here (left at 11 after the COMSPR loop). }`

### 5700:0615 ov11_init (H)
`procedure ov11_init` — empty unit initialiser.

---

# ov16 part A (seg 7000, 0000..1F36) — free character, top-level menu, character creation (FINAL pseudocode, lane por-mod-party)

Unit: ov16, analysis segment 7000, stub segment 0078. This part: 7000:0000, 7000:0161 (entry e1, called by the main program at
0000:0127), 7000:056C, 7000:1551 (not a routine: the second half of 056C, see below). Part B (7000:1F37..) holds Drop, Modify,
Train, Add, Remove, portrait/icon pickers and the HP/CON helpers called from here.
Role: the start-of-game "party creation" screen — the list of functions (Create / Drop / Modify / Train / View / Add / Remove /
Load / Save / BEGIN / Exit) with its hidden hot-key menu line, and the complete character generator (race, gender, class,
alignment, age, six abilities with age / race / gender / class limits, starting gold, HP, first-level spells, name, then
portrait + icon, then the character is written to the roster file).
Sources: `decode/listings/ov16.lst` (evidence), image bytes (`python decode/ecl/hdis.py ov16 START END`) — needed at
7000:120E (loop increment Ghidra did not disassemble) and 7000:1BCC..1BE1; `ov16.c` and PARTY.draft.md as checklist only.
String literals in the code segment: 7000:00E2 `''`, 00E3 "Choose a function ", 00F6 set `['G','O']`, 0116 set `['E','S']`,
0136 "Quit to DOS ", 0143 "STING", 0149 "I Understand, master...", 04F1 "Pick Race", 04FB `'  '` (two blanks), 04FE `''`,
04FF "Pick Gender", 050B "Pick Class", 0516 "Pick Alignment", 0525 set `[8..12]`, 0545 "Keep this character? ",
055B "Character name: ".

Conventions (as VIEW.pas.md / ENGINE.pas.md)
- **Signatures in Pascal order**: first parameter = highest BP offset (pushed first); parameters as `name [BP+xx]`. Every call
  below was written from its PUSH sequence (first pushed = first argument).
- `{ seg:off }` = first instruction of the statement (or of the call that implements it); `{ quirk: ... }` = behaviour a port must copy.
- Globals `g_XXXX` = DS:XXXX (GLOBALS.md) or the lane name `Name{g_XXXX}` (listed in `ov16a_names.json`, requested from por-tooling).
- TChar fields by the SAVES.md §3 names (`c^.race` = +2Eh …). `TMenuItem` (VIEW, ov25 NewMenuList): text string[40] at +0,
  `isHeader` byte at +29h, next at +2Ah.
- Callees: resident by ENGINE names; ov25 menus by VIEW names — `HorizontalMenu(prompt, options, promptColour [BP+12h], textColour [BP+10h],
  hotColour [BP+0Eh], allowExt, animate, var ext): Char`, `VerticalListMenu(prompt, options, cHeader [BP+24h], cItem [BP+22h],
  cSel [BP+20h], left, top, right, bottom, list, showExit, var redraw, var index, var item): Char`, `AskYesNo(prompt, c1, c2, c3): Char`,
  `NewMenuList(n, var list)`, `FreeMenuList(var list)`, `ListItem(n [BP+0Ah], list [BP+6])` (bytes 9D00:000B/0022: list at +6, n at +0Ah — VIEW.pas.md prints the two reversed; pushes here are n first), `ClearMenuLine`; ov19 by COMBAT names
  (CycleSelectedChar, ViewMenu, DrawCharacterSheet, DrawCombatStats, DrawAbility, DrawMoney); ov24 `Roll(count, sides)`,
  `AddEffect(c, type, duration, p3, callOnRemove)`; ov23 (VIEW) `WisdomBonusSpells(c)`, `UpdateSaves(c)`, `UpdateThiefSkills(c)`;
  ov17 `WriteCharacter{WriteCharacter}(var c [BP+0Ah], name [BP+6])` (pushes c first; `name = ''` → roster file `<name>.CHA`),
  `LoadGame{LoadGame}`, `SaveGame{SaveGame}`.
- Part-B routines called from here are kept as `FUN_7000_xxxx`/`ov16_xxxx` with a behaviour comment (their names belong to
  ov16b): `RollHitDice(c, classMask): Byte` = sum of one hit-die roll per class (level-1 minimum 2/3 of the die), `ConHpBonus(c): ShortInt` = CON hit-point
  adjustment summed over the classes, `PortraitMenu` = "Head Body Keep" portrait picker, `IconEditor` = combat-icon editor,
  `DropCharacter` Drop, `ModifyCharacter` Modify, `TrainCharacter` Train, `AddCharacterMenu` Add, `RemoveFromParty(a, b)` remove from party.

Data tables read here (image bytes, DS:xxxx, H):
- `MenuEntry{g_0619}`: 11 × 42 bytes = string[40] text + `enabled` byte at +29h. Texts / initial enabled: 0 "Create New Character" 1
  (`g_0642`), 1 "Drop Character" 0 (`g_066C`), 2 "Modify Character" 0 (`g_0696`), 3 "Train Character" 0 (`g_06C0`), 4 "View
  Character" 0 (`g_06EA`), 5 "Add Character to Party" 1 (`g_0714`), 6 "Remove Character from Party" 0 (`g_073E`), 7 "Load Saved
  Game" 1 (`g_0768`), 8 "Save Current Game" 0 (`g_0792`), 9 "BEGIN Adventuring" 0 (`g_07BC`), 10 "Exit to DOS" 1 (`g_07E6`).
  0642/0714/07E6 are never written by code (GLOBALS.md: readers only) → Create, Add and Exit are always offered.
- `g_05F0` = string `'C D M T V A R L S B E J'` (the hot keys; J is the hidden debug key).
- `RaceName{g_0F03}`[10], `ClassName{g_0D38}`[27], `GenderName{g_0FEC}`[7], `AlignmentName{g_0F53}`[17] (SAVES.md string tables).
- `g_3CF5[1..6]` = 01 02 03 04 06 07 (icon colour seeds → icon_colours 91 A2 B3 C4 E6 F7).
- `RaceClasses{g_3E17}`[race*12]: count, class ids — Dwarf 3: F, T, F/T · Elf 7: F, MU, T, F/MU, F/T, F/MU/T, MU/T · Gnome 3: F, T,
  F/T · Half-Elf 11: C, F, MU, T, C/F, C/F/MU, C/MU, F/MU, F/T, F/MU/T, MU/T · Halfling 3: F, T, F/T · Half-Orc 6: C, F, T, C/F, C/T,
  F/T · Human 4: C, F, MU, T (raw: `03 02 06 0E`, `07 02 05 06 0D 0E 0F 10`, … `04 00 02 05 06`).
- `ClassAligns{g_3FE7}`[class*10]: count, alignment ids — all 9 for Cleric, Fighter, Ranger, MU, Monk and every multi-class
  except the thief ones; Druid 5: LN, NG, TN, NE, CN (`05 01 03 04 05 07`); Paladin 1: LG (`01 00`); Thief, F/T, F/MU/T, MU/T 7:
  all except LG and CG (`07 01 02 03 04 05 07 08`).
- `StartAge{g_3E5B}`[race*28 + cls*4] = (word base, byte dice, byte sides), cls 0..6; e.g. Human: C 18+1d4, Dr 18+1d4, F 15+1d4,
  Pa 17+1d4, Ra 20+1d4, MU 24+2d4, T 18+1d4; Dwarf: C 250+2d20, F 40+5d4, T 75+3d6.
- `AgeCategory{g_3F31}`[race*10] = 5 words (age limits of young adult / mature / middle aged / old / venerable); Human 20 40 60 90 120,
  Dwarf 50 150 250 350 450, Elf 175 550 875 1200 1600, Gnome 90 300 450 600 750, Half-Elf 40 100 175 250 325,
  Halfling 33 68 101 144 199, Half-Orc 15 30 45 60 80.
- `RaceAbilityLimits{g_3DA3}`[race*16 + …]: +0/+1 STR min (male/female), +2/+3 STR max, +4/+5 exceptional-STR max, +6/+7 INT min/max,
  +8/+9 WIS, +0Ah/+0Bh DEX, +0Ch/+0Dh CON, +0Eh/+0Fh CHA; e.g. Human `03 03 12 12 64 32 03 12 03 12 03 12 03 12 03 12`,
  Dwarf `08 08 12 11 63 00 03 12 03 12 03 11 0C 13 03 10`.
- `ClassAbilityMin{g_3F81}`[class*6 + ability] (e.g. Cleric 6 6 9 0 0 0, Paladin 13 9 12 0 9 17, Ranger 0 13 14 0 14 0, Monk 15 0 15 15 11 0).
- `BaseThac0{g_3C7C}`[cls*11 + level] (level 1 = 40 for every class = THAC0 20).
- `ClassMaskBit{g_05D6}`[cls] = 02 10 08 40 80 01 04 20 (cleric 2, druid 10h, fighter 8, paladin 40h, ranger 80h, MU 1, thief 4, monk 20h).
- `StartGoldDice{g_4263}`[cls*2] = (dice, sides): C 3d6, Dr 3d6, F 5d4, Pa 5d4, Ra 5d4, MU 2d4, T 2d6, Mo 5d4.

---

### 7000:0000 FreeCharacter (H)
`procedure FreeCharacter(var c [BP+6]: ^TChar)` — `RETF 4`. Caller: RemoveFromParty (part B). Callees: System.FreeMem.
Frees a character record with everything hanging off it and sets the pointer to nil. Name H (frees exactly the four
structures of SAVES.md §1/§3: combat record 16h B, item list 3Fh B linked at +2Ah, effect list 9 B linked at +05h, record 11Dh B).
```pascal
p := c;                                                           { 7000:0006 }
if p^.combatant <> nil then FreeMem(p^.combatant, $16);           { 7000:0012 / 002f  +108h; the field itself is not cleared }
it := p^.items;                                                   { 7000:0034  +C8h }
while it <> nil do begin                                          { 7000:0047 }
  q := it;  it := it^.next;                                       { 7000:004f  item +2Ah }
  FreeMem(q, $3F);                                                { 7000:0076 }
end;
e := p^.effects;                                                  { 7000:007d  +7Fh }
while e <> nil do begin                                           { 7000:008f }
  q := e;  e := e^.next;                                          { 7000:0097  effect +05h }
  FreeMem(q, 9);                                                  { 7000:00be }
end;
FreeMem(c, $11D);                                                 { 7000:00cf }
c := nil;                                                         { 7000:00d4 }
```

### 7000:0161 PartyCreationMenu (H)
`procedure PartyCreationMenu` — `RETF`, no parameters; stub ov16 e1. Caller: MainProgram (0000:0127). Callees: DrawTitledFrame,
DrawPartyRoster, DrawText, HorizontalMenu, ClearMenuLine, CycleSelectedChar (CycleSelectedChar), CreateCharacter (056C), DropCharacter,
ModifyCharacter, TrainCharacter, ViewMenu (ViewMenu), AddCharacterMenu, WriteCharacter (WriteCharacter), RemoveFromParty, LoadGame (LoadGame),
SaveGame (SaveGame), AskYesNo, TerminateGame, ParamStr, ShowTimedBottomMessage.
The first game screen after the title and code wheel: a framed list of the available functions; leaving it with BEGIN (or a
successful Load) returns to the main program, which starts the ECL game loop. Name H (strings "Choose a function ", the 11 entry
texts, "Quit to DOS "; the main program calls it right before ecl_GameLoop).
Locals: `beginMode [BP-10h]` = 4 (constant), `redraw [BP-0Fh]`, `row [BP-0Eh]`, `i [BP-1]`, `ext [BP-3]`, `key [BP-2]`, `turnUsed [BP-4]`.
```pascal
DataSet{g_5376} := 3;                                             { 7000:0168 }
beginMode := 4;  redraw := true;                                  { 7000:016d }
StingMode{g_470C} := 0;                                           { 7000:0175 }
game_Mode := 0;                                                   { 7000:017a }
repeat
  if redraw then begin                                            { 7000:017f }
    DrawTitledFrame(1, 1, $26, $16, 0, 0, '');                    { 7000:01a9  frame cols 1..38, rows 1..22, no title }
    if SelectedChar <> nil then begin                             { 7000:01ae }
      DrawPartyRoster(SelectedChar);                              { 7000:01bf }
      g_066C := 1;  g_0696 := 1;                                  { 7000:01c4  Drop, Modify }
      if (ecl_Mem6B00^.w[$550] > 0) or (StingMode{g_470C} <> 0) then g_06C0 := 1;   { 7000:01ce  Train (else unchanged) }
      g_06EA := 1;  g_073E := 1;  g_0768 := 0;                    { 7000:01e6  View, Remove on; Load off }
      g_0792 := 1;  g_07BC := 1;                                  { 7000:01f5  Save, BEGIN }
    end else begin
      g_066C := 0; g_0696 := 0; g_06C0 := 0; g_06EA := 0;         { 7000:0201 }
      g_073E := 0; g_0768 := 1; g_0792 := 0; g_07BC := 0;         { 7000:0215 }
    end;
    row := 0;                                                     { 7000:0229 }
    for i := 0 to 10 do                                           { 7000:022d }
      if MenuEntry{g_0619}[i].enabled <> 0 then begin             { 7000:0242 }
        DrawText(2, row + 12, $0F, MenuEntry[i].text[1]);         { 7000:0273  first letter, white }
        DrawText(3, row + 12, $0A, Copy(MenuEntry[i].text, 2, Length(MenuEntry[i].text) - 1));   { 7000:02bb  rest, green }
        row := row + 1;                                           { 7000:02c0 }
      end;
    redraw := false;                                              { 7000:02cc }
  end;
  key := HorizontalMenu('Choose a function ', g_05F0, $0D, 0, 0, true, false, ext);   { 7000:02f8  hot keys drawn in colour 0 = invisible }
  ClearMenuLine;                                                  { 7000:0300 }
  if ext then begin                                               { 7000:0305 }
    if key in ['G', 'O'] then begin                               { 7000:0314  Home / End scan codes }
      CycleSelectedChar(key);                                     { 7000:031f }
      DrawPartyRoster(SelectedChar);                              { 7000:032c }
    end;
    continue;                                                     { 7000:0331  no redraw }
  end;
  if not (key in ['E', 'S']) then GameSaved{g_557D} := 0;         { 7000:033d }
  case key of                                                     { 7000:0349 }
    'C': if g_0642 <> 0 then CreateCharacter;                     { 7000:0350 / 0358 }
    'D': if g_066C <> 0 then DropCharacter;                       { 7000:0362 / 036a  Drop }
    'M': if g_0696 <> 0 then ModifyCharacter;                       { 7000:0374 / 037c  Modify }
    'T': if g_06C0 <> 0 then TrainCharacter;                       { 7000:0386 / 038e  Train }
    'V': if g_06EA <> 0 then ViewMenu(turnUsed);                  { 7000:0398 / 03a4 }
    'A': if g_0714 <> 0 then AddCharacterMenu;                       { 7000:03b0 / 03b8  Add }
    'R': if (g_073E <> 0) and (SelectedChar <> nil) then begin    { 7000:03c2 }
           WriteCharacter(SelectedChar^, '');                     { 7000:03e9  store back to the roster (<name>.CHA) }
           RemoveFromParty(0, 1);                                       { 7000:03f5  remove from party (part B) }
         end;
    'L': if g_0768 <> 0 then begin                                { 7000:03ff }
           LoadGame;                                              { 7000:0406 }
           if game_Mode <> 0 then begin g_49F8 := 1; exit end;    { 7000:040b  a game was loaded → return to main }
         end;
    'S': if (g_0792 <> 0) and (PartyHead <> nil) then SaveGame;   { 7000:0421 / 0431 }
    'B': if (g_07BC <> 0) and (PartyHead <> nil) then begin       { 7000:043d }
           game_Mode := beginMode;                                { 7000:0450  = 4 }
           ClearMenuLine;                                         { 7000:0453 }
           exit;                                                  { 7000:0458 }
         end;
    'E': if g_07E6 <> 0 then                                      { 7000:0462 }
           if AskYesNo('Quit to DOS ', $0E, $0A, $0F) = 'Y' then begin   { 7000:0481 }
             while (GameSaved{g_557D} = 0) and (PartyHead <> nil) do SaveGame;   { 7000:048f  quirk: keeps asking until saved }
             TerminateGame;                                       { 7000:04a6 }
           end;
    'J': if ParamStr(1) = 'STING' then begin                      { 7000:04bb / 04c5 }
           StingMode{g_470C} := 1;                                { 7000:04cc }
           ShowTimedBottomMessage('I Understand, master...');     { 7000:04e1 }
         end;
  end;
  redraw := true;                                                 { 7000:04e6 }
until false;                                                      { 7000:04ea }
```
Notes: the menu line shows only the prompt "Choose a function " (colour 0Dh); the letters of the option string are drawn with
colour 0 (black), so the player sees the list in the frame, not the hot keys (H from HorizontalMenu's colour use). A key of a
disabled entry is accepted but does nothing except force a redraw. `Train` additionally needs `ecl_Mem6B00^.w[550h] > 0`
(an ECL variable, meaning L — probably "in a city with a training hall") or the STING debug mode. Exit forces a save when a party
exists and the game is not marked saved (`GameSaved`, set by SaveGame, cleared by every other command here) — if SaveGame is
cancelled without setting the flag the loop repeats (M: depends on SaveGame).

### 7000:056C CreateCharacter (H)

**#fable-6 (2026-10-16):** every statement after 7000:07A8 re-checked against ov16.lst/bytes (172 statements, 7000:07A8..1ED1, incl. the bytes Ghidra missed at 120E and 1BCC..1BE1): 169 AGREE, 3 fixed (two missing `p := c` reloads, one signed compare; no behaviour change). Reports: `party_parts/fable6_A.md`, `fable6_B.md`.
`procedure CreateCharacter` — near (`PUSH CS; CALL`), `RETF`; no parameters. Caller: PartyCreationMenu ('C'). Callees: GetMem,
FillChar, Random, NewMenuList, FreeMenuList, ListItem, VerticalListMenu, AddEffect, UpdateThiefSkills, UpdateSaves, Roll,
DrawCharacterSheet, DrawAbility, WisdomBonusSpells, RollHitDice, ConHpBonus, DrawCombatStats, DrawMoney, AskYesNo,
ReadBottomLine, PortraitMenu, IconEditor, WriteCharacter, FreeMem.
Name H (strings "Pick Race", "Pick Gender", "Pick Class", "Pick Alignment", "Keep this character? ", "Character name: "; the
result is written to the roster with WriteCharacter(c, '')).
**7000:1551 is not a separate routine**: Ghidra split the function at the target of the `JMP 1551` (7000:12E0) of the per-ability
`case`; 1551..1ED1 is the same frame (`[BP-1Bh]`, `[BP-27h]`), its only entry is that jump, and the function returns at
7000:1ECE..1ED1 (`MOV SP,BP; POP BP; RETF`). Both halves are written here as one body (H).
Locals: `c [BP-4]` (new record), `p [BP-27h]` (alias), `list [BP-0Ch]`, `item [BP-10h]`, `index [BP-12h]` (Integer), `key [BP-16h]`,
`raceLoop [BP-17h]`, `k [BP-13h]`, `n [BP-1Ch]`/`[BP-24h]`, `cls [BP-19h]`, `abil [BP-1Bh]`, `try [BP-14h]`, `r [BP-15h]`,
`goldSum [BP-21h]`, `nCls [BP-20h]`, `conAdj [BP-1Eh]`, `saved [BP-8]` (SelectedChar), `redraw [BP-23h]`, `showExit [BP-22h]`.
```pascal
GetMem(c, $11D);                                                  { 7000:0577 }
FillChar(c^, $11D, 0);                                            { 7000:058e }
for k := 1 to 6 do                                                { 7000:059c }
  c^.icon_colours[k] := (g_3CF5[k] + 8) * 16 + g_3CF5[k];         { 7000:05ac  TChar +C0h+k: 91 A2 B3 C4 E6 F7 }
c^.base_ac := $32;                                                { 7000:05e4  AC 10 }
c^.base_thac0 := $28;                                             { 7000:05ed  THAC0 20 (recomputed below) }
c^.status := 0;  c^.active := 1;                                  { 7000:05f5 }
c^.head_pic := 1;  c^.body_pic := 1;  c^.size := 1;               { 7000:0607 }
c^.unk_AB := Random(256);                                         { 7000:0622 }

{ ---- race ---- }
NewMenuList(7, list);                                             { 7000:0638 }
list^.isHeader := 1;  list^.text := 'Pick Race';                  { 7000:0640 / 0653 }
for raceLoop := 1 to 7 do begin                                   { 7000:0658 }
  if raceLoop in [1..5] then                                      { 7000:0664 }
    ListItem(raceLoop, list)^.text := '  ' + RaceName[raceLoop]   { 7000:0677 .. 06b1  Dwarf Elf Gnome Half-Elf Halfling }
  else if raceLoop = 7 then
    ListItem(raceLoop - 1, list)^.text := '  ' + RaceName[7];     { 7000:06c8 .. 0702  item 6 = Human; Half-Orc (6) is not offered }
end;
item := list;  index := 1;  redraw := true;  showExit := true;    { 7000:0710 }
repeat
  key := VerticalListMenu('', '', $0D, $0A, $0F, 1, 2, $26, $16, list, showExit, redraw, index, item);   { 7000:0775 }
  if key = #0 then exit;                                          { 7000:077d  Esc / Exit: quirk — c and list are not freed }
until key = #13;                                                  { 7000:0786 }
if index = 6 then index := 7;                                     { 7000:078c }
c^.race := index;                                                 { 7000:07a4 }
case c^.race of                                                   { 7000:07ab  innate racial effects (types: ov24 effect table; meaning L) }
  5 {Halfling}: begin c^.icon_size := 1;                          { 7000:07b3 }
       AddEffect(c, $5A, 0, $FF, 0);                          { 7000:07ce }
       AddEffect(c, $61, 0, $FF, 0) end;                      { 7000:07e5 }
  1 {Dwarf}:    begin c^.icon_size := 1;                          { 7000:07f1 }
       AddEffect(c, $5A, 0, $FF, 0);                          { 7000:080c }
       AddEffect(c, $61, 0, $FF, 0);                          { 7000:0823 }
       AddEffect(c, $1A, 0, $FF, 0);                          { 7000:083a }
       AddEffect(c, $2F, 0, $FF, 0) end;                      { 7000:0851 }
  3 {Gnome}:    begin c^.icon_size := 1;                          { 7000:085d }
       AddEffect(c, $61, 0, $FF, 0);                          { 7000:0878 }
       AddEffect(c, $12, 0, $FF, 0);                          { 7000:088f }
       AddEffect(c, $2F, 0, $FF, 0);                          { 7000:08a6 }
       AddEffect(c, $30, 0, $FF, 0) end;                      { 7000:08bd }
  2 {Elf}:      begin c^.icon_size := 2;                          { 7000:08c8 }
       AddEffect(c, $6B, 0, $FF, 0) end;                          { 7000:08e3 }
  4 {Half-Elf}: begin c^.icon_size := 2;                          { 7000:08ee }
       AddEffect(c, $7C, 0, $FF, 0) end;                          { 7000:0909 }
else            c^.icon_size := 2;                                { 7000:0910  Human }
end;
FreeMenuList(list);                                               { 7000:091e }

{ ---- gender ---- }
NewMenuList(3, list);                                             { 7000:092c }
list^.isHeader := 1;  list^.text := 'Pick Gender';                { 7000:0934 / 0947 }
for k := 0 to 1 do                                                { 7000:094c  local [BP-18h] }
  ListItem(k + 1, list)^.text := '  ' + GenderName[k];            { 7000:0961 .. 099b  Male, Female }
item := list;  index := 1;  showExit := true;  redraw := true;    { 7000:09a6 }
repeat
  key := VerticalListMenu('', '', $0D, $0A, $0F, 1, 2, $26, $16, list, showExit, redraw, index, item);   { 7000:0a0b }
  if key = #0 then exit;                                          { 7000:0a13 }
until key = #13;                                                  { 7000:0a1c }
c^.gender := index - 1;                                           { 7000:0a29 }
FreeMenuList(list);                                               { 7000:0a33 }

{ ---- class ---- }
n := RaceClasses{g_3E17}[c^.race*12];                             { 7000:0a47 }
NewMenuList(n + 1, list);                                         { 7000:0a5a }
list^.isHeader := 1;  list^.text := 'Pick Class';                 { 7000:0a62 / 0a75 }
for k := 1 to n do                                                { 7000:0a7a }
  ListItem(k, list)^.text := '  ' + ClassName[RaceClasses[c^.race*12 + k]];   { 7000:0a9b .. 0aee }
item := list;  index := 1;  showExit := true;  redraw := true;    { 7000:0afb }
repeat
  key := VerticalListMenu('', '', $0D, $0A, $0F, 1, 2, $26, $16, list, showExit, redraw, index, item);   { 7000:0b60 }
  if key = #0 then exit;                                          { 7000:0b68 }
until key = #13;                                                  { 7000:0b71 }
p := c;                                                           { 7000:0b77  [BP-27h] reloaded (#fable-6) }
c^.class := RaceClasses[c^.race*12 + index];                      { 7000:0b80  stored via p at 0b9b }
c^.level_main := 1;                                               { 7000:0ba2 }
case c^.class of                                                  { 7000:0baa  level 1 in each base class }
  0..7: c^.level[c^.class] := 1;                                  { 7000:0bc3 }
  8:  begin c^.level[0] := 1; c^.level[2] := 1 end;               { 7000:0bd0  C/F }
  9:  begin c^.level[0] := 1; c^.level[2] := 1; c^.level[5] := 1 end;   { 7000:0be9  C/F/MU }
  10: begin c^.level[0] := 1; c^.level[4] := 1 end;               { 7000:0c0b  C/R }
  11: begin c^.level[0] := 1; c^.level[5] := 1 end;               { 7000:0c24  C/MU }
  12: begin c^.level[0] := 1; c^.level[6] := 1 end;               { 7000:0c3d  C/T }
  13: begin c^.level[2] := 1; c^.level[5] := 1 end;               { 7000:0c55  F/MU }
  14: begin c^.level[2] := 1; c^.level[6] := 1 end;               { 7000:0c6d  F/T }
  15: begin c^.level[2] := 1; c^.level[5] := 1; c^.level[6] := 1 end;   { 7000:0c85  F/MU/T }
  16: begin c^.level[5] := 1; c^.level[6] := 1 end;               { 7000:0ca6  MU/T }
end;
if ShortInt(c^.level[6]) > 0 then UpdateThiefSkills(c);           { 7000:0cb8 / 0cc9  ov23 e4; JLE = signed (#fable-6) }
c^.class_mask := 0;  c^.base_thac0 := 0;                          { 7000:0cce }
for cls := 0 to 7 do                                              { 7000:0cdf }
  if c^.level[cls] > 0 then begin                                 { 7000:0cf1  signed }
    if BaseThac0{g_3C7C}[cls*11 + c^.level[cls]] > c^.base_thac0 then
      c^.base_thac0 := BaseThac0[cls*11 + c^.level[cls]];         { 7000:0d17 / 0d49  best of the classes }
    c^.class_mask := c^.class_mask + ClassMaskBit{g_05D6}[cls];   { 7000:0d53 }
  end;
UpdateSaves(c);                                                   { 7000:0d6b  ov23 e3 }
FreeMenuList(list);                                               { 7000:0d75 }

{ ---- alignment ---- }
n := ClassAligns{g_3FE7}[c^.class*10];                            { 7000:0d89 }
NewMenuList(n + 1, list);                                         { 7000:0d9c }
list^.isHeader := 1;  list^.text := 'Pick Alignment';             { 7000:0da4 / 0db7 }
for k := 1 to n do                                                { 7000:0dbc }
  ListItem(k, list)^.text := '  ' + AlignmentName[ClassAligns[c^.class*10 + k]];  { 7000:0ddd .. 0e30 }
item := list;  index := 1;  showExit := true;  redraw := true;    { 7000:0e3d }
repeat
  key := VerticalListMenu('', '', $0D, $0A, $0F, 1, 2, $26, $16, list, showExit, redraw, index, item);   { 7000:0ea2 }
  if key = #0 then exit;                                          { 7000:0eaa }
until key = #13;                                                  { 7000:0eb3 }
c^.alignment := ClassAligns[c^.class*10 + index];                 { 7000:0ecd }
FreeMenuList(list);                                               { 7000:0ede }

{ ---- age ---- }
if c^.class <= 7 then begin                                       { 7000:0ee6  signed }
  a := @StartAge{g_3E5B}[c^.race*28 + c^.class*4];                { 7000:0eef }
  c^.age := a^.base + Roll(a^.dice, a^.sides);                    { 7000:0f26 }
end else begin p := c;                                            { 7000:0f3d  [BP-27h] := c again (a and p share the slot; #fable-6) }
  case c^.class of                                               { 7000:0f49  multi-class: base + dice*sides (the maximum) }
  8, 9, 11, 12: c^.age := StartAge[race,0].base + StartAge[race,0].dice * StartAge[race,0].sides;   { 7000:0f51 / 0fa4 / 0ff7 / 104a  cleric entry }
  13, 15, 16:   c^.age := StartAge[race,5].base + StartAge[race,5].dice * StartAge[race,5].sides;   { 7000:109d / 1143 / 1195  magic-user entry }
  14:           c^.age := StartAge[race,2].base + StartAge[race,2].dice * StartAge[race,2].sides;   { 7000:10f0  fighter entry }
end end;                                                          { quirk: class 10 (C/R) leaves age 0 — no race offers C/R }

saved := SelectedChar;  SelectedChar := c;                        { 7000:11e1 }
DrawCharacterSheet;                                               { 7000:11fb  DrawCharacterSheet }

{ ---- ability rolls; the "Keep this character?" No answer restarts here ---- }
reroll:                                                           { 7000:1200 }
c^.str_exc := 0;                                                  { 7000:1203 }
for abil := 0 to 5 do begin                                       { 7000:1208 / 120e (increment) / 1bd8 }
  c^.abil[abil] := 0;                                             { 7000:121a  TChar +10h+abil }
  for try := 1 to 6 do begin                                      { 7000:121f  best of six rolls of 3d6 }
    r := Roll(3, 6);                                              { 7000:122e }
    case raceLoop of                                              { 7000:1236  quirk: tests the race-list loop variable, always 7 here → never applies }
      1: if abil = 4 then r := r + 1 else if abil = 5 then r := r - 1;          { 7000:123d  dwarf: CON+1, CHA-1 }
      2: if abil = 3 then r := r + 1 else if abil = 4 then r := r - 1;          { 7000:1256  elf: DEX+1, CON-1 }
      5: if abil = 0 then r := r - 1 else if abil = 3 then r := r + 1;          { 7000:126f  halfling: STR-1, DEX+1 }
      6: if abil = 0 then r := r + 1 else if abil = 4 then r := r + 1
         else if abil = 5 then r := r - 2;                                     { 7000:1288  half-orc: STR+1, CON+1, CHA-2 }
    end;
    if c^.abil[abil] < r then c^.abil[abil] := r;                 { 7000:12a5  unsigned }
  end;
  p := c;                                                         { 7000:12d0 }
  a := @AgeCategory{g_3F31}[p^.race*10];                          { age limits t0..t3 (words), compare `t < p^.age` }
  L := @RaceAbilityLimits{g_3DA3}[p^.race*16];
  case abil of                                                    { 7000:12d9 / 1551 }
  0: begin                                                        { STR }
       if (p^.str > 0) and (a^[0] < p^.age) then p^.str := p^.str + 1;   { 7000:12e3 }
       if (p^.str > 0) and (a^[1] < p^.age) then p^.str := p^.str - 1;   { 7000:131c }
       if (p^.str > 0) and (a^[2] < p^.age) then p^.str := p^.str - 2;   { 7000:1355 }
       if (p^.str > 0) and (a^[3] < p^.age) then p^.str := p^.str - 1;   { 7000:138f }
       if p^.str < L^[0 + p^.gender] then p^.str := L^[0 + p^.gender];  { 7000:13c8  race/gender minimum }
       if p^.str > L^[2 + p^.gender] then p^.str := L^[2 + p^.gender];  { 7000:1424  race/gender maximum }
       if p^.str < ClassAbilityMin{g_3F81}[p^.class*6 + 0] then p^.str := ClassAbilityMin[p^.class*6 + 0];  { 7000:1480 }
       if (p^.str = 18) and (p^.level[2] > 0) then begin          { 7000:14da  fighter level > 0 (signed) }
         p^.str_exc := Random(100) + 1;                           { 7000:14f3 }
         if L^[4 + p^.gender] < p^.str_exc then p^.str_exc := L^[4 + p^.gender];  { 7000:151b  e.g. female human max 50 }
       end;
     end;
  1: begin                                                        { INT }
       if a^[1] < p^.age then p^.int := p^.int + 1;               { 7000:1558 }
       if a^[3] < p^.age then p^.int := p^.int + 1;               { 7000:1581 }
       clamp p^.int to L^[6] .. L^[7];                            { 7000:15aa / 15ec }
       if p^.int < ClassAbilityMin[p^.class*6 + 1] then p^.int := ClassAbilityMin[p^.class*6 + 1];   { 7000:162e }
     end;
  2: begin                                                        { WIS }
       if a^[0] >= p^.age then p^.wis := p^.wis - 1;              { 7000:1692  young adult }
       if a^[1] < p^.age then p^.wis := p^.wis + 1;               { 7000:16bb }
       if a^[2] < p^.age then p^.wis := p^.wis + 1;               { 7000:16e4 }
       if a^[3] < p^.age then p^.wis := p^.wis + 1;               { 7000:170d }
       clamp p^.wis to L^[8] .. L^[9];                            { 7000:1736 / 1778 }
       if p^.wis < ClassAbilityMin[p^.class*6 + 2] then p^.wis := ClassAbilityMin[p^.class*6 + 2];   { 7000:17ba }
       if (p^.wis < 13) and (p^.class in [8..12]) then p^.wis := 13;   { 7000:1814  cleric multi-classes (set CS:0525) }
     end;
  3: begin                                                        { DEX }
       if a^[2] < p^.age then p^.dex := p^.dex - 2;               { 7000:1850 }
       if a^[3] < p^.age then p^.dex := p^.dex - 1;               { 7000:187a }
       clamp p^.dex to L^[$0A] .. L^[$0B];                        { 7000:18a3 / 18e5 }
       if p^.dex < ClassAbilityMin[p^.class*6 + 3] then p^.dex := ClassAbilityMin[p^.class*6 + 3];   { 7000:1927 }
     end;
  4: begin                                                        { CON }
       if a^[1] < p^.age then p^.con := p^.con - 1;               { 7000:198b }
       if a^[2] < p^.age then p^.con := p^.con - 1;               { 7000:19b4 }
       if a^[3] < p^.age then p^.con := p^.con - 1;               { 7000:19dd }
       clamp p^.con to L^[$0C] .. L^[$0D];                        { 7000:1a06 / 1a48 }
       if p^.con < ClassAbilityMin[p^.class*6 + 4] then p^.con := ClassAbilityMin[p^.class*6 + 4];   { 7000:1a8a }
     end;
  5: begin                                                        { CHA — no age adjustment }
       clamp p^.cha to L^[$0E] .. L^[$0F];                        { 7000:1aee / 1b30 }
       if p^.cha < ClassAbilityMin[p^.class*6 + 5] then p^.cha := ClassAbilityMin[p^.class*6 + 5];   { 7000:1b72 }
     end;
  end;
  DrawAbility(abil, false);                                       { 7000:1bd3  DrawAbility }
end;
{ "clamp x to lo .. hi" = if x < lo then x := lo; if x > hi then x := hi (unsigned bytes, the minimum first). }

p := c;                                                           { 7000:1be1 }
p^.hp := p^.hp_max;                                               { 7000:1bed  (old value; set again below) }
p^.attacks := 2;  p^.base_dmg_dice[1] := 1;  p^.base_dmg_sides[1] := 2;   { 7000:1bfc  1 attack/round, 1d2 bare hands }
p^.unk_AA := 1;  p^.base_move := 12;                              { 7000:1c14 }
goldSum := 0;  nCls := 0;                                         { 7000:1c25 }
for cls := 0 to 7 do                                              { 7000:1c2d }
  if p^.level[cls] > 0 then begin                                 { 7000:1c3f  signed }
    if cls = 0 then p^.spell_slots[0] := 1                        { 7000:1c51  cleric level-1 slot (+B2h) }
    else if cls = 5 then p^.spell_slots[3] := 1;                  { 7000:1c60  magic-user level-1 slot (+B5h) }
    goldSum := goldSum + Roll(StartGoldDice{g_4263}[cls*2], StartGoldDice[cls*2 + 1]);   { 7000:1c83  byte }
    nCls := nCls + 1;                                             { 7000:1c8b }
    if cls = 0 then begin                                         { 7000:1c91 }
      WisdomBonusSpells(c);                                       { 7000:1c9b  ov23 e2 }
      for k := 1 to $38 do                                        { 7000:1ca0 }
        if (SpellTable{g_31FA}[k].cls = 0) and (SpellTable[k].lvl = 1) then   { 7000:1cc1  byte 0 / byte 1 of the 16-byte entry }
          p^.known_spell[k] := 1;                                 { 7000:1cdb  +32h+k: every level-1 cleric spell }
    end else if cls = 5 then begin                                { 7000:1ce8 }
      p^.known_spell[$0B] := 1;  p^.known_spell[$12] := 1;        { 7000:1cec  +3Dh, +44h }
      p^.known_spell[$13] := 1;  p^.known_spell[$15] := 1;        { 7000:1cfc  +45h, +47h: four first-level MU spells }
    end;
  end;
p^.money[3] := (goldSum * 10) div nCls;                           { 7000:1d15  gold (+8Eh) = average class roll ×10 }
p^.hp_rolled := RollHitDice(c, $FF);                            { 7000:1d3b  one hit die per class }
p^.hp_max := p^.hp_rolled;                                        { 7000:1d49 }
conAdj := ConHpBonus(c);                                       { 7000:1d5c  signed CON hit-point adjustment }
if conAdj < 0 then begin                                          { 7000:1d63 }
  if p^.hp_max > Abs(conAdj) + nCls then                          { 7000:1d69 .. 1d87 }
    p^.hp_max := (p^.hp_max + conAdj) div nCls                    { 7000:1d9d }
  else p^.hp_max := 1;                                            { 7000:1da8 }
end else
  p^.hp_max := (p^.hp_max + conAdj) div nCls;                     { 7000:1dc6 }
p^.hp := p^.hp_max;                                               { 7000:1dcf }
p^.hp_rolled := p^.hp_rolled div nCls;                            { 7000:1df0 }
DrawCombatStats;                                                  { 7000:1dfa  DrawCombatStats }
DrawMoney;                                                        { 7000:1dff  DrawMoney }
key := AskYesNo('Keep this character? ', $0D, $0A, $0F);          { 7000:1e1c }
if key <> 'Y' then goto reroll;                                   { 7000:1e24  quirk: gold, slots, HP re-rolled; known spells stay set }

DrawCharacterSheet;                                               { 7000:1e2d }
SelectedChar := saved;                                            { 7000:1e32 }
repeat
  c^.name := ReadBottomLine('Character name: ', $0D, 15);         { 7000:1e5a / 1e68  StrAssign max 15 }
until c^.name <> '';                                              { 7000:1e70 }
saved := SelectedChar;  SelectedChar := c;                        { 7000:1e76 }
PortraitMenu;                                                    { 7000:1e91  "Head Body Keep" portrait picker (part B) }
IconEditor;                                                        { 7000:1e95  combat-icon editor (part B) }
WriteCharacter(c^, '');                                           { 7000:1ead  WriteCharacter: SAVE\<name>.CHA (+.ITM/.SPC) + charlist.txt }
SelectedChar := saved;                                            { 7000:1eb2 }
FreeMem(c, $11D);                                                 { 7000:1ec9  quirk: the effect list (racial effects) is not freed }
```
Notes (port): the new character does not join the party here — it is only stored in the roster; "Add Character to Party" loads it.
`level[k] > 0`, `class <= 7` and `level[2] > 0` are signed byte tests (`JLE`/`JG`), the ability clamps unsigned (`JNC`/`JBE`).
Abort (#0 from any list) leaks `c`, the current menu list and any racial effects; a port may free them (no visible difference).

### 7000:1551 FUN_7000_1551 — not a routine (H)
Second half of CreateCharacter (ability cases 1..5, HP/gold, keep/name/portrait/save) — written above. Its only entry is
`JMP 7000:1551` at 7000:12E0 from the ability `case`; it uses CreateCharacter's frame and ends with CreateCharacter's
`RETF` at 7000:1ED1. Ghidra's callers line "CreateCharacter" is that jump.

---

## ov16 (7000), part B — 7000:1F37 .. 4454: drop, modify, training, add, remove, portrait + icon editor, hit-point and money helpers (FINAL pseudocode, lane por-mod-party, fork ov16b)

Routines: 7000:1F37, 2033, 209F, 29AE, 306D, 3291, 33E7, 34DF, 35BE, 382D, 3F31, 3FB3, 408C, 4235, 42ED, 4454 (16, all of functions.tsv in the range).
Evidence: `decode/listings/ov16.lst` lines 3101..6910 and the unit bytes (`python decode/ecl/hdis.py ov16 START END`); DS tables read from `decode/bin/START.unpacked.exe` (file offset = 8E0h + C7C0h + DS offset). Character fields by SAVES.md §3 (TChar), coin order by SAVES.md `money[0..6]`.

Conventions (as VIEW.pas.md / ENGINE.pas.md)
- **Signatures in Pascal order**: first parameter = highest BP offset = pushed first; parameters as `name [BP+xx]`. Every call below was written from its PUSH sequence.
- **Nested procedures**: a near `CALL` preceded by `PUSH BP; PUSH CS` passes the caller's frame as static link at `[BP+6]` (2033 in ModifyCharacter, 34DF/35BE in IconEditor). They read the parent's locals; written here as the parent's variable names.
- Temp strings: `@StrCopy(tmp, lit); @StrAppend(x)` leaves `tmp` on the stack as the next call's string argument — written as `lit + x`.
- `{ seg:off }` = first instruction of the statement; `{ quirk: ... }` = behaviour a faithful port must copy.
- Globals: names from decode/names/*.json (SelectedChar DS:5D92, PartyHead DS:5D96, ecl_Mem6B00 DS:49D6, VideoMode DS:4A1E, travel_Mode DS:49FA, CombatIcons DS:5E5A, ClassName DS:0D38, CoinValue DS:0D24); names introduced here (ov16b_names.json) are written `Name{g_XXXX}` on first use.
- Callees in other units by their lane names: AskYesNo / HorizontalMenu / VerticalListMenu / ClearMenuLine / FreeMenuList (ov25, VIEW.pas.md), DrawCharacterSheet / DrawCombatStats / DrawAbility / MoneyInGold / SpellList (ov19, combat_parts/ov19.pas.md), UpdateLevelStats / WisdomBonusSpells (ov23), ShowPortrait (ov28), FreeCombatIcon / LoadCombatIcon / DrawIconAt (ov32), PaletteFlashOn / PaletteFlashOff (ov31), Roll (ov24), resident ENGINE names. ov17 routines are kept as `ov17_XXXX` with their SAVES.md role in a comment (ov17 belongs to another PARTY fork): ReadCharList ReadRoster(var list), WriteCharList WriteRoster(list), LoadCharacterIcon (load SelectedChar's combat icon into CombatIcons slot `party_slot`; byte arg, L), ReadCharacter ReadCharacter(name, var c, b1, b2), AddToParty AddToParty(c). `FreeCharacter` (ov16 part A) frees a TChar with its combat record, items and effects.

Tables (image bytes, H unless noted)
- `RaceAbilityLimits{g_3DA3}`: 16 bytes per race (`+race*16`): +0/+1 STR min (male/female, `+gender`), +2/+3 STR max, +4/+5 exceptional-STR max, +6/+7 INT min/max, +8/+9 WIS, +0Ah/+0Bh DEX, +0Ch/+0Dh CON, +0Eh/+0Fh CHA. E.g. human `03 03 12 12 64 32 03 12 ...` (STR 3..18, 18/00 male, 18/50 female), dwarf `08 08 12 11 63 00 03 12 03 12 03 11 0C 13 03 10`.
- `ClassAbilityMin{g_3F81}`: 6 bytes per class (`+class*6 + stat`, stat order STR INT WIS DEX CON CHA): cleric 6 6 9 0 0 0, druid 0 0 12 0 0 15, fighter 9 0 6 6 7 0, paladin 13 9 12 0 9 17, ranger 0 13 14 0 14 0, MU 0 9 6 6 0 0, thief 6 6 0 9 0 0, monk 15 0 15 15 11 0, multi-classes 8..16 (see notes).
- `XpForLevel{g_409B}`: LongInt, `[cls*38h + lvl*4]` = XP needed for level `lvl` of base class `cls`; −1 = level not attainable: cleric 1501, 3001, 6001, 13001, 27501 (L2..6); fighter 2001 .. 125001 (L2..8); MU 2501 .. 40001 (L2..6); thief 1251 .. 110001 (L2..9); druid/paladin/ranger/monk all −1.
- `ClassTrainBits{g_05DE}`[cls] = 02 02 08 0A 0A 01 04 06 (MU 1, cleric 2, thief 4, fighter 8 — the TChar class_mask bits; compared with the training hall's mask `ecl_Mem6B00^.w[$550]`).
- `ConHpAdj{g_408E}`[CON] (signed): CON 3 → −2, 4..6 → −1, 7..14 → 0, 15 → +1, 16..20 → +2.
- `HitDiceCount{g_08B6}`[cls] = 1 1 1 1 2 1 1 2, `HitDieSides{g_08BE}`[cls] = 8 8 10 10 8 4 6 4 (cleric d8, druid d8, fighter d10, paladin d10, ranger 2d8, MU d4, thief d6, monk 2d4).
- `CoinValue{g_0D24}`[0..4] = 1, 10, 100, 200, 1000 (copper value of copper, silver, electrum, gold, platinum).
- `IconMenuText{g_07BF}`: string[40] per icon-editor state (`+state*29h`): 1 'Parts color-1 color-2 Size Exit', 2 'Head Weapon Exit', 3 'Weapon Body xxxx Shield Arm Leg Exit' (chars 13..16 replaced by 'Hair'/'Face'), 4 ' Keep Exit', 5 'Next Prev Keep Exit'.
- `IconColourSlot{g_3CF5}`[1..6] = 1, 2, 3, 4, 6, 7 (EGA colour replaced by the low nibble of `icon_colours[i-1]`; colour+8 by the high nibble).

---

### 7000:1F37 DropCharacter (H)
`procedure DropCharacter` — `RETF`. Callers: PartyCreationMenu (top menu). Callees: AskYesNo, ShowTimedBottomMessage, RemoveFromParty.
Name H: strings "Drop ", " forever? ", "Are you sure? ", "You dump ", " out back.", " bids you farewell.", " breathes a sigh of relief." (cs:1ED2..1F1B).
```pascal
if SelectedChar = nil then exit;                                                   { 7000:1f3e }
c := SelectedChar;                                                                 { 7000:1f4a }
if AskYesNo('Drop ' + c^.name + ' forever? ', $0E, $0A, $0F) = 'Y' then begin      { 7000:1f81 }
  if AskYesNo('Are you sure? ', $0E, $0A, $0F) = 'Y' then begin                    { 7000:1fa6 }
    if c^.active = 0 then                                                          { 7000:1faf  TChar +10Dh }
      ShowTimedBottomMessage('You dump ' + c^.name + ' out back.')                 { 7000:1fde }
    else
      ShowTimedBottomMessage(c^.name + ' bids you farewell.');                     { 7000:1fff }
    RemoveFromParty(false, true);                                                  { 7000:200b  count decremented, icon freed }
    exit;                                                                          { 7000:200e }
  end;
end;
ShowTimedBottomMessage(c^.name + ' breathes a sigh of relief.');                   { 7000:202a  first or second answer not 'Y' }
```
{ quirk: the character is removed from the party list and freed, but nothing is deleted on disk here (the roster file is not touched). }

### 7000:2033 DrawModifyField (M) *nested in ModifyCharacter*
`procedure DrawModifyField(highlight [BP+8]: Boolean)` (static link [BP+6]; `RETF 4`). Reads the parent's `field` ([BP−0Dh] of ModifyCharacter).
```pascal
if field < 6 then DrawAbility(field, highlight)                                    { 7000:2039 / 204c  ability row }
else DrawHP(SelectedChar, 4, $12, highlight);                                      { 7000:2065  HP }
```

### 7000:209F ModifyCharacter (H)
`procedure ModifyCharacter` — `RETF`. Callers: PartyCreationMenu. Callees: ShowTimedBottomPrompt, DrawCharacterSheet, System.Move, DrawModifyField, HorizontalMenu, WisdomBonusSpells, MaxHitPoints, MinHitPoints, RecalcCharacter, DrawCombatStats.
Lets the player edit the six abilities and max HP of a character that has no experience yet, within race/gender/class limits. Name H ("Modify character: ", "Keep Exit", " can't be modified.").
Locals: `saved[0..5]` [BP−6] (abilities), `savedExc` [BP−7], `savedHp` [BP−8], `field` [BP−0Dh] (0..5 = STR..CHA, 6 = HP), `key` [BP−0Bh], `ext` [BP−0Ch], `c` [BP−18h] = SelectedChar.
```pascal
if SelectedChar^.xp > 0 then begin                                                 { 7000:20a6  signed LongInt test }
  ShowTimedBottomPrompt(SelectedChar^.name + ' can''t be modified.', $0E);         { 7000:20da }
  exit;
end;
DrawCharacterSheet;                                                                { 7000:20e2 }
Move(SelectedChar^.str, saved, 6);                                                 { 7000:20fa  +10h..+15h }
savedExc := SelectedChar^.str_exc;                                                 { 7000:20ff  +16h }
savedHp := SelectedChar^.hp_max;                                                   { 7000:210a  +32h }
field := 6;  DrawModifyField(false);                                               { 7000:2115 / 211e }
field := 0;  DrawModifyField(true);                                                { 7000:2121 / 212a }
c := SelectedChar;                                                                 { 7000:212d }
repeat
  key := HorizontalMenu('Modify character: ', 'Keep Exit', $0D, $0A, $0F, true, false, ext);   { 7000:2169 }
  DrawModifyField(false);                                                          { 7000:2176 }
  if ext then begin                                                                { 7000:2179 }
    if (key = 'P') or (key = #13) then begin                                       { 7000:2182  Down }
      field := field + 1;  if field > 6 then field := 0;                           { 7000:218d }
    end
    else if key = 'H' then begin                                                   { 7000:219d  Up }
      field := field - 1;  if field = -1 then field := 6;                          { 7000:21a1 }
    end
    else if key = 'K' then begin                                                   { 7000:21b1  Left = decrease }
      if field < 6 then begin                                                      { 7000:21b8 }
        i := field;                                                                { 7000:21c1 }
        Dec(c^.ability[i]);                                                        { 7000:21d0  c^ +10h+i }
        case i of
          0: if c^.str_exc > 0 then begin                                          { 7000:21de }
               Dec(c^.str_exc);  Inc(c^.str);                                      { 7000:21eb / 21f8  exceptional strength first }
             end
             else if (c^.str < RaceAbilityLimits[c^.race].strMin[c^.gender])       { 7000:221a }
                  or (c^.str < ClassAbilityMin[c^.class, 0]) then                  { 7000:2241 }
               c^.str := RaceAbilityLimits[c^.race].strMin[c^.gender];             { 7000:2271 }
          1: if (c^.int < RaceAbilityLimits[c^.race].intMin) or (c^.int < ClassAbilityMin[c^.class, 1]) then   { 7000:2297 / 22be }
               c^.int := RaceAbilityLimits[c^.race].intMin;                        { 7000:22e1 }
          2: begin
               if (c^.wis < RaceAbilityLimits[c^.race].wisMin) or (c^.wis < ClassAbilityMin[c^.class, 2]) then   { 7000:230a / 2331 }
                 c^.wis := RaceAbilityLimits[c^.race].wisMin;                      { 7000:2354 }
               if c^.spell_slots[0] > 0 then c^.spell_slots[0] := 1;               { 7000:2365  +B2h cleric L1 slots }
               WisdomBonusSpells(SelectedChar);                                    { 7000:2381 }
             end;
          3: if (c^.dex < RaceAbilityLimits[c^.race].dexMin) or (c^.dex < ClassAbilityMin[c^.class, 3]) then   { 7000:239b / 23c2 }
               c^.dex := RaceAbilityLimits[c^.race].dexMin;                        { 7000:23e5 }
          4: begin
               if (c^.con < RaceAbilityLimits[c^.race].conMin) or (c^.con < ClassAbilityMin[c^.class, 4]) then   { 7000:240e / 2435 }
                 c^.con := RaceAbilityLimits[c^.race].conMin;                      { 7000:2458 }
               if MaxHitPoints(SelectedChar) < c^.hp_max then                      { 7000:2472 }
                 c^.hp_max := MaxHitPoints(SelectedChar);                          { 7000:2487 }
               c^.hp := c^.hp_max;                                                 { 7000:2491  +11Bh }
               field := 6;  DrawModifyField(false);  field := 4;                   { 7000:24a0 / 24a9 / 24ac  redraw HP }
             end;
          5: if (c^.cha < RaceAbilityLimits[c^.race].chaMin) or (c^.cha < ClassAbilityMin[c^.class, 5]) then   { 7000:24c4 / 24eb }
               c^.cha := RaceAbilityLimits[c^.race].chaMin;                        { 7000:250e }
        end;
      end
      else begin                                                                   { field 6 = HP }
        Dec(c^.hp_max);                                                            { 7000:2521 }
        if MinHitPoints(SelectedChar) > c^.hp_max then                             { 7000:2531 }
          c^.hp_max := MinHitPoints(SelectedChar);                                 { 7000:2546 }
        c^.hp := c^.hp_max;                                                        { 7000:2550 }
      end;
    end
    else if key = 'M' then begin                                                   { 7000:2562  Right = increase }
      if field < 6 then begin                                                      { 7000:2569 }
        i := field;                                                                { 7000:2572 }
        Inc(c^.ability[i]);                                                        { 7000:2581 }
        case i of
          0: if c^.str > RaceAbilityLimits[c^.race].strMax[c^.gender] then begin   { 7000:25aa }
               if (c^.str > 18) and (c^.level[2] > 0)                              { 7000:25c8 / 25cf  fighter level +98h }
                  and (RaceAbilityLimits[c^.race].excMax[c^.gender] > c^.str_exc) then   { 7000:25f5 }
                 Inc(c^.str_exc);                                                  { 7000:2605 }
               c^.str := RaceAbilityLimits[c^.race].strMax[c^.gender];             { 7000:2624 }
             end;
          1: if c^.int > RaceAbilityLimits[c^.race].intMax then c^.int := RaceAbilityLimits[c^.race].intMax;   { 7000:264a / 266d }
          2: begin
               if c^.wis > RaceAbilityLimits[c^.race].wisMax then c^.wis := RaceAbilityLimits[c^.race].wisMax; { 7000:2693 / 26b6 }
               if c^.spell_slots[0] > 0 then c^.spell_slots[0] := 1;               { 7000:26c7 }
               WisdomBonusSpells(SelectedChar);                                    { 7000:26e3 }
             end;
          3: if c^.dex > RaceAbilityLimits[c^.race].dexMax then c^.dex := RaceAbilityLimits[c^.race].dexMax;   { 7000:26fd / 2720 }
          4: begin
               if c^.con > RaceAbilityLimits[c^.race].conMax then c^.con := RaceAbilityLimits[c^.race].conMax; { 7000:2749 / 276c }
               if MinHitPoints(SelectedChar) > c^.hp_max then                      { 7000:2786 }
                 c^.hp_max := MinHitPoints(SelectedChar);                          { 7000:279b }
               c^.hp := c^.hp_max;                                                 { 7000:27a5 }
               field := 6;  DrawModifyField(false);  field := 4;                   { 7000:27b4 / 27bd / 27c0 }
             end;
          5: if c^.cha > RaceAbilityLimits[c^.race].chaMax then c^.cha := RaceAbilityLimits[c^.race].chaMax;   { 7000:27d8 / 27fb }
        end;
      end
      else begin                                                                   { HP }
        Inc(c^.hp_max);                                                            { 7000:280e }
        if MaxHitPoints(SelectedChar) < c^.hp_max then                             { 7000:281e }
          c^.hp_max := MaxHitPoints(SelectedChar);                                 { 7000:2833 }
        c^.hp := c^.hp_max;                                                        { 7000:283d }
      end;
    end;
  end
  else if (key = 'E') or (key = #0) then begin                                     { 7000:284e  Exit / Esc: undo everything }
    for i := 0 to 5 do SelectedChar^.ability[i] := saved[i];                       { 7000:2859 }
    SelectedChar^.str_exc := savedExc;                                             { 7000:287f }
    SelectedChar^.hp_max := savedHp;                                               { 7000:288a }
    SelectedChar^.hp := c^.hp_max;                                                 { 7000:2895 }
    RecalcCharacter(SelectedChar);                                                 { 7000:28ad }
    exit;
  end;
  RecalcCharacter(SelectedChar);                                                   { 7000:28bc }
  DrawCombatStats;                                                                 { 7000:28c1 }
  DrawModifyField(true);                                                           { 7000:28cb }
until (not ext) and (key = 'K');                                                   { 7000:28ce / 28d7 }
SelectedChar^.unk_85 := 1;                                                         { 7000:28e0  "Keep" }
```
{ quirk: decreasing below the class minimum (but not below the race minimum) resets the ability to the **race** minimum, which can be lower than the class minimum (e.g. a human cleric's WIS 9 → 8 → 3). }
{ quirk: STR above 18 only raises exceptional strength when the *fighter* level (+98h) is > 0 — paladins and rangers (levels at +99h/+9Ah) cannot raise it here. }
{ quirk: lowering CON clamps hp_max to MaxHitPoints, raising CON clamps it to MinHitPoints (the asm calls 408C on decrease and 3FB3 on increase). }
{ quirk: a non-extended #13 (Enter) does nothing (only extended 'P'/#13 move the field; HorizontalMenu never sets ext with #13). }

### 7000:29AE TrainCharacter (H)
`procedure TrainCharacter` — `RETF`. Callers: PartyCreationMenu (training hall 'T'). Callees: ShowTimedBottomPrompt, MoneyInGold, ClearRectangle, DrawCharacterName, DrawText, ByteToStr, AskYesNo, ShowTimedBottomMessage, PayGold, UpdateLevelStats, SpellList, RollHitDice, ConHpBonus.
Name H: "we only train conscious people", "Training costs 1000 gp.", "We don't train that class here", "Not Enough Experience", " will become:", "Do you wish to train? ", "Congratulations...".
Locals: `c` [BP−21h] = SelectedChar, `haveBits` [BP−0Bh], `canBits` [BP−0Ah], `trainBits` [BP−0Ch], `xpCap` [BP−5] (LongInt), `cls` [BP−13h], `lvl` [BP−18h], `blocked` [BP−1], `nextXp` [BP−9], `row` [BP−16h], `nClasses` [BP−0Dh], `oldMuLvl` [BP−17h].
```pascal
if (SelectedChar^.status <> 0) and not StingMode{g_470C} then begin               { 7000:29b5 / 29c1 }
  ShowTimedBottomPrompt('we only train conscious people', $0E);  exit;             { 7000:29da }
end;
if (MoneyInGold(SelectedChar) < 1000) and not StingMode then begin                 { 7000:29ea / 29fb }
  ShowTimedBottomPrompt('Training costs 1000 gp.', $0E);  exit;                    { 7000:2a14 }
end;
canBits := 0;  haveBits := 0;  c := SelectedChar;  xpCap := 0;                     { 7000:2a1c .. 2a33 }
for cls := 0 to 7 do                                                               { 7000:2a36 }
  if c^.level[cls] > 0 then begin                                                  { 7000:2a48 }
    haveBits := haveBits + ClassTrainBits[cls];                                    { 7000:2a59 }
    blocked := false;  lvl := c^.level[cls];                                       { 7000:2a60 / 2a6d }
    case c^.race of                                                                { 7000:2a78  demi-human level limits }
      1 {dwarf}:    if cls = 2 then if ((lvl = 8) and (c^.str = 17)) or ((lvl = 7) and (c^.str < 17)) then blocked := true;   { 7000:2a80 }
      2 {elf}:      if cls = 2 then if (lvl = 7) or ((lvl = 6) and (c^.str = 17)) or ((lvl = 5) and (c^.str < 17)) then blocked := true;   { 7000:2ab1 }
      3 {gnome}:    if cls = 2 then if (lvl = 6) or ((lvl = 5) and (c^.str < 18)) then blocked := true;   { 7000:2ae8 }
      4 {half-elf}: if (cls = 0) and (lvl = 5) then blocked := true                { 7000:2b0e }
                    else if cls = 2 then if (lvl = 8) or ((lvl = 7) and (c^.str = 17)) or ((lvl = 6) and (c^.str < 17)) then blocked := true;   { 7000:2b20 }
      5 {halfling}: if cls = 2 then if (lvl = 6) or ((lvl = 5) and (c^.str = 17)) or ((lvl = 4) and (c^.str < 17)) then blocked := true;   { 7000:2b56 }
    end;
    if not blocked then                                                            { 7000:2b86 }
      if (XpForLevel[cls, lvl+1] <= c^.xp) or StingMode then                       { 7000:2ba8 / 2bc3  signed LongInt compare }
        if XpForLevel[cls, lvl+1] > 0 then begin                                   { 7000:2be6  −1 = no further level }
          canBits := canBits + ClassTrainBits[cls];                                { 7000:2c02 }
          nextXp := XpForLevel[cls, lvl+2];                                        { 7000:2c24 }
          if (nextXp > 0) and (c^.xp >= nextXp) and (nextXp > xpCap) then          { 7000:2c32 / 2c40 / 2c59 }
            xpCap := nextXp - 1;                                                   { 7000:2c6b }
        end;
  end;
if xpCap > 0 then c^.xp := xpCap;                                                  { 7000:2c86 / 2c94  at most one level per training }
if not StingMode then begin                                                        { 7000:2ca7 }
  if (haveBits and ecl_Mem6B00^.w[$550]) = 0 then begin                            { 7000:2cae  hall's class mask }
    ShowTimedBottomPrompt('We don''t train that class here', $0E);  exit;          { 7000:2cd2 }
  end;
  if (canBits and ecl_Mem6B00^.w[$550]) = 0 then begin                             { 7000:2cdc }
    ShowTimedBottomPrompt('Not Enough Experience', $0E);  exit;                    { 7000:2d00 }
  end;
  trainBits := canBits and ecl_Mem6B00^.w[$550];                                   { 7000:2d0f }
end
else trainBits := canBits;                                                         { 7000:2d22 }
ClearRectangle(1, 1, $26, $16);                                                    { 7000:2d34 }
row := 4;                                                                          { 7000:2d39 }
DrawCharacterName(SelectedChar, 4, row, false);                                    { 7000:2d4f }
DrawText(Length(c^.name) + 4, row, $0A, ' will become:');                          { 7000:2d76 }
for cls := 0 to 7 do                                                               { 7000:2d7b }
  if (c^.level[cls] > 0) and ((ClassTrainBits[cls] and trainBits) <> 0) then begin { 7000:2d8d / 2da2 }
    row := row + 1;                                                                { 7000:2dac }
    if row = 5 then
      DrawText(6, row, $0A, '    a level ' + ByteToStr(c^.level[cls] + 1) + ' ' + ClassName[cls])   { 7000:2e10 }
    else
      DrawText(6, row, $0A, 'and a level ' + ByteToStr(c^.level[cls] + 1) + ' ' + ClassName[cls]);  { 7000:2e72 }
  end;
if AskYesNo('Do you wish to train? ', $0D, $0A, $0F) <> 'Y' then exit;             { 7000:2e98 }
ShowTimedBottomMessage('Congratulations...');                                      { 7000:2eb3 }
if not StingMode then PayGold(1000, SelectedChar);                                 { 7000:2eb8 / 2ecf }
nClasses := 0;                                                                     { 7000:2ed2 }
oldMuLvl := c^.level[5];                                                           { 7000:2ed6  +9Bh }
for cls := 0 to 7 do                                                               { 7000:2ee1 }
  if c^.level[cls] > 0 then begin                                                  { 7000:2ef3 }
    nClasses := nClasses + 1;                                                      { 7000:2efb }
    if (ClassTrainBits[cls] and trainBits) <> 0 then begin                         { 7000:2f04 }
      Inc(c^.level[cls]);                                                          { 7000:2f18 }
      if c^.levels_drained > 0 then begin                                          { 7000:2f20  +74h }
        c^.hp_drained := c^.hp_drained - c^.hp_drained div c^.levels_drained;      { 7000:2f27  +75h }
        Dec(c^.levels_drained);                                                    { 7000:2f48 }
      end;
    end;
  end;
UpdateLevelStats(SelectedChar);                                                    { 7000:2f5a  ov23: THAC0, attacks, slots, saves, thief skills }
if c^.level[5] > oldMuLvl then begin                                               { 7000:2f62  magic-user gained a level: learn one spell }
  index := -1;                                                                     { 7000:2f6c }
  repeat
    spell := SpellList(4, 4, index, count);                                        { 7000:2f81  mode 4 = learnable spells }
  until (spell > 0) or (count = 0);                                                { 7000:2f89 / 2f8f }
  c^.known_spell[spell] := 1;                                                      { 7000:2f95  byte +32h+spell }
end;
hpRoll := RollHitDice(SelectedChar, trainBits);                                    { 7000:2fb1 }
gain := hpRoll div nClasses;  if gain = 0 then gain := 1;                          { 7000:2fc4 / 2fc9 }
c^.hp_rolled := c^.hp_rolled + gain;                                               { 7000:2fd4  +B1h }
conAdj := ConHpBonus(SelectedChar);                                                { 7000:2fe8 }
gain := (hpRoll + conAdj) div nClasses;  if gain < 1 then gain := 1;               { 7000:2ffd / 3002 }
wounds := c^.hp_max - c^.hp;                                                       { 7000:300d }
c^.hp_max := c^.hp_max + gain;                                                     { 7000:3027 }
c^.hp := c^.hp_max - wounds;                                                       { 7000:3031 }
```
{ quirk: the XP cap (`xp := XP of the level after next − 1`) is written before the hall/class checks, so a character turned away with "We don't train that class here" or "Not Enough Experience" still loses the excess XP. }
{ quirk: if the magic-user has no learnable spell (`count = 0`, `spell = 0`) the store goes to byte +32h = `hp_max`, setting it to 1 before the HP gain is added. }
{ quirk: the per-class HP split divides by the number of *all* classes with level > 0 (`nClasses`), also for classes not trained this time. }
Note: `ecl_Mem6B00^.w[$550]` (training hall class mask) is set by the ECL script before the hall menu (ECL var; L for the variable's ECL name).

### 7000:306D AddCharacterMenu (H)
`procedure AddCharacterMenu` — `RETF`. Callers: PartyCreationMenu ('A' Add). Callees: ClearRectangle, ReadCharList ReadRoster, VerticalListMenu, System.GetMem/FreeMem, ReadCharacter ReadCharacter, @StrAssign, System.@StrCompare, AddToParty AddToParty, LoadCharacterIcon, WriteCharList WriteRoster, FreeMenuList.
Name H ("Add a character: ", "Add Exit"; roster list from charlist.txt).
Locals: `list` [BP−4], `item` [BP−8], `index` [BP−12h], `redraw` [BP−15h], `showExit` [BP−14h] (never initialised), `key` [BP−13h], `newC` [BP−0Ch], `p` [BP−10h], `pcCount` [BP−16h].
```pascal
ClearRectangle(1, 1, $26, $16);                                                    { 7000:3080 }
ReadCharList(list);                                                                   { 7000:308a  ReadRoster: one menu item per charlist.txt line }
if list = nil then exit;                                                           { 7000:308f }
index := 0;  item := list;  redraw := true;                                        { 7000:309a .. 30ab }
repeat
  key := VerticalListMenu('Add a character: ', 'Add Exit', $0D, $0A, $0F, 1, 2, $26, $16,
                          list, showExit, redraw, index, item);                    { 7000:30fb }
  if ((key = #13) or (key = 'A')) and (item^.text[1] <> '*') then begin            { 7000:3103 / 3112  '*' = already added }
    GetMem(newC, $11D);                                                            { 7000:3123 }
    ReadCharacter(item^.text, newC^, false, true);                                     { 7000:313f  ReadCharacter from SAVE\<name>.CHA }
    item^.text := '* ' + item^.text;                                               { 7000:3167  mark the roster line }
    pcCount := 0;                                                                  { 7000:316c }
    if PartyHead = nil then begin                                                  { 7000:3170 }
      ecl_Mem6B00^.w[$67C] := 0;                                                   { 7000:317f  party member count }
      AddToParty(newC);                                                             { 7000:318a  AddToParty }
      LoadCharacterIcon(1);                                                                { 7000:3192  load its combat icon }
    end
    else begin
      p := PartyHead;                                                              { 7000:319a }
      while (p <> nil) and not ((p^.name = newC^.name) and (p^.unk_AB = newC^.unk_AB)) do begin   { 7000:31a7 / 31b9 / 31cb }
        if p^.npc_morale < $80 then pcCount := pcCount + 1;                        { 7000:31d2  count player characters }
        p := p^.next;                                                              { 7000:31e0 }
      end;
      if (p = nil) and                                                             { 7000:31f5  not already in the party }
         (((newC^.npc_morale < $80) and (pcCount < 6))                             { 7000:31fd / 3208  max 6 PCs }
          or ((newC^.npc_morale > $7F) and (ecl_Mem6B00^.w[$67C] < 8))) then begin { 7000:320e / 3219  max 8 members }
        AddToParty(newC);                                                           { 7000:322b }
        LoadCharacterIcon(1);                                                              { 7000:3233 }
        if newC^.npc_morale < $80 then pcCount := pcCount + 1;                     { 7000:3238 }
      end
      else FreeMem(newC, $11D);                                                    { 7000:3252 }
    end;
  end;
until (key = 'E') or (key = #0) or (pcCount > 5) or (ecl_Mem6B00^.w[$67C] > 7);    { 7000:3257 .. 326d }
WriteCharList(list);                                                                   { 7000:327e  WriteRoster }
FreeMenuList(list);                                                                { 7000:3288 }
```
{ quirk: the '* ' mark is set before the duplicate/size checks, so a refused character is still shown as added (and its line is not written back by WriteRoster, SAVES.md §1). }
{ quirk: `showExit` ([BP−14h]) is passed to VerticalListMenu uninitialised (stack garbage); the options string already contains "Exit". }
{ quirk: the duplicate test compares name and TChar byte +ABh (unk_AB); TP's StrCompare is exact (case-sensitive). }

### 7000:3291 RemoveFromParty (H)
`procedure RemoveFromParty(keepCount [BP+8], freeIcon [BP+6]: Boolean)` — `RETF 4`. Callers: DropCharacter (false, true), PartyCreationMenu (false, true, after saving the character to the roster). Callees: FreeCombatIcon, FreeCharacter (free the record).
Unlinks `SelectedChar` from the party list (`PartyHead`, link TChar +104h), frees it, and makes its predecessor (or the new head) the selected character.
```pascal
if PartyHead = nil then exit;                                                      { 7000:3297 }
p := PartyHead;                                                                    { 7000:32a3 }
if p = SelectedChar then begin                                                     { 7000:32b0  first member }
  if freeIcon then FreeCombatIcon(SelectedChar^.party_slot);                       { 7000:336b / 337b }
  PartyHead := SelectedChar^.next;                                                 { 7000:3380 }
  p := SelectedChar^.next;                                                         { 7000:3395 }
  FreeCharacter(SelectedChar);                                                     { 7000:33b2  free record, items, effects }
  SelectedChar := p;                                                               { 7000:33b5 }
  if not keepCount then Dec(ecl_Mem6B00^.w[$67C]);                                 { 7000:33c2 / 33cc }
end
else begin
  while (p^.next <> SelectedChar) and (p^.next <> nil) do p := p^.next;            { 7000:32c5 .. 32fd }
  if p^.next <> nil then begin                                                     { 7000:3302 }
    if freeIcon then FreeCombatIcon(SelectedChar^.party_slot);                     { 7000:3311 / 3321 }
    p^.next := SelectedChar^.next;                                                 { 7000:3326 }
    FreeCharacter(SelectedChar);                                                   { 7000:334a }
    SelectedChar := p;                                                             { 7000:334d  predecessor becomes selected }
    if not keepCount then Dec(ecl_Mem6B00^.w[$67C]);                               { 7000:335a / 3364 }
  end;
end;
```

### 7000:33E7 PortraitMenu (H)
`procedure PortraitMenu` — `RETF`. Callers: FUN_7000_1551 (character creation, ov16 part A). Callees: ShowPortrait, HorizontalMenu, ClearMenuLine.
Name H ("Head Body Keep"; cycles TChar +BBh head_pic and +BCh body_pic, both drawn by ShowPortrait).
```pascal
c := SelectedChar;                                                                 { 7000:33ed }
head := c^.head_pic;  body := c^.body_pic;                                         { 7000:33f7 / 3402 }
repeat
  ShowPortrait;                                                                    { 7000:340d }
  key := HorizontalMenu('', 'Head Body Keep', 0, $0F, $0A, false, false, ext);     { 7000:3444 }
  if not ext then                                                                  { 7000:344c }
    if key = 'H' then begin
      if c^.head_pic < 14 then Inc(c^.head_pic) else c^.head_pic := 1;             { 7000:3459  heads 1..14 }
    end
    else if key = 'B' then begin
      if c^.body_pic < 12 then Inc(c^.body_pic) else c^.body_pic := 1;             { 7000:347d  bodies 1..12 }
    end
    else if key = 'K' then begin
      head := c^.head_pic;  body := c^.body_pic;                                   { 7000:34a1 }
    end;
until key = 'K';                                                                   { 7000:34b7 }
c^.head_pic := head;  c^.body_pic := body;                                         { 7000:34c0 / 34cb }
ClearMenuLine;                                                                     { 7000:34d6 }
```
{ quirk: only 'K' leaves the menu (Esc returns #0 and loops). }

### 7000:34DF DrawIconPreview (M) *nested in IconEditor*
`procedure DrawIconPreview(col [BP+0Ah], row [BP+8]: Byte)` (static link [BP+6]; `RETF 6`). Callees: FillPictureRect, DrawIconAt, FlushViewDirtyLines.
Draws the two poses (ready, action) of the icon in CombatIcons slot 12 side by side at icon cell (col, row) and (col+3, row) of the screen picture.
```pascal
if VideoMode = 0 then                                                              { 7000:34e2  CGA }
  FillPictureRect(col*3, row*24, $0C, $18, 3, g_260A, g_4A20)                      { 7000:3518 }
else begin
  FillPictureRect(col*3, row*24, $0C, $18, 0, g_260A, g_4A20);                     { 7000:354e }
  DrawIconAt(col, row, 0, 0, $19);                                                 { 7000:3564  slot 25 behind the icon (L: backdrop) }
  DrawIconAt(col + 3, row, 0, 1, $19);                                             { 7000:357f }
end;
DrawIconAt(col, row, 0, 0, $0C);                                                   { 7000:3595  pose 0 = ready }
DrawIconAt(col + 3, row, 0, 1, $0C);                                               { 7000:35b0  pose 1 = action }
FlushViewDirtyLines;                                                               { 7000:35b5 }
```
(`g_260A` = CGA colour map passed by address, as in DrawBackdrop; `g_4A20` = off-screen screen picture.)

### 7000:35BE CopyIconSlot (M) *nested in IconEditor*
`procedure CopyIconSlot(src [BP+0Ch], dst [BP+0Ah]: Byte; recolour [BP+8]: Boolean)` (static link [BP+6]; `RETF 8`). Callees: System.Move, RecolorPicture.
Copies both poses of combat icon `src` into the already allocated pictures of slot `dst` (pixels at TPicture +17h, mask at +13h^), optionally applying SelectedChar's six icon colours.
```pascal
maskSize := CombatIcons[dst].pose0^.frameSize;                                     { 7000:35c4  TPicture +11h }
if VideoMode = 1 then maskSize := maskSize shr 2;                                  { 7000:35da  EGA: 1 mask bit per 4 plane bits }
Move(CombatIcons[src].pose0^.pixels, CombatIcons[dst].pose0^.pixels, CombatIcons[dst].pose0^.frameSize);   { 7000:3628 }
Move(CombatIcons[src].pose1^.pixels, CombatIcons[dst].pose1^.pixels, CombatIcons[dst].pose1^.frameSize);   { 7000:366a }
Move(CombatIcons[src].pose0^.mask^, CombatIcons[dst].pose0^.mask^, maskSize);      { 7000:369c }
Move(CombatIcons[src].pose1^.mask^, CombatIcons[dst].pose1^.mask^, maskSize);      { 7000:36ce }
if recolour then begin                                                             { 7000:36d3 }
  c := SelectedChar;                                                               { 7000:36dc }
  for k := 0 to 15 do begin fromCol[k] := k;  toCol[k] := k end;                   { 7000:36e6 }
  for i := 1 to 6 do begin                                                         { 7000:370f }
    toCol[IconColourSlot{g_3CF5}[i]]     := c^.icon_colours[i-1] and $0F;         { 7000:3718  TChar +C0h+i }
    toCol[IconColourSlot[i] + 8]         := (c^.icon_colours[i-1] and $F0) shr 4; { 7000:373d }
  end;
  RecolorPicture(fromCol, toCol, 0, false, CombatIcons[dst].pose0);                { 7000:3795 }
  RecolorPicture(fromCol, toCol, 0, false, CombatIcons[dst].pose1);                { 7000:37bd }
end;
```
(CombatIcons = DS:5E5A, 8 bytes per slot: pose 0 picture at +0, pose 1 at +4 = DS:5E5E.)

### 7000:382D IconEditor (H)
`procedure IconEditor` — `RETF`. Callers: FUN_7000_1551 (creation / "Icon" in part A). Callees: DrawTitledFrame, PaletteFlashOn/Off, LoadCharacterIcon, System.@CopyBytes, CopyIconSlot, DrawIconPreview, DrawText, HorizontalMenu, System.Delete/Insert/@SetIn, ClearMenuLine, FreeCombatIcon, LoadCombatIcon, AskYesNo.
Name H ("old", "ready   action", "new", "Small", "Large", "Hair", "Face", "Is this icon ok? ").
State machine `state` [BP−8]: 1 main ("Parts color-1 color-2 Size Exit"), 2 parts ("Head Weapon Exit"), 3 colour part ("Weapon Body Hair|Face Shield Arm Leg Exit"), 4 size ("Small|Large Keep Exit"), 5 browse ("Next Prev Keep Exit"). `prev` [BP−1Ah] = state that leads back from 5; `part` [BP−1Bh] = 'H'/'W'; `slot` [BP−16h] = colour slot 1..6; `hiNib` [BP−17h]; committed values `cHead` [BP−4], `cBody` [BP−5], `cSize` [BP−6], `cColours[0..5]` [BP−15h].
```pascal
DrawTitledFrame(1, 1, $26, $16, 0, 0, '');                                         { 7000:3855 }
PaletteFlashOn;                                                                    { 7000:385a }
repeat                                                                             { 7000:385f  restart point after "Is this icon ok? No" }
  LoadCharacterIcon(0);                                                                    { 7000:3862  load SelectedChar's icon into its slot }
  c := SelectedChar;  state := 1;                                                  { 7000:3867 / 3871 }
  CopyBytes(c^.icon_colours, cColours, 6);                                         { 7000:3887  +C1h }
  savedSlot := c^.party_slot;  c^.party_slot := 12;                                { 7000:388c / 3897 }
  LoadCharacterIcon(0);                                                                    { 7000:38a3  same icon also into slot 12 (preview) }
  c^.party_slot := savedSlot;                                                      { 7000:38a8 }
  cHead := c^.icon_head;  cBody := c^.icon_body;  cSize := c^.icon_size;           { 7000:38b3 / 38be / 38c9  +BDh +BEh +C0h }
  CopyIconSlot(c^.party_slot, 12, true);                                           { 7000:38e5 }
  DrawIconPreview(1, 2);                                                           { 7000:38f0  "old" row }
  DrawText(8, 6, $0F, 'old');                                                      { 7000:390b }
  DrawText(3, $0A, $0F, 'ready   action');                                         { 7000:3928 }
  DrawText(8, $0C, $0F, 'new');                                                    { 7000:3945 }
  DrawText(3, $10, $0F, 'ready   action');                                         { 7000:3962 }
  repeat
    DrawIconPreview(1, 4);                                                         { 7000:396f  "new" row }
    sizeStr := '';                                                                 { 7000:3972 }
    if state = 4 then
      if c^.icon_size = 2 then sizeStr := 'Small' else sizeStr := 'Large';         { 7000:397c / 3995 / 39aa  offer the other size }
    key := HorizontalMenu('', sizeStr + IconMenuText{g_07BF}[state], $0D, $0A, $0F, false, false, ext);   { 7000:39f9 }
    if not ext then                                                                { 7000:3a01 }
      case state of
        1: begin                                                                   { 7000:3a0a }
             prev := 1;                                                            { 7000:3a14 }
             if key = 'P' then state := 2                                          { 7000:3a1b }
             else if key = '1' then begin                                          { 7000:3a25  color-1 }
               state := 3;  hiNib := 0;                                            { 7000:3a29 }
               Delete(IconMenuText[3], 13, 4);  Insert('Hair', IconMenuText[3], 13);   { 7000:3a3e / 3a55 }
             end
             else if key = '2' then begin                                          { 7000:3a5c  color-2 }
               state := 3;  hiNib := 1;                                            { 7000:3a60 }
               Delete(IconMenuText[3], 13, 4);  Insert('Face', IconMenuText[3], 13);   { 7000:3a75 / 3a8c }
             end
             else if key = 'S' then state := 4;                                    { 7000:3a93 }
           end;
        2: begin                                                                   { 7000:3a9e }
             prev := 2;                                                            { 7000:3aa2 }
             if key in [#0, 'E'] then state := 1                                   { 7000:3aaf }
             else begin part := key;  state := 5 end;                              { 7000:3abc }
           end;
        3: begin                                                                   { 7000:3ac9 }
             prev := 3;                                                            { 7000:3acd }
             case key of
               'W': slot := 6;  'B': slot := 1;  'H', 'F': slot := 4;              { 7000:3ad4 .. 3af6 }
               'S': slot := 5;  'A': slot := 2;  'L': slot := 3;                   { 7000:3afc .. 3b14 }
             else slot := 1;                                                       { 7000:3b1a }
             end;
             if key in [#0, 'E'] then state := 1 else state := 5;                  { 7000:3b27 }
           end;
        4: begin                                                                   { 7000:3b3b  size }
             if key = 'L' then begin c^.icon_size := 2;  LoadCharacterIcon(0) end          { 7000:3b46 / 3b52 }
             else if key = 'S' then begin c^.icon_size := 1;  LoadCharacterIcon(0) end     { 7000:3b5d / 3b69 }
             else if key = 'K' then begin cSize := c^.icon_size;  state := 1;  key := ' ' end   { 7000:3b74 }
             else if key in ['E', #0] then begin c^.icon_size := cSize;  state := 1;  key := ' ' end;   { 7000:3b91 }
             LoadCharacterIcon(0);                                                         { 7000:3ba7 }
           end;
        5: if prev = 2 then begin                                                  { 7000:3bb6  browse a part }
             if part = 'H' then begin                                              { 7000:3bc0 }
               if key = 'P' then begin if c^.icon_head > 0 then Dec(c^.icon_head) else c^.icon_head := 13 end   { 7000:3bd1 }
               else if key = 'N' then begin if c^.icon_head < 13 then Inc(c^.icon_head) else c^.icon_head := 0 end   { 7000:3bf5 }
               else if key = 'K' then begin cHead := SelectedChar^.icon_head;  state := prev;  key := ' ' end   { 7000:3c19 }
               else if key in ['E', #0] then begin c^.icon_head := cHead;  state := prev;  key := ' ' end;   { 7000:3c42 }
               LoadCharacterIcon(0);                                                       { 7000:3c5a }
             end
             else if part = 'W' then begin                                         { 7000:3c62 }
               if key = 'P' then begin if c^.icon_body > 0 then Dec(c^.icon_body) else c^.icon_body := $1F end   { 7000:3c70 }
               else if key = 'N' then begin if c^.icon_body < $1F then Inc(c^.icon_body) else c^.icon_body := 0 end   { 7000:3c94 }
               else if key = 'K' then begin cBody := SelectedChar^.icon_body;  state := prev;  key := ' ' end   { 7000:3cb8 }
               else if key in ['E', #0] then begin c^.icon_body := cBody;  state := prev;  key := ' ' end;   { 7000:3ce1 }
               LoadCharacterIcon(0);                                                       { 7000:3cf9 }
             end;
           end
           else if prev = 3 then begin                                             { 7000:3d01  browse a colour }
             lo := c^.icon_colours[slot-1] and $0F;                                { 7000:3d08 }
             hi := (c^.icon_colours[slot-1] and $F0) shr 4;                        { 7000:3d1c }
             if key = 'N' then begin
               if hiNib <> 0 then hi := (hi + 1) mod 16 else lo := (lo + 1) mod 16;   { 7000:3d3e / 3d56 }
               c^.icon_colours[slot-1] := hi shl 4 + lo;                           { 7000:3d66 }
             end
             else if key = 'P' then begin
               if hiNib <> 0 then hi := (hi - 1) and $0F else lo := (lo - 1) and $0F;   { 7000:3d91 / 3da5 }
               c^.icon_colours[slot-1] := hi shl 4 + lo;                           { 7000:3db1 }
             end
             else if key = 'K' then begin CopyBytes(c^.icon_colours, cColours, 6);  state := prev;  key := ' ' end   { 7000:3ded }
             else if key in ['E', #0] then begin CopyBytes(cColours, c^.icon_colours, 6);  state := prev;  key := ' ' end;   { 7000:3e18 }
           end;
      end;
    CopyIconSlot(c^.party_slot, 12, true);                                         { 7000:3e38  refresh the preview }
  until (prev = 1) and (key in [#0, 'E']);                                         { 7000:3e3b / 3e4d }
  c^.icon_head := cHead;  c^.icon_body := cBody;  c^.icon_size := cSize;           { 7000:3e57 .. 3e6d  keep only committed values }
  CopyBytes(cColours, c^.icon_colours, 6);                                         { 7000:3e8a }
  CopyIconSlot(c^.party_slot, 12, true);                                           { 7000:3ea0 }
  CopyIconSlot(12, c^.party_slot, false);                                          { 7000:3eb4  preview becomes the party icon }
  ClearMenuLine;                                                                   { 7000:3eb7 }
  FreeCombatIcon(12);                                                              { 7000:3ebf }
  if travel_Mode > 1 then begin                                                    { 7000:3ec4  overland: slots 11/12 hold the travel icons }
    LoadCombatIcon('ICON', 0, $0B);                                                { 7000:3ee0 }
    LoadCombatIcon('ICON', 1, $0C);                                                { 7000:3efa }
  end;
until AskYesNo('Is this icon ok? ', $0D, $0A, $0F) = 'Y';                          { 7000:3f17 / 3f1f }
PaletteFlashOff;                                                                   { 7000:3f28 }
```
Colour slots (from the letter → slot table and `IconColourSlot`): 1 Body (colours 1/9), 2 Arm (2/10), 3 Leg (3/11), 4 Hair = color-1 / Face = color-2 (4/12), 5 Shield (6/14), 6 Weapon (7/15); "color-1" edits the low nibble, "color-2" the high nibble of the chosen slot (names H from the menu strings, slot mapping H from 3AD4..3B1A).
{ quirk: the state-3 menu text is edited in place in the DS string table (Delete/Insert at position 13), so it keeps the last 'Hair'/'Face' across calls. }
{ quirk: keys in state 1 other than P/1/2/S/E/Esc are ignored; in state 3 any letter not in W B H F S A L (e.g. '1') selects slot 1 (Body) and enters state 5. }

### 7000:3F31 ConHpBonus (H)
`function ConHpBonus(c [BP+6]: ^TChar): ShortInt` — `RETF 4`. Callers: FUN_7000_1551, TrainCharacter, MinHitPoints, MaxHitPoints.
Total CON hit-point adjustment summed over the character's classes (AD&D CON table; fighters get the higher values).
```pascal
sum := 0;                                                                          { 7000:3f37 }
for cls := 0 to 7 do                                                               { 7000:3f44 }
  if c^.level[cls] > 0 then begin                                                  { 7000:3f56 }
    sum := sum + ConHpAdj{g_408E}[c^.con];                                         { 7000:3f69 }
    if (c^.con > 16) and (c^.class = 2) then sum := sum + 1;                       { 7000:3f73 / 3f7d }
    if (c^.con > 17) and (c^.class = 2) then sum := sum + 1;                       { 7000:3f8a / 3f94 }
  end;
ConHpBonus := sum;                                                                 { 7000:3fa4 }
```
{ quirk: the fighter extra (+3 at CON 17, +4 at CON 18) applies only to class 2 = pure Fighter, not to paladins, rangers or multi-class fighters. }

### 7000:3FB3 MinHitPoints (M)
`function MinHitPoints(c [BP+6]: ^TChar): Byte` — `RETF 4`. Callers: ModifyCharacter.
Smallest allowed max HP: one point per level (rangers and monks one more), plus the CON adjustment, averaged over the classes.
```pascal
n := 0;  sum := 0;                                                                 { 7000:3fc2 / 3fc6 }
for cls := 0 to 7 do                                                               { 7000:3fca }
  if c^.level[cls] > 0 then begin                                                  { 7000:3fdc }
    sum := sum + c^.level[cls];  n := n + 1;                                       { 7000:3fed / 3ff5 }
    if (cls = 4) or (cls = 7) then sum := sum + 1;                                 { 7000:3ffb / 4004  ranger, monk: 2 HD at level 1 }
  end;
adj := ConHpBonus(c);                                                              { 7000:4018 }
if adj < 0 then begin
  if sum > n + Abs(adj) then sum := (sum + adj) div n else sum := 1;               { 7000:4024 / 4041 / 405d }
end
else sum := (sum + adj) div n;                                                     { 7000:4063 }
MinHitPoints := sum;                                                               { 7000:407d }
```
(Byte arithmetic for `sum`; `n = 0` would be a division by zero — every character has ≥ 1 class.)

### 7000:408C MaxHitPoints (M)
`function MaxHitPoints(c [BP+6]: ^TChar): Byte` — `RETF 4`. Callers: ModifyCharacter.
Largest allowed max HP: maximum hit-die roll per level, plus the CON adjustment, averaged over the classes.
```pascal
n := 0;  sum := 0;                                                                 { 7000:409b / 409f }
for cls := 0 to 7 do                                                               { 7000:40a3 }
  if c^.level[cls] > 0 then begin                                                  { 7000:40b5 }
    n := n + 1;                                                                    { 7000:40c0 }
    case cls of
      0, 1: sum := sum + c^.level[cls] * 8;                                        { 7000:40ca / 40e7  cleric, druid d8 }
      2, 3: sum := sum + c^.level[cls] * 10;                                       { 7000:4104 / 4122  fighter, paladin d10 }
      4:    sum := sum + (c^.level[cls] + 1) * 8;                                  { 7000:413f  ranger 2d8 at level 1 }
      5:    sum := sum + c^.level[cls] * 4;                                        { 7000:415c  magic-user d4 }
      6:    sum := sum + c^.level[cls] * 6;                                        { 7000:4178  thief d6 }
      7:    sum := sum + (c^.level[cls] + 1) * 4;                                  { 7000:4198  monk 2d4 at level 1 }
    end;
  end;
adj := ConHpBonus(SelectedChar);                                                   { 7000:41c1 }
if adj < 0 then begin
  if sum > n + Abs(adj) then sum := (sum + adj) div n else sum := 1;               { 7000:41cd / 41ea / 4206 }
end
else sum := (sum + adj) div n;                                                     { 7000:420c }
MaxHitPoints := sum;                                                               { 7000:4226 }
```
{ quirk: the CON adjustment is taken from `SelectedChar`, not from the parameter `c` (all callers pass SelectedChar). `sum` is a byte (wraps above 255). }

### 7000:4235 RollHitDice (H)
`function RollHitDice(c [BP+8]: ^TChar; classBits [BP+6]: Byte): Byte` — `RETF 6`. Callers: FUN_7000_1551 (creation), TrainCharacter. Callees: Roll (ov24).
```pascal
sum := 0;                                                                          { 7000:423b }
for cls := 0 to 7 do                                                               { 7000:423f }
  if (c^.level[cls] > 0) and ((ClassTrainBits[cls] and classBits) <> 0) then begin { 7000:4251 / 425f }
    r := Roll(HitDiceCount{g_08B6}[cls], HitDieSides{g_08BE}[cls]);                { 7000:4280 }
    if (c^.level[cls] = 1) and (r < HitDieSides[cls] * 2 div 3) then               { 7000:4291 / 42a5 }
      r := HitDieSides[cls] * 2 div 3;                                             { 7000:42b8  level-1 minimum 2/3 of one die }
    sum := sum + r;                                                                { 7000:42cf }
  end;
RollHitDice := sum;                                                                { 7000:42de }
```
{ quirk: the level-1 floor uses the sides of one die (ranger/monk 2 dice are floored at 5 / 2). Classes sharing a bit (cleric/druid 2; paladin/ranger 0Ah overlap fighter 8) are all rolled when any of their bits is in `classBits`. }

### 7000:42ED PayGold (H)
`procedure PayGold(gold [BP+0Ah]: LongInt; c [BP+6]: ^TChar)` — `RETF 8`. Callers: TrainCharacter (1000 gp). Callees: @LongMul, @LongDivMod, @LongAbs.
Pays `gold` gold pieces from the character's coins, spending the smallest coins first, and returns change in the largest coins.
```pascal
due := gold * 200;                                                                 { 7000:42fe  in copper (CoinValue[3] = 200) }
i := 0;  p := c;                                                                   { 7000:4309 / 430d }
while due > 0 do begin                                                             { 7000:4316 }
  n := due div CoinValue[i] + 1;                                                   { 7000:4342 }
  if p^.money[i] < n then n := p^.money[i];                                        { 7000:435b / 4370 }
  due := due - n * CoinValue[i];                                                   { 7000:438f }
  p^.money[i] := p^.money[i] - n;                                                  { 7000:43a8 }
  i := i + 1;                                                                      { 7000:43ad }
end;
if due < 0 then begin                                                              { 7000:43b8  overpaid: give change }
  due := Abs(due);                                                                 { 7000:43d2 }
  i := 4;                                                                          { 7000:43dd  platinum first }
  while due > 0 do begin                                                           { 7000:43e1 }
    n := due div CoinValue[i];                                                     { 7000:4407 }
    due := due - n * CoinValue[i];                                                 { 7000:4426 }
    p^.money[i] := p^.money[i] + n;                                                { 7000:443f }
    i := i - 1;                                                                    { 7000:4444 }
  end;
end;
```
{ quirk: no bound on `i` — with too little money the first loop runs past platinum into gems/jewelry and beyond (CoinValue[5..] is unrelated data); callers check MoneyInGold first. }

### 7000:4454 ov16_init (H)
Empty unit initialiser (`push bp; mov bp,sp; pop bp; retf`), called from the main program's init chain.  { 7000:4454 }

---

## ov17 (seg 7500) — character roster, character / monster / NPC files, party list, save and load game (FINAL pseudocode, lane por-mod-party)

Unit: ov17, analysis segment 7500, 14 routines (functions.tsv): 7500:0010, 01B8, 02AE, 032F, 0482, 069E, 0AEC, 0EC4, 1262, 1446, 1602, 1D58, 22D5, 23E0 (init).
Stub entries (seg 007C): e0 init, e1 ReadCharList, e2 WriteCharList, e3 LoadCharacterIcon, e4 WriteCharacter, e5 ReadCharacter, e6 LoadMonster, e7 AddNpcToParty, e8 LoadGame, e9 SaveGame, e10 AddToParty, e11 CheckEclDisk (from the `CALLF … (via stub_ov17_eK)` comments in the caller listings).
Role: everything that moves a character record (TChar, 285 = 11Dh bytes, SAVES.md §3) between memory and disk: the roster file `charlist.txt`, roster characters `<name>.CHA/.ITM/.SPC`, saved-game members `CHRDAT<x><n>.SAV/.ITM/.SPC`, the game-state file `SAVGAM<x>.DAT` (SAVES.md §2), monster records `MON<n>CHA/SPC/ITM.DAX` (MONSTERS.md), adding a character / NPC to the party list, and the combat-icon (CHEAD/CBODY) composition of a party member.
Sources: `decode/listings/ov17.lst` (evidence; every statement below was written from it), `ov17.c` and `PARTY.draft.md ## ov17` (checklist only). CS literals: 7500:0000 `'charlist.txt'`, 000D `'* '`, 0197 `'charlist.txt'`, 01A4/029A/0680/0AC4/15BF/1D17 `'Put save disk in '`, 01B6/02AC/0692/0AD6/1D29 `':'`, 0476 `'CHEAD'`, 047C `'CBODY'`, 0674/0ADD/15EE/1D49 `'.cha'`, 0679/15E7/1D47 `'.'`, 067B/0AD8/15E9 `'.sav'`, 0694/0AE2/15F3/1D4E `'.itm'`, 0699/0AE7/15F8/1D53 `'.spc'`, 0E98 `'MON'`, 0E9C `'CHA'`, 0EA0 `'.dax'`, 0EA5 `'Unable to load monster'`, 0EBC `'SPC'`, 0EC0 `'ITM'`, 157F/1D0B `'savgam'`, 1586/1D12 `'.dat'`, 158B `' '`, 158D `'Load Which Game: '`, 15D1 `'Loading...Please Wait'`, 15FD `'ICON'`, 1CC5 `'Save Which Game: '`, 1CD7 `'A B C D E F G H I J'`, 1D2B `'Saving...Please Wait'`, 1D40 `'CHRDAT'`, 22B7 `'Save and exit  Insert disk #'`, 22D4 `''` (bytes read from decode/bin/ghidra/ov17.bin).

Conventions (as VIEW.pas.md / ENGINE.pas.md)
- **Signatures are in Pascal order**: first parameter = highest BP offset (pushed first); parameters as `name [BP+xx]`. Every call below was written from its PUSH sequence.
- `{ seg:off }` = first instruction of the statement (or of the call implementing it); `{ quirk: … }` = behaviour a faithful port must copy.
- Globals by GLOBALS.md / decode/names names (`SavePath` 537A, `DataPath` 547C, `DataSet` 5376, `NoDiskPrompt` 557C, `PartyHead` 5D96, `SelectedChar` 5D92, `ecl_Mem4900` 49D2, `ecl_Mem6B00` 49D6, `ecl_Mem9700` 49DA, `ecl_CodeBuf` 49DE, `party_MapX/Y/Dir` 6AAD/6AAE/6AAF, `travel_Mode` 49FA, `game_Mode` 49F3, `GameSpeed` 49E2, `opt_Portraits` 49F5, `opt_MonsterPics` 49F6, `VideoMode` 4A1E, `CombatIcons` 5E5A); names introduced here are written `Name{g_XXXX}` and listed in ov17_names.json / ov17_notes.md.
- TChar fields by SAVES.md §3 names (`c.name` +0, `c.race` +2Eh, `c.level[i]` +96h, `c.gender` +9Eh, `c.head_pic` +BBh, `c.body_pic` +BCh, `c.icon_head` +BDh, `c.icon_body` +BEh, `c.party_slot` +BFh, `c.icon_size` +C0h, `c.icon_colours[1..6]` +C1h..C6h, `c.items` +C8h, `c.effects` +7Fh, `c.next` +104h, `c.combatant` +108h); item record `.next` +2Ah (63 B), effect record `.next` +5 (9 B).
- `TMenuItem` (46 = 2Eh bytes, VIEW ov25): `+0 text: string[40]`, `+29h isHeader`, `+2Ah next`. The roster list read from charlist.txt is a TMenuItem list (freed with FreeMenuList, shown by VerticalListMenu in ov16).
- File I/O: TP `{$I-}` style — no IOCheck call follows Rewrite/Erase/BlockRead; IOResult is read explicitly where shown. `BlockWrite(f, buf, n)` = the RT call with a nil result pointer (pushes 0,0); `BlockRead(f, buf, n, got)` = with a result variable.
- Resident callees (ENGINE names): `FileExists{0802:02EB}(name)`, `OpenWithPrompt{0802:025D}(name, prompt, noPrompt, var f): Boolean`, `DeleteAll{0802:0356}(s, sub): String`, `MakeDosName{0802:0425}(s): String[40]` (removes ` . * , ? / \ : ; |`, first 8 chars, upper case), `LoadDaxRecord{0802:0716}(name, ext, id, var size, var p)`, `SetDataSet{0802:094A}(n)` / `RestoreDataSet{0802:095D}`, `ShowBottomPromptAndReadKey{0709:0BF5}(colour, s)` (row 24, waits for a key), `DrawText{0709:0626}(col, row, colour, s)`, `RecolorPicture{0464:1E5C}(fromCol, toCol, frame, randomMix, pic)`, `TerminateGame{0899:0000}`, `FUN_0899_0104` (disabled key flush, no effect).
- Overlay callees: `LoadCombatIcon{C000:01C8}(name, id, slot)`, `FreeCombatIcon{C000:014E}(slot)` (ov32), `HorizontalMenu{9D00:03BD}(prompt, options, promptColour [BP+12h], textColour [BP+10h], hotColour [BP+0Eh], allowExt, animate, var ext): Char`, `ClearMenuLine{9D00:06FB}`, `FreeMenuList{9D00:11F3}(var list)` (ov25), `Load3DMap{B100:10C7}(id)`, `LoadWallSet{B100:0E08}(id, slot)` (ov29), `RecolourOverlandTiles{7A00:06B3}(flag)` (ov18), `UpdateLevelStats{9300:0000}(c)` (ov23), `Roll{9800:0DE3}(count, sides): Byte` (ov24).

---

### 7500:0010 ReadCharList (H)
`procedure ReadCharList(var list [BP+6]: ^TMenuItem)` — RETF 4. Callers: WriteCharacter (7500:06C8), ov16 AddCharacterMenu "Add a character" (7000:308A, stub e1). Callees: EnsureSaveDir, FileExists, AssignText/ResetText/EofText/@ReadStr/@ReadLn/CloseText, GetMem, FillChar, @StrCompare.
Reads `SavePath + 'charlist.txt'` (one character name per line) into a new TMenuItem list; a name that equals the name of a character already in the party gets the prefix `'* '` (such entries are not selectable in ov16 and are dropped by WriteCharList). Name: H (literal 'charlist.txt', the list is written back by WriteCharList, its entries are the roster names).
```pascal
list := nil;                                                        { 7500:0017 }
EnsureSaveDir;                                                      { 7500:0024 }
if not FileExists(SavePath + 'charlist.txt') then Exit;            { 7500:0027 .. 004a }
Assign(t, SavePath + 'charlist.txt');                               { 7500:004d  AssignText }
Reset(t);                                                           { 7500:0072  ResetText }
while not Eof(t) do begin                                           { 7500:007d }
  GetMem(node, $2E);                                                { 7500:008f }
  FillChar(node^, $2E, 0);                                          { 7500:009e }
  if list = nil then begin list := node; last := list end           { 7500:00af / 00bb }
  else begin last^.next := node; last := last^.next end;            { 7500:00dd }
  ReadLn(t, last^.text);                                            { 7500:00ff  @ReadStr max 40, @ReadLn }
  p := PartyHead;                                                   { 7500:0118 }
  while (p <> nil) and (p^.name <> last^.text) do p := p^.next;     { 7500:0125 .. 0151  @StrCompare(p^.name, last^.text) }
  if p <> nil then last^.text := '* ' + last^.text;                 { 7500:0153 .. 017e  StrAssign max 40 }
end;
Close(t);                                                           { 7500:0186 }
```

### 7500:01B8 WriteCharList (H)
`procedure WriteCharList(list [BP+6]: ^TMenuItem)` — RETF 4. Callers: WriteCharacter (7500:0779), ov16 AddCharacterMenu (7000:327E, stub e2). Callees: EnsureSaveDir, AssignText/RewriteText/IOResult, ShowBottomPromptAndReadKey, @WriteStr/@WriteLn, CloseText.
```pascal
EnsureSaveDir;                                                      { 7500:01bf }
repeat
  Assign(t, SavePath + 'charlist.txt');                             { 7500:01c3 }
  Rewrite(t);                                                       { 7500:01e8  RewriteText }
  err := IOResult;                                                  { 7500:01f3 }
  if err <> 0 then
    ShowBottomPromptAndReadKey($0E, 'Put save disk in ' + SavePath[1] + ':');   { 7500:0203  SaveDrive = g_537B }
until err = 0;                                                      { 7500:0239 }
node := list;                                                       { 7500:0240 }
while node <> nil do begin                                          { 7500:024c }
  if node^.text[1] <> '*' then WriteLn(t, node^.text);              { 7500:0254 / 025e  @WriteStr width 0, @WriteLn }
  node := node^.next;                                               { 7500:0276 }
end;
Close(t);                                                           { 7500:0289 }
```
Note: the `'*'` test is on the first character (`byte [node+1]`), i.e. exactly the entries ReadCharList prefixed with `'* '`; characters taken into the party leave the roster file until they are written back (WriteCharacter with an empty name re-appends them).

### 7500:02AE EnsureSaveDir (M)
`procedure EnsureSaveDir` — RETF. Callers: ReadCharList, WriteCharList, WriteCharacter, LoadGame (twice), SaveGame. Callees: Copy, MkDir, IOResult, ShowBottomPromptAndReadKey.
Creates the save directory and repeats a disk prompt until MkDir succeeds or reports error 5 (access denied = the directory already exists). Name M (behaviour; `SavePath` ends with `'\'`, which the Copy strips).
```pascal
repeat
  MkDir(Copy(SavePath, 1, Length(SavePath) - 1));                   { 7500:02b5 .. 02d0 }
  err := IOResult;                                                  { 7500:02d5 }
  if (err <> 0) and (err <> 5) then
    ShowBottomPromptAndReadKey($0E, 'Put save disk in ' + SavePath[1] + ':');   { 7500:02e9 }
until (err = 0) or (err = 5);                                       { 7500:031f }
```

### 7500:032F OverlayIconPicture (M)
`procedure OverlayIconPicture(src [BP+0Ah], dst [BP+6]: PPicture)` — RETF 8. Caller: LoadCharacterIcon (7500:0546, 056A). Uses TPicture fields (ENGINE): `+11h frameSize`, `+13h mask`, `+17h pixels`.
Merges a head icon picture onto a body icon picture: pixel bytes are OR-ed, mask bytes AND-ed (a pixel stays transparent only where both are transparent). Name M (behaviour).
```pascal
if (VideoMode = 0) or (VideoMode = 2) then begin                    { 7500:0335 }
  for i := 0 to src^.frameSize - 1 do begin                         { 7500:0343 }
    dst^.pixels[i] := dst^.pixels[i] or src^.pixels[i];             { 7500:035d }
    dst^.mask^[i] := dst^.mask^[i] and src^.mask^[i];               { 7500:0385  one mask byte per data byte }
  end;
end else if VideoMode = 1 then begin                                { 7500:03c1 }
  for i := 0 to src^.frameSize - 1 do
    dst^.pixels[i] := dst^.pixels[i] or src^.pixels[i];             { 7500:03c8 }
  for i := 0 to (CombatIcons[11].pose0^.frameSize shr 2) - 1 do     { 7500:0412  g_5EB2^ +11h, quirk: global, not src }
    dst^.mask^[i] := dst^.mask^[i] and src^.mask^[i];               { 7500:0437  EGA: 1 mask byte per 4 data bytes }
end;
```
{ quirk: the EGA mask length comes from `g_5EB2` (= CombatIcons slot 11, pose 0) for both calls; both calls pass a slot-11 picture as `src`, so the size matches. }

### 7500:0482 LoadCharacterIcon (H)
`procedure LoadCharacterIcon(recolour [BP+6]: Boolean)` — RETF 2. Acts on `SelectedChar`. Callers: AddNpcToParty (7500:141D, `True`), LoadGame (7500:1B99, `True`), ov16 (stub e3: 7000:3192 and 9 more sites). Callees: SetDataSet, LoadCombatIcon, OverlayIconPicture, RecolorPicture, FreeCombatIcon, RestoreDataSet, FUN_0899_0104.
Builds the two combat-icon poses of the selected character in its slot `c.party_slot`: the body (CBODY) is loaded into the slot, the head (CHEAD) into the scratch slot 11 and merged on top; with `recolour` the six user colours of the icon are applied. Name H (strings CHEAD/CBODY, slot = party_slot, CombatIcons).
```pascal
SetDataSet(3);                                                      { 7500:0489 }
c := SelectedChar;                                                  { 7500:0491 }
LoadCombatIcon('CHEAD' + IconSizeLetter{g_08C5}[c^.icon_size], c^.icon_head, 11);   { 7500:049b .. 04d8  'S' (1) / 'T' (2) }
LoadCombatIcon('CBODY' + IconSizeLetter[c^.icon_size], c^.icon_body, c^.party_slot);   { 7500:04dd .. 0520 }
OverlayIconPicture(CombatIcons[11].pose0{g_5EB2}, CombatIcons[c^.party_slot].pose0);   { 7500:0525 .. 0546 }
OverlayIconPicture(CombatIcons[11].pose1{g_5EB6}, CombatIcons[c^.party_slot].pose1);   { 7500:0549 .. 056a }
if recolour then begin                                              { 7500:056d }
  for k := 0 to 15 do begin fromCol[k] := k; toCol[k] := k end;     { 7500:0576  locals [BP-13h], [BP-23h] }
  for i := 1 to 6 do begin                                          { 7500:059f }
    toCol[IconColourSlot{g_3CF5}[i]] := c^.icon_colours[i] and $0F;           { 7500:05a8 }
    toCol[IconColourSlot[i] + 8] := c^.icon_colours[i] shr 4;                 { 7500:05cd }
  end;
  RecolorPicture(fromCol, toCol, 0, False, CombatIcons[c^.party_slot].pose0);  { 7500:0602 .. 062a }
  RecolorPicture(fromCol, toCol, 0, False, CombatIcons[c^.party_slot].pose1);  { 7500:062f .. 0657 }
end;
FreeCombatIcon(11);                                                 { 7500:065c }
RestoreDataSet;                                                     { 7500:0664 }
FUN_0899_0104;                                                      { 7500:0669 }
```
Tables (image bytes, H): `IconSizeLetter` DS:08C5 = `04 'S' 'T'` (index 1 = small, 2 = large; LoadCombatIcon adds 40h to the id for a trailing `'T'`); `IconColourSlot` DS:3CF5[1..6] = `1 2 3 4 6 7` — colour pair k of the icon maps EGA colours `slot` and `slot+8` (default record bytes `91 A2 B3 C4 E6 F7` = identity).
`CombatIcons[s].pose0/pose1` = DS:5E5A + s*8 / + s*8 + 4 (VIEW ov32).

### 7500:069E WriteCharacter (H)
`procedure WriteCharacter(var c [BP+0Ah]: TChar; name [BP+6]: string[8])` — RETF 8. Callers: SaveGame (7500:213E, name = `'CHRDAT' + game letter + Str(n)`), ov16 (7000:03E9 with `''` from 7000:00E2 and 7000:1EAD with `''` from 7000:04FE — roster saves, stub e4). Callees: ReadCharList, WriteCharList, FreeMenuList, EnsureSaveDir, DeleteAll, MakeDosName, AssignFile/RewriteFile/IOResult/BlockWrite/CloseFile/Erase, FileExists, ShowBottomPromptAndReadKey, GetMem, FillChar.
`name = ''` → roster character `SavePath + MakeDosName(c.name) + '.cha'` (and the name is appended to charlist.txt); otherwise saved-game member `SavePath + name + '.sav'`. Then the item and effect lists go to `.itm` / `.spc` (SAVES.md §1, H).
```pascal
nm := name;                                                         { 7500:06a5  string[8] }
if nm = '' then begin                                               { 7500:06b8 }
  ReadCharList(list);                                               { 7500:06c1 }
  last := list;                                                     { 7500:06cb }
  if last <> nil then
    while last^.next <> nil do last := last^.next;                  { 7500:06e5 }
  GetMem(node, $2E);                                                { 7500:0709 }
  FillChar(node^, $2E, 0);                                          { 7500:071a }
  node^.text := c.name;                                             { 7500:072c  StrAssign max 40 }
  if last <> nil then last^.next := node else list := node;         { 7500:0740 / 0760 }
  WriteCharList(list);                                              { 7500:0770 }
  FreeMenuList(list);                                               { 7500:077c }
  ext := '.cha';                                                    { 7500:0787 }
  base := SavePath + MakeDosName(DeleteAll(c.name, '.'));           { 7500:079b .. 07e5  StrAssign max 40 }
end else begin
  EnsureSaveDir;                                                    { 7500:07ec }
  ext := '.sav';                                                    { 7500:07f0 }
  base := SavePath + nm;                                            { 7500:0804 }
end;
repeat
  Assign(f, base + ext);                                            { 7500:082d }
  Rewrite(f, 1);                                                    { 7500:0854 }
  err := IOResult;                                                  { 7500:0863 }
  if err <> 0 then
    ShowBottomPromptAndReadKey($0E, 'Put save disk in ' + SavePath[1] + ':');   { 7500:0873 }
until err = 0;                                                      { 7500:08a9 }
BlockWrite(f, c, $11D);                                             { 7500:08b3  the 285-byte record, raw (stale pointers included) }
Close(f);                                                           { 7500:08cb }
if FileExists(base + '.itm') then begin                             { 7500:08d6 }
  Assign(f, base + '.itm'); Erase(f);                               { 7500:08fa / 0920 }
end;
if c.items <> nil then begin                                        { 7500:092b }
  Assign(f, base + '.itm'); Rewrite(f, 1);                          { 7500:093d / 0963 }
  it := c.items;                                                    { 7500:0972 }
  while it <> nil do begin                                          { 7500:0987 }
    BlockWrite(f, it^, $3F);                                        { 7500:0991 }
    it := it^.next;                                                 { 7500:09aa  +2Ah }
  end;
  Close(f);                                                         { 7500:09c0 }
end;
if FileExists(base + '.spc') then begin                             { 7500:09cb }
  Assign(f, base + '.spc'); Erase(f);                               { 7500:09ef / 0a15 }
end;
if c.effects <> nil then begin                                      { 7500:0a20 }
  Assign(f, base + '.spc'); Rewrite(f, 1);                          { 7500:0a31 / 0a57 }
  e := c.effects;                                                   { 7500:0a66 }
  while e <> nil do begin                                           { 7500:0a7a }
    BlockWrite(f, e^, 9);                                           { 7500:0a84 }
    e := e^.next;                                                   { 7500:0a9d  +5 }
  end;
  Close(f);                                                         { 7500:0ab3 }
end;
```
{ quirk: the roster branch does not call EnsureSaveDir itself (ReadCharList/WriteCharList do); the `.itm/.spc` Rewrites are not checked. `DeleteAll(c.name,'.')` is redundant (MakeDosName also removes '.'). }

### 7500:0AEC ReadCharacter (H)
`procedure ReadCharacter(name [BP+0Eh]: String; var c [BP+0Ah]: TChar; isSav [BP+8], inSaveDir [BP+6]: Boolean)` — RETF 0Ch. Callers: LoadGame (7500:19D7: `(fn, c^, True, True)`), ov16 AddCharacterMenu "Add a character" (7000:313F: `(node^.text, c^, False, True)`, stub e5; it then marks the list entry with `'* '`, CS 7000:306A). Callees: MakeDosName, OpenWithPrompt, BlockRead, CloseFile, FileExists, GetMem, EofFile, FUN_0899_0104.
```pascal
nm := name;                                                         { 7500:0af3  string[255] }
if inSaveDir then begin                                             { 7500:0b07 }
  nm := SavePath + MakeDosName(nm);                                 { 7500:0b0d .. 0b3d }
  prompt := 'Put save disk in ' + SavePath[1] + ':';                { 7500:0b42 .. 0b7a  string[40] }
end else
  prompt := DiskPromptText{g_2614}[DataSet] + DataPath[1] + ':';        { 7500:0b81 .. 0bc6  "Insert disk n in drive " + DataDrive g_547D }
if isSav then ext := '.sav' else ext := '.cha';                     { 7500:0bcb / 0be7 }
ok := OpenWithPrompt(nm + ext, prompt, False, f);                   { 7500:0bfb .. 0c26 }
BlockRead(f, c, $11D, got);                                         { 7500:0c2f }
Close(f);                                                           { 7500:0c49 }
c.next := nil;                                                      { 7500:0c54 }
c.items := nil;                                                     { 7500:0c63 }
c.effects := nil;                                                   { 7500:0c72 }
c.combatant := nil;                                                 { 7500:0c80 }
if FileExists(nm + '.itm') then begin                               { 7500:0c8f }
  GetMem(c.items, $3F);                                             { 7500:0cb6 }
  it := c.items;                                                    { 7500:0ccc }
  ok := OpenWithPrompt(nm + '.itm', prompt, False, f);              { 7500:0ce1 .. 0d0b }
  repeat
    BlockRead(f, it^, $3F, got);                                    { 7500:0d14 }
    it^.next := nil;                                                { 7500:0d2f }
    if not Eof(f) then begin                                        { 7500:0d3d }
      GetMem(it^.next, $3F);                                        { 7500:0d4c }
      it := it^.next;                                               { 7500:0d61 }
    end;
  until Eof(f);                                                     { 7500:0d75 }
  Close(f);                                                         { 7500:0d84 }
end;
if FileExists(nm + '.spc') then begin                               { 7500:0d8f }
  GetMem(c.effects, 9);                                             { 7500:0db6 }
  e := c.effects;                                                   { 7500:0dcb }
  ok := OpenWithPrompt(nm + '.spc', prompt, False, f);              { 7500:0ddf .. 0e09 }
  repeat
    BlockRead(f, e^, 9, got);                                       { 7500:0e12 }
    e^.next := nil;                                                 { 7500:0e2d }
    if not Eof(f) then begin GetMem(e^.next, 9); e := e^.next end;  { 7500:0e3b / 0e4a }
  until Eof(f);                                                     { 7500:0e73 }
  Close(f);                                                         { 7500:0e82 }
end;
FUN_0899_0104;                                                      { 7500:0e8d }
```
{ quirk: an empty `.itm`/`.spc` file still yields one node with uninitialised contents (GetMem is not cleared, BlockRead reads 0 bytes); WriteCharacter never writes such a file. `ok` is never tested. The `inSaveDir = False` branch (data-disk character files) has no caller in this build. }

### 7500:0EC4 LoadMonster (H)
`procedure LoadMonster(id [BP+0Ah]: Byte; var c [BP+6]: TChar)` — RETF 6. Callers: AddNpcToParty (7500:1291), ecl_LoadMonsterRec (4300:0444, stub e6). Callees: @StrLong, LoadDaxRecord, ShowBottomPromptAndReadKey, TerminateGame, Move, Roll, FreeMem, GetMem, FUN_0899_0104. Name H (string "Unable to load monster"; MONSTERS.md).
```pascal
Str(DataSet:0, n);                                                  { 7500:0ecb  string[1] }
LoadDaxRecord('MON' + n + 'CHA', '.dax', id, size, p);              { 7500:0ee5 .. 0f27 }
if size = 0 then begin                                              { 7500:0f2c }
  ShowBottomPromptAndReadKey($0F, 'Unable to load monster');        { 7500:0f32 }
  TerminateGame;                                                    { 7500:0f49 }
end;
Move(p^, c, $11D);                                                  { 7500:0f4e }
c.items := nil;                                                     { 7500:0f6a }
c.effects := nil;                                                   { 7500:0f79 }
c.next := nil;                                                      { 7500:0f87 }
c.combatant := nil;                                                 { 7500:0f96 }
case c.race of                                                      { 7500:0fa5 }
  1, 3, 5:    c.icon_size := 1;                                     { 7500:0fb8 }
  2, 4, 6, 7: c.icon_size := 2;                                     { 7500:0fd3 }
end;                                                                { race 0 (monster): icon_size unchanged }
for i := 1 to 3 do begin                                            { 7500:0fdc }
  r := Roll(1, 6);                                                  { 7500:0fe5 }
  c.icon_colours[i] := ((r + 8) shl 4) + r;                         { 7500:0ff3  random colour pair r / r+8 }
end;
c.icon_colours[4] := $C4;                                           { 7500:1020 }
for i := 5 to 6 do begin                                            { 7500:1029 }
  r := Roll(1, 6);                                                  { 7500:1032 }
  c.icon_colours[i] := ((r + 8) shl 4) + r;                         { 7500:1040 }
end;
FreeMem(p, size);                                                   { 7500:106d }
NoDiskPrompt := True;                                               { 7500:107b  SPC/ITM records are optional: no disk prompt when missing }
LoadDaxRecord('MON' + n + 'SPC', '.dax', id, size, p);              { 7500:1080 .. 10c2 }
if size <> 0 then begin                                             { 7500:10c7 }
  ofs := 0;                                                         { 7500:10d0 }
  GetMem(c.effects, 9);  e := c.effects;                            { 7500:10d5 / 10ea }
  repeat
    Move(p^[ofs], e^, 9);                                           { 7500:10fc }
    e^.next := nil;                                                 { 7500:1114 }
    ofs := ofs + 9;                                                 { 7500:1121 }
    if ofs < size then begin GetMem(e^.next, 9); e := e^.next end;  { 7500:1125 / 112d }
  until ofs >= size;                                                { 7500:1152 }
  FreeMem(p, size);                                                 { 7500:115a }
end;
LoadDaxRecord('MON' + n + 'ITM', '.dax', id, size, p);              { 7500:1168 .. 11aa }
if size <> 0 then begin                                             { 7500:11af }
  ofs := 0;                                                         { 7500:11b8 }
  GetMem(c.items, $3F);  it := c.items;                             { 7500:11bd / 11d3 }
  repeat
    Move(p^[ofs], it^, $3F);                                        { 7500:11e6 }
    it^.next := nil;                                                { 7500:11fe }
    ofs := ofs + $3F;                                               { 7500:120b }
    if ofs < size then begin GetMem(it^.next, $3F); it := it^.next end;   { 7500:120f / 1217 }
  until ofs >= size;                                                { 7500:123c }
  FreeMem(p, size);                                                 { 7500:1244 }
end;
NoDiskPrompt := False;                                              { 7500:1252 }
FUN_0899_0104;                                                      { 7500:1257 }
```

### 7500:1262 AddNpcToParty (M)
`procedure AddNpcToParty(id [BP+6]: Byte)` — RETF 2. Caller: ecl_op36_AddNpc (2F00:2B97, stub e7). Callees: GetMem, LoadMonster, Random, Roll, AddToParty, LoadCharacterIcon.
Loads monster record `id` as a new party member (max 8), gives it a random portrait chosen by one of its classes and its gender, and builds its combat icon. Name M (ECL op 36 ADD_NPC, AddToParty).
```pascal
if ecl_Mem6B00^.w[$67C] > 7 then Exit;                              { 7500:1268  party member count }
GetMem(c, $11D);                                                    { 7500:1277 }
LoadMonster(id, c^);                                                { 7500:1286 }
c^.unk_AB := Random(256);                                           { 7500:129d  TChar +ABh (SAVES.md: unknown) }
n := 0;                                                             { 7500:12ae }
for i := 0 to 6 do                                                  { 7500:12b2 }
  if ShortInt(c^.level[i]) > 0 then begin n := n + 1; cls[n] := i end;   { 7500:12bb  signed test; monk (7) not considered }
if n = 0 then begin n := 1; cls[1] := 2 end;                        { 7500:12e2  default: fighter }
n := Roll(1, n);                                                    { 7500:12f7 }
case cls[n] of                                                      { 7500:1306 }
  0: c^.body_pic := NpcBodyCleric{g_08D7}[c^.gender*5 + Roll(1, 5)];        { 7500:1314 }
  5: c^.body_pic := NpcBodyMagicUser{g_08EB}[c^.gender*5 + Roll(1, 5)];     { 7500:134b }
  6: c^.body_pic := NpcBodyThief{g_08F5}[c^.gender*5 + Roll(1, 5)];         { 7500:1381 }
else c^.body_pic := NpcBodyFighter{g_08E1}[c^.gender*5 + Roll(1, 5)];       { 7500:13b3 }
end;
c^.head_pic := NpcHead{g_08C7}[c^.gender*8 + Roll(1, 8)];           { 7500:13e3 }
AddToParty(c);                                                      { 7500:140f }
LoadCharacterIcon(True);                                            { 7500:1419  AddToParty made c the SelectedChar }
```
Tables (image bytes, H; index = gender*5 + 1..5 resp. gender*8 + 1..8): heads male `1 2 3 4 5 8 11 12`, female `6 7 9 10 13 14 6 7`; bodies cleric M `2 4 2 4 2` F `2 4 8 2 4`, fighter/other M `1 3 4 5 6` F `7 9 11 7 9`, magic-user M `2 2 2 2 2` F `8 10 12 8 10`, thief M `6 6 6 6 6` F `8 10 8 10 8`. (`c^.gender` is read with CBW, i.e. signed.)

### 7500:1446 AddToParty (H)
`procedure AddToParty(c [BP+6]: ^TChar)` — RETF 4. Callers: AddNpcToParty, LoadGame (7500:19E3), ov16 "Add a character" (7000:318A, 7000:322B, stub e10). Callees: FillChar, @SetIn, UpdateLevelStats.
Appends `c` to the party list, makes it the selected character, gives it the lowest free party slot 0..7 and counts it. Name H.
```pascal
c^.party_slot := $FF;                                               { 7500:144c }
if PartyHead = nil then begin                                       { 7500:1455 }
  PartyHead := c;                                                   { 7500:145e }
  SelectedChar := c;                                                { 7500:146b }
end else begin
  p := PartyHead;                                                   { 7500:147a }
  while p^.next <> nil do p := p^.next;                             { 7500:1487 }
  p^.next := c;                                                     { 7500:14ab }
end;
FillChar(used, 8, 0);                                               { 7500:14be  used: array[0..7] of Boolean }
p := PartyHead;                                                     { 7500:14cf }
while p <> nil do begin                                             { 7500:14dc }
  if p^.party_slot in [0..7] then used[p^.party_slot] := True;      { 7500:14e4  set CS:1426 = [0..7] }
  p := p^.next;                                                     { 7500:1509 }
end;
SelectedChar := c;                                                  { 7500:151e }
c^.party_slot := 0;                                                 { 7500:1535 }
while (c^.party_slot < 8) and used[c^.party_slot] do
  c^.party_slot := c^.party_slot + 1;                               { 7500:153e .. 155e }
ecl_Mem6B00^.w[$67C] := ecl_Mem6B00^.w[$67C] + 1;                   { 7500:1565  party member count }
UpdateLevelStats(c);                                                { 7500:156e }
```

### 7500:1602 LoadGame (H)
`procedure LoadGame` — RETF. Callers: PartyCreationMenu main menu (7000:0406, stub e8). Callees: EnsureSaveDir, FileExists, @CharToStr, HorizontalMenu, @SetIn, OpenWithPrompt, ClearMenuLine, DrawText, BlockRead, CloseFile, DeleteAll, MakeDosName, GetMem, ReadCharacter, AddToParty, AssignFile, Erase, LoadCharacterIcon, Load3DMap, LoadCombatIcon, LoadWallSet, RecolourOverlandTiles, FUN_0899_0104. Record layout: SAVES.md §2 (H, matches the read order).
```pascal
EnsureSaveDir;                                                      { 7500:1609 }
opts := '';                                                         { 7500:160d  string[20] }
for key := 'A' to 'J' do                                            { 7500:1612 }
  if FileExists(SavePath + 'savgam' + key + '.dat') then           { 7500:161d .. 1656 }
    opts := opts + key + ' ';                                       { 7500:165f .. 1699 }
if opts = '' then Exit;                                             { 7500:16a8 }
repeat
  key := HorizontalMenu('Load Which Game: ', opts, $0D, $0A, $0F, False, False, ext);   { 7500:16b2 .. 16dd }
until ((key in ['A'..'J']) and FileExists(SavePath + 'savgam' + key + '.dat')) or (key = #0);   { 7500:16e6 .. 1739  set CS:159F }
if key = #0 then Exit;                                              { 7500:1743  Esc }
ok := OpenWithPrompt(SavePath + 'savgam' + key + '.dat', 'Put save disk in ' + SavePath, True, f);   { 7500:174d .. 17a9  noPrompt }
ClearMenuLine;                                                      { 7500:17b2 }
DrawText(0, 24, $0A, 'Loading...Please Wait');                      { 7500:17b7 .. 17d0 }
BlockRead(f, DataSet, 1, got);                                      { 7500:17d5 }
BlockRead(f, ecl_Mem4900^, $800, got);                              { 7500:17ef }
BlockRead(f, ecl_Mem6B00^, $800, got);                              { 7500:180a }
BlockRead(f, ecl_Mem9700^, $400, got);                              { 7500:1825 }
BlockRead(f, ecl_CodeBuf^, $1E00, got);                             { 7500:1840 }
BlockRead(f, party_MapX, 5, got);                                   { 7500:185b  6AAD..6AB1: x, y, dir, passage, attr }
BlockRead(f, travel_Mode, 1, got);                                  { 7500:1875 }
BlockRead(f, game_Mode, 1, got);                                    { 7500:188f }
BlockRead(f, count, 1, got);                                        { 7500:18a9 }
BlockRead(f, names[1], $148, got);                                  { 7500:18c4  names: array[1..8] of string[40] }
Close(f);                                                           { 7500:18df }
opt_MonsterPics := ecl_Mem4900^.w[$1FE] shr 1;                      { 7500:18ea }
opt_Portraits := ecl_Mem4900^.w[$1FE] and 1;                        { 7500:18f8 }
GameSpeed := ecl_Mem4900^.b[$1F8];                                  { 7500:1907 }
ecl_Mem6B00^.w[$67C] := 0;                                          { 7500:1913  party count, rebuilt by AddToParty }
for i := 1 to count do begin                                        { 7500:191e }
  fn := MakeDosName(DeleteAll(names[i], '.'));                      { 7500:193b .. 197e  string[40] }
  if FileExists(SavePath + fn + '.sav') then begin                  { 7500:1983 .. 19a8 }
    GetMem(c, $11D);                                                { 7500:19b1 }
    ReadCharacter(fn, c^, True, True);                              { 7500:19c2 }
    AddToParty(c);                                                  { 7500:19da }
    EnsureSaveDir;                                                  { 7500:19e6 }
  end;
end;
{ the loaded members are removed from the roster: their .CHA/.ITM/.SPC files are erased }
p := PartyHead;                                                     { 7500:19f7 }
while p <> nil do begin                                             { 7500:1a06 }
  fn := SavePath + MakeDosName(DeleteAll(p^.name, '.'));            { 7500:1a13 .. 1a5e }
  if FileExists(fn + '.cha') then begin                             { 7500:1a63 }
    Assign(f, fn + '.cha'); Erase(f);                               { 7500:1a8a / 1ab0 }
    if FileExists(fn + '.itm') then begin Assign(f, fn + '.itm'); Erase(f) end;   { 7500:1abb / 1adf / 1b05 }
    if FileExists(fn + '.spc') then begin Assign(f, fn + '.spc'); Erase(f) end;   { 7500:1b10 / 1b34 / 1b5a }
  end;
  p := p^.next;                                                     { 7500:1b65 }
end;
SelectedChar := PartyHead;                                          { 7500:1b7e }
while SelectedChar <> nil do begin                                  { 7500:1b8c }
  LoadCharacterIcon(True);                                          { 7500:1b95 }
  SelectedChar := SelectedChar^.next;                               { 7500:1b9c }
end;
SelectedChar := PartyHead;                                          { 7500:1bb3 }
DataSet := ecl_Mem6B00^.b[$624];                                    { 7500:1bc1 }
if travel_Mode < 2 then Load3DMap(ecl_Mem4900^.b[$18A]);            { 7500:1bcd / 1bde }
if travel_Mode > 1 then
  LoadCombatIcon('ICON', 0, 11)                                     { 7500:1be3 .. 1c00 }
else
  for i := 1 to 3 do begin                                          { 7500:1c08 }
    g_6AAE[i*4] := ecl_Mem4900^.w[$3F2 + 2*i];                      { 7500:1c13  wall-set id of slot i (Mem4900 +3F4/+3F6/+3F8) }
    g_6AB0[i*4] := ecl_Mem4900^.w[$3F8 + 2*i];                      { 7500:1c39  its slot number (+3FA/+3FC/+3FE) }
    if Integer(g_6AAE[i*4]) >= 0 then
      LoadWallSet(Lo(g_6AAE[i*4]), Lo(g_6AB0[i*4]));                { 7500:1c63 .. 1c94 }
  end;
if ecl_Mem4900^.w[$344] <> 0 then RecolourOverlandTiles(0);         { 7500:1ca3 / 1cb2 }
FUN_0899_0104;                                                      { 7500:1cb7 }
ClearMenuLine;                                                      { 7500:1cbc }
```
Addressing note: the code computes `ecl_Mem4900 + (4AF9h + i)*2 + 6E00h` (16-bit wrap) = byte offset `3F2h + 2i`, and `(4AFCh + i)*2 + 6E00h` = `3F8h + 2i` (H, arithmetic). `g_6AAE[i*4]`/`g_6AB0[i*4]` (i = 1..3 → DS:6AB2/6AB4, 6AB6/6AB8, 6ABA/6ABC) is the wall-set slot table written by LoadWallSet (VIEW: `g_6AAE[slot*4] := id`, `g_6AB0[slot*4] := slot`).
{ quirk: the open prompt is `'Put save disk in ' + SavePath` (whole path, no ':') but is never shown (noPrompt = True); `ok` is not tested. A member whose `.sav` is missing is silently skipped. }

### 7500:1D58 SaveGame (H)
`procedure SaveGame` — RETF. Callers: CheckEclDisk (7500:23D2), PartyCreationMenu (7000:0431, 7000:049F, stub e9), ov15 (6B00:1F4C), HeapErrorHandler (2000:0070). Callees: HorizontalMenu, @SetIn, EnsureSaveDir, AssignFile/RewriteFile/IOResult, ShowBottomPromptAndReadKey, ClearMenuLine, DrawText, BlockWrite, @StrLong, WriteCharacter, DeleteAll, MakeDosName, FileExists, Erase, CloseFile.
```pascal
repeat
  key := HorizontalMenu('Save Which Game: ', 'A B C D E F G H I J', $0D, $0A, $0F,
                        False, game_Mode = 2, ext);                 { 7500:1d5f .. 1d9c  animate the picture in mode 2 }
until key in [#0, 'A'..'J'];                                        { 7500:1da5  set CS:1CEB }
if key = #0 then Exit;                                              { 7500:1db6 }
EnsureSaveDir;                                                      { 7500:1dc0 }
repeat
  Assign(f, SavePath + 'savgam' + key + '.dat');                    { 7500:1dc4 .. 1e03 }
  Rewrite(f, 1);                                                    { 7500:1e08 }
  err := IOResult;                                                  { 7500:1e17 }
  if err <> 0 then
    ShowBottomPromptAndReadKey($0E, 'Put save disk in ' + SavePath[1] + ':');   { 7500:1e27 }
until err = 0;                                                      { 7500:1e5d }
ClearMenuLine;                                                      { 7500:1e67 }
DrawText(0, 24, $0A, 'Saving...Please Wait');                       { 7500:1e6c .. 1e85 }
for i := 1 to 3 do begin                                            { 7500:1e8a }
  ecl_Mem4900^.w[$3F2 + 2*i] := g_6AAE[i*4];                        { 7500:1e95  wall-set id }
  ecl_Mem4900^.w[$3F8 + 2*i] := g_6AB0[i*4];                        { 7500:1ebb  wall-set slot }
end;
ecl_Mem4900^.w[$1F8] := GameSpeed;                                  { 7500:1ee8 }
ecl_Mem4900^.w[$1FE] := opt_MonsterPics * 2 + opt_Portraits;        { 7500:1ef6 }
ecl_Mem6B00^.w[$624] := DataSet;                                    { 7500:1f0f }
BlockWrite(f, DataSet, 1);                                          { 7500:1f1d }
BlockWrite(f, ecl_Mem4900^, $800);                                  { 7500:1f35 }
BlockWrite(f, ecl_Mem6B00^, $800);                                  { 7500:1f4e }
BlockWrite(f, ecl_Mem9700^, $400);                                  { 7500:1f67 }
BlockWrite(f, ecl_CodeBuf^, $1E00);                                 { 7500:1f80 }
BlockWrite(f, party_MapX, 5);                                       { 7500:1f99 }
BlockWrite(f, travel_Mode, 1);                                      { 7500:1fb1 }
BlockWrite(f, game_Mode, 1);                                        { 7500:1fc9 }
n := 0;                                                             { 7500:1fe1 }
p := PartyHead;                                                     { 7500:1fe6 }
while p <> nil do begin                                             { 7500:1ff5 }
  n := n + 1;                                                       { 7500:2002 }
  Str(n:0, ns);                                                     { 7500:2006  string[1] }
  names[n] := 'CHRDAT' + key + ns;                                  { 7500:2022 .. 2069  string[40] }
  p := p^.next;                                                     { 7500:206e }
end;
BlockWrite(f, n, 1);                                                { 7500:2087 }
BlockWrite(f, names[1], $148);                                      { 7500:20a0  all 8 slots; unused ones are stack garbage }
Close(f);                                                           { 7500:20b9 }
p := PartyHead;                                                     { 7500:20c4 }
n := 0;                                                             { 7500:20d3 }
while p <> nil do begin                                             { 7500:20d8 }
  n := n + 1;                                                       { 7500:20e5 }
  Str(n:0, ns);                                                     { 7500:20e9 }
  WriteCharacter(p^, 'CHRDAT' + key + ns);                          { 7500:2105 .. 213e }
  fn := SavePath + MakeDosName(DeleteAll(p^.name, '.'));            { 7500:2141 .. 218c }
  if FileExists(fn + '.cha') then begin Assign(f, fn + '.cha'); Erase(f) end;   { 7500:2191 / 21b5 / 21db }
  if FileExists(fn + '.itm') then begin Assign(f, fn + '.itm'); Erase(f) end;   { 7500:21e6 / 220a / 2230 }
  if FileExists(fn + '.spc') then begin Assign(f, fn + '.spc'); Erase(f) end;   { 7500:223b / 225f / 2285 }
  p := p^.next;                                                     { 7500:2290 }
end;
g_557D := 1;                                                        { 7500:22a9 }
ClearMenuLine;                                                      { 7500:22ae }
```
{ quirk: unlike LoadGame, the three Erase tests are independent (not nested in the `.cha` test). Members are saved as `CHRDAT<key><n>` with n = list position 1..8, not party_slot. `BlockWrite` without a result variable: an I/O error here is not reported ({$I-}). }

### 7500:22D5 CheckEclDisk (M)
`procedure CheckEclDisk(name [BP+6]: string[40])` — RETF 4. Caller: ecl_op20_NewEcl (2F00:0C19, with `DataPath + 'ECL' + Str(DataSet) + '.dax'`, stub e11). Callees: FileExists, @StrLong, HorizontalMenu, RestoreDataSet, SaveGame, TerminateGame.
If the ECL file of the new data set is not reachable, asks for the disk; the "save and exit" path steps the party back one square, saves and quits. Name M (behaviour; literal).
```pascal
nm := name;                                                         { 7500:22dc }
if FileExists(nm) then Exit;                                        { 7500:22ef }
Str(DataSet:0, ns);                                                 { 7500:2300 }
options := 'Save and exit  Insert disk #' + ns;                     { 7500:231a .. 233d  string[40] }
key := HorizontalMenu('', options, $0D, $0A, $0F, False, False, ext);   { 7500:2342 .. 236a  prompt = '' (CS:22D4, pushed first) }
if (not ext) and (key = 'S') then begin                             { 7500:2372 / 2378 }
  party_MapX := party_MapX - DirDx{g_2736}[party_Dir];              { 7500:237e  step back (VIEW step tables) }
  if party_MapX < 0 then party_MapX := 15;                          { 7500:238d }
  if party_MapX > 15 then party_MapX := 0;                          { 7500:2399 }
  party_MapY := party_MapY - DirDy{g_273F}[party_Dir];              { 7500:23a5 }
  if party_MapY < 0 then party_MapY := 15;                          { 7500:23b4 }
  if party_MapY > 15 then party_MapY := 0;                          { 7500:23c0 }
  RestoreDataSet;                                                   { 7500:23cc }
  SaveGame;                                                         { 7500:23d1 }
  TerminateGame;                                                    { 7500:23d5 }
end;
```
{ Corrected 2026-10-18 (por-fixer, fix request #a-6, DOSBox ref SV-04): the first pushed string is the empty prompt (7500:2342..234c), the built string is the options; S (Save and exit) and I (Insert disk) end the menu. The earlier "no options" quirk read the push order reversed. }

### 7500:23E0 ov17_init (H)
`procedure ov17_init` — empty unit initialiser (`push bp; mov bp,sp; pop bp; retf`), called from the main program init chain (stub e0).  { 7500:23e0 }

---

## ov20 (8400) — game clock, rest clock, resting (healing, memorising, scribing, rest encounters)

Unit: ov20, analysis segment 8400, 15 routines (functions.tsv): 8400:0000 … 8400:0E60. Entries: e0 ov20_init, e1 **AdvanceClock** 03D5 (callers: ECL `ECL_CLOCK` 2F00:2ADB, VIEW ov14 movement/search, ov08 EndOfRound `AdvanceClock(1, 1)`), e2 **RestLoop** 0C9A (caller: ov15 `Rest` 6B00:077A). All other routines are internal.
Sources: `decode/listings/ov20.lst` (evidence), image bytes of the unit (`decode/bin/ghidra/ov20.bin`) for the CS literals and the set constant; `ov20.c` and PARTY.draft.md ## ov20 as checklist only.

### Clock layout (H)
Both clocks are `array[0..6] of Word` of mixed-radix digits; the radix of digit i is **`ClockLimits{g_363A}[i]`** = image words `10, 10, 6, 24, 30, 12, 256` (DS:363A..3647; `g_3642` in GLOBALS.md is element 4 = 30, read at 8400:03B6).
| i | radix | meaning (from the rest display and the callers) |
|---|---|---|
| 0 | 10 | sub-minute unit (L: tenths of a minute; AdvanceClock is never called with unit 0 in the listings read) |
| 1 | 10 | minutes 0..9 |
| 2 | 6 | ten-minutes 0..5 |
| 3 | 24 | hours |
| 4 | 30 | days |
| 5 | 12 | months |
| 6 | 256 | years (no carry out: overflow ages the party, see CarryClock) |
- **Game clock** = ECL VM words 49C6..49CC, i.e. `ecl_Mem4900^` at byte offset `(49C6h+i)*2 + 6E00h` = `2*(i + 0C6h)` (address arithmetic 8400:03E8..03F3, ECL_VM.md "region 0: game clock, 7 counters").
- **Rest clock** `RestClock{g_6DC2}[0..6]` = DS:6DC2..6DCF (FillChar 0Eh bytes; words 6DC4 minutes, 6DC6 ten-minutes, 6DC8 hours, 6DCA days, 6DCC months). Preset by ov15 Rest (hours/ten-minutes/minutes from RestTimeNeeded), edited by RestMenu, counted down by RestLoop.

---

### 8400:0000 TickEffects (M)
`procedure TickEffects(count [BP+8], unit [BP+6]: Byte)` — RETF 4. Caller: AdvanceClock. Callees: System.FillChar, RemoveEffect (ov24 9800:0026 via stub ov24 e2).
Converts `count` clock units of digit `unit` into minutes and counts the active effects of every party member down by that time, in chunks of at most 10 minutes; effects whose duration runs out are removed. `EffectsPending{g_471E}` (72 bytes, used as `[1..8]` at DS:471D+i) = "this member still has a timed effect"; outside camp (`game_Mode <> 2`) it is reset to all-1 on each call, in camp mode 2 it persists and the call is skipped when no member has a pending flag. Name M (behaviour; effect `duration` word at +1, SAVES.md §5).
```pascal
if game_Mode = 2 then begin                                        { 8400:0006 }
  any := false;  i := 1;                                           { 8400:0020 }
  repeat
    if EffectsPending[i] <> 0 then any := true;                    { 8400:002f  byte DS:471D+i }
    i := i + 1;                                                    { 8400:003a }
  until any or (i > ecl_Mem6B00^.w[$67C]);                          { 8400:003d / 0048  party member count }
  if not any then exit;                                            { 8400:0053 }
end else
  FillChar(EffectsPending, $48, 1);                                { 8400:0019 }
minutes := count;  u := unit;                                      { 8400:005c  word / ShortInt }
while u > 1 do begin                                               { 8400:006a }
  minutes := ClockLimits[u - 1] * minutes;                         { 8400:007a  16-bit MUL }
  u := u - 1;                                                      { 8400:0084 }
end;
while minutes > 0 do begin                                         { 8400:008e }
  if minutes > 10 then chunk := 10 else chunk := minutes;          { 8400:0097 }
  i := 1;  c := PartyHead;                                         { 8400:00a9 }
  while c <> nil do begin                                          { 8400:00ba }
    if EffectsPending[i] <> 0 then begin                           { 8400:00cc }
      EffectsPending[i] := 0;                                      { 8400:00dd }
      e := c^.effects;  last := c^.effects;  prev := c^.effects;   { 8400:00e2 / 00f4 / 0106 }
      saved := prev^.next;                                         { 8400:0118  quirk: read even when the list is nil }
      if c^.effects <> nil then                                    { 8400:0129 }
        while last^.next <> nil do last := last^.next;             { 8400:0137  last element at entry }
      done := false;                                               { 8400:0157 }
      while (e <> nil) and not done do begin                       { 8400:015b / 0166 }
        if e = last then done := true;                             { 8400:016f }
        if e^.duration = 0 then                                    { 8400:0183  permanent effect }
          e := e^.next                                             { 8400:018d }
        else if chunk < e^.duration then begin                     { 8400:01a1 }
          e^.duration := e^.duration - chunk;                      { 8400:01af }
          EffectsPending[i] := 1;                                  { 8400:01bb }
          e := e^.next;                                            { 8400:01c7 }
        end else begin
          saved := e^.next;                                        { 8400:01da }
          RemoveEffect(c, e^.type, e);                             { 8400:01fe }
          if prev = c^.effects then e := c^.effects                { 8400:0203  quirk: restart at the head (see note) }
          else e := saved;                                         { 8400:022d }
        end;
        prev := c^.effects;                                        { 8400:0239 }
        while (prev <> nil) and (prev <> e) and (prev^.next <> e) do   { 8400:024b / 0253 / 0263 }
          prev := prev^.next;                                      { 8400:0278 }
      end;
      while e <> nil do begin                                      { 8400:028e  rest of the list (normally already nil) }
        if e^.duration > 0 then EffectsPending[i] := 1;            { 8400:0296 }
        e := e^.next;                                              { 8400:02ac }
      end;
    end;
    i := i + 1;                                                    { 8400:02bf }
    c := c^.next;                                                  { 8400:02c2  +104h }
  end;
  if minutes > 10 then minutes := minutes - 10 else minutes := 0;  { 8400:02d8 }
end;
```
Quirk (H, 8400:0203 + 0239..0289): `prev` is the element found before the removal step (head, `e` itself or the predecessor of `e`). When the expired effect was the **second** element (or `prev` still equals the head for another reason), the walk restarts at the head, so effects before it are counted down a second time in the same chunk. A faithful port must copy this order.

### 8400:02F2 CarryClock (H)
`procedure CarryClock(var clk [BP+6]: array[0..6] of Word)` — RETF 4 (near-called with PUSH CS). Callers: AdvanceClock (game clock copy on the stack), NormalizeRestClock (`RestClock`).
One carry pass from digit 0 upwards; each digit carries at most once per call. Digit 6 (years) never wraps: at ≥ 256 every party member ages one year (and keeps doing so on every later call). Name H (radix table, `age` +30h).
```pascal
for i := 0 to 6 do                                                 { 8400:02f8 }
  if clk[i] >= ClockLimits[i] then                                 { 8400:0309 / 031b }
    if i = 6 then begin                                            { 8400:031f }
      c := PartyHead;                                              { 8400:0363 }
      while c <> nil do begin c^.age := c^.age + 1; c := c^.next end;   { 8400:0378 / 037f }
    end else begin
      clk[i + 1] := clk[i + 1] + 1;                                { 8400:0332 }
      clk[i] := clk[i] - ClockLimits[i];                           { 8400:033d .. 035e }
    end;
```

### 8400:03A3 NormalizeRestClock (H)
`procedure NormalizeRestClock` — RETF. Callers: DecRestClock, RestMenu.
```pascal
CarryClock(RestClock);                                             { 8400:03ac }
if RestClock[5] > 0 then begin                                     { 8400:03af  months }
  RestClock[4] := RestClock[4] + ClockLimits[4] * RestClock[5];    { 8400:03b6  days += 30 * months }
  RestClock[5] := 0;                                               { 8400:03c1 }
  if RestClock[4] > 99 then RestClock[4] := 99;                    { 8400:03c6  at most 99 days (two digits) }
end;
```

### 8400:03D5 AdvanceClock (H) — stub ov20 e1
`procedure AdvanceClock(count [BP+8], unit [BP+6]: Byte)` — RETF 4. Callers: ecl_op34_Clock (`AdvanceClock(v, 1)`), ov14 ExploreCommand / movement (`AdvanceClock(1, 2)`, `AdvanceClock(1, 1)`, `AdvanceClock($0C, 3)` — VIEW.pas.md), ov08 EndOfRound (`AdvanceClock(1, 1)`), RestLoop (`AdvanceClock(5, 1)`). Callees: CarryClock, TickEffects.
Adds `count` units of digit `unit` to the game clock, carrying after each single unit, then lets the effects of the party run for the same time. Name H (other lanes; argument roles confirmed here: `[BP+8]` is the loop bound, `[BP+6]` the incremented digit, 8400:0409 / 0421).
```pascal
for i := 0 to 6 do clk[i] := ecl_Mem4900^.w[$C6 + i];              { 8400:03db .. 0407  game clock VM 49C6..49CC }
for k := 1 to count do begin                                       { 8400:0409 / 0411  skipped when count = 0 }
  clk[unit] := clk[unit] + 1;                                      { 8400:0426 }
  CarryClock(clk);                                                 { 8400:042f }
end;
for i := 0 to 6 do ecl_Mem4900^.w[$C6 + i] := clk[i];              { 8400:043a .. 0466 }
TickEffects(count, unit);                                          { 8400:0471 }
```

### 8400:047A DecRestClock (H)
`procedure DecRestClock(amount [BP+8], unit [BP+6]: Byte)` — RETF 4. Callers: RestMenu ('D'), RestLoop (`DecRestClock(5, 1)` per step). Callee: System.FillChar, NormalizeRestClock.
Subtracts `amount` units of digit `unit` from the rest clock, borrowing from the next non-zero higher digit (up to days); when nothing is left to borrow the rest clock becomes 0. Does nothing if minutes, ten-minutes, hours and days are all 0.
```pascal
if (RestClock[4] = 0) and (RestClock[3] = 0) and (RestClock[2] = 0) and (RestClock[1] = 0) then exit;   { 8400:0480 .. 049c }
while amount > RestClock[unit] do begin                            { 8400:049f / 04b0 }
  k := unit + 1;                                                   { 8400:04b7 }
  while (RestClock[k] = 0) and (k < 5) do k := k + 1;              { 8400:04bf / 04ce }
  if k = 5 then begin                                              { 8400:04de }
    FillChar(RestClock, $0E, 0);                                   { 8400:04f0 }
    amount := 0;                                                   { 8400:04f5 }
  end else if k >= unit + 1 then                                   { 8400:04fb }
    for j := k downto unit + 1 do begin                            { 8400:050b }
      RestClock[j] := RestClock[j] - 1;                            { 8400:051b }
      RestClock[j - 1] := RestClock[j - 1] + ClockLimits[j - 1];   { 8400:0529 / 0537 }
    end;
end;
RestClock[unit] := RestClock[unit] - amount;                       { 8400:0546 }
NormalizeRestClock;                                                { 8400:055a }
```

### 8400:0565 TwoDigits (H)
`function TwoDigits(v [BP+6]: Byte): String[40]` — RETF 2 (result pointer [BP+8]). Caller: DrawRestTime. Callee: ByteToStr{00BA:1037}.
```pascal
s := ByteToStr(v);                                                 { 8400:0576 }
if v < 10 then s := '0' + s;                                       { 8400:0589 / 059a  literal CS:0563 = '0' }
TwoDigits := Copy(s, 1, 2);                                        { 8400:05ca }
```

### 8400:05F0 DrawRestTime (H)
`procedure DrawRestTime(sel [BP+6]: ShortInt)` — RETF 2. Callers: RestMenu (sel = edited digit 2..4), DailyHealing, FinishMemorize, FinishScribe, RestLoop (sel = 0 → no digit highlighted).
Draws `Rest Time: DD:HH:MM` on text row 17; the digit group being edited (`sel` = 4 days, 3 hours, 2 minutes) in colour 15, the rest in colour 10.
```pascal
for i := 0 to 6 do colour[i] := 10;                                { 8400:05f7 .. 0611 }
colour[sel] := 15;                                                 { 8400:061b }
DrawText(1, 17, 10, 'Rest Time:');                                 { 8400:0638  pushes 1, 11h, 0Ah, s }
col := 11;                                                         { 8400:063d }
for i := 4 downto 3 do begin                                       { 8400:0641 }
  DrawText(col + 1, 17, colour[i], TwoDigits(Lo(RestClock[i])));   { 8400:0677  days, hours }
  DrawText(col + 3, 17, 10, ':');                                  { 8400:069a  CS:05EE = ':' }
  col := col + 3;                                                  { 8400:069f }
end;
DrawText(col + 1, 17, colour[2], TwoDigits(10 * RestClock[2] + RestClock[1]));   { 8400:06cd  minutes = ten-minutes*10 + minutes }
```
Cells: "Rest Time:" col 1..10, days col 12..13, ':' col 14, hours col 15..16, ':' col 17, minutes col 18..19 (row 17).

### 8400:0721 RestMenu (H)
`function RestMenu: Boolean` — RETF. Caller: RestLoop. Callees: DrawRestTime, HorizontalMenu (ov25 9D00:03BD via stub e2), NormalizeRestClock, DecRestClock, System.@SetIn.
The rest-time editor. Result true = start resting ('R' or Enter), false = Exit/Esc.
```pascal
start := false;                                                    { 8400:0727 }
sel := 2;                                                          { 8400:072b  minutes }
repeat
  DrawRestTime(sel);                                               { 8400:0734 }
  key := HorizontalMenu('', 'Rest   daYs Hours Mins   Inc Dec   Exit', $0D, $0A, $0F, true, false, ext);   { 8400:0769  CS:06D8 = '' }
  if ext then                                                      { 8400:0771 }
    case key of
      'H': key := 'I';                                             { 8400:077e  cursor up = Inc }
      'P': key := 'D';                                             { 8400:0788  cursor down = Dec }
      'K': begin sel := sel + 1; if sel > 4 then sel := 2; key := 'X' end;   { 8400:0792  cursor left: next larger unit }
      'M': begin sel := sel - 1; if sel < 2 then sel := 4; key := 'X' end;   { 8400:07a9  cursor right }
    else key := 'X';                                               { 8400:07bc }
    end;
  if key = #13 then key := 'R';                                    { 8400:07c0  quirk: Enter = Rest whatever is highlighted }
  case key of
    'R': start := true;                                            { 8400:07d1 }
    'Y': sel := 4;                                                 { 8400:07db  daYs }
    'H': sel := 3;                                                 { 8400:07e5  Hours }
    'M': sel := 2;                                                 { 8400:07ef  Mins }
    'I': begin                                                     { 8400:07f5  Inc }
           if sel = 2 then RestClock[1] := RestClock[1] + 5        { 8400:07ff  minutes in steps of 5 }
           else RestClock[sel] := RestClock[sel] + 1;              { 8400:080e }
           NormalizeRestClock;                                     { 8400:0813 }
         end;
    'D': begin                                                     { 8400:0818  Dec }
           if sel = 2 then DecRestClock(5, 1)                      { 8400:0829 }
           else DecRestClock(1, sel);                              { 8400:0836 }
           NormalizeRestClock;                                     { 8400:083a }
         end;
  end;
until key in [#0, 'E', 'R'];                                       { 8400:0846  set CS:0701 = [#0,'E','R'] }
RestMenu := start;                                                 { 8400:0850 }
```

### 8400:0871 DailyHealing (H)
`procedure DailyHealing` — RETF. Caller: RestLoop (once per 5-minute rest step). Callees: HealCharacter (ov24 9800:175D via stub e21), DrawRestTime, DrawText, DrawPartyRoster, MessageDelay, ClearCharacterMessage.
Every 288 rest steps (288 × 5 min = 24 h of rest) each party member regains 1 hit point. `HealCounter{g_6DD8}` is reset by ov15 Camp.
```pascal
HealCounter := HealCounter + 1;                                    { 8400:0877 }
if HealCounter >= $120 then begin                                  { 8400:087b }
  any := false;  c := PartyHead;                                   { 8400:0886 }
  while c <> nil do begin                                          { 8400:0897 }
    if HealCharacter(c, 1, false) then any := true;                { 8400:08ab  pushes c, 1, 0 }
    c := c^.next;                                                  { 8400:08b8 }
  end;
  DrawRestTime(0);                                                 { 8400:08d1 }
  DrawText(1, 19, 10, 'The Whole Party Is Healed');                { 8400:08ec  shown even if nobody gained HP }
  if any then DrawPartyRoster(SelectedChar);                       { 8400:08ff }
  MessageDelay;                                                    { 8400:0904 }
  ClearCharacterMessage;                                           { 8400:0909 }
  HealCounter := 0;                                                { 8400:090e }
end;
```

### 8400:0925 FinishMemorize (H)
`function FinishMemorize(c [BP+0Ah]: PChar; var learnt [BP+6]: Boolean): Byte` — RETF 8. Callers: StudyTick, StudyHourTick. Callees: DrawRestTime, ShowCasts (stub ov22 e8: "<name> <text> <spell name>" message, MAGIC lane).
With `learnt = false`: the first pending memorisation (`mem_spell[k] >= 80h`) becomes memorised, the message "has memorized <spell>" is shown and `learnt := true`. Then (or with `learnt = true` at once) the result is the spell level (`SpellTable` byte 1, DS:31FB + id*16) of the next pending memorisation, 0 if none.
```pascal
result := 0;  k := 0;                                              { 8400:092b / 092f }
while (k <= 20) and (result = 0) do begin                          { 8400:0933 / 093c }
  if c^.mem_spell[k] > $7F then                                    { 8400:094f  +17h }
    if learnt then
      result := SpellTable[(c^.mem_spell[k] and $7F)].level        { 8400:0977  byte DS:31FB + id*16 }
    else begin
      c^.mem_spell[k] := c^.mem_spell[k] - $80;                    { 8400:098a }
      DrawRestTime(0);                                             { 8400:0993 }
      ShowCasts(c, 'has memorized', c^.mem_spell[k]);              { 8400:09ba  pushes c, s, spell }
      learnt := true;                                              { 8400:09c2 }
    end;
  k := k + 1;                                                      { 8400:09c6 }
end;
FinishMemorize := result;                                          { 8400:09cc }
```

### 8400:09E7 FinishScribe (H)
`function FinishScribe(c [BP+0Ah]: PChar; var learnt [BP+6]: Boolean): Byte` — RETF 8. Callers: StudyTick, StudyHourTick. Callees: IsScroll (stub ov22 e6, "item is a scroll", MAGIC lane), UseScrollSpell (stub ov22 e7, remove the spell from the scroll, may LoseItem the scroll), DrawRestTime, ShowCasts (stub e8).
Same scheme for scroll spells being scribed (scroll power bytes +3Ch..+3Eh with bit 7 set): learning sets `known_spell[s] := 1` and consumes the spell from the scroll.
```pascal
result := 0;                                                       { 8400:09ed }
item := c^.items;                                                  { 8400:09f1  +C8h }
while (item <> nil) and (result = 0) do begin                      { 8400:0a04 / 0a0f }
  k := 1;                                                          { 8400:0a18 }
  if IsScroll(item) then                                          { 8400:0a22 }
    while (k <= 3) and (result = 0) do begin                       { 8400:0a2e / 0a37 }
      if item^.power[k] > $80 then                                 { 8400:0a4a  +3Bh+k; quirk: byte 80h itself (spell 0) is skipped }
        if learnt then
          result := SpellTable[item^.power[k] and $7F].level       { 8400:0a75 }
        else begin
          s := item^.power[k] and $7F;                             { 8400:0a7e }
          c^.known_spell[s] := 1;                                  { 8400:0a9b  +32h+s }
          UseScrollSpell(c, item, s);                                   { 8400:0ab0  pushes c, item, s }
          DrawRestTime(0);                                         { 8400:0ab9 }
          ShowCasts(c, 'has scribed', s);                          { 8400:0ad5 }
          learnt := true;                                          { 8400:0add }
        end;
      k := k + 1;                                                  { 8400:0ae1 }
    end;
  item := item^.next;                                              { 8400:0ae7  +2Ah; quirk: read after UseScrollSpell may have freed the scroll }
end;
FinishScribe := result;                                            { 8400:0afb }
```

### 8400:0B0A StudyTick (H)
`procedure StudyTick` — RETF. Caller: RestLoop (every 5-minute step). Callees: FinishScribe, FinishMemorize.
`StudyTimer{g_6DCF}[1..8]` (byte DS:6DCF+i) = 5-minute steps until the next spell of member i is learnt; it is armed with level*3 (= 15 min per spell level, the `15*levels` term of RestTimeNeeded).
```pascal
i := 1;  c := PartyHead;                                           { 8400:0b10 }
while c <> nil do begin                                            { 8400:0b21 }
  StudyTimer[i] := StudyTimer[i] - 1;                              { 8400:0b33  byte; 0 wraps to 255 }
  if (StudyTimer[i] = 0) and (c^.rest_need = 0) then begin         { 8400:0b3e / 0b48  +2Ch }
    learnt := false;                                               { 8400:0b4f }
    lvl := FinishScribe(c, learnt);                                { 8400:0b5f  scrolls first }
    if lvl = 0 then lvl := FinishMemorize(c, learnt);              { 8400:0b77 }
    StudyTimer[i] := lvl * 3;                                      { 8400:0b7d }
  end;
  c := c^.next;  i := i + 1;                                       { 8400:0b95 / 0ba8 }
end;
```
Note (H, call order + `learnt` flag): one step learns at most one spell — a scroll spell if any is pending (FinishScribe), otherwise a memorisation. When FinishScribe learnt one but no further scroll spell is pending, FinishMemorize runs with `learnt = true` and only returns the level of the first pending memorisation for the next timer. Quirk: a member whose timer was never armed (`rest_need = 0` from the start) reaches 0 again only after 256 steps (byte wrap at 8400:0b33).

### 8400:0BB2 StudyHourTick (H)
`procedure StudyHourTick(var tick [BP+6]: Byte)` — RETF 4. Caller: RestLoop (`tick` = its local, starts 0). Callees: FinishScribe, FinishMemorize.
Every 12 steps (one hour) the `rest_need` hours of every member count down; when they reach 0 the study timer is armed with the level of the first pending spell (`learnt = true`: nothing is learnt yet).
```pascal
tick := tick + 1;                                                  { 8400:0bbb }
if tick >= 12 then begin                                           { 8400:0bc1 }
  tick := 0;                                                       { 8400:0bcd }
  i := 1;  c := PartyHead;                                         { 8400:0bd1 }
  while c <> nil do begin                                          { 8400:0be2 }
    if c^.rest_need > 0 then begin                                 { 8400:0bed  signed }
      c^.rest_need := c^.rest_need - 1;                            { 8400:0bf7 }
      if c^.rest_need = 0 then begin                               { 8400:0bfe }
        learnt := true;                                            { 8400:0c05 }
        lvl := FinishScribe(c, learnt);                            { 8400:0c15 }
        if lvl = 0 then lvl := FinishMemorize(c, learnt);          { 8400:0c2d }
        StudyTimer[i] := lvl * 3;                                  { 8400:0c33 }
      end;
    end;
    c := c^.next;  i := i + 1;                                     { 8400:0c4b / 0c5e }
  end;
end;
```

### 8400:0C9A RestLoop (H) — stub ov20 e2
`function RestLoop: Boolean` — RETF. Caller: ov15 Rest (6B00:077A, `interrupted := RestLoop`). Callees: System.FillChar, ClearTextRectangle, DrawRestTime, RestMenu, Crt.KeyPressed, AskYesNo (ov25 e5), ClearMenuLine (ov25 e3), DecRestClock, AdvanceClock, DailyHealing, StudyTick, StudyHourTick, Roll (ov24 e8), ClearCharacterMessage, DrawText, MessageDelay.
Result true = the rest was ended by a random encounter. Name M from MAGIC.pas.md (H by behaviour).
```pascal
interrupted := false;  unused := 0;                                { 8400:0ca0 / 0ca4 }
i := 1;  c := PartyHead;                                           { 8400:0ca8 }
while c <> nil do begin StudyTimer[i] := 0; i := i + 1; c := c^.next end;   { 8400:0cc8 }
FillChar(EffectsPending, $48, 1);                                  { 8400:0cf1 }
hourTick := 0;  redrawTick := 0;                                   { 8400:0cf6 / 0cfa }
ClearTextRectangle(1, 17, 38, 22);                                 { 8400:0d0a  pushes 1, 11h, 26h, 16h }
DrawRestTime(0);                                                   { 8400:0d13 }
RestActive := 1;                                                   { 8400:0d16  g_6DDA }
stop := not RestMenu;                                              { 8400:0d1c }
while not stop and ((RestClock[4] > 0) or (RestClock[3] > 0) or (RestClock[2] > 0) or (RestClock[1] > 0)) do begin   { 8400:0d29 .. 0d4c }
  if KeyPressed then begin                                         { 8400:0d51 }
    DrawRestTime(0);                                               { 8400:0d5e }
    if AskYesNo('Stop Resting? ', $0D, $0A, $0F) = 'Y' then stop := true   { 8400:0d79 }
    else ClearMenuLine;                                            { 8400:0d88 }
  end;
  if not stop then begin                                           { 8400:0d8d }
    DecRestClock(5, 1);                                            { 8400:0d9d  one step = 5 minutes }
    redrawTick := redrawTick + 1;                                  { 8400:0da0 }
    if redrawTick >= 5 then begin DrawRestTime(0); redrawTick := 0 end;   { 8400:0da3 / 0dad }
    AdvanceClock(5, 1);                                            { 8400:0dbb }
    DailyHealing;                                                  { 8400:0dbf }
    StudyTick;                                                     { 8400:0dc3 }
    StudyHourTick(hourTick);                                       { 8400:0dcc }
    if ecl_Mem6B00^.w[$5A4] > 0 then begin                         { 8400:0dd3  ECL VM 6DD2: encounter check interval (steps) }
      RestEncCounter := RestEncCounter + 1;                        { 8400:0ddb  g_49FB }
      if RestEncCounter >= ecl_Mem6B00^.w[$5A4] then begin         { 8400:0de6 }
        RestEncCounter := 0;                                       { 8400:0def }
        if Roll(1, 100) <= ecl_Mem6B00^.w[$5A6] then begin         { 8400:0df8 / 0e03  ECL VM 6DD3: encounter chance in % }
          ClearCharacterMessage;                                   { 8400:0e0a }
          DrawRestTime(0);                                         { 8400:0e13 }
          DrawText(1, 19, 15, 'The Party is rudely interrupted!'); { 8400:0e2e }
          stop := true;  interrupted := true;                      { 8400:0e33 / 0e37 }
          MessageDelay;                                            { 8400:0e3b }
        end;
      end;
    end;
  end;
end;
ClearTextRectangle(1, 17, 38, 22);                                 { 8400:0e4f }
RestActive := 0;                                                   { 8400:0e54 }
RestLoop := interrupted;                                           { 8400:0e59 }
```
Notes: the key that triggered KeyPressed is not consumed here (AskYesNo's menu reads it). The rest-time display is refreshed only every 5 steps (25 game minutes). The encounter itself is not started here: the caller (ov15 Rest → Camp) gets `interrupted = true`; ECL vectors decide the encounter.

### 8400:0E60 ov20_init (H)
Empty unit initialiser (`push bp; mov bp,sp; pop bp; retf`), called from the main init chain via stub ov20 e0. `{ 8400:0e60 }`

---

# ov21 (seg 8900) — encumbrance, coins, treasure-pool money, number input, random magic items, gem/jewel appraisal (FINAL pseudocode, lane por-mod-party)

Unit: ov21, analysis segment 8900, 22 routines (functions.tsv; 15 stub entries e0..e14).
Role: the money layer shared by shops (ov06), temples (ov04), the after-combat treasure menu (ov05), the character "View" money commands (ov19) and the ECL TREASURE opcode (ov03): carrying capacity and encumbrance bookkeeping, moving coins between a character and the treasure pool `TreasureMoney` (DS:67F4, 7 LongInts), pooling/sharing the party's money, the "Select type of coin" take menu, a numeric input line, gem/jewel appraisal ("Appraise"), and the random item generator used for treasure (`MakeTreasureItem`).
Sources: `decode/listings/ov21.lst` (evidence), `ov21.c` (aid only); image bytes for the DS tables (DS:0970, DS:0D24, DS:0FFA, DS:10A7) read from `decode/bin/START.unpacked.exe` (file offset = 8E0h + 0C7C0h + DS offset).

Conventions (as VIEW.pas.md / ENGINE.pas.md)
- **Signatures are in Pascal order**: first parameter = highest BP offset (pushed first); parameters as `name [BP+xx]`. Every call below was written from its PUSH sequence.
- `{ seg:off }` = first instruction of the statement (or of the call that implements it). `{ quirk: … }` = behaviour a faithful port must copy.
- Globals by GLOBALS.md / decode/names names: `SelectedChar` (DS:5D92, ^TChar), `PartyHead` (DS:5D96, first TChar, linked by `next` +104h), `TreasureMoney[0..6]` (DS:67F4, LongInt per coin type, same order as TChar.money), `TreasureItems` (DS:6810), `game_Mode` (DS:49F3), `CoinValue[0..4]` (DS:0D24, LongInt = 1, 10, 100, 200, 1000: copper, silver, electrum, gold, platinum in copper units). Names introduced here: `PoolHasMoney{g_6DC0}`, `MagicItemTable{g_0970}`, `CoinName{g_0FFA}` (see ov21_names.json / ov21_notes.md).
- TChar fields by SAVES.md §3 names: `money[0..6]` (+88h: copper, silver, electrum, gold, platinum, gems, jewelry; words), `encumbrance` (+102h), `item_count` (+C7h), `items` (+C8h), `npc_morale` (+84h), `next` (+104h). Item record (63 bytes) by SAVES.md §4: `name`, `next` +2Ah, `type` +2Eh, `word[1..3]` +2Fh..+31h (name words, shown +31h, +30h, +2Fh), `plus` +32h, `plus2` +33h, `readied` +34h, `hidden` +35h, `magic_flag` +36h, `weight` +37h, `count` +39h, `value` +3Ah, `power[1..3]` +3Ch..+3Eh. Name words `ItemWord[w]` = string[20] at DS:10A7 + w*21 (values quoted from the image).
- `TMenuItem` (46 bytes: text string[40] +0, isHeader +29h, next +2Ah) as VIEW.pas.md (ov25).
- Resident callees (ENGINE names, Pascal argument order): `StrWeightAllowance{00BA:13AB}(c)`, `ShowTimedBottomMessage{00BA:1693}(s)` (row 24, colour 0Ah, MessageDelay, clear), `RecalcCharacter{00BA:0BB8}(c)`, `DrawCharacterName{00BA:1816}(c, col, row, possessive)`, `DrawTitledFrame{03F1:02E8}(x1, y1, x2, y2, style, colour, title)`, `DrawText{0709:0626}(col, row, colour, s)`, `ClearGlyphRun{0709:05EB}(col, row, colour, count)`, `ClearTextRectangle{0709:0DD3}(x1, y1, x2, y2)`, `ReadGameKey{0899:0059}: Char`.
- Other overlays: `Roll{ov24 e8, 9800:0DE6}(count, sides)` = sum of `count` d`sides`; `HorizontalMenu{ov25 e2}(prompt, options, promptColour [BP+12h], textColour [BP+10h], hotColour [BP+0Eh], allowExt, animate, var ext): Char`; `VerticalListMenu{ov25 e4}(prompt, options, selColour, c2, c3, left, top, right, bottom, list, showExit, var redraw, var index, var item): Char`; `FreeMenuList{ov25 e7}(var list)`.
- Runtime: `@LongMul`, `@LongDivMod` (quotient DX:AX, remainder BX:CX — `div`/`mod` below), `@StrLong` = `Str(v, s)`, `@ValLong` = `Val(s, v, code)`, `@CharToStr`, `@StrAppend` = `+`, `Copy`, `FillChar`, `GetMem`, `UpCase`, `RandomWord` = `Random(n)`.

---

### 8900:0000 MaxCarryWeight (H)
`function MaxCarryWeight(c [BP+6]: ^TChar): Word` — RETF 4. Callers: WouldOverload, TransferCoins, ShareMoney.
```pascal
MaxCarryWeight := StrWeightAllowance(c) + 1500;                        { 8900:0006 }
```

### 8900:0020 SubEncumbrance (H)
`procedure SubEncumbrance(c [BP+8]: ^TChar; amount [BP+6]: Word)` — RETF 6. Callers: TransferCoins, PoolMoney, DropCoinsToPool.
```pascal
c^.encumbrance := c^.encumbrance - amount;                             { 8900:0023 }
```

### 8900:003A AddEncumbrance (H)
`procedure AddEncumbrance(c [BP+8]: ^TChar; amount [BP+6]: Word)` — RETF 6. Callers: AddPlatinumOrPool, TakeCoins, TransferCoins, ShareMoney.
```pascal
c^.encumbrance := c^.encumbrance + amount;                             { 8900:003d }
```

### 8900:0054 WouldOverload (H) — stub ov21 e1
`function WouldOverload(c [BP+0Ch]: ^TChar; amount [BP+0Ah]: Word; var room [BP+6]: Word): Boolean` — RETF 0Ah. Callers: AddPlatinumOrPool, TakeCoins, ShareMoney, AppraiseGems; ov19 SellItem (7F00:1CEE).
```pascal
if c^.encumbrance + amount > MaxCarryWeight(c) then begin              { 8900:005a  unsigned compare }
  WouldOverload := True;                                               { 8900:0075 }
  room := MaxCarryWeight(c) - c^.encumbrance;                          { 8900:0079 }
end else begin
  WouldOverload := False;                                              { 8900:0093 }
  room := 0;                                                           { 8900:0097 }
end;
```

### 8900:00A8 MoneyValueInGold (H) — stub ov21 e12
`function MoneyValueInGold(money [BP+6]: array[0..6] of LongInt): LongInt` — RETF 4 (28-byte value parameter, passed by reference and copied to a local by the callee). Callers: ov04 PayForCure, ov06 ShopBuy, ov19 IdentifyItem (all pass `TreasureMoney` or a character's money as LongInts).
```pascal
m := money;                                                            { 8900:00ae  @CopyBytes 1Ch }
sum := 0;                                                              { 8900:00c1 }
for k := 0 to 4 do                                                     { 8900:00c9  copper..platinum; gems/jewelry not counted }
  sum := sum + m[k] * CoinValue[k];                                    { 8900:00dc }
MoneyValueInGold := (sum + 100) div CoinValue[3];                      { 8900:0105  CoinValue[3] = 200 (g_0D30): rounded to gold }
```

### 8900:0130 SetCharMoneyGold (M) — stub ov21 e10
`procedure SetCharMoneyGold(gold [BP+6]: Word)` — RETF 2. Callers: ov04 PayForCure, ov06 ShopBuy, ov19 IdentifyItem (pay a price: replace the coins by their gold value).
```pascal
for k := 0 to 4 do SelectedChar^.money[k] := 0;                        { 8900:0136 }
SelectedChar^.money[4] := gold div 5;                                  { 8900:0158  platinum }
SelectedChar^.money[3] := gold mod 5;                                  { 8900:016b  gold }
```
`{ quirk: encumbrance is not updated here; callers rely on a later RecalcCharacter. }`

### 8900:0185 SetPoolMoneyGold (M) — stub ov21 e11
`procedure SetPoolMoneyGold(gold [BP+6]: Word)` — RETF 2. Callers: as SetCharMoneyGold (pay from the treasure pool).
```pascal
for k := 0 to 4 do TreasureMoney[k] := 0;                              { 8900:018b }
TreasureMoney[4] := gold div 5;                                        { 8900:01ae  g_6804 }
TreasureMoney[3] := gold mod 5;                                        { 8900:01c1  g_6800 }
```

### 8900:0203 AddPlatinumOrPool (M)
`procedure AddPlatinumOrPool(n [BP+6]: Word)` — RETF 2 (called near with PUSH CS). Callers: AppraiseGems (selling a gem/jewel).
```pascal
if WouldOverload(SelectedChar, n, room) then begin                     { 8900:0209 }
  ShowTimedBottomMessage('Overloaded.  Money will be put in Pool.');   { 8900:0221  cs:01DB }
  SelectedChar^.money[4] := SelectedChar^.money[4] + room;             { 8900:0235 }
  AddEncumbrance(SelectedChar, room);                                  { 8900:0241 }
  TreasureMoney[4] := n + TreasureMoney[4] - room;                     { 8900:0250 }
end else begin
  SelectedChar^.money[4] := SelectedChar^.money[4] + n;                { 8900:0273 }
  AddEncumbrance(SelectedChar, n);                                     { 8900:027f }
end;
```

### 8900:0294 InputNumber (H) — stub ov21 e6
`function InputNumber(max [BP+0Ch]: Word; prompt [BP+8]: string[40]; colour [BP+6]: Byte): Word` — RETF 8. Callers: TakeMoney; ov19 TradeCoins, DropCoins.
Locals: `p` string[40] [bp-2Bh], `len` [bp-2Eh], `col` [bp-2Ch], `maxStr` string[5] [bp-34h], `num` string[6] [bp-3Bh], `k` [bp-3Ch].
```pascal
p := prompt;                                                           { 8900:029b }
ClearGlyphRun(0, 24, 0, 40);                                           { 8900:02ae  bottom line }
DrawText(0, 24, colour, p);                                            { 8900:02bf }
len := Length(p);  col := len;                                         { 8900:02d3 }
Str(max, maxStr);                                                      { 8900:02df }
num := '';                                                             { 8900:02f7 }
repeat
  k := ReadGameKey;                                                    { 8900:02fb }
  if (k >= '0') and (k <= '9') then begin                              { 8900:0303 }
    num := num + k;                                                    { 8900:0314  truncated to 6 characters }
    v := Val(num, code);                                               { 8900:0346  LongInt }
    if v <= max then Inc(col)                                          { 8900:035b }
    else begin
      num := maxStr;                                                   { 8900:0371  too large: clamp to max }
      col := len + Length(maxStr);                                     { 8900:0384 }
    end;
    DrawText(len, 24, $0F, num);                                       { 8900:0395 }
  end
  else if (k = #8) and (Length(num) > 0) then begin                    { 8900:03ab }
    num := Copy(num, 1, Length(num) - 1);                              { 8900:03b5 }
    ClearGlyphRun(col, 24, 0, 1);                                      { 8900:03de }
    Dec(col);                                                          { 8900:03f0 }
  end;
until (k = #13) or (k = #27);                                          { 8900:03f3 }
ClearGlyphRun(0, 24, 0, 40);                                           { 8900:0402 }
if k = #27 then InputNumber := 0                                       { 8900:0413 }
else InputNumber := Val(num, code);                                    { 8900:0420  low word }
```
`{ quirk: col points one cell past the last digit (digits are drawn from column len), so Backspace blanks the cell after the last digit — the deleted digit stays visible until the next redraw. }`

### 8900:044C TransferCoins (H) — stub ov21 e7
`procedure TransferCoins(var src [BP+0Eh], dst [BP+0Ah]: ^TChar; amount [BP+8]: Word; coin [BP+6]: ShortInt)` — RETF 0Ch. Callers: ov19 TradeCoins.
```pascal
if dst^.encumbrance + amount <= MaxCarryWeight(dst) then begin         { 8900:0452 }
  src^.money[coin] := src^.money[coin] - amount;                       { 8900:0474 }
  SubEncumbrance(src, amount);                                         { 8900:049f }
  dst^.money[coin] := dst^.money[coin] + amount;                       { 8900:04b0 }
  AddEncumbrance(src, amount);                                         { 8900:04db  quirk: src again, not dst }
end else
  ShowTimedBottomMessage('Overloaded');                                { 8900:04ee  cs:0441 }
```
`{ quirk: the encumbrance update adds back to the giver instead of the receiver (both calls push [BP+0Eh]); the stored encumbrances stay stale until the next RecalcCharacter. }`

### 8900:0508 PoolMoney (H) — stub ov21 e2
`procedure PoolMoney` — RETF. Callers: ov04 Temple, ov05 TreasureMenu, ov06 Shop (menu "Pool").
```pascal
p := PartyHead;                                                        { 8900:050e }
PoolHasMoney := 1;                                                     { 8900:051b  g_6DC0 }
while p <> nil do begin                                                { 8900:0520 }
  if (p^.npc_morale = 0) or (p^.npc_morale = $B3) then begin           { 8900:052b  PCs and animated dead; NPCs keep their money }
    for k := 0 to 6 do begin                                           { 8900:0544 }
      TreasureMoney[k] := TreasureMoney[k] + p^.money[k];              { 8900:0553 }
      SubEncumbrance(p, p^.money[k]);                                  { 8900:0591 }
    end;
    FillChar(p^.money, 14, 0);                                         { 8900:05b1 }
  end;
  p := p^.next;                                                        { 8900:05c6 }
end;
```

### 8900:05E0 CountMoneySharers (M)
`function CountMoneySharers: Byte` — RETF. Caller: ShareMoney.
```pascal
p := PartyHead;  n := 0;                                               { 8900:05e6 }
while p <> nil do begin                                                { 8900:05f7 }
  if (p^.npc_morale = 0) or (p^.npc_morale = $B3) then Inc(n);         { 8900:05ff }
  p := p^.next;                                                        { 8900:0618 }
end;
CountMoneySharers := n;                                                { 8900:062d }
```

### 8900:063A ShareMoney (H) — stub ov21 e3
`procedure ShareMoney` — RETF. Callers: ov04 Temple, ov05 TreasureMenu, ov06 Shop (menu "Share").
Locals: `share[0..6]` words [bp-1Ah], `rest[0..6]` words [bp-28h], `room` [bp-0Ch], `n` [bp-9], `k` [bp-29h]; byte [bp-0Ah] is set to 0 and never read.
```pascal
p := PartyHead;                                                        { 8900:0640 }
n := CountMoneySharers;                                                { 8900:0651 }
FillChar(share, 14, 0);  FillChar(rest, 14, 0);                        { 8900:0658 }
for k := 0 to 6 do                                                     { 8900:067a }
  if TreasureMoney[k] > 0 then begin                                   { 8900:068d }
    share[k] := TreasureMoney[k] div n;                                { 8900:069d  quirk: n = 0 (no sharer) → runtime error 200 }
    rest[k]  := TreasureMoney[k] mod n;                                { 8900:06cc }
  end else begin
    share[k] := 0;  rest[k] := 0;                                      { 8900:0701 }
  end;
{ pass 1: everyone with npc_morale < 80h gets a share, highest coin first }
while p <> nil do begin                                                { 8900:0724 }
  if p^.npc_morale < $80 then                                          { 8900:072f  quirk: other test than CountMoneySharers (B3h excluded, 1..7Fh included) }
    for k := 6 downto 0 do                                             { 8900:073d }
      if not WouldOverload(p, share[k], room) then begin               { 8900:0746 }
        p^.money[k] := p^.money[k] + share[k];                         { 8900:0767 }
        AddEncumbrance(p, share[k]);                                   { 8900:0796 }
        if rest[k] > 0 then                                            { 8900:07ab }
          if not WouldOverload(p, rest[k], room) then begin            { 8900:07b9  quirk: tests the whole rest, adds 1 }
            p^.money[k] := p^.money[k] + 1;                            { 8900:07d7 }
            AddEncumbrance(p, 1);                                      { 8900:07fa }
            Dec(rest[k]);                                              { 8900:0808 }
          end;
      end else begin
        p^.money[k] := p^.money[k] + room;                             { 8900:0815  takes what fits }
        rest[k] := share[k] + rest[k] - room;                          { 8900:083a }
        AddEncumbrance(p, room);                                       { 8900:0862 }
      end;
  p := p^.next;                                                        { 8900:0878 }
end;
{ pass 2: hand the remainder to anyone with room, NPCs included }
for k := 6 downto 0 do                                                 { 8900:088e }
  if rest[k] > 0 then begin                                            { 8900:0897 }
    p := PartyHead;                                                    { 8900:08a8 }
    while p <> nil do begin                                            { 8900:08b5 }
      room := MaxCarryWeight(p) - p^.encumbrance;                      { 8900:08c0 }
      if room > 0 then                                                 { 8900:08d5  unsigned }
        if rest[k] > room then begin                                   { 8900:08de }
          p^.money[k] := p^.money[k] + room;                           { 8900:08ee }
          AddEncumbrance(p, room);                                     { 8900:0913 }
          rest[k] := rest[k] - room;                                   { 8900:0920 }
        end else begin
          p^.money[k] := p^.money[k] + rest[k];                        { 8900:093d }
          AddEncumbrance(p, rest[k]);                                  { 8900:096c }
          rest[k] := 0;                                                { 8900:0981 }
        end;
      p := p^.next;                                                    { 8900:098e }
    end;
  end;
PoolHasMoney := 0;                                                     { 8900:09ad }
for k := 0 to 6 do begin                                               { 8900:09b2 }
  TreasureMoney[k] := rest[k];                                         { 8900:09bb }
  if TreasureMoney[k] <> 0 then PoolHasMoney := 1;                     { 8900:09de }
end;
```

### 8900:0A01 DropCoinsToPool (M) — stub ov21 e8
`procedure DropCoinsToPool(c [BP+0Ah]: ^TChar; amount [BP+8]: Word; coin [BP+6]: ShortInt)` — RETF 8. Callers: ov19 DropCoins (7F00:24A7).
```pascal
c^.money[coin] := c^.money[coin] - amount;                             { 8900:0a04 }
SubEncumbrance(c, amount);                                             { 8900:0a29 }
if (game_Mode = 6) or (game_Mode = 1) then                             { 8900:0a36  otherwise the coins are simply lost }
  TreasureMoney[coin] := TreasureMoney[coin] + amount;                 { 8900:0a44 }
```

### 8900:0A88 TakeCoins (H)
`procedure TakeCoins(c [BP+0Ah]: ^TChar; amount [BP+8]: Word; coin [BP+6]: ShortInt)` — RETF 8 (near call with PUSH CS). Caller: TakeMoney.
```pascal
if WouldOverload(c, amount, room) then                                 { 8900:0a8e }
  ShowTimedBottomMessage('Overloaded')                                 { 8900:0aa4  cs:0A7D; nothing is taken (no partial take) }
else begin
  if amount > TreasureMoney[coin] then amount := TreasureMoney[coin];  { 8900:0abb  low word }
  TreasureMoney[coin] := TreasureMoney[coin] - amount;                 { 8900:0aed }
  c^.money[coin] := c^.money[coin] + amount;                           { 8900:0b22 }
  AddEncumbrance(c, amount);                                           { 8900:0b47 }
end;
```

### 8900:0B93 CoinFromText (H) — stub ov21 e5
`function CoinFromText(text [BP+0Ah]: String; var coinName [BP+6]: String): ShortInt` — RETF 8. Callers: TakeMoney; ov19 TradeCoins, DropCoins. `text` is a list line "Copper 123" … "Jewelry 2" (CoinName + ' ' + amount).
```pascal
t := text;                                                             { 8900:0b9a  string[255] }
i := 1;  while t[i] = ' ' do Inc(i);                                   { 8900:0bae }
case t[i] of                                                           { 8900:0bc8 }
  'G': if UpCase(t[i+1]) = 'E' then begin result := 5; coinName := 'Gems ' end      { 8900:0bd8 }
       else begin coinName := 'Gold '; result := 3 end;                { 8900:0c08 }
  'P': begin coinName := 'Platinum '; result := 4 end;                 { 8900:0c22 }
  'E': begin coinName := 'electrum '; result := 2 end;                 { 8900:0c3f }
  'S': begin coinName := 'silver '; result := 1 end;                   { 8900:0c5c }
  'C': begin coinName := 'Copper '; result := 0 end;                   { 8900:0c79 }
  'J': begin coinName := 'Jewelry '; result := 6 end;                  { 8900:0c96 }
end;                                                                   { other first letters: result = uninitialised local [bp-1] }
CoinFromText := result;                                                { 8900:0cb1 }
```

### 8900:0CEB TakeMoney (H) — stub ov21 e4
`procedure TakeMoney` — RETF. Callers: ov04 Temple, ov05 TakeTreasureMenu, ov06 Shop ("Take").
Locals: `list` [bp-8], `item`/`prev` [bp-0Ch], `head` [bp-10h], `index` [bp-14h], `redraw` [bp-118h], `done` [bp-117h], `coin` [bp-2], `amount` [bp-116h], `s` string[255] [bp-114h].
```pascal
DrawTitledFrame(1, 1, $26, $16, 0, $0A, '');                           { 8900:0cf2 }
index := 0;                                                            { 8900:0d19 }
repeat
  redraw := True;  list := nil;  prev := nil;                          { 8900:0d1e }
  for k := 6 downto 0 do                                               { 8900:0d33 }
    if TreasureMoney[k] > 0 then begin                                 { 8900:0d3c }
      Inc(cnt);                                                        { 8900:0d5c  uninitialised local [bp-12h], never read }
      if list = nil then begin
        GetMem(list, 46);  list^.next := nil;                          { 8900:0d67 }
      end else begin
        prev := list;  GetMem(list, 46);  list^.next := prev;          { 8900:0d85  prepend: the list ends up copper first }
      end;
      Str(TreasureMoney[k], s);                                        { 8900:0db1 }
      list^.text := CoinName[k] + ' ' + s;                             { 8900:0dd5 }
      list^.isHeader := 0;                                             { 8900:0e14 }
    end;
  item := list;  head := list;                                         { 8900:0e25 }
  key := VerticalListMenu('Select type of coin', '', $0D, $0A, $0F,
                          2, 2, $0F, 8, list, True, redraw, index, item);   { 8900:0e3d }
  if (item = nil) or (key = #0) then done := True                      { 8900:0e94  quirk: the list is not freed on exit }
  else begin
    done := False;                                                     { 8900:0eab }
    coin := CoinFromText(item^.text, s);                               { 8900:0eb0 }
    s := 'How much ' + s + 'will you take? ';                          { 8900:0ec2 }
    amount := InputNumber(TreasureMoney[coin], s, $0A);                { 8900:0ef6  max = low word of the pool amount }
    TakeCoins(SelectedChar, amount, coin);                             { 8900:0f15 }
    FreeMenuList(head);                                                { 8900:0f29 }
    PoolHasMoney := 0;  done := True;                                  { 8900:0f33 }
    for k := 0 to 6 do                                                 { 8900:0f3d }
      if TreasureMoney[k] > 0 then begin PoolHasMoney := 1; done := False end;   { 8900:0f46 }
  end;
until done;                                                            { 8900:0f70 }
```

### 8900:0F7E TreasurePoolStatus (H) — stub ov21 e9
`procedure TreasurePoolStatus(var hasMoney [BP+0Ah], hasItems [BP+6]: Boolean)` — RETF 8. Callers: ov04 Temple, ov05 TakeTreasureMenu/TreasureMenu, ov06 Shop.
```pascal
hasMoney := False;  hasItems := False;                                 { 8900:0f84 }
for k := 0 to 6 do                                                     { 8900:0f92 }
  if TreasureMoney[k] <> 0 then hasMoney := True;                      { 8900:0f9b }
if TreasureItems <> nil then hasItems := True;                         { 8900:0fbc }
```

### 8900:0FD2 RollMagicPlus (M)
`function RollMagicPlus: Byte` — RETF. Caller: MakeTreasureItem.
```pascal
r := Roll(1, 20);                                                      { 8900:0fd8 }
if (r >= 1) and (r <= 14) then RollMagicPlus := 1                      { 8900:0fe9  70 % }
else if (r >= 15) and (r <= 19) then RollMagicPlus := 2                { 8900:0ff7  25 % }
else RollMagicPlus := 3;                                               { 8900:1005   5 % }
```

### 8900:1010 MakeTreasureItem (H) — stub ov21 e13
`procedure MakeTreasureItem(typ [BP+0Ah]: Byte; var it [BP+6]: TItem)` — RETF 6. Caller: ecl_op27_Treasure (2F00:1CCD: pushes the type byte, then the address of a local 63-byte item). Builds a random item of item type `typ` (ITEMS table index): name words, magic bonus, weight, count, value and powers.
Local `rec` [bp-4] = start index into `MagicItemTable` (words at DS:0970; record = 8 words at word index rec..rec+7: word1, word2, word3, weight, value, power1..3; table contents in ov21_notes.md (b)).
```pascal
FillChar(it, 63, 0);                                                   { 8900:1016 }
rec := 0;                                                              { 8900:1027 }
FillChar(it.power, 3, 0);  it.next := nil;                             { 8900:1034 }
it.readied := 0;  it.hidden := 6;  it.magic_flag := 0;                 { 8900:1056  hidden 6 = words 1 and 2 hidden }
it.type := typ;                                                        { 8900:106e }
FillChar(it.word, 3, 0);                                               { 8900:1078 }
if (typ in [1..59]) or (typ = 73) or (typ = 77) or (typ = 93) then begin   { 8900:108d  weapons, armour, shield, arrows, bracers, ring of protection }
  it.plus := RollMagicPlus;                                            { 8900:10ab }
  case typ of                                                          { 8900:10b6 }
    21: begin                                                          { javelin }
          if Roll(1, 5) = 5 then rec := $90;                           { 8900:10c1  quirk: $90 is not a record start (see notes): gives "of Elvenkind" words, weight 88, value 25 }
          it.word[3] := $15;  it.word[2] := it.plus + $A1;             { 8900:10d9  "Javelin" "+n" }
        end;
    28: begin it.word[3] := $1C; it.word[2] := it.plus + $A1 end;      { 8900:10fa  "Quarrel +n" }
    50, 51: begin it.word[3] := typ; it.word[2] := $31; it.word[1] := it.plus + $A1; it.hidden := 4 end;   { 8900:111f  "Leather/Padded" "Armor" "+n" }
    52: begin it.word[3] := typ; it.word[2] := $32; it.word[1] := it.plus + $A1; it.hidden := 4 end;       { 8900:1156  "Studded" "Leather" "+n" }
    53..58: begin it.word[3] := typ; it.word[2] := $30; it.word[1] := it.plus + $A1; it.hidden := 4 end;   { 8900:1191  "Ring/Scale/Chain/Splint/Banded/Plate" "Mail" "+n" }
    73: begin it.word[3] := $3D; it.word[2] := it.plus + $A1 end;      { 8900:11c8  "Arrow +n" }
    77: begin                                                          { bracers }
          it.word[3] := $4F;  it.word[2] := $A7;                       { 8900:11e9  "Bracers" "of" }
          it.plus := it.plus * 2 + 2;                                  { 8900:11f9  4, 6 or 8 }
          if it.plus = 4 then it.word[1] := $DD                        { 8900:1213  "AC 6" }
          else if it.plus = 6 then it.word[1] := $DE                   { 8900:1221  "AC 4" }
          else if it.plus = 8 then it.word[1] := $DC;                  { 8900:122f  "AC 2" }
        end;
    93: begin it.word[3] := $42; it.word[2] := $E0; it.word[1] := it.plus + $A1 end;   { 8900:1241  "Ring" "Of Protection" "+n" }
  else
    it.word[3] := typ;  it.word[2] := it.plus + $A1;                   { 8900:1265  "<weapon word = type>" "+n" }
  end;
  it.plus2 := 0;  it.count := 0;                                       { 8900:1285 }
  case typ of                                                          { 8900:1295  weight }
    1, 13, 14, 35:                                   it.weight := 75;
    2, 20, 29, 31, 32, 33, 39, 42, 44, 46, 59:       it.weight := 50;
    3, 24, 40:                                       it.weight := 125;
    4, 15, 23, 34, 43, 45, 51:                       it.weight := 100;
    5, 12, 17, 19, 50:                               it.weight := 150;
    6:                                               it.weight := 15;
    7:                                               it.weight := 30;
    8, 77:                                           it.weight := 10;
    9:                                       begin it.weight := 25; it.count := 5 end;   { darts }
    10, 26, 36:                                      it.weight := 60;
    11, 16, 25, 27, 41, 47:                          it.weight := 80;
    18:                                              it.weight := 175;
    21:                                              it.weight := 20;
    22, 30:                                          it.weight := 40;
    37:                                              it.weight := 35;
    38, 53:                                          it.weight := 250;
    52:                                              it.weight := 200;
    54, 56:                                          it.weight := 400;
    55:                                              it.weight := 300;
    57:                                              it.weight := 350;
    58:                                              it.weight := 450;
    93:                                              it.weight := 1;   { 8900:147e  (47 also listed here, unreachable: matched above) }
  else                                       begin it.weight := 40; it.count := 10 end;  { 8900:1491  e.g. 28 quarrels, 73 arrows }
  end;
  case typ of                                                          { 8900:14a2  value (word, = plus × price) }
    59:     it.value := it.plus * 2500;                                { shield }
    73, 28: it.value := it.plus * 150;
    53, 54: it.value := it.plus * 3000;
    55, 56: it.value := it.plus * 3500;
    57:     it.value := it.plus * 4000;
    58:     it.value := it.plus * 5000;
    77:     it.value := it.plus * 3000;                                { bracers: plus is 4/6/8 here }
  else      it.value := it.plus * 2000;                                { 8900:156e }
  end;
end
else if (typ = 61) or (typ = 62) then begin                            { 8900:1585  scrolls }
  n := Roll(1, 3);                                                     { 8900:1590 }
  if typ = 61 then it.word[3] := $D1 else it.word[3] := $D0;           { 8900:159e  "Magic User Scroll" / "Clerical Scroll" }
  it.word[2] := n + $D1;                                               { 8900:15ba  "With n Spell(s)" }
  it.word[1] := 0;  it.plus := 1;  it.weight := 25;                    { 8900:15c9 }
  it.count := 0;  it.value := 0;                                       { 8900:15e2 }
  for k := 1 to n do begin                                             { 8900:15f3 }
    lvl := Roll(1, 3);                                                 { 8900:160b  spell level 1..3 }
    if typ = 61 then
      case lvl of
        1: sp := Roll(1, 13) + 8;                                      { 8900:162a  MU level 1 ids 9..21 }
        2: sp := Roll(1, 7) + 28;                                      { 8900:1643  29..35 }
        3: sp := Roll(1, 11) + 44;                                     { 8900:165c  45..55 }
      end
    else
      case lvl of
        1: sp := Roll(1, 8);                                           { 8900:1678  cleric level 1 ids 1..8 }
        2: sp := Roll(1, 7) + 21;                                      { 8900:168c  22..28 }
        3: sp := Roll(1, 9) + 35;                                      { 8900:16a5  36..44 }
      end;
    it.power[k] := sp;                                                 { 8900:16b8 }
    it.value := it.value + lvl * 300;                                  { 8900:16c9 }
  end;
end
else case typ of                                                       { 8900:16ef  magic items from MagicItemTable }
  63: rec := $49;                                                      { Gauntlets of Ogre Power }
  67: rec := $91;                                                      { 8900:16fa  Cloak of Elvenkind }
  69: begin r := Roll(1, 10);                                          { 8900:1709  rings }
        if r = 1 then rec := $29                                       { Ring of Feather Falling }
        else if r in [2..6] then rec := $79                            { Ring of Fire Resistance }
        else if r in [7..10] then rec := $81;                          { Ring of Invisibility }
      end;
  78: begin r := Roll(1, 3) + 1;                                       { 8900:1745  wands }
        if r = 1 then rec := $31                                       { quirk: unreachable (Wand of Lightning) }
        else if r = 2 then rec := $41                                  { Wand of Paralyzation }
        else if r = 3 then rec := $71;                                 { Wand of Fireballs; r = 4 → rec stays 0 }
      end;
  79: rec := $39;                                                      { 8900:1778  Wand of Magic Missiles }
  84: rec := $09;                                                      { 8900:1783  Potion of Giant Strength }
  92: rec := $61;                                                      { 8900:178d  Cloak of Displacement }
  71: begin r := Roll(1, 11);                                          { 8900:1797  potions }
        if r in [1..5] then rec := $11                                 { Potion of Healing }
        else if r in [6..8] then rec := $01                            { Potion Extra Healing }
        else if r = 9 then rec := $19                                  { Potion of Speed }
        else if r = 10 then rec := $51;                                { Keoghtum's Ointment; r = 11 → rec stays 0 }
      end;
  70: begin r := Roll(1, 10);                                          { 8900:17dc }
        if r in [1..7] then rec := $59                                 { Necklace of Missiles }
        else if r in [8..10] then rec := $89;                          { Bag of Holding }
      end;
end;
if rec <> 0 then begin                                                 { 8900:180b }
  for k := 0 to 2 do it.word[k+1] := Lo(MagicItemTable[rec + k]);     { 8900:1814 }
  it.plus := 1;  it.plus2 := 1;                                        { 8900:1848 }
  if rec = $61 then begin it.plus := 2; it.plus2 := 2 end;             { 8900:1858  cloak of displacement }
  it.weight := MagicItemTable[rec + 3];                                { 8900:186e }
  it.count := 0;                                                       { 8900:1885 }
  it.value := MagicItemTable[rec + 4];                                 { 8900:188d }
  for k := 1 to 3 do it.power[k] := Lo(MagicItemTable[rec + 4 + k]);  { 8900:18a4 }
end;
```
`{ quirk: wand roll 4 and potion roll 11 leave rec = 0 → an item with only type, hidden = 6 and zero words/weight/value; the javelin "of Lightning" chance reads a misaligned record. Faithful ports must keep these. }`

### 8900:19B2 AppraiseGems (H) — stub ov21 e14
`procedure AppraiseGems(var changed [BP+6]: Boolean)` — RETF 4. Callers: ov04 Temple, ov06 Shop ("Appraise").
Locals: `gemStr` string[40] [bp-29h], `jewStr` string[40] [bp-52h], `opts` string[40] [bp-7Ch], `key` [bp-53h], `done` [bp-0B3h], `noKeep` [bp-0B5h], `ext` [bp-0B4h], `it` [bp-0B2h], `p` [bp-0AEh], `room` [bp-0AAh], `value` word [bp-0A8h], `r` [bp-0A6h].
```pascal
changed := True;                                                       { 8900:19b9 }
if (SelectedChar^.money[5] = 0) and (SelectedChar^.money[6] = 0) then begin   { 8900:19c0  gems, jewelry }
  ShowTimedBottomMessage('No Gems or Jewelry');                        { 8900:19d8 }
  changed := False;                                                    { 8900:19ed }
  exit;
end;
repeat
  if (SelectedChar^.money[5] = 0) and (SelectedChar^.money[6] = 0) then done := True   { 8900:19f7  leaves without RecalcCharacter }
  else begin
    done := False;                                                     { 8900:1a17 }
    Str(SelectedChar^.money[5], gemStr);                               { 8900:1a1c }
    Str(SelectedChar^.money[6], jewStr);                               { 8900:1a3a }
    case SelectedChar^.money[5] of                                     { 8900:1a58 }
      0: gemStr := '';
      1: gemStr := gemStr + ' Gem';                                    { 8900:1a71 }
    else gemStr := gemStr + ' Gems';                                   { 8900:1a9b }
    end;
    case SelectedChar^.money[6] of                                     { 8900:1ac3 }
      0: jewStr := '';
      1: jewStr := jewStr + ' piece of Jewelry';                       { 8900:1adc }
    else jewStr := jewStr + ' pieces of Jewelry';                      { 8900:1b06 }
    end;
    ClearTextRectangle(1, 1, $26, $16);                                { 8900:1b2e }
    DrawCharacterName(SelectedChar, 1, 1, False);                      { 8900:1b3f }
    DrawText(1, 7, $0F, 'You have a fine collection of:');             { 8900:1b55 }
    DrawText(1, 9, $0F, gemStr);                                       { 8900:1b73 }
    DrawText(1, $0A, $0F, jewStr);                                     { 8900:1b86 }
    opts := '';                                                        { 8900:1b99 }
    if SelectedChar^.money[5] <> 0 then opts := '  Gems';              { 8900:1b9d }
    if SelectedChar^.money[6] <> 0 then opts := opts + '  Jewelry';    { 8900:1bbc }
    opts := opts + ' Exit';                                            { 8900:1bf0 }
    key := HorizontalMenu('Appraise : ', opts, $0D, $0A, $0F, True, False, ext);   { 8900:1c18 }
    if key = 'G' then begin                                            { 8900:1c4a }
      if SelectedChar^.money[5] <> 0 then begin                        { 8900:1c54 }
        Dec(SelectedChar^.money[5]);                                   { 8900:1c63 }
        r := Roll(1, 100);                                             { 8900:1c6c }
        case r of                                                      { 8900:1c7b }
          1..25:  value := 10;
          26..50: value := 50;
          51..70: value := 100;
          71..90: value := 500;
          91..99: value := 1000;
          100:    value := 5000;
        end;
        Str(value, gemStr);                                            { 8900:1cd9 }
        gemStr := 'The Gem is Valued at ' + gemStr + ' gp.';           { 8900:1cf2 }
        DrawText(1, $0C, $0F, gemStr);                                 { 8900:1d24 }
        if WouldOverload(SelectedChar, 1, room) or (SelectedChar^.item_count >= 16) then begin   { 8900:1d37 }
          opts := 'Sell';  noKeep := True;                             { 8900:1d5d }
        end else begin
          opts := 'Sell Keep';  noKeep := False;                       { 8900:1d78 }
        end;
        key := HorizontalMenu('You can : ', opts, $0D, $0A, $0F, True, False, ext);    { 8900:1d91 }
        if (key = 'K') and not noKeep then begin                       { 8900:1dc4 }
          GetMem(it, 63);  FillChar(it^, 63, 0);                       { 8900:1dd7 }
          it^.next := nil;  it^.readied := 0;                          { 8900:1dfa }
          it^.word[3] := $65;  it^.word[2] := 0;  it^.word[1] := 0;    { 8900:1e11  "Gem" }
          it^.type := 70;  it^.value := value;  it^.weight := 1;  it^.hidden := 0;   { 8900:1e2c }
          p := SelectedChar^.items;                                    { 8900:1e54 }
          if p = nil then p := it                                      { 8900:1e6a  quirk: only the local is set — the gem is lost when the character has no items }
          else begin
            while p^.next <> nil do p := p^.next;                      { 8900:1e86 }
            p^.next := it;                                             { 8900:1eaa }
          end;
        end else begin
          value := value div 5;                                        { 8900:1ec0  sold for platinum (5 gp each) }
          AddPlatinumOrPool(value);                                    { 8900:1ecf }
        end;
      end;
    end
    else if key = 'J' then begin                                       { 8900:1eda }
      if SelectedChar^.money[6] <> 0 then begin                        { 8900:1ee1 }
        Dec(SelectedChar^.money[6]);                                   { 8900:1ef0 }
        r := Roll(1, 100);                                             { 8900:1ef9 }
        case r of                                                      { 8900:1f08  Trunc(Random(n)) + base }
          1..10:   value := Random(900)  + 100;
          11..20:  value := Random(1000) + 200;
          21..40:  value := Random(1500) + 300;
          41..50:  value := Random(2500) + 500;
          51..70:  value := Random(5000) + 1000;
          71..90:  value := Random(6000) + 2000;
          91..100: value := Random(10000) + 2000;
        end;
        Str(value, jewStr);                                            { 8900:202c }
        gemStr := 'The Jewel is Valued at ' + jewStr + ' gp.';         { 8900:2045 }
        DrawText(1, $0C, $0F, gemStr);                                 { 8900:2077 }
        if WouldOverload(SelectedChar, 1, room) or (SelectedChar^.item_count >= 16) then begin   { 8900:208a }
          opts := 'Sell';  noKeep := True;                             { 8900:20b0 }
        end else begin
          opts := 'Sell Keep';  noKeep := False;                       { 8900:20cb }
        end;
        key := HorizontalMenu('You can : ', opts, $0D, $0A, $0F, True, False, ext);    { 8900:20e4 }
        if (key = 'K') and not noKeep then begin                       { 8900:2117 }
          { same item construction as for a gem, with it^.word[3] := $D6 ("Jewelry") }  { 8900:212a .. 2211 (same quirk) }
        end else begin
          value := value div 5;                                        { 8900:2213 }
          AddPlatinumOrPool(value);                                    { 8900:2222 }
        end;
      end;
    end
    else if (key = 'E') or (key = #0) then done := True;               { 8900:222c }
    RecalcCharacter(SelectedChar);                                     { 8900:2239 }
  end;
until done;                                                            { 8900:2246 }
```
Note: any key other than K at "You can :" (including Esc / #0) sells.

### 8900:2256 ov21_init (H)
`procedure ov21_init` — empty unit initialiser (PUSH BP / MOV BP,SP / POP BP / RETF), called from the main program's init chain via stub entry 0.  { 8900:2256 }

---

## ov06 (3E00) — shop

Unit: ov06, analysis segment 3E00, 5 routines (functions.tsv): 3E00:0030, 3E00:0239 (entry e2), 3E00:0361, 3E00:053E (entry e1), 3E00:0798 (init).
Callers: **Shop** 3E00:053E ← ECL `COMBAT` op 24h (ecl_op24_Combat 2F00:17CA) when no monsters are present and the shop flag ECL VM 6E6C = 1 (ECL_VM.md op 24). **AddItemToChar** 3E00:0239 (stub e2) ← ov05 TakeLootItems 3900:0C06 (call at 3900:0C60, treasure) as well as ShopBuy.
The shop's wares are the treasure list `TreasureItems` (DS:6810, filled by the ECL script with `TREASURE`/items before op 24h); the treasure money pool `TreasureMoney` (DS:67F4, 7 coin LongInts copper..jewelry, SAVES.md money order) is emptied on entry and used by Take/Pool/Share (ov21 routines).
Sources: `decode/listings/ov06.lst` (evidence), CS literals from `decode/bin/ghidra/ov06.bin`; `ov06.c`, PARTY.draft.md ## ov06 as checklist only.
ov21 callees (PARTY lane, other part) are written `ov21_XXXX` with their behaviour from ov21.lst: `TreasurePoolStatus(var hasMoney, var hasItems)` pool status; `MoneyValueInGold(var money): LongInt` value of a 7-coin money block in gold; `SetCharMoneyGold(gold: Word)` set SelectedChar's coins copper..platinum to `gold` gold pieces as platinum (`gold div 5`) + gold (`gold mod 5`); `SetPoolMoneyGold(gold: Word)` the same for the pool `TreasureMoney`; `TakeMoney` Take (coin menu), `PoolMoney` Pool, `ShareMoney` Share, `AppraiseGems(var redraw)` Appraise gems/jewelry.

---

### 3E00:0030 ShopItemsMenu (H)
`procedure ShopItemsMenu(var key [BP+12h]: Char; var chosen [BP+0Eh]: PItem; var cur [BP+0Ah]: PItem; var index [BP+6]: Integer)` — RETF 10h. Caller: ShopBuy. Callees: System.@StrAssign/@StrLong/@StrCopy, DrawTitledFrame{03F1:02E8}, VerticalListMenu (ov25 9D00:0D9A via stub e4), BuildItemName{00BA:0442}.
Temporarily replaces every ware's name by a 30-character line "name … price" (price right-aligned in columns 1..30 of the line), shows the scrolling list "Items:" with the bottom menu "Buy … Exit" inside a frame titled "Shop", then rebuilds the real item names. The item list is used directly as a menu list (TItem name +0, +29h = menu `isHeader` byte = the last name byte, next +2Ah — the layouts coincide).
```pascal
redraw := true;                                                    { 3e00:0036 }
item := TreasureItems;                                             { 3e00:003a }
while item <> nil do begin                                         { 3e00:0047 }
  line := '                              ';                        { 3e00:0060  string[30], 30 blanks (CS:0000) }
  if item^.value = 0 then item^.value := 1;                        { 3e00:0068  quirk: free wares cost 1 gp (written into the item) }
  Str(LongInt(item^.value):0, num);                                { 3e00:008f  string[16] }
  for k := 1 to Length(num) do                                     { 3e00:00a0 }
    line[30 - Length(num) + k] := num[k];                          { 3e00:00d0  right-aligned to column 30 }
  for k := 1 to Length(item^.name) do line[k] := item^.name[k];    { 3e00:00ea / 010d  name over the left part }
  item^.name := line;                                              { 3e00:0126  StrAssign(40) }
  item^.name[0] := Chr(30);                                        { 3e00:012e }
  item := item^.next;                                              { 3e00:0132 }
end;
DrawTitledFrame(1, 1, 38, 22, 0, 15, 'Shop');                      { 3e00:0167  pushes 1, 1, 26h, 16h, 0, 0Fh, s }
list := TreasureItems;                                             { 3e00:016c  local }
key := VerticalListMenu('Items: ', 'Buy', $0D, $0A, $0F, 1, 4, 38, 22, list, true, redraw, index, cur);   { 3e00:01c4  cur = [BP+0Ah]^ (var item) }
chosen := cur;                                                     { 3e00:01cf }
item := TreasureItems;                                             { 3e00:01e3 }
while item <> nil do begin                                         { 3e00:01f0 }
  BuildItemName(nil, item, 0, 0, false, false);                    { 3e00:0210  restore the name }
  item := item^.next;                                              { 3e00:0215 }
end;
```
Note: an item name longer than 30 characters overwrites the price (the name loop writes past position 30 into the line buffer; only 30 characters are kept) — L for the visible effect.

### 3E00:0239 AddItemToChar (H) — stub ov06 e2
`procedure AddItemToChar(item [BP+0Ah]: PItem; var failed [BP+6]: Boolean)` — RETF 8. Callers: ShopBuy, ov05 TakeLootItems (3900:0C06, call 3900:0C60). Callees: ItemOverloads (ov19 7F00:275B via stub e9), ShowTimedBottomMessage{00BA:1693}, System.GetMem, System.@CopyBytes, RecalcCharacter{00BA:0BB8}.
Appends a copy of `item` (63 bytes, SAVES.md §4) to `SelectedChar`'s item list unless the character cannot carry it.
```pascal
if ItemOverloads(SelectedChar, item) then begin                    { 3e00:024d }
  ShowTimedBottomMessage('OverLoaded');                            { 3e00:0265 }
  failed := true;                                                  { 3e00:026a }
  exit;                                                            { 3e00:0271  no RecalcCharacter on this path }
end;
failed := false;                                                   { 3e00:0274 }
p := SelectedChar^.items;                                          { 3e00:027b  +C8h }
if p = nil then begin
  p := GetMem($3F);                                                { 3e00:029b }
  p^ := item^;                                                     { 3e00:02b4  CopyBytes 3Fh }
  p^.next := nil;                                                  { 3e00:02bc }
  SelectedChar^.items := p;                                        { 3e00:02cc }
end else begin
  while p^.next <> nil do p := p^.next;                            { 3e00:02dc }
  q := GetMem($3F);                                                { 3e00:0300 }
  q^ := item^;                                                     { 3e00:0319 }
  q^.next := nil;                                                  { 3e00:0321 }
  p^.next := q;                                                    { 3e00:0331 }
end;
RecalcCharacter(SelectedChar);                                     { 3e00:0344 }
```

### 3E00:0361 ShopBuy (H)
`procedure ShopBuy` — RETF. Caller: Shop ('B'). Callees: ShopItemsMenu, MoneyInGold (ov19 7F00:28BE via stub e11), AddItemToChar, SetCharMoneyGold, MoneyValueInGold, SetPoolMoneyGold, ShowTimedBottomMessage.
Buy loop: pay from the buyer's own coins if they suffice, else from the money pool; the remaining money is re-minted as platinum + gold.
```pascal
chosen := nil;                                                     { 3e00:0367 }
cur := TreasureItems;  index := 1;                                 { 3e00:036f / 037c }
repeat
  ShopItemsMenu(key, chosen, cur, index);                          { 3e00:0396 }
  if (key <> 'B') and (key <> #13) then leave := true              { 3e00:0399 / 039f  Exit, Esc }
  else begin
    leave := false;                                                { 3e00:03ac }
    price := chosen^.value;                                        { 3e00:03b0  word }
    gold := Word(MoneyInGold(SelectedChar));                       { 3e00:03c2  quirk: only the low word of the LongInt is kept }
    if price <= gold then begin                                    { 3e00:03ca }
      AddItemToChar(chosen, failed);                               { 3e00:03de }
      if not failed then begin
        gold := gold - price;                                      { 3e00:03e7 }
        SetCharMoneyGold(gold);                                           { 3e00:03f3  SelectedChar's coins := gold (as platinum + gold) }
      end;
    end else begin
      pool := MoneyValueInGold(TreasureMoney);                            { 3e00:03ff  LongInt, pool value in gold }
      if LongInt(price) <= pool then begin                         { 3e00:040a .. 0419 }
        AddItemToChar(chosen, failed);                             { 3e00:0427 }
        if not failed then begin
          pool := pool - price;                                    { 3e00:0430 }
          SetPoolMoneyGold(Word(pool));                                   { 3e00:044c  pool coins := pool (low word) }
        end;
      end else
        ShowTimedBottomMessage('Not enough Money.');               { 3e00:0462 }
    end;
  end;
until leave;                                                       { 3e00:0467 }
```
Notes (H): the buyer is always `SelectedChar` (switch with Home/End in the main shop menu); the pool is used only if the buyer alone cannot pay — the buyer's own money is then untouched; buying converts all copper/silver/electrum coins of the payer into platinum + gold (value preserved in whole gold pieces, fractions lost by MoneyInGold's rounding).

### 3E00:053E Shop (H) — stub ov06 e1
`procedure Shop` — RETF. Caller: ecl_op24_Combat (2F00:17CA). Callees: RedrawCurrentMode{00BA:27D9}, DrawPartyRoster{00BA:0767}, System.FillChar, BuildItemName, TreasurePoolStatus, HorizontalMenu (ov25 e2), ShopBuy, ViewMenu (ov19 7F00:0AB3 via stub e5), TakeMoney, PoolMoney, ShareMoney, AppraiseGems, DrawWrappedText{0709:0768}, MenuSelect (ov07 4300:1684 via stub e13), ClearTextRectangle{0709:0DD3}, CycleSelectedChar (ov19 7F00:27DF via stub e10).
```pascal
game_Mode := 1;                                                    { 3e00:0545 }
RedrawCurrentMode;                                                 { 3e00:054a }
DrawPartyRoster(SelectedChar);                                     { 3e00:0557 }
FillChar(TreasureMoney, $1C, 0);                                   { 3e00:0568  empty money pool }
prompt := '';                                                      { 3e00:056d  length byte [BP-2Bh] := 0 }
g_6DC0 := 0;                                                       { 3e00:0571  (also cleared by Temple; set by ov21 pool routines, role L) }
leave := false;                                                    { 3e00:0576 }
item := TreasureItems;
while item <> nil do begin BuildItemName(nil, item, 0, 0, false, false); item := item^.next end;   { 3e00:05a7 }
repeat
  TreasurePoolStatus(hasMoney, hasItems);                                   { 3e00:05c9 }
  if hasMoney then opts := 'Buy View Take Pool Share Appraise Exit'   { 3e00:05e2 }
  else opts := 'Buy View Pool Appraise Exit';                      { 3e00:05f7 }
  key := HorizontalMenu(prompt, opts, $0D, $0A, $0F, true, false, ext);   { 3e00:061a }
  case key of
    'B': ShopBuy;                                                  { 3e00:062a }
    'V': ViewMenu(ext);                                            { 3e00:0639  quirk: passes the menu's ext flag as ViewMenu's var turnUsed }
    'T': TakeMoney;                                                { 3e00:0645  Take money from the pool }
    'P': if not ext then PoolMoney;                                { 3e00:0651  Pool (not the cursor-down scan code 50h) }
    'S': ShareMoney;                                                { 3e00:0663  Share }
    'A': AppraiseGems(appraised);                                     { 3e00:0674  Appraise }
    'E': begin                                                     { 3e00:067c }
           TreasurePoolStatus(hasMoney, hasItems);                          { 3e00:068d }
           if not hasMoney then leave := true                      { 3e00:073b }
           else begin
             DrawWrappedText(1, 17, 38, 22, 10, true,
               'As you Leave the Shopkeeper says, "Excuse me but you have Left Some Money here."  ');   { 3e00:06d0 }
             DrawWrappedText(1, 17, 38, 22, 15, false, 'Do you want to go back and get your Money?');   { 3e00:06f6 }
             if MenuSelect(prompt, '~Yes ~No', $0D, $0A, $0F, false, 0) = 1 then leave := true   { 3e00:0714 / 071c  index 1 = No (MenuHotkeys: Y=0, N=1) }
             else ClearTextRectangle(1, 17, 38, 22);               { 3e00:0734 }
           end;
         end;
    'G', 'O': CycleSelectedChar(key);                              { 3e00:0749 / 0758  Home / End scan codes }
  end;
  if (key = 'B') or (key = 'T') then RedrawCurrentMode             { 3e00:075d / 0768 }
  else if (key = 'A') and appraised then RedrawCurrentMode;        { 3e00:076f / 0779 }
  DrawPartyRoster(SelectedChar);                                   { 3e00:0786 }
until leave;                                                       { 3e00:078b }
```
Quirks (H): the menu's extended-key flag is ignored for every option except 'P', so function/cursor keys whose scan code equals an option letter act as that option (e.g. Del = 53h 'S' → Share, F8 = 42h 'B' → Buy, F7 = 41h 'A' → Appraise); Home/End ('G'/'O' with ext) select the previous/next party member. Money left in the pool is lost if the party answers No (the pool is cleared on the next shop/temple entry).

### 3E00:0798 ov06_init (H)
Empty unit initialiser, called from the main init chain (0000:00D3) via stub ov06 e0. `{ 3e00:0798 }`

---

# ov12 (seg 5C00) — effect handlers (conditions, spell/item/monster effects) — part A: 5C00:0000..1A18 (FINAL pseudocode, lane por-mod-party)

Unit: ov12, analysis segment 5C00, 127 routines (functions.tsv), 117 stub entries. Part A = the 70 routines below 5C00:1A19 (helpers 0000/001F/0058/0FAC/101D/1545/15EB + effect handlers for types 01h..4Eh); part B (`ov12b.pas.md`) = 1A19..38A9 including the table builder InstallEffectHandlers.
Role (H): **ov12 is not training/level-up code** (provisional area map). It holds one far procedure per active-effect type (TChar `effects` +7Fh, 9-byte TEffect, SAVES.md §5). `InstallEffectHandlers` stores them in `EffectHandler{g_682C}` (entry for type t at DS:6828h+4t); they are called only through `CallEffectHandler{9800:0000}` (ov24): from `CallEffectHooks{9800:02FA}` (mode 0, per hook event) and from `RemoveEffect{9800:0026}` / `HealCharacter{9800:175D}` (mode 1, when the effect's `callOnRemove` +4 ≠ 0 — this is also how timed effects "tick": a handler re-adds its own effect when it is removed on expiry). Type → handler table and event lists: combat_parts/ov24.pas.md (H). The strings "starts to train" / "is hardier" belong to effect types 04h/07h (see below).
Sources: `decode/listings/ov12.lst` (evidence), `ov12.c` (aid), PARTY.draft.md (checklist). Pascal-string literals are in the code segment just before each routine (offsets in `[ps]` annotations).

Conventions (as VIEW.pas.md / combat_parts)
- **Signatures in Pascal order**: first parameter = highest BP offset (pushed first); parameters as `name [BP+xx]`. Every call below was written from its PUSH sequence.
- `{ seg:off }` = first instruction of the statement (or of the call that implements it). `{ quirk: … }` = behaviour a port must copy.
- **Every effect handler** has the signature `procedure EffXxx(c [BP+0Ch]: PChar; e [BP+8]: PEffect; mode [BP+6]: Byte)` (RETF 0Ah) — `c` = owner of the effect (in area effects: the character standing in the area), `e` = the effect record (may be another member's, see RunEffectIfActive), `mode` 0 = hook event / apply, 1 = removed. Handlers that ignore a parameter still take it. Only the handler's *types* and *events* are listed per routine: "types 08h, 2Dh — events 0Bh, 0Ch" (events from CallEffectHooks, ov24; "no event" = runs only when removed, i.e. on expiry/cure with callOnRemove ≠ 0).
- Hook events (meaning from the ov24/ov13/ov09 callers): 01h target may be attacked?, 02h/03h after a hit with attack slot 1/2, 04h attacker's damage, 05h target's damage (melee), 06h damage taken (DamageCharacter), 07h/0Fh turn checks (ov08 4800:01F6/0666), 08h combat start (StartCombat), 0Ah attacker's to-hit, 0Bh target before AC, 0Ch saving throw, 0Dh went down, 10h target of a to-hit roll, 11h morale (ov09 4D00:10D7), 12h stat recalculation (StatValue = attacks or movement), 13h once per round (ov08 4800:0880).
- Hook communication globals (ov24/ov13 names): `SaveRoll{g_6816}`, `EffectToApply{g_6817}`, `DamageAmount{g_6818}`, `DamageType{g_6819}` (1 fire, 2 cold, 4 electricity, 8 magic, 10h acid), `StatValue{g_681A}`, `StatKind{g_681D}` (0 attacks, 1 movement), `LastDiceCount{g_681C}`, `AttackBlocked{g_681E}`, `SpellArea{g_6820}`, `AttackRollValue{g_6822}` (d20, may go negative = miss), `SlotHits{g_6823}`, `cure_InProgress{g_681F}` (magic_names.json). Introduced here: `sp_Current{g_681B}`, `MoraleValue{g_6825}`, `HookOpponent{g_6826}`, `sc_List{g_6DBB}`, `CloudSquareDir{g_290D}`, name tables `GnomeFoeNames{g_0332}`, `DwarfFoeNames{g_0372}`, `GiantFoeNames{g_03F2}` (see ov12a_notes.md).
- `cr(c)` = `c^.combatant` (+108h), the combat record (ov13 names): `+1 mayCast`, `+2 mayUseItems` (ov09 names, M), `+3 initiative`, `+6 moveLeft`, `+0Ah target` (far ptr TChar), `+10h turned` (forced to flee).
- TChar fields by SAVES.md §3 names; TEffect = `type +0, duration +1 (Word), p3 +3, callOnRemove +4, next +5`; TItem by SAVES.md §4.
- In hook context `SelectedChar{g_5D92}` is the *other* party of the roll (the attacker when `c` is the target, the caster for saves) — evidence: protection/size handlers below test SelectedChar's alignment/race while `c` is the defender (M).
- Callees: ov24 names (`AddEffect(c, type, duration, p3, callOnRemove)`, `RemoveEffect(c, type, e)`, `CallEffectHandler(type, c, e, mode)`, `SavingThrow(c, saveType, bonus)`, `Roll(count, sides)`, `RollDice(count, sides)`, `DamageCharacter(c, dmg, saveEffect, saved)`, `HealCharacter(c, amount, onlyIfHurt)`, `ReviveCombatant(c, hp)`, `RemoveCombatEffects(c)`, `CallEffectHooks(event, c)`, `StrengthCode`, `DecodeStrength`); resident by ENGINE names (`ShowCharacterMessage(c, s, combatRow, wait)`, `ShowTimedBottomMessage(s)`, `ShowCombatMessageAnimation(c, spell, s)`, `HasEffect(c, id, var e)`, `MessageDelay`, `ClearCharacterMessage`, `DrawPartyRoster(sel)`, `DrawCharacterSummary(c)`, `RecalcCharacter(c)`, `LoseItem(c, item)`, `AppendItemCopy(c, item)`, `CountActiveSides`, `ClearCombatantActionFlags(c)`, `TargetDistance(c, target)`, `GetMissileAmmo(c, var ammo)`); VIEW names `RemoveCombatant{BB00:0E11}(c)`, `CombatantIndex{BB00:0C5F}(c)`, `cm_Map{g_6716}`, `cb_Char{g_65B9}` (element i at 65B9h+4i).

---

## Helpers

### 5C00:0000 CancelDamageAndEffect (M)
`procedure CancelDamageAndEffect(type [BP+6]: Byte)` — RETF 2. Callers: MagicResistance, EffMirrorImage, EffFireResistance, EffShield, EffResistSleepCharm90, EffImmuneSleepCharm, EffImmuneHold, EffImmuneCold, EffImmunePoisonParalysis, EffImmuneFire, EffResistSleepCharm30, EffUndeadImmunities.
Vetoes the pending damage and the pending new effect: unconditionally for `type = 0`, else only when the effect about to be applied is `type` (ApplyEffect reports "is Unaffected" when EffectToApply = 0, ov24).
```pascal
if (type = 0) or (EffectToApply = type) then begin     { 5c00:0003 }
  DamageAmount := 0;                                   { 5c00:0011 }
  EffectToApply := 0;                                  { 5c00:0016 }
end;
```

### 5C00:001F AddEffectUnlessCuring (M)
`function AddEffectUnlessCuring(c [BP+0Ch]: PChar; type [BP+0Ah], p3 [BP+8]: Byte; duration [BP+6]: Word): Boolean` — RETF 0Ah. Callers: EffHpLossTick, EffWeakness, EffHpDrainTick, EffSlowHeal, EffMummyRot, EffRegenerate, EffReviveCheck, EffTrollRise.
Used by the "ticking" effects to re-add themselves when they expire; does nothing while a cure is removing effects (`cure_InProgress`, set by the cure spells/temple, ov04/ov22).
```pascal
if cure_InProgress <> 0 then result := false              { 5c00:0025 }
else begin
  result := true;                                          { 5c00:0032 }
  AddEffect(c, type, duration, p3, 1);                     { 5c00:004a  callOnRemove = 1 }
end;
AddEffectUnlessCuring := result;                           { 5c00:004f }
```

### 5C00:0058 ApplyFatalStatus (M)
`procedure ApplyFatalStatus(c [BP+0Ch]: PChar; status [BP+0Ah]: Byte; msg [BP+6]: string[40])` — RETF 0Ah. Callers: PoisonOpponent, DrainLevels, EffSlowPoisonEnd, EffAnimatedEnd, EffMummyRot, EffFallsDead. Callees: ShowCharacterMessage, RemoveCombatEffects, CallEffectHooks, RemoveCombatant, MessageDelay, ClearCharacterMessage, DrawPartyRoster.
Shows `msg` and puts `c` out of action with `status` (6 Dead, 8 Gone …) — unless it is already Dead/Stoned/Gone.
```pascal
s := msg;                                                  { 5c00:006c }
ShowCharacterMessage(c, s, 10, false);                     { 5c00:0082 }
if c^.status in [7, 6, 8] then exit;                       { 5c00:0087  quirk: the message stays on screen (no delay/clear) }
c^.status := status;                                       { 5c00:00a3 }
c^.active := 0;                                            { 5c00:00ab }
c^.hp := 0;                                                { 5c00:00b4 }
RemoveCombatEffects(c);                                    { 5c00:00c0  RemoveCombatEffects }
CallEffectHooks($0D, c);                                   { 5c00:00ce  "went down" hooks may revive }
if c^.active = 0 then RemoveCombatant(c);                  { 5c00:00d6 }
MessageDelay;                                              { 5c00:00e9 }
ClearCharacterMessage;                                     { 5c00:00ee }
if game_Mode <> 5 then DrawPartyRoster(SelectedChar);      { 5c00:00f3 }
```

---

## Effect handlers 01h..12h

### 5C00:010D EffBless (M)
Type 01h — events 0Ah, 11h. +1 to hit, +5 morale (AD&D Bless; name M from the values).
```pascal
MoraleValue := MoraleValue + 5;                            { 5c00:0110 }
AttackRollValue := AttackRollValue + 1;                    { 5c00:0115 }
```

### 5C00:011D EffCurse (M)
Type 02h — events 0Ah, 11h. The inverse of Bless.
```pascal
if MoraleValue < 5 then MoraleValue := 0                   { 5c00:0120 }
else MoraleValue := MoraleValue - 5;                       { 5c00:012e }
AttackRollValue := AttackRollValue - 1;                    { 5c00:0133 }
```

### 5C00:013B EffBonusVsUndead (M)
Type 03h — events 04h, 0Ah. +2 to hit and +2 damage against a target whose `creature_type` is 4 (undead, cf. Animate Dead sets 4; SAVES.md).
```pascal
HookOpponent := cr(c)^.target;                             { 5c00:013e }
if HookOpponent^.creature_type = 4 then begin              { 5c00:0155 }
  AttackRollValue := AttackRollValue + 2;                  { 5c00:0161 }
  DamageAmount := DamageAmount + 2;                        { 5c00:0166 }
end;
```

### 5C00:017F EffStartsToTrain (L)
Type 04h — no event (runs when the effect is removed). Shows "starts to train" and starts effect 07h for 43 200 (A8C0h) time units, whose end is "is hardier" (EffHardier). Where effect 04h is created: not in ov12 (unknown).
```pascal
ShowCharacterMessage(c, 'starts to train', 10, true);      { 5c00:01a0 }
AddEffect(c, 7, $A8C0, $FF, 1);                            { 5c00:01b8 }
```

### 5C00:01C3 EffFlameTongue (M)
Type 06h — events 04h, 0Ah. Bonus to hit and damage by the target's creature type, damage becomes fire+magic. The bonus pattern (+1 type 0Ah, +2 types 9/0Ch, +3 type 4 = undead) is the AD&D Flame Tongue sword's (name M; meaning of creature types 9, 0Ah, 0Ch L).
```pascal
HookOpponent := cr(c)^.target;                             { 5c00:01c9 }
case HookOpponent^.creature_type of                        { 5c00:01e4 }
  $0A:     b := 1;                                         { 5c00:01ed }
  9, $0C:  b := 2;                                         { 5c00:01fb }
  4:       b := 3;                                         { 5c00:0205 }
else       b := 0;                                         { 5c00:020b }
end;
AttackRollValue := AttackRollValue + b;                    { 5c00:020f }
DamageAmount := DamageAmount + b;                          { 5c00:0216 }
DamageType := 9;                                           { 5c00:021d  fire + magic }
```

### 5C00:0233 EffHardier (M)
Type 07h — no event (end of the 30-day effect started by EffStartsToTrain). CON + 1 and HP rebuilt; at CON 20 the character instead gets effect 3Eh (EffRegenerate, 1 HP per 60).
```pascal
ShowCharacterMessage(c, 'is hardier', 10, true);           { 5c00:0254 }
c^.con := c^.con + 1;                                      { 5c00:025c }
if c^.con >= 20 then begin                                 { 5c00:0263 }
  AddEffect(c, $3E, $3C, $FF, 1);                          { 5c00:027d }
  exit;
end;
old := c^.hp_max - c^.hp_rolled;                           { 5c00:0285  the current CON bonus total (byte) }
perLvl := 0;                                               { 5c00:029f }
if c^.con < 15 then exit;                                  { 5c00:02a3 }
for i := 0 to 7 do                                         { 5c00:02b0 }
  if c^.level[i] > 0 then                                  { 5c00:02c2  signed }
    if i = 2 then perLvl := perLvl + c^.level[i] * (c^.con - 15)   { 5c00:02ca  fighter }
    else if c^.con > 15 then perLvl := perLvl + c^.level[i] * 2    { 5c00:02f4 }
    else perLvl := perLvl + c^.level[i];                   { 5c00:0314 }
if perLvl = 0 then perLvl := 1;                            { 5c00:032b }
old := old div perLvl;                                     { 5c00:0335  signed IDIV, byte result }
if (c^.con >= 17) and (ShortInt(c^.level[2]) <= 0) then exit;   { 5c00:0347  CON 17+ adds only for fighters; 0354 CMP byte [DI+98h],0 / 035A JLE = signed (#verify-1) }
c^.hp_max := c^.hp_max + old;                              { 5c00:035c }
c^.hp := c^.hp + old;                                      { 5c00:0366 }
```
{ quirk: the increase is `(hp_max − hp_rolled) div perLvl`, i.e. computed from the old bonus total, not from a CON table; port verbatim. }

### 5C00:0377 EffProtFromEvil (M)
Types 08h, 2Dh (2Dh = the 10-ft-radius area variant, see RunEffectIfActive) — events 0Bh, 0Ch. Against an evil opponent (SelectedChar alignment LE/NE/CE): +2 on c's save, −2 on the attack roll.
```pascal
if SelectedChar^.alignment in [2, 5, 8] then begin         { 5c00:037a }
  SaveRoll := SaveRoll + 2;                                { 5c00:039e }
  AttackRollValue := AttackRollValue - 2;                  { 5c00:03a3 }
end;
```

### 5C00:03AC EffProtFromGood (M)
Types 09h, 2Eh — events 0Bh, 0Ch. Same against good opponents (LG/NG/CG).
```pascal
if SelectedChar^.alignment in [0, 3, 6] then begin         { 5c00:03af }
  SaveRoll := SaveRoll + 2;                                { 5c00:03d3 }
  AttackRollValue := AttackRollValue - 2;                  { 5c00:03d8 }
end;
```

### 5C00:03E1 EffResistCold (M)
Type 0Ah — events 06h, 0Ch. Cold damage halved, +3 save (both only when the damage kind has bit 2 = cold; for a save hook DamageType is the pending damage's kind).
```pascal
if DamageType and 2 <> 0 then begin                        { 5c00:03e4 }
  DamageAmount := DamageAmount shr 1;                      { 5c00:03ed }
  SaveRoll := SaveRoll + 3;                                { 5c00:03f7 }
end;
```

### 5C00:0400 EffCharm (M)
Type 0Bh — events 0Fh, 11h, 13h; also mode 1. Switches the charmed character to the charmer's side. `e^.p3` bits: 7 = charmer's side, 6 = original side (saved here), 5 = already applied (M from the arithmetic).
```pascal
if mode <> 0 then begin                                    { 5c00:0403  removed: restore }
  c^.side := (e^.p3 and $40) shr 6;                        { 5c00:0409 }
  if c^.npc_morale = $B3 then c^.npc_morale := 0;          { 5c00:0420 }
  exit;                                                    { 5c00:0434 }
end;
if e^.p3 and $20 = 0 then begin                            { 5c00:0437  first time }
  e^.p3 := e^.p3 + $20 + (c^.side shl 6);                  { 5c00:0444  byte arithmetic }
  c^.side := e^.p3 shr 7;                                  { 5c00:0468 }
  c^.controlled := 1;                                      { 5c00:047d }
  if c^.npc_morale <= $7F then c^.npc_morale := $B3;       { 5c00:0486 }
  cr(c)^.target := nil;                                    { 5c00:049a }
  CountActiveSides;                                        { 5c00:04ac }
end;
MoraleValue := 100;                                        { 5c00:04b1  charmed creatures never fail morale }
```

### 5C00:04BA EffStrengthEnd (M)
Types 0Ch, 26h (strength-raising effects, cf. SetStrength 9800:115C) — no event (removed). If this effect holds the original strength (`p3 < 80h`), restore it; if another strength effect is still active, the strongest of them becomes the holder and its strength applies.
```pascal
if e^.p3 > $7F then exit;                                  { 5c00:04c0  not the holder }
DecodeStrength(e, s, x);                                   { 5c00:04dd }
c^.str := s;  c^.str_exc := x;                             { 5c00:04e2 }
best := nil;  bestS := 0;  bestX := 0;                     { 5c00:04f6 }
p := c^.effects;                                           { 5c00:0506 }
while p <> nil do begin                                    { 5c00:0518 }
  if ((p^.type = $0C) or (p^.type = $26)) and (p <> e) then begin   { 5c00:0520 }
    DecodeStrength(p, s, x);                               { 5c00:0552 }
    if (s > bestS) or ((bestS = 18) and (x > bestX)) then begin      { 5c00:0557 }
      bestS := s;  bestX := x;  best := p;                 { 5c00:056d }
    end;
  end;
  p := p^.next;                                            { 5c00:0585 }
end;
if best <> nil then begin                                  { 5c00:0598 }
  best^.p3 := StrengthCode(c^.str, c^.str_exc);            { 5c00:05b0  becomes the holder (bit 7 clear) }
  c^.str := bestS;  c^.str_exc := bestX;                   { 5c00:05bc }
end;
```
{ quirk: no RecalcCharacter here (the caller of RemoveEffect recalculates or not). }

### 5C00:05D6 EffSetCharisma (L)
Type 0Eh — no event (removed): `c^.cha := e^.p3` (restores a saved charisma — M for the field, L for the purpose).
```pascal
c^.cha := e^.p3;                                           { 5c00:05d9 }
```

### 5C00:05EB EffHpLossTick (L)
Type 0Fh — no event (removed on expiry, re-adds itself every 10 time units): 1 point of damage per tick while hp > 1. Removed (without effect) by EffSlowPoisonEnd.
```pascal
if AddEffectUnlessCuring(c, $0F, e^.p3, 10) then           { 5c00:0604 }
  if c^.hp > 1 then begin                                  { 5c00:060b }
    DamageType := 0;                                       { 5c00:0616 }
    DamageCharacter(c, 1, 0, false);                       { 5c00:062a }
    if game_Mode <> 5 then DrawPartyRoster(SelectedChar);  { 5c00:062f }
  end;
```

### 5C00:0647 EffNop10 (H)
Type 10h — empty body (`PUSH BP; MOV BP,SP; POP BP; RETF 0Ah`).  { 5c00:0647 }

### 5C00:064E EffShield (M)
Type 11h — events 06h, 0Bh, 0Ch. AC at least 3 (39h = 60−3), +1 save, and no damage from spell 0Fh (the AD&D Shield spell's immunity to Magic Missile; spell id from `sp_Current`, M).
```pascal
if c^.ac < $39 then c^.ac := $39;                          { 5c00:0651 }
SaveRoll := SaveRoll + 1;                                  { 5c00:0665 }
if sp_Current = $0F then DamageAmount := 0;              { 5c00:0669 }
```

### 5C00:0679 EffGnomeAttackBonus (M)
Type 12h — event 0Ah. +1 to hit when the target is a humanoid (`creature_type = 1`) of `size = 1` whose name is one of `GnomeFoeNames[1..4]` = KOBOLD, KOBOLD LEADER, GOBLIN, GOBLIN LEADER (DS:0342.., string[15] each; AD&D gnome racial bonus).
```pascal
HookOpponent := cr(c)^.target;                             { 5c00:067f }
if (HookOpponent^.creature_type = 1) and (HookOpponent^.size = 1) then   { 5c00:0696 }
  for i := 1 to 4 do                                       { 5c00:06ad }
    if HookOpponent^.name = GnomeFoeNames[i] then          { 5c00:06cd }
      AttackRollValue := AttackRollValue + 1;              { 5c00:06d4 }
```

---

## Effect handlers 14h..2Ch

### 5C00:06E4 EffResistFire (M)
Type 14h — events 06h, 0Ch. Fire (DamageType bit 0) damage halved, +3 save.
```pascal
if DamageType and 1 <> 0 then begin                        { 5c00:06e7 }
  DamageAmount := DamageAmount shr 1;                      { 5c00:06f0 }
  SaveRoll := SaveRoll + 3;                                { 5c00:06fa }
end;
```

### 5C00:070F EffSilence (M)
Type 15h (area type: also when a party member with the effect is within 1 square, RunEffectIfActive) — event 0Fh. No spells and no magic-item use this turn.
```pascal
if cr(c)^.mayUseItems <> 0 then                            { 5c00:0715 }
  ShowCharacterMessage(c, 'is silenced', 10, true);        { 5c00:073f }
cr(c)^.mayUseItems := 0;                                   { 5c00:0744 }
cr(c)^.mayCast := 0;                                       { 5c00:0751 }
```

### 5C00:0775 EffSlowPoisonEnd (M)
Type 16h — no event (removed). When the slow-poison effect ends: a still-poisoned character (effect 37h) dies; the 1-HP tick effect 0Fh is removed in "cure" mode (so it does not re-add itself).
```pascal
if HasEffect(c, $37, p) then                               { 5c00:0789 }
  ApplyFatalStatus(c, 6, 'dies from poison');              { 5c00:07ab  6 = Dead }
cure_InProgress := 1;                                      { 5c00:07ae }
RemoveEffect(c, $0F, nil);                                 { 5c00:07c2 }
cure_InProgress := 0;                                      { 5c00:07c7 }
```

### 5C00:07E0 EffSpiritualHammer (H)
Type 17h — event 13h (once per round) and mode 1. Name H: the item it creates is type 14h with words +30h = 14h "Hammer", +31h = F3h "Spiritual" (ItemWordTable DS:10A7) and plus 1.
```pascal
p := c^.items;  found := false;                            { 5c00:07e6 }
while (p <> nil) and not found do                          { 5c00:07fd }
  if (p^.type = $14) and (p^.word[3] = $F3) then found := true   { 5c00:080b  word[3] = +31h }
  else p := p^.next;                                       { 5c00:0825 }
if (mode <> 0) and (p <> nil) then LoseItem(c, p);         { 5c00:0838  effect removed: the hammer vanishes }
if (mode = 0) and not found and (c^.item_count < 16) then begin   { 5c00:0857 }
  p := GetMem($3F);                                        { 5c00:087b }
  FillChar(p^, $3F, 0);                                    { 5c00:0892 }
  p^.type := $14;                                          { 5c00:0897 }
  p^.word[2] := $14;                                       { 5c00:089f  "Hammer" }
  p^.word[3] := $F3;                                       { 5c00:08a7  "Spiritual" }
  p^.plus := 1;                                            { 5c00:08af }
  p^.power[2] := $17;                                      { 5c00:08b7  +3Dh }
  p^.power[3] := $89;                                      { 5c00:08bf  +3Eh }
  AppendItemCopy(c, p);                                    { 5c00:08d3 }
  FreeMem(p, $3F);                                         { 5c00:08e2 }
  ShowCharacterMessage(c, 'Gains an item', 10, true);      { 5c00:0902 }
end;
RecalcCharacter(c);                                        { 5c00:090d }
```
(The new hammer is not readied here; `power[2..3]` = 17h, 89h meaning L.)

### 5C00:0918 EffInvisible (M)
Type 19h — events 01h, 10h. Attacks on `c` are blocked unless the attacker has effect 18h (Detect Invisibility, M); in any case −4 on the attack roll.
```pascal
if not HasEffect(SelectedChar, $18, p) then AttackBlocked := 1;   { 5c00:092e }
AttackRollValue := AttackRollValue - 4;                    { 5c00:093c }
```

### 5C00:0947 EffDwarfAttackBonus (M)
Type 1Ah — event 0Ah. As EffGnomeAttackBonus with `DwarfFoeNames[1..8]` (DS:0382..): ORC, ORC LEADER, GOBLIN, GOBLIN LEADER, HOBGOBLIN, HOBGOBLIN CHIEF, GAGOOL, MACE.
```pascal
HookOpponent := cr(c)^.target;                             { 5c00:094d }
if (HookOpponent^.creature_type = 1) and (HookOpponent^.size = 1) then   { 5c00:0964 }
  for i := 1 to 8 do                                       { 5c00:097b }
    if HookOpponent^.name = DwarfFoeNames[i] then          { 5c00:099b }
      AttackRollValue := AttackRollValue + 1;              { 5c00:09a2 }
```

### 5C00:09C0 EffMirrorImage (M)
Type 1Ch — events 05h, 06h. `e^.p3` = number of images. With chance p3/(p3+1) an image is hit instead: damage and pending effect cancelled, one image lost; at 0 images the effect ends.
```pascal
if (Roll(1, e^.p3 + 1) > 1) and (sp_Current <> 0) and (SpellArea = 0) then begin   { 5c00:09d4 }
  CancelDamageAndEffect(0);                                { 5c00:09ef }
  ShowCharacterMessage(c, 'lost an image', 10, true);      { 5c00:0a0d }
  e^.p3 := e^.p3 - 1;                                      { 5c00:0a12 }
  if e^.p3 = 0 then RemoveEffect(c, $1C, nil);             { 5c00:0a19 }
end;
```
{ quirk: the test `sp_Current <> 0` (CMP [681B],0 / JBE at 5c00:09dd) means images only absorb non-area **spells**; weapon hits (sp_Current = 0) are not absorbed here. }

### 5C00:0A3D EffEnfeebled (M)
Type 1Dh — event 04h (attacker's damage). Damage −25 % (`d − d div 4`; AD&D Ray of Enfeeblement, name M).
```pascal
DamageAmount := DamageAmount - (DamageAmount shr 2);       { 5c00:0a40 }
```

### 5C00:0A65 EffCoughing (M)
Type 1Eh — events 0Bh, 0Fh. A character in a stinking cloud: no spells/items this turn, AC 2 worse (minimum AC 10), front AC := rear AC.
```pascal
if cr(c)^.mayUseItems <> 0 then                            { 5c00:0a6b }
  ShowCharacterMessage(c, 'is coughing', 10, true);        { 5c00:0a95 }
cr(c)^.mayUseItems := 0;                                   { 5c00:0a9a }
cr(c)^.mayCast := 0;                                       { 5c00:0aa7 }
RecalcCharacter(c);                                        { 5c00:0aba }
if c^.ac_rear > $34 then c^.ac_rear := c^.ac_rear - 2      { 5c00:0abf }
else c^.ac_rear := $32;                                    { 5c00:0ad5  AC 10 }
c^.ac := c^.ac_rear;                                       { 5c00:0ade }
if c = SelectedChar then DrawCharacterSummary(c);          { 5c00:0aee }
```

### 5C00:0B1B EffAnimatedEnd (M)
Type 20h — no event (removed). End of an animated corpse (cf. Animate Dead Spell_AnimateDead: ai_mode 2, creature_type 4, npc_morale B3h): it collapses (Dead) and its record is restored for the party.
```pascal
e^.callOnRemove := 0;                                      { 5c00:0b21 }
if cure_InProgress = 0 then                                { 5c00:0b29 }
  ApplyFatalStatus(c, 6, 'collapses');                     { 5c00:0b49 }
c^.side := e^.p3 shr 4;                                    { 5c00:0b4c }
c^.controlled := 1;                                        { 5c00:0b61 }
c^.ai_mode := 0;                                           { 5c00:0b6a }
c^.fighter_lvl_eff := c^.level[2];                         { 5c00:0b72 }
c^.base_move := 12;                                        { 5c00:0b81 }
if c^.npc_morale = $B3 then c^.npc_morale := 0;            { 5c00:0b89 }
c^.creature_type := 0;                                     { 5c00:0b9d }
```

### 5C00:0BAC EffPenaltyAll4 (L)
Type 21h — events 0Ah, 0Bh, 0Ch. −4 to hit, AC 4 worse, −4 save (which AD&D condition: unknown; candidates blindness).
```pascal
AttackRollValue := AttackRollValue - 4;                    { 5c00:0baf }
c^.ac := c^.ac - 4;                                        { 5c00:0bb4 }
c^.ac_rear := c^.ac_rear - 4;                              { 5c00:0bbd }
SaveRoll := SaveRoll - 4;                                  { 5c00:0bc6 }
```

### 5C00:0BCF EffWeaknessAndDrain (L)
Type 22h — no event (removed): runs the handlers of 2Bh (EffWeakness) and 2Ch (EffHpDrainTick) with the same arguments.
```pascal
CallEffectHandler($2B, c, e, mode);                        { 5c00:0be5 }
CallEffectHandler($2C, c, e, mode);                        { 5c00:0bfd }
```
{ quirk: both handlers re-add *their own* type (2Bh / 2Ch), so a type-22h effect turns into two effects on its first expiry. }

### 5C00:0C06 EffPlusOne (L)
Type 23h (in no hook list) and called directly by EffPrayer: +1 save, +1 to hit.
```pascal
SaveRoll := SaveRoll + 1;                                  { 5c00:0c09 }
AttackRollValue := AttackRollValue + 1;                    { 5c00:0c0d }
```

### 5C00:0C15 EffPenalty4 (L)
Type 24h — events 0Ah, 0Ch. −4 to hit, −4 save.
```pascal
AttackRollValue := AttackRollValue - 4;                    { 5c00:0c18 }
SaveRoll := SaveRoll - 4;                                  { 5c00:0c1d }
```

### 5C00:0C26 EffUntouchableBeforeTurn (L)
Type 25h — events 01h, 10h. While `c` has not acted yet this round (`initiative > 0`) it cannot be attacked.
```pascal
if cr(c)^.initiative > 0 then begin                        { 5c00:0c29  signed }
  AttackBlocked := 1;                                      { 5c00:0c38 }
  AttackRollValue := -1;                                   { 5c00:0c3d  FFh }
end;
```

### 5C00:0C4B EffHaste (H)
Type 27h — event 12h. Doubles attacks/movement (StatValue); the first time it ages the character one year ("ages"). Name H (AD&D Haste: double moves/attacks, ages 1 year). Confirms the ECL lane: 27h doubles, 2Ah halves.
```pascal
if e^.p3 and $10 = 0 then begin                            { 5c00:0c51 }
  e^.p3 := e^.p3 + $10;                                    { 5c00:0c5e }
  ShowCharacterMessage(c, 'ages', 10, true);               { 5c00:0c8c }
  c^.age := c^.age + 1;                                    { 5c00:0c91  word }
end;
StatValue := StatValue shl 1;                              { 5c00:0c98  byte }
```

### 5C00:0CC3 EffCloudRemoved (M)
Type 28h — no event (removed). Removes the cloud (stinking cloud, 2×2 squares) that belongs to `c` with id `e^.p3 shr 4` from `sc_List` and restores the combat-map ground under it; corpses get the body tile 1Fh; squares of the remaining clouds are re-marked with the cloud tile 1Eh.
Area node (19 = 13h bytes, M): `+0 owner: PChar, +4 next, +7+k ground[k] (k = 1..4, saved tile), +0Bh+k active[k], +10h x, +11h y, +12h id`; square k = (x, y) + step `CloudSquareDir[k]` = dirs 8, 2, 3, 4 (own square, E, SE, S; image bytes DS:290E..2911, H).
```pascal
id := e^.p3 shr 4;  found := false;                        { 5c00:0cc9 }
a := sc_List;                                       { 5c00:0cdd }
while (a <> nil) and not found do                          { 5c00:0cea }
  if (a^.owner = c) and (a^.id = id) then found := true    { 5c00:0cf8 }
  else a := a^.next;                                       { 5c00:0d1e }
if not found then exit;                                    { 5c00:0d31 }
ShowTimedBottomMessage('The air clears a little...');      { 5c00:0d49 }
for k := 1 to 4 do                                         { 5c00:0d4e }
  if a^.active[k] <> 0 then begin                          { 5c00:0d57 }
    x := a^.x + g_2736[CloudSquareDir[k]];                 { 5c00:0d6b }
    y := a^.y + g_273F[CloudSquareDir[k]];                 { 5c00:0d8e }
    body := false;                                         { 5c00:0db1 }
    for i := 1 to BodyCount do                             { 5c00:0db5 }
      if (BodyList[i].char <> nil) and (BodyList[i].x = x) and (BodyList[i].y = y) then body := true;   { 5c00:0dca }
    if body then cm_Map^[7 + y*50 + x] := $1F              { 5c00:0e24 }
    else cm_Map^[7 + y*50 + x] := a^.ground[k];            { 5c00:0e4a }
  end;
p := sc_List;                                       { 5c00:0e7e  unlink a }
if p = a then sc_List := a^.next                    { 5c00:0e8b }
else begin
  while p^.next <> a do p := p^.next;                      { 5c00:0eaf }
end;
p^.next := a^.next;                                        { 5c00:0ed7  (no-op when a was the head) }
FreeMem(a, $13);                                           { 5c00:0ef7 }
p := sc_List;                                       { 5c00:0efc }
while p <> nil do begin                                    { 5c00:0f09 }
  for k := 1 to 4 do                                       { 5c00:0f14 }
    if p^.active[k] <> 0 then                              { 5c00:0f1d }
      cm_Map^[7 + (p^.y + g_273F[CloudSquareDir[k]])*50 + p^.x + g_2736[CloudSquareDir[k]]] := $1E;   { 5c00:0f2e }
  p := p^.next;                                            { 5c00:0f88 }
end;
```

### 5C00:0FAC AvoidRangedAttack (M)
`procedure AvoidRangedAttack(c [BP+8]: PChar; chance [BP+6]: Byte)` — RETF 6. Callers: EffMagicWeaponOnly, EffAvoidMissiles60, EffAvoidBoulders.
When the attacker (SelectedChar) has a weapon readied and is not adjacent (distance > 1), `c` avoids the attack with `chance` %.
```pascal
if SelectedChar^.readied[0] <> nil then                    { 5c00:0fb2 }
  if TargetDistance(SelectedChar, c) > 1 then              { 5c00:0fd0 }
    if Roll(1, 100) <= chance then begin                   { 5c00:0fdf }
      ShowCharacterMessage(c, 'Avoids it', 10, true);      { 5c00:1004 }
      DamageAmount := 0;                                   { 5c00:1009 }
      AttackRollValue := -1;                               { 5c00:100e }
      SlotHits := SlotHits - 1;                            { 5c00:1013  g_6823 }
    end;
```

### 5C00:101D CurrentAttackItem (M)
`function CurrentAttackItem(c [BP+6]: PChar): PItem` — RETF 4. Callers: EffMagicWeaponOnly, EffHalveWeapon, EffNeedSilverOrMagic, EffHalveEdged, EffHalveMagicWeapon, EffNeedMagicWeapon, EffNeedMagicSilverHalf.
The item that delivers c's attack: the ammunition when the readied weapon fires missiles and ammo is present, else the readied weapon; nil without a weapon.
```pascal
p := nil;                                                  { 5c00:1023 }
if c^.readied[0] <> nil then begin                         { 5c00:102b }
  ok := GetMissileAmmo(c, p);                              { 5c00:1045 }
  if (not ok) or (p = nil) then p := c^.readied[0];        { 5c00:104d }
end;
CurrentAttackItem := p;                                    { 5c00:106e }
```

### 5C00:1086 EffMagicWeaponOnly (L)
Type 29h — event 05h. A ranged attack (distance > 1) with a non-magical item (`plus = 0`) is always avoided (AvoidRangedAttack 100 %).
```pascal
if CurrentAttackItem(SelectedChar) <> nil then             { 5c00:1092 }
  if CurrentAttackItem(SelectedChar)^.plus = 0 then        { 5c00:10a2 }
    AvoidRangedAttack(c, 100);                             { 5c00:10ba }
```
{ quirk: adjacent attackers are not affected (AvoidRangedAttack's distance test). }

### 5C00:10C1 EffSlow (H)
Type 2Ah — event 12h. Halves attacks/movement.
```pascal
StatValue := StatValue shr 1;                              { 5c00:10c4 }
```

### 5C00:10DE EffWeakness (M)
Type 2Bh — no event (re-added every 60 time units): −1 STR per tick ("is weakened"); at STR 3 the character becomes helpless (effect 1Fh, EffHelpless) once.
```pascal
if AddEffectUnlessCuring(c, $2B, e^.p3, $3C) then          { 5c00:10fa }
  if c^.str > 3 then begin                                 { 5c00:1101 }
    ShowCharacterMessage(c, 'is weakened', 10, true);      { 5c00:1126 }
    c^.str := c^.str - 1;                                  { 5c00:112b }
  end
  else if not HasEffect(c, $1F, p) then                    { 5c00:1142 }
    AddEffect(c, $1F, 0, $FF, 0);                          { 5c00:115d }
```

### 5C00:1168 EffHpDrainTick (L)
Type 2Ch — no event (re-added every 10): 1 damage per tick while hp > 1; at hp ≤ 1 the character becomes helpless (1Fh).
```pascal
if AddEffectUnlessCuring(c, $2C, e^.p3, 10) then           { 5c00:1184 }
  if c^.hp > 1 then begin                                  { 5c00:118b }
    DamageType := 0;                                       { 5c00:1196 }
    DamageCharacter(c, 1, 0, false);                       { 5c00:11aa }
    if game_Mode <> 5 then DrawPartyRoster(SelectedChar);  { 5c00:11af }
  end
  else if not HasEffect(c, $1F, p) then                    { 5c00:11d3 }
    AddEffect(c, $1F, 0, $FF, 0);                          { 5c00:11ee }
```

---

## Effect handlers 2Fh..4Eh

### 5C00:11F9 EffDwarfGiantDefence (M)
Type 2Fh — event 10h (c = target). −4 on the attack roll when the attacker is a large (`size and 7Fh = 2`) humanoid and the name matches `GiantFoeNames[1..8]` (DS:0402..: OGRE, OGRE LEADER, TROLL, FIRE GIANT, HILL GIANT, then 3 non-name byte strings).
```pascal
HookOpponent := cr(c)^.target;                             { 5c00:11ff }
if (SelectedChar^.creature_type = 1) and (SelectedChar^.size and $7F = 2) then   { 5c00:1216 }
  for i := 1 to 8 do                                       { 5c00:1230 }
    if HookOpponent^.name = GiantFoeNames[i] then          { 5c00:1250 }
      AttackRollValue := AttackRollValue - 4;              { 5c00:1257 }
```
{ quirk: the name compared is that of c's own current target (`cr(c)^.target`), not of the attacker SelectedChar (EffGnomeGiantDefence compares SelectedChar); entries 6..8 of the table are not names (table overrun). }

### 5C00:1276 EffGnomeGiantDefence (M)
Type 30h — event 10h. −4 on the attack roll by a humanoid attacker named BUGBEAR or GNOLL (literals 5C00:1268/1270).
```pascal
if SelectedChar^.creature_type = 1 then                    { 5c00:1279 }
  if (SelectedChar^.name = 'BUGBEAR') or (SelectedChar^.name = 'GNOLL') then   { 5c00:1290 }
    AttackRollValue := AttackRollValue - 4;                { 5c00:12a9 }
```

### 5C00:12B2 EffPrayer (M)
Type 31h (area type, range 6 squares) — events 0Ah, 0Ch. +1 to hit and save for the caster's side (`(p3 and 10h) shr 4`), −1 for the other side (AD&D Prayer).
```pascal
side := (e^.p3 and $10) shr 4;                             { 5c00:12b8 }
if c^.side = side then EffPlusOne(c, e, mode)              { 5c00:12e8 }
else begin
  AttackRollValue := AttackRollValue - 1;                  { 5c00:12ed }
  SaveRoll := SaveRoll - 1;                                { 5c00:12f1 }
end;
```

### 5C00:12FB EffSlowHeal (L)
Type 32h — no event (re-added every 3840h = 14 400 time units): heals 1 HP per tick.
```pascal
if AddEffectUnlessCuring(c, $32, e^.p3, $3840) then        { 5c00:1314 }
  if HealCharacter(c, 1, true) then ShowHealingResult(c);  { 5c00:1327 }
```

### 5C00:133F EffHelpless (M)
Types 1Fh, 33h, 34h, 35h — event 07h. `ClearCombatantActionFlags(c)` (result ignored: the conditional jump at 5c00:134f goes to the next instruction). 34h is "is Paralyzed" (ParalyzeOpponent), 1Fh is set by EffWeakness/EffHpDrainTick.
```pascal
ClearCombatantActionFlags(c);                              { 5c00:1348 }
```

### 5C00:1355 EffNop36 (H)
Type 36h — empty body.  { 5c00:1355 }

### 5C00:135C EffNop37 (H)
Type 37h (Poisoned, added by PoisonOpponent; tested by EffSlowPoisonEnd) — empty body.  { 5c00:135c }

### 5C00:1363 EffGrantInvisible (L)
Type 38h — events 08h, 13h. Each round: invisibility (19h) for 1 time unit.
```pascal
AddEffect(c, $19, 1, $0C, 0);                              { 5c00:1379 }
```

### 5C00:1399 EffMummyRot (M)
Type 39h — no event (re-added every 43 200 = A8C0h). "Rots...": CHA −2 (but not below 3); `p3 shr 4` counts the remaining ticks; at the last one the character "Dies rots away" (status 8 Gone).
```pascal
if cure_InProgress <> 0 then exit;                         { 5c00:139f }
ShowCharacterMessage(c, 'Rots...', 10, true);              { 5c00:13c4 }
if c^.cha > 2 then c^.cha := c^.cha - 2 else c^.cha := 0;  { 5c00:13c9 }
if c^.cha < 3 then c^.cha := 3;                            { 5c00:13e5 }
if (e^.p3 shr 4) > 1 then begin                            { 5c00:13f7 }
  e^.p3 := e^.p3 - $10;                                    { 5c00:1409 }
  AddEffectUnlessCuring(c, $39, e^.p3, $A8C0);             { 5c00:1427 }
end else
  ApplyFatalStatus(c, 8, 'Dies rots away');                { 5c00:1449  8 = Gone }
```

### 5C00:1452 EffHeld (M)
Type 3Ah — event 12h. No movement: `moveLeft := 0`, and while the stat being recalculated is movement, StatValue := 0. Set on the victim by EffStirgeAttach / EffGrab ("is held fast").
```pascal
cr(c)^.moveLeft := 0;                                      { 5c00:1455 }
if StatKind <> 0 then StatValue := 0;                      { 5c00:1462 }
```

### 5C00:1472 EffBecome62 (L)
Type 3Bh — no event (removed): adds the permanent effect 62h (meaning: part B).
```pascal
AddEffect(c, $62, 0, $FF, 0);                              { 5c00:1487 }
```

### 5C00:1490 EffFireResistance (M)
Type 3Dh — events 06h, 0Ch. Fire: −2 per damage die (but at least 1 per die), +4 save, and non-magical fire (DamageType without bit 3) does no damage at all.
```pascal
if DamageType and 1 <> 0 then begin                        { 5c00:1496 }
  for i := 1 to LastDiceCount do begin                     { 5c00:14a5 }
    DamageAmount := DamageAmount - 2;                      { 5c00:14b4 }
    if DamageAmount < LastDiceCount then DamageAmount := LastDiceCount;   { 5c00:14b9  unsigned }
  end;
  SaveRoll := SaveRoll + 4;                                { 5c00:14d0 }
  if DamageType and 8 = 0 then CancelDamageAndEffect(0);   { 5c00:14d5 }
end;
```

### 5C00:14EB EffRegenerate (M)
Type 3Eh (given by EffHardier at CON 20) — no event (re-added every 60): heals 1 HP per tick.
```pascal
if AddEffectUnlessCuring(c, $3E, e^.p3, $3C) then          { 5c00:1504 }
  if HealCharacter(c, 1, true) then ShowHealingResult(c);  { 5c00:1517 }
```

### 5C00:1545 PoisonOpponent (M)
`procedure PoisonOpponent(c [BP+8]: PChar; bonus [BP+6]: ShortInt)` — RETF 6. Callers: EffPoisonHit, EffPoisonHitP4, EffPoisonHitP2, EffPoisonHitM2.
The target of c's attack saves vs poison (save type 0) with `bonus`, or is poisoned and killed.
```pascal
HookOpponent := cr(c)^.target;                             { 5c00:154b }
if not SavingThrow(HookOpponent, 0, bonus) then begin      { 5c00:1571 }
  ShowCharacterMessage(HookOpponent, 'is Poisoned', 10, false);   { 5c00:1597 }
  MessageDelay;                                            { 5c00:159c }
  AddEffect(HookOpponent, $37, 0, $FF, 0);                 { 5c00:15b5 }
  ApplyFatalStatus(HookOpponent, 6, 'is killed');          { 5c00:15d5 }
end;
```

### 5C00:15EB ParalyzeOpponent (M)
`procedure ParalyzeOpponent(c [BP+0Ah]: PChar; duration [BP+8]: Word; bonus [BP+6]: ShortInt)` — RETF 8. Callers: EffParalyzeHit2d8, EffGhoulParalysis, EffParalyzeHitLong.
```pascal
HookOpponent := cr(c)^.target;                             { 5c00:15f1 }
if not SavingThrow(HookOpponent, 0, 0) then begin          { 5c00:1616  quirk: bonus is not used (0 pushed) }
  ShowCombatMessageAnimation(HookOpponent, true, 'is Paralyzed');   { 5c00:1639 }
  AddEffect(HookOpponent, $34, duration, $0C, 0);          { 5c00:1652 }
end;
```

### 5C00:165D EffPoisonHit (M)
Type 40h — event 03h (hit with attack slot 2). `PoisonOpponent(c, 0)`.  { 5c00:166a }

### 5C00:1671 EffPoisonHitP4 (M)
Type 41h — event 03h. `PoisonOpponent(c, 4)` (save +4).  { 5c00:167e }

### 5C00:1685 EffPoisonHitP2 (M)
Type 42h — event 03h. `PoisonOpponent(c, 2)`.  { 5c00:1692 }

### 5C00:1699 EffParalyzeHit2d8 (M)
Type 43h — event 03h. `ParalyzeOpponent(c, Roll(2, 8), 0)`.  { 5c00:16a8 Roll, 5c00:16b4 call }

### 5C00:16BB EffGhoulParalysis (M)
Type 44h — events 02h, 03h. Paralysis for 3Fh time units unless the target is an elf (race 2) — the AD&D ghoul touch (elves immune).
```pascal
if cr(c)^.target^.race <> 2 then                           { 5c00:16be }
  ParalyzeOpponent(c, $3F, 0);                             { 5c00:16df }
```

### 5C00:16E6 EffParalyzeHitLong (M)
Type 45h — event 03h. `ParalyzeOpponent(c, Roll(1, 9) + 10, -2)` (bonus −2 unused, see ParalyzeOpponent).  { 5c00:16f5 Roll, 5c00:1704 call }

### 5C00:170B EffPoisonHitM2 (M)
Type 46h — event 03h. `PoisonOpponent(c, -2)` (FEh).  { 5c00:1718 }

### 5C00:171F EffUnattackable (L)
Type 47h — events 01h, 10h. Attacks on c are blocked, −4 on the roll (as EffInvisible without the detect test).
```pascal
AttackBlocked := 1;                                        { 5c00:1722 }
AttackRollValue := AttackRollValue - 4;                    { 5c00:1727 }
```

### 5C00:1730 EffGrantInvisible95 (L)
Type 48h — events 08h, 13h. With 95 % each round invisibility (19h) for 1 time unit.
```pascal
if Roll(1, 100) <= $5F then AddEffect(c, $19, 1, $0C, 0);  { 5c00:1739 / 5c00:1755 }
```

### 5C00:176F EffBloodDrain (M)
Type 4Bh — events 0Dh, 0Fh; also mode 1. The attached blood-sucker `c` (set up by EffStirgeAttach) drains its victim `cb_Char[e^.p3]` 1d4 HP per turn; `e^.duration shr 4` = HP it still wants. It lets go when it or the victim is out of action, when satiated, or when the effect is removed.
```pascal
HookOpponent := cb_Char[e^.p3];                            { 5c00:1775 }
if (mode <> 0) or (c^.active = 0) or (HookOpponent^.active = 0) then begin   { 5c00:1793 }
  RemoveEffect(HookOpponent, $3A, nil);                    { 5c00:17c1  victim no longer held }
  if mode = 0 then begin                                   { 5c00:17c6 }
    e^.callOnRemove := 0;                                  { 5c00:17cc }
    RemoveEffect(c, $4B, e);                               { 5c00:17e3 }
  end;
  if (c^.active <> 0) and (HookOpponent^.active <> 0) then { 5c00:17e8 }
    cr(c)^.turned := 1;                                    { 5c00:17ff  M: flies off (forced to flee) }
end else begin
  ShowCharacterMessage(c, 'Sucks some Blood', 10, true);   { 5c00:182a }
  dmg := RollDice(1, 4);                                   { 5c00:1835 }
  DamageType := 0;                                         { 5c00:183d }
  DamageCharacter(HookOpponent, dmg, 0, false);            { 5c00:1854 }
  ok := ClearCombatantActionFlags(c);                      { 5c00:185f  result unused }
  if (HookOpponent^.active <> 0) and ((e^.duration shr 4) > dmg) then   { 5c00:1867 }
    e^.duration := e^.duration - (dmg shl 4)               { 5c00:1889 }
  else
    RemoveEffect(c, $4B, e);                               { 5c00:18aa }
end;
```
{ quirk: in the satiated/victim-down branch callOnRemove is not cleared, so RemoveEffect calls this handler again in mode 1 (which removes 3Ah from the victim and may set `turned`). }

### 5C00:18B5 EffStirgeAttach (M)
Type 4Ch — event 02h (hit with slot 1). The attacker attaches to its target: effect 4Bh on itself (duration 0CFh → wants 12 HP; p3 = target's combatant index), 3Ah (held) on the target, and the 3Ah handler is run at once.
```pascal
HookOpponent := cr(c)^.target;                             { 5c00:18b8 }
AddEffect(c, $4B, $CF, CombatantIndex(HookOpponent), 1);   { 5c00:18ed }
AddEffect(HookOpponent, $3A, 0, $FF, 0);                   { 5c00:1906 }
CallEffectHandler($3A, HookOpponent, nil, 0);              { 5c00:191f }
```
(Name M: "Sucks some Blood" + 1d4 + 12-HP budget fit the AD&D stirge.)

### 5C00:1935 EffGrab (M)
Type 4Dh — event 02h. If the target's STR is below 19, the attacker holds it: effect 4Ah (EffHold, ov13_3A86) on c with the target's index, 3Ah on the target, "is held fast".
```pascal
HookOpponent := cr(c)^.target;                             { 5c00:193b }
if HookOpponent^.str < 19 then begin                       { 5c00:1952 }
  AddEffect(c, $4A, 0, CombatantIndex(HookOpponent), 1);   { 5c00:197a }
  AddEffect(HookOpponent, $3A, 0, $FF, 0);                 { 5c00:1993 }
  CallEffectHandler($3A, HookOpponent, nil, 0);            { 5c00:19ac }
  ShowCharacterMessage(HookOpponent, 'is held fast', 10, true);   { 5c00:19ce }
end;
```

### 5C00:19D9 EffReviveCheck (L)
Type 4Eh — no event (re-added with duration 1 on every expiry): tries `ReviveCombatant(c, c^.hp)`; while that fails, keeps checking (troll-like regeneration back to life, L).
```pascal
if not ReviveCombatant(c, c^.hp) then                      { 5c00:19ee }
  ok := AddEffectUnlessCuring(c, $4E, e^.p3, 1);           { 5c00:1a0d  result unused }
```

---

<!-- ov12 part B (5C00:1A19 .. 5C00:38A9), lane por-mod-party (fork B). Unit header / conventions: part A (ov12a.pas.md). -->
<!-- Effect handler ABI (ov24 CallEffectHandler 9800:0000, H): procedure(c [BP+0Ch]: PChar; e [BP+8]: PEffect; mode [BP+6]: Byte), RETF 0Ah.
     mode 0 = hook event / apply, mode 1 = effect being removed (RemoveEffect with e^.callOnRemove <> 0). For the item-power types 80h..8Bh
     the second parameter is a ^TItem (the readied item; fields +34h readied, +3Dh power[2]) — see 5C00:2EDA. -->
<!-- Part-A helpers used here (names from ov12a_names.json):
     CancelDamageAndEffect(t)                   if (t = 0) or (EffectToApply = t) then begin DamageAmount := 0; EffectToApply := 0 end   (asm 5c00:0003..0016, H)
     AddEffectUnlessCuring(c, type, p3, dur)    if cure_InProgress = 0 then AddEffect(c, type, dur, p3, 1); result := cure_InProgress = 0   (asm 5c00:0025..004f, H)
     ApplyFatalStatus(c, status, msg)      ShowCharacterMessage(c, msg, 10, false); unless status already 6/7/8: status, active := 0, hp := 0,
                                        RemoveCombatEffects, CallEffectHooks($0D), RemoveCombatant if inactive; MessageDelay; ... (asm 5c00:0058..0107, H)
     AvoidRangedAttack(target, pct)         if SelectedChar has a weapon and TargetDistance(SelectedChar, target) > 1 and Roll(1,100) <= pct then
                                        "Avoids it": DamageAmount := 0; AttackRollValue := -1; dec(SlotHits[1])   (asm 5c00:0fb2..1013, H)
     CurrentAttackItem(c): ^TItem           the item the attacker strikes with: ammo from GetMissileAmmo if it returns true and non-nil, else c^.readied[0] (weapon); nil without weapon (asm 5c00:1023..107d, H) -->

### 5C00:1A19 EffFireDamage (M)
`procedure EffFireDamage(c [BP+0Ch]: PChar; e [BP+8]: PEffect; mode [BP+6]: Byte)` — effect handler type **4Fh** (events 02h, 03h). Callers: CallEffectHandler (table slot 4Fh, installed by InstallEffectHandlers). Callees: RollDice, DamageCharacter.
The creature's hit also burns its target for 2d10 (damage kind 9 = Fire+Magic). Name M (DamageType 9 → "from Fire" in DamageCharacter, whose `case DamageType and F7h` selects 1).
```pascal
DamageType := 9;                                                          { 5c00:1a1c }
DamageCharacter(c^.combatant^.target, RollDice(2, 10), 0, false);         { 5c00:1a21 .. 1a43 }
```

### 5C00:1A4C EffAcidDamage (M)
`procedure EffAcidDamage(c [BP+0Ch]: PChar; e [BP+8]: PEffect; mode [BP+6]: Byte)` — effect handler type **50h** (events 02h, 03h). Callees: RollDice, DamageCharacter.
```pascal
DamageType := $10;                                                        { 5c00:1a4f  Acid }
DamageCharacter(c^.combatant^.target, RollDice(1, 4), 0, false);          { 5c00:1a54 .. 1a76 }
```
(Removed again by EffSpitAcid 5C00:2C1C: `RemoveEffect(c, $50, nil)`.)

### 5C00:1AAA EffFearAura (M)
`procedure EffFearAura(c [BP+0Ch]: PChar; e [BP+8]: PEffect; mode [BP+6]: Byte)` — effect handler type **51h** (event 08h). Callees: IsSideZero, SavingThrow, ApplyEffect.
Every active character of the other side (list `PartyHead`, link `+104h`) saves vs spell; low-level ones (level_main 0..3) are paralysed with fear, level 4..5 weakened by fear (dragon-fear aura, M).
```pascal
m := PartyHead;                                                           { 5c00:1ab0 }
while m <> nil do begin                                                   { 5c00:1abd }
  if (m^.active <> 0) and (Ord(IsSideZero(c)) = m^.side) then begin       { 5c00:1ac8 / 1ad6  side opposite to c }
    saved := SavingThrow(m, 4, 0);                                        { 5c00:1aee }
    case ShortInt(m^.level_main) of                                       { 5c00:1b02  signed compares }
      0..3: ApplyEffect(m, $34, 0, $0C, 0, 1, saved, 'is paralyzed with fear');   { 5c00:1b11  duration 0 = permanent }
      4, 5: ApplyEffect(m, $02, 0, $0C, 0, 1, saved, 'is weakened by fear');      { 5c00:1b48 }
    end;
  end;
  m := m^.next;                                                           { 5c00:1b75 }
end;
```
Quirk: the paralysis has duration 0 (permanent until cured/removed) — H from the pushed word `XOR AX,AX` at 5c00:1b1a.

### 5C00:1BA8 EffFearOnce (M)
`procedure EffFearOnce(c [BP+0Ch]: PChar; e [BP+8]: PEffect; mode [BP+6]: Byte)` — effect handler type **52h** (event 08h). Callees: RemoveEffect, IsSideZero, SavingThrow, Roll, ApplyEffect.
```pascal
m := PartyHead;                                                           { 5c00:1bae }
while m <> nil do begin                                                   { 5c00:1bbb }
  RemoveEffect(m, $52, nil);                                              { 5c00:1bc6  every listed character loses effect 52h (so it fires once) }
  if (m^.active <> 0) and (Ord(IsSideZero(c)) = m^.side) then begin       { 5c00:1bda / 1be8 }
    bonus := 0;                                                           { 5c00:1bfd }
    if side_ActiveCount[m^.side] >= 6 then Inc(bonus);                    { 5c00:1c01 }
    if m^.race = 7 then bonus := bonus + 2;                               { 5c00:1c16  Human }
    saved := SavingThrow(m, 0, bonus);                                    { 5c00:1c24 }
    ApplyEffect(m, $34, Roll(1, 4), $0C, 0, 1, saved, 'is paralyzed with fear');   { 5c00:1c39 .. 1c6c }
  end;
  m := m^.next;                                                           { 5c00:1c71 }
end;
```

### 5C00:1CAD EffStoneGaze (H)
`procedure EffStoneGaze(c [BP+0Ch]: PChar; e [BP+8]: PEffect; mode [BP+6]: Byte)` — effect handler type **53h** (event 0Eh). Callees: ShowCharacterMessage, BuildFourAnimationFrames, CombatantCol/Row, AnimateAlongPath, HasEffect, SavingThrow, ApplyFatalStatus.
Petrifying gaze at the current target; a readied item with a "Mirror" name word (76h) reflects it back onto the gazer (only checked when the gazer has effect 7Fh). Name H (strings "gazes...", "reflects it!", "is Stoned", status 7 = Stoned).
```pascal
HookOpponent := c^.combatant^.target;                                    { 5c00:1cb3 }
ShowCharacterMessage(c, 'gazes...', 10, false);                           { 5c00:1cca }
BuildFourAnimationFrames($12);                                            { 5c00:1cea }
AnimateAlongPath(CombatantCol(c), CombatantRow(c),
                 CombatantCol(HookOpponent), CombatantRow(HookOpponent), 4, $2D);   { 5c00:1cf2 .. 1d2c }
if HasEffect(c, $7F, p) then begin                                        { 5c00:1d31 }
  reflected := false;                                                     { 5c00:1d4b }
  it := HookOpponent^.items;                                             { 5c00:1d4f }
  while (it <> nil) and not reflected do begin                            { 5c00:1d63 / 1d6e }
    if (it^.readied <> 0) and
       ((it^.word[1] = $76) or (it^.word[2] = $76) or (it^.word[3] = $76)) then begin   { 5c00:1d77 .. 1da0  'Mirror' }
      ShowCharacterMessage(HookOpponent, 'reflects it!', 12, false);     { 5c00:1da2 }
      AnimateAlongPath(CombatantCol(HookOpponent), CombatantRow(HookOpponent),
                       CombatantCol(c), CombatantRow(c), 4, $2D);         { 5c00:1dc4 .. 1dfe }
      reflected := true;                                                  { 5c00:1e03 }
      HookOpponent := c;                                                 { 5c00:1e07 }
    end;
    it := it^.next;                                                       { 5c00:1e14 }
  end;
end;
if not SavingThrow(HookOpponent, 1, 0) then                              { 5c00:1e28  petrification }
  ApplyFatalStatus(HookOpponent, 7, 'is Stoned');                           { 5c00:1e3f }
```

### 5C00:1E77 EffCharmGaze (H)
`procedure EffCharmGaze(c [BP+0Ch]: PChar; e [BP+8]: PEffect; mode [BP+6]: Byte)` — effect handler type **54h** (event 0Eh). Callees: CombatantCol/Row, CanAttack (ov13 e8), TraceLine (ov30 e5), ShowCharacterMessage, BuildFourAnimationFrames, AnimateAlongPath, SavingThrow, ApplyEffect, HasEffect, CallEffectHandler.
Charming gaze ("Gazes...", "is charmed"; effect 0Bh = charm, spell 0Ah = Charm Person, image name table DS:28E9 + 0Ah·29h, H).
```pascal
HookOpponent := c^.combatant^.target;                                    { 5c00:1e7d }
tx := CombatantCol(HookOpponent);                                        { 5c00:1e94 }
ty := CombatantRow(HookOpponent);                                        { 5c00:1ea4 }
if not CanAttack(c, HookOpponent) then exit;                             { 5c00:1eb4 }
if not TraceLine(CombatantCol(c), CombatantRow(c), tx, ty, range, cm_Map) then exit;   { 5c00:1ece .. 1efd }
ShowCharacterMessage(c, 'Gazes...', 10, false);                           { 5c00:1f09 }
BuildFourAnimationFrames($12);                                            { 5c00:1f29 }
AnimateAlongPath(CombatantCol(c), CombatantRow(c),
                 CombatantCol(HookOpponent), CombatantRow(HookOpponent), 4, $2D);   { 5c00:1f31 .. 1f6b }
sp_Current := $0A;                                                       { 5c00:1f70  Charm Person (for the magic-resistance hooks) }
ApplyEffect(HookOpponent, $0B, 0, c^.side * $80 + $0C, 1, 1,
            SavingThrow(c^.combatant^.target, 4, -2), 'is charmed');       { 5c00:1f75 .. 1fc5 }
if HasEffect(HookOpponent, $0B, p) then                                  { 5c00:1fca }
  CallEffectHandler($0B, HookOpponent, p, 0);                            { 5c00:1fe3 }
```
Quirk: `range` ([BP-2]) is never initialised before it is passed (by reference) as TraceLine's step limit — the line test uses whatever word is on the stack (H: no write to [BP-2] in 1E77).

### 5C00:2002 DrainClass (M)
`function DrainClass: Byte` — **nested** procedure of DrainLevels (parent frame pointer pushed at [BP+6], RETF 2; reads the parent's `c` = parent [BP+8] and writes the parent's locals `xpBest` = parent [BP-31h] (LongInt) and `xpTmp` = parent [BP-2Dh] (LongInt)). Callers: DrainLevels only.
Chooses the class whose level is drained: the class with the highest level; on equal levels the later class wins when its XP threshold is ≥ the best one so far. Also leaves the XP threshold of that class/level in `xpBest`.
```pascal
xpBest := 0;                                                              { 5c00:2008 }
bestLvl := 0;                                                             { 5c00:2015 }
for i := 0 to 7 do begin                                                  { 5c00:2019 }
  lvl := ShortInt(c^.level[i]);                                           { 5c00:2022 }
  if lvl > 1 then xpTmp := XpForLevel[i, lvl]                             { 5c00:2037  DS:409B + i*38h + lvl*4 }
  else xpTmp := 0;                                                        { 5c00:2069 }
  if lvl >= bestLvl then                                                  { 5c00:2076  signed }
    if (xpTmp >= xpBest) or (xpTmp = -1) then begin                       { 5c00:207e .. 20a9  signed LongInt compare }
      xpBest := xpTmp;                                                    { 5c00:20ab }
      result := i;                                                        { 5c00:20c1 }
      bestLvl := lvl;                                                     { 5c00:20c7 }
    end;
end;
DrainClass := result;                                                     { 5c00:20d6 }
```
`XpForLevel` (DS:409B, 8 classes × 14 LongInts, image bytes, H): fighter 2001, 4001, 8001, 18001, 35001, 70001, 125001 at levels 2..8; cleric 1501..27501 (levels 2..6), magic-user 2501..40001 (2..6), thief 1251..110001 (2..9); −1 = level not reachable; classes 1, 3, 4, 7 all −1 (not playable).

### 5C00:2122 DrainLevels (H)
`procedure DrainLevels(c [BP+8]: PChar; n [BP+6]: Byte)` — RETF 6. Callers: EffDrainOne (5C00:23A4), EffDrainTwo (5C00:23C2). Callees: ByteToStr, ShowCharacterMessage, ApplyFatalStatus, DebugPrint (ov33 e1), DrainClass, UpdateLevelStats (ov23 e1), RecalcCharacter.
Energy drain (strings " levels", "a level", "is drained ", "is dead forever", "max,cur,lost", "is killed"; fields +73h/+74h/+75h, SAVES.md §3).
```pascal
if n > 1 then s := ByteToStr(n) + ' levels'                               { 5c00:2129 }
else s := 'a level';                                                      { 5c00:2158 }
ShowCharacterMessage(c, 'is drained ' + s, 10, true);                     { 5c00:216b }
if c^.status = 1 then begin                                               { 5c00:2196  Animated (undead) }
  ApplyFatalStatus(c, 8, 'is dead forever');                                 { 5c00:21a1  status Gone }
  c^.hp_max := 0;                                                         { 5c00:21bd }
  exit;
end;
for k := 1 to n do begin                                                  { 5c00:21c8 }
  if c^.status <> 8 then begin                                            { 5c00:21e0  Gone: skip }
    Inc(c^.levels_drained);                                               { 5c00:21ee }
    sum := 0;
    for i := 0 to 7 do sum := sum + c^.level[i];                          { 5c00:21f5  byte sum }
    hpLoss := c^.hp_max div sum;                                          { 5c00:2219  signed IDIV; sum = 0 → runtime error 200 }
    DebugPrint('max,cur,lost', c^.hp_max, c^.hp, c^.hp_drained);          { 5c00:222f }
    for j := 1 to hpLoss do begin                                         { 5c00:225c }
      if c^.hp_max > 0 then Dec(c^.hp_max);                               { 5c00:2271 }
      if c^.hp_rolled > 0 then Dec(c^.hp_rolled);                         { 5c00:2282 }
      if c^.hp > 0 then Dec(c^.hp);                                       { 5c00:2295 }
      Inc(c^.hp_drained);                                                 { 5c00:22a8 }
    end;
    if ShortInt(c^.level_main) < 2 then begin                             { 5c00:22b7 }
      ApplyFatalStatus(c, 8, 'is dead forever');                             { 5c00:22c1 }
      c^.hp_max := 0;                                                     { 5c00:22dd }
      if (ShortInt(c^.level[DrainClass]) > 0) and (n = 2) then            { 5c00:22e5 / 22f8 }
        c^.level[DrainClass] := 0;                                        { 5c00:22fe }
    end else begin
      Dec(c^.level[DrainClass]);                                          { 5c00:2311 }
      if (c^.hp = 0) and (c^.status <> 6) then                            { 5c00:2321 }
        ApplyFatalStatus(c, 6, 'is killed');                                 { 5c00:2337  Dead }
      UpdateLevelStats(c);                                                { 5c00:2353 }
    end;
    c^.level_main := c^.level[DrainClass];                                { 5c00:235e }
    c^.xp := xpBest;                                                      { 5c00:2375  XP threshold left by the last DrainClass call }
    RecalcCharacter(c);                                                   { 5c00:2388 }
  end;
end;                                                                      { 5c00:2393 }
```
Notes (H): DrainClass is re-evaluated at every use (after the `Dec` the next call may pick another class); `c^.xp` is set to the XP threshold of the drained class's new level (0 when that level ≤ 1).

### 5C00:23A4 EffDrainOne (H)
`procedure EffDrainOne(c [BP+0Ch]: PChar; e [BP+8]: PEffect; mode [BP+6]: Byte)` — effect handler type **55h** (events 02h, 03h).
```pascal
DrainLevels(c^.combatant^.target, 1);                                     { 5c00:23a7 }
```

### 5C00:23C2 EffDrainTwo (H)
`procedure EffDrainTwo(c [BP+0Ch]: PChar; e [BP+8]: PEffect; mode [BP+6]: Byte)` — effect handler type **56h** (events 02h, 03h).
```pascal
DrainLevels(c^.combatant^.target, 2);                                     { 5c00:23c5 }
```

### 5C00:23EC EffMummyTouch (M)
`procedure EffMummyTouch(c [BP+0Ch]: PChar; e [BP+8]: PEffect; mode [BP+6]: Byte)` — effect handler type **57h** (events 02h, 03h). Callees: HasEffect, AddEffect, Roll, ShowCharacterMessage.
Infects the target with effect 32h ("Dreaded Mummy Disease" in DisplayEffects, MAGIC.pas.md) and 39h (rot, handler 5C00:1399 "Rots...").
```pascal
HookOpponent := c^.combatant^.target;                                    { 5c00:23f2 }
if not HasEffect(HookOpponent, $32, p) then begin                        { 5c00:2409 }
  AddEffect(HookOpponent, $32, $3840, $FF, 1);                           { 5c00:2422  duration 14400 }
  AddEffect(HookOpponent, $39, $A8C0, Roll(1, 6) * 16 + $0F, 1);         { 5c00:243c  duration 43200 }
  ShowCharacterMessage(HookOpponent, 'is Diseased', 10, true);           { 5c00:2468 }
end;
```

### 5C00:2490 EffDisplacement (M)
`procedure EffDisplacement(c [BP+0Ch]: PChar; e [BP+8]: PEffect; mode [BP+6]: Byte)` — effect handler type **59h** ("Displaced" in DisplayEffects) — events 08h and 10h (target of a to-hit roll).
The first attack against the character in each round misses; `e^.p3` bit 4 = "already used this round".
```pascal
if (CombatRound = 0) and (AttackRollValue = 0) then                      { 5c00:2493 }
  e^.p3 := e^.p3 and $0F                                                  { 5c00:24a1  reset }
else if (e^.p3 and $10) = 0 then begin                                    { 5c00:24b3 }
  AttackRollValue := -1;                                                  { 5c00:24c0  miss }
  e^.p3 := e^.p3 or $10;                                                  { 5c00:24c5 }
end;
```
Name M (behaviour + the DisplayEffects text of type 59h); the meaning of the reset condition (round 0 and roll 0) is L.

### 5C00:24D9 EffConSaveBonusPoison (H)
`procedure EffConSaveBonusPoison(c [BP+0Ch]: PChar; e [BP+8]: PEffect; mode [BP+6]: Byte)` — effect handler type **5Ah** (event 0Ch saving throw).
AD&D dwarf/halfling CON bonus to saves vs poison (save type 0).
```pascal
if SaveType = 0 then begin                                                { 5c00:24df }
  case c^.con of                                                          { 5c00:24e6 }
    4..6:   bonus := 1;
    7..10:  bonus := 2;
    11..13: bonus := 3;
    14..17: bonus := 4;
    18..20: bonus := 5;
  end;                                                                    { quirk: CON < 4 or > 20 → bonus uninitialised ([BP-1]) }
  SaveRoll := SaveRoll + bonus;                                           { 5c00:2531 }
end;
```

### 5C00:2556 EffShield (M)
`procedure EffShield(c [BP+0Ch]: PChar; e [BP+8]: PEffect; mode [BP+6]: Byte)` — effect handler type **5Bh** (event 06h damage taken).
Immune to Magic Missile (spell 0Fh, name table DS:28E9) and to electricity damage. Name M (AD&D Shield spell behaviour vs magic missile; the electricity part is from the asm).
```pascal
if sp_Current = $0F then begin                                           { 5c00:255c  Magic Missile }
  CancelDamageAndEffect(0);                                                       { 5c00:2563  no damage, no effect }
  ShowCharacterMessage(c, 'is unaffected', 10, true);                     { 5c00:256a }
end else if (DamageType and 4) <> 0 then                                  { 5c00:258c  Electricity }
  CancelDamageAndEffect(0);                                                       { 5c00:2595 }
```

### 5C00:25A2 EffHalveFire (H)
`procedure EffHalveFire(c [BP+0Ch]: PChar; e [BP+8]: PEffect; mode [BP+6]: Byte)` — effect handler type **5Dh** (event 06h).
```pascal
if (DamageType and 1) <> 0 then DamageAmount := DamageAmount shr 1;      { 5c00:25a5 }
```

### 5C00:25BC EffHalveWeapon (M)
`procedure EffHalveWeapon(c [BP+0Ch]: PChar; e [BP+8]: PEffect; mode [BP+6]: Byte)` — effect handler type **5Eh** (event 05h, weapon damage; the attacker is SelectedChar).
```pascal
it := CurrentAttackItem(SelectedChar);                                        { 5c00:25c2  attacker's weapon/ammo }
if (it <> nil) and ((ITEMS[it^.type].wflags and $81) <> 0) then          { 5c00:25d4  DS:5589 + type*16 }
  DamageAmount := DamageAmount shr 1;                                     { 5c00:25f5 }
```

### 5C00:2610 EffFallsDead (H)
`procedure EffFallsDead(c [BP+0Ch]: PChar; e [BP+8]: PEffect; mode [BP+6]: Byte)` — effect handler type **5Fh** (no hook event: runs when the effect expires, AddEffect callOnRemove = 1 by EffReviveOnce 5C00:2730).
```pascal
e^.callOnRemove := 0;                                                     { 5c00:2616 }
if c^.active <> 0 then                                                    { 5c00:261e }
  ApplyFatalStatus(c, 6, 'Falls dead');                                      { 5c00:2629 }
```

### 5C00:264B EffNeedSilverOrMagic (M)
`procedure EffNeedSilverOrMagic(c [BP+0Ch]: PChar; e [BP+8]: PEffect; mode [BP+6]: Byte)` — effect handler type **60h** (event 05h).
Only magic (+1 or better) or Silver (name word B1h) weapons hurt.
```pascal
it := CurrentAttackItem(SelectedChar);                                        { 5c00:2651 }
if (it = nil) or ((it^.plus = 0) and (it^.word[3] <> $B1)) then           { 5c00:2663 .. 267d  'Silver' }
  DamageAmount := 0;                                                      { 5c00:267f }
```

### 5C00:268A EffConSaveBonusMagic (H)
`procedure EffConSaveBonusMagic(c [BP+0Ch]: PChar; e [BP+8]: PEffect; mode [BP+6]: Byte)` — effect handler type **61h** (event 0Ch).
Same CON table as 5C00:24D9, for save types 4 (spell) and 2 (rod/staff/wand).
```pascal
if (SaveType = 4) or (SaveType = 2) then begin                            { 5c00:2690 }
  case c^.con of 4..6: bonus := 1; 7..10: bonus := 2; 11..13: bonus := 3;
                 14..17: bonus := 4; 18..20: bonus := 5 end;              { 5c00:269e  same quirk: other CON → uninitialised }
  SaveRoll := SaveRoll + bonus;                                           { 5c00:26e9 }
end;
```

### 5C00:2700 EffRegenerate3 (H)
`procedure EffRegenerate3(c [BP+0Ch]: PChar; e [BP+8]: PEffect; mode [BP+6]: Byte)` — effect handler type **62h** (event 13h).
```pascal
c^.hp := c^.hp + 3;                                                       { 5c00:2703 }
if c^.hp > c^.hp_max then c^.hp := c^.hp_max;                             { 5c00:270c }
```

### 5C00:2730 EffReviveOnce (M)
`procedure EffReviveOnce(c [BP+0Ch]: PChar; e [BP+8]: PEffect; mode [BP+6]: Byte)` — effect handler type **63h** (events 08h, 0Dh character went down). Callees: ReviveCombatant, Roll, AddEffect, RemoveEffect.
A downed creature gets up again once, with up to 6 hp, and falls dead 2..5 rounds later (effect 5Fh).
```pascal
hp := 0;                                                                  { 5c00:2736 }
if (c^.status = 5) and (c^.combatant^[$0E] < 6) then                      { 5c00:273a  Dying }
  hp := 6 - c^.combatant^[$0E];                                           { 5c00:2754 }
if c^.status = 4 then hp := 6;                                            { 5c00:276c  Unconscious }
if hp > 0 then                                                            { 5c00:277b }
  if ReviveCombatant(c, hp) then begin                                    { 5c00:2781 }
    AddEffect(c, $5F, Roll(1, 4) + 1, $FF, 1);                            { 5c00:2794 }
    e^.callOnRemove := 0;                                                 { 5c00:27b7 }
    RemoveEffect(c, $63, e);                                              { 5c00:27bf }
  end;
```
`combatant^[$0E]` = combat-record byte +0Eh (meaning L; not among the fields named by ov13).

### 5C00:27D9 EffTrollDown (M)
`procedure EffTrollDown(c [BP+0Ch]: PChar; e [BP+8]: PEffect; mode [BP+6]: Byte)` — effect handler type **64h** (event 0Dh character went down).
Unless the blow was fire or acid, the creature will regenerate (effect 66h for 3d6 rounds).
```pascal
if ((DamageType and 1) = 0) and ((DamageType and $10) = 0) then          { 5c00:27dc }
  AddEffect(c, $66, Roll(3, 6), $FF, 1);                                  { 5c00:27ee }
```

### 5C00:2814 EffStartRegenerating (M)
`procedure EffStartRegenerating(c [BP+0Ch]: PChar; e [BP+8]: PEffect; mode [BP+6]: Byte)` — effect handler type **65h** (events 05h, 06h).
```pascal
if not HasEffect(c, $62, p)                                               { 5c00:281a }
   and not HasEffect(c, $3B, p) then                                      { 5c00:2831 }
  AddEffect(c, $3B, 3, $FF, 1);                                           { 5c00:2848  3Bh = 'Regenerating' (DisplayEffects) }
```

### 5C00:2866 EffTrollRise (M)
`procedure EffTrollRise(c [BP+0Ch]: PChar; e [BP+8]: PEffect; mode [BP+6]: Byte)` — effect handler type **66h** (not in a hook list: runs when the effect expires, callOnRemove = 1).
```pascal
if not ReviveCombatant(c, c^.hp_max) then                                 { 5c00:286c }
  ok := AddEffectUnlessCuring(c, $66, e^.p3, 1);                                  { 5c00:2883  try again next round (duration 1) }
```

### 5C00:28BF EffGaseousEscape (H)
`procedure EffGaseousEscape(c [BP+0Ch]: PChar; e [BP+8]: PEffect; mode [BP+6]: Byte)` — effect handler type **67h** (event 0Dh). Callees: FocusCombatant (ov31 e19), RemoveFromCombat.
```pascal
e^.callOnRemove := 0;                                                     { 5c00:28c5 }
FocusCombatant(c, 3, false);                                              { 5c00:28cd }
RemoveFromCombat(c, 3, 'Turns gaseous and escapes');                      { 5c00:28de  status 3 = Running }
```

### 5C00:2901 EffAvoidMissiles60 (M)
`procedure EffAvoidMissiles60(c [BP+0Ch]: PChar; e [BP+8]: PEffect; mode [BP+6]: Byte)` — effect handler type **68h** (event 05h).
```pascal
AvoidRangedAttack(c, 60);                                                     { 5c00:2904  60 % "Avoids it" vs ranged attacks }
```

### 5C00:2915 MagicResistance (M)
`procedure MagicResistance(pct [BP+6]: Byte)` — near-called with far frame (PUSH CS; CALL), RETF 2. Callers: EffMagicRes50 (2976), EffMagicRes15 (2984). Callees: SpellCasterLevel, Roll, CancelDamageAndEffect.
Magic resistance `pct` %, adjusted by 5 % per caster level difference from 11.
```pascal
lvl := SpellCasterLevel(sp_Current);                                     { 5c00:291b }
chance := pct - (11 - lvl) * 5;                                           { 5c00:2927  byte arithmetic }
if (EffectToApply <> 0) or ((DamageType and 8) <> 0) then                 { 5c00:2947  a spell effect or magic damage }
  if Roll(1, 100) <= chance then CancelDamageAndEffect(0);                        { 5c00:2959  unsigned compare }
```
Quirk (H): `chance` is a byte and compared unsigned — when `(11 - lvl)*5 > pct` it wraps to ≥ 0x80 and the resistance then **always** succeeds (e.g. pct 15 vs a caster level ≤ 7).

### 5C00:2976 EffMagicRes50 (M)
`procedure EffMagicRes50(c [BP+0Ch]: PChar; e [BP+8]: PEffect; mode [BP+6]: Byte)` — effect handler type **69h** (events 06h, 09h).
```pascal
MagicResistance(50);                                                      { 5c00:2979 }
```

### 5C00:2984 EffMagicRes15 (M)
`procedure EffMagicRes15(c [BP+0Ch]: PChar; e [BP+8]: PEffect; mode [BP+6]: Byte)` — effect handler type **6Ah** (events 06h, 09h).
```pascal
MagicResistance(15);                                                      { 5c00:2987 }
```

### 5C00:2992 EffResistSleepCharm90 (M)
`procedure EffResistSleepCharm90(c [BP+0Ch]: PChar; e [BP+8]: PEffect; mode [BP+6]: Byte)` — effect handler type **6Bh** (event 09h new effect). AD&D elf 90 % resistance (M).
```pascal
if Roll(1, 100) <= 90 then begin                                          { 5c00:2995 }
  CancelDamageAndEffect($35);                                                     { 5c00:29a4  sleep/helpless effect 35h }
  CancelDamageAndEffect($0B);                                                     { 5c00:29ab  charm }
end;
```

### 5C00:29B6 EffImmuneSleepCharm (M)
`procedure EffImmuneSleepCharm(c [BP+0Ch]: PChar; e [BP+8]: PEffect; mode [BP+6]: Byte)` — effect handler type **6Ch** (event 09h).
```pascal
CancelDamageAndEffect($0B);                                                       { 5c00:29b9 }
CancelDamageAndEffect($35);                                                       { 5c00:29c0 }
```

### 5C00:29CB EffImmuneHold (M)
`procedure EffImmuneHold(c [BP+0Ch]: PChar; e [BP+8]: PEffect; mode [BP+6]: Byte)` — effect handler type **6Dh** (event 09h).
```pascal
CancelDamageAndEffect($34);                                                       { 5c00:29ce  paralysis/hold effect 34h }
```

### 5C00:29D9 EffImmuneCold (H)
`procedure EffImmuneCold(c [BP+0Ch]: PChar; e [BP+8]: PEffect; mode [BP+6]: Byte)` — effect handler type **6Eh** (event 09h).
```pascal
if (DamageType and 2) <> 0 then CancelDamageAndEffect(0);                        { 5c00:29dc }
```

### 5C00:29F0 EffImmunePoisonParalysis (M)
`procedure EffImmunePoisonParalysis(c [BP+0Ch]: PChar; e [BP+8]: PEffect; mode [BP+6]: Byte)` — effect handler type **6Fh** (events 09h, 0Ch).
```pascal
CancelDamageAndEffect($37);                                                       { 5c00:29f3  'Poisoned' }
CancelDamageAndEffect($34);                                                       { 5c00:29fa }
if SaveType = 0 then SaveRoll := 100;                                     { 5c00:2a01  save vs paralysis/poison always made }
```

### 5C00:2A11 EffImmuneFire (H)
`procedure EffImmuneFire(c [BP+0Ch]: PChar; e [BP+8]: PEffect; mode [BP+6]: Byte)` — effect handler type **70h** (events 06h, 09h).
```pascal
if (DamageType and 1) <> 0 then CancelDamageAndEffect(0);                        { 5c00:2a14 }
```

### 5C00:2A28 EffFireMinusOnePerDie (M)
`procedure EffFireMinusOnePerDie(c [BP+0Ch]: PChar; e [BP+8]: PEffect; mode [BP+6]: Byte)` — effect handler type **71h** (event 06h).
Fire damage −1 per die rolled, but at least 1 per die.
```pascal
if (DamageType and 1) <> 0 then                                           { 5c00:2a2e }
  for i := 1 to LastDiceCount do begin                                    { 5c00:2a37 }
    Dec(DamageAmount);                                                    { 5c00:2a4c }
    if DamageAmount < LastDiceCount then DamageAmount := LastDiceCount;   { 5c00:2a50 }
  end;
```

### 5C00:2A6D EffHalveElectricity (H)
`procedure EffHalveElectricity(c [BP+0Ch]: PChar; e [BP+8]: PEffect; mode [BP+6]: Byte)` — effect handler type **72h** (event 06h).
```pascal
if (DamageType and 4) <> 0 then DamageAmount := DamageAmount shr 1;      { 5c00:2a70 }
```

### 5C00:2A87 EffHalveEdged (M)
`procedure EffHalveEdged(c [BP+0Ch]: PChar; e [BP+8]: PEffect; mode [BP+6]: Byte)` — effect handler type **73h** (event 05h).
Half damage from weapons that are not blunt (ITEMS wflags 01h = edged/pointed, 80h = blunt; SAVES.md §6) and from non-weapon items (wflags 0).
```pascal
it := CurrentAttackItem(SelectedChar);                                        { 5c00:2a8d }
if it <> nil then                                                         { 5c00:2a9f }
  if (ITEMS[it^.type].wflags = 0) or ((ITEMS[it^.type].wflags and 1) <> 0) then   { 5c00:2aa7 / 2abd }
    DamageAmount := DamageAmount shr 1;                                   { 5c00:2ad6 }
```

### 5C00:2AE6 EffHalveMagicWeapon (M)
`procedure EffHalveMagicWeapon(c [BP+0Ch]: PChar; e [BP+8]: PEffect; mode [BP+6]: Byte)` — effect handler type **74h** (event 05h).
```pascal
it := CurrentAttackItem(SelectedChar);                                        { 5c00:2aec }
if (it <> nil) and (ShortInt(it^.plus) > 0) then                          { 5c00:2afe }
  DamageAmount := DamageAmount shr 1;                                     { 5c00:2b10 }
```

### 5C00:2B20 EffHolyWater (M)
`procedure EffHolyWater(c [BP+0Ch]: PChar; e [BP+8]: PEffect; mode [BP+6]: Byte)` — effect handler type **75h** (event 05h).
A Holy Water vial (item type 55h = 85, ITEMS.md) does 1d6+1.
```pascal
w := SelectedChar^.readied[0];                                            { 5c00:2b26  weapon slot +CCh }
if (w <> nil) and (w^.type = $55) then                                    { 5c00:2b3a }
  DamageAmount := RollDice(1, 6) + 1;                                     { 5c00:2b4c }
```

### 5C00:2B63 EffHalveCold (H)
`procedure EffHalveCold(c [BP+0Ch]: PChar; e [BP+8]: PEffect; mode [BP+6]: Byte)` — effect handler type **76h** (event 06h).
```pascal
if (DamageType and 2) <> 0 then DamageAmount := DamageAmount shr 1;      { 5c00:2b66 }
```

### 5C00:2B7D EffNeedMagicWeapon (M)
`procedure EffNeedMagicWeapon(c [BP+0Ch]: PChar; e [BP+8]: PEffect; mode [BP+6]: Byte)` — effect handler type **77h** (event 05h).
Non-magic weapons do no damage — except for monster attackers (race 0) of level_main ≥ 4.
```pascal
it := CurrentAttackItem(SelectedChar);                                        { 5c00:2b83 }
if (it = nil) or (it^.plus = 0) then                                      { 5c00:2b95 }
  if (ShortInt(SelectedChar^.race) > 0) or (ShortInt(SelectedChar^.level_main) < 4) then   { 5c00:2ba7 / 2bb2 }
    DamageAmount := 0;                                                    { 5c00:2bbd }
```

### 5C00:2BC8 EffAvoidBoulders (M)
`procedure EffAvoidBoulders(c [BP+0Ch]: PChar; e [BP+8]: PEffect; mode [BP+6]: Byte)` — effect handler type **78h** (event 05h).
```pascal
w := SelectedChar^.readied[0];                                            { 5c00:2bce }
if (w <> nil) and ((w^.type = $57) or (w^.type = $58)) then               { 5c00:2be2  Boulder types 87/88 (ITEMS.md) }
  AvoidRangedAttack(c, 50);                                                   { 5c00:2bfe  50 % "Avoids it" }
```

### 5C00:2C1C EffSpitAcid (H)
`procedure EffSpitAcid(c [BP+0Ch]: PChar; e [BP+8]: PEffect; mode [BP+6]: Byte)` — effect handler type **79h** (event 0Eh). Callees: Roll, TargetDistance, ClearCombatantActionFlags, ShowCharacterMessage, BuildFourAnimationFrames, CombatantCol/Row, AnimateAlongPath, RollDice, SavingThrow, DamageCharacter, RemoveEffect.
25 % chance per turn, target within 3 squares: 8d4, half on a save vs breath (save type 3); then the attack is used up (removes 79h and the acid-touch effect 50h).
```pascal
HookOpponent := c^.combatant^.target;                                    { 5c00:2c22 }
if Roll(1, 100) > 25 then exit;                                           { 5c00:2c39 }
if TargetDistance(c, HookOpponent) >= 4 then exit;                       { 5c00:2c4b }
done := ClearCombatantActionFlags(c);                                     { 5c00:2c65  result unused }
ShowCharacterMessage(c, 'Spits Acid', 10, true);                          { 5c00:2c73 }
BuildFourAnimationFrames($17);                                            { 5c00:2c93 }
AnimateAlongPath(CombatantCol(c), CombatantRow(c),
                 CombatantCol(HookOpponent), CombatantRow(HookOpponent), 1, $1E);   { 5c00:2c9b .. 2cd5 }
DamageCharacter(HookOpponent, RollDice(8, 4), 2, SavingThrow(HookOpponent, 3, 0));  { 5c00:2cda .. 2d05 }
RemoveEffect(c, $79, e);                                                  { 5c00:2d0a }
RemoveEffect(c, $50, nil);                                                { 5c00:2d1e }
```
Quirk (H): DamageType is not set here — the damage text/hooks see whatever kind the previous damage left.

### 5C00:2D38 EffOilFlask (M)
`procedure EffOilFlask(c [BP+0Ch]: PChar; e [BP+8]: PEffect; mode [BP+6]: Byte)` — effect handler type **7Ah** (events 05h, 06h).
```pascal
w := SelectedChar^.readied[0];                                            { 5c00:2d3e }
if (w <> nil) and (w^.type = $56) then                                    { 5c00:2d52  Flask of Oil (86) }
  DamageAmount := RollDice(3, 8);                                         { 5c00:2d64 }
if (DamageType and 9) <> 0 then                                           { 5c00:2d72  Fire or Magic }
  DamageAmount := DamageAmount + LastDiceCount;                           { 5c00:2d7b  +1 per die }
```

### 5C00:2D88 EffNeedMagicSilverHalf (M)
`procedure EffNeedMagicSilverHalf(c [BP+0Ch]: PChar; e [BP+8]: PEffect; mode [BP+6]: Byte)` — effect handler type **7Bh** (event 05h).
Non-magic weapons do nothing, non-magic Silver weapons half.
```pascal
it := CurrentAttackItem(SelectedChar);                                        { 5c00:2d8e }
if it <> nil then begin                                                   { 5c00:2da0 }
  if (it^.plus = 0) and (it^.word[3] = $B1) then                          { 5c00:2da8  'Silver' }
    DamageAmount := DamageAmount shr 1                                    { 5c00:2dbc }
  else if it^.plus = 0 then
    DamageAmount := 0;                                                    { 5c00:2dc8 }
end else
  DamageAmount := 0;                                                      { 5c00:2dd9 }
```

### 5C00:2DE4 EffResistSleepCharm30 (M)
`procedure EffResistSleepCharm30(c [BP+0Ch]: PChar; e [BP+8]: PEffect; mode [BP+6]: Byte)` — effect handler type **7Ch** (event 09h). AD&D half-elf 30 % (M).
```pascal
if Roll(1, 100) <= 30 then begin                                          { 5c00:2de7 }
  CancelDamageAndEffect($0B);                                                     { 5c00:2df6 }
  CancelDamageAndEffect($35);                                                     { 5c00:2dfd }
end;
```

### 5C00:2E08 EffUndeadImmunities (M)
`procedure EffUndeadImmunities(c [BP+0Ch]: PChar; e [BP+8]: PEffect; mode [BP+6]: Byte)` — effect handler type **7Dh** (events 09h, 0Ch).
```pascal
CancelDamageAndEffect($0B);                                                       { 5c00:2e0b  charm }
CancelDamageAndEffect($35);                                                       { 5c00:2e12  sleep }
CancelDamageAndEffect($34);                                                       { 5c00:2e19  hold/paralysis }
CancelDamageAndEffect($37);                                                       { 5c00:2e20  poison }
if SaveType = 0 then SaveRoll := 100;                                     { 5c00:2e27 }
```
Name M (the set charm+sleep+hold+poison is the AD&D undead immunity list).

### 5C00:2E37 EffWardedByItem (M)
`procedure EffWardedByItem(c [BP+0Ch]: PChar; e [BP+8]: PEffect; mode [BP+6]: Byte)` — effect handler type **7Eh** (event 00h). Sets `AttackBlocked` (ov13 CanAttack veto) when the target carries a readied Mirror (word 76h) or a non-wooden Holy Symbol... see note.
```pascal
HookOpponent := c^.combatant^.target;                                    { 5c00:2e3d }
it := HookOpponent^.items;                                               { 5c00:2e54 }
while (it <> nil) and (AttackBlocked = 0) do begin                        { 5c00:2e68 / 2e70 }
  if it^.readied <> 0 then                                                { 5c00:2e77 }
    for k := 1 to 3 do                                                    { 5c00:2e81 }
      if ((it^.word[k] = $98) and (it^.word[3] = $FC)) or (it^.word[k] = $76) then   { 5c00:2e8a .. 2eb4 }
        AttackBlocked := 1;                                               { 5c00:2eb6 }
  it := it^.next;                                                         { 5c00:2ec1 }
end;
```
Note (H from bytes): the Holy Symbol test is `word[k] = 98h ('Holy Symbol') and word[3] = FCh ('Wooden')` — i.e. a *Wooden* Holy Symbol counts (name words read from DS:10A7 + w·21). Story meaning (vampire warding) L.

### 5C00:2EDA ItemGrantsEffect (M)
`procedure ItemGrantsEffect(c [BP+0Ch]: PChar; item [BP+8]: ^TItem; mode [BP+6]: Byte)` — handler for item-power types **80h, 81h, 82h, 85h, 86h, 88h, 8Ah, 8Bh** (the readied-item power byte with bit 7, SAVES.md §4 `power`). Callees: RemoveEffect, AddEffect, CallEffectHandler.
While the item is readied the wearer has effect `item^.power[2]` (+3Dh).
```pascal
it := item;                                                               { 5c00:2ee0 }
if mode <> 0 then                                                         { 5c00:2eec  item un-readied }
  RemoveEffect(c, it^.power[2], nil)                                      { 5c00:2ef2 }
else begin
  AddEffect(c, it^.power[2], 0, $0C, 0);                                  { 5c00:2f0d  permanent }
  CallEffectHandler(it^.power[2], c, nil, 0);                             { 5c00:2f29 }
end;
```
Name M: the 2nd parameter is dereferenced at +3Dh, inside the 63-byte item record (`power[1..3]` = +3Ch..+3Eh); whose code calls these handlers with an item is not in ov12 (L: item ready/unready code).

### 5C00:2F57 ItemGiantStrength (M)
`procedure ItemGiantStrength(c [BP+0Ch]: PChar; item [BP+8]: ^TItem; mode [BP+6]: Byte)` — item-power handler type **83h**. Callees: DecodeStrength, RemoveEffect, SetStrength, ShowCharacterMessage, AddEffect.
Readying the item sets STR 18/00 (effect 26h keeps the old strength code in p3); un-readying removes that effect again.
```pascal
if mode <> 0 then begin                                                   { 5c00:2f5d }
  found := false;                                                         { 5c00:2f66 }
  p := c^.effects;                                                        { 5c00:2f6a }
  is1800 := (c^.str = 18) and (c^.str_exc = 100);                         { 5c00:2f7c }
  while (p <> nil) and not found do begin                                 { 5c00:2f9a }
    if p^.type = $26 then begin                                           { 5c00:2fa8 }
      DecodeStrength(p, oldStr, oldExc);                                  { 5c00:2fb1 }
      if (is1800 and (p^.type < $80)) or
         ((oldStr = 18) and (oldExc = 100) and not is1800) then begin     { 5c00:2fc6 .. 2fe5 }
        RemoveEffect(c, $26, p);                                          { 5c00:2fe7 }
        found := true;                                                    { 5c00:2ffb }
      end;
    end;
    p := p^.next;                                                         { 5c00:2fff }
  end;
end else begin
  if SetStrength(c, 18, 100, oldCode) then                                { 5c00:3015 }
    if game_Mode = 5 then begin                                           { 5c00:302f }
      game_Mode := 2;                                                     { 5c00:3036  message in the text window, not the combat panel }
      ShowCharacterMessage(c, 'is stronger', 10, true);                   { 5c00:303b }
      game_Mode := 5;                                                     { 5c00:305b }
    end else
      ShowCharacterMessage(c, 'is stronger', 10, true);                   { 5c00:3062 }
  ItemsChanged := 1;                                                      { 5c00:3082 }
  AddEffect(c, $26, 0, oldCode, 1);                                       { 5c00:3087  also when SetStrength failed }
end;
```
Quirk (H): `p^.type < 80h` is always true for a type-26h record, so with STR 18/00 the first 26h effect is removed regardless of its stored code (the asm compares the record's byte +0, 5c00:2fcf).

### 5C00:30A5 ItemAlignmentShock (M)
`procedure ItemAlignmentShock(c [BP+0Ch]: PChar; item [BP+8]: ^TItem; mode [BP+6]: Byte)` — item-power handler type **84h**. Callees: DrawCombatLayout, DamageCharacter.
An item keyed to an alignment (low nibble of power[2]) refuses another wearer: it is un-readied and deals (power[2] shr 4) magic damage.
```pascal
it := item;                                                               { 5c00:30ab }
if mode <> 0 then exit;                                                   { 5c00:30b7 }
if (it^.power[2] and $0F) <> c^.alignment then begin                      { 5c00:30bf }
  it^.readied := 0;                                                       { 5c00:30d2 }
  dmg := it^.power[2] shr 4;                                              { 5c00:30da }
  DamageType := 8;                                                        { 5c00:30ea  Magic }
  if game_Mode = 5 then DrawCombatLayout;                                 { 5c00:30ef }
  DamageCharacter(c, dmg, 0, false);                                      { 5c00:30fb }
  ItemsChanged := 1;                                                      { 5c00:3110 }
end;
```

### 5C00:3134 ItemNeedsGiantStrength (H)
`procedure ItemNeedsGiantStrength(c [BP+0Ch]: PChar; item [BP+8]: ^TItem; mode [BP+6]: Byte)` — item-power handler type **87h**.
```pascal
it := item;                                                               { 5c00:313a }
if mode <> 0 then exit;                                                   { 5c00:3146 }
if c^.str < 19 then begin                                                 { 5c00:314e }
  it^.readied := 0;                                                       { 5c00:3158 }
  ShowTimedBottomMessage('Must have Giant Strength');                     { 5c00:3160 }
end;
```

### 5C00:317A ItemRemove17 (L)
`procedure ItemRemove17(c [BP+0Ch]: PChar; item [BP+8]: ^TItem; mode [BP+6]: Byte)` — item-power handler type **89h**.
```pascal
if mode <> 0 then RemoveEffect(c, $17, nil);                              { 5c00:317d }
```
(On un-readying removes effect 17h, whose handler is EffSpiritualHammer 5C00:07E0 "Gains an item" — part A. Name L.)

### 5C00:319B EffNop (H)
`procedure EffNop(c [BP+0Ch]: PChar; e [BP+8]: PEffect; mode [BP+6]: Byte)` — empty body (`55 89 E5 5D CA 0A 00`), handler of types 05h, 0Dh, 13h, 18h, 1Bh, 3Ch, 3Fh, 5Ch, 7Fh.
```pascal
{ nothing }                                                               { 5c00:319b }
```

### 5C00:31A2 InstallEffectHandlers (H)
`procedure InstallEffectHandlers` — RETF. Caller: InitGameState (5700:060C, startup, via stub_ov12_e1). Stub entry 1 of ov12.
Fills `EffectHandler` (far pointers at DS:6828 + 4·t) for t = 01h..8Bh except 58h: 138 stores of `MOV AX,stubofs; MOV DX,stubseg; MOV [6828h+4t],AX; MOV [682Ah+4t],DX` (13 bytes each), ascending t. The stub segments are 0041 (ov12) and 0068 (ov13, entries for 49h/4Ah); each `stubofs = 20h + 5·k` = entry k.
```pascal
for t := $01 to $57 do EffectHandler[t] := Handler[t];                    { 5c00:31a5 .. 3566 }
{ EffectHandler[$58] is not written: stays 0000:0000 (BSS) }
for t := $59 to $8B do EffectHandler[t] := Handler[t];                    { 5c00:3567 .. 38a3 }
```
`Handler[t]` (resolved through the stub entry tables, scratch script over ov12.lst + ovl_layout.json; identical to the table in combat_parts/ov24.pas.md, H):
```
01 EffBless  02 EffCurse  03 EffBonusVsUndead  04 EffStartsToTrain  05 EffNop     06 EffFlameTongue  07 EffHardier  08 EffProtFromEvil
09 EffProtFromGood  0A EffResistCold  0B EffCharm  0C EffStrengthEnd  0D EffNop     0E EffSetCharisma  0F EffHpLossTick  10 EffNop10
11 EffShield  12 EffGnomeAttackBonus  13 EffNop     14 EffResistFire  15 EffSilence  16 EffSlowPoisonEnd  17 EffSpiritualHammer  18 EffNop
19 EffInvisible  1A EffDwarfAttackBonus  1B EffNop     1C EffMirrorImage  1D EffEnfeebled  1E EffCoughing  1F EffHelpless  20 EffAnimatedEnd
21 EffPenaltyAll4  22 EffWeaknessAndDrain  23 EffPlusOne  24 EffPenalty4  25 EffUntouchableBeforeTurn  26 EffStrengthEnd  27 EffHaste  28 EffCloudRemoved
29 EffMagicWeaponOnly  2A EffSlow  2B EffWeakness  2C EffHpDrainTick  2D EffProtFromEvil  2E EffProtFromGood  2F EffDwarfGiantDefence  30 EffGnomeGiantDefence
31 EffPrayer  32 EffSlowHeal  33 EffHelpless  34 EffHelpless  35 EffHelpless  36 EffNop36  37 EffNop37  38 EffGrantInvisible
39 EffMummyRot  3A EffHeld  3B EffBecome62  3C EffNop     3D EffFireResistance  3E EffRegenerate  3F EffNop     40 EffPoisonHit
41 EffPoisonHitP4  42 EffPoisonHitP2  43 EffParalyzeHit2d8  44 EffGhoulParalysis  45 EffParalyzeHitLong  46 EffPoisonHitM2  47 EffUnattackable  48 EffGrantInvisible95
49 EffRake(EffRake)  4A ov13_3A86  4B EffBloodDrain  4C EffStirgeAttach  4D EffGrab  4E EffReviveCheck
4F EffFireDamage  50 EffAcidDamage  51 EffFearAura  52 EffFearOnce  53 EffStoneGaze  54 EffCharmGaze
55 EffDrainOne  56 EffDrainTwo  57 EffMummyTouch  58 (none)  59 EffDisplacement  5A EffConSaveBonusPoison
5B EffShield  5C EffNop  5D EffHalveFire  5E EffHalveWeapon  5F EffFallsDead  60 EffNeedSilverOrMagic
61 EffConSaveBonusMagic  62 EffRegenerate3  63 EffReviveOnce  64 EffTrollDown  65 EffStartRegenerating  66 EffTrollRise
67 EffGaseousEscape  68 EffAvoidMissiles60  69 EffMagicRes50  6A EffMagicRes15  6B EffResistSleepCharm90  6C EffImmuneSleepCharm
6D EffImmuneHold  6E EffImmuneCold  6F EffImmunePoisonParalysis  70 EffImmuneFire  71 EffFireMinusOnePerDie  72 EffHalveElectricity
73 EffHalveEdged  74 EffHalveMagicWeapon  75 EffHolyWater  76 EffHalveCold  77 EffNeedMagicWeapon  78 EffAvoidBoulders
79 EffSpitAcid  7A EffOilFlask  7B EffNeedMagicSilverHalf  7C EffResistSleepCharm30  7D EffUndeadImmunities  7E EffWardedByItem
7F EffNop  80 ItemGrantsEffect  81 ItemGrantsEffect  82 ItemGrantsEffect  83 ItemGiantStrength  84 ItemAlignmentShock
85 ItemGrantsEffect  86 ItemGrantsEffect  87 ItemNeedsGiantStrength  88 ItemGrantsEffect  89 ItemRemove17  8A ItemGrantsEffect  8B ItemGrantsEffect
```
Anchors (address of the `MOV AX` of the store of type t = 31A5h + 13·(t−1) for t ≤ 57h, 31A5h + 13·(t−2) for t ≥ 59h; checked: t=01 at 5c00:31a5, t=49h → `MOV [694C],AX` at 5c00:3553, t=8Bh → `MOV [6A54],AX` at 5c00:38a0).

### 5C00:38A9 ov12_init (H)
`procedure ov12_init` — empty unit initialiser (`55 89 E5 5D CB`), called through stub entry 0 from the main program's init chain.
```pascal
{ nothing }                                                               { 5c00:38a9 }
```

---

## Coverage

| part | unit / range | routines | H | M | L |
|---|---|---|---|---|---|
| ov00 | 2000 heap-error handler | 2 | 2 | 0 | 0 |
| ov01 | 2500 title, lightning, credits | 4 | 4 | 0 | 0 |
| ov02 | 2A00 code wheel | 2 | 2 | 0 | 0 |
| ov11 | 5700 InitGameState | 2 | 1 | 1 | 0 |
| ov16a | 7000:0000..1F36 top menu, character creation (1551 = second half of CreateCharacter, split by Ghidra at a JMP) | 4 | 4 | 0 | 0 |
| ov16b | 7000:1F37..end drop, modify, train, add/remove, portraits, icon editor | 16 | 11 | 5 | 0 |
| ov17 | 7500 charlist, character/monster files, load/save game | 14 | 10 | 4 | 0 |
| ov20 | 8400 clock, rest | 16 | 15 | 1 | 0 |
| ov21 | 8900 encumbrance, coins, pool/share/take, treasure item builder, appraisal | 22 | 16 | 6 | 0 |
| ov06 | 3E00 shop | 5 | 5 | 0 | 0 |
| ov12a | 5C00:0000..1A18 effect handlers | 70 | 6 | 48 | 16 |
| ov12b | 5C00:1A19..end effect handlers, InstallEffectHandlers | 57 | 20 | 36 | 1 |
| **total** | 10 units | **214** | 96 | 101 | 17 |

**ov12 is not a training unit** (the provisional por-areas.md note): it is the active-effect handler unit. `InstallEffectHandlers` (5C00:31A2, called by ov11 InitGameState) stores 138 far pointers into `EffectHandler{g_682C}`/DS:6828+4t for effect types 01h..8Bh (58h left nil → a dispatch of type 58h would call 0000:0000); ov24 CallEffectHooks/RemoveEffect call them with an event code. "starts to train"/"is hardier" are messages of effect types 04h/07h. Types 80h..8Bh are item powers (second parameter is a `^TItem`). The type→handler table matches `combat_parts/ov24.pas.md`.

## Open items (unknowns)

Listed in detail in each `party_parts/<part>_notes.md` section (c) (≈70 items). Main ones:
- ov12: meaning of 16 L handlers (effect types whose spell/monster is not named by a string), event codes of some hooks; 9 + 5 quirks listed in the notes.
- ov11: meaning of ≈15 new-game default values; letter 'F' flag of POOL.CFG line 5 (`cfg_FullIntro`).
- ov02: whether the rune glyphs 41h..B0h match the printed wheel (needs a visual check against the PDF / DOSBox-X).
- ov16/ov17: TChar +85h/+ABh (AddNpcToParty sets +ABh := Random(256)); arguments of some ov17 callees.
- ov20: role of g_6DC0 (named PoolHasMoney by ov21: written by several routines, read nowhere).

## Cross-lane findings (code wins; for the owners)
- ECL.pas.md 2F00:1CCD: call is `MakeTreasureItem(typ, item)` (type pushed first) — ECL owner.
- VIEW.pas.md: `ListItem` (9D00) argument order printed reversed (bytes 9D00:000B/0022) — VIEW owner.
- SAVES.md: parameter order of WriteCharacter/ReadCharacter (7500:069E/0AEC) reversed; LoadGame/SaveGame erase each party member's roster .CHA/.ITM/.SPC files — por-saves.
- MONSTERS.md: LoadMonster (7500:0EC4) parameter order reversed; its colour roll is 1..6, not 0..5 — por-data.

## Self-check

1. **Per part (fork workers)**: each part re-read ≥ 10 % random statements against the asm/bytes (hdis), incl. call push orders: ov00 7/7, ov01 12, ov02 8, ov11 14, ov16a 24 (+8 push orders), ov16b 32 (+11), ov17 34 (13 push orders), ov20 27 (14 %), ov06 12 (16 %), ov21 41 (15 push orders), ov12a 36 (16 push orders), ov12b 26/26 (+14/14). Fixes found there were applied before the merge (ov06 VerticalListMenu list argument, ov20 StudyTick note, ov17 caller addresses). Samples are listed in the notes files, section (d).
2. **argcheck** (`decode/tools/argcheck.py` audit('PARTY'), PARTY_ARGCHECK.md): 1015 calls, OK 214, **MISMATCH 0**, UNSURE 801. The first run had 6 MISMATCH, all tool artefacts of two calls written on one line (the tool paired the second call's text with the first call's address; bytes at 7000:07BC..08A6 and 5C00:281A..2831 matched the pseudocode). Those lines were split to one call per line.
3. **Merge sample** (lane, seed 20261016, 12 random anchored statements of the merged file vs `hdis.py`): L984 7000:21B8 `field < 6` (cmp [bp-0Dh],6 / jb) OK; L4169 5C00:281A HasEffect(c,$62,p) pushes [bp+0Eh]:[bp+0Ch], 62h, ss:[bp-4] OK; L3229 5C00:02A3 `c^.con < 15` (es:[di+14h], 0Fh, jae) OK (SAVES +14h con); L2946 8900:2239 RecalcCharacter(SelectedChar) OK; L3740 5C00:15B5 AddEffect(HookOpponent,…) call OK; L3837 5C00:19CE ShowCharacterMessage call OK; L2370 8400:0E2E DrawText call OK; L3162 5C00:00E9 MessageDelay OK; L1801 7500:1244 FreeMem(p,size) pushes [bp-4]:[bp-6], [bp-2] OK; L2576 8900:07D7 money[k] (+88h + 2k) inc OK; L1163 7000:300D wounds := +32h − +11Bh (hp_max − hp per SAVES) OK; L748 7000:0D9C NewMenuList call OK. **12/12 OK.** Note: for call statements several parts anchor the CALL instruction rather than the first PUSH (allowed by the VIEW convention "or of the call that implements it").
