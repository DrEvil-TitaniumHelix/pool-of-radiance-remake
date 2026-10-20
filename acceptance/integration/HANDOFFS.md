# Main-loop hand-offs → exporting JS function (por-build-qa, step 1)

Source: decode/CROSSREF.md §4c (main game loop path). Checked with a grep of `export` in game/areas/*.js and game/engine/*.js
(2026-10-16). "VM" = method of the EclVM class in game/engine/ecl.js (called through ecl_host.js host methods).

| hand-off (original) | address | JS (file: export) | status |
|---|---|---|---|
| MainProgram | 0000:0006 | engine/main.js: `MainProgram` | present |
| InitGameState | 5700:002D | areas/startup.js: `InitGameState` | present |
| ShowTitle / CodeWheelCheck | 2500:0627 / 2A00:00FD | areas/startup.js | present |
| PartyCreationMenu "Choose a function" | 7000:0161 | areas/party_ov16a.js: `PartyCreationMenu` (main.js still uses the M1 menu until party.js exports it) | present (WIP, build-party paused) |
| LoadGame / SaveGame | 7500:1602 / 7500:1D58 | areas/party_ov17.js | present |
| SetBackdropColours | B100:0155 | areas/view.js | present |
| ecl_GameLoop | 2F00:32F8 | areas/ecl_host.js: `EclGameLoop` → VM `gameLoop` | present |
| LoadEclBlock / ecl_InitVM / ecl_Run | 4300:0341 / 01B6, 2F00:3171 | VM methods | present |
| ExploreCommand / MoveParty | 6600:0989 / 0D6D | areas/view_ov14.js | present (uncommitted WIP of build-ecl at time of writing) |
| Draw3DView / DrawAreaMap / RefreshView | ov29 / ov26 | areas/view.js | present |
| Cast (explore 'C') → CastMenu | 6B00:04A1 | areas/magic_ov15.js | present |
| View → ViewMenu | 7F00:0AB3 | areas/combat_ov19.js | present |
| Encamp → ecl_CampCheck → Camp | 2F00:2DD3 → 6B00:1E6F | VM `campCheck` → magic.js `magicHost.camp` / ecl_host `X.Camp` | present |
| Rest → RestLoop | 6B00:077A → 8400:0C9A | magic_ov15.js / party_ov20.js | present |
| COMBAT opcode → CombatMain | 4800:007A | areas/magic_ov08.js | present |
| CombatMain → StartCombat (battlefield) | 5200:1E31 | — | **MISSING** → view request #qa-2 |
| AI turn / player actions / effects | ov09 / ov13 / ov24 | areas/combat_ov09/13/24.js | present |
| AfterCombat | 3900:1527 | areas/combat_ov05.js | present |
| Shop / Temple | ov06 / 3400:0D09 | areas/party_ov06.js / magic_ov04.js | present |
| Training hall | 7000:29AE TrainCharacter | — | **MISSING** → party request #qa-3 |
| RedrawCurrentMode / DrawPartyRoster / DrawLocationTimeStatus | 00BA:27D9 / 0767 / 290B | areas/res_00ba_v.js / res_00ba_u.js | present |
| DragonFinale | 7A00:02A4 | areas/combat_ov18.js | present |
| TerminateGame (Camp 'S' → Quit, DropCharacter, …) | 0899:0000 | engine/main.js has a local `terminate()`, not exported | **MISSING export** → engine request #qa-1 |
| MenuSelect / HorizontalMenu / VerticalListMenu | 4300:1684 / 9D00:03BD / 0D9A | engine/ecl.js / engine/menus.js | present |
