# ov01 notes (lane por-mod-party)

## (a) Routines

| routine | name | conf | evidence |
|---|---|---|---|
| 2500:0000 | WaitSecondsOrKey | H | target = TimeInHundredths + 100*[BP+6]; loop until time reached or KeyPressed |
| 2500:0206 | ShowCredits | H | two DrawTitledFrame + 33 DrawText of the credit strings, WaitSecondsOrKey(10) |
| 2500:0627 | ShowTitle | H | LoadPicture('title', 1/2), PutPicture(0,0), palette lightning, calls ShowCredits; called by MainProgram unless STING |
| 2500:0809 | ov01_init | H | empty unit init |

Counts: 4/4 routines; H 4.

## (b) Globals named

| DS | name | conf | evidence |
|---|---|---|---|
| 49D1 | cfg_FullIntro | M | written only by InitConfiguration 042b:036f `:= Ord(line5 = 'F')`; read only at 2500:0690: 0 → title 1 only, no title 2/lightning/credits. POOL.BAT writes 'F' (FOREMAN.md), so the full intro is the default. Meaning of the letter 'F' itself: unknown |

Used: DataPath (547C), VideoMode (4A1E).

## (c) Unknowns
- Original meaning of POOL.CFG flag 'F' (e.g. "full"/"fancy") — only its effect here is known.
- Whether palette register 1 is meant to be restored to the picture's own colour (assumed blue 01h).

## (d) Self-check
Statements: ~60 (credits 35, title 22, wait 4). Re-checked 12 (20 %) against the asm:
- DrawTitledFrame(1,1,38,3,0,0,'') — pushes 1,1,26h,3,0,0 then '' (2500:020c..0228) — OK.
- DrawTitledFrame(1,5,38,23,…) — pushes 1,5,26h,17h,0,0 — OK.
- DrawText(5,1,0Ah,'scenario created by:') — pushes 5,1,0Ah (2500:0258..025e) — OK (col first = ENGINE DrawText col [BP+0Eh]).
- DrawText(1Ah,1,0Eh,'tsr, inc.') — pushes 1Ah,1,0Eh — OK.
- DrawText(0Bh,16h,0Bh,'joel billings,…') — pushes 0Bh,16h,0Bh (2500:05db) — OK.
- WaitSecondsOrKey(10) — MOV AX,0Ah; PUSH; PUSH CS; CALL near — OK.
- saved := DataPath — pushes DataPath, [BP-32h], 28h; the restore pushes [BP-32h], DataPath, FFh (FFh = DataPath's size → dest is the 2nd pointer) — OK.
- LoadPicture('title',1,0,0,pic) — string temp, 1, 0, 0, @[BP-4] (2500:0655..0671) — OK.
- PutPicture(0,0,pic) — pushes 0, 0, pic hi, pic lo — OK.
- acc > 50000 — CMP hi word 0 (JG/JGE), CMP lo C350h JA — signed LongInt — OK.
- n := Random(3)+1; for i := 0 to n — MOV AL,0; CMP AL,[BP-37h]; JBE; loop INC until i = n — OK.
- SetEgaPaletteRegister(1, 9) — pushes 1 then 9 (index [BP+8] first) — OK.
