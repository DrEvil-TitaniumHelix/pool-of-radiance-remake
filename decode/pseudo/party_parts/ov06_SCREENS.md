# ov06 screens — shop (lane por-mod-party)

Frame and party panel: `game_Mode := 1` + RedrawCurrentMode (ENGINE 00BA:27D9, mode 1 layout) and DrawPartyRoster (party list with AC/HP, SelectedChar highlighted). Text window rows 17..22, cols 1..38. Bottom menu row 24 (ov25 HorizontalMenu; colours 0Dh prompt, 0Ah hot letters, 0Fh text).

## PARTY-ov06-01 Shop main menu
- Trigger: ECL `COMBAT` (op 24h) with no monsters and the shop flag (VM 6E6C = 1); entering empties the money pool.
- Row 24: `Buy View Take Pool Share Appraise Exit` when money is in the pool, else `Buy View Pool Appraise Exit` (empty prompt).
- Keys: `B` → PARTY-ov06-02; `V` → character View menu (ov19 ViewMenu, COMBAT lane screens); `T` Take money from the pool (ov21 coin menu "Select type of coin / How much … will you take?"); `P` Pool the party's money (ov21); `S` Share the pool among the party (ov21); `A` Appraise gems and jewelry (ov21, "No Gems or Jewelry", …); `E` → PARTY-ov06-04 or leave; Home/End (scan 47h/4Fh) = previous/next party member as buyer; Esc returns #0 (no action, menu again). Extended keys whose scan code equals an option letter act as that option (except P).
- After B or T (or A when something was appraised) the frame is redrawn; the roster is redrawn after every key.

## PARTY-ov06-02 Shop item list
- Frame (1,1)-(38,22) style 0 with the centred title `Shop` (colour 15) (DrawTitledFrame).
- Scrolling list window cols 1..38, rows 4..22 (ov25 VerticalListMenu): one line per ware, `name` left and the price in gp right-aligned so that it ends in column 30 of the line (wares with price 0 are shown and sold for 1).
- Row 24: prompt `Items: ` + `Buy` (+ ` Next` / ` Prev` when the list scrolls) + ` Exit`.
- Keys: cursor up/down (ov25), Home/End/PgUp/PgDn, `N`/`P` page, `B` or Enter = buy the highlighted ware → PARTY-ov06-03; `E`/Esc → back to PARTY-ov06-01.

## PARTY-ov06-03 Buy result (bottom message)
- Buyer = SelectedChar. Paid from the buyer's coins if their gold value suffices, else from the pool; else ShowTimedBottomMessage `Not enough Money.` (row 24, timed).
- Too many items / too heavy: `OverLoaded` (bottom message), nothing bought.
- On success the item is appended to the buyer's inventory, the payer's remaining coins become platinum + gold; back to PARTY-ov06-02 (list redrawn from the top position kept in `index`).

## PARTY-ov06-04 Leaving with money in the pool
- Text window (DrawWrappedText, cleared first, colour 10): `As you Leave the Shopkeeper says, "Excuse me but you have Left Some Money here."` then (colour 15) `Do you want to go back and get your Money?`
- Row 24 (MenuSelect): `Yes No` (from `~Yes ~No`), Enter not accepted. `N` → leave the shop (pool money is lost); `Y` → text window cleared, back to PARTY-ov06-01.
