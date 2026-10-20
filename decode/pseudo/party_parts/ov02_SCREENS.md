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
