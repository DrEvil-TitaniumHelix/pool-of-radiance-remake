# ov05 notes (lane por-mod-combat)

## (a) Routines

| routine | name | conf | evidence |
|---|---|---|---|
| 3900:0000 | ComputeCombatXP | H | var LongInt result = CombatXP, shown as "Each character receives n" (3900:0A6D) and added to `+ACh` by AwardXP; reads monster `+B8h`, `+BAh`, `+B1h` (SAVES.md §3a) |
| 3900:0355 | AwardXP | H | `c^.xp (+ACh) += share`, prime-requisite +10 % and multi-class /2, /3 (case on class +2Fh) |
| 3900:04C9 | ResolveCombatOutcome | M | sets PartyDead / PartyFled / PartyWon / NonSharing, calls ComputeCombatXP+AwardXP, repairs statuses, removes members left behind |
| 3900:0916 | ShowCombatResult | H | strings "You have lost/won the duel.", "The party has won/fled.", "… found Treasure!", "… receives", "experience points." |
| 3900:0B14 | ChooseLootItem | M | frame "Loot", list picker VerticalListMenu over TreasureItems ("Items: ", "Take") |
| 3900:0C06 | TakeLootItems | M | loop: `T`/Enter → AddItemToChar (give, "OverLoaded"), unlink + FreeMem(63) |
| 3900:0D38 | TakeTreasureMenu | M | "Take: " / "Money Items Exit", TakeMoney coin dialog |
| 3900:0ECD | TreasureMenu | M | "View Take Pool Share Detect Exit", "There is still treasure left.", "Do you want to go back and claim your treasure?" |
| 3900:11AC | RemoveMonstersAfterCombat | M | RemoveFromParty for side-1 / non-party combatants, FreeMem(combat record, 16h), ECL var 590h = defeated count |
| 3900:12E8 | NpcTakesShare | H | " takes and hides his share.", NPC bit +84h, shares +85h and 7 |
| 3900:1527 | AfterCombat | H | only entry; called by ECL COMBAT (ECL_VM.md op 24 "after-combat/treasure"); "The END!", "The monsters rejoice for the party has been destroyed" |
| 3900:1671 | ov05_init | H | empty |

Counts: 12/12 routines covered; H 6 (ComputeCombatXP, AwardXP, ShowCombatResult, NpcTakesShare, AfterCombat, ov05_init), M 6, L 0.

## (b) Globals named

| DS | name | conf | evidence |
|---|---|---|---|
| 84D4 | DuelActive | M | name from ECL_VM.md (op 2D CALL 8000h/8001h: SetupDuel sets it); here selects the duel texts/XP (3900:0006, 0527, 0545, 0950, 0A3B) |
| 84D5 | NonSharing | M | count of party entries inactive or Animated (3900:05EA), subtracted from the member count as XP divisor (3900:0322) |
| 84D6 (LongInt 84D6..84D9) | CombatXP | H | var target of ComputeCombatXP, value passed to AwardXP and ShowCombatResult |
| 84DA | PartyWon | M | := 1 when a party entry is Okay/Animated (3900:05CA) or the duelist stands (07AC); gates XP; "lost the duel" when 0 |
| 443A | EnemiesFought | M | := 1 for every non-running side-1 combatant processed (3900:0088), cleared by AfterCombat; selects "The party has won." |
| 443B | PartyFled | H | := 1 when a party member's status is Running (3900:050D), cleared when someone is still Okay; "The party has fled.", ECL var 58Eh := 81h |

Not renamed: `g_5D9A`/`g_5D9C` (item-list mark compared in ComputeCombatXP; written by Attack after LoseItem, cleared by StartCombat — L: items the party dropped/threw during combat are not worth XP), `TextOutputActive` (:= 1 at the end; read by 0709:06A7 text output — role unknown), `game_Mode` (game mode: 6 during AfterCombat), `text_Col/text_Row` (text cursor col/row).
ECL variables written (ecl_Mem6B00 word offsets, owner ECL lane): 58Eh combat result (0 normal, 81h fled, 80h destroyed), 590h defeated enemies, 5C6h "no loot" flag, 5CCh duel-XP flag (both cleared at the end), 67Ch party member count, 6E0h/6E2h/6E4h side to-hit modifiers (cleared).

## (c) Unknowns
- Meaning of combat record byte +13h (= 1 for non-party combatants, M) and who sets it (ov10/ov13).
- `ecl_Mem6B00^.w[$5CC]`: set by the script before a duel-like fight; with it ComputeCombatXP returns level_main × 100 (duel) and ResolveCombatOutcome keeps PartyDead = 0 for any side-0 PC — exact script use unknown (ECL lane).
- `ecl_Mem6B00^.w[$5C6] = 1` suppresses looting the enemies' items (who sets it: ECL).
- `g_5D9A` semantics (L).
- RemoveFromParty parameter meanings are read from its decompile only (M); ov21/ov22/ov19/ov25 callee roles from their strings (M).

## (d) Cross-area questions
- SAVES.md: TChar `+85h` (unk_85) = NPC treasure shares (low 3 bits) — read in NpcTakesShare (3900:1329, 1438); suggest naming it `npc_shares` (M).
- SAVES.md: combat record is 22 bytes (FreeMem 16h at 3900:126C); byte +13h = non-party flag.
- ECL: AfterCombat writes the result code `w[58Eh]` (0 / 80h destroyed / 81h fled) and `w[590h]` (enemies not active) — useful for ECL_VM.md §3 variable list.
- ENGINE: 0709:0768 resets the cursor to (col1,row1) when `clearFirst` (used by "The END!").
- Original quirks to keep (H): NpcTakesShare byte-truncated per-share quotient; ComputeCombatXP sign-extension of hp_rolled × xp_per_hp; party members left behind after fleeing are deleted; `c^.next` read after `RemoveFromParty` freed `c`.

## Self-check
Sample (≥ 10 % of ~235 statements; re-read against ov05.lst): 3900:0006, 0019, 006c, 0088, 00c4, 00fb, 0115, 0128→013a, 0190/01f7, 0233..02b3 (7 divisors/multipliers), 02f1, 0322, 03a6, 03d3, 0400, 042c, 0454, 047c, 0502, 056c, 0599, 05b4, 05d4, 065b..068e, 06ad, 0768, 078b, 0968, 09d7, 0a3b, 0b96, 0c3e, 0c55, 0d42, 0d94..0dd2, 0f3c, 0f9c, 1057, 10cc, 113e, 11d5, 1223, 125b, 1310, 1383, 13a8, 1440, 154a, 15b7, 15f4, 161a, 1631.
Results:
- 0019: `MOV AL,[+73h]; CBW; MUL 64h; CWD` → `SmallInt(level_main*100)` ✓.
- 00c4: `+B1h` and `+BAh` zero-extended, `MUL DX`, `CWD`; `+B8h` word zero-extended ✓.
- 0115: `CMP word [+3Ah],0; JA take`; else `taken < 8` (JC) and `Roll(1,10) <= 3` (JBE) ✓.
- 0233..02b3: div C8h, 14h, 2; +gold; ×5, ×FAh, ×898h ✓.
- 02f1: `CMP byte [+32h],0; JLE skip`; `CBW; MUL 190h; CWD` ✓.
- 0322: divisor `w[67Ch] − g_84D5`, high word 0 ✓.
- 03a6..042c: stat offsets 12h/10h/11h/13h for classes 0/2/5/6, threshold `JBE 0Fh` ✓; 0454/047c case sets ✓ (10..14 via JL/JLE pair, 16 via 0460).
- 05d4: `active = 0` → inc, else `status = 1` → inc ✓.
- 06ad: `w[58Eh] := 81h` inside the fled branch for every member ✓.
- 0968: `DuelActive and PartyWon = 0` → lost ✓.
- 0b96: VerticalListMenu args in push order (… 1, 4, 26h, 16h, list, 1, @flag, [BP+6], [BP+0Ah]) ✓.
- 0f3c: `+17h+i` compared with 5 and 0Bh ✓.
- 1223: AL = 1 iff combatant^[13h] = 1, pushed first; then 1 ✓.
- 1383: quotient stored with `MOV [BP-7],AL` (byte) ✓.
- 15b7: `JMP 1631` → both paths set TextOutputActive and clear the five ECL words ✓ (first reading had put them in the else branch only; corrected in the pseudocode before writing).
- 161a: `0Dh` pushed before the string → ShowBottomPromptAndReadKey(13, s) ✓.
Fixes made: ShowCombatResult note (CombatXP in treasure-only encounters = treasure XP, not 0); "The END!" text position (2,5) in the screens file.

## Normalisation pass
- Names replaced: VIEW `HorizontalMenu` (HorizontalMenu), `VerticalListMenu` (VerticalListMenu); ov19 `ViewMenu` (0AB3), `CycleSelectedChar` (27DF); ov13 `Attack` (1884); MAGIC `CombatMain` (CombatMain); ov10 `StartCombat`; ENGINE `BuildItemName`, `ClearTextRectangle`; globals `game_Mode`, `text_Col`/`text_Row`, `TextOutputActive` (4A00). Unpublished (kept): RemoveFromParty, TreasurePoolStatus/0CEB/0508/063A, AddItemToChar, CastSpell.
- Calls re-checked (push order vs published signature): DrawTitledFrame, DrawText, DrawWrappedText, ClearTextRectangle, ShowBottomPromptAndReadKey, BuildItemName, DrawPartyRoster, RedrawCurrentMode, HorizontalMenu (8 args), VerticalListMenu (14 args), MenuSelect, ViewMenu(var turnUsed) (gets the same var as HorizontalMenu's `ext`), CycleSelectedChar(key), Roll(count, sides), and the unpublished RemoveFromParty / TreasurePoolStatus / AddItemToChar / CastSpell against their bodies — all already in Pascal order; no arg-order fixes.
