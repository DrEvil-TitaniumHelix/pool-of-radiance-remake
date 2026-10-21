# ov05 screens — after combat (lane por-mod-combat)

Frame: DrawTitledFrame(1, 1, 38, 22, style 0, title colour 15, title) = the full-screen frame (text cols 1..38, rows 1..22). Text: DrawText(col, row, colour, s) / DrawWrappedText(col1, row1, col2, row2, colour, clear, s). Menu line: HorizontalMenu (horizontal menu on the bottom line, colours 0Dh/0Ah/0Fh = 0Dh prompt, 0Ah ordinary letters, 0Fh hot keys and the selected option (VIEW.pas.md 9D00:01DA), H). All texts exact (code-segment strings 3900:xxxx).

## COMBAT-ov05-01 Combat result
- Trigger: AfterCombat 3900:155C → ShowCombatResult 3900:0916 (unless the party was destroyed outside a duel).
- Frame with empty title. Row 3, col 1, colour 10, one of:
  - `You have lost the duel.` (duel, PartyWon = 0; number shown 0)
  - `You have won the duel.` (duel won)
  - `The party has won.` (enemies were fought)
  - `The party has fled.` (no enemy processed and somebody ran; number shown 0)
  - `The party has found Treasure!` (otherwise, e.g. treasure-only encounter)
- Row 5: `The duelist receives <n>` (duel) or `Each character receives <n>` ; row 7: `experience points.` (n = CombatXP, Str width 0).
- Bottom menu: `press <enter>/<return> to continue` (colours 15/15/15, Enter accepted; any hotkey key returns too). Next: COMBAT-ov05-02 is shown before this one if an NPC took a share; after it COMBAT-ov05-03.

## COMBAT-ov05-02 NPC takes a share
- Trigger: NpcTakesShare 3900:12E8 when an NPC (npc_morale ≥ 80h, status Okay, share byte +85h and 7 > 0) took coins from the pool (runs before COMBAT-ov05-01).
- Frame with empty title; for each such NPC a line at col 5, rows 5, 7, 9, … (wrap window to col 34 / row 22), colour 10: `<name> takes and hides his share.`
- Bottom menu: `press <enter>/<return> to continue`. Next: COMBAT-ov05-01.

## COMBAT-ov05-03 Treasure menu
- Trigger: TreasureMenu 3900:0ECD after COMBAT-ov05-01. Screen = current mode redrawn (RedrawCurrentMode), party roster.
- Bottom menu (title empty), one of:
  - `View Pool Exit` (no treasure) / `View Take Pool Exit` or `View Take Pool Detect Exit` (items only) / `View Take Pool Share Exit` or `View Take Pool Share Detect Exit` (money present). "Detect" when there are items and SelectedChar has spell 5 or 0Bh memorised.
- Keys: `V` character view (ViewMenu: "Items Spells Trade Drop Exit"); `T` → COMBAT-ov05-04; `P` pool the party's money (PoolMoney; ignored for an extended key); `S` share the pool (ShareMoney); `D` cast the Detect spell (CastSpell); `G`/`O` (47h/4Fh) → CycleSelectedChar (select another character), roster redrawn; `E` or Esc → if treasure is left COMBAT-ov05-05, else leave.
- Next: back to the ECL script; unclaimed items are freed.

## COMBAT-ov05-04 Take
- Trigger: `T` in COMBAT-ov05-03 → TakeTreasureMenu 3900:0D38.
- Only money: the coin dialog (TakeMoney: "Select type of coin", "How much", "will you take?"). Only items: COMBAT-ov05-06 directly.
- Both: bottom menu title `Take: ` items `Money Items Exit`; keys `M` coin dialog, `I` → COMBAT-ov05-06, `E`/Esc back, `G`/`O` select character. Returns to COMBAT-ov05-03 as soon as money or items are exhausted.

## COMBAT-ov05-05 Treasure left
- Trigger: `E`/Esc in COMBAT-ov05-03 while money or items remain.
- Bottom window rows 17..22, cols 1..38: `There is still treasure left.  ` (colour 10, window cleared) followed by `Do you want to go back and claim your treasure?` (colour 15).
- Menu `~Yes ~No` (MenuSelect, Enter not accepted): `No` → leave the treasure (lost: items freed); `Yes` → window cleared, back to COMBAT-ov05-03.

## COMBAT-ov05-06 Loot list
- Trigger: TakeLootItems 3900:0C06 (from COMBAT-ov05-04).
- Frame titled `Loot` (centred on row 1); item list window cols 1..38, rows 4..22 (VerticalListMenu, with its own ` Next`/` Prev`/` Exit` items, M), list title `Items: `, command `Take`.
- Keys: `T` or Enter = give the highlighted item to the selected character (refused "OverLoaded" by AddItemToChar), any other key = leave. Loops until left or the list is empty; then RedrawCurrentMode. Next: COMBAT-ov05-04 / -03.

## COMBAT-ov05-07 The END
- Trigger: AfterCombat 3900:15B9 when the party was destroyed (PartyDead, not a duel). ECL variable `ecl_Mem6B00^.w[$58E]` := 80h.
- Frame titled `The END!`; text cursor set to (2,6), then the wrapped text starts at (2,5) because the window is cleared first: `The monsters rejoice for the party has been destroyed` (wrap window cols 2..37, rows 5..22, colour 10).
- Bottom line (row 24, colour 13): `Press any key to continue`, waits for any key. Next: back to the ECL script / game loop (PartyDead set; ECL ends the game, ECL_VM.md).
