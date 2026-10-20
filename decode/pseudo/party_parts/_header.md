# PARTY — title/credits, code wheel, startup, top-level menu, character creation/modify/train, save/load, rest, shop, money/items, special-attack effects (FINAL pseudocode, lane por-mod-party)

Units (herdr/assignments/por-areas.md): ov00, ov01, ov02, ov11, ov16, ov17, ov20, ov21, ov06, ov12.
Sources: `decode/listings/<unit>.lst` (evidence) and the image bytes (`python decode/ecl/hdis.py ovNN START END`); `.c` and the codex draft `PARTY.draft.md` were used only as a checklist. Screens: `PARTY_SCREENS.md`. Names: `decode/names/party_names.json`. Per-part working files (notes with routine tables, globals, unknowns and self-checks): `decode/pseudo/party_parts/`.

Conventions (as VIEW.pas.md / ENGINE.pas.md)
- **Signatures in Pascal order**: first parameter = highest BP offset = pushed first; parameters as `name [BP+xx]`. Every call was written from its PUSH sequence (first pushed = first argument).
- `{ seg:off }` = first instruction of the statement; `{ quirk: ... }` = behaviour a faithful port must copy.
- Globals `g_XXXX` = DS:XXXX (GLOBALS.md) or the name from decode/names/*.json; names introduced by this lane are written `Name{g_XXXX}` and requested from por-tooling (STATUS.md globals request).
- Resident callees by ENGINE names (`decode/names/engine_names.json`), `Name{SSSS:OOOO}`; other lanes' overlay routines by their lane names; Turbo Pascal runtime by RT_LEDGER names.
- Production: eight fork workers of this lane wrote one range each from the asm (ov12 0000..1A18 / 1A19..end, ov16 0000..1F36 / 1F37..end, ov17, ov21, ov20+ov06, ov00+ov01+ov02+ov11) with their own byte re-checks; merged here (unit order of the area table, ov12 last).
