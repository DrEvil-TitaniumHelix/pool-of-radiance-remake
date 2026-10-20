# RUN-2 — test party: fight, camp/memorize/rest, cast, temple, training, save + reload (por-build-qa, 2026-10-18)

Test party `?save=testparty&force=1&sting=1&seed=7&fast=4` (game/assets/saves/testparty, level-4 party, slot C), keys L C B,
then the Rolf tour (12 × Enter, ends at 0,4 W). One headless Chrome per scenario through `acceptance/integration/run.mjs`
(takes `acceptance/.runlock` itself). Screenshots: `acceptance/integration/out/RUN-2/<scenario>/NN-<step>.png`, report.json
per scenario. Routes on the Phlan map (GEO3 record 0) were computed with a BFS over walls/doors that avoids every other event
square (cell attribute ≠ 0).

**Result: all 5 scenarios run to the end without an exception (5/5 PASS)** after 2 MAGIC fixes (mine) and 1 engine fix
(por-fixer #r2-1). Open: #r2-2 (Corwin's AC after combat, to be confirmed against DOSBox).

| # | scenario | script | steps | result |
|---|---|---|---|---|
| 1 | fight to the end | RUN-2/1-fight.json | 11 | PASS — walk until encounter (x7), "You have surprised a party of kobolds", Combat, Quick ×21, "THE PARTY HAS WON. EACH CHARACTER RECEIVES 61 EXPERIENCE POINTS.", treasure View/Take/Pool/Share/Exit, Exit → "still treasure left … go back?" N → explore 14,4 W. XP after: single-class +67 (61 + 10 % prime requisite), ELARIEL (F/MU) +30 (61 / 2); MORGANA 22/24, ELARIEL 41/42 HP |
| 2 | Encamp → Memorize → Rest, Cast in camp and outside | RUN-2/2-camp.json | 35 | PASS — walk to the inn (4,12, attr 89h) "It will cost you 1 platinum piece to rest here" Y, Who will pay → camp; select ALYS (End End); Magic → Cast → CLW → Cast Spell on whom → Select (CLW 3 → 2 in memory); Memorize: "ALYS can memorize: Cleric spells 1 0" → CLW → `*Cure Light Wounds` pending → "Memorize these spells?" Y; Display (no spell effects); Rest: "Rest time 00:04:15" → clock 00:12 → 04:27, memory = 3 × CLW again (probe: slot 83h → 03h); exit camp; explore **Cast** → CLW → on whom → cast |
| 3 | temple (heal/cure) | RUN-2/3-temple.json | 13 | PASS — Temple of Tyr (8,4, attr 86h): "The priests of Tyr welcome you to the temple. Do you seek healing?" Y → `Heal View Pool Appraise Exit` → Heal → "ELARIEL, how can we help you?" list → Cure Light Wounds → "Cure Light Wounds will only cost 100 gold pieces." Pay for cure Y (ELARIEL platinum 60 → 40) → Exit → Exit → explore 8,4 E |
| 4 | training hall (level up) | RUN-2/4-training.json | 19 | PASS — (9,0) loads ECL block 11: "We train only thieves here" N; sign "Rogues"; sign "Fighters"; Fighters' hall (8,0): "We train only fighters here. Do you want to train?" Y → party menu (Train enabled, hall mask 78h); T with XP 8001 → refused (timed prompt); **test setup by probe:** CORWIN XP := 18001 (XpForLevel fighter L5, DS:409B) and platinum := 250; T → "CORWIN will become: a level 5 Fighter" → "Do you wish to train?" Y → level 5, THAC0 14 → 13, HP 52 → 60, platinum 250 → 50 (1000 gp); View sheet; B → explore 8,0 N |
| 5 | save + reload | RUN-2/5-save.json | 15 | PASS — walk to 2,4 E, Encamp → Save → "Save which game: A … J" D → "Quit to DOS" N → Exit; page reload → party menu → Load → "Load which game: A C D" → D → Phlan 2,4 E 00:02 (= saved), View CORWIN sheet intact |

## Defects found and fixed

| tag | where | symptom (stack) | fix |
|---|---|---|---|
| MAGIC (mine) | magic_ov22.js AddSpellLine/ChooseSpell | camp Magic → Cast: `TypeError: Cannot read properties of undefined (reading 'length') at DrawText (engine/text.js:53) at drawList (menus.js:164) at VerticalListMenu (menus.js:209) at ChooseSpell (magic_ov22.js:66)` — spell-list nodes were `{ b }` only | eb946cb: nodes expose `text` / `isHeader` getters over the same bytes |
| engine #r2-1 (por-fixer) | engine/menus.js VerticalListMenu | same class for item lists (combat_ov19:253), TradeCoins/DropCoins (combat_ov19:579/612), TakeMoney (party_ov21:305) | APPLIED e4c5e77 (nodeText/nodeHeader read node+0 / node+29h) |
| MAGIC (mine) | magic_ov15.js DisplayEffects/AddLine | Magic → Display: `Cannot read properties of undefined (reading '41') at nodeHeader (menus.js:132)` — nodes used a field `header` | 1bec641: field is `isHeader` (TMenuItem +29h) |

## Behaviour checked against the original code (not defects)

- Spell lists open with the highlight on the **last** spell: VerticalListMenu 9D00:0EC7 `Inc(index)` + MoveSelection(up) from index 0 lands on the first header, SkipHeaders(up) wraps to the end (9D00:0CC5, 0B03; ChooseSpell 8E00:0148 sets page 0). The JS follows the bytes.
- Resting in the street (0,4): after 5 minutes "You are rousted by the city watch and told to move along. Go Stay" (ECL3_00 rest vector); leaving camp then drops the pending spell (Camp exit → CancelAllStudy 6B00:1FB3). Resting at the inn works (scenario 2).
- Training refusals ("Training costs 1000 gp.", "Not Enough Experience") are timed bottom prompts; PartyCreationMenu sets StingMode := 0 (7000:0175), so they are shown but gone before the screenshot.

## Open

- **combat fix request #r2-2 (por-fixer):** after the fight CORWIN's AC shows **0** in the roster (before the fight −1: 01..06 screenshots; 08..11 show 0; no spell effects on him). Others unchanged. Check the end-of-combat restore of the combatant's AC/readied items (ov08 combat end, RecalcCharacter 00BA:0BB8) against DOSBox (same seed: kobold fight after the tour).
- Ref shots: none of these screens has a DOSBox reference yet (temple, training, inn, rest, memorize); por-dosbox-ref can reuse the routes above.
