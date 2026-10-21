# ov06 notes (lane por-mod-party)

## (a) Routines

| routine | name | conf | evidence |
|---|---|---|---|
| 3E00:0030 | ShopItemsMenu | H | frame title "Shop" (CS:001F), list prompt "Items: " (CS:0024), option "Buy" (CS:002C), price column built from item +3Ah, VerticalListMenu over TreasureItems |
| 3E00:0239 | AddItemToChar | H | ItemOverloads → "OverLoaded" (CS:022E); else GetMem(3Fh) copy appended to SelectedChar +C8h list, RecalcCharacter; also used by ov05 TakeLootItems |
| 3E00:0361 | ShopBuy | H | compares item +3Ah with MoneyInGold / pool value, "Not enough Money." (CS:034F), money re-minted via SetCharMoneyGold/0185 |
| 3E00:053E | Shop | H | menus "Buy View Take Pool Share Appraise Exit" / "Buy View Pool Appraise Exit" (CS:0474/049B), leave text CS:04C0/0513; caller ecl_op24_Combat with VM 6E6C = 1 |
| 3E00:0798 | ov06_init | H | empty |

Counts: 5/5 routines; H 5.

## (b) Globals
No new global names. Used: `TreasureItems` DS:6810 (far ptr, ware list), `TreasureMoney` DS:67F4 (7 LongInt coins, 1Ch bytes), `SelectedChar` DS:5D92, `game_Mode` DS:49F3 (:= 1, the shop/temple layout). `g_6DC0` (byte, cleared here and in Temple, written by ov21 Pool/Share/Take) — role left to the ov21 part (L).

## (c) Unknowns / cross-part questions
- ov21 routine names (ov21 part of this lane): 0F7E pool status (var hasMoney [BP+0Ah], var hasItems [BP+6]), 00A8 money value in gold (LongInt), 0130 / 0185 set character / pool coins from a gold amount (platinum = v div 5, gold = v mod 5), 0CEB Take, 0508 Pool, 063A Share, 19B2 Appraise(var redraw).
- Visible effect of item names longer than 30 characters in the price line (L).
- `MenuSelect` returns index 1 for `N` of '~Yes ~No' (M: from ECL.pas.md MenuHotkeys/MenuSelect 0-based index rule).

## (d) Self-check
Sample: 12 of ~75 statements (16 %), re-read against ov06.lst: 3e00:0068, 008f, 00d0, 012e, 0167, 01c4, 024d, 02b4, 03cd, 040f..0419, 0651, 0714, 075d.
- Push orders: 0167 pushes 1, 1, 26h, 16h, 0, 0Fh, s → DrawTitledFrame(1,1,38,22,0,15,'Shop') ✓; 01c4 pushes 'Items: ', 'Buy', 0Dh, 0Ah, 0Fh, 1, 4, 26h, 16h, list, 1, @redraw, index ptr, cur ptr → VerticalListMenu(prompt, opts, sel, c2, c3, left, top, right, bottom, list, showExit, redraw, index, item) ✓ (corrected: the list argument is the local copy [BP-4], the var item is the caller's `cur`); 024d pushes SelectedChar, item → ItemOverloads(c, item) ✓; 0210/05a7 push nil, item, 0, 0, 0, 0 → BuildItemName(nil, item, 0, 0, false, false) ✓; 06d0 pushes 1, 11h, 26h, 16h, 0Ah, 1, s → DrawWrappedText(1,17,38,22,10,true,s) ✓; 0714 pushes prompt, '~Yes ~No', 0Dh, 0Ah, 0Fh, 0, 0 → MenuSelect(..., acceptEnter=false, animate=0) ✓.
- Conditions: 03d0 `JA` → pool path when price > own gold ✓; 0412..0419 signed long compare 0:price vs pool → buy when price ≤ pool ✓; 0655 'P' only when ext = 0 ✓; 071c `= 1` → leave ✓; 0762..0779 redraw rule ✓.
- argcheck.py: run by the parent on the merged PARTY.pas.md.
