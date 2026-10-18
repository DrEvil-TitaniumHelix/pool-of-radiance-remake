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
