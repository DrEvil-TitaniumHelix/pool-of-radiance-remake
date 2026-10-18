# ov21 notes (lane por-mod-party)

## (a) Routines

| routine | stub | name | conf | evidence |
|---|---|---|---|---|
| 8900:0000 | — | MaxCarryWeight | H | `StrWeightAllowance(c) + 5DCh` (8900:000c..0011) |
| 8900:0020 | — | SubEncumbrance | H | `c^[+102h] -= amount` (SAVES.md +102h encumbrance) |
| 8900:003A | — | AddEncumbrance | H | `c^[+102h] += amount` |
| 8900:0054 | e1 | WouldOverload | H | compares encumbrance + amount with MaxCarryWeight, returns room; used before every money/item gain |
| 8900:00A8 | e12 | MoneyValueInGold | H | Σ money[0..4]·CoinValue[k] (+100) div CoinValue[3]=200; CoinValue = 1,10,100,200,1000 (image) |
| 8900:0130 | e10 | SetCharMoneyGold | M | writes money[4] := g div 5, money[3] := g mod 5 after zeroing copper..platinum (payment) |
| 8900:0185 | e11 | SetPoolMoneyGold | M | same on TreasureMoney[0..4] |
| 8900:0203 | — | AddPlatinumOrPool | M | adds to money[4] (+90h) with overload → "Overloaded.  Money will be put in Pool." and rest to TreasureMoney[4] |
| 8900:0294 | e6 | InputNumber | H | digit loop with ReadGameKey/Val on row 24, Esc → 0, Enter → value |
| 8900:044C | e7 | TransferCoins | H | money[coin] from one char to another, "Overloaded"; only caller ov19 TradeCoins |
| 8900:0508 | e2 | PoolMoney | H | all money of non-NPC members → TreasureMoney, cleared; menus "Pool" (ov04/ov05/ov06) |
| 8900:05E0 | — | CountMoneySharers | M | counts members with npc_morale 0 or B3h (same test as PoolMoney) |
| 8900:063A | e3 | ShareMoney | H | TreasureMoney div/mod n distributed; menus "Share" |
| 8900:0A01 | e8 | DropCoinsToPool | M | money −amount; to TreasureMoney only if game_Mode ∈ {1,6}; caller ov19 DropCoins (name differs from the ov19 routine to keep names unique) |
| 8900:0A88 | — | TakeCoins | H | pool → character with "Overloaded" check |
| 8900:0B93 | e5 | CoinFromText | H | first letter of the list line → coin index, coin name strings cs:0B5A..0B8A |
| 8900:0CEB | e4 | TakeMoney | H | "Select type of coin", "How much ", "will you take? " (cs:0CBD/0CD1/0CDB) |
| 8900:0F7E | e9 | TreasurePoolStatus | H | var hasMoney (any TreasureMoney ≠ 0), var hasItems (TreasureItems ≠ nil) |
| 8900:0FD2 | — | RollMagicPlus | M | d20 → 1 (1..14), 2 (15..19), 3 (20); result stored in item.plus |
| 8900:1010 | e13 | MakeTreasureItem | H | only caller ecl_op27_Treasure; builds a 63-byte item of the given type (name words, plus, weight, value, powers) |
| 8900:19B2 | e14 | AppraiseGems | H | "You have a fine collection of:", "Appraise : ", "The Gem is Valued at ", "Sell Keep" |
| 8900:2256 | e0 | ov21_init | H | empty initialiser |

Counts: 22/22 routines; H 15, M 7, L 0.

## (b) Globals named / used

| DS | name | conf | evidence |
|---|---|---|---|
| 6DC0 | PoolHasMoney | M | set to 1 by PoolMoney, recomputed (1 iff any TreasureMoney ≠ 0) by ShareMoney 8900:09ad and TakeMoney 8900:0f33; also written by ov04 Temple and Shop. **No reader found in any listing** (GLOBALS.md readers column empty) — write-only flag. |
| 0970 | MagicItemTable | M | word table indexed by `rec + k` in MakeTreasureItem 8900:182f/187a/1899/18c2; records of 8 words (word1, word2, word3, weight, value, power1..3) starting at word index 8r+1 |
| 0FFA | CoinName | H | already named by the combat lane; string[10] × 7 = 'Copper','Silver','Electrum','Gold','Platinum','Gems','Jewelry' (image); TakeMoney 8900:0de6 |
| 0D24 | CoinValue | H | (existing name) LongInt[0..4] = 1, 10, 100, 200, 1000 (image); g_0D30 = CoinValue[3] |

MagicItemTable records (image DS:0970, word index → item; name = ItemWord[word3] ItemWord[word2] ItemWord[word1], DS:10A7 + w·21):

| rec | words (1,2,3) | name | weight | value | power[1..3] |
|---|---|---|---|---|---|
| 01h | BBh A7h 40h | Potion of Extra (Healing) | 1 | 800 | 3, 3, 0 |
| 09h | EFh A7h 40h | Potion of Giant Strength | 1 | 1100 | 1, 52h, 0 |
| 11h | B9h A7h 40h | Potion of Healing | 1 | 400 | 1, 55h, 0 |
| 19h | ADh A7h 40h | Potion of Speed | 1 | 450 | 1, 50h, 0 |
| 21h | F0h A7h 41h | Scroll of Restoring Level(s) | 1 | 2100 | 38h, 38h, 0 (not selected by any case) |
| 29h | EEh A7h 42h | Ring of Feather Falling | 1 | 5000 | 0, 1Bh, 80h |
| 31h | 9Dh A7h 45h | Wand of Lightning | 1 | 6000 | 14h, 33h, 0 (unreachable) |
| 39h | CEh A7h 45h | Wand of Magic Missiles | 1 | 11000 | 1Eh, 58h, 0 |
| 41h | E1h A7h 45h | Wand of Paralyzation | 1 | 5000 | 14h, 54h, 0 |
| 49h | E2h A7h 64h | Gauntlets of Ogre Power | 10 | 15000 | 0, 26h, 83h |
| 51h | 00h 6Fh B6h | Keoghtum's Ointment | 1 | 10000 | 5, 51h, 0 |
| 59h | E4h A7h 77h | Necklace of Missiles | 1 | 16000 | 14h, 57h, 0 |
| 61h | AAh A7h 58h | Cloak of Displacement | 25 | 17500 | 0, 59h, 85h |
| 69h | 9Dh A7h 15h | Javelin of Lightning | 20 | 3000 | 1, 53h, 0 (not selected; see quirk) |
| 71h | F2h A7h 45h | Wand of Fireballs | 1 | 5000 | 14h, 2Fh, 0 |
| 79h | CDh A7h 42h | Ring of Fire Resistance | 1 | 5000 | 0, 3Dh, 81h |
| 81h | E3h A7h 42h | Ring of Invisibility | 1 | 7500 | 0, 38h, 8Bh |
| 89h | BAh A7h 49h | Bag of Holding | 150 | 25000 | 0, 0, 0 |
| 91h | E5h A7h 58h | Cloak of Elvenkind | 25 | 6000 | 0, 48h, 86h |

Javelin quirk (H, bytes 8900:10d5 `c6 46 fc 90`): rec = 90h reads word index 90h..97h = 0000 00E5 00A7 0058 0019 1770 0000 0048 → word1 0, word2 E5h "Elvenkind", word3 A7h "of", weight 58h = 88, value 19h = 25, power 70h, 00h, 48h, plus = plus2 = 1 (type stays 21 Javelin). The intended record is evidently 69h "Javelin of Lightning" (L for intent).

Left as g_/unnamed: ItemWord table DS:10A7 (named in SAVES.md text only).

## (c) Unknowns / cross-lane notes
- ECL.pas.md 2F00:1CCD writes `MakeTreasureItem(item, typ)`; the pushes are type byte first, then `@item` (2f00:1ccd..1cd5) → Pascal order is `MakeTreasureItem(typ, item)` — argument order error in ECL.pas.md (ecl owner).
- combat_parts/ov19.pas.md lists `TransferCoins` as `(var from, var to, amount, coin)` — consistent; its note "Overloaded if `to` cannot carry" is right, but the encumbrance of `to` is never raised (quirk above).
- Meaning of `game_Mode` values 1 and 6 in DropCoinsToPool (coins dropped go to the pool only there; otherwise they vanish) — mode semantics owned by ENGINE/ECL (SAVES.md §2: M).
- Meaning of `npc_morale = B3h` (Animate Dead value, SAVES.md) being treated like a PC by PoolMoney/CountMoneySharers but not by ShareMoney pass 1.
- HorizontalMenu's return for Esc (#0 vs #27) — ov25 owner; AppraiseGems ends on 'E' or #0.
- The meaning of the power bytes of the magic items (spell id / charges / effect with bit 7) — SAVES.md §4 (M).
- `Trunc(Random(n))` sequence (RandomWord → @LongToReal → Trunc) in the jewel values: numerically `Random(n)`; the real conversion is a source artefact (M).

## (d) Self-check
Sample (≥10 % of the 330-odd statements: 41 statements re-read against the asm after writing):
- Push orders (all OK): 8900:0d14 DrawTitledFrame(1,1,26h,16h,0,0Ah,'') — pushes 01 01 26 16 00 0A + string; 8900:0e8b VerticalListMenu — prompt, '' (cs:0CBA = len 0), 0D 0A 0F 02 02 0F 08, list [bp-6:-8], 01, @[bp-118h], @[bp-14h], @[bp-0Ch]; 8900:0f0e InputNumber — push TreasureMoney[coin] low word, @prompt, 0Ah; 8900:0f26 TakeCoins — SelectedChar, amount, coin; 8900:0ebc CoinFromText — @item^ (text at +0), @local string; 8900:1b50 DrawCharacterName — SelectedChar, 1, 1, 0; 8900:1b6e DrawText — 1, 7, 0Fh, string; 8900:1c42 HorizontalMenu — 'Appraise : ', opts, 0D, 0A, 0F, 1, 0, @ext; 8900:1d4a WouldOverload — SelectedChar, 1, @room; 8900:02ba ClearGlyphRun — 0, 18h, 0, 28h; 8900:03eb ClearGlyphRun — col, 18h, 0, 1; 8900:03cb Copy — @num, 1, len−1; 8900:0fde Roll — 1, 14h; 8900:2241 RecalcCharacter — SelectedChar; 2F00:1cd0 (caller) MakeTreasureItem — typ, @item.
- Statements re-read (all OK): 0054 room on overload; 00a8 loop bound 4 and +100 rounding; 0130 div/mod 5 targets +90h/+8Eh; 0185 g_6804 = TreasureMoney[4], g_6800 = [3]; 0203 pool formula n + pool − room; 0384 col := len + Length(maxStr); 03de backspace clears `col` then Dec (quirk confirmed); 04db AddEncumbrance pushes [BP+0Eh] (src) — quirk confirmed; 052b morale test 0 / B3h; 072f `< 80h`; 07b9 second WouldOverload with rest[k]; 083a rest := share + rest − room; 08c0 room = MaxCarryWeight − encumbrance; 0a36 modes 6/1; 0abb clamp to pool; 0bd8 'G'+'E' → Gems; 0d85 prepend; 0e94 exit test; 0f46 PoolHasMoney recompute; 0fe9 d20 bands; 108d type set; 10d5 rec 90h; 11f9 bracer plus·2+2; 1285 plus2/count reset; 13cc list for weight 80 (contains 2Fh = 47, so the later 2Fh test at 147e is dead) (pas lists 47 under 80 and marks the 147e test dead); 14b5 shield ×2500; 1745 Roll(1,3)+1; 1858 rec 61h → plus 2; 186e weight = word[rec+3]; 19c0 gem/jewel test on +92h/+94h; 1c7b gem bands; 1e6a lost-gem quirk (hdis 8900:1E54..1E72); 1ec0 value div 5; 2234 'E'/#0 → done then Recalc.
- Result: 41/41 consistent with the asm; no argument-order mismatch inside ov21.
