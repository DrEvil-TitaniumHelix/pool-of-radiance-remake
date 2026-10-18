# ov02 notes (lane por-mod-party)

## (a) Routines

| routine | name | conf | evidence |
|---|---|---|---|
| 2A00:00FD | CodeWheelCheck | H | wheel prompt texts, Random(13) table entry, compare with ReadBottomLine result, TerminateGame after try 3 |
| 2A00:0359 | ov02_init | H | empty unit init |

Counts: 2/2; H 2.

## (b) Globals named

| DS | name | conf | evidence |
|---|---|---|---|
| 0002 | CodeWheelTable | H | `[i*15h + 2]` string compared with the answer, `[i*15h+9/0Ah/0Bh/0Ch]` rune glyphs, `[i*15h+0Dh]` path string appended to row 13; i = Random(13); 13×21 bytes of initialised data decode to 13 six-letter words (table in ov02.pas.md). GLOBALS.md rows 0009/000A/000B/000C (indexed, ov02 only) are fields of this table, not separate variables. Note: GLOBALS.md lists other references to DS:0002..001E from Crt/System routines that switch DS (dsswitch) — those are not this table. |

## (c) Unknowns
- Whether glyphs 41h..B0h of font record C9h are exactly the rune shapes printed on the wheel (visual check against the PDF / a
  DOSBox screenshot pending; M).
- The wheel rotation semantics (which outer/inner pair aligns which window) — not needed for the check: the game only compares
  the typed word with the stored one.

## (d) Self-check
Statements: 20. Re-checked 8 (40 %):
- `idx := Random(13)` — MOV AX,0Dh; PUSH; CALLF RandomWord; MOV [BP-2Ah],AL — OK.
- DrawTitledFrame(1,1,38,22,0,0,'') — pushes 1,1,26h,16h,0,0,'' (2a00:0119..0135) — OK.
- DrawRepeatedGlyph(8,6,0Ch,1,outer[0]+40h,False) — pushes 8,6,0Ch,1,[idx*15h+9]+40h,0 — OK (ENGINE: col [BP+10h] first).
- inner[1] test — CMP [DI+0Ch],FFh; JZ skip — OK.
- path line — DrawText(1,0Dh,0Ch, '     ' + [idx*15h+0Dh]) via StrCopy cs:00A3 + StrAppend DS:(idx*15h+0Dh) — OK.
- ReadBottomLine('INPUT THE CODE WORD: ', 0Dh, 6) — result temp [BP-141h] pushed first, prompt, 0Dh, 6 — OK.
- compare — StrCompare(answer [BP-29h], DS:idx*15h+2); JNZ = mismatch — OK.
- ShowTimedBottomPrompt('Sorry…', 0Eh) — string first, then 0Eh — OK (ENGINE: s [BP+8], colour [BP+6]).
- try counter — CMP [BP-2Bh],3; JZ TerminateGame else JMP 010A (INC) — OK.
