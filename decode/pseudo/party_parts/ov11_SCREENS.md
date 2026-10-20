# ov11 screens (lane por-mod-party)

## PARTY-ov11-01 — start-up loading line
- Trigger: MainProgram → InitGameState (first thing after the unit inits; the video mode is selected earlier, by InitConfiguration from POOL.CFG line 1 — ENGINE).
- Text: row 24 cleared (ClearMenuLine), then `Loading...Please Wait` at col 0, row 24, colour 0Ah (light green). Nothing else
  on screen (whatever the video mode set left, i.e. black).
- Loads during this line: 8X8D1 records 202/203, SQRPACI 1/2, COMSPR 0..11 (+128) and 25 (+153), ITEMS.
- Keys: none (except the disk prompt below).
- Next: row 24 cleared; MainProgram continues with the title (PARTY-ov01-01) or, with `STING`, the main menu (ov16).

## PARTY-ov11-02 — ITEMS disk prompt (only if ITEMS is missing in the current directory)
- Text: OpenWithPrompt → BiosPromptLine(0Eh, 'Insert disk n in drive X:') on row 24, n = DataSet (1 at start-up), X = first
  character of the POOL.CFG data path (see ov11.pas.md quirk). Waits for a key, re-checks; repeats until the file exists.
- Keys: any key = retry.
- Next: PARTY-ov11-01 continues.
