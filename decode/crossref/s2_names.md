## 2. Routine name consistency

Rule (same as the PorExport merge): a real name beats a placeholder, and among real names the later file wins. Below: every conflict, how it was resolved, and the evidence. The json and pseudo files of DONE areas (ENGINE, ECL, VIEW, COMBAT) were edited by por-crossref. MAGIC and PARTY (still being written) get fix requests. Tools: `decode/tools/crossref.py` (analysis), `crossref_s2.py --apply` (placeholder replacement).

### 2a. One name, several routines (resolved)

| name | addresses | resolution | evidence |
|---|---|---|---|
| VerticalListMenu | 4300:1788 (ECL), 9D00:0D9A (VIEW) | 4300:1788 -> **EclVerticalListMenu**; 9D00:0D9A keeps VerticalListMenu | 4300:1788 assigns two strings and calls ov25 e4 = 9D00:0D9A (`CALLF` at 4300:1806): a wrapper (H) |
| DrawPicture | 0464:0D71 (ENGINE), AC00:0000 (VIEW) | AC00:0000 -> **DrawPictureScreenOrView**; ENGINE keeps DrawPicture | AC00:0000 picks screen (PutPicture) vs view picture by `toView`; 0464:0D71 copies a frame picture-into-picture (VIEW.pas.md / ENGINE.pas.md bodies) |
| TimeInHundredths | 0709:0C3F, 08AE:0000 (both ENGINE) | 08AE:0000 -> **TimeInHundredths_08AE** | identical bodies (GetTime -> h*360000+m*6000+s*100+s100) in two units; 08AE copy only called by WaitHundredths |
| CureDisease | 3400:02ED (temple service), 8E00:228A (spell) | 8E00:228A -> **Spell_CureDisease** (MAGIC prefix for spell routines) — magic fix request #xref-1 **APPLIED** by por-crossref (MAGIC DONE) | MAGIC.pas.md bodies: 3400:02ED price 1000 temple cure, 8E00:228A CureEffect on SpellTargets |
| GameSpeed | DS:49E2 (global), 6B00:1A97 (routine) | routine 6B00:1A97 -> **GameSpeedMenu** (the 'Game Speed = n (0=fastest 9=slowest)' Faster/Slower menu); DS:49E2 keeps GameSpeed — #xref-2 **APPLIED** | one name for a variable and a routine |

### 2b. Same address, different real names (resolved)

| addr | names | resolution | evidence |
|---|---|---|---|
| DS:6B84 | SpellHandlers (magic_names), SpellTargetProc (combat_names) | **SpellHandlers**; COMBAT text now says `SpellHandlers[0]`; removed from combat_names.json | `CALLF [DI+6B84h]` with DI = spell*4 at 8E00:0EBD (table of far procs); slot 0 written with 0096:0034 = ov22 e4 = 8E00:0A91 outside combat (8E00:341C) and 0068:0066 = ov13 e14 = CollectSpellTargets 6100:20C3 in combat (4800:008B), restored at EndCombat 4800:006F |
| 00BA:309E, 0464:2A4A, 08AE:157A | headers UnitInit / Unit / ChannelStep vs json UnitInit_00BA / Init0464 / SoundChannelStep | ENGINE.pas.md headers changed to the json names | json is what the listings show |

### 2c. Header names in MAGIC that differed from magic_names.json (#xref-2, **APPLIED**: headers now Spell_*)

| addr | header | json |
|---|---|---|
| 8E00:1B11 | StinkingCloud | Spell_StinkingCloud |
| 8E00:1F41 | Strength | Spell_Strength |
| 8E00:206F | AnimateDead | Spell_AnimateDead |
| 8E00:2385 | DispelMagic | Spell_DispelMagic |
| 8E00:266B | Fireball | Spell_Fireball |
| 8E00:2C43 | Restoration | Spell_Restoration |

COMBAT 6100:3A86 EffHold (L) is intentionally not in combat_names.json (conf L). PARTY: 202 header names are not yet in a names json (party_names.json is pending): expected; refreshed when PARTY lands.

### 2d. Placeholders where a real name exists (applied / requested)

Done areas: every `FUN_SSSS_OOOO` / `ovNN_XXXX` with a published real name was replaced by that name (`crossref_s2.py --apply`): ENGINE 183, ECL 160, VIEW 66, COMBAT 312 (+ combat_parts 532). Second pass after `party_names.json` landed: +589 (ENGINE 64, ECL 23, COMBAT 243, combat_parts 259). Remaining in MAGIC (69) and PARTY (303, PARTY.pas.md included): lists in `decode/crossref/stale_MAGIC.md`, `stale_PARTY.md` = #xref-3, **APPLIED** by por-crossref after both lanes reported DONE (MAGIC 69, PARTY 249 + parts); 0 placeholders with a published name remain in any pseudo file.

### 2e. Local aliases (applied)

VIEW.pas.md wrote some ENGINE/VIEW callees under its own names; they are replaced by the published names: BlitPicture->PutPicture, ClearEncounterPicture->FreeAnimation, DecodeFrame->ConvertPicturePixels, LoadCombatTileSet->Load24x24Set, Menu->HorizontalMenu, NewPicture->AllocPicture, RestoreTextColours->RestorePreviousVideoMode, ViewCharacter->ViewMenu, WaitKey->ReadGameKey (detected as: the statement calls X while its anchor comment names the published callee Y). COMBAT parts went through the same normalisation earlier (por-mod-combat). ENGINE `Halt` for TerminateGame (0899:0000) is kept: it is the Pascal-level meaning (the routine ends the program).

Result: json conflicts between real names after resolution: 0 (DS:6B84 resolved in favour of the existing magic name).
