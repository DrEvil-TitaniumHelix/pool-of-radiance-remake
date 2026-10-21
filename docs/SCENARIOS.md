# Scenario workshop and writer skeleton

W12 provides a fixed-address ECL assembler, DAX writer and in-memory GEO editor. These are authoring tools; they do not apply new maps or scripts to a running game. Game data comes from the player's own supported Pool of Radiance v1.3 copy. No original record bytes, listings, maps or journal text are distributed with these tools.

FRUA is the editor design reference. Dungeon Craft/uaf is a design reference only: no GPL code or assets were copied. The implementation uses this repository's decoded ECL/DAX/GEO specifications and independently written Python/JavaScript.

## Scenario draft schema

`game/plus/scenario/model.js` exports `scenarioSchema` (JSON Schema draft 2020-12), `createMapDraft`, `validateMap`, `editSide` and `exportScenario`. An exported draft has this shape (cells omitted here; an actual export contains all 256):

```json
{
  "version": 1,
  "profile": "por",
  "party": [],
  "dataset": 3,
  "block": 0,
  "x": 0,
  "y": 0,
  "facing": "N",
  "flags": {},
  "items": [],
  "maps": [{"source": null, "width": 16, "height": 16, "cells": []}]
}
```

`party`, `dataset`, `block`, `x`, `y`, `facing`, optional `clock`, `flags`, `items` and optional `cheat` follow W11's state-injection vocabulary. Party members have `name`, `race`, `class`/`classes`, `level`/`levels`, optional `stats`, `hp`, `items` and `spells`. W11 owns their construction and engine validation in `game/scenarios/schema.json` and `plus/cheats/scenario.js`. An empty party is an unfinished authoring draft, not a launchable test party. Flags map hexadecimal address strings to integer values (W11 also accepts hexadecimal value strings). Exports use facing "N"/"E"/"S"/"W" as W11 expects; the draft API also accepts engine facing 0..3 and normalizes it. The root `map` field preserves the GEO record id separately from ECL `block`. W12's schema describes the envelope; it does not claim to validate every W11 race/class/item rule.

`maps` currently holds exactly one GEO draft. `source` is null for a blank map or `{file:"GEO3.DAX",record:0}` for a copied map. The source is provenance, not a command to overwrite a file. Cells are row-major: `cells[y*16+x]`, with matching `x,y`, `wall:[N,E,S,W]` (0..15), `door:[N,E,S,W]` (0..3), and `attr` (0..255). Runtime `validateMap` additionally checks row-major coordinates, which the schema alone cannot enforce. All APIs clone maps before edits/exports; directed neighbours are deliberately independent.

## Browser workshop

The mount owner calls `registerScenarioTab(plus)` from `plus/tabs/scenario.js`. It opens a copy of the current imported GEO map when first selected. Overland maps are not GEO and produce an explanatory message. **Open current map** replaces the draft with a fresh snapshot; **New blank map** creates 256 empty cells. Switching Plus tabs retains the in-memory draft.

Choose a cell by clicking the preview or entering Cell X/Y, choose N/E/S/W, enter wall type and passage state, and click **Apply side**. Wall 0 is no wall; 1..15 select wall textures. Passage 0 is closed, 1 open, 2 locked, 3 wizard-locked. The editor preserves cell attributes and all other sides. It does not symmetrize adjacent cells: original maps can have one-way sides or distinct textures on opposite sides.

**Export scenario JSON** fills the read-only output field; **Download JSON** downloads the same draft. Download before reloading the page: there is no automatic draft persistence or JSON reopen UI yet. The editor never changes engine state, original BYOC files or the game canvas. Original-game mode hides the workshop. Exported copies of imported maps contain player-owned original-derived data: keep them local; do not commit or redistribute them as project samples.

## ECL assembly

From the repository root, use your own POOLRAD directory and an ignored output directory (PowerShell example):

```powershell
python -B decode/tools/dax.py extract "$env:POR_DATA/ECL3.DAX" --out acceptance/local/scenario/extract
python -B decode/tools/ecldis.py acceptance/local/scenario/extract/ECL3/0.bin > acceptance/local/scenario/record.ecl.txt
python -B tools/eclasm.py acceptance/local/scenario/record.ecl.txt acceptance/local/scenario/extract/ECL3/0.bin
python -B tools/daxwrite.py acceptance/local/scenario/extract/ECL3 acceptance/local/scenario/ECL3.DAX
python -B decode/tools/dax.py list acceptance/local/scenario/ECL3.DAX
```

Use a different assembled output path if you want to retain the extracted input for comparison. Preserve directory record order when using `write_dax(records)` programmatically; the CLI orders numeric `<id>.bin` files numerically. Do not write the result over the player's installed originals. PowerShell 7 redirection writes UTF-8; older shells should explicitly write the listing as UTF-8.

`tools/eclasm.py` accepts the exact existing `ecldis.py` listing format: record-header/extent comments, five header GOTO vectors, absolute four-digit hex addresses, `Lxxxx`/`Txxxx` label annotations, `db` byte rows, mnemonics, and typed operands. Operands are `#BB`, `#WWWW`, `[AAAA]`, `[AAAA]'`, `$[AAAA]`, six-bit quoted text, or `?tTT:BB` for unknown types. It shares the disassembler opcode/count definitions, including variable-count menus/jumps. It never evaluates source as Python.

The instruction's semantic operands take precedence over a stale byte preview when editing. A complete preview preserves otherwise invisible packed-text padding if it has the same decoded meaning. Packed text accepts ASCII space through underscore except @ (zero is discarded by the VM). The five vectors preserve their original address operand encoding. Raw data and unhandled opcode bytes remain exact.

Addresses are fixed; labels annotate addresses and are not relocatable symbols. Keep encoded instruction lengths unchanged, or explicitly lay out subsequent addresses, vectors and pointers yourself. The assembler rejects uncovered bytes, out-of-range writes, conflicting overlaps and incorrect operand counts. The current disassembler drops zero text codes and truncates long byte previews, so its format cannot represent every possible noncanonical packed-text bit pattern losslessly. All 29 shipped v1.3 records round-trip exactly; newly authored ambiguous packed data should use explicit `db` bytes rather than assuming an arbitrary binary can be recovered from a lossy listing. No disassembler changes were needed.

## DAX writing

`tools/daxwrite.py` exports `rle_encode(data)` and `write_dax([(record_id,raw_bytes),...])`. It emits the u16 directory byte count, packed `<BIHH` directory entries and contiguous compressed records, with offsets relative to the data area. It preserves supplied record order and rejects duplicate/non-byte IDs, empty records, raw records over 65535 bytes, and compressed records over the original engine's 36000-byte input buffer.

Compression emits literal packets of 1..127 bytes and repeated-byte packets of 3..127 bytes. It never emits controls 0x7F or 0x80, which hang the original engine. This deterministic compressor is compatible with `decode/tools/dax.py` and `game/engine/dax.js:DaxRleDecode`; it does not reproduce SSI's original packet choices.

## Verification

```powershell
python -B -W ignore::ResourceWarning -m unittest discover -s decode/tests -p test_scenario.py -v
node --test game/test/plus/scenario.test.mjs
node acceptance/integration/run.mjs game/test/plus/scenario-run.json
node game/test/plus/scenario-check.mjs
```

The Python test reads `POR_DATA`, defaulting to the sibling `re-targets/goldbox/por/POOLRAD` used by other tests. Without a local copy, that integration test explicitly skips; synthetic tests still run. All extracted records/listings/rebuilt archives exist only in OS temporary storage. The test invokes the real Python disassembler/parser and also the real JavaScript engine decoder for every rebuilt record. Node is required for the full engine cross-check.

Local v1.3 round-trip results: **29/29 decompressed records byte-identical, 8/8 archives valid, 0/8 compressed containers identical**. No original compressed packet layout is retained.

| Archive | Records | Original bytes | Rebuilt bytes |
|---|---:|---:|---:|
| ECL1 | 2 | 14564 | 14241 |
| ECL2 | 3 | 19968 | 19601 |
| ECL3 | 4 | 24955 | 24425 |
| ECL4 | 3 | 19950 | 19550 |
| ECL5 | 5 | 27914 | 27373 |
| ECL6 | 4 | 24894 | 24382 |
| ECL7 | 4 | 23574 | 23097 |
| ECL8 | 4 | 24167 | 23664 |

The locked headless route loads slot A, opens the actual imported current GEO, edits/exports a wall+door, verifies source immutability and tab-switch retention, checks original-mode bypass, and closes Plus with the game canvas unchanged.

## What remains for a full editor

A full FRUA-like workflow still needs project/save/reopen management, map-to-GEO binary serialization and installation through a data mod layer, multi-map connections and bounds/wrap rules, event placement and script authoring UI, relocatable assembly/linking, script budget/VM safety checks, asset licensing/import management, full party/item/NPC authoring, and an engine-owned application boundary. W11 owns launching state-injection scenarios; this tab does not claim that exporting map JSON changes a running campaign. No custom ECL/GEO loader or engine mutation is introduced here.
