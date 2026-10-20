# VIEW_SCREENS verification (lane por-verify2, step 4)

Input: `decode/pseudo/VIEW_SCREENS.md` as found in the working tree, SHA-256 `2400c3307ef5c8cac34069a1b4080331dd6438f5f25759f8a090007ff29597b3` (no uncommitted diff vs HEAD for this file at check time; VIEW.pas.md has uncommitted owner edits).
Method: every row re-read against the asm (`python decode/ecl/hdis.py ov14|ov10|ov25|ov28|ov33|ov34 START END`, listings `ov*.lst` `[ps]` literals): push sequences of HorizontalMenu / DrawText / DrawTitledFrame / ShowTimedBottomPrompt, branch conditions. Captures: `acceptance/ref/DECODE_CHECKS.md` (VIEW-01, -02, -05, -06, -09).
HorizontalMenu 9D00:03BD parameter roles (asm): promptColour [BP+12h], textColour [BP+10h], hotColour [BP+0Eh]; `haveOpts` (Enter accepted) = `(textColour <> 0) or (hotColour <> 0)` (9D00:03EF..0401).

| screen id | claim | verdict | code evidence | capture evidence |
|---|---|---|---|---|
| intro | menu roles prompt/text/hot; ExploreCommand 0Dh/0Ah/0Fh (green letters, white hot keys/selection); keys hot letter, `,`/`.`, Enter, Esc #0, Space #32, ext + keypad 1..9 | AGREE (note) | 6600:09BC..09C2 pushes 0Dh,0Ah,0Fh → prompt 0Dh, text 0Ah, hot 0Fh (#ref-2 text applied); 9D00:059F Esc→#0, 0628 Space, 05C4/05E8 `,`/`.`, 06A0..06BD keypad. Note: Enter returns #13 only when text or hot colour ≠ 0 (always true for the callers seen). VIEW.pas.md 9D00:03E5 writes `haveOpts := options <> ''` — wrong, see below | VIEW-01: white hot keys / green letters |
| VIEW-01 | 88×88 view at pixel (24,24) = cell (3,3); backdrop, walls, frames; menu `Area Cast View Encamp Search Look`; A C V E S L, ↑ step, ↓ turn around, ←/→ turn, other keys select member | AGREE | g_04B6 'Area Cast View Encamp Search Look' (6600:09B7); 09EC A, 0A3D C (only if SelectedChar^.status = 0), 0A4D V, 0A5E S, 0A79 L; 0AB2 Up, 0ADE Down +4, 0B14 Left +6, 0B59 Right +2; 0B89 CycleSelectedChar. #ref-1 origin (24,24) applied | VIEW-01 (ref-1/ref-2 applied in this text) |
| VIEW-02 | 'A' when w[1F6h]=0 toggles area map: 11×11 symbols 104h..113h + arrow 100h..103h; A returns | AGREE | 6600:09EC..0A0D; B100:0000 DrawAreaMap (Put8x8Symbol 104h + wall bits, arrow (dir shr 1)+100h) | VIEW-02 AGREE |
| VIEW-02a | `Not Here`, colour 0Eh | AGREE | 6600:0A14..0A26 ShowTimedBottomPrompt('Not Here', 0Eh) | — |
| VIEW-03 | `Locked. ` + Bash / Pick (thief) / Knock (Knock caster; state 3: magic-user) / Exit; only Exit → closed | AGREE (note) | 6600:0DB9 Bash only if door_CanBash; 0DD3/0DDA Pick if door_CanPick and PartyHasClass(6); 0E0D/0E14 Knock if door_CanKnock and caster of spell 1Fh; 0E77 `opts = ' Exit'` → ClosePassage; 0E9A..0EBA HorizontalMenu('Locked. ', opts, 0Dh,0Ah,0Fh, 0, 0); B/P/K compared 0EC5..0EDF | — |
| VIEW-04 | overland 5×5 squares, ICON 0..2 → slots 9..11; menu `Cast View Encamp Search Look`; arrows set facing and move | AGREE | 6600:0BBA..0C0A LoadCombatIcon('ICON',0..2,9..11) when g_49F9 < 2; 0C40 g_04DF; 0CC8 facings 0/2/4/6, done → MoveParty/StepOverland | — |
| VIEW-04a | `The river's stench drives you back.` colour 0Eh when w[344h]=0 | AGREE | 6600:0909 `cmp w[344h],0`, 0916..0923 ShowTimedBottomPrompt(…, 0Eh) | — |
| VIEW-05 | `A battle begins...` colour 0Ah row 18h | AGREE | 5200:1E69..1E81 DrawText(0, 18h, 0Ah, 'A battle begins...') = (0,24), after ClearMenuLine + MessageDelay (1E5F/1E64) | VIEW-05 AGREE (0,24) |
| VIEW-06 | 7×7 squares, icons, cursor | AGREE (capture) | combat lane; geometry not re-derived here | VIEW-06 AGREE |
| VIEW-07 | frame rows 1..0Bh, cols 1Ch..26h; HEAD at (1,1Ch); BODY 5 rows below | AGREE (note) | AC00:051A..053B DrawTitledFrame(1Ch,1,26h,0Bh,0,0,''); 05BE DrawPortrait(1Ch,1,1); AC00:007E DrawBody row+5. Note: "(1, 1Ch)" is (row, col), while the rest of the file uses (col,row) ("cell (3,3)" symmetric) — state the order | — |
| VIEW-08 | PIC/FINAL at (3,3) animated while a menu waits; 3D sprites distance 1..3 | AGREE | 9D00:04CC DrawPicture(3,3,…) in the HorizontalMenu wait loop; ShowEncounter 4300:056C size = dist+1 (1..3) | — |
| VIEW-09 | list in caller window, headers unselectable, selection colour; bottom menu options + ` Next`/` Prev` + ` Exit`; letters, Home/End, PgUp/PgDn or N/P, Enter, Esc/E | AGREE (note) | 9D00:0FC5..0FDD HorizontalMenu(prompt, opts, [24h],[22h],[20h], allowExt 1, 0); 0FF7 47h Home / 1005 4Fh End MoveSelection; 1013/1028 49h/51h PageList; 1040/104E 'P'/'N'; 105C..1064 #27/'E'/#0 → nil. Note: the cursor-up/down scan codes 48h/50h are not handled (only Home/End move; keypad 7/1 map to Home/End) | VIEW-09 AGREE |
| VIEW-10 | `Yes No`, default No, only Y/N | AGREE | 9D00:10EA menu_Sel := 2; 10F9 'Yes No'; 1125 set CS:10B1 = {'N','Y'} (bytes 10BA=40h, 10BC=02h) | — |
| VIEW-11 | fatal load errors written to Output, key wait, halt | AGREE | literals B100:0DC1, B100:10A6, CA00:0025 (+ set + '-' + id, CA00:00EB..010B), CA00:013A, C000:0000 'Start range error in Load24x24Set', AC00:06E9; CA00:00D8 RestorePreviousVideoMode, 0113 WriteStr/WriteLn, 011D ReadGameKey, 012A TerminateGame | — |
| VIEW-12 | debug line: message line colour 0Eh `a , b , c` then the message | **DISAGREE** | C500:0079..00CE: ClearTextRectangle(0,0,27h,0) then DrawText(**0,0**,0Eh, Str(a)+' , '+Str(b)+' , '+Str(c)) — the numbers go to the **top row 0**, not the message line; C500:00D3..00DB ShowBottomPromptAndReadKey(0Eh, msg) shows the message on row 24 **and waits for a key**; C500:00E6..00EC clears row 0 again | — |

## DISAGREE list (corrections for por-mod-view / VIEW_SCREENS.md)
1. **VIEW-12:** → "only if g_49F7 <> 0: row 0 cleared, `a , b , c` (decimal) at (0,0) colour 0Eh; the message on the bottom line colour 0Eh with a key wait; row 0 cleared afterwards".

Other findings (VIEW.pas.md, not screen rows; for por-mod-view):
- 9D00:03E5 HorizontalMenu: `haveOpts := options <> ''` is wrong — asm 9D00:03EF..0401 sets it to `(textColour [BP+10h] <> 0) or (hotColour [BP+0Eh] <> 0)`; Enter (#13) is accepted iff that flag is set (9D00:05B2).
- Notes for the build (AGREE rows): VIEW-07 coordinate order (row, col); VIEW-09 has no up/down-arrow handling; VIEW-01 'C' works only when the selected member's status = 0; VIEW-03 Bash only when door_CanBash.

## Counts
15 rows (intro + VIEW-01, 02, 02a, 03, 04, 04a, 05, 06, 07, 08, 09, 10, 11, 12): **AGREE 14**, **DISAGREE 1** (VIEW-12), UNSURE 0. Captures consulted: VIEW-01 (#ref-1 origin (24,24) and #ref-2 colour roles are reflected in the current text), VIEW-02, VIEW-05, VIEW-06, VIEW-09 — all consistent.
